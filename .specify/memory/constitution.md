<!--
SYNC IMPACT REPORT
Version change: 4.0.0 → 5.0.0
Modified principles:
  - VII. Cloud-Native Infrastructure: Expanded for DOKS managed cluster,
    NGINX Ingress, external Kafka brokers, Dapr sidecar annotations
  - VIII. Autonomous Agent Behavior: Expanded for event-driven reactivity,
    Kafka subscriptions, Dapr pub/sub integration
  - IX. Observability & Reliability: Expanded for Dapr tracing, Kafka
    consumer lag monitoring, event latency tracking

Added principles:
  - X. Event-Driven Architecture (Core of Phase V)
  - XI. Spec-Driven Infrastructure Blueprints (Core of Phase V)

Added sections:
  - Event-Driven Design section (events, publishers, subscribers)
  - Dapr Integration Architecture section
  - DOKS Deployment Blueprint section
  - Kafka Topic & Messaging Standards section
  - Reusable Intelligence (Agent Skills) section
  - Infrastructure Layer expanded with Kafka, Dapr, NGINX Ingress
  - Deployment Blueprint (Spec-Driven) section
  - Bonus Targets section

Removed sections:
  - "Service mesh (Istio, Linkerd)" from Out of Scope
    (Dapr provides sidecar-based pub/sub but is NOT a full mesh)
  - "Multi-cloud deployments" from Out of Scope
    (still single cloud: DigitalOcean)

Templates requiring updates:
  - plan-template.md: ✅ Compatible - Constitution Check adapts to new
    principles; event-driven and blueprint sections fit existing structure
  - spec-template.md: ✅ Compatible - user stories can incorporate event
    flows, Dapr components, and DOKS deployment requirements
  - tasks-template.md: ✅ Compatible - task phases can include infra,
    event-driven, and blueprint generation phases
  - phr-template.prompt.md: ✅ Compatible - no changes needed

Follow-up TODOs:
  - README.md needs updating to reflect Phase 5 DOKS deployment
  - Helm chart values-doks.yaml needs to be created
  - Dapr component YAMLs need to be generated via specs
  - Kafka topic configuration manifests need to be created
  - Agent event-handler skill extensions need to be designed
-->
<!--
Version: 5.0.0
Created: 2025-12-29
Last Amended: 2026-02-01
Phase: V - Advanced Cloud-Native Event-Driven Deployment
Previous Phase: Phase IV (Cloud-Native Autonomous AI System) v4.0.0
Breaking Changes:
  - Architecture shift: Local Minikube K8s → DigitalOcean Managed Kubernetes (DOKS)
  - Added: Event-driven architecture with Kafka pub/sub via Dapr sidecars
  - Added: Spec-driven infrastructure blueprint generation (Helm, Dapr, Kafka YAMLs)
  - Added: Reusable intelligence via agent event-handler skills and subagents
  - Added: NGINX Ingress Controller for public-facing access
  - Added: Managed Kafka (DigitalOcean) as messaging backbone
  - Added: Dapr v1.13+ for sidecar-based pub/sub, state, and resiliency
  - Expanded: Autonomous agents now react to events (tasks.created, tasks.overdue, etc.)
  - Expanded: Observability includes Dapr tracing and Kafka consumer lag
  - Technology stack: Kafka, Dapr, NGINX Ingress, DOKS added
Rationale:
  - Phase V transitions from local K8s to production-grade managed cloud
  - Introduces event-driven decoupling for reliable async processing
  - Demonstrates distributed systems thinking at scale
  - Maintains full feature parity with Phases I through IV
  - All existing functionality continues to work unchanged
  - New sections: Event-Driven Architecture, Spec-Driven Blueprints
-->

# Phase V Advanced Cloud-Native Event-Driven Deployment Constitution

## Purpose

This constitution defines the non-negotiable principles, rules, and
decision framework for all specifications, plans, and implementations
of the Phase V Advanced Cloud-Native Event-Driven Deployment system.

**All future specs, plans, and code MUST comply with this document.**

## Project Overview

This project evolves the Phase IV cloud-native Todo application into a
production-grade, managed-cloud system deployed on **DigitalOcean
Kubernetes (DOKS)** with full **event-driven architecture** using Kafka
and Dapr, following Spec-Kit Plus and Agentic Dev Stack principles.

**Phase V Scope:**
- Full-stack web application with AI conversational interface
  (Frontend + Backend + Database + AI Agent Layer)
- **Deployed on DigitalOcean Kubernetes (DOKS)** with public ingress
- **Event-driven** using Kafka for reliable messaging and Dapr for
  sidecar-based pub/sub, state management, and resiliency
- **AI agents reactive to events** (e.g., task.created triggers
  reminder/overdue check via Kafka subscription)
- **Spec-driven cloud-native blueprints**: Specs generate parameterized
  Helm values, Dapr components, Kafka topic configs, and deployment
  manifests
- Containerized using Docker for all services
- Observable with structured logging, Dapr tracing, health checks
- Secure with Kubernetes Secrets, Dapr mTLS, environment-based config
- Autonomous agents for background monitoring and suggestions
- Persistent storage using **Neon Serverless PostgreSQL** (external)
- User authentication and authorization using **Better Auth**
- Multi-user support (each user sees only their own tasks)
- RESTful API architecture with versioning
- Responsive web interface with AI conversational interface
- Complete feature parity with Phases I, II, III, and IV
- Agentic Dev Stack workflow with Claude as primary reasoning agent

**Out of Scope for Phase V:**
- Real-time collaboration features
- Mobile native applications
- Third-party integrations (calendar sync, email notifications, etc.)
- Advanced analytics or reporting
- Voice-based interaction (text-based only)
- Multi-cloud deployments (single cloud: DigitalOcean)
- Full service mesh (Istio, Linkerd) — Dapr sidecars provide targeted
  pub/sub and resiliency but are NOT a full mesh replacement

## Feature Availability Across Interfaces

All features from Phases I through IV MUST be fully available through
both interfaces:

### Traditional UI Interface
- All existing web UI functionality from Phases II, III, and IV
- Standard form-based task management
- Click-based interactions
- Suggestion cards from autonomous agents

### AI Conversational Interface
- Natural language processing for all task operations
- Supported intents include:
  - Create tasks
  - Update tasks
  - Delete tasks
  - Mark complete/incomplete
  - Set priorities, categories, due dates
  - Configure recurring tasks
  - Search, filter, and sort tasks
