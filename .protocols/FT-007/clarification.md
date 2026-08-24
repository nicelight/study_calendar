---
description: Feature-level clarification and semantic triage for FT-007.
status: active
---
# FT-007 Clarification

- Clarification status: complete
- Clarification questions: 4
- Last clarified: 2026-08-24
- Target feature: `.memory-bank/features/FT-007-navigation-and-statistics.md`

## Pending question — 2026-08-21

### Question

What is the minimum accepted Profile destination for FT-007, and what canonical
SvelteKit route identities should Home, Classes, Statistics, and Profile use?

### Why this changes decomposition

REQ-017 and FT-007-AC-001 require all four named navigation destinations, but
the accepted feature and contracts define neither a working Profile outcome nor
canonical endpoint identities. The current shell task cannot create a Profile
route inside its hard write boundary, while Home, Classes, Statistics, and
sorting cards use broad `src/routes/` boundaries. Task slicing, exact claim
ownership, endpoint verification, and hard runtime scope therefore depend on
the operator answer.

### Recommended bounded answer

Use stable protected top-level routes `/home`, `/classes`, `/statistics`, and
`/profile`. Keep logout on the existing server-owned `POST /auth/logout` path.
Make `/profile` a read-only page over existing Identity & Access actor/profile
facts: `fullName`, `role`, and immutable `registeredAt`; it adds no editing,
password/provider management, membership controls, or new persistence.

### Alternatives and impact

1. Accept the recommended bounded answer. This remains a feature-local
   clarification grounded in REQ-014/REQ-017 and routes directly to
   `/feature-to-tasks FT-007`.
2. Use another explicit set of protected routes or another bounded read-only
   Profile projection. The operator must name the exact paths and fields; then
   rerun `/feature-doctor FT-007` before tasking.
3. Remove or defer Profile. This changes the accepted REQ-017/PRD navigation
   target and must route first to `/write-prd`, not be decided locally.

### Answer

Accepted by the operator on 2026-08-21: use dedicated protected routes
`/home`, `/classes`, `/statistics`, and `/profile`; keep logout on the existing
server-owned `POST /auth/logout` path; make `/profile` read-only over existing
Identity & Access `fullName`, `role`, and immutable `registeredAt`, with no
editing, password/provider management, membership controls, or new persistence.

### Current disposition

- Changed sections: feature frontmatter, Use Cases, Edge / Failure Behavior,
  FT-007-AC-007, Acceptance Closure, SDD Design Gate, and Clarifications.
- Remaining ambiguity: none for feature decomposition.
- Design impact: none
- Behavior spec impact: none
- Immediate repair route: `/feature-to-tasks FT-007` to reconcile the plan,
  exact task ownership, endpoint write boundaries, and proof mapping before a
  fresh `/review-tasks-plan FT-007`.

## TASK-080 semantic triage — 2026-08-22

### Validation status

`complete`.

The HIGH finding is valid and bounded to `FT-007-AC-002 / REQ-014 / REQ-017`:
the protected shell links bare `/home` and `/classes`, while the current route
loader requires a caller-supplied `classId` before it invokes the existing
Center & Scheduling authorization query. An authorized Student/Parent therefore
receives `403 Forbidden` on both canonical links; the same actor succeeds only
on `?classId=...`. This is over-denial of an accepted destination, not an
authorization bypass.

Evidence is preserved and remains task-scoped:

- Fresh functional `VERDICT: PASS`: `.protocols/TASK-080-T3-FT-007-W29/verification.md`
  and `.tasks/TASK-080-T3-FT-007-W29/TASK-080-T3-FT-007-W29-S-VERIFY-final-report-docs-01.md`.
  Its Student/Parent positives are query-qualified and do not prove the bare
  shell links.
- Fresh T3 `SEMANTIC_VERDICT: semantic-fail`: `.protocols/TASK-080-T3-FT-007-W29/red-verification.md`
  and `.tasks/TASK-080-T3-FT-007-W29/TASK-080-T3-FT-007-W29-S-RED-VERIFY-final-report-docs-01.md`.
  The isolated probe observed query-qualified success and bare-route `403` for
  both Student and Parent on both routes.
