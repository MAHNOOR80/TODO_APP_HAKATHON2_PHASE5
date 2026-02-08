/**
 * Health Controller
 * Handles /health and /ready endpoint requests
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import { Request, Response } from 'express';
import {
  getLivenessStatus,
  getReadinessStatus,
  HealthCheck,
  ReadinessCheck,
} from '../services/health.service';

/**
 * GET /health
 * Liveness probe endpoint - returns 200 if process is running
 */
export async function healthCheck(req: Request, res: Response): Promise<void> {
  try {
    const status: HealthCheck = await getLivenessStatus();

    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.status(200).json(status);
  } catch (error) {
    // Even if something goes wrong, return unhealthy status
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.status(500).json({
      status: 'unhealthy',
      service: process.env['SERVICE_NAME'] || 'backend',
      version: process.env['npm_package_version'] || '1.0.0',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * GET /ready
 * Readiness probe endpoint - returns 200 if service can handle requests
 */
export async function readinessCheck(req: Request, res: Response): Promise<void> {
  try {
    const status: ReadinessCheck = await getReadinessStatus();

    res.setHeader('Cache-Control', 'no-cache, no-store');

    if (status.status === 'ready') {
      res.status(200).json(status);
    } else {
      // 503 Service Unavailable - pod not ready to receive traffic
      res.status(503).json(status);
    }
  } catch (error) {
    // Return not ready on any error
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.status(503).json({
      status: 'not ready',
      service: process.env['SERVICE_NAME'] || 'backend',
      checks: {
        database: 'disconnected',
        memory: 'ok',
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
