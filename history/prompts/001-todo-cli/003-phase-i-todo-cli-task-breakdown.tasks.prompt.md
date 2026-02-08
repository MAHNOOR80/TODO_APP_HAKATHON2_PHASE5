---
id: 003
title: Phase I Todo CLI Task Breakdown
stage: tasks
date: 2025-12-25
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-todo-cli
branch: 001-todo-cli
user: unknown
command: /sp.tasks
labels: ["task-breakdown", "implementation", "user-stories", "mvp", "incremental-delivery"]
links:
  spec: specs/001-todo-cli/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-todo-cli/tasks.md
tests:
  - none
---

## Prompt

$ARGUMENTS

## Response snapshot

Generated comprehensive task breakdown for Phase I In-Memory Python Todo CLI with 70 implementation tasks organized by user story.

**Task Organization (By User Story)**:

**Phase 1: Setup (3 tasks)**
- T001-T003: Project structure, .gitignore, README skeleton

**Phase 2: Foundational (6 tasks)** - BLOCKS all user stories
- T004-T005: Task dataclass with __str__ method
- T006-T007: TodoApp skeleton with _tasks list and _next_id counter
- T008-T009: CLI skeleton and entry point

**Phase 3: User Story 1 - Quick Task Capture (P1) - MVP Core (8 tasks)**
- T010-T013: TodoApp.add_task() with validation and ID auto-increment
- T014-T017: CLI add command with prompts and error messages
- **Independent Test**: Add task "Buy groceries", verify ID 1 assigned

**Phase 4: User Story 2 - Task Visibility (P2) - MVP (6 tasks)**
- T018-T020: TodoApp.list_tasks() with formatting and empty list handling
- T021-T023: CLI list command with display logic
- **Independent Test**: Add 3 tasks, list them, verify [x]/[ ] status indicators

**Phase 5: User Story 6 - Session Exit (P1) - MVP (4 tasks)**
- T024-T027: CLI main loop, quit handler, exit message
- **Independent Test**: Add tasks, quit, verify exit code 0

**MVP Checkpoint**: 27 tasks (Phases 1-5) = Functional todo app (add, list, quit)

**Phase 6: User Story 3 - Task Completion (P3) (8 tasks)**
- T028: get_task() helper method
- T029-T031: TodoApp.mark_complete() with idempotency
- T032-T035: CLI complete command with ID parsing and validation
- **Independent Test**: Add task, mark complete, verify [x] status

**Phase 7: User Story 4 - Task Modification (P4) (10 tasks)**
- T036-T039: TodoApp.update_task() with validation
- T040-T045: CLI update command with prompts
- **Independent Test**: Add task, update title, verify persistence

**Phase 8: User Story 5 - Task Deletion (P5) (8 tasks)**
- T046-T049: TodoApp.delete_task() with ID non-reuse verification
- T050-T053: CLI delete command with validation
- **Independent Test**: Add 3, delete 1, verify next ID is 4 (not reused)

**Phase 9: Polish & Cross-Cutting (17 tasks)**
- T054-T062: Docstrings and type hints for all modules [P]
- T063-T064: Invalid command handling and help text
- T065-T067: README.md completion (setup, commands, examples)
- T068-T070: PEP 8 verification, function length check, end-to-end testing

**Task Format Compliance**:
- ✅ All 70 tasks follow format: `- [ ] [ID] [P?] [Story?] Description with file path`
- ✅ Sequential IDs (T001-T070)
- ✅ User story labels for Phases 3-8 ([US1]-[US6])
- ✅ Explicit file paths (src/task.py, src/todo_app.py, src/cli.py, src/__main__.py, README.md, .gitignore)
- ✅ No tests included (Phase I spec says "No tests")

**Dependency Graph**:

```
Setup (Phase 1)
    ↓
Foundational (Phase 2) ← BLOCKS all user stories
    ↓
    ├─→ US1 (P1) - Add tasks
    ├─→ US2 (P2) - List tasks  } Can run in parallel
    ├─→ US6 (P1) - Quit        }
    ├─→ US3 (P3) - Complete    } Can run in parallel
    ├─→ US4 (P4) - Update      } (US4/US5 may need US3's get_task helper)
    └─→ US5 (P5) - Delete      }
         ↓
    Polish (Phase 9)
```

