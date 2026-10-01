import React from 'react';
import { Terminal, Clock, CheckCircle, AlertCircle, Info, Zap } from 'lucide-react';

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error' | 'action';
  message: string;
  details?: string;
}

interface ActivityLogProps {
  logs: LogEntry[];
}

export default function ActivityLog({ logs }: ActivityLogProps) {
  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return <CheckCircle size={14} className="text-green-400" />;
      case 'error': return <AlertCircle size={14} className="text-red-400" />;
      case 'warning': return <AlertCircle size={14} className="text-yellow-400" />;
      case 'action': return <Zap size={14} className="text-blue-400" />;
      default: return <Info size={14} className="text-gray-400" />;
    }
  };

  const getColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-green-300';
      case 'error': return 'text-red-300';
      case 'warning': return 'text-yellow-300';
      case 'action': return 'text-blue-300';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-700/50">
        <Terminal size={18} className="text-gray-400" />
        <h3 className="text-sm font-medium text-gray-200">运行日志</h3>
        <span className="ml-auto text-xs text-gray-500">{logs.length} 条记录</span>
      </div>

      <div className="max-h-[400px] overflow-y-auto p-4 space-y-1 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Terminal size={32} className="mx-auto mb-2 opacity-30" />
            <p>暂无日志记录</p>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="flex items-start gap-2 py-1.5 px-2 rounded hover:bg-gray-700/20 transition-colors">
              <span className="text-gray-500 whitespace-nowrap mt-0.5">
                {log.timestamp.toLocaleTimeString('zh-CN', { hour12: false })}
              </span>
              {getIcon(log.type)}
              <span className={getColor(log.type)}>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
