// Re-export all auth and theme types
export * from './auth';
export * from './theme';

// User related types
export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin' | 'therapist';
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: {
      dailyCheckin: boolean;
      moodReminders: boolean;
      [key: string]: any;
    };
  };
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Mood related types
export type MoodType = 'happy' | 'sad' | 'anxious' | 'angry' | 'calm' | 'excited' | 'grateful' | 'tired' | 'neutral';

export interface Mood {
  _id: string;
  user: string | User;
  mood: MoodType;
  intensity: number; // 1-10
  note?: string;
  activities?: string[];
  sleepQuality?: number; // 1-5
  weather?: string;
  location?: string;
  tags?: string[];
  isShared?: boolean;
  aiInsights?: string;
  createdAt: string;
  updatedAt: string;
}

// Journal related types
export interface JournalEntry {
  _id: string;
  user: string | User;
  title?: string;
  content: string;
  emotion: MoodType;
  sentimentScore?: number; // -1 to 1
  tags?: string[];
  isPrivate: boolean;
  mood: number; // 1-5
  activities?: string[];
  location?: string;
  weather?: string;
  sleepHours?: number;
  aiInsights?: string;
  createdAt: string;
  updatedAt: string;
}

// Chat related types
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  mood?: MoodType;
  sentiment?: {
    score: number;
    label: string;
  };
  resources?: {
    type: string;
    title: string;
    description: string;
    url: string;
    icon: string;
  }[];
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form related types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: any;
  validation?: {
    required?: string | boolean;
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
    validate?: (value: any) => string | boolean;
  };
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Analytics types
export interface MoodStats {
  _id: string;
  count: number;
  avgIntensity?: number;
}

export interface MoodTimeline {
  _id: string; // Date string
  avgIntensity: number;
  count: number;
  moods: MoodType[];
}

export interface ActivityCorrelation {
  _id: string;
  avgIntensity: number;
  count: number;
  moods: MoodType[];
}

export interface MoodInsights {
  recentMood: Mood | null;
  moodTrend: Array<{
    date: string;
    mood: MoodType;
    intensity: number;
  }>;
  stats: {
    averageIntensity: number;
    mostCommonMood: MoodType;
    moodCounts: Record<MoodType, number>;
    totalEntries: number;
  };
  insights: string[];
  suggestions: string[];
}
