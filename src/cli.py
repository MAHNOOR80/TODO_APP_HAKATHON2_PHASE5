"""Command-line interface for the Todo CLI application.

This module provides the interactive menu loop and user input handling.
It calls TodoApp methods and formats output for display.
"""

import sys
from datetime import datetime
from .todo_app import TodoApp, parse_due_datetime, format_due_datetime, ReminderInfo
from .task import (
    REMINDER_1_DAY,
    REMINDER_1_HOUR,
    REMINDER_30_MIN,
    REMINDER_10_MIN,
    RECURRENCE_DAILY,
    RECURRENCE_WEEKLY,
    RECURRENCE_MONTHLY,
    is_valid_reminder_offset,
    is_valid_recurrence_pattern
)


SEPARATOR = "-" * 40


# Advanced Level: Validation helper functions


def validate_date_format(date_str: str) -> bool:
    """Validate date string format (YYYY-MM-DD).

    Args:
        date_str: Date string to validate

    Returns:
        True if format is valid, False otherwise

    Examples:
        >>> validate_date_format("2025-12-28")
        True
        >>> validate_date_format("12/28/2025")
        False
        >>> validate_date_format("2025-13-01")  # Invalid month
        False
    """
    if not date_str:
        return False

    try:
        datetime.strptime(date_str, "%Y-%m-%d")
        return True
    except ValueError:
        return False


def validate_time_format(time_str: str) -> bool:
    """Validate time string format (HH:MM in 24-hour format).

    Args:
        time_str: Time string to validate

    Returns:
        True if format is valid, False otherwise

    Examples:
        >>> validate_time_format("14:30")
        True
        >>> validate_time_format("9:30")  # Missing leading zero
        False
        >>> validate_time_format("25:00")  # Invalid hour
        False
    """
    if not time_str:
        return False

    try:
        datetime.strptime(time_str, "%H:%M")
        return True
    except ValueError:
        return False


def display_header() -> None:
    """Display the application header."""
    print(SEPARATOR)
    print("TODO CLI APPLICATION")
    print(SEPARATOR)
    print("Type a command to continue.")
    print()


def display_menu() -> None:
    """Display available commands."""
    print("Available Commands:")
    print("  add                    Add a new task")
    print("  list                   List all tasks")
    print("  update <id>            Update a task")
    print("  delete <id>            Delete a task")
    print("  complete <id>          Mark task as complete")
    print("  due <id> [clear]       Set or clear task due date")
    print("  remind <id> [clear]    Set or clear task reminder")
    print("  recur <id> [clear]     Set or clear task recurrence")
    print("  priority <id> <level>  Set task priority (low, medium, high)")
    print("  tag <id> <tags>        Set task tags (comma-separated, empty to clear)")
    print("  filter <field> <value> Filter tasks (priority/tag/status/overdue)")
    print("  search <keyword>       Search tasks by keyword in title/description")
    print("  sort <field>           Sort tasks (priority/title/created/due)")
    print("  quit                   Exit the application")
    print(SEPARATOR)


