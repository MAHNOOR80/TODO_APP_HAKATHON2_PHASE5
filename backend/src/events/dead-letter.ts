import { getLogger } from '../config/logger.config';
import { TaskEvent } from './event-types';

export const DLQ_TOPIC_NAME = 'tasks-lifecycle-dlq';

export async function handleDeadLetter(
  event: TaskEvent,
  error: unknown
): Promise<void> {
  const log = getLogger();
  log.error(
    {
      eventType: event.eventType,
      taskId: event.taskId,
      userId: event.userId,
      correlationId: event.correlationId,
      timestamp: event.timestamp,
      error,
    },
    'Dead letter: event failed processing after retries'
  );
}
