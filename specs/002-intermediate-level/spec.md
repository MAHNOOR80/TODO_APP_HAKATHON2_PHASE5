# Feature Specification: Intermediate Level - Organization & Usability

**Feature Branch**: `002-intermediate-level`
**Created**: 2025-12-27
**Status**: Draft
**Input**: User description: "Intermediate Level features: Priorities & Tags/Categories, Search & Filter tasks, Sort tasks by due date/priority/name"

**Constitution Compliance**: v1.1.0
**Prerequisite**: Basic Level (001-todo-cli) MUST be fully implemented and tested before implementing this spec.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Priority-Based Task Management (Priority: P1)

As a user, I want to assign priority levels (High, Medium, Low) to my tasks so that I can focus on the most important work first.

**Why this priority**: Priority is the most fundamental organizational dimension. It directly impacts user productivity by helping them focus on what matters most. This is the minimum viable organizational feature.

**Independent Test**: Can be fully tested by adding a task, setting its priority to "high", and verifying it displays with the correct priority indicator. Delivers immediate value as users can now distinguish urgent tasks.

**Acceptance Scenarios**:

1. **Given** task ID 1 exists with default medium priority, **When** I execute "priority 1 high", **Then** task 1's priority changes to "high" and displays with `!!!` indicator
2. **Given** task ID 2 exists, **When** I execute "priority 2 low", **Then** task 2's priority changes to "low" and displays with `!` indicator
3. **Given** I add a new task without specifying priority, **When** I view the task list, **Then** the new task has default priority "medium" with `!!` indicator
4. **Given** task ID 5 exists, **When** I execute "priority 5 invalid", **Then** I receive error message "Invalid priority. Use: low, medium, high" and priority remains unchanged
5. **Given** I attempt to set priority for task ID 99 which doesn't exist, **When** I execute "priority 99 high", **Then** I receive error message "Task #99 not found"

---

### User Story 2 - Task Categorization with Tags (Priority: P2)

As a user, I want to assign tags or categories to my tasks so that I can organize them by context (e.g., Work, Home, Personal, Shopping).

**Why this priority**: Tags enable multi-dimensional organization. After prioritization (P1), users need to group tasks by context. Tags are more flexible than single categories.

**Independent Test**: Can be tested by adding tasks, tagging them with different labels (e.g., "work", "urgent"), and verifying tags display correctly in the task list.

**Acceptance Scenarios**:

1. **Given** task ID 3 exists without tags, **When** I execute "tag 3 work,urgent", **Then** task 3 displays tags as "#work #urgent"
2. **Given** task ID 3 has tags "work,urgent", **When** I execute "tag 3 home" (overwrite mode), **Then** task 3 displays only "#home"
3. **Given** I add a new task, **When** I view the task list, **Then** tasks without tags show no tag indicators (empty tag list)
4. **Given** task ID 4 exists, **When** I execute "tag 4 Work" (capitalized), **Then** tag is stored as lowercase "work" for consistency
5. **Given** I attempt to tag task ID 99 which doesn't exist, **When** I execute "tag 99 home", **Then** I receive error message "Task #99 not found"
6. **Given** task ID 5 exists, **When** I execute "tag 5" without providing tags, **Then** existing tags are cleared (empty tag list)

---

### User Story 3 - Task Filtering by Attributes (Priority: P3)

As a user, I want to filter tasks by status, priority, or tags so that I can focus on specific subsets of my work.

**Why this priority**: Filtering makes large task lists manageable. Users can now surface exactly what they need to work on. Builds on P1 and P2 organizational features.

**Independent Test**: Can be tested by creating 10 tasks with varied priorities and tags, then filtering by "priority high" and verifying only high-priority tasks appear.

**Acceptance Scenarios**:

