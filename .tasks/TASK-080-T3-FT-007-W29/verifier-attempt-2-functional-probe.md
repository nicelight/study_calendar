---
description: Fresh verifier-owned functional evidence for TASK-080 Attempt 2.
status: active
---
# Fresh functional evidence — TASK-080-T3-FT-007-W29 — Attempt 2

## Run context

- Command: `/verify TASK-080-T3-FT-007-W29`.
- Role: `Reviewer`; tier: `T3`; observed lifecycle: `in_progress`.
- CWD: `/home/serg/Projects/study_calendar`.
- Runtime: Node/Vitest project runtime; the focused probe used only disposable
  SQLite `:memory:` roots.
- No execute receipt was reused. Attempt 2 executor evidence was treated as
  supporting input; all outcome proof below was observed during this verifier
  run.

## Fresh verifier-owned outcome probe

Command:

```text
npm exec vitest -- --run --config .tasks/TASK-080-T3-FT-007-W29/verifier-attempt-2-functional-probe.vitest.config.ts --reporter=verbose
```

Result: exit `0`; `1` file and `6` tests passed.

The probe in
`verifier-attempt-2-functional-probe.test.ts:141-164,166-190,192-216,218-240`
independently observed:

- C&S returns the complete two-class list for both an authorized Student and
  linked Parent, excludes empty Student/Parent scope and unsupported actors,
  returns exactly `{ classId, centerId, name, mode }`, and preserves all
  source tables before/after the read.
- Bare `/home` and `/classes` return both authorized Student/Parent calendar
  destinations. A supplied authorized `classId` produces only a subset of
  that provider result; cross-center, unassigned, and empty-scope targets are
  rejected, so the query cannot broaden scope.
- Admin receives only the own-center destination and Teacher only the assigned
  class on both route adapters.
- Anonymous and revoked requests redirect to `/login`; non-member,
  cross-center, cross-class, and removed-assignment requests fail with `403`
  before destination data is returned. Read snapshots remain equal before and
  after every non-mutating request and after the intentional assignment removal.
- Route source inspection in the same fresh probe confirms request-local
  `event.locals.actor`, public C&S `getAccessibleClassList` / `getRegistryFacts`,
  no `platform/database`, `.sqlite`, or route-owned provider-table access, no
  route-side `getAuthorizedClassScope`, presentation-only page imports, and
  preserved calendar/class destination owners.

The implementation points independently observed are
`src/lib/server/modules/center-scheduling/public.ts:373-416` and
`src/routes/home/destination.server.ts:96-145`.

## Repeated current-state checks

| Check | Result |
|---|---|
| `npm run test -- tests/center-scheduling/ft-007-accessible-class-list.test.ts` | exit `0`; 1 file / 1 test |
| `npm run test -- tests/routes/ft-007-home-classes.test.ts` | exit `0`; 1 file / 13 tests |
| `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-home-classes.db --spec e2e/ft-007-home-classes.spec.ts` | exit `0`; Playwright 1 passed |

The browser run exercised bare `/home` and `/classes` for Admin, Teacher,
Student, and Parent, complete Student/Parent lists, query denial, anonymous and
revoked redirects, cross-scope denial, removed assignment, and database state
equality. Immediately after the runner, `tmp/ft-007-home-classes.db` and its
`-wal`, `-shm`, and `-journal` sidecars were absent.

## Required gates

| Gate | Result |
|---|---|
| `npm run check` | exit `0`; 0 errors / 0 warnings |
| `npm run test` | exit `0`; 62 files / 204 tests |
| `npm run build` | exit `0`; SSR and client build completed; adapter-auto advisory only |
| `git diff --check` | exit `0` |
| `git diff --no-index --check /dev/null <verifier probe>` | no whitespace diagnostics for both new probe artifacts |
| `node scripts/mb-lint.mjs` | exit `0`; existing metadata advisories only |
| `node scripts/mb-doctor.mjs --strict` | exit `0`; 0 errors / 0 warnings / 2 info |

## Historical and scope handling

- Attempt 1 functional PASS, its semantic-fail on bare Student/Parent routes,
  and Judge `REDIRECT` / `owning_layer_drift` history were read as preserved
  supporting context only. Attempt 2 RED/GREEN and handoff were also read but
  did not substitute for this probe.
- The accepted Attempt 2 reconciliation assigns accessible-class enumeration
  to C&S. The current source and fresh behavior match that boundary; no
  feature-wide AC, registry metrics, profile data, persistence, role,
  membership, assignment, or authorization rule was tested as TASK-080-owned
  scope.
- The shared worktree contained pre-existing W27/W28 and other dirty files;
  this verification did not modify or attribute them. Only the task-owned
  verifier protocol and the two substantive verifier probe artifacts were
  written by this run. No implementation, spec, task card, lifecycle,
  checkpoint, or AUTONOMOUS-RUN file was edited.
- The installed `finding-adjudication` pack was loaded. This `/verify` run is
  functional verification rather than a full semantic review; no optional
  nested co-review wait was used.

## Conclusion

Every task-owned AC-002 / REQ-014 / REQ-017 functional claim, architecture
boundary, denial case, non-mutation condition, disposable-isolation condition,
and required gate has fresh reproducible evidence.