- AI responses MUST be clear, safe, and deterministic

All functionality MUST be accessible via both traditional UI and AI
conversational interface:

### Basic Level - Core Essentials
1. **Add Task** - Create new tasks with title and optional description
2. **Delete Task** - Remove tasks by ID
3. **Update Task** - Modify task title/description
4. **View Task List** - Display all tasks with status
5. **Mark Complete/Incomplete** - Toggle task completion status

### Intermediate Level - Organization & Usability
1. **Priorities** - Assign low/medium/high priority to tasks
2. **Tags/Categories** - Organize tasks by custom tags or categories
3. **Search & Filter** - Find tasks by title, description, tags, or
   priority
4. **Sort** - Order tasks by due date, priority, creation date, or
   alphabetically

### Advanced Level - Intelligent Features
1. **Recurring Tasks** - Support daily, weekly, monthly recurrence
2. **Due Dates** - Assign due dates to tasks with validation
3. **Time Reminders** - Notify users before tasks are due

## Core Principles

### I. Simplicity and Readability First (Carried from Phase I)

Code MUST be immediately understandable to any full-stack developer.
Avoid clever tricks, over-engineering, or premature optimization.

**Non-Negotiable Rules:**
- No complex abstractions unless absolutely necessary
- Prefer explicit, verbose code over concise but obscure patterns
- No performance optimizations unless there is a measured bottleneck
- Code reviews MUST verify that any developer can understand the logic
  in under 2 minutes
- Component and API naming MUST be self-documenting

**Rationale:** Phase V builds on all previous foundations. Clarity
enables future developers to extend the system confidently across
frontend, backend, database, AI, infrastructure, and event layers.

### II. Clean Code Principles (Expanded for Web + Events)

Follow language-specific best practices strictly. Use meaningful
variable, function, component, and API names. Keep functions/components
focused on a single responsibility.

**Non-Negotiable Rules:**
- **Backend (Node.js/TypeScript):** ESLint + Prettier enforced
- **Frontend:** Component-based architecture, single responsibility
  per component
- **Infrastructure:** YAML linting for Kubernetes manifests, Helm
  charts, Dapr component YAMLs, and Dockerfiles
- **Event handlers:** Event subscriber functions MUST be named after
  their event (e.g., `onTaskCreated`, `onTaskOverdue`)
- Function/method length MUST NOT exceed 50 lines unless justified
- Variable/parameter names MUST be descriptive (no single-letter names
  except loop iterators)
- Each function/component MUST do one thing only
- API endpoint names MUST follow RESTful conventions

**Rationale:** Multi-layer architecture with event-driven components
requires consistent style. Clean separation between frontend, backend,
data, AI, infrastructure, and event layers prevents coupling.

### III. Modularity and Extensibility (Critical for Distributed)

Design decisions MUST support future phases. Adding new features MUST
NOT require major refactoring. Business logic MUST be decoupled from
presentation, persistence, infrastructure, and messaging layers.

**Non-Negotiable Rules:**
- **Backend:** Business logic MUST NOT contain HTTP/database/
  infrastructure/messaging implementation details
- **Frontend:** UI components MUST NOT contain business logic or direct
  API calls
- **Database:** Schema design MUST support future extensions without
  breaking changes
- **Infrastructure:** Deployment manifests MUST be environment-agnostic
  (dev/staging/prod via Helm values)
- **Events:** Event publishers MUST NOT depend on specific subscribers;
  subscribers MUST NOT depend on publisher internals
- All dependencies MUST flow inward (UI -> API -> Business Logic ->
  Data Layer)
- Authentication/authorization MUST be middleware-based (not embedded
  in route handlers)

**Rationale:** Distributed event-driven applications have multiple
decoupling points. Clean separation ensures each layer and service can
evolve independently.

### IV. Security First (Expanded for Cloud + Events)

Security is non-negotiable. All user data MUST be protected.
Authentication and authorization MUST be enforced at every layer.

**Non-Negotiable Rules:**
- **Never store plaintext passwords** (Better Auth handles hashing)
- **All API endpoints MUST require authentication** (except signup/
  signin and health checks)
- **Input validation MUST occur on both client and server**
- **SQL injection prevention:** Use parameterized queries ONLY
- **XSS prevention:** Sanitize all user input displayed in UI
- **CSRF protection:** Implement CSRF tokens for state-changing ops
- **Environment secrets:** NEVER commit `.env` files or credentials
- **Kubernetes secrets:** Use Kubernetes Secrets for production (Kafka
  creds, Neon DB URL, OpenAI keys, auth secrets)
- **Kafka auth:** MUST use SASL/SCRAM or password auth with TLS
  enabled; plaintext Kafka connections are FORBIDDEN in production
- **Dapr mTLS:** Enable Dapr mutual TLS where supported for
  service-to-service communication
- **User data isolation:** Users MUST ONLY access their own tasks
  (enforced at database query level)
- **Container security:** Run containers as non-root users, use
  minimal base images
- **Event payload security:** Event payloads MUST NOT contain secrets
  or full credentials; include only IDs and references

**Rationale:** Cloud-native event-driven applications face additional
threats at infrastructure and messaging layers. Defense-in-depth across
API, Kafka, Dapr, and K8s prevents common vulnerabilities.

### V. API-First Design (Carried from Phase II)

The backend API is the contract between frontend and backend. It MUST
be stable, well-documented, and versioned.

**Non-Negotiable Rules:**
- **RESTful conventions REQUIRED:** `GET /tasks`, `POST /tasks`,
  `PUT /tasks/:id`, `DELETE /tasks/:id`
