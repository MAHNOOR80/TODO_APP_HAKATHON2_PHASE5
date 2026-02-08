# Tasks: Advanced Level - Intelligent Features

**Input**: Design documents from `specs/003-advanced-level/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/cli-commands.md

**Tests**: Tests are NOT explicitly requested in the specification, so test tasks are excluded. Focus on implementation and manual validation using quickstart scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story (P1: Due Dates, P2: Reminders, P3: Recurring Tasks).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- Current structure: `src/task.py`, `src/todo_app.py`, `src/cli.py`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and constants setup

- [X] T001 Add datetime import and constants to src/task.py
- [X] T002 [P] Add datetime helper functions to src/todo_app.py

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data model extensions that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Extend Task dataclass with due_date field (datetime | None) in src/task.py
- [X] T004 [P] Add REMINDER_OFFSET constants to src/task.py (1440, 60, 30, 10 minutes)
- [X] T005 [P] Add RECURRENCE_PATTERN constants to src/task.py ("daily", "weekly", "monthly")
- [X] T006 Add validation helper is_valid_reminder_offset(offset: int) -> bool in src/task.py
- [X] T007 [P] Add validation helper is_valid_recurrence_pattern(pattern: str) -> bool in src/task.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Due Date Management (Priority: P1) 🎯 MVP

**Goal**: Users can assign due dates and times to tasks to track deadlines and visualize when work must be completed

**Independent Test**: Create tasks with various due dates, list tasks to verify dates display correctly, filter/sort tasks by due date. Delivers value by enabling deadline awareness and planning.

### Data Model for User Story 1

- [X] T008 [P] [US1] Add reminder_offset field (int | None) to Task dataclass in src/task.py
- [X] T009 [P] [US1] Add recurrence_pattern field (str | None) to Task dataclass in src/task.py
- [X] T010 [P] [US1] Add recurrence_end_date field (datetime | None) to Task dataclass in src/task.py

### Business Logic for User Story 1

- [X] T011 [US1] Implement is_overdue(task: Task) -> bool in src/todo_app.py
- [X] T012 [US1] Implement get_overdue_tasks() -> list[Task] in src/todo_app.py
- [X] T013 [US1] Add parse_due_datetime(date_str: str, time_str: str) -> datetime helper in src/todo_app.py
- [X] T014 [US1] Add format_due_datetime(dt: datetime) -> str helper in src/todo_app.py
- [X] T015 [US1] Extend add_task() to accept optional due_date parameter in src/todo_app.py
- [X] T016 [US1] Add set_due_date(task_id: int, due_date: datetime | None) method in src/todo_app.py
- [X] T017 [US1] Extend list_tasks() to show due dates and overdue markers in src/todo_app.py

### CLI Commands for User Story 1

- [X] T018 [US1] Extend add command with optional due date prompts in src/cli.py
- [X] T019 [US1] Implement due <id> command handler in src/cli.py
- [X] T020 [US1] Implement due <id> clear command handler in src/cli.py
- [X] T021 [US1] Update list command to display due dates with format "(Due: YYYY-MM-DD HH:MM)" in src/cli.py
- [X] T022 [US1] Add [OVERDUE] marker to task display for overdue tasks in src/cli.py
- [X] T023 [US1] Implement sort due functionality (soonest first, None at end) in src/cli.py
- [X] T024 [US1] Implement filter overdue functionality in src/cli.py

### Validation for User Story 1

- [X] T025 [US1] Add date format validation with user-friendly errors in src/cli.py
- [X] T026 [US1] Add time format validation with user-friendly errors in src/cli.py

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently
- Manual test: Create task with due date → verify display → sort by due → filter overdue
- Scenarios: quickstart.md "Due Date Workflows" sections 1-5

---

## Phase 4: User Story 2 - Task Reminders (Priority: P2)

**Goal**: Users receive notifications before task deadlines to ensure they don't miss important due dates

**Independent Test**: Set reminders on tasks with due dates, then check at appropriate times that reminders appear on startup. Delivers value by preventing missed deadlines through proactive notifications.

**Dependency**: Requires User Story 1 (due dates must exist for reminders to work)

### Data Structures for User Story 2

- [X] T027 [P] [US2] Create ReminderInfo dataclass in src/todo_app.py (task_id, title, due_datetime, time_remaining)

### Business Logic for User Story 2

- [X] T028 [US2] Implement calculate_trigger_time(due_date: datetime, offset: int) -> datetime in src/todo_app.py
- [X] T029 [US2] Implement should_show_reminder(task: Task) -> bool in src/todo_app.py
- [X] T030 [US2] Implement get_active_reminders() -> list[ReminderInfo] in src/todo_app.py
- [X] T031 [US2] Implement format_time_remaining(due_date: datetime) -> str in src/todo_app.py
- [X] T032 [US2] Add set_reminder(task_id: int, offset: int | None) method in src/todo_app.py

### CLI Commands for User Story 2

- [X] T033 [US2] Extend add command with optional reminder prompts (shown only if due date set) in src/cli.py
- [X] T034 [US2] Implement remind <id> command handler with preset offset menu in src/cli.py
- [X] T035 [US2] Implement remind <id> clear command handler in src/cli.py
- [X] T036 [US2] Add startup reminder display before main menu in src/cli.py
- [X] T037 [US2] Format startup reminder section with "⏰ REMINDERS - Tasks Due Soon:" header in src/cli.py

### Validation for User Story 2

- [X] T038 [US2] Validate reminder requires due_date in src/todo_app.py
- [X] T039 [US2] Validate reminder offset is in preset options (1-4 menu choice) in src/cli.py

### Integration for User Story 2

- [X] T040 [US2] Update due <id> clear to cascade clear reminder_offset in src/todo_app.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently
- Manual test: Create task with due date + reminder → restart app → verify reminder appears
- Scenarios: quickstart.md "Reminder Workflows" sections 6-10

---

## Phase 5: User Story 3 - Recurring Tasks (Priority: P3)

**Goal**: Users can create tasks that automatically repeat on a schedule (daily, weekly, monthly), eliminating the need to manually recreate routine tasks

**Independent Test**: Create a task with a recurrence pattern, complete it, and verify a new instance is generated with the next scheduled date. Delivers value by automating repetitive task management.

**Dependency**: Requires User Story 1 (due dates required for calculating next occurrence)

### Business Logic for User Story 3

- [X] T041 [US3] Implement calculate_next_occurrence(due_date: datetime, pattern: str) -> datetime in src/todo_app.py
- [X] T042 [US3] Handle monthly recurrence edge cases (Feb 29, day 31) in calculate_next_occurrence
- [X] T043 [US3] Implement generate_recurring_task(task: Task) -> Task | None in src/todo_app.py
- [X] T044 [US3] Add set_recurrence(task_id: int, pattern: str | None, end_date: datetime | None) method in src/todo_app.py
- [X] T045 [US3] Extend complete_task(task_id: int) to check for recurrence and generate new instance in src/todo_app.py

### CLI Commands for User Story 3

- [X] T046 [US3] Extend add command with optional recurrence prompts (shown only if due date set) in src/cli.py
- [X] T047 [US3] Implement recur <id> command handler with pattern menu in src/cli.py
- [X] T048 [US3] Implement recur <id> clear command handler in src/cli.py
- [X] T049 [US3] Add recurrence pattern display to list command with "⟳" icon in src/cli.py
- [X] T050 [US3] Handle optional end date prompt in recur command in src/cli.py

### Validation for User Story 3

- [X] T051 [US3] Validate recurrence requires due_date in src/todo_app.py
- [X] T052 [US3] Validate recurrence_end_date >= due_date in src/todo_app.py
- [X] T053 [US3] Validate recurrence pattern is in allowed values ("daily", "weekly", "monthly") in src/cli.py

### Integration for User Story 3

- [X] T054 [US3] Update due <id> clear to cascade clear recurrence_pattern and recurrence_end_date in src/todo_app.py
- [X] T055 [US3] Verify recurring task generation preserves title, description, priority, tags per FR-023 in src/todo_app.py

**Checkpoint**: All user stories should now be independently functional
- Manual test: Create daily recurring task → complete it → verify new instance with tomorrow's date
- Scenarios: quickstart.md "Recurring Task Workflows" sections 11-16

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T056 [P] Update docs/quickstart-intermediate.md to reference advanced features or create quickstart-advanced.md
- [X] T057 [P] Update README.md with advanced level command reference (due, remind, recur)
- [X] T058 Verify all error messages are user-friendly and actionable across all commands
- [X] T059 Run all scenarios from specs/003-advanced-level/quickstart.md to validate workflows
- [X] T060 [P] Add inline code comments for complex date arithmetic (monthly recurrence, reminder trigger)
- [X] T061 Verify backward compatibility: existing tasks without due dates work unchanged
- [X] T062 [P] Update help command text to include new commands in src/cli.py

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3, 4, 5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - Requires US1 for integration but independently testable
  - User Story 3 (P3): Can start after Foundational - Requires US1 for integration but independently testable
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Due Dates)**: FOUNDATION
  - Can start after Foundational (Phase 2)
  - No dependencies on other stories
  - Provides due_date field that US2 and US3 build upon

- **User Story 2 (P2 - Reminders)**: BUILDS ON US1
  - Requires US1 due dates (cannot set reminder without due date per FR-011)
  - Integration points: due <id> clear must cascade to reminder_offset
  - Independently testable: Can test reminder display on tasks with due dates

- **User Story 3 (P3 - Recurring)**: BUILDS ON US1
  - Requires US1 due dates (cannot set recurrence without due date per FR-020)
  - Integration points: due <id> clear must cascade to recurrence fields
  - Independently testable: Can test recurrence generation on tasks with due dates

### Within Each User Story

- Data model extensions before business logic
- Business logic before CLI commands
- Validation alongside related functionality
- Integration tasks last within each story

### Parallel Opportunities

- **Phase 1 Setup**: T001 and T002 can run in parallel (different concerns)
- **Phase 2 Foundational**: T004, T005, T007 can run in parallel (independent constants/helpers)
- **Phase 3 US1 Data Model**: T008, T009, T010 can run in parallel (different fields)
- **Phase 4 US2 Data Structures**: T027 can run while US1 wraps up
- **Phase 6 Polish**: T056, T057, T060, T062 can run in parallel (different files)

**Note**: User Stories 2 and 3 have logical dependencies on User Story 1 (due dates), but once US1 is complete, US2 and US3 could theoretically be developed in parallel by different developers since they modify different aspects (reminders vs recurrence).

---

## Parallel Example: User Story 1

```bash
# After Foundational phase complete, launch data model tasks together:
Task T008: "Add reminder_offset field to Task dataclass in src/task.py"
Task T009: "Add recurrence_pattern field to Task dataclass in src/task.py"
Task T010: "Add recurrence_end_date field to Task dataclass in src/task.py"

