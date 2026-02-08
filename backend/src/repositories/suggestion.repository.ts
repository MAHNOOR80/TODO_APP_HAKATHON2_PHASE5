/**
 * Suggestion Repository
 * Database operations for agent_suggestions table
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import { getPrismaClient, Prisma } from '../config/database.config';
import {
  AgentSuggestion,
  CreateSuggestionInput,
  SuggestionType,
  SuggestionQueryParams,
} from '../models/agent-suggestion.model';

const prisma = getPrismaClient();

/**
 * Create a new suggestion
 */
export async function createSuggestion(
  input: CreateSuggestionInput
): Promise<AgentSuggestion> {
  const suggestion = await prisma.agentSuggestion.create({
    data: {
      userId: input.userId,
      taskId: input.taskId || null,
      suggestionType: input.suggestionType,
      message: input.message,
      metadata: (input.metadata || Prisma.JsonNull) as any,
      expiresAt: input.expiresAt || null,
    },
  });

  return mapToModel(suggestion);
}

/**
 * Get suggestion by ID
 */
export async function getSuggestionById(
  id: string
): Promise<AgentSuggestion | null> {
  const suggestion = await prisma.agentSuggestion.findUnique({
    where: { id },
  });

  return suggestion ? mapToModel(suggestion) : null;
}

/**
 * Get suggestions for a user with optional filters
 */
export async function getSuggestionsForUser(
  userId: string,
  params: SuggestionQueryParams = {}
): Promise<{ suggestions: AgentSuggestion[]; total: number }> {
  const {
    limit = 20,
    offset = 0,
    type,
    dismissed = false,
  } = params;

  const where: any = {
    userId,
    dismissed,
  };

  // Filter by type if specified
  if (type) {
    where.suggestionType = type;
  }

  // Exclude expired suggestions
  where.OR = [
    { expiresAt: null },
    { expiresAt: { gt: new Date() } },
  ];

  const [suggestions, total] = await Promise.all([
    prisma.agentSuggestion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            dueDate: true,
            priority: true,
            completed: true,
          },
        },
      },
    }),
    prisma.agentSuggestion.count({ where }),
  ]);

  return {
    suggestions: suggestions.map(mapToModel),
    total,
  };
}

/**
 * Dismiss a suggestion
 */
export async function dismissSuggestion(
  id: string,
  userId: string
): Promise<AgentSuggestion | null> {
  const suggestion = await prisma.agentSuggestion.updateMany({
    where: { id, userId },
    data: { dismissed: true },
  });

  if (suggestion.count === 0) {
    return null;
  }

  return getSuggestionById(id);
}

/**
 * Delete a suggestion
 */
export async function deleteSuggestion(
  id: string,
  userId: string
): Promise<boolean> {
  const result = await prisma.agentSuggestion.deleteMany({
    where: { id, userId },
  });

  return result.count > 0;
}

/**
 * Get suggestion counts by type for a user
 */
export async function getSuggestionCounts(
  userId: string
): Promise<{ total: number; byType: Record<SuggestionType, number> }> {
  const counts = await prisma.agentSuggestion.groupBy({
    by: ['suggestionType'],
    where: {
      userId,
      dismissed: false,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    _count: true,
  });

  const byType: Record<SuggestionType, number> = {
    overdue_reminder: 0,
    prioritization: 0,
    schedule_adjustment: 0,
    neglected_task: 0,
    general_insight: 0,
  };

  let total = 0;
  for (const count of counts) {
    byType[count.suggestionType as SuggestionType] = count._count;
    total += count._count;
  }

  return { total, byType };
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

/**
 * Check if a similar suggestion already exists
 */
export async function suggestionExists(
  userId: string,
  taskId: string | null,
  suggestionType: SuggestionType,
  hoursAgo: number = 24
): Promise<boolean> {
  const since = new Date();
  since.setHours(since.getHours() - hoursAgo);

  const count = await prisma.agentSuggestion.count({
    where: {
      userId,
      taskId,
      suggestionType,
      createdAt: { gte: since },
    },
  });

  return count > 0;
}

/**
 * Clean up expired and old dismissed suggestions
 */
export async function cleanupOldSuggestions(
  daysOld: number = 30
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.agentSuggestion.deleteMany({
    where: {
      OR: [
        // Expired suggestions
        { expiresAt: { lt: new Date() } },
        // Old dismissed suggestions
        {
          dismissed: true,
          createdAt: { lt: cutoffDate },
        },
      ],
    },
  });

  return result.count;
}

/**
 * Map Prisma model to domain model
 */
function mapToModel(suggestion: any): AgentSuggestion {
  return {
    id: suggestion.id,
    userId: suggestion.userId,
    taskId: suggestion.taskId,
    suggestionType: suggestion.suggestionType as SuggestionType,
    message: suggestion.message,
    metadata: suggestion.metadata as Record<string, unknown>,
    dismissed: suggestion.dismissed,
    createdAt: suggestion.createdAt,
    expiresAt: suggestion.expiresAt,
  };
}
