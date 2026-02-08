---
id: 009
title: Phase 5 US3 Filter Implementation
stage: green
date: 2025-12-27
surface: agent
model: claude-sonnet-4-5
feature: 002-intermediate-level
branch: main
user: you mahno9248@gmail.com
command: /sp.implement
labels: ["implementation", "phase5", "user-story-3", "filter", "querying", "cli"]
links:
  spec: specs/002-intermediate-level/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - src/todo_app.py
  - src/cli.py
  - specs/002-intermediate-level/tasks.md
tests:
  - End-to-end filter feature test (11 test scenarios, all passed)
  - Regression test (Basic Level + Priority + Tags + Filter combined, all passed)
---

## Prompt

/sp.implement proceed with phase 5

## User Input

```text
proceed with phase 5
```

## Response snapshot

Successfully completed Phase 5 (User Story 3 - Task Filtering by Attributes) with all 12 tasks finished. Users can now filter tasks by priority, tag, or status to focus on specific subsets.

### Phase 5 Tasks Completed:

**T030-T032 ✅ - Implement Filter Helper Methods (Parallel)**
- Created `filter_by_priority(priority_str: str) -> list[Task]` in `src/todo_app.py`
  - Case-insensitive priority matching
  - Returns tasks matching LOW, MEDIUM, or HIGH priority
  - Returns empty list for invalid priority (validation handled by filter_tasks)

- Created `filter_by_tag(tag_name: str) -> list[Task]` in `src/todo_app.py`
  - Case-insensitive tag matching
  - Returns tasks containing the specified tag
  - Uses `tag_normalized in task.tags` for membership test

- Created `filter_by_status(status_str: str) -> list[Task]` in `src/todo_app.py`
  - Maps "completed" → True, "pending" → False
  - Returns tasks matching completion status
  - Returns empty list for invalid status (validation handled by filter_tasks)

**T033-T035 ✅ - Implement filter_tasks() Routing Method**
- Created `filter_tasks(field: str, value: str) -> tuple[bool, list[str], str]`
- **Field validation** (T034):
  - Valid fields: "priority", "tag", "status"
  - Returns `(False, [], "Invalid field... Use: priority, tag, status")` for invalid field
- **Value validation** (T035):
  - Priority: must be "low", "medium", or "high"
  - Tag: must be non-empty string (any value accepted for flexibility)
  - Status: must be "completed" or "pending"
  - Returns specific error messages per validation failure
- **Return format**: `(success, formatted_tasks, error_message)`
  - Success with results: `(True, ["1. [ ] !!! Task", ...], "")`
  - Success with no matches: `(True, [], "")` ← Not an error
  - Validation error: `(False, [], "error message")`

**T036-T041 ✅ - Add Filter CLI Command**
- **Updated CLI menu** (T036): Added "filter <field> <value>" to available commands
- **Created handle_filter()** (T037): Parses "filter <field> <value>" input
- **Input validation** (T038):
  - Requires 3 parts minimum: command, field, value
  - Usage message with detailed field descriptions
  - Examples for each filter type
- **Display filtered results** (T039):
  - Shows "Filtered Tasks (field: value)" header
  - Displays each matching task with full formatting (priority, tags, status)
  - Shows "No tasks match the filter criteria." when empty
  - Shows count: "Showing X of Y total tasks"
  - Reminder: "(Use 'list' to see all tasks)"
- **Non-persistent filtering** (T040):
  - Filter results displayed once
  - `list` command always shows all tasks (unaffected by previous filter)
  - No state stored in TodoApp for filters
- **Updated help menu** (T041): Shows filter command with examples

### End-to-End Test Results (11 Scenarios):

**✅ Test 1: Create 10 Tasks with Varied Data**
- 10 tasks with 3 high, 3 medium, 4 low priority
- Tags: work, coding, backend, review, urgent, bugfix, meeting, documentation, testing, deployment, production, refactoring, research, learning, design, ui
- 2 completed, 8 pending

**✅ Test 2: Filter by Priority HIGH**
- Command: `filter_tasks('priority', 'high')`
- Result: 3 tasks
```
1. [ ] !!! Write code #work #coding #backend
2. [ ] !!! Review PR #work #review
3. [ ] !!! Fix bug #work #urgent #bugfix
```

