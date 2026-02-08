# Developer Quickstart: Phase I Todo CLI

**Date**: 2025-12-25
**Feature**: 001-todo-cli

## Prerequisites

- **Python 3.13 or higher** (required by constitution)
- **uv** package manager (recommended) or **pip**
- Basic familiarity with command-line interfaces

## Initial Setup

### 1. Navigate to Project Directory

```bash
cd /path/to/TODO
```

### 2. Create Virtual Environment

**Using uv (recommended)**:
```bash
uv venv
```

**Using standard Python**:
```bash
python3.13 -m venv .venv
```

### 3. Activate Virtual Environment

**Windows**:
```cmd
.venv\Scripts\activate
```

**macOS/Linux**:
```bash
source .venv/bin/activate
```

### 4. Verify Python Version

```bash
python --version
```

**Expected output**: `Python 3.13.x` or higher

If you see an older version, check that:
- Python 3.13+ is installed on your system
- Virtual environment is activated (you should see `(.venv)` in your prompt)

---

## Running the Application

### Run as Module

```bash
python -m src
```

**Expected Output**:
```
=== Todo CLI ===
Commands: add, list, update <id>, delete <id>, complete <id>, quit

>
```

### First Session Example

```
> add
Title: Buy groceries
Description (optional):
Task #1 added successfully

> add
Title: Write report
Description (optional): Q4 financial summary
Task #2 added successfully

> list
1. [ ] Buy groceries
2. [ ] Write report

> complete 1
Task #1 marked complete

> list
1. [x] Buy groceries
2. [ ] Write report

> quit
Goodbye!
```

---

## Development Workflow

### File Organization

| File | Responsibility | When to Edit |
|------|----------------|--------------|
| `src/task.py` | Task dataclass | Add/remove task attributes |
| `src/todo_app.py` | Business logic (CRUD) | Add operations, change validation rules |
| `src/cli.py` | User interface | Change menu, input prompts, output formatting |
| `src/__main__.py` | Entry point | Initialization only (rarely edited) |

### Making Changes

#### Add a New Command

1. **Add method to TodoApp** (`src/todo_app.py`):
   ```python
   def archive_task(self, task_id: int) -> tuple[bool, str]:
       # Implementation
       return (True, f"Task #{task_id} archived")
   ```

2. **Add command handler in CLI** (`src/cli.py`):
   ```python
   elif command == "archive" and len(parts) >= 2:
       task_id = int(parts[1])
       success, msg = todo_app.archive_task(task_id)
       print(msg)
   ```

3. **Update help text** (in `cli.py` or `__main__.py`):
   ```python
   print("Commands: add, list, update <id>, delete <id>, complete <id>, archive <id>, quit")
   ```

4. **Update documentation**:
   - Add method to `contracts/todo_app_interface.md`
   - Update README.md command reference

#### Modify Task Attributes

1. **Update Task dataclass** (`src/task.py`):
   ```python
   @dataclass
   class Task:
       id: int
       title: str
       description: str = ""
       completed: bool = False
       priority: int = 0  # NEW ATTRIBUTE
   ```

2. **Update TodoApp methods** that create/modify tasks (`src/todo_app.py`):
   ```python
   def add_task(self, title: str, description: str = "", priority: int = 0) -> tuple[bool, str]:
       task = Task(id=self._next_id, title=title, description=description, priority=priority)
       # ...
   ```

3. **Update CLI display** (`src/cli.py`):
   ```python
   # Update list formatting to show priority
   formatted.append(f"{task.id}. [{status}] {title} (P{task.priority})")
   ```

4. **Update specification** (`specs/001-todo-cli/data-model.md`)

### Code Quality Checklist

Before committing changes:

- [ ] **Type hints**: All functions have type annotations
  ```python
  def add_task(self, title: str, description: str = "") -> tuple[bool, str]:
  ```

- [ ] **Docstrings**: All public functions/classes have docstrings
  ```python
  def add_task(self, title: str, description: str = "") -> tuple[bool, str]:
      """Create a new task with auto-incremented ID.

      Args:
          title: Task summary (required, non-empty)
          description: Task details (optional, defaults to empty string)

      Returns:
          Tuple of (success: bool, message: str)
      """
  ```

- [ ] **PEP 8 compliance**: Read code aloud—if confusing, refactor
  - Function names: `snake_case`
  - Class names: `PascalCase`
  - Constants: `UPPER_CASE`
  - Line length: Try to keep under 100 characters

- [ ] **Function length**: <30 lines (excluding docstrings/comments)

- [ ] **Manual testing**: Run through all commands
  ```bash
  python -m src
  # Test: add, list, update, delete, complete, quit
  ```

- [ ] **No global state**: All state in `TodoApp` instance

- [ ] **Separation of concerns**: CLI doesn't manipulate task data directly

### Running Type Checker (Future)

Currently Phase I has no external dependencies, so no type checker is installed. Future phases will add:

```bash
# Install mypy (Phase II+)
pip install mypy

# Run type checker
python -m mypy src/
```

---

## Architecture Reminders

### Dependency Flow (CRITICAL)

```
CLI (outer) → TodoApp (middle) → Task (inner)
```

**Rules**:
- ✅ CLI can import TodoApp and Task
- ✅ TodoApp can import Task
- ❌ Task CANNOT import TodoApp or CLI
- ❌ TodoApp CANNOT import CLI

**Why**: Allows testing TodoApp without CLI, swapping CLI for web UI, etc.

### State Management

**NEVER do this** (global mutable state):
```python
# ❌ BAD - Global variable
tasks = []

def add_task(title: str):
    tasks.append(Task(...))  # Violates constitution
```

