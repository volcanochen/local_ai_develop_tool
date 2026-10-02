import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';

describe('Sidebar', () => {
  const defaultProps = {
    activeView: 'dashboard' as const,
    onViewChange: vi.fn(),
    planCount: 5,
    executingCount: 2,
  };

  it('应该渲染应用名称', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('VoiceDev')).toBeInTheDocument();
  });

  it('应该渲染副标题', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('本地化AI开发框架')).toBeInTheDocument();
  });

  it('应该渲染所有导航项', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('控制台')).toBeInTheDocument();
    expect(screen.getByText('执行计划')).toBeInTheDocument();
    expect(screen.getByText('运行日志')).toBeInTheDocument();
    expect(screen.getByText('系统设置')).toBeInTheDocument();
  });

  it('应该显示计划数量徽章', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('点击导航项应该调用 onViewChange', () => {
    const onViewChange = vi.fn();
    render(<Sidebar {...defaultProps} onViewChange={onViewChange} />);
    
    fireEvent.click(screen.getByText('执行计划'));
    expect(onViewChange).toHaveBeenCalledWith('plans');
  });

  it('应该高亮当前活动视图', () => {
    render(<Sidebar {...defaultProps} />);
    const dashboardButton = screen.getByText('控制台').closest('button');
    expect(dashboardButton).toHaveClass('bg-blue-500/15');
  });

  it('有执行任务时应该显示执行状态', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText(/2 个任务执行中/)).toBeInTheDocument();
  });

  it('没有执行任务时不应该显示执行状态', () => {
    render(<Sidebar {...defaultProps} executingCount={0} />);
    expect(screen.queryByText(/个任务执行中/)).not.toBeInTheDocument();
  });

  it('应该显示本地 LLM 状态', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('本地LLM')).toBeInTheDocument();
    expect(screen.getByText('● 在线')).toBeInTheDocument();
  });

  it('应该显示数据隔离状态', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('数据隔离')).toBeInTheDocument();
    expect(screen.getByText('● 安全')).toBeInTheDocument();
  });

  it('应该显示安全声明', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText(/100% 本地运行/)).toBeInTheDocument();
  });

  it('计划数量为 0 时不应该显示徽章', () => {
    render(<Sidebar {...defaultProps} planCount={0} />);
    // 徽章不应该存在
    const badges = screen.queryAllByText('0');
    expect(badges.length).toBe(0);
  });
});
