---
description: Требования (REQ-IDs) + traceability matrix (RTM).
status: draft
---
# Requirements

## Status model
- Document `status`: `draft|active|deprecated|archived`
- RTM `Lifecycle`: `planned|implemented|verified`

## REQ list
### REQ-000 — Executable Foundation Baseline
- Before product features execute, the repository provides one runnable SvelteKit
  server with one composition root, one shared transactional database path, a
  minimal authenticated public-boundary path, project-native check/build/test
  commands, an isolated schema/fixture roundtrip, and an atomic failure probe
  that leaves no partial binding or transaction state. (Foundation Dev Path)

- **REQ-001 — Account binding and provider access:** MVP
  supports browser email/password authentication for password-credential
  accounts and retains Telegram Login and Google OAuth. The locally bootstrapped
  first Admin can enter the protected Admin surface without membership, while
  invited center-created roles and memberships remain bound through one-time
  provider invitations. No user-selected role is allowed, one external identity
  cannot bind to multiple accounts, and password credentials use normalized
  unique email plus salted `scrypt` verification without stored plaintext.
  (PRD FR-AUTH-001..010)
- **REQ-002 — Provider failure safety:** expired, revoked, reused, duplicate, or
  failed provider binding attempts reject without creating an account, changing
  role/membership, or creating a partial binding. (PRD Integrations; Edge Cases)
- **REQ-003 — Center and class administration:** Bootstrap Admin creates the
  first center from the browser, then manages teachers, classes, students,
  parents, and links inside that center; a class is individual or group. (PRD
  FR-ORG-001..002, FR-ORG-006)
- **REQ-004 — Lesson scheduling lifecycle:** Recurring schedules create planned
  lessons; one lesson may be added, moved, or cancelled without mutating other
  repetitions, and moving preserves lesson identity and context. The browser
  schedule form retains its unfinished date/weekday draft only for the same
  center and class until successful creation. A valid date range and weekday
  selection that yields zero occurrences MUST be rejected by the
  Center & Scheduling owner before Schedule or Lesson persistence/mutation,
  leaving state unchanged for both an own-center Admin and an assigned Teacher.
  The existing Admin adapter maps that rejection to `400
  { error: "invalid_schedule" }`; an assigned Teacher has no schedule HTTP
  adapter in the current scope, so the private owner/domain rejection remains
  internal and no new Teacher transport is introduced.
  (PRD FR-ORG-003..005; explicit operator requirements 2026-08-14)
- **REQ-005 — Elastic calendar navigation:** Each week uses an elastic row with
  lesson days wider than non-lesson days; the date picker reaches the selected
  date, shared/personal calendars use one temporal basis, and visual state is
  not conveyed by color alone. (PRD FR-CAL-001..005; NFR-UX-001..002)
- **REQ-006 — Shared and personal lesson context:** A shared day contains lesson
  topic, practical work, and homework; a personal day reuses shared material
  while isolating student-specific grades, discussions, and financial data.
  (PRD FR-DAY-001..005; AC-DAY-001)
- **REQ-007 — Field collaboration and reactions:** Authorized participants can
  edit one account-owned comment per field with author/time attribution and use
  five standard reactions on fields, comments, and messages while seeing
  reactors. (PRD FR-DAY-003..004; FR-COM-001..002)
- **REQ-008 — Threaded day chat:** Day chat supports arbitrary-depth replies;
  a root becomes a tab after its first reply, at most ten recently active
  branches are shown, hidden branches retain messages, and the common tab shows
  all accessible messages. (PRD FR-COM-003..007)
- **REQ-009 — Homework and grades:** A student can mark homework complete;
  teachers grade on `α`, `β`, `γ`, `F`; completion is class-visible while grades
  are restricted to the corresponding family, assigned teacher, and admin.
  (PRD FR-EDU-001..003)
- **REQ-010 — Attendance and charge eligibility:** MVP attendance is `present` or
  `absent`; an absent student in either individual or group lesson is not charged,
  and correcting `absent` to `present` creates the historical-price charge,
  recalculates the balance, and records an audit entry. (PRD FR-EDU-004..006)
- **REQ-011 — Historical lesson pricing:** Class lesson price, default payment
  amount, and student-specific price override are supported; the applied lesson
  price is fixed in its charge and settings changes affect only future charges.
  (PRD FR-FIN-001..003)
- **REQ-012 — Deterministic monetary ledger:** A payment stores student, amount,
  and factual date; allocation closes oldest uncovered charges first, preserves
  partial remainder and advance, marks paid/overdue states, and uses exact
  decimal-safe amounts. (PRD FR-FIN-004..010)
