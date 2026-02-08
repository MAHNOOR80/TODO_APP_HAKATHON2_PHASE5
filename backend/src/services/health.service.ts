/**
 * Health Service
 * Provides health and readiness checks for Kubernetes probes
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import { getDatabaseStatus, DatabaseStatus } from '../config/database.config';

export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  service: string;
  version: string;
  timestamp: string;
}

export interface ReadinessCheck {
  status: 'ready' | 'not ready';
  service: string;
  checks: {
    database: 'connected' | 'disconnected';
    memory: 'ok' | 'high';
  };
  details?: {
    databaseLatencyMs?: number;
    memoryUsageMB?: number;
    memoryLimitMB?: number;
  };
  timestamp: string;
}

const SERVICE_NAME = process.env['SERVICE_NAME'] || 'backend';
const SERVICE_VERSION = process.env['npm_package_version'] || '1.0.0';

// Memory threshold for health warning (80% of available)
const MEMORY_THRESHOLD_PERCENT = 80;

/**
 * Liveness check - is the process running?
 * Should be fast and not check external dependencies
 */
export async function getLivenessStatus(): Promise<HealthCheck> {
  return {
    status: 'healthy',
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get memory usage statistics
 */
function getMemoryStatus(): { ok: boolean; usageMB: number; limitMB: number } {
  const memUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);

  // Check if memory usage exceeds threshold
  const usagePercent = (heapUsedMB / heapTotalMB) * 100;
  const ok = usagePercent < MEMORY_THRESHOLD_PERCENT;

  return {
    ok,
    usageMB: heapUsedMB,
    limitMB: heapTotalMB,
  };
}

/**
 * Readiness check - can the service handle requests?
 * Checks external dependencies like database
 */
export async function getReadinessStatus(): Promise<ReadinessCheck> {
  // Check database connectivity
  const dbStatus: DatabaseStatus = await getDatabaseStatus();

  // Check memory usage
  const memStatus = getMemoryStatus();

  // Determine overall readiness
  const isReady = dbStatus.connected && memStatus.ok;

  return {
    status: isReady ? 'ready' : 'not ready',
    service: SERVICE_NAME,
    checks: {
      database: dbStatus.connected ? 'connected' : 'disconnected',
      memory: memStatus.ok ? 'ok' : 'high',
    },
    details: {
      databaseLatencyMs: dbStatus.latencyMs,
      memoryUsageMB: memStatus.usageMB,
      memoryLimitMB: memStatus.limitMB,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check if service is ready (simplified boolean check)
 */
export async function isServiceReady(): Promise<boolean> {
  const status = await getReadinessStatus();
  return status.status === 'ready';
}
