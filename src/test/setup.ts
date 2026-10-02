import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Web Speech API
class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  onresult: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onend: (() => void) | null = null;
  onstart: (() => void) | null = null;

  start = vi.fn(() => {
    if (this.onstart) this.onstart();
  });

  stop = vi.fn(() => {
    if (this.onend) this.onend();
  });

  abort = vi.fn();
}

// @ts-ignore
global.SpeechRecognition = MockSpeechRecognition;
// @ts-ignore
global.webkitSpeechRecognition = MockSpeechRecognition;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
