---
description: Canonical browser projection and server-authorized transport for homework completion and grading in Lesson Context.
status: active
last_updated: 2026-09-04
source_of_truth:
  - .memory-bank/contracts/learning-progress-browser-surface.md
---
# Learning Progress Browser Surface Contract

## Ownership and route

The existing `/lesson-context` route is the only user surface for homework
completion and grading. Lesson Context adapts server data and form actions;
Learning Progress remains the sole owner and writer of homework, completion,
and grade facts.

The MVP keeps `learning_homework` class-scoped. For an authorized lesson,
Learning Progress resolves the existing class-scoped item: zero items means no
homework item is available, exactly one item is used, and more than one item
fails closed with `ambiguous-homework-selection`. No `lesson_id` relation,
consumer-owned mapping, new table, or migration is introduced.

`/api/lesson-context` remains a GET-only read projection. Mutations use named
SvelteKit form actions on the existing `/lesson-context` page.

## Server-composed homework projection

For the current server-authorized class and non-cancelled lesson, the Lesson
Context projection MUST expose a serializable homework-progress section with:

- the provider-selected homework item or `null`;
- class-visible completion statuses restricted to the server-resolved
  class/student scope, without grade fields;
- the selected student's completion beside the existing personal grade.

Teacher/Admin grade form data MAY include the current grade for each
server-resolved class student. Shared Student/Parent projection MUST NOT expose
another student's grade. Homework identity comes only from Learning Progress;
the consumer MUST NOT accept or derive `homeworkId` from browser input, URL
state, or a second persistence lookup.

## Authorized homework form actions

The existing `/lesson-context` form-action adapter MUST support only these
homework mutations:

- `createHomework`: Admin or assigned Teacher may create the single
  class-scoped item when none exists. The server takes trimmed homework text
  from authorized lesson material, generates a unique opaque ID, and delegates
  to `LearningProgressBoundary.createHomework`. Repeat submission MUST NOT
  create a second item.
- `completeHomework`: only the authenticated Student marks the selected class
  item complete. The action uses the session actor and provider-selected item;
  it accepts neither `studentAccountId` nor `homeworkId` as authority.
- `recordGrade`: Admin or assigned Teacher sets `α`, `β`, `γ`, or `F` for a
  server-resolved class student. The submitted student selector and grade are
  untrusted, server-validated, and delegated to `recordGrade`.

All actions resolve session actor, center, class, lesson, role, and student
scope before mutation. Invalid, forged, cross-center, unassigned, and
wrong-role requests fail without a write or existence leakage. The route does
not write Learning Progress tables directly and adds no mutation API.

## Browser user surface and persistence

The page MUST let an Admin/Teacher create a missing item, see class-visible
completion statuses, and use the grade selector for each permitted student.
Students MUST be able to mark completion and see the persisted status after the
server response. Parents and other permitted viewers see only completion data
allowed by server scope. A grade is visible only in the existing personal
context for the corresponding student/family, assigned Teacher, or Admin; the
shared completion section never displays grades.

Successful actions MUST return fresh server data. No client store, browser
persistence, new route, or direct database access is introduced.

## Verification target

Use focused route/integration tests and one disposable Playwright flow through
the repository runner in `tmp/`. Cover Admin/Teacher create and grade, Student
completion, class-visible status after reload, `α`/`β`/`γ`/`F`, and negative
grade privacy for an unrelated Student or unlinked Parent while preserving
corresponding student/linked-family visibility. Denied-action tests compare
state before and after; cleanup targets only the disposable database and its
sidecars, never `study-calendar.db`.
