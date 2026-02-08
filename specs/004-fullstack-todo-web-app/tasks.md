# Tasks: Full-Stack Todo Web Application (Phase 2)

**Input**: Design documents from `/specs/004-fullstack-todo-web-app/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md (Phase 0 - pending), data-model.md (Phase 1 - pending), contracts/ (Phase 1 - pending)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a **web application** structure with:
- Backend: `backend/src/`
- Frontend: `frontend/src/`
- Tests: `backend/tests/` and `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project directory structure: backend/, frontend/, .gitignore, README.md
- [x] T002 [P] Initialize backend Node.js project with TypeScript 5+ in backend/package.json
- [x] T003 [P] Initialize frontend Node.js project with TypeScript 5+ in frontend/package.json
- [x] T004 [P] Configure backend linting and formatting in backend/.eslintrc.json and backend/.prettierrc
- [x] T005 [P] Configure frontend linting and formatting in frontend/.eslintrc.json and frontend/.prettierrc
- [x] T006 [P] Configure backend TypeScript strict mode in backend/tsconfig.json
- [x] T007 [P] Configure frontend TypeScript strict mode in frontend/tsconfig.json
- [x] T008 Create backend/.env.example with required environment variables (DATABASE_URL, PORT, AUTH_SECRET)
- [x] T009 Create frontend/.env.example with required environment variables (VITE_API_URL)
- [x] T010 Update README.md with Phase 2 architecture overview and setup instructions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [x] T011 Install backend core dependencies (Express.js OR Fastify - from research.md)
- [x] T012 Install Prisma OR Drizzle ORM (from research.md) and Neon PostgreSQL client
- [x] T013 Install Better Auth library for backend
- [x] T014 Install Zod OR Joi validation library (from research.md)
- [x] T015 Install backend dev dependencies (Jest OR Vitest from research.md, Supertest, ts-node, nodemon)
- [x] T016 [P] Create database schema in backend/prisma/schema.prisma (or backend/drizzle/schema.ts)
- [x] T017 [P] Create User table migration: id (UUID), email (unique), name, created_at, updated_at
- [x] T018 [P] Create Tasks table migration: id (UUID), user_id (FK CASCADE), title, description, completed, priority, tags, category, due_date, recurrence_pattern, reminder_enabled, reminder_offset_minutes, created_at, updated_at
- [x] T019 [P] Create database indexes: idx_tasks_user_id, idx_tasks_due_date, idx_tasks_completed
- [x] T020 Apply initial database migrations and verify schema in Neon PostgreSQL (REQUIRES DATABASE_URL in .env)
- [x] T021 [P] Create database configuration in backend/src/config/database.config.ts
- [x] T022 [P] Create Better Auth configuration in backend/src/config/auth.config.ts
- [x] T023 [P] Implement authentication middleware in backend/src/middleware/auth.middleware.ts
- [x] T024 [P] Implement request validation middleware in backend/src/middleware/validate.middleware.ts
- [x] T025 [P] Implement global error handler middleware in backend/src/middleware/error.middleware.ts
- [x] T026 [P] Create API response utility functions in backend/src/utils/response.utils.ts
- [x] T027 [P] Create date manipulation utilities in backend/src/utils/date.utils.ts
- [x] T028 [P] Define TypeScript types in backend/src/models/types.ts (Priority enum, RecurrencePattern enum)
- [x] T029 [P] Define User model interface in backend/src/models/user.model.ts
- [x] T030 [P] Define Task model interface in backend/src/models/task.model.ts
- [x] T031 Create backend/src/index.ts entry point with Express/Fastify server initialization
- [x] T032 Setup API route aggregation in backend/src/routes/index.ts with /api/v1/ versioning
- [x] T033 Configure CORS for frontend origin in backend middleware
- [x] T034 Verify backend server starts successfully on PORT from .env (REQUIRES npm install)

### Frontend Foundation

