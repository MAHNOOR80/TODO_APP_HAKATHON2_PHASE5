import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes/index';
import healthRoutes from './routes/health.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { testDatabaseConnection, disconnectDatabase } from './config/database.config';
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { correlationMiddleware } from './middleware/correlation.middleware';
import { conditionalLoggerMiddleware, errorLoggerMiddleware } from './middleware/logger.middleware';
import { getLogger } from './config/logger.config';
import daprRoutes from './routes/dapr.routes';

// Load environment variables
dotenv.config();

const app: Express = express();
// Using 5006 as seen in your logs, defaulting to 3000 if not in .env
const PORT = process.env['PORT'] || 3000;

// --- UPDATED CORS SECTION ---
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5174', // Added to fix your current error
  'https://todo-app-hakathon-2-phase-2.vercel.app'
];

if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
    },
    credentials: true,
  })
);
// --- END UPDATED CORS SECTION ---

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(correlationMiddleware);
app.use(requestIdMiddleware);
app.use(conditionalLoggerMiddleware);
app.use(daprRoutes);
app.use(healthRoutes);
app.use('/api/v1', apiRoutes);

app.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Todo API Server - Phase 2',
      version: '2.0.0',
      status: 'running',
    },
  });
});

app.use(errorLoggerMiddleware);
app.use(notFoundHandler);
app.use(errorHandler);

async function startServer(): Promise<void> {
  try {
    const dbConnected = await testDatabaseConnection();

    if (!dbConnected) {
      console.warn('Warning: Database connection failed.');
    }

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📚 API base URL: http://localhost:${PORT}/api/v1`);
      console.log(`🌍 CORS allowed for: ${allowedOrigins.join(', ')}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/v1/health`);
      
      if (dbConnected) {
        console.log('✅ Database connection: OK');
      }
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

const log = getLogger();

async function gracefulShutdown(signal: string): Promise<void> {
  log.info({ msg: `${signal} received, shutting down gracefully...` });
  try {
    await disconnectDatabase();
    log.info({ msg: 'Database disconnected' });
  } catch (error) {
    log.error({ msg: 'Error during shutdown', error });
  }
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();