export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'code' | 'document' | 'config' | 'test' | 'deploy' | 'analysis' | 'design';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  dependencies: string[];
  estimatedTime: string;
  output?: TaskOutput;
}

export interface TaskOutput {
  type: 'code' | 'document' | 'config' | 'test-report' | 'deploy-log' | 'analysis' | 'design';
  title: string;
  content: string;
  language?: string; // for code
  files?: Array<{ name: string; content: string }>;
  logs?: string[];
}

export interface ExecutionPlan {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  tasks: Task[];
  status: 'draft' | 'approved' | 'executing' | 'completed';
  totalProgress: number;
}

export interface VoiceInputState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  confidence: number;
}

export interface LLMConfig {
  provider: 'ollama' | 'llama-cpp' | 'local-ai' | 'custom';
  endpoint: string;
  model: string;
  temperature: number;
  maxTokens: number;
  isLocal: boolean;
}

export interface PrivacySettings {
  dataStorage: 'local-only' | 'encrypted-local';
  networkIsolation: boolean;
  telemetryEnabled: boolean;
  autoDeleteAfter: number; // days
}
