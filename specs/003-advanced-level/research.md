# Research: Advanced Level - Intelligent Features

**Feature**: 003-advanced-level
**Date**: 2025-12-27
**Status**: Complete
**Purpose**: Document technical research and decisions for implementing due dates, reminders, and recurring tasks

## Overview

This research document addresses the technical decisions needed to implement Advanced Level features (due dates, reminders, recurring tasks) while maintaining Python standard library constraints and backward compatibility.

## Research Areas

### 1. Python datetime Module for Due Dates and Times

**Question**: How to handle due dates and times using Python standard library only?

**Decision**: Use `datetime.datetime` from Python standard library

**Rationale**:
- Native Python type with no external dependencies
- Supports both date and time components in single object
- Built-in comparison operators for determining overdue status
- `datetime.strptime()` for parsing user input (YYYY-MM-DD HH:MM format)
- `datetime.now()` for current time comparison
- Type hint: `datetime | None` for optional due dates

**Implementation Pattern**:
```python
from datetime import datetime, timedelta

# Parsing user input
due_datetime = datetime.strptime("2025-12-31 14:30", "%Y-%m-%d %H:%M")

# Checking if overdue
is_overdue = due_datetime < datetime.now()

# Formatting for display
formatted = due_datetime.strftime("%Y-%m-%d %H:%M")
```

**Alternatives Considered**:
- Separate date and time fields: Rejected - increases complexity, harder to compare
- Unix timestamps (int): Rejected - less readable, harder to debug
- dateutil library: Rejected - external dependency violates Phase I constraint

### 2. Reminder Offset Storage and Calculation

**Question**: How to store and calculate reminder trigger times with preset offsets?

**Decision**: Store reminder offset as integer minutes, use `timedelta` for calculations

**Rationale**:
- Integer minutes align with preset options (1 day = 1440, 1 hour = 60, 30 min = 30, 10 min = 10)
- `timedelta(minutes=offset)` converts to duration for arithmetic
- Simple comparison: `datetime.now() >= (due_datetime - timedelta(minutes=offset))`
- Type hint: `int | None` for optional reminder offset

**Implementation Pattern**:
```python
from datetime import datetime, timedelta

# Preset offsets (defined as constants)
REMINDER_1_DAY = 1440    # 24 * 60
REMINDER_1_HOUR = 60
REMINDER_30_MIN = 30
REMINDER_10_MIN = 10

# Check if reminder should trigger
def should_show_reminder(due_datetime: datetime, offset_minutes: int) -> bool:
    trigger_time = due_datetime - timedelta(minutes=offset_minutes)
    return datetime.now() >= trigger_time and datetime.now() < due_datetime
```

**Alternatives Considered**:
- Store as timedelta objects: Rejected - harder to serialize, not JSON-friendly if persistence added later
- Store as strings ("1 day"): Rejected - requires parsing, error-prone
- Enum for preset values: Rejected - over-engineering for 4 simple constants

### 3. Recurrence Pattern Storage and Logic

**Question**: How to represent and calculate recurring task schedules?

**Decision**: Use string literals ("daily", "weekly", "monthly") with simple date arithmetic

**Rationale**:
- String literals are simple, readable, and match user mental model
- Python `timedelta` handles daily (+1 day) and weekly (+7 days)
- Monthly uses `datetime.replace(month=...)` with month arithmetic
- Type hint: `str | None` with validation against allowed values
- Recurrence end date stored as `datetime | None`

**Implementation Pattern**:
```python
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta  # NOT USED - external dependency

# Calculate next occurrence (without external dependencies)
def calculate_next_occurrence(current_due: datetime, pattern: str) -> datetime:
    if pattern == "daily":
        return current_due + timedelta(days=1)
    elif pattern == "weekly":
        return current_due + timedelta(weeks=1)
    elif pattern == "monthly":
        # Simple month arithmetic (day-of-month may skip if not valid)
        month = current_due.month
        year = current_due.year
        next_month = month + 1
        next_year = year
        if next_month > 12:
            next_month = 1
            next_year += 1
        try:
            return current_due.replace(year=next_year, month=next_month)
        except ValueError:  # Day doesn't exist in month (e.g., Jan 31 → Feb 31)
            # Fallback: Use last day of month
            if next_month == 2:
                last_day = 28 if next_year % 4 != 0 else 29
            elif next_month in [4, 6, 9, 11]:
                last_day = 30
            else:
                last_day = 31
            return current_due.replace(year=next_year, month=next_month, day=min(current_due.day, last_day))
```

**Edge Case Handling**:
- Monthly recurrence on day 31: Skip months without day 31, or use last valid day
- End date check: `if end_date and next_occurrence > end_date: return None`
- Validation: Only allow "daily", "weekly", "monthly" (case-insensitive)

**Alternatives Considered**:
- Cron-like expressions: Rejected - overly complex for 3 simple patterns
- dateutil.relativedelta: Rejected - external dependency
- Store next occurrence date: Rejected - redundant with pattern, harder to modify

### 4. Startup Reminder Display Strategy

**Question**: Where and how to display reminders on application startup?

**Decision**: Check reminders in CLI initialization, display before main menu

**Rationale**:
- User sees reminders immediately without extra commands
- Non-blocking: Show reminders, then continue to main menu
- Clear separation: Reminder section → blank line → main menu
- Type safety: Return list of tuples (task_id, title, time_remaining_str)

**Implementation Pattern**:
```python
# In cli.py main loop
def run():
    print("=== TODO CLI - Advanced Level ===\n")

    # Check and display reminders on startup
    reminders = app.get_active_reminders()
    if reminders:
        print("⏰ REMINDERS - Tasks Due Soon:")
        print("-" * 50)
        for task_id, title, time_remaining in reminders:
            print(f"  [{task_id}] {title} - Due in {time_remaining}")
        print("-" * 50)
        print()  # Blank line separator

    # Main menu follows...
    show_menu()
```

