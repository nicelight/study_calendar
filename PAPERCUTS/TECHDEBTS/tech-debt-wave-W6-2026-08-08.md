# Technical Debt Review — Wave W6 / TASK-010

## Checked scope

Проверена только явно заданная поверхность W6: текущая реализация и evidence
`TASK-010-T3-FT-005-W6` для `FT-005-AC-003` и `FT-005-AC-004`, включая
attendance-to-charge orchestration и её W6 sync context. `TASK-012`, другие
волны, другие features и repo-wide поверхность не проверялись.

Проверенные источники:

- `.memory-bank/tasks/TASK-010-T3-FT-005-W6.task.json`;
- `.memory-bank/features/FT-005-learning-progress.md#ft-005-ac-003--attendance-controls-charge-eligibility-in-both-class-modes` и `#ft-005-ac-004--absent-to-present-correction-is-auditable`;
- `.memory-bank/contracts/boundary-map.md#attendance-charge-reconciliation-boundary`, `.memory-bank/contracts/financial-ledger.md`, `.memory-bank/states/lifecycle-map.md#learning-and-finance` и `.memory-bank/runbooks/mvp-verification.md#required-pre-real-data-checks`;
- `.tasks/TASK-010-T3-FT-005-W6/execution-evidence.md`, текущие execution/functional/semantic/MB-SYNC reports и соответствующие `.protocols/TASK-010-T3-FT-005-W6/` evidence;
- `src/lib/server/modules/learning-progress/public.ts`, `src/lib/server/modules/financial-ledger/public.ts`, `src/lib/server/platform/database.ts`, `src/lib/server/composition-root.ts` и `tests/learning-progress/attendance-red-probe.test.ts` в относящихся к TASK-010 участках.

## Confirmed findings

### TD-W6-001 — Attendance write transaction материализует неиспользуемый полный financial replay

- **Priority:** LOW.
- **Evidence:** `LearningProgressBoundary.recordAttendance()` открывает общую
  transaction и вызывает `reconcileLessonCharge()` без использования результата
  (`src/lib/server/modules/learning-progress/public.ts:114`, `:126`). Financial
  Ledger присоединяется к ambient transaction и до её завершения всегда вызывает
  `getChargeReplayUnsafe()` (`src/lib/server/modules/financial-ledger/public.ts:245`,
  `:248`). Этот путь читает полные списки charges, financial audit, payments и
  allocations выбранного ученика и разбирает сохранённые audit snapshots
  (`src/lib/server/modules/financial-ledger/public.ts:929`, `:949`, `:957`, `:958`,
  `:988`).
- **Observable debt mechanism:** стоимость каждого реального attendance transition
  растёт вместе со всей финансовой и audit-историей ученика, а SQLite write lock
  удерживается во время формирования широкой read projection. Write command также
  оказывается связан с полным `ChargeReplayView`: расширение replay projection
  способно увеличивать latency и regression surface attendance-команды, даже если
  её caller эти данные не потребляет.
- **Practical impact:** повторные attendance corrections со временем выполняют
  всё больше неиспользуемой работы внутри финансово-критичной transaction, что
  повышает latency/lock contention и стоимость безопасного изменения replay query.
- **Smallest remediation direction:** сохранить требуемый boundary contract, но
  возвращать из reconciliation компактный результат только с относящимися к
  переходу charge/balance facts; полный charge/audit/allocation replay оставить
  отдельной query и не материализовать его внутри attendance write transaction.

## Uncertainty

Production data volume, transaction latency и contention не измерялись, поэтому
операционная тяжесть finding не подтверждена выше LOW. Текущие functional и
semantic evidence подтверждают correctness, authorization, atomic rollback,
historical pricing, audit и student isolation; иных material debt mechanisms в
проверенной поверхности не подтверждено.

Этот отчёт advisory-only: он не меняет implementation, lifecycle, verdict,
blocker, gate, routing или workflow state.