- Decisive implementation points are `src/routes/+layout.svelte:28-29` and
  `src/routes/home/destination.server.ts:138-143`; the existing C&S method is
  `getAuthorizedClassScope(sessionToken, classId)` at
  `src/lib/server/modules/center-scheduling/public.ts:840-845`.
- Judge `gpt-5.6-sol/xhigh` returned `JUDGE_ASSESSMENT: REDIRECT` with
  `trajectory_signal: owning_layer_drift`: the C&S API cannot enumerate an
  accessible class for a bare route and TASK-080 forbids a new provider/public
  query change. The assessment is preserved in
  `.protocols/AUTONOMOUS-RUN/decision-log.md` and `status.md`; neither file is
  changed by this triage.

### Options and decision basis

1. **Contract-correct minimum — C&S accessible-class list query.** Center &
   Scheduling owns the server-resolved accessible-class
   selection and exposes it through its existing Calendar and Membership Query
   Boundary; `/home` and `/classes` consume that result and render only the
   authorized calendar destinations. This is the minimum repair because the
   boundary already requires the provider to “expose the authorized accessible
   class list”, while routes are transport/presentation adapters. Returning the
   authorized list also avoids inventing an arbitrary first-class choice when a
   principal has more than one accessible class; exact method naming and ordering
   remain implementation-level details for task planning.
2. **Keep the known-`classId` route contract and require `?classId`.** Rejected:
   it leaves the accepted bare canonical shell unusable and contradicts
   `FT-007-AC-002`, `REQ-017`, and the PRD Home/Classes flow.
3. **Let the route enumerate or reconstruct class scope, or broaden the
   center-wide registry query for Student/Parent.** Rejected: it violates the
   Calendar and Membership Query Boundary, the provider write/authorization
   ownership, and the Student/Parent center-wide registry denial.

No operator-owned decision remains about accessible-class selection or public
query ownership. The accepted product and boundary authority already assign
eligibility/list selection to Center & Scheduling; no route-owned DB access,
client-selected authorization, or arbitrary single-class default is contract
valid. No `HALT_*` handoff is required.

### Impact and immediate route

- `Design impact: none` — the accepted boundary already contains the required
  accessible-class list surface; no global design or canonical SDD repair is
  needed.
- `Behavior spec impact: none` — the existing feature behavior and AC already
  require bare canonical Home/Classes access to an authorized Student/Parent
  calendar; no behavior JSON or AC wording changes are accepted.
- `Feature/task planning impact: bounded reconciliation required` — TASK-080's
  current hard boundary cannot own the first provider artifact. Its task scope,
  dependencies, and proof mapping must be reconciled without changing the tier,
  task identity, lifecycle, implementation, or evidence.
- `Immediate existing route: /feature-to-tasks FT-007`, followed by a fresh
  `/review-tasks-plan FT-007` and the normal readiness gates. After an accepted
  plan reconciliation, the caller-owned execution/verification route may rerun
  TASK-080's functional and semantic gates.

At the TASK-080 triage boundary the clarification remained complete and
`clarification_questions` stayed `1`: that triage validated an existing
contract and did not accept a new operator answer or alter any `FT-007-AC-*`
ID. The TASK-096 triage below supersedes only that overall clarification status.

## TASK-096 semantic triage — 2026-08-22

### Validation status and semantic basis

`complete` — the operator accepted all three decisions required to close the
feature-local authority gap.

The current task evidence contains exactly one independent functional
`VERDICT: PASS` and one separate `SEMANTIC_VERDICT: semantic-concern` for
`TASK-096-T3-FT-007-W30`, which remains `in_progress`. The concern is valid and
bounded to `FT-007-AC-003 / REQ-014 / REQ-017`:

- `.memory-bank/analysis/brainstorming/BR-002.md` explicitly left Student
  multi-class rendering and Teacher-registry row selection open;
- `.memory-bank/analysis/product-brief.md`, the PRD, REQ-017, AC-003, and the
  Statistics Projection contract establish fields, formulas, and
  assigned-class scope, but do not resolve row identity, distinctness, or the
  Teacher viewer's co-teacher rows;
- the supported C&S model permits one Student in several classes and several
  Teachers on one class; current composition chooses one Student row per
  membership, sums class membership counts, and returns only the current
  Teacher in the Teachers collection.

Those implementation choices were evidence, not accepted authority at the time
of the finding. The operator's decisions below now settle the row identity,
distinctness, and Teacher-registry scope without changing the product target or
global architecture.