- [x] T035 Install frontend core dependencies (React 18+ OR Next.js 14+ - from research.md)
- [x] T036 Install Tailwind CSS OR shadcn/ui (from research.md)
- [x] T037 Install React Router (if using React) or configure Next.js routing
- [ ] T038 Install React Hook Form (optional per plan.md) - SKIPPED (not needed for Phase 2 foundation)
- [x] T039 Install frontend dev dependencies (Vite, React Testing Library, Jest OR Vitest from research.md)
- [x] T040 [P] Create base API client in frontend/src/services/api.ts (fetch wrapper with error handling)
- [x] T041 [P] Create AuthContext provider in frontend/src/context/AuthContext.tsx
- [x] T042 [P] Configure global styles in frontend/src/styles/globals.css (or Tailwind config)
- [x] T043 Create frontend/src/App.tsx root component with routing structure
- [x] T044 Create frontend/src/main.tsx entry point
- [x] T045 Configure frontend build tool (Vite or Next.js) in vite.config.ts or next.config.js
- [x] T046 Verify frontend development server starts successfully (REQUIRES npm install)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Account Creation and Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable users to create accounts, sign in, and access their isolated task workspace

**Independent Test**: Register new account, sign in, view empty task list, sign out, attempt unauthorized task access (should fail)

### Backend Implementation for US1

- [x] T047 [P] [US1] Create auth input validation schemas in backend/src/validators/auth.validator.ts (signup, signin)
- [x] T048 [P] [US1] Create User repository in backend/src/repositories/user.repository.ts (createUser, findByEmail, findById)
- [x] T049 [US1] Implement signup endpoint POST /api/v1/auth/signup in backend/src/routes/auth.routes.ts
- [x] T050 [US1] Implement signin endpoint POST /api/v1/auth/signin in backend/src/routes/auth.routes.ts
- [x] T051 [US1] Implement signout endpoint POST /api/v1/auth/signout in backend/src/routes/auth.routes.ts
- [ ] T052 [US1] Test signup with valid email/password - verify user created in database
- [ ] T053 [US1] Test signup with duplicate email - verify 400 error
- [ ] T054 [US1] Test signin with valid credentials - verify session cookie set
- [ ] T055 [US1] Test signin with invalid credentials - verify 401 error
- [ ] T056 [US1] Test signout - verify session cookie cleared

### Frontend Implementation for US1

- [x] T057 [P] [US1] Create auth API client functions in frontend/src/services/auth.api.ts (signup, signin, signout)
- [x] T058 [P] [US1] Create auth TypeScript types in frontend/src/types/auth.types.ts
- [x] T059 [P] [US1] Create useAuth hook in frontend/src/hooks/useAuth.ts (manages AuthContext state)
- [x] T060 [P] [US1] Create Input presentational component in frontend/src/components/Input.tsx
- [x] T061 [P] [US1] Create Button presentational component in frontend/src/components/Button.tsx
- [x] T062 [US1] Create SignupPage component in frontend/src/pages/SignupPage.tsx with form validation
- [x] T063 [US1] Create SigninPage component in frontend/src/pages/SigninPage.tsx with form validation
- [x] T064 [US1] Configure routing: /signup, /signin, /dashboard (protected route)
- [x] T065 [US1] Implement protected route wrapper that redirects unauthenticated users to /signin
- [ ] T066 [US1] Test signup flow: fill form, submit, verify redirect to /dashboard
- [ ] T067 [US1] Test signin flow: fill form, submit, verify redirect to /dashboard
- [ ] T068 [US1] Test signout: click signout button, verify redirect to /signin
- [ ] T069 [US1] Test protected route: access /dashboard without auth, verify redirect to /signin

**Checkpoint**: At this point, User Story 1 should be fully functional - users can register, sign in, and access authenticated routes

---

## Phase 4: User Story 2 - Basic Task Management (Priority: P2)

**Goal**: Authenticated users can create, view, update, delete, and toggle completion status of tasks

**Independent Test**: Sign in, create multiple tasks with titles/descriptions, view task list, edit task details, mark complete/incomplete, delete tasks

### Backend Implementation for US2

