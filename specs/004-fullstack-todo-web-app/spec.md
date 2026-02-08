# Feature Specification: Full-Stack Todo Web Application (Phase 2)

**Feature Branch**: `004-fullstack-todo-web-app`
**Created**: 2025-12-29
**Status**: Draft
**Input**: User description: "Phase 2 Specification: Todo Web Application (Full Stack) - Upgrade the Phase 1 CLI Todo app into a full-stack web application with persistent storage, authentication, RESTful APIs, and a responsive frontend. All Basic, Intermediate, and Advanced features must be preserved and exposed via web interfaces."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Account Creation and Authentication (Priority: P1)

New users need to create accounts and securely access the application to manage their personal tasks. Without authentication, there's no way to isolate user data or provide a personalized experience.

**Why this priority**: Authentication is the foundation for multi-user support and data isolation. Without it, no other features can function correctly. This is the absolute minimum viable product.

**Independent Test**: Can be fully tested by registering a new account, signing in, viewing an empty task list, and signing out. Delivers value by establishing secure user identity and session management.

**Acceptance Scenarios**:

1. **Given** I am a new user on the signup page, **When** I provide a valid email and strong password, **Then** my account is created and I am signed in automatically
2. **Given** I am an existing user on the signin page, **When** I enter my correct email and password, **Then** I am authenticated and redirected to my task dashboard
3. **Given** I am signed in, **When** I click the signout button, **Then** my session is terminated and I am redirected to the signin page
4. **Given** I am not signed in, **When** I try to access the task dashboard directly, **Then** I am redirected to the signin page
5. **Given** I am on the signup page, **When** I provide an email that already exists, **Then** I see an error message indicating the email is already registered
6. **Given** I am on the signin page, **When** I enter an incorrect password, **Then** I see an error message indicating invalid credentials

---

### User Story 2 - Basic Task Management (Priority: P2)

Authenticated users need to create, view, update, delete, and mark tasks as complete or incomplete to manage their daily activities effectively.

**Why this priority**: This is the core value proposition of the application. Once users can authenticate, they need to immediately perform basic task operations. This represents feature parity with Phase 1 Basic Level.

**Independent Test**: Can be fully tested by signing in, creating several tasks with titles and descriptions, viewing them in a list, updating task details, marking tasks as complete/incomplete, and deleting tasks. Delivers value by enabling fundamental task management.

**Acceptance Scenarios**:

1. **Given** I am signed in, **When** I fill out the "Add Task" form with a title and optional description and submit, **Then** a new task appears in my task list
2. **Given** I have tasks in my list, **When** I view my task dashboard, **Then** I see all my tasks displayed with their titles, descriptions, and completion status
3. **Given** I have a task in my list, **When** I click the edit button and modify the title or description, **Then** the task is updated with the new information
4. **Given** I have a task in my list, **When** I click the delete button and confirm, **Then** the task is permanently removed from my list
5. **Given** I have an incomplete task, **When** I click the checkbox to mark it complete, **Then** the task's visual state changes to show it is completed (checkmark, strikethrough)
6. **Given** I have a completed task, **When** I click the checkbox to mark it incomplete, **Then** the task returns to its incomplete state
7. **Given** I have no tasks, **When** I view my task dashboard, **Then** I see a helpful empty state message encouraging me to add my first task

---

### User Story 3 - Task Organization with Priorities and Tags (Priority: P3)

Users need to assign priorities and categorize tasks with tags to organize their work effectively and focus on what matters most.

**Why this priority**: After basic task management works, users need organizational tools to manage larger task lists. This represents feature parity with Phase 1 Intermediate Level (priorities and tags).

**Independent Test**: Can be fully tested by creating tasks, assigning priorities (low/medium/high), adding tags, and verifying that tasks display their organizational metadata correctly. Delivers value by enabling task categorization and prioritization.

**Acceptance Scenarios**:

1. **Given** I am creating or editing a task, **When** I select a priority level (high, medium, or low), **Then** the task is saved with that priority and displays it visually with appropriate color coding
2. **Given** I am creating or editing a task, **When** I add tags (e.g., "work", "personal", "urgent"), **Then** the task is saved with those tags and displays them as badges
3. **Given** I have tasks with different priorities, **When** I view my task list, **Then** I can visually distinguish high priority tasks (red), medium priority tasks (yellow), and low priority tasks (gray)
4. **Given** I am creating a task without specifying priority, **When** I save the task, **Then** it defaults to medium priority

