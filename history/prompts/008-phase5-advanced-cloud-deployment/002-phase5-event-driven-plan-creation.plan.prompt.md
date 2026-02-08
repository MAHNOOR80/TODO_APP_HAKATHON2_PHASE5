---
id: 002
title: Phase V Event-Driven Plan Creation
stage: plan
date: 2026-02-01
surface: agent
model: claude-opus-4-5-20251101
feature: 008-phase5-advanced-cloud-deployment
branch: phase5-advanced-cloud-event-driven
user: user
command: /sp.plan
labels: ["plan", "phase5", "event-driven", "kafka", "dapr", "doks", "helm", "architecture"]
links:
  spec: specs/008-phase5-advanced-cloud-deployment/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/008-phase5-advanced-cloud-deployment/plan.md
tests:
  - N/A (planning document, no code tests)
---

## Prompt

Feature/Phase: Phase V - Advanced Cloud-Native Event-Driven Deployment on DigitalOcean Kubernetes (DOKS)

Spec Reference: specs/008-phase5-advanced-cloud-deployment/spec.md with P1 (DOKS deployment), P2 (event-driven lifecycle), P3 (reactive agents).

Constitution Reference: v5.0.0 - Event-driven first, reusable intelligence, spec-driven blueprints, DOKS deployment.

Technical Context: TypeScript 5+/Node.js 20, Express, Prisma, @dapr/dapr (new), DO Managed Kafka, DOKS 3-node cluster.

Key inputs: Extend existing monorepo (backend/, frontend/, ai-agent/, k8s/helm/). Add events/ layer to backend and ai-agent. Extend Helm chart with ai-agent deployment, Dapr annotations, values-doks.yaml. Generate pubsub-kafka.yaml Dapr component.

## Response snapshot

Created comprehensive implementation plan at specs/008-phase5-advanced-cloud-deployment/plan.md.

**5 Key Architecture Decisions:**
1. Dapr SDK over raw Kafka client (portability, resiliency, less code)
2. Single `tasks-lifecycle` topic over per-event topics (simpler management)
3. Fire-and-forget publishing over transactional outbox (simplicity, cron safety net)
4. AI-agent with own Dapr sidecar over backend-forwarding (clean service boundary)
5. Dual-trigger pattern: cron + events with deduplication (reliability)

**6 Implementation Phases:**
- Phase 1: Infrastructure (Helm chart extension, values-doks.yaml, Dapr component YAMLs)
- Phase 2: Event Layer foundation (@dapr/dapr, event-types.ts, publisher.ts, Prisma migration)
- Phase 3: US1/P1 DOKS Deployment MVP (build images, helm install, verify public access)
- Phase 4: US2/P2 Event Publishing (modify task.service.ts, add correlation middleware)
- Phase 5: US3/P3 Reactive Agents (Express server in ai-agent, event-handler-skill, wire handlers)
- Phase 6: Polish (HPA, dead-letter handling, quickstart docs)

**Constitution Check:** All 11 principles pass. No violations.

**Files analyzed:**
- backend/src/index.ts (114 lines) - will add Dapr routes and correlation middleware
- backend/src/services/task.service.ts (127 lines) - will add event publishing to 5 methods
- ai-agent/src/index.ts (95 lines) - will add Express server for Dapr subscriptions
- ai-agent/src/scheduler.ts (92 lines) - dual-trigger integration point
- ai-agent/src/agents/overdue-agent.ts (129 lines) - will add handleTaskCreatedEvent
- ai-agent/src/agents/prioritization-agent.ts (190 lines) - will add handleTaskUpdatedEvent
- k8s/helm/todo-app/values.yaml (96 lines) - will extend with aiAgent and Dapr sections
- k8s/helm/todo-app/templates/deployment-backend.yaml (53 lines) - will add Dapr annotations
- backend/prisma/schema.prisma (117 lines) - will add sourceEvent/correlationId to AgentSuggestion
- 7 additional Helm templates inspected

**Spec-driven blueprint artifacts designed:**
- values-doks.yaml (complete YAML structure with all overrides)
- pubsub-kafka.yaml (Dapr Kafka component with SASL/TLS)
- resiliency.yaml (retry and circuit breaker policies)
- Event type definitions (TypeScript enum + interfaces)
- Publisher module (DaprClient wrapper with fire-and-forget)
- Subscriber module (Express router with Dapr subscription API)
- Event-handler-skill (extensible dispatch pattern for bonus points)

## Outcome

- Impact: Complete Phase V architectural plan enabling event-driven cloud-native development with 6 phases, 5 key decisions, and full file-level implementation details
- Tests: N/A (planning document)
- Files: specs/008-phase5-advanced-cloud-deployment/plan.md (created)
- Next prompts: /sp.tasks to generate task breakdown from plan, /sp.adr for fire-and-forget vs transactional outbox decision, /sp.implement to begin implementation
- Reflection: Plan covers every existing file that needs modification with exact line counts and change descriptions. Architecture decisions are documented with alternatives considered and trade-offs. Phase sequencing allows parallel work where possible (Phase 2 || Phase 3). Dual-trigger pattern ensures no regression from existing cron behavior.

## Evaluation notes (flywheel)

- Failure modes observed: None - plan created successfully with full codebase context
- Graders run and results (PASS/FAIL): Manual validation PASS - constitution check covers all 11 principles; all phases have clear validation criteria; file paths match actual codebase
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run /sp.tasks to generate executable task breakdown
