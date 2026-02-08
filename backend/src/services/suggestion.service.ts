/**
 * Suggestion Service
 * Business logic for agent suggestions
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import {
  AgentSuggestion,
  CreateSuggestionInput,
  SuggestionType,
  SuggestionQueryParams,
} from '../models/agent-suggestion.model';
import * as suggestionRepository from '../repositories/suggestion.repository';
import { logger } from '../config/logger.config';

// Rate limiting constants
const MAX_SUGGESTIONS_PER_HOUR = 10;
const DUPLICATE_CHECK_HOURS = 24;

/**
 * Create a new suggestion with rate limiting and duplicate checks
 */
export async function createSuggestion(
  input: CreateSuggestionInput
): Promise<AgentSuggestion | null> {
  const log = logger.child({ userId: input.userId, suggestionType: input.suggestionType });

  // Check rate limit
  const recentCount = await suggestionRepository.countRecentSuggestions(input.userId, 1);
  if (recentCount >= MAX_SUGGESTIONS_PER_HOUR) {
    log.warn({ recentCount }, 'Rate limit exceeded for suggestions');
    return null;
  }

  // Check for duplicate suggestion
  const exists = await suggestionRepository.suggestionExists(
    input.userId,
    input.taskId || null,
    input.suggestionType,
    DUPLICATE_CHECK_HOURS
  );

  if (exists) {
    log.debug('Duplicate suggestion already exists, skipping');
    return null;
  }

  const suggestion = await suggestionRepository.createSuggestion(input);
  log.info({ suggestionId: suggestion.id }, 'Suggestion created successfully');

  return suggestion;
}

/**
 * Get suggestion by ID
 */
export async function getSuggestionById(
  id: string,
  userId: string
): Promise<AgentSuggestion | null> {
  const suggestion = await suggestionRepository.getSuggestionById(id);

  // Ensure user can only access their own suggestions
  if (suggestion && suggestion.userId !== userId) {
    return null;
  }

  return suggestion;
}

/**
 * Get suggestions for a user with optional filters
 */
export async function getSuggestionsForUser(
  userId: string,
  params: SuggestionQueryParams = {}
): Promise<{ suggestions: AgentSuggestion[]; total: number }> {
  return suggestionRepository.getSuggestionsForUser(userId, params);
}

/**
 * Dismiss a suggestion
 */
export async function dismissSuggestion(
  id: string,
  userId: string
): Promise<AgentSuggestion | null> {
  const suggestion = await suggestionRepository.dismissSuggestion(id, userId);

  if (suggestion) {
    logger.info({ suggestionId: id, userId }, 'Suggestion dismissed');
  }

  return suggestion;
}

/**
 * Delete a suggestion
 */
export async function deleteSuggestion(
  id: string,
  userId: string
): Promise<boolean> {
  const deleted = await suggestionRepository.deleteSuggestion(id, userId);

  if (deleted) {
    logger.info({ suggestionId: id, userId }, 'Suggestion deleted');
  }

  return deleted;
}

/**
 * Get suggestion counts by type for a user
 */
export async function getSuggestionCounts(
  userId: string
): Promise<{ total: number; byType: Record<SuggestionType, number> }> {
  return suggestionRepository.getSuggestionCounts(userId);
}

/**
 * Clean up old suggestions
 * Called by background job
 */
export async function cleanupOldSuggestions(daysOld: number = 30): Promise<number> {
  const count = await suggestionRepository.cleanupOldSuggestions(daysOld);

  if (count > 0) {
    logger.info({ count, daysOld }, 'Cleaned up old suggestions');
  }

  return count;
}

/**
 * Create overdue task reminder suggestion
 */
export async function createOverdueReminder(
  userId: string,
  taskId: string,
  taskTitle: string,
  daysOverdue: number
): Promise<AgentSuggestion | null> {
  const message = daysOverdue === 1
    ? `Task "${taskTitle}" is 1 day overdue. Consider updating its due date or marking it complete.`
    : `Task "${taskTitle}" is ${daysOverdue} days overdue. Consider updating its due date or marking it complete.`;

  return createSuggestion({
    userId,
    taskId,
    suggestionType: 'overdue_reminder',
    message,
    metadata: {
      daysOverdue,
      taskTitle,
    },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
  });
}

/**
 * Create prioritization suggestion
 */
export async function createPrioritizationSuggestion(
  userId: string,
  taskId: string,
  taskTitle: string,
  suggestedPriority: string,
  reason: string
): Promise<AgentSuggestion | null> {
  const message = `Consider changing "${taskTitle}" priority to ${suggestedPriority}. ${reason}`;

  return createSuggestion({
    userId,
    taskId,
    suggestionType: 'prioritization',
    message,
    metadata: {
      taskTitle,
      suggestedPriority,
      reason,
    },
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Expires in 3 days
  });
}

/**
 * Create neglected task suggestion
 */
export async function createNeglectedTaskSuggestion(
  userId: string,
  taskId: string,
  taskTitle: string,
  daysSinceUpdate: number
): Promise<AgentSuggestion | null> {
  const message = `Task "${taskTitle}" hasn't been updated in ${daysSinceUpdate} days. Is it still relevant?`;

  return createSuggestion({
    userId,
    taskId,
    suggestionType: 'neglected_task',
    message,
    metadata: {
      taskTitle,
      daysSinceUpdate,
    },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
  });
}

/**
 * Create general insight suggestion
 */
export async function createGeneralInsight(
  userId: string,
  message: string,
  metadata: Record<string, unknown> = {}
): Promise<AgentSuggestion | null> {
  return createSuggestion({
    userId,
    suggestionType: 'general_insight',
    message,
    metadata,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
  });
}
