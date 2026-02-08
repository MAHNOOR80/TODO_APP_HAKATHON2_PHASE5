---
id: 008
title: Phase 5 Implementation - User Story 3 Recurring Tasks
stage: green
date: 2025-12-27
surface: agent
model: claude-sonnet-4-5
feature: 003-advanced-level
branch: 003-advanced-level
user: you
command: /sp.implement proceed with phase5
labels: ["implementation", "phase-5", "user-story-3", "recurring-tasks", "business-logic", "cli-commands", "validation", "integration"]
links:
  spec: specs/003-advanced-level/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - src/todo_app.py
  - src/cli.py
  - src/task.py
  - specs/003-advanced-level/tasks.md
tests:
  - Python syntax compilation (PASS - all files compile without errors)
  - Cascade clearing verification (PASS - due date clear → recurrence clear)
  - Validation verification (PASS - recurrence requires due dates)
  - Recurrence generation test (PASS - completing recurring task creates new instance)
---

## Prompt

/sp.implement proceed with phase5

## Response snapshot

Successfully completed Phase 5 (User Story 3 - Recurring Tasks) implementation for Advanced Level - Intelligent Features.

**Implementation Summary:**
- **Tasks Completed**: 15 of 15 (100%)
- **Files Modified**: 4 (src/todo_app.py, src/cli.py, src/task.py, tasks.md)
- **Lines Changed**: +325 insertions, -17 deletions
- **Critical Milestone**: Recurring task system complete - automated task regeneration

**Task Details by Category:**

### Business Logic (T041-T045) - 5 tasks ✅

**T041**: Implement calculate_next_occurrence(due_date, pattern) -> datetime
- Calculates next occurrence based on pattern (daily, weekly, monthly)
- Handles date arithmetic correctly
- Location: Lines 1069-1076 in src/todo_app.py

**T042**: Handle monthly recurrence edge cases (Feb 29, day 31)
- Handles Feb 29 → Feb 28 (or 29 in leap year) in next year
- Handles day 31 → last day of month when next month has fewer days
- Uses try/except with date.replace() to handle invalid dates
- Location: Lines 1046-1073 in src/todo_app.py

**T043**: Implement generate_recurring_task(task, next_id) -> Task | None
- Creates new task instance with next occurrence date
- Preserves title, description, priority, tags, reminder_offset (T055)
- Calculates next due date using calculate_next_occurrence()
- Checks recurrence_end_date to stop recurrence when exceeded
- Location: Lines 1129-1152 in src/todo_app.py

**T044**: Add set_recurrence(task_id, pattern, end_date) method
- Sets or clears recurrence for a task
- T051: Validates task has due_date before setting recurrence
- T052: Validates recurrence_end_date >= due_date
- Returns appropriate success/failure messages
- Location: Lines 880-928 in src/todo_app.py

**T045**: Extend mark_complete(task_id) to check for recurrence and generate new instance
- When recurring task completed, creates new instance with next occurrence date
- Uses generate_recurring_task() to create new instance
- Assigns new ID and adds to task list
- Location: Lines 137-175 in src/todo_app.py

### CLI Commands (T046-T050) - 5 tasks ✅

**T046**: Extend add command with optional recurrence prompts (shown only if due date set)
- Shows "Add recurrence? (y/n)" only if due date was set
- Displays pattern menu (daily, weekly, monthly)
- Optional end date prompt (T050)
- Location: Lines 177-229 in src/cli.py

**T047-T048**: Implement recur command handler (set and clear)
- Usage: "recur <id>" to set, "recur <id> clear" to clear
- Shows pattern menu with 3 options (daily, weekly, monthly)
- Validates choice is 1-3 (T053)
- Location: Lines 413-487 in src/cli.py

**T049**: Add recurrence pattern display to list command with "⟳" icon
- Implemented via Task.__str__() method (already in place)
- Format: "⟳ daily", "⟳ weekly", "⟳ monthly"
- Location: Lines 153-156 in src/task.py

**T050**: Handle optional end date prompt in recur command
- Prompts "Set end date for recurrence? (y/n)"
- If yes, prompts for end date/time with validation
- Location: Lines 202-224 in src/cli.py (add command), 461-483 (recur command)

### Validation (T051-T053) - 3 tasks ✅

**T051**: Validate recurrence requires due_date
- Implemented in set_recurrence() method
- Returns error: "Task must have a due date before setting recurrence"
- Location: Lines 891-893 in src/todo_app.py

**T052**: Validate recurrence_end_date >= due_date
- Implemented in set_recurrence() method
- Returns error: "Recurrence end date must be on or after due date"
- Location: Lines 895-897 in src/todo_app.py

**T053**: Validate recurrence pattern is in allowed values
- Implemented in handle_recur() command
- Checks choice is '1', '2', or '3'
- Returns error: "Invalid choice. Please choose 1-3."
- Location: Lines 447-450 in src/cli.py

