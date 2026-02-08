"""Task data model for the Todo CLI application.

This module defines the Task entity using a dataclass for type safety and
minimal boilerplate. Tasks represent individual todo items with an ID, title,
optional description, and completion status.

Intermediate Level extensions add priority levels, tags for categorization,
and creation timestamps.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


# Advanced Level: Reminder offset constants (minutes)
REMINDER_1_DAY = 1440  # 24 * 60
REMINDER_1_HOUR = 60
REMINDER_30_MIN = 30
REMINDER_10_MIN = 10

VALID_REMINDER_OFFSETS = [REMINDER_1_DAY, REMINDER_1_HOUR, REMINDER_30_MIN, REMINDER_10_MIN]


# Advanced Level: Recurrence pattern constants
RECURRENCE_DAILY = "daily"
RECURRENCE_WEEKLY = "weekly"
RECURRENCE_MONTHLY = "monthly"

VALID_RECURRENCE_PATTERNS = [RECURRENCE_DAILY, RECURRENCE_WEEKLY, RECURRENCE_MONTHLY]


class Priority(Enum):
    """Task priority levels.

    Supports comparison for sorting: HIGH < MEDIUM < LOW
    This ordering allows reverse sort to display high-priority tasks first.
    """

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

    def __lt__(self, other: "Priority") -> bool:
        """Define ordering for sorting.

        Order: HIGH < MEDIUM < LOW (for reverse sort to show HIGH first)

        Args:
            other: Another Priority to compare against

        Returns:
            True if self is higher priority than other
        """
        order = {Priority.HIGH: 0, Priority.MEDIUM: 1, Priority.LOW: 2}
        return order[self] < order[other]


@dataclass
class Task:
    """Represents a single todo task.

    Basic Level attributes:
        id: Unique task identifier (auto-incremented by TodoApp)
        title: Task title (required, non-empty)
        description: Optional task description
        completed: Task completion status (default: False)

    Intermediate Level attributes (backward compatible):
        priority: Task priority level (default: MEDIUM)
        tags: List of tags for categorization (default: empty list)
        created_at: Timestamp when task was created (default: now)

    Advanced Level attributes (backward compatible):
        due_date: When task must be completed (default: None)
        reminder_offset: Minutes before due_date to trigger reminder (default: None)
        recurrence_pattern: How task repeats after completion (default: None)
        recurrence_end_date: When to stop generating recurring instances (default: None)
    """

    id: int
    title: str
    description: str
    completed: bool = False
    priority: Priority = Priority.MEDIUM
    tags: list[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)

    # Advanced Level fields (all optional for backward compatibility)
    due_date: datetime | None = None
    reminder_offset: int | None = None
    recurrence_pattern: str | None = None
    recurrence_end_date: datetime | None = None

    def __str__(self) -> str:
        """Return formatted string representation of the task.

        Format: {id}. [{status}] {priority_indicator} {title} {tags} {due_date} {overdue_marker}

        Examples:
            "1. [ ] !! Buy groceries #shopping #urgent (Due: 2025-12-28 14:00)"
            "2. [x] !!! Finish report #work"
            "3. [ ] ! Call dentist (Due: 2025-12-27 09:00) [OVERDUE]"

        Priority indicators:
            !!! = HIGH
            !!  = MEDIUM
            !   = LOW

        Tags format:
            #tag1 #tag2 (only if tags exist)

        Due date format:
            (Due: YYYY-MM-DD HH:MM) (only if due_date exists)

        Overdue marker:
            [OVERDUE] (only if task is overdue: has due_date in past and not completed)

        Recurrence indicator:
            ⟳ {pattern} (only if recurrence_pattern exists)

        Returns:
            Formatted task string for display in CLI
        """
        # Status indicator
        status = "x" if self.completed else " "

        # Priority indicator
        priority_map = {
            Priority.HIGH: "!!!",
            Priority.MEDIUM: "!!",
            Priority.LOW: "!",
        }
        priority_indicator = priority_map[self.priority]

        # Tags formatting
        tags_str = ""
        if self.tags:
            tags_str = " " + " ".join(f"#{tag}" for tag in self.tags)

        # Due date formatting
        due_str = ""
        if self.due_date is not None:
            formatted_date = self.due_date.strftime("%Y-%m-%d %H:%M")
            due_str = f" (Due: {formatted_date})"

        # Overdue marker (only if has due date, not completed, and past due)
        overdue_str = ""
        if self.due_date is not None and not self.completed:
            if datetime.now() > self.due_date:
                overdue_str = " [OVERDUE]"

        # Recurrence indicator
        recurrence_str = ""
        if self.recurrence_pattern is not None:
            recurrence_str = f" ⟳ {self.recurrence_pattern}"

        return f"{self.id}. [{status}] {priority_indicator} {self.title}{tags_str}{due_str}{overdue_str}{recurrence_str}"


# Advanced Level: Validation helper functions


def is_valid_reminder_offset(offset: int) -> bool:
    """Check if reminder offset is valid (one of the preset values).

    Args:
        offset: Reminder offset in minutes

    Returns:
        True if offset is in VALID_REMINDER_OFFSETS, False otherwise
    """
    return offset in VALID_REMINDER_OFFSETS


def is_valid_recurrence_pattern(pattern: str) -> bool:
    """Check if recurrence pattern is valid.

    Args:
        pattern: Recurrence pattern string

    Returns:
        True if pattern is in VALID_RECURRENCE_PATTERNS, False otherwise
    """
    return pattern in VALID_RECURRENCE_PATTERNS
