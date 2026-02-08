# Research: Cloud-Native Kubernetes Deployment

**Feature**: 007-cloud-native-k8s-deployment
**Date**: 2026-01-24
**Purpose**: Document technology decisions and best practices for Phase 4 implementation

## 1. Containerization Strategy

### Decision: Multi-stage Docker Builds with Alpine Base

**Rationale**:
- Multi-stage builds separate build dependencies from runtime, reducing image size by 60-80%
- Alpine Linux base images are ~5MB vs ~100MB for Debian-based images
- Smaller images mean faster deployments and reduced attack surface

**Alternatives Considered**:
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Single-stage Debian | Simple, familiar | Large images (300-500MB) | Rejected |
| Multi-stage Debian | Smaller than single-stage | Still 100MB+ base | Rejected |
| Multi-stage Alpine | Minimal size (50-100MB final) | Some npm packages need compilation | **Selected** |
| Distroless | Smallest, most secure | No shell for debugging | Future consideration |

**Best Practices Applied**:
1. Use `node:20-alpine` as builder stage
2. Use `node:20-alpine` as runner stage (not distroless, for debugging)
3. Copy only production dependencies to final stage
4. Run as non-root user (UID 1001)
5. Use `.dockerignore` to exclude node_modules, .env, tests

### Backend Dockerfile Pattern

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package.json ./
USER appuser
EXPOSE 4000
CMD ["node", "dist/index.js"]
```

### Frontend Dockerfile Pattern (Next.js/React with Nginx)

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

## 2. Kubernetes Deployment Pattern

### Decision: Kustomize with Base/Overlay Structure

**Rationale**:
- Kustomize is built into kubectl (no additional tooling)
- Base/overlay pattern enables environment-specific configuration without duplication
- Simpler than Helm for 3-service applications
- Strategic merge patches are more intuitive than Go templating

**Alternatives Considered**:
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Raw YAML files | Simple, no learning curve | Duplication, no parameterization | Rejected |
| Helm | Powerful templating, charts ecosystem | Overkill for small apps, learning curve | Future option |
| Kustomize | Built-in, base/overlay, patches | Less powerful than Helm | **Selected** |
| CDK8s | TypeScript, type-safe | Additional build step | Rejected |

**Best Practices Applied**:
1. Base directory contains common configuration
2. Overlays contain environment-specific patches (replicas, resources, images)
3. Use `kustomization.yaml` to compose resources
4. Secrets managed separately (not in Kustomize)

### Directory Structure

```
k8s/
├── base/
│   ├── kustomization.yaml
│   ├── namespace.yaml
│   ├── frontend/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── backend/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── ai-agent/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── configmap.yaml
│   └── ingress.yaml
└── overlays/
    ├── development/
    │   ├── kustomization.yaml
    │   └── patches/
    └── production/
        ├── kustomization.yaml
        └── patches/
```

## 3. Health Check Implementation

### Decision: Separate Liveness and Readiness Endpoints

**Rationale**:
- Liveness probe (`/health`): Is the process alive? Restart if not.
- Readiness probe (`/ready`): Can the service handle traffic? Remove from load balancer if not.
- Separation prevents unnecessary restarts when dependencies are temporarily unavailable.

**Best Practices Applied**:
1. `/health` returns 200 if the process is running (lightweight check)
2. `/ready` verifies database connectivity and critical dependencies
3. Configure appropriate timeouts (5s initial delay, 10s period)
4. Use HTTP probes, not exec probes (lower overhead)

### Health Endpoint Patterns

```typescript
// /health - Liveness (lightweight)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// /ready - Readiness (checks dependencies)
app.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ready', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', database: 'disconnected' });
  }
});
```

### Kubernetes Probe Configuration

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 4000
  initialDelaySeconds: 5
  periodSeconds: 10
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /ready
    port: 4000
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 3
```

## 4. Structured Logging

### Decision: Pino with JSON Output

**Rationale**:
- Pino is 5-10x faster than Winston in benchmarks
- Native JSON output works well with log aggregation (ELK, CloudWatch, Stackdriver)
- Request ID correlation enables distributed tracing
- Log levels configurable via environment variable

