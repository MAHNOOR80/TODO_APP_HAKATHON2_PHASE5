"""Business logic for the Todo CLI application.

This module provides the TodoApp manager class that handles all CRUD operations
for tasks. It maintains in-memory task storage and ensures ID uniqueness and
validation.

Intermediate Level extensions add priority management, tag management, search,
filter, and sort capabilities.

Advanced Level extensions add due date management, reminders, and recurring tasks.
"""

from typing import Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
from .task import Task, Priority


# Advanced Level: Reminder data structures


@dataclass
class ReminderInfo:
    """Information about an active reminder for display.

    Attributes:
        task_id: ID of the task with the reminder
        title: Task title
        due_datetime: When the task is due
        time_remaining: Human-readable time remaining until due (e.g., "2 hours", "30 minutes")
    """

    task_id: int
    title: str
    due_datetime: datetime
    time_remaining: str


class TodoApp:
    """Manages todo tasks with CRUD operations.

    This class encapsulates all business logic for task management, including
    adding, listing, updating, deleting, and marking tasks as complete. All
    methods return tuple[bool, str] for error handling.

    Attributes:
        _tasks: Internal list of Task objects
        _next_id: Auto-incrementing ID counter (never reused)
    """

    def __init__(self) -> None:
        """Initialize TodoApp with empty task list and ID counter."""
        self._tasks: list[Task] = []
        self._next_id: int = 1

    def add_task(
        self,
        title: str,
        description: str = "",
        due_date: datetime | None = None
    ) -> tuple[bool, str]:
        """Add a new task to the task list.

        Args:
            title: Task title (required, must be non-empty)
            description: Optional task description (default: empty string)
            due_date: Optional due date/time (default: None)

        Returns:
            tuple[bool, str]: (success, message)
            - (True, "Task #{id} added successfully") on success
            - (False, "Title cannot be empty") if title is empty/whitespace

        Side effects:
            - Creates new Task with auto-incremented ID
            - Appends task to _tasks list
            - Increments _next_id counter
        """
        # Validate title is non-empty
        if not title or not title.strip():
            return False, "Title cannot be empty"

        # Create task with auto-incremented ID
        task_id = self._next_id
        task = Task(
            id=task_id,
            title=title.strip(),
            description=description.strip(),
            completed=False,
            due_date=due_date
        )

        # Append to task list
        self._tasks.append(task)

        # Increment ID counter (never reused)
        self._next_id += 1

        return True, f"Task #{task_id} added successfully"

    def list_tasks(self) -> list[str]:
        """Return formatted list of all tasks.

        Returns:
            list[str]: List of formatted task strings
            - Each string in format: "{id}. [{status}] {title}"
            - Empty list if no tasks exist
            - Status is 'x' for completed, ' ' for incomplete

        Note:
            Uses Task.__str__() for formatting each task
        """
        # Handle empty task list
        if not self._tasks:
            return []

        # Format each task using __str__ method
        return [str(task) for task in self._tasks]

    def get_task(self, task_id: int) -> Optional[Task]:
        """Retrieve a task by ID.

        Args:
            task_id: Task ID to retrieve

        Returns:
            Task object if found, None otherwise

        Note:
            Helper method used by update, delete, and mark_complete
        """
        for task in self._tasks:
            if task.id == task_id:
                return task
        return None

    def mark_complete(self, task_id: int) -> tuple[bool, str]:
        """Mark a task as complete.

        Args:
            task_id: ID of task to mark complete

        Returns:
            tuple[bool, str]: (success, message)
            - (True, "Task #{id} marked complete") on success
            - (True, "Task #{id} already complete") if already complete (idempotent)
            - (False, "Task #{id} not found") if ID doesn't exist

        Side effects:
            - Sets task.completed = True if task exists and not already complete
            - If task has recurrence pattern, generates new recurring instance (T045)
        """
        # Get task by ID
        task = self.get_task(task_id)

        # Handle task not found
        if task is None:
            return False, f"Task #{task_id} not found"

        # Idempotency check - already complete
        if task.completed:
            return True, f"Task #{task_id} already complete"

        # Mark task as complete
        task.completed = True

        # Check for recurrence and generate new instance if applicable (T045)
        if task.recurrence_pattern is not None:
            new_task = generate_recurring_task(task, self._next_id)
            if new_task is not None:
                self._tasks.append(new_task)
                self._next_id += 1
                return True, f"Task #{task_id} marked complete. New recurring instance created as Task #{new_task.id}."

        return True, f"Task #{task_id} marked complete"

    def update_task(
        self,
        task_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None
    ) -> tuple[bool, str]:
        """Update a task's title and/or description.

        Args:
            task_id: ID of task to update
            title: New title (None to keep current, empty string NOT allowed)
            description: New description (None to keep current, empty string allowed)

        Returns:
            tuple[bool, str]: (success, message)
            - (True, "Task #{id} updated successfully") on success
            - (False, "Task #{id} not found") if ID doesn't exist
            - (False, "Title cannot be empty") if title is empty/whitespace
            - (False, "No changes specified") if both title and description are None

        Side effects:
            - Updates task.title if title provided
            - Updates task.description if description provided
        """
        # Get task by ID
        task = self.get_task(task_id)

        # Handle task not found
        if task is None:
            return False, f"Task #{task_id} not found"

        # Check if any changes specified
        if title is None and description is None:
            return False, "No changes specified"

        # Validate title if provided
        if title is not None and (not title or not title.strip()):
            return False, "Title cannot be empty"

        # Update task fields
        if title is not None:
            task.title = title.strip()

        if description is not None:
            task.description = description.strip()

        return True, f"Task #{task_id} updated successfully"

    def delete_task(self, task_id: int) -> tuple[bool, str]:
        """Delete a task from the task list.

        Args:
            task_id: ID of task to delete

        Returns:
            tuple[bool, str]: (success, message)
            - (True, "Task #{id} deleted successfully") on success
            - (False, "Task #{id} not found") if ID doesn't exist

        Side effects:
            - Removes task from _tasks list
            - Does NOT reuse the ID (uses _next_id counter)

        Note:
            Deleted IDs are never reused. Next task will use _next_id,
            which continues incrementing regardless of deletions.
        """
        # Get task by ID
        task = self.get_task(task_id)

        # Handle task not found
        if task is None:
            return False, f"Task #{task_id} not found"

        # Remove task from list
        self._tasks.remove(task)

        return True, f"Task #{task_id} deleted successfully"

    def set_due_date(
        self,
        task_id: int,
        due_date: datetime | None
    ) -> tuple[bool, str]:
        """Set or clear the due date for a task.

        Args:
            task_id: ID of task to update
            due_date: New due date/time, or None to clear

        Returns:
            tuple[bool, str]: (success, message)
            - (True, "Due date set for task #{id}") when setting a date
            - (True, "Due date cleared for task #{id}") when clearing
            - (False, "Task #{id} not found") if ID doesn't exist

        Side effects:
            - Updates task.due_date
            - If clearing due_date, also clears reminder_offset (cascade)
        """
        # Get task by ID
        task = self.get_task(task_id)

        # Handle task not found
        if task is None:
            return False, f"Task #{task_id} not found"

        # Update due date
        task.due_date = due_date

        # Cascade clear reminder and recurrence if due date is being cleared (T054)
        if due_date is None:
            task.reminder_offset = None
            task.recurrence_pattern = None
            task.recurrence_end_date = None

        # Return appropriate message
        if due_date is None:
            return True, f"Due date cleared for task #{task_id}"
        else:
            return True, f"Due date set for task #{task_id}"

    def set_priority(self, task_id: int, priority_str: str) -> tuple[bool, str]:
        """Set the priority level for a task.

        Args:
            task_id: ID of the task to update
            priority_str: Priority level ("low", "medium", "high", case-insensitive)

        Returns:
            tuple[bool, str]: (success, message)
            - (True, "Priority set to {level}") on success
            - (False, "Task #{id} not found") if task doesn't exist
            - (False, "Invalid priority. Use: low, medium, high") if priority invalid

        Side effects:
            - Updates task.priority if successful

        Examples:
            >>> app.set_priority(1, "high")
            (True, "Priority set to high")
            >>> app.set_priority(1, "HIGH")  # Case-insensitive
            (True, "Priority set to high")
            >>> app.set_priority(99, "high")
            (False, "Task #99 not found")
            >>> app.set_priority(1, "urgent")
            (False, "Invalid priority. Use: low, medium, high")
        """
        # Get task by ID
        task = self.get_task(task_id)

        # Handle task not found
        if task is None:
            return False, f"Task #{task_id} not found"

        # Normalize priority (case-insensitive, strip whitespace)
        priority_normalized = priority_str.strip().lower()

        # Validate priority value
        valid_priorities = {
            "low": Priority.LOW,
            "medium": Priority.MEDIUM,
            "high": Priority.HIGH
        }

        if priority_normalized not in valid_priorities:
            return False, "Invalid priority. Use: low, medium, high"

        # Set priority
        task.priority = valid_priorities[priority_normalized]

        return True, f"Priority set to {priority_normalized}"

    def parse_tags(self, tags_str: str) -> tuple[bool, list[str], str]:
        """Parse, normalize, and validate a comma-separated tags string.

        Args:
            tags_str: Comma-separated tags
                (e.g., "work, urgent, home")

        Returns:
            tuple[bool, list[str], str]:
            - (success, parsed_tags, error_message)
            - (True, ["tag1", "tag2"], "") if valid
            - (False, [], "Tag 'x' invalid...") if fails

        Validation Rules:
            - Tags must be alphanumeric + hyphen only (a-z, A-Z, 0-9, -)
            - Tags must be <= 20 characters
            - Empty string returns empty list (valid for clearing tags)
            - Whitespace is stripped from each tag
            - Tags are lowercased for consistency
            - Duplicate tags are removed

        Examples:
            >>> parse_tags("work, urgent, home")
            (True, ["work", "urgent", "home"], "")
            >>> parse_tags("Work, URGENT, work")  # Deduplication
            (True, ["work", "urgent"], "")
            >>> parse_tags("")  # Empty clears tags
            (True, [], "")
            >>> parse_tags("work, invalid!, home")
            (False, [], "Tag 'invalid!' contains invalid...")
            # Error message truncated for line length
        """
        import re

        # Handle empty string (clear tags)
        if not tags_str or not tags_str.strip():
            return True, [], ""

        # Split by comma, strip whitespace, lowercase, and deduplicate
        raw_tags = [tag.strip().lower() for tag in tags_str.split(",")]

        # Remove empty strings after stripping
        raw_tags = [tag for tag in raw_tags if tag]

        # Validate each tag
        tag_pattern = re.compile(r"^[a-z0-9-]+$")
        validated_tags = []
        seen_tags = set()

        for tag in raw_tags:
            # Skip duplicates
            if tag in seen_tags:
                continue

            # Check length
            if len(tag) > 20:
                error_msg = (
                    f"Tag '{tag}' exceeds maximum length of 20 "
                    "characters"
                )
                return False, [], error_msg

            # Check format (alphanumeric + hyphen only)
            if not tag_pattern.match(tag):
                error_msg = (
                    f"Tag '{tag}' contains invalid characters. "
                    "Use only letters, numbers, and hyphens"
                )
                return False, [], error_msg

            validated_tags.append(tag)
            seen_tags.add(tag)

        return True, validated_tags, ""

    def set_tags(self, task_id: int, tags_str: str) -> tuple[bool, str]:
        """Set tags for a task (overwrites existing tags).

        Args:
            task_id: ID of the task to update
            tags_str: Comma-separated tags
                (e.g., "work, urgent") or empty to clear

        Returns:
            tuple[bool, str]: (success, message)
            - (True, "Tags set: #tag1 #tag2 (2 tags)")
            - (True, "Tags cleared") when empty string
            - (False, "Task #{id} not found") if missing
            - (False, "Tag 'x' contains invalid...") if fails

        Side effects:
            - Overwrites task.tags with new tag list (or empty list)

        Examples:
            >>> app.set_tags(1, "work, urgent")
            (True, "Tags set: #work #urgent...")
            >>> app.set_tags(1, "")  # Clear tags
            (True, "Tags cleared")
            >>> app.set_tags(99, "work")
            (False, "Task #99 not found")
            >>> app.set_tags(1, "invalid!")
            (False, "Tag 'invalid!' contains invalid...")
        """
        # Get task by ID
        task = self.get_task(task_id)

        # Handle task not found
        if task is None:
            return False, f"Task #{task_id} not found"

        # Parse and validate tags
        success, validated_tags, error_message = self.parse_tags(tags_str)

        if not success:
            return False, error_message

        # Set tags (overwrite behavior)
        task.tags = validated_tags

        # Return appropriate success message
        if not validated_tags:
            return True, "Tags cleared"
        else:
            tags_display = " ".join(f"#{tag}" for tag in validated_tags)
            tag_count = len(validated_tags)
            tag_word = "tag" if tag_count == 1 else "tags"
            return True, f"Tags set: {tags_display} ({tag_count} {tag_word})"

    def filter_by_priority(self, priority_str: str) -> list[Task]:
        """Filter tasks by priority level.

        Args:
            priority_str: Priority level ("low", "medium", "high", case-insensitive)

        Returns:
            list[Task]: Tasks matching the specified priority

        Examples:
            >>> app.filter_by_priority("high")
            [Task(id=1, priority=HIGH...), ...]
            >>> app.filter_by_priority("medium")
            [Task(id=2, priority=MEDIUM...), ...]
        """
        # Normalize priority (case-insensitive, strip whitespace)
        priority_normalized = priority_str.strip().lower()

        # Map string to Priority enum
        priority_map = {
            "low": Priority.LOW,
            "medium": Priority.MEDIUM,
            "high": Priority.HIGH
        }

        # Get target priority
        # (return [] if invalid - validated by filter_tasks)
        target_priority = priority_map.get(priority_normalized)
        if target_priority is None:
            return []

        # Filter tasks by priority
        return [task for task in self._tasks if task.priority == target_priority]

    def filter_by_tag(self, tag_name: str) -> list[Task]:
        """Filter tasks by tag name (case-insensitive).

        Args:
            tag_name: Tag to filter by (case-insensitive)

        Returns:
            list[Task]: Tasks containing the specified tag

        Examples:
            >>> app.filter_by_tag("work")
            [Task(id=1, tags=["work", "urgent"], ...), ...]
            >>> app.filter_by_tag("URGENT")  # Case-insensitive
            [Task(id=1, tags=["work", "urgent"], ...), ...]
        """
        # Normalize tag (case-insensitive, strip whitespace)
        tag_normalized = tag_name.strip().lower()

        # Filter tasks that have this tag
        return [task for task in self._tasks if tag_normalized in task.tags]

    def filter_by_status(self, status_str: str) -> list[Task]:
        """Filter tasks by completion status.

        Args:
            status_str: Status to filter by
                ("completed" or "pending", case-insensitive)

        Returns:
            list[Task]: Tasks matching the specified status

        Examples:
            >>> app.filter_by_status("completed")
            [Task(id=1, completed=True...), ...]
            >>> app.filter_by_status("pending")
            [Task(id=2, completed=False...), ...]
        """
        # Normalize status (case-insensitive, strip whitespace)
        status_normalized = status_str.strip().lower()

        # Map status to boolean
        # (return [] if invalid - validated by filter_tasks)
        if status_normalized == "completed":
            target_completed = True
        elif status_normalized == "pending":
            target_completed = False
        else:
            return []

        # Filter tasks by completion status
        return [task for task in self._tasks if task.completed == target_completed]

    def filter_tasks(self, field: str, value: str) -> tuple[bool, list[str], str]:
        """Filter tasks by specified field and value.

        Args:
            field: Field to filter by ("priority", "tag", "status")
            value: Value to match (field-specific format)

        Returns:
            tuple[bool, list[str], str]: (success, formatted_tasks, error_message)
            - (True, ["1. [ ] !!! Task #work", ...], "") on success
            - (True, [], "") when no tasks match (not an error)
            - (False, [], "Invalid field...") on validation error

        Field-specific validation:
            - priority: value must be "low", "medium", or "high"
            - tag: value can be any string (case-insensitive matching)
            - status: value must be "completed" or "pending"

        Examples:
            >>> app.filter_tasks("priority", "high")
            (True, ["1. [ ] !!! High priority task"], "")
            >>> app.filter_tasks("tag", "work")
            (True, ["1. [ ] !! Task #work #urgent"], "")
            >>> app.filter_tasks("status", "completed")
            (True, ["1. [x] !! Done task"], "")
            >>> app.filter_tasks("invalid", "value")
            (False, [], "Invalid field 'invalid'. Use: priority, tag, status")
        """
        # Normalize field (case-insensitive, strip whitespace)
        field_normalized = field.strip().lower()

        # Validate field
        valid_fields = ["priority", "tag", "status", "overdue"]
        if field_normalized not in valid_fields:
            return False, [], f"Invalid field '{field}'. Use: priority, tag, status, overdue"

        # Validate value based on field type
        if field_normalized == "priority":
            valid_priorities = ["low", "medium", "high"]
            if value.strip().lower() not in valid_priorities:
                return False, [], f"Invalid priority '{value}'. Use: low, medium, high"
            filtered_tasks = self.filter_by_priority(value)

        elif field_normalized == "tag":
            # Tag value validation: any non-empty string
            if not value or not value.strip():
                return False, [], "Tag name cannot be empty"
            filtered_tasks = self.filter_by_tag(value)

        elif field_normalized == "status":
            valid_statuses = ["completed", "pending"]
            if value.strip().lower() not in valid_statuses:
                return False, [], f"Invalid status '{value}'. Use: completed, pending"
            filtered_tasks = self.filter_by_status(value)

        elif field_normalized == "overdue":
            # Overdue filter doesn't require a value parameter, just show overdue tasks
            filtered_tasks = self.get_overdue_tasks()

        # Format filtered tasks
        formatted_tasks = [str(task) for task in filtered_tasks]

        return True, formatted_tasks, ""

    def search_tasks(self, keyword: str) -> tuple[bool, list[str], str]:
        """Search tasks by keyword in title or description (case-insensitive).

        Args:
            keyword: Search term to match (case-insensitive substring matching)

        Returns:
            tuple[bool, list[str], str]: (success, formatted_tasks, error_message)
            - (True, ["1. [ ] !!! Task with keyword", ...], "") on success
            - (True, [], "") when no tasks match (not an error)
            - (False, [], "Keyword cannot be empty") on validation error

        Search Logic:
            - Searches both title AND description fields
            - Case-insensitive substring matching
            - Returns task if keyword found in either field

        Examples:
            >>> app.search_tasks("meeting")
            (True, ["1. [ ] !! Sprint meeting", "2. [ ] !! Client meeting"], "")
            >>> app.search_tasks("URGENT")  # Case-insensitive
            (True, ["3. [ ] !!! Urgent bug fix"], "")
            >>> app.search_tasks("")
            (False, [], "Keyword cannot be empty")
            >>> app.search_tasks("nonexistent")
            (True, [], "")  # No matches, not an error
        """
        # Validate keyword (non-empty)
        if not keyword or not keyword.strip():
            return False, [], "Keyword cannot be empty"

        # Normalize keyword for case-insensitive matching
        keyword_normalized = keyword.strip().lower()

        # Search tasks by keyword in title or description
        matching_tasks = []
        for task in self._tasks:
            # Check if keyword in title (case-insensitive)
            if keyword_normalized in task.title.lower():
                matching_tasks.append(task)
                continue

            # Check if keyword in description (case-insensitive)
            if keyword_normalized in task.description.lower():
                matching_tasks.append(task)

        # Format matching tasks
        formatted_tasks = [str(task) for task in matching_tasks]

        return True, formatted_tasks, ""

    def sort_by_priority(self) -> list[Task]:
        """Sort tasks by priority (high → medium → low) using stable sort.

        Returns:
            list[Task]: Tasks sorted by priority (HIGH first, LOW last)

        Sort Order:
            - HIGH priority first (!!!)
            - MEDIUM priority second (!!)
            - LOW priority last (!)
            - Stable sort: tasks with same priority maintain original order

        Example:
            Before: [Task(priority=LOW), Task(priority=HIGH), Task(priority=MEDIUM)]
            After:  [Task(priority=HIGH), Task(priority=MEDIUM), Task(priority=LOW)]
        """
        # Use sorted() with key function (stable sort)
        # Priority enum has __lt__ defined: HIGH < MEDIUM < LOW
        return sorted(self._tasks, key=lambda task: task.priority)

    def sort_by_title(self) -> list[Task]:
        """Sort tasks by title (A-Z, case-insensitive) using stable sort.

        Returns:
            list[Task]: Tasks sorted alphabetically by title

        Sort Order:
            - Case-insensitive alphabetical (A-Z)
            - Stable sort: tasks with same title maintain original order

        Example:
            Before: ["Zebra", "apple", "Banana"]
            After:  ["apple", "Banana", "Zebra"]
        """
        # sorted() with case-insensitive key (stable sort)
        return sorted(
            self._tasks, key=lambda task: task.title.lower()
        )

    def sort_by_created(self) -> list[Task]:
        """Sort tasks by creation date (newest first, descending) using stable sort.

        Returns:
            list[Task]: Tasks sorted by created_at
                (newest to oldest)

        Sort Order:
            - Newest tasks first (descending order)
            - Stable sort: same time maintains order

        Example:
            Before: [Task(created=Jan-01), Task(created=Jan-03),
                     Task(created=Jan-02)]
            After:  [Task(created=Jan-03), Task(created=Jan-02),
                     Task(created=Jan-01)]
        """
        # sorted() with reverse=True descending (stable sort)
        return sorted(
            self._tasks,
            key=lambda task: task.created_at,
            reverse=True
        )

    def sort_by_due(self) -> list[Task]:
        """Sort tasks by due date (soonest first, None at end) using stable sort.

        Returns:
            list[Task]: Tasks sorted by due_date (soonest first, None at end)

        Sort Order:
            - Tasks with due dates first (soonest to latest)
            - Tasks without due dates at the end
            - Stable sort: same due date maintains order

        Example:
            Before: [Task(due=Jan-03), Task(due=None), Task(due=Jan-01)]
            After:  [Task(due=Jan-01), Task(due=Jan-03), Task(due=None)]
        """
        # Sort with None values at the end
        # Using a tuple key where the first element is False for None (to sort to end)
        # and True for actual dates, second element is the date itself
        return sorted(
            self._tasks,
            key=lambda task: (task.due_date is None, task.due_date if task.due_date else datetime.max)
        )

    def sort_tasks(self, field: str) -> tuple[bool, list[str], str]:
        """Sort tasks by specified field.

        Args:
            field: Field to sort by ("priority", "title", "created", "due")

        Returns:
            tuple[bool, list[str], str]: (success, formatted_tasks, error_message)
            - (True, ["1. [ ] !!! Task", ...], "") on success
            - (False, [], "Invalid field...") on validation error

        Sort Fields:
            - priority: HIGH → MEDIUM → LOW (using Priority enum __lt__)
            - title: A-Z alphabetical (case-insensitive)
            - created: Newest first (descending by created_at)
            - due: Soonest first (None at end)

        Note:
            All sorts use Python's stable sort (sorted() function)

        Examples:
            >>> app.sort_tasks("priority")
            (True, ["1. [ ] !!! High task", "2. [ ] !! Medium task"], "")
            >>> app.sort_tasks("title")
            (True, ["1. [ ] !! Apple", "2. [ ] !! Banana"], "")
            >>> app.sort_tasks("created")
            (True, ["3. [ ] !! Newest", "1. [ ] !! Oldest"], "")
            >>> app.sort_tasks("due")
            (True, ["1. [ ] !! Due tomorrow", "2. [ ] !! No due date"], "")
            >>> app.sort_tasks("invalid")
            (False, [], "Invalid field 'invalid'. Use: priority, title, created, due")
        """
        # Normalize field (case-insensitive, strip whitespace)
        field_normalized = field.strip().lower()

        # Validate field
        valid_fields = ["priority", "title", "created", "due"]
        if field_normalized not in valid_fields:
            return False, [], f"Invalid field '{field}'. Use: priority, title, created, due"

        # Route to specific sort helper
        if field_normalized == "priority":
            sorted_tasks = self.sort_by_priority()
        elif field_normalized == "title":
            sorted_tasks = self.sort_by_title()
        elif field_normalized == "created":
            sorted_tasks = self.sort_by_created()
        elif field_normalized == "due":
            sorted_tasks = self.sort_by_due()

        # Format sorted tasks
        formatted_tasks = [str(task) for task in sorted_tasks]

        return True, formatted_tasks, ""

    def get_overdue_tasks(self) -> list[Task]:
        """Get all overdue tasks.

        Returns:
            list[Task]: List of tasks that are overdue (have due_date in the past and not completed)
        """
        return [task for task in self._tasks if is_overdue(task)]

    def get_active_reminders(self) -> list[ReminderInfo]:
        """Get all active reminders that should be displayed now.

        Returns:
            list[ReminderInfo]: List of ReminderInfo objects for tasks with active reminders

        Note:
            Only includes tasks where should_show_reminder() returns True
        """
        active_reminders = []

        for task in self._tasks:
            if should_show_reminder(task):
                reminder = ReminderInfo(
                    task_id=task.id,
                    title=task.title,
                    due_datetime=task.due_date,  # type: ignore (we know it's not None from should_show_reminder)
                    time_remaining=format_time_remaining(task.due_date)  # type: ignore
                )
                active_reminders.append(reminder)

        return active_reminders

    def set_reminder(
        self,
        task_id: int,
        offset: int | None
    ) -> tuple[bool, str]:
        """Set or clear the reminder for a task.

        Args:
            task_id: ID of task to update
            offset: Reminder offset in minutes, or None to clear

        Returns:
            tuple[bool, str]: (success, message)
            - (True, "Reminder set for task #{id}") when setting a reminder
            - (True, "Reminder cleared for task #{id}") when clearing
            - (False, "Task #{id} not found") if ID doesn't exist
            - (False, "Task must have a due date before setting a reminder") if no due_date

        Side effects:
            - Updates task.reminder_offset
        """
        # Get task by ID
        task = self.get_task(task_id)

        # Handle task not found
        if task is None:
            return False, f"Task #{task_id} not found"

        # Validate task has due_date if setting reminder
        if offset is not None and task.due_date is None:
            return False, "Task must have a due date before setting a reminder"

        # Update reminder offset
        task.reminder_offset = offset

        # Return appropriate message
        if offset is None:
            return True, f"Reminder cleared for task #{task_id}"
        else:
            return True, f"Reminder set for task #{task_id}"

    def set_recurrence(
        self,
        task_id: int,
        pattern: str | None,
        end_date: datetime | None = None
    ) -> tuple[bool, str]:
        """Set or clear the recurrence for a task.

        Args:
            task_id: ID of task to update
            pattern: Recurrence pattern ("daily", "weekly", "monthly"), or None to clear
            end_date: Optional end date for recurrence

        Returns:
            tuple[bool, str]: (success, message)
            - (True, "Recurrence set for task #{id}") when setting recurrence
            - (True, "Recurrence cleared for task #{id}") when clearing
            - (False, "Task #{id} not found") if ID doesn't exist
            - (False, "Task must have a due date before setting recurrence") if no due_date (T051)
            - (False, "Recurrence end date must be on or after due date") if end_date < due_date (T052)

        Side effects:
            - Updates task.recurrence_pattern and task.recurrence_end_date
        """
        # Get task by ID
        task = self.get_task(task_id)

        # Handle task not found
        if task is None:
            return False, f"Task #{task_id} not found"

        # Validate task has due_date if setting recurrence (T051)
        if pattern is not None and task.due_date is None:
            return False, "Task must have a due date before setting recurrence"

        # Validate recurrence_end_date >= due_date (T052)
        if pattern is not None and end_date is not None and task.due_date is not None:
            if end_date < task.due_date:
                return False, "Recurrence end date must be on or after due date"

        # Update recurrence fields
        task.recurrence_pattern = pattern
        task.recurrence_end_date = end_date

        # Return appropriate message
        if pattern is None:
            return True, f"Recurrence cleared for task #{task_id}"
        else:
            return True, f"Recurrence set for task #{task_id}"


