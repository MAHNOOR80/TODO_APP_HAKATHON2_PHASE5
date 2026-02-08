---
description: "Task list for Intermediate Level - Organization & Usability feature implementation"
---

# Tasks: Intermediate Level - Organization & Usability

**Input**: Design documents from `/specs/002-intermediate-level/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: No tests included per Phase I constitution constraint. Architecture designed to be test-ready for future phases.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- All source files in: `src/task.py`, `src/todo_app.py`, `src/cli.py`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify Basic Level foundation and prepare for extensions

- [X] T001 Verify Basic Level (001-todo-cli) is fully implemented and functional
- [X] T002 Run manual smoke test of all Basic Level commands (add, list, update, delete, complete, quit)
- [X] T003 [P] Review constitution v1.1.0 backward compatibility requirements

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data model extensions that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create Priority enum in src/task.py with LOW, MEDIUM, HIGH values and __lt__ method for sorting
- [X] T005 [P] Extend Task dataclass in src/task.py with priority field (default: Priority.MEDIUM)
- [X] T006 [P] Extend Task dataclass in src/task.py with tags field (default: empty list via field(default_factory=list))
- [X] T007 [P] Extend Task dataclass in src/task.py with created_at field (default: datetime.now via field(default_factory=datetime.now))
- [X] T008 Update Task.__str__() method in src/task.py to display priority indicators (!!!, !!, !) and tags (#tag1 #tag2)
- [X] T009 Verify existing Task instances work with new fields (backward compatibility test)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Priority-Based Task Management (Priority: P1) 🎯 MVP

**Goal**: Allow users to assign and display priority levels (high, medium, low) to tasks with visual indicators

**Independent Test**: Add a task, set its priority to "high", verify it displays with `!!!` indicator. Set priority to "low", verify `!` indicator. Verify default priority is "medium" with `!!` indicator.

### Implementation for User Story 1

- [X] T010 [US1] Implement set_priority(task_id, priority_str) method in src/todo_app.py with validation
- [X] T011 [US1] Add priority normalization logic (case-insensitive, strip whitespace) in set_priority method
- [X] T012 [US1] Add error handling for invalid priority values in set_priority (return "Invalid priority. Use: low, medium, high")
- [X] T013 [US1] Add error handling for non-existent task ID in set_priority (return "Task #X not found")
- [X] T014 [US1] Add "priority" command to CLI menu in src/cli.py
- [X] T015 [US1] Implement handle_priority_command() in src/cli.py to parse "priority <id> <level>" input
- [X] T016 [US1] Add input validation for priority command (require task ID and level arguments)
- [X] T017 [US1] Display success message after priority set in CLI
- [X] T018 [US1] Update CLI help menu to include priority command with examples

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently
- Manual test: Add task, set priority high/medium/low, verify display
- Regression test: Verify all Basic Level commands still work

---

## Phase 4: User Story 2 - Task Categorization with Tags (Priority: P2)

**Goal**: Allow users to assign comma-separated tags to tasks for multi-dimensional organization

**Independent Test**: Add tasks, tag them with "work,urgent", verify tags display as "#work #urgent". Tag task with "home" to overwrite. Clear tags with empty input.

### Implementation for User Story 2

- [X] T019 [US2] Implement parse_tags(tags_str) helper method in src/todo_app.py to split, normalize, and deduplicate tags
- [X] T020 [US2] Add tag validation logic (alphanumeric + hyphen only, max 20 chars) in parse_tags method
- [X] T021 [US2] Implement set_tags(task_id, tags_str) method in src/todo_app.py with overwrite behavior
- [X] T022 [US2] Add tag clearing logic (empty tags_str clears all tags) in set_tags method
- [X] T023 [US2] Add error handling for invalid tag format in set_tags (return specific error per tag)
- [X] T024 [US2] Add error handling for non-existent task ID in set_tags (return "Task #X not found")
- [X] T025 [US2] Add "tag" command to CLI menu in src/cli.py
- [X] T026 [US2] Implement handle_tag_command() in src/cli.py to parse "tag <id> <tags>" input
- [X] T027 [US2] Add input validation for tag command (require task ID, allow empty tags for clearing)
- [X] T028 [US2] Display success message after tags set in CLI with tag count
- [X] T029 [US2] Update CLI help menu to include tag command with comma-separated examples

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently
- Manual test: Tag tasks, verify display, clear tags
- Regression test: Verify priority commands still work, Basic Level commands still work

---

## Phase 5: User Story 3 - Task Filtering by Attributes (Priority: P3)

**Goal**: Enable users to filter tasks by priority, tag, or status to focus on specific subsets

**Independent Test**: Create 10 tasks with varied priorities and tags. Filter by "priority high", verify only high-priority tasks appear. Filter by "tag work", verify only work-tagged tasks appear.

### Implementation for User Story 3

- [X] T030 [P] [US3] Implement filter_by_priority(priority) helper method in src/todo_app.py
- [X] T031 [P] [US3] Implement filter_by_tag(tag_name) helper method in src/todo_app.py with case-insensitive matching
- [X] T032 [P] [US3] Implement filter_by_status(status) helper method in src/todo_app.py (completed/pending)
- [X] T033 [US3] Implement filter_tasks(field, value) method in src/todo_app.py routing to specific filter helpers
- [X] T034 [US3] Add field validation in filter_tasks (priority, tag, status only)
- [X] T035 [US3] Add value validation in filter_tasks based on field type
- [X] T036 [US3] Add "filter" command to CLI menu in src/cli.py
- [X] T037 [US3] Implement handle_filter_command() in src/cli.py to parse "filter <field> <value>" input
- [X] T038 [US3] Add input validation for filter command (require field and value arguments)
- [X] T039 [US3] Display filtered results in CLI or "No tasks match the filter criteria" message
- [X] T040 [US3] Ensure filter is non-persistent (list command shows all tasks after filter)
- [X] T041 [US3] Update CLI help menu to include filter command with examples for priority/tag/status

**Checkpoint**: All core organizational features (priority, tags, filtering) should now be functional
- Manual test: Filter by priority/tag/status, verify correct results
- Edge case test: Filter with no matches, invalid field, invalid value
- Regression test: Verify US1 (priority), US2 (tags), and Basic Level still work

---

## Phase 6: User Story 4 - Keyword Search Across Tasks (Priority: P4)

**Goal**: Enable users to search tasks by keyword in title or description for rapid task discovery

**Independent Test**: Add 10 tasks with varied titles and descriptions. Search for "meeting", verify all tasks containing "meeting" in title or description appear (case-insensitive).

### Implementation for User Story 4

- [X] T042 [US4] Implement search_tasks(keyword) method in src/todo_app.py with case-insensitive substring matching
- [X] T043 [US4] Add search logic for both title and description fields in search_tasks method
- [X] T044 [US4] Add keyword validation (non-empty) in search_tasks method
- [X] T045 [US4] Add "search" command to CLI menu in src/cli.py
- [X] T046 [US4] Implement handle_search_command() in src/cli.py to parse "search <keyword>" input
- [X] T047 [US4] Add input validation for search command (require keyword argument)
- [X] T048 [US4] Display search results in CLI with original formatting (priority, tags, status)
- [X] T049 [US4] Display "No tasks found for '<keyword>'" message when no matches
- [X] T050 [US4] Ensure search is non-persistent (list command shows all tasks after search)
- [X] T051 [US4] Update CLI help menu to include search command with examples

**Checkpoint**: Search functionality should work independently of filter
- Manual test: Search for various keywords, verify case-insensitive matching
- Edge case test: Search with no matches, empty keyword
- Regression test: Verify all previous user stories still work

---

## Phase 7: User Story 5 - Task Sorting by Multiple Criteria (Priority: P5)

**Goal**: Enable users to sort task list by priority, title, created_at, or due date for customized viewing

**Independent Test**: Add 5 tasks with different priorities. Sort by "priority", verify order is high → medium → low. Sort by "title", verify alphabetical order A-Z.

### Implementation for User Story 5

- [X] T052 [P] [US5] Implement sort_by_priority() helper method in src/todo_app.py using stable sort
- [X] T053 [P] [US5] Implement sort_by_title() helper method in src/todo_app.py (case-insensitive, alphabetical)
- [X] T054 [P] [US5] Implement sort_by_created() helper method in src/todo_app.py (newest first, descending)
- [SKIP] T055 [P] [US5] Implement sort_by_due() helper method (due dates out of scope per plan.md)
- [X] T056 [US5] Implement sort_tasks(field) method in src/todo_app.py routing to specific sort helpers
- [X] T057 [US5] Add field validation in sort_tasks (priority, title, created only)
- [X] T058 [US5] Add "sort" command to CLI menu in src/cli.py
- [X] T059 [US5] Implement handle_sort_command() in src/cli.py to parse "sort <field>" input
- [X] T060 [US5] Add input validation for sort command (require field argument)
- [X] T061 [US5] Display sorted results in CLI
- [SKIP] T062 [US5] Ensure sort is non-persistent (inherently non-persistent - doesn't modify _tasks)
- [SKIP] T063 [US5] Add logic to clear sort state (no state to clear - sort creates new list)
- [X] T064 [US5] Update CLI help menu to include sort command with examples for all fields

**Checkpoint**: All user stories should now be independently functional
- Manual test: Sort by all fields, verify correct ordering and stable sort
- Edge case test: Sort with no field, invalid field
- Persistence test: Verify sort clears after modifications
- Regression test: Verify all previous user stories and Basic Level still work

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [X] T065 [P] Update README.md with Intermediate Level commands and examples
- [X] T066 [P] Create quickstart examples for priority, tag, filter, search, sort workflows
- [X] T067 Perform comprehensive regression test of ALL Basic Level user stories (P1-P5)
- [X] T068 Verify backward compatibility: Create tasks in "Basic Level mode", verify they work in Intermediate Level
- [X] T069 [P] Verify PEP 8 compliance across all modified files (src/task.py, src/todo_app.py, src/cli.py)
- [X] T070 [P] Verify type hints on all new methods and updated methods
- [X] T071 [P] Verify docstrings on all new methods (Google style, explain intent)
- [X] T072 Performance test: Create 100 tasks, verify filter/search complete in <500ms
- [X] T073 Performance test: Verify all other operations (priority, tag, sort) complete in <100ms
- [X] T074 Edge case testing: Very long tag names, duplicate tags, special characters in tags
- [X] T075 Edge case testing: Empty filter results, invalid sort fields, search with no keyword
- [ ] T076 User acceptance: Manually test all 5 user stories end-to-end per acceptance scenarios
- [X] T077 Final smoke test: Run through full workflow (add → priority → tag → filter → search → sort → quit)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories CAN proceed in parallel (if staffed) after Phase 2
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Priority)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2 - Tags)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P3 - Filter)**: Can start after Foundational (Phase 2) - Logically builds on US1 and US2 but independently testable (can filter by priority and tags)
- **User Story 4 (P4 - Search)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (P5 - Sort)**: Can start after Foundational (Phase 2) - Logically uses priority from US1 for sorting but independently testable

**Note**: While US3 logically uses priority and tags from US1/US2, it should still be independently testable. If US1/US2 are not implemented, filtering by priority would use default MEDIUM, and filtering by tags would match empty lists.

### Within Each User Story

- TodoApp methods before CLI commands
- Validation logic before command handlers
- Error handling integrated with implementation
- Help menu updates after command implementation
- Story complete and tested before moving to next priority

### Parallel Opportunities

**Within Phase 2 (Foundational):**
- T005, T006, T007 (add priority, tags, created_at fields) can run in parallel

**Within Phase 3 (User Story 1 - Priority):**
- No parallel opportunities within US1 (sequential: TodoApp method → CLI command → help)

**Within Phase 4 (User Story 2 - Tags):**
- No parallel opportunities within US2 (sequential: parse → validate → TodoApp method → CLI command → help)

**Within Phase 5 (User Story 3 - Filter):**
- T030, T031, T032 (filter helper methods) can run in parallel

**Within Phase 6 (User Story 4 - Search):**
- No parallel opportunities within US4 (sequential: TodoApp method → CLI command → help)

**Within Phase 7 (User Story 5 - Sort):**
- T052, T053, T054, T055 (sort helper methods) can run in parallel

**Within Phase 8 (Polish):**
- T065, T066 (documentation updates) can run in parallel
- T069, T070, T071 (code quality checks) can run in parallel

**Across User Stories (if team has capacity):**
- After Phase 2 completes, all user stories (Phase 3-7) can start in parallel by different team members

---

## Parallel Example: Foundational Phase

```bash
# Launch all field additions together (Phase 2):
Task T005: "Extend Task dataclass with priority field in src/task.py"
Task T006: "Extend Task dataclass with tags field in src/task.py"
Task T007: "Extend Task dataclass with created_at field in src/task.py"
```

## Parallel Example: User Story 3 (Filter)

```bash
# Launch all filter helper methods together (Phase 5):
Task T030: "Implement filter_by_priority helper in src/todo_app.py"
Task T031: "Implement filter_by_tag helper in src/todo_app.py"
Task T032: "Implement filter_by_status helper in src/todo_app.py"
```

## Parallel Example: User Story 5 (Sort)

```bash
# Launch all sort helper methods together (Phase 7):
Task T052: "Implement sort_by_priority helper in src/todo_app.py"
Task T053: "Implement sort_by_title helper in src/todo_app.py"
Task T054: "Implement sort_by_created helper in src/todo_app.py"
Task T055: "Implement sort_by_due helper in src/todo_app.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

