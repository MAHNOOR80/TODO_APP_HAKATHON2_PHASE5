---
id: 003
title: Phase 2 Fullstack Task Breakdown
stage: tasks
date: 2025-12-29
surface: agent
model: claude-sonnet-4-5
feature: 004-fullstack-todo-web-app
branch: 004-fullstack-todo-web-app
user: User
command: /sp.tasks
labels: ["tasks", "implementation", "user-stories", "fullstack", "dependency-graph"]
links:
  spec: specs/004-fullstack-todo-web-app/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-fullstack-todo-web-app/tasks.md
tests:
  - None (task planning artifact - tests defined within tasks)
---

## Prompt

/sp.tasks

## Response snapshot

Created comprehensive implementation task breakdown for Full-Stack Todo Web Application Phase 2 with 220 tasks organized by 7 user stories (P1-P7).

**Task Structure**:

1. **Phase 1: Setup (10 tasks - T001-T010)**:
   - Project structure initialization
   - Backend/frontend TypeScript configuration
   - Linting and formatting setup
   - Environment variable templates
   - README documentation

2. **Phase 2: Foundational (36 tasks - T011-T046)** - BLOCKING PHASE:
   - **Backend Foundation (24 tasks)**:
     - Dependency installation (Express/Fastify, Prisma/Drizzle, Better Auth, Zod/Joi, testing frameworks)
     - Database schema and migrations (Users table, Tasks table, indexes)
     - Configuration (database, auth)
     - Middleware (authentication, validation, error handling)
     - Utilities (response formatters, date helpers)
     - Core models (User, Task, types/enums)
     - Server initialization with API versioning
   - **Frontend Foundation (12 tasks)**:
     - Dependency installation (React/Next.js, Tailwind/shadcn, routing, testing)
     - Base API client setup
     - AuthContext provider
     - Root component and routing structure
     - Build tool configuration

3. **Phase 3: User Story 1 - Authentication (23 tasks - T047-T069)** - Priority P1, MVP:
   - **Backend (10 tasks)**: Auth validators, User repository, signup/signin/signout endpoints, tests
   - **Frontend (13 tasks)**: Auth API client, types, useAuth hook, Input/Button components, Signup/Signin pages, protected routing, flow tests
   - **Independent Test**: Register, sign in, view empty task list, sign out, unauthorized access blocked

4. **Phase 4: User Story 2 - Basic Task Management (36 tasks - T070-T105)** - Priority P2:
   - **Backend (17 tasks)**: Task validators, repository, service, 7 CRUD endpoints (GET/POST/PUT/DELETE/PATCH), ownership enforcement, comprehensive tests
   - **Frontend (19 tasks)**: Tasks API client, types, useTasks hook, TaskItem/TaskList/Modal components, containers, DashboardPage, full CRUD UI, tests
   - **Independent Test**: Create, view, edit, delete, toggle completion status

5. **Phase 5: User Story 3 - Priorities & Tags (16 tasks - T106-T121)** - Priority P3:
   - **Backend (6 tasks)**: Update validators/repository for priority enum and tags PostgreSQL array, tests
   - **Frontend (10 tasks)**: Update types, add priority dropdown and tags input to forms, display priority indicators and tag badges, tests
   - **Independent Test**: Create tasks with different priorities/tags, verify visual indicators

6. **Phase 6: User Story 4 - Search, Filter, Sort (24 tasks - T122-T145)** - Priority P4:
   - **Backend (11 tasks)**: Query parameter handling, dynamic WHERE clauses, search (ILIKE), filters (completed/priority/tag), sorting (title/priority/due_date), comprehensive tests
   - **Frontend (13 tasks)**: TaskFilters/TaskSortControls components, filter/sort state management, debounced search (300ms), integration, tests
   - **Independent Test**: Search by keyword, filter by status/priority/tag, sort by various fields

7. **Phase 7: User Story 5 - Due Dates (16 tasks - T146-T161)** - Priority P5:
   - **Backend (6 tasks)**: due_date field validation, repository updates, due date sorting, tests
   - **Frontend (10 tasks)**: Date formatting utils, due date pickers in forms, overdue indicator logic (red if due_date < NOW and not completed), tests
   - **Independent Test**: Create tasks with past/future due dates, verify overdue indicators

8. **Phase 8: User Story 6 - Recurring Tasks (19 tasks - T162-T180)** - Priority P6:
   - **Backend (11 tasks)**: recurrence_pattern enum, recurrence service, calculateNextDueDate logic (daily +1, weekly +7, monthly +1 month with day 31 edge case), auto-generation on completion, tests
   - **Frontend (8 tasks)**: Recurrence dropdown in forms, recurrence icon indicator, list refresh after completion, tests
   - **Independent Test**: Mark recurring task complete, verify new instance created with correct next due date

