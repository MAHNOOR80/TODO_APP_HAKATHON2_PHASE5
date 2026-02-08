# Research & Architectural Decisions: Phase I Todo CLI

**Date**: 2025-12-25
**Feature**: 001-todo-cli
**Phase**: 0 (Research)

## Overview

This document consolidates architectural decisions for the Phase I In-Memory Python Todo CLI application. Since requirements are well-defined by the constitution and no external dependencies are allowed, most decisions are driven by Python standard library best practices and simplicity principles.

## Decision 1: Task Data Model Pattern

**Question**: How should we represent the Task entity in Python?

**Decision**: Use `@dataclass` from Python standard library

**Rationale**:
- Dataclasses provide automatic `__init__`, `__repr__`, `__eq__` without boilerplate
- Type hints are built-in and enforced (constitution requirement)
- Mutable by default (needed for `completed` status changes)
- Part of standard library (no external dependencies)
- Clear, readable syntax familiar to Python developers

**Alternatives Considered**:

| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| Plain class with manual `__init__` | Full control | Verbose boilerplate, error-prone | Violates simplicity principle—dataclass eliminates boilerplate |
| `NamedTuple` | Immutable, concise | Immutability blocks status updates | Tasks need mutable `completed` field—would require recreating task objects |
| Dictionary | Flexible, no class needed | No type safety, error-prone | Violates type hint requirement, makes IDE support impossible |
| `attrs` library | Feature-rich dataclass alternative | External dependency | Constitution forbids external dependencies in Phase I |

**Implementation**:
```python
from dataclasses import dataclass

@dataclass
class Task:
    id: int
    title: str
    description: str = ""
    completed: bool = False
```

---

## Decision 2: ID Auto-Increment Strategy

**Question**: How should we generate unique, never-reused task IDs?

**Decision**: TodoApp maintains `_next_id: int` counter, increments on task creation

**Rationale**:
- Simple: Single integer, increment by 1
- Predictable: Users see sequential IDs (1, 2, 3, ...)
- Constitution-compliant: IDs never reused (counter only increments, never decrements)
- Deletion-safe: Independent of list indices (survives task deletions)
- Efficient: O(1) ID generation

**Alternatives Considered**:

| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| UUID (uuid4) | Globally unique | Long, non-human-friendly (36 chars) | Overkill for single-session app—bad UX ("Task #a3f2b8...") |
| List index as ID | Zero implementation overhead | Breaks on deletion (IDs shift) | Violates "never reuse IDs" requirement—deleting task 2 makes task 3 become ID 2 |
| Timestamp-based | Sortable by creation time | Non-sequential, collision risk | Confusing UX (IDs like 1703512345), not guaranteed unique |
| Max ID + 1 | Handles gaps from deletion | O(n) computation on each add | Inefficient—linear scan to find max ID on every creation |

**Implementation**:
```python
class TodoApp:
    def __init__(self):
        self._tasks: list[Task] = []
        self._next_id: int = 1

    def add_task(self, title: str, description: str = "") -> tuple[bool, str]:
        task_id = self._next_id
        self._next_id += 1  # Increment—never reuse
        # ... create task with task_id
```

---

## Decision 3: Error Handling Pattern

**Question**: How should TodoApp communicate success/failure to the CLI without coupling to I/O?

**Decision**: Methods return `tuple[bool, str]` (success flag, user-facing message)

