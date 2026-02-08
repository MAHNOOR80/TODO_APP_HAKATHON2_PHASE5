# Implementation Plan: Phase I In-Memory Python Todo CLI

**Branch**: `001-todo-cli` | **Date**: 2025-12-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-cli/spec.md`

**Note**: This document outlines the architecture and implementation approach for the Phase I Todo CLI application.

## Summary

Build a command-line Todo application in Python 3.13+ that stores tasks in memory with CRUD operations (add, list, update, delete, complete). The application follows strict separation of concerns with three layers: Data Models (Task class), Business Logic (TodoApp manager), and CLI Presentation (interactive menu). All code uses type hints, docstrings, and PEP 8 compliance. No external dependencies—standard library only. Architecture designed for future persistence layers without refactoring core logic.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: None (Python standard library only per constitution)
**Storage**: In-memory list of Task objects (no persistence in Phase I)
**Testing**: No tests in Phase I (architecture designed to be test-ready for future phases)
**Target Platform**: Cross-platform CLI (Windows, macOS, Linux)
**Project Type**: Single project (command-line application)
**Performance Goals**: <100ms response time for all operations, support 1000 tasks without degradation
**Constraints**: No external dependencies, no file I/O, no database, no global mutable state
**Scale/Scope**: Single-user, single-session, ~500 lines of code across 3-4 modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Simplicity and Readability First

- ✅ **PASS**: No complex abstractions—straightforward Task dataclass and TodoApp manager
- ✅ **PASS**: Three clear modules (task.py, todo_app.py, cli.py) with obvious responsibilities
- ✅ **PASS**: No performance optimizations—basic list operations only
- ✅ **PASS**: All logic explicit (no metaclasses, decorators, or magic methods beyond `__str__`)

### Principle II: Clean Code Principles

- ✅ **PASS**: PEP 8 enforced manually (future: add linter in later phases)
- ✅ **PASS**: Function length target <30 lines (enforced by single-responsibility design)
- ✅ **PASS**: Descriptive names (add_task, mark_complete, display_menu, etc.)
- ✅ **PASS**: Each function does one thing (validate → add → store; find → update; etc.)

### Principle III: Modularity and Extensibility

- ✅ **PASS**: No file I/O or database in business logic (TodoApp)
- ✅ **PASS**: Task storage abstracted via TodoApp class (future: swap in-memory list for DB)
- ✅ **PASS**: CLI calls TodoApp methods without data manipulation
- ✅ **PASS**: Dependency flow: CLI → TodoApp → Task (inward dependencies)

### Technical Principles: Language and Runtime

- ✅ **PASS**: Python 3.13+ required
- ✅ **PASS**: Zero external dependencies (standard library only)

### Technical Principles: Type Safety

- ✅ **PASS**: Type hints on all functions, methods, and class attributes
- ✅ **PASS**: Use `from __future__ import annotations` for forward references if needed

### Technical Principles: Documentation

- ✅ **PASS**: Docstrings required for all modules, classes, functions
- ✅ **PASS**: Docstrings explain intent (Google/NumPy style)

### Project Structure (Required)

- ✅ **PASS**: All source under `src/` directory
- ✅ **PASS**: Required files: `src/__main__.py`, `src/task.py`, `src/todo_app.py`, `src/cli.py`
- ✅ **PASS**: Proper imports (no sys.path hacks)
- ✅ **PASS**: Entry point only contains initialization, no business logic

### Architecture Rules: Single Responsibility

- ✅ **PASS**: task.py defines Task dataclass only
- ✅ **PASS**: todo_app.py contains TodoApp with CRUD methods
- ✅ **PASS**: cli.py handles menu, input/output, user interaction

### Architecture Rules: State Management

- ✅ **PASS**: In-memory list of Task objects inside TodoApp instance
- ✅ **PASS**: No global mutable state (all state in TodoApp object)
- ✅ **PASS**: State passed explicitly via TodoApp instance

### Architecture Rules: ID Management

- ✅ **PASS**: Auto-increment IDs starting from 1
- ✅ **PASS**: IDs never reused (tracked by incrementing counter, not list indices)

### CLI Behavior Requirements

- ✅ **PASS**: Interactive menu loop with 6 commands (add, list, update, delete, complete, quit)
- ✅ **PASS**: User-friendly prompts
- ✅ **PASS**: Graceful invalid input handling

### Error Handling Rules

- ✅ **PASS**: Helpful error messages (no stack traces exposed)
- ✅ **PASS**: Validation in TodoApp (business logic layer), not CLI

### Testing Readiness

- ✅ **PASS**: Business logic decoupled from CLI (TodoApp testable without I/O)
- ✅ **PASS**: Functions accept parameters (no tight input() coupling in TodoApp)

### Documentation Requirements

- ✅ **PASS**: README.md with setup (uv), run instructions, commands reference

**Constitution Check Result**: ✅ **ALL GATES PASSED** — No violations, no complexity justifications needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-cli/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (decisions on architecture patterns)
├── data-model.md        # Phase 1 output (Task entity specification)
├── quickstart.md        # Phase 1 output (developer setup guide)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
src/
├── __main__.py          # Entry point: imports CLI, instantiates TodoApp, runs loop
├── task.py              # Task dataclass with id, title, description, completed
├── todo_app.py          # TodoApp manager with add, list, update, delete, complete
└── cli.py               # CLI menu loop, input handling, output formatting

README.md                # Setup and usage instructions
.gitignore               # Python-specific ignores (__pycache__, *.pyc, .venv)
```