# Advanced Level: Datetime helper functions


def is_overdue(task: Task) -> bool:
    """Check if a task is overdue.

    Args:
        task: Task to check

    Returns:
        True if task has a due_date and it's in the past, False otherwise
    """
    if task.due_date is None or task.completed:
        return False
    return datetime.now() > task.due_date


def parse_due_datetime(date_str: str, time_str: str) -> datetime:
    """Parse due date and time strings into datetime object.

    Args:
        date_str: Date in YYYY-MM-DD format
        time_str: Time in HH:MM format (24-hour)

    Returns:
        datetime object combining date and time

    Raises:
        ValueError: If date or time format is invalid
    """
    combined_str = f"{date_str} {time_str}"
    return datetime.strptime(combined_str, "%Y-%m-%d %H:%M")


def format_due_datetime(dt: datetime) -> str:
    """Format datetime object to display string.

    Args:
        dt: Datetime object to format

    Returns:
        Formatted string in "YYYY-MM-DD HH:MM" format
    """
    return dt.strftime("%Y-%m-%d %H:%M")


# Advanced Level: Reminder helper functions


def calculate_trigger_time(due_date: datetime, offset: int) -> datetime:
    """Calculate when a reminder should trigger based on due date and offset.

    Args:
        due_date: When the task is due
        offset: Minutes before due_date to trigger reminder

    Returns:
        datetime when reminder should trigger (due_date - offset minutes)

    Example:
        >>> due = datetime(2025, 12, 28, 14, 0)  # 2:00 PM
        >>> calculate_trigger_time(due, 60)      # 60 minutes before
        datetime(2025, 12, 28, 13, 0)           # 1:00 PM
    """
    return due_date - timedelta(minutes=offset)


