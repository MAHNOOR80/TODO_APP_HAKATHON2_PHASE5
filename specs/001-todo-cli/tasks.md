# Tasks: Phase I In-Memory Python Todo CLI

**Input**: Design documents from `/specs/001-todo-cli/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No tests in Phase I per specification (architecture designed to be test-ready for future phases)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root (per constitution)
- All source code in `src/` directory
- No `tests/` directory in Phase I

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create src/ directory structure (src/__main__.py, src/task.py, src/todo_app.py, src/cli.py)
- [x] T002 Create .gitignore file with Python entries (__pycache__/, *.pyc, .venv/)
- [x] T003 Create README.md skeleton with project overview section

**Checkpoint**: Project structure ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create Task dataclass in src/task.py with id, title, description, completed attributes
- [x] T005 Add __str__ method to Task for formatted display in src/task.py
- [x] T006 Create TodoApp class skeleton in src/todo_app.py with __init__ method
- [x] T007 Add _tasks list and _next_id counter attributes to TodoApp in src/todo_app.py
- [x] T008 Create CLI skeleton in src/cli.py with main menu display function
- [x] T009 Create entry point in src/__main__.py that imports and runs CLI

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Task Capture (Priority: P1) 🎯 MVP

**Goal**: Enable users to add tasks with title and optional description, providing immediate value as a basic note-taking tool

**Independent Test**: Launch app, add task with title "Buy groceries", verify it appears in list with ID 1

### Implementation for User Story 1

- [x] T010 [US1] Implement add_task(title, description) method in src/todo_app.py
- [x] T011 [US1] Add title validation (non-empty check) to add_task in src/todo_app.py
- [x] T012 [US1] Implement ID auto-increment logic in add_task in src/todo_app.py
- [x] T013 [US1] Add Task creation and append to _tasks list in add_task in src/todo_app.py
- [x] T014 [US1] Implement CLI add command handler in src/cli.py
- [x] T015 [US1] Add title prompt in CLI add handler in src/cli.py
- [x] T016 [US1] Add description prompt (optional) in CLI add handler in src/cli.py
- [x] T017 [US1] Display success/error message for add command in src/cli.py

**Checkpoint**: At this point, users can add tasks and see success messages (MVP core functionality complete)

---

## Phase 4: User Story 2 - Task Visibility and Status Tracking (Priority: P2)

**Goal**: Enable users to view all tasks with completion status indicators ([x]/[ ])

**Independent Test**: Add 3 tasks (2 incomplete, 1 complete), run list command, verify all tasks display with correct status

### Implementation for User Story 2

- [x] T018 [US2] Implement list_tasks() method in src/todo_app.py
- [x] T019 [US2] Add task formatting logic ({id}. [{status}] {title}) in list_tasks in src/todo_app.py
- [x] T020 [US2] Handle empty task list case ("No tasks found") in list_tasks in src/todo_app.py
- [x] T021 [US2] Implement CLI list command handler in src/cli.py
- [x] T022 [US2] Display formatted task list in CLI list handler in src/cli.py
- [x] T023 [US2] Display "No tasks found" message for empty list in src/cli.py

**Checkpoint**: At this point, users can add and view tasks (MVP is usable for basic task tracking)

---

## Phase 5: User Story 6 - Session Exit (Priority: P1)

**Goal**: Enable users to cleanly exit the application without errors

**Independent Test**: Add tasks, select quit, verify app exits with exit code 0

### Implementation for User Story 6

- [x] T024 [US6] Implement CLI main loop in src/cli.py
- [x] T025 [US6] Add quit command handler in src/cli.py
- [x] T026 [US6] Add exit confirmation message ("Goodbye!") in src/cli.py
- [x] T027 [US6] Ensure clean exit with sys.exit(0) in src/cli.py

**Checkpoint**: At this point, P1 user stories complete - users have a functional MVP (add, list, quit)

---

## Phase 6: User Story 3 - Task Completion Management (Priority: P3)

**Goal**: Enable users to mark tasks complete and track progress

**Independent Test**: Add task, mark it complete by ID, verify status changes to [x] in list view

### Implementation for User Story 3

- [x] T028 [US3] Implement get_task(task_id) helper method in src/todo_app.py
- [x] T029 [US3] Implement mark_complete(task_id) method in src/todo_app.py
- [x] T030 [US3] Add idempotency check (already complete) in mark_complete in src/todo_app.py
- [x] T031 [US3] Handle task not found error in mark_complete in src/todo_app.py
- [x] T032 [US3] Implement CLI complete command handler in src/cli.py
- [x] T033 [US3] Parse task ID from user input in complete handler in src/cli.py
- [x] T034 [US3] Add numeric validation for task ID in complete handler in src/cli.py
- [x] T035 [US3] Display success/error message for complete command in src/cli.py

**Checkpoint**: At this point, users can track progress by marking tasks complete

---

## Phase 7: User Story 4 - Task Modification (Priority: P4)

**Goal**: Enable users to update task titles and descriptions to correct mistakes

**Independent Test**: Add task, update title to "New Title", verify change persists in list

### Implementation for User Story 4

- [x] T036 [US4] Implement update_task(task_id, title, description) method in src/todo_app.py
- [x] T037 [US4] Add title validation (non-empty if provided) in update_task in src/todo_app.py
- [x] T038 [US4] Add "no changes specified" check in update_task in src/todo_app.py
- [x] T039 [US4] Handle task not found error in update_task in src/todo_app.py
- [x] T040 [US4] Implement CLI update command handler in src/cli.py
- [x] T041 [US4] Parse task ID from user input in update handler in src/cli.py
- [x] T042 [US4] Add numeric validation for task ID in update handler in src/cli.py
- [x] T043 [US4] Prompt for new title (optional) in update handler in src/cli.py
- [x] T044 [US4] Prompt for new description (optional) in update handler in src/cli.py
- [x] T045 [US4] Display success/error message for update command in src/cli.py

**Checkpoint**: At this point, users can modify tasks to refine their to-dos

---

## Phase 8: User Story 5 - Task Deletion (Priority: P5)

**Goal**: Enable users to remove unwanted tasks from the list

**Independent Test**: Add 3 tasks, delete task 2, verify it no longer appears and next task gets ID 4 (not 2)

### Implementation for User Story 5

- [x] T046 [US5] Implement delete_task(task_id) method in src/todo_app.py
- [x] T047 [US5] Handle task not found error in delete_task in src/todo_app.py
- [x] T048 [US5] Remove task from _tasks list in delete_task in src/todo_app.py
- [x] T049 [US5] Verify ID is NOT reused after deletion (use existing _next_id counter) in src/todo_app.py
- [x] T050 [US5] Implement CLI delete command handler in src/cli.py
- [x] T051 [US5] Parse task ID from user input in delete handler in src/cli.py
- [x] T052 [US5] Add numeric validation for task ID in delete handler in src/cli.py
- [x] T053 [US5] Display success/error message for delete command in src/cli.py

**Checkpoint**: At this point, all user stories (P1-P5) are complete - full CRUD functionality delivered

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final touches that affect multiple user stories

- [x] T054 [P] Add module docstrings to src/task.py
- [x] T055 [P] Add module docstrings to src/todo_app.py
- [x] T056 [P] Add module docstrings to src/cli.py
- [x] T057 [P] Add module docstrings to src/__main__.py
- [x] T058 [P] Add type hints to all functions in src/task.py
- [x] T059 [P] Add type hints to all functions in src/todo_app.py
- [x] T060 [P] Add type hints to all functions in src/cli.py
- [x] T061 [P] Add method docstrings to TodoApp class in src/todo_app.py
- [x] T062 [P] Add function docstrings to CLI functions in src/cli.py
- [x] T063 Add invalid command handler in CLI main loop in src/cli.py
- [x] T064 Add command help text display in CLI menu in src/cli.py
- [x] T065 Update README.md with setup instructions (uv venv, python -m src)
- [x] T066 Update README.md with commands reference (add, list, update, delete, complete, quit)
- [x] T067 Update README.md with usage examples
- [x] T068 [P] Verify PEP 8 compliance across all files
- [x] T069 Verify function length <30 lines across all files
- [x] T070 Manual end-to-end testing: add → list → complete → update → delete → quit workflow

**Checkpoint**: All polish complete - production-ready MVP

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Stories (Phases 3-8)**: All depend on Foundational (Phase 2) completion
  - User stories CAN proceed in parallel (if staffed) or sequentially by priority
  - Recommended: P1 stories first (US1, US2, US6) for MVP, then P3-P5
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends only on Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends only on Foundational (Phase 2) - No dependencies on other stories (but logically follows US1 for testing)
- **User Story 6 (P1)**: Depends only on Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P3)**: Depends only on Foundational (Phase 2) - Uses get_task helper (can implement inline if needed)
- **User Story 4 (P4)**: Depends only on Foundational (Phase 2) - Uses get_task helper (T028 from US3)
- **User Story 5 (P5)**: Depends only on Foundational (Phase 2) - Uses get_task helper (T028 from US3)

**Note**: US4 and US5 reference get_task from US3 (T028), but can implement it independently if US3 not done first.

### Within Each User Story

- All tasks within a story follow sequential order (no [P] markers within story phases)
- Exception: US3 T028 (get_task helper) can be used by US4/US5 if implemented

### Parallel Opportunities

- **Phase 1 (Setup)**: All tasks can run sequentially (fast - <10 minutes total)
- **Phase 2 (Foundational)**: T004-T005 can be parallel, T006-T007 sequential, T008-T009 parallel
- **Phase 3 (US1)**: T010-T013 sequential (same file), T014-T017 sequential (same file)
- **Phase 4 (US2)**: T018-T020 sequential (same file), T021-T023 sequential (same file)
- **Phase 5 (US6)**: T024-T027 sequential (same file)
- **Phase 6 (US3)**: T028-T031 sequential (same file), T032-T035 sequential (same file)
- **Phase 7 (US4)**: T036-T039 sequential (same file), T040-T045 sequential (same file)
- **Phase 8 (US5)**: T046-T049 sequential (same file), T050-T053 sequential (same file)
- **Phase 9 (Polish)**: Tasks marked [P] can run in parallel (T054-T062, T065-T067 are documentation)

**True Parallel Opportunities (Different Files)**:
- After Foundational complete:
  - Developer A: Implement US1 (add feature)
  - Developer B: Implement US2 (list feature)
  - Developer C: Implement US6 (quit feature)
- After US1-US2-US6 complete:
  - Developer A: Implement US3 (complete feature)
  - Developer B: Implement US4 (update feature)
  - Developer C: Implement US5 (delete feature)

---

## Parallel Example: Foundational Phase

```bash
# Can be done by different developers:
Developer A: T004-T005 (task.py)
Developer B: T006-T007 (todo_app.py)
Developer C: T008-T009 (cli.py + __main__.py)
```

---

## Parallel Example: MVP Stories (P1 Priority)

```bash
# After Foundational complete, parallel MVP development:
Developer A: T010-T017 (User Story 1 - add command)
Developer B: T018-T023 (User Story 2 - list command)
Developer C: T024-T027 (User Story 6 - quit command)
```

---

## Parallel Example: Enhancement Stories (P3-P5)

```bash
# After MVP complete, parallel feature additions:
Developer A: T028-T035 (User Story 3 - complete command)
Developer B: T036-T045 (User Story 4 - update command, may need T028 from A)
Developer C: T046-T053 (User Story 5 - delete command, may need T028 from A)
```

---

## Implementation Strategy

### MVP First (P1 User Stories Only)

**Goal**: Minimum viable CLI with add, list, quit

1. Complete Phase 1: Setup (T001-T003) - ~10 minutes
2. Complete Phase 2: Foundational (T004-T009) - ~1 hour
3. Complete Phase 3: US1 - Add tasks (T010-T017) - ~1 hour
4. Complete Phase 4: US2 - List tasks (T018-T023) - ~45 minutes
5. Complete Phase 5: US6 - Quit (T024-T027) - ~15 minutes
6. **STOP and VALIDATE**: Test add → list → quit workflow independently
7. Deploy/demo if ready

**Total MVP Time**: ~3-4 hours

**MVP Delivers**:
- Users can capture tasks (add)
- Users can view tasks (list)
- Users can exit cleanly (quit)
- Foundation for all future features

---

### Incremental Delivery

**Iteration 1 - MVP (P1)**: Setup + Foundational + US1 + US2 + US6 → Basic task capture and viewing
- Test: Add 3 tasks, list them, quit
- **Deploy** ✅ Users have a usable todo app

**Iteration 2 - Task Management (P3)**: Add US3 → Mark tasks complete
- Test: Add task, mark complete, verify [x] in list
- **Deploy** ✅ Users can track progress

**Iteration 3 - Flexibility (P4)**: Add US4 → Update tasks
- Test: Add task, update title/description, verify changes
- **Deploy** ✅ Users can correct mistakes

**Iteration 4 - Cleanup (P5)**: Add US5 → Delete tasks
- Test: Add 3 tasks, delete one, verify it's gone and IDs don't reuse
- **Deploy** ✅ Full CRUD complete

**Iteration 5 - Polish**: Complete Phase 9 → Documentation and quality
- Test: Full workflow, PEP 8, docstrings, README accuracy
- **Deploy** ✅ Production-ready Phase I

---

### Parallel Team Strategy

With 3 developers:

**Week 1**:
- All: Complete Setup + Foundational together (~2 hours pairing)
- Then split:
  - Developer A: User Story 1 (T010-T017)
  - Developer B: User Story 2 (T018-T023)
  - Developer C: User Story 6 (T024-T027)
- End of week: MVP complete and tested

**Week 2**:
- All: Test MVP together, fix any issues
- Then split:
  - Developer A: User Story 3 (T028-T035)
  - Developer B: User Story 4 (T036-T045, coordinate with A for T028)
  - Developer C: User Story 5 (T046-T053, coordinate with A for T028)
- End of week: Full CRUD complete

**Week 3**:
- All: Polish phase together (T054-T070)
- Documentation, testing, PEP 8 review
- Deploy production-ready Phase I

---

## Notes

- No [P] markers within user story phases (tasks in same file must be sequential)
- [US1] through [US6] labels map task to user story for traceability
- Each user story independently testable per spec requirements
- ID reuse verification in US5 (T049) validates constitution compliance
- All tasks include explicit file paths for clarity
- Manual testing (T070) verifies all acceptance scenarios from spec.md
- No tests directory created (Phase I has no automated tests per plan.md)
- Avoid: vague tasks, missing file paths, cross-story dependencies that break independence

---

## Task Count Summary

- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 6 tasks
- **Phase 3 (US1 - Add)**: 8 tasks
- **Phase 4 (US2 - List)**: 6 tasks
- **Phase 5 (US6 - Quit)**: 4 tasks
- **Phase 6 (US3 - Complete)**: 8 tasks
- **Phase 7 (US4 - Update)**: 10 tasks
- **Phase 8 (US5 - Delete)**: 8 tasks
- **Phase 9 (Polish)**: 17 tasks

**Total**: 70 tasks

**MVP Scope (P1 Stories)**: 27 tasks (Setup + Foundational + US1 + US2 + US6)
**Full Feature Set**: 70 tasks (all phases)

---

## Validation Checklist

- ✅ All tasks follow format: `- [ ] [ID] [P?] [Story?] Description with file path`
- ✅ Task IDs sequential (T001-T070)
- ✅ User story labels present for Phases 3-8 ([US1] through [US6])
- ✅ All tasks include file paths (src/task.py, src/todo_app.py, src/cli.py, src/__main__.py, README.md, .gitignore)
- ✅ Each user story independently testable (per Independent Test criteria in spec.md)
- ✅ Dependencies documented (Foundational blocks all stories, stories can run parallel after)
- ✅ MVP clearly identified (US1 + US2 + US6)
- ✅ No tests included (Phase I specification says "No tests")
- ✅ Constitution compliance (ID reuse check in T049, PEP 8 in T068, function length in T069)
