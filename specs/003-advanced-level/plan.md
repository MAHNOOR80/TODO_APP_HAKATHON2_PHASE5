# Implementation Plan: Advanced Level - Intelligent Features

**Branch**: `003-advanced-level` | **Date**: 2025-12-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/003-advanced-level/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**Primary Requirement**: Enable time-based task management through due dates, reminders, and recurring task automation.

**Feature Scope**:
- **P1 - Due Date Management**: Users can assign due dates and times (YYYY-MM-DD HH:MM format) to tasks, with visual overdue indicators and chronological sorting
- **P2 - Task Reminders**: Automatic startup notifications for tasks approaching deadlines, using preset reminder offsets (1 day, 1 hour, 30 min, 10 min)
- **P3 - Recurring Tasks**: Auto-generation of task instances on completion with daily, weekly, or monthly recurrence patterns

**Technical Approach**: Extend the existing Task data model with optional datetime fields (`due_date`, `due_time`, `reminder_offset`, `recurrence_pattern`, `recurrence_end_date`). Implement reminder evaluation at application startup by scanning tasks in-memory. Handle recurring task generation synchronously during task completion. All features remain in-memory consistent with Phase I constraints and maintain backward compatibility with Basic/Intermediate levels.

## Technical Context

**Language/Version**: Python 3.13+ (constitution requirement - MANDATORY)
**Primary Dependencies**: Python standard library only (Phase I constraint - no external packages)
**Storage**: In-memory list data structure (no persistence, no database)
**Testing**: pytest (standard Python testing framework - will be added in future phase)
**Target Platform**: Cross-platform CLI (Windows, Linux, macOS) via terminal/command prompt
**Project Type**: Single project (CLI application with src/ directory structure)
**Performance Goals**:
  - Due date operations: <100ms per task
  - Reminder checks on startup: <500ms for 100 tasks
  - Recurring task generation: <1 second per completion
**Constraints**:
  - In-memory only (no files, no persistence between sessions)
  - No external schedulers or cron jobs
  - Backward compatible with Basic and Intermediate Level tasks
  - All new fields optional (default to None/null)
  - System local time only (no timezone conversion)
**Scale/Scope**:
  - Expected workload: ~100 tasks in typical usage
  - 3 user stories (P1: Due Dates, P2: Reminders, P3: Recurring Tasks)
  - 31 functional requirements total
  - Single-user CLI application (no concurrent users)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Evaluation (Before Phase 0)

| Constitutional Rule | Status | Notes |
|---------------------|--------|-------|
| **Python 3.13+ Required** | ✅ PASS | Technical Context specifies Python 3.13+ |
| **Standard Library Only (Phase I)** | ✅ PASS | Using only datetime, timedelta from standard library |
| **Progressive Implementation** | ✅ PASS | Advanced Level follows completed Intermediate Level (002) |
| **Backward Compatibility** | ✅ PASS | All new fields optional (due_date, due_time, reminder_offset, recurrence_pattern default to None) |
| **Separation of Concerns** | ✅ PASS | Changes isolated to: Task model (task.py), business logic (todo_app.py), CLI (cli.py) |
| **Type Hints Mandatory** | ✅ PASS | All new fields will use type hints (datetime \| None, int \| None, str \| None) |
| **PEP 8 Compliance** | ✅ PASS | Existing codebase follows PEP 8; new code will continue |
| **Max Function Length (30 lines)** | ✅ PASS | No complex functions anticipated; reminder check and recurrence logic can be decomposed |
| **No Business Logic in Models** | ✅ PASS | Task model stores data only; calculation logic in todo_app.py |
| **Single Responsibility** | ✅ PASS | Each function handles one concern: display reminders, check due dates, generate recurring task |
| **No Magic Numbers** | ✅ PASS | Preset reminder offsets defined as named constants (REMINDER_1_DAY = 1440, etc.) |

**Gate Result**: ✅ **PASS** - All constitutional requirements satisfied. No complexity violations. Proceed to Phase 0 research.

