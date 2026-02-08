# Implementation Tasks: Cloud-Native Kubernetes Deployment with Autonomous Agents

**Feature**: 007-cloud-native-k8s-deployment
**Created**: 2026-01-24
**Status**: Draft
**Input**: Feature specification from `/specs/007-cloud-native-k8s-deployment/spec.md`

## Implementation Strategy

**Approach**: Implement features incrementally by user story priority, with each story delivering independent value. Start with infrastructure foundation (P1) before building higher-level features.

**MVP Scope**: User Story 1 (Kubernetes deployment) - containerize services and deploy to Kubernetes cluster.

**Dependencies**: All stories depend on Phase 3 completion (existing features working).

---

## Phase 1: Setup & Project Initialization

**Goal**: Initialize project structure and development environment for cloud-native deployment.

**Independent Test**: Docker builds succeed for all services.

- [X] T001 Create ai-agent directory structure with src/, package.json
- [X] T002 [P] Create k8s/base directory structure and namespace.yaml
- [X] T003 [P] Create k8s/overlays/development and k8s/overlays/production directories
- [X] T004 [P] Create k8s/secrets directory and secrets.yaml.example
- [X] T005 [P] Create docker-compose.yaml skeleton
- [X] T006 Update backend/package.json with cloud-native dependencies (node-cron, pino)
- [X] T007 Update frontend/package.json with suggestion UI dependencies
- [X] T008 [P] Create ai-agent/package.json with required dependencies
- [X] T009 Create .dockerignore files for all services

---

## Phase 2: Foundational & Blocking Tasks

**Goal**: Establish database schema, update existing models, and prepare foundational components needed by all user stories.

**Independent Test**: Database migration succeeds and new tables exist.

- [X] T010 Update backend/prisma/schema.prisma to add autonomousAgentsEnabled field to User model
- [X] T011 Update backend/prisma/schema.prisma to add AgentSuggestion model with relationships
- [X] T012 Generate and run Prisma migration for agent_suggestions table
- [X] T013 Update backend/src/models/User.ts to include autonomousAgentsEnabled field
- [X] T014 Create backend/src/models/AgentSuggestion.ts interface
- [X] T015 Update backend/src/config/database.config.ts to include connection pooling
- [X] T016 Create backend/src/config/logger.config.ts with Pino configuration
- [X] T017 Create backend/src/middleware/request-id.middleware.ts
- [X] T018 Create backend/src/middleware/logger.middleware.ts
- [X] T019 Update backend/src/config/auth.config.ts for containerized session handling

---

## Phase 3: User Story 1 - DevOps Deploys Application to Kubernetes (Priority: P1)

**Goal**: All services containerized and deployable to Kubernetes.

**Independent Test**: Can build container images and apply Kubernetes manifests to deploy all services successfully.

- [X] T020 [P] [US1] Create backend/Dockerfile with multi-stage build and non-root user
- [X] T021 [P] [US1] Create frontend/Dockerfile with multi-stage build and nginx configuration
- [X] T022 [P] [US1] Create ai-agent/Dockerfile with multi-stage build and non-root user
- [X] T023 [P] [US1] Create backend/.dockerignore
- [X] T024 [P] [US1] Create frontend/.dockerignore
- [X] T025 [P] [US1] Create ai-agent/.dockerignore
- [X] T026 [US1] Create k8s/base/backend/deployment.yaml with resource limits and security context
- [X] T027 [US1] Create k8s/base/backend/service.yaml
- [X] T028 [US1] Create k8s/base/frontend/deployment.yaml with resource limits and security context
- [X] T029 [US1] Create k8s/base/frontend/service.yaml
- [X] T030 [US1] Create k8s/base/ai-agent/deployment.yaml with resource limits and security context
- [X] T031 [US1] Create k8s/base/ai-agent/service.yaml
- [X] T032 [US1] Create k8s/base/configmap.yaml for non-sensitive configuration
- [X] T033 [US1] Create k8s/base/ingress.yaml for external access
- [X] T034 [US1] Create k8s/base/kustomization.yaml
- [X] T035 [US1] Create k8s/overlays/development/kustomization.yaml with development-specific patches
- [X] T036 [US1] Create k8s/overlays/production/kustomization.yaml with production-specific patches
- [X] T037 [US1] Create docker-compose.yaml for local containerized development
- [ ] T038 [US1] Test building all Docker images locally with docker build
- [ ] T039 [US1] Test deploying to local Kubernetes cluster with kubectl apply

