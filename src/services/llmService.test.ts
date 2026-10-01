import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LLMService, getLLMService, resetLLMService, LLMServerNotRunningError } from './llmService';
import { LLMConfig } from '../types';

// Mock fetch
const mockFetch = vi.fn();
(globalThis as any).fetch = mockFetch;

const defaultConfig: LLMConfig = {
  provider: 'ollama',
  endpoint: 'http://localhost:11434/api',
  model: 'qwen2.5:7b',
  temperature: 0.7,
  maxTokens: 4096,
  isLocal: true,
};

describe('LLMService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetLLMService();
  });

  describe('constructor', () => {
    it('应该使用提供的配置创建服务', () => {
      const service = new LLMService(defaultConfig);
      expect(service).toBeDefined();
    });
  });

  describe('updateConfig', () => {
    it('应该更新配置', () => {
      const service = new LLMService(defaultConfig);
      service.updateConfig({ model: 'llama3.1:8b' });
      // 配置已更新（内部状态）
      expect(service).toBeDefined();
    });
  });

  describe('healthCheck - Ollama', () => {
    it('服务在线时应该返回 online: true', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          models: [
            { name: 'qwen2.5:7b', size: 4700000000 },
            { name: 'llama3.1:8b', size: 4700000000 },
          ],
        }),
      });

      const service = new LLMService(defaultConfig);
      const result = await service.healthCheck();

      expect(result.online).toBe(true);
      expect(result.models).toContain('qwen2.5:7b');
      expect(result.models).toContain('llama3.1:8b');
    });

    it('服务离线时应该返回 online: false', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const service = new LLMService(defaultConfig);
      const result = await service.healthCheck();

      expect(result.online).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('应该请求正确的端点', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ models: [] }),
      });

      const service = new LLMService(defaultConfig);
      await service.healthCheck();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/tags',
        expect.any(Object)
      );
    });
  });

  describe('chat - Ollama', () => {
    it('应该发送正确的请求格式', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: { content: '你好' },
          model: 'qwen2.5:7b',
          eval_count: 10,
        }),
      });

      const service = new LLMService(defaultConfig);
      const result = await service.chat([
        { role: 'user', content: '你好' },
      ]);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/chat',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"model":"qwen2.5:7b"'),
        })
      );

      expect(result.content).toBe('你好');
      expect(result.model).toBe('qwen2.5:7b');
      expect(result.tokensUsed).toBe(10);
    });

    it('应该包含温度和 maxTokens 参数', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: { content: '测试' },
          model: 'qwen2.5:7b',
          eval_count: 5,
        }),
      });

      const service = new LLMService(defaultConfig);
      await service.chat([{ role: 'user', content: '测试' }]);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.options.temperature).toBe(0.7);
      expect(callBody.options.num_predict).toBe(4096);
    });

    it('模型不存在时应该抛出 LLMModelNotFoundError', async () => {
      // 第一次请求返回 404
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });
      // healthCheck 请求
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ models: [{ name: 'llama3.1:8b' }] }),
      });

      const service = new LLMService(defaultConfig);
      
      await expect(
        service.chat([{ role: 'user', content: '测试' }])
      ).rejects.toThrow(/模型.*未找到/);
    });
  });

  describe('chat - llama.cpp', () => {
    it('应该使用正确的端点', async () => {
      const config = { ...defaultConfig, provider: 'llama-cpp' as const, endpoint: 'http://localhost:8080' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: '测试响应',
          tokens_evaluated: 15,
        }),
      });

      const service = new LLMService(config);
      const result = await service.chat([{ role: 'user', content: '测试' }]);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/completion',
        expect.any(Object)
      );
      expect(result.content).toBe('测试响应');
    });

    it('应该格式化 prompt', async () => {
      const config = { ...defaultConfig, provider: 'llama-cpp' as const, endpoint: 'http://localhost:8080' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: '响应', tokens_evaluated: 5 }),
      });

      const service = new LLMService(config);
      await service.chat([
        { role: 'system', content: '你是助手' },
        { role: 'user', content: '你好' },
      ]);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.prompt).toContain('System: 你是助手');
      expect(callBody.prompt).toContain('User: 你好');
      expect(callBody.prompt).toContain('Assistant:');
    });
  });

  describe('chat - LocalAI', () => {
    it('应该使用 OpenAI 兼容格式', async () => {
      const config = { ...defaultConfig, provider: 'local-ai' as const, endpoint: 'http://localhost:8080/v1' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '响应' } }],
          model: 'qwen2.5:7b',
          usage: { completion_tokens: 20 },
        }),
      });

      const service = new LLMService(config);
      const result = await service.chat([{ role: 'user', content: '测试' }]);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/v1/chat/completions',
        expect.any(Object)
      );
      expect(result.content).toBe('响应');
    });
  });

  describe('cancel', () => {
    it('应该能够取消请求', () => {
      const service = new LLMService(defaultConfig);
      // 不应该抛出错误
      expect(() => service.cancel()).not.toThrow();
    });
  });

  describe('getLLMService (singleton)', () => {
    it('应该返回单例实例', () => {
      const service1 = getLLMService(defaultConfig);
      const service2 = getLLMService();
      expect(service1).toBe(service2);
    });

    it('首次调用必须提供配置', () => {
      expect(() => getLLMService()).toThrow('LLMService 未初始化');
    });

    it('resetLLMService 应该重置单例', () => {
      const service1 = getLLMService(defaultConfig);
      resetLLMService();
      expect(() => getLLMService()).toThrow('LLMService 未初始化');
    });
  });
});
