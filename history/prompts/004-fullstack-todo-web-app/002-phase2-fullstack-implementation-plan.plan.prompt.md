---
id: 002
title: Phase 2 Fullstack Implementation Plan
stage: plan
date: 2025-12-29
surface: agent
model: claude-sonnet-4-5
feature: 004-fullstack-todo-web-app
branch: 004-fullstack-todo-web-app
user: User
command: /sp.plan
labels: ["plan", "architecture", "fullstack", "tech-stack", "data-model", "api-contracts"]
links:
  spec: specs/004-fullstack-todo-web-app/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-fullstack-todo-web-app/plan.md
tests:
  - None (planning artifact)
---

## Prompt

/sp.plan

## Phase 2 Execution Plan – Todo Web Application

### 1. Architecture Setup
- Split project into:
  - Backend (REST API)
  - Frontend (Web UI)
  - Database (Neon PostgreSQL)
- Enforce agentic workflow and spec-driven development.

---

### 2. Authentication
- Integrate **Better Auth** for:
  - User signup, signin, signout
- Protect all task-related API routes.
- Ensure users can access only their own data.

---

### 3. Database & Persistence
- Design PostgreSQL schema for:
  - Users
  - Tasks
  - Priorities, categories
  - Due dates, reminders, recurrence
- Implement migrations and data access layer.

---

### 4. Backend API (RESTful)
- Implement CRUD endpoints for tasks.
- Add endpoints for:
  - Mark complete/incomplete
  - Search, filter, sort
  - Recurring task generation
  - Reminder evaluation
- Handle recurrence and reminders server-side.

---

### 5. Frontend (Responsive UI)
- Build auth pages (signup/signin).
- Create task dashboard with:
  - Create, edit, delete tasks
  - Priority, category, due date inputs
  - Search, filter, and sort controls
- Display indicators for reminders and recurrence.
- Ensure mobile and desktop responsiveness.

---

### 6. Advanced Logic Integration
- Auto-generate recurring tasks on completion.
- Trigger reminders based on server time.
- Prevent duplicate or infinite recurrence creation.

---

### 7. Testing & Validation
- Test API endpoints with auth enforcement.
- Validate full feature parity with Phase 1.
- Test UI flows and edge cases.

---

### 8. Documentation & Delivery
- Update `/specs` history for Phase 2.
- Update `README.md` and `CLAUDE.md`.
- Prepare app for deployment.

---

## Success Criteria
- Authenticated users manage tasks end-to-end.
- All Basic, Intermediate, and Advanced features work via web UI.
- Data persists reliably.
- App is clean, responsive, and production-ready.

## Response snapshot

Created comprehensive Phase 2 implementation plan for Full-Stack Todo Web Application with detailed architecture, technology stack, database schema, API contracts, and project structure.

**Plan Structure**:

1. **Summary**: Core transformation (CLI → Web, In-Memory → PostgreSQL, Python → TypeScript), feature parity (100% with Phase 1), and technical approach (layered backend, component-based frontend, RESTful API)

2. **Technical Context**:
   - Language: TypeScript 5+ (strict mode), Node.js 20+ LTS
   - 7 TBD Technology Decisions:
     - Backend framework: Express.js vs Fastify
     - ORM: Prisma vs Drizzle
     - Frontend: React 18+ vs Next.js 14+
     - CSS: Tailwind CSS vs shadcn/ui
     - Testing: Jest vs Vitest
     - Package manager: pnpm vs npm
     - Validation: Zod vs Joi
   - Performance goals: <2s page load, <1s search/filter, <10s task creation, <500KB bundle
   - Scale: 100 concurrent users, 10k tasks per user, 5-10k LOC estimated

3. **Constitution Check (GATE: PASS)**:
   - ✅ All 5 core principles addressed (Simplicity, Clean Code, Modularity, Security First, API-First Design)
   - ✅ Mandatory technologies compliant (Node.js, TypeScript, Better Auth, Neon PostgreSQL, ESLint/Prettier)
   - ✅ Database schema meets all constitution requirements (UUIDs, foreign keys, indexes, PostgreSQL arrays)
   - ✅ Layered architecture enforces separation of concerns (HTTP → Middleware → Business Logic → Data Access)
   - ⚠️ 7 TBD items to be resolved in Phase 0 research.md
   - **Gate Status**: PASS (with deferred technology choices)

4. **Project Structure**:
   - Documentation: plan.md, research.md, data-model.md, quickstart.md, contracts/ (OpenAPI + detailed docs)
   - Source code: backend/ and frontend/ separation (web application structure selected)
   - Detailed file trees: 30+ backend files, 25+ frontend files with clear layering
   - Rationale: Constitution mandates layered architecture, different tech stacks, independent scaling