def should_show_reminder(task: Task) -> bool:
    """Check if a task's reminder should be displayed now.

    A reminder should be shown if:
    - Task has a due_date
    - Task has a reminder_offset set
    - Task is not completed
    - Current time >= trigger time (due_date - offset)
    - Current time < due_date (not yet overdue)

    Args:
        task: Task to check

    Returns:
        True if reminder should be shown, False otherwise
    """
    # Must have due date and reminder offset
    if task.due_date is None or task.reminder_offset is None:
        return False

    # Don't remind for completed tasks
    if task.completed:
        return False

    # Calculate trigger time
    trigger_time = calculate_trigger_time(task.due_date, task.reminder_offset)
    now = datetime.now()

    # Show if we're past trigger time but before due time
    return trigger_time <= now < task.due_date


def format_time_remaining(due_date: datetime) -> str:
    """Format time remaining until due date as human-readable string.

    Args:
        due_date: When the task is due

    Returns:
        Human-readable time remaining (e.g., "2 hours", "30 minutes", "1 day")

    Examples:
        >>> format_time_remaining(datetime.now() + timedelta(hours=2))
        "2 hours"
        >>> format_time_remaining(datetime.now() + timedelta(minutes=30))
        "30 minutes"
        >>> format_time_remaining(datetime.now() + timedelta(days=1))
        "1 day"
    """
    time_diff = due_date - datetime.now()
    total_seconds = int(time_diff.total_seconds())

    # Calculate units
    days = total_seconds // 86400
    hours = (total_seconds % 86400) // 3600
    minutes = (total_seconds % 3600) // 60

    # Format based on largest unit
    if days > 0:
        return f"{days} day{'s' if days != 1 else ''}"
    elif hours > 0:
        return f"{hours} hour{'s' if hours != 1 else ''}"
    elif minutes > 0:
        return f"{minutes} minute{'s' if minutes != 1 else ''}"
    else:
        return "less than 1 minute"


