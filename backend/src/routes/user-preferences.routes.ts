/**
 * User Preferences Routes
 * API endpoints for user preferences including autonomous agent settings
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import { Router } from 'express';
import * as userPreferencesController from '../controllers/user-preferences.controller';

const router = Router();

/**
 * GET /api/user/preferences
 * Get user preferences
 */
router.get('/', userPreferencesController.getUserPreferences);

/**
 * PATCH /api/user/preferences
 * Update user preferences
 */
router.patch('/', userPreferencesController.updateUserPreferences);

/**
 * POST /api/user/preferences/toggle-agents
 * Toggle autonomous agents setting
 */
router.post('/toggle-agents', userPreferencesController.toggleAutonomousAgents);

export default router;
