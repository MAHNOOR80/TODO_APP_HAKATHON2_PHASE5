/**
 * Rate Limiter Utility
 * API-level rate limiting for requests
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.config';

// Configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string;
  keyGenerator?: (req: Request) => string;
}

// Default configuration
const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later.',
};

// In-memory store for rate limit tracking
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup interval (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

// Start cleanup timer
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Create rate limiting middleware
 */
export function createRateLimiter(config: Partial<RateLimitConfig> = {}) {
  const options: RateLimitConfig = { ...DEFAULT_CONFIG, ...config };

  return (req: Request, res: Response, next: NextFunction): void => {
    // Generate key for this request
    const key = options.keyGenerator
      ? options.keyGenerator(req)
      : getDefaultKey(req);

    const now = Date.now();
    let entry = rateLimitStore.get(key);

    // Initialize or reset if expired
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + options.windowMs,
      };
      rateLimitStore.set(key, entry);
    }

    // Increment count
    entry.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', options.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - entry.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

    // Check if limit exceeded
    if (entry.count > options.max) {
      logger.warn({ key, count: entry.count, max: options.max }, 'Rate limit exceeded');

      res.status(429).json({
        error: 'Too Many Requests',
        message: options.message,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
      return;
    }

    next();
  };
}

/**
 * Default key generator (IP + user ID if available)
 */
function getDefaultKey(req: Request): string {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userId = req.user?.id;
  return userId ? `${ip}:${userId}` : ip;
}

/**
 * Rate limiter for suggestions API
 * More restrictive than general API
 */
export const suggestionsRateLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many suggestion requests, please try again later.',
  keyGenerator: (req) => {
    const userId = req.user?.id || 'anonymous';
    return `suggestions:${userId}`;
  },
});

/**
 * Rate limiter for authentication endpoints
 * Strict limits to prevent brute force
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  keyGenerator: (req) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `auth:${ip}`;
  },
});

/**
 * Rate limiter for general API endpoints
 */
export const generalRateLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 100, // 100 requests per minute
});

/**
 * Clear rate limit for a key (useful for testing)
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status for a key
 */
export function getRateLimitStatus(
  key: string
): { remaining: number; resetInMs: number } | null {
  const entry = rateLimitStore.get(key);
  if (!entry) {
    return null;
  }

  const now = Date.now();
  if (entry.resetTime < now) {
    return null;
  }

  return {
    remaining: Math.max(0, DEFAULT_CONFIG.max - entry.count),
    resetInMs: entry.resetTime - now,
  };
}
