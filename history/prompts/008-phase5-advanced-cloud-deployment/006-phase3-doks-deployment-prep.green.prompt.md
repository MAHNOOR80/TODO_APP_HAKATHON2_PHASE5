---
id: 006
title: Phase 3 DOKS Deployment Preparation
stage: green
date: 2026-02-01
surface: agent
model: claude-opus-4-5-20251101
feature: 008-phase5-advanced-cloud-deployment
branch: 008-phase5-advanced-cloud-deployment
user: user
command: /sp.implement
labels: ["docker", "kubernetes", "doks", "deployment", "phase3"]
links:
  spec: specs/008-phase5-advanced-cloud-deployment/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - ai-agent/Dockerfile
  - ai-agent/prisma/schema.prisma
  - ai-agent/src/services/suggestion-api.service.ts
  - ai-agent/package-lock.json
  - specs/008-phase5-advanced-cloud-deployment/quickstart-doks.md
  - specs/008-phase5-advanced-cloud-deployment/tasks.md
tests:
  - docker build todo-backend:v2.0.0 (PASS - 748MB)
  - docker build todo-frontend:v2.0.0 (PASS - 94.7MB)
  - docker build todo-ai-agent:v2.0.0 (PASS - 438MB, after Prisma fix)
  - npx tsc --noEmit ai-agent (PASS - clean compilation)
---

## Prompt

proceed with phase 3

## Response snapshot

Completed Phase 3 local tasks (T026, T037). Fixed critical ai-agent Docker build issues discovered during execution:

- T026: Built all three Docker images with v2.0.0 tags:
  - todo-backend:v2.0.0 (748MB) - built clean
  - todo-frontend:v2.0.0 (94.7MB) - built clean with VITE_API_URL=/api/v1
  - todo-ai-agent:v2.0.0 (438MB) - required fixes:
    1. Missing package-lock.json: generated via npm install
    2. Missing Prisma schema: copied backend/prisma/schema.prisma to ai-agent/prisma/
    3. Dockerfile updated: added openssl, prisma schema copy, prisma generate step, prisma dir in runner
    4. Type error in suggestion-api.service.ts: cast metadata to Prisma.InputJsonValue

- T037: Created comprehensive quickstart-doks.md with 10 deployment steps:
  Steps 1-3: Cluster provisioning, Dapr install, NGINX Ingress
  Steps 4-7: Image build/push, namespace/secrets, Dapr components, Helm values
  Steps 8-10: Helm deploy, verification, smoke test
  Plus: troubleshooting section, upgrade/redeploy instructions, teardown

- T027-T036: Documented as manual deployment tasks requiring DOKS cluster access. User will provide credentials at the end.

## Outcome

- Impact: All Docker images build successfully; quickstart guide documents complete DOKS deployment flow. Ready for cloud deployment once user provides registry/cluster credentials.
- Tests: All 3 Docker builds PASS, ai-agent TypeScript compilation PASS
- Files: 5 files created/modified, 1 lock file generated
- Next prompts: User provides DOKS credentials for T027-T036 execution, or proceed to Phase 4 (Event Publishing)
- Reflection: The ai-agent was missing Prisma schema and package-lock.json, causing Docker build failures. These were pre-existing gaps that only surfaced during containerized builds. Fixed by copying schema and updating Dockerfile to match backend's Prisma pattern.

## Evaluation notes (flywheel)

- Failure modes observed: ai-agent Docker build failed twice - missing package-lock.json and missing Prisma schema/types
- Graders run and results (PASS/FAIL): All 3 Docker builds PASS after fixes
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add prisma generate to ai-agent npm postinstall script to avoid future schema drift
