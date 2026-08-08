---
description: Execution evidence for TASK-003-T3-FT-001-W2.
status: active
---
# Execution Evidence — TASK-003-T3-FT-001-W2

## Attempt 1 — honest pre-implementation RED

Claim: `FT-001-AC-003` and the task evidence contract for expired, revoked,
reused, and duplicate identity rejection with unchanged persisted state.

Command:

```text
npm exec vitest run tests/identity-access/task-003.test.ts
```

Working directory: `/home/serg/Projects/study_calendar`

Result: exit code `1`; 1 test file, 6 tests failed. The failures are
claim-specific missing production behavior: `root.identityAccess.provisionAccount
is not a function` in the valid provisioning, atomic provisioning, expired,
revoked, reused, and duplicate-identity scenarios. Vitest loaded and executed
the real task probe, so this is not a setup/import/syntax failure. The current
implementation has no provisioning API or expiry/revocation path required by
the selected boundary.

The probe is intentionally retained as the claim-equivalent task test. It uses
fresh in-memory SQLite per test and closes each database in `afterEach`; no
credentials, network, production database, or external side effect was used.

## Current change surface

- `src/lib/server/modules/identity-access/public.ts` — production behavior to implement.
- `src/lib/server/platform/database.ts` — invitation expiry persistence to implement.
- `tests/identity-access/task-003.test.ts` — claim-specific RED/GREEN integration probe.
- `.memory-bank/tasks/TASK-003-T3-FT-001-W2.task.json` — required `ready -> in_progress` lifecycle transition.
- `.protocols/TASK-003-T3-FT-001-W2/` and this evidence directory — `/exe` bookkeeping.

Forbidden task-card scope was not touched.

## Attempt 1 — claim-equivalent GREEN

Targeted command:

```text
npm exec vitest run tests/identity-access/task-003.test.ts
```

Working directory: `/home/serg/Projects/study_calendar`

Result: exit code `0`; 1 test file and 6 tests passed. The valid path retained
the pre-created `student` role and Center & Scheduling membership. Expired and
revoked invitations, a consumed invitation, and a duplicate provider identity
all raised the expected rejection and left the account/role/membership,
invitation, and identity snapshot equal before/after. Duplicate invitation
provisioning also left the second account absent after rollback.

## Required project-native gates

- `npm run check` → exit `0`; `svelte-check found 0 errors and 0 warnings`.
- `npm run build` → exit `0`; Vite client and SSR bundles built. The existing
  informational `adapter-auto` production-platform note was emitted; it did not
  fail the gate and is outside this task's scope.
- `npm run test` → exit `0`; 2 test files and 10 tests passed.
- `git diff --check` → exit `0`; no whitespace errors reported.

The full gate input surface is the current dirty/untracked workspace, so no
execute result is offered as a reusable receipt candidate for independent T3
verification.

## Actual implementation change surface

- `src/lib/server/modules/identity-access/public.ts`
- `src/lib/server/platform/database.ts`
- `tests/identity-access/task-003.test.ts`
- `.memory-bank/tasks/TASK-003-T3-FT-001-W2.task.json` (only `ready -> in_progress`)
- `.protocols/TASK-003-T3-FT-001-W2/{context,plan,progress,verification,handoff}.md`
- `.tasks/TASK-003-T3-FT-001-W2/execution-evidence.md`

Advisory `touched_files` deviation: `src/routes/` was not changed because the
selected outcome is implemented and proved through the Identity & Access public
boundary; no route behavior or HTTP contract is required by AC-003. No
forbidden task-card path was touched.

## Boundary and isolation evidence

- Identity & Access writes only accounts, roles, invitations, and external
  identities in this change; Center & Scheduling membership is only read by the
  test snapshot and remains its owner's write surface.
- Binding consumes an invitation and inserts an external identity in one
  explicit SQLite transaction; duplicate identity failure rolls both changes
  back.
