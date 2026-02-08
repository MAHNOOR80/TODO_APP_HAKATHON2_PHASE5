/**
 * Event Subscriber Router
 * Dapr subscription endpoints and event dispatch
 * Phase 5: Reactive AI Agents
 */

import { Router, Request, Response } from 'express';
import { logger } from '../config/logger.config';
import { TaskEvent, TaskEventType } from './event-types';
import { EventHandlerSkill } from './event-handler-skill';

const eventHandlerSkill = new EventHandlerSkill();

/**
 * Register a handler for a specific event type
 * Handlers accept any TaskEvent subtype — the caller is responsible
 * for matching the eventType to the correct handler signature.
 */
export function registerHandler(
  eventType: TaskEventType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (event: any) => Promise<void>
): void {
  eventHandlerSkill.on(eventType, handler);
}

/**
 * Create Express router with Dapr subscription endpoints
 */
export function createSubscriptionRouter(): Router {
  const router = Router();

  // Dapr subscription registration endpoint
  router.get('/dapr/subscribe', (_req: Request, res: Response) => {
    res.json([
      {
        pubsubname: 'pubsub-kafka',
        topic: 'tasks-lifecycle',
        route: '/events/tasks-lifecycle',
      },
    ]);
  });

  // Event handler endpoint - receives events from Dapr sidecar
  router.post('/events/tasks-lifecycle', async (req: Request, res: Response) => {
    const event = req.body?.data as TaskEvent;

    if (!event || !event.eventType) {
      logger.warn({ body: req.body }, 'Received invalid event payload');
      res.json({ status: 'DROP' });
      return;
    }

    const log = logger.child({
      eventType: event.eventType,
      taskId: event.taskId,
      userId: event.userId,
      correlationId: event.correlationId,
    });

    log.info('Event received from Dapr');

    try {
      await eventHandlerSkill.dispatch(event);
      res.json({ status: 'SUCCESS' });
    } catch (error) {
      log.error({ error }, 'Event processing failed, requesting retry');
      res.json({ status: 'RETRY' });
    }
  });

  return router;
}