- **Consistent response format:**
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null
  }
  ```
- **HTTP status codes MUST be semantically correct:**
  - `200 OK` - Successful GET/PUT
  - `201 Created` - Successful POST
  - `204 No Content` - Successful DELETE
  - `400 Bad Request` - Validation errors
  - `401 Unauthorized` - Missing/invalid auth
  - `403 Forbidden` - Authenticated but not authorized
  - `404 Not Found` - Resource does not exist
  - `500 Internal Server Error` - Server failures
  - `503 Service Unavailable` - Service temporarily unavailable
- **Error responses MUST include actionable messages:**
  ```json
  {
    "success": false,
    "data": null,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Title is required and must be 1-200 characters",
      "field": "title"
    }
  }
  ```
- **API versioning:** Routes MUST be prefixed with `/api/v1/`

**Rationale:** Frontend and backend may evolve independently. A stable
API contract prevents integration issues.

### VI. AI & Agent Layer (Carried from Phase III)

The AI agent is responsible for intent detection, parameter extraction,
and action planning. The AI layer MUST NOT directly mutate data; all
mutations go through validated backend APIs.

**Non-Negotiable Rules:**
- **Intent Detection:** AI agent MUST accurately identify user intent
  from natural language (create, update, delete, search, etc.)
- **Parameter Extraction:** AI agent MUST extract relevant parameters
  (task title, due date, priority, etc.) from user input
- **Action Planning:** AI agent MUST plan appropriate API calls based
  on detected intent and extracted parameters
- **No Direct Data Mutation:** AI layer MUST NOT directly access
  database or bypass API validation
- **User Context Isolation:** AI actions MUST respect user
  authentication and authorization boundaries
- **Response Clarity:** AI responses MUST be clear, deterministic,
  and safe
- **Error Handling:** AI layer MUST gracefully handle ambiguous or
  invalid user inputs

**Rationale:** AI-powered interfaces require careful separation between
NLP and business logic. This ensures security, data integrity, and
maintainability.

### VII. Cloud-Native Infrastructure (Expanded for Phase V — DOKS)

The application MUST be containerized, deployed on DigitalOcean
Kubernetes (DOKS), and designed for horizontal scalability with
event-driven decoupling.

**Non-Negotiable Rules:**
- **Containerization:** All services (frontend, backend, AI agent)
  MUST have Dockerfiles with multi-stage builds
- **Non-root containers:** All containers MUST run as non-root users
- **DOKS deployment:** Application MUST deploy to DigitalOcean
  Kubernetes via Helm charts with parameterized values
- **Service separation:** Frontend, Backend API, and AI Agent MUST
  be separate deployable services
- **Stateless services:** Application services MUST be stateless
  (state in database/external stores/Kafka)
- **Environment configuration:** All environment-specific config MUST
  be via environment variables, ConfigMaps, or Helm values
- **Resource limits:** Kubernetes deployments MUST specify resource
  requests and limits
- **Graceful shutdown:** Services MUST handle SIGTERM and drain
  connections gracefully
- **NGINX Ingress:** External access MUST be via NGINX Ingress
  Controller (not NodePort/LoadBalancer per service)
- **Dapr sidecar injection:** Deployments MUST annotate for Dapr
  sidecar (`dapr.io/enabled`, `dapr.io/app-id`, `dapr.io/app-port`)
- **Namespacing:** Application MUST deploy to a dedicated namespace
- **Horizontal Pod Autoscaling:** Backend and AI Agent MUST support
  HPA for scaling under load
- **Rolling updates:** Helm MUST configure rolling update strategy
  for zero-downtime deployments

**Rationale:** DOKS provides managed Kubernetes with built-in
monitoring and scaling. Dapr sidecars handle cross-cutting concerns
(pub/sub, resiliency) without application code changes.

### VIII. Autonomous Agent Behavior (Expanded for Event-Driven)

Background AI agents MUST operate autonomously for monitoring and
suggestions while respecting strict safety boundaries. In Phase V,
agents become **event-reactive** via Kafka subscriptions.

**Non-Negotiable Rules:**
- **Suggestive only:** Autonomous agents MUST ONLY suggest actions,
  NEVER execute destructive operations without user confirmation
- **User consent:** Any automated action that modifies user data
  MUST require explicit user confirmation
- **Event-reactive:** Agents MUST subscribe to relevant Kafka topics
  (e.g., `tasks.created`, `tasks.updated`) via Dapr pub/sub
- **Background monitoring:** Agents MAY monitor for:
  - Overdue tasks (via scheduler + event triggers)
  - Task prioritization opportunities
  - Schedule adjustment recommendations
  - Recurring task generation triggers
- **Notification delivery:** Agent suggestions MUST be delivered via
  non-intrusive notifications (in-app or browser push)
- **Rate limiting:** Autonomous agents MUST have rate limits to
  prevent notification spam
- **User control:** Users MUST be able to enable/disable autonomous
  agent features
- **Audit trail:** All autonomous agent actions and suggestions
  MUST be logged with event correlation IDs
- **Permission boundaries:** Autonomous agents operate within strict
  permission boundaries (read-only by default)
- **Idempotency:** Event handlers MUST be idempotent — processing
  the same event twice MUST NOT produce duplicate side effects

**Rationale:** Event-driven agents add intelligence without being
intrusive. Kafka-backed subscriptions ensure reliable delivery.
Suggestive-only behavior keeps the user in control.

### IX. Observability & Reliability (Expanded for Phase V)

The system MUST be debuggable in production with comprehensive
logging, health checks, tracing, and monitoring across services
and event flows.

**Non-Negotiable Rules:**
- **Structured logging:** All services MUST use structured JSON
  logging with correlation IDs
- **Log levels:** MUST support DEBUG, INFO, WARN, ERROR levels
  configurable via environment
- **Health endpoints:** All services MUST expose `/health` (liveness)
  and `/ready` (readiness) endpoints
- **Kubernetes probes:** Deployments MUST configure liveness and
  readiness probes
- **Startup probes:** Services with slow initialization MUST
  configure startup probes
- **Error tracking:** Application errors MUST include stack traces
  in logs (not in API responses)
- **Request tracing:** HTTP requests MUST include request ID; event
  flows MUST include correlation ID for end-to-end tracing
- **Dapr tracing:** Enable Dapr distributed tracing for service
  invocations and pub/sub message flows
- **Kafka monitoring:** Track consumer lag, event processing latency,
  and dead-letter queue counts
- **Performance metrics:** Track API latency, error rates, throughput,
  and event processing latency (<500ms target)
- **Graceful degradation:** Services MUST handle partial failures
  gracefully (Kafka down does not crash the app)

**Rationale:** Distributed event-driven systems require end-to-end
observability. Dapr tracing + Kafka monitoring prevent silent failures.

### X. Event-Driven Architecture (New for Phase V)

The application MUST use event-driven decoupling for task lifecycle
events. Kafka is the messaging backbone; Dapr provides the pub/sub
abstraction layer.

**Non-Negotiable Rules:**
- **Event-first for lifecycle:** Task CRUD operations MUST publish
  events after successful persistence (not before)
- **Kafka as backbone:** All inter-service async communication MUST
  use Kafka topics via Dapr pub/sub component
- **Dapr abstraction:** Publishers and subscribers MUST use the Dapr
  SDK/HTTP API for pub/sub (not raw Kafka client libraries) to
  maintain portability
- **Defined event types:** The following events MUST be supported:
  - `tasks.created` — published on task creation
  - `tasks.updated` — published on task modification
  - `tasks.deleted` — published on task deletion
  - `tasks.completed` / `tasks.incomplete` — published on status
    toggle
  - `tasks.overdue` — published by overdue-agent scheduler
  - `tasks.reminder` — published before task due date
- **Event payload standard:** All events MUST include:
  - `eventType` (string)
  - `taskId` (UUID)
  - `userId` (UUID)
  - `timestamp` (ISO 8601)
  - `correlationId` (UUID for tracing)
  - Event-specific fields (title, changes, dueDate, etc.)
- **At-least-once delivery:** Subscribers MUST handle duplicate
  events gracefully (idempotent processing)
- **Dead-letter handling:** Failed event processing MUST route to
  a dead-letter topic after configurable retries
- **Consumer groups:** Each subscriber service MUST use a distinct
  consumer group to ensure independent processing

**Rationale:** Event-driven decoupling enables independent scaling,
reliable async processing, and clean service boundaries. Dapr
abstraction prevents Kafka vendor lock-in.

### XI. Spec-Driven Infrastructure Blueprints (New for Phase V)

All infrastructure configuration (Helm values, Dapr component YAMLs,
Kafka topic configs, deployment manifests) MUST be generated or
refined through the spec-driven workflow. No manual infra code.

**Non-Negotiable Rules:**
- **Spec generates infra:** Feature specs MUST define infrastructure
  requirements that produce Helm values, Dapr components, and Kafka
  topic configurations
- **Parameterized Helm:** Helm values MUST be parameterized for
  environment (values-dev.yaml, values-doks.yaml) with external
  broker URLs, ingress hosts, replica counts, and secrets references
- **Dapr components from spec:** Dapr pub/sub component YAMLs MUST
  be generated with correct broker URLs, auth type, consumer group,
  and TLS settings
- **No manual infra code:** Infrastructure changes MUST flow through
  spec.md -> plan.md -> tasks.md -> Claude Code generation
- **Reusable intelligence:** Agent skills MUST be extensible —
  create "event-handler" skill and subagents that subscribe to
  events for overdue/reminder/prioritization logic
- **Blueprint artifacts:** The spec-driven workflow MUST produce:
  - `values-doks.yaml` (Helm values for DOKS)
  - Dapr component YAMLs (pubsub-kafka, state if needed)
  - Kafka topic creation configs (if using operator)
  - Agent skill extension definitions

**Rationale:** Spec-driven infrastructure prevents configuration
drift, ensures reproducibility, and enables Claude Code to generate
correct deployment artifacts from specifications.

## Technology Stack

### Infrastructure Layer (Expanded for Phase V)
- **Cloud Provider:** DigitalOcean (DOKS managed Kubernetes)
- **Containerization:** Docker (multi-stage builds)
- **Orchestration:** DigitalOcean Kubernetes (DOKS)
- **Package Management:** Helm charts (parameterized for DOKS)
- **Ingress:** NGINX Ingress Controller
- **Messaging:** DigitalOcean Managed Kafka (SASL/SCRAM + TLS)
- **Sidecar Runtime:** Dapr v1.13+ (pub/sub, state, resiliency)
- **Container Registry:** Any OCI-compliant registry (Docker Hub,
  GHCR, DOCR)
- **Secret Management:** Kubernetes Secrets (Kafka creds, Neon URL,
  OpenAI keys, auth secrets)
- **AIOps Tools:** kubectl-ai / kagent (optional, for managed ops)

### AI & Agent Layer
- **AI Framework:** OpenAI GPT or Claude API for NLP
- **Agent Orchestration:** OpenAI Agents SDK / MCP SDK for intent
  detection and action planning
- **Intent Classification:** ML model for detecting user intents
- **Entity Extraction:** Named entity recognition for task params
- **Conversation Context:** Session-based conversation memory
- **Background Jobs:** Scheduled tasks for autonomous monitoring
- **Event Subscriptions:** Dapr pub/sub for agent event reactivity
- **Agent Skills:** Reusable event-handler skills and subagents
- **Chat UI:** OpenAI ChatKit for conversational interface

### Backend
- **Runtime:** Node.js 20+ LTS
- **Language:** TypeScript 5+
- **Framework:** Express.js
- **Authentication:** Better Auth
- **Database ORM:** Prisma
- **Database:** Neon Serverless PostgreSQL (external, not in-cluster)
- **Validation:** Zod
- **Logging:** Pino with JSON output
- **Event Publishing:** Dapr SDK for Kafka pub/sub

### Frontend
- **Framework:** Next.js / Vite + React
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS / shadcn/ui
- **State Management:** React Context or Zustand
- **HTTP Client:** Fetch API
- **Chat Interface:** OpenAI ChatKit

### Development Tools
- **Package Manager:** pnpm or npm
- **Linting:** ESLint with TypeScript plugin
- **Formatting:** Prettier
- **Type Checking:** TypeScript strict mode REQUIRED
- **Container Tools:** Docker, docker-compose (local dev)
- **K8s Tools:** kubectl, Helm, doctl (DigitalOcean CLI)
- **Dapr CLI:** dapr init -k (for Kubernetes Dapr installation)

**Rationale:** Modern, widely-adopted tools with strong community
support. TypeScript everywhere ensures type safety. Kafka + Dapr
provide reliable event-driven messaging. DOKS provides managed K8s.

## Database Schema Requirements

### Core Entities

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  autonomous_agents_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Rules:**
- Better Auth manages password hashing and session storage
- Email MUST be unique and validated
- `autonomous_agents_enabled` controls background agent features
- Soft deletes NOT required for Phase V

#### Tasks Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high')),
  tags TEXT[],
  category VARCHAR(100),
  due_date TIMESTAMP,
  recurrence_pattern VARCHAR(50),
  reminder_enabled BOOLEAN DEFAULT FALSE,
  reminder_offset_minutes INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_completed ON tasks(completed);
```

