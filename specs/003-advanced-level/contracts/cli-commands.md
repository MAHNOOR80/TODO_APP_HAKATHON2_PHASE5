# CLI Command Contracts: Advanced Level

**Feature**: 003-advanced-level
**Date**: 2025-12-27
**Status**: Phase 1 Design
**Purpose**: Define CLI command interfaces for due dates, reminders, and recurring tasks

## Overview

This document specifies the command-line interface contracts for Advanced Level features. All commands extend the existing CLI without breaking changes to Basic/Intermediate Level functionality.

## Command Summary

| Command | Purpose | New/Modified |
|---------|---------|--------------|
| `add` | Create task (extended with due date prompts) | MODIFIED |
| `update` | Edit task (extended with due date/reminder/recurrence) | MODIFIED |
| `due` | Set or clear due date on existing task | NEW |
| `remind` | Set or clear reminder on existing task | NEW |
| `recur` | Set or clear recurrence pattern on existing task | NEW |
| `list` | Display tasks (extended with due date/overdue indicators) | MODIFIED |
| Startup | Display active reminders before main menu | NEW |

## Command Specifications

### 1. `add` - Create Task (Modified)

**Purpose**: Create a new task with optional due date, reminder, and recurrence

**Flow**:
```
> add
Title: Submit quarterly report
Description: Q4 financial summary for board meeting

Set a due date? (y/n): y
Due date (YYYY-MM-DD): 2025-12-31
Due time (HH:MM, 24-hour): 17:00

Set a reminder? (y/n): y
Reminder offset:
  1. 1 day before
  2. 1 hour before
  3. 30 minutes before
  4. 10 minutes before
Select option (1-4): 1

Make this recurring? (y/n): n

Task #1 added successfully
Due: 2025-12-31 17:00
Reminder: 1 day before
```

**Inputs**:
- Title: string (required)
- Description: string (optional, press Enter to skip)
- Set due date? y/n (optional prompt)
  - If yes:
    - Due date: YYYY-MM-DD format (validated)
    - Due time: HH:MM format 24-hour (validated)
- Set reminder? y/n (only shown if due date set)
  - If yes:
    - Reminder offset: numeric choice 1-4 (validated)
- Make recurring? y/n (only shown if due date set)
  - If yes:
    - Recurrence pattern: 1=daily, 2=weekly, 3=monthly
    - End date? y/n
      - If yes: YYYY-MM-DD HH:MM (must be >= due date)

**Outputs**:
- Success: "Task #<id> added successfully" with due date/reminder/recurrence summary
- Error cases:
  - Invalid date format: "Invalid date format. Use YYYY-MM-DD"
  - Invalid time format: "Invalid time format. Use HH:MM (24-hour)"
  - Invalid reminder choice: "Invalid choice. Select 1-4"
  - End date before due date: "End date must be after due date"

**Validation**:
- Due date: Parse with `datetime.strptime("%Y-%m-%d %H:%M")`
- Reminder offset: Must be in [1, 2, 3, 4] mapping to [1440, 60, 30, 10]
- Recurrence pattern: Must be in [1, 2, 3] mapping to ["daily", "weekly", "monthly"]
- End date: Must be `>= due_date` if both set

---

### 2. `due` - Set Due Date (New)

**Purpose**: Set or clear due date on an existing task

**Flow (Set)**:
```
> due 5
Current due date: None

Due date (YYYY-MM-DD): 2025-12-30
Due time (HH:MM, 24-hour): 14:00

Due date set to: 2025-12-30 14:00
```

**Flow (Clear)**:
```
> due 5 clear
Current due date: 2025-12-30 14:00

Due date cleared
Reminder cleared (requires due date)
Recurrence cleared (requires due date)
```

**Inputs**:
- Task ID: integer (required)
- Action: "clear" keyword (optional, clears due date if provided)
- If not clearing:
  - Due date: YYYY-MM-DD (required)
  - Due time: HH:MM (required)

**Outputs**:
- Success (set): "Due date set to: <formatted datetime>"
- Success (clear): "Due date cleared" + cascade warnings
- Error cases:
  - Task not found: "Task #<id> not found"
  - Invalid format: Same as `add` command

**Side Effects (when clearing)**:
- reminder_offset set to None (requires due date)
- recurrence_pattern set to None (requires due date)
- recurrence_end_date set to None (no longer relevant)

---

### 3. `remind` - Set Reminder (New)

**Purpose**: Set or clear reminder offset on an existing task

