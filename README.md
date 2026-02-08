# Full-Stack Todo Web Application - Phase 5

A production-grade, full-stack todo application with authentication, AI-powered task management, autonomous agents, and advanced cloud-native deployment on DigitalOcean Kubernetes (DOKS) with event-driven architecture. This is Phase 5 of the Todo Application project, evolving from a CLI tool into a distributed, event-driven cloud system.

## Overview

This application enables authenticated users to manage tasks through a responsive web UI and an AI conversational assistant, backed by autonomous agents that provide proactive suggestions. The system is deployed on Kubernetes with Kafka-based event-driven decoupling via Dapr sidecars.

### Evolution

| Phase | Focus | Stack |
|-------|-------|-------|
| Phase 1 | CLI Task Manager | Python, in-memory storage |
| Phase 2 | Full-Stack Web App | TypeScript, React, Express, PostgreSQL, Better Auth |
| Phase 3 | AI Assistant + Premium Homepage | OpenAI-powered chatbot, animated landing page |
| Phase 4 | Cloud-Native Deployment | Docker, Kubernetes (Minikube), Helm, autonomous AI agents |
| **Phase 5** | **Advanced Cloud + Event-Driven** | **DOKS, Kafka, Dapr sidecars, reactive AI agents** |

## Features

### Core Task Management (Phase 1-2)

- User authentication (signup, signin, signout) with session-based auth
- Full CRUD: create, read, update, delete tasks
- Mark tasks as complete/incomplete
- Priority levels (High/Medium/Low)
- Tags and categories for organization
- Search by keyword, filter by status/priority/tag, sort by title/priority/due date
- Due dates with overdue indicators
- Recurring tasks (daily/weekly/monthly)
- Task reminders with browser notifications

### Premium Homepage (Phase 3)

- Animated hero section with clear value proposition
- Feature showcase cards with hover effects
- Responsive navigation bar with smooth scroll
- Mobile-first responsive design
- CTA buttons for sign-up/sign-in conversion
- Micro-interactions and engaging animations

### AI-Powered Todo Assistant (Phase 3)

- Natural language task management ("Create a task to buy groceries tomorrow")
- Intent recognition for create, update, delete, and status change operations
- Context-aware multi-turn conversations
- Safety flows with confirmation for destructive operations
- Full feature parity with traditional UI through conversational interface

### Autonomous AI Agents (Phase 4)

- Proactive task suggestions (overdue reminders, prioritization recommendations)
- Background agent service with scheduled analysis
- Suggestions panel in the dashboard
- User-configurable suggestion preferences

### Cloud-Native Infrastructure (Phase 4)

- Docker containerization for all services (backend, frontend, ai-agent)
- Kubernetes deployment with Helm charts
- Health checks (liveness/readiness probes) on all services
- Structured JSON logging with request correlation IDs
- Horizontal Pod Autoscaling (HPA)
- Local development with Minikube

### Advanced Cloud Deployment (Phase 5)

- DigitalOcean Kubernetes (DOKS) deployment with parameterized Helm values
- Dapr sidecar injection on all services for service mesh capabilities
- Kafka-backed event-driven architecture via Dapr pub/sub
- Task lifecycle events (`tasks.created`, `tasks.updated`, `tasks.deleted`, `tasks.completed`, `tasks.incomplete`)
- Reactive AI agents subscribing to Kafka events for near-real-time suggestions
- NGINX Ingress Controller for public access with path-based routing
- Kubernetes Secrets management (no secrets in ConfigMaps or pod specs)
- Dapr resiliency policies for fault-tolerant event publishing
- Idempotent event processing with at-least-once delivery guarantees

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

**AI Agent:**
- Language: TypeScript
- Runtime: Node.js 20+
- AI Provider: OpenAI API
- ORM: Prisma (shared schema)
- Background Processing: Scheduled intervals + event-driven (Dapr pub/sub)

**Infrastructure:**
- Containerization: Docker (multi-stage builds)
- Orchestration: Kubernetes (DOKS / Minikube)
- Package Manager: Helm 3
- Service Mesh: Dapr sidecars
- Event Streaming: Kafka (DigitalOcean Managed / local)
- Ingress: NGINX Ingress Controller
- Secrets: Kubernetes Secrets
- CI/CD: Docker Compose (dev), Helm (prod)

### Project Structure