- [x] T070 [P] [US2] Create task input validation schemas in backend/src/validators/task.validator.ts (create, update)
- [x] T071 [P] [US2] Create Task repository in backend/src/repositories/task.repository.ts (create, findAll, findById, update, delete, with user_id isolation)
- [x] T072 [US2] Create Task service in backend/src/services/task.service.ts (business logic layer)
- [x] T073 [US2] Implement GET /api/v1/tasks endpoint in backend/src/routes/tasks.routes.ts (returns user's tasks with auth middleware)
- [x] T074 [US2] Implement POST /api/v1/tasks endpoint in backend/src/routes/tasks.routes.ts (create task for authenticated user)
- [x] T075 [US2] Implement GET /api/v1/tasks/:id endpoint in backend/src/routes/tasks.routes.ts (get single task with ownership check)
- [x] T076 [US2] Implement PUT /api/v1/tasks/:id endpoint in backend/src/routes/tasks.routes.ts (update task with ownership check)
- [x] T077 [US2] Implement DELETE /api/v1/tasks/:id endpoint in backend/src/routes/tasks.routes.ts (delete task with ownership check)
- [x] T078 [US2] Implement PATCH /api/v1/tasks/:id/complete endpoint in backend/src/routes/tasks.routes.ts (mark complete)
- [x] T079 [US2] Implement PATCH /api/v1/tasks/:id/incomplete endpoint in backend/src/routes/tasks.routes.ts (mark incomplete)
- [ ] T080 [US2] Test POST /tasks - verify task created with user_id
- [ ] T081 [US2] Test GET /tasks - verify returns only authenticated user's tasks (data isolation)
- [ ] T082 [US2] Test GET /tasks/:id - verify 403 if task belongs to different user
- [ ] T083 [US2] Test PUT /tasks/:id - verify task updated and ownership enforced
- [ ] T084 [US2] Test DELETE /tasks/:id - verify task deleted and ownership enforced
- [ ] T085 [US2] Test PATCH complete/incomplete - verify toggle works
- [ ] T086 [US2] Test empty title - verify 400 validation error

### Frontend Implementation for US2

- [x] T087 [P] [US2] Create task API client functions in frontend/src/services/tasks.api.ts (getAllTasks, createTask, getTask, updateTask, deleteTask, markComplete, markIncomplete)
- [x] T088 [P] [US2] Create task TypeScript types in frontend/src/types/task.types.ts
- [x] T089 [P] [US2] Create useTasks custom hook in frontend/src/hooks/useTasks.ts (fetch, create, update, delete operations)
- [x] T090 [P] [US2] Create TaskItem presentational component in frontend/src/components/TaskItem.tsx (displays single task)
- [x] T091 [P] [US2] Create TaskList presentational component in frontend/src/components/TaskList.tsx (displays task array)
- [x] T092 [P] [US2] Create Modal presentational component in frontend/src/components/Modal.tsx (reusable modal)
- [x] T093 [US2] Create TaskListContainer in frontend/src/containers/TaskListContainer.tsx (fetches and manages task list state)
- [x] T094 [US2] Create AddTaskFormContainer in frontend/src/containers/AddTaskFormContainer.tsx (handles task creation)
- [x] T095 [US2] Create EditTaskFormContainer in frontend/src/containers/EditTaskFormContainer.tsx (handles task editing)
- [x] T096 [US2] Create DashboardPage component in frontend/src/pages/DashboardPage.tsx (main task management UI)
- [x] T097 [US2] Implement task creation UI: modal form with title (required) and description (optional)
- [x] T098 [US2] Implement task list display with edit and delete buttons per task
- [x] T099 [US2] Implement task editing UI: modal form pre-filled with existing task data
- [x] T100 [US2] Implement task completion toggle: checkbox or button that calls mark complete/incomplete
- [ ] T101 [US2] Test create task: submit form, verify task appears in list
- [ ] T102 [US2] Test edit task: click edit, modify title, save, verify changes persist
- [ ] T103 [US2] Test delete task: click delete, confirm, verify task removed from list
- [ ] T104 [US2] Test toggle completion: click checkbox, verify visual state change and API call
- [ ] T105 [US2] Test empty title validation: submit form without title, verify error message

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - full CRUD operations functional

---

## Phase 5: User Story 3 - Task Organization with Priorities and Tags (Priority: P3)

**Goal**: Users can assign priorities (high/medium/low) and tags to tasks for better organization

**Independent Test**: Create tasks with different priorities, add tags, verify tasks display with correct priority indicators

### Backend Implementation for US3

- [x] T106 [US3] Update task validation schemas in backend/src/validators/task.validator.ts to include priority and tags fields
- [x] T107 [US3] Update Task repository in backend/src/repositories/task.repository.ts to handle priority and tags (PostgreSQL array)
- [ ] T108 [US3] Test POST /tasks with priority - verify priority saved correctly (validate enum: low/medium/high)
- [ ] T109 [US3] Test POST /tasks with tags array - verify tags saved in PostgreSQL array field
- [ ] T110 [US3] Test PUT /tasks/:id updating priority - verify change persists
- [ ] T111 [US3] Test PUT /tasks/:id updating tags - verify array modification works

### Frontend Implementation for US3

- [x] T112 [P] [US3] Update task types in frontend/src/types/task.types.ts to include priority and tags
- [x] T113 [US3] Add priority dropdown to AddTaskFormContainer in frontend/src/containers/AddTaskFormContainer.tsx (options: low, medium, high)
- [x] T114 [US3] Add tags input to AddTaskFormContainer in frontend/src/containers/AddTaskFormContainer.tsx (comma-separated or multi-select)
- [x] T115 [US3] Add priority dropdown to EditTaskFormContainer in frontend/src/containers/EditTaskFormContainer.tsx
- [x] T116 [US3] Add tags input to EditTaskFormContainer in frontend/src/containers/EditTaskFormContainer.tsx
- [x] T117 [US3] Update TaskItem component in frontend/src/components/TaskItem.tsx to display priority indicator (color badge or icon)
- [x] T118 [US3] Update TaskItem component in frontend/src/components/TaskItem.tsx to display tags as badges
- [ ] T119 [US3] Test create task with high priority - verify red/high-priority indicator shows
- [ ] T120 [US3] Test create task with tags ["Work", "Urgent"] - verify tags display as badges
- [ ] T121 [US3] Test edit task priority from medium to low - verify indicator color changes

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should work independently - task organization features functional

---

## Phase 6: User Story 4 - Search, Filter, and Sort Tasks (Priority: P4)

**Goal**: Users can search tasks by keyword, filter by completion/priority/tag, and sort by alphabet/priority/due date

**Independent Test**: Create 10+ tasks with varied properties, search by keyword, filter by completed status, sort by priority, verify results update correctly

### Backend Implementation for US4

- [x] T122 [US4] Update GET /api/v1/tasks endpoint in backend/src/routes/tasks.routes.ts to accept query parameters: search, completed, priority, tag, sort, order
- [x] T123 [US4] Update Task repository in backend/src/repositories/task.repository.ts to build dynamic WHERE clauses for filters
- [x] T124 [US4] Implement search logic in repository: WHERE title ILIKE %keyword% OR description ILIKE %keyword%
- [x] T125 [US4] Implement filter logic: completed (boolean), priority (enum), tag (array contains)
- [x] T126 [US4] Implement sort logic: ORDER BY field (title, priority, due_date) with order (asc, desc)
- [ ] T127 [US4] Test GET /tasks?search=meeting - verify returns tasks matching keyword
- [ ] T128 [US4] Test GET /tasks?completed=true - verify returns only completed tasks
- [ ] T129 [US4] Test GET /tasks?priority=high - verify returns only high priority tasks
- [ ] T130 [US4] Test GET /tasks?tag=Work - verify returns tasks with "Work" tag
- [ ] T131 [US4] Test GET /tasks?sort=priority&order=desc - verify tasks sorted by priority descending
- [ ] T132 [US4] Test GET /tasks?sort=title&order=asc - verify tasks sorted alphabetically

### Frontend Implementation for US4

- [x] T133 [P] [US4] Create TaskFilters presentational component in frontend/src/components/TaskFilters.tsx (search input, filter dropdowns)
- [x] T134 [P] [US4] Create TaskSortControls presentational component in frontend/src/components/TaskSortControls.tsx (sort dropdown)
- [x] T135 [US4] Update TaskListContainer in frontend/src/containers/TaskListContainer.tsx to manage filter/sort state
- [x] T136 [US4] Update useTasks hook in frontend/src/hooks/useTasks.ts to accept filter/sort parameters
- [x] T137 [US4] Integrate TaskFilters component into DashboardPage in frontend/src/pages/DashboardPage.tsx
- [x] T138 [US4] Integrate TaskSortControls component into DashboardPage in frontend/src/pages/DashboardPage.tsx
- [x] T139 [US4] Implement search with debouncing (300ms delay) to avoid excessive API calls
- [ ] T140 [US4] Test search functionality: type keyword, verify filtered results appear
- [ ] T141 [US4] Test filter by completed status: select "Completed", verify only completed tasks show
- [ ] T142 [US4] Test filter by priority: select "High", verify only high-priority tasks show
- [ ] T143 [US4] Test filter by tag: select tag from dropdown, verify filtered results
- [ ] T144 [US4] Test sort by priority: select priority sort, verify tasks reorder correctly
- [ ] T145 [US4] Test sort by title: select alphabetical sort, verify tasks alphabetized

**Checkpoint**: At this point, User Stories 1-4 should work independently - search, filter, sort fully functional

---

## Phase 7: User Story 5 - Due Dates and Overdue Indicators (Priority: P5)

**Goal**: Users can assign due dates to tasks and see visual indicators for overdue tasks

**Independent Test**: Create tasks with due dates (past, today, future), verify overdue tasks have red indicator, verify sorting by due date works

### Backend Implementation for US5

- [x] T146 [US5] Update task validation schemas in backend/src/validators/task.validator.ts to include due_date field (ISO 8601 timestamp)
- [x] T147 [US5] Update Task repository in backend/src/repositories/task.repository.ts to handle due_date field
- [x] T148 [US5] Update GET /tasks filter logic to support due_date range queries (optional: overdue filter)
- [ ] T149 [US5] Test POST /tasks with due_date - verify timestamp saved correctly
- [ ] T150 [US5] Test PUT /tasks/:id updating due_date - verify change persists
- [ ] T151 [US5] Test GET /tasks?sort=due_date - verify tasks sorted by due date

### Frontend Implementation for US5

- [x] T152 [P] [US5] Update task types in frontend/src/types/task.types.ts to include due_date field
- [x] T153 [P] [US5] Create date formatting utility in frontend/src/utils/dateFormatter.ts (format ISO to user-friendly string)
- [x] T154 [US5] Add due date picker to AddTaskFormContainer in frontend/src/containers/AddTaskFormContainer.tsx
- [x] T155 [US5] Add due date picker to EditTaskFormContainer in frontend/src/containers/EditTaskFormContainer.tsx
- [x] T156 [US5] Update TaskItem component in frontend/src/components/TaskItem.tsx to display due date
- [x] T157 [US5] Implement overdue indicator logic in TaskItem: if due_date < NOW and not completed, show red indicator
- [ ] T158 [US5] Test create task with future due date - verify date displays correctly
- [ ] T159 [US5] Test create task with past due date - verify red overdue indicator appears
- [ ] T160 [US5] Test completing overdue task - verify overdue indicator disappears
- [ ] T161 [US5] Test sort by due date - verify tasks with nearest due dates appear first

**Checkpoint**: At this point, User Stories 1-5 should work independently - due date management functional

---

## Phase 8: User Story 6 - Recurring Tasks (Priority: P6)

**Goal**: Users can configure tasks as recurring (daily/weekly/monthly) and new instances auto-generate upon completion

**Independent Test**: Create recurring task (daily), mark complete, verify new instance created with next due date calculated correctly

### Backend Implementation for US6

- [x] T162 [US6] Update task validation schemas in backend/src/validators/task.validator.ts to include recurrence_pattern field (enum: daily, weekly, monthly, null)
- [x] T163 [P] [US6] Create recurrence service in backend/src/services/recurrence.service.ts (calculateNextDueDate logic)
- [x] T164 [US6] Implement calculateNextDueDate function: daily (+1 day), weekly (+7 days), monthly (+1 month with edge case handling for day 31)
- [x] T165 [US6] Update PATCH /api/v1/tasks/:id/complete endpoint to check if task is recurring
- [x] T166 [US6] If recurring: after marking complete, create new task instance with same title/description/priority/tags/category and calculated next due_date
- [x] T167 [US6] Ensure original task remains completed (historical record)
- [ ] T168 [US6] Test daily recurring task: mark complete, verify new task created with due_date = original_due_date + 1 day
- [ ] T169 [US6] Test weekly recurring task: mark complete, verify new task created with due_date = original_due_date + 7 days
- [ ] T170 [US6] Test monthly recurring task: mark complete, verify new task created with due_date = original_due_date + 1 month
- [ ] T171 [US6] Test edge case: monthly recurrence on Jan 31 → verify next due date is Feb 28/29 (not March 3)
- [ ] T172 [US6] Test non-recurring task: mark complete, verify no new task created

### Frontend Implementation for US6

- [x] T173 [P] [US6] Update task types in frontend/src/types/task.types.ts to include recurrence_pattern field
- [x] T174 [US6] Add recurrence dropdown to AddTaskFormContainer in frontend/src/containers/AddTaskFormContainer.tsx (options: none, daily, weekly, monthly)
- [x] T175 [US6] Add recurrence dropdown to EditTaskFormContainer in frontend/src/containers/EditTaskFormContainer.tsx
- [x] T176 [US6] Update TaskItem component in frontend/src/components/TaskItem.tsx to display recurrence indicator icon (repeat symbol)
- [x] T177 [US6] Update task list to refresh after marking recurring task complete (to show new instance)
- [ ] T178 [US6] Test create daily recurring task - verify recurrence icon displays
- [ ] T179 [US6] Test mark recurring task complete - verify task list refreshes and new instance appears
- [ ] T180 [US6] Test edit recurrence pattern from daily to weekly - verify change persists

**Checkpoint**: At this point, User Stories 1-6 should work independently - recurring task logic functional

---

## Phase 9: User Story 7 - Task Reminders (Priority: P7)

**Goal**: Users can enable reminders on tasks with preset offset values, reminders trigger based on server time

**Independent Test**: Create task with reminder (e.g., 15 minutes before due date), verify reminder indicator displays, test reminder trigger logic (backend)

### Backend Implementation for US7

- [ ] T181 [US7] Update task validation schemas in backend/src/validators/task.validator.ts to include reminder_enabled (boolean) and reminder_offset_minutes (integer)
- [ ] T182 [P] [US7] Create reminder service in backend/src/services/reminder.service.ts (reminder scheduling logic)
- [ ] T183 [US7] Implement reminder evaluation function: check if NOW >= (due_date - reminder_offset_minutes)
- [ ] T184 [US7] Create GET /api/v1/tasks/reminders endpoint to fetch tasks with active reminders for authenticated user
- [ ] T185 [US7] Test POST /tasks with reminder_enabled=true and reminder_offset_minutes=15 - verify fields saved
- [ ] T186 [US7] Test GET /tasks/reminders - verify returns tasks where reminder should trigger (due_date - offset <= NOW)
- [ ] T187 [US7] Test reminder offset edge case: due_date is null, reminder_enabled=true - verify no error

### Frontend Implementation for US7

- [ ] T188 [P] [US7] Update task types in frontend/src/types/task.types.ts to include reminder_enabled and reminder_offset_minutes
- [ ] T189 [P] [US7] Create useNotifications custom hook in frontend/src/hooks/useNotifications.ts (manages browser notifications)
- [ ] T190 [US7] Add reminder toggle to AddTaskFormContainer in frontend/src/containers/AddTaskFormContainer.tsx
- [ ] T191 [US7] Add reminder offset dropdown to AddTaskFormContainer (preset values: 15 min, 30 min, 1 hour, 1 day before)
- [ ] T192 [US7] Add reminder toggle to EditTaskFormContainer in frontend/src/containers/EditTaskFormContainer.tsx
- [ ] T193 [US7] Add reminder offset dropdown to EditTaskFormContainer
- [ ] T194 [US7] Update TaskItem component in frontend/src/components/TaskItem.tsx to display reminder indicator icon (bell symbol)
- [ ] T195 [US7] Implement periodic polling (every 60 seconds) to fetch GET /api/v1/tasks/reminders
- [ ] T196 [US7] When reminders returned, trigger browser notification with task title and due date
- [ ] T197 [US7] Request browser notification permission on dashboard load (if not already granted)
- [ ] T198 [US7] Test create task with reminder - verify bell icon displays
- [ ] T199 [US7] Test reminder trigger simulation: create task with due_date in 1 minute and 15-min offset, wait, verify notification appears
- [ ] T200 [US7] Test disable reminder - verify bell icon disappears

**Checkpoint**: At this point, ALL 7 User Stories should work independently - full Phase 1 feature parity achieved

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T201 [P] Add loading spinners to all async operations (task list, create, update, delete)
- [x] T202 [P] Add error toast notifications for API failures across all operations
- [x] T203 [P] Add success toast notifications for task create/update/delete operations
- [x] T204 [P] Implement responsive design for mobile devices (breakpoints: 768px, 1024px)
- [x] T205 [P] Add WCAG AA accessibility attributes (ARIA labels, keyboard navigation)
- [x] T206 [P] Implement 44x44px touch targets for mobile buttons
- [x] T207 [P] Add client-side validation error messages for all forms
- [ ] T208 [P] Optimize bundle size: code splitting, lazy loading for modal components
- [ ] T209 [P] Add pagination or virtual scrolling for task lists > 100 items
- [ ] T210 [P] Backend: Add request rate limiting middleware (prevent abuse)
- [ ] T211 [P] Backend: Add comprehensive logging for all API routes (Winston or Pino)
- [ ] T212 [P] Backend: Add API request validation unit tests for all endpoints
- [ ] T213 [P] Frontend: Add unit tests for critical components (TaskItem, TaskList, TaskFilters)
- [ ] T214 [P] Frontend: Add integration tests for user flows (signup, create task, edit task)
- [ ] T215 Update README.md with complete setup instructions, environment variables, and deployment guide
- [ ] T216 Create API documentation in specs/004-fullstack-todo-web-app/contracts/ (OpenAPI spec from plan.md)
- [ ] T217 Run full test suite (backend + frontend) and verify all tests pass
- [ ] T218 Run lighthouse audit on frontend - verify performance score > 90
- [ ] T219 Verify Phase 2 Constitution compliance: security, code quality, accessibility, performance
- [ ] T220 Manual end-to-end testing: complete quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if team has multiple developers)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5 → P6 → P7)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Authentication - MUST complete first (all other stories require authenticated users)
- **User Story 2 (P2)**: Basic Task Management - Can start after US1, no dependencies on US3-7
- **User Story 3 (P3)**: Priorities/Tags - Can start after US2 (extends task model), no dependencies on US4-7
- **User Story 4 (P4)**: Search/Filter/Sort - Can start after US2 (requires tasks to exist), benefits from US3 (filter by priority/tag)
- **User Story 5 (P5)**: Due Dates - Can start after US2 (extends task model), no dependencies on US3-4, but needed for US6-7
- **User Story 6 (P6)**: Recurring Tasks - Can start after US5 (requires due_date logic), no dependencies on US3-4
- **User Story 7 (P7)**: Reminders - Can start after US5 (requires due_date field), no dependencies on US3-4, US6