def handle_add(app: TodoApp) -> None:
    """Handle add command to create a new task."""
    print("\nAdd New Task")
    print(SEPARATOR)

    title = input("Title (required): ").strip()
    description = input("Description (optional): ").strip()

    # Advanced Level: Optional due date prompts
    due_date = None
    add_due = input("Add due date? (y/n): ").strip().lower()
    if add_due == 'y':
        while True:
            date_str = input("Due date (YYYY-MM-DD): ").strip()
            time_str = input("Due time (HH:MM, 24-hour): ").strip()

            # Validate date and time format
            if not validate_date_format(date_str):
                print("Invalid date format. Please use YYYY-MM-DD (e.g., 2025-12-28)")
                continue
            if not validate_time_format(time_str):
                print("Invalid time format. Please use HH:MM in 24-hour format (e.g., 14:30)")
                continue

            try:
                due_date = parse_due_datetime(date_str, time_str)
                break
            except ValueError as e:
                print(f"Error parsing date/time: {e}")
                print("Please try again.")

    # Create task first
    success, message = app.add_task(title, description, due_date)
    print(message)

    # Advanced Level: Optional reminder prompts (only if due date was set)
    if success and due_date is not None:
        add_reminder = input("Add reminder? (y/n): ").strip().lower()
        if add_reminder == 'y':
            # Extract task ID from success message (e.g., "Task #1 added successfully")
            task_id = int(message.split('#')[1].split()[0])

            # Show reminder offset menu
            print("\nReminder Options:")
            print("  1. 1 day before (1440 minutes)")
            print("  2. 1 hour before (60 minutes)")
            print("  3. 30 minutes before")
            print("  4. 10 minutes before")

            choice = input("Choose option (1-4): ").strip()

            # Map choice to offset
            offset_map = {
                '1': REMINDER_1_DAY,
                '2': REMINDER_1_HOUR,
                '3': REMINDER_30_MIN,
                '4': REMINDER_10_MIN
            }

            if choice in offset_map:
                offset = offset_map[choice]
                success_rem, message_rem = app.set_reminder(task_id, offset)
                print(message_rem)
            else:
                print("Invalid choice. No reminder set.")

    # Advanced Level: Optional recurrence prompts (only if due date was set)
    if success and due_date is not None:
        add_recurrence = input("Add recurrence? (y/n): ").strip().lower()
        if add_recurrence == 'y':
            # Extract task ID from success message (e.g., "Task #1 added successfully")
            task_id = int(message.split('#')[1].split()[0])

            # Show recurrence pattern menu
            print("\nRecurrence Options:")
            print("  1. Daily")
            print("  2. Weekly")
            print("  3. Monthly")

            choice = input("Choose option (1-3): ").strip()

            # Map choice to pattern
            pattern_map = {
                '1': RECURRENCE_DAILY,
                '2': RECURRENCE_WEEKLY,
                '3': RECURRENCE_MONTHLY
            }

            if choice in pattern_map:
                pattern = pattern_map[choice]

                # Optional end date prompt (T050)
                add_end_date = input("Set end date for recurrence? (y/n): ").strip().lower()
                end_date = None

                if add_end_date == 'y':
                    while True:
                        end_date_str = input("End date (YYYY-MM-DD): ").strip()
                        end_time_str = input("End time (HH:MM, 24-hour): ").strip()

                        # Validate date and time format
                        if not validate_date_format(end_date_str):
                            print("Invalid date format. Please use YYYY-MM-DD (e.g., 2025-12-28)")
                            continue
                        if not validate_time_format(end_time_str):
                            print("Invalid time format. Please use HH:MM in 24-hour format (e.g., 14:30)")
                            continue

                        try:
                            end_date = parse_due_datetime(end_date_str, end_time_str)
                            break
                        except ValueError as e:
                            print(f"Error parsing date/time: {e}")
                            print("Please try again.")

                success_rec, message_rec = app.set_recurrence(task_id, pattern, end_date)
                print(message_rec)
            else:
                print("Invalid choice. No recurrence set.")

    print(SEPARATOR)


def handle_list(app: TodoApp) -> None:
    """Handle list command to display all tasks."""
    print("\nYour Tasks")
    print(SEPARATOR)

    tasks = app.list_tasks()

    if not tasks:
        print("No tasks found.")
    else:
        for task in tasks:
            print(task)

    print(SEPARATOR)


def handle_complete(app: TodoApp, parts: list[str]) -> None:
    """Handle complete command to mark a task as done."""
    if len(parts) < 2:
        print("Usage: complete <id>")
        return

    try:
        task_id = int(parts[1])
    except ValueError:
        print("Error: Task ID must be a number.")
        return

    success, message = app.mark_complete(task_id)
    print(message)


def handle_update(app: TodoApp, parts: list[str]) -> None:
    """Handle update command to modify task details."""
    if len(parts) < 2:
        print("Usage: update <id>")
        return

    try:
        task_id = int(parts[1])
    except ValueError:
        print("Error: Task ID must be a number.")
        return

    print("\nUpdate Task")
    print("(Press Enter to keep current value)")

    new_title = input("New Title: ").strip() or None
    new_desc = input("New Description: ").strip() or None

    success, message = app.update_task(
        task_id,
        title=new_title,
        description=new_desc
    )
    print(message)


