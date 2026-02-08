# Tasks: Advanced Cloud-Native Event-Driven Deployment

**Input**: Design documents from `/specs/008-phase5-advanced-cloud-deployment/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)
**Constitution**: v5.0.0 (Phase V - Advanced Cloud-Native Event-Driven)

**Tests**: Tests are included where they validate infrastructure or
event-driven correctness. Not all tasks have dedicated test tasks.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup & Infrastructure (Shared)

**Purpose**: Extend Helm chart for DOKS, add AI-agent deployment,
Dapr sidecar annotations, secrets template, and DOKS values overlay.
Create Dapr component YAMLs for Kafka pub/sub.

- [x] T001 Bump Helm chart version from 1.0.0 to 2.0.0 in k8s/helm/todo-app/Chart.yaml (update `version` and `appVersion` fields, update `description` to "Phase V Cloud-Native Event-Driven Todo App")

- [x] T002 [P] Add `aiAgent` section and `dapr` sub-keys to k8s/helm/todo-app/values.yaml (add aiAgent with enabled, replicaCount, image, service, containerPort, dapr, resources; add `dapr.enabled` and `dapr.appId` under backend; add `secrets.enabled`, `secrets.todoAppSecrets`, `secrets.kafkaCreds`; add `postgres.enabled` toggle defaulting to true)

- [x] T003 [P] Create DOKS production values overlay at k8s/helm/todo-app/values-doks.yaml (set backend replicaCount=2, frontend replicaCount=2, aiAgent replicaCount=1; set image repositories to `registry.digitalocean.com/<registry>/todo-*`; set `pullPolicy: Always`; set `postgres.enabled: false`; set backend.dapr.enabled=true, backend.dapr.appId=backend, backend.dapr.appPort=4000; set aiAgent.dapr.enabled=true, aiAgent.dapr.appId=ai-agent, aiAgent.dapr.appPort=5000; configure ingress with NGINX className; set secrets.enabled=true; set namespace=todo-app)

- [x] T004 [P] Create AI-agent Deployment template at k8s/helm/todo-app/templates/deployment-ai-agent.yaml (Deployment with `{{ .Values.aiAgent.replicaCount }}` replicas; Dapr sidecar annotations conditionally rendered when `aiAgent.dapr.enabled`; container with image, port, resources, envFrom configMapRef, env from secret refs for DATABASE_URL/OPENAI_API_KEY/AUTH_SECRET; liveness probe on /health; readiness probe on /health; rolling update strategy with maxUnavailable=0, maxSurge=1)

- [x] T005 [P] Create AI-agent Service template at k8s/helm/todo-app/templates/service-ai-agent.yaml (ClusterIP service exposing `{{ .Values.aiAgent.service.port }}` targeting `{{ .Values.aiAgent.containerPort }}`)

- [x] T006 [P] Create Kubernetes Secrets template at k8s/helm/todo-app/templates/secrets.yaml (conditionally rendered when `secrets.enabled`; reference existing secret names `{{ .Values.secrets.todoAppSecrets }}` and `{{ .Values.secrets.kafkaCreds }}` — template documents the expected secret keys: DATABASE_URL, AUTH_SECRET, OPENAI_API_KEY for todo-app-secrets; username, password, brokers for kafka-creds)

- [x] T007 Modify backend Deployment template at k8s/helm/todo-app/templates/deployment-backend.yaml (add Dapr sidecar annotations conditionally: `dapr.io/enabled: "{{ .Values.backend.dapr.enabled }}"`, `dapr.io/app-id: "{{ .Values.backend.dapr.appId }}"`, `dapr.io/app-port: "{{ .Values.backend.containerPort }}"` in pod template metadata; add env vars from secret refs for DATABASE_URL, AUTH_SECRET, OPENAI_API_KEY; add rolling update strategy with maxUnavailable=0 and maxSurge=1)

- [x] T008 [P] Modify frontend Deployment template at k8s/helm/todo-app/templates/deployment-frontend.yaml (add optional Dapr annotations if frontend Dapr is enabled in values; add liveness probe on port 80 path / if not present)

- [x] T009 Modify ConfigMap template at k8s/helm/todo-app/templates/configmap.yaml (add entries: DAPR_HTTP_PORT=3500, DAPR_PUBSUB_NAME=pubsub-kafka, LOG_LEVEL=info, LOG_FORMAT=json, NODE_ENV from values; remove hardcoded DB_HOST and BACKEND_PORT; add BACKEND_URL for ai-agent to reach backend service)

- [x] T010 Modify Ingress template at k8s/helm/todo-app/templates/ingress.yaml (add optional `host` field from values `{{ .Values.ingress.hosts[0].host }}`; add optional TLS section; update backend port reference to use `{{ .Values.backend.service.port }}` consistently)

- [x] T011 [P] Create Dapr pubsub-kafka component at k8s/dapr/pubsub-kafka.yaml (apiVersion dapr.io/v1alpha1, kind Component, name pubsub-kafka, namespace todo-app, type pubsub.kafka, version v1; metadata: brokers from secretKeyRef kafka-creds/brokers, authType password, saslUsername from secretKeyRef kafka-creds/username, saslPassword from secretKeyRef kafka-creds/password, consumerGroup todo-app-group, disableTls false, maxMessageBytes 1048576, consumeRetryInterval 200ms)

- [x] T012 [P] Create Dapr resiliency policy at k8s/dapr/resiliency.yaml (apiVersion dapr.io/v1alpha1, kind Resiliency, name todo-resiliency, namespace todo-app; retry policy pubsubRetry: constant 2s 3 retries; circuit breaker pubsubCB: trip on 3 consecutive failures; target component pubsub-kafka outbound)

- [x] T013 [P] Update k8s/secrets/secrets.yaml.example with Kafka credential fields (add kafka-creds Secret example with username, password, brokers keys alongside existing todo-app-secrets)

- [x] T014 Validate Helm chart renders correctly by running `helm lint k8s/helm/todo-app` and `helm template todo-app k8s/helm/todo-app -f k8s/helm/todo-app/values-doks.yaml` — fix any template errors

**Checkpoint**: Helm chart v2.0.0 ready for DOKS deployment with
ai-agent, Dapr annotations, secrets, and Kafka pub/sub component.
Run `helm lint` and `helm template` to validate.

---

## Phase 2: Foundational — Event Layer (Blocking Prerequisites)

**Purpose**: Create the event type system, Dapr publisher module,
correlation middleware, and Prisma migration. This layer MUST be
complete before event publishing (US2) or agent subscriptions (US3)
can begin.

**CRITICAL**: No user story implementation can use events until this
phase is complete.

- [x] T015 Install @dapr/dapr dependency in backend by running `npm install @dapr/dapr` in backend/ directory and verify it appears in backend/package.json dependencies

- [x] T016 [P] Create event type definitions at backend/src/events/event-types.ts (export enum TaskEventType with values CREATED='tasks.created', UPDATED='tasks.updated', DELETED='tasks.deleted', COMPLETED='tasks.completed', INCOMPLETE='tasks.incomplete', OVERDUE='tasks.overdue', REMINDER='tasks.reminder'; export interface TaskEvent with fields eventType, taskId, userId, correlationId, timestamp; export interfaces TaskCreatedEvent extends TaskEvent with title, priority, dueDate, recurring; TaskUpdatedEvent with changes Record; TaskDeletedEvent; TaskCompletedEvent; TaskIncompleteEvent)

- [x] T017 [P] Create Dapr client configuration at backend/src/config/dapr.config.ts (export DAPR_HOST from env or default localhost, DAPR_HTTP_PORT from env or default 3500, PUBSUB_NAME from env DAPR_PUBSUB_NAME or default pubsub-kafka, TOPIC_NAME constant tasks-lifecycle; export lazy-initialized DaprClient singleton via getDaprClient function)

- [x] T018 Create event publisher module at backend/src/events/publisher.ts (import DaprClient from @dapr/dapr, import TaskEvent from event-types, import getLogger from logger.config, import getDaprClient and constants from dapr.config; export async function publishEvent that calls client.pubsub.publish with PUBSUB_NAME and TOPIC_NAME, logs success with eventType/taskId/correlationId, catches errors and logs without throwing — fire-and-forget pattern)

- [x] T019 [P] Create dead-letter handling utility at backend/src/events/dead-letter.ts (export async function handleDeadLetter that logs event details with error context for events that fail processing after retries; export DLQ topic name constant tasks-lifecycle-dlq)

- [x] T020 [P] Create correlation ID middleware at backend/src/middleware/correlation.middleware.ts (export function correlationMiddleware that reads x-correlation-id header or generates UUID via crypto.randomUUID, sets it on req.headers and response header, calls next)

- [x] T021 [P] Create Dapr routes at backend/src/routes/dapr.routes.ts (export Express Router; GET /dapr/subscribe returns JSON array with pubsubname pubsub-kafka, topic tasks-lifecycle, route /api/events/tasks-lifecycle; POST /api/events/tasks-lifecycle placeholder for future backend-side subscriptions returning status SUCCESS)

- [x] T022 Modify backend/src/index.ts to integrate event layer (import and use correlationMiddleware before existing requestIdMiddleware; import daprRoutes and mount at app root so /dapr/subscribe is accessible; no Dapr client initialization needed at startup — lazy init in publisher)

- [x] T023 Add sourceEvent and correlationId fields to AgentSuggestion model in backend/prisma/schema.prisma (add `sourceEvent String? @map("source_event") @db.VarChar(100)` and `correlationId String? @map("correlation_id") @db.Uuid` fields after the `expiresAt` field in the AgentSuggestion model)

- [x] T024 Run Prisma migration for event traceability by executing `npx prisma migrate dev --name add-event-traceability` in backend/ directory — verify migration creates the two new nullable columns without affecting existing data

- [x] T025 Verify backend compiles with event layer by running `npm run build` in backend/ — fix any TypeScript compilation errors

**Checkpoint**: Event layer foundation ready. Publisher module,
event types, correlation middleware, and Prisma migration all in
place. Backend compiles. User story implementation can now begin.

---

## Phase 3: User Story 1 — Deploy Core App to DOKS (Priority: P1)

**Goal**: Deploy the existing application (backend, frontend,
ai-agent) to a DigitalOcean Kubernetes cluster using the extended
Helm chart with Dapr sidecars. App accessible via public ingress URL.
All Phase I-IV features work unchanged.

**Independent Test**: Navigate to DOKS ingress public URL, sign up,
sign in, create a task, use chatbot, view suggestions. Verify Dapr
sidecars running alongside each pod via `kubectl get pods`.

- [x] T026 [US1] Build Docker images for all three services with v2.0.0 tags: `docker build -t <registry>/todo-backend:v2.0.0 ./backend`, `docker build -t <registry>/todo-frontend:v2.0.0 ./frontend`, `docker build -t <registry>/todo-ai-agent:v2.0.0 ./ai-agent` — verify all builds succeed

- [ ] T027 [US1] Push Docker images to container registry (DigitalOcean Container Registry or Docker Hub): `docker push <registry>/todo-backend:v2.0.0`, `docker push <registry>/todo-frontend:v2.0.0`, `docker push <registry>/todo-ai-agent:v2.0.0`

- [ ] T028 [US1] Provision DOKS cluster via doctl: `doctl kubernetes cluster create todo-doks --node-pool "name=default;size=s-2vcpu-4gb;count=3"` and save kubeconfig: `doctl kubernetes cluster kubeconfig save todo-doks`

- [ ] T029 [US1] Install Dapr on DOKS cluster: `dapr init -k --runtime-version 1.13.0` — verify with `dapr status -k` showing all Dapr services running

- [ ] T030 [US1] Install NGINX Ingress Controller on DOKS: `helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx && helm repo update && helm install nginx-ingress ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace` — verify with `kubectl get svc -n ingress-nginx` showing external IP

- [ ] T031 [US1] Create Kubernetes namespace and secrets: `kubectl create namespace todo-app` then create todo-app-secrets (DATABASE_URL, AUTH_SECRET, OPENAI_API_KEY) and kafka-creds (username, password, brokers) using `kubectl create secret generic` commands

- [ ] T032 [US1] Apply Dapr component YAMLs to cluster: `kubectl apply -f k8s/dapr/pubsub-kafka.yaml -n todo-app` and `kubectl apply -f k8s/dapr/resiliency.yaml -n todo-app` — verify with `dapr components -k -n todo-app`

- [ ] T033 [US1] Deploy application via Helm: `helm upgrade --install todo-app ./k8s/helm/todo-app -f k8s/helm/todo-app/values-doks.yaml -n todo-app` — verify with `helm status todo-app -n todo-app` showing deployed status

- [ ] T034 [US1] Verify deployment health: `kubectl get pods -n todo-app` shows all pods Running with 2/2 containers (app + daprd sidecar); `kubectl get ingress -n todo-app` shows assigned public IP; `curl http://<ingress-ip>/health` returns 200 OK

