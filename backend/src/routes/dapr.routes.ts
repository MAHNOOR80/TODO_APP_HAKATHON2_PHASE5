import { Router, Request, Response } from 'express';
import { getLogger } from '../config/logger.config';

const router = Router();

// Dapr subscription registration endpoint
router.get('/dapr/subscribe', (_req: Request, res: Response) => {
  res.json([
    {
      pubsubname: 'pubsub-kafka',
      topic: 'tasks-lifecycle',
      route: '/api/events/tasks-lifecycle',
    },
  ]);
});

// Placeholder for future backend-side event subscriptions
router.post(
  '/api/events/tasks-lifecycle',
  (req: Request, res: Response) => {
    const log = getLogger();
    log.info(
      { event: req.body?.data?.eventType },
      'Backend received event (placeholder)'
    );
    res.json({ status: 'SUCCESS' });
  }
);

export default router;
