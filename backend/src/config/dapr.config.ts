import { DaprClient } from '@dapr/dapr';

export const DAPR_HOST = process.env['DAPR_HOST'] || 'localhost';
export const DAPR_HTTP_PORT = process.env['DAPR_HTTP_PORT'] || '3500';
export const PUBSUB_NAME = process.env['DAPR_PUBSUB_NAME'] || 'pubsub-kafka';
export const TOPIC_NAME = 'tasks-lifecycle';

let daprClient: DaprClient | null = null;

export function getDaprClient(): DaprClient {
  if (!daprClient) {
    daprClient = new DaprClient({
      daprHost: DAPR_HOST,
      daprPort: DAPR_HTTP_PORT,
    });
  }
  return daprClient;
}
