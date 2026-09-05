---
description: Advisory technical-debt report for wave W38.
status: advisory
---

# Технический долг — wave W38

Дата: 2026-09-05. Отчёт advisory-only: он не изменяет реализацию, тесты,
задачи, статусы, lifecycle, scheduler, gates, blockers, verdicts или debt
lifecycle.

## Точный checked scope

Проверена только W38-граница `TASK-106-T3-FT-005-W38` (`T3`, `FT-005`):

- task card `.memory-bank/tasks/TASK-106-T3-FT-005-W38.task.json:1-180`;
- фактический W38 outcome diff:
  `src/routes/lesson-context/+page.svelte:10,66-72,119-174,176-195` и
  `e2e/ft-005-homework-grading-ui.spec.ts:117-200`;
- текущие W38 executor, functional/semantic verification, cleanup и
  MB-SYNC evidence под `.tasks/TASK-106-T3-FT-005-W38/` и
  `.protocols/TASK-106-T3-FT-005-W38/`;
- durable W38 routes в
  `.memory-bank/features/FT-005-learning-progress.md:264-287`,
  `.memory-bank/epics/EP-004-learning-progress.md:57-70`,
  `.memory-bank/requirements.md:668-688`,
  `.memory-bank/tasks/plans/IMPL-FT-005.md:161-176`,
  `.protocols/FT-005/plan.md:67-78` и
  `.memory-bank/changelog.md:7-22`;
- task-linked browser contract
  `.memory-bank/contracts/learning-progress-browser-surface.md:42-85`.

Проверка не расширялась до repository-wide аудита, W37 implementation,
FT-006 implementation или изменения workflow state. Отдельно проверялась
только та известная test-isolation проблема, которая прямо зафиксирована в
W38 closure evidence.

## Evidence

- W38 functional verification фиксирует `PASS`, а semantic verification —
  `semantic-pass`; текущая browser proof наблюдала Admin creation, Student
  completion/reload, Teacher `α`/`β`/`γ`/`F`, privacy denial и cleanup:
  `.protocols/TASK-106-T3-FT-005-W38/verification.md:64-109`.
- Компонент действительно потребляет server projection и capability:
  `src/routes/lesson-context/+page.svelte:119-173`; shared completion rows
  не рендерят grade, а grade selector и create form зависят от
  `data.canEditMaterial` (`:140-169`).
- Нормативный browser verification target требует покрыть Admin/Teacher
  create и grade: `.memory-bank/contracts/learning-progress-browser-surface.md:77-85`.
- Фактический disposable flow создаёт item только после входа Admin
  (`e2e/ft-005-homework-grading-ui.spec.ts:120-126`); assigned Teacher
  появляется только после создания и используется для grade persistence
  (`:138-152`). W38 verifier подтверждает именно это разделение
  (`.protocols/TASK-106-T3-FT-005-W38/verification.md:71-78`).
- Required exact `npm run test` прошёл, но изменил ignored
  `study-calendar.db`: `.tasks/TASK-106-T3-FT-005-W38/TASK-106-T3-FT-005-W38-S-EXE-final-report-code-01.md:43-53`,
  `.protocols/TASK-106-T3-FT-005-W38/progress.md:18-22` и
  `PAPERCUTS/gpt-5 __ 09-05-2026 05.13.md:10-28`. Independent verifier
  использовал `DATABASE_URL=:memory:` вместо небезопасного default path
  (`.protocols/TASK-106-T3-FT-005-W38/verification.md:103-109`).

## Подтверждённые findings

### TD-W38-01 — MEDIUM: полный test gate по-прежнему мутирует ignored runtime database

В W38 exact required gate `npm run test` завершился успешно, но переписал
`study-calendar.db`; файл ignored, поэтому изменение не видно в `git status`.
Это повторно наблюдаемый механизм, а не только раскрытие в отчёте: зелёный
project-level gate не доказывает изоляцию от runtime data, а следующий запуск
может зависеть от предыдущего состояния или оставить повреждённые данные.

Это не дефект W38 UI и не результат его production diff. Это re-confirmed
project-wide verification debt, который W38 closure вынужден был обходить
безопасным `DATABASE_URL=:memory:` в independent verification, тогда как task
card продолжает называть plain `npm run test` обязательным gate.

Минимальное направление remediation: сделать default `npm run test` всегда
получающим dedicated disposable/in-memory `DATABASE_URL` либо немедленно
завершать запуск при обнаружении `study-calendar.db`; можно переиспользовать
существующий guard disposable E2E runner без новой persistence abstraction.

### TD-W38-02 — MEDIUM: browser closure не доказывает assigned-Teacher create path

Принятый browser contract требует в одном disposable Playwright contour
покрыть Admin/Teacher create и grade. Фактический W38 flow проверяет Admin
creation, затем assigned-Teacher grading, но не показывает assigned Teacher
экран до создания homework и не отправляет `createHomework` от его session.
При этом durable routes формулируют W38 как покрывающий
`Admin/assigned-Teacher creation and grading`:
`.memory-bank/requirements.md:670-677` и `.protocols/FT-005/plan.md:72-76`,
тогда как сама W38 verification explicitly records only Admin creation and
Teacher grading (`.protocols/TASK-106-T3-FT-005-W38/verification.md:71-78`).

Компонент использует общий `data.canEditMaterial` gate для create и grade
(`src/routes/lesson-context/+page.svelte:140-169`), поэтому текущий PASS
подтверждает общий UI shape, но не ловит роль-специфический regression в
server-projected capability или render path для assigned Teacher. Это создаёт
материальный regression-risk и одновременно оставляет durable evidence route
шире фактически доказанного browser outcome. Server/action coverage сама по
себе не заменяет этот browser check.

Минимальное направление remediation: в тот же disposable flow добавить
assigned Teacher до создания item, проверить missing-item create form,
отправить `createHomework` и продолжить текущую completion/grade sequence;
после этого сохранить Admin path отдельным проверенным действием либо
явно сузить durable wording до фактически покрытого role split.

## Uncertainty и non-findings

- По W38 production diff не подтверждён direct database access, новый route/API,
  client-wide state, client-side authority resolution или shared grade leak;
  это подтверждено source review и текущими functional/semantic evidence.
- Не утверждается, что assigned Teacher action запрещён сервером: W38 scope
  показывает именно отсутствие browser-level create proof, а не authorization
  failure.
- FT-005/EP-004/REQ-009/REQ-014 routes, lifecycle values и W38 sync между собой
  согласованы; `planned` state и отсутствие feature-level promotion не являются
  finding этого отчёта.
- UI style, размер функций и общие percentage-coverage гипотезы не приняты:
  checked evidence не показывает для них material impact.

Этот отчёт advisory-only. Он не переоткрывает TASK-106, не меняет verdict,
не исправляет код и не маршрутизирует workflow state.
