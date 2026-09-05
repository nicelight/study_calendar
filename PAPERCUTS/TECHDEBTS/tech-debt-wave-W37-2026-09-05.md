---
description: Advisory technical-debt report for wave W37.
status: advisory
---

# Технический долг — wave W37

Дата: 2026-09-05. Отчёт advisory-only: он не изменяет реализацию, тесты,
задачи, статусы, lifecycle, scheduler, gates, blockers, verdicts или debt
lifecycle. Он не блокирует terminal routing scheduler.

## Точный checked scope

Проверена только завершённая граница `TASK-105-T3-FT-005-W37` (`T3`, `FT-005`):

- task card `.memory-bank/tasks/TASK-105-T3-FT-005-W37.task.json`;
- W37 implementation surface в текущем diff:
  `src/lib/server/modules/learning-progress/public.ts:1,354-636`,
  `src/lib/server/modules/lesson-context/public.ts:223-398` и
  `src/routes/lesson-context/+page.server.ts:205-307`;
- W37 route regression
  `tests/routes/lesson-context-homework-actions.test.ts:145-397`;
- применимая схема `src/lib/server/platform/database.ts:133-143`;
- прямые W37 contracts и feature/task-plan links:
  `.memory-bank/contracts/learning-progress-browser-surface.md`,
  `.memory-bank/contracts/boundary-map.md:230-271`,
  `.memory-bank/features/FT-005-learning-progress.md:237-262` и
  `.memory-bank/tasks/plans/IMPL-FT-005.md:105-126`;
- current Attempt 2 executor, functional/semantic verification и W37 sync
  evidence под `.tasks/TASK-105-T3-FT-005-W37/` и
  `.protocols/TASK-105-T3-FT-005-W37/`.

Проверка не расширялась до `TASK-106-T3-FT-005-W38`, W33/W34 implementation,
FT-006 dirty changes или repository-wide аудита. Payment-marker hunk в
`src/lib/server/modules/lesson-context/public.ts` был сохранён как unrelated
FT-006 change и не оценивался.

## Evidence

- Current W37 evidence records functional `PASS`, T3 `semantic-pass`, closure
  `done`, and successful `check`, `build`, isolated full test and
  `git diff --check`; verifier-owned probes covered zero/one/multiple
  selection, ambiguity, repeat-create equality, privacy and deny-before-write:
  `.tasks/TASK-105-T3-FT-005-W37/TASK-105-T3-FT-005-W37-S-VERIFY-final-report-docs-02.md:21-62`,
  `.tasks/TASK-105-T3-FT-005-W37/TASK-105-T3-FT-005-W37-S-RED-VERIFY-final-report-docs-02.md:13-36` и
  `.tasks/TASK-105-T3-FT-005-W37/TASK-105-T3-FT-005-W37-S-MB-SYNC-final-report-docs-01.md:10-32`.
- W37 added the homework projection to every authorized `getDayContext` path
  before shared/personal branching:
  `src/lib/server/modules/lesson-context/public.ts:223-262`.
- Provider-owned selection deliberately throws
  `ambiguous-homework-selection` when more than one class-scoped row exists:
  `src/lib/server/modules/learning-progress/public.ts:624-636`. The schema
  permits that state: `learning_homework` has only a primary key on `id` and a
  `(class_id, id)` lookup index, with no one-row-per-class constraint:
  `src/lib/server/platform/database.ts:133-143`.
- The W37 probe creates a second row and confirms that the provider projection
  then throws the ambiguity outcome without mutating state:
  `.tasks/TASK-105-T3-FT-005-W37/verifier-owned-attempt-2.test.ts:276-288`.
- The page `load` converts every non-material error from the composed day view
  to `error(403, 'Forbidden')`, and the GET API does the same for every
  exception: `src/routes/lesson-context/+page.server.ts:128-166` и
  `src/routes/api/lesson-context/+server.ts:11-21`. The named W37 mutation
  actions have a specific `409 homework_ambiguous` branch
  (`src/routes/lesson-context/+page.server.ts:220-230,249-259,293-306`), but
  the read projection has no corresponding ambiguity representation.
- The same integration gap was already observed at the predecessor provider /
  Lesson Context boundary in the bounded W8 debt report:
  `PAPERCUTS/TECHDEBTS/tech-debt-wave-W8-2026-08-10.md:11-42`. W37 broadens
  exposure because the new projection is now requested for shared as well as
  personal day context.

## Подтверждённые findings

### TD-W37-01 — MEDIUM: provider ambiguity превращается в полный `403` для authorized day view

W37 correctly keeps homework selection provider-owned and fails closed when a
class has multiple `learning_homework` rows. However, the newly added
`getDayContext` composition calls that projection for every authorized lesson,
and the page/API read adapters collapse the resulting
`ambiguous-homework-selection` into `403 Forbidden`. Поэтому authorized user
не получает уже разрешённые material, discussion, attendance и financial
parts day context, а состояние данных выглядит как authorization failure.

Это observable debt mechanism, а не только различие формата ошибки: accepted
fail-closed data condition becomes an outage of the whole read surface and
loses the distinction between denied access and invalid/ambiguous provider
state. Повторная стоимость подтверждена W8 и текущим W37: provider ambiguity
проверяется, но read composition и GET transport по-прежнему не имеют
отдельного safe outcome.

Минимальное направление remediation: на Lesson Context read path обработать
только `ambiguous-homework-selection` как явное безопасное состояние
homework projection (без выбора одной строки) либо как отдельный non-403
transport outcome, сохранив `403` для authorization failures. Добавить один
composition/GET regression; новый homework relation или persistence mapping
для этого не нужен.

## Uncertainty и non-findings

- Последовательные повторные `createHomework` доказаны зелёными тестами. В
  текущем принятом runtime один SvelteKit process выполняет эти синхронные
  SQLite calls последовательно, поэтому отдельный concurrency finding не
  принят; multi-server deployment не входит в accepted architecture.
- `LearningProgressBoundary.createHomework` теперь допускает optional
  `homeworkId`, но текущий production Lesson Context caller его не передаёт,
  а W37 route отвергает forged browser field. Свежая semantic verification
  рассматривала этот compatibility candidate и не приняла его как task-path
  bypass; при отсутствии production caller он оставлен вне finding.
- Известная проблема default `npm run test`, которая может менять ignored
  `study-calendar.db`, подтверждена предыдущей W34 advisory и упомянута в
  W37 evidence. Она не приписана W37 implementation и не объявлена новым
  W37 finding: текущая независимая verification использовала
  `DATABASE_URL=:memory:` и сохранила реальную базу без изменений
  (`.tasks/TASK-105-T3-FT-005-W37/cleanup-receipt-attempt-2.md:1-22`,
  `.protocols/TASK-105-T3-FT-005-W37/verification.md:45-87`).
- Authorization, grade privacy, Learning Progress ownership, GET-only API,
  server-generated IDs, repeat-create equality и isolated cleanup имеют
  текущие independent PASS/semantic-pass evidence; дополнительных material
  findings по ним не подтверждено.

Этот отчёт advisory-only. Он не переоткрывает TASK-105, не меняет его verdict,
не исправляет код и не маршрутизирует workflow state.