**Display Format**:
- Use emoji ⏰ for visual indicator
- Show task ID, title, and human-readable time remaining
- Time remaining format: "2 hours 30 minutes", "45 minutes", "1 day 3 hours"
- Clear separator lines for visual grouping

**Alternatives Considered**:
- Separate `reminders` command: Rejected - user might forget to check
- Pop-up notifications: Rejected - CLI can't do native notifications without external libraries
- Color coding: Considered but deferred - ANSI colors not universally supported

### 5. Backward Compatibility Strategy

**Question**: How to ensure existing tasks work without due dates or reminders?

**Decision**: All new fields default to `None` using Optional type hints

**Rationale**:
- Task dataclass with default values: `due_date: datetime | None = None`
- Existing task creation code unchanged (no breaking changes)
- Display logic: `if task.due_date:` pattern for conditional rendering
- Filter/sort: Handle None values gracefully (treat as "no due date" = lowest priority in sorting)

**Implementation Pattern**:
```python
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class Task:
    # Basic Level fields (existing)
    id: int
    title: str
    description: str = ""
    completed: bool = False

    # Intermediate Level fields (existing)
    priority: str = "medium"
    tags: list[str] = field(default_factory=list)

    # Advanced Level fields (NEW - all optional)
    due_date: datetime | None = None
    reminder_offset: int | None = None  # minutes before due_date
    recurrence_pattern: str | None = None  # "daily" | "weekly" | "monthly"
    recurrence_end_date: datetime | None = None
```

**Validation Rules**:
- Cannot set reminder_offset without due_date
- Cannot set recurrence_pattern without due_date
- recurrence_pattern must be in ["daily", "weekly", "monthly"] or None

### 6. Overdue Visual Indication

**Question**: How to visually indicate overdue tasks in CLI?

**Decision**: Prefix overdue tasks with `[OVERDUE]` marker in red text (if terminal supports ANSI)

**Rationale**:
- Text-based marker works in all terminals
- ANSI color codes enhance visibility when supported
- Graceful degradation: Falls back to plain text if colors unavailable
- Check: `datetime.now() > task.due_date`

**Implementation Pattern**:
```python
def format_task_for_display(task: Task) -> str:
    parts = []

    # Completion checkbox
    checkbox = "[X]" if task.completed else "[ ]"
    parts.append(checkbox)

    # Overdue indicator
    if task.due_date and datetime.now() > task.due_date:
        parts.append("[OVERDUE]")

    # Priority
    priority_symbol = {"high": "!!!", "medium": "!!", "low": "!"}.get(task.priority, "!!")
    parts.append(priority_symbol)

    # Title
    parts.append(task.title)

    # Due date (if set)
    if task.due_date:
        formatted_date = task.due_date.strftime("%Y-%m-%d %H:%M")
        parts.append(f"(Due: {formatted_date})")

    # Tags
    if task.tags:
        tag_str = " ".join(f"#{tag}" for tag in task.tags)
        parts.append(tag_str)

    return " ".join(parts)
```

**Example Output**:
```
[ ] [OVERDUE] !!! Submit report (Due: 2025-12-26 17:00) #work #urgent
[ ] !! Review PR (Due: 2025-12-28 14:00) #code-review
```

## Best Practices Applied

### Type Safety
- All datetime operations use proper type hints: `datetime | None`, `int | None`, `str | None`
- Validation functions with explicit return types: `-> bool`, `-> datetime`, `-> list[tuple[int, str, str]]`

### Error Handling
- Invalid date formats: Catch `ValueError` from `strptime()`, show user-friendly error
- Invalid recurrence patterns: Validate against allowed list before setting
- Missing due date for reminder: Check `due_date is not None` before setting reminder
- Month edge cases: Handle Feb 29, day 31 in months with 30 days

### Performance
- Reminder checks: O(n) scan of tasks on startup - acceptable for ~100 tasks
- No database queries, no file I/O during checks
- In-memory operations only (constitution requirement)

### Testing Approach (for future implementation phase)
- Unit tests for date arithmetic: `test_calculate_next_occurrence()`
- Unit tests for reminder trigger logic: `test_should_show_reminder()`
- Unit tests for overdue detection: `test_is_overdue()`
- Integration tests for recurring task generation: `test_recurring_task_creates_new_instance()`
- Edge case tests: Feb 29, month-end dates, timezone-naive comparisons

## Open Questions Resolved

**Q1**: Should we validate that due_time is in the future when set?
**A1**: No - allow past dates for historical tracking or overdue task entry. Mark as overdue immediately.

**Q2**: Should recurring tasks copy tags and priority to new instances?
**A2**: Yes - per FR-023 in spec, copy title, description, priority, and tags to maintain context.

**Q3**: How to handle timezone-aware vs timezone-naive datetimes?
**A3**: Use timezone-naive `datetime.now()` throughout. System local time assumption (per spec assumption #1).

**Q4**: Should reminders persist across app restarts?
**A4**: No - in-memory only. Recalculate on every startup per FR-012.

## Summary

All technical decisions documented with clear rationale. No external dependencies required. All functionality achievable with Python 3.13 standard library (`datetime`, `timedelta`). Ready to proceed to Phase 1: Data Model and Contracts.

**Next Steps**:
- Phase 1: Create data-model.md defining Task entity extensions
- Phase 1: Create contracts/ directory with CLI command contracts
- Phase 1: Create quickstart.md with user workflows
