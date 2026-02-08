# Quickstart Guide - Intermediate Level Features

This guide demonstrates common workflows using the Intermediate Level features of the Todo CLI application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Priority Management Workflows](#priority-management-workflows)
3. [Tag Organization Workflows](#tag-organization-workflows)
4. [Filtering Workflows](#filtering-workflows)
5. [Search Workflows](#search-workflows)
6. [Sorting Workflows](#sorting-workflows)
7. [Combined Workflows](#combined-workflows)
8. [Tips & Best Practices](#tips--best-practices)

## Getting Started

Launch the application:

```bash
python -m src
```

The application displays available commands and waits for your input.

## Priority Management Workflows

### Scenario 1: Triaging New Tasks

**Goal**: Quickly assess and prioritize incoming tasks

```
> add
Title: Review quarterly report
Task #1 added successfully

> priority 1 high
Priority set to HIGH

> add
Title: Update team wiki
Task #2 added successfully

> priority 2 low
Priority set to LOW

> add
Title: Respond to client email
Task #3 added successfully

> priority 3 high
Priority set to HIGH

> list
1. [ ] !!! Review quarterly report
2. [ ] ! Update team wiki
3. [ ] !!! Respond to client email
```

**Result**: Tasks now have visual priority indicators (!!!, !!, !)

### Scenario 2: Focus on High-Priority Work

**Goal**: View only urgent tasks

```
> sort priority

Tasks Sorted by Priority
----------------------------------------
1. [ ] !!! Review quarterly report
3. [ ] !!! Respond to client email
2. [ ] ! Update team wiki
----------------------------------------
```

**Result**: High-priority tasks appear first

## Tag Organization Workflows

### Scenario 3: Organizing Work by Context

**Goal**: Categorize tasks by project and type

```
> add
Title: Design new login page
Task #4 added successfully

> tag 4 frontend,design,project-alpha
Tags set: #frontend #design #project-alpha (3 tags)

> add
Title: Fix authentication bug
Task #5 added successfully

> tag 5 backend,bug,project-alpha
Tags set: #backend #bug #project-alpha (3 tags)

> add
Title: Write API documentation
Task #6 added successfully

> tag 6 backend,docs,project-alpha
Tags set: #backend #docs #project-alpha (3 tags)

> list
4. [ ] !! Design new login page #frontend #design #project-alpha
5. [ ] !! Fix authentication bug #backend #bug #project-alpha
6. [ ] !! Write API documentation #backend #docs #project-alpha
```

**Result**: Tasks organized with multi-dimensional tags

### Scenario 4: Clearing Tags

**Goal**: Remove all tags from a task

```
> tag 4
Tags cleared

> list
4. [ ] !! Design new login page
```

**Result**: Task no longer has tags

## Filtering Workflows

### Scenario 5: Project-Specific Work

**Goal**: View all tasks for a specific project

```
> filter tag project-alpha

Filtered Tasks (tag: project-alpha)
----------------------------------------
5. [ ] !! Fix authentication bug #backend #bug #project-alpha
6. [ ] !! Write API documentation #backend #docs #project-alpha
----------------------------------------
Showing 2 of 6 total tasks
(Use 'list' to see all tasks)
```

**Result**: Only tasks tagged with "project-alpha" shown

### Scenario 6: Backend vs Frontend Split

**Goal**: Focus on backend tasks only

```
> filter tag backend

Filtered Tasks (tag: backend)
----------------------------------------
5. [ ] !! Fix authentication bug #backend #bug #project-alpha
6. [ ] !! Write API documentation #backend #docs #project-alpha
----------------------------------------
Showing 2 of 6 total tasks
```

**Result**: Only backend tasks displayed

### Scenario 7: Completed Work Review

**Goal**: See what's been completed

```
> complete 5
Task #5 marked complete

> filter status completed

Filtered Tasks (status: completed)
----------------------------------------
5. [X] !! Fix authentication bug #backend #bug #project-alpha
----------------------------------------
Showing 1 of 6 total tasks
```

**Result**: View completed tasks separately

## Search Workflows

### Scenario 8: Finding Tasks by Keyword

**Goal**: Locate tasks mentioning "authentication"

```
> search authentication

Search Results for 'authentication'
----------------------------------------
5. [X] !! Fix authentication bug #backend #bug #project-alpha
----------------------------------------
Found 1 of 6 total tasks
```

**Result**: All tasks with "authentication" in title or description

### Scenario 9: Multi-Word Search

**Goal**: Find tasks about a specific topic

```
> add
Title: Implement user login flow
Description: Design and build complete authentication flow for new users
Task #7 added successfully

> search user login

Search Results for 'user login'
----------------------------------------
7. [ ] !! Implement user login flow
----------------------------------------
Found 1 of 6 total tasks
```

**Result**: Finds tasks with "user login" phrase in title/description

### Scenario 10: Case-Insensitive Discovery

**Goal**: Search without worrying about capitalization

```
> search AUTHENTICATION

Search Results for 'AUTHENTICATION'
----------------------------------------
5. [X] !! Fix authentication bug #backend #bug #project-alpha
7. [ ] !! Implement user login flow
----------------------------------------
Found 2 of 6 total tasks
```

**Result**: Case-insensitive matching finds all variants

## Sorting Workflows

### Scenario 11: Alphabetical Organization

**Goal**: View tasks in alphabetical order

```
> sort title

Tasks Sorted by Title
----------------------------------------
6. [ ] !! Write API documentation #backend #docs #project-alpha
5. [X] !! Fix authentication bug #backend #bug #project-alpha
7. [ ] !! Implement user login flow
----------------------------------------
```

**Result**: Tasks sorted A-Z by title

### Scenario 12: View Recent Work

**Goal**: See newest tasks first

```
> sort created

Tasks Sorted by Created
----------------------------------------
7. [ ] !! Implement user login flow
6. [ ] !! Write API documentation #backend #docs #project-alpha
5. [X] !! Fix authentication bug #backend #bug #project-alpha
----------------------------------------
```

**Result**: Most recently created tasks appear first

### Scenario 13: Priority-Based Planning

**Goal**: Plan work session by urgency

```
> priority 7 high
Priority set to HIGH

> sort priority

Tasks Sorted by Priority
----------------------------------------
7. [ ] !!! Implement user login flow
5. [X] !! Fix authentication bug #backend #bug #project-alpha
6. [ ] !! Write API documentation #backend #docs #project-alpha
----------------------------------------
```

**Result**: High-priority tasks first, ready for execution

## Combined Workflows

### Scenario 14: Daily Standup Preparation

**Goal**: Review work completed yesterday and plan today's high-priority tasks

```
# 1. Review completed work
> filter status completed

# 2. View pending high-priority tasks
> filter priority high

# 3. Search for specific project
> search project-alpha

# 4. Return to full list
> list
```

**Result**: Comprehensive overview of work status

### Scenario 15: Sprint Planning

**Goal**: Organize backlog by priority and tags

```
# 1. Add sprint tasks with tags
> add
Title: Implement search feature
Task #8 added successfully

> tag 8 sprint-5,backend,feature
Tags set: #sprint-5 #backend #feature (3 tags)

> priority 8 high
Priority set to HIGH

# 2. Filter by sprint tag
> filter tag sprint-5

# 3. Sort by priority
> sort priority
```

**Result**: Sprint tasks organized by urgency

### Scenario 16: Bug Triage Workflow

**Goal**: Track and prioritize bugs

```
# 1. Tag bugs with severity
> add
Title: Login button not clickable
Task #9 added successfully

> tag 9 bug,critical,frontend
Tags set: #bug #critical #frontend (3 tags)

> priority 9 high
Priority set to HIGH

# 2. Filter all bugs
> filter tag bug

# 3. Sort by priority
> sort priority
```

**Result**: Bugs organized by severity and priority

### Scenario 17: Context Switching

**Goal**: Quickly switch between different work contexts

```
# Morning: Focus on frontend work
> filter tag frontend

# Afternoon: Switch to backend tasks
> filter tag backend

# End of day: Review all completed
> filter status completed

# Reset view
> list
```

**Result**: Efficient context switching without losing data

## Tips & Best Practices

### Priority Management

1. **Default to MEDIUM**: All tasks start with MEDIUM priority - only change if clearly urgent or low-priority
2. **Use HIGH sparingly**: Reserve HIGH priority for truly urgent work (deadlines, blockers)
3. **Review regularly**: Periodically review and adjust priorities as context changes

### Tag Organization

1. **Consistent naming**: Use lowercase with hyphens (e.g., `project-alpha`, not `Project Alpha`)
2. **Multi-dimensional tagging**: Combine context tags (project, type, urgency)
   - Example: `#project-alpha #backend #bug`
3. **Keep tags short**: Max 20 characters - be concise (e.g., `auth` not `authentication-system`)
4. **Deduplication**: System automatically removes duplicate tags

### Filtering Strategies

1. **Chain filters mentally**: Filter by tag, note results, then filter by priority
2. **Use with sorting**: Combine `filter tag work` with `sort priority` for focused views
3. **Remember original order**: Use `list` to return to chronological order

### Search Tips

1. **Start broad, narrow down**: Search "meeting" first, then refine with tags if needed
2. **Multi-word queries**: Works for phrases (e.g., `search client presentation`)
3. **Case doesn't matter**: Search "BUG", "bug", or "Bug" - all work the same

### Sorting Approaches

1. **Planning sessions**: Use `sort priority` to focus on important work
2. **Review sessions**: Use `sort created` to see recent additions
3. **Alphabetical lookup**: Use `sort title` when searching for specific task by name
4. **Non-persistent**: Sorting doesn't change original order - use `list` to reset

### Workflow Patterns

1. **Capture → Organize → Execute**:
   - Add tasks quickly (`add`)
   - Organize with priority and tags
   - Execute using filtered/sorted views

2. **Daily Review**:
   - `filter status completed` - What did I finish?
   - `filter priority high` - What's urgent today?
   - `sort priority` - Plan execution order

3. **Context-Based Work**:
   - `filter tag backend` - Backend focus session
   - `filter tag frontend` - Frontend focus session
   - `filter tag meetings` - Meeting prep

4. **Project Management**:
   - Tag all tasks with project name
   - Filter by project to see all related work
   - Sort by priority within project

### Common Pitfalls to Avoid

1. **Over-tagging**: Don't use too many tags (3-5 per task is ideal)
2. **Inconsistent casing**: Tags are case-insensitive - pick one style and stick to it
3. **Forgetting to set priority**: All tasks default to MEDIUM - intentionally set HIGH/LOW when needed
4. **Not using search**: Don't scroll through long lists - use search to find tasks quickly

## Quick Reference Card

```
# Task Management
add                          # Add new task
list                         # View all tasks
complete <id>                # Mark done
update <id>                  # Edit task
delete <id>                  # Remove task

# Priority (low, medium, high)
priority <id> <level>        # Set priority

# Tags (comma-separated)
tag <id> <tags>              # Set tags
tag <id>                     # Clear tags

# Filtering
filter priority <level>      # Filter by priority
filter tag <name>            # Filter by tag
filter status <state>        # Filter by status (completed/pending)

# Search
search <keyword>             # Search title/description

# Sorting
sort priority                # Sort by urgency
sort title                   # Sort alphabetically
sort created                 # Sort by date (newest first)

# Reset
list                         # Return to original order
```

## Next Steps

- Explore the main [README.md](../README.md) for complete command reference
- Review [specs/002-intermediate-level/spec.md](../specs/002-intermediate-level/spec.md) for technical details
- See [Architecture documentation](../specs/002-intermediate-level/plan.md) for design decisions

## Feedback & Issues

If you encounter any issues or have suggestions:
- Check existing issues in the project tracker
- Review the specification for expected behavior
- Test with the examples in this guide to reproduce issues