9. **Phase 9: User Story 7 - Reminders (20 tasks - T181-T200)** - Priority P7:
   - **Backend (7 tasks)**: reminder_enabled/reminder_offset_minutes fields, reminder service, GET /tasks/reminders endpoint, evaluation logic (due_date - offset <= NOW), tests
   - **Frontend (13 tasks)**: useNotifications hook, reminder toggle and offset dropdown in forms, bell icon indicator, periodic polling (60s), browser notifications, permission request, tests
   - **Independent Test**: Create task with reminder, verify bell icon, test reminder trigger simulation

10. **Phase 10: Polish & Cross-Cutting Concerns (20 tasks - T201-T220)**:
    - Loading spinners, error/success toasts
    - Responsive design (mobile breakpoints)
    - WCAG AA accessibility (ARIA labels, keyboard nav, 44x44px touch targets)
    - Bundle optimization (code splitting, lazy loading)
    - Pagination/virtual scrolling for 100+ tasks
    - Rate limiting, comprehensive logging
    - Unit and integration tests
    - Documentation updates
    - Lighthouse audit (target: >90 performance score)
    - Constitution compliance verification
    - End-to-end validation

**Dependencies & Execution Order**:

- **Critical Path**: Setup → Foundational (BLOCKING) → US1 Authentication (BLOCKING) → US2 Basic CRUD (BLOCKING for US3-7) → US5 Due Dates (BLOCKING for US6-7) → Remaining stories → Polish
- **Parallel Opportunities**:
  - Within Setup: T002-T003, T004-T005, T006-T007, T008-T009 can run in parallel
  - Within Foundational: Backend tasks T016-T030 (marked [P]) in parallel, Frontend tasks T040-T042 (marked [P]) in parallel
  - After US1: US2, US3, US4 can start in parallel
  - After US2 and US5: US6, US7 can start in parallel
  - Within each story: All tasks marked [P] can run in parallel

**Implementation Strategies**:

1. **MVP First**: Setup + Foundational + US1 + US2 = Authentication + Basic CRUD (deploy-ready MVP)
2. **Incremental Delivery**: Add one user story at a time, test independently, deploy after each
3. **Parallel Team**: 3 developers can work on US2, US3, US4 simultaneously after US1 completes

**Key Architectural Decisions Embedded in Tasks**:
- Web application structure: backend/ and frontend/ separation
- Layered backend: validators → repositories → services → routes
- Container/Presentational pattern: containers fetch data, components render
- TypeScript strict mode enforced throughout
- User data isolation at query level (all queries filter by user_id)
- Better Auth session-based authentication
- RESTful API with /api/v1/ versioning
- PostgreSQL arrays for tags, UUIDs for all primary keys
- Comprehensive test coverage per user story

**File Location**: `specs/004-fullstack-todo-web-app/tasks.md` (637 lines, 220 tasks)

## Outcome

- ✅ Impact: Complete task breakdown with 220 actionable tasks organized by 7 user stories, enabling independent story implementation, clear dependency management, and parallel team execution
- 🧪 Tests: None (planning artifact - testing tasks embedded within each user story phase)
- 📁 Files: 1 file created (tasks.md - 637 lines, 220 tasks)
- 🔁 Next prompts: Phase 0: Generate research.md (resolve 7 TBD tech stack choices), Phase 1: Generate data-model.md, contracts/, quickstart.md, then `/sp.implement` to execute tasks
- 🧠 Reflection: Task breakdown is comprehensive and follows user story organization from spec.md. Each story has clear "Independent Test" criteria matching spec acceptance scenarios. Critical path identified: Foundational → US1 → US2 → US5 form blocking dependencies. Parallel opportunities maximized (58 tasks marked [P]). MVP strategy defined (US1+US2 = 59 tasks for basic auth+CRUD). All 220 tasks include exact file paths matching plan.md structure. Dependency graph ensures no task can start before prerequisites complete. Implementation strategies cater to solo developer (sequential), incremental delivery (one story at a time), and parallel team (3+ devs) scenarios.

## Evaluation notes (flywheel)

- Failure modes observed: None - task generation completed successfully with all user stories mapped to implementation tasks
- Graders run and results (PASS/FAIL): User story coverage check - PASS (all 7 stories from spec.md have corresponding task phases)
- Prompt variant (if applicable): N/A (standard sp.tasks workflow)
- Next experiment (smallest change to try): Execute Phase 0 research.md generation to resolve 7 TBD technology decisions, then begin implementation with Phase 1 Setup tasks