5. **Phase 0: Research & Technology Selection**:
   - 7 technology decision research tasks with evaluation criteria
   - 5 best practices research tasks (Better Auth, Neon PostgreSQL, recurring tasks, reminders, API versioning)
   - Required output: research.md with decisions, rationale, alternatives, and implementation notes

6. **Phase 1: Data Model & API Contracts**:
   - **User Entity**: UUID, email (unique), name, timestamps, Better Auth integration
   - **Task Entity**: UUID, user_id (FK CASCADE), title, description, completed, priority (enum), tags (array), category, due_date, recurrence_pattern (enum), reminder_enabled, reminder_offset_minutes, timestamps
   - **Indexes**: idx_tasks_user_id, idx_tasks_due_date, idx_tasks_completed, idx_tasks_user_priority
   - **State Transitions**: Mark complete (with recurrence logic), mark incomplete, delete
   - **Validation Rules**: 15 detailed validation rules for all fields
   - **Edge Cases**: Monthly recurrence day 31, reminder offset edge cases, concurrent updates
   - **API Contracts**: Full OpenAPI 3.0 spec embedded in plan (100+ lines)
     - Auth endpoints: signup (POST), signin (POST), signout (POST)
     - Task endpoints: GET /tasks (with search/filter/sort query params), POST /tasks, GET /tasks/:id, PUT /tasks/:id, DELETE /tasks/:id, PATCH /tasks/:id/complete, PATCH /tasks/:id/incomplete
     - Request/response schemas: SignupRequest, SigninRequest, CreateTaskRequest, UpdateTaskRequest, Task, User, TaskResponse, TaskListResponse, ErrorResponse
     - Security: Cookie-based auth, consistent response format `{success, data, error}`

7. **Quickstart Guide Structure**: Setup instructions, environment variables, database migrations, dev server commands, testing commands, troubleshooting

**Key Architectural Decisions**:
- Web application structure (backend/frontend separation) selected over single project or mobile+API
- Monorepo consideration: npm/pnpm workspaces or Nx/Turborepo (deferred to research)
- Layered backend architecture with strict separation (HTTP, Middleware, Business Logic, Data Access)
- Container/Presentational component pattern for frontend
- Session-based authentication (not JWT) via Better Auth
- RESTful API with `/api/v1/` versioning
- UUIDs for all primary keys (not auto-increment integers)
- PostgreSQL arrays for tags (native support, efficient querying)
- User data isolation enforced at query level (`WHERE user_id = $authenticatedUserId`)

**Constitution Compliance**:
- Zero violations detected
- All security principles embedded (password hashing, auth on all endpoints, input validation, SQL injection prevention, XSS prevention, CSRF protection, environment secrets, user isolation)
- All modularity principles enforced (business logic decoupled from HTTP/DB, UI decoupled from business logic, database schema extensible)
- All API-First principles applied (RESTful conventions, consistent responses, semantic status codes, versioning, actionable errors)

**Critical Path Forward**:
1. Phase 0: Generate research.md (resolve 7 TBD technology choices + 5 best practices)
2. Phase 1: Generate data-model.md (detailed entity definitions with validation/indexes/state transitions)
3. Phase 1: Generate contracts/ (OpenAPI + detailed auth/tasks contracts)
4. Phase 1: Generate quickstart.md (setup guide based on chosen technologies)
5. Phase 1: Run agent context update script
6. Re-evaluate Constitution Check (verify chosen technologies comply)
7. Command ends - ready for `/sp.tasks`

**File Location**: `specs/004-fullstack-todo-web-app/plan.md` (1631 lines)

## Outcome

- ✅ Impact: Comprehensive implementation plan with architecture, tech stack, database schema, API contracts, and project structure ready for implementation
- 🧪 Tests: None (planning artifact - testing strategy defined in plan)
- 📁 Files: 1 file created (plan.md - 1631 lines)
- 🔁 Next prompts: Generate research.md, data-model.md, contracts/, quickstart.md (Phase 0 & 1 artifacts), then `/sp.tasks` for task breakdown
- 🧠 Reflection: Plan is comprehensive, constitution-compliant, and ready for technology decisions. Layered architecture enforces clean separation. Database schema supports all Phase 1 features with proper indexing. API contract is RESTful and well-documented. 7 TBD items appropriately deferred to research phase rather than making arbitrary choices. Gate passed with clear path forward.

## Evaluation notes (flywheel)

- Failure modes observed: None - planning process completed successfully with all constitution checks passing
- Graders run and results (PASS/FAIL): Constitution Check - PASS (with 7 deferred TBD items)
- Prompt variant (if applicable): N/A (standard sp.plan workflow)
- Next experiment (smallest change to try): Generate Phase 0 research.md to resolve technology choices, then validate against constitution principles
