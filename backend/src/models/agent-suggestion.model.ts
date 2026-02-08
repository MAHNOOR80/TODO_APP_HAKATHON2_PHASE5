/**
 * Agent Suggestion Model Interface
 * Represents autonomous agent recommendations for users
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

// Suggestion types matching the Prisma enum
export type SuggestionType =
  | 'overdue_reminder'
  | 'prioritization'
  | 'schedule_adjustment'
  | 'neglected_task'
  | 'general_insight';

export interface AgentSuggestion {
  id: string;
  userId: string;
  taskId: string | null;
  suggestionType: SuggestionType;
  message: string;
  metadata: Record<string, unknown>;
  dismissed: boolean;
  createdAt: Date;
  expiresAt: Date | null;
}

export interface CreateSuggestionInput {
  userId: string;
  taskId?: string;
  suggestionType: SuggestionType;
  message: string;
  metadata?: Record<string, unknown>;
  expiresAt?: Date;
}

export interface UpdateSuggestionInput {
  dismissed?: boolean;
  metadata?: Record<string, unknown>;
}

// Task summary included in suggestion responses
export interface TaskSummary {
  id: string;
  title: string;
  dueDate: string | null;
  priority: string;
  completed: boolean;
}

export interface SuggestionResponse {
  id: string;
  taskId: string | null;
  suggestionType: SuggestionType;
  message: string;
  metadata: Record<string, unknown>;
  dismissed: boolean;
  createdAt: string;
  expiresAt: string | null;
  task?: TaskSummary;
}

export interface SuggestionListResponse {
  suggestions: SuggestionResponse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface SuggestionCountResponse {
  count: number;
  byType: Record<SuggestionType, number>;
}

export interface DismissResponse {
  id: string;
  dismissed: boolean;
  dismissedAt: string;
}

// Query parameters for listing suggestions
export interface SuggestionQueryParams {
  limit?: number;
  offset?: number;
  type?: SuggestionType;
  dismissed?: boolean;
}

/**
 * Convert AgentSuggestion model to API response format
 */
export function toSuggestionResponse(
  suggestion: AgentSuggestion,
  task?: TaskSummary
): SuggestionResponse {
  return {
    id: suggestion.id,
    taskId: suggestion.taskId,
    suggestionType: suggestion.suggestionType,
    message: suggestion.message,
    metadata: suggestion.metadata,
    dismissed: suggestion.dismissed,
    createdAt: suggestion.createdAt.toISOString(),
    expiresAt: suggestion.expiresAt?.toISOString() ?? null,
    ...(task && { task }),
  };
}

/**
 * Validate suggestion type
 */
export function isValidSuggestionType(type: string): type is SuggestionType {
  return [
    'overdue_reminder',
    'prioritization',
    'schedule_adjustment',
    'neglected_task',
    'general_insight',
  ].includes(type);
}

/**
 * Check if suggestion type requires a task reference
 */
export function requiresTask(type: SuggestionType): boolean {
  return type !== 'general_insight';
}

/**
 * Suggestion type display names for UI
 */
export const SUGGESTION_TYPE_LABELS: Record<SuggestionType, string> = {
  overdue_reminder: 'Overdue Reminder',
  prioritization: 'Priority Suggestion',
  schedule_adjustment: 'Schedule Adjustment',
  neglected_task: 'Neglected Task',
  general_insight: 'Productivity Insight',
};