**✅ Test 3: Filter by Tag WORK (Case-insensitive)**
- Command: `filter_tasks('tag', 'WORK')` ← Uppercase input
- Result: 5 tasks (all with #work tag)
- Case normalization works correctly

**✅ Test 4: Filter by Status COMPLETED**
- Command: `filter_tasks('status', 'completed')`
- Result: 2 tasks
```
5. [x] !! Documentation #documentation
8. [x] ! Refactor #refactoring
```

**✅ Test 5: Filter by Status PENDING**
- Command: `filter_tasks('status', 'pending')`
- Result: 8 tasks (all incomplete tasks)

**✅ Test 6: Filter with No Matches**
- Command: `filter_tasks('tag', 'nonexistent')`
- Result: Success=True, 0 tasks ← Not an error condition
- Message: "No tasks match the filter criteria."

**✅ Test 7: Invalid Field**
- Command: `filter_tasks('invalid', 'value')`
- Result: Success=False
- Error: "Invalid field 'invalid'. Use: priority, tag, status"

**✅ Test 8: Invalid Priority Value**
- Command: `filter_tasks('priority', 'urgent')`
- Result: Success=False
- Error: "Invalid priority 'urgent'. Use: low, medium, high"

**✅ Test 9: Invalid Status Value**
- Command: `filter_tasks('status', 'done')`
- Result: Success=False
- Error: "Invalid status 'done'. Use: completed, pending"

**✅ Test 10: Filter by Tag URGENT**
- Command: `filter_tasks('tag', 'urgent')`
- Result: 1 task (only task with #urgent tag)

**✅ Test 11: Verify Non-Persistence**
- After filtering, `list_tasks()` returns all 10 tasks
- No filter state persisted in TodoApp
- Users can run multiple filters without side effects

### Regression Test Results:

**✅ Test: All Features Combined**
- **Basic Level**: add, update, complete, delete → All work
- **US1 - Priority**: set_priority → Works
- **US2 - Tags**: set_tags → Works
- **US3 - Filter**: filter by priority/tag/status → All work
- **Combined Display**:
  ```
  1. [ ] !!! Task 1 UPDATED #work #urgent
  3. [x] !! Task 3
  ```
- All features work seamlessly together!

### Implementation Details:

**src/todo_app.py** (~145 lines added):

```python
def filter_by_priority(self, priority_str: str) -> list[Task]:
    """Filter tasks by priority level."""
    priority_normalized = priority_str.strip().lower()
    priority_map = {
        "low": Priority.LOW,
        "medium": Priority.MEDIUM,
        "high": Priority.HIGH
    }
    target_priority = priority_map.get(priority_normalized)
    if target_priority is None:
        return []
    return [task for task in self._tasks if task.priority == target_priority]

def filter_by_tag(self, tag_name: str) -> list[Task]:
    """Filter tasks by tag name (case-insensitive)."""
    tag_normalized = tag_name.strip().lower()
    return [task for task in self._tasks if tag_normalized in task.tags]

def filter_by_status(self, status_str: str) -> list[Task]:
    """Filter tasks by completion status."""
    status_normalized = status_str.strip().lower()
    if status_normalized == "completed":
        target_completed = True
    elif status_normalized == "pending":
        target_completed = False
    else:
        return []
    return [task for task in self._tasks if task.completed == target_completed]

def filter_tasks(self, field: str, value: str) -> tuple[bool, list[str], str]:
    """Filter tasks by specified field and value.

    Returns: (success, formatted_tasks, error_message)
    """
    field_normalized = field.strip().lower()

    # Validate field
    valid_fields = ["priority", "tag", "status"]
    if field_normalized not in valid_fields:
        return False, [], f"Invalid field '{field}'. Use: priority, tag, status"

    # Validate value and filter
    if field_normalized == "priority":
        valid_priorities = ["low", "medium", "high"]
        if value.strip().lower() not in valid_priorities:
            return False, [], f"Invalid priority '{value}'. Use: low, medium, high"
        filtered_tasks = self.filter_by_priority(value)

    elif field_normalized == "tag":
        if not value or not value.strip():
            return False, [], "Tag name cannot be empty"
        filtered_tasks = self.filter_by_tag(value)

    elif field_normalized == "status":
        valid_statuses = ["completed", "pending"]
        if value.strip().lower() not in valid_statuses:
            return False, [], f"Invalid status '{value}'. Use: completed, pending"
        filtered_tasks = self.filter_by_status(value)

    formatted_tasks = [str(task) for task in filtered_tasks]
    return True, formatted_tasks, ""
```

**src/cli.py** (~55 lines added):

```python
# Updated menu
def display_menu():
    print("  filter <field> <value> Filter tasks (priority/tag/status)")

# New handler
def handle_filter(app: TodoApp, parts: list[str]) -> None:
    """Handle filter command to filter tasks by field and value."""
    if len(parts) < 3:
        print("Usage: filter <field> <value>")
        print("Fields:")
        print("  priority <level>   Filter by priority (low, medium, high)")
        print("  tag <name>         Filter by tag name")
        print("  status <state>     Filter by status (completed, pending)")
        print()
        print("Examples:")
        print("  filter priority high")
        print("  filter tag work")
        print("  filter status completed")
        return

    field = parts[1]
    value = " ".join(parts[2:])

    success, filtered_tasks, error_message = app.filter_tasks(field, value)

    if not success:
        print(error_message)
        return

    print(f"\nFiltered Tasks ({field}: {value})")
    print(SEPARATOR)

    if not filtered_tasks:
        print("No tasks match the filter criteria.")
    else:
        for task in filtered_tasks:
            print(task)

    print(SEPARATOR)
    print(f"Showing {len(filtered_tasks)} of {len(app.list_tasks())} total tasks")
    print("(Use 'list' to see all tasks)")
    print(SEPARATOR)

# Added to CLI loop
elif cmd == "filter":
    handle_filter(app, parts)
```

### Checkpoint Validation:

**✅ User Story 3 Fully Functional**
- ✅ Users can filter by priority (low, medium, high)
- ✅ Users can filter by tag name (case-insensitive)
- ✅ Users can filter by status (completed, pending)
- ✅ Filter results show full task formatting (priority, tags, status)
- ✅ "No tasks match" message for empty results
- ✅ Clear error messages for invalid field/value
- ✅ Non-persistent filtering (list shows all tasks)
- ✅ Filter count display shows X of Y tasks

**✅ All User Stories Work Together**
- ✅ Basic Level commands work
- ✅ Priority management (US1) works
- ✅ Tag management (US2) works
- ✅ Task filtering (US3) works independently and combined

**Independent Test Criteria Met:**
- ✅ Create 10 tasks with varied priorities and tags
- ✅ Filter by "priority high" → Only high-priority tasks shown
- ✅ Filter by "tag work" → Only work-tagged tasks shown
- ✅ Verify list shows all tasks after filtering (non-persistent)

### Core Organizational Features Complete! 🎯

**What Users Can Do Now:**
1. Add tasks (Basic Level)
2. Assign priority (US1)
3. Assign tags (US2)
4. **Filter by priority, tag, or status** to focus on specific subsets (US3 - NEW!)
5. See priority indicators (!!!, !!, !) AND tags (#tag1 #tag2)
6. Update, delete, complete tasks (Basic Level)

**Value Proposition:**
- Users can now **query their task list** to focus on what matters
- Filter by priority to focus on urgent tasks
- Filter by tag to focus on specific contexts (work, home, project)
- Filter by status to see only completed or pending tasks
- Non-persistent design keeps filtering simple (no cleanup needed)
- Clear feedback shows X of Y total tasks

### Files Modified:

1. **src/todo_app.py**:
   - Added filter_by_priority() helper (~35 lines)
   - Added filter_by_tag() helper (~25 lines)
   - Added filter_by_status() helper (~30 lines)
   - Added filter_tasks() routing method (~55 lines)
   - Total: ~145 lines with docstrings and validation

2. **src/cli.py**:
   - Updated display_menu() with filter command
   - Added handle_filter() function (~55 lines with detailed help)
   - Added filter command to CLI loop

3. **specs/002-intermediate-level/tasks.md**:
   - Marked T030-T041 as completed with [X]

### Progress Summary:

**Completed Phases:**
- ✅ Phase 1 (Setup): 3/3 tasks complete
- ✅ Phase 2 (Foundational): 6/6 tasks complete
- ✅ Phase 3 (US1 - Priority MVP): 9/9 tasks complete
- ✅ Phase 4 (US2 - Tags): 11/11 tasks complete
- ✅ Phase 5 (US3 - Filter): 12/12 tasks complete

**Total Progress**: 41/77 tasks (53%)

**Milestones Achieved**:
- ✅ MVP (Phase 1 + 2 + 3): Priority management
- ✅ Enhanced Organization (Phase 4): Tag management
- ✅ Core Querying (Phase 5): Task filtering by attributes

**Next Phases (Remaining Features):**
- ⏳ Phase 6 (US4 - Search): 10 tasks - Keyword search in title/description
- ⏳ Phase 7 (US5 - Sort): 13 tasks - Multi-criteria sorting
- ⏳ Phase 8 (Polish): 13 tasks - Documentation, regression testing, performance

## Outcome

- ✅ Impact: Filter feature delivered - users can now query tasks by priority, tag, or status to focus on specific subsets
- 🧪 Tests: 11 end-to-end test scenarios passed (filter by priority/tag/status, no matches, invalid field/value, case-insensitive, non-persistence), regression test passed (all features work together)
- 📁 Files: src/todo_app.py (+145 lines), src/cli.py (+55 lines), specs/002-intermediate-level/tasks.md (12 tasks marked complete)
- 🔁 Next prompts: Continue with Phase 6 (US4 - Search) for keyword search, or pause for deployment/testing
- 🧠 Reflection: Clean implementation with three focused helper methods and one routing method. Field/value validation provides clear error messages. Non-persistent design keeps filtering simple (no state management needed). Return format (success, tasks, error) follows established pattern. Filter count display helps users understand results in context of total tasks.

## Evaluation notes (flywheel)

- Failure modes observed: None - all tests passed on first attempt
- Graders run and results (PASS/FAIL): End-to-end test - PASS (11/11 scenarios), Regression test - PASS (all features work together)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Option 1 - Continue with Phase 6 (Search) for keyword-based discovery, Option 2 - Pause for user validation/feedback
