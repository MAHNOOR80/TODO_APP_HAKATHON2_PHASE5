# Feature Specification: Advanced Cloud-Native Event-Driven Deployment

**Feature Branch**: `008-phase5-advanced-cloud-deployment`
**Created**: 2026-02-01
**Status**: Draft
**Constitution**: v5.0.0 (Phase V - Advanced Cloud-Native Event-Driven)
**Input**: User description: "Evolve the Todo app to a fully distributed,
production-grade cloud system on DOKS with event-driven Kafka/Dapr
decoupling, reactive AI agents, and spec-driven infrastructure blueprints."

---

## User Scenarios & Testing

### User Story 1 - Deploy Core App to DOKS with Helm and Dapr (Priority: P1)

As a developer, I deploy the existing Todo application (backend,
frontend, ai-agent) to a DigitalOcean Kubernetes (DOKS) cluster using
the existing Helm chart — parameterized for DOKS — with Dapr sidecars
injected on all services and public access via NGINX Ingress, so that
the application is accessible on a public URL and all Phase I-IV
features continue to work unchanged.

**Why this priority**: Without a running DOKS cluster with working
ingress, no other Phase V work (events, agent reactivity) can proceed.
This is the MVP: the app runs publicly on managed Kubernetes.

**Independent Test**: Navigate to the DOKS ingress public URL in a
browser. Sign up, sign in, create a task, use the chatbot to create
another task, view suggestions — all existing functionality works.
Verify Dapr sidecars are running alongside each pod.

**Acceptance Scenarios**:

1. **Given** a provisioned DOKS cluster (3-node pool) with `doctl`
   kubeconfig saved locally,
   **When** the operator runs
   `helm upgrade --install todo-app ./k8s/helm/todo-app -f values-doks.yaml`,
   **Then** all three services (frontend, backend, ai-agent) deploy
   successfully with `Running` status, Dapr sidecars injected
   (`daprd` container visible in each pod), and NGINX Ingress returns
   HTTP 200 on the public IP/hostname.

2. **Given** the application is deployed on DOKS with Dapr sidecars,
   **When** a user navigates to the public ingress URL,
   **Then** the frontend loads, sign-up/sign-in flows work, and all
   task CRUD operations (create, read, update, delete, complete,
   filter, search, sort) function identically to Phase IV.

3. **Given** the application is deployed on DOKS,
   **When** a user opens the AI chatbot and types
   "Create a task called Review PR with high priority",
   **Then** the chatbot creates the task via the backend API, the task
   appears in the task list, and the AI responds with confirmation —
   same behavior as Phase IV.

4. **Given** Kubernetes Secrets are configured for DATABASE_URL,
   AUTH_SECRET, OPENAI_API_KEY, and kafka-creds,
   **When** the Helm chart is deployed,
   **Then** no secrets are exposed in ConfigMaps, pod specs, or
   container environment variable listings (verified via
   `kubectl describe pod`), and all secrets are mounted from
   Kubernetes Secret objects.

5. **Given** the DOKS deployment uses parameterized Helm values,
   **When** the operator inspects `values-doks.yaml`,
   **Then** it contains DOKS-specific overrides: external Neon
   DATABASE_URL reference, ingress host/IP, container registry
   paths, replica counts (>=2 for backend, >=2 for frontend,
   >=1 for ai-agent), and Dapr annotation flags.

6. **Given** the backend and ai-agent deployments have Dapr sidecar
   annotations (`dapr.io/enabled: "true"`, `dapr.io/app-id`,
   `dapr.io/app-port`),
   **When** the pods start,
   **Then** each pod has two containers: the application container
   and the `daprd` sidecar container, verified via
   `kubectl get pods -o jsonpath='{.spec.containers[*].name}'`.

7. **Given** the DOKS cluster has NGINX Ingress Controller installed,
   **When** external traffic arrives at the ingress IP,
   **Then** requests to `/api/*` route to the backend service and
   requests to `/*` route to the frontend service, with TLS if a
   certificate is configured.

8. **Given** all services are deployed with health probes,
   **When** a service crashes or becomes unresponsive,
   **Then** Kubernetes restarts the pod automatically (liveness probe
   failure triggers restart), and the readiness probe removes the
   pod from the Service endpoint until it recovers.

---

