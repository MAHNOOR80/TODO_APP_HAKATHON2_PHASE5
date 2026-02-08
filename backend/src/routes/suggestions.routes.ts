/**
 * Suggestions Routes
 * API endpoints for agent suggestions
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import { Router } from 'express';
import * as suggestionsController from '../controllers/suggestions.controller';

const router = Router();

/**
 * GET /api/suggestions
 * Get suggestions for authenticated user
 * Query params: limit, offset, type, dismissed
 */
router.get('/', suggestionsController.getSuggestions);

/**
 * GET /api/suggestions/counts
 * Get suggestion counts by type
 */
router.get('/counts', suggestionsController.getSuggestionCounts);

/**
 * GET /api/suggestions/:id
 * Get suggestion by ID
 */
router.get('/:id', suggestionsController.getSuggestionById);

/**
 * POST /api/suggestions/:id/dismiss
 * Dismiss a suggestion
 */
router.post('/:id/dismiss', suggestionsController.dismissSuggestion);

/**
 * DELETE /api/suggestions/:id
 * Delete a suggestion
 */
router.delete('/:id', suggestionsController.deleteSuggestion);

export default router;