- **REQ-013 — Payment authority and projection:** Admin may create, edit, and
  cancel payments for any student/class in the Admin's own center; an assigned
  teacher may create only for an assigned class and may not edit/cancel. Cross-
  center access is denied. A payment marker may move to the closest previous
  non-lesson day and show factual date without changing the Payment, allocation,
  or balance; all markers remain discoverable. (PRD FR-FIN-011..015)
- **REQ-014 — Role and context privacy:** Every server-side read/change checks
  role and center/class/student membership; students and parents cannot receive
  another student's private data; assigned teachers get full class history only
  while assigned. (PRD NFR-PRIV-001..004)
- **REQ-015 — Financial correctness:** The same lesson, attendance, price, and
  payment sequence always yields the same balance/allocation; before real data,
  full, partial, excess payment, attendance correction, and historical-price
  cases are checked. (PRD NFR-FIN-001..002; Constitution)
- **REQ-016 — Product quality and acceptance:** The MVP requires build/smoke,
  integrated functional, privacy/access, and financial-correctness checks, then
  explicit operator acceptance or returned corrections. (PRD NFR-QA-001..003)

## Out of scope
- Полноценная школьная информационная система, школьная иерархия и
  государственная отчётность.
- Оплата количеством уроков и ручное распределение каждого платежа как
  основной сценарий.
- Финансовая цветовая кодировка общего календаря и классическая
  семиколоночная сетка как основной интерфейс.
- Публичные персональные оценки всему классу и самостоятельный выбор роли при
  входе.

## Traceability (RTM)
| REQ | Epic | Feature | Test | Lifecycle |
|---|---|---|---|---|
| REQ-000 | Foundation | FT-000 | test:foundation-baseline;test:foundation-smoke | planned |
| REQ-001 | EP-001 | FT-001 | test:FT-001-AC-001..011 | verified |
| REQ-002 | EP-001 | FT-001 | test:FT-001-AC-003..008 | verified |
| REQ-003 | EP-001 | FT-002 | test:FT-002-AC-001..002 | verified |
| REQ-004 | EP-001 | FT-002 | test:FT-002-AC-003..004;FT-002-AC-008..009 | verified |
| REQ-005 | EP-002 | FT-003 | test:FT-003-AC-001..004 | verified |
| REQ-006 | EP-002, EP-003 | FT-003, FT-004 | test:FT-003-AC-003..006;FT-004-AC-001;FT-004-AC-005 | verified |
| REQ-007 | EP-003 | FT-004 | test:FT-004-AC-001..002 | verified |
| REQ-008 | EP-003 | FT-004 | test:FT-004-AC-003..004 | verified |
| REQ-009 | EP-004 | FT-005 | test:FT-005-AC-001..002 | verified |
| REQ-010 | EP-004, EP-005 | FT-005, FT-006 | test:FT-005-AC-003..004;FT-006-AC-004 | verified |
| REQ-011 | EP-005 | FT-006 | test:FT-006-AC-001 | verified |
| REQ-012 | EP-005 | FT-006 | test:FT-006-AC-002..004;FT-006-AC-007 | verified |
| REQ-013 | EP-005 | FT-006 | test:FT-006-AC-005..006 | verified |
| REQ-014 | EP-001, EP-002, EP-003, EP-004, EP-005 | FT-001, FT-002, FT-003, FT-004, FT-005, FT-006 | test:FT-001-AC-001;FT-001-AC-005..008;FT-002-AC-001;FT-002-AC-005..006;FT-003-AC-006;FT-004-AC-005;FT-005-AC-002;FT-006-AC-005 | verified |
| REQ-015 | EP-004, EP-005 | FT-005, FT-006 | test:FT-005-AC-003..004;FT-006-AC-002..004;FT-006-AC-007 | verified |
| REQ-016 | EP-002, EP-005 | FT-003, FT-006 | test:FT-003-AC-001;FT-006-AC-002..006 | verified |

## W10 task evidence route

`TASK-022-T3-FT-001-W10` provides current supporting evidence for the
REQ-001/REQ-002/REQ-014 portions of browser-bound callback transport under
FT-001-AC-006 and FT-001-AC-007. The authoritative task card is `done` with
independent `VERDICT: PASS` and per-task `SEMANTIC_VERDICT: semantic-pass`;
the RTM lifecycle for REQ-001 and REQ-002 is `verified`; shared REQ-014
remains `planned`.

- [TASK-022 card](tasks/TASK-022-T3-FT-001-W10.task.json)
- [functional evidence](../.tasks/TASK-022-T3-FT-001-W10/TASK-022-T3-FT-001-W10-S-VERIFY-final-report-docs-01.md)
- [semantic evidence](../.tasks/TASK-022-T3-FT-001-W10/TASK-022-T3-FT-001-W10-S-RED-VERIFY-final-report-docs-01.md)
- [sync evidence](../.tasks/TASK-022-T3-FT-001-W10/TASK-022-T3-FT-001-W10-S-MB-SYNC-final-report-docs-01.md)

