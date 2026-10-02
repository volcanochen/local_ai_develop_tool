/**
 * 本地 LLM 服务调用层
 * 
 * 支持的后端：
 * - Ollama (默认): http://localhost:11434
 * - llama.cpp:     http://localhost:8080
 * - LocalAI:       http://localhost:8080/v1
 * 
 * 所有请求都发送到本地，不会访问任何外部服务。
 */

import { LLMConfig } from '../types';

// ============== 类型定义 ==============

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  tokensUsed: number;
  duration: number; // ms
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: Error) => void;
}

// ============== 错误类 ==============

export class LLMServerNotRunningError extends Error {
  constructor(provider: string, endpoint: string) {
    super(
      `本地 LLM 服务未运行。请确保 ${provider} 已启动并监听 ${endpoint}\n` +
      `启动命令参考：\n` +
      `  Ollama:     ollama serve\n` +
      `  llama.cpp:  ./server -m models/your-model.gguf --host 127.0.0.1 --port 8080\n` +
      `  LocalAI:    local-ai run --address 127.0.0.1:8080`
    );
    this.name = 'LLMServerNotRunningError';
  }
}

export class LLMModelNotFoundError extends Error {
  constructor(model: string, available: string[]) {
    super(
      `模型 "${model}" 未找到。\n` +
      `可用模型: ${available.join(', ') || '(无)'}\n` +
      `下载模型命令: ollama pull ${model}`
    );
    this.name = 'LLMModelNotFoundError';
  }
}

// ============== 核心服务类 ==============

