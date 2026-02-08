/**
 * Scheduler Service
 * Node-cron based job scheduling for autonomous agents
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import * as cron from 'node-cron';
import { logger } from './config/logger.config';
import { runOverdueAgent } from './agents/overdue-agent';
import { runPrioritizationAgent } from './agents/prioritization-agent';

// Scheduled jobs storage
const scheduledJobs: cron.ScheduledTask[] = [];

// Schedule configuration
const SCHEDULES = {
  // Run overdue check every 5 minutes
  overdueAgent: '*/5 * * * *',
  // Run prioritization check every 15 minutes
  prioritizationAgent: '*/15 * * * *',
  // Cleanup old suggestions daily at 3 AM
  cleanup: '0 3 * * *',
};

/**
 * Initialize all scheduled jobs
 */
export async function initializeScheduler(): Promise<void> {
  logger.info('Initializing scheduler');

  // Schedule overdue agent
  const overdueJob = cron.schedule(SCHEDULES.overdueAgent, async () => {
    logger.info('Running overdue agent');
    try {
      await runOverdueAgent();
    } catch (error) {
      logger.error({ error }, 'Overdue agent failed');
    }
  });
  scheduledJobs.push(overdueJob);
  logger.info({ schedule: SCHEDULES.overdueAgent }, 'Overdue agent scheduled');

  // Schedule prioritization agent
  const prioritizationJob = cron.schedule(SCHEDULES.prioritizationAgent, async () => {
    logger.info('Running prioritization agent');
    try {
      await runPrioritizationAgent();
    } catch (error) {
      logger.error({ error }, 'Prioritization agent failed');
    }
  });
  scheduledJobs.push(prioritizationJob);
  logger.info({ schedule: SCHEDULES.prioritizationAgent }, 'Prioritization agent scheduled');

  // Run initial check on startup (after a short delay)
  setTimeout(async () => {
    logger.info('Running initial agent checks');
    try {
      await runOverdueAgent();
      await runPrioritizationAgent();
    } catch (error) {
      logger.error({ error }, 'Initial agent checks failed');
    }
  }, 5000);

  logger.info('Scheduler initialized with all jobs');
}

/**
 * Shutdown scheduler and stop all jobs
 */
export async function shutdownScheduler(): Promise<void> {
  logger.info('Shutting down scheduler');

  for (const job of scheduledJobs) {
    job.stop();
  }

  scheduledJobs.length = 0;
  logger.info('All scheduled jobs stopped');
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus(): { running: boolean; jobCount: number } {
  return {
    running: scheduledJobs.length > 0,
    jobCount: scheduledJobs.length,
  };
}