def handle_delete(app: TodoApp, parts: list[str]) -> None:
    """Handle delete command to remove a task."""
    if len(parts) < 2:
        print("Usage: delete <id>")
        return

    try:
        task_id = int(parts[1])
    except ValueError:
        print("Error: Task ID must be a number.")
        return

    success, message = app.delete_task(task_id)
    print(message)


def handle_due(app: TodoApp, parts: list[str]) -> None:
    """Handle due command to set or clear task due date.

    Usage:
        due <id>        - Set due date for task
        due <id> clear  - Clear due date for task
    """
    if len(parts) < 2:
        print("Usage: due <id> [clear]")
        return

    try:
        task_id = int(parts[1])
    except ValueError:
        print("Error: Task ID must be a number.")
        return

    # Check if clearing due date
    if len(parts) >= 3 and parts[2].lower() == "clear":
        success, message = app.set_due_date(task_id, None)
        print(message)
        return

    # Set due date - prompt for date and time
    print(f"\nSet Due Date for Task #{task_id}")
    print(SEPARATOR)

    while True:
        date_str = input("Due date (YYYY-MM-DD): ").strip()
        time_str = input("Due time (HH:MM, 24-hour): ").strip()

        # Validate date and time format
        if not validate_date_format(date_str):
            print("Invalid date format. Please use YYYY-MM-DD (e.g., 2025-12-28)")
            continue
        if not validate_time_format(time_str):
            print("Invalid time format. Please use HH:MM in 24-hour format (e.g., 14:30)")
            continue

        try:
            due_date = parse_due_datetime(date_str, time_str)
            success, message = app.set_due_date(task_id, due_date)
            print(message)
            break
        except ValueError as e:
            print(f"Error parsing date/time: {e}")
            print("Please try again.")

    print(SEPARATOR)


def handle_remind(app: TodoApp, parts: list[str]) -> None:
    """Handle remind command to set or clear task reminder.

    Usage:
        remind <id>        - Set reminder for task
        remind <id> clear  - Clear reminder for task
    """
    if len(parts) < 2:
        print("Usage: remind <id> [clear]")
        return

    try:
        task_id = int(parts[1])
    except ValueError:
        print("Error: Task ID must be a number.")
        return

    # Check if clearing reminder
    if len(parts) >= 3 and parts[2].lower() == "clear":
        success, message = app.set_reminder(task_id, None)
        print(message)
        return

    # Set reminder - show preset offset menu
    print(f"\nSet Reminder for Task #{task_id}")
    print(SEPARATOR)
    print("Reminder Options:")
    print("  1. 1 day before (1440 minutes)")
    print("  2. 1 hour before (60 minutes)")
    print("  3. 30 minutes before")
    print("  4. 10 minutes before")
    print()

    choice = input("Choose option (1-4): ").strip()

    # Validate choice (T039)
    if choice not in ['1', '2', '3', '4']:
        print("Invalid choice. Please choose 1-4.")
        return

    # Map choice to offset
    offset_map = {
        '1': REMINDER_1_DAY,
        '2': REMINDER_1_HOUR,
        '3': REMINDER_30_MIN,
        '4': REMINDER_10_MIN
    }

    offset = offset_map[choice]
    success, message = app.set_reminder(task_id, offset)
    print(message)
    print(SEPARATOR)