1. **Given** I have 5 tasks with priorities (2 high, 2 medium, 1 low), **When** I execute "filter priority high", **Then** only the 2 high-priority tasks are displayed
2. **Given** I have 6 tasks with tags (3 tagged "work", 3 tagged "home"), **When** I execute "filter tag work", **Then** only the 3 tasks tagged "work" are displayed
3. **Given** I have tasks with various statuses, **When** I execute "filter status completed", **Then** only completed tasks are displayed
4. **Given** I have tasks tagged "work" and "urgent", **When** I execute "filter tag urgent", **Then** all tasks containing the "urgent" tag are displayed (case-insensitive match)
5. **Given** no tasks match the filter criteria, **When** I execute a filter command, **Then** I see message "No tasks match the filter criteria"
6. **Given** I execute "filter priority invalid", **When** the system validates input, **Then** I receive error message "Invalid filter value for priority. Use: low, medium, high"
7. **Given** I execute "filter status pending", **When** the system processes this, **Then** I see all incomplete tasks (completed=False)

---

### User Story 4 - Keyword Search Across Tasks (Priority: P4)

As a user, I want to search for tasks by keywords in titles or descriptions so that I can quickly find specific tasks without scrolling.

**Why this priority**: Search enables rapid task discovery. Less critical than filtering (P3) because users can filter by tags/priority first, but valuable for large task lists.

**Independent Test**: Can be tested by adding 10 tasks with varied titles and descriptions, then searching for a keyword that appears in 2 tasks and verifying correct results.

**Acceptance Scenarios**:

1. **Given** I have tasks with titles containing "report", **When** I execute "search report", **Then** all tasks with "report" in title or description are displayed (case-insensitive)
2. **Given** I have a task with title "Buy groceries" and description "Milk, eggs, bread", **When** I execute "search milk", **Then** this task appears in results (matches description)
3. **Given** I have tasks with various titles, **When** I execute "search xyz" with no matches, **Then** I see message "No tasks found for 'xyz'"
4. **Given** I execute "search" without a keyword, **When** the system validates input, **Then** I receive error message "Search keyword required"
5. **Given** I have 3 tasks matching "meeting", **When** I execute "search meeting", **Then** all 3 tasks are displayed with original formatting (priority, tags, status intact)

---

### User Story 5 - Task Sorting by Multiple Criteria (Priority: P5)

As a user, I want to sort my task list by priority, due date, or alphabetically so that I can view tasks in the order most useful to me.

**Why this priority**: Sorting enhances list readability but doesn't fundamentally change functionality. Users can manually scan lists without sorting. Nice-to-have polish feature.

**Independent Test**: Can be tested by adding 5 tasks with different priorities, then executing "sort priority" and verifying tasks appear in high → medium → low order.

**Acceptance Scenarios**:

1. **Given** I have tasks with mixed priorities, **When** I execute "sort priority", **Then** tasks are displayed in order: high, medium, low
2. **Given** I have tasks with titles in random order, **When** I execute "sort title", **Then** tasks are displayed alphabetically by title (A-Z)
3. **Given** I have tasks with creation times, **When** I execute "sort created", **Then** tasks are displayed with newest first (descending order)
4. **Given** I have tasks, some with due dates and some without, **When** I execute "sort due", **Then** tasks with due dates appear first (earliest to latest), followed by tasks without due dates
5. **Given** I execute "sort invalid", **When** the system validates input, **Then** I receive error message "Invalid sort field. Use: priority, title, created, due"
6. **Given** I execute "sort" without specifying a field, **When** the system processes this, **Then** I receive error message "Sort field required. Use: priority, title, created, due"
7. **Given** I have sorted the list, **When** I execute another command (add, update, complete), **Then** the sort order is cleared and tasks return to default display (creation order)

---

### Edge Cases

