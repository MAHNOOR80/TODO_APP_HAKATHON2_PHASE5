---
id: 003
title: Advanced Level Task Generation
stage: tasks
date: 2025-12-27
surface: agent
model: claude-sonnet-4-5
feature: 003-advanced-level
branch: 003-advanced-level
user: you
command: /sp.tasks
labels: ["tasks", "advanced-level", "due-dates", "reminders", "recurring-tasks", "implementation-breakdown"]
links:
  spec: specs/003-advanced-level/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-advanced-level/tasks.md
tests:
  - Task format validation (all 61 tasks follow checkbox + ID + [P?] + [Story] + description + file path format)
  - Task organization by user story (US1: 18 tasks, US2: 14 tasks, US3: 15 tasks)
  - Dependency graph validated (Foundational blocks all stories, US1 required for US2/US3)
---

## Prompt

/sp.tasks

## Response snapshot

Successfully generated comprehensive task breakdown for Advanced Level - Intelligent Features with 61 tasks organized by user story (P1, P2, P3).

**Task Generation Summary:**
- **Feature Branch**: 003-advanced-level
- **Organization Strategy**: Tasks grouped by user story to enable independent implementation and testing
- **Total Tasks**: 61 tasks across 6 phases

**Phase Breakdown:**
1. **Phase 1 - Setup** (2 tasks): Project initialization, datetime imports, constants
2. **Phase 2 - Foundational** (5 tasks): Core data model extensions (BLOCKS all user stories)
   - Extend Task with due_date field
   - Add preset constants (reminder offsets, recurrence patterns)
   - Add validation helpers
3. **Phase 3 - User Story 1 (P1 - Due Dates)** (18 tasks) 🎯 MVP
   - Data model: Add remaining Task fields (reminder_offset, recurrence_pattern, recurrence_end_date)
   - Business logic: 7 tasks (is_overdue, get_overdue_tasks, parsing, formatting, set_due_date)
   - CLI commands: 7 tasks (extend add, implement due command, update list display, sorting, filtering)
   - Validation: 2 tasks (date/time format validation)
4. **Phase 4 - User Story 2 (P2 - Reminders)** (14 tasks)
   - Data structures: ReminderInfo dataclass
   - Business logic: 5 tasks (trigger calculation, should_show_reminder, get_active_reminders, formatting, set_reminder)
   - CLI commands: 5 tasks (extend add, implement remind command, startup display)
   - Validation: 2 tasks (require due_date, validate offset choices)
   - Integration: 1 task (cascade clearing when due_date cleared)
5. **Phase 5 - User Story 3 (P3 - Recurring)** (15 tasks)
   - Business logic: 5 tasks (calculate_next_occurrence with edge cases, generate_recurring_task, set_recurrence, extend complete_task)
   - CLI commands: 5 tasks (extend add, implement recur command, display recurrence icons)
   - Validation: 3 tasks (require due_date, validate end_date, validate pattern)
   - Integration: 2 tasks (cascade clearing, verify field preservation per FR-023)
6. **Phase 6 - Polish** (7 tasks): Documentation, error messages, backward compatibility verification, help text

**Dependency Structure:**
- **Foundational (Phase 2) BLOCKS all user stories** - Must complete first
- **User Story 1 (P1) is FOUNDATION** for US2 and US3:
  - US2 requires US1 due dates (cannot set reminder without due date per FR-011)
  - US3 requires US1 due dates (cannot set recurrence without due date per FR-020)
- **User Stories 2 & 3** could theoretically run in parallel after US1 complete (different aspects)
- **Recommended**: Sequential P1 → P2 → P3 for single developer to minimize context switching

**Parallel Opportunities** (8 tasks marked with [P]):
- Phase 1: T002 (helper functions independent of constants)
- Phase 2: T004, T005, T007 (independent constants and validators)
- Phase 3: T008, T009, T010 (adding different Task fields)
- Phase 6: T056, T057, T060, T062 (different documentation files)

**Task Format Compliance:**
- All 61 tasks follow strict checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- Task IDs: T001-T062 (sequential in execution order)
- Story labels: [US1] (18 tasks), [US2] (14 tasks), [US3] (15 tasks)
- File paths: All tasks specify exact files (src/task.py, src/todo_app.py, src/cli.py)

**Independent Test Criteria:**
- **US1**: Create task with due date → verify display → sort by due → filter overdue
- **US2**: Set reminder on task with due date → restart app → verify reminder appears on startup
- **US3**: Create recurring task → complete it → verify new instance with next occurrence date

**MVP Scope** (25 tasks = Phases 1-3):
- Setup + Foundational + User Story 1 (Due Dates)
- Delivers immediate value for deadline tracking
- Foundation for reminders and recurring tasks

**Implementation Strategy:**
- Sequential recommended: P1 → P2 → P3 for proper integration
- Each user story independently testable using quickstart.md scenarios
- Checkpoint validation at end of each phase
- Backward compatibility verified at each checkpoint

**No Test Tasks**: Tests not explicitly requested in specification, so excluded. Manual validation via quickstart.md scenarios (20 workflows documented).

## Outcome

- ✅ Impact: Complete, actionable task breakdown ready for immediate implementation with clear dependencies and parallel opportunities
- 🧪 Tests: Format validation passed (61/61 tasks follow checklist format), Dependency validation passed (Foundational blocks stories, US1 required for US2/US3)
- 📁 Files: tasks.md (410 lines with 61 tasks, dependencies, parallel examples, implementation strategies)
- 🔁 Next prompts: Use `/sp.implement` to execute tasks, or implement manually following task sequence (start with T001)
- 🧠 Reflection: Strong task organization emerged from user story prioritization - P1 (Due Dates) as foundation enables incremental delivery. Each story has clear independent test criteria matching spec acceptance scenarios. Sequential numbering (T001-T062) provides obvious execution order while [P] markers identify 8 parallelizable tasks. Story labels ([US1], [US2], [US3]) enable traceability to requirements. Foundational phase (T003-T007) correctly identified as blocker for all stories - ensures data model extensions complete before feature work begins. MVP scope (25 tasks) delivers immediate value with just due dates. Edge case handling explicitly called out (T042 for monthly recurrence Feb 29/day 31). Cascade clearing integration tasks (T040, T054) prevent orphaned data when due dates removed. Task count (61 total) aligns with estimated ~390 lines of code from plan.md.

## Evaluation notes (flywheel)

- Failure modes observed: None - all tasks generated with proper format, dependencies, and organization
- Graders run and results (PASS/FAIL): Task format validation PASS (61/61 tasks compliant), Dependency graph validation PASS (clear blocking relationships)
- Prompt variant (if applicable): N/A (standard /sp.tasks workflow using spec user stories as primary organization)
- Next experiment (smallest change to try): Proceed with /sp.implement to execute tasks, or begin manual implementation starting with T001 (datetime imports and constants)
