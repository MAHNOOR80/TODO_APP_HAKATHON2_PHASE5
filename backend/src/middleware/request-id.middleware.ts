/**
 * Request ID Middleware
 * Generates and propagates unique request IDs for tracing
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

// Header names for request ID propagation
export const REQUEST_ID_HEADER = 'x-request-id';
export const CORRELATION_ID_HEADER = 'x-correlation-id';

// Extend Express Request to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      correlationId?: string;
    }
  }
}

/**
 * Generate a unique request ID
 * Uses UUID v4 for uniqueness across distributed systems
 */
export function generateRequestId(): string {
  return randomUUID();
}

/**
 * Request ID middleware
 * - Extracts request ID from incoming headers (for tracing across services)
 * - Generates new ID if not present
 * - Attaches ID to request object
 * - Sets response header for client visibility
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Check for existing request ID from upstream service or load balancer
  const incomingRequestId = req.get(REQUEST_ID_HEADER);
  const correlationId = req.get(CORRELATION_ID_HEADER);

  // Use incoming ID or generate new one
  const requestId = incomingRequestId || generateRequestId();

  // Attach to request object for use in handlers and logging
  req.requestId = requestId;

  // Propagate correlation ID if present (for multi-hop tracing)
  if (correlationId) {
    req.correlationId = correlationId;
  }

  // Set response headers for client and downstream tracing
  res.setHeader(REQUEST_ID_HEADER, requestId);
  if (correlationId) {
    res.setHeader(CORRELATION_ID_HEADER, correlationId);
  }

  next();
}

/**
 * Get request ID from request object
 * Utility function for use in services and controllers
 */
export function getRequestId(req: Request): string {
  return req.requestId || 'unknown';
}

/**
 * Get correlation ID from request object
 */
export function getCorrelationId(req: Request): string | undefined {
  return req.correlationId;
}

export default requestIdMiddleware;
