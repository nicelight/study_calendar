---
description: Independent functional verification for TASK-080-T3-FT-007-W29.
status: active
---
# TASK-080-T3-FT-007-W29 — `/verify`

## Scope and governing basis

- Role: `Reviewer`; tier: `T3`; task lifecycle observed and preserved as
  `in_progress`.
- Owned outcome only: `FT-007-AC-002 / REQ-014 / REQ-017` — role- and
  scope-oriented `/home` and `/classes` destinations.
- Normative basis read: the indexed TASK-080 card; FT-007-AC-002;
  `REQ-014`/`REQ-017`; Access Control `#authority-and-scope`; Boundary Map
  `#actor-context-boundary` and `#calendar-and-membership-query-boundary`;
  Testing Strategy `#disposable-browser-proof`; and applicable T3 sections of
  tier policy.

## Executor claim path and preserved history

- Attempt 1 RED/GREEN and the prior independent functional PASS were read as
  supporting evidence only.
- The preserved T3 semantic-fail independently proved that the original route
  over-denied bare Student/Parent canonical links. The preserved Judge
  `REDIRECT` with `owning_layer_drift` routed the accepted C&S provider-owned
  list reconciliation. These historical artifacts were not relabeled.
- Attempt 2 RED/GREEN, context, plan, progress, handoff, and execution
  evidence were read. No execute receipt was reused; no executor PASS was
  treated as independent proof.

## Fresh verifier-owned proof

The complete evidence is recorded in
[verifier-attempt-2-functional-probe.md](../../.tasks/TASK-080-T3-FT-007-W29/verifier-attempt-2-functional-probe.md),
with the executable probe at
[verifier-attempt-2-functional-probe.test.ts](../../.tasks/TASK-080-T3-FT-007-W29/verifier-attempt-2-functional-probe.test.ts).

The fresh in-memory probe passed `1 file / 6 tests` and covered the complete
task-owned harm-driving claim set:

1. C&S server-resolved accessible-class enumeration returns both authorized
   Student/Parent classes, only C&S-owned class facts, and no mutation.
2. Bare `/home` and `/classes` enumerate all authorized Student/Parent
   destinations; `classId` only filters that already-authorized list and cannot
   broaden it.
3. Admin own-center and Teacher assigned-class destinations remain bounded.
4. Anonymous, revoked, empty-scope, cross-center, cross-class, non-member, and
   removed-assignment requests fail closed on both routes.
5. Routes use request-local actor and public C&S boundaries, do not bypass
   provider tables, remain read-only adapters, and preserve existing calendar,
   class-entry, and Admin destination owners.

The current focused provider/route tests and owned disposable browser test were
also rerun independently: provider `1/1`, route `13/13`, Playwright `1/1`.
The disposable runner removed the exact `tmp/ft-007-home-classes.db` target and
all SQLite sidecars; a post-run filesystem check confirmed all four absent.

## Required gates

All required task gates passed in this verifier run:

- `npm run check`: `0` errors / `0` warnings.
- `npm run test`: `62` files / `204` tests.
- `npm run build`: exit `0`; only the existing adapter-auto advisory.
- `git diff --check`: exit `0`; the two new untracked verifier artifacts also
  had clean no-index whitespace checks.
- `node scripts/mb-lint.mjs`: exit `0`; existing advisory metadata warnings.
- `node scripts/mb-doctor.mjs --strict`: exit `0`; `0` errors / `0` warnings /
  `2` info.

## Isolation and prohibited changes

- Functional probes used only `:memory:` databases; browser proof used only the
  declared disposable `tmp/*.db` target.
- The verifier wrote only this `verification.md` and the two substantive
  verifier artifacts under the TASK-080 locations. Implementation, specs, task
  card, lifecycle, checkpoint, and AUTONOMOUS-RUN files were not edited.
- No `/red-verify`, `/mb-sync`, `/debug`, scheduler closure, promotion, or
  status transition was run.

VERDICT: PASS