# Advanced Level: Recurring task helper functions


def calculate_next_occurrence(due_date: datetime, pattern: str) -> datetime:
    """Calculate the next occurrence date for a recurring task.

    Args:
        due_date: Current due date
        pattern: Recurrence pattern ("daily", "weekly", "monthly")

    Returns:
        Next occurrence datetime based on pattern

    Examples:
        >>> due = datetime(2025, 12, 28, 14, 0)
        >>> calculate_next_occurrence(due, "daily")
        datetime(2025, 12, 29, 14, 0)
        >>> calculate_next_occurrence(due, "weekly")
        datetime(2026, 1, 4, 14, 0)
        >>> calculate_next_occurrence(due, "monthly")
        datetime(2026, 1, 28, 14, 0)

    Edge cases (T042):
        - Monthly recurrence on Feb 29 → next occurrence is Feb 28 (or 29 in leap year)
        - Monthly recurrence on day 31 → next occurrence is last day of month (28/29/30/31)
    """
    if pattern == "daily":
        return due_date + timedelta(days=1)
    elif pattern == "weekly":
        return due_date + timedelta(weeks=1)
    elif pattern == "monthly":
        # Handle monthly recurrence with edge cases
        # Calculate next month
        next_month = due_date.month + 1
        next_year = due_date.year

        if next_month > 12:
            next_month = 1
            next_year += 1

        # Try to use same day of month
        try:
            return due_date.replace(year=next_year, month=next_month)
        except ValueError:
            # Day doesn't exist in next month (e.g., Jan 31 → Feb 31 invalid)
            # Use last day of next month
            if next_month == 12:
                # If next month is December, last day is 31
                last_day = 31
            else:
                # Find last day by trying to create date on 1st of month after next, then subtract 1 day
                first_of_month_after = datetime(next_year, next_month + 1 if next_month < 12 else 1, 1)
                if next_month == 12:
                    first_of_month_after = datetime(next_year + 1, 1, 1)
                last_day_date = first_of_month_after - timedelta(days=1)
                last_day = last_day_date.day

            return due_date.replace(year=next_year, month=next_month, day=last_day)
    else:
        # Should not reach here if validation is working
        return due_date


