# TodoApp Public Interface Contract

**Date**: 2025-12-25
**Feature**: 001-todo-cli
**Phase**: 1 (Design)

## Overview

This document defines the public interface of the `TodoApp` class—the business logic layer that manages tasks. These are the methods exposed to the CLI layer. All methods follow the error handling pattern: return `tuple[bool, str]` where the boolean indicates success/failure and the string contains a user-facing message.

---

## Class: TodoApp

**Purpose**: Manage in-memory task list with CRUD operations and validation.

**State**:
- `_tasks: list[Task]` — Internal task storage (private)
- `_next_id: int` — Auto-increment counter for task IDs (private)

**Initialization**:
```python
def __init__(self) -> None:
    """Initialize empty task list with ID counter starting at 1."""
```

---

## Public Methods

### Method: add_task

```python
def add_task(self, title: str, description: str = "") -> tuple[bool, str]:
```

**Purpose**: Create a new task with auto-incremented ID and add it to the list.

**Parameters**:
- `title` (str, required): Task title/summary
  - Must be non-empty after stripping whitespace
  - Will be stripped of leading/trailing whitespace before storage
- `description` (str, optional): Task details
  - Defaults to empty string if not provided
  - Will be stripped of leading/trailing whitespace before storage

**Returns**: `tuple[bool, str]`
- **Success**: `(True, "Task #{id} added successfully")`
  - Example: `(True, "Task #1 added successfully")`
- **Failure**: `(False, "Title is required")`
  - Returned when title is empty or whitespace-only

**Side Effects**:
- Increments `_next_id` counter
- Appends new Task instance to `_tasks` list
- Allocated ID is never reused (even if task is later deleted)

**Error Cases**:
| Condition | Return Value |
|-----------|--------------|
| `title.strip()` is empty | `(False, "Title is required")` |

**Example Usage**:
```python
todo_app = TodoApp()

# Success
success, msg = todo_app.add_task("Buy groceries")
# Returns: (True, "Task #1 added successfully")

# Success with description
success, msg = todo_app.add_task("Write report", "Q4 financial summary")
# Returns: (True, "Task #2 added successfully")

# Failure: empty title
success, msg = todo_app.add_task("")
# Returns: (False, "Title is required")

# Failure: whitespace-only title
success, msg = todo_app.add_task("   ")
# Returns: (False, "Title is required")
```

---

### Method: list_tasks

```python
def list_tasks(self) -> list[str]:
```

**Purpose**: Get formatted list of all tasks for CLI display.

**Parameters**: None

**Returns**: `list[str]`
- Each string formatted as: `"{id}. [{status}] {title}"`
- `status` is `"x"` if task is completed, `" "` (space) if incomplete
- Returns empty list `[]` if no tasks exist
- Tasks ordered by ID (ascending)

**Side Effects**: None (read-only operation)

**Error Cases**: None (always succeeds)

**Example Usage**:
```python
# With tasks
lines = todo_app.list_tasks()
# Returns: [
#     "1. [ ] Buy groceries",
#     "2. [x] Write report",
#     "3. [ ] Fix bug #42"
# ]

# Empty list
lines = todo_app.list_tasks()
# Returns: []
```

**CLI Display**:
```python
lines = todo_app.list_tasks()
if not lines:
    print("No tasks found")
else:
    for line in lines:
        print(line)
```

---

### Method: get_task

```python
def get_task(self, task_id: int) -> tuple[bool, str, Task | None]:
```

**Purpose**: Retrieve a specific task by ID (helper method for other operations).

**Parameters**:
- `task_id` (int, required): The task ID to find

**Returns**: `tuple[bool, str, Task | None]`
- **Success**: `(True, "", task_instance)`
  - Empty string for message (no user-facing message needed)
  - Third element is the Task object
- **Failure**: `(False, "Task #{id} not found", None)`
  - Example: `(False, "Task #99 not found", None)`

**Side Effects**: None (read-only operation)

**Error Cases**:
| Condition | Return Value |
|-----------|--------------|
| No task with given ID | `(False, "Task #{task_id} not found", None)` |

**Example Usage**:
```python
# Task exists
found, msg, task = todo_app.get_task(1)
# Returns: (True, "", Task(id=1, title="Buy groceries", ...))

# Task doesn't exist
found, msg, task = todo_app.get_task(99)
# Returns: (False, "Task #99 not found", None)
```

---

### Method: update_task

```python
def update_task(
    self,
    task_id: int,
    title: str | None = None,
    description: str | None = None
) -> tuple[bool, str]:
```

**Purpose**: Update a task's title and/or description.

**Parameters**:
- `task_id` (int, required): Task ID to update
- `title` (str | None, optional): New title
  - If provided and non-None, must be non-empty after stripping whitespace
  - If None, title is not updated
  - Will be stripped of leading/trailing whitespace before storage
- `description` (str | None, optional): New description
  - If provided and non-None, description is updated (can be empty string)
  - If None, description is not updated
  - Will be stripped of leading/trailing whitespace before storage

**Returns**: `tuple[bool, str]`
- **Success**: `(True, "Task #{id} updated")`
- **Failure (not found)**: `(False, "Task #{id} not found")`
- **Failure (empty title)**: `(False, "Title cannot be empty")`
- **Failure (no changes)**: `(False, "No changes specified")`

**Side Effects**: Modifies task attributes in `_tasks` list

**Error Cases**:
| Condition | Return Value |
|-----------|--------------|
| Task ID not found | `(False, "Task #{task_id} not found")` |
| `title` provided but empty after strip | `(False, "Title cannot be empty")` |
| Both `title` and `description` are None | `(False, "No changes specified")` |