```
TODO_APP_PHASE5/
├── backend/               # REST API Server
│   ├── src/
│   │   ├── config/        # Database, auth config
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── routes/         # API endpoints (auth, tasks, AI chat)
│   │   ├── services/       # Business logic + event publishing
│   │   ├── repositories/   # Database access
│   │   ├── models/         # TypeScript interfaces
│   │   ├── validators/     # Input validation schemas
│   │   ├── utils/          # Helper functions
│   │   └── index.ts        # Server entry point
│   ├── Dockerfile          # Multi-stage container build
│   ├── .env.example        # Environment variables template
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/              # Web UI
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── containers/     # Data-fetching containers
│   │   ├── pages/          # HomePage, DashboardPage, Signin, Signup
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client
│   │   ├── types/          # TypeScript types
│   │   ├── context/        # React Context providers
│   │   ├── utils/          # Helper functions
│   │   └── App.tsx         # Root component
│   ├── Dockerfile          # Multi-stage container build
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── ai-agent/              # Autonomous AI Agent Service
│   ├── src/                # Agent logic, schedulers, event subscribers
│   ├── prisma/             # Shared database schema
│   ├── Dockerfile          # Container build
│   ├── package.json
│   └── tsconfig.json
│
├── k8s/                   # Kubernetes Configuration
│   ├── helm/
│   │   └── todo-app/       # Helm chart
│   │       ├── Chart.yaml
│   │       ├── values.yaml          # Default values (Minikube)
│   │       ├── values-doks.yaml     # DOKS-specific overrides
│   │       └── templates/           # K8s manifest templates
│   ├── dapr/
│   │   ├── pubsub-kafka.yaml        # Dapr Kafka pub/sub component
│   │   └── resiliency.yaml          # Dapr resiliency policies
│   └── secrets/
│       ├── secrets.yaml.example     # Secret template
│       └── secrets.yaml             # Actual secrets (gitignored)
│
├── scripts/               # Deployment scripts
│   ├── deploy-minikube.sh           # Local Minikube deployment
│   ├── deploy-minikube.ps1          # PowerShell variant
│   └── phase4_deploy.sh             # Phase 4 deployment script
│
├── docker-compose.yaml    # Local multi-service orchestration
├── docker-compose.override.yaml  # Development overrides
│
├── specs/                 # Feature Specifications
│   ├── 001-todo-cli/
│   ├── 002-intermediate-level/
│   ├── 003-advanced-level/
│   ├── 004-fullstack-todo-web-app/
│   ├── 005-premium-homepage/
│   ├── 006-ai-todo-assistant/
│   ├── 007-cloud-native-k8s-deployment/
│   └── 008-phase5-advanced-cloud-deployment/
│
├── src/                   # Phase 1 CLI (Python, legacy)
├── docs/                  # Additional documentation
└── history/               # Prompt history records & ADRs
```

### Layered Architecture

**Backend (4 Layers):**
1. **HTTP Layer**: Route handlers, request/response formatting
2. **Middleware Layer**: Authentication, validation, error handling
3. **Business Logic Layer**: Services for task operations, recurrence, reminders, event publishing
4. **Data Access Layer**: Repositories with ORM queries, user isolation

**Frontend (Container/Presentational Pattern):**
- **Container Components**: Data fetching + state management
- **Presentational Components**: Props + rendering only
- **Separation**: UI decoupled from business logic and API calls

**Event-Driven Layer (Phase 5):**
- Task lifecycle operations publish events to Kafka via Dapr pub/sub
- AI agents subscribe to events for near-real-time reactive suggestions
- Dapr sidecars handle event routing, retries, and resiliency
- At-least-once delivery with idempotent processing

## Requirements