- [ ] T035 [US1] Smoke test all existing features via public ingress URL: sign up new user, sign in, create task via UI, create task via chatbot ("Create a task called Review PR with high priority"), verify task list shows both tasks, verify AI chatbot responds correctly, verify suggestions panel loads (SC-001 validation)

- [ ] T036 [US1] Verify Dapr sidecars are injected on backend and ai-agent pods: `kubectl get pods -n todo-app -o jsonpath='{range .items[*]}{.metadata.name}{" containers: "}{range .spec.containers[*]}{.name}{" "}{end}{"\n"}{end}'` — expect each backend/ai-agent pod to show application container + daprd container

- [x] T037 [US1] Create DOKS quickstart guide at specs/008-phase5-advanced-cloud-deployment/quickstart-doks.md documenting the complete deployment steps (cluster creation, Dapr install, NGINX Ingress, secrets, Dapr components, Helm deploy, verification commands)

**Checkpoint**: Application running on DOKS with public ingress.
All Phase I-IV features verified working. Dapr sidecars injected.
SC-001, SC-004, SC-005 validated.

---

## Phase 4: User Story 2 — Event-Driven Task Lifecycle (Priority: P2)

**Goal**: Integrate Kafka-backed event publishing into the task
service so every task lifecycle operation publishes an event to Kafka
via Dapr pub/sub. Events observable in logs/dashboard.

