# Junie Guidelines: Working with the Task Checklist

## Overview

This project follows **spec-driven development**. All requirements, implementation plans, and tasks are documented in the `docs/` directory. This file provides guidelines for working with the task checklist (`docs/tasks.md`).

---

## Core Principles

1. **Tasks drive development**: Every code change should be linked to a specific task.
2. **Traceability**: Each task links to both the implementation plan and requirements.
3. **Incremental progress**: Mark tasks as complete immediately after finishing them.
4. **Maintain consistency**: Keep formatting and structure intact when adding or modifying tasks.

---

## Working with `docs/tasks.md`

### Marking Tasks Complete

**When you complete a task:**
- Change `[ ]` to `[x]` for that task
- Do not modify the task description or numbering
- Commit the change with a clear message referencing the task ID

**Example:**
```markdown
- [x] **1.1.1** Initialize Next.js 14+ project with App Router using `npx create-next-app@latest`
```

**Commit message:**
```
✓ Task 1.1.1: Initialize Next.js project

Initialized Next.js 14 with App Router, TypeScript, and Tailwind CSS.
```

---

### Adding New Tasks

**When adding a new task:**
1. Add it under the appropriate phase and section
2. Assign a unique ID following the existing pattern: `[phase].[section].[task]`
3. Link it to both the plan item and requirement(s)
4. Keep the format consistent with existing tasks

**Format:**
```markdown
- [ ] **[ID]** [Clear, actionable description]
```

**Example:**
```markdown
### 2.5 Meter Visualization Enhancements
*Plan: 2.4 | Requirements: 5, 14*

- [ ] **2.5.1** Add animated gradient background to meter bar based on tier
- [ ] **2.5.2** Implement particle effects for tier transitions
```

---

### Modifying Existing Tasks

**When a task needs clarification or adjustment:**
- Update the task description but keep the ID unchanged
- Add a note in the task or commit message explaining the change
- If a task is no longer relevant, mark it as `[~]` (skipped) with a note

**Example:**
```markdown
- [~] **3.1.7** Create unluck message arrays for each step/choice combination
  *Note: Moved to external JSON file for easier content management*
```

---

### Task Status Notation

- `[ ]` – Not started
- `[x]` – Completed
- `[~]` – Skipped or no longer applicable (add note explaining why)

---

### Phase Workflow

**Follow phases in order:**
1. Complete all tasks in Phase 1 (Foundation) before starting Phase 2
2. Within a phase, tasks can be done in parallel if they have no dependencies
3. Check task dependencies in the plan (`docs/plan.md`) before starting

**Exception:** Phases 8, 9, and 10 (Polish, Analytics, Testing) can be done in parallel with earlier phases.

---

### Cross-Referencing

**Always link tasks to:**
1. **Plan item**: Each task header references the plan section (e.g., `*Plan: 1.1*`)
2. **Requirements**: Each task header lists relevant requirements (e.g., `*Requirements: 1, 2, 5*`)

**When reviewing a task:**
- Read the linked plan item in `docs/plan.md` for context
- Read the linked requirements in `docs/requirements.md` for acceptance criteria
- Ensure your implementation satisfies both

---

## Best Practices

### Before Starting a Task
1. Read the task description carefully
2. Review linked plan item and requirements
3. Understand dependencies (check if prerequisite tasks are complete)
4. Estimate effort and identify any blockers

### While Working
1. Write code that satisfies the task description
2. Follow project coding standards (TypeScript strict mode, Biome formatting)
3. Write unit tests for new functions (as specified in task)
4. Document complex logic with inline comments

### After Completing
1. Mark task as `[x]` immediately
2. Run linter and type-checker (`npm run lint`, `npm run type-check`)
3. Run relevant tests (`npm test`)
4. Commit with clear message referencing task ID

---

## Handling Issues

### Task is Blocked
- Add a note to the task explaining the blocker
- If another task needs to be completed first, ensure it's marked as a dependency
- Discuss blockers with the team or move to the next available task

### Task is Unclear
- Review linked plan and requirements for clarity
- If still unclear, add a note requesting clarification
- Propose a clarification and proceed if urgent

### Task is Obsolete
- Mark as `[~]` (skipped)
- Add note explaining why (e.g., "Superseded by task 4.2.3")
- Update plan and requirements if necessary

---

## Quality Gates

**Before marking a phase complete:**
- [ ] All tasks in the phase are marked `[x]` or `[~]` (with notes)
- [ ] All unit tests for the phase pass
- [ ] Linter and type-checker show no errors
- [ ] Changes are committed with clear messages
- [ ] Documentation (if applicable) is updated

**Before final deployment:**
- [ ] All 305 tasks are complete or skipped with notes
- [ ] All tests pass (unit, integration, visual)
- [ ] Manual QA checklist (Task 10.4) is complete
- [ ] Performance and accessibility audits pass
- [ ] Documentation is complete and accurate

---

## Task Checklist File Management

### Formatting Rules
- Use consistent indentation (2 spaces for nested lists)
- Keep task IDs in bold: `**1.1.1**`
- Keep checkbox format: `- [ ]` or `- [x]` (space inside brackets)
- Keep plan/requirement links in italics: `*Plan: 1.1 | Requirements: 1, 2*`

### Do NOT
- Renumber existing tasks (breaks git history and references)
- Delete completed tasks (keep them marked `[x]` for history)
- Change task descriptions retroactively without noting the change
- Remove phase or section headers

### DO
- Add new tasks with unique IDs
- Update descriptions when requirements change (with notes)
- Group related tasks under appropriate phases/sections
- Keep the file readable and well-organized

---

## Integration with Development Tools

### Git Workflow
1. Create feature branch: `git checkout -b task-1.1.1-init-nextjs`
2. Complete task and mark `[x]` in `docs/tasks.md`
3. Commit: `git commit -m "✓ Task 1.1.1: Initialize Next.js project"`
4. Push and create PR referencing task ID

### Code Review
- Reviewer should verify task is marked `[x]`
- Reviewer should check that code satisfies linked requirements
- Reviewer should verify tests are written (if specified in task)

### CI/CD Integration
- CI should run linter, type-checker, and tests on every commit
- CI can check that tasks are properly formatted (optional)
- Deployment should only happen when all critical tasks are complete

---

## Summary

**The task checklist is your roadmap:**
- It ensures nothing is missed
- It provides traceability from requirements to implementation
- It tracks progress transparently
- It facilitates collaboration and code review

**Keep it up-to-date, and it will keep you organized.**

---

## Quick Reference

| Action | Command |
|--------|---------|
| Mark task complete | Change `[ ]` to `[x]` |
| Skip task | Change `[ ]` to `[~]`, add note |
| Add new task | Follow format: `- [ ] **[ID]** [Description]` |
| Review task context | Check `docs/plan.md` and `docs/requirements.md` |
| Run tests | `npm test` |
| Run linter | `npm run lint` |
| Check types | `npm run type-check` |

---

**Last Updated:** 2025-10-12  
**Maintained By:** Development Team