`TASK-023-T3-FT-001-W10` provides current supporting evidence for the
REQ-001/REQ-002/REQ-014 portions of bounded auth-state retention and failed
provider-start cleanup under FT-001-AC-004 and FT-001-AC-007. The authoritative
task card is `done` with independent `PASS` and per-task
`semantic-pass`; the RTM lifecycle for REQ-001 and REQ-002 is `verified`, while
shared REQ-014 remains `planned`.

- [TASK-023 card](tasks/TASK-023-T3-FT-001-W10.task.json)
- [functional evidence](../.tasks/TASK-023-T3-FT-001-W10/TASK-023-T3-FT-001-W10-S-VERIFY-final-report-docs-01.md)
- [semantic evidence](../.tasks/TASK-023-T3-FT-001-W10/TASK-023-T3-FT-001-W10-S-RED-VERIFY-final-report-docs-01.md)
- [sync evidence](../.tasks/TASK-023-T3-FT-001-W10/TASK-023-T3-FT-001-W10-S-MB-SYNC-final-report-docs-01.md)

`TASK-024-T3-FT-001-W10` provides current supporting evidence for the
REQ-001/REQ-002/REQ-014 composition/platform wiring portions of browser/API
provider access under FT-001-AC-006 and FT-001-AC-007. The authoritative task
card is `done` with independent `PASS` and per-task `semantic-pass`; the RTM
lifecycle for REQ-001 and REQ-002 is `verified`, while shared REQ-014 remains
`planned`.

- [TASK-024 card](tasks/TASK-024-T3-FT-001-W10.task.json)
- [functional evidence](../.tasks/TASK-024-T3-FT-001-W10/TASK-024-T3-FT-001-W10-S-VERIFY-final-report-docs-01.md)
- [semantic evidence](../.tasks/TASK-024-T3-FT-001-W10/TASK-024-T3-FT-001-W10-S-RED-VERIFY-final-report-docs-01.md)
- [sync evidence](../.tasks/TASK-024-T3-FT-001-W10/TASK-024-T3-FT-001-W10-S-MB-SYNC-final-report-docs-01.md)

## FT-001 feature-level evidence route — 2026-08-11

The fresh feature-level `/red-verify --feature FT-001` returned
`SEMANTIC_VERDICT: semantic-pass` over AC-001..AC-008. Primary ownership remains
TASK-004 (AC-001/002/004), TASK-015 (AC-003/005), TASK-020 (AC-006/007), and
TASK-021 (AC-008). W10 tasks are supporting only: TASK-022 for AC-006/007
browser binding, TASK-023 for AC-004/007 retention/failure, and TASK-024 for
AC-006/007 composition/platform wiring.

- [feature semantic report](../.tasks/FT-001/FT-001-S-RED-VERIFY-final-report-docs-01.md)
- [feature MB-SYNC report](../.tasks/FT-001/FT-001-S-MB-SYNC-final-report-docs-02.md)

The RTM lifecycle for REQ-001 and REQ-002 is `verified`; shared REQ-014 remains
`planned` because it is mapped to other features outside this decision.
Historical failed TASK-003 evidence remains preserved and is not reused as
current proof.

## FT-001 lifecycle reconciliation — 2026-08-11

The explicit top-level operator decision reconciles the authoritative FT-001
feature document to `status: active` and `lifecycle: verified` after the
terminal queue and already-passed functional, semantic, review, strict-doctor,
and W10 technical-debt gates. REQ-001 and REQ-002 now route to RTM
`Lifecycle: verified`; shared REQ-014 remains `planned` until its other feature
mappings are verified. No acceptance criteria, canonical spec, task status,
dependency, tier, or historical failure record changed.

- [FT-001 feature document](features/FT-001-authentication-and-binding.md)
- [feature semantic evidence](../.tasks/FT-001/FT-001-S-RED-VERIFY-final-report-docs-01.md)
- [feature reconciliation evidence](../.tasks/FT-001/FT-001-S-MB-SYNC-final-report-docs-02.md)

## FT-001 W13 email/password reconciliation — 2026-08-13

The operator-added email/password first-Admin scope introduced FT-001-AC-010/011
behavior. TASK-029 now independently verifies AC-010, but REQ-001 remains
`planned` until planned TASK-030 independently verifies AC-011. Historical
AC-001..009 evidence and every completed task remain preserved; REQ-002 and
shared REQ-014 are not reopened by this password-only scope.

