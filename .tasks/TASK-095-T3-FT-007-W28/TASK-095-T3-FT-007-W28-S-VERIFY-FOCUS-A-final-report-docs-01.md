---
description: Fresh Focus A verification report for TASK-095-T3-FT-007-W28.
status: active
---
# TASK-095-T3-FT-007-W28 — Fresh Focus A verification

## verdict

Focus A has no candidate findings. The marker below records this focus's
evidence result only; the caller retains task-level adjudication authority.

## findings

None.

## evidence_checked

- Task card and exact task scope: `.memory-bank/tasks/TASK-095-T3-FT-007-W28.task.json`.
- `FT-007-AC-009 / REQ-014 / REQ-017`:
  `.memory-bank/features/FT-007-navigation-and-statistics.md#FT-007-AC-009`.
- Statistics registry-facts contract:
  `.memory-bank/contracts/statistics-projection.md#center-and-scheduling-registry-facts-query`.
- C&S public boundary:
  `.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary`.
- Server authority/scope:
  `.memory-bank/contracts/access-control.md#authority-and-scope`.
- Ownership map: `.memory-bank/domains/core-domain.md#ownership-map`.
- T3 obligations, hard write boundary, claim ownership, acceptance evidence,
  RED/GREEN, and closure authority in `.memory-bank/workflows/tier-policy.md`.
- `.protocols/TASK-095-T3-FT-007-W28/{context,plan,progress,handoff}.md`.
- Historical Attempt 1 FAIL/evidence, Judge REDIRECT, and Attempt 2 handoff/
  evidence as supporting context only.
- Current source:
  `src/lib/server/modules/center-scheduling/public.ts`.
- Current focused proof:
  `tests/center-scheduling/ft-007-registry-facts.test.ts`.

## fresh verifier-owned evidence

- `npx vitest run --config .tasks/TASK-095-T3-FT-007-W28/verifier-focus-a-vitest.config.ts`
  passed 1 file / 2 tests in fresh `:memory:` SQLite state.
- The provider accepts `getRegistryFacts({ actor: ActorContext | null })`.
  Actors were resolved before provider invocation; provider-time spies observed
  no Identity & Access `resolveActor` or `getAccountEmail` call.
- Bounded source inspection found no provider-side Identity & Access call, no
  `accounts` read/join, and no Identity & Access-owned role/profile fields in
  the registry query or membership helper. Membership SQL reads only
  `center_memberships`.
- Exact runtime projection keys were limited to institution, account IDs,
  memberships, parent links, assignments, classes, and student counts.
- Admin own-center, Teacher assigned-class, Student/Parent/anonymous/
  unassigned/removed-assignment behavior, cross-center isolation, and full
  source-state equality passed.

## gates

- `npm run test -- tests/center-scheduling/ft-007-registry-facts.test.ts` — PASS,
  1 file / 1 test.
- `npm run check` — PASS, 0 errors / 0 warnings.
- `npm run test` — PASS, 60 files / 190 tests.
- `npm run build` — PASS.
- `git diff --check` — PASS.
- `node scripts/mb-lint.mjs` — PASS, 74 files; existing advisory warnings.
- `node scripts/mb-doctor.mjs --strict` — PASS, 0 errors / 0 warnings / 2 info.

## risks_or_questions

- No Focus A candidate finding or unresolved ownership question.
- Shared W27/W28 dirty worktree changes were preserved and not treated as
  TASK-095 scope expansion. The task implementation/proof paths remain inside
  the literal hard boundary.
- No lifecycle, scheduler, AUTONOMOUS-RUN, implementation, or prior evidence
  was changed; `/red-verify` was not run.

Focus result: PASS