# These can be done in parallel since they're adding different fields
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T007) - CRITICAL
3. Complete Phase 3: User Story 1 (T008-T026)
4. **STOP and VALIDATE**:
   - Run scenarios 1-5 from quickstart.md
   - Test: Create task with due date → verify display → sort by due → filter overdue
   - Verify backward compatibility: existing tasks without due dates work unchanged
5. Commit and deploy if ready

**MVP Scope**: Just due date management (P1) provides immediate value for deadline tracking

### Incremental Delivery

1. **Foundation**: Setup + Foundational → T001-T007 complete
2. **MVP Release**: Add User Story 1 → T008-T026 → Test independently → Deploy
   - Users can now track deadlines
3. **Enhancement 1**: Add User Story 2 → T027-T040 → Test independently → Deploy
   - Users now get startup reminders
4. **Enhancement 2**: Add User Story 3 → T041-T055 → Test independently → Deploy
   - Users now have automated recurring tasks
5. **Polish**: Phase 6 → T056-T062 → Final release

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Team together**: Complete Setup + Foundational (T001-T007)
2. **Once Foundational done**:
   - Developer A: User Story 1 (T008-T026)
   - Wait for US1 completion (required for US2 and US3)
3. **After US1 complete**:
   - Developer B: User Story 2 (T027-T040)
   - Developer C: User Story 3 (T041-T055)
   - Stories complete independently
