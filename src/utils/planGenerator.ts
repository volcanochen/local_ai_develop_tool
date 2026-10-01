import { ExecutionPlan, Task } from '../types';

const taskTemplates: Record<string, Task[]> = {
  'web应用': [
    { id: '1', title: '需求分析与技术选型', description: '分析用户需求，确定技术栈和架构方案', status: 'pending', progress: 0, dependencies: [], estimatedTime: '30min' },
    { id: '2', title: '数据库设计', description: '设计数据模型和数据库表结构', status: 'pending', progress: 0, dependencies: ['1'], estimatedTime: '45min' },
    { id: '3', title: 'API接口设计', description: '设计RESTful API接口和数据格式', status: 'pending', progress: 0, dependencies: ['1'], estimatedTime: '1h' },
    { id: '4', title: '前端页面开发', description: '开发前端页面组件和交互逻辑', status: 'pending', progress: 0, dependencies: ['2', '3'], estimatedTime: '4h' },
    { id: '5', title: '后端服务开发', description: '实现后端业务逻辑和API接口', status: 'pending', progress: 0, dependencies: ['2', '3'], estimatedTime: '3h' },
    { id: '6', title: '集成测试', description: '前后端联调测试，确保功能完整', status: 'pending', progress: 0, dependencies: ['4', '5'], estimatedTime: '2h' },
    { id: '7', title: '部署上线', description: '配置CI/CD，部署到生产环境', status: 'pending', progress: 0, dependencies: ['6'], estimatedTime: '1h' },
  ],
  '数据分析': [
    { id: '1', title: '数据源确认', description: '确认数据来源、格式和获取方式', status: 'pending', progress: 0, dependencies: [], estimatedTime: '30min' },
    { id: '2', title: '数据清洗脚本', description: '编写数据清洗和预处理脚本', status: 'pending', progress: 0, dependencies: ['1'], estimatedTime: '2h' },
    { id: '3', title: '分析模型构建', description: '构建数据分析模型和算法', status: 'pending', progress: 0, dependencies: ['2'], estimatedTime: '3h' },
    { id: '4', title: '可视化报表', description: '生成数据可视化图表和报表', status: 'pending', progress: 0, dependencies: ['3'], estimatedTime: '2h' },
    { id: '5', title: '结果验证', description: '验证分析结果的准确性和可靠性', status: 'pending', progress: 0, dependencies: ['4'], estimatedTime: '1h' },
  ],
  '自动化脚本': [
    { id: '1', title: '流程梳理', description: '梳理需要自动化的业务流程', status: 'pending', progress: 0, dependencies: [], estimatedTime: '1h' },
    { id: '2', title: '脚本编写', description: '编写自动化执行脚本', status: 'pending', progress: 0, dependencies: ['1'], estimatedTime: '3h' },
    { id: '3', title: '异常处理', description: '添加错误处理和重试机制', status: 'pending', progress: 0, dependencies: ['2'], estimatedTime: '1h' },
    { id: '4', title: '定时任务配置', description: '配置定时执行和监控告警', status: 'pending', progress: 0, dependencies: ['3'], estimatedTime: '30min' },
  ],
  'default': [
    { id: '1', title: '需求拆解', description: '将需求拆解为可执行的子任务', status: 'pending', progress: 0, dependencies: [], estimatedTime: '30min' },
    { id: '2', title: '方案设计', description: '设计技术方案和实现路径', status: 'pending', progress: 0, dependencies: ['1'], estimatedTime: '1h' },
    { id: '3', title: '核心开发', description: '实现核心功能和业务逻辑', status: 'pending', progress: 0, dependencies: ['2'], estimatedTime: '4h' },
    { id: '4', title: '测试验证', description: '编写测试用例并验证功能', status: 'pending', progress: 0, dependencies: ['3'], estimatedTime: '2h' },
    { id: '5', title: '文档输出', description: '编写技术文档和使用说明', status: 'pending', progress: 0, dependencies: ['3'], estimatedTime: '1h' },
  ],
};

function detectCategory(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('网站') || lower.includes('web') || lower.includes('应用') || lower.includes('系统') || lower.includes('平台') || lower.includes('前端') || lower.includes('后台')) {
    return 'web应用';
  }
  if (lower.includes('数据') || lower.includes('分析') || lower.includes('报表') || lower.includes('统计') || lower.includes('可视化')) {
    return '数据分析';
  }
  if (lower.includes('自动') || lower.includes('脚本') || lower.includes('批处理') || lower.includes('定时') || lower.includes('流程')) {
    return '自动化脚本';
  }
  return 'default';
}

export function generatePlan(input: string): ExecutionPlan {
  const category = detectCategory(input);
  const tasks = [...taskTemplates[category] || taskTemplates['default']].map(t => ({
    ...t,
    id: `${Date.now()}-${t.id}`,
  }));

  // Add custom task based on input
  const customTask: Task = {
    id: `${Date.now()}-custom`,
    title: '需求定制任务',
    description: `根据语音需求"${input.slice(0, 50)}..."生成的定制化任务`,
    status: 'pending',
    progress: 0,
    dependencies: [tasks[0]?.id || ''],
    estimatedTime: '2h',
  };
  tasks.push(customTask);

  return {
    id: `plan-${Date.now()}`,
    title: extractTitle(input),
    description: input,
    createdAt: new Date(),
    tasks,
    status: 'draft',
    totalProgress: 0,
  };
}

function extractTitle(input: string): string {
  if (input.length <= 30) return input;
  // Try to extract key phrase
  const keywords = input.match(/[\u4e00-\u9fa5a-zA-Z]{2,10}/g);
  if (keywords && keywords.length > 0) {
    return keywords.slice(0, 3).join('');
  }
  return input.slice(0, 30) + '...';
}

export function simulateExecution(plan: ExecutionPlan, onProgress: (taskId: string, progress: number) => void): Promise<ExecutionPlan> {
  return new Promise((resolve) => {
    const tasks = [...plan.tasks];
    let currentIndex = 0;

    const executeNext = () => {
      if (currentIndex >= tasks.length) {
        resolve({ ...plan, tasks, status: 'completed', totalProgress: 100 });
        return;
      }

      const task = tasks[currentIndex];
      task.status = 'running';
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          progress = 100;
          task.status = 'completed';
          task.progress = 100;
          task.output = `任务"${task.title}"已完成，输出结果已保存到本地工作区。`;
          onProgress(task.id, 100);
          clearInterval(interval);
          currentIndex++;
          setTimeout(executeNext, 500);
        } else {
          task.progress = Math.round(progress);
          onProgress(task.id, task.progress);
        }
      }, 800);
    };

    executeNext();
  });
}
