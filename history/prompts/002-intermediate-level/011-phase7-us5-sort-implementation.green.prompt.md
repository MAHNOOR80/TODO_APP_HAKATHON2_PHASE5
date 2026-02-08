---
id: 011
title: Phase 7 US5 Sort Implementation
stage: green
date: 2025-12-27
surface: agent
model: claude-sonnet-4-5
feature: 002-intermediate-level
branch: main
user: you mahno9248@gmail.com
command: /sp.implement
labels: ["implementation", "phase7", "user-story-5", "sort", "multi-criteria", "customization", "cli"]
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
  - End-to-end sort feature test (7 test scenarios, all passed)
  - Regression test (Basic Level + all 5 User Stories combined, all passed)
---

## Prompt

/sp.implement proceed with phase 7

## User Input

```text
proceed with phase 7
```

## Response snapshot

Successfully completed Phase 7 (User Story 5 - Task Sorting by Multiple Criteria) with 10 tasks finished (3 skipped - T055 due dates out of scope, T062-T063 inherently non-persistent). Users can now sort task list by priority, title, or created date for customized viewing.

### Phase 7 Tasks Completed:

**T052-T054 ✅ - Implement Sort Helper Methods (Parallel)**
- Created `sort_by_priority() -> list[Task]` in `src/todo_app.py`
  - Sorts HIGH → MEDIUM → LOW using Priority enum's `__lt__` method
  - Uses Python's `sorted()` function (stable sort)
  - Returns new sorted list (doesn't modify `_tasks`)

- Created `sort_by_title() -> list[Task]` in `src/todo_app.py`
  - Case-insensitive alphabetical sort (A-Z)
  - Uses `key=lambda task: task.title.lower()` for normalization
  - Stable sort preserves original order for same titles

- Created `sort_by_created() -> list[Task]` in `src/todo_app.py`
  - Sorts by creation date, newest first (descending)
  - Uses `reverse=True` for descending order
  - Stable sort preserves original order for same timestamps

**T055 ⏭️ - Skip sort_by_due()**
- Due dates are out of scope per `plan.md` line 193: "Due dates (Advanced Level feature)"
- Skipped this task as no `due_date` field exists in Task model

**T056-T057 ✅ - Implement sort_tasks() Routing Method**
- Created `sort_tasks(field: str) -> tuple[bool, list[str], str]`
- **Field validation** (T057):
  - Valid fields: "priority", "title", "created" (not "due")
  - Returns `(False, [], "Invalid field... Use: priority, title, created")` for invalid field
- **Return format**: `(success, formatted_tasks, error_message)`
  - Success: `(True, ["formatted tasks"], "")`
  - Validation error: `(False, [], "error message")`

**T058-T064 ✅ - Add Sort CLI Command**
- **Updated CLI menu** (T058): Added "sort <field>" to available commands
- **Created handle_sort()** (T059): Parses "sort <field>" input
- **Input validation** (T060):
  - Requires field argument (minimum 2 parts)
  - Usage message with detailed field descriptions
  - Examples for each sort type
- **Display sorted results** (T061):
  - Shows "Tasks Sorted by {field}" header
  - Displays each task with full formatting (priority, tags, status)
  - Shows count: "Showing X tasks"
  - Reminder: "(Use 'list' to see original order)"
- **T062-T063 ⏭️ - Skip persistence logic**:
  - Sort is inherently non-persistent (creates new list, doesn't modify `_tasks`)
  - No state to store or clear
  - `list()` always returns original order automatically
- **Updated help menu** (T064): Shows sort command with examples

### End-to-End Test Results (7 Scenarios):

**✅ Test 1: Create 5 Tasks with Varied Priorities**
- Tasks: Zebra (LOW), Apple (HIGH), Banana (MEDIUM), Cherry (HIGH), Date (LOW)
- Titles chosen to test alphabetical sorting independently
- Small delays between creates to ensure different `created_at` timestamps

**✅ Test 2: Sort by Priority (HIGH > MEDIUM > LOW)**
- Command: `sort_tasks('priority')`
- Result:
```
2. [ ] !!! Apple task      ← HIGH (first)
4. [ ] !!! Cherry task     ← HIGH (stable: preserves creation order)
3. [ ] !! Banana task      ← MEDIUM
1. [ ] ! Zebra task        ← LOW (stable: Zebra before Date)
5. [ ] ! Date task         ← LOW
```
- Stable sort: HIGH tasks maintain creation order (Apple before Cherry)
- Stable sort: LOW tasks maintain creation order (Zebra before Date)

**✅ Test 3: Sort by Title (A-Z alphabetical, case-insensitive)**
- Command: `sort_tasks('title')`
- Result:
```
2. [ ] !!! Apple task
3. [ ] !! Banana task
4. [ ] !!! Cherry task
5. [ ] ! Date task
1. [ ] ! Zebra task
```
- Perfect alphabetical order: Apple, Banana, Cherry, Date, Zebra
- Priority indicators preserved in sorted view

**✅ Test 4: Sort by Created (Newest first, descending)**
- Command: `sort_tasks('created')`
- Result:
```
5. [ ] ! Date task         ← Created last (newest)
4. [ ] !!! Cherry task
3. [ ] !! Banana task
2. [ ] !!! Apple task
1. [ ] ! Zebra task        ← Created first (oldest)
```
- Newest to oldest order confirmed

**✅ Test 5: Invalid Field**
- Command: `sort_tasks('invalid')`
- Result: Success=False
- Error: "Invalid field 'invalid'. Use: priority, title, created"

**✅ Test 6: Case-Insensitive Field Name**
- Command: `sort_tasks('PRIORITY')` ← Uppercase input
- Result: Success=True, 5 tasks sorted
- Field normalization works correctly

**✅ Test 7: Verify Non-Persistence (list shows original order)**
- After sorting, `list_tasks()` returns original creation order
- No sort state persisted in TodoApp
- Users can sort multiple times without side effects

### Regression Test Results:

**✅ Test: All 5 User Stories Combined**
- **Basic Level**: add, update, complete, delete → Works
- **US1 - Priority**: set_priority → Works
- **US2 - Tags**: set_tags → Works
- **US3 - Filter**: filter_tasks → Works
- **US4 - Search**: search_tasks → Works
- **US5 - Sort**: sort_tasks → Works independently
- **Combined Example (Sort by Priority)**:
  ```
  1. [ ] !!! Task 1 #work #urgent  ← HIGH first
  3. [ ] !! Task 3 #meeting        ← MEDIUM second
  2. [ ] ! Task 2                  ← LOW last
  ```
- **Original Order Preserved**:
  ```
  1. [ ] !!! Task 1 #work #urgent
  2. [ ] ! Task 2
  3. [ ] !! Task 3 #meeting
  ```
- All features work seamlessly together!

### Implementation Details:

**src/todo_app.py** (~110 lines added):

```python
def sort_by_priority(self) -> list[Task]:
    """Sort tasks by priority (high → medium → low) using stable sort."""
    # Priority enum has __lt__ defined: HIGH < MEDIUM < LOW
    return sorted(self._tasks, key=lambda task: task.priority)

def sort_by_title(self) -> list[Task]:
    """Sort tasks by title (A-Z, case-insensitive) using stable sort."""
    return sorted(self._tasks, key=lambda task: task.title.lower())

def sort_by_created(self) -> list[Task]:
    """Sort tasks by creation date (newest first) using stable sort."""
    return sorted(self._tasks, key=lambda task: task.created_at, reverse=True)

def sort_tasks(self, field: str) -> tuple[bool, list[str], str]:
    """Sort tasks by specified field.

    Args:
        field: "priority", "title", or "created"

    Returns: (success, formatted_tasks, error_message)
    """
    field_normalized = field.strip().lower()

    # Validate field
    valid_fields = ["priority", "title", "created"]
    if field_normalized not in valid_fields:
        return False, [], f"Invalid field '{field}'. Use: priority, title, created"

    # Route to specific sort helper
    if field_normalized == "priority":
        sorted_tasks = self.sort_by_priority()
    elif field_normalized == "title":
        sorted_tasks = self.sort_by_title()
    elif field_normalized == "created":
        sorted_tasks = self.sort_by_created()

    formatted_tasks = [str(task) for task in sorted_tasks]
    return True, formatted_tasks, ""
```

**src/cli.py** (~55 lines added):

```python
# Updated menu
def display_menu():
    print("  sort <field>           Sort tasks (priority/title/created)")

# New handler
def handle_sort(app: TodoApp, parts: list[str]) -> None:
    """Handle sort command to sort tasks by field."""
    if len(parts) < 2:
        print("Usage: sort <field>")
        print("Sort tasks by field")
        print()
        print("Fields:")
        print("  priority   Sort by priority (high → medium → low)")
        print("  title      Sort by title (A-Z alphabetical)")
        print("  created    Sort by creation date (newest first)")
        print()
        print("Examples:")
        print("  sort priority")
        print("  sort title")
        print("  sort created")
        return

    field = parts[1]

    success, sorted_tasks, error_message = app.sort_tasks(field)

    if not success:
        print(error_message)
        return

    print(f"\nTasks Sorted by {field.capitalize()}")
    print(SEPARATOR)

    if not sorted_tasks:
        print("No tasks to sort.")
    else:
        for task in sorted_tasks:
            print(task)

    print(SEPARATOR)
    print(f"Showing {len(sorted_tasks)} tasks")
    print("(Use 'list' to see original order)")
    print(SEPARATOR)

# Added to CLI loop
elif cmd == "sort":
    handle_sort(app, parts)
```

### Checkpoint Validation:

**✅ User Story 5 Fully Functional**
- ✅ Users can sort by priority (HIGH → MEDIUM → LOW)
- ✅ Users can sort by title (A-Z, case-insensitive)
- ✅ Users can sort by created date (newest first)
- ✅ Stable sort preserves original order for equal items
- ✅ Sorted results show full task formatting (priority, tags, status)
- ✅ Clear field descriptions in help menu
- ✅ Non-persistent sorting (list shows original order)
- ✅ Sort count display shows total tasks

**✅ All 5 User Stories Work Together**
- ✅ Basic Level commands work
- ✅ Priority management (US1) works
- ✅ Tag management (US2) works
- ✅ Task filtering (US3) works independently
- ✅ Keyword search (US4) works independently
- ✅ Task sorting (US5) works independently and combined

**Independent Test Criteria Met:**
- ✅ Add 5 tasks with different priorities
- ✅ Sort by "priority" → Verify order HIGH → MEDIUM → LOW
- ✅ Sort by "title" → Verify alphabetical order A-Z
- ✅ Stable sort confirmed (equal items maintain order)

### All User Stories Complete! 🎯

**What Users Can Do Now:**
1. Add tasks (Basic Level)
2. Assign priority (US1) - Importance
3. Assign tags (US2) - Context/Categories
4. Filter by attribute (US3) - Query by priority/tag/status
5. Search by keyword (US4) - Content discovery
6. **Sort by criteria** (US5 - NEW!) - Customized viewing
7. See priority indicators (!!!, !!, !) AND tags (#tag1 #tag2)
8. Update, delete, complete tasks (Basic Level)

**Value Proposition:**
- Users can now **customize their task list view** by sorting
- Sort by priority to focus on important tasks
- Sort by title for alphabetical organization
- Sort by created to see newest or oldest tasks
- Non-persistent design keeps sorting flexible (no cleanup)
- Stable sort ensures predictable ordering

### Files Modified:

1. **src/todo_app.py**:
   - Added sort_by_priority() helper (~20 lines)
   - Added sort_by_title() helper (~20 lines)
   - Added sort_by_created() helper (~20 lines)
   - Added sort_tasks() routing method (~50 lines)
   - Total: ~110 lines with docstrings and validation

2. **src/cli.py**:
   - Updated display_menu() with sort command
   - Added handle_sort() function (~55 lines with detailed help)
   - Added sort command to CLI loop

3. **specs/002-intermediate-level/tasks.md**:
   - Marked T052-T054, T056-T061, T064 as completed with [X]
   - Marked T055, T062-T063 as [SKIP] with rationale

### Progress Summary:

**Completed Phases:**
- ✅ Phase 1 (Setup): 3/3 tasks complete
- ✅ Phase 2 (Foundational): 6/6 tasks complete
- ✅ Phase 3 (US1 - Priority MVP): 9/9 tasks complete
- ✅ Phase 4 (US2 - Tags): 11/11 tasks complete
- ✅ Phase 5 (US3 - Filter): 12/12 tasks complete
- ✅ Phase 6 (US4 - Search): 10/10 tasks complete
- ✅ Phase 7 (US5 - Sort): 10/13 tasks complete (3 skipped)

**Total Progress**: 61/77 tasks (79%) - 61 completed, 3 skipped, 13 remaining

**Milestones Achieved**:
- ✅ MVP (Phase 1 + 2 + 3): Priority management
- ✅ Enhanced Organization (Phase 4): Tag management
- ✅ Core Querying (Phase 5): Task filtering by attributes
- ✅ Task Discovery (Phase 6): Keyword search in content
- ✅ Customized Viewing (Phase 7): Multi-criteria sorting

**Next Phase (Final Polish):**
- ⏳ Phase 8 (Polish): 13 tasks - Documentation, regression testing, performance

## Outcome

- ✅ Impact: Sort feature delivered - users can now customize task list view by priority, title, or created date with stable sorting
- 🧪 Tests: 7 end-to-end test scenarios passed (sort by priority/title/created, stable sort verification, invalid field, case-insensitive, non-persistence), regression test passed (all 5 user stories work together)
- 📁 Files: src/todo_app.py (+110 lines), src/cli.py (+55 lines), specs/002-intermediate-level/tasks.md (10 tasks marked complete, 3 skipped with rationale)
- 🔁 Next prompts: Continue with Phase 8 (Polish) for final documentation and validation, or deploy Intermediate Level feature set
- 🧠 Reflection: Clean implementation with three focused helper methods and one routing method. Python's sorted() provides stable sort guarantee. Non-persistent by design (creates new list, doesn't modify _tasks). Field validation follows established pattern. Skipped due date sorting (out of scope) and persistence logic (inherently non-persistent).

## Evaluation notes (flywheel)

- Failure modes observed: None - all tests passed on first attempt
- Graders run and results (PASS/FAIL): End-to-end test - PASS (7/7 scenarios), Regression test - PASS (all features work together)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Option 1 - Continue with Phase 8 (Polish) for final validation and documentation, Option 2 - Deploy and demonstrate complete Intermediate Level feature set to user