4. **Team together**: Polish (T056-T062)

**Recommended**: Sequential implementation (P1 → P2 → P3) for single developer to minimize context switching and ensure proper integration.

---

## Notes

- **[P] tasks**: Can run in parallel (different files, no dependencies)
- **[Story] label**: Maps task to specific user story for traceability
- **Each user story independently testable**: Use quickstart.md scenarios
- **No test tasks**: Tests not requested in spec; rely on manual validation via quickstart scenarios
- **Commit strategy**: Commit after each task or logical group (e.g., all data model tasks)
- **Checkpoints**: Stop at end of each phase to validate story works independently
- **Backward compatibility**: Verify at checkpoints that existing tasks without due dates still work
- **Edge cases**: Pay special attention to T042 (monthly recurrence Feb 29, day 31)
- **Performance**: Keep in mind goals (<100ms due date ops, <500ms reminder checks)

---

## Task Count Summary

- **Phase 1 Setup**: 2 tasks
- **Phase 2 Foundational**: 5 tasks (BLOCKS all stories)
- **Phase 3 User Story 1** (P1 - Due Dates): 18 tasks
- **Phase 4 User Story 2** (P2 - Reminders): 14 tasks
- **Phase 5 User Story 3** (P3 - Recurring): 15 tasks
- **Phase 6 Polish**: 7 tasks

**Total**: 61 tasks

**Parallel opportunities**: 8 tasks can run in parallel (marked with [P])

**MVP scope**: Phases 1-3 (25 tasks) deliver due date management

**Full feature**: All phases (61 tasks) deliver complete Advanced Level functionality
