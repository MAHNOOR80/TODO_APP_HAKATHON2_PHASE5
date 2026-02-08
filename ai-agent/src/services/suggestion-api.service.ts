/**
 * Suggestion API Service
 * Calls backend API to create suggestions
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import { Prisma } from '@prisma/client';
import { getPrismaClient } from '../config/database.config';
import { logger } from '../config/logger.config';

const prisma = getPrismaClient();

// Suggestion type enum matching backend
export type SuggestionType =
  | 'overdue_reminder'
  | 'prioritization'
  | 'schedule_adjustment'
  | 'neglected_task'
  | 'general_insight';

export interface CreateSuggestionInput {
  userId: string;
  taskId?: string;
  suggestionType: SuggestionType;
  message: string;
  metadata?: Record<string, unknown>;
  expiresAt?: Date;
  sourceEvent?: string;
  correlationId?: string;
}

// Rate limiting constants
const MAX_SUGGESTIONS_PER_HOUR = 10;
const DUPLICATE_CHECK_HOURS = 24;

/**
 * Create a suggestion via direct database access
 * In a full microservices setup, this would call the backend API
 * For simplicity, we use direct database access with the same logic
 */
export async function createSuggestion(
  input: CreateSuggestionInput
): Promise<boolean> {
  const log = logger.child({
    userId: input.userId,
    suggestionType: input.suggestionType,
    taskId: input.taskId,
  });

  try {
    // Check rate limit
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const recentCount = await prisma.agentSuggestion.count({
      where: {
        userId: input.userId,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentCount >= MAX_SUGGESTIONS_PER_HOUR) {
      log.warn({ recentCount }, 'Rate limit exceeded for suggestions');
      return false;
    }

    // Check for duplicate suggestion
    const duplicateCheckDate = new Date();
    duplicateCheckDate.setHours(duplicateCheckDate.getHours() - DUPLICATE_CHECK_HOURS);

    const existingCount = await prisma.agentSuggestion.count({
      where: {
        userId: input.userId,
        taskId: input.taskId || null,
        suggestionType: input.suggestionType,
        createdAt: { gte: duplicateCheckDate },
      },
    });

    if (existingCount > 0) {
      log.debug('Duplicate suggestion already exists, skipping');
      return false;
    }

    // Calculate expiration (default 7 days)
    const expiresAt = input.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Create the suggestion
    const suggestion = await prisma.agentSuggestion.create({
      data: {
        userId: input.userId,
        taskId: input.taskId || null,
        suggestionType: input.suggestionType,
        message: input.message,
        metadata: (input.metadata || {}) as Prisma.InputJsonValue,
        expiresAt,
        sourceEvent: input.sourceEvent || null,
        correlationId: input.correlationId || null,
      },
    });

    log.info({ suggestionId: suggestion.id }, 'Suggestion created successfully');
    return true;
  } catch (error) {
    log.error({ error }, 'Failed to create suggestion');
    return false;
  }
}

/**
 * Count suggestions created in the last hour for rate limiting
 */
export async function countRecentSuggestions(
  userId: string,
  hoursAgo: number = 1
): Promise<number> {
  const since = new Date();
  since.setHours(since.getHours() - hoursAgo);

  return prisma.agentSuggestion.count({
    where: {
      userId,
      createdAt: { gte: since },
    },
  });
}