**Flow (Set)**:
```
> remind 5
Current reminder: None
Task due date: 2025-12-30 14:00

Reminder offset:
  1. 1 day before
  2. 1 hour before
  3. 30 minutes before
  4. 10 minutes before
Select option (1-4): 2

Reminder set: 1 hour before (2025-12-30 13:00)
```

**Flow (Clear)**:
```
> remind 5 clear
Current reminder: 1 hour before

Reminder cleared
```

**Inputs**:
- Task ID: integer (required)
- Action: "clear" keyword (optional)
- If not clearing:
  - Reminder offset choice: 1-4 (required)

**Outputs**:
- Success (set): "Reminder set: <offset description> (<trigger datetime>)"
- Success (clear): "Reminder cleared"
- Error cases:
  - Task not found: "Task #<id> not found"
  - No due date: "Cannot set reminder without due date. Use 'due <id>' first"
  - Invalid choice: "Invalid choice. Select 1-4"

**Validation**:
- Task must have due_date set (not None)
- Choice must be 1-4

---

### 4. `recur` - Set Recurrence (New)

**Purpose**: Set or clear recurrence pattern on an existing task

**Flow (Set with End Date)**:
```
> recur 5
Current recurrence: None
Task due date: 2025-12-30 14:00

Recurrence pattern:
  1. Daily
  2. Weekly
  3. Monthly
Select option (1-3): 2

Set an end date? (y/n): y
End date (YYYY-MM-DD HH:MM): 2026-03-31 23:59

Recurrence set: Weekly until 2026-03-31 23:59
Next occurrence after completion: 2026-01-06 14:00
```

**Flow (Clear)**:
```
> recur 5 clear
Current recurrence: Weekly until 2026-03-31 23:59

Recurrence cleared
This task will not generate new instances when completed
```

**Inputs**:
- Task ID: integer (required)
- Action: "clear" keyword (optional)
- If not clearing:
  - Recurrence pattern choice: 1-3 (required)
  - Set end date? y/n (optional)
    - If yes: End date YYYY-MM-DD HH:MM (must be >= due date)

**Outputs**:
- Success (set): "Recurrence set: <pattern> until <end_date>" or "Recurrence set: <pattern> (no end date)"
- Success (clear): "Recurrence cleared" + explanation
- Error cases:
  - Task not found: "Task #<id> not found"
  - No due date: "Cannot set recurrence without due date. Use 'due <id>' first"
  - Invalid pattern: "Invalid choice. Select 1-3"
  - End date before due date: "End date must be after due date"

**Validation**:
- Task must have due_date set
- Pattern choice must be 1-3
- End date must be >= due_date if both set

---

### 5. `list` - Display Tasks (Modified)

**Purpose**: Display all tasks with due date indicators and overdue markers

**Output Format**:
```
Tasks
----------------------------------------
1. [ ] [OVERDUE] !!! Submit report (Due: 2025-12-26 17:00) #work #urgent
2. [ ] !! Review PR (Due: 2025-12-28 14:00) #code-review
3. [X] ! Daily standup (Due: 2025-12-27 09:00) ⟳ daily #meeting
4. [ ] !! Update docs #documentation
----------------------------------------
Total: 4 tasks (1 overdue, 1 completed)
```

**New Display Elements**:
- `[OVERDUE]` marker: Shows if `datetime.now() > task.due_date`
- `(Due: YYYY-MM-DD HH:MM)`: Shows formatted due date if set
- `⟳ <pattern>`: Shows recurrence pattern if set (⟳ daily, ⟳ weekly, ⟳ monthly)

**Sorting Behavior** (unchanged from Intermediate Level):
- Default: Creation order (ID ascending)
- `sort priority`: High → Medium → Low
- `sort title`: Alphabetical A-Z
- `sort created`: Newest first
- **NEW** `sort due`: Soonest due date first (None values at end)

**Filtering Behavior** (unchanged from Intermediate Level):
- `filter priority <level>`: Show tasks with specific priority
- `filter tag <name>`: Show tasks with specific tag
- `filter status <state>`: Show completed or pending tasks
- **NEW** `filter overdue`: Show only overdue tasks

---

### 6. Startup Reminder Display (New)

**Purpose**: Automatically display active reminders when application launches

**Trigger**: On `cli.py` main loop entry, before main menu

**Output Format**:
```
=== TODO CLI - Advanced Level ===

⏰ REMINDERS - Tasks Due Soon:
--------------------------------------------------
  [2] Review PR - Due in 3 hours 30 minutes
  [5] Team meeting - Due in 45 minutes
--------------------------------------------------

Main Menu:
  add       - Add new task
  list      - View all tasks
  ...
```

