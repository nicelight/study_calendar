---
description: Fresh-context request for the PRD decomposition review.
status: complete
task_id: TASK-MB-REVIEW-FEAT-PLAN
stage_id: S-FEAT
repair_cycle: 2
---

# Reviewer request

Провести fresh-context re-review cycle 2 decomposition `PRD -> REQ -> Epic -> Feature`
после bounded `/write-prd` repair цикла 1 в ROLE: Reviewer.

## Обязательные входы

- `.memory-bank/constitution.md`
- `.memory-bank/analysis/index.md`
- `.memory-bank/analysis/product-brief.md`
- `.memory-bank/prd.md`
- `.memory-bank/product.md`
- `.memory-bank/requirements.md`
- `.memory-bank/epics/*.md`
- `.memory-bank/features/*.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/spec-backbone.md`
- текущий статус `.protocols/AUTONOMOUS-RUN/status.md` и связанный checkpoint при необходимости

Проверить repaired `AC-PRIV-001` против принятого Admin center-wide payment
authority и Teacher assigned-class restriction, а также stable IDs, PRD -> REQ ->
EP -> FT traceability, RTM completeness, acceptance closure, clarification state
и Foundation pressure signals. Предыдущие reports использовать только как
evidence; verdict вынести независимо.

## Границы и результат

- Использовать только verdict vocabulary `APPROVE|REJECT`.
- Отчёт записать в `.tasks/TASK-MB-REVIEW-FEAT-PLAN/TASK-MB-REVIEW-FEAT-PLAN-S-FEAT-final-report-docs-01.md`.
- Не проверять architecture choices, task implementation details, JSON task
  design или task records; не запускать `/spec-design` или task planning.
- Не выбирать architecture alternatives и не запускать `/spec-design`.

## Review contract

Вердикт должен содержать `VERDICT`, `EVIDENCE`, `BLOCKING_FINDINGS`,
`NON_BLOCKING_NOTES`, `UNRESOLVED_OPERATOR_QUESTIONS`, `REPAIR_ROUTE` и
`NEXT_ACTION`; `REJECT` означает blocking product/decomposition defect, а
`APPROVE` передаёт работу в `/spec-design`. Проверять только PRD -> REQ ->
Epic -> Feature decomposition, без review architecture или task implementation.
