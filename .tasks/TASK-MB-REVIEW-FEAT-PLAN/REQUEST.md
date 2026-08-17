---
description: Fresh-context request for the PRD decomposition review.
status: complete
task_id: TASK-MB-REVIEW-FEAT-PLAN
stage_id: S-FEAT
review_cycle: 4
---

# Reviewer request

Независимо проверить, готова ли текущая декомпозиция `PRD -> REQ -> Epic -> Feature`
к `/spec-design`.

## Inputs

- `AGENTS.md`
- `.memory-bank/constitution.md`
- `.memory-bank/mbb/index.md`
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/index.md`
- `.memory-bank/roles/general.md`
- `.memory-bank/analysis/index.md`
- `.memory-bank/analysis/product-brief.md`
- `.memory-bank/prd.md`
- `.memory-bank/product.md`
- `.memory-bank/requirements.md`
- `.memory-bank/epics/*.md`
- `.memory-bank/features/*.md`
- `.memory-bank/skills/index.md` when relevant
- installed semantic pack `.agents/skills/review-feat-plan/references/finding-adjudication.md`

## Scope and output

- Проверять только product decomposition: PRD, REQ, Epic, Feature, RTM и
  acceptance closure.
- Не проверять JSON task design, task implementation, task execution или
  downstream architecture choices.
- Использовать только verdict vocabulary `APPROVE|REJECT`.
- Записать итог в
  `.tasks/TASK-MB-REVIEW-FEAT-PLAN/TASK-MB-REVIEW-FEAT-PLAN-S-FEAT-final-report-docs-01.md`.
- Отчёт должен содержать `VERDICT`, evidence, blocking findings, non-blocking
  notes, unresolved operator questions и owning repair route.

`REJECT` блокирует `/spec-design`; `APPROVE` передаёт decomposition в
`/spec-design`. Reviewer не переписывает product decisions и не выбирает
неоднозначные варианты.
