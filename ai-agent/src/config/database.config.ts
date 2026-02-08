/**
 * Database Configuration for AI Agent
 * Prisma client with connection pooling and retry logic
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import { PrismaClient } from '@prisma/client';
import { logger } from './logger.config';

let prisma: PrismaClient | null = null;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Get Prisma client instance (singleton)
 */
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Log queries in development
    if (process.env.NODE_ENV !== 'production') {
      prisma.$on('query' as never, (e: any) => {
        logger.debug({ query: e.query, duration: e.duration }, 'Database query');
      });
    }

    prisma.$on('error' as never, (e: any) => {
      logger.error({ error: e }, 'Database error');
    });
  }

  return prisma;
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
    logger.info('Database disconnected');
  }
}

/**
 * Database status check
 */
export interface DatabaseStatus {
  connected: boolean;
  latencyMs?: number;
  error?: string;
}

/**
 * Check database connectivity with retry
 */
export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  const client = getPrismaClient();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const start = Date.now();
      await client.$queryRaw`SELECT 1`;
      const latencyMs = Date.now() - start;

      return {
        connected: true,
        latencyMs,
      };
    } catch (error) {
      logger.warn(
        { attempt, maxRetries: MAX_RETRIES, error },
        'Database connection attempt failed'
      );

      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * attempt));
      } else {
        return {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  }

  return { connected: false, error: 'Max retries exceeded' };
}