**Rationale**:
- Decouples business logic from presentation (TodoApp doesn't know about CLI)
- CLI receives both status (for control flow) and message (for display)
- Simple pattern—no exception handling needed
- Aligns with constitution's separation of concerns

**Alternatives Considered**:

| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| Raise exceptions | Pythonic, well-known pattern | Mixes concerns (TodoApp defines user messages) | CLI must catch/handle exceptions—requires TodoApp to know about user-facing errors |
| Return None on error | Simple | No error message for CLI | CLI can't display helpful messages—violates "graceful error handling" requirement |
| Logging module | Professional | Requires config, file I/O or console coupling | Couples TodoApp to output stream—violates separation of concerns |
| Direct `print()` in TodoApp | Zero ceremony | Couples business logic to I/O | Fatal violation of constitution—TodoApp cannot use I/O directly |

**Implementation**:
```python
def delete_task(self, task_id: int) -> tuple[bool, str]:
    # Find task
    if task_id not in self._tasks:
        return (False, f"Task #{task_id} not found")

    # Delete task
    self._tasks.remove(task)
    return (True, f"Task #{task_id} deleted")
```

**CLI Usage**:
```python
success, message = todo_app.delete_task(5)
print(message)  # CLI handles output, TodoApp stays pure
```

---

## Decision 4: CLI Input Parsing

**Question**: How should the CLI parse user commands like "update 3 New Title"?

**Decision**: Split input on whitespace, match first token to command name, parse remaining tokens

**Rationale**:
- Simple: Basic string operations (`str.split()`)
- No regex or parsing libraries needed (constitution: standard library only)
- Aligns with spec's command syntax (`update <id>`, `delete <id>`)
- Easy to extend for future commands

**Alternatives Considered**:

| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| `argparse` module | Professional CLI parsing | Designed for `sys.argv`, not interactive loop | Overkill—argparse expects one-shot commands, not persistent menu |
| `cmd` module | Built-in REPL framework | Adds OOP complexity, learning curve | Violates simplicity principle—too much framework for 6 commands |
| Regular expressions | Flexible pattern matching | Complex, hard to debug | Over-engineering—simple split() handles all cases |
| Manual character parsing | Full control | Verbose, error-prone | Reinventing `str.split()`—violates simplicity principle |

**Implementation**:
```python
user_input = input("> ").strip()
parts = user_input.split()

if not parts:
    continue

command = parts[0].lower()

if command == "add":
    # Prompt for title, description
elif command == "update" and len(parts) >= 2:
    task_id = int(parts[1])
    # Prompt for new title/description
elif command == "delete" and len(parts) >= 2:
    task_id = int(parts[1])
# ...
```

---

## Decision 5: Task List Display Format

**Question**: How should tasks be displayed in the `list` command?

**Decision**: Format string template: `{id}. [{status}] {title}`

**Rationale**:
- Readable: Clear visual separation (ID, status checkbox, title)
- Spec-compliant: Uses `[x]` for complete, `[ ]` for incomplete
- Simple: Basic f-string formatting, no external libraries
- Extensible: Easy to add description on separate line in future

**Alternatives Considered**:

| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| Tabular format (aligned columns) | Professional appearance | Requires calculating max widths, complex logic | Over-engineering for Phase I—spec doesn't require column alignment |
| JSON output | Machine-readable | Not user-friendly for humans | Violates UX requirement—users expect readable text, not JSON |
| Rich library (tables, colors) | Beautiful output | External dependency | Constitution forbids external dependencies in Phase I |
| Description inline | All info visible | Long descriptions break layout | Cluttered—description is optional, should be secondary |

**Implementation**:
```python
def list_tasks(self) -> list[str]:
    if not self._tasks:
        return []

    formatted = []
    for task in self._tasks:
        status = "x" if task.completed else " "
        formatted.append(f"{task.id}. [{status}] {task.title}")
    return formatted
```

**Example Output**:
```
1. [ ] Buy groceries
2. [x] Write report
3. [ ] Fix bug #42
```

---

## Architecture Diagram

```
┌─────────────────┐
│   __main__.py   │  Entry: instantiate TodoApp, run CLI loop
└────────┬────────┘
         │ imports
         ▼
┌─────────────────┐
│     cli.py      │  Presentation: menu, input, output formatting
│                 │  - display_menu()
│                 │  - run_loop(todo_app)
│                 │  - parse_command()
└────────┬────────┘
         │ calls methods
         ▼
┌─────────────────┐
│  todo_app.py    │  Business Logic: CRUD, validation, state
│   (TodoApp)     │  - add_task(title, desc) → (bool, str)
│                 │  - list_tasks() → list[str]
│                 │  - update_task(id, ...) → (bool, str)
│                 │  - delete_task(id) → (bool, str)
│                 │  - mark_complete(id) → (bool, str)
└────────┬────────┘
         │ manages list of
         ▼
┌─────────────────┐
│    task.py      │  Data Model: Task dataclass
│     (Task)      │  - id: int
│                 │  - title: str
│                 │  - description: str
│                 │  - completed: bool
└─────────────────┘
```

**Dependency Flow**: Outer → Inner (CLI → TodoApp → Task)
**Invariant**: Inner layers never import outer layers (Task/TodoApp don't know about CLI)

---

## Summary

All architectural decisions prioritize:
1. **Simplicity**: Standard library, minimal abstractions
2. **Separation of Concerns**: Three-layer architecture with clear boundaries
3. **Constitution Compliance**: Type hints, no external deps, no global state
4. **Extensibility**: Design choices don't block future persistence layers

**Next Phase**: Detailed design (data model, contracts, quickstart guide)
