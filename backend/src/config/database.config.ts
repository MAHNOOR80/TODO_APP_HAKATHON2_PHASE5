import { PrismaClient, Prisma } from '@prisma/client';

// Singleton Prisma Client instance
let prisma: PrismaClient;

// Connection pool configuration for containerized environments
const CONNECTION_POOL_CONFIG = {
  // Maximum number of connections in the pool (per replica)
  // Neon recommends keeping this low for serverless
  connectionLimit: parseInt(process.env['DB_CONNECTION_LIMIT'] || '10', 10),
  // Connection timeout in milliseconds
  poolTimeout: parseInt(process.env['DB_POOL_TIMEOUT'] || '10', 10),
};

/**
 * Get Prisma Client instance
 * Uses singleton pattern to prevent multiple instances
 * Configured for Neon Serverless PostgreSQL connection pooling
 * Optimized for containerized/Kubernetes deployments
 */
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env['NODE_ENV'] === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
      datasources: {
        db: {
          url: buildConnectionUrl(),
        },
      },
    });

    // Handle connection errors gracefully for Neon serverless
    prisma.$connect().catch((err) => {
      console.error('Failed to connect to database:', err);
    });
  }
  return prisma;
}

/**
 * Build connection URL with pooling parameters
 * Appends connection_limit and pool_timeout if not already present
 */
function buildConnectionUrl(): string {
  const baseUrl = process.env['DATABASE_URL'] || '';

  // Check if URL already has query parameters
  const hasParams = baseUrl.includes('?');
  const separator = hasParams ? '&' : '?';

  // Only add pooling params if not already present
  if (!baseUrl.includes('connection_limit')) {
    return `${baseUrl}${separator}connection_limit=${CONNECTION_POOL_CONFIG.connectionLimit}&pool_timeout=${CONNECTION_POOL_CONFIG.poolTimeout}`;
  }

  return baseUrl;
}

/**
 * Disconnect Prisma Client
 * Call this on application shutdown for graceful termination
 */
export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}

/**
 * Test database connection
 * Used by health check endpoints to verify connectivity
 * Returns true if connection successful, false otherwise
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Get database connection status with details
 * Used by readiness probes and health endpoints
 */
export interface DatabaseStatus {
  connected: boolean;
  latencyMs?: number;
  error?: string;
}

export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  const start = Date.now();
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    return {
      connected: true,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      connected: false,
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

/**
 * Execute with retry logic for transient failures
 * Useful for containerized environments where connections may be unstable initially
 */
// Export Prisma namespace for type compatibility
export { Prisma };

export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2; // Exponential backoff
      }
    }
  }

  throw lastError;
}
