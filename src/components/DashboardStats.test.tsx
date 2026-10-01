import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardStats from './DashboardStats';

describe('DashboardStats', () => {
  const defaultProps = {
    totalPlans: 10,
    completedPlans: 7,
    activeTasks: 3,
    uptime: '99.9%',
  };

  it('应该渲染执行计划数量', () => {
    render(<DashboardStats {...defaultProps} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('执行计划')).toBeInTheDocument();
  });

  it('应该渲染已完成数量', () => {
    render(<DashboardStats {...defaultProps} />);
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('已完成')).toBeInTheDocument();
  });

  it('应该渲染活跃任务数量', () => {
    render(<DashboardStats {...defaultProps} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('活跃任务')).toBeInTheDocument();
  });

  it('应该渲染运行时间', () => {
    render(<DashboardStats {...defaultProps} />);
    expect(screen.getByText('99.9%')).toBeInTheDocument();
    expect(screen.getByText('安全运行')).toBeInTheDocument();
  });

  it('应该渲染 4 个统计卡片', () => {
    const { container } = render(<DashboardStats {...defaultProps} />);
    const cards = container.querySelectorAll('.bg-gray-800\\/50');
    expect(cards.length).toBe(4);
  });

  it('数值为 0 时应该正确显示', () => {
    render(
      <DashboardStats
        totalPlans={0}
        completedPlans={0}
        activeTasks={0}
        uptime="0%"
      />
    );
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(3);
  });

  it('大数值应该正确显示', () => {
    render(
      <DashboardStats
        totalPlans={999}
        completedPlans={888}
        activeTasks={777}
        uptime="100%"
      />
    );
    expect(screen.getByText('999')).toBeInTheDocument();
    expect(screen.getByText('888')).toBeInTheDocument();
    expect(screen.getByText('777')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