**Structure Decision**: Single project layout per constitution requirement. All source code lives in `src/` with clear separation: Data Model → Business Logic → Presentation. No `tests/` directory in Phase I (future phases will add testing). Entry point (`__main__.py`) makes `src` runnable as a module (`python -m src`).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations detected.** All constitution principles satisfied without complexity trade-offs.

---

## Phase 0: Research & Architectural Decisions

**Objective**: Resolve technical unknowns and establish architecture patterns.

### Research Tasks

Since this is a straightforward CLI application with well-defined requirements and no external dependencies, most architectural decisions are dictated by the constitution. The following research consolidates standard Python best practices for the chosen architecture:

1. **Task Data Model Pattern**
   - **Decision**: Use `@dataclass` from Python standard library
   - **Rationale**: Dataclasses provide automatic `__init__`, `__repr__`, and type safety without boilerplate. Constitution requires type hints everywhere—dataclasses enforce this naturally.
   - **Alternatives Considered**:
     - Plain class with manual `__init__`: More boilerplate, no advantage
     - NamedTuple: Immutable, but tasks need mutable `completed` status
     - Dict: No type safety, violates constitution's type hint requirement

2. **ID Auto-Increment Strategy**
   - **Decision**: TodoApp maintains `_next_id: int` counter, increments on add
   - **Rationale**: Simple, predictable, supports "never reuse IDs" requirement. Independent of list indices (survives deletions).
   - **Alternatives Considered**:
     - UUID: Overkill for Phase I, not user-friendly (long IDs)
     - List index: Breaks on deletion (IDs would shift)
     - Timestamp-based: Non-sequential, confusing UX

3. **Error Handling Pattern**
   - **Decision**: TodoApp methods return `tuple[bool, str]` (success flag, message)
   - **Rationale**: Allows CLI to display helpful messages without TodoApp needing to know about I/O. Keeps business logic decoupled from presentation.
   - **Alternatives Considered**:
     - Exceptions: Requires CLI to catch/handle, mixes concerns
     - Logging: Requires external dependency or complex setup
     - Direct print: Couples business logic to I/O (violates constitution)

4. **CLI Input Parsing**
   - **Decision**: Split input on whitespace, match first token to command name
   - **Rationale**: Simple, no regex needed, aligns with `update <id>` syntax
   - **Alternatives Considered**:
     - argparse module: Too complex for interactive menu (designed for sys.argv)
     - cmd module: Overkill, adds learning curve
     - Manual parsing: Chosen approach (simplest)

5. **Task List Display Format**
   - **Decision**: Format string template: `{id}. [{status}] {title}`
   - **Rationale**: Readable, aligns with spec's `[x]`/`[ ]` requirement
   - **Alternatives Considered**:
     - Tabular format (align columns): Requires calculating max widths, more complex
     - JSON output: Not user-friendly for interactive CLI

### Architecture Diagram (Dependency Flow)

```
┌─────────────────┐
│   __main__.py   │  Entry point: instantiate TodoApp, run CLI loop
└────────┬────────┘
         │ imports
         ▼
┌─────────────────┐
│     cli.py      │  Presentation Layer: menu, input, output formatting
└────────┬────────┘
         │ calls methods
         ▼
┌─────────────────┐
│  todo_app.py    │  Business Logic: CRUD operations, validation, state
│   (TodoApp)     │
└────────┬────────┘
         │ manages list of
         ▼
┌─────────────────┐
│    task.py      │  Data Model: Task dataclass
│     (Task)      │
└─────────────────┘
```

**Key Principle**: Dependencies flow inward (outer layers depend on inner layers, never reverse). CLI knows about TodoApp, TodoApp knows about Task, but Task/TodoApp don't know about CLI.