`TASK-029-T3-FT-001-W13` provides current task-owned evidence for the
REQ-001/REQ-014 portions of local first-Admin password-credential bootstrap
under FT-001-AC-010. The authoritative card is `done` with independent
`VERDICT: PASS` and per-task `SEMANTIC_VERDICT: semantic-pass`; REQ-001 remains
`planned` for AC-011 and shared REQ-014 remains `verified`.

- [TASK-029 card](tasks/TASK-029-T3-FT-001-W13.task.json)
- [functional evidence](../.tasks/TASK-029-T3-FT-001-W13/TASK-029-T3-FT-001-W13-S-VERIFY-final-report-docs-01.md)
- [semantic evidence](../.tasks/TASK-029-T3-FT-001-W13/TASK-029-T3-FT-001-W13-S-RED-VERIFY-final-report-docs-01.md)
- [sync evidence](../.tasks/TASK-029-T3-FT-001-W13/TASK-029-T3-FT-001-W13-S-MB-SYNC-final-report-docs-01.md)

## FT-001 W14 password-login reconciliation — 2026-08-13

At that W14 task boundary, `TASK-030-T3-FT-001-W14` was `done` with independent functional `PASS` and
required T3 `semantic-pass` for FT-001-AC-011 / REQ-001 / REQ-014. Together
with the preserved task evidence for AC-001..AC-010, REQ-001 moved to
`implemented`. It was not yet `verified` at that boundary because the then-
current feature-level aggregate covered only AC-001..AC-008. Shared REQ-014
remained `verified`.

- [TASK-030 card](tasks/TASK-030-T3-FT-001-W14.task.json)
- [functional evidence](../.tasks/TASK-030-T3-FT-001-W14/TASK-030-T3-FT-001-W14-S-VERIFY-final-report-docs-01.md)
- [semantic evidence](../.tasks/TASK-030-T3-FT-001-W14/TASK-030-T3-FT-001-W14-S-RED-VERIFY-final-report-docs-01.md)
- [sync evidence](../.tasks/TASK-030-T3-FT-001-W14/TASK-030-T3-FT-001-W14-S-MB-SYNC-final-report-docs-01.md)

## FT-001 final verification reconciliation — 2026-08-14

The fresh `/red-verify --feature FT-001` returned
`SEMANTIC_VERDICT: semantic-pass` across AC-001..AC-011, and the explicit
top-level lifecycle owner closed FT-001 as `verified`. REQ-001 is therefore
`verified` in the RTM. At that historical FT-001 boundary, REQ-002, shared
REQ-014, and EP-001 remained `verified`; the later FT-002 W16 reconciliation
is recorded below. No task status, dependency, or queue state changed in the
FT-001 sync.

- [FT-001 feature](features/FT-001-authentication-and-binding.md)
- [fresh feature semantic evidence](../.tasks/FT-001/FT-001-S-RED-VERIFY-final-report-docs-01.md)
- [final feature sync evidence](../.tasks/FT-001/FT-001-S-MB-SYNC-final-report-docs-03.md)

## FT-002 W16 lifecycle reconciliation — 2026-08-14

The fresh feature-level semantic gate for FT-002 now records
`SEMANTIC_VERDICT: semantic-pass` across AC-001..AC-009. The explicit lifecycle
owner therefore reconciles FT-002 and REQ-004 to `verified`; EP-001 is also
`lifecycle: verified` because its FT-001 and FT-002 feature outcomes and
REQ-001..REQ-004/REQ-014 mappings are verified. All completed task identities,
dependencies, and historical evidence remain unchanged.

## FT-002 W16 task evidence route — 2026-08-14

`TASK-032-T2-FT-002-W16` is now `done` with current Attempt 2 functional
`PASS` for REQ-004 / FT-002-AC-009. The evidence proves owner-boundary
zero-occurrence rejection and exact Schedule/Lesson state equality for an
own-center Admin and an assigned Teacher; only the existing Admin adapter maps
to HTTP 400 `invalid_schedule`, while the Teacher remains private
`invalid-schedule-occurrences` sentinel-only. The RTM lifecycle for REQ-004 is
now `verified` after the fresh FT-002 feature-level aggregate semantic gate.

- [TASK-032 card](tasks/TASK-032-T2-FT-002-W16.task.json)
- [functional evidence](../.tasks/TASK-032-T2-FT-002-W16/TASK-032-T2-FT-002-W16-S-VERIFY-final-report-docs-01.md)
- [sync evidence](../.tasks/TASK-032-T2-FT-002-W16/TASK-032-T2-FT-002-W16-S-MB-SYNC-final-report-docs-01.md)
- [feature semantic evidence](../.tasks/FT-002/FT-002-S-RED-VERIFY-final-report-docs-01.md)
