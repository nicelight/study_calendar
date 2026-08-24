---
description: Initial claim-linked RED evidence for TASK-095-T3-FT-007-W28.
status: active
receipt_status: supporting-only
---
# Attempt 1 — claim-linked RED

- claim: `FT-007-AC-009` / `REQ-014` / `REQ-017`; C&S registry-facts query
  must expose the authorized structural source facts and deny unsafe scopes.
- command: `npm run test -- tests/center-scheduling/ft-007-registry-facts.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- result: exit code `1`; 1 test failed.
- input basis: Attempt 1 had completed preflight, initialized the focused
  isolated test, and had not changed production behavior for TASK-095. The
  current C&S public boundary had no `getRegistryFacts` operation.
- decisive observation: `TypeError: api.getRegistryFacts is not a function` at
  the first Admin own-center claim assertion (`ft-007-registry-facts.test.ts:120`).
- interpretation: honest claim-specific RED for the absent task-owned public
  query, not setup/syntax/artificial failure.
- isolation: the probe used a fresh `:memory:` SQLite CompositionRoot; no
  network, credentials, production database, or `study-calendar.db` access.
