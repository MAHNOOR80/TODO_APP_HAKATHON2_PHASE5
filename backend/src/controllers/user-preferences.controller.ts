/**
 * User Preferences Controller
 * HTTP handlers for user preferences including autonomous agent settings
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import { Request, Response, NextFunction } from 'express';
import { getPrismaClient } from '../config/database.config';
import { logger } from '../config/logger.config';

const prisma = getPrismaClient();

/**
 * Get user preferences
 * GET /api/user/preferences
 */
export async function getUserPreferences(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        autonomousAgentsEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      preferences: {
        autonomousAgentsEnabled: user.autonomousAgentsEnabled,
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching user preferences');
    next(error);
  }
}

/**
 * Update user preferences
 * PATCH /api/user/preferences
 */
export async function updateUserPreferences(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { autonomousAgentsEnabled } = req.body;

    // Validate input
    if (typeof autonomousAgentsEnabled !== 'boolean' && autonomousAgentsEnabled !== undefined) {
      res.status(400).json({ error: 'autonomousAgentsEnabled must be a boolean' });
      return;
    }

    const updateData: { autonomousAgentsEnabled?: boolean } = {};
    if (autonomousAgentsEnabled !== undefined) {
      updateData.autonomousAgentsEnabled = autonomousAgentsEnabled;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        autonomousAgentsEnabled: true,
        updatedAt: true,
      },
    });

    logger.info(
      { userId, autonomousAgentsEnabled: user.autonomousAgentsEnabled },
      'User preferences updated'
    );

    res.json({
      preferences: {
        autonomousAgentsEnabled: user.autonomousAgentsEnabled,
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error updating user preferences');
    next(error);
  }
}

/**
 * Toggle autonomous agents setting
 * POST /api/user/preferences/toggle-agents
 */
export async function toggleAutonomousAgents(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get current state
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { autonomousAgentsEnabled: true },
    });

    if (!currentUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Toggle the setting
    const newValue = !currentUser.autonomousAgentsEnabled;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { autonomousAgentsEnabled: newValue },
      select: {
        id: true,
        autonomousAgentsEnabled: true,
        updatedAt: true,
      },
    });

    logger.info(
      { userId, autonomousAgentsEnabled: user.autonomousAgentsEnabled },
      'Autonomous agents toggled'
    );

    res.json({
      autonomousAgentsEnabled: user.autonomousAgentsEnabled,
      message: user.autonomousAgentsEnabled
        ? 'Autonomous agents enabled'
        : 'Autonomous agents disabled',
    });
  } catch (error) {
    logger.error({ error }, 'Error toggling autonomous agents');
    next(error);
  }
}
