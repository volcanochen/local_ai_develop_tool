import React, { useState } from 'react';
import { Shield, Server, Cpu, Lock, Eye, EyeOff, Wifi, WifiOff, Database, HardDrive } from 'lucide-react';
import { LLMConfig, PrivacySettings } from '../types';

interface SettingsPanelProps {
  llmConfig: LLMConfig;
  privacySettings: PrivacySettings;
  onLLMConfigChange: (config: LLMConfig) => void;
  onPrivacyChange: (settings: PrivacySettings) => void;
}

export default function SettingsPanel({ llmConfig, privacySettings, onLLMConfigChange, onPrivacyChange }: SettingsPanelProps) {
  const [showEndpoint, setShowEndpoint] = useState(false);
  const [activeTab, setActiveTab] = useState<'llm' | 'privacy'>('llm');

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-700/50">
        <button
          onClick={() => setActiveTab('llm')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-all ${
            activeTab === 'llm' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Cpu size={16} />
          本地LLM配置
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-all ${
            activeTab === 'privacy' ? 'text-green-400 border-b-2 border-green-400 bg-green-500/5' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Shield size={16} />
          隐私安全
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'llm' ? (
          <div className="space-y-5">
            {/* Provider Selection */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">推理引擎</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'ollama', label: 'Ollama', icon: '🦙' },
                  { value: 'llama-cpp', label: 'llama.cpp', icon: '🦙' },
                  { value: 'local-ai', label: 'LocalAI', icon: '🤖' },
                  { value: 'custom', label: '自定义', icon: '⚙️' },
                ].map(p => (
                  <button
                    key={p.value}
                    onClick={() => onLLMConfigChange({ ...llmConfig, provider: p.value as LLMConfig['provider'] })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                      llmConfig.provider === p.value
                        ? 'border-blue-500/50 bg-blue-500/10 text-blue-300'
                        : 'border-gray-600/30 bg-gray-800/30 text-gray-400 hover:border-gray-500/50'
                    }`}
                  >
                    <span>{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Endpoint */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">API端点</label>
              <div className="relative">
                <input
                  type={showEndpoint ? 'text' : 'password'}
                  value={llmConfig.endpoint}
                  onChange={(e) => onLLMConfigChange({ ...llmConfig, endpoint: e.target.value })}
                  className="w-full bg-gray-900/50 rounded-lg px-3 py-2 pr-10 border border-gray-700/30 text-gray-200 text-sm focus:outline-none focus:border-blue-500/50"
                  placeholder="http://localhost:11434/api"
                />
                <button
                  onClick={() => setShowEndpoint(!showEndpoint)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showEndpoint ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Model */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">模型名称</label>
              <input
                type="text"
                value={llmConfig.model}
                onChange={(e) => onLLMConfigChange({ ...llmConfig, model: e.target.value })}
                className="w-full bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700/30 text-gray-200 text-sm focus:outline-none focus:border-blue-500/50"
                placeholder="qwen2.5:7b"
              />
            </div>

            {/* Temperature */}
            <div>
              <label className="text-sm text-gray-400 mb-2 flex justify-between">
                <span>温度参数</span>
                <span className="text-gray-300">{llmConfig.temperature}</span>
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={llmConfig.temperature}
                onChange={(e) => onLLMConfigChange({ ...llmConfig, temperature: parseFloat(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Max Tokens */}
            <div>
              <label className="text-sm text-gray-400 mb-2 flex justify-between">
                <span>最大Token数</span>
                <span className="text-gray-300">{llmConfig.maxTokens}</span>
              </label>
              <input
                type="range"
                min="512"
                max="8192"
                step="512"
                value={llmConfig.maxTokens}
                onChange={(e) => onLLMConfigChange({ ...llmConfig, maxTokens: parseInt(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <Server size={16} className="text-green-400" />
              <span className="text-sm text-green-300">本地服务运行中 · 无外部网络连接</span>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Data Storage */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">数据存储方式</label>
              <div className="space-y-2">
                <button
                  onClick={() => onPrivacyChange({ ...privacySettings, dataStorage: 'local-only' })}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all ${
                    privacySettings.dataStorage === 'local-only'
                      ? 'border-green-500/50 bg-green-500/10 text-green-300'
                      : 'border-gray-600/30 bg-gray-800/30 text-gray-400'
                  }`}
                >
                  <HardDrive size={18} />
                  <div>
                    <div className="text-sm font-medium">仅本地存储</div>
                    <div className="text-xs opacity-70">所有数据仅保存在本地设备</div>
                  </div>
                </button>
                <button
                  onClick={() => onPrivacyChange({ ...privacySettings, dataStorage: 'encrypted-local' })}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all ${
                    privacySettings.dataStorage === 'encrypted-local'
                      ? 'border-green-500/50 bg-green-500/10 text-green-300'
                      : 'border-gray-600/30 bg-gray-800/30 text-gray-400'
                  }`}
                >
                  <Database size={18} />
                  <div>
                    <div className="text-sm font-medium">加密本地存储</div>
                    <div className="text-xs opacity-70">使用AES-256加密后存储</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Network Isolation */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900/30 border border-gray-700/30">
              <div className="flex items-center gap-3">
                {privacySettings.networkIsolation ? <WifiOff size={18} className="text-green-400" /> : <Wifi size={18} className="text-gray-400" />}
                <div>
                  <div className="text-sm text-gray-200">网络隔离模式</div>
                  <div className="text-xs text-gray-500">禁止所有外部网络请求</div>
                </div>
              </div>
              <button
                onClick={() => onPrivacyChange({ ...privacySettings, networkIsolation: !privacySettings.networkIsolation })}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  privacySettings.networkIsolation ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  privacySettings.networkIsolation ? 'translate-x-5.5 left-0.5' : 'left-0.5'
                }`} style={{ transform: privacySettings.networkIsolation ? 'translateX(20px)' : 'translateX(0)' }} />
              </button>
            </div>

            {/* Telemetry */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900/30 border border-gray-700/30">
              <div className="flex items-center gap-3">
                <Lock size={18} className={privacySettings.telemetryEnabled ? 'text-yellow-400' : 'text-green-400'} />
                <div>
                  <div className="text-sm text-gray-200">遥测数据</div>
                  <div className="text-xs text-gray-500">
                    {privacySettings.telemetryEnabled ? '已启用（不推荐）' : '已禁用（安全）'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onPrivacyChange({ ...privacySettings, telemetryEnabled: !privacySettings.telemetryEnabled })}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  !privacySettings.telemetryEnabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                  style={{ transform: !privacySettings.telemetryEnabled ? 'translateX(20px)' : 'translateX(0)' }} />
              </button>
            </div>

            {/* Auto Delete */}
            <div>
              <label className="text-sm text-gray-400 mb-2 flex justify-between">
                <span>自动清理周期</span>
                <span className="text-gray-300">{privacySettings.autoDeleteAfter} 天</span>
              </label>
              <input
                type="range"
                min="1"
                max="90"
                step="1"
                value={privacySettings.autoDeleteAfter}
                onChange={(e) => onPrivacyChange({ ...privacySettings, autoDeleteAfter: parseInt(e.target.value) })}
                className="w-full accent-green-500"
              />
            </div>

            {/* Security Badge */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={20} className="text-green-400" />
                <span className="text-green-300 font-medium">安全等级：高</span>
              </div>
              <p className="text-xs text-green-400/70">
                所有数据均在本地处理和存储，不会发送到任何外部服务器。
                语音识别使用浏览器本地引擎，LLM推理完全在本地运行。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