def handle_recur(app: TodoApp, parts: list[str]) -> None:
    """Handle recur command to set or clear task recurrence.

    Usage:
        recur <id>        - Set recurrence for task
        recur <id> clear  - Clear recurrence for task
    """
    if len(parts) < 2:
        print("Usage: recur <id> [clear]")
        return

    try:
        task_id = int(parts[1])
    except ValueError:
        print("Error: Task ID must be a number.")
        return

    # Check if clearing recurrence
    if len(parts) >= 3 and parts[2].lower() == "clear":
        success, message = app.set_recurrence(task_id, None)
        print(message)
        return

    # Set recurrence - show pattern menu
    print(f"\nSet Recurrence for Task #{task_id}")
    print(SEPARATOR)
    print("Recurrence Options:")
    print("  1. Daily")
    print("  2. Weekly")
    print("  3. Monthly")
    print()

    choice = input("Choose option (1-3): ").strip()

    # Validate choice (T053)
    if choice not in ['1', '2', '3']:
        print("Invalid choice. Please choose 1-3.")
        return

    # Map choice to pattern
    pattern_map = {
        '1': RECURRENCE_DAILY,
        '2': RECURRENCE_WEEKLY,
        '3': RECURRENCE_MONTHLY
    }

    pattern = pattern_map[choice]

    # Optional end date prompt (T050)
    add_end_date = input("Set end date for recurrence? (y/n): ").strip().lower()
    end_date = None

    if add_end_date == 'y':
        while True:
            end_date_str = input("End date (YYYY-MM-DD): ").strip()
            end_time_str = input("End time (HH:MM, 24-hour): ").strip()

            # Validate date and time format
            if not validate_date_format(end_date_str):
                print("Invalid date format. Please use YYYY-MM-DD (e.g., 2025-12-28)")
                continue
            if not validate_time_format(end_time_str):
                print("Invalid time format. Please use HH:MM in 24-hour format (e.g., 14:30)")
                continue

            try:
                end_date = parse_due_datetime(end_date_str, end_time_str)
                break
            except ValueError as e:
                print(f"Error parsing date/time: {e}")
                print("Please try again.")

    success, message = app.set_recurrence(task_id, pattern, end_date)
    print(message)
    print(SEPARATOR)


def handle_priority(app: TodoApp, parts: list[str]) -> None:
    """Handle priority command to set task priority.

    Args:
        app: TodoApp instance
        parts: Command parts from user input (e.g., ["priority", "1", "high"])

    Examples:
        priority 1 high
        priority 2 medium
        priority 3 low
    """
    # Validate arguments
    if len(parts) < 3:
        print("Usage: priority <id> <level>")
        print("Levels: low, medium, high")
        return

    # Parse task ID
    try:
        task_id = int(parts[1])
    except ValueError:
        print("Error: Task ID must be a number.")
        return

    # Get priority level from remaining parts
    # (expect single word like "high", "medium", "low")
    priority_level = parts[2]

    # Set priority via TodoApp
    success, message = app.set_priority(task_id, priority_level)
    print(message)


def handle_tag(app: TodoApp, parts: list[str]) -> None:
    """Handle tag command to set task tags.

    Args:
        app: TodoApp instance
        parts: Command parts from user input (e.g., ["tag", "1", "work,urgent"])

    Examples:
        tag 1 work,urgent
        tag 2 home
        tag 3              (empty tags clears all tags)
    """
    # Validate task ID argument
    if len(parts) < 2:
        print("Usage: tag <id> <tags>")
        print("Tags: Comma-separated (e.g., work,urgent) or empty to clear")
        print("Examples:")
        print("  tag 1 work,urgent")
        print("  tag 2 home")
        print("  tag 3              (clear tags)")
        return

    # Parse task ID
    try:
        task_id = int(parts[1])
    except ValueError:
        print("Error: Task ID must be a number.")
        return

    # Get tags string (join remaining parts to support spaces after comma)
    # If no tags provided (just "tag <id>"), use empty string to clear
    if len(parts) >= 3:
        tags_str = " ".join(parts[2:])
    else:
        tags_str = ""

    # Set tags via TodoApp
    success, message = app.set_tags(task_id, tags_str)
    print(message)


def handle_filter(app: TodoApp, parts: list[str]) -> None:
    """Handle filter command to filter tasks by field and value.

    Args:
        app: TodoApp instance
        parts: Command parts from user input (e.g., ["filter", "priority", "high"])

    Examples:
        filter priority high
        filter tag work
        filter status completed
    """
    # Validate arguments
    if len(parts) < 2:
        print("Usage: filter <field> [<value>]")
        print("Fields:")
        print("  priority <level>   Filter by priority (low, medium, high)")
        print("  tag <name>         Filter by tag name")
        print("  status <state>     Filter by status (completed, pending)")
        print("  overdue            Filter overdue tasks (no value needed)")
        print()
        print("Examples:")
        print("  filter priority high")
        print("  filter tag work")
        print("  filter status completed")
        print("  filter overdue")
        return

    # Get field and value (join remaining parts for multi-word values)
    field = parts[1]
    value = " ".join(parts[2:]) if len(parts) > 2 else ""

    # Filter tasks via TodoApp
    success, filtered_tasks, error_message = app.filter_tasks(field, value)

    # Display error or results
    if not success:
        print(error_message)
        return

    # Display filtered results
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


