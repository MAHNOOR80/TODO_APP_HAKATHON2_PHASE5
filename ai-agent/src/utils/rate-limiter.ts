/**
 * Rate Limiter Utility
 * Limits suggestion creation per user
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import { countRecentSuggestions } from '../services/suggestion-api.service';
import { logger } from '../config/logger.config';

// Configuration
const MAX_SUGGESTIONS_PER_HOUR = 10;

// In-memory cache for rate limit checks (reduces database queries)
const rateLimitCache = new Map<string, { count: number; timestamp: number }>();
const CACHE_TTL_MS = 60000; // 1 minute cache

/**
 * Check if user has exceeded rate limit
 * Returns true if user can create more suggestions
 */
export async function checkRateLimit(userId: string): Promise<boolean> {
  const now = Date.now();

  // Check cache first
  const cached = rateLimitCache.get(userId);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    if (cached.count >= MAX_SUGGESTIONS_PER_HOUR) {
      logger.debug({ userId, count: cached.count }, 'Rate limit hit (cached)');
      return false;
    }
    return true;
  }

  // Check database
  try {
    const count = await countRecentSuggestions(userId, 1);

    // Update cache
    rateLimitCache.set(userId, { count, timestamp: now });

    if (count >= MAX_SUGGESTIONS_PER_HOUR) {
      logger.debug({ userId, count }, 'Rate limit hit');
      return false;
    }

    return true;
  } catch (error) {
    logger.error({ error, userId }, 'Error checking rate limit');
    // Allow on error to avoid blocking legitimate suggestions
    return true;
  }
}

/**
 * Increment the cached count for a user
 * Call after successfully creating a suggestion
 */
export function incrementRateLimitCount(userId: string): void {
  const now = Date.now();
  const cached = rateLimitCache.get(userId);

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    cached.count++;
  } else {
    rateLimitCache.set(userId, { count: 1, timestamp: now });
  }
}

/**
 * Clear rate limit cache for a user
 * Useful for testing
 */
export function clearRateLimitCache(userId?: string): void {
  if (userId) {
    rateLimitCache.delete(userId);
  } else {
    rateLimitCache.clear();
  }
}

/**
 * Get current rate limit status for a user
 */
export function getRateLimitStatus(
  userId: string
): { remaining: number; resetInMs: number } | null {
  const cached = rateLimitCache.get(userId);
  if (!cached) {
    return null;
  }

  const age = Date.now() - cached.timestamp;
  if (age >= CACHE_TTL_MS) {
    return null;
  }

  return {
    remaining: Math.max(0, MAX_SUGGESTIONS_PER_HOUR - cached.count),
    resetInMs: CACHE_TTL_MS - age,
  };
}