- Each task test uses a fresh `:memory:` database and closes it in `afterEach`;
  no credentials, network, production database, or external side effect was
  used.

## Attempt 2 — bounded retry 1 correction and claim-equivalent GREEN

Retry correction basis: `.tasks/TASK-003-T3-FT-001-W2/TASK-003-T3-FT-001-W2-S-RED-VERIFY-final-report-docs-01.md`.
The prior semantic-fail claim was that `provisionAccount` accepted caller-
supplied account/role data without a server-resolved actor/session or
own-center Admin authorization. Attempt 1 remains supporting-only for this
claim; its claim-specific RED and GREEN were not rewritten or backfilled.

Claim: `FT-001-AC-003`, including the accepted security constraint that account
and invitation provisioning is available only through a server-resolved own-
center Admin operation, while expired, revoked, reused, and duplicate identity
rejection remains atomic.

Production correction:

- Center & Scheduling resolves the session through Identity & Access, checks
  current center membership and `admin` role, and only then invokes the
  provisioning boundary.
- Identity & Access re-resolves and matches the supplied server authorization
  actor/session before its explicit account+invitation transaction.
- Center & Scheduling membership is still created by its own `grantMembership`
  command; Identity & Access writes no membership rows.

Claim-equivalent command:

```text
npm exec vitest run tests/identity-access/task-003.test.ts
```

Working directory: `/home/serg/Projects/study_calendar`

Result: exit code `0`; 1 test file and 7 tests passed. The fresh probe proves
missing session, non-Admin same-center, and Admin cross-center provisioning
are rejected with account/invitation state unchanged; an own-center Admin
session provisions successfully. It also re-proves valid role/membership
retention, atomic duplicate-invitation rollback, expired/revoked/reused
invitation rejection, and duplicate-provider rejection with state snapshots.

The first retry invocation exited `1` because two fixture assertions were
incorrectly seeded; it is recorded only in the session papercut log and is not
treated as claim RED. The passing probe uses a fresh in-memory SQLite database
per test, closes each database in `afterEach`, and has no credentials, network,
production database, or external side effect.

## Retry 1 actual change surface

- `src/lib/server/modules/identity-access/public.ts`
- `src/lib/server/modules/center-scheduling/public.ts`
- `src/lib/server/composition-root.ts`
- `tests/identity-access/task-003.test.ts`
- `.memory-bank/tasks/plans/IMPL-FT-001.md`
- `.protocols/TASK-003-T3-FT-001-W2/{context,progress,handoff}.md`
- `.tasks/TASK-003-T3-FT-001-W2/execution-evidence.md`
- `PAPERCUTS/GPT-5 __ 08-08-2026 11.42.md`

No forbidden task-card scope was touched. The advisory `src/routes/` hint was
not changed because the accepted request/session adapter already resolves the
actor and the correction is implemented at the Center & Scheduling to Identity
& Access public boundary; no route or HTTP contract is required by AC-003.

## Attempt 2 required project-native gates

- `npm run check` → exit `0`; `svelte-check found 0 errors and 0 warnings`.
- `npm run build` → exit `0`; client and SSR bundles built. The existing
  informational `adapter-auto` production-platform note was emitted; it did
  not fail the gate and is outside this task's scope.
- `npm run test` → exit `0`; 2 test files and 11 tests passed.
- `git diff --check` → exit `0`; no whitespace errors reported.

The full gate input surface is the current dirty/untracked workspace, so no
Attempt 2 execute result is offered as a reusable receipt candidate for
independent T3 verification.

## Attempt 2 boundary and ownership evidence

- The server session is resolved by `IdentityAccessBoundary.resolveActor` from
  the supplied session token; Center & Scheduling then checks current
  membership and the resolved `admin` role before invoking provisioning.
- Identity & Access re-resolves and matches the server authorization actor,
  and its explicit transaction remains the only account+invitation write path.
