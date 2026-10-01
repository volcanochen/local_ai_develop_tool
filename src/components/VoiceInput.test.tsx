import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VoiceInput from './VoiceInput';

describe('VoiceInput', () => {
  it('应该渲染录音按钮', () => {
    render(<VoiceInput onSubmit={vi.fn()} />);
    expect(screen.getByText('录音')).toBeInTheDocument();
  });

  it('应该渲染手动输入按钮', () => {
    render(<VoiceInput onSubmit={vi.fn()} />);
    expect(screen.getByText('手动输入')).toBeInTheDocument();
  });

  it('应该渲染生成执行计划按钮', () => {
    render(<VoiceInput onSubmit={vi.fn()} />);
    expect(screen.getByText('生成执行计划')).toBeInTheDocument();
  });

  it('点击手动输入按钮应该显示文本输入框', () => {
    render(<VoiceInput onSubmit={vi.fn()} />);
    
    const manualButton = screen.getByText('手动输入');
    fireEvent.click(manualButton);

    const textarea = screen.getByPlaceholderText(/请输入需求描述/);
    expect(textarea).toBeInTheDocument();
  });

  it('没有输入时生成按钮应该被禁用', () => {
    render(<VoiceInput onSubmit={vi.fn()} />);
    
    const submitButton = screen.getByText('生成执行计划');
    expect(submitButton).toBeDisabled();
  });

  it('有输入时生成按钮应该可用', () => {
    render(<VoiceInput onSubmit={vi.fn()} />);
    
    // 切换到手动输入
    fireEvent.click(screen.getByText('手动输入'));
    
    // 输入文本
    const textarea = screen.getByPlaceholderText(/请输入需求描述/);
    fireEvent.change(textarea, { target: { value: '测试需求' } });

    const submitButton = screen.getByText('生成执行计划');
    expect(submitButton).not.toBeDisabled();
  });

  it('点击生成按钮应该调用 onSubmit', () => {
    const onSubmit = vi.fn();
    render(<VoiceInput onSubmit={onSubmit} />);
    
    // 切换到手动输入
    fireEvent.click(screen.getByText('手动输入'));
    
    // 输入文本
    const textarea = screen.getByPlaceholderText(/请输入需求描述/);
    fireEvent.change(textarea, { target: { value: '开发一个网站' } });

    // 点击生成
    fireEvent.click(screen.getByText('生成执行计划'));

    expect(onSubmit).toHaveBeenCalledWith('开发一个网站');
  });

  it('应该显示提示文本', () => {
    render(<VoiceInput onSubmit={vi.fn()} />);
    expect(screen.getByText(/请说出您的需求/)).toBeInTheDocument();
  });
});
