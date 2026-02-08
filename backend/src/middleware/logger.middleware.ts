/**
 * Logger Middleware
 * HTTP request/response logging with structured JSON output
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import { Request, Response, NextFunction } from 'express';
import { getLogger, createRequestLogger } from '../config/logger.config';
import { getRequestId, getCorrelationId } from './request-id.middleware';

// Extend Express Request to include logger
declare global {
  namespace Express {
    interface Request {
      log: ReturnType<typeof createRequestLogger>;
    }
  }
}

/**
 * Logger middleware
 * - Creates request-scoped logger with request ID
 * - Logs request start and completion
 * - Includes response time and status
 */
export function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();
  const requestId = getRequestId(req);
  const correlationId = getCorrelationId(req);

  // Create request-scoped logger
  const log = createRequestLogger(requestId, (req as any).user?.id);
  req.log = log;

  // Log request start
  log.info({
    msg: 'request started',
    method: req.method,
    url: req.originalUrl || req.url,
    query: req.query,
    userAgent: req.get('user-agent'),
    ip: req.ip || req.socket.remoteAddress,
    correlationId,
  });

  // Capture response completion
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any, callback?: any): Response {
    const responseTime = Date.now() - startTime;

    // Log request completion
    log.info({
      msg: 'request completed',
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime,
      contentLength: res.get('content-length'),
    });

    // Call original end
    return originalEnd.call(this, chunk, encoding, callback);
  };

  // Handle errors
  res.on('error', (err) => {
    log.error({
      msg: 'response error',
      error: err.message,
      stack: err.stack,
    });
  });

  next();
}

/**
 * Error logging middleware
 * Should be registered after other error handlers
 */
export function errorLoggerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const log = req.log || getLogger();

  log.error({
    msg: 'unhandled error',
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl || req.url,
    statusCode: res.statusCode,
    requestId: getRequestId(req),
  });

  next(err);
}

/**
 * Skip logging for specific paths (e.g., health checks)
 */
const SKIP_PATHS = ['/health', '/ready', '/favicon.ico'];

export function shouldSkipLogging(req: Request): boolean {
  return SKIP_PATHS.some((path) => req.path.startsWith(path));
}

/**
 * Conditional logger middleware that skips health checks
 */
export function conditionalLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (shouldSkipLogging(req)) {
    // Create minimal logger for skipped requests
    req.log = getLogger().child({ requestId: getRequestId(req), skipped: true });
    return next();
  }

  return loggerMiddleware(req, res, next);
}

export default loggerMiddleware;
