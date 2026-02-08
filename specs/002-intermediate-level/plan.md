# Implementation Plan: Intermediate Level - Organization & Usability

**Branch**: `002-intermediate-level` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-intermediate-level/spec.md`

**Note**: This plan outlines the architecture and implementation approach for extending the Basic Level Todo CLI with organization features (priorities, tags, search, filter, sort).

## Summary

Extend the existing Todo CLI with organizational capabilities: priority levels (high/medium/low), flexible tagging system, keyword search, attribute-based filtering, and multi-criteria sorting. Implementation adds three new fields to the Task model (priority, tags, created_at) and five new CLI commands (priority, tag, search, filter, sort). Architecture maintains strict backward compatibility with Basic Level—all existing tasks work seamlessly with default values. Business logic remains in TodoApp, CLI remains presentation-only, and separation of concerns is preserved. No external dependencies or persistence changes.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: None (Python standard library only per constitution)
**Storage**: In-memory list of Task objects (extended with priority, tags, created_at fields)
**Testing**: Architecture designed to be test-ready (no tests in Phase I per constitution)
**Target Platform**: Cross-platform CLI (Windows, macOS, Linux)
**Project Type**: Single project (command-line application)
**Performance Goals**: <500ms for filter/search on 100 tasks, <100ms for all other operations
**Constraints**: No external dependencies, no persistence, no breaking changes to Basic Level, stable sort required
**Scale/Scope**: Single-user, ~800 lines of code total (300 lines added to existing 500)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Simplicity and Readability First

- ✅ **PASS**: No complex abstractions—extending Task dataclass with optional fields
- ✅ **PASS**: Five new methods in TodoApp (set_priority, set_tags, search, filter, sort)—all straightforward
- ✅ **PASS**: No performance optimizations—basic list iteration and Python's built-in sort
- ✅ **PASS**: Explicit logic (case-insensitive comparisons, comma-separated parsing, enum validation)

### Principle II: Clean Code Principles

- ✅ **PASS**: PEP 8 enforced (same standard as Basic Level)
- ✅ **PASS**: Function length <30 lines maintained (filter/search are simple iterations)
- ✅ **PASS**: Descriptive names (set_priority, parse_tags, filter_by_priority, etc.)
- ✅ **PASS**: Each function has single responsibility (validate priority, normalize tags, match filter, etc.)

### Principle III: Modularity and Extensibility

- ✅ **PASS**: No file I/O or database changes (still in-memory)
- ✅ **PASS**: Task model extensions use optional fields with defaults (backward compatible)
- ✅ **PASS**: CLI calls TodoApp methods without data manipulation (same pattern as Basic Level)
- ✅ **PASS**: Dependency flow unchanged: CLI → TodoApp → Task

### Technical Principles: Language and Runtime

- ✅ **PASS**: Python 3.13+ required (no change from Basic Level)
- ✅ **PASS**: Zero external dependencies (standard library only—using datetime, enum)

### Technical Principles: Type Safety

- ✅ **PASS**: Type hints on all new functions/methods (Priority enum, list[str] for tags, datetime for created_at)
- ✅ **PASS**: Using enum.Enum for Priority type safety

### Technical Principles: Documentation

- ✅ **PASS**: Docstrings required for all new methods and updated methods
- ✅ **PASS**: Docstrings explain intent (Google style)

### Project Structure (Required)

- ✅ **PASS**: All source remains under `src/` directory
- ✅ **PASS**: Same files extended: `src/task.py`, `src/todo_app.py`, `src/cli.py`
- ✅ **PASS**: No new modules needed (all changes in-place)

### Architecture Rules: Single Responsibility

- ✅ **PASS**: task.py still only defines Task dataclass (with new fields)
- ✅ **PASS**: todo_app.py contains all business logic (new methods added)
- ✅ **PASS**: cli.py handles menu, input/output (new commands added)

### Architecture Rules: State Management

- ✅ **PASS**: Same in-memory list of Task objects inside TodoApp instance
- ✅ **PASS**: No global mutable state (all state in TodoApp object)
- ✅ **PASS**: State passed explicitly through objects

### Architecture Rules: ID Management

- ✅ **PASS**: ID management unchanged (auto-increment, never reused)

### CLI Behavior Requirements

- ✅ **PASS**: Interactive menu loop extended with new commands
- ✅ **PASS**: Graceful error handling for all new commands
- ✅ **PASS**: Visual indicators for priority (!!!, !!, !) and tags (#tag1 #tag2)

### Progressive Implementation Strategy

- ✅ **PASS**: Basic Level MUST be complete before Intermediate (prerequisite documented)
- ✅ **PASS**: Backward compatibility maintained (default values for new fields)
- ✅ **PASS**: No breaking changes to existing commands

## Project Structure

### Documentation (this feature)

```text
specs/002-intermediate-level/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 research output
├── data-model.md        # Phase 1 data model design
├── quickstart.md        # Phase 1 usage guide
├── contracts/           # Phase 1 interface contracts
│   └── todo_app_extensions.md
└── tasks.md             # Phase 2 implementation tasks
```

### Source Code (repository root)

```text
src/
├── __main__.py          # Entry point (no changes)
├── __init__.py          # Package init (no changes)
├── task.py              # Task model (EXTENDED with priority, tags, created_at)
├── todo_app.py          # TodoApp manager (EXTENDED with 5 new methods)
└── cli.py               # CLI interface (EXTENDED with 5 new commands)

