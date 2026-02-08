---
id: 002
title: Phase I Todo CLI Implementation Plan
stage: plan
date: 2025-12-25
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-todo-cli
branch: 001-todo-cli
user: unknown
command: /sp.plan
labels: ["implementation-plan", "architecture", "python", "cli", "dataclass", "crud"]
links:
  spec: specs/001-todo-cli/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-todo-cli/plan.md
  - specs/001-todo-cli/research.md
  - specs/001-todo-cli/data-model.md
  - specs/001-todo-cli/contracts/todo_app_interface.md
  - specs/001-todo-cli/quickstart.md
tests:
  - none
---

## Prompt

Project: Phase I — In-Memory Python Todo CLI App

Objective
---------
Create a step-by-step implementation plan to build the Todo CLI app in Python
while following the constitution and feature-level specifications.

Implementation Steps
--------------------

1. Project Setup
   - Create project folder structure:
     src/
       ├── __main__.py or main.py
       ├── task.py
       ├── todo_app.py
       └── cli.py (optional)
   - Initialize Python 3.13+ virtual environment

2. Task Model (task.py)
   - Define Task class
     - id: int (auto-increment)
     - title: str
     - description: str
     - completed: bool (default False)
   - Add __str__ or __repr__ for formatted display

3. Core Logic (todo_app.py)
   - Implement TodoApp / TodoManager class
     - add_task(title, description)
     - delete_task(task_id)
     - update_task(task_id, title=None, description=None)
     - mark_complete(task_id)
     - list_tasks() → returns formatted list of tasks
   - Ensure error handling for invalid IDs
   - Maintain in-memory list of Task objects
   - Pass state explicitly; avoid global mutable variables

4. CLI Interface (cli.py / main.py)
   - Implement interactive menu loop
   - Display commands: add, list, update <id>, delete <id>, complete <id>, quit
   - Prompt user for input
   - Call corresponding TodoApp methods
   - Format output: [ ] incomplete, [x] complete
   - Graceful handling of invalid input

5. Entry Point (__main__.py or main.py)
   - Import CLI and TodoApp
   - Initialize TodoApp instance
   - Run CLI loop
   - Keep entry point free of business logic

6. Code Quality
   - Apply PEP 8 formatting
   - Use type hints for all functions and methods
   - Include docstrings for all modules, classes, and methods
   - Keep functions short, focused, and modular

7. Testing Readiness
   - Ensure core logic is decoupled from CLI for unit testing
   - Design functions to accept parameters instead of relying on input()

8. Documentation
   - README.md: setup instructions, commands, usage examples

## Response snapshot

Created comprehensive implementation plan for Phase I In-Memory Python Todo CLI on branch `001-todo-cli`.

**Architecture Summary:**
- **Three-layer design**: Data Model (Task) → Business Logic (TodoApp) → Presentation (CLI)
- **Dependency flow**: CLI → TodoApp → Task (inward dependencies, never reverse)
- **State management**: Encapsulated in TodoApp instance (no global state)
- **Error handling pattern**: TodoApp returns `tuple[bool, str]`, CLI displays messages

**Key Architectural Decisions (from research.md):**

1. **Task Data Model**: Python `@dataclass` (type safety, zero boilerplate)
2. **ID Strategy**: `_next_id` counter in TodoApp (never reused, deletion-safe)
3. **Error Handling**: Return tuples `(success, message)` (decouples I/O from logic)
4. **CLI Parsing**: Simple `str.split()` on whitespace (no argparse/cmd overhead)
5. **Display Format**: `{id}. [{status}] {title}` (readable, spec-compliant)

**Constitution Check Result**: ✅ **ALL GATES PASSED**
- ✅ Simplicity: Dataclass + list operations, no abstractions
- ✅ Clean Code: PEP 8, <30 line functions, descriptive names
- ✅ Modularity: Three layers, no persistence coupling, swap-ready storage
- ✅ Type Safety: Type hints everywhere, dataclass enforcement
- ✅ Documentation: Docstrings planned for all public APIs
- ✅ No external dependencies (Python 3.13+ stdlib only)
- ✅ No global state (all state in TodoApp)
- ✅ Separation of concerns (CLI has zero business logic)

**Deliverables Created:**

