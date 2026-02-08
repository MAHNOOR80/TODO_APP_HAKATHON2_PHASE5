# Data Model: Phase I Todo CLI

**Date**: 2025-12-25
**Feature**: 001-todo-cli
**Phase**: 1 (Design)

## Entity: Task

### Overview

The Task entity represents a single to-do item in the user's list. It is implemented as a Python dataclass with four attributes: a unique ID, a required title, an optional description, and a completion status.

### Attributes

| Attribute   | Type   | Required | Default | Constraints                               | Purpose                          |
|-------------|--------|----------|---------|-------------------------------------------|----------------------------------|
| id          | int    | Yes      | N/A     | Must be > 0, unique, auto-assigned        | Unique identifier for the task   |
| title       | str    | Yes      | N/A     | Non-empty string (min 1 character)        | Task summary/name                |
| description | str    | No       | `""`    | Any string (empty allowed)                | Optional task details            |
| completed   | bool   | Yes      | `False` | Boolean (True or False)                   | Completion status flag           |

### Validation Rules

#### id
- **Auto-assigned**: TodoApp assigns IDs sequentially starting from 1
- **Never reused**: Even after deletion, IDs are never reassigned to new tasks
- **Immutable**: Once assigned, the ID cannot be changed
- **Uniqueness**: Enforced by TodoApp's `_next_id` counter (increments only)

#### title
- **Required**: Must be provided when creating a task
- **Non-empty**: Cannot be empty string or whitespace-only
- **Mutable**: Can be updated via `TodoApp.update_task()`
- **Validation**: Checked at creation and update time

#### description
- **Optional**: Defaults to empty string if not provided
- **Mutable**: Can be updated via `TodoApp.update_task()`
- **No length limit**: Any string length accepted (practical limit: memory)
- **Display**: May be truncated or hidden in list view for readability

#### completed
- **Boolean**: Only `True` or `False` values allowed
- **Default**: New tasks start as `False` (incomplete)
- **Mutable**: Changed via `TodoApp.mark_complete()` (one-way: False → True in Phase I)
- **Display**: Rendered as `[x]` when True, `[ ]` when False

### State Diagram

```
                     ┌─────────────┐
                     │   Created   │
                     │ completed=F │
                     └──────┬──────┘
                            │
                            │ add_task()
                            ▼
         ┌──────────────────────────────────┐
         │         Task Exists              │
         │      completed=False             │
         │  (can be updated/deleted)        │
         └──────┬───────────────────┬───────┘
                │                   │
     mark_complete()          delete_task()
                │                   │
                ▼                   ▼
         ┌─────────────┐     ┌────────────┐
         │  Completed  │     │  Deleted   │
         │ completed=T │     │ (removed)  │
         └─────────────┘     └────────────┘
```

**State Transitions**:
1. **Created → Incomplete**: Task created via `add_task()` with `completed=False`
2. **Incomplete → Completed**: Task marked complete via `mark_complete()` (sets `completed=True`)
3. **Incomplete → Deleted**: Task removed via `delete_task()` (removed from list)
4. **Completed → Deleted**: Completed tasks can also be deleted

**Note**: In Phase I, there is no "uncomplete" operation (Completed → Incomplete). Once marked complete, a task stays complete until deleted.

### Relationships

**Phase I**: None (flat structure)

Tasks exist independently with no relationships to other tasks. Future phases may introduce:
- Parent/child relationships (subtasks)
- Categories/tags (many-to-many)
- User ownership (multi-user support)

### Invariants

Invariants are conditions that MUST always be true for all Task instances:

1. **ID Uniqueness**: No two tasks in the session have the same ID
2. **ID Positivity**: All task IDs are positive integers (> 0)
3. **ID Monotonicity**: New task IDs are always greater than all previous IDs
4. **Title Non-emptiness**: All tasks have non-empty titles (validated at creation/update)
5. **Dataclass Integrity**: All attributes exist with correct types (enforced by `@dataclass`)

### Implementation Notes

**Python Implementation**:
```python
from dataclasses import dataclass

@dataclass
class Task:
    """Represents a single to-do item.

    Attributes:
        id: Unique positive integer identifier (auto-assigned by TodoApp)
        title: Non-empty task summary
        description: Optional task details (defaults to empty string)
        completed: Completion status (defaults to False)
    """
    id: int
    title: str
    description: str = ""
    completed: bool = False

    def __str__(self) -> str:
        """Format task for display in list view.

        Returns:
            String formatted as: "ID. [STATUS] TITLE"
            where STATUS is "x" if completed, " " otherwise.
        """
        status = "x" if self.completed else " "
        return f"{self.id}. [{status}] {self.title}"
```

**Why `@dataclass`**:
- Auto-generates `__init__`, `__repr__`, `__eq__`
- Enforces type hints (constitution requirement)
- Supports mutable attributes (needed for `completed` status)
- Part of Python standard library (no external dependencies)

### Storage

**Phase I**: In-memory only
- Tasks stored in `TodoApp._tasks: list[Task]`
- Data lost on application exit (no persistence)

**Future Phases**:
- Phase II: JSON file persistence
- Phase III: SQLite database
- Phase IV: PostgreSQL/cloud database

### Example Instances

**New Task**:
```python
Task(id=1, title="Buy groceries", description="", completed=False)
# Display: "1. [ ] Buy groceries"
```

**Task with Description**:
```python
Task(id=2, title="Write report", description="Q4 financial summary", completed=False)
# Display: "2. [ ] Write report"
# (description hidden in list view, shown on detail view in future phases)
```

**Completed Task**:
```python
Task(id=3, title="Fix bug #42", description="Null pointer in login flow", completed=True)
# Display: "3. [x] Fix bug #42"
```

### Migration Path

**Phase I → Phase II (File Persistence)**:
- Add `to_dict()` and `from_dict()` methods to Task
- Serialize to JSON: `{"id": 1, "title": "...", "description": "...", "completed": false}`
- No schema changes—attributes remain identical

**Phase II → Phase III (SQLite)**:
- Map to database schema:
  - `id` → INTEGER PRIMARY KEY
  - `title` → TEXT NOT NULL
  - `description` → TEXT DEFAULT ''
  - `completed` → BOOLEAN DEFAULT 0
- Task class unchanged—only storage layer changes

This demonstrates the modularity principle: data model is decoupled from storage implementation.
