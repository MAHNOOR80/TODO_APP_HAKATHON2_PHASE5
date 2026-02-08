# Implementation Plan: Full-Stack Todo Web Application (Phase 2)

**Branch**: `004-fullstack-todo-web-app` | **Date**: 2025-12-29 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-fullstack-todo-web-app/spec.md`

**Note**: This plan follows the Agentic Dev Stack workflow with Spec-Driven Development principles.

## Summary

Transform the Phase 1 CLI-based Todo application into a production-ready full-stack web application with the following capabilities:

**Core Transformation**:
- In-memory storage → PostgreSQL (Neon Serverless) persistence
- Single-user CLI → Multi-user web application with authentication (Better Auth)
- Python CLI → TypeScript full-stack (Node.js backend + React/Next.js frontend)
- Local execution → RESTful API architecture with responsive web UI

**Feature Parity**: Maintain 100% feature parity with Phase 1 across all levels:
- **Basic**: CRUD operations (create, read, update, delete, mark complete/incomplete)
- **Intermediate**: Priorities, tags/categories, search, filter, sort
- **Advanced**: Due dates, recurring tasks (daily/weekly/monthly), time-based reminders

**Technical Approach**:
- **Backend**: Layered architecture (HTTP → Middleware → Business Logic → Data Access) using Express.js/Fastify with TypeScript
- **Frontend**: Component-based architecture (Container/Presentational pattern) using React 18+/Next.js 14+ with TypeScript
- **Database**: PostgreSQL schema with UUIDs, proper indexing, and user data isolation
- **Authentication**: Session-based auth with Better Auth (httpOnly cookies, CSRF protection)
- **API**: RESTful design with versioned routes (`/api/v1/*`), consistent response format, semantic HTTP status codes

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode), Node.js 20+ LTS
**Primary Dependencies**:
- **Backend**: NEEDS CLARIFICATION (Express.js vs Fastify), Better Auth, NEEDS CLARIFICATION (Prisma vs Drizzle ORM), Zod/Joi for validation
- **Frontend**: NEEDS CLARIFICATION (React 18+ vs Next.js 14+), NEEDS CLARIFICATION (Tailwind CSS vs shadcn/ui), React Hook Form (optional)
- **Database**: Neon Serverless PostgreSQL
- **Dev Tools**: ESLint, Prettier, TypeScript compiler

**Storage**: PostgreSQL (Neon) with ORM-managed migrations
**Testing**: NEEDS CLARIFICATION (Jest vs Vitest) + Supertest (backend), React Testing Library (frontend)
**Target Platform**: Web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+), Node.js 20+ server
**Project Type**: Web application (separate backend/frontend)
**Performance Goals**:
- Page load: < 2s for 500 tasks
- Search/filter: < 1s for 1000 tasks
- Task creation: < 10s end-to-end
- API response: < 200ms p95 (implied from UX goals)
- Bundle size: < 500KB gzipped (frontend)

**Constraints**:
- 100% feature parity with Phase 1 (non-negotiable)
- Phase 2 Constitution v2.0.0 compliance (all architecture, security, code quality principles)
- Better Auth for authentication (no custom auth)
- Neon PostgreSQL for persistence (no alternatives)
- TypeScript strict mode (all code)
- Responsive design (mobile, tablet, desktop)
- WCAG AA accessibility compliance
- User data isolation enforced at query level (all queries filter by `user_id`)

**Scale/Scope**:
- Target users: 100 concurrent authenticated users
- Tasks per user: Up to 10,000 (with pagination/virtual scrolling beyond 1000)
- Codebase size: ~5,000-10,000 LOC estimated (backend + frontend)
- Screens: 3-4 main screens (signup, signin, task dashboard, task detail/edit)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

✅ **I. Simplicity and Readability First**
- Layered architecture enforces clear separation of concerns
- Component/API naming will be self-documenting
- No premature optimization (defer until measured bottleneck)
- Code review target: understandable in < 2 minutes

✅ **II. Clean Code Principles**
- ESLint + Prettier enforced for backend and frontend
- Function/method length limit: 50 lines (enforced in code review)
- Component-based architecture with single responsibility
- RESTful API naming conventions

✅ **III. Modularity and Extensibility**
- Backend business logic decoupled from HTTP/database details
- Frontend UI components decoupled from business logic/API calls
- Database schema designed for future extensions (additive migrations only)
- Dependency flow: UI → API → Business Logic → Data Layer
- Authentication middleware-based (not embedded in route handlers)

✅ **IV. Security First**
- Better Auth handles password hashing (no plaintext passwords)
- All `/api/v1/tasks/*` endpoints require authentication
- Input validation on both client and server
- ORM parameterized queries (SQL injection prevention)
- Output sanitization (XSS prevention)
- CSRF protection via Better Auth
- Environment variables for secrets (`.env` in `.gitignore`, `.env.example` committed)
- User data isolation enforced at query level (`WHERE user_id = $authenticatedUserId`)

✅ **V. API-First Design**
- RESTful conventions: `GET /tasks`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`
- Consistent response format: `{ "success": boolean, "data": any, "error": object | null }`
- Semantic HTTP status codes (200, 201, 204, 400, 401, 403, 404, 500)
- API versioning: `/api/v1/` prefix
- Error responses with actionable messages

### Technical Stack Compliance

✅ **Mandatory Technologies (from Constitution)**:
- Node.js 20+ LTS ✅
- TypeScript 5+ ✅
- Better Auth ✅
- Neon Serverless PostgreSQL ✅
- ESLint + Prettier ✅

⚠️ **TBD Decisions (to be resolved in Phase 0 research.md)**:
1. Backend framework: Express.js vs Fastify
2. ORM: Prisma vs Drizzle
3. Frontend framework: React 18+ vs Next.js 14+
4. CSS framework: Tailwind CSS vs shadcn/ui
5. Testing framework: Jest vs Vitest
6. Package manager: pnpm vs npm
7. Validation library: Zod vs Joi

### Database Schema Compliance

✅ **Required Schema Elements (from Constitution)**:
- UUIDs for all primary keys (users, tasks)
- Foreign key constraints with CASCADE DELETE (`tasks.user_id → users.id`)
- PostgreSQL arrays for tags storage
- Indexes on frequently queried fields (user_id, due_date, completed)

✅ **Users Table** (required fields):
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

✅ **Tasks Table** (required fields):
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
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

### Architecture Compliance

✅ **Backend Layered Architecture** (required from Constitution):
```
┌─────────────────────────────────────┐
│  HTTP Layer (Express/Fastify)       │
│  - Route handlers                   │
│  - Request/response formatting      │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Middleware Layer                   │
│  - Authentication (Better Auth)     │
│  - Validation (Zod/Joi)             │
│  - Error handling                   │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Business Logic Layer (Services)    │
│  - Task operations                  │
│  - Recurrence logic                 │
│  - Reminder scheduling              │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Data Access Layer (Repositories)   │
│  - Database queries (Prisma/Drizzle)│
│  - User isolation enforcement       │
└─────────────────────────────────────┘
```

✅ **Frontend Component Architecture** (required from Constitution):
- Container/Presentational pattern
- Container components: Data fetching + state management
- Presentational components: Props + rendering only
- Single responsibility per component
- TypeScript interfaces for all props

### Gate Evaluation

**GATE STATUS**: ✅ PASS (with TBD items to be resolved in Phase 0)

**Justification**:
- All mandatory constitution principles are addressed in architecture
- 7 TBD technology choices are standard practice (deferred to research phase)
- No constitutional violations detected
- Database schema meets all requirements
- Layered architecture enforces separation of concerns
- Security principles embedded in design

**Action Required Before Implementation**:
- Phase 0: Resolve all 7 NEEDS CLARIFICATION items in research.md
- Phase 1: Validate chosen technologies against constitution
- Re-run Constitution Check after Phase 1 design complete

## Project Structure

### Documentation (this feature)

```text
specs/004-fullstack-todo-web-app/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── openapi.yaml     # REST API contract (OpenAPI 3.0 spec)
│   ├── auth.contract.md # Auth endpoints contract
│   └── tasks.contract.md # Tasks endpoints contract
├── checklists/
│   └── requirements.md  # Requirements validation checklist (already complete)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

**Selected Structure**: Option 2 - Web application (backend + frontend separation)

```text
TODO_APP_PHASE2/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.config.ts    # Database connection config
│   │   │   └── auth.config.ts        # Better Auth configuration
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts    # Authentication middleware
│   │   │   ├── validate.middleware.ts # Request validation middleware
│   │   │   └── error.middleware.ts   # Global error handler
│   │   ├── routes/
│   │   │   ├── index.ts              # Route aggregation
│   │   │   ├── auth.routes.ts        # Auth endpoints (signup/signin/signout)
│   │   │   └── tasks.routes.ts       # Task CRUD endpoints
│   │   ├── services/
│   │   │   ├── task.service.ts       # Task business logic
│   │   │   ├── recurrence.service.ts # Recurring task logic
│   │   │   └── reminder.service.ts   # Reminder scheduling logic
│   │   ├── repositories/
│   │   │   ├── task.repository.ts    # Task data access (ORM queries)
│   │   │   └── user.repository.ts    # User data access
│   │   ├── models/
│   │   │   ├── task.model.ts         # Task TypeScript interface
│   │   │   ├── user.model.ts         # User TypeScript interface
│   │   │   └── types.ts              # Shared types (Priority, RecurrencePattern, etc.)
│   │   ├── validators/
│   │   │   ├── task.validator.ts     # Task input validation schemas
│   │   │   └── auth.validator.ts     # Auth input validation schemas
│   │   ├── utils/
│   │   │   ├── date.utils.ts         # Date manipulation helpers
│   │   │   └── response.utils.ts     # Consistent API response formatters
│   │   └── index.ts                  # App entry point (Express/Fastify server)
│   ├── prisma/ (or drizzle/)
│   │   ├── schema.prisma             # Database schema (if Prisma)
│   │   └── migrations/               # Database migration files
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── services/             # Service unit tests
│   │   │   └── utils/                # Utility unit tests
│   │   ├── integration/
│   │   │   ├── auth.test.ts          # Auth flow integration tests
│   │   │   └── tasks.test.ts         # Task API integration tests
│   │   └── setup.ts                  # Test environment setup
│   ├── .env.example                  # Example environment variables
│   ├── .eslintrc.json                # ESLint configuration
│   ├── .prettierrc                   # Prettier configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   └── package.json                  # Backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/               # Reusable presentational components
│   │   │   ├── TaskItem.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskFilters.tsx
│   │   │   ├── TaskSortControls.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── containers/               # Container components (data + state)
│   │   │   ├── TaskListContainer.tsx
│   │   │   ├── AddTaskFormContainer.tsx
│   │   │   └── EditTaskFormContainer.tsx
│   │   ├── pages/                    # Page-level components
│   │   │   ├── SignupPage.tsx
│   │   │   ├── SigninPage.tsx
│   │   │   └── DashboardPage.tsx
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useTasks.ts           # Task data fetching hook
│   │   │   ├── useAuth.ts            # Authentication state hook
│   │   │   └── useNotifications.ts   # Browser notifications hook
│   │   ├── services/                 # API client functions
│   │   │   ├── api.ts                # Base API client (fetch wrapper)
│   │   │   ├── auth.api.ts           # Auth API calls
│   │   │   └── tasks.api.ts          # Tasks API calls
│   │   ├── types/                    # TypeScript types/interfaces
│   │   │   ├── task.types.ts         # Task-related types
│   │   │   └── auth.types.ts         # Auth-related types
│   │   ├── utils/                    # Helper functions
│   │   │   ├── dateFormatter.ts      # Date formatting utilities
│   │   │   └── validation.ts         # Client-side validation
│   │   ├── context/                  # React Context providers
│   │   │   ├── AuthContext.tsx       # Auth state context
│   │   │   └── TasksContext.tsx      # Tasks state context (if needed)
│   │   ├── styles/                   # Global styles (if not using CSS-in-JS)
│   │   │   └── globals.css
│   │   ├── App.tsx                   # Root component
│   │   └── main.tsx                  # App entry point
│   ├── public/                       # Static assets
│   │   └── favicon.ico
│   ├── tests/
│   │   ├── components/               # Component tests
│   │   └── integration/              # User flow tests
│   ├── .env.example                  # Example environment variables
│   ├── .eslintrc.json                # ESLint configuration
│   ├── .prettierrc                   # Prettier configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── vite.config.ts                # Vite configuration (if using Vite)
│   └── package.json                  # Frontend dependencies
│
├── .specify/                         # Spec-Kit Plus tooling (already present)
│   ├── memory/
│   │   └── constitution.md           # Phase 2 Constitution v2.0.0
│   ├── templates/
│   └── scripts/
│
├── specs/                            # Feature specifications (already present)
│   └── 004-fullstack-todo-web-app/  # This feature
│
├── history/                          # Prompt History Records (already present)
│   └── prompts/
│       └── 004-fullstack-todo-web-app/
│
├── .gitignore                        # Git ignore rules (.env, node_modules, etc.)
├── README.md                         # Project documentation
├── package.json                      # Monorepo root package.json (if using workspaces)
└── CLAUDE.md                         # Agent instructions (already present)
```

**Structure Decision**: Web application structure (Option 2) selected because:
1. Feature specification explicitly requires "frontend + backend + database" separation
2. Constitution mandates layered architecture with clear boundaries
3. Different technology stacks (backend: Node.js/Express/Fastify, frontend: React/Next.js)
4. Enables independent scaling and deployment of frontend vs backend
5. Follows industry-standard full-stack application patterns

**Monorepo Consideration**: Consider using npm/pnpm workspaces or a monorepo tool (Nx, Turborepo) to manage backend/frontend as separate packages with shared dependencies. Decision deferred to Phase 0 research.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations detected** - Constitution Check passed. All architectural decisions align with Phase 2 Constitution v2.0.0.

---

## Phase 0: Research & Technology Selection

**Objective**: Resolve all 7 NEEDS CLARIFICATION items and document technology decisions with rationale.

### Research Tasks

1. **Backend Framework Selection**: Express.js vs Fastify
   - **Context**: Need to choose HTTP server framework for REST API
   - **Evaluation Criteria**:
     - Performance (throughput, latency)
     - TypeScript support quality
     - Better Auth integration ease
     - ORM compatibility (Prisma/Drizzle)
     - Community maturity and ecosystem
     - Learning curve for team
   - **Deliverable**: Decision with benchmarks and rationale

2. **ORM Selection**: Prisma vs Drizzle
   - **Context**: Need to choose database ORM for PostgreSQL
   - **Evaluation Criteria**:
     - TypeScript type safety
     - Migration management quality
     - Query performance
     - PostgreSQL array support (for tags)
     - Developer experience (schema definition, auto-completion)
     - Neon Serverless PostgreSQL compatibility
   - **Deliverable**: Decision with migration strategy

3. **Frontend Framework Selection**: React 18+ vs Next.js 14+
   - **Context**: Need to choose UI framework
   - **Evaluation Criteria**:
     - Server-side rendering (SSR) vs client-side rendering (CSR) needs
     - Routing complexity (3-4 pages)
     - Better Auth integration ease
     - Bundle size optimization
     - Developer experience
     - Deployment simplicity
   - **Deliverable**: Decision with architecture implications

4. **CSS Framework Selection**: Tailwind CSS vs shadcn/ui
   - **Context**: Need to choose styling solution
   - **Evaluation Criteria**:
     - Responsive design support (mobile-first)
     - WCAG AA accessibility compliance
     - Component reusability
     - Bundle size impact
     - Design system consistency (4px/8px grid)
     - Developer productivity
   - **Deliverable**: Decision with component library plan

5. **Testing Framework Selection**: Jest vs Vitest
   - **Context**: Need to choose testing framework
   - **Evaluation Criteria**:
     - TypeScript support
     - Speed (test execution time)
     - React Testing Library compatibility
     - Supertest integration (backend)
     - Configuration complexity
     - Vite/Webpack compatibility
   - **Deliverable**: Decision with test strategy

6. **Package Manager Selection**: pnpm vs npm
   - **Context**: Need to choose package manager
   - **Evaluation Criteria**:
     - Monorepo/workspace support
     - Install speed
     - Disk space efficiency
     - Lockfile consistency
     - Better Auth compatibility
   - **Deliverable**: Decision with setup instructions

7. **Validation Library Selection**: Zod vs Joi
   - **Context**: Need to choose input validation library
   - **Evaluation Criteria**:
     - TypeScript type inference
     - API (ease of use)
     - Performance
     - Error message quality
     - Integration with Express/Fastify
   - **Deliverable**: Decision with validation patterns

### Best Practices Research

8. **Better Auth Integration**:
   - Setup and configuration best practices
   - Session storage options (database vs in-memory)
   - CSRF protection implementation
   - Cookie security settings (httpOnly, secure, sameSite)
   - Multi-tab session handling
   - **Deliverable**: Better Auth setup guide

9. **Neon PostgreSQL Best Practices**:
   - Connection pooling configuration
   - Migration strategy for serverless environment
   - Query optimization for UUIDs and arrays
   - Backup and disaster recovery approach
   - **Deliverable**: Neon setup and optimization guide

10. **Recurring Task Patterns**:
    - Design patterns for recurrence logic
    - Date calculation edge cases (month-end handling)
    - Task instance generation strategies
    - Database schema for recurring tasks
    - **Deliverable**: Recurrence implementation pattern

11. **Reminder Scheduling Patterns**:
    - Server-side scheduling approaches (cron, job queue)
    - Browser notification API integration
    - Permission handling and fallback strategies
    - Timezone considerations (single timezone assumption)
    - **Deliverable**: Reminder system architecture

12. **API Versioning Strategy**:
    - `/api/v1/` implementation patterns
    - Breaking change management
    - Deprecation strategy for future versions
    - **Deliverable**: API versioning guidelines

### Output: research.md

**File Location**: `specs/004-fullstack-todo-web-app/research.md`

**Required Structure**:
```markdown
# Research: Full-Stack Todo Web Application (Phase 2)

## Technology Decisions

### 1. Backend Framework: [Express.js | Fastify]
- **Decision**: [Chosen technology]
- **Rationale**: [Why chosen - performance, ecosystem, TypeScript support, etc.]
- **Alternatives Considered**: [Other option with pros/cons]
- **Implementation Notes**: [Setup instructions, configuration patterns]

### 2. ORM: [Prisma | Drizzle]
- **Decision**: [Chosen technology]
- **Rationale**: [Why chosen - type safety, DX, performance, etc.]
- **Alternatives Considered**: [Other option with pros/cons]
- **Migration Strategy**: [How migrations will be managed]

### 3. Frontend Framework: [React 18+ | Next.js 14+]
- **Decision**: [Chosen technology]
- **Rationale**: [Why chosen - SSR needs, routing, bundle size, etc.]
- **Alternatives Considered**: [Other option with pros/cons]
- **Architecture Implications**: [CSR vs SSR, routing approach]

### 4. CSS Framework: [Tailwind CSS | shadcn/ui]
- **Decision**: [Chosen technology]
- **Rationale**: [Why chosen - productivity, bundle size, accessibility, etc.]
- **Alternatives Considered**: [Other option with pros/cons]
- **Component Library Plan**: [Reusable components strategy]

### 5. Testing Framework: [Jest | Vitest]
- **Decision**: [Chosen technology]
- **Rationale**: [Why chosen - speed, TypeScript support, ecosystem, etc.]
- **Alternatives Considered**: [Other option with pros/cons]
- **Test Strategy**: [Unit, integration, e2e approach]

### 6. Package Manager: [pnpm | npm]
- **Decision**: [Chosen technology]
- **Rationale**: [Why chosen - speed, monorepo support, etc.]
- **Alternatives Considered**: [Other option with pros/cons]
- **Workspace Setup**: [Monorepo configuration]

### 7. Validation Library: [Zod | Joi]
- **Decision**: [Chosen technology]
- **Rationale**: [Why chosen - TypeScript inference, DX, etc.]
- **Alternatives Considered**: [Other option with pros/cons]
- **Validation Patterns**: [Schema definition examples]

## Integration Patterns

### Better Auth Setup
[Setup guide, configuration, session storage, CSRF protection]

### Neon PostgreSQL Configuration
[Connection pooling, migrations, optimization]

### Recurring Task Implementation
[Recurrence logic, date calculations, task generation]

### Reminder System Architecture
[Scheduling approach, browser notifications, permissions]

### API Versioning
[Versioning strategy, deprecation approach]
```

---

## Phase 1: Data Model & API Contracts

**Prerequisites**: `research.md` complete with all technology decisions finalized

### 1. Data Model Design

**Objective**: Translate feature requirements into concrete data structures and relationships.

**File Location**: `specs/004-fullstack-todo-web-app/data-model.md`

**Required Content**:

#### Entity: User

**Fields**:
- `id`: UUID (primary key, auto-generated)
- `email`: String (unique, required, max 255 chars)
  - Validation: RFC 5322 email format
  - Constraint: UNIQUE index
- `name`: String (optional, max 255 chars)
- `created_at`: Timestamp (auto-generated, default NOW())
- `updated_at`: Timestamp (auto-updated)

**Relationships**:
- One-to-Many with Task (user has many tasks)

**Managed By**: Better Auth (password hashing, session storage handled externally)

**Notes**:
- Better Auth may add additional fields (password_hash, etc.) - consult library documentation
- Soft deletes NOT implemented (users can be hard deleted)

---

#### Entity: Task

**Fields**:
- `id`: UUID (primary key, auto-generated)
- `user_id`: UUID (foreign key to User, required, ON DELETE CASCADE)
  - Validation: Must reference existing user
  - Index: idx_tasks_user_id (for efficient user task queries)
- `title`: String (required, max 200 chars)
  - Validation: Non-empty, trimmed
  - Constraint: NOT NULL
- `description`: Text (optional, no max length)
  - Validation: Trimmed if provided
- `completed`: Boolean (default false, required)
  - Validation: Must be boolean
- `priority`: Enum ('low', 'medium', 'high') (default 'medium', required)
  - Validation: CHECK constraint (priority IN ('low', 'medium', 'high'))
  - Index: For priority-based filtering
- `tags`: Array of Strings (optional, PostgreSQL TEXT[])
  - Validation: Each tag max 50 chars, array max 20 tags
  - Storage: PostgreSQL native array type for efficient querying
- `category`: String (optional, max 100 chars)
  - Validation: Trimmed, alphanumeric + spaces
  - Note: Alternative to tags (user can use tags OR category OR both)
- `due_date`: Timestamp (optional)
  - Validation: If provided, must be valid date (can be in past - becomes overdue)
  - Index: idx_tasks_due_date (for due date sorting and overdue queries)
- `recurrence_pattern`: Enum ('daily', 'weekly', 'monthly') (optional)
  - Validation: If provided, must be one of allowed values
  - Constraint: CHECK constraint or enum type
- `reminder_enabled`: Boolean (default false, required)
  - Validation: Must be boolean
  - Constraint: If true, due_date must be set and reminder_offset_minutes must be > 0
- `reminder_offset_minutes`: Integer (optional)
  - Validation: If provided, must be positive integer
  - Allowed values: 15, 60, 120, 1440, 2880 (15min, 1hr, 2hr, 1day, 2days in minutes)
- `created_at`: Timestamp (auto-generated, default NOW())
- `updated_at`: Timestamp (auto-updated)

**Relationships**:
- Many-to-One with User (task belongs to one user)

**Indexes**:
- `idx_tasks_user_id` (for user isolation and efficient task retrieval)
- `idx_tasks_due_date` (for due date sorting and overdue queries)
- `idx_tasks_completed` (for filtering by completion status)
- Composite index: `idx_tasks_user_priority` (user_id, priority) for priority filtering

**State Transitions**:
```
Initial State: completed = false

Transitions:
1. Mark Complete:
   - completed: false → true
   - IF recurrence_pattern IS NOT NULL:
     - Trigger: Create new task instance
     - New task: Copy all fields except id, created_at, updated_at
     - New task.due_date: Calculate based on recurrence_pattern
     - New task.completed: false

2. Mark Incomplete:
   - completed: true → false
   - No recurrence logic triggered

3. Delete:
   - Hard delete from database
   - Note: If recurring task, only current instance deleted (no cascade to future instances)
```

**Validation Rules** (enforced in backend service layer):
- Title: Required, non-empty after trim, max 200 chars
- Description: Optional, trimmed, no max length
- Priority: Must be 'low', 'medium', or 'high'; defaults to 'medium'
- Tags: Each tag max 50 chars, max 20 tags total, trimmed, no duplicates
- Category: Optional, max 100 chars, alphanumeric + spaces only
- Due date: Optional, must be valid date format (YYYY-MM-DDTHH:MM:SSZ)
- Recurrence: Optional, must be 'daily', 'weekly', or 'monthly'
- Reminder: If enabled, due_date required and reminder_offset_minutes must be valid preset

**Edge Case Handling**:
- Monthly recurrence on day 31: Use last day of month (e.g., Jan 31 → Feb 28/29, Mar 31, Apr 30, etc.)
- Reminder offset longer than time until due: Trigger reminder immediately
- Concurrent task updates: Use database transactions with optimistic locking (via updated_at timestamp check)

---

#### Entity: Session (Managed by Better Auth)

**Note**: Better Auth handles session storage. Document expected schema for reference.

**Fields** (typical Better Auth session):
- `id`: String/UUID (session identifier)
- `user_id`: UUID (foreign key to User)
- `expires_at`: Timestamp (session expiration)
- `csrf_token`: String (CSRF protection token)

**Storage**: Database table managed by Better Auth (not created manually)

**Notes**:
- Consult Better Auth documentation for exact schema
- Sessions are stateful (stored in database, not JWT)
- httpOnly cookies used for session ID transmission

---

### 2. API Contracts

**Objective**: Define RESTful API endpoints with request/response schemas.

**File Location**: `specs/004-fullstack-todo-web-app/contracts/`

**Files to Create**:
1. `openapi.yaml` - Complete OpenAPI 3.0 specification
2. `auth.contract.md` - Auth endpoints detailed contract
3. `tasks.contract.md` - Tasks endpoints detailed contract

**OpenAPI Specification Structure** (openapi.yaml):

```yaml
openapi: 3.0.3
info:
  title: Todo App API
  version: 1.0.0
  description: RESTful API for Phase 2 Full-Stack Todo Application
servers:
  - url: http://localhost:3000/api/v1
    description: Development server
  - url: https://api.todo-app.example.com/api/v1
    description: Production server (TBD)

paths:
  # Authentication Endpoints
  /auth/signup:
    post:
      summary: User signup
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SignupRequest'
      responses:
        '201':
          description: User created and signed in
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthSuccessResponse'
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /auth/signin:
    post:
      summary: User signin
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SigninRequest'
      responses:
        '200':
          description: Successfully authenticated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthSuccessResponse'
        '401':
          description: Invalid credentials
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /auth/signout:
    post:
      summary: User signout
      tags: [Authentication]
      security:
        - cookieAuth: []
      responses:
        '204':
          description: Successfully signed out
        '401':
          description: Not authenticated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  # Task Endpoints
  /tasks:
    get:
      summary: Get all user tasks
      tags: [Tasks]
      security:
        - cookieAuth: []
      parameters:
        - name: search
          in: query
          schema:
            type: string
          description: Search keyword (title/description)
        - name: completed
          in: query
          schema:
            type: boolean
          description: Filter by completion status
        - name: priority
          in: query
          schema:
            type: string
            enum: [low, medium, high]
          description: Filter by priority
        - name: tag
          in: query
          schema:
            type: string
          description: Filter by tag
        - name: sort
          in: query
          schema:
            type: string
            enum: [title, priority, due_date, created_at]
          description: Sort field
        - name: order
          in: query
          schema:
            type: string
            enum: [asc, desc]
          description: Sort order
      responses:
        '200':
          description: List of tasks
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaskListResponse'
        '401':
          description: Not authenticated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

    post:
      summary: Create a new task
      tags: [Tasks]
      security:
        - cookieAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTaskRequest'
      responses:
        '201':
          description: Task created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaskResponse'
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Not authenticated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /tasks/{id}:
    get:
      summary: Get task by ID
      tags: [Tasks]
      security:
        - cookieAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Task details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaskResponse'
        '404':
          description: Task not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Not authenticated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

    put:
      summary: Update task
      tags: [Tasks]
      security:
        - cookieAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateTaskRequest'
      responses:
        '200':
          description: Task updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaskResponse'
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '404':
          description: Task not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Not authenticated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

    delete:
      summary: Delete task
      tags: [Tasks]
      security:
        - cookieAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '204':
          description: Task deleted
        '404':
          description: Task not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Not authenticated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /tasks/{id}/complete:
    patch:
      summary: Mark task as complete
      tags: [Tasks]
      security:
        - cookieAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Task marked complete (may include new recurring task)
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      completed_task:
                        $ref: '#/components/schemas/Task'
                      new_recurring_task:
                        $ref: '#/components/schemas/Task'
                        nullable: true
                  error:
                    type: object
                    nullable: true
        '404':
          description: Task not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Not authenticated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /tasks/{id}/incomplete:
    patch:
      summary: Mark task as incomplete
      tags: [Tasks]
      security:
        - cookieAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Task marked incomplete
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaskResponse'
        '404':
          description: Task not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Not authenticated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

components:
  securitySchemes:
    cookieAuth:
      type: apiKey
      in: cookie
      name: session

  schemas:
    SignupRequest:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
          maxLength: 255
        password:
          type: string
          minLength: 8
        name:
          type: string
          maxLength: 255

    SigninRequest:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
        password:
          type: string

    AuthSuccessResponse:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: object
          properties:
            user:
              $ref: '#/components/schemas/User'
        error:
          type: object
          nullable: true

    CreateTaskRequest:
      type: object
      required:
        - title
      properties:
        title:
          type: string
          maxLength: 200
          minLength: 1
        description:
          type: string
        priority:
          type: string
          enum: [low, medium, high]
          default: medium
        tags:
          type: array
          items:
            type: string
            maxLength: 50
          maxItems: 20
        category:
          type: string
          maxLength: 100
        due_date:
          type: string
          format: date-time
        recurrence_pattern:
          type: string
          enum: [daily, weekly, monthly]
        reminder_enabled:
          type: boolean
          default: false
        reminder_offset_minutes:
          type: integer
          enum: [15, 60, 120, 1440, 2880]

    UpdateTaskRequest:
      type: object
      properties:
        title:
          type: string
          maxLength: 200
          minLength: 1
        description:
          type: string
        priority:
          type: string
          enum: [low, medium, high]
        tags:
          type: array
          items:
            type: string
            maxLength: 50
          maxItems: 20
        category:
          type: string
          maxLength: 100
        due_date:
          type: string
          format: date-time
          nullable: true
        recurrence_pattern:
          type: string
          enum: [daily, weekly, monthly]
          nullable: true
        reminder_enabled:
          type: boolean
        reminder_offset_minutes:
          type: integer
          enum: [15, 60, 120, 1440, 2880]
          nullable: true

    Task:
      type: object
      properties:
        id:
          type: string
          format: uuid
        user_id:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
          nullable: true
        completed:
          type: boolean
        priority:
          type: string
          enum: [low, medium, high]
        tags:
          type: array
          items:
            type: string
        category:
          type: string
          nullable: true
        due_date:
          type: string
          format: date-time
          nullable: true
        recurrence_pattern:
          type: string
          enum: [daily, weekly, monthly]
          nullable: true
        reminder_enabled:
          type: boolean
        reminder_offset_minutes:
          type: integer
          nullable: true
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string
          nullable: true
        created_at:
          type: string
          format: date-time

    TaskResponse:
      type: object
      properties:
        success:
          type: boolean
        data:
          $ref: '#/components/schemas/Task'
        error:
          type: object
          nullable: true

    TaskListResponse:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: array
          items:
            $ref: '#/components/schemas/Task'
        error:
          type: object
          nullable: true

    ErrorResponse:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: object
          nullable: true
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            field:
              type: string
              nullable: true
```

---

### 3. Quickstart Guide

**Objective**: Provide step-by-step setup instructions for developers.

**File Location**: `specs/004-fullstack-todo-web-app/quickstart.md`

**Required Content**: (To be generated based on research.md technology decisions)

```markdown
# Quickstart Guide: Full-Stack Todo Web Application (Phase 2)

## Prerequisites

- Node.js 20+ LTS
- [pnpm | npm] (TBD from research.md)
- PostgreSQL client (for Neon connection testing)
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

## Environment Setup

### 1. Clone Repository

```bash
# Assuming repository URL (replace with actual)
git clone https://github.com/your-org/todo-app-phase2.git
cd todo-app-phase2
```

### 2. Install Dependencies

```bash
# Backend
cd backend
[pnpm | npm] install

# Frontend
cd ../frontend
[pnpm | npm] install
```

### 3. Configure Environment Variables

**Backend** (`backend/.env`):

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname  # Get from Neon dashboard

# Better Auth
AUTH_SECRET=<generate with: openssl rand -base64 32>
AUTH_COOKIE_NAME=session
AUTH_COOKIE_SECURE=false  # true in production
AUTH_COOKIE_SAMESITE=lax

# Server
PORT=3000
NODE_ENV=development
```

**Frontend** (`frontend/.env`):

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### 4. Database Setup

```bash
cd backend

# Run migrations (Prisma example - adjust based on ORM choice)
npx prisma migrate dev --name init

# Or (Drizzle example)
npx drizzle-kit push
```

### 5. Start Development Servers

**Terminal 1 - Backend**:

```bash
cd backend
[pnpm | npm] run dev
```

**Terminal 2 - Frontend**:

```bash
cd frontend
[pnpm | npm] run dev
```

### 6. Access Application

- **Frontend**: http://localhost:5173 (or port shown in terminal)
- **Backend API**: http://localhost:3000/api/v1
- **API Docs** (if using Swagger): http://localhost:3000/api-docs

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
[pnpm | npm] test

# Run with coverage
[pnpm | npm] run test:coverage

# Run specific test file
[pnpm | npm] test src/services/task.service.test.ts
```

### Frontend Tests

```bash
cd frontend

# Run all tests
[pnpm | npm] test

# Run in watch mode
[pnpm | npm] run test:watch

# Run with coverage
[pnpm | npm] run test:coverage
```

## Useful Commands

### Backend

```bash
# Lint code
[pnpm | npm] run lint

# Format code
[pnpm | npm] run format

# Type check
[pnpm | npm] run type-check

# Database migrations (Prisma)
npx prisma migrate dev --name <migration-name>
npx prisma studio  # Database GUI

# Database migrations (Drizzle)
npx drizzle-kit generate
npx drizzle-kit push
npx drizzle-kit studio  # Database GUI
```

### Frontend

```bash
# Lint code
[pnpm | npm] run lint

# Format code
[pnpm | npm] run format

# Type check
[pnpm | npm] run type-check

# Build for production
[pnpm | npm] run build

# Preview production build
[pnpm | npm] run preview
```

## Project Structure

```
TODO_APP_PHASE2/
├── backend/          # Node.js/TypeScript REST API
├── frontend/         # React/Next.js UI
├── specs/            # Feature specifications
├── .specify/         # Spec-Kit Plus tooling
└── history/          # Prompt History Records
```

## Troubleshooting

### Database Connection Issues

1. Verify Neon PostgreSQL connection string in `backend/.env`
2. Check firewall/network access to Neon
3. Test connection: `psql $DATABASE_URL`

### Better Auth Issues

1. Ensure `AUTH_SECRET` is set in `backend/.env`
2. Clear browser cookies if session issues occur
3. Check Better Auth logs in backend console

### CORS Issues

1. Verify `VITE_API_BASE_URL` in `frontend/.env`
2. Check backend CORS configuration allows frontend origin

## Next Steps

1. Read `specs/004-fullstack-todo-web-app/spec.md` for feature requirements
2. Review `specs/004-fullstack-todo-web-app/plan.md` for architecture
3. Check `specs/004-fullstack-todo-web-app/data-model.md` for database schema
4. Explore API contracts in `specs/004-fullstack-todo-web-app/contracts/`
```

---

### 4. Agent Context Update

**Objective**: Update agent-specific context file with technology decisions.

**Script**: `.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude`

**Action**: Run script after research.md and data-model.md are complete to add:
- Chosen technologies (backend framework, ORM, frontend framework, CSS framework, etc.)
- Database schema references
- API contract references
- Project structure references

**Manual Additions** (preserved between script runs):
- Custom coding patterns specific to this project
- Team-specific conventions
- Known issues and workarounds

---

## Phase 2: Task Breakdown (Not Performed by /sp.plan)

**Note**: Task breakdown is performed by the `/sp.tasks` command, NOT by `/sp.plan`.

**Command**: `/sp.tasks`

**Output**: `specs/004-fullstack-todo-web-app/tasks.md`

**Prerequisites**:
- Phase 0 research.md complete
- Phase 1 data-model.md and contracts/ complete
- All NEEDS CLARIFICATION items resolved

**Expected Task Structure** (for reference):
- Authentication setup (Better Auth integration)
- Database schema implementation (migrations)
- Backend API implementation (layered architecture)
- Frontend component implementation (Container/Presentational pattern)
- Recurring task logic implementation
- Reminder system implementation
- Testing (unit, integration)
- Documentation updates

---

## Re-Evaluation: Constitution Check (Post-Design)

**GATE**: Re-run after Phase 1 design complete to verify chosen technologies comply with constitution.

### Updated Constitution Check (After Technology Decisions)

**To be filled after research.md completes**:

✅ **Backend Framework**: [Express.js | Fastify]
- Justification: [Why chosen technology aligns with constitution principles]

✅ **ORM**: [Prisma | Drizzle]
- Justification: [Why chosen technology aligns with constitution principles]

✅ **Frontend Framework**: [React 18+ | Next.js 14+]
- Justification: [Why chosen technology aligns with constitution principles]

✅ **CSS Framework**: [Tailwind CSS | shadcn/ui]
- Justification: [Why chosen technology aligns with constitution principles]

✅ **Testing Framework**: [Jest | Vitest]
- Justification: [Why chosen technology aligns with constitution principles]

✅ **Package Manager**: [pnpm | npm]
- Justification: [Why chosen technology aligns with constitution principles]

✅ **Validation Library**: [Zod | Joi]
- Justification: [Why chosen technology aligns with constitution principles]

**Gate Status**: ✅ PASS (pending research completion)

---

## Summary & Next Steps

### Planning Phase Complete

**Artifacts Generated**:
1. ✅ `plan.md` (this file) - Implementation plan with architecture, structure, and gates
2. ⏳ `research.md` (Phase 0) - Technology decisions and patterns (pending generation)
3. ⏳ `data-model.md` (Phase 1) - Entity definitions and relationships (pending generation)
4. ⏳ `contracts/` (Phase 1) - API contracts (OpenAPI + detailed docs) (pending generation)
5. ⏳ `quickstart.md` (Phase 1) - Developer setup guide (pending generation)

**Gates Passed**:
- ✅ Constitution Check (with TBD items to be resolved in Phase 0)

**Critical Path**:
1. Phase 0: Generate `research.md` to resolve all NEEDS CLARIFICATION items
2. Phase 1: Generate `data-model.md` and `contracts/` based on research decisions
3. Phase 1: Generate `quickstart.md` based on chosen technologies
4. Phase 1: Run agent context update script
5. Re-evaluate Constitution Check with finalized technology choices
6. Command ends - ready for `/sp.tasks` to generate task breakdown

**Ready for Implementation**:
- After Phase 0 and Phase 1 artifacts are generated
- After Constitution Check re-evaluation passes
- Run `/sp.tasks` to generate implementation task breakdown

---

**Plan Status**: Draft - Phase 0 and Phase 1 artifact generation required
**Created**: 2025-12-29
**Constitution Version**: v2.0.0
**Specification Version**: specs/004-fullstack-todo-web-app/spec.md (2025-12-29)
