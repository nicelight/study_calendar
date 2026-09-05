---
description: Current Attempt 2 adversarial semantic verification for TASK-105-T3-FT-005-W37.
status: final
---
# Red Verification — TASK-105-T3-FT-005-W37 — Attempt 2

## Semantic target
- Current attempt: Attempt 2, following the retained Attempt 1 semantic
  correction basis.
- Task/feature outcome: защищённый `/lesson-context` должен серверно отдавать
  provider-owned homework/completion projection и named create/complete/grade
  actions, сохраняя class-visible completion и private grades.
- Accepted contract and boundaries: `REQ-009`, `REQ-014`, `FT-005-AC-001`,
  `FT-005-AC-002`; Learning Progress owns selection and writes, Lesson Context
  only composes/adapts, `/api/lesson-context` остаётся GET-only; Planning
  Revision `2`, `T3`, `W37`, зависимости `TASK-018` и `TASK-042`.

## Evidence and adversarial coverage
- Current functional evidence is the fresh Attempt 2 `VERDICT: PASS` in
  `.protocols/TASK-105-T3-FT-005-W37/verification.md`; lifecycle remains
  `in_progress`.
- The actual W37 implementation and task-local artifacts were inspected within
  the hard boundary, with unrelated FT-006 changes preserved. Planning
  Revision `2`, T3 identity, dependencies, and the GET-only API boundary
  remain unchanged.
- The current verifier-owned disposable probe and focused route/provider suites
  cover provider selection, server-generated IDs, repeat-create/complete,
  Student A completion visible to Student B through Lesson Context, grade-free
  shared completion, personal Student/linked-Parent grade access, private
  target denial, accepted grades, invalid/forged/wrong-role/unassigned/
  cross-class/cross-center denials, ambiguity fail-closed behavior, and
  state-before/state-after equality.
- Source review confirms the corrected completion path delegates to the
  existing authorized class-view query, whose join is constrained by the
  selected homework and class. Grade projection remains a separate query
  filtered by the actor-resolved student scope. Lesson Context only adapts
  provider results; it does not select IDs from browser input or write tables.
- The focused suites passed `7/7`; the current verifier-owned Attempt 2 probe
  passed `1/1`. The task's fresh functional report records passing check,
  build, isolated full test, and diff gates plus disposable teardown.
- Two fresh `Codex Luna`/`xhigh` co-review launches were attempted for the
  required authorization/data-isolation and boundary/persistence focuses. They
  produced no usable output during the bounded review window and were not used
  as evidence; the verdict rests on the independent source review and runtime
  evidence above.

## Admitted findings

- none

## Operator questions

- none

## Verdict
SEMANTIC_VERDICT: semantic-pass

## Owner handoff
- Evidence/report paths: this protocol, the current functional protocol/report,
  `.tasks/TASK-105-T3-FT-005-W37/verifier-owned-attempt-2.md`, the focused
  route/provider tests, and
  `.tasks/TASK-105-T3-FT-005-W37/TASK-105-T3-FT-005-W37-S-RED-VERIFY-final-report-docs-02.md`.
- Recommended owner action: record the current T3 semantic gate result and
  evaluate normal lifecycle closure using the existing functional PASS. The
  task remains `in_progress` pending its lifecycle owner; no promotion,
  `/mb-sync`, Judge, or TASK-106 execution was performed here.
- Resume route: `n/a`. No semantic repair or operator decision is required.
