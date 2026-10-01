import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExecutionPlanView from './ExecutionPlanView';
import { ExecutionPlan } from '../types';

const mockPlan: ExecutionPlan = {
  id: 'test-plan-1',
  title: '测试计划',
  description: '这是一个测试执行计划',
  createdAt: new Date('2024-01-01'),
  tasks: [
    {
      id: 'task-1',
      title: '第一个任务',
      description: '任务描述1',
      status: 'pending',
      progress: 0,
      dependencies: [],
      estimatedTime: '30min',
    },
    {
      id: 'task-2',
      title: '第二个任务',
      description: '任务描述2',
      status: 'pending',
      progress: 0,
      dependencies: ['task-1'],
      estimatedTime: '1h',
    },
  ],
  status: 'draft',
  totalProgress: 0,
};

describe('ExecutionPlanView', () => {
  it('应该渲染计划标题', () => {
    render(
      <ExecutionPlanView
        plan={mockPlan}
        onExecute={vi.fn()}
        onApprove={vi.fn()}
      />
    );
    expect(screen.getByText('测试计划')).toBeInTheDocument();
  });

  it('应该渲染计划描述', () => {
    render(
      <ExecutionPlanView
        plan={mockPlan}
        onExecute={vi.fn()}
        onApprove={vi.fn()}
      />
    );
    expect(screen.getByText(/这是一个测试执行计划/)).toBeInTheDocument();
  });

  it('应该渲染所有任务', () => {
    render(
      <ExecutionPlanView
        plan={mockPlan}
        onExecute={vi.fn()}
        onApprove={vi.fn()}
      />
    );
    expect(screen.getByText('第一个任务')).toBeInTheDocument();
    expect(screen.getByText('第二个任务')).toBeInTheDocument();
  });

  it('应该显示任务数量', () => {
    render(
      <ExecutionPlanView
        plan={mockPlan}
        onExecute={vi.fn()}
        onApprove={vi.fn()}
      />
    );
    expect(screen.getByText(/2 个任务/)).toBeInTheDocument();
  });

  it('应该显示总体进度', () => {
    render(
      <ExecutionPlanView
        plan={mockPlan}
        onExecute={vi.fn()}
        onApprove={vi.fn()}
      />
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('草稿状态应该显示批准按钮', () => {
    render(
      <ExecutionPlanView
        plan={mockPlan}
        onExecute={vi.fn()}
        onApprove={vi.fn()}
      />
    );
    expect(screen.getByText('✓ 批准计划')).toBeInTheDocument();
  });

  it('草稿状态应该显示执行按钮', () => {
    render(
      <ExecutionPlanView
        plan={mockPlan}
        onExecute={vi.fn()}
        onApprove={vi.fn()}
      />
    );
    expect(screen.getByText('开始执行')).toBeInTheDocument();
  });

  it('点击批准按钮应该调用 onApprove', () => {
    const onApprove = vi.fn();
    render(
      <ExecutionPlanView
        plan={mockPlan}
        onExecute={vi.fn()}
        onApprove={onApprove}
      />
    );
    
    fireEvent.click(screen.getByText('✓ 批准计划'));
    expect(onApprove).toHaveBeenCalled();
  });

  it('点击执行按钮应该调用 onExecute', () => {
    const onExecute = vi.fn();
    render(
      <ExecutionPlanView
        plan={mockPlan}
        onExecute={onExecute}
        onApprove={vi.fn()}
      />
    );
    
    fireEvent.click(screen.getByText('开始执行'));
    expect(onExecute).toHaveBeenCalled();
  });

  it('已批准状态应该不显示批准按钮', () => {
    const approvedPlan = { ...mockPlan, status: 'approved' as const };
    render(
      <ExecutionPlanView
        plan={approvedPlan}
        onExecute={vi.fn()}
        onApprove={vi.fn()}
      />
    );
    expect(screen.queryByText('✓ 批准计划')).not.toBeInTheDocument();
  });

  it('应该显示任务预估时间', () => {
    render(
      <ExecutionPlanView
        plan={mockPlan}
        onExecute={vi.fn()}
        onApprove={vi.fn()}
      />
    );
    expect(screen.getByText('30min')).toBeInTheDocument();
    expect(screen.getByText('1h')).toBeInTheDocument();
  });

  it('running 状态的任务应该显示进度条', () => {
    const runningPlan = {
      ...mockPlan,
      tasks: [
        { ...mockPlan.tasks[0], status: 'running' as const, progress: 50 },
        mockPlan.tasks[1],
      ],
    };
    render(
      <ExecutionPlanView
        plan={runningPlan}
        onExecute={vi.fn()}
        onApprove={vi.fn()}
      />
    );
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('completed 状态的任务应该显示输出', () => {
    const completedPlan = {
      ...mockPlan,
      tasks: [
        { ...mockPlan.tasks[0], status: 'completed' as const, progress: 100, output: '任务完成输出' },
        mockPlan.tasks[1],
      ],
    };
    render(
      <ExecutionPlanView
        plan={completedPlan}
        onExecute={vi.fn()}
        onApprove={vi.fn()}
      />
    );
    expect(screen.getByText('任务完成输出')).toBeInTheDocument();
  });
});
