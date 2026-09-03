# /review-tasks-plan FT-004

- Режим: bounded rerun текущей FT-004 task-planning surface на Planning
  Revision `2` после исправлений агента.
- Проверяемый exact delta: удалён feature reconciliation marker, uppercase
  AC locators восстановлены в `source_artifacts`, TASK-102 очищен от
  дублирующего REQ-014 evidence, а plan/protocol отражают `TASK-014` как
  `done`. Заявленные проверки включали schema, index/DAG, AC trace, mb-lint,
  gate paths и `git diff --check`.
- Проверяемый scope: проверить этот delta и полный AC proof linkage, включая
  требование acceptance-trace о literal AC IDs в `verification_targets`, плюс
  retained boundaries, T3 RED/GREEN/artifact contracts и execution readiness.
- Независимые co-review focuses refreshed fresh-контекстами с моделью
  `gpt-5.6-luna` и reasoning `xhigh`:
  1. semantic acceptance closure, ownership, cohesion and dependencies;
  2. structural/execution readiness, acceptance-trace linkage and T3 proof.
- Architecture review не требовался: текущий delta не меняет уже принятый
  participant-label boundary; предыдущий fresh architecture verdict остаётся
  retained evidence, а не новым verdict.
- Required markers: `REVIEWED_PLANNING_REVISION: 2`, `VERDICT: REJECT`,
  `ARCHITECTURE_REVIEW: not_required`.
- Review writes are limited to this REQUEST and the FT-004 final report. Не
  изменять feature, contract, plan, protocol, task cards, index, lifecycle,
  statuses, code или evidence artifacts.
