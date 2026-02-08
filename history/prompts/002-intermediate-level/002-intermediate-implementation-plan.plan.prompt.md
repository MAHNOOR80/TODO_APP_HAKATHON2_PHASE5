---
id: 002
title: Intermediate Implementation Plan
stage: plan
date: 2025-12-27
surface: agent
model: claude-sonnet-4-5
feature: 002-intermediate-level
branch: main
user: you mahno9248@gmail.com
command: /sp.plan
labels: ["intermediate-level", "architecture", "plan", "priorities", "tags", "search", "filter", "sort"]
links:
  spec: specs/002-intermediate-level/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-intermediate-level/plan.md
tests:
  - N/A (planning document, no code changes)
---

## Prompt

/sp.plan

## Implementation Plan: Intermediate Level – Organization & Usability

### Overview
This plan outlines step-by-step tasks to implement intermediate features: Priorities & Tags/Categories, Search & Filter, and Sort Tasks. The implementation follows spec-driven development using Claude Code and Spec-Kit Plus.

---

### Step 1: Extend Task Data Model
- Add fields for:
  - `priority` (High, Medium, Low)
  - `category` (user-defined or predefined: Work, Home, Personal)
- Update constructors and default values (optional, default to None or Medium).

### Step 2: Update Add Task Function
- Modify `add_task()` to accept optional `priority` and `category`.
- Validate priority input against allowed values.
- Store category as string (free text or from predefined list).

### Step 3: Update View Task List
- Modify `view_tasks()` to display priority and category for each task.
- Ensure console output remains clear and aligned.

### Step 4: Implement Search & Filter
- Create functions:
  - `search_tasks(keyword)`
  - `filter_tasks(status=None, priority=None, category=None)`
- Combine search and filter when multiple criteria are provided.
- Return a list of tasks matching all criteria.

### Step 5: Implement Sort Tasks
- Create `sort_tasks(criteria, ascending=True)` function.
- Sorting options:
  - `title` (alphabetical)
  - `priority` (High > Medium > Low)
  - `due_date` (earliest first)
- Integrate sorting with filtered/searched task lists.

### Step 6: Update CLI Menu
- Add new menu options for:
  - Assigning priority/category
  - Searching/filtering tasks
  - Sorting tasks
- Ensure smooth integration with existing basic features.

### Step 7: Testing & Validation
- Test adding tasks with priority/category.
- Test searching and filtering individually and in combination.
- Test sorting by all criteria in ascending/descending order.
- Handle invalid inputs gracefully (e.g., unknown priority, empty search).

### Step 8: Documentation
- Update `README.md` with intermediate-level usage instructions.
- Update `/specs` files with implementation details.

## Response snapshot

Created comprehensive architectural implementation plan for Intermediate Level (002-intermediate-level) with organization and usability features.

### Plan Structure:

**Summary:**
Extend Todo CLI with priorities (high/medium/low), flexible tagging, keyword search, filtering, and sorting. Adds 3 new Task fields (priority, tags, created_at) and 5 new CLI commands. Maintains strict backward compatibility with Basic Level using default values.

**5 Major Architectural Decisions:**

1. **Tags vs. Single Category** [ADR CANDIDATE]
   - Decision: Multiple tags (list[str]) over single category field
   - Rationale: Flexible multi-dimensional organization, aligns with modern task management patterns
   - Tradeoffs: Slightly more complex parsing vs. limited single-category organization
   - Impact: Long-term data model, future features (tag views, statistics)

2. **Non-Persistent Filters/Sorts** [ADR CANDIDATE]
   - Decision: Filters and sorts are one-time views (cleared after each command)
   - Rationale: Simple mental model, no hidden state, aligns with Principle I (Simplicity)
   - Tradeoffs: Users must re-filter vs. persistent state management complexity
   - Impact: State management patterns, user workflow

3. **Priority as Enum** [ADR CANDIDATE]
   - Decision: Use Python enum.Enum for priority type
   - Rationale: Type safety, semantic clarity, aligns with constitution mandatory type hints
   - Tradeoffs: Slightly complex serialization (future) vs. runtime-only string validation
   - Impact: Type safety patterns, future data model extensions