**Independent Test**: Create a task via UI or chatbot. Check
`kubectl logs <backend-pod> -c daprd` or Dapr dashboard for
`tasks.created` event on `tasks-lifecycle` topic. Repeat for update,
delete, complete, incomplete.

- [x] T038 [US2] Add event publishing to createTask function in backend/src/services/task.service.ts (import publishEvent from events/publisher, import TaskEventType and TaskCreatedEvent from events/event-types, import randomUUID from crypto; after `taskRepository.create` returns, call `publishEvent` with eventType CREATED, taskId task.id, userId, title task.title, priority task.priority, dueDate task.dueDate?.toISOString() or null, recurring !!task.recurrencePattern, correlationId from randomUUID, timestamp new Date().toISOString())

- [x] T039 [US2] Add event publishing to updateTask function in backend/src/services/task.service.ts (after `taskRepository.update` returns non-null, call publishEvent with eventType UPDATED, taskId, userId, changes containing the input fields, correlationId, timestamp)

- [x] T040 [US2] Add event publishing to deleteTask function in backend/src/services/task.service.ts (after `taskRepository.deleteTask` returns true, call publishEvent with eventType DELETED, taskId, userId, correlationId, timestamp)

- [x] T041 [US2] Add event publishing to markComplete function in backend/src/services/task.service.ts (after `taskRepository.markComplete` returns non-null, call publishEvent with eventType COMPLETED, taskId, userId, correlationId, timestamp; if recurring task created new instance, also publish CREATED event for the new task)

