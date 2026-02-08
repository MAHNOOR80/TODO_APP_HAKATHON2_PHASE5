import { TaskEvent } from './event-types';
import { getLogger } from '../config/logger.config';
import { getDaprClient, PUBSUB_NAME, TOPIC_NAME } from '../config/dapr.config';

export async function publishEvent(event: TaskEvent): Promise<void> {
  const log = getLogger();
  try {
    const client = getDaprClient();
    await client.pubsub.publish(PUBSUB_NAME, TOPIC_NAME, event);
    log.info(
      {
        eventType: event.eventType,
        taskId: event.taskId,
        correlationId: event.correlationId,
      },
      'Event published'
    );
  } catch (error) {
    log.error(
      {
        error,
        eventType: event.eventType,
        taskId: event.taskId,
        correlationId: event.correlationId,
      },
      'Failed to publish event (fire-and-forget)'
    );
    // Do NOT throw — fire-and-forget
  }
}
