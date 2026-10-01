import React from 'react';
import { CheckCircle, Clock, Play, AlertCircle, Loader2, ArrowRight, GitBranch } from 'lucide-react';
import { ExecutionPlan as PlanType, Task } from '../types';

interface ExecutionPlanProps {
  plan: PlanType;
  onExecute: () => void;
  onApprove: () => void;
}

export default function ExecutionPlanView({ plan, onExecute, onApprove }: ExecutionPlanProps) {
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle size={18} className="text-green-400" />;
      case 'running': return <Loader2 size={18} className="text-blue-400 animate-spin" />;
      case 'failed': return <AlertCircle size={18} className="text-red-400" />;
      default: return <Clock size={18} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'border-green-500/30 bg-green-500/5';
      case 'running': return 'border-blue-500/30 bg-blue-500/5';
      case 'failed': return 'border-red-500/30 bg-red-500/5';
      default: return 'border-gray-600/30 bg-gray-800/30';
    }
  };

  const getPlanStatusBadge = () => {
    switch (plan.status) {
      case 'draft': return <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400">草稿</span>;
      case 'approved': return <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">已批准</span>;
      case 'executing': return <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400 animate-pulse">执行中</span>;
      case 'completed': return <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400">已完成</span>;
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <GitBranch size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">{plan.title}</h3>
              <p className="text-sm text-gray-400">
                创建于 {plan.createdAt.toLocaleString('zh-CN')} · {plan.tasks.length} 个任务
              </p>
            </div>
          </div>
          {getPlanStatusBadge()}
        </div>
        <p className="text-gray-300 text-sm mt-2 bg-gray-900/30 rounded-lg p-3 border border-gray-700/30">
          📋 {plan.description}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-3 bg-gray-900/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">总体进度</span>
          <span className="text-sm font-medium text-gray-200">{plan.totalProgress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${plan.totalProgress}%` }}
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="p-6 space-y-3">
        {plan.tasks.map((task, index) => (
          <div key={task.id} className={`rounded-xl border p-4 transition-all ${getStatusColor(task.status)}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getStatusIcon(task.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500 font-mono">#{index + 1}</span>
                  <h4 className="font-medium text-gray-200">{task.title}</h4>
                  <span className="ml-auto text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={12} />
                    {task.estimatedTime}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                
                {/* Progress bar for running tasks */}
                {task.status === 'running' && (
                  <div className="mt-2">
                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-blue-400 mt-1">{task.progress}%</span>
                  </div>
                )}

                {/* Output */}
                {task.output && (
                  <div className="mt-2 p-2 bg-green-900/20 rounded-lg border border-green-700/30">
                    <p className="text-xs text-green-300">{task.output}</p>
                  </div>
                )}

                {/* Dependencies */}
                {task.dependencies.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowRight size={12} className="text-gray-500" />
                    <span className="text-xs text-gray-500">
                      依赖: {task.dependencies.map(d => `#${plan.tasks.findIndex(t => t.id === d) + 1}`).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-gray-700/50 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          本地执行 · 数据不出域 · 🔒 端到端加密
        </div>
        <div className="flex gap-2">
          {plan.status === 'draft' && (
            <button
              onClick={onApprove}
              className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all text-sm"
            >
              ✓ 批准计划
            </button>
          )}
          {(plan.status === 'approved' || plan.status === 'draft') && (
            <button
              onClick={onExecute}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/20 text-sm"
            >
              <Play size={16} />
              开始执行
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
