# Quickstart Guide: Cloud-Native Kubernetes Deployment

**Feature**: 007-cloud-native-k8s-deployment
**Date**: 2026-01-24

## Prerequisites

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Docker | 24+ | Container runtime |
| kubectl | 1.28+ | Kubernetes CLI |
| Node.js | 20 LTS | Local development |
| pnpm/npm | Latest | Package manager |

### Optional Tools

| Tool | Purpose |
|------|---------|
| minikube/kind | Local Kubernetes cluster |
| kubeval | Kubernetes manifest validation |
| docker-compose | Local development stack |

## Quick Start (Local Development)

### 1. Clone and Install

```bash
git clone <repository-url>
cd TODO_APP_PHASE4

# Install dependencies for all services
cd backend && pnpm install && cd ..
cd frontend && pnpm install && cd ..
cd ai-agent && pnpm install && cd ..
```

### 2. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your DATABASE_URL and API keys

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with VITE_API_BASE_URL

# AI Agent
cp ai-agent/.env.example ai-agent/.env
# Edit ai-agent/.env with database and API configuration
```

### 3. Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Services available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:4000
# - AI Agent: http://localhost:5000
```

### 4. Verify Health

```bash
# Check backend health
curl http://localhost:4000/health

# Check backend readiness
curl http://localhost:4000/ready

# Check frontend health
curl http://localhost:3000/health
```

## Kubernetes Deployment

### 1. Build Container Images

```bash
# Build all images
docker build -t todo-frontend:latest ./frontend
docker build -t todo-backend:latest ./backend
docker build -t todo-ai-agent:latest ./ai-agent

# Tag for your registry
docker tag todo-frontend:latest <registry>/todo-frontend:latest
docker tag todo-backend:latest <registry>/todo-backend:latest
docker tag todo-ai-agent:latest <registry>/todo-ai-agent:latest

# Push to registry
docker push <registry>/todo-frontend:latest
docker push <registry>/todo-backend:latest
docker push <registry>/todo-ai-agent:latest
```

### 2. Configure Secrets

```bash
# Create secrets from template
cp k8s/secrets/secrets.yaml.example k8s/secrets/secrets.yaml

# Edit secrets.yaml with base64-encoded values
# Or create secrets directly:
kubectl create secret generic todo-secrets \
  --from-literal=DATABASE_URL='postgresql://...' \
  --from-literal=AUTH_SECRET='your-secret' \
  --from-literal=OPENAI_API_KEY='sk-...' \
  -n todo-app
```

### 3. Deploy to Cluster (Helm)

```bash
# Install with Helm
helm install todo-app k8s/helm/todo-app --namespace todo-app --create-namespace

# Or upgrade an existing release
helm upgrade todo-app k8s/helm/todo-app --namespace todo-app

# Verify deployment
kubectl get pods -n todo-app
kubectl get services -n todo-app
kubectl get ingress -n todo-app
```

### 4. Verify Deployment

```bash
# Check pod status
kubectl get pods -n todo-app -w

# Check logs
kubectl logs -n todo-app -l app=backend -f

# Check health endpoints (via port-forward)
kubectl port-forward -n todo-app svc/backend 4000:4000
curl http://localhost:4000/health
curl http://localhost:4000/ready
```

## Service URLs

### Local Development (docker-compose)

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000/api/v1 |
| AI Agent | http://localhost:5000 |
| Health (Backend) | http://localhost:4000/health |

### Kubernetes (with Ingress)

| Service | URL |
|---------|-----|
| Frontend | https://todo.example.com |
| Backend API | https://todo.example.com/api/v1 |
| Health | https://todo.example.com/health |

## Configuration

### Environment Variables

#### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Better Auth secret key |
| `PORT` | No | Server port (default: 4000) |
| `LOG_LEVEL` | No | Log level: debug, info, warn, error |
| `NODE_ENV` | No | Environment: development, production |

#### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Backend API URL |

#### AI Agent

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `OPENAI_API_KEY` | Yes | OpenAI API key for suggestions |
| `BACKEND_URL` | Yes | Backend API URL for internal calls |
| `AGENT_INTERVAL_MS` | No | Check interval (default: 300000 = 5min) |
| `SUGGESTION_RATE_LIMIT` | No | Max suggestions/user/hour (default: 10) |

## Common Operations

### View Logs

```bash
# Docker Compose
docker-compose logs -f backend
docker-compose logs -f ai-agent

# Kubernetes
kubectl logs -n todo-app -l app=backend -f
kubectl logs -n todo-app -l app=ai-agent -f
```

### Restart Services

```bash
# Docker Compose
docker-compose restart backend

# Kubernetes
kubectl rollout restart deployment/backend -n todo-app
```

### Scale Services

```bash
# Kubernetes only
kubectl scale deployment/backend --replicas=3 -n todo-app
kubectl scale deployment/frontend --replicas=2 -n todo-app
```

### Database Migrations

```bash
# Run migrations
cd backend
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

## Troubleshooting

### Pod Not Starting

```bash
# Check pod events
kubectl describe pod <pod-name> -n todo-app

# Common issues:
# - ImagePullBackOff: Check image name and registry credentials
# - CrashLoopBackOff: Check logs for startup errors
# - Pending: Check resource requests vs available resources
```

### Database Connection Issues

```bash
# Verify DATABASE_URL in secrets
kubectl get secret todo-secrets -n todo-app -o jsonpath='{.data.DATABASE_URL}' | base64 -d

# Test connection from pod
kubectl exec -it <backend-pod> -n todo-app -- npm run db:test
```

### Health Check Failing

```bash
# Check readiness probe
kubectl describe pod <pod-name> -n todo-app | grep -A5 Readiness

# Test health endpoint directly
kubectl port-forward <pod-name> 4000:4000 -n todo-app
curl http://localhost:4000/ready
```

## Next Steps

1. Configure CI/CD pipeline for automated deployments
2. Set up monitoring (Prometheus, Grafana)
3. Configure custom domain and TLS certificates
4. Set up log aggregation (ELK, CloudWatch)