**Recommended for solo development or tight timeline:**

1. Complete Phase 1: Setup (verify Basic Level works)
2. Complete Phase 2: Foundational (extend Task model with all fields)
3. Complete Phase 3: User Story 1 (priority feature only)
4. **STOP and VALIDATE**: Test priority feature independently
5. Deploy/demo basic organizational capability (priority-based task management)
6. **Decision point**: Continue to US2 (tags) or ship MVP?

**MVP Deliverable**: Users can assign high/medium/low priority to tasks and see visual indicators. This alone provides value for focusing on important work.

### Incremental Delivery (Recommended)

**Best approach for continuous value delivery:**

1. Complete Phase 1 + Phase 2 → Foundation ready
2. Add User Story 1 (Priority) → Test independently → **Deploy/Demo MVP!**
3. Add User Story 2 (Tags) → Test independently → **Deploy/Demo (MVP + Tags)**
4. Add User Story 3 (Filter) → Test independently → **Deploy/Demo (MVP + Organization)**
5. Add User Story 4 (Search) → Test independently → **Deploy/Demo (MVP + Discovery)**
6. Add User Story 5 (Sort) → Test independently → **Deploy/Demo (Full Intermediate Level)**
7. Complete Phase 8 (Polish) → Final release

**Each story adds value without breaking previous stories.**