tests/                   # (Future phase—no tests in Phase I)
├── unit/
├── integration/
└── contract/

specs/
├── 001-todo-cli/        # Basic Level
└── 002-intermediate-level/  # This feature
```

**Structure Decision**: Single project structure maintained from Basic Level. No new files required—all changes are extensions to existing modules. This preserves simplicity and ensures backward compatibility.

## Complexity Tracking

*No constitution violations. This section is empty.*

## Scope and Dependencies

### In Scope

**Core Features:**
1. **Priority Management**
   - Extend Task with priority field (enum: LOW, MEDIUM, HIGH)
   - CLI command: `priority <id> <level>` to set priority
   - Display priority indicators (!!!, !!, !) in task list
   - Default priority: MEDIUM for backward compatibility

2. **Tag Management**
   - Extend Task with tags field (list of strings)
   - CLI command: `tag <id> <tag1,tag2,...>` to set tags (comma-separated)
   - Normalize tags to lowercase, deduplicate
   - Display tags as #tag1 #tag2 in task list
   - Support tag clearing via `tag <id>` without arguments

3. **Search Functionality**
   - CLI command: `search <keyword>` for case-insensitive substring matching
   - Search across title and description fields
   - Display matching tasks with full formatting

4. **Filter Functionality**
   - CLI command: `filter <field> <value>` where field is priority/tag/status
   - Filter by priority level (high, medium, low)
   - Filter by tag (tasks containing the tag)
   - Filter by status (completed, pending)
   - Non-persistent filters (cleared after next command)

5. **Sort Functionality**
   - CLI command: `sort <field>` where field is priority/title/created/due
   - Sort by priority (high → medium → low)
   - Sort by title (alphabetically A-Z)
   - Sort by created_at (newest first)
   - Sort by due_date (prepared for Advanced Level—tasks without due dates last)
   - Stable sort (preserve creation order for ties)
   - Non-persistent sort (cleared after modification commands)

**Data Model Changes:**
- Add Priority enum (LOW, MEDIUM, HIGH)
- Add `priority: Priority` field to Task (default: MEDIUM)
- Add `tags: list[str]` field to Task (default: empty list)
- Add `created_at: datetime` field to Task (auto-set on creation)

**CLI Changes:**
- Add 5 new menu options: priority, tag, search, filter, sort
- Extend task display format to show priority and tags
- Maintain existing help/error message patterns

### Out of Scope

**Explicitly Excluded (Deferred to Advanced Level or Future Phases):**
- Due dates (Advanced Level feature—sort by due prepared but not implemented)
- Reminders and notifications
- Recurring tasks
- Persistent storage (files/database)
- Multiple filter chaining (e.g., priority AND tag)
- Advanced search (regex, wildcards, boolean operators)
- Custom sort orders (reverse sort, secondary sort keys)
- Tag autocomplete or suggestions
- Tag hierarchies (parent-child relationships)
- Batch operations (bulk priority/tag assignment)
- Task statistics or summary views
- Export/import functionality
- Terminal colors (using text symbols only)

### External Dependencies

**Prerequisites:**
- Python 3.13+ (same as Basic Level)
- Basic Level (001-todo-cli) fully implemented with:
  - Task model (id, title, description, completed)
  - TodoApp with CRUD methods
  - CLI with interactive menu
  - Error handling infrastructure

**No New External Dependencies:**
- Using Python standard library only:
  - `enum` for Priority type
  - `datetime` for created_at timestamps
  - `dataclasses` for Task model (already in use)
  - `typing` for type hints (already in use)

### Team Dependencies

**None (Solo Development):** This is a single-developer project with no cross-team coordination required.

## Key Decisions and Rationale

### Decision 1: Tags vs. Single Category Field

**Options Considered:**
1. Single `category` field (string) - simple, one category per task
2. Multiple `tags` field (list[str]) - flexible, multi-dimensional organization
3. Both category and tags - maximum flexibility but added complexity

**Trade-offs:**
- **Option 1 (Single Category)**:
  - ✅ Simpler to implement
  - ✅ Easier mental model for users
  - ❌ Limits organization—tasks can only belong to one category
  - ❌ No support for cross-cutting concerns (e.g., "urgent" + "work")

- **Option 2 (Multiple Tags)** [CHOSEN]:
  - ✅ Flexible multi-dimensional organization
  - ✅ Users can create their own taxonomy
  - ✅ Supports filtering by any tag
  - ❌ Slightly more complex to parse (comma-separated input)
  - ❌ Potential for tag proliferation without discipline

- **Option 3 (Both)**:
  - ✅ Maximum flexibility
  - ❌ Over-engineering for Phase I
  - ❌ Adds cognitive load for users (when to use category vs tag?)
  - ❌ Violates simplicity principle

**Rationale for Choice:**
Chose **Option 2 (Tags)** because:
- Aligns with modern task management patterns (e.g., Todoist, Notion use tags)
- Provides flexibility without significant implementation complexity
- Single field is simpler than dual category+tags system
- Constitution allows both but doesn't require both—we choose the more flexible option
- Tag parsing is straightforward (split by comma, normalize, deduplicate)

**Principles Applied:**
- Simplicity: Single field (tags) vs. dual fields (category + tags)
- Extensibility: Tags support future use cases (tag-based views, tag statistics)
- User-centric: Flexible organization matches how users think about tasks

**Measured Against:**
- Constitution Principle I (Simplicity): Tags are simpler than category+tags but more flexible than single category
- Spec FR-006 to FR-013: All requirements met with tag-based approach

### Decision 2: Filter and Sort Persistence

**Options Considered:**
1. Persistent filters—filter remains until explicitly cleared
2. Non-persistent filters—filter clears after any command
3. Hybrid—filter persists until modification command (add, delete, update)

**Trade-offs:**
- **Option 1 (Persistent)**:
  - ✅ Users can work within filtered view without re-filtering
  - ❌ Confusing when users forget filter is active
  - ❌ Requires "clear filter" command and state management
  - ❌ Adds cognitive load (is filter active?)

- **Option 2 (Non-persistent)** [CHOSEN]:
  - ✅ Simple mental model—each filter/sort is a one-time view
  - ✅ No state management needed
  - ✅ No confusion about active filters
  - ❌ Users must re-filter/re-sort if needed
  - ❌ Slightly less convenient for repeated views

- **Option 3 (Hybrid)**:
  - ✅ Balances convenience and simplicity
  - ❌ Adds complexity (when does filter clear?)
  - ❌ Inconsistent behavior (clears for add but not for list?)

**Rationale for Choice:**
Chose **Option 2 (Non-persistent)** because:
- Aligns with Principle I (Simplicity)—no hidden state
- Each command is independent and predictable
- Users explicitly request filter/search/sort when needed
- No "clear filter" command required (reduces command count)
- Phase I is exploratory—convenience can be added later if needed

**Principles Applied:**
- Simplicity: No state management for filters/sorts
- Predictability: Each command operates on full task list
- No global mutable state: Filter results are temporary

**Measured Against:**
- Spec FR-020, FR-034: Non-persistent behavior documented in functional requirements
- Constitution State Management: No additional mutable state required

### Decision 3: Priority Data Type (Enum vs. String)

**Options Considered:**
1. String field with validation—store "high", "medium", "low" as strings
2. Enum field—use Python enum.Enum for type safety
3. Integer field—map 1=low, 2=medium, 3=high

**Trade-offs:**
- **Option 1 (String)**:
  - ✅ Simple to implement
  - ✅ Easy to serialize (for future persistence)
  - ❌ No type safety—validation at runtime only
  - ❌ Case sensitivity issues

- **Option 2 (Enum)** [CHOSEN]:
  - ✅ Type safety—invalid priorities rejected at type level
  - ✅ Clear enumeration of valid values
  - ✅ No case sensitivity issues (normalize in CLI)
  - ❌ Slightly more complex to serialize (for future persistence)

- **Option 3 (Integer)**:
  - ✅ Sorting is trivial (numeric comparison)
  - ❌ Magic numbers reduce readability
  - ❌ Display requires mapping back to strings
  - ❌ No semantic meaning (what does 2 mean?)

**Rationale for Choice:**
Chose **Option 2 (Enum)** because:
- Constitution Principle: Type Safety—"Type hints are MANDATORY everywhere"
- Enum provides compile-time validation (or static analysis validation)
- Clear semantics (Priority.HIGH vs. "high" vs. 3)
- Python 3.13 enum is standard library (no external dependency)
- Sorting logic is explicit (`Priority.HIGH > Priority.MEDIUM`) rather than magic numbers

**Principles Applied:**
- Type Safety: Enum enforces valid values
- Readability: `Priority.HIGH` is self-documenting
- Simplicity: Three-value enum is straightforward

**Measured Against:**
- Spec FR-001: "priority field (enum: 'low', 'medium', 'high')"—enum explicitly specified
- Constitution Type Safety: Mandatory type hints satisfied with Enum

### Decision 4: Tag Validation (Strict vs. Permissive)

**Options Considered:**
1. Strict validation—alphanumeric + hyphen only, max 20 chars, reject invalid tags
2. Permissive validation—accept all input, no length limits
3. Hybrid—warn on unusual characters but accept

**Trade-offs:**
- **Option 1 (Strict)** [CHOSEN]:
  - ✅ Prevents display issues (tags with spaces, special characters)
  - ✅ Consistent tag formatting
  - ✅ Prepares for future features (tag-based URLs, etc.)
  - ❌ Users may find restrictions frustrating

- **Option 2 (Permissive)**:
  - ✅ Maximum user flexibility
  - ❌ Display issues with long tags or special characters
  - ❌ Inconsistent tag formats (e.g., "work" vs. "Work!" vs. "work-task")

- **Option 3 (Hybrid)**:
  - ✅ Balances safety and flexibility
  - ❌ Warnings add complexity
  - ❌ Users may ignore warnings, leading to same issues as permissive

**Rationale for Choice:**
Chose **Option 1 (Strict)** because:
- Spec FR-011: "tags containing spaces or special characters" explicitly rejected
- Spec FR-012: "limit individual tag length to 20 characters" explicit requirement
- Prevents future display and parsing issues
- Clear error messages guide users to correct format
- Consistent with priority validation (strict enum)

**Principles Applied:**
- Error Handling: Clear validation with helpful messages
- Consistency: Strict validation matches priority validation approach
- Future-proofing: Prevents tag formats that won't work with future features

**Measured Against:**
- Spec FR-011, FR-012: Explicit validation requirements
- Constitution Error Handling: "Invalid input MUST result in helpful messages"

### Decision 5: Sort Stability (Stable vs. Unstable)

**Options Considered:**
1. Stable sort—preserve original order for equal elements
2. Unstable sort—no guarantee on order of equal elements
3. Explicit secondary sort key (e.g., sort by priority, then by created_at)

**Trade-offs:**
- **Option 1 (Stable)** [CHOSEN]:
  - ✅ Predictable behavior—same sort always produces same order
  - ✅ Preserves creation order for equal priorities
  - ✅ Python's built-in sort (Timsort) is stable by default
  - ❌ No drawbacks for Phase I

- **Option 2 (Unstable)**:
  - ❌ Unpredictable order confuses users
  - ❌ No performance benefit for in-memory Phase I
  - ❌ Violates Principle I (Simplicity) by introducing unpredictability

- **Option 3 (Explicit Secondary Sort)**:
  - ✅ Most control over tie-breaking
  - ❌ Over-engineering for Phase I
  - ❌ Adds complexity to sort command (users must specify secondary key)

**Rationale for Choice:**
Chose **Option 1 (Stable Sort)** because:
- Python's `sorted()` is stable by default—no extra work
- Spec FR-032: "stable sort (preserve original order for equal elements)" explicit requirement
- Users expect consistent results from same sort operation
- Creation order is intuitive tie-breaker

**Principles Applied:**
- Simplicity: Use Python's default behavior
- Predictability: Same input always produces same output
- User-centric: Stable sort matches user expectations

**Measured Against:**
- Spec FR-032: Explicit stable sort requirement
- Constitution Principle I: "No performance optimizations unless there's a measured bottleneck"—stable sort has no performance penalty

## Interfaces and API Contracts

### Public APIs (TodoApp Methods)

All TodoApp methods follow the established pattern from Basic Level: `tuple[bool, str]` return type for error handling.

#### Priority Management

```python
def set_priority(self, task_id: int, priority_str: str) -> tuple[bool, str]:
    """Set the priority level for a task.

    Args:
        task_id: ID of the task to update
        priority_str: Priority level ("low", "medium", "high", case-insensitive)

    Returns:
        (True, "Priority set to {level}") on success
        (False, "Task #{id} not found") if task doesn't exist
        (False, "Invalid priority. Use: low, medium, high") if priority invalid

    Side effects:
        - Updates task.priority if successful
    """
