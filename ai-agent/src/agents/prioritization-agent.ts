/**
 * Prioritization Agent
 * Analyzes task priorities and suggests adjustments
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import { getPrismaClient } from '../config/database.config';
import { logger } from '../config/logger.config';
import { createSuggestion } from '../services/suggestion-api.service';
import { checkRateLimit } from '../utils/rate-limiter';
import { TaskUpdatedEvent } from '../events/event-types';

const prisma = getPrismaClient();

// Configuration
const BATCH_SIZE = 100;
const URGENT_THRESHOLD_DAYS = 2; // Tasks due within 2 days should be high priority
const NEGLECTED_THRESHOLD_DAYS = 14; // Tasks not updated for 14 days

/**
 * Run the prioritization agent
 * Analyzes tasks and suggests priority adjustments
 */
export async function runPrioritizationAgent(): Promise<void> {
  const startTime = Date.now();
  logger.info('Starting prioritization agent run');

  try {
    // Get users with autonomous agents enabled
    const usersWithAgents = await prisma.user.findMany({
      where: { autonomousAgentsEnabled: true },
      select: { id: true },
    });

    if (usersWithAgents.length === 0) {
      logger.info('No users with autonomous agents enabled');
      return;
    }

    const userIds = usersWithAgents.map((u) => u.id);
    let totalSuggestions = 0;
    let processedTasks = 0;

    for (const userId of userIds) {
      // Check rate limit
      if (!await checkRateLimit(userId)) {
        logger.debug({ userId }, 'Rate limit reached for user, skipping');
        continue;
      }

      // Find tasks that might need priority adjustment
      await processPriorityUpgrades(userId, processedTasks, totalSuggestions);
      await processNeglectedTasks(userId, processedTasks, totalSuggestions);
    }

    const duration = Date.now() - startTime;
    logger.info(
      {
        duration,
        processedTasks,
        suggestionsCreated: totalSuggestions,
        usersProcessed: userIds.length,
      },
      'Prioritization agent run completed'
    );
  } catch (error) {
    logger.error({ error }, 'Prioritization agent run failed');
    throw error;
  }
}

/**
 * Find tasks due soon with low priority and suggest upgrades
 */
async function processPriorityUpgrades(
  userId: string,
  processedTasks: number,
  totalSuggestions: number
): Promise<void> {
  const urgentDate = new Date();
  urgentDate.setDate(urgentDate.getDate() + URGENT_THRESHOLD_DAYS);

  // Find low/medium priority tasks due soon
  const tasksDueSoon = await prisma.task.findMany({
    where: {
      userId,
      completed: false,
      dueDate: {
        gte: new Date(),
        lte: urgentDate,
      },
      priority: {
        in: ['low', 'medium'],
      },
    },
    select: {
      id: true,
      title: true,
      dueDate: true,
      priority: true,
    },
    take: BATCH_SIZE,
    orderBy: { dueDate: 'asc' },
  });

  for (const task of tasksDueSoon) {
    processedTasks++;

    const daysUntilDue = Math.ceil(
      (task.dueDate!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    const message = `Task "${task.title}" is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''} but has ${task.priority} priority. Consider increasing its priority.`;

    const created = await createSuggestion({
      userId,
      taskId: task.id,
      suggestionType: 'prioritization',
      message,
      metadata: {
        taskTitle: task.title,
        currentPriority: task.priority,
        suggestedPriority: 'high',
        daysUntilDue,
        reason: 'due_soon',
      },
    });

    if (created) {
      totalSuggestions++;
    }
  }
}

/**
 * Find tasks that haven't been updated in a while
 */
async function processNeglectedTasks(
  userId: string,
  processedTasks: number,
  totalSuggestions: number
): Promise<void> {
  const neglectedDate = new Date();
  neglectedDate.setDate(neglectedDate.getDate() - NEGLECTED_THRESHOLD_DAYS);

  // Find incomplete tasks not updated recently
  const neglectedTasks = await prisma.task.findMany({
    where: {
      userId,
      completed: false,
      updatedAt: {
        lt: neglectedDate,
      },
    },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      priority: true,
    },
    take: BATCH_SIZE,
    orderBy: { updatedAt: 'asc' },
  });

  for (const task of neglectedTasks) {
    processedTasks++;

    const daysSinceUpdate = Math.floor(
      (Date.now() - task.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const message = `Task "${task.title}" hasn't been updated in ${daysSinceUpdate} days. Is it still relevant?`;

    const created = await createSuggestion({
      userId,
      taskId: task.id,
      suggestionType: 'neglected_task',
      message,
      metadata: {
        taskTitle: task.title,
        daysSinceUpdate,
        lastUpdated: task.updatedAt.toISOString(),
      },
    });

    if (created) {
      totalSuggestions++;
    }
  }
}

/**
 * Event handler: React to tasks.updated events
 * When priority changes to high, check if user has multiple high-priority tasks due this week
 */
export async function handleTaskUpdatedEvent(event: TaskUpdatedEvent): Promise<void> {
  const log = logger.child({
    handler: 'handleTaskUpdatedEvent',
    taskId: event.taskId,
    userId: event.userId,
    correlationId: event.correlationId,
  });

  // Only react to priority changes
  if (!event.changes || !('priority' in event.changes)) {
    log.debug('No priority change in event, skipping');
    return;
  }

  const newPriority = event.changes.priority as string;
  if (newPriority !== 'high') {
    log.debug({ newPriority }, 'Priority not changed to high, skipping');
    return;
  }

  // Check user has autonomous agents enabled
  const user = await prisma.user.findUnique({
    where: { id: event.userId },
    select: { autonomousAgentsEnabled: true },
  });

  if (!user?.autonomousAgentsEnabled) {
    log.debug('User does not have autonomous agents enabled, skipping');
    return;
  }

  // Check rate limit
  if (!await checkRateLimit(event.userId)) {
    log.debug('Rate limit reached for user, skipping');
    return;
  }

  // Count high-priority tasks due this week
  const endOfWeek = new Date();
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);

  const highPriorityCount = await prisma.task.count({
    where: {
      userId: event.userId,
      completed: false,
      priority: 'high',
      dueDate: {
        lte: endOfWeek,
      },
    },
  });

  if (highPriorityCount < 3) {
    log.debug(
      { highPriorityCount },
      'Less than 3 high-priority tasks this week, no suggestion needed'
    );
    return;
  }

  // Deduplication: check for existing prioritization suggestion within 1 hour
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  const existingCount = await prisma.agentSuggestion.count({
    where: {
      userId: event.userId,
      suggestionType: 'prioritization',
      createdAt: { gte: oneHourAgo },
      message: { contains: 'high-priority tasks due this week' },
    },
  });

  if (existingCount > 0) {
    log.debug('Duplicate prioritization suggestion exists within 1 hour, skipping');
    return;
  }

  const message = `You now have ${highPriorityCount} high-priority tasks due this week. Consider reviewing and re-prioritizing to avoid overload.`;

  const created = await createSuggestion({
    userId: event.userId,
    taskId: event.taskId,
    suggestionType: 'prioritization',
    message,
    metadata: {
      highPriorityCount,
      trigger: 'priority_change_event',
      correlationId: event.correlationId,
      sourceEvent: event.eventType,
    },
    sourceEvent: event.eventType,
    correlationId: event.correlationId,
  });

  log.info(
    { outcome: created ? 'suggestion_created' : 'skipped', highPriorityCount },
    'handleTaskUpdatedEvent completed'
  );
}
