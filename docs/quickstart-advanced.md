# Quickstart Guide: Advanced Level - Intelligent Features

## Overview

This guide covers the Advanced Level features of the Todo CLI application:
- **Due Date Management** (User Story 1)
- **Task Reminders** (User Story 2)
- **Recurring Tasks** (User Story 3)

These features build upon the Basic and Intermediate Level functionality to provide intelligent task management capabilities.

## Prerequisites

Before using Advanced Level features, ensure you understand:
- Basic task operations (add, list, complete, delete)
- Intermediate features (priority, tags, filter, sort)

## User Story 1: Due Date Management

### Setting Due Dates

Create tasks with due dates to track deadlines:

```
> add
Title (required): Finish project proposal
Description (optional): Complete the quarterly project proposal for review
Add due date? (y/n): y
Due date (YYYY-MM-DD): 2025-01-15
Due time (HH:MM, 24-hour): 17:00
Add reminder? (y/n): n
Add recurrence? (y/n): n
Task #1 added successfully
```

### Viewing Due Dates

Tasks display due dates in the list:

```
> list
1. [ ] !! Finish project proposal (Due: 2025-01-15 17:00)
```

### Sorting by Due Date

Sort tasks by due date (soonest first):

```
> sort due
Tasks Sorted by Due
----------------------------------------
1. [ ] !! Finish project proposal (Due: 2025-01-15 17:00)
2. [ ] ! Call dentist (Due: 2025-01-20 09:00)
3. [ ] !! Buy groceries
----------------------------------------
```

### Filtering Overdue Tasks

Show only overdue tasks:

```
> filter overdue
Filtered Tasks (overdue: )
----------------------------------------
1. [ ] !! Missed deadline task (Due: 2024-12-25 10:00) [OVERDUE]
----------------------------------------
```

### Modifying Due Dates

Change or clear due dates:

```
> due 1
Set Due Date for Task #1
----------------------------------------
Due date (YYYY-MM-DD): 2025-01-20
Due time (HH:MM, 24-hour): 18:00
Due date set for task #1
----------------------------------------

> due 1 clear
Due date cleared for task #1
```

## User Story 2: Task Reminders

### Setting Reminders

Create reminders to receive notifications before deadlines:

```
> remind 1
Set Reminder for Task #1
----------------------------------------
Reminder Options:
  1. 1 day before (1440 minutes)
  2. 1 hour before (60 minutes)
  3. 30 minutes before
  4. 10 minutes before

Choose option (1-4): 1
Reminder set for task #1
----------------------------------------
```

### Startup Reminders

When you start the application, active reminders display before the main menu:

```
TODO CLI APPLICATION
----------------------------------------
Type a command to continue.

⏰ REMINDERS - Tasks Due Soon:
----------------------------------------
  Task #1: Finish project proposal
    Due: 2025-01-15 17:00 (in 1 day)

----------------------------------------

Available Commands:
...
```

### Clearing Reminders

Remove reminders from tasks:

```
> remind 1 clear
Reminder cleared for task #1
```

## User Story 3: Recurring Tasks

### Setting Recurrence

Create tasks that automatically repeat:

```
> recur 1
Set Recurrence for Task #1
----------------------------------------
Recurrence Options:
  1. Daily
  2. Weekly
  3. Monthly

Choose option (1-3): 2
Set end date for recurrence? (y/n): y
End date (YYYY-MM-DD): 2025-03-01
End time (HH:MM, 24-hour): 17:00
Recurrence set for task #1
----------------------------------------
```

### Task Completion with Recurrence

When you complete a recurring task, a new instance is automatically created:

```
> complete 1
Task #1 marked complete. New recurring instance created as Task #2.
```

### Managing Recurring Tasks

Clear recurrence to stop automatic generation:

```
> recur 2 clear
Recurrence cleared for task #2
```

## Advanced Command Reference

### New Commands

| Command | Description |
|---------|-------------|
| `due <id> [clear]` | Set or clear due date for task |
| `remind <id> [clear]` | Set or clear reminder for task |
| `recur <id> [clear]` | Set or clear recurrence for task |

### Enhanced Commands

| Command | New Capabilities |
|---------|------------------|
| `add` | Prompts for due date, reminder, and recurrence |
| `list` | Shows due dates, overdue markers, recurrence icons |
| `sort` | New `due` field to sort by due date |
| `filter` | New `overdue` field to filter overdue tasks |

### Command Combinations

Advanced features work together seamlessly:

```
# Create a recurring task with due date and reminder
> add
Title: Weekly team meeting prep
Description: Prepare agenda and materials
Add due date? (y/n): y
Due date (YYYY-MM-DD): 2025-01-20
Due time (HH:MM, 24-hour): 09:00
Add reminder? (y/n): y
Reminder Options:
  1. 1 day before (1440 minutes)
  2. 1 hour before (60 minutes)
  3. 30 minutes before
  4. 10 minutes before
Choose option (1-4): 2
Add recurrence? (y/n): y
Recurrence Options:
  1. Daily
  2. Weekly
  3. Monthly
Choose option (1-3): 2
Set end date for recurrence? (y/n): n
Task #3 added successfully
```

## Best Practices

1. **Start Simple**: Begin with basic due dates before adding reminders and recurrence
2. **Use Reminders Wisely**: Set reminders for important deadlines but not for every task
3. **Set End Dates**: For recurring tasks, consider setting end dates to avoid infinite generation
4. **Combine Features**: Use due dates with reminders for critical tasks
5. **Regular Review**: Check startup reminders to stay on top of upcoming deadlines

## Troubleshooting

### Common Issues

- **Invalid Date Format**: Use YYYY-MM-DD (e.g., 2025-01-15) for all date inputs
- **Invalid Time Format**: Use HH:MM 24-hour format (e.g., 14:30 for 2:30 PM)
- **Missing Due Date**: Reminders and recurrence require due dates to be set first
- **Overdue Tasks**: Tasks with past due dates show [OVERDUE] marker

### Error Messages

All error messages are designed to be user-friendly and actionable:

- `"Task must have a due date before setting a reminder"` → Set a due date first
- `"Recurrence end date must be on or after due date"` → End date must be after due date
- `"Invalid date format. Please use YYYY-MM-DD"` → Check date format
- `"Invalid time format. Please use HH:MM in 24-hour format"` → Check time format