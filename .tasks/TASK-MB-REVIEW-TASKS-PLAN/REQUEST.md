# /review-tasks-plan FT-005 — bounded rerun свежего delta

- Режим: bounded rerun только текущих изменений для `FT-005` на базе
  предыдущего отчёта `S-TASKS-FT-005-R4`, с совпадающим положительным Global
  Backbone `Planning Revision: 2`.
- Проверяемый delta: исправленные proof-контракты в
  `TASK-105-T3-FT-005-W37` и `TASK-106-T3-FT-005-W38`, browser contract,
  feature/plan/protocol updates, clarification и lifecycle reconciliation для
  `FT-005`, `EP-004`, `REQ-009`.
- Scope: только acceptance closure, task cohesion, canonical ownership,
  lifecycle consistency, schema/index/DAG, AC traceability, T3 RED/GREEN,
  hard write boundaries и execution readiness нового W37/W38 delta.
- Неизменённые `TASK-009`, `TASK-010`, `TASK-018`, `TASK-042` и их evidence
  retained при совпадающей Revision 2; их исторические записи не изменялись.
- Co-review focus 1 refreshed: semantic acceptance closure, ownership,
  cohesion, dependencies and contract impact; fresh `Codex Luna`/`xhigh`
  вернул `PASS`, candidate findings отсутствуют.
- Co-review focus 2 refreshed: structural/execution readiness, AC traceability,
  hard boundaries and T3 proof; launch не вернул финальный результат после
  повторного ожидания, поэтому область закрыта прямой read-only проверкой
  schema/index/DAG и acceptance-trace условий.
- Architecture review: не требуется — текущий delta сохраняет Learning
  Progress owner, Lesson Context adapter, GET-only API и sequential W37 → W38
  boundary; material ownership question не остался.
- Review writes ограничены этим REQUEST и новым FT-005 final report. Не менять
  feature, requirements, epic, contract, plan, protocol, task cards, index,
  lifecycle, statuses, code или execution evidence.
- Required markers: `REVIEWED_PLANNING_REVISION: 2`, `VERDICT: APPROVE`,
  `ARCHITECTURE_REVIEW: not_required`.