- [x] T042 [US2] Add event publishing to markIncomplete function in backend/src/services/task.service.ts (after `taskRepository.markIncomplete` returns non-null, call publishEvent with eventType INCOMPLETE, taskId, userId, correlationId, timestamp)

- [ ] T043 [US2] Rebuild and redeploy backend Docker image with event publishing: `docker build -t <registry>/todo-backend:v2.1.0 ./backend && docker push <registry>/todo-backend:v2.1.0` then update values-doks.yaml backend image tag to v2.1.0 and run `helm upgrade todo-app ./k8s/helm/todo-app -f k8s/helm/todo-app/values-doks.yaml -n todo-app`

- [ ] T044 [US2] Verify event publishing by creating a task via the UI, then checking Dapr sidecar logs: `kubectl logs <backend-pod> -c daprd -n todo-app --tail=50` — should show pub/sub publish activity for tasks-lifecycle topic; also check application logs: `kubectl logs <backend-pod> -c backend -n todo-app --tail=20` for "Event published" log entries with eventType and correlationId (SC-003 validation)

- [ ] T045 [US2] Verify all 5 event types publish correctly: create a task (tasks.created), update it (tasks.updated), mark complete (tasks.completed), mark incomplete (tasks.incomplete), delete it (tasks.deleted) — check backend logs for 5 corresponding "Event published" entries