def generate_recurring_task(task: Task, next_id: int) -> Task | None:
    """Generate a new task instance for a recurring task.

    Args:
        task: Original task to recur from
        next_id: ID to assign to the new task

    Returns:
        New Task instance with next occurrence date, or None if recurrence should stop

    Note:
        - Preserves title, description, priority, tags (T055)
        - Calculates next due_date based on recurrence_pattern
        - Resets completed status to False
        - Preserves reminder_offset if set
        - Does NOT copy recurrence_end_date check (caller should validate)
    """
    # Must have recurrence pattern and due date
    if task.recurrence_pattern is None or task.due_date is None:
        return None

    # Calculate next occurrence
    next_due_date = calculate_next_occurrence(task.due_date, task.recurrence_pattern)

    # Check if next occurrence exceeds end date
    if task.recurrence_end_date is not None and next_due_date > task.recurrence_end_date:
        return None  # Stop recurring

    # Create new task instance preserving specified fields (T055)
    new_task = Task(
        id=next_id,
        title=task.title,
        description=task.description,
        completed=False,  # Reset completion status
        priority=task.priority,
        tags=task.tags.copy() if task.tags else [],
        due_date=next_due_date,
        reminder_offset=task.reminder_offset,  # Preserve reminder
        recurrence_pattern=task.recurrence_pattern,  # Preserve recurrence
        recurrence_end_date=task.recurrence_end_date
    )

    return new_task
