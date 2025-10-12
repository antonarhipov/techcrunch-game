# Technical Task List Guidelines

## Overview
The technical task list in `docs/tasks.md` provides a comprehensive, enumerated breakdown of all development work aligned with the implementation plan (`docs/plan.md`) and requirements document (`docs/requirements.md`).

## Task List Structure

### Numbering Convention
- **Plan sections**: `Phase X` (e.g., Phase 1, Phase 2)
- **Subsections**: `X.Y` (e.g., 1.1, 1.2)
- **Individual tasks**: `X.Y.Z` (e.g., 1.1.1, 1.1.2)

### Checkbox Usage
- `[ ]` = Task not started
- `[x]` = Task completed
- Mark tasks as complete only when fully implemented and tested

### Reference Linking
- **Plan references**: `[Phase 1]` links to implementation plan items
- **Requirement references**: `[RX]` links to requirements document
- Multiple references allowed: `[Phase 1] [R22, R12]`

## Workflow

### Task Completion Process
1. Select tasks from the appropriate milestone (M0, M1, M2, M3)
2. Implement the task following acceptance criteria
3. Validate changes for the task:
    - Ensure the project compiles: `npm run build`
    - Run tests (if any) and ensure they pass: `npm test` (or the repo's configured test command)
4. Mark checkbox as complete `[x]` only after successful validation
5. Update progress in related documents if needed

### Task Dependencies
- Follow the milestone sequencing (M0 → M1 → M2 → M3)
- Complete foundation tasks before dependent features
- Respect cross-references between Plan items

### Quality Standards
- Each completed task must meet its referenced requirement acceptance criteria
- Include appropriate error handling and edge cases
- Add tests where specified in the plan
- Document API changes and new functionality

## Maintenance

### Adding New Tasks
- Follow the established numbering convention
- Include appropriate Plan-# and R# references
- Place in correct milestone sequence
- Use descriptive, actionable task descriptions

### Modifying Tasks
- Update task descriptions to reflect scope changes
- Maintain reference integrity when splitting/merging tasks
- Keep checkbox states accurate during refactoring

### Progress Tracking
- Use the task list as the primary progress indicator
- Reference completed tasks in milestone reports
- Update related documentation when major sections complete

## Integration with Development Plan
- Task list items directly implement plan deliverables
- Acceptance gates in the plan correspond to task completion
- Milestone boundaries align with plan phases (M0-M3)
- Use task completion to validate plan progress