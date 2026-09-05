---
description: Feature-level independent semantic verification report for FT-005.
status: final
---
# FT-005 — feature-level red verification

## Принятый результат и проверенная база

Проверен полный outcome FT-005: homework completion виден в разрешённом
class context; grade использует только `α`, `β`, `γ`, `F` и остаётся personal;
attendance для individual/group lessons определяет charge eligibility,
correction `absent -> present` остаётся исторической, атомарной, auditable и
изолированной; assigned Teacher сохраняет absent subset и default-present
remainder.

Проверены authoritative task cards и текущие functional/semantic evidence для
`TASK-009` W5, `TASK-010` W6, `TASK-018` W8, `TASK-042` W22, `TASK-105` W37 и
`TASK-106` W38, включая их текущие sync routes. Прямые normative inputs:
feature AC/REQ, `learning-progress-browser-surface`, Boundary Map,
Access Control, Architecture Spine, Core Domain, Lifecycle Map и Testing
Strategy.

## Независимая semantic coverage

- Server-side scope был прослежен через Identity & Access и Center & Scheduling:
  Student получает только себя, Parent — только linked child, Teacher/Admin —
  только разрешённый class; personal guessed target отклоняется до private
  grade/progress projection.
- Learning Progress проверен как единственный owner homework/grade/attendance;
  Lesson Context только composes/adapts. Проверены named form actions,
  provider-owned homework selection, zero/one/multiple fail-closed behavior,
  no direct route persistence и GET-only `/api/lesson-context`.
- Проверены state-before/state-after для denied/forged/cross-scope actions,
  grade-free shared projection, accepted grade scale, repeat completion/create,
  historical attendance/charge/audit/isolation path, свежий targeted Vitest
  набор (`8` files / `23` tests) и свежий disposable Playwright (`1 passed`)
  с удалением exact database/sidecars.
- Два свежих независимых `Codex Luna` `xhigh` co-review были запущены с
  отдельными authorization/privacy и state/persistence фокусами. В bounded
  window usable candidate payload не поступил; итог опирается на собственную
  source/runtime проверку и текущие authoritative records.

## Findings и handoff

Reportable material finding и operator-owned question не обнаружены. Feature
semantic gate пройден. Отдельное решение feature lifecycle/aggregate closure
остаётся у активного lifecycle owner; этот review не менял task, lifecycle,
scheduler, Judge, queue или sync state.

SEMANTIC_VERDICT: semantic-pass
