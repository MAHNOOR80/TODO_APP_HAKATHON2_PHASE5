---
id: 003
title: Phase 2 Full-Stack Web Constitution Creation
stage: constitution
date: 2025-12-29
surface: agent
model: claude-sonnet-4-5
feature: none
branch: none
user: User
command: /sp.constitution
labels: ["constitution", "phase2", "fullstack", "web-application", "architecture"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - None (documentation artifact)
---

## Prompt

/sp.constitution

## Project Name
Todo Application – Phase 2 (Web-Based, Full Stack)

## Objective
Transform the Phase 1 CLI-based Todo application into a full-stack web application using an Agentic Dev Stack workflow, implementing all Basic, Intermediate, and Advanced features with persistence, authentication, and a responsive UI.

## Scope & Feature Parity
All features from Phase 1 must be fully implemented as a web application:

### Basic Level (Core Essentials)
- Add Task
- Delete Task
- Update Task
- View Task List
- Mark Task as Complete / Incomplete

### Intermediate Level (Organization & Usability)
- Priorities (High / Medium / Low)
- Tags / Categories
- Search and Filter (status, priority, category)
- Sort Tasks (alphabetical, priority, due date)

### Advanced Level (Intelligent Features)
- Recurring Tasks (daily / weekly / monthly)
- Due Dates and Time-Based Reminders

## Architecture & Workflow
- Follow **Agentic Dev Stack Workflow**
- Use **spec-driven development** with Spec-Kit Plus
- Claude Code acts as implementation agent guided strictly by specs

## Technical Requirements

### Backend
- RESTful API architecture
- CRUD endpoints for tasks
- Recurrence and reminder logic handled server-side
- Authentication-protected routes
- PostgreSQL database via **Neon Serverless PostgreSQL**

### Authentication
- Implement user signup and signin
- Use **Better Auth** for authentication and session handling
- Each user can only access their own tasks

### Frontend
- Responsive web interface
- Task management UI covering all feature levels
- Auth screens (signup / signin)
- Clear UX for priorities, filters, sorting, recurrence, and reminders

## Data Management
- Persistent storage using PostgreSQL
- Proper schema design for:
  - Users
  - Tasks
  - Recurrence metadata
  - Reminder metadata

## Deliverables
1. GitHub repository containing:
   - `/specs` folder with full spec history
   - Backend and frontend source code
   - Database schema/migrations
   - `README.md` with setup and usage instructions

## Response snapshot

Created Phase II Full-Stack Web Todo Application Constitution (v2.0.0) with comprehensive governance framework for transitioning from CLI to web architecture.

**Major sections added:**

1. **Core Principles (Expanded for Web):**
   - Simplicity and Readability First (carried from Phase I)
   - Clean Code Principles (expanded for multi-layer architecture)
   - Modularity and Extensibility (critical for full stack)
   - **Security First** (NEW - authentication, authorization, input validation, XSS/SQL injection prevention)
   - **API-First Design** (NEW - RESTful conventions, consistent response formats, versioning)

2. **Technical Stack Decisions:**
   - Backend: Node.js 20+, TypeScript 5+, Express/Fastify (TBD), Better Auth, Prisma/Drizzle (TBD), Neon PostgreSQL
   - Frontend: React 18+/Next.js 14+ (TBD), TypeScript 5+, Tailwind CSS/shadcn/ui (TBD)
   - Development: ESLint, Prettier, TypeScript strict mode

3. **Database Schema Requirements:**
   - Users table (UUID primary keys, Better Auth integration)
   - Tasks table (user_id foreign key with CASCADE DELETE, PostgreSQL arrays for tags, indexed fields)
   - UUIDs for all primary keys (security + distributed systems)
   - User data isolation enforced at query level

4. **Backend Architecture (Layered):**
   - HTTP Layer (route handlers)
   - Middleware Layer (auth, validation, error handling)
   - Business Logic Layer (services)
   - Data Access Layer (repositories with ORM)
   - Clear separation of concerns, dependency inversion

5. **Authentication & Authorization:**
   - Better Auth integration (session-based, CSRF protection)
   - Auth flows: signup, signin, signout, session validation
   - All `/api/v1/tasks/*` endpoints require authentication
   - Users can ONLY access their own tasks

6. **Frontend Architecture:**
   - Container/Presentational pattern
   - Component hierarchy and file structure
   - State management rules (server state vs client state)
   - Centralized API client with error handling

7. **UI/UX Requirements:**
   - Responsive design (mobile-first, 320px-1024px+)
   - Accessibility (WCAG AA, semantic HTML, keyboard navigation)
   - Visual design system (spacing grid, typography, status/priority colors)
   - Loading and empty states

8. **Error Handling:**
   - Backend: Middleware-based error handling, semantic HTTP status codes, structured error responses
   - Frontend: Toast notifications, inline validation, graceful degradation

9. **Testing Strategy:**
   - Backend: Unit tests (>80% coverage), integration tests with test database
   - Frontend: Component tests (React Testing Library), user flow integration tests

10. **Environment Configuration:**
    - Backend: DATABASE_URL, AUTH_SECRET, PORT, NODE_ENV
    - Frontend: VITE_API_BASE_URL
    - .env.example committed, .env gitignored

11. **Progressive Implementation Strategy:**
    - Authentication MUST be implemented first
    - Basic Level → Intermediate Level → Advanced Level (strict ordering)
    - Backward compatibility rules (non-destructive migrations, sensible defaults)

**Version Management:**
- MAJOR version bump (1.1.0 → 2.0.0) due to architectural pivot
- Breaking changes: CLI → Web, In-Memory → PostgreSQL, Single-user → Multi-user
- Carries forward: Simplicity principles, modularity, clean code standards

**File Location:**
`.specify/memory/constitution.md` (overwrites Phase I constitution as this is Phase II project)

## Outcome

- ✅ Impact: Comprehensive Phase II constitution created with full-stack architecture governance
- 🧪 Tests: None (documentation artifact)
- 📁 Files: .specify/memory/constitution.md (1 file modified)
- 🔁 Next prompts: Create feature specifications using this constitution as foundation, run `/sp.specify` for first feature
- 🧠 Reflection: Constitution provides clear architectural boundaries while maintaining Phase I's simplicity principles. Security-first approach and layered architecture prevent common full-stack pitfalls.

## Evaluation notes (flywheel)

- Failure modes observed: None (straightforward constitution creation based on requirements)
- Graders run and results (PASS/FAIL): N/A (no automated grading for constitution)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Validate constitution compliance by creating first feature spec (authentication system)