---

### User Story 4 - Search, Filter, and Sort Tasks (Priority: P4)

Users need to search for specific tasks by keyword, filter by completion status/priority/category, and sort tasks by different criteria to find and focus on relevant tasks quickly.

**Why this priority**: As task lists grow, users need powerful discovery and organization tools. This represents feature parity with Phase 1 Intermediate Level (search/filter/sort).

**Independent Test**: Can be fully tested by creating multiple tasks with varying properties (completed/incomplete, different priorities, different tags), then using search, filters, and sorting to verify correct results. Delivers value by enabling efficient task discovery in large lists.

**Acceptance Scenarios**:

1. **Given** I have multiple tasks, **When** I type a keyword in the search box, **Then** I see only tasks whose title or description contains that keyword
2. **Given** I have tasks with different completion statuses, **When** I select "Show only incomplete tasks" filter, **Then** I see only incomplete tasks
3. **Given** I have tasks with different priorities, **When** I select "High priority" filter, **Then** I see only high priority tasks
4. **Given** I have tasks with different tags, **When** I select a specific tag filter (e.g., "work"), **Then** I see only tasks tagged with "work"
5. **Given** I have multiple tasks, **When** I select "Sort by priority", **Then** tasks are reordered with high priority tasks first, then medium, then low
6. **Given** I have tasks with due dates, **When** I select "Sort by due date", **Then** tasks are ordered chronologically by due date (earliest first)
7. **Given** I have multiple tasks, **When** I select "Sort alphabetically", **Then** tasks are ordered A-Z by title

---

### User Story 5 - Due Dates and Overdue Indicators (Priority: P5)

Users need to assign due dates to tasks and see clear visual indicators when tasks are overdue to stay on top of deadlines.

**Why this priority**: Time-based task management is critical for deadline-driven work. This represents part of Phase 1 Advanced Level feature parity.

**Independent Test**: Can be fully tested by creating tasks with various due dates (past, today, future), viewing the task list, and verifying correct visual indicators (red highlight for overdue). Delivers value by enabling deadline awareness.

**Acceptance Scenarios**:

1. **Given** I am creating or editing a task, **When** I select a due date from the date picker, **Then** the task is saved with that due date and displays it in a human-readable format
2. **Given** I have a task with a due date in the past, **When** I view my task list, **Then** that task is visually highlighted in red as overdue
3. **Given** I have a task with a due date today, **When** I view my task list, **Then** that task shows "Due: Today" and may have a yellow/warning indicator
4. **Given** I have a task with a due date in the future, **When** I view my task list, **Then** that task displays the due date (e.g., "Due: Jan 15, 2025")
5. **Given** I have tasks with and without due dates, **When** I view my task list, **Then** tasks without due dates display clearly that no due date is set

---

### User Story 6 - Recurring Tasks (Priority: P6)

Users need to create tasks that repeat on a schedule (daily, weekly, monthly) so they don't have to manually recreate routine tasks.

**Why this priority**: Recurring tasks automate repetitive task creation for routine activities (daily standup, weekly review, monthly bills). This represents part of Phase 1 Advanced Level feature parity.

**Independent Test**: Can be fully tested by creating a recurring task (e.g., "Daily standup" - daily recurrence), marking it complete, and verifying a new instance is automatically created with the next due date. Delivers value by reducing manual task creation for routines.

**Acceptance Scenarios**:

1. **Given** I am creating or editing a task, **When** I select "Daily" recurrence, **Then** the task is saved as a daily recurring task
2. **Given** I have a daily recurring task, **When** I mark it complete, **Then** a new instance of the task is automatically created with a due date of tomorrow
3. **Given** I have a weekly recurring task, **When** I mark it complete, **Then** a new instance is created with a due date 7 days from the original due date
4. **Given** I have a monthly recurring task, **When** I mark it complete, **Then** a new instance is created with a due date 1 month from the original due date
5. **Given** I am viewing a recurring task, **When** I check its details, **Then** I can see it is marked as recurring and the recurrence pattern (daily/weekly/monthly)

---

### User Story 7 - Task Reminders (Priority: P7)

Users need to set reminders before tasks are due so they receive advance notice and can prepare or complete tasks on time.

**Why this priority**: Proactive notifications help users stay aware of upcoming deadlines without constantly checking the app. This represents the final part of Phase 1 Advanced Level feature parity.