#### Agent Suggestions Table
```sql
CREATE TABLE agent_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  suggestion_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  source_event VARCHAR(100),
  correlation_id UUID,
  dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agent_suggestions_user_id
  ON agent_suggestions(user_id);
CREATE INDEX idx_agent_suggestions_dismissed
  ON agent_suggestions(dismissed);
```

**Rules:**
- UUIDs REQUIRED for all primary keys (distributed systems)
- `user_id` foreign key MUST enforce CASCADE DELETE
- All queries MUST filter by `user_id` for data isolation
- `tags` stored as PostgreSQL array for efficient querying
- `recurrence_pattern` stored as string for simplicity
- Agent suggestions include `source_event` and `correlation_id`
  for event traceability

## Backend Architecture

### Required Layers

```
+---------------------------------------------------+
|  Event Layer (Kafka + Dapr Pub/Sub)  [NEW Phase V] |
|  - Event publishing on task CRUD                   |
|  - Event subscriptions for agents                  |
|  - Dead-letter handling                            |
+--------------------+------------------------------+
                     |
+--------------------v------------------------------+
|  Autonomous Agent Layer (Background + Events)      |
|  - Overdue task monitoring (scheduler + events)    |
|  - Prioritization suggestions (event-triggered)    |
|  - Schedule recommendations                        |
|  - Reminder generation (pre-due-date events)       |
+--------------------+------------------------------+
                     | (Internal API calls + events)
+--------------------v------------------------------+
|  AI & Agent Layer (OpenAI Agents SDK / MCP)        |
|  - Intent detection                                |
|  - Parameter extraction                            |
|  - Action planning                                 |
+--------------------+------------------------------+
                     |
+--------------------v------------------------------+
|  HTTP Layer (Express.js)                           |
|  - Route handlers                                  |
|  - Request/response formatting                     |
|  - Health check endpoints                          |
|  - Dapr subscription endpoints                     |
+--------------------+------------------------------+
                     |
+--------------------v------------------------------+
|  Middleware Layer                                   |
|  - Authentication (Better Auth)                    |
|  - Validation (Zod)                                |
|  - Error handling                                  |
|  - Request logging/tracing                         |
|  - Correlation ID propagation                      |
+--------------------+------------------------------+
                     |
+--------------------v------------------------------+
|  Business Logic Layer (Services)                   |
|  - Task operations + event publishing              |
|  - Recurrence logic                                |
|  - Reminder scheduling                             |
|  - Agent suggestion management                     |
+--------------------+------------------------------+
                     |
+--------------------v------------------------------+
|  Data Access Layer (Repositories)                  |
|  - Database queries (Prisma)                       |
|  - User isolation enforcement                      |
+---------------------------------------------------+
```