### User Story 2 - Event-Driven Task Lifecycle with Kafka and Dapr (Priority: P2)

As a developer, I integrate Kafka-backed event publishing into the
task service so that every task lifecycle operation (create, update,
delete, complete, incomplete) publishes an event to Kafka via the
Dapr pub/sub component, and subscriber services can consume these
events reliably, so that the system is decoupled and ready for
event-reactive agents.

**Why this priority**: Event publishing is the foundation for P3
(agent reactivity). Without events flowing through Kafka, agents
cannot subscribe. This story establishes the messaging backbone.

**Independent Test**: Create a task via the UI or chatbot. Verify
(via Dapr dashboard or Kafka consumer CLI) that a `tasks.created`
event appears on the Kafka topic with correct payload. Repeat for
update, delete, complete, incomplete operations.

**Acceptance Scenarios**:

1. **Given** DigitalOcean Managed Kafka is provisioned with a broker
   URL, SASL credentials, and TLS enabled,
   **When** the Dapr pubsub-kafka component YAML is applied to the
   cluster with `kubectl apply -f k8s/dapr/pubsub-kafka.yaml`,
   **Then** Dapr recognizes the component (visible in
   `dapr components -k`) and the backend can publish messages to
   Kafka topics.

2. **Given** the Dapr pubsub-kafka component is configured and
   the backend has the Dapr SDK installed (`@dapr/dapr`),
   **When** a user creates a task via `POST /api/v1/tasks`,
   **Then** the task service publishes a `tasks.created` event
   to the `tasks-lifecycle` topic via Dapr pub/sub **after**
   successful database persistence, with payload:
   ```json
   {
     "eventType": "tasks.created",
     "taskId": "<uuid>",
     "userId": "<uuid>",
     "title": "...",
     "priority": "...",
     "dueDate": "...",
     "recurring": false,
     "correlationId": "<uuid>",
     "timestamp": "2026-02-01T12:00:00Z"
   }
   ```

3. **Given** the event publishing is integrated into the task service,
   **When** a user updates a task via `PUT /api/v1/tasks/:id`,
   **Then** a `tasks.updated` event is published with the `changes`
   field containing only the modified fields.

4. **Given** the event publishing is integrated,
   **When** a user deletes a task via `DELETE /api/v1/tasks/:id`,
   **Then** a `tasks.deleted` event is published with taskId and
   userId.

5. **Given** the event publishing is integrated,
   **When** a user marks a task complete or incomplete,
   **Then** a `tasks.completed` or `tasks.incomplete` event is
   published respectively.

6. **Given** the Dapr pub/sub component is configured,
   **When** a subscriber endpoint is registered at
   `POST /dapr/subscribe` (or via programmatic subscription),
   **Then** the subscriber receives events from the
   `tasks-lifecycle` topic with at-least-once delivery guarantee.

7. **Given** event publishing is integrated into the task service,
   **When** Kafka is temporarily unavailable (broker down),
   **Then** the HTTP response to the client succeeds (task is
   persisted), the event publishing failure is logged with
   correlation ID, and Dapr retries publishing according to its
   resiliency policy.

8. **Given** an event subscriber processes a `tasks.created` event,
   **When** the same event is delivered again (duplicate due to
   at-least-once semantics),
   **Then** the subscriber handles it idempotently (no duplicate
   side effects — e.g., no duplicate suggestions created).

9. **Given** the Dapr pubsub-kafka component YAML is generated
   from the spec-driven workflow,
   **Then** the YAML contains: correct broker URL from Kubernetes
   Secret reference, `authType: password`, SASL credentials from
   `kafka-creds` Secret, `consumerGroup: todo-app-group`,
   `disableTls: "false"`.

---

### User Story 3 - Reactive AI Agents Subscribe to Events (Priority: P3)

As a developer, I extend the existing autonomous agents (overdue
monitor, prioritization agent, scheduler) to subscribe to Kafka
events via Dapr pub/sub, so that agents react in near-real-time
to task lifecycle events (e.g., a newly created task with a due
date triggers an overdue check scheduling) rather than relying
solely on periodic polling, delivering faster and more relevant
suggestions to users.

**Why this priority**: This is the intelligence layer that makes
the event-driven architecture meaningful. Without reactive agents,
events flow but nothing acts on them. This story delivers the
"event flow → agent reacts → suggestion visible" end-to-end chain.

