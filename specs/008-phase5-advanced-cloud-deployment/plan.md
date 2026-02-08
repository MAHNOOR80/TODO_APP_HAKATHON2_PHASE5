# Implementation Plan: Advanced Cloud-Native Event-Driven Deployment

**Branch**: `008-phase5-advanced-cloud-deployment`
**Date**: 2026-02-01
**Spec**: [specs/008-phase5-advanced-cloud-deployment/spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-phase5-advanced-cloud-deployment/spec.md`
**Constitution**: v5.0.0 (Phase V - Advanced Cloud-Native Event-Driven)

---

## Summary

Evolve the existing Phase IV Todo application (backend, frontend,
ai-agent on local Kubernetes) into a production-grade event-driven
system deployed on DigitalOcean Kubernetes (DOKS). Integrate Kafka
messaging via Dapr sidecars for task lifecycle events. Extend
autonomous agents (overdue, prioritization) to react to events in
near-real-time. Generate all infrastructure artifacts (Helm values,
Dapr components, event modules) through the spec-driven workflow.

---

## Technical Context

**Language/Version**: TypeScript 5+ on Node.js 20 LTS
**Primary Dependencies**: Express.js 4.18, Prisma 5.7, Better Auth,
  Pino 8.17, OpenAI SDK 4.104, @dapr/dapr ^3.x (new), node-cron 3.x
**Storage**: Neon Serverless PostgreSQL (external, via DATABASE_URL)
**Messaging**: DigitalOcean Managed Kafka (SASL/SCRAM + TLS)
**Testing**: Jest 29 (backend), Vitest (frontend), kubectl dry-run,
  helm lint, helm template
**Target Platform**: DigitalOcean Kubernetes (DOKS), 3-node pool
  (s-2vcpu-4gb)
**Project Type**: Web application (frontend + backend + ai-agent)
**Performance Goals**: <200ms API p95, <500ms event processing latency,
  <50ms event publishing overhead on CRUD
**Constraints**: DO Managed Kafka (not self-hosted), Dapr v1.13+,
  TLS required for Kafka, no in-cluster Postgres (Neon external),
  all infra generated via spec-driven workflow
**Scale/Scope**: 100+ concurrent users, 3 services, 7 event types,
  1 Kafka topic + 1 DLQ topic

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1
design.*

| # | Principle | Status | Notes |
|---|---|---|---|
| I | Simplicity & Readability | PASS | Dapr SDK abstracts Kafka complexity; event handlers are named functions |
| II | Clean Code | PASS | Event handlers named after events (`onTaskCreated`); YAML linting for Dapr/Helm |
| III | Modularity & Extensibility | PASS | Event publisher decoupled from task service; subscribers decoupled from agents |
| IV | Security First | PASS | SASL+TLS for Kafka; K8s Secrets for all creds; no secrets in payloads |
| V | API-First Design | PASS | REST API unchanged; events are internal (not exposed to frontend) |
| VI | AI & Agent Layer | PASS | Chatbot unchanged; events triggered indirectly via task service |
| VII | Cloud-Native Infrastructure | PASS | DOKS deployment; Dapr sidecars; NGINX Ingress; HPA; rolling updates |
| VIII | Autonomous Agent Behavior | PASS | Agents event-reactive via Dapr pub/sub; suggestive-only; idempotent; rate-limited |
| IX | Observability & Reliability | PASS | Correlation IDs on events; Dapr tracing; structured logging; DLQ |
| X | Event-Driven Architecture | PASS | Kafka backbone; Dapr abstraction; defined events; at-least-once; DLQ |
| XI | Spec-Driven Blueprints | PASS | All infra artifacts generated from spec; values-doks.yaml, pubsub-kafka.yaml |

**Violation**: None. All 11 principles satisfied.

---

## Key Architecture Decisions

### Decision 1: Dapr SDK over raw Kafka client

**Options considered**:
1. Raw `kafkajs` client — direct Kafka producer/consumer
2. `@dapr/dapr` SDK — Dapr-abstracted pub/sub via sidecar

**Choice**: Option 2 — Dapr SDK

**Rationale**:
- Dapr abstracts broker details (Kafka today, could swap to Redis
  Streams or Pulsar without code changes)
- Sidecar handles TLS, auth, retries, circuit breaking — less
  application code
- Consistent with constitution principle X (Dapr abstraction layer)
- Simplifies testing (mock Dapr HTTP endpoint, no Kafka client setup)
- Dapr provides built-in resiliency policies (retries, timeout)

**Trade-off**: Adds sidecar overhead (~50-100MB RAM per pod); requires
Dapr installed on cluster. Acceptable for DOKS with 4GB nodes.

### Decision 2: Single topic vs per-event-type topics

**Options considered**:
1. Single `tasks-lifecycle` topic with `eventType` field for routing
2. Separate topics: `tasks-created`, `tasks-updated`, etc.

**Choice**: Option 1 — Single topic

**Rationale**:
- Simpler Kafka topic management (1 topic + 1 DLQ vs 7 topics + 7
  DLQs)
- Ordered per-user processing via userId-based partitioning
- Dapr subscription filtering handles event routing to handlers
- DO Managed Kafka may have topic count limits on basic plans
- Subscribers receive all events and dispatch internally

**Trade-off**: Subscribers receive events they may not need (filter
client-side). Acceptable at current scale (7 event types, <1000
events/day for 100 users).

### Decision 3: Fire-and-forget publishing vs transactional outbox

**Options considered**:
1. Fire-and-forget: Publish event after DB commit; if publish fails,
   log and continue
2. Transactional outbox: Write event to DB table in same transaction,
   separate relay publishes to Kafka

**Choice**: Option 1 — Fire-and-forget

**Rationale**:
- Vastly simpler implementation
- Acceptable reliability: Dapr retries on publish failure; cron agents
  serve as fallback (eventually catch overdue/priority issues)
- Transactional outbox adds DB table, relay process, and complexity
  disproportionate to a todo app
- Constitution principle I (Simplicity First) favors simpler approach

**Trade-off**: Rare event loss possible if Dapr sidecar crashes
between DB commit and publish. Mitigated by cron-based agents running
every 5-15 minutes as safety net.

### Decision 4: AI-agent event subscription architecture

**Options considered**:
1. AI-agent subscribes via its own Dapr sidecar (separate consumer
   group)
2. Backend subscribes and forwards to AI-agent via HTTP
3. Shared subscription in backend; agents run in-process

**Choice**: Option 1 — AI-agent with its own Dapr sidecar

**Rationale**:
- AI-agent already runs as separate Kubernetes Deployment
- Own Dapr sidecar gives independent consumer group (won't compete
  with backend for messages)
- Scales independently of backend
- Clean service boundary: backend publishes, ai-agent consumes
- Matches existing architecture (separate service, separate pod)

**Trade-off**: Requires Dapr sidecar on ai-agent pods (additional
resource). Acceptable on 4GB nodes.

### Decision 5: Dual-trigger pattern (cron + events)

Existing cron-based agents (every 5min/15min) continue running
alongside event-driven handlers. Both paths dedup via
taskId + suggestionType query before creating suggestions.

**Rationale**:
- Events provide near-real-time reactivity
- Cron provides safety net (catches anything events missed)
- Gradual migration: can disable cron later once event path is proven
- No breaking change to existing behavior

---

## Project Structure

### Documentation (this feature)

```text
specs/008-phase5-advanced-cloud-deployment/
├── spec.md              # Feature specification (created)
├── plan.md              # This file
├── tasks.md             # Phase 2 output (/sp.tasks command)
└── quickstart-doks.md   # DOKS deployment guide (created during impl)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── events/                         # NEW: Event layer
│   │   ├── event-types.ts              # Event type definitions & interfaces
│   │   ├── publisher.ts                # Dapr pub/sub publisher wrapper
│   │   └── dead-letter.ts              # DLQ handling utilities
│   ├── config/
│   │   └── dapr.config.ts              # NEW: Dapr client configuration
│   ├── middleware/
│   │   └── correlation.middleware.ts    # NEW: Correlation ID propagation
│   ├── routes/
│   │   └── dapr.routes.ts              # NEW: Dapr subscription endpoints
│   ├── services/
│   │   └── task.service.ts             # MODIFIED: Add event publishing
│   └── index.ts                        # MODIFIED: Init Dapr, register routes
├── prisma/
│   └── schema.prisma                   # MODIFIED: Add sourceEvent, correlationId
├── package.json                        # MODIFIED: Add @dapr/dapr

ai-agent/
├── src/
│   ├── events/                         # NEW: Event subscription layer
│   │   ├── subscribers.ts              # Event dispatch & subscription registration
│   │   └── event-handler-skill.ts      # Reusable handler skill (bonus)
│   ├── agents/
│   │   ├── overdue-agent.ts            # MODIFIED: Add onTaskCreated handler
│   │   └── prioritization-agent.ts     # MODIFIED: Add onTaskUpdated handler
│   ├── scheduler.ts                    # MODIFIED: Integrate event subscriptions
│   └── index.ts                        # MODIFIED: Init Dapr server, start subs
├── package.json                        # MODIFIED: Add @dapr/dapr, express

k8s/
├── helm/todo-app/
│   ├── Chart.yaml                      # MODIFIED: Version bump 1.0.0 → 2.0.0
│   ├── values.yaml                     # MODIFIED: Add Dapr defaults, ai-agent
│   ├── values-doks.yaml                # NEW: DOKS-specific overrides
│   └── templates/
│       ├── deployment-backend.yaml     # MODIFIED: Dapr annotations, secrets
│       ├── deployment-frontend.yaml    # MODIFIED: Dapr annotations (optional)
│       ├── deployment-ai-agent.yaml    # NEW: AI-agent deployment
│       ├── service-ai-agent.yaml       # NEW: AI-agent service
│       ├── configmap.yaml              # MODIFIED: DOKS-aware config
│       ├── secrets.yaml                # NEW: Secret template
│       ├── ingress.yaml                # MODIFIED: Host support, TLS
│       └── hpa.yaml                    # NEW: HPA for backend
├── dapr/
│   ├── pubsub-kafka.yaml              # NEW: Dapr Kafka pub/sub component
│   └── resiliency.yaml                # NEW: Dapr resiliency policy (optional)
└── secrets/
    └── secrets.yaml.example            # EXISTS: Update with Kafka creds

frontend/                                # NO CHANGES (static UI, served by nginx)
```

**Structure Decision**: Extend existing monorepo. Backend gets `events/`
directory for publisher. AI-agent gets `events/` for subscribers. Helm
chart extended with ai-agent deployment, Dapr annotations, and DOKS
values. Frontend unchanged — events are backend-internal.

---

## Data Model Changes

### Prisma Schema Migration

Add two fields to `AgentSuggestion` for event traceability:

```prisma
model AgentSuggestion {
  // ... existing fields ...
  sourceEvent    String?  @map("source_event") @db.VarChar(100)
  correlationId  String?  @map("correlation_id") @db.Uuid
  // ... existing relations and indexes ...
}
```

**Migration**: `npx prisma migrate dev --name add-event-traceability`

This is additive-only (new nullable columns). No breaking changes.

---

## Event Model

### Event Type Definitions

```typescript
// backend/src/events/event-types.ts

export enum TaskEventType {
  CREATED = 'tasks.created',
  UPDATED = 'tasks.updated',
  DELETED = 'tasks.deleted',
  COMPLETED = 'tasks.completed',
  INCOMPLETE = 'tasks.incomplete',
  OVERDUE = 'tasks.overdue',
  REMINDER = 'tasks.reminder',
}

export interface TaskEvent {
  eventType: TaskEventType;
  taskId: string;
  userId: string;
  correlationId: string;
  timestamp: string; // ISO 8601
}

export interface TaskCreatedEvent extends TaskEvent {
  eventType: TaskEventType.CREATED;
  title: string;
  priority: string;
  dueDate: string | null;
  recurring: boolean;
}

export interface TaskUpdatedEvent extends TaskEvent {
  eventType: TaskEventType.UPDATED;
  changes: Record<string, unknown>;
}

export interface TaskDeletedEvent extends TaskEvent {
  eventType: TaskEventType.DELETED;
}

export interface TaskCompletedEvent extends TaskEvent {
  eventType: TaskEventType.COMPLETED;
}

export interface TaskIncompleteEvent extends TaskEvent {
  eventType: TaskEventType.INCOMPLETE;
}
```

### Kafka Topic Configuration

| Topic | Partitions | Retention | Purpose |
|---|---|---|---|
| `tasks-lifecycle` | 3 (match node count) | 7 days | All task events |
| `tasks-lifecycle-dlq` | 1 | 30 days | Failed event processing |

Partition key: `userId` (ensures per-user ordering).

---

## API Contracts

### Dapr Subscription Endpoint (Backend)

The backend registers its Dapr subscriptions via the standard Dapr
subscription API. This is an internal endpoint called by the Dapr
sidecar, not by external clients.

```
GET /dapr/subscribe
Response:
[
  {
    "pubsubname": "pubsub-kafka",
    "topic": "tasks-lifecycle",
    "route": "/api/events/tasks-lifecycle"
  }
]
```

The backend only needs this if it also subscribes (for future use).
For Phase V, the ai-agent is the primary subscriber.

### Dapr Subscription Endpoint (AI-Agent)

```
GET /dapr/subscribe
Response:
[
  {
    "pubsubname": "pubsub-kafka",
    "topic": "tasks-lifecycle",
    "route": "/events/tasks-lifecycle"
  }
]

POST /events/tasks-lifecycle
Request Body (from Dapr):
{
  "data": { <TaskEvent payload> },
  "datacontenttype": "application/json",
  "id": "<dapr-message-id>",
  "pubsubname": "pubsub-kafka",
  "source": "backend",
  "specversion": "1.0",
  "topic": "tasks-lifecycle",
  "type": "com.dapr.event.sent"
}
Response: { "status": "SUCCESS" } | { "status": "RETRY" } | { "status": "DROP" }
```

### Event Publishing (Backend → Dapr Sidecar)

```
POST http://localhost:${DAPR_HTTP_PORT}/v1.0/publish/pubsub-kafka/tasks-lifecycle
Content-Type: application/json

{
  "eventType": "tasks.created",
  "taskId": "...",
  "userId": "...",
  ...
}
```

Published via Dapr SDK `client.pubsub.publish()` method — the HTTP
call above is what the SDK sends to the sidecar internally.

---

## Infrastructure Artifacts (Spec-Driven Blueprints)

### 1. values-doks.yaml

```yaml
## DOKS Production Overrides
## Generated from spec: 008-phase5-advanced-cloud-deployment

frontend:
  replicaCount: 2
  image:
    repository: registry.digitalocean.com/<registry>/todo-frontend
    tag: latest
    pullPolicy: Always
  service:
    type: ClusterIP
    port: 80

backend:
  replicaCount: 2
  image:
    repository: registry.digitalocean.com/<registry>/todo-backend
    tag: latest
    pullPolicy: Always
  service:
    type: ClusterIP
    port: 4000
  containerPort: 4000
  dapr:
    enabled: true
    appId: backend
    appPort: 4000
  env:
    DAPR_HTTP_PORT: "3500"
    DAPR_PUBSUB_NAME: "pubsub-kafka"
    LOG_LEVEL: "info"
    LOG_FORMAT: "json"
    NODE_ENV: "production"

aiAgent:
  enabled: true
  replicaCount: 1
  image:
    repository: registry.digitalocean.com/<registry>/todo-ai-agent
    tag: latest
    pullPolicy: Always
  service:
    type: ClusterIP
    port: 5000
  containerPort: 5000
  dapr:
    enabled: true
    appId: ai-agent
    appPort: 5000
  resources:
    requests:
      cpu: 100m
      memory: 256Mi
    limits:
      cpu: 500m
      memory: 512Mi

postgres:
  enabled: false  # Use external Neon

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: ""  # Use IP-based access or configure DNS
      paths:
        - path: /api(/|$)(.*)
          pathType: ImplementationSpecific
          service: backend
          port: 4000
        - path: /(.*)
          pathType: ImplementationSpecific
          service: frontend
          port: 80

secrets:
  enabled: true
  todoAppSecrets: todo-app-secrets
  kafkaCreds: kafka-creds

namespace: todo-app
```

### 2. pubsub-kafka.yaml

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub-kafka
  namespace: todo-app
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers
    secretKeyRef:
      name: kafka-creds
      key: brokers
  - name: authType
    value: "password"
  - name: saslUsername
    secretKeyRef:
      name: kafka-creds
      key: username
  - name: saslPassword
    secretKeyRef:
      name: kafka-creds
      key: password
  - name: consumerGroup
    value: "todo-app-group"
  - name: disableTls
    value: "false"
  - name: maxMessageBytes
    value: "1048576"
  - name: consumeRetryInterval
    value: "200ms"
```

### 3. resiliency.yaml (Optional)

```yaml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: todo-resiliency
  namespace: todo-app
spec:
  policies:
    retries:
      pubsubRetry:
        policy: constant
        duration: 2s
        maxRetries: 3
    circuitBreakers:
      pubsubCB:
        maxRequests: 1
        interval: 30s
        timeout: 60s
        trip: consecutiveFailures > 3
  targets:
    components:
      pubsub-kafka:
        outbound:
          retry: pubsubRetry
          circuitBreaker: pubsubCB
```

---

## Implementation Phases Overview

### Phase 1: Setup & Infrastructure (Blocking)
Extend Helm chart for DOKS, add ai-agent deployment template, Dapr
annotations, secrets template, values-doks.yaml. Install Dapr and
NGINX Ingress on DOKS. Validate with `helm template` and
`helm lint`.

### Phase 2: Foundational — Event Layer (Blocking)
Add `@dapr/dapr` to backend and ai-agent. Create event type
definitions, publisher module, Dapr config. Create Prisma migration
for event traceability fields. Create Dapr pubsub-kafka.yaml.
This phase blocks user stories but can be validated independently.

### Phase 3: US1 — DOKS Deployment MVP (P1)
Build and push Docker images. Deploy to DOKS via
`helm upgrade --install`. Verify all existing features work on
DOKS with public ingress. No events yet — just deployment.

### Phase 4: US2 — Event Publishing (P2)
Integrate event publishing into task.service.ts. Add correlation
middleware. Register Dapr routes in backend. Verify events appear
in Kafka via logs/dashboard.

### Phase 5: US3 — Reactive Agents (P3)
Add Express server to ai-agent for Dapr subscription endpoints.
Create event-handler-skill module. Wire overdue-agent and
prioritization-agent to event handlers. Verify end-to-end:
create task → event → agent reacts → suggestion appears.

### Phase 6: Polish & Hardening
HPA configuration. Dead-letter handling. DOKS quickstart
documentation. Bonus: reusable skill validation, blueprint
reproducibility check.

---

## Detailed Phase Breakdown

### Phase 1: Setup & Infrastructure

**Files created:**
- `k8s/helm/todo-app/values-doks.yaml`
- `k8s/helm/todo-app/templates/deployment-ai-agent.yaml`
- `k8s/helm/todo-app/templates/service-ai-agent.yaml`
- `k8s/helm/todo-app/templates/secrets.yaml`
- `k8s/dapr/pubsub-kafka.yaml`

**Files modified:**
- `k8s/helm/todo-app/Chart.yaml` — version 1.0.0 → 2.0.0,
  appVersion 1.0.0 → 2.0.0
- `k8s/helm/todo-app/values.yaml` — add `aiAgent` section,
  `dapr` sub-keys, `secrets` section, set `postgres.enabled`
  toggle
- `k8s/helm/todo-app/templates/deployment-backend.yaml` — add
  Dapr annotations, secret volume mounts, rolling update strategy
- `k8s/helm/todo-app/templates/deployment-frontend.yaml` — add
  optional Dapr annotations
- `k8s/helm/todo-app/templates/configmap.yaml` — add DOKS-aware
  config entries (DAPR_HTTP_PORT, DAPR_PUBSUB_NAME, LOG_LEVEL)
- `k8s/helm/todo-app/templates/ingress.yaml` — add optional host
  field, TLS section

**Validation:**
- `helm lint k8s/helm/todo-app`
- `helm template todo-app k8s/helm/todo-app -f k8s/helm/todo-app/values-doks.yaml`
- Verify all templates render without errors

### Phase 2: Foundational — Event Layer

**Files created:**
- `backend/src/events/event-types.ts`
- `backend/src/events/publisher.ts`
- `backend/src/events/dead-letter.ts`
- `backend/src/config/dapr.config.ts`
- `backend/src/middleware/correlation.middleware.ts`
- `backend/src/routes/dapr.routes.ts`

**Files modified:**
- `backend/package.json` — add `@dapr/dapr` dependency, `uuid`
- `backend/src/index.ts` — import and register Dapr routes,
  correlation middleware, initialize Dapr client
- `backend/prisma/schema.prisma` — add `sourceEvent` and
  `correlationId` fields to AgentSuggestion

**Key implementation details:**

**publisher.ts** — Wraps Dapr HTTP pub/sub call:
```typescript
import { DaprClient } from '@dapr/dapr';
import { TaskEvent } from './event-types';
import { getLogger } from '../config/logger.config';

const DAPR_HOST = process.env.DAPR_HOST || 'localhost';
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || '3500';
const PUBSUB_NAME = process.env.DAPR_PUBSUB_NAME || 'pubsub-kafka';
const TOPIC_NAME = 'tasks-lifecycle';

let daprClient: DaprClient | null = null;

function getDaprClient(): DaprClient {
  if (!daprClient) {
    daprClient = new DaprClient({ daprHost: DAPR_HOST, daprPort: DAPR_HTTP_PORT });
  }
  return daprClient;
}

export async function publishEvent(event: TaskEvent): Promise<void> {
  const log = getLogger();
  try {
    const client = getDaprClient();
    await client.pubsub.publish(PUBSUB_NAME, TOPIC_NAME, event);
    log.info({
      eventType: event.eventType,
      taskId: event.taskId,
      correlationId: event.correlationId,
    }, 'Event published');
  } catch (error) {
    log.error({
      error,
      eventType: event.eventType,
      taskId: event.taskId,
      correlationId: event.correlationId,
    }, 'Failed to publish event (fire-and-forget)');
    // Do NOT throw — fire-and-forget
  }
}
```

**correlation.middleware.ts** — Generates/propagates correlation IDs:
```typescript
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export function correlationMiddleware(req: Request, res: Response, next: NextFunction): void {
  const correlationId = req.headers['x-correlation-id'] as string || randomUUID();
  req.headers['x-correlation-id'] = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
}
```

**Validation:**
- `npm run build` in backend (TypeScript compiles)
- `npx prisma migrate dev --name add-event-traceability`
- Unit test: publisher handles Dapr unavailability gracefully

### Phase 3: US1 — DOKS Deployment (P1)

**Pre-requisites (manual, documented in quickstart):**
1. DOKS cluster provisioned via `doctl`
2. `dapr init -k` on cluster
3. NGINX Ingress installed via Helm
4. Kubernetes Secrets created (todo-app-secrets, kafka-creds)
5. Dapr components applied (`kubectl apply -f k8s/dapr/`)

**Deployment steps:**
1. Build Docker images:
   ```bash
   docker build -t <registry>/todo-backend:v2.0.0 ./backend
   docker build -t <registry>/todo-frontend:v2.0.0 ./frontend
   docker build -t <registry>/todo-ai-agent:v2.0.0 ./ai-agent
   ```
2. Push to container registry (DOCR or Docker Hub)
3. Deploy via Helm:
   ```bash
   helm upgrade --install todo-app ./k8s/helm/todo-app \
     -f k8s/helm/todo-app/values-doks.yaml \
     -n todo-app --create-namespace
   ```
4. Verify:
   ```bash
   kubectl get pods -n todo-app  # All Running, 2/2 containers
   kubectl get ingress -n todo-app  # Public IP assigned
   curl http://<ingress-ip>/health  # 200 OK
   ```

**Validation:**
- SC-001: App accessible via public URL
- SC-004: Helm install clean, no manual edits
- SC-005: Rolling update works without downtime

### Phase 4: US2 — Event Publishing (P2)

**Files modified:**
- `backend/src/services/task.service.ts` — Add event publishing
  after each CRUD operation

**Key changes to task.service.ts:**

Each service method gets event publishing appended after the
successful database operation. Example for `createTask`:

```typescript
export async function createTask(userId: string, input: CreateTaskInput): Promise<Task> {
  const task = await taskRepository.create(userId, input);

  // Fire-and-forget event publishing
  publishEvent({
    eventType: TaskEventType.CREATED,
    taskId: task.id,
    userId,
    title: task.title,
    priority: task.priority,
    dueDate: task.dueDate?.toISOString() ?? null,
    recurring: !!task.recurrencePattern,
    correlationId: randomUUID(),
    timestamp: new Date().toISOString(),
  } as TaskCreatedEvent);

  return task;
}
```

Same pattern for: `updateTask`, `deleteTask`, `markComplete`,
`markIncomplete`.

**Validation:**
- SC-002 (partial): Create task → verify event in Dapr sidecar logs
- SC-003: Kafka consumer shows messages on `tasks-lifecycle` topic
- `kubectl logs <backend-pod> -c daprd` shows pub/sub activity

### Phase 5: US3 — Reactive Agents (P3)

**Files created:**
- `ai-agent/src/events/subscribers.ts`
- `ai-agent/src/events/event-handler-skill.ts`

**Files modified:**
- `ai-agent/package.json` — add `@dapr/dapr`, `express`,
  `@types/express`
- `ai-agent/src/index.ts` — add Express server for Dapr
  subscription endpoints, start alongside cron scheduler
- `ai-agent/src/agents/overdue-agent.ts` — export
  `handleTaskCreatedEvent()` alongside existing `runOverdueAgent()`
- `ai-agent/src/agents/prioritization-agent.ts` — export
  `handleTaskUpdatedEvent()`

**Key implementation:**

**subscribers.ts** — Event dispatch:
```typescript
import express from 'express';
import { TaskEvent, TaskEventType } from '../../backend/src/events/event-types';
// Note: In practice, event-types.ts will be a shared package or
// duplicated in ai-agent/src/events/event-types.ts

const handlers = new Map<string, (event: TaskEvent) => Promise<void>>();

export function registerHandler(
  eventType: TaskEventType,
  handler: (event: TaskEvent) => Promise<void>
): void {
  handlers.set(eventType, handler);
}

export function createSubscriptionRouter(): express.Router {
  const router = express.Router();

  // Dapr subscription registration
  router.get('/dapr/subscribe', (_req, res) => {
    res.json([{
      pubsubname: 'pubsub-kafka',
      topic: 'tasks-lifecycle',
      route: '/events/tasks-lifecycle',
    }]);
  });

  // Event handler endpoint
  router.post('/events/tasks-lifecycle', async (req, res) => {
    const event = req.body.data as TaskEvent;
    const handler = handlers.get(event.eventType);
    if (handler) {
      try {
        await handler(event);
        res.json({ status: 'SUCCESS' });
      } catch {
        res.json({ status: 'RETRY' });
      }
    } else {
      res.json({ status: 'SUCCESS' }); // Drop unhandled events
    }
  });

  return router;
}
```

**event-handler-skill.ts** — Reusable skill (bonus):
```typescript
// Extensible: add a new handler by calling registerHandler()
// No changes to subscriber infrastructure needed
export class EventHandlerSkill {
  private handlers = new Map<string, Function[]>();

  on(eventType: string, handler: Function): void {
    const existing = this.handlers.get(eventType) || [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  async dispatch(event: TaskEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];
    await Promise.all(handlers.map(h => h(event)));
  }
}
```

**Overdue agent event handler** (added to overdue-agent.ts):
```typescript
export async function handleTaskCreatedEvent(event: TaskCreatedEvent): Promise<void> {
  // Check if task is already overdue
  if (event.dueDate && new Date(event.dueDate) < new Date()) {
    // Check user has agents enabled
    // Check deduplication (no existing suggestion for this taskId)
    // Create overdue suggestion with sourceEvent and correlationId
  }
}
```

**AI-agent index.ts changes:**
```typescript
// Add Express server for Dapr subscriptions
const app = express();
app.use(express.json());
app.use(createSubscriptionRouter());

// Register event handlers
registerHandler(TaskEventType.CREATED, handleTaskCreatedEvent);
registerHandler(TaskEventType.UPDATED, handleTaskUpdatedEvent);
registerHandler(TaskEventType.COMPLETED, handleTaskCompletedEvent);

// Start HTTP server for Dapr alongside cron scheduler
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'AI Agent HTTP server started for Dapr subscriptions');
});
```

**Validation:**
- SC-002: Full end-to-end: create task → event → agent → suggestion
- SC-006: Add new handler without modifying subscriber infrastructure

### Phase 6: Polish & Cross-Cutting

**Files created:**
- `k8s/helm/todo-app/templates/hpa.yaml` — HPA for backend
- `specs/008-phase5-advanced-cloud-deployment/quickstart-doks.md`

**Activities:**
- Verify dead-letter handling (simulate failed processing)
- Validate Helm chart portability (install on clean DOKS cluster)
- Update DEPLOYMENT.md with Phase V instructions
- Run `helm lint`, `helm template` validation
- Verify dual-trigger deduplication (cron + event don't create
  duplicate suggestions)

---

## Complexity Tracking

| Potential Concern | Justification | Simpler Alternative Rejected Because |
|---|---|---|
| Dapr sidecar on every pod | Required for pub/sub abstraction per constitution X | Raw Kafka client would tightly couple to broker; Dapr provides resiliency for free |
| Express server in ai-agent | Needed for Dapr subscription HTTP endpoint | ai-agent currently has no HTTP server; Express is minimal (~200KB) |
| Event type duplication | event-types.ts in backend; copy in ai-agent | Shared npm package would over-engineer for 1 shared file |

---

## Risks and Mitigations (Plan-Level)

| Risk | Phase Affected | Mitigation |
|---|---|---|
| DO Managed Kafka not provisioned | Phase 2, 3 | P1 deployment works without Kafka; add events in P2 |
| Dapr sidecar injection fails | Phase 1 | Pin Dapr version; verify on Minikube first |
| @dapr/dapr SDK breaking changes | Phase 2 | Pin version in package.json; use HTTP fallback |
| Event payload too large | Phase 4 | Keep payloads minimal (IDs + changed fields only) |
| Cron + event dual suggestions | Phase 5 | Dedup query before insert; unique constraint option |
| DOKS node OOM with sidecars | Phase 3 | Monitor with `kubectl top`; scale pool if needed |

---

## Testing Strategy

### Infrastructure Tests (Phase 1)
- `helm lint k8s/helm/todo-app`
- `helm template` renders all templates without error
- `kubectl apply --dry-run=server` validates YAML

### Event Publishing Tests (Phase 2, 4)
- Unit: publisher.ts logs error on Dapr failure, does not throw
- Integration: task.service.ts publishes event after create
  (mock Dapr endpoint, verify HTTP call)
- E2E: Create task via API → check sidecar logs for published event

### Agent Subscription Tests (Phase 5)
- Unit: overdue handler creates suggestion for overdue task event
- Unit: overdue handler skips non-overdue task event
- Unit: handler deduplicates (no duplicate suggestion)
- Integration: event → handler → suggestion in DB
- E2E: Create overdue task → suggestion appears in UI within 10s

### Regression Tests (Phase 6)
- All existing Phase IV Jest/Vitest tests pass
- CRUD operations work without Dapr sidecar (graceful degradation)
- Chatbot creates task → event published → agent reacts

---

## Dependencies & Sequencing

```
Phase 1 (Infra)
    ↓
Phase 2 (Event Layer) ← blocks Phase 4 and 5
    ↓
Phase 3 (DOKS Deploy / P1) ← can start after Phase 1
    ↓
Phase 4 (Event Publishing / P2) ← requires Phase 2 + 3
    ↓
Phase 5 (Reactive Agents / P3) ← requires Phase 4
    ↓
Phase 6 (Polish)
```

Note: Phase 3 (DOKS deployment) can proceed in parallel with Phase 2
(event layer code) since deployment doesn't require events yet. But
Phase 4 requires both to be complete.

---

## Follow-Up Considerations

1. **Transactional outbox**: If event loss becomes a concern in
   production, upgrade from fire-and-forget to transactional outbox
   pattern. ADR candidate.
2. **Per-event topics**: If event volume grows significantly, split
   `tasks-lifecycle` into per-type topics for independent scaling.
3. **Dapr state store**: If agents need to cache state across
   restarts, add a Dapr state store component (Redis or similar).
4. **TLS on ingress**: Add cert-manager for automatic Let's Encrypt
   TLS certificates on the DOKS ingress.
