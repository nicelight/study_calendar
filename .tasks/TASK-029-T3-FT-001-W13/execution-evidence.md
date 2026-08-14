---
description: Executor-owned evidence for TASK-029-T3-FT-001-W13 Attempt 1.
status: active
---
# TASK-029-T3-FT-001-W13 — Execution Evidence

## Attempt and preflight

- Attempt: `1`, started `2026-08-13T22:44:18+05:00`.
- The indexed `T3` card was `ready`; direct prerequisite
  `TASK-025-T3-FT-001-W11` was `done`. `/exe` transitioned only this card to
  `in_progress` after protocol initialization and before the first prospective
  probe.
- Backbone Planning Revision is `2`; the current FT-001 review is `APPROVE`
  with exact `REVIEWED_PLANNING_REVISION: 2`.
- No hard `write_boundary` applies. The card's forbidden TASK-025/026 card,
  protocol, and task-artifact paths were not touched.
- Existing dirty `deployment.md` already has compatible interactive bootstrap
  instructions and was deliberately preserved rather than claimed as an edit.

## Claim mapping

| Task claim | Required observable outcome | Attempt 1 proof |
| --- | --- | --- |
| FT-001-AC-010 / REQ-001 / REQ-014 | Only an empty database gets exactly one Admin plus credential in one transaction; email is normalized/unique; stored credential is random-salt Node `scrypt`, not plaintext; hidden local prompt accepts no password argv/env/output; cancellation/non-empty/derivation/write failure/rerun leave state unchanged. | Pre-change isolated RED, focused disposable database/CLI-I/O GREEN, then required project gates. |

## RED — before production change

Command:

```text
npm run test -- tests/identity-access/bootstrap-admin.test.ts
```

Result: exit `1`. The isolated assertion expected
`IdentityAccessBoundary.bootstrapFirstAdmin` to be a function and received
`undefined`. This directly observes the missing task-owned public atomic
bootstrap operation; it is neither setup, syntax/import, nor artificial
failure. The source probe is
`tests/identity-access/bootstrap-admin.test.ts` and the exact output is
recorded in `progress.md`.

## GREEN and gates

Focused claim-equivalent probe:

```text
npm run test -- tests/identity-access/bootstrap-admin.test.ts tests/scripts/bootstrap-admin.test.ts
```

Result: exit `0`; 2 files / 13 tests passed. Disposable `:memory:` SQLite and
I/O doubles prove normalized email, database uniqueness, fixed `admin` role,
32-byte per-credential random salt, Node `scrypt` result/no plaintext,
non-empty and invalid-email rejection, credential-write and derivation rollback,
hidden password echo suppression, no secret in output, cancellation, denied
argv, denied second run, and no adapter SQL writes or password environment
input.

Runtime adapter probe:

```text
DATABASE_URL=:memory: npm run bootstrap:admin </dev/null
```

Result: expected exit `1` because stdin/stdout are not a TTY. The loader
successfully starts the CLI; it emits only `Bootstrap failed. No changes were
made.` and no prompt value, password, credential, or database content. The
standard Node experimental-loader warning contains no secret.

Final required local checks:

```text
git diff --check && npm run check && npm run test && npm run build
```

Result: exit `0`. `git diff --check` passed; `svelte-check` reported 0 errors
and 0 warnings; Vitest passed 26 files / 107 tests; Vite production build
passed. The adapter-auto note that no deploy target was detected is normal for
this repository and does not make the build fail. No container build is a task
requirement, so none was run.

## Actual change surface and scope

- `src/lib/server/platform/database.ts` — credential table with a database
  unique normalized-email column and account foreign key.
- `src/lib/server/modules/identity-access/public.ts` — public owner operation
  with Node crypto and one database transaction.
- `scripts/bootstrap-admin.mjs` — local prompt adapter only; no direct table
  write and no provider/browser code.
- `scripts/bootstrap-admin-loader.mjs` — execution-only resolution/transpile
  loader using existing `typescript`; no new dependency.
- `package.json` — `bootstrap:admin` command.
- `tests/identity-access/bootstrap-admin.test.ts` and
  `tests/scripts/bootstrap-admin.test.ts` — task-owned focused proof.
- `.memory-bank/tasks/TASK-029-T3-FT-001-W13.task.json` — allowed lifecycle
  transition only, `ready` to `in_progress`.
- `.protocols/TASK-029-T3-FT-001-W13/` and this directory — required T3
  evidence/bookkeeping.

No TASK-025/026 artifact was modified. No TASK-030 login/session route, provider
adapter, center, membership, registration, recovery/reset, or new package was
added. `deployment.md` is a pre-existing dirty compatible document and was not
modified by this attempt.

## Issues corrected

1. Focused proof initially had a test object-path typo; corrected before GREEN.
2. This Node binary advertises type stripping but was compiled without it
   (`ERR_NO_TYPESCRIPT`); the CLI now uses a local loader based on the existing
   TypeScript package, with no dependency change.
3. `svelte-check` found the new JavaScript adapter's extension/type-inference
   issues; the loader resolves extensionless TypeScript imports and the adapter
   now has checked JSDoc boundaries. Final required gates pass.

## Reuse and handoff

No result is proposed for verifier reuse: the required full gates read a dirty
worktree with pre-existing changes outside this task, so the input surface is
not safely bounded. This is executor supporting evidence only. Next owner:
`/verify TASK-029-T3-FT-001-W13`.