**Independent Test**: Can be fully tested by creating a task with a due date, enabling a reminder with a preset offset (e.g., "1 day before"), waiting for the reminder time (or simulating it), and verifying a browser notification appears. Delivers value by providing proactive deadline awareness.

**Acceptance Scenarios**:

1. **Given** I am creating or editing a task with a due date, **When** I enable reminders and select an offset (e.g., "1 day before", "2 hours before"), **Then** the task is saved with reminder enabled and the specified offset
2. **Given** I have a task with a reminder enabled, **When** the reminder time arrives (due date minus offset), **Then** I receive a browser notification alerting me about the upcoming task
3. **Given** I am viewing a task with reminder enabled, **When** I check its details, **Then** I can see the reminder is enabled and the offset duration
4. **Given** I have browser notifications disabled, **When** a reminder time arrives, **Then** the system gracefully handles the inability to send notifications (no errors, possibly shows in-app indicator)

---

### Edge Cases

- **What happens when a user tries to create a task with an empty title?** System displays validation error requiring a non-empty title (title is mandatory).
- **What happens when a user marks a non-recurring task as complete?** Task's completed status changes to true, no new task is created.
- **What happens when a user deletes a recurring task?** Only the current instance is deleted, unless explicitly stated otherwise (future enhancement: option to delete all instances).
- **What happens when the server cannot reach the database?** User sees a friendly error message indicating the service is temporarily unavailable, and actions fail gracefully without losing unsaved data in the browser.
- **What happens when two users have the same email address?** Signup rejects duplicate emails with a clear error message. Authentication system enforces email uniqueness.
- **What happens when a user enters an invalid due date (e.g., past date)?** System allows past due dates (they become immediately overdue), but validates that the date format is correct.
- **What happens when a user has 1000+ tasks?** Task list uses pagination or virtual scrolling to maintain performance. Search/filter operations remain performant through database indexing.
- **What happens when a recurring task's next due date cannot be calculated (edge case: monthly recurrence on Jan 31)?** System uses smart date logic (e.g., Feb 28/29 for Jan 31 monthly recurrence).
- **What happens when a user signs out while editing a task?** Session expiration redirects to signin page; unsaved changes are lost (with browser warning if possible).
- **What happens when reminder offset is longer than time until due date?** Reminder triggers immediately or at task creation time (e.g., task due in 1 hour, reminder set for "1 day before" - triggers now).

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & User Management**

- **FR-001**: System MUST allow users to create accounts with email and password
- **FR-002**: System MUST validate email format and require passwords to meet minimum strength criteria (minimum 8 characters)
- **FR-003**: System MUST authenticate users via email and password using Better Auth
- **FR-004**: System MUST maintain user sessions securely using httpOnly cookies with CSRF protection
- **FR-005**: System MUST allow authenticated users to sign out, invalidating their session
- **FR-006**: System MUST prevent unauthenticated users from accessing task management features (redirect to signin)
- **FR-007**: System MUST enforce unique email addresses (no duplicate accounts)

**Basic Task Management**

- **FR-008**: System MUST allow authenticated users to create tasks with a title (required) and description (optional)
- **FR-009**: System MUST display all tasks belonging to the authenticated user in a list view
- **FR-010**: System MUST allow users to update task title and description
- **FR-011**: System MUST allow users to delete tasks permanently
- **FR-012**: System MUST allow users to mark tasks as complete or incomplete via a checkbox or toggle
- **FR-013**: System MUST visually distinguish completed tasks (strikethrough text, checkmark) from incomplete tasks
- **FR-014**: System MUST enforce data isolation (users can ONLY access their own tasks)

**Task Organization (Priorities & Tags)**

- **FR-015**: System MUST allow users to assign priority levels to tasks: Low, Medium, High
- **FR-016**: System MUST default new tasks to Medium priority if not specified
- **FR-017**: System MUST visually distinguish priorities using color coding (High: red, Medium: yellow, Low: gray)
- **FR-018**: System MUST allow users to add multiple tags to tasks for categorization
- **FR-019**: System MUST display tags as visual badges on tasks
- **FR-020**: System MUST support category field as an alternative to tags (user can choose tags or category or both)

**Search, Filter, and Sort**

- **FR-021**: System MUST provide keyword search functionality across task titles and descriptions
- **FR-022**: System MUST allow users to filter tasks by completion status (all, incomplete, completed)
- **FR-023**: System MUST allow users to filter tasks by priority level
- **FR-024**: System MUST allow users to filter tasks by tag or category
- **FR-025**: System MUST allow users to sort tasks alphabetically by title (A-Z)
- **FR-026**: System MUST allow users to sort tasks by priority (High → Medium → Low)
- **FR-027**: System MUST allow users to sort tasks by due date (earliest first)
- **FR-028**: System MUST allow users to sort tasks by creation date