**Non-Negotiable Rules:**
- **Event Layer:** MUST publish events after successful DB operations;
  MUST NOT publish before persistence completes
- **Autonomous Agent Layer:** MUST run as background jobs or event
  subscribers; MUST NOT block HTTP requests
- **AI Layer:** MUST NOT directly access database or perform data
  mutations (only call backend APIs)
- **AI Layer:** MUST respect user auth and authorization boundaries
- **HTTP Layer:** MUST NOT contain business logic (only routing and
  serialization)
- **HTTP Layer:** MUST expose health check endpoints and Dapr
  subscription endpoints
- **Middleware:** MUST be composable and reusable
- **Middleware:** MUST include request ID generation, correlation ID
  propagation, and logging
- **Business Logic:** MUST be testable without HTTP or event context
- **Data Access:** MUST use ORM (no raw SQL except complex queries)
- **User Isolation:** MUST be enforced in data access layer (ALL
  queries filter by `user_id`)

**File Structure:**
```
backend/
├── src/
│   ├── events/            # Event Layer (New for Phase V)
│   │   ├── publisher.ts        # Dapr pub/sub publisher
│   │   ├── subscribers.ts      # Event subscription handlers
│   │   ├── event-types.ts      # Event type definitions
│   │   └── dead-letter.ts      # Dead-letter handling
│   ├── autonomous/        # Autonomous Agent Layer
│   │   ├── scheduler.ts
│   │   ├── overdue-monitor.ts
│   │   ├── prioritization-agent.ts
│   │   └── suggestion-generator.ts
│   ├── ai/                # AI & Agent Layer
│   │   ├── agent.ts
│   │   ├── intent-detector.ts
│   │   ├── parameter-extractor.ts
│   │   └── action-planner.ts
│   ├── routes/            # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── tasks.routes.ts
│   │   ├── suggestions.routes.ts
│   │   ├── health.routes.ts
│   │   └── dapr.routes.ts      # Dapr subscription endpoints
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── logger.middleware.ts
│   │   ├── request-id.middleware.ts
│   │   └── correlation.middleware.ts
│   ├── services/          # Business logic
│   │   ├── task.service.ts     # Publishes events via Dapr
│   │   ├── recurrence.service.ts
│   │   └── suggestion.service.ts
│   ├── repositories/      # Database access
│   │   ├── task.repository.ts
│   │   └── suggestion.repository.ts
│   ├── models/            # TypeScript types/interfaces
│   │   ├── task.model.ts
│   │   ├── event.model.ts
│   │   └── suggestion.model.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── ai.config.ts
│   │   ├── dapr.config.ts
│   │   ├── kafka.config.ts
│   │   └── logger.config.ts
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── Dockerfile
├── .env.example
└── package.json
```

## Event-Driven Design (Core of Phase V)

### Defined Events (JSON Payloads)

| Event Type | Payload Fields | Publisher |
|---|---|---|
| `tasks.created` | taskId, userId, title, dueDate?, priority?, recurring? | Task service |
| `tasks.updated` | taskId, userId, changes | Task service |
| `tasks.deleted` | taskId, userId | Task service |
| `tasks.completed` | taskId, userId | Task service |
| `tasks.incomplete` | taskId, userId | Task service |
| `tasks.overdue` | taskId, userId, dueDate, overdueBy | Overdue agent |
| `tasks.reminder` | taskId, userId, dueDate, reminderTime | Scheduler |

All events MUST include: `eventType`, `correlationId`, `timestamp`.

### Publishers
- **Task service** (`backend/src/services/task.service.ts`): Publish
  on CRUD operations via Dapr SDK after successful persistence
