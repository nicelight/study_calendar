---
description: Claim-linked GREEN evidence for TASK-103 Attempt 2 recovery.
status: final
---
# TASK-103 Attempt 2 GREEN

The bounded correction is implemented in the existing
`/lesson-context` page and task-local evidence now covers the rejected claims.

## Claim coverage

- AC-001 / REQ-006: field cards render the three projected topics, comment
  create/edit forms, author and last-change data, and preserve the selected
  shared/personal scope through existing named actions.
- AC-002 / REQ-007: field, comment, and message reaction forms expose the
  five server-supported reaction values; participant labels are rendered from
  `reactorLabel` for every target type.
- AC-003 / REQ-008: common messages are recursively rendered through
  `MessageCard`; `messageDepth` follows parent links to arbitrary depth and
  the disposable browser proof reaches depth 2.
- AC-004 / REQ-008: branch links write `branchRootId` to the URL, selected
  branch content is rendered from the server projection, and reload preserves
  the selected branch. The proof also creates eleven branches and confirms
  the ten-tab boundary while the evicted root remains in the common feed.
- AC-005 / REQ-006, REQ-014: shared/personal projections remain isolated;
  linked parent access succeeds, unassigned teacher/cross-class/
  cross-center/no-session access is denied, and a forbidden edit leaves the
  database state unchanged.

## Focused evidence

- `npx vitest run tests/lesson-context/task-103-collaboration-ui.test.ts` —
  PASS, 1 file / 3 tests.
- `node scripts/run-disposable-e2e.mjs --database
  tmp/ft-004-collaboration-ui.db --spec
  e2e/ft-004-collaboration-ui.spec.ts` — PASS, 1 browser test in 22.0s.

The browser spec includes a first-request warm-up because this repository's
disposable server creates its schema lazily; the fixture remains disposable
and is inserted only after the server has initialized the exact temporary DB.
The runner's `finally` cleanup removed the database and all SQLite sidecars.

No direct database access, new transport, authority decision, or backend
change was added to the production page.
