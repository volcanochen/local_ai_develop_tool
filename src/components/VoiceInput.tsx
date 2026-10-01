import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Send, Trash2, Keyboard } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface VoiceInputProps {
  onSubmit: (text: string) => void;
}

export default function VoiceInput({ onSubmit }: VoiceInputProps) {
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
    setTranscript,
  } = useSpeechRecognition();

  const [manualInput, setManualInput] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [pulseAnim, setPulseAnim] = useState(false);

  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => setPulseAnim(p => !p), 1000);
      return () => clearInterval(interval);
    }
  }, [isListening]);

  const handleSubmit = () => {
    const text = transcript.trim() || manualInput.trim();
    if (text) {
      onSubmit(text);
      clearTranscript();
      setManualInput('');
    }
  };

  const currentText = showManual ? manualInput : transcript;

  return (
    <div className="relative">
      {/* Voice Wave Animation */}
      {isListening && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-32 h-32 rounded-full bg-blue-500/10 ${pulseAnim ? 'scale-110' : 'scale-100'} transition-transform duration-1000`} />
          <div className={`absolute w-40 h-40 rounded-full bg-blue-500/5 ${pulseAnim ? 'scale-100' : 'scale-110'} transition-transform duration-1000`} />
          <div className={`absolute w-48 h-48 rounded-full bg-blue-500/3 ${pulseAnim ? 'scale-110' : 'scale-100'} transition-transform duration-1000`} />
        </div>
      )}

      <div className="relative z-10 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-sm text-gray-400">
            {isListening ? '正在聆听...' : '点击麦克风开始语音输入'}
          </span>
          {!isSupported && (
            <span className="text-xs text-yellow-500 ml-auto">浏览器不支持语音识别，请使用手动输入</span>
          )}
        </div>

        {/* Transcript Display */}
        <div className="min-h-[120px] bg-gray-900/50 rounded-xl p-4 mb-4 border border-gray-700/30">
          {currentText ? (
            <p className="text-gray-200 text-lg leading-relaxed">
              {currentText}
              {isListening && !showManual && (
                <span className="inline-block w-0.5 h-5 bg-blue-400 animate-pulse ml-1" />
              )}
            </p>
          ) : (
            <p className="text-gray-500 text-center py-8">
              {showManual ? '请输入您的需求描述...' : '🎤 请说出您的需求，例如："开发一个用户管理系统"'}
            </p>
          )}
          {interimTranscript && !showManual && (
            <p className="text-gray-400 text-sm mt-2 italic">
              {interimTranscript}
            </p>
          )}
        </div>

        {/* Manual Input */}
        {showManual && (
          <textarea
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="请输入需求描述，例如：开发一个员工考勤管理系统，支持打卡、请假审批和统计报表功能..."
            className="w-full bg-gray-900/50 rounded-xl p-4 mb-4 border border-gray-700/30 text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500/50"
            rows={3}
          />
        )}

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={!isSupported}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              <span className="text-sm">{isListening ? '停止' : '录音'}</span>
            </button>

            <button
              onClick={() => setShowManual(!showManual)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-700/50 text-gray-300 border border-gray-600/30 hover:bg-gray-700/70 transition-all"
            >
              <Keyboard size={18} />
              <span className="text-sm">手动输入</span>
            </button>

            <button
              onClick={clearTranscript}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-700/30 text-gray-400 hover:bg-gray-700/50 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!currentText.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
          >
            <Send size={18} />
            <span>生成执行计划</span>
          </button>
        </div>
      </div>
    </div>
  );
}