```

#### Tag Management

```python
def set_tags(self, task_id: int, tags_str: str) -> tuple[bool, str]:
    """Set tags for a task (replaces existing tags).

    Args:
        task_id: ID of the task to update
        tags_str: Comma-separated tag list (e.g., "work,urgent") or empty to clear

    Returns:
        (True, "Tags updated") on success
        (False, "Task #{id} not found") if task doesn't exist
        (False, "Invalid tag '{tag}': {reason}") if any tag is invalid

    Validation:
        - Tags normalized to lowercase
        - Duplicates removed
        - Each tag: alphanumeric + hyphen only, max 20 chars
        - Empty tags_str clears all tags

    Side effects:
        - Updates task.tags if successful
    """
```

#### Search

```python
def search_tasks(self, keyword: str) -> list[Task]:
    """Search for tasks by keyword in title or description.

    Args:
        keyword: Search term (case-insensitive substring match)

    Returns:
        List of tasks where keyword appears in title or description
        Empty list if no matches

    Notes:
        - Case-insensitive search
        - Searches both title and description fields
        - Returns tasks in original creation order
    """
```

#### Filter

```python
def filter_tasks(self, field: str, value: str) -> list[Task]:
    """Filter tasks by attribute.

    Args:
        field: Filter field ("priority", "tag", "status")
        value: Filter value (depends on field)
            - priority: "low", "medium", "high"
            - tag: tag name (case-insensitive match)
            - status: "completed", "pending"

    Returns:
        List of tasks matching the filter criteria
        Empty list if no matches

    Raises:
        ValueError: If field or value is invalid

    Notes:
        - Non-persistent—returns filtered list without modifying _tasks
        - Case-insensitive comparisons
        - For tag filter: matches tasks containing the tag
    """
