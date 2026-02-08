# Implementation Plan: Cloud-Native Kubernetes Deployment with Autonomous Agents

**Branch**: `007-cloud-native-k8s-deployment` | **Date**: 2026-01-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-cloud-native-k8s-deployment/spec.md`

## Summary

Transform the existing Phase 3 AI-powered Todo application into a production-ready, cloud-native system by containerizing all services (frontend, backend, AI agent), deploying to Kubernetes with health checks and observability, and implementing autonomous background agents that monitor tasks and generate suggestions without user prompts.

## Technical Context

**Language/Version**: TypeScript 5+ on Node.js 20 LTS (backend/AI agent), TypeScript 5+ with React/Next.js (frontend)
**Primary Dependencies**:
- Backend: Express.js/Fastify, Prisma, Better Auth, Pino (logging)
- Frontend: React 18+/Next.js 14+, Tailwind CSS
- Infrastructure: Docker, Kubernetes, Helm (optional)
- AI: OpenAI API or Claude API, node-cron (scheduling)

**Storage**: Neon Serverless PostgreSQL (existing), Kubernetes ConfigMaps/Secrets (configuration)
**Testing**: Jest/Vitest for unit tests, Supertest for API tests, kubeval for K8s manifests
**Target Platform**: Kubernetes cluster (local: minikube/kind, cloud: GKE/EKS/AKS)
**Project Type**: Web application (frontend + backend + AI agent as separate services)
**Performance Goals**:
- Health endpoints < 500ms response
- p95 API latency < 1s for 100 concurrent users
- Container images < 200MB each
- Pod recovery < 60s

**Constraints**:
- Stateless services (state in PostgreSQL)
- Non-root container execution
- Graceful shutdown with connection draining
- Rate-limited autonomous suggestions (max 10/user/hour)

**Scale/Scope**:
- 3 containerized services
- ~15-20 Kubernetes manifests (or 1 Helm chart)
- 100 concurrent users target

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity & Readability | ✅ PASS | Standard Docker/K8s patterns, no custom abstractions |
| II. Clean Code | ✅ PASS | ESLint/Prettier enforced, YAML linting for manifests |
| III. Modularity | ✅ PASS | 3 separate services, clear separation of concerns |
| IV. Security First | ✅ PASS | K8s Secrets for credentials, non-root containers, user isolation |
| V. API-First Design | ✅ PASS | New endpoints follow existing REST conventions |
| VI. AI & Agent Layer | ✅ PASS | Autonomous agents use existing API, no direct DB mutations |
| VII. Cloud-Native Infrastructure | ✅ PASS | Direct compliance - Dockerfiles, K8s manifests, health probes |
| VIII. Autonomous Agent Behavior | ✅ PASS | Suggestive only, rate-limited, user-dismissable |
| IX. Observability & Reliability | ✅ PASS | Structured JSON logging, health/ready endpoints, request tracing |

**Gate Result**: ✅ ALL PASS - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/007-cloud-native-k8s-deployment/
├── plan.md              # This file
├── research.md          # Phase 0: Technology decisions
├── data-model.md        # Phase 1: New entities (agent_suggestions)
├── quickstart.md        # Phase 1: Deployment guide
├── contracts/           # Phase 1: API contracts
│   ├── health-endpoints.md
│   └── suggestions-api.md
└── tasks.md             # Phase 2 output (created by /sp.tasks)
```

### Source Code (repository root)

```text
# Web application with 3 containerized services

backend/
├── src/
│   ├── autonomous/          # NEW: Background agent jobs
│   │   ├── scheduler.ts     # Job scheduling (node-cron)
│   │   ├── overdue-monitor.ts
│   │   ├── prioritization-agent.ts
│   │   └── suggestion-generator.ts
│   ├── routes/
│   │   ├── health.routes.ts # NEW: /health, /ready endpoints
│   │   └── suggestions.routes.ts # NEW: suggestions CRUD
│   ├── services/
│   │   └── suggestion.service.ts # NEW
│   ├── repositories/
│   │   └── suggestion.repository.ts # NEW
│   ├── middleware/
│   │   ├── request-id.middleware.ts # NEW: correlation IDs
│   │   └── logger.middleware.ts     # NEW: structured logging
│   └── config/
│       └── logger.config.ts # NEW: Pino configuration
├── prisma/
│   └── schema.prisma        # ADD: agent_suggestions table
├── Dockerfile               # NEW: Multi-stage build
├── .dockerignore            # NEW
└── package.json

frontend/
├── src/
│   ├── components/
│   │   └── SuggestionCard.tsx # NEW: Display agent suggestions
│   ├── containers/
│   │   └── SuggestionsContainer.tsx # NEW
│   ├── hooks/
│   │   └── useSuggestions.ts # NEW
│   └── services/
│       └── suggestions.api.ts # NEW
├── Dockerfile               # NEW: Multi-stage build
├── .dockerignore            # NEW
└── nginx.conf               # NEW: Production serving config

ai-agent/                    # NEW: Separate AI agent service
├── src/
│   ├── index.ts             # Entry point
│   ├── scheduler.ts         # Background job runner
│   ├── agents/
│   │   ├── overdue-agent.ts
│   │   └── prioritization-agent.ts
│   └── config/
│       └── logger.config.ts
├── Dockerfile               # NEW
├── .dockerignore            # NEW
└── package.json

k8s/                         # NEW: Kubernetes manifests
├── base/
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
├── overlays/
│   ├── development/
│   │   └── kustomization.yaml
│   └── production/
│       └── kustomization.yaml
└── secrets/
    └── secrets.yaml.example

docker-compose.yaml          # NEW: Local development stack
```

