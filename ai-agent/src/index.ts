/**
 * AI Agent Service - Main Entry Point
 * Background service for autonomous task suggestions
 * Phase 5: Reactive AI Agents with Dapr Event Subscriptions
 */

import express from 'express';
import { logger } from './config/logger.config';
import { initializeScheduler, shutdownScheduler } from './scheduler';
import { getDatabaseStatus } from './config/database.config';
import { createSubscriptionRouter, registerHandler } from './events/subscribers';
import { handleTaskCreatedEvent, handleTaskCompletedEvent } from './agents/overdue-agent';
import { handleTaskUpdatedEvent } from './agents/prioritization-agent';
import { TaskEventType } from './events/event-types';

const SERVICE_NAME = 'ai-agent';
const SHUTDOWN_TIMEOUT = 30000; // 30 seconds
const PORT = parseInt(process.env.PORT || '5000', 10);

let isShuttingDown = false;
let httpServer: ReturnType<typeof app.listen> | null = null;

// Express app for Dapr subscription endpoints
const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: SERVICE_NAME });
});

// Mount Dapr subscription router
app.use(createSubscriptionRouter());

/**
 * Main entry point
 */
async function main(): Promise<void> {
  logger.info({ service: SERVICE_NAME }, 'Starting AI Agent service');

  try {
    // Check database connectivity
    const dbStatus = await getDatabaseStatus();
    if (!dbStatus.connected) {
      logger.error({ error: dbStatus.error }, 'Database connection failed');
      process.exit(1);
    }

    logger.info('Database connection established');

    // Register event handlers for Dapr subscriptions
    registerHandler(TaskEventType.CREATED, handleTaskCreatedEvent);
    registerHandler(TaskEventType.UPDATED, handleTaskUpdatedEvent);
    registerHandler(TaskEventType.COMPLETED, handleTaskCompletedEvent);
    logger.info('Event handlers registered');

    // Start Express HTTP server for Dapr subscriptions
    httpServer = app.listen(PORT, () => {
      logger.info({ port: PORT }, 'AI Agent HTTP server started for Dapr subscriptions');
    });

    // Initialize cron scheduler (runs alongside HTTP server)
    await initializeScheduler();
    logger.info('Scheduler initialized');

    logger.info({ service: SERVICE_NAME }, 'AI Agent service started successfully');
  } catch (error) {
    logger.error({ error }, 'Failed to start AI Agent service');
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    logger.warn('Shutdown already in progress');
    return;
  }

  isShuttingDown = true;
  logger.info({ signal }, 'Received shutdown signal, starting graceful shutdown');

  const shutdownTimeout = setTimeout(() => {
    logger.error('Shutdown timeout exceeded, forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT);

  try {
    // Stop HTTP server
    if (httpServer) {
      await new Promise<void>((resolve, reject) => {
        httpServer!.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      logger.info('HTTP server stopped');
    }

    // Stop scheduler
    await shutdownScheduler();
    logger.info('Scheduler stopped');

    clearTimeout(shutdownTimeout);
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error during shutdown');
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
}

// Register signal handlers
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught exception');
  shutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled promise rejection');
});

// Start the service
main().catch((error) => {
  logger.error({ error }, 'Fatal error in main');
  process.exit(1);
});
