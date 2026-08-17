---
description: Independent adversarial semantic verification for TASK-037-T3-FT-003-W9.
status: final
---
# Red Verification — TASK-037-T3-FT-003-W9

## Semantic target

- Task outcome: the protected `/calendar` is a real DB-backed class calendar
  for only the server-authorized Admin, assigned Teacher, permitted Student, or
  linked Parent scope, with immediate fail-closed denial after access removal.
- Accepted contract and boundaries: `FT-003-AC-007`, `REQ-005/014/016`, Actor
  Context, Calendar and Membership Query, Access Control, Authentication
  Transport Browser/API path, and the application-shell/capability separation.

## Evidence and adversarial coverage

- Existing functional verdict: current `VERDICT: PASS` in
  `.protocols/TASK-037-T3-FT-003-W9/verification.md` and
  `.tasks/TASK-037-T3-FT-003-W9/TASK-037-T3-FT-003-W9-S-VERIFY-final-report-docs-01.md`.
- Inspected the real SvelteKit `load`, request hook, session resolution,
  Center & Scheduling public query/authorization implementation, page
  projection, generated production entries, serialized production-preview
  response, focused tests, task hard boundary, and sibling route surfaces.
- Adversarial coverage traced revoked/missing cookies, stale or mismatched
  `locals.actor`, cross-center/class requests, same-center non-membership,
  unassigned and post-removal Teacher access, and current Parent/Student links.
  Actor/account/role mismatches failed closed, and no client query parameter
  widened the owner-resolved scope.
- The route repeats authorization through the provider for both class scope and
  lesson facts, performs no direct persistence access, and returns only facts
  from the authorized class. Calendar geometry is derived from those lesson
  dates; the public fixture is not a protected-path source of truth.
- Complete `29`-table state hashes remained equal across the real allow/deny
  HTTP matrix and across removed-assignment denial/safe rerun. The production
  server and disposable SQLite state were stopped and cleaned after probing.
- Public `/`, the existing `/lesson-context`, FT-002 class/admin surfaces,
  Center & Scheduling ownership, and downstream collaboration/progress/finance
  slices were not absorbed or bypassed. Selected regressions passed `42/42`;
  full tests passed `142/142`; check, build, and diff gates passed.
- The required Codex Luna co-review model was unavailable after both prescribed
  attempts for each focus; no substitute model was used.

## Admitted findings

- none

## Operator questions

- none

## Verdict

SEMANTIC_VERDICT: semantic-pass

## Owner handoff

- Evidence/report paths:
  `.protocols/TASK-037-T3-FT-003-W9/verification.md`,
  `.tasks/TASK-037-T3-FT-003-W9/TASK-037-T3-FT-003-W9-S-VERIFY-final-report-docs-01.md`,
  and
  `.tasks/TASK-037-T3-FT-003-W9/TASK-037-T3-FT-003-W9-S-RED-VERIFY-final-report-docs-01.md`.
- Recommended owner action: combine the current functional PASS and this
  semantic-pass for the explicit T3 lifecycle decision; this verifier leaves
  status unchanged.
- Resume route: lifecycle owner decision; no repair route is required.
