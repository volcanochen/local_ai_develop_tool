/**
 * Prompt 模板管理
 * 
 * 所有发送给本地 LLM 的 prompt 都在这里定义。
 * 使用结构化 prompt 确保 LLM 输出可解析的 JSON 格式。
 */

import { ChatMessage } from './llmService';

/**
 * 生成执行计划的 system prompt
 */
export const PLAN_SYSTEM_PROMPT = `你是一个专业的软件开发项目经理 AI 助手。你的任务是根据用户的语音需求描述，生成一个结构化的执行计划。

## 输出要求
你必须严格按照以下 JSON 格式输出，不要输出任何其他内容：

\`\`\`json
{
  "title": "计划标题（简短）",
  "tasks": [
    {
      "title": "任务标题",
      "description": "任务详细描述",
      "estimatedTime": "预估时间（如 30min, 1h, 2h）",
      "dependencies": []
    }
  ]
}
\`\`\`

## 规则
1. 每个计划包含 3-8 个任务
2. 任务之间要有合理的依赖关系
3. 第一个任务不能有依赖
4. 任务描述要具体可执行
5. dependencies 数组中填写依赖任务的索引（从 0 开始）
6. 只输出 JSON，不要有任何其他文字`;

/**
 * 生成执行计划的 user prompt
 */
export function buildPlanUserPrompt(requirement: string): string {
  return `请根据以下需求描述，生成一个详细的执行计划：

## 用户需求
${requirement}

请输出 JSON 格式的执行计划。`;
}

/**
 * 构建完整的计划生成消息列表
 */
export function buildPlanMessages(requirement: string): ChatMessage[] {
  return [
    { role: 'system', content: PLAN_SYSTEM_PROMPT },
    { role: 'user', content: buildPlanUserPrompt(requirement) },
  ];
}

/**
 * 解析 LLM 返回的 JSON 计划
 */
export function parsePlanResponse(text: string): {
  title: string;
  tasks: Array<{
    title: string;
    description: string;
    estimatedTime: string;
    dependencies: number[];
  }>;
} | null {
  try {
    // 尝试提取 JSON 块
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;
    
    const parsed = JSON.parse(jsonStr.trim());
    
    if (!parsed.title || !Array.isArray(parsed.tasks)) {
      return null;
    }
    
    return parsed;
  } catch {
    return null;
  }
}

/**
 * 需求分析 prompt - 用于对需求进行分类和扩展
 */
export const ANALYSIS_SYSTEM_PROMPT = `你是一个需求分析专家。请分析用户的需求，输出以下 JSON 格式：

\`\`\`json
{
  "category": "web应用|数据分析|自动化脚本|API开发|移动端|其他",
  "complexity": "简单|中等|复杂",
  "keyFeatures": ["功能1", "功能2"],
  "techStack": ["技术1", "技术2"],
  "estimatedDays": 5
}
\`\`\`

只输出 JSON，不要有其他内容。`;

export function buildAnalysisMessages(requirement: string): ChatMessage[] {
  return [
    { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
    { role: 'user', content: `分析以下需求：\n\n${requirement}` },
  ];
}
