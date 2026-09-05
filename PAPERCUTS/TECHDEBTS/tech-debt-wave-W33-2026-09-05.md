---
description: Advisory technical-debt report for wave W33.
status: active
---
# Технический долг — wave W33

Дата: 2026-09-05. Отчёт advisory-only: он не изменяет реализацию, тесты,
задачи, статусы, lifecycle, scheduler, gates, blockers, verdicts или debt
lifecycle.

## Точный checked scope

Проверен только `TASK-100-T3-FT-006-W33` и его фактическая W33 change surface:

- Admin payment journal server/UI adapter:
  `src/routes/admin/[centerId]/finance/+page.server.ts:106-173,228-312,392-423`
  и `src/routes/admin/[centerId]/finance/+page.svelte:64-83,217-289`;
- route и disposable-browser regression tests:
  `tests/routes/admin-finance-journal.test.ts:142-256` и текущий
  `e2e/ft-006-admin-journal.spec.ts:140-223`;
- сохранённые Attempt 1 и текущие Attempt 2 RED/GREEN, executor report,
  functional/semantic verification и W33 MB sync под
  `.tasks/TASK-100-T3-FT-006-W33/` и
  `.protocols/TASK-100-T3-FT-006-W33/`;
- W33 durable routes в
  `.memory-bank/tasks/TASK-100-T3-FT-006-W33.task.json:1-61`,
  `.memory-bank/features/FT-006-financial-ledger.md:454-475`,
  `.memory-bank/epics/EP-005-financial-ledger.md:43-54`,
  `.memory-bank/requirements.md:200-218`,
  `.memory-bank/tasks/plans/IMPL-FT-006.md:171-181`,
  `.memory-bank/changelog.md:7-24` и W33 sync report.

Проверка не расширялась до repository-wide аудита или W34 implementation.

## Evidence

- Первичный functional PASS проверил только один journal entry и одну edit/cancel
  последовательность: `.tasks/TASK-100-T3-FT-006-W33/TASK-100-T3-FT-006-W33-S-VERIFY-final-report-docs-01.md:26-45`;
- последующая независимая semantic-проверка выявила, что fixed
  `confirm-edit`/`confirm-cancel` блокируют вторую новую коррекцию из-за
  Ledger idempotency key: `.tasks/TASK-100-T3-FT-006-W33/TASK-100-T3-FT-006-W33-S-RED-VERIFY-final-report-docs-01.md:20-38`;
- retry воспроизвёл проблему на второй edit до production correction:
  `.tasks/TASK-100-T3-FT-006-W33/attempt-2-red.md:10-37`;
- Attempt 2 исправил UI и расширил browser proof до двух payments, двух edits и
  двух cancellations: `.tasks/TASK-100-T3-FT-006-W33/attempt-2-green.md:13-48`;
- текущие independent functional и semantic результаты — PASS и
  `semantic-pass`, без текущего admitted finding:
  `.protocols/TASK-100-T3-FT-006-W33/verification.md:47-83` и
  `.protocols/TASK-100-T3-FT-006-W33/red-verification.md:40-83`;
- sync подтверждает согласованные текущие маршруты и отсутствие authoritative
  consistency gaps: `.tasks/TASK-100-T3-FT-006-W33/TASK-100-T3-FT-006-W33-S-MB-SYNC-final-report-docs-01.md:12-64`.

## Подтверждённые findings

### TD-W33-01 — MEDIUM: idempotency-мультипликальность не была частью первого evidence matrix

Первый W33 GREEN и functional PASS доказывали только один edit и один cancel.
Из-за этого acceptance/evidence surface не проверил важный для этой команды
инвариант: один Admin должен выполнять несколько разных коррекций, а exact
retry должен сохранять тот же confirmation. Semantic-review затем обнаружил,
что UI отправлял один и тот же literal confirmation для всех edit/cancel форм,
а Financial Ledger трактует `(actor, operation, confirmation)` как ключ
идемпотентности и отклоняет второй новый payload.

Это подтверждённый механизм повторяемой стоимости изменений и regression-risk:
после функционального PASS понадобились semantic-fail, отдельный Judge-supported
retry, новая RED/GREEN implementation cycle, расширенный browser fixture,
повторная functional/semantic verification и W33 sync. Текущий production path
исправлен в Attempt 2 (`preparePaymentSubmission` генерирует новое значение для
нового payload), поэтому finding не является текущим функциональным дефектом.

Приоритет: `MEDIUM` — ошибка была обнаружена до closure, но только после полного
первичного цикла доказательств и на финансовой correction surface.

Минимальное направление remediation: для будущих browser-backed задач с
confirmation/idempotency включать в первый claim-equivalent matrix минимум две
разные операции одного типа над двумя записями и отдельную проверку exact
retry того же payload. Достаточно переиспользовать существующий disposable
runner и Ledger retry test; новая workflow-абстракция не требуется.

## Uncertainty и non-findings

- Текущий Attempt 2 production behavior, scope/authorization, Ledger ownership,
  isolation и durable W33 routes имеют свежие PASS-доказательства; новый
  production defect не подтверждён.
- В semantic report отдельно рассматривался conditional no-JavaScript или
  unavailable `crypto.randomUUID()` path, но evidence не устанавливает, что
  такой runtime входит в поддерживаемый продуктовый contract. Поэтому он не
  принят как material finding.
- `loadData` вызывает projection boundary для каждой class/student пары, однако
  в checked evidence нет наблюдаемого scale, latency или reliability impact;
  N+1-подобный риск не принят как debt.
- W33 sync, RTM routes, task card и lifecycle согласованы; исторические
  Attempt 1 статусы и semantic finding явно сохранены как supporting evidence и
  не свидетельствуют о текущей inconsistency.

Этот отчёт advisory-only и не блокирует, не исправляет и не маршрутизирует
workflow state.