**Notes**:
- datetime and timedelta are Python standard library modules (no external dependencies)
- In-memory constraint aligns with Phase I governance
- Recurrence patterns use simple enum-like strings ("daily", "weekly", "monthly")
- All changes extend existing Task entity without modifying basic/intermediate fields

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
src/
├── __init__.py          # Package initialization
├── __main__.py          # Entry point for python -m src
├── task.py              # Task data model (MODIFY: add due_date, due_time, reminder_offset, recurrence fields)
├── todo_app.py          # Business logic (MODIFY: add reminder checking, recurrence generation)
└── cli.py               # CLI interface (MODIFY: add due date input/display, reminder display on startup)

tests/                   # Testing structure (to be added in future phase)
├── unit/                # Unit tests for individual functions
├── integration/         # Integration tests for workflows
└── fixtures/            # Test data and fixtures

.specify/                # SpecKit Plus governance
├── memory/              # Project knowledge base
│   └── constitution.md  # Version 1.1.0 - governance rules
├── templates/           # Document templates
└── scripts/             # Automation scripts

specs/                   # Feature specifications
├── 001-todo-cli/        # Basic Level (completed)
├── 002-intermediate-level/ # Intermediate Level (completed)
└── 003-advanced-level/  # Advanced Level (THIS FEATURE)
    ├── spec.md          # Feature specification (✅ CREATED)
    ├── plan.md          # This file (✅ CREATED)
    ├── research.md      # Phase 0 output (✅ CREATED)
    ├── data-model.md    # Phase 1 output (✅ CREATED)
    ├── quickstart.md    # Phase 1 output (✅ CREATED)
    ├── contracts/       # Phase 1 output (✅ CREATED)
    │   └── cli-commands.md  # CLI interface specifications (✅ CREATED)
    └── tasks.md         # Phase 2 output (created by /sp.tasks command)
```

**Structure Decision**: Single project CLI application. All changes are modifications to existing files in `src/` directory:
- **task.py**: Add 5 optional fields to Task dataclass
- **todo_app.py**: Add 3 new methods (check_reminders, generate_recurring_task, get_overdue_tasks) and extend existing methods
- **cli.py**: Add startup reminder display, due date input prompts, and overdue visual indicators

No new modules required. Constitution's separation of concerns maintained: data model (task.py) → business logic (todo_app.py) → presentation (cli.py).

## Complexity Tracking

**No violations** - Constitution Check passed all requirements. No complexity justifications needed.

---

## Phase 0: Research & Technical Decisions

**Status**: ✅ Complete
**Output**: [research.md](research.md)

### Research Areas Addressed

1. **Python datetime Module for Due Dates and Times**
   - Decision: Use `datetime.datetime` from standard library
   - Rationale: Native type, no dependencies, built-in comparison operators
   - Format: YYYY-MM-DD HH:MM (parsed with strptime)

2. **Reminder Offset Storage and Calculation**
   - Decision: Store as integer minutes, calculate with `timedelta`
   - Preset constants: 1440 (1 day), 60 (1 hour), 30, 10 minutes
   - Trigger check: `datetime.now() >= (due_datetime - timedelta(minutes=offset))`

3. **Recurrence Pattern Storage and Logic**
   - Decision: String literals ("daily", "weekly", "monthly")
   - Daily: +1 day, Weekly: +7 days, Monthly: +1 month with day-of-month logic
   - Edge case handling: Month-end dates, Feb 29, invalid day-of-month

4. **Startup Reminder Display Strategy**
   - Decision: Check on CLI initialization, display before main menu
   - Format: "⏰ REMINDERS - Tasks Due Soon:" with task list
   - Non-blocking: Show reminders, then continue to menu

5. **Backward Compatibility Strategy**
   - Decision: All new fields default to None (Optional type hints)
   - Pattern: `if task.due_date:` for conditional rendering
   - No breaking changes to existing task creation

6. **Overdue Visual Indication**
   - Decision: Prefix with `[OVERDUE]` marker in task display
   - Check: `datetime.now() > task.due_date`
   - ANSI color codes for enhanced visibility (graceful degradation)

### Key Technical Decisions

| Decision | Choice | Alternatives Rejected |
|----------|--------|----------------------|
| Date/time storage | datetime.datetime | Separate date/time fields, Unix timestamps |
| Reminder offset unit | Integer minutes | timedelta objects, string descriptions |
| Recurrence representation | String literals | Enum class, cron expressions |
| Monthly recurrence | Simple day-of-month | dateutil.relativedelta (external dep) |
| Reminder trigger | Startup check | Background scheduler (violates constraints) |

### Open Questions Resolved

- **Past dates allowed**: Yes - useful for historical tracking
- **Copy fields to recurring instance**: Yes - title, description, priority, tags (per FR-023)
- **Timezone handling**: Naive datetimes only, system local time
- **Reminder persistence**: No - recalculate on every startup (in-memory only)

---

## Phase 1: Data Model & Contracts

**Status**: ✅ Complete
**Outputs**:
- [data-model.md](data-model.md)
- [contracts/cli-commands.md](contracts/cli-commands.md)
- [quickstart.md](quickstart.md)

### Data Model Summary

**Task Entity Extended**:
```python
@dataclass
class Task:
    # Basic Level (existing)
    id: int
    title: str
    description: str = ""
    completed: bool = False

    # Intermediate Level (existing)
    priority: str = "medium"
    tags: list[str] = field(default_factory=list)

    # Advanced Level (NEW)
    due_date: datetime | None = None
    reminder_offset: int | None = None          # minutes
    recurrence_pattern: str | None = None       # "daily" | "weekly" | "monthly"
    recurrence_end_date: datetime | None = None
