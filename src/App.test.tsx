import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

describe('App - 集成测试', () => {
  it('应该渲染主应用', () => {
    render(<App />);
    expect(screen.getByText('VoiceDev')).toBeInTheDocument();
  });

  it('应该显示控制台视图', () => {
    render(<App />);
    expect(screen.getByText('控制台')).toBeInTheDocument();
    expect(screen.getByText('语音驱动 · 本地执行 · 安全可控')).toBeInTheDocument();
  });

  it('应该显示系统架构', () => {
    render(<App />);
    expect(screen.getByText('系统架构')).toBeInTheDocument();
    expect(screen.getByText('语音输入')).toBeInTheDocument();
    expect(screen.getByText('需求解析')).toBeInTheDocument();
    expect(screen.getByText('计划生成')).toBeInTheDocument();
    expect(screen.getByText('任务执行')).toBeInTheDocument();
    expect(screen.getByText('结果输出')).toBeInTheDocument();
  });

  it('应该显示统计卡片', () => {
    render(<App />);
    expect(screen.getByText('执行计划')).toBeInTheDocument();
    expect(screen.getByText('已完成')).toBeInTheDocument();
    expect(screen.getByText('活跃任务')).toBeInTheDocument();
    expect(screen.getByText('安全运行')).toBeInTheDocument();
  });

  it('点击侧边栏导航应该切换视图', () => {
    render(<App />);
    
    // 点击执行计划
    fireEvent.click(screen.getByText('执行计划'));
    expect(screen.getByText(/管理和查看所有AI生成的执行计划/)).toBeInTheDocument();
    
    // 点击系统设置
    fireEvent.click(screen.getByText('系统设置'));
    expect(screen.getByText(/配置本地LLM引擎和隐私安全选项/)).toBeInTheDocument();
    
    // 点击运行日志
    fireEvent.click(screen.getByText('运行日志'));
    expect(screen.getByText(/查看系统运行状态和任务执行记录/)).toBeInTheDocument();
  });

  it('应该显示安全状态指示器', () => {
    render(<App />);
    expect(screen.getByText('系统运行正常')).toBeInTheDocument();
  });

  it('应该显示底部安全徽章', () => {
    render(<App />);
    expect(screen.getByText('本地化运行中')).toBeInTheDocument();
  });

  it('执行计划视图应该包含语音输入', () => {
    render(<App />);
    fireEvent.click(screen.getByText('执行计划'));
    expect(screen.getByText('录音')).toBeInTheDocument();
    expect(screen.getByText('生成执行计划')).toBeInTheDocument();
  });

  it('设置视图应该包含 LLM 配置', () => {
    render(<App />);
    fireEvent.click(screen.getByText('系统设置'));
    expect(screen.getByText('本地LLM配置')).toBeInTheDocument();
    expect(screen.getByText('隐私安全')).toBeInTheDocument();
  });

  it('日志视图应该显示初始日志', () => {
    render(<App />);
    fireEvent.click(screen.getByText('运行日志'));
    expect(screen.getByText('系统初始化完成')).toBeInTheDocument();
    expect(screen.getByText('本地LLM引擎已连接 (Ollama)')).toBeInTheDocument();
  });

  it('初始统计应该显示 0 个计划', () => {
    render(<App />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