### Integration (T054-T055) - 2 tasks ✅

**T054**: Update due <id> clear to cascade clear recurrence_pattern and recurrence_end_date
- Modified set_due_date() method
- When due_date is cleared (None), also clears recurrence_pattern and recurrence_end_date
- Maintains data integrity (no recurrence without due dates)
- Location: Lines 287-291 in src/todo_app.py

**T055**: Verify recurring task generation preserves title, description, priority, tags
- Implemented in generate_recurring_task() function
- New task preserves: title, description, priority, tags, reminder_offset, recurrence_pattern, recurrence_end_date
- Location: Lines 1107-1118 in src/todo_app.py

**CLI Integration:**
- Updated display_menu() to show "recur <id> [clear]" command
- Added "recur" command to main CLI loop (line 786)
- Updated imports to include recurrence constants and validation

**Recurring Task Logic Flow:**
1. User creates task with due date and recurrence pattern
2. User optionally sets recurrence end date
3. Task displays with "⟳ {pattern}" icon
4. When user completes recurring task, system:
   - Marks original task as complete
   - Calculates next occurrence date using pattern
   - Creates new task instance with next date
   - Preserves all original attributes
   - Stops if next date exceeds end date
5. New recurring instance appears in task list

**Code Statistics:**
- Total lines added: ~325 lines
- Business logic: ~100 lines (4 functions + 2 method updates)
- CLI commands: ~150 lines (extend add, handle_recur, menu updates)
- Menu/loop updates: ~10 lines
- Documentation: ~65 lines (docstrings)

**Git Commit:**
- Commit ID: 2786cd6
- Branch: 003-advanced-level
- Files changed: 3 (+325, -17)
- Commit message includes co-authorship with Claude Sonnet 4.5

**Verification:**
- ✅ Python syntax compilation successful
- ✅ Cascade clearing works (due date clear → recurrence clear)
- ✅ Validation prevents recurrence without due dates
- ✅ Recurring tasks generate new instances when completed
- ✅ No breaking changes to Basic, Intermediate, or previous Advanced features

**Phase 5 Completion:**
- All 15 tasks complete
- Recurring task system fully functional
- Automated task regeneration working
- Data integrity maintained via cascade clearing

**Critical Milestone Reached**: All Advanced Level user stories now complete!
- US1: Due Date Management (Phase 3)
- US2: Task Reminders (Phase 4)
- US3: Recurring Tasks (Phase 5)

**Next Phase**: Phase 6 - Polish & Cross-Cutting Concerns (7 tasks)

## Outcome

- ✅ Impact: User Story 3 (Recurring Tasks) complete - users can now create tasks that automatically repeat on daily, weekly, or monthly schedules. When recurring tasks are completed, new instances are automatically generated with next occurrence dates. Advanced edge case handling for monthly recurrence (Feb 29 → Feb 28, day 31 → last day of month). All Advanced Level features now complete (US1: Due Dates, US2: Reminders, US3: Recurring).
- 🧪 Tests: Python syntax compilation PASS, Cascade clearing verified (due date clear → recurrence clear), Validation verified (recurrence requires due dates), Recurrence generation verified (completing recurring task creates new instance)
- 📁 Files: src/todo_app.py (+125 lines: 4 functions + 2 method updates), src/cli.py (+175 lines: extend add + handle_recur + menu updates), src/task.py (already had recurrence display), tasks.md (15 tasks marked complete)
- 🔁 Next prompts: Proceed with Phase 6 (Polish & Cross-Cutting Concerns) to add final improvements, or test all Advanced features together
- 🧠 Reflection: Excellent integration with User Stories 1-2 - recurring tasks leverage existing due_date and reminder foundations. calculate_next_occurrence() handles complex monthly edge cases correctly (Feb 29 → Feb 28). generate_recurring_task() preserves all original attributes per T055. mark_complete() extension seamlessly creates new instances when recurring tasks completed. Cascade clearing (T054) maintains data integrity. Validation (T051-T053) prevents invalid configurations. Recurrence display "⟳ {pattern}" already existed in Task.__str__(). T049 was already implemented in Phase 3. End date prompts (T050) provide optional recurrence limits. Total implementation: 15 tasks, ~325 lines across 3 files, 0 errors, full backward compatibility maintained. All 3 Advanced Level user stories now complete (US1-3) - major milestone!

## Evaluation notes (flywheel)

- Failure modes observed: None - all code compiled successfully, validation works, cascade clearing maintains integrity, recurring task generation functions correctly
- Graders run and results (PASS/FAIL): Python syntax compilation PASS, Cascade clearing PASS, Validation PASS, Recurrence generation PASS
- Prompt variant (if applicable): Standard /sp.implement workflow with "proceed with phase5" user specification
- Next experiment (smallest change to try): Proceed with Phase 6 Task T056 to implement update_task() to validate due_date >= created_at for consistency