### Critical Path (Sequential Implementation)

1. Phase 1: Setup
2. Phase 2: Foundational (BLOCKING)
3. Phase 3: US1 Authentication (BLOCKING for all other stories)
4. Phase 4: US2 Basic Task Management (BLOCKING for US3-7)
5. Phase 5: US3 Priorities/Tags (independent of US4-7)
6. Phase 6: US4 Search/Filter/Sort (independent of US5-7)
7. Phase 7: US5 Due Dates (BLOCKING for US6-7)
8. Phase 8: US6 Recurring Tasks (independent of US7)
9. Phase 9: US7 Reminders (no blockers)
10. Phase 10: Polish

### Parallel Opportunities

**Within Setup Phase**:
- T002, T003 (backend and frontend init) can run in parallel
- T004, T005 (linting configs) can run in parallel
- T006, T007 (TypeScript configs) can run in parallel
- T008, T009 (.env.example files) can run in parallel

**Within Foundational Phase**:
- All backend foundation tasks (T016-T030) marked [P] can run in parallel AFTER dependencies are installed
- All frontend foundation tasks (T040-T042) marked [P] can run in parallel AFTER dependencies are installed

**Within Each User Story**:
- Backend validation, repository, and service files marked [P] can be created in parallel
- Frontend components, hooks, and types marked [P] can be created in parallel
- Tests can run in parallel with each other (but after implementation)

