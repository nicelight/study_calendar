---
description: Advisory technical-debt report for wave W34.
status: active
---
# Технический долг — wave W34

Дата: 2026-09-05. Отчёт advisory-only: он не изменяет реализацию, тесты,
задачи, статусы, lifecycle, scheduler, gates, blockers, verdicts или debt
lifecycle.

## Точный checked scope

Проверен только `TASK-101-T3-FT-006-W34` и его фактическая change surface:

- Lesson Context adapter: `src/lib/server/modules/lesson-context/public.ts:337-368`;
- Calendar server load и view model: `src/routes/calendar/+page.server.ts:12-92`;
- Calendar presentation: `src/routes/calendar/+page.svelte:23-79,121-179`;
- focused adapter/route/component tests:
  `tests/lesson-context/personal-payment-markers.test.ts:1-126` и
  `tests/routes/calendar-payment-markers.test.ts:1-174`;
- disposable browser proof: `e2e/ft-006-payment-markers.spec.ts:1-187`;
- indexed task card и W34 execution/test boundary:
  `.memory-bank/tasks/TASK-101-T3-FT-006-W34.task.json:1-161`;
- Attempt 1 RED/GREEN, executor report, functional/semantic verification и
  W34 sync под `.tasks/TASK-101-T3-FT-006-W34/` и
  `.protocols/TASK-101-T3-FT-006-W34/`.

Проверка не расширялась до repository-wide аудита, W33 implementation или
изменения workflow state.

## Evidence

- W34 focused tests используют in-memory SQLite, а disposable E2E запускается
  через `tmp/ft-006-payment-markers.db`; финальный browser run прошёл `1/1`,
  временная база и sidecars были очищены: `.protocols/TASK-101-T3-FT-006-W34/progress.md:24-30,40-51` и
  `.tasks/TASK-101-T3-FT-006-W34/TASK-101-T3-FT-006-W34-S-EXE-final-report-code-01.md:66-94`.
- После этого обязательный полный `npm run test` также завершился успешно
  (`75 files / 256 tests`), но изменил ignored `study-calendar.db`: его hash
  изменился с
  `5421ad92b1354e40909df02587e75ef13e1afc8bf8db81e88adecbb8389c8b5c` на
  `2b94cf997f2c8df69acd45b4e3767d0a269e178d3f478aec9400aee44b0c9937`.
  Это зафиксировано в executor evidence: `.protocols/TASK-101-T3-FT-006-W34/progress.md:27-30` и
  `.tasks/TASK-101-T3-FT-006-W34/TASK-101-T3-FT-006-W34-S-EXE-final-report-code-01.md:84-94`.
- Отдельная contemporaneous papercut подтверждает mtime/hash после полного
  test gate, то, что файл ignored и что предыдущие contents не были
  восстановимы: `PAPERCUTS/gpt-5 __ 09-05-2026 02.08.md:7-21`.
- W34 functional и semantic verification не нашли defect в payment-marker
  consumer: `.protocols/TASK-101-T3-FT-006-W34/verification.md:41-58,73-128` и
  `.protocols/TASK-101-T3-FT-006-W34/red-verification.md:18-51`.

## Подтверждённые findings

### TD-W34-01 — MEDIUM: полный test gate не изолирован от реальной runtime database

В пределах одного W34 execution доказано, что безопасный disposable browser
proof и focused tests изолированы, но обязательная команда `npm run test`
после них меняет настоящий ignored `study-calendar.db`. Значит, зелёный
project-level gate не доказывает независимость от реальных runtime данных и
оставляет в рабочем окружении невидимое для `git status` состояние.

Это observable debt mechanism с material impact: финансовая change surface
потребовала не восстанавливать неизвестное прежнее состояние базы, а будущий
test run может зависеть от данных предыдущего запуска или повредить рабочие
данные. Повторяемая стоимость уже подтверждена W34: disposable proof пришлось
отделять от полного gate, а verifier не повторил `npm run test`, поскольку
evidence уже показало небезопасную мутацию
(`.protocols/TASK-101-T3-FT-006-W34/verification.md:86-90`).

Приоритет: `MEDIUM` — side effect воспроизведён на financial project surface,
но checked evidence не локализует конкретный тест или точную ветку, которая
открывает database по default path.

Минимальное направление remediation: обеспечить, чтобы полный Vitest gate
всегда получал dedicated disposable или in-memory `DATABASE_URL`, и добавить
раннюю проверку, запрещающую запуск test suite против `study-calendar.db`.
Достаточно переиспользовать существующий `tmp/`/database guard из disposable
E2E runner; новая persistence abstraction не требуется.

## Uncertainty и non-findings

- Точный offending test не установлен в bounded W34 review. Поэтому finding
  относится к isolation contract полного gate, а не приписывается W34
  production implementation.
- `src/lib/server/modules/lesson-context/public.ts:337-368` и Calendar
  `src/routes/calendar/+page.server.ts:42-77` сохраняют server-resolved scope и
  Financial Ledger ownership; текущего privacy/authorization defect не
  подтверждено.
- Отдельные same-day markers, factual amount/date, paid/unpaid regression и
  marker-only financial-state equality имеют focused и browser evidence; новый
  product defect из этой surface не принят.
- Возможный N+1 при сборке Parent markers и прочие scale-гипотезы не приняты:
  checked evidence не содержит наблюдаемого latency, scale или reliability
  impact.

Этот отчёт advisory-only. Он не блокирует, не исправляет и не маршрутизирует
workflow state.
