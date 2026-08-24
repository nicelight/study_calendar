---
description: Bounded rerun of the FT-007 task-planning review after the accepted registry-cardinality KISS reconciliation at Planning Revision 2.
status: final
---
# Review FT-007 — Navigation and Statistics

VERDICT: APPROVE

REVIEWED_PLANNING_REVISION: 2

ARCHITECTURE_REVIEW: not_required

BLOCKING_FINDINGS: none

## Review mode and checked delta

Это bounded rerun предыдущего FT-007 `APPROVE`. Предыдущий report является
не-authoritative cache; его evidence retained только там, где target, scope и
governing inputs не изменились.

Проверенный delta:

- operator принял и feature-doctor применил три KISS decisions: Student имеет
  одну строку на каждую `student/class` relation; `Teacher.studentCount` считает
  distinct Student accounts по assigned classes; для Teacher viewer коллекция
  Teachers содержит только текущего Teacher;
- [.memory-bank/contracts/statistics-projection.md](../../.memory-bank/contracts/statistics-projection.md:45-82)
  закрепляет эти правила без нового source of truth, provider boundary или
  persistence;
- FT-007 AC-003, implementation plan и protocol decision/plan wording
  синхронизированы, а TASK-096/TASK-097 получили соответствующие proof
  mappings;
- task IDs, tier, wave, dependencies, lifecycle и
  [.memory-bank/tasks/index.json](../../.memory-bank/tasks/index.json) не
  менялись. Review не нормализует текущие `blocked` статусы TASK-096/097/098.

## Retained and refreshed evidence

Retained: Global Backbone `complete` at positive Planning Revision `2`,
Foundation gate `TASK-002-T3-FT-000-W1` `done`, existing AC/REQ identity and
nine-outcome feature closure, unchanged provider ownership and historical task
evidence outside TASK-096/TASK-097, and unchanged task identity/dependency
graph. Refreshed: Statistics Projection contract, FT-007 AC-003, plan,
clarification completion, TASK-096/TASK-097 proof scope, and all design and
execution conclusions that can be affected by the delta.

## 1. Structural integrity — PASS

- [.memory-bank/spec-backbone.md](../../.memory-bank/spec-backbone.md:84-125)
  records `Global Backbone Status: complete` and `Planning Revision: 2`.
- A current read-only Ajv2020/schema and index probe found all 9 indexed FT-007
  cards schema-valid; `.memory-bank/tasks/index.json` resolves 56/56 unique
  cards. Target IDs match their `T3` / `FT-007` / `W27..W31` identity tuples,
  every dependency resolves, and the full dependency graph is acyclic.
- Every FT-007 task is product `W1+`, has concrete REQ linkage, and reaches the
  done Foundation gate. No `PLANNING_RECONCILIATION_REQUIRED` marker is present
  on the feature surface.

## 2. Coverage and slicing — PASS

Current feature headings preserve complete exact ownership:

| Feature AC / REQ | Sole exact owner | Status |
|---|---|---|
| `FT-007-AC-001` / `REQ-017` | `TASK-079-T3-FT-007-W28` | `done` |
| `FT-007-AC-002` / `REQ-014, REQ-017` | `TASK-080-T3-FT-007-W29` | `done` |
| `FT-007-AC-003` / `REQ-014, REQ-017` | `TASK-096-T3-FT-007-W30` | `blocked` |
| `FT-007-AC-004` / `REQ-017` | `TASK-097-T3-FT-007-W31` | `blocked` |
| `FT-007-AC-005` / `REQ-017` | `TASK-090-T3-FT-007-W29` | `done` |
| `FT-007-AC-006` / `REQ-017` | `TASK-089-T3-FT-007-W29` | `done` |
| `FT-007-AC-007` / `REQ-014, REQ-017` | `TASK-098-T3-FT-007-W31` | `blocked` |
| `FT-007-AC-008` / `REQ-014, REQ-017` | `TASK-094-T3-FT-007-W27` | `done` |
| `FT-007-AC-009` / `REQ-014, REQ-017` | `TASK-095-T3-FT-007-W28` | `done` |

The table is grounded by the stable AC headings and closure in
[FT-007](../../.memory-bank/features/FT-007-navigation-and-statistics.md:43-145)
and the current exact `source_artifacts` locators in the nine indexed cards.
The refreshed mapping keeps TASK-096 as the sole AC-003 owner and TASK-097 as
the sole AC-004 owner. TASK-097 consumes the authorized reconciled row shape
for presentation and explicitly does not own or re-prove AC-003 cardinality.

The accepted plan still has nine independent material implementation outcomes.
The new cardinality rules belong to the existing Lesson Context composition
outcome; they do not create a proof-only sibling, duplicate owner, orphan
outcome, or unrelated task. Dependency proof remains with its owning task under
[execution-cohesive-task-boundary](../../.memory-bank/workflows/execute-loop.md:100-110)
and [task claim/dependency ownership](../../.memory-bank/workflows/tier-policy.md:66-88).

