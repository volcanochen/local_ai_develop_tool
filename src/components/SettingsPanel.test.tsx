import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsPanel from './SettingsPanel';
import { LLMConfig, PrivacySettings } from '../types';

const mockLLMConfig: LLMConfig = {
  provider: 'ollama',
  endpoint: 'http://localhost:11434/api',
  model: 'qwen2.5:7b',
  temperature: 0.7,
  maxTokens: 4096,
  isLocal: true,
};

const mockPrivacySettings: PrivacySettings = {
  dataStorage: 'local-only',
  networkIsolation: true,
  telemetryEnabled: false,
  autoDeleteAfter: 30,
};

describe('SettingsPanel', () => {
  it('应该渲染 LLM 配置标签', () => {
    render(
      <SettingsPanel
        llmConfig={mockLLMConfig}
        privacySettings={mockPrivacySettings}
        onLLMConfigChange={vi.fn()}
        onPrivacyChange={vi.fn()}
      />
    );
    expect(screen.getByText('本地LLM配置')).toBeInTheDocument();
  });

  it('应该渲染隐私安全标签', () => {
    render(
      <SettingsPanel
        llmConfig={mockLLMConfig}
        privacySettings={mockPrivacySettings}
        onLLMConfigChange={vi.fn()}
        onPrivacyChange={vi.fn()}
      />
    );
    expect(screen.getByText('隐私安全')).toBeInTheDocument();
  });

  it('默认应该显示 LLM 配置面板', () => {
    render(
      <SettingsPanel
        llmConfig={mockLLMConfig}
        privacySettings={mockPrivacySettings}
        onLLMConfigChange={vi.fn()}
        onPrivacyChange={vi.fn()}
      />
    );
    expect(screen.getByText('推理引擎')).toBeInTheDocument();
  });

  it('点击隐私安全标签应该切换面板', () => {
    render(
      <SettingsPanel
        llmConfig={mockLLMConfig}
        privacySettings={mockPrivacySettings}
        onLLMConfigChange={vi.fn()}
        onPrivacyChange={vi.fn()}
      />
    );
    
    fireEvent.click(screen.getByText('隐私安全'));
    expect(screen.getByText('数据存储方式')).toBeInTheDocument();
  });

  it('应该显示所有推理引擎选项', () => {
    render(
      <SettingsPanel
        llmConfig={mockLLMConfig}
        privacySettings={mockPrivacySettings}
        onLLMConfigChange={vi.fn()}
        onPrivacyChange={vi.fn()}
      />
    );
    expect(screen.getByText('Ollama')).toBeInTheDocument();
    expect(screen.getByText('llama.cpp')).toBeInTheDocument();
    expect(screen.getByText('LocalAI')).toBeInTheDocument();
    expect(screen.getByText('自定义')).toBeInTheDocument();
  });

  it('应该显示当前选中的推理引擎', () => {
    render(
      <SettingsPanel
        llmConfig={mockLLMConfig}
        privacySettings={mockPrivacySettings}
        onLLMConfigChange={vi.fn()}
        onPrivacyChange={vi.fn()}
      />
    );
    const ollamaButton = screen.getByText('Ollama');
    expect(ollamaButton.closest('button')).toHaveClass('border-blue-500/50');
  });

  it('点击推理引擎应该调用 onLLMConfigChange', () => {
    const onLLMConfigChange = vi.fn();
    render(
      <SettingsPanel
        llmConfig={mockLLMConfig}
        privacySettings={mockPrivacySettings}
        onLLMConfigChange={onLLMConfigChange}
        onPrivacyChange={vi.fn()}
      />
    );
    
    fireEvent.click(screen.getByText('llama.cpp'));
    expect(onLLMConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'llama-cpp' })
    );
  });

  it('应该显示 API 端点输入框', () => {
    render(
      <SettingsPanel
        llmConfig={mockLLMConfig}
        privacySettings={mockPrivacySettings}
        onLLMConfigChange={vi.fn()}
        onPrivacyChange={vi.fn()}
      />
    );
    const input = screen.getByPlaceholderText('http://localhost:11434/api');
    expect(input).toHaveValue('http://localhost:11434/api');
  });

  it('修改 API 端点应该调用 onLLMConfigChange', () => {
    const onLLMConfigChange = vi.fn();
    render(
      <SettingsPanel
        llmConfig={mockLLMConfig}
        privacySettings={mockPrivacySettings}
        onLLMConfigChange={onLLMConfigChange}
        onPrivacyChange={vi.fn()}
      />
    );
    
    const input = screen.getByPlaceholderText('http://localhost:11434/api');
    fireEvent.change(input, { target: { value: 'http://localhost:8080' } });
    expect(onLLMConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: 'http://localhost:8080' })
    );
  });

  it('应该显示模型名称输入框', () => {
    render(
      <SettingsPanel
        llmConfig={mockLLMConfig}
        privacySettings={mockPrivacySettings}
        onLLMConfigChange={vi.fn()}
        onPrivacyChange={vi.fn()}
      />
    );
    const input = screen.getByPlaceholderText('qwen2.5:7b');
    expect(input).toHaveValue('qwen2.5:7b');
  });

  it('隐私面板应该显示数据存储选项', () => {
    render(
      <SettingsPanel
        llmConfig={mockLLMConfig}
        privacySettings={mockPrivacySettings}
        onLLMConfigChange={vi.fn()}
        onPrivacyChange={vi.fn()}
      />
    );
    
    fireEvent.click(screen.getByText('隐私安全'));
    expect(screen.getByText('仅本地存储')).toBeInTheDocument();
    expect(screen.getByText('加密本地存储')).toBeInTheDocument();
  });

  it('隐私面板应该显示网络隔离选项', () => {
    render(
      <SettingsPanel
        llmConfig={mockLLMConfig}
        privacySettings={mockPrivacySettings}
        onLLMConfigChange={vi.fn()}
        onPrivacyChange={vi.fn()}
      />
    );
    
    fireEvent.click(screen.getByText('隐私安全'));
    expect(screen.getByText('网络隔离模式')).toBeInTheDocument();
  });

  it('隐私面板应该显示安全等级信息', () => {
    render(
      <SettingsPanel
        llmConfig={mockLLMConfig}
        privacySettings={mockPrivacySettings}
        onLLMConfigChange={vi.fn()}
        onPrivacyChange={vi.fn()}
      />
    );
    
    fireEvent.click(screen.getByText('隐私安全'));
    expect(screen.getByText(/安全等级：高/)).toBeInTheDocument();
  });
});
