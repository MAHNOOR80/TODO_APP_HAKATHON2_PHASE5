---
id: 002
title: Advanced Level Plan Creation
stage: plan
date: 2025-12-27
surface: agent
model: claude-sonnet-4-5
feature: 003-advanced-level
branch: 003-advanced-level
user: you
command: /sp.plan
labels: ["planning", "advanced-level", "due-dates", "reminders", "recurring-tasks", "architecture"]
links:
  spec: specs/003-advanced-level/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-advanced-level/plan.md
  - specs/003-advanced-level/research.md
  - specs/003-advanced-level/data-model.md
  - specs/003-advanced-level/contracts/cli-commands.md
  - specs/003-advanced-level/quickstart.md
  - CLAUDE.md
tests:
  - Constitution Check (pre-design) - PASS (all 11 rules validated)
  - Constitution Check (post-design) - PASS (all 10 rules validated)
---

## Prompt

/sp.plan

## Implementation Plan: Advanced Level – Intelligent Features

### Clarification Assumptions (Final)
- Single reminder per task with preset offsets (e.g., 1 day, 1 hour, 10 minutes)
- Reminders are displayed automatically on application startup
- All dates and times use system local time only

---

### Step 1: Extend Task Data Model
- Add new optional fields to the Task entity:
  - `due_datetime` (datetime | None)
  - `reminder_offset` (timedelta | None)
  - `recurrence_type` (None | daily | weekly | monthly)
- Ensure backward compatibility with existing tasks.

---

### Step 2: Due Date & Reminder Input Handling
- Update task creation and update flows to:
  - Accept due date and time input.
  - Allow selection from preset reminder offsets.
- Validate:
  - Correct date/time format.
  - Reminder time occurs before due date.

---

### Step 3: Reminder Evaluation Engine
- On application startup:
  - Scan all tasks with due dates and reminders.
  - Identify reminders that are due or overdue.
- Display reminders clearly before showing the main menu.
- Ensure reminders trigger only once per task instance.

---

### Step 4: Recurring Task Logic
- Allow tasks to be marked as recurring with:
  - Daily, weekly, or monthly recurrence.
- When a recurring task is marked complete:
  - Auto-generate a new task instance.
  - Calculate the next due date based on recurrence type.
  - Preserve title, description, priority, and category.
  - Reset completion status.

---

### Step 5: Integrate with Existing Features
- Ensure recurring tasks:
  - Work with search, filter, and sort features.
  - Display recurrence indicators in task listings.
- Ensure due dates integrate with:
  - Sorting (earliest due date first).
  - Task list display formatting.

---

### Step 6: CLI Enhancements
- Update menus to support:
  - Setting/removing due dates
  - Selecting reminder presets
  - Enabling/disabling recurrence
- Keep prompts concise and beginner-friendly.

---

### Step 7: Edge Case Handling
- Tasks without due dates must not trigger reminders.
- Overdue tasks should show overdue reminders once.
- Deleting a task cancels its reminder and recurrence.
- Recurring tasks must not create infinite loops.

---

### Step 8: Testing & Validation
- Test reminder triggering on startup.
- Test recurring task regeneration logic.
- Test interactions with filters, search, and sorting.
- Validate behavior with mixed basic, intermediate, and advanced tasks.

---

### Step 9: Documentation & Specs
- Add advanced-level specs to `/specs` history.
- Update `README.md` with advanced feature usage.
- Document reminder and recurrence behavior in `CLAUDE.md`.

---

## Success Criteria
- Users can assign due dates and reminder presets.
- Reminders display correctly on startup.
- Recurring tasks auto-generate future instances reliably.
- Advanced features integrate seamlessly with existing functionality.

## Response snapshot

Successfully created comprehensive implementation plan for Advanced Level - Intelligent Features with complete Phase 0, Phase 1, and Phase 2 design.

**Planning Summary:**
- **Feature Branch**: 003-advanced-level (active)
- **Planning Approach**: Three-phase design (Research → Data Model/Contracts → Constitution Re-Check)
- **Constitution Compliance**: ✅ All gates passed (pre-design and post-design)