---

## Phase 1: Design & Contracts

### Data Model (`data-model.md`)

**Entity: Task**

| Attribute   | Type   | Required | Default | Validation Rules                          |
|-------------|--------|----------|---------|-------------------------------------------|
| id          | int    | Yes      | N/A     | Auto-assigned by TodoApp, must be > 0     |
| title       | str    | Yes      | N/A     | Non-empty string (checked before creation)|
| description | str    | No       | ""      | Any string (empty allowed)                |
| completed   | bool   | Yes      | False   | Boolean only (True or False)              |

**Relationships**: None (flat structure, no task dependencies in Phase I)

**State Transitions**:
- **Created** → `completed=False` (default state)
- **Mark Complete** → `completed=True` (one-way in Phase I, no "uncomplete")
- **Update** → `title`/`description` mutable, `id`/`completed` immutable via update operation
- **Delete** → Removed from list (no soft-delete)

**Invariants**:
- `id` is unique across all tasks in the session
- `id` is never reused (even after deletion)
- `title` is never empty (validated at creation and update)

### API Contracts (`contracts/`)

Since this is a CLI application (not a web API), "contracts" are the public methods of `TodoApp`. These are the operations exposed to the CLI layer:

**File: `contracts/todo_app_interface.md`**

```markdown
# TodoApp Public Interface Contract

## Class: TodoApp

### Method: add_task(title: str, description: str = "") -> tuple[bool, str]

**Purpose**: Create a new task with auto-incremented ID.

**Parameters**:
- `title` (str, required): Task title, must be non-empty
- `description` (str, optional): Task details, defaults to empty string

**Returns**: `tuple[bool, str]`
- `(True, "Task #{id} added successfully")` on success
- `(False, "Title is required")` if title is empty

**Side Effects**: Increments internal ID counter, appends Task to internal list.

**Error Cases**:
- Empty title → returns `(False, "Title is required")`

---

### Method: list_tasks() -> list[str]

**Purpose**: Get formatted list of all tasks for display.

**Parameters**: None

**Returns**: `list[str]` where each string is formatted as:
- `"{id}. [{status}] {title}"` where status is "x" if completed, " " otherwise
- Empty list if no tasks exist

**Side Effects**: None (read-only operation)

**Error Cases**: None (always succeeds, returns empty list if no tasks)

---

### Method: get_task(task_id: int) -> tuple[bool, str, Task | None]

**Purpose**: Retrieve a specific task by ID.

**Parameters**:
- `task_id` (int, required): The task ID to find

**Returns**: `tuple[bool, str, Task | None]`
- `(True, "", task)` if found
- `(False, "Task #{task_id} not found", None)` if not found

**Side Effects**: None (read-only operation)

**Error Cases**:
- Task ID not found → returns `(False, "Task #X not found", None)`

---

### Method: update_task(task_id: int, title: str | None = None, description: str | None = None) -> tuple[bool, str]

**Purpose**: Update task title and/or description.

**Parameters**:
- `task_id` (int, required): Task ID to update
- `title` (str | None, optional): New title (if provided, must be non-empty)
- `description` (str | None, optional): New description

**Returns**: `tuple[bool, str]`
- `(True, "Task #{id} updated")` on success
- `(False, "Task #{id} not found")` if task doesn't exist
- `(False, "Title cannot be empty")` if title provided but empty

**Side Effects**: Modifies task object in internal list.

**Error Cases**:
- Task not found → `(False, "Task #X not found")`
- Empty title → `(False, "Title cannot be empty")`
- No title or description provided → `(False, "No changes specified")`

---

### Method: delete_task(task_id: int) -> tuple[bool, str]

**Purpose**: Remove a task from the list.

**Parameters**:
- `task_id` (int, required): Task ID to delete

**Returns**: `tuple[bool, str]`
- `(True, "Task #{id} deleted")` on success
- `(False, "Task #{id} not found")` if task doesn't exist

**Side Effects**: Removes task from internal list. ID is never reused.

**Error Cases**:
- Task not found → `(False, "Task #X not found")`

---

### Method: mark_complete(task_id: int) -> tuple[bool, str]

**Purpose**: Set task's completed status to True.

**Parameters**:
- `task_id` (int, required): Task ID to mark complete

**Returns**: `tuple[bool, str]`
- `(True, "Task #{id} marked complete")` if task was incomplete
- `(True, "Task #{id} already complete")` if already complete (idempotent)
- `(False, "Task #{id} not found")` if task doesn't exist

**Side Effects**: Sets `task.completed = True` in internal list.

**Error Cases**:
- Task not found → `(False, "Task #X not found")`
```

