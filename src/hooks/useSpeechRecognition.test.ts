import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechRecognition } from './useSpeechRecognition';

describe('useSpeechRecognition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该返回初始状态', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    expect(result.current.isListening).toBe(false);
    expect(result.current.transcript).toBe('');
    expect(result.current.interimTranscript).toBe('');
    expect(result.current.confidence).toBe(0);
    expect(result.current.isSupported).toBe(true);
  });

  it('应该提供 startListening 方法', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    expect(typeof result.current.startListening).toBe('function');
  });

  it('应该提供 stopListening 方法', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    expect(typeof result.current.stopListening).toBe('function');
  });

  it('应该提供 clearTranscript 方法', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    expect(typeof result.current.clearTranscript).toBe('function');
  });

  it('应该提供 setTranscript 方法', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    expect(typeof result.current.setTranscript).toBe('function');
  });

  it('调用 startListening 应该设置 isListening 为 true', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.startListening();
    });

    expect(result.current.isListening).toBe(true);
  });

  it('调用 stopListening 应该设置 isListening 为 false', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.startListening();
    });

    act(() => {
      result.current.stopListening();
    });

    expect(result.current.isListening).toBe(false);
  });

  it('调用 clearTranscript 应该清空所有文本', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.setTranscript('测试文本');
    });

    expect(result.current.transcript).toBe('测试文本');

    act(() => {
      result.current.clearTranscript();
    });

    expect(result.current.transcript).toBe('');
    expect(result.current.interimTranscript).toBe('');
    expect(result.current.confidence).toBe(0);
  });

  it('调用 setTranscript 应该更新 transcript', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.setTranscript('新的文本内容');
    });

    expect(result.current.transcript).toBe('新的文本内容');
  });

  it('应该检测浏览器是否支持语音识别', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    // 在测试环境中我们 mock 了 SpeechRecognition，所以应该返回 true
    expect(result.current.isSupported).toBe(true);
  });
});