**Example Usage**:
```python
# Update title only
success, msg = todo_app.update_task(1, title="Buy organic groceries")
# Returns: (True, "Task #1 updated")

# Update description only
success, msg = todo_app.update_task(2, description="Focus on revenue trends")
# Returns: (True, "Task #2 updated")

# Update both
success, msg = todo_app.update_task(3, title="Fix critical bug", description="Login null pointer")
# Returns: (True, "Task #3 updated")

# Failure: task not found
success, msg = todo_app.update_task(99, title="New title")
# Returns: (False, "Task #99 not found")

# Failure: empty title
success, msg = todo_app.update_task(1, title="")
# Returns: (False, "Title cannot be empty")

# Failure: no changes
success, msg = todo_app.update_task(1)
# Returns: (False, "No changes specified")
```

**Notes**:
- `completed` status cannot be changed via `update_task()` (use `mark_complete()` instead)
- `id` attribute is immutable (cannot be changed)

---

### Method: delete_task

```python
def delete_task(self, task_id: int) -> tuple[bool, str]:
```

**Purpose**: Remove a task from the list permanently.

**Parameters**:
- `task_id` (int, required): Task ID to delete

**Returns**: `tuple[bool, str]`
- **Success**: `(True, "Task #{id} deleted")`
- **Failure**: `(False, "Task #{id} not found")`

**Side Effects**:
- Removes task from `_tasks` list
- Task ID is never reused (`_next_id` counter is not decremented)

**Error Cases**:
| Condition | Return Value |
|-----------|--------------|
| Task ID not found | `(False, "Task #{task_id} not found")` |

**Example Usage**:
```python
# Success
success, msg = todo_app.delete_task(2)
# Returns: (True, "Task #2 deleted")

# Failure: task not found
success, msg = todo_app.delete_task(99)
# Returns: (False, "Task #99 not found")
```

**ID Reuse Guarantee**:
```python
todo_app.add_task("Task 1")  # Gets ID 1
todo_app.add_task("Task 2")  # Gets ID 2
todo_app.delete_task(2)      # Delete task 2
todo_app.add_task("Task 3")  # Gets ID 3 (NOT 2—IDs never reused)
```

---

### Method: mark_complete

```python
def mark_complete(self, task_id: int) -> tuple[bool, str]:
```

**Purpose**: Mark a task as completed (set `completed=True`).

**Parameters**:
- `task_id` (int, required): Task ID to mark complete

**Returns**: `tuple[bool, str]`
- **Success (was incomplete)**: `(True, "Task #{id} marked complete")`
- **Success (already complete)**: `(True, "Task #{id} already complete")`
  - Idempotent operation—safe to call multiple times
- **Failure**: `(False, "Task #{id} not found")`

**Side Effects**: Sets `task.completed = True` in `_tasks` list

**Error Cases**:
| Condition | Return Value |
|-----------|--------------|
| Task ID not found | `(False, "Task #{task_id} not found")` |

**Example Usage**:
```python
# Mark incomplete task as complete
success, msg = todo_app.mark_complete(1)
# Returns: (True, "Task #1 marked complete")

# Mark already-complete task (idempotent)
success, msg = todo_app.mark_complete(1)
# Returns: (True, "Task #1 already complete")

# Failure: task not found
success, msg = todo_app.mark_complete(99)
# Returns: (False, "Task #99 not found")
```

**Notes**:
- Phase I is one-way: once complete, no "uncomplete" operation exists
- Future phases may add `mark_incomplete()` method

---

## Usage Patterns

### Typical CLI Flow

```python
# 1. Initialize
todo_app = TodoApp()

# 2. Add tasks
success, msg = todo_app.add_task("Buy groceries")
print(msg)  # "Task #1 added successfully"

# 3. List tasks
lines = todo_app.list_tasks()
for line in lines:
    print(line)
# Output:
# 1. [ ] Buy groceries

# 4. Mark complete
success, msg = todo_app.mark_complete(1)
print(msg)  # "Task #1 marked complete"

# 5. List tasks again
lines = todo_app.list_tasks()
for line in lines:
    print(line)
# Output:
# 1. [x] Buy groceries
```

### Error Handling Pattern

```python
# Always check success flag before proceeding
success, msg = todo_app.delete_task(5)

if success:
    print(msg)  # Display success message
else:
    print(f"Error: {msg}")  # Display error message
```

### Input Validation in CLI

```python
# CLI validates numeric input before calling TodoApp
try:
    task_id = int(user_input)
    success, msg = todo_app.delete_task(task_id)
    print(msg)
except ValueError:
    print("Invalid task ID. Please enter a number.")
```

---

## Contract Guarantees

1. **No Exceptions**: Methods never raise exceptions (except for programming errors like passing wrong types)
2. **Consistent Return Format**: All mutating methods return `tuple[bool, str]`
3. **User-Facing Messages**: All strings are suitable for direct display to users
4. **Idempotency**: `mark_complete()` is safe to call multiple times on the same task
5. **No Side Effects on Failure**: If a method returns `(False, ...)`, no state is modified
6. **ID Uniqueness**: IDs are always unique within a session (never reused)
7. **Type Safety**: All parameters and return types are explicitly typed

---

## Future Extensions

**Phase II (Persistence)**:
- Add `save()` and `load()` methods
- Contract remains unchanged—CLI continues using same methods

**Phase III (Undo/Redo)**:
- Add `undo()` and `redo()` methods
- Existing methods unchanged—CLI can optionally use undo

**Phase IV (Multi-User)**:
- Add `user_id` parameter to methods
- Existing single-user methods remain for backward compatibility