4. **Strict Tag Validation**
   - Decision: Alphanumeric + hyphen only, max 20 chars per tag
   - Rationale: Prevents display issues, prepares for future features, explicit spec requirement
   - Principle: Error handling with clear messages

5. **Stable Sort**
   - Decision: Use Python's stable Timsort (preserves creation order for ties)
   - Rationale: Predictable behavior, matches user expectations, no performance penalty
   - Default: Python's built-in sort is stable by default

**Extended Data Model:**
```python
class Priority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

@dataclass
class Task:
    # Basic Level fields (unchanged)
    id: int
    title: str
    description: str
    completed: bool = False

    # Intermediate Level fields (NEW)
    priority: Priority = Priority.MEDIUM
    tags: list[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
```

**5 New TodoApp Methods:**
1. `set_priority(task_id, priority_str) -> tuple[bool, str]`
2. `set_tags(task_id, tags_str) -> tuple[bool, str]`
3. `search_tasks(keyword) -> list[Task]`
4. `filter_tasks(field, value) -> list[Task]`
5. `sort_tasks(field) -> list[Task]`

**5 New CLI Commands:**
1. `priority <id> <level>` - Set priority (high/medium/low)
2. `tag <id> <tags>` - Set comma-separated tags (e.g., "work,urgent")
3. `search <keyword>` - Case-insensitive search in title/description
4. `filter <field> <value>` - Filter by priority/tag/status
5. `sort <field>` - Sort by priority/title/created/due

**Constitution Compliance:**
- ✅ All 12 constitution principles checked and passed
- ✅ Backward compatibility maintained (Basic Level tasks work with defaults)
- ✅ No external dependencies (using datetime, enum from stdlib)
- ✅ Separation of concerns preserved (CLI → TodoApp → Task)
- ✅ Type safety with enum and type hints
- ✅ No global mutable state

**Risk Analysis:**
- Risk 1: Breaking Basic Level - Mitigated with regression testing and default values
- Risk 2: Tag parsing confusion - Mitigated with clear error messages
- Risk 3: Performance degradation - Mitigated with <500ms success criteria
- Risk 4: Sort order confusion - Mitigated with documentation and consistent behavior

**Performance Targets:**
- Priority/tag operations: <100ms
- Search 100 tasks: <500ms (spec SC-003)
- Filter 50 tasks: <500ms (spec SC-002)
- Sort 100 tasks: <100ms

**3 ADR Suggestions:**
1. "Use Flexible Tags Instead of Single Category Field" - Multi-dimensional organization decision
2. "Non-Persistent Filters and Sorts to Maintain Simplicity" - State management decision
3. "Use Enum for Priority Type Safety" - Type system decision

All meet significance test (Impact + Alternatives + Scope)

**Detailed Sections:**
- Scope and Dependencies (in-scope, out-of-scope, prerequisites)
- 5 Key Decisions with full rationale and tradeoffs
- Interfaces and API Contracts (method signatures, Task model, CLI commands)
- NFRs and Budgets (performance, reliability, security)
- Data Management and Migration (schema evolution, backward compatibility)
- Operational Readiness (runbooks, deployment)
- Risk Analysis (4 risks with mitigations)
- Evaluation and Validation (Definition of Done with 20+ checklist items)

## Outcome

- ✅ Impact: Comprehensive architectural plan created with 5 key decisions, 3 ADR candidates, complete API contracts
- 🧪 Tests: Acceptance criteria defined for all 5 user stories, performance targets specified
- 📁 Files: specs/002-intermediate-level/plan.md (created)
- 🔁 Next prompts: Create 3 ADRs (optional), then run /sp.tasks to generate implementation task breakdown
- 🧠 Reflection: Plan balances extensibility (tags, enum) with simplicity (non-persistent filters) while maintaining strict backward compatibility through default values

## Evaluation notes (flywheel)

- Failure modes observed: None - plan complete and constitution-compliant
- Graders run and results (PASS/FAIL): Manual review - PASS (all 12 constitution checks passed)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Optionally create ADRs for 3 significant decisions, then proceed to /sp.tasks for task breakdown