**Phase 0 - Research & Technical Decisions:**
- Researched 6 key areas: datetime handling, reminder offsets, recurrence patterns, startup display, backward compatibility, overdue indication
- Key decision: Use Python standard library only (datetime, timedelta) - no external dependencies
- Reminder offset stored as integer minutes (1440, 60, 30, 10) for preset options
- Recurrence patterns as string literals ("daily", "weekly", "monthly") with simple date arithmetic
- Startup reminder check (no background schedulers - violates Phase I constraints)
- All fields default to None for 100% backward compatibility

**Phase 1 - Data Model & Contracts:**
- Extended Task dataclass with 4 new optional fields:
  - `due_date: datetime | None` (when task must be completed)
  - `reminder_offset: int | None` (minutes before due_date to trigger)
  - `recurrence_pattern: str | None` (daily/weekly/monthly)
  - `recurrence_end_date: datetime | None` (when to stop recurring)
- Validation rules: reminder/recurrence require due_date, end_date must be >= due_date
- CLI contracts defined: 3 new commands (due, remind, recur), 3 modified (add, list, update), 1 new behavior (startup display)
- 20 user scenarios documented across 5 workflow categories
- Agent context updated with Python 3.13+, standard library only, in-memory storage

**Phase 2 - Constitution Re-Check:**
- Post-design evaluation: All 10 constitutional rules PASS
- No new violations introduced during design
- Separation of concerns maintained (task.py → todo_app.py → cli.py)
- Type hints mandatory satisfied (datetime | None, int | None, str | None)
- Max function length satisfied (decomposed into check_reminders, calculate_next_occurrence, etc.)

**Artifacts Created:**
1. **plan.md** (401 lines) - Complete implementation plan with all phases
2. **research.md** - Technical decision documentation with rationale
3. **data-model.md** - Task entity extensions, validation rules, computed data
4. **contracts/cli-commands.md** - CLI command specifications with examples
5. **quickstart.md** - 20 user workflow scenarios with examples
6. **CLAUDE.md** - Updated agent context with new technologies

**Implementation Readiness:**
- Files to modify: 3 (task.py, todo_app.py, cli.py)
- Estimated complexity: Medium (~390 lines added, ~55 modified)
- Risk assessment: 5 risks identified with mitigation strategies
- Ready for `/sp.tasks` to generate actionable task breakdown

## Outcome

- ✅ Impact: Complete, validated implementation plan for Advanced Level features with research, data model, CLI contracts, and user workflows all documented
- 🧪 Tests: Constitution Check passed (pre-design: 11/11 rules, post-design: 10/10 rules)
- 📁 Files: plan.md (401 lines), research.md, data-model.md, contracts/cli-commands.md, quickstart.md, CLAUDE.md (updated)
- 🔁 Next prompts: Use `/sp.tasks` to generate implementation task breakdown, or proceed directly to implementation
- 🧠 Reflection: Strong architecture emerged from research phase - datetime standard library eliminates external dependencies while meeting all requirements. Three-phase structure (P1: Due Dates → P2: Reminders → P3: Recurring) enables incremental delivery and independent testing. Backward compatibility achieved through optional fields (all default to None). Monthly recurrence edge case handling (Feb 29, day 31) documented with simple day-of-month logic. Startup reminder display avoids background schedulers while meeting user needs. Risk assessment identifies 5 risks with clear mitigation strategies. Estimated ~390 lines of new code is reasonable for 31 functional requirements.

## Evaluation notes (flywheel)

- Failure modes observed: None - all phases completed successfully with constitutional compliance
- Graders run and results (PASS/FAIL): Constitution Check pre-design PASS (11/11), Constitution Check post-design PASS (10/10)
- Prompt variant (if applicable): N/A (standard /sp.plan workflow with user-provided outline)
- Next experiment (smallest change to try): Proceed with /sp.tasks to break down implementation into actionable tasks with test cases