### Parallel Team Strategy

**With multiple developers (2-3 people):**

1. Team completes Phase 1 + Phase 2 together (foundational work)
2. Once Phase 2 is done:
   - **Developer A**: User Story 1 (Priority) + User Story 4 (Search)
   - **Developer B**: User Story 2 (Tags) + User Story 5 (Sort)
   - **Developer C**: User Story 3 (Filter) - starts after US1 and US2 merge
3. Stories complete and integrate independently
4. Team completes Phase 8 (Polish) together

**Note**: US3 (Filter) should start after US1/US2 because it filters by priority and tags. However, it can still be developed with default values if needed.

### Sequential Single-Developer Strategy (Most Common)

**Recommended order for solo implementation:**

1. Phase 1 (Setup) - 30 minutes
2. Phase 2 (Foundational) - 2 hours
3. Phase 3 (User Story 1 - Priority) - 3 hours
4. **Checkpoint: Test and commit**
5. Phase 4 (User Story 2 - Tags) - 4 hours
6. **Checkpoint: Test and commit**
7. Phase 5 (User Story 3 - Filter) - 4 hours
8. **Checkpoint: Test and commit**
9. Phase 6 (User Story 4 - Search) - 2 hours
10. **Checkpoint: Test and commit**
11. Phase 7 (User Story 5 - Sort) - 4 hours
12. **Checkpoint: Test and commit**
13. Phase 8 (Polish) - 3 hours

