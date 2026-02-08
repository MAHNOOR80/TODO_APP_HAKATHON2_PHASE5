# Quickstart Guide - Advanced Level Features

This guide demonstrates common workflows using the Advanced Level features: due dates, reminders, and recurring tasks.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Due Date Workflows](#due-date-workflows)
3. [Reminder Workflows](#reminder-workflows)
4. [Recurring Task Workflows](#recurring-task-workflows)
5. [Combined Workflows](#combined-workflows)
6. [Tips & Best Practices](#tips--best-practices)

## Getting Started

Launch the application:

```bash
python -m src
```

If you have tasks with active reminders, you'll see them before the main menu:

```
=== TODO CLI - Advanced Level ===

⏰ REMINDERS - Tasks Due Soon:
--------------------------------------------------
  [2] Team meeting - Due in 45 minutes
  [5] Submit report - Due in 3 hours 30 minutes
--------------------------------------------------

Main Menu:
  add       - Add new task
  list      - View all tasks
  ...
```

## Due Date Workflows

### Scenario 1: Creating Tasks with Deadlines

**Goal**: Add tasks with specific due dates and times

```
> add
Title: Submit quarterly report
Description: Q4 financial summary

Set a due date? (y/n): y
Due date (YYYY-MM-DD): 2025-12-31
Due time (HH:MM, 24-hour): 17:00

Set a reminder? (y/n): n
Make this recurring? (y/n): n

Task #1 added successfully
Due: 2025-12-31 17:00
```

**Result**: Task created with deadline, no reminder or recurrence

### Scenario 2: Adding Due Dates to Existing Tasks

**Goal**: Set deadlines on tasks created without due dates

```
> add
Title: Review documentation
Task #2 added successfully

> due 2
Current due date: None

Due date (YYYY-MM-DD): 2025-12-28
Due time (HH:MM, 24-hour): 14:00

Due date set to: 2025-12-28 14:00
```

**Result**: Existing task now has a deadline

### Scenario 3: Viewing Tasks with Deadlines

**Goal**: See all tasks sorted by due date

```
> list

Tasks
----------------------------------------
1. [ ] !!! Submit quarterly report (Due: 2025-12-31 17:00) #work
2. [ ] !! Review documentation (Due: 2025-12-28 14:00) #docs
3. [ ] !! Update team wiki #documentation
----------------------------------------

> sort due

Tasks Sorted by Due Date
----------------------------------------
2. [ ] !! Review documentation (Due: 2025-12-28 14:00) #docs
1. [ ] !!! Submit quarterly report (Due: 2025-12-31 17:00) #work
3. [ ] !! Update team wiki
----------------------------------------
```

**Result**: Tasks sorted by soonest due date first, tasks without due dates appear last

### Scenario 4: Handling Overdue Tasks

**Goal**: Identify tasks that missed their deadline

```
> list

Tasks
----------------------------------------
1. [ ] [OVERDUE] !!! Submit report (Due: 2025-12-26 17:00) #work #urgent
2. [ ] !! Review PR (Due: 2025-12-28 14:00) #code-review
----------------------------------------

> filter overdue

Filtered Tasks (overdue)
----------------------------------------
1. [ ] [OVERDUE] !!! Submit report (Due: 2025-12-26 17:00) #work #urgent
----------------------------------------
Showing 1 of 2 total tasks
```

**Result**: Overdue tasks clearly marked with `[OVERDUE]` prefix

### Scenario 5: Clearing Due Dates

**Goal**: Remove deadline from a task

```
> due 1 clear
Current due date: 2025-12-26 17:00

Due date cleared
Reminder cleared (requires due date)
Recurrence cleared (requires due date)

> list
1. [ ] !!! Submit report #work #urgent
```

**Result**: Due date removed, associated reminder and recurrence also cleared

## Reminder Workflows

### Scenario 6: Setting Reminders on Tasks

**Goal**: Get notified before task deadlines

```
> add
Title: Team meeting
Description: Weekly sync with engineering

Set a due date? (y/n): y
Due date (YYYY-MM-DD): 2025-12-28
Due time (HH:MM, 24-hour): 10:00

Set a reminder? (y/n): y
Reminder offset:
  1. 1 day before
  2. 1 hour before
  3. 30 minutes before
  4. 10 minutes before
Select option (1-4): 2

Make this recurring? (y/n): n

Task #3 added successfully
Due: 2025-12-28 10:00
Reminder: 1 hour before
```

**Result**: Task created with reminder set to trigger at 09:00 (1 hour before)

### Scenario 7: Adding Reminders to Existing Tasks

**Goal**: Add reminder to task that already has a due date

```
> remind 1
Current reminder: None
Task due date: 2025-12-31 17:00

Reminder offset:
  1. 1 day before
  2. 1 hour before
  3. 30 minutes before
  4. 10 minutes before
Select option (1-4): 1

Reminder set: 1 day before (2025-12-30 17:00)
```

**Result**: Reminder will trigger on Dec 30 at 5:00 PM (24 hours before deadline)

### Scenario 8: Seeing Active Reminders on Startup

**Goal**: Check which tasks are approaching their deadlines

When you launch the app and current time is Dec 28, 2025 at 09:15:

```bash
python -m src
```

```
=== TODO CLI - Advanced Level ===

⏰ REMINDERS - Tasks Due Soon:
--------------------------------------------------
  [3] Team meeting - Due in 45 minutes
--------------------------------------------------

Main Menu:
  ...
```

**Result**: Reminder displayed automatically because current time (09:15) is within the 1-hour reminder window (09:00-10:00)

### Scenario 9: Changing Reminder Timing

**Goal**: Adjust when you want to be reminded

```
> remind 3
Current reminder: 1 hour before
Task due date: 2025-12-28 10:00

Reminder offset:
  1. 1 day before
  2. 1 hour before
  3. 30 minutes before
  4. 10 minutes before
Select option (1-4): 4

Reminder set: 10 minutes before (2025-12-28 09:50)
```

**Result**: Reminder now triggers closer to deadline (09:50 instead of 09:00)

### Scenario 10: Removing Reminders

**Goal**: Stop getting notifications for a task

```
> remind 3 clear
Current reminder: 10 minutes before

Reminder cleared
```

**Result**: No reminder will appear on startup, even though task still has due date

## Recurring Task Workflows

### Scenario 11: Creating Daily Recurring Tasks

**Goal**: Automate repetitive daily tasks

```
> add
Title: Daily standup
Description: Team sync meeting at 9 AM

Set a due date? (y/n): y
Due date (YYYY-MM-DD): 2025-12-27
Due time (HH:MM, 24-hour): 09:00

Set a reminder? (y/n): y
Reminder offset:
  1. 1 day before
  2. 1 hour before
  3. 30 minutes before
  4. 10 minutes before
Select option (1-4): 4

Make this recurring? (y/n): y
Recurrence pattern:
  1. Daily
  2. Weekly
  3. Monthly
Select option (1-3): 1

Set an end date? (y/n): n

Task #4 added successfully
Due: 2025-12-27 09:00
Reminder: 10 minutes before
Recurrence: Daily (no end date)

> list
4. [ ] !! Daily standup (Due: 2025-12-27 09:00) ⟳ daily #meeting
```

**Result**: Task created with daily recurrence, will auto-generate new instance when completed

### Scenario 12: Completing a Recurring Task

**Goal**: Mark task done and verify new instance is created

```
> complete 4
Task #4 marked complete
New recurring instance created: Task #5

> list
4. [X] !! Daily standup (Due: 2025-12-27 09:00) ⟳ daily #meeting
5. [ ] !! Daily standup (Due: 2025-12-28 09:00) ⟳ daily #meeting
```

**Result**: Original task completed, new task created with tomorrow's date (Dec 28)

### Scenario 13: Weekly Recurring Tasks

**Goal**: Set up tasks that repeat every 7 days

```
> add
Title: Weekly team retrospective
Description: Review what went well and what to improve

Set a due date? (y/n): y
Due date (YYYY-MM-DD): 2025-12-30
Due time (HH:MM, 24-hour): 16:00

Set a reminder? (y/n): y
Reminder offset:
  1. 1 day before
  2. 1 hour before
  3. 30 minutes before
  4. 10 minutes before
Select option (1-4): 1

Make this recurring? (y/n): y
Recurrence pattern:
  1. Daily
  2. Weekly
  3. Monthly
Select option (1-3): 2

Set an end date? (y/n): n

Task #6 added successfully
Due: 2025-12-30 16:00
Reminder: 1 day before
Recurrence: Weekly (no end date)
```

**Result**: Task will repeat every Monday (Dec 30 → Jan 6 → Jan 13 → ...)

### Scenario 14: Monthly Recurring Tasks with End Date

**Goal**: Create recurring tasks that stop after a specific date

```
> add
Title: Monthly expense report
Description: Submit all receipts and invoices

Set a due date? (y/n): y
Due date (YYYY-MM-DD): 2026-01-31
Due time (HH:MM, 24-hour): 17:00

Set a reminder? (y/n): y
Reminder offset:
  1. 1 day before
  2. 1 hour before
  3. 30 minutes before
  4. 10 minutes before
Select option (1-4): 1

Make this recurring? (y/n): y
Recurrence pattern:
  1. Daily
  2. Weekly
  3. Monthly
Select option (1-3): 3

Set an end date? (y/n): y
End date (YYYY-MM-DD HH:MM): 2026-06-30 23:59

Task #7 added successfully
Due: 2026-01-31 17:00
Reminder: 1 day before
Recurrence: Monthly until 2026-06-30 23:59
```

**Result**: Task repeats monthly (Jan 31 → Feb 28 → Mar 31 → Apr 30 → May 31), stops before July

### Scenario 15: Adding Recurrence to Existing Task

**Goal**: Convert a one-time task to recurring

```
> add
Title: Code review backlog
Due: 2025-12-27 15:00

> recur 8
Current recurrence: None
Task due date: 2025-12-27 15:00

Recurrence pattern:
  1. Daily
  2. Weekly
  3. Monthly
Select option (1-3): 1

Set an end date? (y/n): n

Recurrence set: Daily (no end date)
Next occurrence after completion: 2025-12-28 15:00
```

**Result**: Task now repeats daily when completed

### Scenario 16: Stopping Recurrence

**Goal**: Prevent a recurring task from generating future instances

```
> recur 8 clear
Current recurrence: Daily (no end date)

Recurrence cleared
This task will not generate new instances when completed
```

**Result**: Task becomes a regular one-time task

## Combined Workflows

### Scenario 17: Morning Planning Routine

**Goal**: Start each day by reviewing deadlines and recurring tasks

```bash
python -m src
```

```
=== TODO CLI - Advanced Level ===

⏰ REMINDERS - Tasks Due Soon:
--------------------------------------------------
  [5] Daily standup - Due in 10 minutes
  [6] Weekly team retrospective - Due in 7 hours
--------------------------------------------------

> filter overdue

Filtered Tasks (overdue)
----------------------------------------
(No overdue tasks)
----------------------------------------

> sort due

Tasks Sorted by Due Date
----------------------------------------
5. [ ] !! Daily standup (Due: 2025-12-27 09:00) ⟳ daily #meeting
6. [ ] !!! Weekly team retrospective (Due: 2025-12-30 16:00) ⟳ weekly #meeting
7. [ ] !! Monthly expense report (Due: 2026-01-31 17:00) ⟳ monthly #finance
----------------------------------------
```

**Result**: Clear view of today's reminders and upcoming deadlines

### Scenario 18: End-of-Day Cleanup

**Goal**: Complete tasks and verify recurring instances are created

```
> complete 5
Task #5 marked complete
New recurring instance created: Task #9

> list

Tasks
----------------------------------------
5. [X] !! Daily standup (Due: 2025-12-27 09:00) ⟳ daily #meeting
9. [ ] !! Daily standup (Due: 2025-12-28 09:00) ⟳ daily #meeting
6. [ ] !!! Weekly team retrospective (Due: 2025-12-30 16:00) ⟳ weekly #meeting
----------------------------------------

> filter status completed

Filtered Tasks (status: completed)
----------------------------------------
5. [X] !! Daily standup (Due: 2025-12-27 09:00) ⟳ daily #meeting
----------------------------------------
Showing 1 of 3 total tasks
```

**Result**: Today's standup completed, tomorrow's standup automatically created

### Scenario 19: Project Sprint Planning

**Goal**: Set up recurring tasks for a 2-week sprint

```
> add
Title: Sprint daily standup
Set a due date? (y/n): y
Due date (YYYY-MM-DD): 2026-01-02
Due time (HH:MM, 24-hour): 09:30
Set a reminder? (y/n): y
Select option (1-4): 4
Make this recurring? (y/n): y
Select option (1-3): 1
Set an end date? (y/n): y
End date (YYYY-MM-DD HH:MM): 2026-01-16 23:59

Task #10 added successfully
Recurrence: Daily until 2026-01-16 23:59

> tag 10 sprint-5,standup
Tags set: #sprint-5 #standup (2 tags)
```

**Result**: Daily standup for 2-week sprint (Jan 2-16), automatically stops after sprint ends

### Scenario 20: Managing Multiple Projects

**Goal**: Track deadlines across different projects with reminders

```
> add
Title: Project Alpha milestone
Due date: 2026-01-15 17:00
Reminder: 1 day before
Tags: project-alpha,milestone

> add
Title: Project Beta code review
Due date: 2026-01-10 14:00
Reminder: 1 hour before
Tags: project-beta,code-review

> filter tag project-alpha

Filtered Tasks (tag: project-alpha)
----------------------------------------
11. [ ] !!! Project Alpha milestone (Due: 2026-01-15 17:00) #project-alpha #milestone
----------------------------------------

> filter tag project-beta

Filtered Tasks (tag: project-beta)
----------------------------------------
12. [ ] !! Project Beta code review (Due: 2026-01-10 14:00) #project-beta #code-review
----------------------------------------
```

**Result**: Projects organized by tags, each with appropriate reminder timing

## Tips & Best Practices

### Due Date Management

1. **Use 24-hour format**: Enter times as "14:00" not "2:00 PM" to avoid confusion
2. **Past dates allowed**: Useful for tracking overdue tasks or historical deadlines
3. **Clear when no longer needed**: Use `due <id> clear` to remove deadlines from flexible tasks
4. **Sort by due date**: Use `sort due` when planning your day to see soonest deadlines first

### Reminder Strategies

1. **1 day before**: For important deadlines where you need prep time (reports, presentations)
2. **1 hour before**: For meetings or events where you need immediate preparation
3. **30 minutes before**: For quick tasks or short meetings
4. **10 minutes before**: For recurring tasks you want to remember just before they're due

### Recurring Task Patterns

1. **Daily recurring**:
   - Standups, daily reports, morning routines
   - Example: "Daily standup" at 09:00 with 10-minute reminder

2. **Weekly recurring**:
   - Team meetings, sprint ceremonies, weekly reports
   - Example: "Weekly retrospective" every Monday at 16:00 with 1-day reminder

3. **Monthly recurring**:
   - Expense reports, monthly reviews, recurring invoices
   - Example: "Submit expenses" on last day of month with 1-day reminder

4. **End dates for sprints**:
   - Sprint-specific tasks (standups, reviews)
   - Example: "Sprint 5 standup" daily from Jan 2-16

### Common Pitfalls to Avoid

1. **Setting reminder without due date**: Will fail - always set due date first
2. **Setting recurrence without due date**: Will fail - due date required for calculating next occurrence
3. **Forgetting to check startup reminders**: Reminders only appear on app launch, not continuously
4. **Overusing 10-minute reminders**: For long-running tasks, use longer reminder windows
5. **Creating too many recurring tasks**: Start with 2-3 recurring tasks, add more as needed

## Quick Reference Card

```
# Due Date Commands
due <id>                     # Set due date on task
due <id> clear               # Remove due date (clears reminder & recurrence too)

# Reminder Commands
remind <id>                  # Set reminder offset on task
remind <id> clear            # Remove reminder

# Recurrence Commands
recur <id>                   # Set recurrence pattern on task
recur <id> clear             # Remove recurrence (stop generating instances)

# Task Creation (with prompts)
add                          # Create task (prompts for due date, reminder, recurrence)

# Viewing Tasks
list                         # View all tasks (shows due dates, overdue markers, recurrence icons)
sort due                     # Sort by due date (soonest first)
filter overdue               # Show only overdue tasks

# Startup Behavior
python -m src                # Launches app and shows active reminders automatically
```

## Date/Time Format Reference

| Format | Example | Description |
|--------|---------|-------------|
| YYYY-MM-DD | 2025-12-31 | Due date (year-month-day) |
| HH:MM | 17:00 | Due time (24-hour format) |
| YYYY-MM-DD HH:MM | 2025-12-31 17:00 | Full datetime (for end dates) |

## Reminder Offset Options

| Option | Offset | Trigger Time Example (Due: 2025-12-31 17:00) |
|--------|--------|----------------------------------------------|
| 1 | 1 day before | 2025-12-30 17:00 |
| 2 | 1 hour before | 2025-12-31 16:00 |
| 3 | 30 minutes before | 2025-12-31 16:30 |
| 4 | 10 minutes before | 2025-12-31 16:50 |

## Next Steps

- Explore the main [README.md](../../../README.md) for complete command reference
- Review [spec.md](../spec.md) for technical requirements
- See [plan.md](../plan.md) for architecture decisions
- Check [data-model.md](../data-model.md) for entity definitions

## Feedback & Issues

If you encounter any issues or have suggestions:
- Check existing issues in the project tracker
- Review the specification for expected behavior
- Test with the examples in this guide to reproduce issues
