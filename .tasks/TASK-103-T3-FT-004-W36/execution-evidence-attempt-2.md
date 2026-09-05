---
description: Correction execution evidence for TASK-103-T3-FT-004-W36.
status: final
---
# Correction Attempt 2 Evidence

## Scope

The correction changes only `src/routes/lesson-context/+page.svelte` and the
task-owned `e2e/ft-004-collaboration-ui.spec.ts`. Existing server projections,
named actions, authorization, persistence, and database schema remain owners
of their existing behavior.

## Fixed verifier findings

- `ReactionForm('message', message.messageId, message.reactions)` is rendered
  for every projected message; comment and message participant labels are
  rendered from the server projection.
- `branchRootId` is read from `$app/state` through an SSR-safe derived value;
  branch links preserve class, lesson, date, and optional student scope in the
  query and selected branch content is rendered from the projection.
- `MessageCard` recursively renders children by `parentMessageId` and emits a
  `data-message-depth` marker used by the browser proof.
- The dedicated browser spec seeds only its disposable SQLite database and
  proves nested replies, message/comment reactions, 11 roots with at most 10
  visible branch tabs, URL-backed branch selection, and personal-scope
  non-disclosure of shared comments.

## Gates

- check, build, full test suite (79 files / 271 tests), diff check, mb-lint,
  and strict doctor all passed.
- Dedicated disposable browser scenario passed 1/1 and removed the exact
  database and SQLite sidecars through the runner cleanup.

No independent verdict or lifecycle transition is claimed by this receipt.