- Center & Scheduling remains the only owner of `center_memberships`; the task
  test creates the provisioned account's membership through
  `grantMembership`, after provisioning.
- No route, hook, composition-root direct persistence, or forbidden task-card
  write was introduced. Composition root changes are wiring only.
- All tests use fresh disposable in-memory SQLite databases and close them in
  `afterEach`; no credentials, network, production database, or external side
  effect was used.

Read-only boundary probe:

```text
node --input-type=module -e "import fs from 'node:fs'; const r=(p)=>fs.readFileSync(p,'utf8'); const i=r('src/lib/server/modules/identity-access/public.ts'); const c=r('src/lib/server/modules/center-scheduling/public.ts'); const root=r('src/lib/server/composition-root.ts'); const adapters=[r('src/hooks.server.ts'),r('src/routes/api/foundation/+server.ts'),root].join('\\n'); if(!c.includes('resolveActor(input.sessionToken)')||!c.includes('getAuthorizedCenterAdminScope')||!i.includes('resolveActor(authorization.sessionToken)')||!i.includes('this.database.transaction(() =>')||!root.includes('new CenterSchedulingBoundary(database, identityAccess)')||/(INSERT INTO|UPDATE [A-Za-z_]+ SET|DELETE FROM|CREATE TABLE)/.test(adapters)) throw new Error('boundary assertion failed'); console.log('boundary-probe: accepted caller path, authorization, transaction, and write ownership assertions passed');"
```

Result: exit code `0`; the accepted caller path, server authorization,
Identity & Access transaction, and no-direct-adapter-write assertions passed.

## Attempt 3 — bounded retry 2 current-claim RED

Retry correction basis:
`.protocols/TASK-003-T3-FT-001-W2/red-verification.md` and
`.tasks/TASK-003-T3-FT-001-W2/TASK-003-T3-FT-001-W2-S-RED-VERIFY-final-report-docs-01.md`.
Attempt 2 is supporting-only and superseded for this direct-boundary
authorization claim.

Claim: the protected exported Identity & Access provisioning command must not
trust caller-supplied center scope; a valid Admin session belonging only to
`center-2` must not claim `center-1` and persist an account/invitation.

The task-owned probe was extended with one direct public-boundary scenario. It
seeds both centers and memberships through their owners, snapshots all relevant
state, resolves the valid `center-2` actor, invokes
`IdentityAccessBoundary.provisionAccount` with caller-claimed `center-1`, and
expects `forbidden` plus unchanged state.

Command:

```text
npm exec vitest run tests/identity-access/task-003.test.ts -t "rejects caller-supplied cross-center scope at the direct Identity and Access boundary"
```

Working directory: `/home/serg/Projects/study_calendar`

Result before production correction: exit code `1`; the focused scenario
failed at `toThrow('forbidden')` because the direct command returned normally.
Vitest executed the real disposable SQLite path, so this is the current HIGH
claim reproducing honestly, not a setup, import, syntax, or artificial failure.
No production file was changed before this RED. The probe uses a fresh
`:memory:` database, closes it in `afterEach`, and uses no credentials, network,
production database, or external side effect.

## Attempt 3 — bounded retry 2 correction and claim-equivalent GREEN

Production correction:

- Composition wiring creates one private authorization channel and passes only
  its issuer to Center & Scheduling and its consumer to Identity & Access. The
  issuer is not exposed on `CompositionRoot`.
- Center & Scheduling resolves the request session, checks current membership
  and `admin` role for the requested center, then issues an opaque one-time
  authorization and calls Identity & Access.
- Identity & Access consumes that exact server-issued authorization before its
  existing account+invitation transaction. A structurally forged direct-call
  object is absent from the private `WeakSet` and is rejected as `forbidden`.
- Identity & Access neither reads nor writes membership state. Center &
  Scheduling remains the membership owner; account/invitation write ownership
  and atomicity remain unchanged.