**Across User Stories** (with sufficient team):
- After US1 completes: US2, US3, US4 can start in parallel
- After US2 completes and US5 completes: US6, US7 can start in parallel
- US3 and US4 can proceed independently of US5-7

---

## Parallel Example: User Story 1 (Authentication)

```bash
# After Foundational Phase completes, launch US1 backend tasks in parallel:
Task T047: "Create auth validation schemas in backend/src/validators/auth.validator.ts"
Task T048: "Create User repository in backend/src/repositories/user.repository.ts"

# After T047 and T048 complete, implement endpoints sequentially:
Task T049: "Implement signup endpoint"
Task T050: "Implement signin endpoint"
Task T051: "Implement signout endpoint"

# In parallel with backend endpoint work, launch US1 frontend tasks:
Task T057: "Create auth API client in frontend/src/services/auth.api.ts"
Task T058: "Create auth types in frontend/src/types/auth.types.ts"
Task T059: "Create useAuth hook in frontend/src/hooks/useAuth.ts"
Task T060: "Create Input component"
Task T061: "Create Button component"

# After frontend components ready, create pages sequentially:
Task T062: "Create SignupPage"
Task T063: "Create SigninPage"
Task T064: "Configure routing"
```

---

## Parallel Example: User Story 2 (Basic Task Management)