**Alternatives Considered**:
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| console.log | Simple, no deps | No structure, no levels | Rejected |
| Winston | Popular, flexible | Slower than Pino | Rejected |
| Pino | Fast, JSON native | Less middleware ecosystem | **Selected** |
| Bunyan | JSON native | Less maintained | Rejected |

**Best Practices Applied**:
1. Use `pino-http` middleware for automatic request logging
2. Include request ID in all log entries
3. Configure log level via `LOG_LEVEL` environment variable
4. Use `pino-pretty` for local development only

### Logger Configuration

```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
```

### Request ID Middleware

```typescript
import { randomUUID } from 'crypto';

export function requestIdMiddleware(req, res, next) {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('x-request-id', req.id);
  next();
}
```

## 5. Autonomous Agent Scheduling

### Decision: node-cron for Background Jobs

**Rationale**:
- Simple cron-style scheduling, no external dependencies
- Runs in-process, suitable for containerized applications
- Lightweight alternative to job queues (BullMQ, Agenda) for simple use cases

**Alternatives Considered**:
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| setInterval | Simple, built-in | No cron syntax, drift over time | Rejected |
| node-cron | Cron syntax, lightweight | In-memory only | **Selected** |
| BullMQ | Redis-backed, scalable | Requires Redis, complex | Future option |
| Kubernetes CronJob | Native K8s, scalable | Separate pods, cold start | Future option |

**Best Practices Applied**:
1. Run scheduler in dedicated ai-agent service
2. Use cron expression for 5-minute intervals (`*/5 * * * *`)
3. Implement rate limiting at application level
4. Log all agent actions for audit trail

### Scheduler Pattern

```typescript
import cron from 'node-cron';
import { overdueMonitor } from './agents/overdue-agent';
import { prioritizationAgent } from './agents/prioritization-agent';

export function startScheduler() {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    logger.info('Running autonomous agent checks');
    await overdueMonitor.run();
    await prioritizationAgent.run();
  });
}
```

## 6. Database Connection Pooling

### Decision: Prisma with Connection Pool Configuration

**Rationale**:
- Prisma manages connection pooling automatically
- Configure pool size via `connection_limit` in DATABASE_URL
- Essential for containerized environments with multiple replicas

**Best Practices Applied**:
1. Set connection limit based on expected replicas (e.g., 10 connections per replica)
2. Use `pool_timeout` to fail fast on exhaustion
3. Implement health check that verifies connectivity
4. Handle reconnection in graceful shutdown

### Connection String Pattern

```
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=10"
```

## 7. Graceful Shutdown

### Decision: Handle SIGTERM with Connection Draining

**Rationale**:
- Kubernetes sends SIGTERM before killing pods
- Services should stop accepting new requests and complete in-flight requests
- Prevents dropped connections during rolling updates

**Best Practices Applied**:
1. Listen for SIGTERM signal
2. Stop accepting new connections
3. Wait for in-flight requests to complete (with timeout)
4. Close database connections
5. Exit cleanly

### Shutdown Pattern

```typescript
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, starting graceful shutdown');

  // Stop accepting new requests
  server.close(async () => {
    logger.info('HTTP server closed');

    // Close database connections
    await prisma.$disconnect();
    logger.info('Database disconnected');

    process.exit(0);
  });

  // Force exit after timeout
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
});
```

## 8. Session Authentication in Containers

### Decision: Cookie-based Sessions with Shared Secret

**Rationale**:
- Better Auth uses session cookies
- Sessions must work across containerized replicas
- Database-backed sessions (already implemented) scale horizontally

**Best Practices Applied**:
1. Use same `AUTH_SECRET` across all backend replicas (via K8s Secret)
2. Set appropriate cookie domain for ingress host
3. Ensure `secure: true` and `sameSite: 'lax'` for production
4. Session store in PostgreSQL (already done by Better Auth)

## Summary of Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Container Base | Alpine Linux | Minimal size, security |
| Build Pattern | Multi-stage | Separate build/runtime deps |
| K8s Tooling | Kustomize | Built-in, simple overlays |
| Health Checks | Separate liveness/readiness | Proper failure handling |
| Logging | Pino JSON | Fast, structured, aggregatable |
| Scheduling | node-cron | Simple, in-process |
| Connection Pool | Prisma native | Automatic, configurable |
| Shutdown | SIGTERM handler | Graceful connection draining |