- **Combining filters**: What happens when I filter by priority high and then search? (Answer: Search operates on all tasks, not filtered results - filters are cleared before search)
- **Empty tag list**: How are tasks with no tags filtered? (Answer: "filter tag <value>" excludes tasks with empty tag lists)
- **Case sensitivity**: Are tags, priorities, and search case-sensitive? (Answer: No - all comparisons are case-insensitive for usability)
- **Tag delimiters**: What happens if I use spaces in tags (e.g., "tag 5 work urgent" vs "tag 5 work,urgent")? (Answer: Comma-separated only; spaces without commas treated as error)
- **Sort stability**: When sorting by priority, what order are tasks with the same priority? (Answer: Maintain original creation order for ties - stable sort)
- **Filter persistence**: Does filter persist across commands? (Answer: No - filters/search are one-time views; next "list" command shows all tasks)
- **Invalid task ID for priority/tag**: How does system handle priority/tag commands for non-existent IDs? (Answer: Graceful error message "Task #X not found")
- **Very long tag names**: What happens with 50-character tag names? (Answer: Accept but may truncate display; validate max 20 characters per tag)
- **Duplicate tags**: What if I tag a task "work,work,work"? (Answer: De-duplicate automatically; store only unique tags)
- **Null/empty searches**: What happens with "search" followed by empty string? (Answer: Error message "Search keyword required")

## Requirements *(mandatory)*

### Functional Requirements

**Priority Management:**

- **FR-001**: System MUST extend Task entity with optional `priority` field (enum: "low", "medium", "high") defaulting to "medium"
- **FR-002**: System MUST provide "priority <id> <level>" command to set task priority
- **FR-003**: System MUST validate priority level input and reject invalid values with helpful error message
- **FR-004**: System MUST display priority indicators in task list: `!!!` (high), `!!` (medium), `!` (low)
- **FR-005**: System MUST maintain backward compatibility with Basic Level tasks (no priority field) by assigning default "medium" priority

**Tag/Category Management:**

- **FR-006**: System MUST extend Task entity with optional `tags` field (list of strings) defaulting to empty list
- **FR-007**: System MUST provide "tag <id> <tag1,tag2,...>" command to set task tags (comma-separated)
- **FR-008**: System MUST normalize tags to lowercase for consistency
- **FR-009**: System MUST deduplicate tags automatically (store unique tags only)
- **FR-010**: System MUST display tags in format "#tag1 #tag2" in task list
- **FR-011**: System MUST validate tag format and reject tags containing spaces or special characters (alphanumeric and hyphens only)
- **FR-012**: System MUST limit individual tag length to 20 characters
- **FR-013**: System MUST allow clearing tags by executing "tag <id>" without tag values

**Filtering:**

- **FR-014**: System MUST provide "filter <field> <value>" command where field is "priority", "tag", or "status"
- **FR-015**: System MUST filter by priority and display only tasks matching the specified priority level
- **FR-016**: System MUST filter by tag and display only tasks containing the specified tag (case-insensitive match)
- **FR-017**: System MUST filter by status where "completed" shows completed tasks and "pending" shows incomplete tasks
- **FR-018**: System MUST display "No tasks match the filter criteria" when filter returns zero results
- **FR-019**: System MUST validate filter field and value, rejecting invalid inputs with helpful error messages
- **FR-020**: System MUST clear filter state after executing any non-filter command (filters are not persistent)

**Search:**

- **FR-021**: System MUST provide "search <keyword>" command to find tasks by keyword
- **FR-022**: System MUST search both title and description fields (case-insensitive substring match)
- **FR-023**: System MUST display all tasks containing the keyword in either title or description
- **FR-024**: System MUST display "No tasks found for '<keyword>'" when search returns zero results
- **FR-025**: System MUST require a keyword argument and reject "search" command without keyword
- **FR-026**: System MUST preserve task formatting (priority, tags, status) in search results

**Sorting:**

- **FR-027**: System MUST provide "sort <field>" command where field is "priority", "title", "created", or "due"
- **FR-028**: System MUST sort by priority in order: high, medium, low
- **FR-029**: System MUST sort by title alphabetically (A-Z, case-insensitive)
- **FR-030**: System MUST sort by creation time with newest tasks first (descending)
- **FR-031**: System MUST sort by due date with earliest dates first, followed by tasks without due dates
- **FR-032**: System MUST use stable sort (preserve original order for equal elements)
- **FR-033**: System MUST validate sort field and reject invalid values with helpful error message
- **FR-034**: System MUST clear sort order after any modification command (add, update, delete, complete) and return to default creation order
- **FR-035**: System MUST require a field argument and reject "sort" command without field