### Quickstart Guide (`quickstart.md`)

**File: `specs/001-todo-cli/quickstart.md`**

```markdown
# Developer Quickstart: Phase I Todo CLI

## Prerequisites

- Python 3.13 or higher
- `uv` package manager (recommended) or `pip`

## Initial Setup

1. **Clone the repository** (or navigate to project directory):
   ```bash
   cd /path/to/TODO
   ```

2. **Create virtual environment**:
   ```bash
   # Using uv (recommended)
   uv venv

   # Or using standard Python
   python3.13 -m venv .venv
   ```

3. **Activate virtual environment**:
   ```bash
   # Windows
   .venv\Scripts\activate

   # macOS/Linux
   source .venv/bin/activate
   ```

4. **Verify Python version**:
   ```bash
   python --version
   # Should show Python 3.13.x or higher
   ```

## Running the Application

**Run as a module**:
```bash
python -m src
```

**Expected Output**:
```
=== Todo CLI ===
Commands: add, list, update <id>, delete <id>, complete <id>, quit

>
```

## Development Workflow

### 1. Code Organization

- **Data Model**: Edit `src/task.py` for Task dataclass changes
- **Business Logic**: Edit `src/todo_app.py` for CRUD operations
- **CLI Interface**: Edit `src/cli.py` for menu/display changes
- **Entry Point**: Edit `src/__main__.py` only for initialization

### 2. Code Quality Checklist

Before committing changes:

- [ ] Run type checker: `python -m mypy src/` (install mypy in future phase)
- [ ] Verify PEP 8: Read code aloud—if confusing, refactor
- [ ] Check docstrings: Every public function/class has docstring
- [ ] Test manually: Run through all commands (add, list, update, delete, complete, quit)

### 3. Common Tasks

**Add a new command**:
1. Add method to `TodoApp` in `todo_app.py`
2. Add command handler in CLI loop in `cli.py`
3. Update help text in `cli.py`
4. Update README.md command reference

**Modify Task attributes**:
1. Update `Task` dataclass in `task.py`
2. Update `TodoApp` methods that reference the attribute
3. Update display formatting in `cli.py`
4. Update `data-model.md` specification

## Architecture Reminders

- **No global state**: All state in `TodoApp` instance
- **Dependency flow**: CLI → TodoApp → Task (never reverse)
- **Error handling**: TodoApp returns `(bool, str)`, CLI displays messages
- **Type hints**: Required on all functions (use `from __future__ import annotations`)

## Troubleshooting

**"Module not found" errors**:
- Ensure virtual environment is activated
- Run from repository root (not inside `src/`)

**Type hint errors**:
- Add `from __future__ import annotations` at top of file
- Use `str | None` not `Optional[str]` (Python 3.13 syntax)

**ID reuse bugs**:
- Never use list index as task ID
- Always use `TodoApp._next_id` counter

## Next Steps for Future Phases

- **Phase II**: Add file persistence (JSON/SQLite)
- **Phase III**: Add unit tests (pytest)
- **Phase IV**: Add linting/formatting (ruff, black)
```

---

## Phase 2: Pre-Implementation Summary

**Deliverables Created**:
1. ✅ `plan.md` — This file (architecture, constitution check, structure)
2. ✅ `research.md` — Architectural decisions (dataclass, ID strategy, error handling)
3. ✅ `data-model.md` — Task entity specification (inline above)
4. ✅ `contracts/todo_app_interface.md` — Public API contract
5. ✅ `quickstart.md` — Developer setup guide

**Constitution Re-Check (Post-Design)**:
All gates still **PASS**. Design preserves constitution compliance:
- ✅ Simplicity: Dataclass + list operations
- ✅ Clean Code: Clear method names, <30 lines per function
- ✅ Modularity: Three-layer architecture, no persistence coupling
- ✅ Type Safety: All methods have type hints
- ✅ Documentation: Docstrings planned for all public APIs

**Readiness for `/sp.tasks`**:
✅ **READY** — Architecture finalized, contracts defined, structure clear. Next step: Generate task breakdown with `/sp.tasks`.

**Branch**: `001-todo-cli`
**Key Files**:
- Spec: `specs/001-todo-cli/spec.md`
- Plan: `specs/001-todo-cli/plan.md` (this file)
- Contracts: `specs/001-todo-cli/contracts/todo_app_interface.md`
- Quickstart: `specs/001-todo-cli/quickstart.md`

**Estimated Implementation Effort**: 4-6 hours for an experienced Python developer (constitution compliance adds review overhead but ensures maintainability).