- **Scheduler** (`backend/src/autonomous/scheduler.ts`): Check
  overdue/recurring tasks and publish events on schedule

### Subscribers / Consumers
- **Overdue agent**: Subscribe to `tasks.created` + scheduler
  triggers; publish `tasks.overdue` when detected
- **Prioritization agent**: React to `tasks.updated` for
  re-prioritization suggestions
- **Notification / chatbot service**: Subscribe to `tasks.reminder`
  and `tasks.overdue` for user notifications
- **Suggestion service**: Optionally trigger on task events

### Dapr Pub/Sub Component
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub-kafka
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers
    value: "<DO-MANAGED-KAFKA-BROKER-URL>"
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
```

## DOKS Deployment Architecture

### Service Topology

```
+---------------------------------------------------------------+
|                   DigitalOcean Kubernetes (DOKS)               |
+---------------------------------------------------------------+
|                                                               |
| +---------------+ +---------------+ +---------------+         |
| |   Frontend    | |  Backend API  | |   AI Agent    |         |
| |   Service     | |   Service     | |   Service     |         |
| | (Deployment)  | | (Deployment)  | | (Deployment)  |         |
| |               | |               | |               |         |
| | Port: 3000    | | Port: 4000    | | Port: 5000    |         |
| | Replicas: 2+  | | Replicas: 2+  | | Replicas: 1+  |         |
| | [Dapr sidecar]| | [Dapr sidecar]| | [Dapr sidecar]|         |
| +-------+-------+ +-------+-------+ +-------+-------+         |
|         |                 |                 |                  |
| +-------v-----------------v-----------------v--------+         |
| |              NGINX Ingress Controller              |         |
| +----------------------------------------------------+         |
|                                                               |
| +----------------------------------------------------+         |
| |              ConfigMaps & Secrets                  |         |
| |  - app-config (env vars via Helm values)           |         |
| |  - kafka-creds (SASL username/password)            |         |
| |  - db-credentials (DATABASE_URL)                   |         |
| |  - ai-credentials (OpenAI API key)                 |         |
| +----------------------------------------------------+         |
|                                                               |
| +----------------------------------------------------+         |
| |              Dapr Components                       |         |
| |  - pubsub-kafka (Kafka pub/sub)                    |         |
| |  - statestore (optional, if needed beyond Prisma)  |         |
| +----------------------------------------------------+         |
|                                                               |
+---------------------------------------------------------------+
             |                          |
             v                          v
  +-------------------+    +------------------------+
  | Neon PostgreSQL   |    | DO Managed Kafka       |
  | (External)        |    | (External)             |
  +-------------------+    +------------------------+
```

### Deployment Manifests Structure (Helm)

```
k8s/
├── helm/
│   └── todo-app/
│       ├── Chart.yaml
│       ├── values.yaml           # Default values
│       ├── values-dev.yaml       # Local/Minikube overrides
│       ├── values-doks.yaml      # DOKS production values
│       └── templates/
│           ├── _helpers.tpl
│           ├── namespace.yaml
│           ├── frontend-deployment.yaml
│           ├── frontend-service.yaml
│           ├── backend-deployment.yaml
│           ├── backend-service.yaml
│           ├── ai-agent-deployment.yaml
│           ├── ai-agent-service.yaml
│           ├── configmap.yaml
│           ├── secrets.yaml
│           ├── ingress.yaml
│           └── hpa.yaml
├── dapr/
│   ├── pubsub-kafka.yaml
│   └── statestore.yaml (optional)
└── secrets/
    └── secrets.yaml.example
```

**Non-Negotiable Rules:**
- **Separate services:** Frontend, Backend, and AI Agent MUST be
  separate Kubernetes Deployments with Dapr sidecars
- **Health probes:** All Deployments MUST have liveness and readiness
  probes configured
- **Resource limits:** All containers MUST specify resource requests
  and limits
- **Secrets:** Sensitive values MUST use Kubernetes Secrets
- **Ingress:** External access MUST be via NGINX Ingress Controller
- **Namespacing:** Application MUST deploy to a dedicated namespace
- **Dapr annotations:** All deployments MUST include Dapr sidecar
  annotations (`dapr.io/enabled: "true"`, `dapr.io/app-id`,
  `dapr.io/app-port`)
- **HPA:** Backend and AI Agent MUST have HorizontalPodAutoscaler
  configured

### DOKS Setup Steps
1. Create DOKS cluster via DO CLI / panel (3-node pool, smallest
   viable size)
2. Get kubeconfig: `doctl kubernetes cluster kubeconfig save <id>`
3. Install Dapr: `dapr init -k` or via Helm
4. Install NGINX Ingress: Helm repo add & install
5. Create secrets: Kafka creds, Neon URL, OpenAI key
6. Deploy: `helm upgrade --install todo-app ./k8s/helm/todo-app
   --values values-doks.yaml`
7. Verify health endpoints and Dapr sidecar injection

## Service Containerization Requirements

### Dockerfile Standards

**Backend Dockerfile Example:**
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules \
  ./node_modules
USER appuser
EXPOSE 4000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
```

**Non-Negotiable Rules:**
- **Multi-stage builds:** MUST minimize final image size
- **Alpine base:** MUST use Alpine-based images
- **Non-root user:** MUST create and use a non-root user
- **No secrets in images:** NEVER bake secrets into Docker images
- **.dockerignore:** MUST exclude node_modules, .env, etc.
- **Health check:** MUST rely on Kubernetes probes or include
  HEALTHCHECK instruction

## Authentication & Authorization

### Better Auth Integration

**Requirements:**
- Use Better Auth for all authentication flows
- Session-based authentication (stateful sessions in database)
- CSRF protection enabled
- Secure cookie configuration (httpOnly, secure, sameSite)

**Auth Flows:**

1. **Signup:** `POST /api/v1/auth/signup` — validate, create user,
   return session
2. **Signin:** `POST /api/v1/auth/signin` — validate credentials,
   create session
3. **Signout:** `POST /api/v1/auth/signout` — invalidate session,
   clear cookies
4. **Session Validation:** Middleware checks on every protected route

**Authorization Rules:**
- All `/api/v1/tasks/*` endpoints REQUIRE authentication
- All `/api/v1/suggestions/*` endpoints REQUIRE authentication
- Users can ONLY access their own tasks and suggestions
- Database queries MUST include `WHERE user_id = $authenticatedUserId`
- Health check endpoints (`/health`, `/ready`) do NOT require auth
- Dapr subscription endpoints are internal (sidecar-to-app) and
  do NOT require user auth but MUST validate Dapr headers