**Total estimated time**: 22-24 hours of focused development

---

## Task Validation Checklist

### Format Compliance

- ✅ All 77 tasks follow checklist format `- [ ] [ID] [P?] [Story?] Description`
- ✅ Task IDs are sequential (T001-T077)
- ✅ [P] marker only on parallelizable tasks (different files, no dependencies)
- ✅ [Story] label (US1-US5) only on user story phase tasks
- ✅ All task descriptions include specific file paths

### Completeness per User Story

- ✅ **US1 (Priority)**: 9 tasks covering TodoApp method, validation, CLI command, help
- ✅ **US2 (Tags)**: 11 tasks covering parsing, validation, TodoApp method, CLI command, help
- ✅ **US3 (Filter)**: 12 tasks covering filter helpers, routing, validation, CLI command, help
- ✅ **US4 (Search)**: 10 tasks covering search logic, validation, CLI command, help
- ✅ **US5 (Sort)**: 13 tasks covering sort helpers, routing, validation, CLI command, persistence

### Independent Testability

- ✅ Each user story has clear "Independent Test" criteria
- ✅ Each user story has checkpoint for validation
- ✅ Each user story can be tested without other stories being complete
- ✅ Regression testing included after each story

### Parallel Execution

- ✅ 13 tasks marked [P] for parallel execution
- ✅ Parallel opportunities identified in Phase 2, 5, 7, 8
- ✅ Parallel examples provided for Foundational, Filter, and Sort phases
- ✅ Cross-story parallelization documented (all stories after Phase 2)