**Due Dates**

- **FR-029**: System MUST allow users to assign due dates (date and time) to tasks
- **FR-030**: System MUST validate due date formats and reject invalid dates
- **FR-031**: System MUST visually highlight overdue tasks (due date in the past and task incomplete) in red
- **FR-032**: System MUST display due dates in human-readable format (e.g., "Today", "Tomorrow", "Jan 15, 2025")
- **FR-033**: System MUST allow tasks without due dates (due date is optional)

**Recurring Tasks**

- **FR-034**: System MUST allow users to configure tasks as recurring with patterns: Daily, Weekly, Monthly
- **FR-035**: System MUST automatically create a new task instance when a recurring task is marked complete
- **FR-036**: System MUST calculate the next due date based on recurrence pattern:
  - Daily: +1 day from original due date
  - Weekly: +7 days from original due date
  - Monthly: +1 month from original due date (smart date handling for month-end dates)
- **FR-037**: System MUST preserve task metadata (title, description, priority, tags, recurrence pattern) when creating new instances
- **FR-038**: System MUST visually indicate recurring tasks with an icon or badge

**Reminders**

- **FR-039**: System MUST allow users to enable reminders for tasks with due dates
- **FR-040**: System MUST provide preset reminder offsets: 15 minutes, 1 hour, 2 hours, 1 day, 2 days before due date
- **FR-041**: System MUST trigger browser notifications at the calculated reminder time (due date - offset)
- **FR-042**: System MUST handle browser notification permissions gracefully (if denied, show in-app indicator or message)
- **FR-043**: System MUST calculate reminder times based on server time to ensure consistency

**API Requirements**

- **FR-044**: System MUST expose RESTful API endpoints following conventions:
  - `POST /api/v1/auth/signup` - User registration
  - `POST /api/v1/auth/signin` - User authentication
  - `POST /api/v1/auth/signout` - User logout
  - `GET /api/v1/tasks` - Retrieve all user tasks (with query params for search/filter/sort)
  - `POST /api/v1/tasks` - Create new task
  - `GET /api/v1/tasks/:id` - Retrieve specific task
  - `PUT /api/v1/tasks/:id` - Update task
  - `DELETE /api/v1/tasks/:id` - Delete task
  - `PATCH /api/v1/tasks/:id/complete` - Mark task complete
  - `PATCH /api/v1/tasks/:id/incomplete` - Mark task incomplete
- **FR-045**: System MUST return consistent JSON response format:
  ```json
  {
    "success": true/false,
    "data": { ... },
    "error": null or { "code": "...", "message": "...", "field": "..." }
  }
  ```
- **FR-046**: System MUST use appropriate HTTP status codes (200, 201, 204, 400, 401, 404, 500)
- **FR-047**: System MUST require authentication for all `/api/v1/tasks/*` endpoints (401 if unauthenticated)
- **FR-048**: System MUST validate all input data and return 400 with descriptive error messages for validation failures

**Data Persistence**

- **FR-049**: System MUST persist all user and task data to a PostgreSQL database (Neon Serverless)
- **FR-050**: System MUST use UUIDs for all primary keys (users and tasks)
- **FR-051**: System MUST enforce foreign key constraints (tasks.user_id references users.id with CASCADE DELETE)
- **FR-052**: System MUST store tags as PostgreSQL arrays for efficient querying
- **FR-053**: System MUST create database indexes on frequently queried fields (user_id, due_date, completed)

**Frontend Requirements**

- **FR-054**: System MUST provide a responsive web interface supporting desktop (1024px+), tablet (768px-1023px), and mobile (320px-767px)
- **FR-055**: System MUST use mobile-first responsive design approach
- **FR-056**: System MUST provide accessible UI with semantic HTML, ARIA labels, keyboard navigation, and WCAG AA color contrast
- **FR-057**: System MUST display loading states (spinners/skeleton loaders) during async operations
- **FR-058**: System MUST display empty states with helpful messages when no tasks exist
- **FR-059**: System MUST handle API errors gracefully with user-friendly toast notifications or inline error messages
- **FR-060**: System MUST maintain consistent spacing (4px/8px grid), typography hierarchy, and visual design

