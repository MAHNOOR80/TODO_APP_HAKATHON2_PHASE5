/**
 * Logger Configuration with Pino
 * Structured JSON logging for cloud-native deployments
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import pino, { Logger, LoggerOptions } from 'pino';

// Log levels
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// Logger configuration interface
export interface LoggerConfig {
  level: LogLevel;
  prettyPrint: boolean;
  redactPaths: string[];
}

/**
 * Get logger configuration from environment
 */
export function getLoggerConfig(): LoggerConfig {
  const nodeEnv = process.env['NODE_ENV'] || 'development';
  const logLevel = (process.env['LOG_LEVEL'] || (nodeEnv === 'production' ? 'info' : 'debug')) as LogLevel;

  return {
    level: logLevel,
    prettyPrint: nodeEnv === 'development',
    redactPaths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.secret',
      '*.token',
      '*.apiKey',
      '*.DATABASE_URL',
    ],
  };
}

/**
 * Create Pino logger options
 */
function createLoggerOptions(config: LoggerConfig): LoggerOptions {
  const baseOptions: LoggerOptions = {
    level: config.level,
    redact: config.redactPaths,
    // Add service metadata for log aggregation
    base: {
      service: process.env['SERVICE_NAME'] || 'todo-backend',
      version: process.env['npm_package_version'] || '1.0.0',
      environment: process.env['NODE_ENV'] || 'development',
    },
    // Timestamp format for structured logging
    timestamp: pino.stdTimeFunctions.isoTime,
    // Custom serializers for consistent log format
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        query: req.query,
        params: req.params,
        headers: {
          host: req.headers?.host,
          'user-agent': req.headers?.['user-agent'],
          'content-type': req.headers?.['content-type'],
          'x-request-id': req.headers?.['x-request-id'],
        },
      }),
      res: (res) => ({
        statusCode: res.statusCode,
        headers: {
          'content-type': res.headers?.['content-type'],
          'content-length': res.headers?.['content-length'],
        },
      }),
      err: pino.stdSerializers.err,
    },
  };

  // Add pretty printing for development
  if (config.prettyPrint) {
    return {
      ...baseOptions,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    };
  }

  return baseOptions;
}

// Singleton logger instance
let logger: Logger | null = null;

/**
 * Get or create the application logger
 */
export function getLogger(): Logger {
  if (!logger) {
    const config = getLoggerConfig();
    logger = pino(createLoggerOptions(config));
  }
  return logger;
}

/**
 * Create a child logger with additional context
 * Use for request-scoped logging
 */
export function createChildLogger(bindings: Record<string, unknown>): Logger {
  return getLogger().child(bindings);
}

/**
 * Create a request-scoped logger
 */
export function createRequestLogger(requestId: string, userId?: string): Logger {
  return createChildLogger({
    requestId,
    ...(userId && { userId }),
  });
}

// Export default logger for convenience
export const log = getLogger();

// Also export as logger for compatibility with controllers expecting logger
export { log as logger };

// Log level utilities
export const isDebugEnabled = (): boolean => getLogger().isLevelEnabled('debug');
export const isTraceEnabled = (): boolean => getLogger().isLevelEnabled('trace');