**Logic**:
1. Call `app.get_active_reminders()` on startup
2. For each task with `due_date` and `reminder_offset`:
   - Calculate trigger_time = due_date - timedelta(minutes=offset)
   - Check if datetime.now() >= trigger_time AND datetime.now() < due_date
   - If yes, include in reminders list
3. If reminders list is not empty:
   - Print header "⏰ REMINDERS - Tasks Due Soon:"
   - Print separator line
   - For each reminder: Print "  [<id>] <title> - Due in <time_remaining>"
   - Print separator line
   - Print blank line
4. Continue to main menu

**Time Remaining Format**:
- "X days Y hours" if >= 1 day
- "X hours Y minutes" if >= 1 hour
- "X minutes" if < 1 hour

**No Reminders**:
- If reminders list is empty, skip reminder section entirely
- Go directly to main menu

---

### 7. `update` - Update Task (Modified)

**Purpose**: Edit existing task including due date, reminder, and recurrence

**Note**: Users can also use dedicated commands (`due`, `remind`, `recur`) for targeted updates. The `update` command provides a comprehensive edit flow.

**Flow**:
```
> update 5

Current task:
  Title: Review PR
  Description: Code review for feature branch
  Priority: medium
  Tags: code-review
  Due: 2025-12-28 14:00
  Reminder: 1 hour before
  Recurrence: None

What would you like to update?
  1. Title
  2. Description
  3. Priority
  4. Tags
  5. Due date
  6. Reminder
  7. Recurrence
  8. Cancel
Select option (1-8): 5

Current due date: 2025-12-28 14:00
New due date (YYYY-MM-DD or 'clear'): 2025-12-29
New due time (HH:MM): 16:00

Due date updated to: 2025-12-29 16:00
```

**Inputs**:
- Task ID: integer (required)
- Update choice: 1-8
- Based on choice:
  - 1-4: Same as Intermediate Level (title, description, priority, tags)
  - 5: Due date (same prompts as `due` command)
  - 6: Reminder (same prompts as `remind` command)
  - 7: Recurrence (same prompts as `recur` command)
  - 8: Cancel (no changes)

**Outputs**:
- Success: "<field> updated to: <new_value>"
- Error cases: Same as individual commands

---

## Error Handling

### Common Error Messages

| Error Scenario | Message | Recovery |
|----------------|---------|----------|
| Task not found | "Task #<id> not found" | List tasks to find correct ID |
| Invalid date format | "Invalid date format. Use YYYY-MM-DD" | Re-enter with correct format |
| Invalid time format | "Invalid time format. Use HH:MM (24-hour)" | Re-enter with correct format |
| Invalid choice | "Invalid choice. Select <range>" | Re-enter with valid number |
| Reminder without due date | "Cannot set reminder without due date. Use 'due <id>' first" | Set due date first |
| Recurrence without due date | "Cannot set recurrence without due date. Use 'due <id>' first" | Set due date first |
| End date before due date | "End date must be after due date" | Re-enter with later date |

### Validation Strategy

All datetime parsing uses try-except with `ValueError`:

```python
try:
    due_datetime = datetime.strptime(user_input, "%Y-%m-%d %H:%M")
except ValueError:
    print("Invalid date format. Use YYYY-MM-DD HH:MM")
    return  # Re-prompt or abort
```

## Backward Compatibility

### Existing Commands Unchanged

| Command | Compatibility |
|---------|---------------|
| `add` (basic flow) | Pressing Enter at "Set due date?" skips all new prompts |
| `list` | Tasks without due dates display exactly as before |
| `complete <id>` | Works for all tasks; triggers recurrence logic if applicable |
| `delete <id>` | Works for all tasks; no special handling needed |
| `priority`, `tag`, `filter`, `sort`, `search` | Unchanged functionality |

### Progressive Enhancement

- Users can ignore all Advanced Level features
- Basic/Intermediate workflows remain identical
- New prompts are **optional** (y/n gates)
- Default behavior is always "no" (press Enter = skip)

## Summary

**New Commands**: 3 (`due`, `remind`, `recur`)
**Modified Commands**: 3 (`add`, `list`, `update`)
**Startup Behavior**: 1 (automatic reminder display)

**Complexity**: Low
- All new commands follow existing CLI patterns
- Consistent error messages and validation
- Optional prompts maintain backward compatibility

**Next Steps**:
- Phase 1: Create quickstart.md with user workflows
- Phase 1: Update agent context
- Phase 2: Generate tasks.md (via `/sp.tasks` command)