## Frontend Architecture

### Component Structure

**Component Hierarchy:**
```
App
├── AuthProvider (wraps entire app)
├── Routes
│   ├── SignupPage
│   ├── SigninPage
│   └── DashboardPage
│       ├── TaskListContainer
│       │   ├── TaskList
│       │   │   ├── TaskItem
│       │   │   └── TaskFilters
│       │   ├── AddTaskForm
│       │   └── AIChatInterface
│       ├── SuggestionsPanel (agent suggestions + event notifications)
│       └── Sidebar
```

**File Structure:**
```
frontend/
├── src/
│   ├── components/
│   │   ├── TaskItem.tsx
│   │   ├── TaskList.tsx
│   │   ├── Button.tsx
│   │   ├── ChatMessage.tsx
│   │   └── SuggestionCard.tsx
│   ├── containers/
│   │   ├── TaskListContainer.tsx
│   │   ├── AddTaskFormContainer.tsx
│   │   ├── AIChatContainer.tsx
│   │   └── SuggestionsContainer.tsx
│   ├── pages/
│   │   ├── SignupPage.tsx
│   │   ├── SigninPage.tsx
│   │   └── DashboardPage.tsx
│   ├── hooks/
│   │   ├── useTasks.ts
│   │   ├── useAuth.ts
│   │   ├── useAIChat.ts
│   │   └── useSuggestions.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── tasks.api.ts
│   │   ├── ai.api.ts
│   │   └── suggestions.api.ts
│   ├── types/
│   │   ├── task.types.ts
│   │   ├── ai.types.ts
│   │   └── suggestion.types.ts
│   ├── utils/
│   │   ├── dateFormatter.ts
│   │   └── ai-response-parser.ts
│   └── App.tsx
├── public/
├── Dockerfile
└── package.json
```

### State Management Rules

**Non-Negotiable Rules:**
- **Server state:** Fetch from API, cache in component state/context
- **Client state:** Use React's `useState` for local component state
- **Avoid prop drilling:** Use React Context for deeply nested state
- **No global mutable state:** All state changes MUST be explicit

### API Integration

**Required Patterns:**
- Centralized API client (`services/api.ts`) with base URL config,
  auth headers, error handling, retry logic
- Per-resource API modules (`tasks.api.ts`, `auth.api.ts`,
  `suggestions.api.ts`)
- Credentials included (`credentials: 'include'`) for session auth

## UI/UX Requirements

### Responsive Design
- MUST support desktop (1024px+), tablet (768-1023px), mobile
  (320-767px)
- Mobile-first approach
- Touch-friendly tap targets (minimum 44x44px)

### Accessibility
- Semantic HTML
- ARIA labels for icon-only buttons
- Keyboard navigation support
- Color contrast WCAG AA (4.5:1 for normal text)
- AI chat interface accessible via keyboard and screen readers
- Suggestion notifications accessible

### Visual Design Principles
- Consistent spacing: 4px/8px grid
- Typography hierarchy: clear heading levels
- Status indicators: green checkmark (complete), empty checkbox
  (incomplete), red highlight (overdue)
- Priority colors: High=Red, Medium=Yellow, Low=Gray
- Loading states: skeleton loaders or spinners
- Empty states: helpful messages
- AI chat: clear user/AI distinction
- Suggestion cards: non-intrusive, dismissible, actionable
- Event notifications: toast-style for real-time event feedback

### AI Interface Design Principles
- Clarity, feedback, safety, transparency, fallback to traditional UI

### Autonomous Agent UI Design
- Non-intrusive, dismissible, actionable, user-controllable

## Error Handling

### Backend Error Handling
- Centralized error handler middleware with request ID correlation
- Known validation errors return 400 with actionable messages
- Auth errors return 401/403
- Server errors return 500 with generic message (stack in logs only)
- Event publishing failures MUST be logged and retried; MUST NOT
  fail the HTTP response

### Frontend Error Handling
- Toast notifications for transient errors
- Inline validation for forms
- Graceful degradation with cached data
- Retry mechanisms for network errors

### AI-Specific Error Handling
- Ambiguous input: clear error messages
- Parameter extraction failures: graceful handling
- Intent classification errors: helpful suggestions
- API call failures: inform user appropriately
- Processing limits: timeouts and rate limiting

### Autonomous Agent + Event Error Handling
- Background agent failures MUST NOT affect user-facing functionality
- Failed suggestion delivery MUST retry with exponential backoff
- Agent failures logged but not displayed unless critical
- Kafka consumer errors MUST be logged with correlation ID
- Dead-letter topics for unprocessable events

## Testing Strategy

### Infrastructure Testing
- Container tests: Dockerfiles build and pass security scans
- Kubernetes tests: Validate manifests with `kubectl dry-run` or
  `kubeval`
- Health check tests: Verify endpoints return correct status
- Integration tests: Service-to-service in containerized environment
- Dapr tests: Verify sidecar injection and pub/sub connectivity
- Helm tests: `helm lint` and `helm template` validation

### Event-Driven Testing (New for Phase V)
- **Publisher tests:** Verify events are published after CRUD ops
- **Subscriber tests:** Verify handlers process events correctly
- **Idempotency tests:** Verify duplicate events do not cause errors
- **Dead-letter tests:** Verify failed events route to DLQ
- **End-to-end event flow:** task.created -> agent processes ->
  suggestion appears

### AI & Agent Layer Testing
- Intent detection, parameter extraction, action planning tests
- Conversation flow tests
- Error handling tests
- Autonomous agent suggestion generation tests
- Event-triggered agent behavior tests

### Backend Testing
- Unit tests: Business logic (services) >80% coverage
- Integration tests: API routes with real database
- Health check tests
- Event publishing integration tests

### Frontend Testing
- Component tests: React Testing Library
- Integration tests: User flows
- AI interface tests
- Suggestion display and dismissal tests

## Environment Configuration

### Required Environment Variables

