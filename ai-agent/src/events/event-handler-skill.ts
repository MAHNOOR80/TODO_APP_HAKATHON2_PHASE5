/**
 * EventHandlerSkill - Reusable event dispatch system
 * Allows registering multiple handlers per event type
 * Phase 5: Reactive AI Agents
 */

import { logger } from '../config/logger.config';
import { TaskEvent } from './event-types';

type EventHandler = (event: TaskEvent) => Promise<void>;

export class EventHandlerSkill {
  private handlers = new Map<string, EventHandler[]>();

  on(eventType: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) || [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
    logger.info({ eventType, handlerCount: existing.length }, 'Event handler registered');
  }

  async dispatch(event: TaskEvent): Promise<void> {
    const startTime = Date.now();
    const handlers = this.handlers.get(event.eventType) || [];

    if (handlers.length === 0) {
      logger.debug(
        { eventType: event.eventType, taskId: event.taskId },
        'No handlers registered for event type'
      );
      return;
    }

    const results = await Promise.allSettled(
      handlers.map((h) => h(event))
    );

    const processingDurationMs = Date.now() - startTime;
    const failures = results.filter((r) => r.status === 'rejected');

    if (failures.length > 0) {
      logger.error(
        {
          eventType: event.eventType,
          taskId: event.taskId,
          userId: event.userId,
          correlationId: event.correlationId,
          processingDurationMs,
          outcome: 'partial_failure',
          totalHandlers: handlers.length,
          failedHandlers: failures.length,
          errors: failures.map((f) => (f as PromiseRejectedResult).reason?.message || String((f as PromiseRejectedResult).reason)),
        },
        'Some event handlers failed'
      );
    } else {
      logger.info(
        {
          eventType: event.eventType,
          taskId: event.taskId,
          userId: event.userId,
          correlationId: event.correlationId,
          processingDurationMs,
          outcome: 'success',
          handlersExecuted: handlers.length,
        },
        'Event dispatched successfully'
      );
    }
  }

  getHandlerCount(eventType: string): number {
    return (this.handlers.get(eventType) || []).length;
  }
}
