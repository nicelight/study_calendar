---
description: Current independent feature-level adversarial semantic verification report for FT-002.
status: final
---
# Red Verify — FT-002

## Accepted semantic target

FT-002 AC-001..AC-011 must compose center-bounded membership and class modes,
stable recurring scheduling and exceptions, assignment-based historical access
and immediate revocation, the protected Admin surface, scoped browser drafts,
strict `dd/mm/yyyy` presentation with ISO transport/storage, and the protected
role-scoped class shell. Existing Admin, valid/zero-occurrence scheduling, and
draft behavior must remain intact. The class shell must expose only
server-authorized class/role context and must not absorb FT-003 calendar or
Lesson Context ownership.

## Evidence and adversarial coverage

- Inspected all seven indexed FT-002 task cards and current verification
  evidence (`TASK-005`, `TASK-006`, `TASK-026`, `TASK-031`, `TASK-032`,
  `TASK-034`, and `TASK-035`), the current implementation/change surface, and
  the direct Architecture, Calendar and Membership, Access Control,
  Authentication Transport, Core Domain, Lifecycle, Testing, and tier-policy
  contracts.
- A fresh Chrome 151 run at `1280x800` against a disposable SQLite/Vite runtime
  confirmed that valid `29/02/2028` and `31/12/2028` inputs satisfy native
  constraints and produce only ISO `2028-02-29` / `2028-12-31` Form Data and
  scoped draft values. Malformed, incomplete, and impossible dates exposed the
  explicit invalid state and no non-ISO transport/storage value. ISO draft
  restoration rendered the matching localized values.
- The same protected browser runtime composed AC-008..AC-010: a valid
  zero-occurrence submission retained the exact ISO draft and showed the
  existing `invalid_schedule` UI result; a valid-occurrence submission created
  the lesson, cleared only the matching draft key, and preserved an unrelated
  key.
- A fresh real SvelteKit SSR/HTTP matrix on the disposable database returned
  matching `200` class/role context for Admin, assigned Teacher, own-class
  Student, and linked Parent. Anonymous and revoked sessions redirected `303`
  to `/login`; path mismatch, cross-center, non-member, unassigned, and removed
  access returned `403` without protected markers. Admin removed the Teacher
  assignment through the supported action before the removed-access probe.
  Ordered database-state digests were identical across all read matrices.
- Source and production-build inspection confirmed a recognized SvelteKit
  `load`, request Actor Context plus Center & Scheduling
  `AuthorizedClassScope`, a minimized serializable projection, and no direct
  database/client-authority path. `/admin/{centerId}` remained present; no
  FT-003 calendar, Lesson Context, Collaboration, Learning Progress, Financial
  Ledger, or persistence source was changed by AC-010/AC-011.
- Fresh composition regressions passed 8 files / 36 tests across AC-001..AC-011,
  Admin, valid and zero-occurrence schedules, strict date presentation, class
  entry authorization, calendar, and Lesson Context preservation. The
  independent TASK-026 owner-boundary probe also passed 3/3. The Admin adapter
  retained its `400` `invalid_schedule` action failure, the assigned Teacher
  retained the private `invalid-schedule-occurrences` sentinel, and both
  zero-occurrence paths remained mutation-free.
- Fresh project gates passed: `npm run check` reported 0 errors and 0 warnings,
  `npm test` passed 30 files / 131 tests, `npm run build` completed with the
  class-route `load` export, and `git diff --check` reported no whitespace
  errors. The required `Codex Luna` co-review model was unavailable after both
  prescribed attempts for each focus; no substitute model was used.

## Owner handoff

No material finding or unresolved operator-owned decision remains. The
explicit lifecycle owner may consume this feature gate and reconcile FT-002,
REQ-003, REQ-004, shared REQ-014, and EP-001 at the owned `/mb-sync` boundary.
This verifier changed no task status, feature lifecycle, dependency,
promotion, implementation, or scheduler state.

SEMANTIC_VERDICT: semantic-pass