```

#### Sort

```python
def sort_tasks(self, field: str) -> list[Task]:
    """Sort tasks by specified field.

    Args:
        field: Sort field ("priority", "title", "created", "due")

    Returns:
        Sorted list of tasks

    Raises:
        ValueError: If field is invalid

    Sort orders:
        - priority: HIGH → MEDIUM → LOW (stable by created_at)
        - title: Alphabetical A-Z (case-insensitive, stable by created_at)
        - created: Newest first (descending created_at)
        - due: Earliest first, then tasks without due dates

    Notes:
        - Non-persistent—returns sorted list without modifying _tasks
        - Stable sort (preserves creation order for ties)
    """
```

### Task Data Model (Extended)

```python
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum

class Priority(Enum):
    """Task priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

    def __lt__(self, other):
        """Define ordering: HIGH < MEDIUM < LOW for reverse sort."""
        order = {Priority.HIGH: 0, Priority.MEDIUM: 1, Priority.LOW: 2}
        return order[self] < order[other]

@dataclass
class Task:
    """Represents a single todo task (extended from Basic Level).

    Attributes:
        id: Unique task identifier (auto-incremented by TodoApp)
        title: Task title (required, non-empty)
        description: Optional task description
        completed: Task completion status (default: False)
        priority: Task priority level (default: MEDIUM) [NEW]
        tags: List of tags for organization (default: empty) [NEW]
        created_at: Timestamp of task creation (auto-set) [NEW]
    """
    id: int
    title: str
    description: str
    completed: bool = False
    priority: Priority = Priority.MEDIUM
    tags: list[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)

    def __str__(self) -> str:
        """Return formatted string representation with priority and tags.

        Format: {id}. [{status}] {priority_indicator} {title} {tags}

        Examples:
            "1. [ ] !! Buy groceries #shopping #urgent"
            "2. [x] !!! Finish report #work"
        """
```

### CLI Command Contracts

All CLI commands follow the established pattern from Basic Level:
1. Display menu with options
2. Parse user input
3. Call TodoApp method
4. Display success/error message
5. Return to menu

**New Commands:**

```
priority <id> <level>
  - Set priority for task
  - Example: priority 5 high
  - Levels: low, medium, high (case-insensitive)

tag <id> <tags>
  - Set tags for task (comma-separated)
  - Example: tag 5 work,urgent
  - Omit tags to clear: tag 5

search <keyword>
  - Search tasks by keyword
  - Example: search meeting
  - Searches title and description

filter <field> <value>
  - Filter tasks by attribute
  - Examples:
    - filter priority high
    - filter tag work
    - filter status completed

sort <field>
  - Sort tasks by field
  - Examples:
    - sort priority
    - sort title
    - sort created
    - sort due (prepared for Advanced Level)
```

### Versioning Strategy

**Backward Compatibility Guarantee:**
- All Basic Level commands work identically
- Task objects created in Basic Level display with default values:
  - priority: MEDIUM (displayed as `!!`)
  - tags: empty list (no tag display)
  - created_at: auto-set on first access (for sorting purposes)

**No Breaking Changes:**
- `add_task()` signature unchanged (priority/tags set via separate commands)
- `list_tasks()` signature unchanged (extended to show priority/tags)
- All Basic Level error messages unchanged

**Extension Pattern:**
- New fields are optional with sensible defaults
- New methods are additive (no modifications to existing methods)
- CLI commands are additive (existing commands unchanged)

### Idempotency, Timeouts, Retries

**Not Applicable:** In-memory, synchronous operations with no I/O, no network, no file system. All operations complete immediately (<100ms) with deterministic results.

**Idempotency Notes:**
- `set_priority(5, "high")` called twice has same effect as once (idempotent)
- `set_tags(5, "work")` called twice has same effect as once (idempotent)
- Search, filter, sort are read-only operations (inherently idempotent)

### Error Taxonomy

**Extended from Basic Level:**

| Error Type | Status | Example | Handling |
|------------|--------|---------|----------|
| Invalid Priority | User Error | "priority 5 invalid" | Display: "Invalid priority. Use: low, medium, high" |
| Invalid Tag Format | User Error | "tag 5 work urgent" (missing comma) | Display: "Invalid tag format. Use comma-separated tags: work,urgent" |
| Tag Too Long | User Error | "tag 5 averylongtagname..." | Display: "Tag 'averylongtagname...' exceeds 20 characters" |
| Invalid Filter Field | User Error | "filter category work" | Display: "Invalid filter field. Use: priority, tag, status" |
| Invalid Filter Value | User Error | "filter priority urgent" | Display: "Invalid filter value for priority. Use: low, medium, high" |
| Invalid Sort Field | User Error | "sort category" | Display: "Invalid sort field. Use: priority, title, created, due" |
| Missing Keyword | User Error | "search" (no keyword) | Display: "Search keyword required" |
| Task Not Found | User Error | "priority 99 high" | Display: "Task #99 not found" |

**All errors return to menu without crashing. No stack traces shown to users.**

## Non-Functional Requirements (NFRs) and Budgets

### Performance

**Latency Targets:**
- Priority/tag operations: <100ms (same as Basic Level CRUD)
- Search 100 tasks: <500ms (per spec SC-003)
- Filter 50 tasks: <500ms (per spec SC-002)
- Sort 100 tasks: <100ms (Python's Timsort is O(n log n), fast for 100 items)

**Throughput:** Not applicable (single-user, synchronous CLI)

**Resource Caps:**
- Memory: ~10KB per task (1000 tasks = ~10MB, well within limits)
- CPU: Single-threaded, negligible usage

**Measurement:**
- Manual testing with 100-task list (create script to generate test data)
- Verify operations feel "instant" (<500ms perception threshold)

### Reliability

**SLOs:** Not applicable (no uptime requirement for local CLI)

**Error Budgets:** Not applicable (no SLA)

**Degradation Strategy:**
- Graceful degradation: All errors result in helpful messages, return to menu
- No partial state—operations are atomic (success or no change)

### Security

**AuthN/AuthZ:** Not applicable (single-user, local application, no authentication)

**Data Handling:**
- No sensitive data expected in tasks
- No encryption (in-memory only, no persistence)
- No sanitization needed (no injection vectors—string data displayed in terminal)

**Secrets Management:** Not applicable (no secrets, no API keys, no credentials)

**Auditing:** Not applicable (no audit log in Phase I)

### Cost

**Unit Economics:** Not applicable (no cloud services, no infrastructure costs)

## Data Management and Migration

### Source of Truth

**Single Source:** In-memory `_tasks` list inside TodoApp instance.

**No Replication:** No persistence, no distributed state.

### Schema Evolution

**Migration Strategy for Task Model:**

**From Basic Level to Intermediate Level:**

```python
# Basic Level Task (v1.0)
@dataclass
class Task:
    id: int
    title: str
    description: str
    completed: bool = False

# Intermediate Level Task (v1.1)
@dataclass
class Task:
    id: int
    title: str
    description: str
    completed: bool = False
    priority: Priority = Priority.MEDIUM        # NEW: default MEDIUM
    tags: list[str] = field(default_factory=list)  # NEW: default empty
    created_at: datetime = field(default_factory=datetime.now)  # NEW: auto-set
```

**In-Memory Migration:** Not required—dataclass defaults automatically apply to existing instances when fields are accessed. No manual migration code needed.

**For Future Persistence (Out of Scope):**
- If tasks are saved to file/DB, loader must handle missing fields:
  - Set priority=MEDIUM if field missing
  - Set tags=[] if field missing
  - Set created_at=current_time or last_modified if field missing

### Data Retention

**Retention Policy:** Data exists only during session runtime. On exit, all data is lost (per Phase I constraints).

**No Backups:** In-memory only, no persistence.

## Operational Readiness

### Observability

**Logs:** None (Phase I constraint—no logging infrastructure)

**Metrics:** None (no metrics collection)

**Traces:** None (synchronous operations, no distributed tracing needed)

**For Future Phases:** Consider adding debug mode with operation logging.

### Alerting

**Not Applicable:** Local CLI application, no production environment.

### Runbooks

**Common Tasks:**

1. **Add tasks with priority and tags:**
   ```
   1. Run: python -m src
   2. Select: add
   3. Enter title and description
   4. After task created, run: priority <id> high
   5. Then run: tag <id> work,urgent
   ```

2. **Search for specific tasks:**
   ```
   1. Run: python -m src
   2. Select: search
   3. Enter keyword (e.g., "meeting")
   4. View results
   ```

3. **Filter high-priority work tasks:**
   ```
   1. Run: python -m src
   2. Select: filter
   3. Enter: priority high
   4. Note: To filter by tag afterward, run filter again (filters don't chain)
   ```

4. **Sort tasks by priority:**
   ```
   1. Run: python -m src
   2. Select: sort
   3. Enter: priority
   4. View tasks in order: high → medium → low
   ```

### Deployment and Rollback

**Deployment:**
- No deployment process (local development)
- Users run: `python -m src` from repository root
- Code changes take effect immediately on next run

**Rollback:**
- Git revert to previous commit
- No state to roll back (no persistence)

### Feature Flags

**Not Applicable:** All features enabled by default. No gradual rollout needed for single-user application.

### Compatibility

**Backward Compatibility:**
- Basic Level tasks work seamlessly with Intermediate Level code
- Default values ensure no breaking changes
- CLI commands are additive (existing commands unchanged)

**Forward Compatibility:**
- Intermediate Level prepares for Advanced Level:
  - Sort by "due" command exists (returns error if due_date not set)
  - Task model can be extended with due_date field later
  - No architectural changes needed for Advanced Level features

## Risk Analysis and Mitigation

### Risk 1: Breaking Basic Level Functionality

**Description:** Extending Task model or TodoApp might break existing commands.

**Likelihood:** Medium (code changes always carry risk)

**Impact:** High (violates constitution backward compatibility requirement)

**Blast Radius:** All Basic Level functionality

**Mitigation:**
- Comprehensive manual testing of all Basic Level user stories before merging
- Use default values for all new fields (priority=MEDIUM, tags=[], created_at=now)
- No modifications to existing TodoApp methods (only additions)
- Regression test checklist in tasks.md

**Kill Switch:** Git revert to Basic Level commit

**Guardrails:**
- Constitution check in plan (completed above—all PASS)
- Acceptance checklist includes "All Basic Level functionality still works"

### Risk 2: Tag Parsing Confusion (Spaces vs. Commas)

**Description:** Users may type `tag 5 work urgent` instead of `tag 5 work,urgent`.

**Likelihood:** High (common user error based on CLI patterns)

**Impact:** Low (usability friction, not data loss)

**Blast Radius:** Tag command only

**Mitigation:**
- Clear error message: "Invalid tag format. Use comma-separated tags: work,urgent"
- Help text includes examples with commas
- Quickstart guide includes tag command examples

**Kill Switch:** Not applicable (no data corruption risk)

**Guardrails:**
- Error message tested in acceptance scenarios
- Example in CLI help menu

### Risk 3: Filter/Search Performance Degradation

**Description:** O(n) iteration over large task lists might feel slow.

**Likelihood:** Low (in-memory Phase I unlikely to exceed 1000 tasks)

**Impact:** Medium (user frustration, but no data corruption)

**Blast Radius:** Search and filter commands only

**Mitigation:**
- Performance success criteria: <500ms for 100 tasks (spec SC-002, SC-003)
- Manual testing with 100-task list
- If slow, optimization can be added in future phase (e.g., indexing)

**Kill Switch:** Disable search/filter commands, revert to Basic Level

**Guardrails:**
- Performance criteria in acceptance checklist
- Test data generation script for load testing

### Risk 4: Sort Order Confusion After Modifications

**Description:** Users may expect sort order to persist after adding/updating tasks.

**Likelihood:** Medium (users familiar with spreadsheet-style persistent sorting)

**Impact:** Low (minor UX issue, no data loss)

**Blast Radius:** Sort command only

**Mitigation:**
- Clear documentation: "Sort order clears after modifications"
- Consider adding message: "Sort order cleared" when sort is reset
- Consistent behavior: all filters/sorts are non-persistent

**Kill Switch:** Not applicable (no data corruption risk)

**Guardrails:**
- Behavior documented in spec FR-034
- Help text mentions non-persistent behavior

## Evaluation and Validation

### Definition of Done

**Code Complete:**
- [ ] All 5 new TodoApp methods implemented (set_priority, set_tags, search, filter, sort)
- [ ] Task model extended with priority, tags, created_at fields
- [ ] Priority enum defined with LOW, MEDIUM, HIGH values
- [ ] CLI extended with 5 new commands (priority, tag, search, filter, sort)
- [ ] All error messages implemented per Error Taxonomy
- [ ] All methods have type hints and docstrings

**Testing Complete:**
- [ ] All 5 user stories pass acceptance scenarios (20+ test cases total)
- [ ] All edge cases handled gracefully (no crashes)
- [ ] All Basic Level functionality regression-tested (no breaking changes)
- [ ] Performance criteria met (<500ms for search/filter on 100 tasks)
- [ ] 100-task load test completed

**Documentation Complete:**
- [ ] README updated with new commands and examples
- [ ] Quickstart guide includes priority, tag, search, filter, sort examples
- [ ] Data model documentation updated
- [ ] Contract documentation for TodoApp extensions

**Constitution Compliance:**
- [ ] PEP 8 compliance verified
- [ ] Type hints on all new code
- [ ] Docstrings on all new functions/methods
- [ ] No external dependencies added
- [ ] No global mutable state introduced
- [ ] Separation of concerns maintained (CLI → TodoApp → Task)

### Output Validation

**Format Validation:**
- Priority indicators display correctly (!!!, !!, !)
- Tags display correctly (#tag1 #tag2)
- Task list alignment maintained with new fields
- Error messages follow established pattern from Basic Level

**Requirements Validation:**
- All 40 Functional Requirements (FR-001 to FR-040) implemented
- All 8 Success Criteria (SC-001 to SC-008) validated
- All 5 user stories pass acceptance scenarios

**Safety Validation:**
- No crashes on any invalid input combination
- No stack traces shown to users
- All errors return to menu gracefully
- No data corruption (priority/tags don't affect id, title, description, completed)

## Architectural Decision Records (ADR)

**ADR Candidates Identified:**

Based on the three-part significance test (Impact + Alternatives + Scope), the following decisions meet ADR criteria:

### ADR Candidate 1: Tags vs. Single Category Field

**Significance Test:**
- ✅ **Impact:** Long-term consequences—affects how users organize tasks, influences future features (tag-based views, tag statistics), constrains data model evolution
- ✅ **Alternatives:** Multiple viable options considered (single category, multiple tags, both)
- ✅ **Scope:** Cross-cutting—affects Task model, TodoApp business logic, CLI commands, future persistence schema

**Recommendation:** Document this decision in ADR.

**Title:** "ADR-001: Use Flexible Tags Instead of Single Category Field for Task Organization"

### ADR Candidate 2: Non-Persistent Filters and Sorts

**Significance Test:**
- ✅ **Impact:** Long-term consequences—affects user workflow patterns, influences state management complexity, sets precedent for future Phase I features
- ✅ **Alternatives:** Multiple viable options considered (persistent, non-persistent, hybrid)
- ✅ **Scope:** Cross-cutting—affects TodoApp state management, CLI command flow, future filter enhancements

**Recommendation:** Document this decision in ADR.

**Title:** "ADR-002: Non-Persistent Filters and Sorts to Maintain Simplicity"

### ADR Candidate 3: Priority as Enum vs. String

**Significance Test:**
- ✅ **Impact:** Long-term consequences—affects type safety, future persistence serialization, influences validation patterns for other enums (e.g., Status in future)
- ✅ **Alternatives:** Multiple viable options considered (enum, string, integer)
- ✅ **Scope:** Cross-cutting—affects Task model, TodoApp validation, future data model extensions

**Recommendation:** Document this decision in ADR.

**Title:** "ADR-003: Use Enum for Priority Type Safety and Semantic Clarity"

**Non-Candidates:**
- Tag validation (strict vs. permissive): Implementation detail, not architecturally significant
- Sort stability: Python default, no real decision made
- Command syntax: UI decision, not architectural

## Suggested ADR Creation

Based on the above analysis, I recommend creating 3 ADRs:

📋 **Architectural decisions detected:**

1. **Tags vs. Single Category Field** — Chose flexible tags over single category for multi-dimensional organization. Document reasoning and tradeoffs? Run `/sp.adr "Use Flexible Tags Instead of Single Category Field"`

2. **Non-Persistent Filters and Sorts** — Chose non-persistent filters/sorts to maintain simplicity and avoid hidden state. Document reasoning and tradeoffs? Run `/sp.adr "Non-Persistent Filters and Sorts to Maintain Simplicity"`

3. **Priority as Enum** — Chose Enum over String for priority to ensure type safety and semantic clarity. Document reasoning and tradeoffs? Run `/sp.adr "Use Enum for Priority Type Safety"`

These ADRs will capture the decision-making process and ensure future developers understand why these architectural choices were made.

## Open Questions

*All clarifications obtained from spec. No open questions remain.*

## Related Documents

- Constitution v1.1.0: `.specify/memory/constitution.md`
- Basic Level Spec: `specs/001-todo-cli/spec.md`
- Basic Level Plan: `specs/001-todo-cli/plan.md`
- Intermediate Level Spec: `specs/002-intermediate-level/spec.md` (this feature)
- Advanced Level Spec (future): `specs/003-advanced-level/spec.md` (due dates, reminders, recurrence)

## Next Steps

1. **Review and approve this plan** before proceeding to Phase 0 research
2. **Create 3 ADRs** for significant architectural decisions (optional but recommended)
3. **Run `/sp.tasks`** to generate implementation task breakdown
4. **Implement in priority order:** Priority (P1) → Tags (P2) → Filter (P3) → Search (P4) → Sort (P5)
5. **Regression test Basic Level** after each feature completion
6. **Update README and quickstart** after implementation complete

---

**Plan Version:** 1.0
**Last Updated:** 2025-12-27
**Approval Status:** Awaiting Review