**ALWAYS do this** (encapsulated state):
```python
# ✅ GOOD - State in object
class TodoApp:
    def __init__(self):
        self._tasks: list[Task] = []  # Private attribute

    def add_task(self, title: str) -> tuple[bool, str]:
        self._tasks.append(Task(...))
        return (True, "...")
```

### Error Handling Pattern

**TodoApp returns tuples, CLI displays**:
```python
# In TodoApp (business logic):
def delete_task(self, task_id: int) -> tuple[bool, str]:
    if task_id not in self._tasks:
        return (False, f"Task #{task_id} not found")  # ✅ Return message
    # Don't print here! TodoApp doesn't know about I/O

# In CLI (presentation):
success, msg = todo_app.delete_task(5)
print(msg)  # ✅ CLI handles output
```

### Type Hints (Python 3.13 Syntax)

Use modern union syntax:
```python
# ✅ GOOD (Python 3.13+)
def update_task(self, title: str | None = None) -> tuple[bool, str]:
    ...

# ❌ OLD (Python 3.9 style—avoid)
from typing import Optional
def update_task(self, title: Optional[str] = None) -> Tuple[bool, str]:
    ...
```

**Forward references**:
```python
# If you get "NameError: name 'Task' is not defined":
from __future__ import annotations

# Then you can use 'Task' before it's defined
def get_task(self, task_id: int) -> tuple[bool, str, Task | None]:
    ...
```

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'src'"

**Cause**: Running from inside `src/` directory or virtual environment not activated

**Solution**:
```bash
# Ensure you're in repository root
cd /path/to/TODO

# Activate virtual environment
source .venv/bin/activate  # macOS/Linux
.venv\Scripts\activate     # Windows

# Run from root
python -m src
```

### "python: No module named src.__main__"

**Cause**: `__main__.py` doesn't exist in `src/`

**Solution**:
Create `src/__main__.py` with:
```python
from src.cli import run

if __name__ == "__main__":
    run()
```

### Type Hint Errors

**Error**: `TypeError: unsupported operand type(s) for |: 'type' and 'type'`

**Cause**: Python version < 3.10 (union syntax `str | None` not supported)

**Solution**:
- Verify Python 3.13+ is active: `python --version`
- Or add `from __future__ import annotations` at top of file

### ID Reuse Bugs

**Symptom**: After deleting task #2, next task gets ID 2 instead of incrementing

**Cause**: Using list index as ID instead of `_next_id` counter

**Fix**:
```python
# ❌ BAD - Uses index
def add_task(self, title: str) -> tuple[bool, str]:
    task_id = len(self._tasks) + 1  # WRONG - breaks after deletion

# ✅ GOOD - Uses counter
def add_task(self, title: str) -> tuple[bool, str]:
    task_id = self._next_id
    self._next_id += 1  # Increments even after deletion
```

### PEP 8 Line Length

**Issue**: Lines over 100 characters

**Solutions**:
```python
# ❌ Long line
def update_task(self, task_id: int, title: str | None = None, description: str | None = None) -> tuple[bool, str]:

# ✅ Break parameters
def update_task(
    self,
    task_id: int,
    title: str | None = None,
    description: str | None = None
) -> tuple[bool, str]:

# ✅ Break return type
def update_task(
    self, task_id: int, title: str | None = None, description: str | None = None
) -> tuple[bool, str]:
```

---

## Next Steps

### After Phase I Completion

1. **Phase II - Persistence**:
   - Add `save()` and `load()` methods to TodoApp
   - Implement JSON file storage
   - No changes to CLI (modularity principle)

2. **Phase III - Testing**:
   - Install pytest: `pip install pytest`
   - Write unit tests for TodoApp (no CLI dependencies)
   - Add integration tests for CLI

3. **Phase IV - Code Quality Tools**:
   - Install linter: `pip install ruff`
   - Install formatter: `pip install black`
   - Install type checker: `pip install mypy`

### Learning Resources

- **Dataclasses**: [Python docs](https://docs.python.org/3/library/dataclasses.html)
- **Type hints**: [PEP 484](https://peps.python.org/pep-0484/)
- **PEP 8**: [Style guide](https://peps.python.org/pep-0008/)
- **Project structure**: See `specs/001-todo-cli/plan.md`

---

## Quick Reference

### Commands

| Command | Description |
|---------|-------------|
| `python -m src` | Run application |
| `python --version` | Check Python version |
| `source .venv/bin/activate` | Activate venv (macOS/Linux) |
| `.venv\Scripts\activate` | Activate venv (Windows) |

### File Purposes

| File | Purpose |
|------|---------|
| `src/__main__.py` | Entry point (imports CLI, runs loop) |
| `src/task.py` | Task dataclass |
| `src/todo_app.py` | Business logic (CRUD operations) |
| `src/cli.py` | User interface (menu, input, output) |

### Constitution Rules

- ✅ Python 3.13+ only
- ✅ Standard library only (no `pip install` in Phase I)
- ✅ Type hints everywhere
- ✅ Docstrings for all public APIs
- ✅ PEP 8 compliant
- ✅ No global mutable state
- ✅ Separation of concerns (CLI → TodoApp → Task)
- ✅ Functions <30 lines

---

**Need help?** Check:
1. `specs/001-todo-cli/plan.md` — Architecture overview
2. `specs/001-todo-cli/contracts/todo_app_interface.md` — TodoApp API
3. `specs/001-todo-cli/data-model.md` — Task entity details
4. `.specify/memory/constitution.md` — Project principles