- Node.js 20+ LTS
- npm or pnpm
- Docker Desktop (for containerized deployment)
- Neon PostgreSQL database (free tier at [neon.tech](https://neon.tech))

**For Kubernetes deployment (Phase 4+):**
- Minikube (local) or DOKS cluster (production)
- kubectl
- Helm 3+
- Dapr CLI (Phase 5)

## Setup

### Option 1: Local Development

#### 1. Neon PostgreSQL Setup

1. Sign up at [neon.tech](https://neon.tech) (free tier available)
2. Create a new project in the Neon dashboard
3. Copy your connection string
4. Update `backend/.env` with your Neon connection string

For detailed setup instructions, see [docs/neon-postgres-setup.md](docs/neon-postgres-setup.md).

#### 2. Backend Setup

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

Backend server runs on `http://localhost:4000`

#### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server runs on `http://localhost:5173`

#### 4. AI Agent Setup

```bash
cd ai-agent
npm install
npm run dev
```

AI Agent runs on `http://localhost:5000`

### Option 2: Docker Compose

```bash
# Start all services
docker-compose up --build

# Services:
#   Frontend:  http://localhost:3000
#   Backend:   http://localhost:4000
#   AI Agent:  http://localhost:5000
#   Database:  localhost:5432
```

### Option 3: Kubernetes (Minikube)

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full Helm-based Kubernetes deployment guide.

```bash
# Quick start
minikube start --cpus=4 --memory=8192 --driver=docker
minikube addons enable ingress
minikube addons enable metrics-server

# Deploy with Helm
helm upgrade --install todo-app ./k8s/helm/todo-app
```

### Option 4: DOKS (Phase 5 Production)

```bash
# Configure DOKS kubeconfig
doctl kubernetes cluster kubeconfig save <cluster-name>

# Install Dapr
dapr init -k

# Apply Dapr components
kubectl apply -f k8s/dapr/pubsub-kafka.yaml
kubectl apply -f k8s/dapr/resiliency.yaml

# Apply secrets
kubectl apply -f k8s/secrets/secrets.yaml

# Deploy with DOKS values
helm upgrade --install todo-app ./k8s/helm/todo-app -f k8s/helm/todo-app/values-doks.yaml
```

## AI Assistant Usage

The AI-Powered Todo Assistant is integrated into the dashboard and allows you to manage your tasks using natural language.

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
- "Mark that task as complete"
- "Update the previous task"

### Safety Features

- Confirmation required for all destructive operations
- Natural language validation before execution
- User data isolation enforced

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

- `POST /api/v1/ai/chat` - Process natural language commands
  - **Request**: `{ "message": "...", "sessionId": "..." }`
  - **Response**: AI-processed intent with action plan
  - Confirmation required for destructive operations

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

### Docker Commands

```bash
docker-compose up --build          # Build and start all services
docker-compose down                # Stop all services
docker-compose logs -f backend     # Follow backend logs
docker-compose logs -f ai-agent    # Follow AI agent logs
```

## Testing

### Backend Tests

```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm test
npm run test:coverage
```

## Security

### Authentication
- Session-based auth with httpOnly cookies
- CSRF protection enabled
- Password hashing via Better Auth

### API Security
- All `/api/v1/tasks/*` endpoints require authentication
- User data isolation enforced at query level
- Input validation on client and server
- ORM parameterized queries (SQL injection prevention)
- Output sanitization (XSS prevention)

### Infrastructure Security
- Kubernetes Secrets for all sensitive values (DATABASE_URL, AUTH_SECRET, OPENAI_API_KEY, kafka-creds)
- No secrets exposed in ConfigMaps or pod environment listings
- `.env` files never committed
- TLS support via NGINX Ingress

## Performance

### Target Metrics
- Page load: <2s for 500 tasks
- Search/filter: <1s for 1000 tasks
- Task creation: <10s end-to-end
- API response: <200ms p95
- Bundle size: <500KB gzipped

### Scale
- Horizontal Pod Autoscaling for backend and frontend
- 100+ concurrent authenticated users
- Up to 10,000 tasks per user
- Replica counts: >=2 backend, >=2 frontend, >=1 ai-agent (DOKS)

## Accessibility

- WCAG AA compliance
- Keyboard navigation support
- ARIA labels on interactive elements
- 44x44px minimum touch targets (mobile)
- Screen reader compatible

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Documentation

- **Specifications**: `specs/` directory (001 through 008)
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Deployment Config**: [DEPLOYMENT_CONFIG.md](DEPLOYMENT_CONFIG.md)
- **Constitution**: `.specify/memory/constitution.md`
- **Neon Setup**: [docs/neon-postgres-setup.md](docs/neon-postgres-setup.md)

## Contributing

This project follows the Phase 5 Constitution v5.0.0 principles:
1. Simplicity and Readability First
2. Clean Code Principles
3. Modularity and Extensibility
4. Security First
5. API-First Design
6. Event-Driven Decoupling
7. Spec-Driven Development

See `.specify/memory/constitution.md` for complete guidelines.

## License

Copyright 2025-2026. All rights reserved.
