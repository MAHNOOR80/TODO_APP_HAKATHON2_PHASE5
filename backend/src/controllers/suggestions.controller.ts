/**
 * Suggestions Controller
 * HTTP handlers for agent suggestions API
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import { Request, Response, NextFunction } from 'express';
import * as suggestionService from '../services/suggestion.service';
import { SuggestionQueryParams, SuggestionType } from '../models/agent-suggestion.model';
import { logger } from '../config/logger.config';

/**
 * Get suggestions for authenticated user
 * GET /api/suggestions
 */
export async function getSuggestions(
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

    const params: SuggestionQueryParams = {
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
      type: req.query.type as SuggestionType | undefined,
      dismissed: req.query.dismissed === 'true',
    };

    const result = await suggestionService.getSuggestionsForUser(userId, params);

    res.json({
      suggestions: result.suggestions,
      total: result.total,
      limit: params.limit,
      offset: params.offset,
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching suggestions');
    next(error);
  }
}

/**
 * Get suggestion by ID
 * GET /api/suggestions/:id
 */
export async function getSuggestionById(
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

    const { id } = req.params;
    const suggestion = await suggestionService.getSuggestionById(id, userId);

    if (!suggestion) {
      res.status(404).json({ error: 'Suggestion not found' });
      return;
    }

    res.json(suggestion);
  } catch (error) {
    logger.error({ error, suggestionId: req.params.id }, 'Error fetching suggestion');
    next(error);
  }
}

/**
 * Dismiss a suggestion
 * POST /api/suggestions/:id/dismiss
 */
export async function dismissSuggestion(
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

    const { id } = req.params;
    const suggestion = await suggestionService.dismissSuggestion(id, userId);

    if (!suggestion) {
      res.status(404).json({ error: 'Suggestion not found' });
      return;
    }

    res.json(suggestion);
  } catch (error) {
    logger.error({ error, suggestionId: req.params.id }, 'Error dismissing suggestion');
    next(error);
  }
}

/**
 * Delete a suggestion
 * DELETE /api/suggestions/:id
 */
export async function deleteSuggestion(
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

    const { id } = req.params;
    const deleted = await suggestionService.deleteSuggestion(id, userId);

    if (!deleted) {
      res.status(404).json({ error: 'Suggestion not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    logger.error({ error, suggestionId: req.params.id }, 'Error deleting suggestion');
    next(error);
  }
}

/**
 * Get suggestion counts by type
 * GET /api/suggestions/counts
 */
export async function getSuggestionCounts(
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

    const counts = await suggestionService.getSuggestionCounts(userId);
    res.json(counts);
  } catch (error) {
    logger.error({ error }, 'Error fetching suggestion counts');
    next(error);
  }
}
