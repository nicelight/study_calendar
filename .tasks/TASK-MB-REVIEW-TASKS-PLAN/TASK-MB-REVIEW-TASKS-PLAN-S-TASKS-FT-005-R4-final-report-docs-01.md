---
description: Bounded fresh-delta semantic task-plan review for FT-005.
status: active
---
# Review FT-005 — fresh browser-surface delta

REVIEWED_PLANNING_REVISION: 2
VERDICT: REJECT
ARCHITECTURE_REVIEW: not_required

## Scope and retained evidence

Это bounded rerun последнего `FT-005` task-plan review. Проверены только
текущие изменения: новый browser contract, feature/plan/protocol updates и
`TASK-105-T3-FT-005-W37` / `TASK-106-T3-FT-005-W38`. Неизменённые
`TASK-009`, `TASK-010`, `TASK-018`, `TASK-042` и их evidence retained из
предыдущего отчёта при совпадающей Revision 2.

Два co-review focus обновлены. Structural/execution focus вернул
`REJECT` с совпадающими ниже proof findings; semantic focus не вернул
финальный результат, поэтому закрыт прямой свежей read-only проверкой.

## Coverage results

Structural integrity проходит: AJV schema validation всех 64 индексированных
карточек, unique/resolving task index и DAG-проверка прошли; W37/W38 имеют
корректные `T3`, `FT-005`, `W37/W38`, concrete `REQ-009`/`REQ-014` и
разрешимые зависимости. `mb-lint` и `git diff --check` также прошли.
Planning Revision положительный (`.memory-bank/spec-backbone.md:87`),
Foundation gate `TASK-002-T3-FT-000-W1` завершён, а
`PLANNING_RECONCILIATION_REQUIRED` в FT-005 отсутствует.

Coverage/slicing в части состава проходит: AC-001..005 остаются стабильными
и имеют task ownership; W37 и W38 — два независимых implementation results
(server transport затем page UI), а не proof-only siblings. Граф W37 → W38
согласован. Блокирующие пробелы ниже относятся к точности claim closure и
execution readiness нового delta.

Design/ownership boundary проходит: новый contract сохраняет Learning Progress
единственным owner/writer, Lesson Context — adapter, `/api/lesson-context` —
GET-only, и не добавляет `lesson_id` relation или второй persistence source
(`.memory-bank/contracts/learning-progress-browser-surface.md:12-24`). Поэтому
отдельный architecture review не требуется.

## Blocking findings

1. **Execution readiness — TASK-105: AC-linked RED/GREEN proof отсутствует.**
   `verification_targets` содержит `FT-005-AC-001` и `FT-005-AC-002`, но оба
   `evidence_required` элемента не содержат ни одного из этих exact IDs
   (`.memory-bank/tasks/TASK-105-T3-FT-005-W37.task.json:57-59`, `:120-123`).
   По canonical acceptance-trace правилу
   (`.memory-bank/scripts/mb-doctor/acceptance-trace.mjs:175-199`) для обоих AC
   отсутствует AC-linked RED/GREEN evidence contract (`RED_and_GREEN...`) для
   W37; старый
   TASK-018 evidence не может быть унаследован для нового transport outcome.

2. **Execution readiness — TASK-105: repeat-create invariant не имеет
   claim-equivalent GREEN.** Contract требует, чтобы повторная отправка не
   создавала второй class-scoped item
   (`.memory-bank/contracts/learning-progress-browser-surface.md:47-51`), и
   invariant записан в карточке (`TASK-105...:114-118`), но GREEN на
   `TASK-105...:59` проверяет лишь delegated create/complete/grade operations.
   Нет повторной submission и decisive before/after count или identity
   comparison. Repair owner: `/feature-doctor FT-005`.

3. **Execution readiness — TASK-105: server-generated opaque ID не включён в
   proof contract.** Каноническое правило требует, чтобы сервер генерировал
   opaque ID, тогда как текущий Learning Progress command принимает
   `homeworkId` от caller (`.memory-bank/contracts/learning-progress-browser-surface.md:47-50`,
   `src/lib/server/modules/learning-progress/public.ts:347-379`). В W37
   constraints есть запрет client authority, но ни `verification_targets`, ни
   `evidence_required` не требуют доказать отсутствие client ID, server-side
   generation и uniqueness (`TASK-105...:108-123`). Repair owner:
   `/feature-doctor FT-005`.

4. **Execution readiness — TASK-105: T3 cleanup condition не discoverable.**
   Карточка говорит про `isolated` и safe rerun, но не задаёт cleanup/teardown
   result или artifact (`TASK-105...:57-59`, `:120-123`). T3 policy требует
   authorized isolated/disposable state, safe rerun и cleanup
   (`.memory-bank/workflows/tier-policy.md:127-133`); retained старые
   evidence не покрывают новый W37 probe. Repair owner: `/feature-doctor FT-005`.

5. **Execution readiness — TASK-106: AC-001 GREEN не закрывает Admin/Teacher
   create.** Browser contract требует, чтобы page позволяла Admin/Teacher
   создать missing item (`.memory-bank/contracts/learning-progress-browser-surface.md:64-72`).
   W38 `verify` упоминает create, но AC-001 `verification_target` и его
   `evidence_required` GREEN проверяют только Student completion/status/reload
   (`.memory-bank/tasks/TASK-106-T3-FT-005-W38.task.json:49-62`, `:117-120`).
   Следовательно, заявленный create outcome может остаться непроверенным.
   Repair owner: `/feature-doctor FT-005`.

6. **Design/execution readiness — lifecycle reconciliation неполна.** Delta
   переводит `FT-005` в `lifecycle: planned`
   (`.memory-bank/features/FT-005-learning-progress.md:3-9`) из-за нового
   незакрытого browser outcome, но его единственный epic остаётся
   `EP-004: lifecycle: verified` (`.memory-bank/epics/EP-004-learning-progress.md:1-18`),
   а единственная FT-005 mapping для `REQ-009` остаётся `verified`
   (`.memory-bank/requirements.md:157`). Это противоречит текущему reopened
   feature state и аналогичному reconciliation pattern для других browser
   gaps. Repair owner: `/feature-doctor FT-005` (затем применить его решение
   через `/feature-to-tasks FT-005`; review rerun обязателен).

## Verdict and handoff

`REJECT`: текущий FT-005 browser task surface не готов к execution из-за
неполного prospective T3 proof и lifecycle contradiction. Исправления не
выполняются этим review. Следующий маршрут — `/feature-doctor FT-005`, затем
`/feature-to-tasks FT-005` для согласованной правки карточек/планов и повторный
`/review-tasks-plan FT-005`. До нового `APPROVE` не запускать W37/W38 через
`/exe`.
