---
description: Independent adversarial semantic verification for TASK-035-T3-FT-002-W19.
status: final
---
# Red Verification — TASK-035-T3-FT-002-W19

## Semantic target

- Task outcome: a protected role-scoped class entry shell returns only matching
  server-authorized class context to Admin, Teacher, Student, and Parent.
- Accepted contract and boundaries: `FT-002-AC-011`, `REQ-003/014`, Access
  Control, Authentication Transport Browser/API Path, Calendar and Membership
  Query Boundary, and the SvelteKit transport/capability separation.

## Evidence and adversarial coverage

- Existing functional verdict: current Attempt 2 `VERDICT: PASS` in
  `.protocols/TASK-035-T3-FT-002-W19/verification.md` and
  `.tasks/TASK-035-T3-FT-002-W19/TASK-035-T3-FT-002-W19-S-VERIFY-RETRY-final-report-docs-02.md`.
- Inspected the current real `load` export, request hook, Identity & Access
  session resolution, Center & Scheduling `getAuthorizedClassScope`, minimized
  page projection, generated production route, task diff surface, focused
  regression, and fresh disposable SSR/HTTP evidence.
- Adversarial coverage traced session revocation and assignment/link removal to
  the next owner-boundary authorization check; compared cookie-resolved scope
  with request Actor Context and path center/class; checked cross-center and
  non-member failure behavior, generic denial bodies, state non-mutation, and
  absence of client-selected role/scope.
- The route exposes no account or student identifiers from
  `AuthorizedClassScope`, performs no persistence, and delegates class authority
  to the existing Center & Scheduling query. The component is presentation-only
  and introduces no `/admin`, Lesson Context/calendar, role-changing, API, or
  downstream capability ownership.
- Selected `/admin`, TASK-032, TASK-034, calendar, and Lesson Context
  regressions passed 36/36; full tests passed 131/131; check/build/diff gates
  passed. The required Codex Luna co-review model was unavailable after both
  prescribed attempts for each focus; no substitute model was used.

## Admitted findings

- none

## Operator questions

- none

## Verdict

SEMANTIC_VERDICT: semantic-pass

## Owner handoff

- Evidence/report paths:
  `.protocols/TASK-035-T3-FT-002-W19/verification.md`,
  `.tasks/TASK-035-T3-FT-002-W19/fresh-verifier-ssr-http-matrix-attempt-2.md`,
  and
  `.tasks/TASK-035-T3-FT-002-W19/TASK-035-T3-FT-002-W19-S-RED-VERIFY-final-report-docs-01.md`.
- Recommended owner action: combine current functional PASS and semantic-pass
  for the explicit lifecycle decision; verifier leaves status unchanged.
- Resume route: n/a.
