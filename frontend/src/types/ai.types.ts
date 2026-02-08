/**
 * AI Types for Frontend
 * Defines TypeScript interfaces for AI-related frontend components
 */

// Interface for AI chat request
export interface AIChatRequest {
  message: string;
  sessionId?: string;
}

// Interface for AI chat response
export interface AIChatResponse {
  success: boolean;
  data?: {
    responseText: string;
    requiresConfirmation: boolean;
    actionPlan: TaskOperationPlan[];
    detectedIntent: UserIntent;
  };
  error?: {
    code: string;
    message: string;
  };
}

// Interface for a planned task operation
export interface TaskOperationPlan {
  operation: TaskOperation;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload?: any;
}

// Enum for task operation types
export enum TaskOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SEARCH = 'SEARCH',
  MARK_COMPLETE = 'MARK_COMPLETE',
  MARK_INCOMPLETE = 'MARK_INCOMPLETE'
}

// Enum for different types of user intents
export enum IntentType {
  CREATE_TASK = 'CREATE_TASK',
  UPDATE_TASK = 'UPDATE_TASK',
  DELETE_TASK = 'DELETE_TASK',
  SEARCH_TASKS = 'SEARCH_TASKS',
  MARK_COMPLETE = 'MARK_COMPLETE',
  MARK_INCOMPLETE = 'MARK_INCOMPLETE',
  SET_PRIORITY = 'SET_PRIORITY',
  SET_DUE_DATE = 'SET_DUE_DATE',
  SET_REMINDER = 'SET_REMINDER',
  CREATE_RECURRING_TASK = 'CREATE_RECURRING_TASK'
}

// Enum for priority levels
export enum PriorityLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

// Enum for recurrence patterns
export enum RecurrencePattern {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

// Interface for extracted parameters from user input
export interface ExtractedParameters {
  taskTitle?: string;
  taskDescription?: string;
  taskId?: string;
  priority?: PriorityLevel;
  dueDate?: string; // ISO date string
  category?: string;
  tags?: string[];
  recurrencePattern?: RecurrencePattern;
  reminderOffset?: number; // minutes before due date
}

// Interface for detected user intent
export interface UserIntent {
  type: IntentType;
  confidence: number; // 0-1 scale
  parameters: ExtractedParameters;
}

// Interface for AI response structure
export interface FrontendAIResponse {
  id: string;
  userInput: string;
  responseText: string;
  requiresConfirmation: boolean;
  timestamp: Date;
}

// Interface for AI chat message
export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string format
  requiresConfirmation?: boolean;
  actionPlan?: TaskOperationPlan[];
}

// Interface for conversation message
export interface ConversationMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  requiresConfirmation?: boolean;
  actionPlan?: TaskOperationPlan[];
}

// Interface for AI conversation context
export interface AIConversationContext {
  sessionId: string;
  userId: string;
  lastInteraction: Date;
  contextData?: any;
}