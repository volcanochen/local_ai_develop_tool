import React, { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import VoiceInput from './components/VoiceInput';
import ExecutionPlanView from './components/ExecutionPlanView';
import SettingsPanel from './components/SettingsPanel';
import DashboardStats from './components/DashboardStats';
import ActivityLog, { LogEntry } from './components/ActivityLog';
import { generatePlan, simulateExecution } from './utils/planGenerator';
import { ExecutionPlan, LLMConfig, PrivacySettings } from './types';
import { 
  Zap, Mic, Shield, Lock, Server, ArrowRight, 
  GitBranch, Clock, CheckCircle2, Sparkles 
} from 'lucide-react';

type View = 'dashboard' | 'plans' | 'settings' | 'logs';

function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [plans, setPlans] = useState<ExecutionPlan[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentExecutingPlan, setCurrentExecutingPlan] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const [llmConfig, setLLMConfig] = useState<LLMConfig>({
    provider: 'ollama',
    endpoint: 'http://localhost:11434/api',
    model: 'qwen2.5:7b',
    temperature: 0.7,
    maxTokens: 4096,
    isLocal: true,
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    dataStorage: 'local-only',
    networkIsolation: true,
    telemetryEnabled: false,
    autoDeleteAfter: 30,
  });

  const addLog = useCallback((type: LogEntry['type'], message: string, details?: string) => {
    setLogs(prev => [{
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      type,
      message,
      details,
    }, ...prev].slice(0, 100));
  }, []);

  // Initial logs
  useEffect(() => {
    addLog('info', '系统初始化完成');
    addLog('success', '本地LLM引擎已连接 (Ollama)');
    addLog('success', '语音识别引擎已就绪');
    addLog('info', '网络隔离模式已启用');
    addLog('success', '数据加密存储已启用');
  }, []);

  const handleVoiceSubmit = useCallback((text: string) => {
    setShowWelcome(false);
    addLog('action', `收到语音需求: "${text.slice(0, 40)}..."`);
    
    // Simulate AI processing
    addLog('info', '正在通过本地LLM分析需求...');
    
    setTimeout(() => {
      const plan = generatePlan(text);
      setPlans(prev => [plan, ...prev]);
      addLog('success', `执行计划已生成: ${plan.title} (${plan.tasks.length}个任务)`);
      addLog('info', '计划状态: 草稿 - 等待审批');
      setActiveView('plans');
    }, 1500);
  }, [addLog]);

  const handleApprovePlan = useCallback((planId: string) => {
    setPlans(prev => prev.map(p => 
      p.id === planId ? { ...p, status: 'approved' as const } : p
    ));
    addLog('success', `计划已批准，准备执行`);
  }, [addLog]);

  const handleExecutePlan = useCallback(async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    setIsExecuting(true);
    setCurrentExecutingPlan(planId);
    
    setPlans(prev => prev.map(p => 
      p.id === planId ? { ...p, status: 'executing' as const } : p
    ));
    
    addLog('action', `开始执行计划: ${plan.title}`);
    addLog('info', `使用本地模型 ${llmConfig.model} 进行任务分解`);

    const updatedPlan = await simulateExecution(plan, (taskId, progress) => {
      setPlans(prev => prev.map(p => {
        if (p.id !== planId) return p;
        const tasks = p.tasks.map(t => t.id === taskId ? { ...t, progress } : t);
        const totalProgress = Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length);
        return { ...p, tasks, totalProgress };
      }));
    });

    setPlans(prev => prev.map(p => 
      p.id === planId ? { ...updatedPlan, status: 'completed' as const, totalProgress: 100 } : p
    ));
    
    setIsExecuting(false);
    setCurrentExecutingPlan(null);
    addLog('success', `计划执行完成: ${plan.title}`);
    addLog('info', `所有 ${plan.tasks.length} 个任务已成功执行`);
  }, [plans, llmConfig.model, addLog]);

  const completedPlans = plans.filter(p => p.status === 'completed').length;
  const activeTasks = plans.filter(p => p.status === 'executing').reduce((sum, p) => sum + p.tasks.filter(t => t.status === 'running').length, 0);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-100">控制台</h2>
                <p className="text-gray-400 text-sm mt-1">语音驱动 · 本地执行 · 安全可控</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-300">系统运行正常</span>
              </div>
            </div>

            {/* Stats */}
            <DashboardStats
              totalPlans={plans.length}
              completedPlans={completedPlans}
              activeTasks={activeTasks}
              uptime="99.9%"
            />

            {/* Voice Input */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Mic size={18} className="text-blue-400" />
                <h3 className="text-lg font-medium text-gray-200">语音输入需求</h3>
              </div>
              <VoiceInput onSubmit={handleVoiceSubmit} />
            </div>

            {/* Architecture Diagram */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center gap-2">
                <GitBranch size={18} className="text-purple-400" />
                系统架构
              </h3>
              <div className="flex items-center justify-between gap-4 overflow-x-auto py-4">
                {[
                  { label: '语音输入', icon: '🎤', desc: 'Web Speech API' },
                  { label: '需求解析', icon: '🧠', desc: '本地LLM' },
                  { label: '计划生成', icon: '📋', desc: 'AI Agent' },
                  { label: '任务执行', icon: '⚡', desc: '自动化引擎' },
                  { label: '结果输出', icon: '✅', desc: '本地存储' },
                ].map((step, i) => (
                  <React.Fragment key={step.label}>
                    <div className="flex flex-col items-center gap-2 min-w-[100px]">
                      <div className="w-14 h-14 rounded-xl bg-gray-700/50 border border-gray-600/30 flex items-center justify-center text-2xl">
                        {step.icon}
                      </div>
                      <span className="text-sm text-gray-200 font-medium">{step.label}</span>
                      <span className="text-xs text-gray-500">{step.desc}</span>
                    </div>
                    {i < 4 && (
                      <ArrowRight size={20} className="text-gray-600 flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <p className="text-xs text-blue-300 text-center">
                  🔒 全流程本地化处理 · 数据不出域 · 端到端加密 · 零外部依赖
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <ActivityLog logs={logs.slice(0, 10)} />
          </div>
        );

      case 'plans':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-100">执行计划</h2>
                <p className="text-gray-400 text-sm mt-1">管理和查看所有AI生成的执行计划</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <FileCount count={plans.length} />
              </div>
            </div>

            {/* Voice Input */}
            <VoiceInput onSubmit={handleVoiceSubmit} />

            {/* Plans List */}
            {plans.length === 0 ? (
              <div className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700/30">
                <GitBranch size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">暂无执行计划</p>
                <p className="text-gray-500 text-sm mt-2">通过语音输入需求来生成第一个执行计划</p>
              </div>
            ) : (
              <div className="space-y-4">
                {plans.map(plan => (
                  <ExecutionPlanView
                    key={plan.id}
                    plan={plan}
                    onApprove={() => handleApprovePlan(plan.id)}
                    onExecute={() => handleExecutePlan(plan.id)}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-100">系统设置</h2>
              <p className="text-gray-400 text-sm mt-1">配置本地LLM引擎和隐私安全选项</p>
            </div>
            <SettingsPanel
              llmConfig={llmConfig}
              privacySettings={privacySettings}
              onLLMConfigChange={setLLMConfig}
              onPrivacyChange={setPrivacySettings}
            />
          </div>
        );

      case 'logs':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-100">运行日志</h2>
              <p className="text-gray-400 text-sm mt-1">查看系统运行状态和任务执行记录</p>
            </div>
            <ActivityLog logs={logs} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        planCount={plans.length}
        executingCount={activeTasks}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">
          {renderContent()}
        </div>
      </main>

      {/* Floating Security Badge */}
      <div className="fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-full bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 shadow-xl">
        <Lock size={14} className="text-green-400" />
        <span className="text-xs text-gray-300">本地化运行中</span>
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      </div>
    </div>
  );
}

function FileCount({ count }: { count: number }) {
  return (
    <span className="px-2 py-1 rounded-lg bg-gray-800 border border-gray-700/50">
      {count} 个计划
    </span>
  );
}

export default App;
