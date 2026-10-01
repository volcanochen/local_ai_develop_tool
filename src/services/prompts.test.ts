import { describe, it, expect } from 'vitest';
import { 
  buildPlanMessages, 
  buildPlanUserPrompt, 
  parsePlanResponse,
  buildAnalysisMessages,
  PLAN_SYSTEM_PROMPT 
} from './prompts';

describe('prompts', () => {
  describe('PLAN_SYSTEM_PROMPT', () => {
    it('应该包含 JSON 格式要求', () => {
      expect(PLAN_SYSTEM_PROMPT).toContain('json');
      expect(PLAN_SYSTEM_PROMPT).toContain('title');
      expect(PLAN_SYSTEM_PROMPT).toContain('tasks');
    });

    it('应该包含任务字段说明', () => {
      expect(PLAN_SYSTEM_PROMPT).toContain('dependencies');
      expect(PLAN_SYSTEM_PROMPT).toContain('estimatedTime');
    });
  });

  describe('buildPlanUserPrompt', () => {
    it('应该包含用户需求', () => {
      const requirement = '开发一个用户管理系统';
      const prompt = buildPlanUserPrompt(requirement);
      expect(prompt).toContain(requirement);
    });

    it('应该要求输出 JSON', () => {
      const prompt = buildPlanUserPrompt('测试需求');
      expect(prompt).toContain('JSON');
    });
  });

  describe('buildPlanMessages', () => {
    it('应该返回 system 和 user 两条消息', () => {
      const messages = buildPlanMessages('测试需求');
      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('system');
      expect(messages[1].role).toBe('user');
    });

    it('system 消息应该包含 prompt 模板', () => {
      const messages = buildPlanMessages('测试需求');
      expect(messages[0].content).toBe(PLAN_SYSTEM_PROMPT);
    });

    it('user 消息应该包含需求', () => {
      const requirement = '开发一个网站';
      const messages = buildPlanMessages(requirement);
      expect(messages[1].content).toContain(requirement);
    });
  });

  describe('parsePlanResponse', () => {
    it('应该解析有效的 JSON 响应', () => {
      const response = `{
        "title": "测试计划",
        "tasks": [
          {
            "title": "任务1",
            "description": "描述1",
            "estimatedTime": "30min",
            "dependencies": []
          }
        ]
      }`;
      
      const result = parsePlanResponse(response);
      expect(result).not.toBeNull();
      expect(result?.title).toBe('测试计划');
      expect(result?.tasks).toHaveLength(1);
    });

    it('应该解析 markdown 代码块中的 JSON', () => {
      const response = `这是计划：
\`\`\`json
{
  "title": "测试",
  "tasks": []
}
\`\`\``;
      
      const result = parsePlanResponse(response);
      expect(result).not.toBeNull();
      expect(result?.title).toBe('测试');
    });

    it('无效 JSON 应该返回 null', () => {
      const result = parsePlanResponse('这不是 JSON');
      expect(result).toBeNull();
    });

    it('缺少 title 字段应该返回 null', () => {
      const response = `{"tasks": []}`;
      const result = parsePlanResponse(response);
      expect(result).toBeNull();
    });

    it('缺少 tasks 字段应该返回 null', () => {
      const response = `{"title": "测试"}`;
      const result = parsePlanResponse(response);
      expect(result).toBeNull();
    });

    it('应该正确解析多个任务', () => {
      const response = `{
        "title": "多任务计划",
        "tasks": [
          {"title": "任务1", "description": "描述1", "estimatedTime": "30min", "dependencies": []},
          {"title": "任务2", "description": "描述2", "estimatedTime": "1h", "dependencies": [0]},
          {"title": "任务3", "description": "描述3", "estimatedTime": "2h", "dependencies": [0, 1]}
        ]
      }`;
      
      const result = parsePlanResponse(response);
      expect(result?.tasks).toHaveLength(3);
      expect(result?.tasks[1].dependencies).toEqual([0]);
      expect(result?.tasks[2].dependencies).toEqual([0, 1]);
    });
  });

  describe('buildAnalysisMessages', () => {
    it('应该返回 system 和 user 两条消息', () => {
      const messages = buildAnalysisMessages('测试需求');
      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('system');
      expect(messages[1].role).toBe('user');
    });

    it('system 消息应该包含分析要求', () => {
      const messages = buildAnalysisMessages('测试需求');
      expect(messages[0].content).toContain('需求分析');
      expect(messages[0].content).toContain('category');
    });
  });
});
