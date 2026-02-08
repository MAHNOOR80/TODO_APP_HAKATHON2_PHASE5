# API Contract: Health Endpoints

**Feature**: 007-cloud-native-k8s-deployment
**Date**: 2026-01-24
**Base Path**: Root level (no `/api/v1` prefix)

## Overview

Health endpoints for Kubernetes liveness and readiness probes. These endpoints do NOT require authentication and are exposed at the root level of each service.

## Endpoints

### GET /health

Liveness probe endpoint. Returns 200 if the service process is running.

**Purpose**: Kubernetes uses this to determine if the pod should be restarted.

**Authentication**: None required

**Request**:
```http
GET /health HTTP/1.1
Host: backend:4000
```

**Success Response** (200 OK):
```json
{
  "status": "healthy",
  "service": "backend",
  "version": "1.0.0",
  "timestamp": "2026-01-24T12:00:00.000Z"
}
```

**Kubernetes Configuration**:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 4000
  initialDelaySeconds: 5
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

---

### GET /ready

Readiness probe endpoint. Returns 200 only if the service can handle requests (dependencies are available).

**Purpose**: Kubernetes uses this to determine if the pod should receive traffic.

**Authentication**: None required

**Request**:
```http
GET /ready HTTP/1.1
Host: backend:4000
```

**Success Response** (200 OK):
```json
{
  "status": "ready",
  "service": "backend",
  "checks": {
    "database": "connected",
    "memory": "ok"
  },
  "timestamp": "2026-01-24T12:00:00.000Z"
}
```

**Failure Response** (503 Service Unavailable):
```json
{
  "status": "not ready",
  "service": "backend",
  "checks": {
    "database": "disconnected",
    "memory": "ok"
  },
  "timestamp": "2026-01-24T12:00:00.000Z"
}
```

**Kubernetes Configuration**:
```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 4000
  initialDelaySeconds: 5
  periodSeconds: 5
  timeoutSeconds: 5
  failureThreshold: 3
```

## Service-Specific Endpoints

### Backend Service (Port 4000)

| Endpoint | Checks | Response Time Target |
|----------|--------|---------------------|
| `/health` | Process alive | < 100ms |
| `/ready` | Database connection | < 500ms |

### Frontend Service (Port 3000)

| Endpoint | Checks | Response Time Target |
|----------|--------|---------------------|
| `/health` | Nginx process alive | < 100ms |
| `/ready` | Static files accessible | < 100ms |

Note: Frontend uses Nginx, health check can be a simple static file or Nginx status.

### AI Agent Service (Port 5000)

| Endpoint | Checks | Response Time Target |
|----------|--------|---------------------|
| `/health` | Process alive | < 100ms |
| `/ready` | Database connection, Backend API reachable | < 500ms |

## Response Headers

All health endpoints include:

```http
Content-Type: application/json
Cache-Control: no-cache, no-store
X-Request-Id: <correlation-id>
```

## Error Codes

| Status | Meaning | Action |
|--------|---------|--------|
| 200 | Healthy/Ready | Continue routing traffic |
| 503 | Not Ready | Remove from load balancer, do not restart |
| 500 | Error | Investigate, may restart |

## Implementation Notes

1. Health endpoints MUST NOT perform expensive operations
2. Ready endpoint should use connection pooling, not create new connections
3. Timeouts should be shorter than Kubernetes probe timeouts
4. Include service version for debugging deployments