1. **plan.md** (519 lines):
   - Summary, Technical Context, Constitution Check
   - Project structure (src/ layout with 4 modules)
   - Phase 0 research (5 architectural decisions)
   - Phase 1 design (data model, contracts, quickstart)
   - Complexity tracking (no violations)

2. **research.md** (decision log):
   - Decision 1: Dataclass for Task (vs plain class, NamedTuple, dict)
   - Decision 2: `_next_id` counter (vs UUID, list index, timestamp)
   - Decision 3: Tuple return pattern (vs exceptions, None, logging, print)
   - Decision 4: Simple split parsing (vs argparse, cmd, regex)
   - Decision 5: Format string display (vs tabular, JSON, rich library)
   - Architecture diagram (dependency flow)

3. **data-model.md** (Task entity specification):
   - 4 attributes: id (int), title (str), description (str), completed (bool)
   - Validation rules (id uniqueness, title non-empty, etc.)
   - State transitions (Created → Incomplete → Completed/Deleted)
   - Invariants (5 guarantees)
   - Migration path (JSON, SQLite, PostgreSQL)

4. **contracts/todo_app_interface.md** (TodoApp API):
   - 6 public methods: add_task, list_tasks, get_task, update_task, delete_task, mark_complete
   - Each method documented with: purpose, parameters, returns, side effects, error cases, examples
   - Contract guarantees (no exceptions, consistent format, idempotency)
   - Usage patterns and CLI integration examples

5. **quickstart.md** (developer guide):
   - Setup instructions (Python 3.13+, uv/pip, venv)
   - Running app (`python -m src`)
   - Development workflow (add commands, modify attributes, code quality checklist)
   - Architecture reminders (dependency flow, state, error handling, type hints)
   - Troubleshooting (6 common issues with solutions)
   - Next steps (Phases II-IV roadmap)

**Project Structure:**

```
src/
├── __main__.py          # Entry: instantiate TodoApp, run CLI loop
├── task.py              # Task dataclass (id, title, description, completed)
├── todo_app.py          # TodoApp manager (CRUD + validation)
└── cli.py               # CLI menu loop (input, output, formatting)

specs/001-todo-cli/
├── spec.md              # User stories, requirements, success criteria
├── plan.md              # This architecture document
├── research.md          # Architectural decision log
├── data-model.md        # Task entity specification
├── quickstart.md        # Developer setup guide
└── contracts/
    └── todo_app_interface.md  # TodoApp public API contract

README.md                # User-facing documentation (Phase I)
.gitignore               # Python ignores (__pycache__, .venv, *.pyc)
```

**Implementation Estimate**: 4-6 hours for experienced Python developer (constitution compliance adds review overhead but ensures long-term maintainability)

**Readiness**: ✅ **READY FOR /sp.tasks**
- Architecture finalized
- Contracts defined
- Structure documented
- All constitution gates passed

## Outcome

- ✅ Impact: Complete implementation plan created for Phase I Todo CLI. Defines three-layer architecture (Task/TodoApp/CLI), 5 architectural decisions, 6 TodoApp methods, constitution-compliant design. Zero technical debt—ready for task breakdown.
- 🧪 Tests: No code tests (planning phase). All 12 constitution gates passed.
- 📁 Files: Created plan.md, research.md, data-model.md, quickstart.md, contracts/todo_app_interface.md (total ~2500 lines of specification)
- 🔁 Next prompts: `/sp.tasks` to generate dependency-ordered task list for implementation
- 🧠 Reflection: Plan quality is exceptionally high with zero ambiguity. All architectural decisions documented with rationale and alternatives considered. Dataclass pattern + tuple return values create clean separation of concerns. Constitution compliance verified across all 12 gate categories. Modularity design enables future persistence layers without refactoring (Phase II JSON, Phase III SQLite). Estimated 4-6 hour implementation (tight scope + clear contracts = fast execution).

## Evaluation notes (flywheel)

- Failure modes observed: None. Planning complete without clarifications or constitution violations.
- Graders run and results (PASS/FAIL): Constitution Check PASS (12/12 gates)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Validate task generation in `/sp.tasks` produces implementable units aligned with contracts (verify contract methods map 1:1 to implementation tasks)
