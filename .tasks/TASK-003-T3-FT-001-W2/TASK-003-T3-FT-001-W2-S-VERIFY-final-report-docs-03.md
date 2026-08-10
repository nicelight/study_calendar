---
description: Standalone independent Reviewer verification for bounded retry 2 / Attempt 3 of TASK-003-T3-FT-001-W2.
status: final
---
# Independent Verification — TASK-003-T3-FT-001-W2

## Review result

- Review disposition: APPROVE.
- Findings: none.
- Scope: current bounded retry 2 / Attempt 3 source and evidence only.
- Excluded from reuse: retry-1 verification report and all retry-1 receipts.
- Lifecycle: unchanged at `in_progress`.

## Normative basis

- Task-owned claim: `FT-001-AC-003` with `REQ-001`, `REQ-002`, and the
  applicable server-side scope constraint from `REQ-014`.
- Public edge: `Center & Scheduling -> Identity & Access -> Account
  Provisioning Boundary`.
- Required behavior: own-center Admin authorization, Identity & Access write
  ownership, Center & Scheduling membership ownership, one-time invitation and
  authorization, atomic account/invitation and binding failure paths, and no
  caller-selected role or center scope as authorization.

## Independent evidence

All commands ran from `/home/serg/Projects/study_calendar`.

| Claim | Fresh observation | Result |
|---|---|---|
| Direct forged cross-center call | Focused task test; valid `center-2` Admin claiming `center-1` threw `forbidden`; persistence snapshot unchanged | PASS — 1 passed, 7 skipped |
| Complete task outcome | Full task probe covered session/role/center matrix, own-center success, valid retention, atomic provisioning rollback, expired/revoked/reused/duplicate safety | PASS — 8/8 |
| One-time server capability | Vite-loaded runtime probe rejected forgery, accepted the issued frozen capability once, and rejected reuse | PASS |
| Ownership/boundary | Read-only source probe checked accepted dependency, authorization order, private wiring, transaction ownership, membership separation, and adapter non-bypass | PASS — 11/11 |
| Project type/diagnostic gate | `npm run check` | PASS — 0 errors, 0 warnings |
| Production build | `npm run build` | PASS |
| Full regression suite | `npm run test` | PASS — 12/12 |
| Diff hygiene | `git diff --check` plus task-source trailing-whitespace probe | PASS |
| Forbidden scope | Pre/post hashes of TASK-001 and TASK-002 task cards | PASS — unchanged |

The task probe uses a fresh SQLite `:memory:` database for every test, closes
it after each test, and touches no network, credentials, production database,
or external system.

## Claim conclusions

- The composition root creates a private capability channel. Center &
  Scheduling receives only the issuer; Identity & Access receives only the
  consumer.
- Center & Scheduling resolves the session and current own-center Admin scope
  before issuance. A direct caller cannot forge the object identity expected by
  Identity & Access.
- Identity & Access consumes authorization before starting the atomic
  account/invitation transaction. Duplicate invitation persistence rolls back
  the preceding account insert.
- Valid binding retains the pre-created role and Center & Scheduling-owned
  membership.
- Expired, revoked, reused, and duplicate-identity failures preserve account,
  role, membership, invitation, and binding state.
- Routes, hooks, and composition wiring do not own business persistence; no
  forbidden dependency direction or second source of truth was observed.

Valid binding was checked only as task-level retained-state integration. This
report does not adopt `FT-001-AC-001`, `AC-002`, or `AC-004`, which remain
owned by `TASK-004-T3-FT-001-W3`.

## Executor claim path

- Current Attempt 3 RED:
  `.tasks/TASK-003-T3-FT-001-W2/execution-evidence.md#attempt-3--bounded-retry-2-current-claim-red`.
- Current Attempt 3 GREEN:
  `.tasks/TASK-003-T3-FT-001-W2/execution-evidence.md#attempt-3--bounded-retry-2-correction-and-claim-equivalent-green`.
- Reused execute evidence: none. The executor path is supporting context and
  does not replace the fresh Reviewer observations above.

## Verdict

VERDICT: PASS

## Structured handoff

- Next owner: scheduler/outer workflow.
- Next action: run a fresh, separate
  `/red-verify TASK-003-T3-FT-001-W2` for the remaining T3 semantic gate.
- Tier escalation / planning repair: none.
- BUG or follow-up: none.
- Lifecycle changed by this verification: no; task remains `in_progress`.
- Closure: not authorized by this Reviewer and not yet eligible without the T3
  semantic verdict and lifecycle owner decision.