**General Requirements:**

- **FR-036**: System MUST maintain all Basic Level functionality without regression
- **FR-037**: System MUST handle tasks created in Basic Level (without priority/tags) gracefully with sensible defaults
- **FR-038**: System MUST continue using in-memory storage only (no persistence)
- **FR-039**: System MUST maintain interactive CLI menu with new commands added progressively
- **FR-040**: System MUST handle all invalid inputs gracefully without crashes or stack traces

### Key Entities

- **Task** (Extended from Basic Level):
  - `id`: Unique integer identifier (auto-incrementing, never reused) - *from Basic Level*
  - `title`: The task name or summary (required, non-empty string) - *from Basic Level*
  - `description`: Additional details (optional string) - *from Basic Level*
  - `completed`: Boolean flag for completion status (defaults to False) - *from Basic Level*
  - `priority`: Priority level enum ("low", "medium", "high") - *NEW, defaults to "medium"*
  - `tags`: List of lowercase alphanumeric strings for categorization - *NEW, defaults to empty list*
  - `created_at`: Timestamp of task creation for sorting - *NEW, auto-set on creation*

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can assign priority to a task and see the visual indicator (!!!,!!,!) within 2 interactions (command → view list)
- **SC-002**: Users can filter a list of 50 tasks by priority and receive results in under 500ms
- **SC-003**: Users can search 100 tasks by keyword and receive results in under 500ms with accurate substring matching
- **SC-004**: Users can apply tags to tasks and filter by tag with 100% accuracy (all tasks with tag shown, none without tag shown)
- **SC-005**: Users can sort tasks by any supported field (priority, title, created, due) with correct ordering 100% of the time
- **SC-006**: Tasks created in Basic Level (without priority/tags) display correctly with default values when Intermediate Level features are activated
- **SC-007**: 100% of invalid inputs for new commands (priority, tag, filter, search, sort) result in helpful error messages rather than crashes
- **SC-008**: Users can combine workflows: add task → set priority → tag → filter by priority → search keyword → sort, all within one session

### Assumptions

- **Basic Level completion**: All Basic Level features (001-todo-cli) are fully implemented and tested
- **Data continuity**: Tasks created in Basic Level exist in memory and can be extended with new fields
- **Platform consistency**: Application runs on same platforms as Basic Level (Windows, macOS, Linux with Python 3.13+)
- **User knowledge**: Users understand Basic Level commands and can build on that knowledge
- **Session scope**: All operations remain in-memory; data loss on exit is still acceptable
- **Performance**: In-memory operations on up to 1000 tasks complete in under 1 second
- **Single filter/sort**: Only one filter or sort applied at a time (no chaining like "filter priority high | search report")
- **Language**: All UI text remains in English
- **Tag vocabulary**: Users create their own tag taxonomy; no predefined tag list

## Out of Scope (Explicitly Excluded from Intermediate Level)

- **Due dates**: Not implemented until Advanced Level (003-advanced-level)
- **Reminders**: Not implemented until Advanced Level
- **Recurring tasks**: Not implemented until Advanced Level
- **Persistent storage**: Still in-memory only (no files or databases)
- **Multiple filters**: Cannot combine filters (e.g., "filter priority high AND tag work")
- **Advanced search**: No regex, wildcards, or boolean operators in search
- **Custom sort orders**: No reverse sort or secondary sort keys
- **Tag hierarchies**: Tags are flat; no parent-child tag relationships
- **Tag autocomplete**: No suggestions or autocomplete for existing tags
- **Category vs Tags**: Using tags only; no separate category field (constitution allows both but we choose tags)
- **Priority colors**: Terminal colors not implemented; using text symbols only (!!!, !!, !)
- **Saved filters**: No ability to save filter/search/sort preferences
- **Export filtered results**: No export functionality
- **Task statistics**: No summary views (e.g., "5 high priority tasks", "10 tasks tagged work")
- **Batch operations**: No bulk priority/tag assignment (e.g., "tag 1,2,3 work")