---

## Phase 4: User Story 2 - Operations Team Monitors System Health (Priority: P2)

**Goal**: Structured logging and health endpoints operational.

**Independent Test**: Health endpoints respond within 500ms and logs are structured JSON with request IDs.

- [X] T040 [P] [US2] Create backend/src/routes/health.routes.ts with /health and /ready endpoints
- [X] T041 [P] [US2] Create backend/src/controllers/health.controller.ts with health check logic
- [X] T042 [P] [US2] Create backend/src/services/health.service.ts with database connectivity check
- [X] T043 [US2] Update backend/src/app.ts to register health routes
- [X] T044 [US2] Configure Kubernetes liveness and readiness probes in backend deployment
- [X] T045 [US2] Configure Kubernetes liveness and readiness probes in frontend deployment
- [X] T046 [US2] Configure Kubernetes liveness and readiness probes in ai-agent deployment
- [X] T047 [US2] Update backend/src/middleware/logger.middleware.ts to include request IDs in logs
- [X] T048 [US2] Update backend/src/config/logger.config.ts to output structured JSON logs
- [X] T049 [US2] Add structured logging to all backend controllers and services
- [X] T050 [US2] Add request ID propagation to backend HTTP clients
- [ ] T051 [US2] Test health endpoints respond within 500ms
- [ ] T052 [US2] Verify logs are structured JSON with request IDs and timestamps

---

## Phase 5: User Story 3 - User Receives Proactive Task Suggestions (Priority: P3)

**Goal**: Background agents generating suggestions without user prompts.

**Independent Test**: Overdue tasks trigger suggestions within 10 minutes and users can view/dismiss them.

- [X] T053 [P] [US3] Create backend/src/repositories/suggestion.repository.ts for agent_suggestions CRUD
- [X] T054 [P] [US3] Create backend/src/services/suggestion.service.ts with business logic
- [X] T055 [P] [US3] Create backend/src/routes/suggestions.routes.ts for API endpoints
- [X] T056 [P] [US3] Create backend/src/controllers/suggestions.controller.ts
- [X] T057 [P] [US3] Create backend/src/routes/user-preferences.routes.ts for autonomous agent settings
- [X] T058 [P] [US3] Create backend/src/controllers/user-preferences.controller.ts
- [X] T059 [US3] Create ai-agent/src/index.ts as main entry point
- [X] T060 [US3] Create ai-agent/src/scheduler.ts with node-cron job scheduling
- [X] T061 [US3] Create ai-agent/src/agents/overdue-agent.ts for overdue task monitoring
- [X] T062 [US3] Create ai-agent/src/agents/prioritization-agent.ts for priority suggestions
- [X] T063 [US3] Create ai-agent/src/services/suggestion-api.service.ts for calling backend API
- [X] T064 [US3] Create ai-agent/src/utils/rate-limiter.ts for user suggestion rate limiting
- [X] T065 [US3] Create backend/src/utils/rate-limiter.ts for API-level rate limiting
- [ ] T066 [US3] Update backend/src/services/task.service.ts to include suggestion triggers
- [X] T067 [US3] Create frontend/src/services/suggestions.api.ts for frontend API calls
- [X] T068 [US3] Create frontend/src/components/SuggestionCard.tsx for displaying suggestions
- [X] T069 [US3] Create frontend/src/containers/SuggestionsContainer.tsx for managing suggestions
- [X] T070 [US3] Create frontend/src/hooks/useSuggestions.ts for suggestion state management
- [ ] T071 [US3] Add suggestions panel to frontend dashboard UI
- [ ] T072 [US3] Test overdue task generates suggestion within 10 minutes
- [ ] T073 [US3] Test user can view and dismiss suggestions
- [ ] T074 [US3] Test rate limiting prevents more than 10 suggestions per user per hour