### Operator decision 1 — Student row cardinality

**Exact question:** when one Student belongs to several supported classes,
should Students contain one row per student/class relation, or one row for the
participant with all related classes and Teachers?

1. **One row per student/class relation — recommended and accepted.** The
   existing singular class column and class-scoped attendance/payment calls
   remain exact; the same participant may appear more than once. This is the
   lowest-cost option because it needs feature/contract wording and proof
   reconciliation but no new cross-class metric aggregation.
2. **One row per participant.** Class and Teacher values become lists. The
   scalar attendance and payment columns must then aggregate underlying
   conducted slots and counted allocations across all related classes rather
   than average percentages; this can require provider-contract and
   implementation changes before TASK-096 can be reverified.

### Operator decision 2 — Teacher student count

**Exact question:** for a Teacher assigned to several classes, should
`studentCount` count distinct student accounts or sum class memberships?

1. **Distinct student accounts — recommended and accepted.** A Student shared
   by two assigned classes counts once, matching the column's participant
   wording and avoiding a misleading people count. The existing scoped account
   IDs are sufficient, but composition and tests must change.
2. **Sum class memberships.** A Student in two assigned classes counts twice.
   This preserves the current implementation and is valid only if the accepted
   meaning is enrollment/membership count rather than unique people.

### Operator decision 3 — Teacher registry rows for a Teacher viewer

**Exact question:** should a Teacher's Teachers registry contain only the
current Teacher, or also co-teachers assigned to the returned classes?

1. **Current Teacher only — recommended and accepted.** This preserves the
   current implementation, minimizes profile/aggregate disclosure, and still
   exposes assigned-class co-teacher names where the Student/Class rows require
   them.
2. **Current Teacher plus assigned-class co-teachers.** This provides the full
   class-related Teacher registry, but exposes every listed co-teacher's
   registration date and aggregate row and requires composition/test changes.

### Operator resolution — 2026-08-24

The operator accepted the recommended KISS decisions:

1. Students contain one row for each `student/class` relationship. A Student
   belonging to several classes therefore appears once per relationship, with
   the relationship's class and teacher context; no cross-class metric
   aggregation is introduced by this clarification.
2. Teacher `studentCount` counts distinct Student accounts across the Teacher's
   assigned classes. A Student shared by multiple assigned classes counts once.
3. A Teacher's Teachers registry contains only the current Teacher. Co-teachers
   are not emitted as separate Teacher-registry rows; names needed by permitted
   Student/Class relationship fields remain governed by those row fields.

### Impact, owners, and exact route

- `Design impact: feature_design_stale` — the accepted feature behavior now has
  decisive row/cardinality semantics, but the linked Statistics Projection
  wording and TASK-096 task/plan/proof surface require downstream
  reconciliation. `/feature-doctor` does not edit the canonical contract or
  task artifacts.
- `Behavior spec impact: none` — FT-007 has no linked behavior JSON to refresh.
- Likely consumers are FT-007 AC-003, the Statistics Projection registry/metric
  wording, TASK-096 composition and proof, and TASK-097 sorting over the chosen
  row shape. TASK-098 remains dependency-blocked but gains no new behavior.
- The operator owns the three product-behavior answers. `/feature-doctor
  FT-007` owns applying accepted answers to the feature; `/feature-to-tasks
  FT-007` then owns the leaf canonical contract, task/planning/proof
  reconciliation, followed by a fresh `/review-tasks-plan FT-007`.
- Current evidence remains owned by
  `.protocols/TASK-096-T3-FT-007-W30/{verification,red-verification}.md`.
  After reconciliation, the caller's existing TASK-096 execution/functional/
  semantic evidence owners rerun only the applicable gates.
- **Terminal result:** `complete`.
- **Immediate route:** `/feature-to-tasks FT-007`, followed by a fresh
  `/review-tasks-plan FT-007` after the feature's canonical task surface is
  reconciled.

No task JSON/index, implementation, plan, canonical spec, review, scheduler
status, lifecycle, checkpoint, decision log, or evidence file is changed by
this triage. The feature clarification and this protocol are the only changed
artifacts. Existing `FT-007-AC-*` IDs and REQ links, Planning Revision `2`,
and the current task-plan `APPROVE` are preserved.
