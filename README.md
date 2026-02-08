# Full-Stack Todo Web Application - Phase 2

A production-ready, full-stack todo application with authentication, persistent storage, and responsive web UI. This is Phase 2 of the Todo Application project, transforming the Phase 1 CLI application into a complete web-based solution.

## Overview

This full-stack web application enables authenticated users to manage their tasks through an intuitive web interface with complete feature parity from Phase 1.

### Phase 2 Transformation

**From Phase 1 (CLI):**
- ❌ In-memory storage → ✅ PostgreSQL persistence (Neon Serverless)
- ❌ Single-user CLI → ✅ Multi-user web app with authentication (Better Auth)
- ❌ Python CLI → ✅ TypeScript full-stack (Node.js backend + React frontend)
- ❌ Local execution → ✅ RESTful API with responsive web UI

## Features

### 100% Feature Parity with Phase 1

**Basic Level (User Story 1-2):**
- ✅ User authentication (signup, signin, signout)
- ✅ Create tasks with title and description
- ✅ View all user tasks
- ✅ Update task details
- ✅ Delete tasks
- ✅ Mark tasks as complete/incomplete

**Intermediate Level (User Story 3-4):**
- ✅ Assign priority levels (High/Medium/Low)
- ✅ Tag tasks for organization
- ✅ Search tasks by keyword
- ✅ Filter by completion status, priority, or tag
- ✅ Sort by title, priority, or due date

**Advanced Level (User Story 5-7):**
- ✅ Set due dates with overdue indicators
- ✅ Recurring tasks (daily/weekly/monthly)
- ✅ Task reminders with browser notifications

### New Phase 2 Capabilities

- 🔐 **Secure Authentication**: Session-based auth with Better Auth
- 💾 **Persistent Storage**: PostgreSQL database with user data isolation
- 🌐 **Responsive Design**: Mobile, tablet, and desktop support
- ♿ **Accessibility**: WCAG AA compliance
- 🚀 **Performance**: <2s page load, <1s search/filter
- 🔒 **Security**: Input validation, SQL injection prevention, XSS protection, CSRF protection

### AI-Powered Todo Assistant (Phase 3)

- 🤖 **Natural Language Processing**: Create and manage tasks using conversational language
- 🧠 **Intent Recognition**: Automatically detects create, update, delete, and status change operations
- 💬 **Context-Aware Conversations**: Maintains conversation context and understands references like "it" or "that task"
- ⚠️ **Safety Flows**: Confirmation required for destructive operations like task deletion
- 🔄 **Multi-turn Conversations**: Handles follow-up commands and task chaining

## Architecture

### Tech Stack

**Backend:**
- Language: TypeScript 5+ (strict mode)
- Runtime: Node.js 20+ LTS
- Framework: Express.js (layered architecture)
- Database: Neon Serverless PostgreSQL
- ORM: Prisma
- Authentication: Better Auth (session-based)
- Validation: Zod
- Testing: Jest + Supertest

**Frontend:**
- Language: TypeScript 5+ (strict mode)
- Framework: React 18+
- Build Tool: Vite
- Styling: Tailwind CSS
- Routing: React Router
- State Management: React Context + Hooks
- Testing: Vitest + React Testing Library

### Project Structure

```
TODO_APP_PHASE2/
├── backend/               # REST API Server
│   ├── src/
│   │   ├── config/        # Database, auth config
│   │   ├── middleware/    # Auth, validation, error handling
│   │   ├── routes/        # API endpoints (auth, tasks)
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Database access
│   │   ├── models/        # TypeScript interfaces
│   │   ├── validators/    # Input validation schemas
│   │   ├── utils/         # Helper functions
│   │   └── index.ts       # Server entry point
│   ├── tests/             # Backend tests
│   ├── .env.example       # Environment variables template
│   ├── package.json       # Backend dependencies
│   └── tsconfig.json      # TypeScript config (strict mode)
│
├── frontend/              # Web UI
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── containers/    # Data-fetching containers
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API client
│   │   ├── types/         # TypeScript types
│   │   ├── context/       # React Context providers
│   │   ├── utils/         # Helper functions
│   │   └── App.tsx        # Root component
│   ├── tests/             # Frontend tests
│   ├── .env.example       # Environment variables template
│   ├── package.json       # Frontend dependencies
│   └── tsconfig.json      # TypeScript config (strict mode)
│
└── specs/                 # Documentation
    └── 004-fullstack-todo-web-app/
        ├── spec.md        # Feature specification
        ├── plan.md        # Implementation plan
        └── tasks.md       # Task breakdown
```

