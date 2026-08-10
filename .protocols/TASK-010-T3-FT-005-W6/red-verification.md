---
description: Fresh independent adversarial semantic verification for TASK-010-T3-FT-005-W6.
status: final
---
# Red Verification — TASK-010-T3-FT-005-W6

## Semantic target

- Task-owned outcome: `FT-005-AC-003` and `FT-005-AC-004` must keep attendance
  server-authorized for individual and group lessons, leave absent students
  uncharged, and make an authorized absent-to-present correction atomic,
  historically priced, deterministically recalculated, auditable, and isolated
  from unrelated students.
- Accepted boundaries: Learning Progress owns attendance and orchestrates the
  correction; Financial Ledger owns charges, allocations, balances, and
  financial audit; Identity & Access and Center & Scheduling supply current
  actor and resource scope.
- Direct normative basis: task card, Attendance Charge Reconciliation Boundary,
  Financial Ledger Contract, Learning and Finance lifecycle, and MVP
  pre-real-data verification runbook.

## Evidence and adversarial coverage

- The indexed task is `T3`, remains `in_progress`, and has an independent
  functional `VERDICT: PASS`; that result was treated as supporting evidence,
  not as semantic proof.
- Current source inspection covered
  `src/lib/server/modules/learning-progress/public.ts`,
  `src/lib/server/modules/financial-ledger/public.ts`,
  `src/lib/server/modules/center-scheduling/public.ts`,
  `src/lib/server/modules/identity-access/public.ts`,
  `src/lib/server/platform/database.ts`, and composition wiring. The
  accepted call graph is preserved: the only production caller of
  `reconcileLessonCharge` is Learning Progress; Learning Progress writes only
  `learning_attendance`, while Financial Ledger owns all financial writes.
- The current Learning Progress command re-resolves actor, assigned class,
  target student, and non-cancelled lesson before mutation. Financial Ledger
  independently re-checks the actor and lesson/student scope before changing
  financial state.
- The attendance transition, reconciliation, allocation rebuild, audit write,
  and attendance persistence share one SQLite transaction. A provider failure
  therefore rolls back both owners' state; a repeated same attendance state
  does not create a second financial transition, and a prior cancelled Charge
  is reactivated with its stored historical price.
- Fresh verifier execution of
  `tests/learning-progress/attendance-red-probe.test.ts` passed `1` file / `2`
  tests. The probe covers individual/group absent and present behavior,
  historical pricing, oldest-first balance recalculation, audit attribution,
  unrelated-student isolation, missing-price rollback, and student write
  denial using disposable in-memory SQLite state.
- The broader workspace has unrelated dirty/untracked changes; no stale
  semantic output or execute receipt was reused.

## Admitted findings

- None. No supported-path material break of the accepted outcome, ownership,
  authorization, atomicity, historical pricing, audit, or isolation contract
  was evidenced.

## Operator questions

- None. The accepted outcome and relevant boundary contracts are unambiguous.

## Verdict

SEMANTIC_VERDICT: semantic-pass

## Owner handoff

- Evidence/report paths: this protocol, the final RED-VERIFY report, the
  current functional verification report, the task execution evidence, the
  current attendance source, and the focused attendance probe.
- Recommended owner action: record this required T3 semantic gate and let the
  existing lifecycle owner evaluate closure under tier policy. This review did
  not close, fail, block, reopen, promote, or synchronize the task.
- Resume route: lifecycle owner/scheduler; no implementation repair or operator
  decision is required by this review.