## Dependencies

**Prerequisites (MUST be complete):**
- Basic Level (001-todo-cli) fully implemented with all FR-001 through FR-016
- Task data model with id, title, description, completed fields
- Interactive CLI with menu loop and error handling
- In-memory storage mechanism

**Backward Compatibility Requirements:**
- Existing Task objects MUST work with new priority and tags fields added as optional attributes
- Basic Level commands (add, list, update, delete, complete, quit) MUST continue to function identically
- Tasks without priority/tags MUST display with default values (priority="medium", tags=[])
- No changes to Basic Level commands required (strict non-breaking guarantee)

## Implementation Notes

**Data Model Migration Strategy:**
- Add `priority` field with default="medium" to Task class
- Add `tags` field with default=[] (empty list) to Task class
- Add `created_at` field with default=current_timestamp to Task class
- Existing Task instances automatically get defaults when accessed (no manual migration needed for in-memory)

**CLI Design Principles:**
- New commands (priority, tag, filter, search, sort) added to help menu
- Maintain consistent error message format from Basic Level
- Preserve Basic Level visual layout for task list
- Add priority and tag display inline with existing status indicators

**Validation Rules:**
- Priority: must be exact match (case-insensitive) to "low", "medium", or "high"
- Tags: alphanumeric and hyphen only, max 20 chars per tag, comma-separated, auto-lowercased
- Filter field: must be "priority", "tag", or "status"
- Search: minimum 1 character keyword required
- Sort field: must be "priority", "title", "created", or "due" (due prepared for Advanced Level)

**Performance Considerations:**
- All operations remain O(n) where n = number of tasks (acceptable for in-memory up to 1000 tasks)
- Filtering and searching iterate all tasks; no indexing needed for Phase I
- Sorting uses Python's built-in sort (Timsort, O(n log n))
- No caching or optimization needed for in-memory operations

## Risks and Mitigations

**Risk 1: Breaking Basic Level functionality**
- *Likelihood*: Medium
- *Impact*: High (violates constitution backward compatibility requirement)
- *Mitigation*: Comprehensive regression testing of all Basic Level user stories before merging

**Risk 2: Tag format confusion (spaces vs commas)**
- *Likelihood*: High (common user error)
- *Impact*: Low (usability friction)
- *Mitigation*: Clear error messages explaining comma-separated format; examples in help text

**Risk 3: Filter/search performance with large task lists**
- *Likelihood*: Low (in-memory limited to reasonable sizes)
- *Impact*: Medium (user frustration)
- *Mitigation*: Performance success criteria (SC-002, SC-003) validate acceptable response times

**Risk 4: Sort order confusion after modifications**
- *Likelihood*: Medium (users expect sort to persist)
- *Impact*: Low (minor UX issue)
- *Mitigation*: Document in help that sort clears after modifications; consider adding message "Sort order cleared"

## Open Questions

*All clarifications obtained from user input. No open questions remain.*

## Related Documents

- Constitution v1.1.0: `.specify/memory/constitution.md`
- Basic Level Spec: `specs/001-todo-cli/spec.md`
- Basic Level Plan: `specs/001-todo-cli/plan.md`
- Advanced Level Spec (future): `specs/003-advanced-level/spec.md` (due dates, reminders, recurrence)

## Acceptance Checklist

Before marking this feature as complete, verify:

- [ ] All 40 Functional Requirements (FR-001 through FR-040) implemented
- [ ] All 5 User Stories (P1-P5) pass acceptance scenarios
- [ ] All 8 Success Criteria (SC-001 through SC-008) validated
- [ ] All 10+ Edge Cases handled gracefully
- [ ] All Basic Level functionality still works (regression-free)
- [ ] Constitution v1.1.0 compliance verified (especially backward compatibility rules)
- [ ] README updated with new commands and examples
- [ ] Code follows PEP 8 and constitution code quality principles (type hints, docstrings, modularity)
- [ ] No crashes on any invalid input combination
- [ ] Performance criteria met (< 500ms for filter/search on 100 tasks)