```bash
# After US1 completes, launch US2 backend tasks in parallel:
Task T070: "Create task validation schemas"
Task T071: "Create Task repository"

# After repositories ready:
Task T072: "Create Task service"

# After service ready, implement endpoints sequentially or in parallel (different routes):
Task T073: "Implement GET /tasks"
Task T074: "Implement POST /tasks"
Task T075: "Implement GET /tasks/:id"
Task T076: "Implement PUT /tasks/:id"
Task T077: "Implement DELETE /tasks/:id"
Task T078: "Implement PATCH /tasks/:id/complete"
Task T079: "Implement PATCH /tasks/:id/incomplete"

# In parallel with backend, launch US2 frontend tasks:
Task T087: "Create tasks API client"
Task T088: "Create task types"
Task T089: "Create useTasks hook"
Task T090: "Create TaskItem component"
Task T091: "Create TaskList component"
Task T092: "Create Modal component"
```

---

## Implementation Strategy

### MVP First (Minimum Viable Product - User Story 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T046) - CRITICAL BLOCKING PHASE
3. Complete Phase 3: User Story 1 - Authentication (T047-T069)
4. Complete Phase 4: User Story 2 - Basic Task Management (T070-T105)
5. **STOP and VALIDATE**: Test full auth + CRUD flow end-to-end
6. Deploy MVP with US1 + US2 functional

