import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskOutputView from './TaskOutputView';
import { TaskOutput } from '../types';

const mockOutput: TaskOutput = {
  type: 'code',
  title: '测试代码产出',
  content: 'console.log("hello world");',
  language: 'javascript',
  files: [
    { name: 'src/index.ts', content: 'export const x = 1;' },
    { name: 'src/utils.ts', content: 'export function add(a: number, b: number) { return a + b; }' },
  ],
  logs: [
    '[10:00:00] 开始生成代码...',
    '[10:00:01] ✅ 代码生成完成',
  ],
};

describe('TaskOutputView', () => {
  it('应该渲染产出标题', () => {
    render(<TaskOutputView output={mockOutput} />);
    expect(screen.getByText('测试代码产出')).toBeInTheDocument();
  });

  it('应该显示类型标签', () => {
    render(<TaskOutputView output={mockOutput} />);
    expect(screen.getByText('代码')).toBeInTheDocument();
  });

  it('默认应该是折叠状态', () => {
    render(<TaskOutputView output={mockOutput} />);
    expect(screen.queryByText('console.log("hello world");')).not.toBeInTheDocument();
  });

  it('点击应该展开内容', () => {
    render(<TaskOutputView output={mockOutput} />);
    fireEvent.click(screen.getByText('测试代码产出'));
    expect(screen.getByText('console.log("hello world");')).toBeInTheDocument();
  });

  it('展开后应该显示标签页', () => {
    render(<TaskOutputView output={mockOutput} />);
    fireEvent.click(screen.getByText('测试代码产出'));
    expect(screen.getByText('内容')).toBeInTheDocument();
    expect(screen.getByText('文件 (2)')).toBeInTheDocument();
    expect(screen.getByText('日志 (2)')).toBeInTheDocument();
  });

  it('应该显示文件标签页', () => {
    render(<TaskOutputView output={mockOutput} />);
    fireEvent.click(screen.getByText('测试代码产出'));
    fireEvent.click(screen.getByText('文件 (2)'));
    expect(screen.getByText('src/index.ts')).toBeInTheDocument();
    expect(screen.getByText('src/utils.ts')).toBeInTheDocument();
  });

  it('应该显示日志标签页', () => {
    render(<TaskOutputView output={mockOutput} />);
    fireEvent.click(screen.getByText('测试代码产出'));
    fireEvent.click(screen.getByText('日志 (2)'));
    expect(screen.getByText(/开始生成代码/)).toBeInTheDocument();
    expect(screen.getByText(/代码生成完成/)).toBeInTheDocument();
  });

  it('不同类型应该显示不同的类型标签', () => {
    const types = [
      { type: 'code' as const, label: '代码' },
      { type: 'document' as const, label: '文档' },
      { type: 'config' as const, label: '配置' },
      { type: 'test-report' as const, label: '测试报告' },
      { type: 'deploy-log' as const, label: '部署日志' },
      { type: 'analysis' as const, label: '分析报告' },
      { type: 'design' as const, label: '设计文档' },
    ];

    types.forEach(({ type, label }) => {
      const output = { ...mockOutput, type };
      const { unmount } = render(<TaskOutputView output={output} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });

  it('没有文件时不应该显示文件标签', () => {
    const output = { ...mockOutput, files: undefined };
    render(<TaskOutputView output={output} />);
    fireEvent.click(screen.getByText('测试代码产出'));
    expect(screen.queryByText(/文件/)).not.toBeInTheDocument();
  });

  it('没有日志时不应该显示日志标签', () => {
    const output = { ...mockOutput, logs: undefined };
    render(<TaskOutputView output={output} />);
    fireEvent.click(screen.getByText('测试代码产出'));
    expect(screen.queryByText(/日志/)).not.toBeInTheDocument();
  });
});
