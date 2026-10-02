import { describe, it, expect } from 'vitest';
import { executeTask } from './taskExecutors';
import { Task } from '../types';

describe('taskExecutors', () => {
  const baseTask: Task = {
    id: 'test-1',
    title: '测试任务',
    description: '测试描述',
    type: 'code',
    status: 'pending',
    progress: 0,
    dependencies: [],
    estimatedTime: '1h',
  };

  describe('executeTask', () => {
    it('应该为 code 类型生成代码产出', () => {
      const task = { ...baseTask, type: 'code' as const, description: '开发前端页面组件' };
      const output = executeTask(task, '开发一个网站');

      expect(output.type).toBe('code');
      expect(output.content).toBeDefined();
      expect(output.content.length).toBeGreaterThan(0);
      expect(output.files).toBeDefined();
      expect(output.files!.length).toBeGreaterThan(0);
      expect(output.logs).toBeDefined();
    });

    it('应该为后端代码生成 API 代码', () => {
      const task = { ...baseTask, type: 'code' as const, description: '实现后端API接口' };
      const output = executeTask(task, '开发一个系统');

      expect(output.type).toBe('code');
      expect(output.content).toContain('Router');
      expect(output.content).toContain('router');
    });

    it('应该为脚本任务生成 Python 代码', () => {
      const task = { ...baseTask, type: 'code' as const, description: '编写数据清洗脚本' };
      const output = executeTask(task, '自动化处理');

      expect(output.type).toBe('code');
      expect(output.content).toContain('python');
      expect(output.content).toContain('def');
    });

    it('应该为 document 类型生成文档', () => {
      const task = { ...baseTask, type: 'document' as const };
      const output = executeTask(task, '测试需求');

      expect(output.type).toBe('document');
      expect(output.content).toContain('#');
      expect(output.files).toBeDefined();
    });

    it('应该为 config 类型生成配置', () => {
      const task = { ...baseTask, type: 'config' as const };
      const output = executeTask(task, '测试需求');

      expect(output.type).toBe('config');
      expect(output.content).toBeDefined();
      expect(output.files).toBeDefined();
      expect(output.files!.some(f => f.name.includes('docker'))).toBe(true);
    });

    it('应该为 test 类型生成测试报告', () => {
      const task = { ...baseTask, type: 'test' as const };
      const output = executeTask(task, '测试需求');

      expect(output.type).toBe('test-report');
      expect(output.content).toContain('测试报告');
      expect(output.content).toContain('通过率');
    });

    it('应该为 deploy 类型生成部署日志', () => {
      const task = { ...baseTask, type: 'deploy' as const };
      const output = executeTask(task, '测试需求');

      expect(output.type).toBe('deploy-log');
      expect(output.content).toContain('部署');
      expect(output.logs).toBeDefined();
    });

    it('应该为 analysis 类型生成分析报告', () => {
      const task = { ...baseTask, type: 'analysis' as const };
      const output = executeTask(task, '开发一个用户管理系统');

      expect(output.type).toBe('analysis');
      expect(output.content).toContain('需求');
      expect(output.content).toContain('技术');
    });

    it('应该为 design 类型生成设计文档', () => {
      const task = { ...baseTask, type: 'design' as const };
      const output = executeTask(task, '测试需求');

      expect(output.type).toBe('design');
      expect(output.content).toContain('架构');
      expect(output.files).toBeDefined();
    });

    it('所有产出都应该包含日志', () => {
      const types: Task['type'][] = ['code', 'document', 'config', 'test', 'deploy', 'analysis', 'design'];
      
      types.forEach(type => {
        const task = { ...baseTask, type };
        const output = executeTask(task, '测试');
        expect(output.logs).toBeDefined();
        expect(output.logs!.length).toBeGreaterThan(0);
      });
    });

    it('产出标题应该包含任务标题', () => {
      const task = { ...baseTask, title: '前端开发', type: 'code' as const };
      const output = executeTask(task, '测试');
      expect(output.title).toContain('前端开发');
    });

    it('代码产出应该包含语言标识', () => {
      const task = { ...baseTask, type: 'code' as const, description: '前端开发' };
      const output = executeTask(task, '测试');
      expect(output.language).toBeDefined();
    });
  });
});
