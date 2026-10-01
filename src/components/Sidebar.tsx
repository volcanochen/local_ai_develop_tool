import React from 'react';
import { 
  Mic, LayoutDashboard, FileText, Settings, Shield, 
  Cpu, History, Zap, Lock, Server 
} from 'lucide-react';

type View = 'dashboard' | 'plans' | 'settings' | 'logs';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  planCount: number;
  executingCount: number;
}

export default function Sidebar({ activeView, onViewChange, planCount, executingCount }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as View, label: '控制台', icon: LayoutDashboard },
    { id: 'plans' as View, label: '执行计划', icon: FileText, badge: planCount },
    { id: 'logs' as View, label: '运行日志', icon: History },
    { id: 'settings' as View, label: '系统设置', icon: Settings },
  ];

  return (
    <div className="w-64 bg-gray-900/80 border-r border-gray-700/50 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-100">VoiceDev</h1>
            <p className="text-xs text-gray-500">本地化AI开发框架</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
              activeView === item.id
                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
          >
            <item.icon size={18} />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && item.badge > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-300">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Status Panel */}
      <div className="p-4 border-t border-gray-700/50 space-y-3">
        {/* Local LLM Status */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50">
          <Server size={14} className="text-green-400" />
          <span className="text-xs text-gray-400">本地LLM</span>
          <span className="ml-auto text-xs text-green-400">● 在线</span>
        </div>

        {/* Privacy Status */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50">
          <Lock size={14} className="text-green-400" />
          <span className="text-xs text-gray-400">数据隔离</span>
          <span className="ml-auto text-xs text-green-400">● 安全</span>
        </div>

        {/* Executing */}
        {executingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Cpu size={14} className="text-blue-400 animate-pulse" />
            <span className="text-xs text-blue-300">{executingCount} 个任务执行中</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Shield size={12} className="text-green-500" />
          <span>100% 本地运行 · 零数据泄露</span>
        </div>
      </div>
    </div>
  );
}
