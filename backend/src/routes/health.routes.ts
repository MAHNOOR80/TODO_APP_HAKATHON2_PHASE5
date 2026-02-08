/**
 * Health Routes
 * Kubernetes liveness and readiness probe endpoints
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import { Router } from 'express';
import { healthCheck, readinessCheck } from '../controllers/health.controller';

const router = Router();

/**
 * GET /health
 * Liveness probe - is the service process running?
 * Used by Kubernetes to determine if pod should be restarted
 */
router.get('/health', healthCheck);

/**
 * GET /ready
 * Readiness probe - can the service handle requests?
 * Used by Kubernetes to determine if pod should receive traffic
 */
router.get('/ready', readinessCheck);

export default router;
