import React, { useState } from 'react';
import { TaskOutput } from '../types';
import { FileCode, FileText, Settings, CheckSquare, Rocket, BarChart3, Layout, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface TaskOutputViewProps {
  output: TaskOutput;
}

export default function TaskOutputView({ output }: TaskOutputViewProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'files' | 'logs'>('content');
  const [copied, setCopied] = useState(false);

  const getIcon = () => {
    switch (output.type) {
      case 'code': return <FileCode size={14} className="text-blue-400" />;
      case 'document': return <FileText size={14} className="text-green-400" />;
      case 'config': return <Settings size={14} className="text-yellow-400" />;
      case 'test-report': return <CheckSquare size={14} className="text-purple-400" />;
      case 'deploy-log': return <Rocket size={14} className="text-orange-400" />;
      case 'analysis': return <BarChart3 size={14} className="text-cyan-400" />;
      case 'design': return <Layout size={14} className="text-pink-400" />;
      default: return <FileText size={14} className="text-gray-400" />;
    }
  };

  const getTypeLabel = () => {
    switch (output.type) {
      case 'code': return '代码';
      case 'document': return '文档';
      case 'config': return '配置';
      case 'test-report': return '测试报告';
      case 'deploy-log': return '部署日志';
      case 'analysis': return '分析报告';
      case 'design': return '设计文档';
      default: return '输出';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 rounded-lg border border-gray-700/50 bg-gray-900/50 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800/50 transition-colors text-left"
      >
        {getIcon()}
        <span className="text-xs font-medium text-gray-300 flex-1">
          {output.title}
        </span>
        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-400">
          {getTypeLabel()}
        </span>
        {expanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-700/50">
          {/* Tabs */}
          <div className="flex border-b border-gray-700/30">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-3 py-1.5 text-xs transition-colors ${
                activeTab === 'content' ? 'text-blue-400 border-b border-blue-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              内容
            </button>
            {output.files && output.files.length > 0 && (
              <button
                onClick={() => setActiveTab('files')}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  activeTab === 'files' ? 'text-blue-400 border-b border-blue-400' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                文件 ({output.files.length})
              </button>
            )}
            {output.logs && output.logs.length > 0 && (
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  activeTab === 'logs' ? 'text-blue-400 border-b border-blue-400' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                日志 ({output.logs.length})
              </button>
            )}
            <button
              onClick={handleCopy}
              className="ml-auto px-3 py-1.5 text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
            >
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              {copied ? '已复制' : '复制'}
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[400px] overflow-y-auto">
            {activeTab === 'content' && (
              <pre className="p-3 text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                {output.content}
              </pre>
            )}

            {activeTab === 'files' && output.files && (
              <div className="p-3 space-y-3">
                {output.files.map((file, index) => (
                  <div key={index} className="rounded-lg border border-gray-700/30 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800/50 border-b border-gray-700/30">
                      <span className="text-xs text-gray-400 font-mono">{file.name}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(file.content)}
                        className="text-xs text-gray-500 hover:text-gray-300"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                    <pre className="p-3 text-xs text-gray-300 font-mono whitespace-pre-wrap overflow-x-auto max-h-[200px] overflow-y-auto">
                      {file.content}
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'logs' && output.logs && (
              <div className="p-3 space-y-1 font-mono text-xs">
                {output.logs.map((log, index) => (
                  <div key={index} className="text-gray-400 py-0.5">
                    {log.includes('✅') ? (
                      <span className="text-green-400">{log}</span>
                    ) : log.includes('❌') ? (
                      <span className="text-red-400">{log}</span>
                    ) : (
                      log
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