def handle_search(app: TodoApp, parts: list[str]) -> None:
    """Handle search command to search tasks by keyword.

    Args:
        app: TodoApp instance
        parts: Command parts from user input (e.g., ["search", "meeting"])

    Examples:
        search meeting
        search urgent
        search client project
    """
    # Validate arguments
    if len(parts) < 2:
        print("Usage: search <keyword>")
        print("Search for tasks containing keyword in title or description")
        print()
        print("Examples:")
        print("  search meeting")
        print("  search urgent")
        print("  search client project")
        return

    # Get keyword (join remaining parts for multi-word search)
    keyword = " ".join(parts[1:])

    # Search tasks via TodoApp
    success, search_results, error_message = app.search_tasks(keyword)

    # Display error or results
    if not success:
        print(error_message)
        return

    # Display search results
    print(f"\nSearch Results for '{keyword}'")
    print(SEPARATOR)

    if not search_results:
        print(f"No tasks found for '{keyword}'")
    else:
        for task in search_results:
            print(task)

    print(SEPARATOR)
    print(f"Found {len(search_results)} of {len(app.list_tasks())} total tasks")
    print("(Use 'list' to see all tasks)")
    print(SEPARATOR)


def handle_sort(app: TodoApp, parts: list[str]) -> None:
    """Handle sort command to sort tasks by field.

    Args:
        app: TodoApp instance
        parts: Command parts from user input (e.g., ["sort", "priority"])

    Examples:
        sort priority
        sort title
        sort created
    """
    # Validate arguments
    if len(parts) < 2:
        print("Usage: sort <field>")
        print("Sort tasks by field")
        print()
        print("Fields:")
        print("  priority   Sort by priority (high → medium → low)")
        print("  title      Sort by title (A-Z alphabetical)")
        print("  created    Sort by creation date (newest first)")
        print("  due        Sort by due date (soonest first, None at end)")
        print()
        print("Examples:")
        print("  sort priority")
        print("  sort title")
        print("  sort created")
        print("  sort due")
        return

    # Get field
    field = parts[1]

    # Sort tasks via TodoApp
    success, sorted_tasks, error_message = app.sort_tasks(field)

    # Display error or results
    if not success:
        print(error_message)
        return

    # Display sorted results
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


def display_reminders(app: TodoApp) -> None:
    """Display active reminders at startup.

    Shows all tasks with active reminders in a formatted section before the main menu.
    """
    active_reminders = app.get_active_reminders()

    if not active_reminders:
        return  # No reminders to display

    # Display reminders section
    print()
    print("⏰ REMINDERS - Tasks Due Soon:")
    print(SEPARATOR)

    for reminder in active_reminders:
        formatted_due = format_due_datetime(reminder.due_datetime)
        print(f"  Task #{reminder.task_id}: {reminder.title}")
        print(f"    Due: {formatted_due} (in {reminder.time_remaining})")
        print()

    print(SEPARATOR)
    print()


def run_cli(app: TodoApp) -> None:
    """Run the interactive CLI loop."""
    display_header()
    display_reminders(app)  # Show reminders before menu
    display_menu()

    while True:
        command = input("\n> ").strip()

        if not command:
            continue

        parts = command.split()
        cmd = parts[0].lower()

        if cmd == "quit":
            print("\nGoodbye!")
            sys.exit(0)
        elif cmd == "add":
            handle_add(app)
        elif cmd == "list":
            handle_list(app)
        elif cmd == "complete":
            handle_complete(app, parts)
        elif cmd == "update":
            handle_update(app, parts)
        elif cmd == "delete":
            handle_delete(app, parts)
        elif cmd == "due":
            handle_due(app, parts)
        elif cmd == "remind":
            handle_remind(app, parts)
        elif cmd == "recur":
            handle_recur(app, parts)
        elif cmd == "priority":
            handle_priority(app, parts)
        elif cmd == "tag":
            handle_tag(app, parts)
        elif cmd == "filter":
            handle_filter(app, parts)
        elif cmd == "search":
            handle_search(app, parts)
        elif cmd == "sort":
            handle_sort(app, parts)
        else:
            print(f"Unknown command: {cmd}")
            print("Type one of the available commands.")
