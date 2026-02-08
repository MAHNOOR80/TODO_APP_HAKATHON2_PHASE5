/**
 * Overdue Task Agent
 * Monitors tasks for overdue status and creates reminder suggestions
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import { getPrismaClient } from '../config/database.config';
import { logger } from '../config/logger.config';
import { createSuggestion } from '../services/suggestion-api.service';
import { checkRateLimit } from '../utils/rate-limiter';
import { TaskCreatedEvent, TaskCompletedEvent } from '../events/event-types';

const prisma = getPrismaClient();

// Configuration
const BATCH_SIZE = 100;
const OVERDUE_THRESHOLD_DAYS = 0; // Tasks are overdue if past due date

/**
 * Run the overdue task agent
 * Finds overdue tasks and creates suggestions for users with agents enabled
 */
export async function runOverdueAgent(): Promise<void> {
  const startTime = Date.now();
  logger.info('Starting overdue agent run');

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
    logger.info({ userCount: userIds.length }, 'Found users with agents enabled');

    let totalSuggestions = 0;
    let processedTasks = 0;

    // Process users in batches
    for (const userId of userIds) {
      // Check rate limit for this user
      if (!await checkRateLimit(userId)) {
        logger.debug({ userId }, 'Rate limit reached for user, skipping');
        continue;
      }

      // Find overdue tasks for this user
      const overdueTasks = await prisma.task.findMany({
        where: {
          userId,
          completed: false,
          dueDate: {
            lt: new Date(),
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

      if (overdueTasks.length === 0) {
        continue;
      }

      logger.debug({ userId, taskCount: overdueTasks.length }, 'Found overdue tasks');

      // Create suggestions for overdue tasks
      for (const task of overdueTasks) {
        processedTasks++;

        const daysOverdue = Math.floor(
          (Date.now() - task.dueDate!.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Only suggest for tasks at least 1 day overdue
        if (daysOverdue < 1) {
          continue;
        }

        const message =
          daysOverdue === 1
            ? `Task "${task.title}" is 1 day overdue. Consider updating its due date or marking it complete.`
            : `Task "${task.title}" is ${daysOverdue} days overdue. Consider updating its due date or marking it complete.`;

        const created = await createSuggestion({
          userId,
          taskId: task.id,
          suggestionType: 'overdue_reminder',
          message,
          metadata: {
            daysOverdue,
            taskTitle: task.title,
            taskPriority: task.priority,
            dueDate: task.dueDate?.toISOString(),
          },
        });

        if (created) {
          totalSuggestions++;
        }
      }
    }

    const duration = Date.now() - startTime;
    logger.info(
      {
        duration,
        processedTasks,
        suggestionsCreated: totalSuggestions,
        usersProcessed: userIds.length,
      },
      'Overdue agent run completed'
    );
  } catch (error) {
    logger.error({ error }, 'Overdue agent run failed');
    throw error;
  }
}

/**
 * Event handler: React to tasks.created events
 * Creates overdue suggestion immediately if task is already past due
 */
export async function handleTaskCreatedEvent(event: TaskCreatedEvent): Promise<void> {
  const log = logger.child({
    handler: 'handleTaskCreatedEvent',
    taskId: event.taskId,
    userId: event.userId,
    correlationId: event.correlationId,
  });

  // Only process tasks with a due date that is in the past
  if (!event.dueDate) {
    log.debug('Task has no due date, skipping');
    return;
  }

  const dueDate = new Date(event.dueDate);
  if (dueDate >= new Date()) {
    log.debug('Task is not overdue, skipping');
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

  // Deduplication: check for existing overdue_reminder for this task within 1 hour
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  const existingCount = await prisma.agentSuggestion.count({
    where: {
      userId: event.userId,
      taskId: event.taskId,
      suggestionType: 'overdue_reminder',
      createdAt: { gte: oneHourAgo },
    },
  });

  if (existingCount > 0) {
    log.debug('Duplicate overdue suggestion exists within 1 hour, skipping');
    return;
  }

  const daysOverdue = Math.floor(
    (Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const message =
    daysOverdue <= 1
      ? `Task "${event.title}" is overdue. Consider updating its due date or marking it complete.`
      : `Task "${event.title}" is ${daysOverdue} days overdue. Consider updating its due date or marking it complete.`;

  const created = await createSuggestion({
    userId: event.userId,
    taskId: event.taskId,
    suggestionType: 'overdue_reminder',
    message,
    metadata: {
      daysOverdue,
      taskTitle: event.title,
      taskPriority: event.priority,
      dueDate: event.dueDate,
      correlationId: event.correlationId,
      sourceEvent: event.eventType,
    },
    sourceEvent: event.eventType,
    correlationId: event.correlationId,
  });

  log.info(
    { outcome: created ? 'suggestion_created' : 'skipped', daysOverdue },
    'handleTaskCreatedEvent completed'
  );
}

/**
 * Event handler: React to tasks.completed events
 * Dismisses existing overdue_reminder suggestions for the completed task
 */
export async function handleTaskCompletedEvent(event: TaskCompletedEvent): Promise<void> {
  const log = logger.child({
    handler: 'handleTaskCompletedEvent',
    taskId: event.taskId,
    userId: event.userId,
    correlationId: event.correlationId,
  });

  try {
    const result = await prisma.agentSuggestion.updateMany({
      where: {
        taskId: event.taskId,
        userId: event.userId,
        suggestionType: 'overdue_reminder',
        dismissed: false,
      },
      data: {
        dismissed: true,
      },
    });

    log.info(
      { dismissedCount: result.count, outcome: result.count > 0 ? 'suggestions_dismissed' : 'no_suggestions_to_dismiss' },
      'handleTaskCompletedEvent completed'
    );
  } catch (error) {
    log.error({ error }, 'Failed to dismiss overdue suggestions');
    throw error;
  }
}