### MVP Scope

- ✅ MVP clearly identified: Phase 1 + Phase 2 + Phase 3 (User Story 1 - Priority)
- ✅ MVP provides standalone value (priority-based task management)
- ✅ MVP estimated time: 5-6 hours
- ✅ Incremental delivery path documented

---

## Notes

- [P] tasks = different files or different methods in same file with no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each user story phase completion
- Stop at any checkpoint to validate story independently
- **No tests included**: Per Phase I constitution, architecture is test-ready but tests deferred to future phases
- All error messages follow established pattern from Basic Level
- Performance targets: <500ms for filter/search on 100 tasks, <100ms for all other operations
- Backward compatibility: All Basic Level tasks must work with default values (priority=MEDIUM, tags=[])

---

## Summary

**Total Tasks**: 77
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 6 tasks
- Phase 3 (US1 - Priority): 9 tasks
- Phase 4 (US2 - Tags): 11 tasks
- Phase 5 (US3 - Filter): 12 tasks
- Phase 6 (US4 - Search): 10 tasks
- Phase 7 (US5 - Sort): 13 tasks
- Phase 8 (Polish): 13 tasks

**Parallel Opportunities**: 13 tasks marked [P]
- Foundational phase: 3 parallel tasks (field additions)
- Filter helpers: 3 parallel tasks
- Sort helpers: 4 parallel tasks
- Polish phase: 3 parallel tasks (documentation and code quality)

**MVP Scope**: Phases 1-3 (18 tasks, ~5-6 hours)
**Full Implementation**: All phases (77 tasks, ~22-24 hours)

**Independent Test Criteria**:
- US1: Set priority, verify indicators (!!!, !!, !)
- US2: Tag tasks, verify display (#tag1 #tag2), clear tags
- US3: Filter by priority/tag/status, verify correct results
- US4: Search by keyword, verify case-insensitive matching
- US5: Sort by priority/title/created/due, verify correct order

**Suggested Start**: Phase 1 → Phase 2 → Phase 3 (MVP: Priority feature)