### Layered Architecture

**Backend (4 Layers):**
1. **HTTP Layer**: Route handlers, request/response formatting
2. **Middleware Layer**: Authentication, validation, error handling
3. **Business Logic Layer**: Services for task operations, recurrence, reminders
4. **Data Access Layer**: Repositories with ORM queries, user isolation

**Frontend (Container/Presentational Pattern):**
- **Container Components**: Data fetching + state management
- **Presentational Components**: Props + rendering only
- **Separation**: UI decoupled from business logic and API calls

## Requirements

- Node.js 20+ LTS
- npm or pnpm
- Neon PostgreSQL database (free tier available at [neon.tech](https://neon.tech))

## Setup

### 1. Clone and Navigate

```bash
cd TODO_APP_PHASE2
```

### 2. Neon PostgreSQL Setup

Before setting up the backend, you need to create a Neon PostgreSQL database:

1. Sign up at [neon.tech](https://neon.tech) (free tier available)
2. Create a new project in the Neon dashboard
3. Copy your connection string from the project dashboard
4. Update `backend/.env` with your Neon connection string

For detailed setup instructions, see [docs/neon-postgres-setup.md](docs/neon-postgres-setup.md).

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Backend server runs on `http://localhost:3000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend dev server runs on `http://localhost:5173`

### 5. Access the Application

Open browser: `http://localhost:5173`

1. Create account (signup)
2. Sign in
3. Start managing tasks!

## AI Assistant Usage

The AI-Powered Todo Assistant is integrated into the dashboard and allows you to manage your tasks using natural language.

### How to Use

1. Navigate to the Dashboard page after signing in
2. Locate the AI Chat Assistant panel on the right side of the screen
3. Type your natural language commands in the input box

### Supported Commands

**Task Creation:**
- "Create a task to buy groceries"
- "Add a task to call John tomorrow"
- "Make a task to finish the report with high priority"

**Task Updates:**
- "Mark my meeting task as complete"
- "Set the priority of the grocery task to high"
- "Change the due date of the report to Friday"

**Task Management:**
- "Delete the old task"
- "Show me my high priority tasks"
- "Find tasks about work"

**Contextual References:**
- "Set it to high priority" (referring to the last mentioned task)
- "Mark that task as complete" (using "that task" to reference)
- "Update the previous task" (using "previous task" to reference)

### Safety Features

- **Confirmation Required**: All destructive operations (deletions, marking complete/incomplete) require confirmation
- **Natural Language Validation**: The AI validates your intent before executing operations
- **User Isolation**: Tasks are securely isolated by user account

## API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/signup` - Create new account
- `POST /api/v1/auth/signin` - Sign in
- `POST /api/v1/auth/signout` - Sign out

### Task Endpoints (Require Authentication)

- `GET /api/v1/tasks` - Get all user tasks (supports search, filter, sort)
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks/:id` - Get task by ID
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task
- `PATCH /api/v1/tasks/:id/complete` - Mark complete
- `PATCH /api/v1/tasks/:id/incomplete` - Mark incomplete
- `GET /api/v1/tasks/reminders` - Get tasks with active reminders

### AI Assistant Endpoints (Require Authentication)

- `POST /api/v1/ai/chat` - Process natural language commands for task management
  - **Request Body**: `{ "message": "natural language command", "sessionId": "conversation session id" }`
  - **Response**: AI-processed intent with action plan
  - **Safety**: Confirmation required for destructive operations

### Query Parameters (GET /api/v1/tasks)

- `search=<keyword>` - Search by keyword in title/description
- `completed=<true|false>` - Filter by completion status
- `priority=<low|medium|high>` - Filter by priority
- `tag=<tagname>` - Filter by tag
- `sort=<title|priority|due_date>` - Sort field
- `order=<asc|desc>` - Sort order

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tasks Table
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

## Development

### Backend Commands

```bash
cd backend

npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Run production build
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Check code quality
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
```

### Frontend Commands

```bash
cd frontend

npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests
npm run test:ui      # Run tests with UI
npm run lint         # Check code quality
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
```

## Testing

### Backend Tests

```bash
cd backend
npm test

# Coverage report
npm run test:coverage
```

**Test Types:**
- Unit tests: Services, repositories, utilities
- Integration tests: API endpoints with auth

### Frontend Tests

```bash
cd frontend
npm test

# Coverage report
npm run test:coverage
```

**Test Types:**
- Component tests: React components
- Integration tests: User flows (signup, task creation)

## Security

### Authentication
- Session-based auth with httpOnly cookies
- CSRF protection enabled
- Password hashing via Better Auth
- No plaintext passwords stored

### API Security
- All `/api/v1/tasks/*` endpoints require authentication
- User data isolation enforced at query level
- Input validation on client and server
- ORM parameterized queries (SQL injection prevention)
- Output sanitization (XSS prevention)

### Environment Security
- Secrets in `.env` (never committed)
- `.env.example` templates provided
- `.gitignore` configured

## Performance

### Target Metrics (Phase 2 Constitution)
- ✅ Page load: <2s for 500 tasks
- ✅ Search/filter: <1s for 1000 tasks
- ✅ Task creation: <10s end-to-end
- ✅ API response: <200ms p95
- ✅ Bundle size: <500KB gzipped

### Scale
- 100 concurrent authenticated users
- Up to 10,000 tasks per user
- Pagination/virtual scrolling for large lists

## Accessibility

- ✅ WCAG AA compliance
- ✅ Keyboard navigation support
- ✅ ARIA labels on interactive elements
- ✅ 44x44px minimum touch targets (mobile)
- ✅ Screen reader compatible

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Deployment

### Backend Deployment

1. Set environment variables in hosting platform:
   - `DATABASE_URL` (Neon PostgreSQL connection string)
   - `AUTH_SECRET` (strong random secret)
   - `PORT` (default: 3000)
   - `NODE_ENV=production`

2. Build and start:
   ```bash
   npm run build
   npm start
   ```

### Frontend Deployment

1. Set build-time environment variable:
   - `VITE_API_URL` (backend API URL)

2. Build:
   ```bash
   npm run build
   ```

3. Deploy `dist/` directory to static hosting (Vercel, Netlify, etc.)

## Documentation

- **Specification**: `specs/004-fullstack-todo-web-app/spec.md`
- **Implementation Plan**: `specs/004-fullstack-todo-web-app/plan.md`
- **Task Breakdown**: `specs/004-fullstack-todo-web-app/tasks.md`
- **Constitution**: `.specify/memory/constitution.md`

## Phase 1 (CLI) Reference

Phase 1 CLI application is available in `src/` directory (Python-based). See Phase 1 documentation for CLI usage.

## Contributing

This project follows Phase 2 Constitution v2.0.0 principles:
1. Simplicity and Readability First
2. Clean Code Principles
3. Modularity and Extensibility
4. Security First
5. API-First Design

See `.specify/memory/constitution.md` for complete guidelines.

## License

Copyright © 2025. All rights reserved.

## Support

For issues or questions, please refer to the specification documents in `specs/004-fullstack-todo-web-app/`.