---

## Phase 6: User Story 4 - System Scales Under Load (Priority: P4)

**Goal**: Services handle load and recover from failures.

**Independent Test**: Services scale up under load and recover within 60 seconds after failure.

- [X] T075 [P] [US4] Create k8s/base/horizontal-pod-autoscaler.yaml for backend
- [X] T076 [P] [US4] Create k8s/base/horizontal-pod-autoscaler.yaml for frontend
- [X] T077 [P] [US4] Create k8s/base/pod-disruption-budget.yaml for all services
- [X] T078 [US4] Update backend/src/index.ts to handle SIGTERM gracefully
- [X] T079 [US4] Update ai-agent/src/index.ts to handle SIGTERM gracefully
- [X] T080 [US4] Implement connection draining in backend shutdown sequence
- [X] T081 [US4] Implement connection draining in ai-agent shutdown sequence
- [ ] T082 [US4] Test pod recovery completes within 60 seconds
- [ ] T083 [US4] Test horizontal scaling under simulated load

---

## Phase 7: User Story 5 - Developer Runs Application Locally with Containers (Priority: P5)

**Goal**: Developers can run full stack locally with containers.

**Independent Test**: `docker-compose up` starts all services in under 3 minutes.

- [X] T084 [P] [US5] Update docker-compose.yaml with all three services and proper networking
- [X] T085 [P] [US5] Add volume mounts to docker-compose.yaml for hot reloading
- [X] T086 [US5] Add database service to docker-compose.yaml for local development
- [X] T087 [US5] Add environment configuration to docker-compose.yaml
- [X] T088 [US5] Create docker-compose.override.yaml for development-specific overrides
- [X] T089 [US5] Update backend/src/config/database.config.ts for containerized database connection
- [X] T090 [US5] Update ai-agent/src/config/database.config.ts for containerized database connection
- [ ] T091 [US5] Test docker-compose up starts all services in under 3 minutes
- [ ] T092 [US5] Test code changes in mounted volumes reflect without restart

---

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Final integration, testing, and documentation.

**Independent Test**: All existing features continue to work alongside new cloud-native functionality.

- [X] T093 Update README.md with Kubernetes deployment instructions
- [ ] T094 Update CLAUDE.md with Phase 4 agent rules and constraints
- [ ] T095 Add health check tests to backend test suite
- [ ] T096 Add suggestion API tests to backend test suite
- [ ] T097 Add frontend suggestion component tests
- [ ] T098 Run full test suite to verify backward compatibility
- [ ] T099 Deploy to staging environment and run integration tests
- [ ] T100 Document troubleshooting guide for common deployment issues

---

## Dependencies Between User Stories

- **US2 (Operations Health)** depends on: US1 (Infrastructure foundation)
- **US3 (Autonomous Agents)** depends on: US1 (Infrastructure foundation), US2 (Observability)
- **US4 (Scaling)** depends on: US1 (Infrastructure foundation)
- **US5 (Developer Experience)** depends on: US1 (Infrastructure foundation)

## Parallel Execution Opportunities

1. **Within US1**: Dockerfiles for each service can be created in parallel (T020-T025)
2. **Within US1**: Kubernetes manifests for each service can be created in parallel (T026-T031)
3. **Within US2**: Route/controller pairs can be created in parallel (T040-T042)
4. **Within US3**: Different agent types can be developed in parallel (T061-T062)
5. **Within US3**: Frontend components can be developed in parallel (T067-T069)

## Test Strategy

- **Unit Tests**: Individual components and services (T095-T097)
- **Integration Tests**: API endpoints and service interactions
- **End-to-End Tests**: Full user workflows with deployed services
- **Backward Compatibility**: Ensure all Phase 3 features continue to work (T098)

## Success Criteria Verification

Each user story will be validated against its acceptance criteria:
- US1: Verify docker-compose and kubectl deployment success
- US2: Verify health endpoint response times and log structure
- US3: Verify suggestion generation and user interaction
- US4: Verify scaling and recovery behavior
- US5: Verify local development workflow