```

**Validation Rules**:
- reminder_offset requires due_date
- recurrence_pattern requires due_date
- recurrence_end_date must be >= due_date

**Computed Data** (not stored):
- ReminderInfo: task_id, title, due_datetime, time_remaining
- Overdue status: `datetime.now() > task.due_date`

### CLI Command Contracts Summary

**New Commands** (3):
- `due <id>` - Set/clear due date
- `remind <id>` - Set/clear reminder offset
- `recur <id>` - Set/clear recurrence pattern

**Modified Commands** (3):
- `add` - Extended with due date/reminder/recurrence prompts (all optional)
- `list` - Shows due dates, overdue markers, recurrence icons
- `update` - Includes options to edit due date/reminder/recurrence

**New Behavior** (1):
- Startup reminder display - Automatic before main menu

**Backward Compatibility**:
- All existing commands work unchanged
- New prompts are optional (y/n gates, default to "no")
- Tasks without due dates display exactly as before

### Quickstart Guide Summary

20 scenarios documented across 5 workflow categories:
1. **Due Date Workflows** (5 scenarios): Creating, adding, viewing, overdue, clearing
2. **Reminder Workflows** (5 scenarios): Setting, adding, startup display, changing, removing
3. **Recurring Task Workflows** (6 scenarios): Daily, weekly, monthly, end dates, managing
4. **Combined Workflows** (4 scenarios): Morning planning, end-of-day, sprint planning, multi-project

### Agent Context Update

✅ Updated CLAUDE.md with:
- Language: Python 3.13+ (constitution requirement)
- Framework: Python standard library only (Phase I constraint)
- Database: In-memory list data structure

---

## Phase 2: Constitution Re-Check (Post-Design)

**Status**: ✅ Complete

### Post-Design Evaluation

| Constitutional Rule | Status | Design Compliance Notes |
|---------------------|--------|-------------------------|
| **Python 3.13+ Required** | ✅ PASS | All code uses Python 3.13+ features (type unions with \|) |
| **Standard Library Only** | ✅ PASS | Only datetime and timedelta used (no external deps) |
| **Progressive Implementation** | ✅ PASS | All fields optional, backward compatible |
| **Separation of Concerns** | ✅ PASS | Data model (task.py), logic (todo_app.py), UI (cli.py) clearly separated |
| **Type Hints Mandatory** | ✅ PASS | All new fields have explicit type hints (datetime \| None, etc.) |
| **PEP 8 Compliance** | ✅ PASS | Code style follows PEP 8 conventions |
| **Max Function Length** | ✅ PASS | Functions decomposed (check_reminders, calculate_next_occurrence, etc.) |
| **No Business Logic in Models** | ✅ PASS | Task dataclass has no methods, only data fields |
| **Single Responsibility** | ✅ PASS | Each function has one purpose (validate, calculate, display) |
| **No Magic Numbers** | ✅ PASS | Constants defined for reminder offsets and recurrence patterns |

**Gate Result**: ✅ **PASS** - All constitutional requirements remain satisfied after detailed design.

**No new violations introduced during design phase.**

---

## Implementation Readiness

### Files to Modify

1. **src/task.py** (Data Model)
   - Add 4 new optional fields to Task dataclass
   - Add field validation methods
   - Add constants for valid values

2. **src/todo_app.py** (Business Logic)
   - Add `get_active_reminders() -> list[ReminderInfo]`
   - Add `generate_recurring_task(task: Task) -> Task | None`
   - Add `get_overdue_tasks() -> list[Task]`
   - Extend `complete_task()` to handle recurrence generation
   - Add helper: `calculate_next_occurrence(due_date, pattern) -> datetime`
   - Add helper: `is_overdue(task: Task) -> bool`

3. **src/cli.py** (Presentation)
   - Add startup reminder display (before main menu)
   - Add `due` command handler
   - Add `remind` command handler
   - Add `recur` command handler
   - Extend `add` command with optional due date/reminder/recurrence prompts
   - Extend `list` command to show due dates and overdue markers
   - Extend `update` command with due date/reminder/recurrence options
   - Add helper: `format_time_remaining(minutes: int) -> str`

### Estimated Complexity

| File | Lines Added | Lines Modified | Complexity |
|------|-------------|----------------|------------|
| task.py | ~40 | ~5 | Low (dataclass + constants) |
| todo_app.py | ~150 | ~20 | Medium (date arithmetic, validation) |
| cli.py | ~200 | ~30 | Medium (input prompts, display formatting) |
| **Total** | **~390** | **~55** | **Medium** |

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Month-end date edge cases | Medium | Medium | Unit tests for Feb 29, day 31 transitions |
| Timezone confusion | Low | Low | Document "system local time" assumption clearly |
| Reminder missed on startup | Low | Medium | Test startup flow, ensure check happens first |
| Recurring task infinite loop | Low | High | Validate end_date check, add max iteration guard |
| Backward compatibility break | Very Low | High | Comprehensive testing with Basic/Intermediate tasks |

---

## Next Steps

**Immediate**: Run `/sp.tasks` to generate actionable task breakdown (tasks.md)

**Implementation Order** (will be defined in tasks.md):
1. **P1 - Due Date Management** (Foundation)
   - Extend Task data model
   - Add due date CLI commands
   - Add due date display and sorting

2. **P2 - Task Reminders** (Builds on P1)
   - Add reminder offset to Task
   - Implement startup reminder check
   - Add reminder CLI commands

3. **P3 - Recurring Tasks** (Most Complex)
   - Add recurrence fields to Task
   - Implement recurrence generation logic
   - Add recurrence CLI commands

**Testing Strategy** (future phase):
- Unit tests for date arithmetic functions
- Integration tests for recurring task generation
- Edge case tests for month transitions
- Backward compatibility tests with existing tasks

---

## Summary

**Planning Phase Complete**: ✅

**Artifacts Generated**:
- ✅ plan.md (this file)
- ✅ research.md (technical decisions)
- ✅ data-model.md (entity definitions)
- ✅ contracts/cli-commands.md (CLI interface specs)
- ✅ quickstart.md (user workflows)
- ✅ CLAUDE.md (agent context updated)

**Constitution Compliance**: ✅ All gates passed (pre-design and post-design)

**Ready for**: `/sp.tasks` command to generate implementation task breakdown

**Feature Complexity**: Medium
- 31 functional requirements
- 3 user stories (P1, P2, P3)
- 3 files to modify (task.py, todo_app.py, cli.py)
- ~390 lines of new code estimated

**Key Architectural Decisions**:
1. Use Python datetime standard library (no external dependencies)
2. Store reminder offset as integer minutes with preset constants
3. Recurrence patterns as string literals with simple date arithmetic
4. Startup reminder check (no background schedulers)
5. All new fields optional (backward compatible by design)
6. In-memory storage only (consistent with Phase I constraints)

---

**Branch**: `003-advanced-level`
**Status**: Planning Complete, Ready for Task Generation
**Next Command**: `/sp.tasks`