**Independent Test**: Create a task with a past due date via the
chatbot. Within seconds (not minutes), an overdue suggestion
appears in the Suggestions panel — triggered by the `tasks.created`
event, not by the 5-minute cron poll.

**Acceptance Scenarios**:

1. **Given** the ai-agent service has a Dapr sidecar and subscribes
   to the `tasks-lifecycle` topic,
   **When** a `tasks.created` event is published (task has a due
   date in the past),
   **Then** the overdue agent processes the event and creates an
   `overdue_reminder` suggestion within 5 seconds (vs. up to
   5 minutes with cron-only polling).

2. **Given** the ai-agent service subscribes to `tasks.created`,
   **When** a `tasks.created` event arrives for a task with a
   future due date,
   **Then** the agent schedules a reminder event
   (`tasks.reminder`) to be published at
   `dueDate - reminderOffsetMinutes`, using the existing
   scheduler infrastructure.

3. **Given** the ai-agent subscribes to `tasks.updated`,
   **When** a task's priority is changed from `low` to `high`,
   **Then** the prioritization agent evaluates the user's task
   list and optionally generates a `prioritization` suggestion
   (e.g., "You now have 3 high-priority tasks due this week.
   Consider rescheduling lower-priority items.").

4. **Given** the ai-agent subscribes to `tasks.completed`,
   **When** a recurring task is completed (triggering a new
   instance with the next due date),
   **Then** the agent processes both the `tasks.completed` event
   (dismisses existing overdue suggestions for that task) and the
   subsequent `tasks.created` event (schedules a new reminder for
   the next instance).

5. **Given** the agent processes events via Dapr pub/sub,
   **When** the same `tasks.created` event is delivered twice
   (Kafka at-least-once),
   **Then** the agent checks for existing suggestions with the
   same taskId and suggestionType before creating a new one
   (idempotent processing — no duplicate suggestions).

6. **Given** the cron-based scheduler still runs on its existing
   schedule (every 5 minutes for overdue, every 15 for
   prioritization),
   **When** both cron and event-driven checks detect the same
   overdue task,
   **Then** only one suggestion is created (deduplication by
   taskId + suggestionType + time window).

7. **Given** the ai-agent service is deployed with the Dapr
   sidecar,
   **When** the agent processes events,
   **Then** each processed event is logged with: eventType,
   taskId, userId, correlationId, processingDurationMs, and
   outcome (suggestion_created / skipped / error).

8. **Given** an event cannot be processed after 3 retries
   (e.g., database connection failure during suggestion
   creation),
   **Then** the event is routed to a dead-letter topic
   (`tasks-lifecycle-dlq`), logged as an error with full
   context, and does not block processing of subsequent events.

9. **Given** the end-to-end flow is working,
   **When** a user creates a task via the chatbot with
   "Add task Submit report due yesterday",
   **Then** within 10 seconds: (a) the task appears in the UI,
   (b) a `tasks.created` event is published, (c) the overdue
   agent processes it, (d) an overdue suggestion appears in the
   Suggestions panel, and (e) the chatbot can reference the
   suggestion if asked.

---

### Edge Cases

- **Kafka broker unavailable**: Dapr resiliency policy retries
  publishing. Task CRUD HTTP responses succeed regardless (event
  publishing is fire-and-forget from the API perspective). Events
  are retried by Dapr up to a configurable limit.
- **High event volume**: Kafka partitions handle throughput. Dapr
  consumer groups ensure each subscriber instance processes a
  subset of messages. Agent rate limiting (10 suggestions/user/hr)
  prevents suggestion spam even under high event rates.
- **Destructive operations via chatbot**: Confirmation flow from
  Phase IV is preserved. The chatbot asks for confirmation before
  delete operations. The `tasks.deleted` event is only published
  after confirmed deletion.
- **Secret rotation**: All secrets are in Kubernetes Secrets. Helm
  values reference Secret names, not values. Rotation requires
  updating the Secret and restarting pods (or using secret
  rotation controllers).
- **Cluster recreation / portability**: `values-doks.yaml` and
  Dapr component YAMLs are fully declarative. A new DOKS cluster
  can be bootstrapped by: (1) `dapr init -k`, (2) install
  NGINX Ingress, (3) apply secrets, (4) `helm install`.
- **Agent disabled by user**: If `autonomousAgentsEnabled` is
  false for a user, event-driven suggestions MUST NOT be created
  for that user, even if events for their tasks are consumed.
- **Duplicate events**: All subscribers MUST be idempotent.
  Overdue agent deduplicates by checking existing suggestions
  with same taskId + type within a 1-hour window.
- **Dapr sidecar not injected**: If Dapr annotation is missing,
  the application MUST still start (Dapr SDK calls fail gracefully
  with logged warnings). Events are not published but CRUD works.
- **Network partition between services**: Dapr handles retries
  and circuit breaking. Kafka durability ensures events are not
  lost even if consumers are temporarily unreachable.

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST deploy backend, frontend, and ai-agent
  services to a DigitalOcean Kubernetes (DOKS) cluster using Helm
  with parameterized `values-doks.yaml` overrides for external
  Kafka broker URL, Neon DATABASE_URL, ingress host, container
  registry, and replica counts.

- **FR-002**: System MUST install and configure Dapr v1.13+ in the
  DOKS cluster with sidecar injection enabled. All three service
  deployments (backend, frontend, ai-agent) MUST include Dapr
  annotations (`dapr.io/enabled: "true"`, `dapr.io/app-id`,
  `dapr.io/app-port`) in their Helm templates.

- **FR-003**: System MUST use DigitalOcean Managed Kafka as the
  messaging broker. A Dapr pubsub-kafka component YAML MUST be
  generated with: broker URL from Kubernetes Secret, SASL/password
  auth from `kafka-creds` Secret, TLS enabled
  (`disableTls: "false"`), and consumer group `todo-app-group`.

- **FR-004**: The backend task service
  (`backend/src/services/task.service.ts`) MUST publish events to
  Kafka via the Dapr pub/sub SDK after successful database
  persistence for the following operations:
  - `tasks.created` on task creation
  - `tasks.updated` on task update
  - `tasks.deleted` on task deletion
  - `tasks.completed` on marking a task complete
  - `tasks.incomplete` on marking a task incomplete
  Each event MUST include: `eventType`, `taskId`, `userId`,
  `correlationId` (UUID), `timestamp` (ISO 8601), and
  operation-specific fields.

- **FR-005**: The ai-agent service MUST subscribe to the
  `tasks-lifecycle` Kafka topic via Dapr pub/sub. The overdue
  agent MUST react to `tasks.created` events (check if task is
  already overdue), the prioritization agent MUST react to
  `tasks.updated` events (re-evaluate priority suggestions), and
  the scheduler MUST react to `tasks.created` events with future
  due dates (schedule `tasks.reminder` events).

- **FR-006**: The existing chatbot integration (OpenAI Agents SDK,
  ChatKit, MCP) MUST continue to function unchanged. Natural
  language commands that create/update/delete tasks trigger events
  indirectly via the task service (chatbot -> backend API -> task
  service -> event published). The chatbot itself does NOT publish
  events directly.

- **FR-007**: All secrets (Kafka SASL credentials, Neon DATABASE_URL,
  OpenAI API key, AUTH_SECRET) MUST be stored in Kubernetes Secrets
  and referenced by name in Helm values. No secrets in ConfigMaps,
  environment variable literals in manifests, or baked into Docker
  images.

- **FR-008**: System MUST support observability for event flows:
  structured JSON logs with correlation IDs for event publishing
  and consumption, Dapr dashboard access for pub/sub inspection,
  and logged metrics for event processing latency and consumer lag.

- **FR-009**: Backend and ai-agent deployments MUST support
  horizontal scaling via `replicaCount >= 2` in Helm values. If
  time permits, HorizontalPodAutoscaler (HPA) MUST be configured
  for the backend service based on CPU utilization.

- **FR-010**: The spec-driven workflow MUST produce the following
  infrastructure artifacts:
  - `k8s/helm/todo-app/values-doks.yaml` (DOKS Helm overrides)
  - `k8s/dapr/pubsub-kafka.yaml` (Dapr pub/sub component)
  - Event type definitions
    (`backend/src/events/event-types.ts`)
  - Event publisher module
    (`backend/src/events/publisher.ts`)
  - Event subscriber module
    (`ai-agent/src/events/subscribers.ts` or
    `backend/src/events/subscribers.ts`)

### Key Entities

- **Event**: A JSON message published to Kafka representing a task
  lifecycle action. Fields: `eventType` (string enum), `taskId`
  (UUID), `userId` (UUID), `correlationId` (UUID), `timestamp`
  (ISO 8601), plus operation-specific fields (`title`, `changes`,
  `dueDate`, `priority`, `recurring`).

- **Kafka Topic**: `tasks-lifecycle` — single topic for all task
  events, partitioned by `userId` for ordered per-user processing.
  Dead-letter topic: `tasks-lifecycle-dlq` for failed processing.

- **Dapr Pub/Sub Component**: `pubsub-kafka` — Dapr component of
  type `pubsub.kafka` connecting to DigitalOcean Managed Kafka
  with SASL auth, TLS, and consumer group configuration.

- **Agent Skill (event-handler)**: A reusable module within the
  ai-agent service that subscribes to specific event types and
  dispatches to the appropriate agent (overdue, prioritization,
  reminder). Pattern: `onTaskCreated()`, `onTaskUpdated()`,
  `onTaskCompleted()`.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Application is accessible via a public DOKS ingress
  URL. A user can navigate to the URL, sign up, sign in, and
  perform all task operations. Verified by: HTTP 200 response on
  the ingress URL, successful task creation, and chatbot
  interaction.

- **SC-002**: End-to-end event flow is demonstrable: Create a task
  with a past due date via the chatbot -> `tasks.created` event
  published to Kafka -> overdue agent processes event -> overdue
  suggestion appears in the Suggestions panel within 10 seconds.
  Verified by: UI observation and Dapr dashboard / Kafka consumer
  log inspection.

- **SC-003**: Dapr pub/sub traffic is observable. At least one of:
  (a) Dapr dashboard shows message counts on the `tasks-lifecycle`
  topic, (b) `kubectl logs` of the daprd sidecar shows pub/sub
  activity, (c) Kafka consumer lag is visible via DO Kafka
  monitoring or CLI tools.

- **SC-004**: `helm upgrade --install todo-app ./k8s/helm/todo-app
  -f values-doks.yaml` deploys cleanly on a fresh DOKS cluster
  with no manual edits beyond configuring secrets. Verified by:
  successful Helm release status (`helm status todo-app` shows
  `deployed`).

- **SC-005**: Zero-downtime deployment is achievable. Running
  `helm upgrade` with a new image tag does NOT cause HTTP 5xx
  errors during rollout. Verified by: rolling update strategy in
  Helm templates (`maxUnavailable: 0`, `maxSurge: 1`) and a
  continuous health check during upgrade.

- **SC-006** (Bonus): Agent event-handler skill is reusable —
  adding a new event type (e.g., `tasks.reminder`) requires only
  adding a handler function and registering it, not modifying
  subscriber infrastructure. Spec-driven blueprint generation
  produces `values-doks.yaml` and `pubsub-kafka.yaml` from spec
  definitions.

---

## Technical Context

**Language/Version**: TypeScript 5+ on Node.js 20 LTS
**Primary Dependencies**: Express.js, Prisma, Better Auth, Pino,
  OpenAI SDK, @dapr/dapr (new), node-cron
**Storage**: Neon Serverless PostgreSQL (external), Kafka (DO Managed)
**Testing**: Jest (backend), Vitest (frontend), kubectl dry-run (K8s)
**Target Platform**: DigitalOcean Kubernetes (DOKS), 3-node pool
**Project Type**: Web application (frontend + backend + ai-agent)
**Performance Goals**: <500ms event processing latency, <200ms API p95
**Constraints**: DOKS smallest viable node size, DO Managed Kafka
  (not self-hosted), Dapr v1.13+, TLS required for Kafka
**Scale/Scope**: 100+ concurrent users, 3 services, 7 event types

---

## Existing Codebase Reference

### What Already Exists (Phase IV - Complete)

| Component | Location | Status |
|---|---|---|
| Backend Express API | `backend/src/` | Complete, 127-line task.service.ts |
| Frontend React+Vite | `frontend/src/` | Complete, all pages/components |
| AI Agent Service | `ai-agent/src/` | Complete, cron scheduler + 2 agents |
| Helm Chart v1.0.0 | `k8s/helm/todo-app/` | Complete, 8 templates, values.yaml |
| Dockerfiles | `backend/`, `frontend/`, `ai-agent/` | Complete, multi-stage, non-root |
| Docker Compose | Root | Complete, 4 services |
| Prisma Schema | `backend/prisma/schema.prisma` | Complete, 5 models |
| Health Endpoints | Backend + AI Agent | Complete, /health + /ready |
| Auth (Better Auth) | `backend/src/config/auth.config.ts` | Complete, session-based |
| AI Chatbot | `backend/src/ai/agent.ts` | Complete, intent detection |

### What Must Be Created (Phase V - New)

| Artifact | Location | Purpose |
|---|---|---|
| DOKS Helm Values | `k8s/helm/todo-app/values-doks.yaml` | DOKS-specific overrides |
| Dapr Pub/Sub YAML | `k8s/dapr/pubsub-kafka.yaml` | Kafka component config |
| Event Types | `backend/src/events/event-types.ts` | Type definitions |
| Event Publisher | `backend/src/events/publisher.ts` | Dapr SDK pub/sub wrapper |
| Event Subscribers | `ai-agent/src/events/subscribers.ts` | Agent event handlers |
| Dead-Letter Handler | `backend/src/events/dead-letter.ts` | DLQ processing |
| Dapr Routes | `backend/src/routes/dapr.routes.ts` | Subscription endpoints |
| Dapr Config | `backend/src/config/dapr.config.ts` | Dapr SDK configuration |
| Correlation MW | `backend/src/middleware/correlation.middleware.ts` | Correlation ID propagation |
| Chart.yaml Update | `k8s/helm/todo-app/Chart.yaml` | Version bump to 2.0.0 |
| HPA Template | `k8s/helm/todo-app/templates/hpa.yaml` | Autoscaler config |
| Dapr Annotations | Helm deployment templates | Sidecar injection |

### What Must Be Modified (Phase V - Changed)

| File | Change |
|---|---|
| `backend/src/services/task.service.ts` | Add event publishing after each CRUD operation |
| `backend/src/index.ts` | Initialize Dapr client, register subscription endpoints |
| `backend/package.json` | Add `@dapr/dapr` dependency |
| `ai-agent/src/scheduler.ts` | Add event subscription alongside cron |
| `ai-agent/src/agents/overdue-agent.ts` | Add event-driven handler `onTaskCreated()` |
| `ai-agent/src/agents/prioritization-agent.ts` | Add event-driven handler `onTaskUpdated()` |
| `ai-agent/src/index.ts` | Initialize Dapr server for subscriptions |
| `ai-agent/package.json` | Add `@dapr/dapr` dependency |
| `k8s/helm/todo-app/values.yaml` | Add Dapr annotation defaults, ai-agent section |
| Helm deployment templates | Add Dapr sidecar annotations |
| `backend/prisma/schema.prisma` | Add `sourceEvent` and `correlationId` to AgentSuggestion |

---

## Non-Functional Requirements

### Performance
- API p95 latency: <200ms for CRUD operations (unchanged from Phase IV)
- Event publishing overhead: <50ms added to CRUD response time
- Event processing latency: <500ms from publish to subscriber
  processing (measured via correlation ID timestamps)
- Kafka consumer lag: <100 messages under normal load

### Reliability
- Kafka unavailability MUST NOT cause HTTP 5xx responses
- Event delivery: at-least-once (Kafka + Dapr guarantee)
- Dead-letter queue for events failing after 3 retries
- Graceful degradation: if Dapr sidecar is not available, CRUD
  operations work without event publishing (logged warning)

### Security
- Kafka auth: SASL/SCRAM + TLS (no plaintext)
- Dapr mTLS: enabled where supported
- Kubernetes Secrets for all credentials
- Event payloads: no secrets, passwords, or full user records —
  only IDs, titles, and operational fields
- Container security: non-root, Alpine base, multi-stage builds

### Observability
- Structured JSON logs with correlation ID on every event
- Dapr dashboard accessible (port-forward or ingress)
- Log event processing metrics: eventType, taskId, correlationId,
  processingDurationMs, outcome
- Kafka consumer lag monitoring via DO Kafka dashboard

---

## Deployment Blueprint

### DOKS Cluster Setup (Pre-Requisites)

1. Provision DOKS cluster: `doctl kubernetes cluster create todo-doks
   --node-pool "name=default;size=s-2vcpu-4gb;count=3"`
2. Save kubeconfig: `doctl kubernetes cluster kubeconfig save todo-doks`
3. Install Dapr: `dapr init -k --runtime-version 1.13.0`
4. Install NGINX Ingress: `helm repo add ingress-nginx
   https://kubernetes.github.io/ingress-nginx &&
   helm install nginx-ingress ingress-nginx/ingress-nginx`
5. Create namespace: `kubectl create namespace todo-app`
6. Create secrets:
   ```bash
   kubectl create secret generic todo-app-secrets \
     --namespace todo-app \
     --from-literal=DATABASE_URL='<neon-url>' \
     --from-literal=AUTH_SECRET='<secret>' \
     --from-literal=OPENAI_API_KEY='<key>'

   kubectl create secret generic kafka-creds \
     --namespace todo-app \
     --from-literal=username='<kafka-user>' \
     --from-literal=password='<kafka-pass>'
   ```
7. Apply Dapr components: `kubectl apply -f k8s/dapr/`
8. Deploy: `helm upgrade --install todo-app ./k8s/helm/todo-app
   -f k8s/helm/todo-app/values-doks.yaml -n todo-app`

### Artifact Generation (Spec-Driven)

The following artifacts MUST be generated through the spec -> plan ->
tasks workflow, not manually created:

| Artifact | Template Source | Output |
|---|---|---|
| `values-doks.yaml` | Helm values + spec requirements | DOKS overrides |
| `pubsub-kafka.yaml` | Dapr component spec | Kafka pub/sub |
| `event-types.ts` | Event definitions in spec | TypeScript types |
| `publisher.ts` | Dapr SDK patterns | Event publisher |
| `subscribers.ts` | Agent subscription patterns | Event handlers |
| `hpa.yaml` | Helm HPA template | Autoscaler config |

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| DO Managed Kafka provisioning delay | Blocks P2/P3 | P1 can proceed without Kafka; add Kafka in P2 |
| Dapr version incompatibility | Sidecar injection fails | Pin Dapr version in install; test locally first |
| Event publishing overhead on CRUD | Increased API latency | Fire-and-forget pattern; async publish |
| Kafka credential rotation | Service disruption | Use K8s Secret references; rolling restart |
| Agent suggestion spam from events | Bad UX | Rate limiting preserved; deduplication by taskId+type |
| DOKS cost overrun | Budget | Smallest viable node pool; scale down when not demoing |

---

## Bonus Targets (Hackathon Points)

### Reusable Intelligence (+200 points)
- Create an `EventHandlerSkill` module in ai-agent that:
  - Registers handlers by event type (dispatch pattern)
  - Provides `onTaskCreated`, `onTaskUpdated`, `onTaskCompleted`,
    `onTaskDeleted` hooks
  - Is extensible: adding a new handler requires only implementing
    a function and registering it
- Extend existing agents (overdue, prioritization) to be callable
  both from cron AND from event handlers (dual-trigger pattern)

### Cloud-Native Blueprints (+200 points)
- Spec definitions in this document directly produce:
  - `values-doks.yaml` with all DOKS-specific configuration
  - `pubsub-kafka.yaml` with Dapr Kafka component
  - Event type definitions as TypeScript code
- Blueprint generation is repeatable: re-running spec -> plan ->
  tasks produces identical artifacts

---

## Glossary

| Term | Definition |
|---|---|
| DOKS | DigitalOcean Kubernetes Service — managed K8s |
| Dapr | Distributed Application Runtime — sidecar for pub/sub, state, resiliency |
| Pub/Sub | Publish-subscribe messaging pattern |
| Sidecar | Container running alongside the app container in the same pod |
| Consumer Group | Kafka mechanism for distributing messages across subscriber instances |
| DLQ | Dead-Letter Queue — topic for events that fail processing |
| HPA | Horizontal Pod Autoscaler — scales pods based on metrics |
| Correlation ID | UUID propagated through the event chain for tracing |
| At-Least-Once | Delivery guarantee: message delivered one or more times |
| Idempotent | Processing the same input multiple times produces the same result |