## 3. Design readiness — PASS

- FT-007 and its clarification are now `complete`, and the accepted decisions
  are recorded in the feature's current clarification section
  ([feature](../../.memory-bank/features/FT-007-navigation-and-statistics.md:184-202);
  [clarification](../../.protocols/FT-007/clarification.md:216-270)). No
  unresolved operator choice remains for the runnable AC-003/AC-004 surface.
- The Statistics Projection contract gives decisive row cardinality,
  distinctness, viewer scope, relationship teacher-context, denial, and
  read-only rules. Lesson Context remains the composition owner; provider
  formulas and source facts remain owned by TASK-095, TASK-089 and TASK-090.
- Direct feature links and task links resolve to the applicable Access Control,
  Boundary Map, Statistics Projection, Core Domain, architecture, testing and
  workflow contracts. The `/statistics` route remains a transport/presentation
  adapter over accepted server-resolved composition; no execution-time choice
  would legalize a copied topology, direct table read, new graph edge, new
  persistence, migration, or changed authority.
- No material ownership, dependency, invariant, compatibility or proof-path
  question remains that could change the verdict; therefore a separate
  architecture review is not required.

## 4. Execution readiness — PASS

- Current indexed statuses are observed, not changed: TASK-079/080/089/090/094/095
  are `done`; TASK-096/097/098 remain `blocked` under lifecycle ownership.
  The blocked records and historical semantic-concern/disposition entries are
  not fabricated or normalized by this review. The resolved clarification and
  current proof mappings remove the former design blocker; status promotion or
  restoration remains an owner action.
- TASK-096 is a complete T3 handoff for the existing AC-003 composition result:
  its current success outcome, constraints, invariants, verification target and
  claim-linked RED/GREEN evidence cover one relation row per authorized
  student/class, distinct Teacher student count, Teacher-only Teacher rows,
  preserved relationship teacher context, exact provider calls, denial and
  non-mutation ([card](../../.memory-bank/tasks/TASK-096-T3-FT-007-W30.task.json:25-136)).
- TASK-097 remains a separate T3 sorting result. Its proof is limited to typed
  bidirectional sorting and visible direction over TASK-096's authorized
  serializable result; its added cardinality link is a non-reinterpretation
  constraint, not inherited AC-003 proof
  ([card](../../.memory-bank/tasks/TASK-097-T3-FT-007-W31.task.json:20-103)).
- Both changed cards retain concrete REQ/AC locators, non-empty verification
  targets, decisive evidence conditions and artifacts, literal hard write
  boundaries, forbidden scopes, disposable-state constraints and native gates.
  The prospective T3 proof is minimal and claim-equivalent; no inherited,
  unrelated or speculative proof requirement was added.
- Existing `done` evidence is retained under the historical-task exception; no
  fabricated RED/GREEN backfill is requested for historical records.

## Refreshed co-review focuses

Both prior focuses were refreshed because their governing feature/contract/task
inputs changed; neither was retained.

1. **Focus A — acceptance closure, exact claims, ownership and slicing.** The
   required fresh Codex Luna/xhigh launch was attempted and retried once, but
   the current ChatGPT account rejected that model. The equivalent local
   read-only focus independently re-derived the 9/9 sole-owner mapping and
   checked the nine-outcome boundary, no orphan/duplicate/proof-only sibling,
   and no dependency-proof transfer. No candidate finding resulted.
2. **Focus B — design/execution readiness, boundary ownership and T3 proof
   scope.** The required fresh Codex Luna/xhigh launch was attempted and
   retried once with the same result. The equivalent local focus checked the
   accepted contract extension, canonical ownership, unchanged graph/status
   semantics, hard scopes, and TASK-096/TASK-097 proof separation. No candidate
   finding resulted.

No unavailable co-reviewer result was treated as a vote, and no collaborator
artifact was created.

## Verdict and handoff

APPROVE

All four coverage groups pass for the current Planning Revision `2` surface.
This approval covers planning readiness only; it does not promote tasks or
change lifecycle state.

NEXT_ROUTE: Run `/mb-doctor --strict` at the T3 feature/task boundary. Then the
lifecycle owner may restore the applicable TASK-096 route and invoke `/exe`
sequentially with the existing dependencies; TASK-097 and TASK-098 remain
downstream of TASK-096. For scheduler handoff, run strict doctor before the
selected scheduler.

REVIEW_INTEGRITY: Only REQUEST.md and this FT-007 final report were replaced.
No reviewed feature, contract, plan, protocol, task card, task index, code,
evidence, lifecycle, status, tier, wave, dependency, promotion, scheduler or
AUTONOMOUS-RUN artifact was mutated by this review.