- [ ] T046 [US2] Verify Kafka failure resilience: temporarily misconfigure Dapr pubsub (or stop Kafka if possible), create a task via UI — task MUST still be created successfully in DB, and backend logs show "Failed to publish event (fire-and-forget)" without HTTP 5xx response to client

**Checkpoint**: All 5 event types publishing to Kafka via Dapr.
Observable in sidecar logs. Fire-and-forget resilience verified.
SC-002 partially validated (publishing side), SC-003 validated.

---

## Phase 5: User Story 3 — Reactive AI Agents (Priority: P3)

**Goal**: Extend autonomous agents to subscribe to Kafka events via
Dapr pub/sub for near-real-time reactivity. Overdue agent reacts to
tasks.created, prioritization agent reacts to tasks.updated, and
completed events dismiss existing suggestions. End-to-end flow:
create overdue task → agent reacts → suggestion appears within 10s.

**Independent Test**: Create a task with a past due date via the
chatbot. Within seconds (not 5 minutes), an overdue suggestion
appears in the Suggestions panel.

- [x] T047 [US3] Install @dapr/dapr, express, and @types/express in ai-agent by running `npm install @dapr/dapr express` and `npm install -D @types/express` in ai-agent/ directory

- [x] T048 [P] [US3] Create event type definitions at ai-agent/src/events/event-types.ts (copy TaskEventType enum and all TaskEvent interfaces from backend/src/events/event-types.ts — identical content for cross-service type safety without a shared package)

- [x] T049 [P] [US3] Create EventHandlerSkill class at ai-agent/src/events/event-handler-skill.ts (export class with private handlers Map<string, Function[]>; method `on(eventType: string, handler: Function)` to register handlers; async method `dispatch(event: TaskEvent)` that looks up handlers by event.eventType and runs them with Promise.allSettled; log each dispatch with eventType, taskId, correlationId, processingDurationMs, outcome)

