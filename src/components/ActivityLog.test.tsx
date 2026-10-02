import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ActivityLog, { LogEntry } from './ActivityLog';

const mockLogs: LogEntry[] = [
  {
    id: 'log-1',
    timestamp: new Date('2024-01-01T10:00:00'),
    type: 'info',
    message: '系统初始化完成',
  },
  {
    id: 'log-2',
    timestamp: new Date('2024-01-01T10:01:00'),
    type: 'success',
    message: '本地LLM引擎已连接',
  },
  {
    id: 'log-3',
    timestamp: new Date('2024-01-01T10:02:00'),
    type: 'error',
    message: '连接失败',
  },
  {
    id: 'log-4',
    timestamp: new Date('2024-01-01T10:03:00'),
    type: 'warning',
    message: '警告信息',
  },
  {
    id: 'log-5',
    timestamp: new Date('2024-01-01T10:04:00'),
    type: 'action',
    message: '执行操作',
  },
];

describe('ActivityLog', () => {
  it('应该渲染标题', () => {
    render(<ActivityLog logs={mockLogs} />);
    expect(screen.getByText('运行日志')).toBeInTheDocument();
  });

  it('应该显示日志数量', () => {
    render(<ActivityLog logs={mockLogs} />);
    expect(screen.getByText('5 条记录')).toBeInTheDocument();
  });

  it('应该渲染所有日志消息', () => {
    render(<ActivityLog logs={mockLogs} />);
    expect(screen.getByText('系统初始化完成')).toBeInTheDocument();
    expect(screen.getByText('本地LLM引擎已连接')).toBeInTheDocument();
    expect(screen.getByText('连接失败')).toBeInTheDocument();
    expect(screen.getByText('警告信息')).toBeInTheDocument();
    expect(screen.getByText('执行操作')).toBeInTheDocument();
  });

  it('空日志时应该显示提示', () => {
    render(<ActivityLog logs={[]} />);
    expect(screen.getByText('暂无日志记录')).toBeInTheDocument();
  });

  it('应该显示时间戳', () => {
    render(<ActivityLog logs={mockLogs} />);
    expect(screen.getByText('10:00:00')).toBeInTheDocument();
    expect(screen.getByText('10:01:00')).toBeInTheDocument();
  });

  it('应该正确渲染不同类型的日志', () => {
    render(<ActivityLog logs={mockLogs} />);
    // 所有日志都应该被渲染
    expect(screen.getAllByText(/系统初始化完成|本地LLM引擎已连接|连接失败|警告信息|执行操作/)).toHaveLength(5);
  });
});