### Incremental Delivery (Add One Story at a Time)

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Authentication) → Test independently → Deploy/Demo (auth working!)
3. Add User Story 2 (Basic CRUD) → Test independently → Deploy/Demo (MVP complete!)
4. Add User Story 3 (Priorities/Tags) → Test independently → Deploy/Demo
5. Add User Story 4 (Search/Filter/Sort) → Test independently → Deploy/Demo
6. Add User Story 5 (Due Dates) → Test independently → Deploy/Demo
7. Add User Story 6 (Recurring Tasks) → Test independently → Deploy/Demo
8. Add User Story 7 (Reminders) → Test independently → Deploy/Demo (100% Phase 1 parity!)
9. Add Polish (Phase 10) → Final production-ready release

Each story adds value without breaking previous stories.

### Parallel Team Strategy (Multiple Developers)

With 3+ developers:

1. **Team**: Complete Setup + Foundational together (T001-T046)
2. **Once Foundational is done**:
   - **Developer A**: User Story 1 (Authentication) - MUST complete first
3. **After US1 complete**:
   - **Developer A**: User Story 2 (Basic CRUD)
   - **Developer B**: User Story 3 (Priorities/Tags) - in parallel with A
   - **Developer C**: User Story 4 (Search/Filter/Sort) - in parallel with A, B
4. **After US2 complete**:
   - **Developer A**: User Story 5 (Due Dates)
5. **After US5 complete**:
   - **Developer B**: User Story 6 (Recurring Tasks)
   - **Developer C**: User Story 7 (Reminders) - in parallel with B
6. **All Developers**: Polish (Phase 10) together

This strategy maximizes parallelization while respecting dependencies.

---

## Notes

- **[P]** tasks = different files, no dependencies, can run in parallel
- **[Story]** label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Foundational phase (Phase 2) BLOCKS all user story work - prioritize completion
- User Story 1 (Authentication) BLOCKS all other user stories - must complete first
- User Story 2 (Basic CRUD) should complete before US3-7 for best results
- User Story 5 (Due Dates) BLOCKS US6-7 (recurring tasks and reminders need due dates)
- Commit frequently after each task or logical group
- Stop at any checkpoint to validate story independently
- Run tests for each user story immediately after implementation
- Use exact file paths from plan.md structure (backend/src/, frontend/src/)
- Follow TypeScript strict mode for all files
- Enforce Phase 2 Constitution compliance throughout implementation