Focused claim-equivalent command:

```text
npm exec vitest run tests/identity-access/task-003.test.ts -t "rejects caller-supplied cross-center scope at the direct Identity and Access boundary"
```

Result: exit code `0`; the focused direct-boundary regression passed.

Full task-owned command:

```text
npm exec vitest run tests/identity-access/task-003.test.ts
```

Result: exit code `0`; 1 file and 8 tests passed. This preserves the accepted
Center & Scheduling orchestration, own-center success, unauthenticated/non-Admin/
cross-center denial, atomic account+invitation rollback, valid role/membership
retention, and expired/revoked/reused/duplicate identity rejection.

Probe change: after the public authorization became opaque, the direct hostile
payload uses a TypeScript-only cast to reach the runtime command. It remains the
same direct valid-`center-2` actor / claimed-`center-1` attack and therefore is
claim-equivalent. Both commands use disposable in-memory SQLite and no external
state.

## Attempt 3 required gates and boundary evidence

- First `npm run check` → exit `1`; `Object.freeze` widened the private brand
  literal to `boolean`. The local type annotation was corrected with
  `true as const`; this is not RED evidence. Papercut:
  `PAPERCUTS/GPT-5 __ 08-08-2026 12.12.md`.
- Final `npm run check` → exit `0`; `svelte-check found 0 errors and 0 warnings`.
- Final `npm run build` → exit `0`; client and SSR bundles built. The existing
  adapter-auto production-platform note remained informational.
- Final `npm run test` → exit `0`; 2 files and 12 tests passed.
- Final `git diff --check` → exit `0`; no whitespace errors.

Read-only boundary probe command:

```text
node --input-type=module -e "import fs from 'node:fs'; const r=(p)=>fs.readFileSync(p,'utf8'); const i=r('src/lib/server/modules/identity-access/public.ts'); const c=r('src/lib/server/modules/center-scheduling/public.ts'); const root=r('src/lib/server/composition-root.ts'); const adapters=[r('src/hooks.server.ts'),r('src/routes/api/foundation/+server.ts'),root].join('\\n'); const centerCheck=c.indexOf('getAuthorizedCenterAdminScope(actor, input.centerId)'); const issue=c.indexOf('provisioningAuthorizationIssuer.issue'); if(!i.includes('new WeakSet<ProvisioningAuthorization>()')||!i.includes('consumeProvisioningAuthorization(authorization)')||i.includes('center_memberships')||centerCheck<0||issue<centerCheck||!root.includes('createProvisioningAuthorizationChannel()')||!root.includes('provisioningAuthorization.issuer')||/(INSERT INTO|UPDATE [A-Za-z_]+ SET|DELETE FROM|CREATE TABLE)/.test(adapters)) throw new Error('boundary assertion failed'); console.log('boundary-probe: server-issued capability, Center authorization order, Identity validation, and write ownership assertions passed');"
```

Result: exit code `0`; server-issued capability, Center authorization order,
Identity validation, and no adapter/composition business-write assertions
passed. A companion `rg` confirmed `center_memberships` business access remains
inside Center & Scheduling (apart from platform schema creation).

Actual Attempt 3 surface:

- `src/lib/server/modules/identity-access/public.ts`
- `src/lib/server/modules/center-scheduling/public.ts`
- `src/lib/server/composition-root.ts`
- `tests/identity-access/task-003.test.ts`
- `.protocols/TASK-003-T3-FT-001-W2/{context,plan,progress,handoff}.md`
- `.tasks/TASK-003-T3-FT-001-W2/execution-evidence.md`
- `PAPERCUTS/GPT-5 __ 08-08-2026 12.12.md` (mandated session papercut)

No non-empty hard write boundary exists. Forbidden task cards were not touched,
and task status remains `in_progress`. No reusable receipt is offered because
the workspace has broad dirty/untracked inputs and T3 requires fresh
verifier-owned proof.
