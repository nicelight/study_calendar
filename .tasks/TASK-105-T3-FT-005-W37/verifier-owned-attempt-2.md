# TASK-105-T3-FT-005-W37 — Attempt 2 verifier-owned functional evidence

- role: `Reviewer`
- attempt: `2`
- tier / wave / feature: `T3` / `W37` / `FT-005`
- command: `npx vitest run --config .tasks/TASK-105-T3-FT-005-W37/verifier-attempt-2-vitest.config.ts --reporter verbose`
- cwd: `/home/serg/Projects/study_calendar`
- completed_at: `2026-09-05T04:18:45+05:00`
- exit_code: `0`
- result: `1` test file and `1` test passed

## Independently observed outcome

The fresh disposable fixture proves the current W37 transport path: Student A
completes the provider-selected homework through the named Lesson Context
action, and Student B's shared Lesson Context receives A's persisted
`completed: true` status. Shared completion entries contain no grade fields.
The same probe observes A's personal `F` grade, linked-parent visibility, B's
own permitted `β` grade, and denial when B asks for A's personal context.

The probe also covers zero/one/multiple provider selection, server-generated
opaque IDs, distinct IDs for a distinct authorized class, repeat-create and
repeat-complete state equality, all accepted grades, forged/wrong-role/
unassigned/cross-class/cross-center/invalid-grade denials, deny-before-write
state equality, and ambiguity fail-closed behavior. Static source checks show
no Lesson Context route database access and no POST export in
`/api/lesson-context`.

## Isolation and cleanup

Every fixture creates a fresh SQLite `:memory:` CompositionRoot. Rejected and
repeated actions compare `learning_homework`,
`learning_homework_completions`, and `learning_grades` snapshots before and
after. `afterEach` clears the mocked route root and closes the database. The
run created no filesystem database or sidecar and is safely rerunnable.