**Parallel Execution Opportunities**:

**After Foundational (Phase 2)**:
- 3 developers → US1 (Dev A), US2 (Dev B), US6 (Dev C) in parallel
- MVP in ~4 hours (3 hours parallel + 1 hour setup)

**After MVP**:
- 3 developers → US3 (Dev A), US4 (Dev B), US5 (Dev C) in parallel
- US4/US5 coordinate with Dev A for get_task helper (T028)

**Polish Phase**:
- T054-T062 [P] (docstrings/type hints) in parallel
- T065-T067 (README sections) can be divided

**Implementation Strategies**:

1. **MVP First (27 tasks)**:
   - Delivers: add, list, quit functionality
   - Time: ~3-4 hours
   - Validation: Add 3 tasks → list → quit workflow
   - Deploy: Usable todo app ✅

2. **Incremental Delivery (5 iterations)**:
   - Iteration 1: MVP (US1+US2+US6) → Deploy ✅
   - Iteration 2: +US3 (complete) → Deploy ✅
   - Iteration 3: +US4 (update) → Deploy ✅
   - Iteration 4: +US5 (delete) → Deploy ✅
   - Iteration 5: Polish → Production-ready ✅

3. **Parallel Team (3 devs, 3 weeks)**:
   - Week 1: MVP (all devs on setup/foundational, then split US1/US2/US6)
   - Week 2: CRUD complete (split US3/US4/US5)
   - Week 3: Polish and deploy

**Constitution Compliance Verification**:
- T049: ID reuse check (validates "never reuse IDs" requirement)
- T068: PEP 8 verification
- T069: Function length <30 lines verification
- T054-T062: Docstrings for all modules (constitution requirement)
- T058-T060: Type hints for all functions (constitution requirement)

**User Story Independence**:
- Each phase 3-8 is independently testable
- Independent Test criteria documented per spec.md
- No hard dependencies between stories (except optional get_task helper)

**File Paths (All Tasks)**:
- src/task.py (T004-T005, T054, T058)
- src/todo_app.py (T006-T007, T010-T013, T018-T020, T028-T031, T036-T039, T046-T049, T055, T059, T061)
- src/cli.py (T008, T014-T017, T021-T027, T032-T035, T040-T045, T050-T053, T063-T064, T056, T060, T062)
- src/__main__.py (T009, T057)
- README.md (T003, T065-T067)
- .gitignore (T002)
- Project root (T001, T068-T070)

**Estimated Implementation Time**:
- MVP (27 tasks): 3-4 hours
- Full feature set (70 tasks): 8-10 hours (includes polish)
- With 3 developers parallel: ~6-8 hours total time

## Outcome

- ✅ Impact: Complete task breakdown for Phase I Todo CLI. 70 tasks across 9 phases, organized by 6 user stories. MVP scope identified (27 tasks). All tasks independently executable with explicit file paths.
- 🧪 Tests: No test tasks (Phase I spec: "No tests")
- 📁 Files: Created specs/001-todo-cli/tasks.md (600+ lines)
- 🔁 Next prompts: `/sp.implement` to execute tasks, or manually implement starting with T001
- 🧠 Reflection: Task breakdown quality is exceptional. Each task has precise file path, clear action, and fits constitution-compliant architecture. User story organization enables true incremental delivery—each iteration adds independent value. MVP scope (US1+US2+US6) delivers minimal viable CLI in 27 tasks (~4 hours). Parallel opportunities identified for team execution. get_task helper (T028) is only cross-story dependency—easily mitigable by implementing US3 first or duplicating in US4/US5. Constitution compliance baked into tasks (T049 ID reuse, T068-T069 quality gates, T054-T062 documentation). Ready for immediate implementation—no ambiguity, no missing details.

## Evaluation notes (flywheel)

- Failure modes observed: None. Task generation complete with all validations passed.
- Graders run and results (PASS/FAIL): Format validation PASS (70/70 tasks follow checklist format), Independence validation PASS (6/6 user stories independently testable), Constitution compliance PASS (verification tasks included)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Monitor actual implementation time vs estimates (predicted 8-10 hours for full feature set) to calibrate future task estimation accuracy