**Structure Decision**: Web application pattern with 3 separate containerized services (frontend, backend, ai-agent), using Kustomize for environment-specific Kubernetes overlays.

## Complexity Tracking

> No constitution violations requiring justification.

| Decision | Rationale | Alternative Considered |
|----------|-----------|------------------------|
| Separate AI agent service | Allows independent scaling of background jobs, isolation from request-handling code | Embedding in backend - rejected for separation of concerns |
| Kustomize over Helm | Simpler for this scope, no templating complexity | Helm - rejected as overkill for 3 services |
| Pino over Winston | Better JSON performance, lower overhead | Winston - acceptable but Pino is faster |

## Implementation Phases

### Phase 1: Infrastructure Foundation (P1 - Kubernetes Deployment)

**Goal**: All services containerized and deployable to Kubernetes

**Deliverables**:
1. Dockerfiles for backend, frontend, ai-agent (multi-stage, non-root)
2. docker-compose.yaml for local development
3. Kubernetes base manifests (namespace, deployments, services, ingress)
4. Kustomize overlays for dev/prod
5. ConfigMap and Secret templates

**Success Criteria**:
- `docker-compose up` starts all services locally
- `kubectl apply -k k8s/overlays/development` deploys to cluster
- All pods reach Running status with healthy probes

### Phase 2: Observability (P2 - Health Monitoring)

**Goal**: Structured logging and health endpoints operational

**Deliverables**:
1. Health routes (`/health`, `/ready`) for all services
2. Pino logger configuration with JSON output
3. Request ID middleware for correlation
4. Kubernetes liveness/readiness probes configured

**Success Criteria**:
- Health endpoints respond < 500ms
- Logs are structured JSON with request IDs
- Probes correctly report service health

### Phase 3: Autonomous Agents (P3 - Background Intelligence)

**Goal**: Background agents generating suggestions without user prompts

**Deliverables**:
1. Database schema: agent_suggestions table
2. Prisma migration for new table
3. Suggestion service and repository
4. Background job scheduler (node-cron)
5. Overdue task monitor agent
6. Prioritization suggestion agent
7. Suggestions API endpoints
8. Frontend suggestions panel

**Success Criteria**:
- Overdue tasks trigger suggestions within 10 minutes
- Users can view and dismiss suggestions
- Rate limiting prevents spam (max 10/user/hour)
- User preferences enable/disable agents

### Phase 4: Scalability & Resilience (P4 - Horizontal Scaling)

**Goal**: Services handle load and recover from failures

**Deliverables**:
1. Horizontal Pod Autoscaler configurations
2. Graceful shutdown handlers (SIGTERM)
3. Database connection pooling configuration
4. Pod disruption budgets

**Success Criteria**:
- Pods scale up under load
- Pods recover within 60 seconds
- No dropped requests during rolling updates

### Phase 5: Developer Experience (P5 - Local Development)

**Goal**: Developers can run full stack locally with containers

**Deliverables**:
1. docker-compose.yaml with all services
2. Volume mounts for hot reloading
3. Local development documentation
4. Environment variable templates

**Success Criteria**:
- `docker-compose up` starts in < 3 minutes
- Code changes reflect without full restart

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Database connection issues in containers | Medium | High | Connection pooling, retry logic, health checks |
| Autonomous agent overwhelms users | Low | Medium | Rate limiting (10/hour), user preferences |
| K8s manifest complexity | Low | Medium | Use Kustomize for DRY, validate with kubeval |
| Session auth across services | Medium | High | Ensure cookie domain/path correct, test early |

## Dependencies & Blockers

| Dependency | Status | Notes |
|------------|--------|-------|
| Phase 3 completion | ✅ Complete | All existing features working |
| Docker available | ✅ Available | Required for builds |
| K8s cluster access | ⚠️ Required | minikube/kind for local, cloud for prod |
| Container registry | ⚠️ Required | Docker Hub, GHCR, or cloud registry |

## Post-Phase 1 Constitution Re-Check

*To be completed after Phase 1 design artifacts are generated.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity | ⏳ Pending | Verify Dockerfiles are straightforward |
| II. Clean Code | ⏳ Pending | Verify logging/health patterns are clean |
| III. Modularity | ⏳ Pending | Verify service boundaries are correct |
| VII. Cloud-Native | ⏳ Pending | Verify all K8s requirements met |
| IX. Observability | ⏳ Pending | Verify logging/tracing implementation |