**Backend (.env):**
```
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Better Auth
AUTH_SECRET=<random-secret-key>
AUTH_COOKIE_NAME=session
AUTH_COOKIE_SECURE=true

# AI Service
OPENAI_API_KEY=<your-openai-api-key>
AI_MODEL_NAME=gpt-4o
AI_TEMPERATURE=0.7

# Autonomous Agent
AUTONOMOUS_AGENT_ENABLED=true
AUTONOMOUS_AGENT_INTERVAL_MS=300000
SUGGESTION_RATE_LIMIT_PER_HOUR=10

# Kafka / Dapr (New for Phase V)
DAPR_HTTP_PORT=3500
DAPR_PUBSUB_NAME=pubsub-kafka
KAFKA_BROKERS=<do-managed-kafka-broker-url>

# Observability
LOG_LEVEL=info
LOG_FORMAT=json

# Server
PORT=4000
NODE_ENV=development
```

**Kubernetes Secrets (production):**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: todo-app-secrets
type: Opaque
stringData:
  DATABASE_URL: <base64-encoded>
  AUTH_SECRET: <base64-encoded>
  OPENAI_API_KEY: <base64-encoded>
---
apiVersion: v1
kind: Secret
metadata:
  name: kafka-creds
type: Opaque
stringData:
  username: <base64-encoded>
  password: <base64-encoded>
```

**Rules:**
- `.env` files MUST be in `.gitignore`
- `.env.example` MUST be committed with dummy values
- Secrets MUST be generated securely
- Production secrets via Kubernetes Secrets
- Kafka credentials MUST be separate Kubernetes Secret
- Secret templates MUST NOT contain real values

## Deployment Readiness

**Required Artifacts:**
- Dockerfiles: Multi-stage builds for all services
- Helm charts: Complete DOKS deployment configuration
- Dapr components: pubsub-kafka YAML
- Health endpoints: `/health` and `/ready` for all services
- Environment config: ConfigMaps, Secrets, Helm values
- Database migrations: Prisma migration files
- Production build scripts

**Deployment Workflow:**
1. Build Docker images for all services
2. Push images to container registry
3. Ensure DOKS cluster, Dapr, and NGINX Ingress are ready
4. Apply Dapr component YAMLs
5. `helm upgrade --install` with `values-doks.yaml`
6. Verify health checks, Dapr sidecars, and Kafka connectivity
7. Monitor logs for errors and event flow

## Bonus Targets

- **Reusable intelligence:** Create "event-handler" agent skill +
  subagents for overdue/reminder/prioritization logic
- **Cloud-native blueprints:** Spec -> Helm/Dapr/Kafka YAML
  generation via Claude Code
- **Optional:** Urdu support in chatbot (prompt engineering)

## Performance & Scale Goals

- Handle 100+ concurrent users
- <500ms event processing latency end-to-end
- Kafka consumer lag < 100 messages under normal load
- API p95 latency < 200ms for CRUD operations

## Documentation Requirements

### README.md (Required)
MUST include: project overview, tech stack, prerequisites (Node.js
20+, Docker, kubectl, Helm, doctl, Dapr CLI), local dev setup,
Docker dev setup, DOKS deployment steps, project structure, API
docs reference, testing instructions.

### API Documentation (Required)
MUST include for each endpoint: method, path, request/response
schemas, error codes, auth requirements.

### Quickstart Guide (Required for Phase V)
MUST include step-by-step DOKS deployment instructions covering
cluster creation, Dapr/Ingress installation, secret configuration,
Helm deployment, and verification.

## Governance

### Amendment Procedure

1. Amendments MUST be proposed with rationale and impact analysis
2. Amendments MUST be approved before implementation begins
3. Version MUST be incremented according to semantic versioning:
   - **MAJOR (4.x.x -> 5.0.0):** Backward-incompatible architecture
     changes (e.g., event-driven layer, managed cloud shift)
   - **MINOR (5.0.x -> 5.1.0):** New principles/sections added or
     materially expanded
   - **PATCH (5.0.0 -> 5.0.1):** Clarifications, wording fixes
4. All dependent templates and documentation MUST be updated

### Versioning Policy

- Constitution version follows semantic versioning (MAJOR.MINOR.PATCH)
- All specs, plans, and code reviews MUST reference the constitution
  version they comply with

### Compliance Review

- All PRs and design reviews MUST verify compliance with this
  constitution
- Security violations MUST block merges (no exceptions)
- Infrastructure violations (missing health checks, non-root
  containers, missing Dapr annotations) MUST block merges
- Event-driven violations (missing event publishing, no idempotency)
  MUST be flagged in review
- Deviations require explicit approval and ADR

**Enforcement:** Non-compliance blocks merges. No exceptions.

## Progressive Implementation Strategy

### Phase Enforcement Rules

1. **Infrastructure MUST be implemented first (Phase V priority)**
   - DOKS cluster provisioning and kubeconfig
   - Dapr installation on cluster
   - NGINX Ingress Controller installation
   - Kafka credentials and Dapr pub/sub component
   - Helm chart parameterization for DOKS

2. **Event layer MUST be implemented early**
   - Event type definitions and publisher module
   - Dapr pub/sub integration in task service
   - Basic subscriber skeleton

3. **Authentication MUST be implemented early**
   - Signup/Signin flows functional
   - Session management working
   - Protected routes enforcing auth

4. **Basic Level MUST be fully implemented before Intermediate**
   - All CRUD operations functional with event publishing
   - Database persistence working
   - User isolation enforced
   - Frontend UI polished

5. **Intermediate Level MUST be fully implemented before Advanced**
   - Priority, tags, search, filter, and sort working
   - Events published for all operations

6. **Advanced Level requires robust foundation**
   - Due dates and recurrence patterns validated
   - Reminder events published and consumed

7. **Autonomous Agent event features MUST be implemented last**
   - Event-triggered overdue monitoring
   - Prioritization agent subscriptions
   - Suggestion generation from events
   - User preference controls and rate limiting

### Backward Compatibility Rules

- New features MUST NOT break existing API contracts
- Database migrations MUST be non-destructive (additive only)
- Frontend MUST handle tasks created in earlier phases without errors
- Default values MUST be sensible for all optional fields
- Infrastructure changes MUST NOT break existing deployments
- Event publishing MUST NOT break existing synchronous flows
  (publish failures are logged, not thrown)

---

**Version**: 5.0.0 | **Created**: 2025-12-29 | **Ratified**: 2026-01-24 | **Last Amended**: 2026-02-01 | **Phase**: V (Advanced Cloud-Native Event-Driven Deployment)