- [x] T050 [US3] Create event subscriber router at ai-agent/src/events/subscribers.ts (import express, import TaskEvent and TaskEventType from local event-types; export function createSubscriptionRouter returning Express Router with: GET /dapr/subscribe returning [{pubsubname: "pubsub-kafka", topic: "tasks-lifecycle", route: "/events/tasks-lifecycle"}]; POST /events/tasks-lifecycle that extracts event from req.body.data, dispatches via EventHandlerSkill instance, returns {status: "SUCCESS"} on success or {status: "RETRY"} on error; export function registerHandler that delegates to EventHandlerSkill.on)

- [x] T051 [US3] Add handleTaskCreatedEvent function to ai-agent/src/agents/overdue-agent.ts (export async function that takes TaskCreatedEvent; checks if event.dueDate exists and is in the past; queries user by event.userId to check autonomousAgentsEnabled; queries existing AgentSuggestion with same taskId and suggestionType=overdue_reminder within last 1 hour for deduplication; if not duplicate and user has agents enabled, calls createSuggestion with userId, taskId, suggestionType overdue_reminder, message about task being overdue, metadata with daysOverdue/correlationId/sourceEvent, sourceEvent event.eventType, correlationId event.correlationId)

- [x] T052 [US3] Add handleTaskUpdatedEvent function to ai-agent/src/agents/prioritization-agent.ts (export async function that takes TaskUpdatedEvent; checks if changes include priority field; queries user to check autonomousAgentsEnabled; if priority changed to high, queries user's task list to count high-priority tasks due this week; if count >= 3, dedup check then createSuggestion with type prioritization and message about multiple high-priority tasks; include sourceEvent and correlationId in suggestion)

- [x] T053 [US3] Add handleTaskCompletedEvent function to ai-agent/src/agents/overdue-agent.ts (export async function that takes TaskCompletedEvent; dismisses any existing overdue_reminder suggestions for the completed taskId by updating dismissed=true via Prisma)

- [x] T054 [US3] Modify ai-agent/src/index.ts to add Express HTTP server for Dapr subscriptions (import express; import createSubscriptionRouter and registerHandler from events/subscribers; import handleTaskCreatedEvent, handleTaskCompletedEvent from agents/overdue-agent; import handleTaskUpdatedEvent from agents/prioritization-agent; import TaskEventType from events/event-types; create Express app with json middleware and subscription router; register handlers: CREATED→handleTaskCreatedEvent, UPDATED→handleTaskUpdatedEvent, COMPLETED→handleTaskCompletedEvent; start Express server on PORT env or 5000 alongside existing scheduler initialization; update graceful shutdown to close both HTTP server and scheduler)

- [x] T055 [US3] Update ai-agent suggestion-api.service.ts to support sourceEvent and correlationId fields in createSuggestion calls (add optional sourceEvent and correlationId parameters to the suggestion creation payload sent to the backend POST /api/v1/suggestions endpoint)

- [ ] T056 [US3] Rebuild and redeploy ai-agent Docker image: `docker build -t <registry>/todo-ai-agent:v2.1.0 ./ai-agent && docker push <registry>/todo-ai-agent:v2.1.0` then update values-doks.yaml ai-agent image tag to v2.1.0 and run `helm upgrade todo-app ./k8s/helm/todo-app -f k8s/helm/todo-app/values-doks.yaml -n todo-app`

- [ ] T057 [US3] Verify end-to-end event flow: create a task with past due date via chatbot ("Add task Submit report due yesterday") — within 10 seconds verify: (a) task appears in UI, (b) backend logs show tasks.created event published, (c) ai-agent logs show event received and processed, (d) overdue suggestion appears in Suggestions panel without waiting for 5-minute cron cycle (SC-002 full validation)

- [ ] T058 [US3] Verify idempotency: create a task with past due date, then manually trigger the cron-based overdue agent run — verify only ONE overdue_reminder suggestion exists for that task (deduplication by taskId + suggestionType + 1-hour window works for both event and cron triggers)

- [ ] T059 [US3] Verify event logging: check ai-agent logs via `kubectl logs <ai-agent-pod> -c ai-agent -n todo-app` — each processed event should log eventType, taskId, userId, correlationId, processingDurationMs, and outcome (suggestion_created / skipped / error)

- [ ] T060 [US3] Verify graceful degradation: if ai-agent is restarted while events are in Kafka, events should be redelivered and processed once the agent is back up (Kafka retains messages; Dapr redelivers to new consumer)

**Checkpoint**: End-to-end event flow working. Overdue agent reacts
in near-real-time. Prioritization agent reacts to priority changes.
Completed events dismiss suggestions. Idempotency verified.
SC-002, SC-006 validated.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: HPA, dead-letter validation, documentation updates,
regression verification, and bonus target validation.

- [x] T061 [P] Create HPA template at k8s/helm/todo-app/templates/hpa.yaml (conditionally rendered when `backend.hpa.enabled`; HorizontalPodAutoscaler targeting todo-app-backend Deployment; minReplicas from values, maxReplicas from values, target CPU utilization 70%)

- [x] T062 [P] Add HPA configuration to k8s/helm/todo-app/values.yaml under backend section (add `hpa.enabled: false`, `hpa.minReplicas: 2`, `hpa.maxReplicas: 5`, `hpa.targetCPUUtilization: 70`) and to values-doks.yaml (set `hpa.enabled: true`)

- [x] T063 [P] Update DEPLOYMENT.md at project root with Phase V DOKS deployment instructions (add section for DOKS setup: cluster creation, Dapr install, NGINX Ingress, secrets, Dapr components, Helm deploy, event flow verification; reference quickstart-doks.md for full guide)

- [x] T064 [P] Update k8s/secrets/secrets.yaml.example to document all required secrets for Phase V (todo-app-secrets with DATABASE_URL, AUTH_SECRET, OPENAI_API_KEY; kafka-creds with username, password, brokers; add comments explaining each field)

- [ ] T065 Verify dead-letter handling: intentionally cause a subscriber handler to throw errors repeatedly — verify Dapr retries according to resiliency policy and eventually the event is logged as failed with full context (eventType, taskId, correlationId, error details)

- [ ] T066 Run existing Phase IV test suites to verify no regressions: `cd backend && npm test` and `cd ai-agent && npm test` — all existing tests should pass (event publishing is fire-and-forget and does not affect test behavior)

- [ ] T067 Verify CRUD operations work without Dapr sidecar (graceful degradation): run backend locally without Dapr, create/update/delete tasks — all operations succeed, publisher logs warnings about Dapr unavailability but HTTP responses are 200/201/204

- [ ] T068 Validate bonus: Reusable EventHandlerSkill — add a test handler for tasks.deleted event type in ai-agent by calling `registerHandler(TaskEventType.DELETED, handler)` without modifying subscribers.ts or any infrastructure code — verify the new handler receives events (SC-006 validation)

- [ ] T069 Validate bonus: Spec-driven blueprints — verify values-doks.yaml and pubsub-kafka.yaml match spec definitions exactly; re-read spec FR-010 and confirm all listed artifacts were generated through the spec-driven workflow

- [x] T070 Final Helm validation: run `helm lint k8s/helm/todo-app` and `helm template todo-app k8s/helm/todo-app -f k8s/helm/todo-app/values-doks.yaml` — all templates render without errors; deploy fresh on DOKS via `helm upgrade --install` to confirm portability (SC-004 validation)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS
  all user stories that use events (US2, US3)
- **US1 (Phase 3)**: Depends on Phase 1 — can run in parallel with
  Phase 2 (deployment does not require event code)
- **US2 (Phase 4)**: Depends on Phase 2 + Phase 3 (needs event layer
  code AND running DOKS cluster)
- **US3 (Phase 5)**: Depends on Phase 4 (needs events flowing through
  Kafka before agents can subscribe)
- **Polish (Phase 6)**: Depends on all user stories being complete

### Dependency Graph

```
Phase 1 (Setup)
    ├──→ Phase 2 (Event Layer) ──→ Phase 4 (US2: Publishing) ──→ Phase 5 (US3: Agents) ──→ Phase 6
    └──→ Phase 3 (US1: DOKS Deploy) ──↗
```

Phase 2 and Phase 3 can proceed in parallel after Phase 1 completes.

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 1 — no dependencies on US2/US3.
  Independently testable: app runs on DOKS.
- **US2 (P2)**: Can start after Phase 2 + Phase 3 — depends on event
  layer and running DOKS cluster. Independently testable: events
  visible in Kafka logs.
- **US3 (P3)**: Can start after US2 is complete — depends on events
  flowing through Kafka. Independently testable: create overdue task,
  suggestion appears within seconds.

### Within Each User Story

- Infrastructure/config before application code
- Models/types before services
- Services before routes/handlers
- Core implementation before integration testing
- Build + deploy before verification

### Parallel Opportunities

- T002, T003, T004, T005, T006, T008, T011, T012, T013 (Phase 1:
  different files, no dependencies between them)
- T016, T017, T019, T020, T021 (Phase 2: different files)
- T048, T049 (Phase 5: different files within ai-agent)
- T061, T062, T063, T064 (Phase 6: different files)

---

## Parallel Execution Examples

### Phase 1 (Setup) — 7 tasks can run in parallel

```
Agent A: T002 (values.yaml) + T003 (values-doks.yaml) + T009 (configmap)
Agent B: T004 (deployment-ai-agent) + T005 (service-ai-agent) + T006 (secrets)
Agent C: T011 (pubsub-kafka.yaml) + T012 (resiliency.yaml) + T013 (secrets example)
Agent D: T008 (frontend deployment)
Sequential after: T001 (Chart.yaml first), T007 (backend deployment
  depends on values structure), T010 (ingress), T014 (validation)
```

### Phase 2 (Event Layer) — 4 tasks can run in parallel

```
Agent A: T016 (event-types.ts)
Agent B: T017 (dapr.config.ts)
Agent C: T019 (dead-letter.ts) + T020 (correlation.middleware.ts)
Agent D: T021 (dapr.routes.ts)
Sequential after: T015 (npm install first), T018 (publisher needs
  types + config), T022 (index.ts needs all imports), T023-T025
  (migration + build verification)
```

### Phase 5 (Reactive Agents) — 2 tasks can run in parallel

```
Agent A: T048 (event-types.ts copy)
Agent B: T049 (event-handler-skill.ts)
Sequential after: T047 (npm install), T050-T054 (depend on types
  and skill), T055-T060 (deploy + verify)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup & Infrastructure
2. Complete Phase 2: Event Layer (blocking, but needed for later)
3. Complete Phase 3: US1 — DOKS Deployment
4. **STOP and VALIDATE**: App runs on DOKS with public URL. All
   existing features work. Dapr sidecars injected.
5. Deploy/demo if ready — this is the MVP.

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. Phase 3 (US1) → App on DOKS → **Demo: Public URL access**
3. Phase 4 (US2) → Events flowing → **Demo: Kafka pub/sub visible**
4. Phase 5 (US3) → Agents reactive → **Demo: Near-real-time
   suggestions from events**
5. Phase 6 → Polish → **Demo: HPA, dead-letter, full validation**

### Story Completion Adds Value Without Breaking Previous

- US1: App accessible publicly (all Phase IV features work)
- US2: Events flowing (CRUD unchanged, events are additive)
- US3: Agents reactive (cron still runs, events are additive path)
- Each increment is independently deployable and testable.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All Helm/YAML tasks use exact file paths matching plan.md structure
- Event publishing is fire-and-forget: Dapr failures logged, not thrown
- Dual-trigger (cron + events) dedup ensures no duplicate suggestions
