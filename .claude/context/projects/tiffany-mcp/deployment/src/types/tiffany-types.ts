// Core TypeScript interfaces for Tiffany MCP Server
// Comprehensive type definitions for all 25 tools and system components

// User State Management
export interface TiffanyUserState {
  id: string;
  lastInteraction: string;
  gainsCount: number;
  currentStreak: number;
  memoryContext: string[];
  totalPoints: number;
  goals: Goal[];
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  quoteStyle: 'inspirational' | 'practical' | 'philosophical';
  reminderTime: string; // HH:MM format
  timezone: string;
  telegramChatId?: string;
  voiceEnabled: boolean;
  language: string;
}

// Gains Tracking
export interface Gain {
  id: string;
  description: string;
  category: string;
  impact: 'small' | 'medium' | 'large';
  timestamp: string;
  points: number;
  userId: string;
  airtableId?: string;
  tags?: string[];
  reflection?: string;
}

export interface GainSummary {
  totalGains: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  categoryCounts: Record<string, number>;
  lastGainDate: string;
}

// Goal Management
export interface Goal {
  id: string;
  description: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number; // 0-100
  milestones: Milestone[];
  category: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  completedAt?: string;
}

// Quote System
export interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  style: 'inspirational' | 'practical' | 'philosophical';
  used: boolean;
  usageCount: number;
  lastUsed?: string;
  tags?: string[];
  personalizedFor?: string;
}

export interface QuoteRequest {
  topic?: string;
  style?: 'inspirational' | 'practical' | 'philosophical';
  userId?: string;
  customPrompt?: string;
}

// TELOS Integration
export interface TELOSFile {
  id: string;
  filename: string;
  content: string;
  category: string;
  subcategory?: string;
  lastAccessed: string;
  accessCount: number;
  tags?: string[];
  summary?: string;
}

export interface TELOSSearchResult {
  file: TELOSFile;
  relevanceScore: number;
  matchedSections: string[];
  context: string;
}

export interface MentorAdviceRequest {
  situation: string;
  focus_area: 'productivity' | 'leadership' | 'decision-making' | 'growth' | 'strategy';
  userId?: string;
  context?: string;
  urgency?: 'low' | 'medium' | 'high';
}

// Memory and Conversation
export interface MemoryEntry {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  type: 'conversation' | 'gain' | 'goal' | 'advice' | 'quote' | 'checkin';
  metadata?: Record<string, any>;
  importance: 'low' | 'medium' | 'high';
}

export interface ConversationContext {
  userId: string;
  recentEntries: MemoryEntry[];
  summary: string;
  keyTopics: string[];
  lastUpdated: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

// AI Processing
export interface VoiceInput {
  audioData: ArrayBuffer;
  format: 'wav' | 'mp3' | 'ogg' | 'm4a';
  duration?: number;
  userId: string;
}

export interface VoiceProcessingResult {
  transcription: string;
  confidence: number;
  language: string;
  duration: number;
  processedAt: string;
}

export interface InformationExtractionResult {
  category: string;
  impact: 'small' | 'medium' | 'large';
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  entities: {
    type: string;
    value: string;
    confidence: number;
  }[];
  summary: string;
}

// Router and Decision Making
export interface RouterDecision {
  action: 'telos_advice' | 'log_conversation' | 'quote_collection' | 'gains_tracking' | 'goal_setting' | 'accountability_checkin';
  confidence: number;
  reasoning: string;
  suggestedTool: string;
  parameters?: Record<string, any>;
}

export interface RoutingContext {
  userInput: string;
  userId: string;
  conversationHistory: MemoryEntry[];
  userState: TiffanyUserState;
  timestamp: string;
}

// Communication and Formatting
export interface TelegramMessage {
  text: string;
  chatId: string;
  parseMode?: 'Markdown' | 'HTML';
  replyToMessageId?: number;
  inlineKeyboard?: TelegramInlineKeyboard;
}

export interface TelegramInlineKeyboard {
  inline_keyboard: TelegramInlineKeyboardButton[][];
}

export interface TelegramInlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  category: 'gain' | 'quote' | 'advice' | 'checkin' | 'goal' | 'error';
  style?: 'formal' | 'casual' | 'motivational';
}

// Scheduling and Automation
export interface ScheduledReminder {
  id: string;
  userId: string;
  type: 'daily_quote' | 'gains_reminder' | 'checkin_prompt' | 'goal_deadline';
  schedule: string; // Cron expression
  active: boolean;
  lastSent?: string;
  nextSend: string;
  template: string;
  metadata?: Record<string, any>;
}

export interface ReminderCheck {
  userId: string;
  type: 'gains_submission' | 'goal_progress' | 'checkin_completion';
  period: 'daily' | 'weekly' | 'monthly';
  lastCheck: string;
  result: boolean;
  details?: string;
}

// External API Integrations
export interface AirtableRecord {
  id?: string;
  fields: Record<string, any>;
  createdTime?: string;
}

export interface AirtableCreateRequest {
  records: {
    fields: Record<string, any>;
  }[];
}

export interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

export interface OpenAICompletionRequest {
  model: string;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

export interface OpenAITranscriptionRequest {
  file: File | Blob;
  model: string;
  language?: string;
  prompt?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
}

// Tool Input/Output Types
export interface ToolResponse {
  content: {
    type: 'text' | 'image' | 'audio';
    text?: string;
    data?: string;
    mimeType?: string;
  }[];
  isError?: boolean;
  metadata?: Record<string, any>;
}

export interface ToolError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Accountability and Check-ins
export interface AccountabilityCheckin {
  id: string;
  userId: string;
  timeframe: 'daily' | 'weekly' | 'monthly';
  date: string;
  reflection?: string;
  responses: {
    question: string;
    answer: string;
  }[];
  mood?: 'excellent' | 'good' | 'okay' | 'poor' | 'terrible';
  energyLevel?: number; // 1-10
  completedAt: string;
}

export interface CheckinTemplate {
  timeframe: 'daily' | 'weekly' | 'monthly';
  questions: {
    id: string;
    text: string;
    type: 'text' | 'rating' | 'boolean' | 'multiple_choice';
    required: boolean;
    options?: string[];
  }[];
  followUpPrompts: string[];
}

// System Configuration
export interface SystemConfig {
  environment: 'development' | 'staging' | 'production';
  version: string;
  features: {
    voiceProcessing: boolean;
    telosIntegration: boolean;
    airtableSync: boolean;
    scheduledReminders: boolean;
    advancedAnalytics: boolean;
  };
  limits: {
    maxMemoryEntries: number;
    maxDailyGains: number;
    maxActiveGoals: number;
    conversationContextWindow: number;
  };
  integrations: {
    airtable: {
      baseId: string;
      apiKey: string;
      tables: Record<string, string>;
    };
    openai: {
      apiKey: string;
      models: {
        completion: string;
        transcription: string;
        embedding: string;
      };
    };
    telegram: {
      botToken: string;
      webhookUrl?: string;
    };
  };
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// API Response Wrappers
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ToolError;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Event Types for System Monitoring
export interface SystemEvent {
  id: string;
  type: 'tool_execution' | 'user_interaction' | 'system_error' | 'data_sync' | 'scheduled_task';
  userId?: string;
  toolName?: string;
  timestamp: string;
  duration?: number;
  success: boolean;
  metadata?: Record<string, any>;
  error?: ToolError;
}

// Export all interfaces for external use
export * from './user-state';
export * from './tool-responses';
export * from './external-apis';