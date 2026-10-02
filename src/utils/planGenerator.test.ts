import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generatePlan, simulateExecution } from '../utils/planGenerator';

describe('planGenerator', () => {
  describe('generatePlan', () => {
    it('应该生成包含所有必需字段的执行计划', () => {
      const input = '开发一个用户管理系统';
      const plan = generatePlan(input);

      expect(plan).toHaveProperty('id');
      expect(plan).toHaveProperty('title');
      expect(plan).toHaveProperty('description');
      expect(plan).toHaveProperty('createdAt');
      expect(plan).toHaveProperty('tasks');
      expect(plan).toHaveProperty('status');
      expect(plan).toHaveProperty('totalProgress');
    });

    it('应该将描述设置为输入文本', () => {
      const input = '开发一个用户管理系统';
      const plan = generatePlan(input);

      expect(plan.description).toBe(input);
    });

    it('应该生成至少一个任务', () => {
      const plan = generatePlan('任意需求');
      expect(plan.tasks.length).toBeGreaterThan(0);
    });

    it('初始状态应该是 draft', () => {
      const plan = generatePlan('测试需求');
      expect(plan.status).toBe('draft');
    });

    it('初始进度应该是 0', () => {
      const plan = generatePlan('测试需求');
      expect(plan.totalProgress).toBe(0);
    });

    it('所有任务初始状态应该是 pending', () => {
      const plan = generatePlan('测试需求');
      plan.tasks.forEach(task => {
        expect(task.status).toBe('pending');
        expect(task.progress).toBe(0);
      });
    });

    describe('意图识别 - Web应用分类', () => {
      const webKeywords = ['网站', 'web', '应用', '系统', '平台', '前端', '后台'];

      webKeywords.forEach(keyword => {
        it(`包含"${keyword}"应该识别为Web应用`, () => {
          const plan = generatePlan(`开发一个${keyword}`);
          // Web应用模板有7个任务 + 1个定制任务 = 8个
          expect(plan.tasks.length).toBe(8);
        });
      });
    });

    describe('意图识别 - 数据分析分类', () => {
      const dataKeywords = ['数据', '分析', '报表', '统计', '可视化'];

      dataKeywords.forEach(keyword => {
        it(`包含"${keyword}"应该识别为数据分析`, () => {
          const plan = generatePlan(`做一个${keyword}`);
          // 数据分析模板有5个任务 + 1个定制任务 = 6个
          expect(plan.tasks.length).toBe(6);
        });
      });
    });

    describe('意图识别 - 自动化脚本分类', () => {
      const autoKeywords = ['自动', '脚本', '批处理', '定时', '流程'];

      autoKeywords.forEach(keyword => {
        it(`包含"${keyword}"应该识别为自动化脚本`, () => {
          const plan = generatePlan(`写个${keyword}`);
          // 自动化脚本模板有4个任务 + 1个定制任务 = 5个
          expect(plan.tasks.length).toBe(5);
        });
      });
    });

    describe('意图识别 - 默认分类', () => {
      it('无法识别的关键词应该使用默认模板', () => {
        const plan = generatePlan('随便写点什么');
        // 默认模板有5个任务 + 1个定制任务 = 6个
        expect(plan.tasks.length).toBe(6);
      });
    });

    it('应该为每个任务生成唯一的 ID', () => {
      const plan = generatePlan('测试需求');
      const ids = plan.tasks.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('应该包含一个定制任务', () => {
      const input = '开发一个特殊功能';
      const plan = generatePlan(input);
      const customTask = plan.tasks.find(t => t.title === '需求定制任务');
      expect(customTask).toBeDefined();
      expect(customTask?.description).toContain(input.slice(0, 50));
    });

    it('任务应该有预估时间', () => {
      const plan = generatePlan('测试需求');
      plan.tasks.forEach(task => {
        expect(task.estimatedTime).toBeDefined();
        expect(typeof task.estimatedTime).toBe('string');
      });
    });
  });

  describe('任务依赖关系', () => {
    it('第一个任务应该没有依赖', () => {
      const plan = generatePlan('测试需求');
      expect(plan.tasks[0].dependencies).toEqual([]);
    });

    it('后续任务应该有依赖', () => {
      const plan = generatePlan('开发一个网站');
      // 第二个任务应该依赖第一个
      expect(plan.tasks[1].dependencies.length).toBeGreaterThan(0);
    });

    it('依赖的任务 ID 应该存在于任务列表中', () => {
      const plan = generatePlan('测试需求');
      const taskIds = plan.tasks.map(t => t.id);
      
      plan.tasks.forEach(task => {
        task.dependencies.forEach(depId => {
          expect(taskIds).toContain(depId);
        });
      });
    });
  });

  describe('simulateExecution', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('应该按顺序执行所有任务', async () => {
      const plan = generatePlan('简单需求');
      const onProgress = vi.fn();

      const executionPromise = simulateExecution(plan, onProgress);

      // 快速推进时间
      vi.advanceTimersByTime(100000);

      const result = await executionPromise;

      expect(result.status).toBe('completed');
      expect(result.totalProgress).toBe(100);
      expect(result.tasks.every(t => t.status === 'completed')).toBe(true);
    });

    it('应该调用 onProgress 回调', async () => {
      const plan = generatePlan('测试需求');
      const onProgress = vi.fn();

      const executionPromise = simulateExecution(plan, onProgress);
      vi.advanceTimersByTime(100000);
      await executionPromise;

      expect(onProgress).toHaveBeenCalled();
    });

    it('执行完成后所有任务应该有输出', async () => {
      const plan = generatePlan('测试需求');
      const onProgress = vi.fn();

      const executionPromise = simulateExecution(plan, onProgress);
      vi.advanceTimersByTime(100000);
      const result = await executionPromise;

      result.tasks.forEach(task => {
        expect(task.output).toBeDefined();
        expect(typeof task.output).toBe('string');
      });
    });

    it('执行完成后所有任务进度应该是 100', async () => {
      const plan = generatePlan('测试需求');
      const onProgress = vi.fn();

      const executionPromise = simulateExecution(plan, onProgress);
      vi.advanceTimersByTime(100000);
      const result = await executionPromise;

      result.tasks.forEach(task => {
        expect(task.progress).toBe(100);
      });
    });
  });
});