export class LLMService {
  private config: LLMConfig;
  private abortController: AbortController | null = null;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  updateConfig(config: Partial<LLMConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * 健康检查 - 验证本地 LLM 服务是否在线
   */
  async healthCheck(): Promise<{ online: boolean; models?: string[]; error?: string }> {
    try {
      switch (this.config.provider) {
        case 'ollama':
          return await this.checkOllama();
        case 'llama-cpp':
          return await this.checkLlamaCpp();
        case 'local-ai':
          return await this.checkLocalAI();
        default:
          return { online: false, error: '不支持的 provider' };
      }
    } catch (error) {
      return {
        online: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 非流式调用
   */
  async chat(messages: ChatMessage[]): Promise<LLMResponse> {
    const startTime = Date.now();

    switch (this.config.provider) {
      case 'ollama':
        return this.ollamaChat(messages, startTime);
      case 'llama-cpp':
        return this.llamaCppChat(messages, startTime);
      case 'local-ai':
        return this.localAIChat(messages, startTime);
      default:
        throw new Error(`不支持的 provider: ${this.config.provider}`);
    }
  }

  /**
   * 流式调用
   */
  async chatStream(messages: ChatMessage[], callbacks: StreamCallbacks): Promise<void> {
    this.abortController = new AbortController();

    try {
      switch (this.config.provider) {
        case 'ollama':
          await this.ollamaChatStream(messages, callbacks);
          break;
        case 'llama-cpp':
          await this.llamaCppChatStream(messages, callbacks);
          break;
        case 'local-ai':
          await this.localAIChatStream(messages, callbacks);
          break;
        default:
          throw new Error(`不支持的 provider: ${this.config.provider}`);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        callbacks.onComplete('[已取消]');
        return;
      }
      callbacks.onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * 取消当前请求
   */
  cancel() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  // ============== Ollama 实现 ==============

  private async checkOllama(): Promise<{ online: boolean; models?: string[]; error?: string }> {
    const response = await fetch(`${this.config.endpoint}/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      return { online: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    const models = (data.models || []).map((m: any) => m.name);
    return { online: true, models };
  }

  private async ollamaChat(messages: ChatMessage[], startTime: number): Promise<LLMResponse> {
    const response = await fetch(`${this.config.endpoint}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        stream: false,
        options: {
          temperature: this.config.temperature,
          num_predict: this.config.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        const health = await this.checkOllama();
        throw new LLMModelNotFoundError(this.config.model, health.models || []);
      }
      throw new Error(`Ollama 请求失败: HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.message?.content || '',
      model: data.model || this.config.model,
      tokensUsed: data.eval_count || 0,
      duration: Date.now() - startTime,
    };
  }

  private async ollamaChatStream(messages: ChatMessage[], callbacks: StreamCallbacks): Promise<void> {
    const response = await fetch(`${this.config.endpoint}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        stream: true,
        options: {
          temperature: this.config.temperature,
          num_predict: this.config.maxTokens,
        },
      }),
      signal: this.abortController?.signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`Ollama 流式请求失败: HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.message?.content) {
            const token = data.message.content;
            fullText += token;
            callbacks.onToken(token);
          }
          if (data.done) {
            callbacks.onComplete(fullText);
            return;
          }
        } catch {
          // 忽略解析错误
        }
      }
    }

    callbacks.onComplete(fullText);
  }

  // ============== llama.cpp 实现 ==============

  private async checkLlamaCpp(): Promise<{ online: boolean; models?: string[]; error?: string }> {
    const response = await fetch(`${this.config.endpoint}/health`, {
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      return { online: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { online: data.status === 'ok', models: [this.config.model] };
  }

  private async llamaCppChat(messages: ChatMessage[], startTime: number): Promise<LLMResponse> {
    const response = await fetch(`${this.config.endpoint}/completion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: this.formatPrompt(messages),
        temperature: this.config.temperature,
        n_predict: this.config.maxTokens,
        stop: ['</s>', 'User:', '\n\n\n'],
      }),
    });

    if (!response.ok) {
      throw new Error(`llama.cpp 请求失败: HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.content || '',
      model: this.config.model,
      tokensUsed: data.tokens_evaluated || 0,
      duration: Date.now() - startTime,
    };
  }

  private async llamaCppChatStream(messages: ChatMessage[], callbacks: StreamCallbacks): Promise<void> {
    const response = await fetch(`${this.config.endpoint}/completion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: this.formatPrompt(messages),
        temperature: this.config.temperature,
        n_predict: this.config.maxTokens,
        stream: true,
        stop: ['</s>', 'User:'],
      }),
      signal: this.abortController?.signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`llama.cpp 流式请求失败`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

      for (const line of lines) {
        const jsonStr = line.slice(6);
        if (jsonStr === '[DONE]') {
          callbacks.onComplete(fullText);
          return;
        }
        try {
          const data = JSON.parse(jsonStr);
          if (data.content) {
            fullText += data.content;
            callbacks.onToken(data.content);
          }
        } catch {
          // 忽略
        }
      }
    }

    callbacks.onComplete(fullText);
  }

  // ============== LocalAI 实现 ==============

  private async checkLocalAI(): Promise<{ online: boolean; models?: string[]; error?: string }> {
    const response = await fetch(`${this.config.endpoint}/models`, {
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      return { online: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    const models = (data.data || []).map((m: any) => m.id);
    return { online: true, models };
  }

  private async localAIChat(messages: ChatMessage[], startTime: number): Promise<LLMResponse> {
    const response = await fetch(`${this.config.endpoint}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`LocalAI 请求失败: HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      model: data.model || this.config.model,
      tokensUsed: data.usage?.completion_tokens || 0,
      duration: Date.now() - startTime,
    };
  }

  private async localAIChatStream(messages: ChatMessage[], callbacks: StreamCallbacks): Promise<void> {
    const response = await fetch(`${this.config.endpoint}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: true,
      }),
      signal: this.abortController?.signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`LocalAI 流式请求失败`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

      for (const line of lines) {
        const jsonStr = line.slice(6);
        if (jsonStr === '[DONE]') {
          callbacks.onComplete(fullText);
          return;
        }
        try {
          const data = JSON.parse(jsonStr);
          const token = data.choices?.[0]?.delta?.content;
          if (token) {
            fullText += token;
            callbacks.onToken(token);
          }
        } catch {
          // 忽略
        }
      }
    }

    callbacks.onComplete(fullText);
  }

  // ============== 工具方法 ==============

  /**
   * llama.cpp 使用纯文本 prompt，需要手动格式化
   */
  private formatPrompt(messages: ChatMessage[]): string {
    return messages
      .map(m => {
        if (m.role === 'system') return `System: ${m.content}`;
        if (m.role === 'user') return `User: ${m.content}`;
        return `Assistant: ${m.content}`;
      })
      .join('\n\n') + '\n\nAssistant:';
  }
}

// ============== 单例导出 ==============

let serviceInstance: LLMService | null = null;

export function getLLMService(config?: LLMConfig): LLMService {
  if (!serviceInstance) {
    if (!config) {
      throw new Error('LLMService 未初始化，请提供配置');
    }
    serviceInstance = new LLMService(config);
  } else if (config) {
    serviceInstance.updateConfig(config);
  }
  return serviceInstance;
}

export function resetLLMService() {
  if (serviceInstance) {
    serviceInstance.cancel();
  }
  serviceInstance = null;
}