### Key Entities

- **User**: Represents an authenticated user account
  - Unique identifier (UUID)
  - Email address (unique, validated)
  - Password (hashed, managed by Better Auth)
  - Account creation timestamp
  - Relationships: One user has many tasks

- **Task**: Represents a single todo item belonging to a user
  - Unique identifier (UUID)
  - User identifier (foreign key to User)
  - Title (required, max 200 characters)
  - Description (optional, text)
  - Completed status (boolean, default false)
  - Priority (enum: low, medium, high; default medium)
  - Tags (array of strings)
  - Category (optional string)
  - Due date (optional timestamp)
  - Recurrence pattern (optional: daily, weekly, monthly)
  - Reminder enabled (boolean, default false)
  - Reminder offset (integer minutes before due date)
  - Creation timestamp
  - Last updated timestamp
  - Relationships: Many tasks belong to one user

- **Session**: Represents an authenticated user session (managed by Better Auth)
  - Session identifier
  - User identifier
  - Expiration timestamp
  - CSRF token

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete account signup and signin within 1 minute on first attempt
- **SC-002**: Users can create a new task within 10 seconds (including form filling and submission)
- **SC-003**: Task list displays all user tasks within 2 seconds of page load for lists up to 500 tasks
- **SC-004**: Search/filter operations return results within 1 second for lists up to 1000 tasks
- **SC-005**: System supports 100 concurrent authenticated users without performance degradation
- **SC-006**: 95% of user actions (create, update, delete, complete) succeed without errors in normal operating conditions
- **SC-007**: Mobile users can complete all task management operations with touch-friendly UI (minimum 44x44px tap targets)
- **SC-008**: Application maintains WCAG AA accessibility compliance (color contrast 4.5:1, keyboard navigation, screen reader support)
- **SC-009**: Recurring tasks automatically generate new instances within 5 seconds of marking previous instance complete
- **SC-010**: Browser notifications for reminders appear within 1 minute of calculated reminder time (server-side scheduling)
- **SC-011**: Users can successfully filter and sort tasks with zero training (intuitive UI)
- **SC-012**: Data isolation is 100% enforced (zero incidents of users accessing other users' tasks)
- **SC-013**: Authentication session security meets industry standards (httpOnly cookies, CSRF protection, secure transmission)
- **SC-014**: Application recovers gracefully from database connection failures without data loss (queued writes, retry logic)
- **SC-015**: Frontend bundle size remains under 500KB (gzipped) for optimal mobile load times

## Assumptions

- Users have modern web browsers with JavaScript enabled (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Users have stable internet connectivity (application is online-only, no offline support in Phase 2)
- Browser notification permissions are requested but not required (graceful degradation)
- Email addresses are used as unique user identifiers (no username system)
- Passwords are managed entirely by Better Auth (no custom password reset flows in Phase 2)
- Neon Serverless PostgreSQL provides sufficient performance and availability for target user base
- Task data volume per user remains under 10,000 tasks (performance optimization needed if exceeded)
- Recurrence patterns are simple (daily/weekly/monthly only, no complex RRULE support in Phase 2)
- Reminder system uses server-side scheduling (not client-side polling)
- Single timezone support (server timezone used for all date/time calculations)
- No real-time collaboration features (task updates by other users not reflected live)
- Deployment environment provides HTTPS for secure cookie transmission
- Database migrations are managed through ORM tooling (Prisma or Drizzle)

## Out of Scope (Phase 2)

The following features are explicitly excluded from Phase 2 and may be considered for future phases:

- Real-time collaboration (multiple users editing same task simultaneously)
- Task sharing or delegation (assigning tasks to other users)
- Task comments or activity logs
- File attachments to tasks
- Subtasks or task hierarchies
- Advanced recurrence patterns (custom RRULE, exceptions, specific days of week)
- Calendar view or Gantt chart visualizations
- Third-party integrations (Google Calendar, Outlook, Slack, etc.)
- Email notifications (only browser notifications supported)
- Mobile native applications (iOS/Android)
- Offline support (Progressive Web App features)
- Multiple timezones or per-user timezone settings
- Task templates or quick-add shortcuts
- Bulk operations (select multiple tasks, bulk delete, bulk update)
- Advanced analytics or reporting (task completion trends, productivity metrics)
- Custom fields or user-defined task properties
- Task import/export (CSV, JSON, etc.)
- Account deletion or data export (GDPR compliance features)
- Password reset via email (relies on Better Auth defaults)
- Social authentication (OAuth with Google, GitHub, etc.)
- Admin panel or user management interface
- Automated testing of browser notifications
- Internationalization (i18n) or multiple language support
- Dark mode or theme customization
- Infrastructure as code or deployment automation

## Dependencies

- **Better Auth**: Provides authentication, session management, password hashing, and CSRF protection
- **Neon Serverless PostgreSQL**: Cloud-hosted PostgreSQL database for data persistence
- **Node.js 20+ LTS**: Backend runtime environment
- **TypeScript 5+**: Type-safe development for frontend and backend
- **Modern Web Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ for frontend
- **ORM (Prisma or Drizzle)**: Database query builder and migration management (decision TBD in planning phase)
- **Frontend Framework (React 18+ or Next.js 14+)**: UI component library (decision TBD in planning phase)
- **CSS Framework (Tailwind CSS or shadcn/ui)**: Styling and responsive design (decision TBD in planning phase)
- **HTTP Server Framework (Express.js or Fastify)**: Backend API server (decision TBD in planning phase)

## Constraints

- Must maintain 100% feature parity with Phase 1 CLI application (Basic, Intermediate, and Advanced levels)
- Must comply with Phase 2 Constitution v2.0.0 (all architecture, security, and code quality principles)
- Must use Better Auth for authentication (no custom auth implementation)
- Must use Neon Serverless PostgreSQL for persistence (no other database options)
- Must use TypeScript for all frontend and backend code (strict mode enabled)
- Must support responsive design across mobile, tablet, and desktop (no desktop-only UI)
- Must enforce user data isolation at database query level (all queries filter by user_id)
- Must use RESTful API conventions with versioned routes (/api/v1/*)
- Must maintain WCAG AA accessibility compliance
- Must use environment variables for all secrets and configuration (no hardcoded values)
- Must include comprehensive error handling (no exposed stack traces in production)
- Must provide deployment-ready code (migrations, build scripts, health check endpoint)
- Backend business logic must be testable without HTTP context (layered architecture)
- Frontend components must follow container/presentational pattern
- No external dependencies beyond approved tech stack (minimize npm package bloat)

## Risks

- **Browser notification permission denial**: Users may deny notification permissions, breaking reminder functionality. **Mitigation**: Implement graceful degradation with in-app indicators or prompts to enable permissions.

- **Session management complexity**: Better Auth configuration errors could lead to authentication failures or session fixation vulnerabilities. **Mitigation**: Follow Better Auth best practices, enable CSRF protection, use httpOnly cookies, and test session flows thoroughly.

- **Database performance at scale**: Large task lists (1000+ tasks per user) may cause slow queries or UI lag. **Mitigation**: Implement pagination/virtual scrolling, database indexing on user_id/due_date/completed fields, and query optimization.

- **Recurring task edge cases**: Monthly recurrence on dates like Jan 31 creates ambiguity for months with fewer days. **Mitigation**: Use smart date logic (e.g., Feb 28/29 for Jan 31 monthly recurrence) and document behavior clearly in UI.

- **Reminder timing accuracy**: Server-side reminder scheduling may drift or fail if server restarts or crashes. **Mitigation**: Use persistent job queue or cron-based scheduler, and document that reminders are "best effort" (not guaranteed to the second).

- **Tech stack decision paralysis**: Multiple TBD items (React vs Next.js, Prisma vs Drizzle, Express vs Fastify) could delay planning. **Mitigation**: Document trade-offs in planning phase and use constitution guidelines to make informed decisions quickly.

- **Mobile UX complexity**: Responsive design for complex features (filters, sorting, recurring task settings) may be challenging on small screens. **Mitigation**: Prioritize mobile-first design, use progressive disclosure, and test on real devices early.

- **Data migration from Phase 1**: If Phase 1 users exist (unlikely, since Phase 1 was in-memory), migrating to Phase 2 requires manual data export/import. **Mitigation**: Document that Phase 2 is a clean slate (no automated migration).

- **API versioning overhead**: Implementing `/api/v1/` from the start may seem premature. **Mitigation**: Accept minor overhead for future-proofing; breaking changes in later phases won't disrupt existing clients.

- **Security vulnerabilities**: XSS, SQL injection, CSRF, session hijacking, and other web vulnerabilities could compromise user data. **Mitigation**: Follow constitution security principles, use parameterized queries (ORM), sanitize inputs, validate on server, enable CSRF protection, and conduct security review before production.
