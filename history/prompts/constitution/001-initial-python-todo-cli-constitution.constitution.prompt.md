---
id: 001
title: Initial Python Todo CLI Constitution
stage: constitution
date: 2025-12-25
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: unknown
command: /sp.constitution
labels: ["constitution", "initialization", "python", "todo-cli", "phase-1"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

CONSTITUTION — Phase I In-Memory Python Todo CLI Application
===========================================================

Purpose
-------
This constitution defines the non-negotiable principles, rules, and decision
framework for all specifications, plans, and implementations of the Phase I
In-Memory Python Todo CLI Application.

All future specs, plans, and code MUST comply with this document.


Project Overview
----------------
This project is a simple, console-based Todo application written in Python.

Phase I scope:
- Tasks are stored in memory only (no file system or database persistence).
- The application runs entirely in the command line.
- It serves as the foundation for future phases that may add persistence,
  authentication, or advanced features.

Each task consists of:
- id: unique auto-incrementing integer (starting from 1)
- title: string (required)
- description: string (optional)
- completed: boolean (default False)


Core Values (Non-Negotiable)
---------------------------
1. Simplicity and Readability First
   - Code must be immediately understandable to any Python developer.
   - Avoid clever tricks, over-engineering, or premature optimization.

2. Clean Code Principles
   - Follow PEP 8 strictly.
   - Use meaningful variable, function, and class names.
   - Keep functions short and focused on a single responsibility.
   - Prefer explicit logic over implicit behavior.

3. Modularity and Extensibility
   - Design decisions must support future phases.
   - Adding persistence later should not require major refactoring.
   - Business logic must be decoupled from CLI presentation.


Technical Principles
--------------------

Language and Runtime
- Python version: 3.13+
- Only Python standard library is allowed.
- No external dependencies in Phase I.

Type Safety
- Type hints are mandatory everywhere.
- Use `from __future__ import annotations` if required.
- Public interfaces must have clear, explicit types.

Documentation
- Every module, class, and function must include a docstring.
- Docstrings should explain intent, not restate obvious code.


Project Structure (Required)
----------------------------
All source code must live under the `src/` directory.

Required layout:

src/
├── __main__.py OR main.py     # Application entry point
├── task.py                   # Task data model
├── todo_app.py               # Core business logic
├── cli.py                    # CLI input/output handling (if separated)

Rules:
- Use proper imports (no path hacks).
- No logic should live directly in the entry point.
- CLI code must not contain business logic.


Architecture Rules
------------------
- Follow single responsibility principle strictly.
- Separate:
  - Data models (Task)
  - Business logic (TodoApp / TodoManager)
  - Presentation (CLI)

State Management
- In-memory storage only.
- Use a list of Task objects managed by a single controller class.
- No global mutable state.
- State must be passed explicitly through objects.

ID Management
- Task IDs must auto-increment.
- IDs must never be reused during runtime.
- IDs start at 1.


CLI Behavior Requirements
-------------------------
- Interactive menu-based loop.
- User-friendly prompts and output.
- Graceful handling of invalid input (no crashes).

Supported commands:
- add
- list
- update <id>
- delete <id>
- complete <id>
- quit

Output rules:
- Display task status clearly:
  - [x] for completed
  - [ ] for incomplete
- Lists must be formatted and readable.


Error Handling Rules
-------------------
- Invalid input must result in helpful messages.
- Missing task IDs must be handled gracefully.
- Never expose stack traces to the user.
- Validation belongs in business logic, not the CLI.


Testing Readiness
-----------------
- Code must be designed to be unit-testable.
- Business logic must be testable without invoking the CLI.
- Avoid tightly coupled input() / print() in core logic.


Documentation Requirements
--------------------------
README.md (Required):
- Project overview
- Python version
- Setup instructions using `uv`
- How to run the application
- Command reference

## Response snapshot

Created Phase I In-Memory Python Todo CLI Application Constitution v1.0.0.

**Key Sections Implemented:**

1. **Project Overview** — Defined Phase I scope (in-memory only, CLI-only, task structure)

2. **Core Principles** (3 principles):
   - I. Simplicity and Readability First
   - II. Clean Code Principles (PEP 8, short functions, descriptive names)
   - III. Modularity and Extensibility (decoupled architecture for future phases)

3. **Technical Principles**:
   - Language: Python 3.13+, stdlib only
   - Type Safety: Mandatory type hints everywhere
   - Documentation: Docstrings required for all modules/classes/functions

4. **Project Structure** — Required src/ layout with task.py, todo_app.py, cli.py separation

5. **Architecture Rules**:
   - Single Responsibility Principle (strict layer separation)
   - State Management (explicit passing, no globals)
   - ID Management (auto-increment from 1, never reuse)

6. **CLI Behavior** — Interactive menu, 6 commands (add/list/update/delete/complete/quit), formatted output

7. **Error Handling** — Graceful messages, no stack traces, validation in business logic

8. **Testing Readiness** — Unit-testable architecture without tight CLI coupling

9. **Documentation Requirements** — README.md must include setup, usage, commands

10. **Governance** — Amendment procedure, semantic versioning, compliance review enforcement

**Files Created:**
- `.specify/memory/constitution.md` (with sync impact report prepended)

**Version:** 1.0.0 (initial ratification)
**Ratification Date:** 2025-12-25

## Outcome

- ✅ Impact: Initial constitution established for Phase I Python Todo CLI. All future specs, plans, and implementations must comply with defined principles.
- 🧪 Tests: No tests in this phase (documentation task)
- 📁 Files: Created `.specify/memory/constitution.md`
- 🔁 Next prompts: `/sp.specify` to create feature specification, `/sp.plan` for implementation planning
- 🧠 Reflection: Constitution provides comprehensive governance with clear separation of concerns (Data/Business/Presentation), extensibility for future persistence phases, and strict enforcement via compliance reviews.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A (initial constitution creation)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Validate constitution against first feature specification to ensure principles are actionable and complete
