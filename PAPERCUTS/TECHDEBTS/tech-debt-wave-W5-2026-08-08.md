---
description: Advisory technical-debt report for the explicit Wave 5 change surface.
status: advisory
scope: wave W5
created: 2026-08-08
---
# Technical Debt — Wave W5

## Advisory status

Review intent: `/tech-debt wave W5`.

Отчёт advisory-only: он не изменяет implementation, Memory Bank, task/spec/status,
workflow verdict, gate, blocker, promotion, closure или lifecycle route.

## Точно проверенный scope

Wave W5 разрешена через `.memory-bank/tasks/index.json` ровно в три
индексированные задачи со `status: done`:

- `.memory-bank/tasks/TASK-008-T3-FT-006-W5.task.json` — payment commands,
  allocation, audit и payment markers;
- `.memory-bank/tasks/TASK-009-T3-FT-005-W5.task.json` — homework completion и
  private grading;
- `.memory-bank/tasks/TASK-011-T3-FT-004-W5.task.json` — scoped comments и
  reactions.

Проверена фактическая W5 production/test surface:

- `src/lib/server/modules/financial-ledger/public.ts`;
- `src/lib/server/modules/learning-progress/public.ts`;
- `src/lib/server/modules/collaboration/public.ts`;
- `src/lib/server/platform/database.ts` — W5 schema additions;
- `src/lib/server/composition-root.ts` — W5 boundary wiring;
- `src/lib/server/modules/center-scheduling/public.ts` — W5 financial
  lesson-date read port;
- `tests/financial-ledger/{historical-charges,payments}.test.ts`;
- `tests/learning-progress/homework-grades.test.ts`;
- `tests/collaboration/comments-reactions.test.ts`.

Также прочитаны W5 task plans, current functional/semantic protocols и final
reports под `.tasks/TASK-008-T3-FT-006-W5/`,
`.tasks/TASK-009-T3-FT-005-W5/`, `.tasks/TASK-011-T3-FT-004-W5/`, прямые
feature/task-linked contracts (`boundary-map`, `access-control`,
`financial-ledger`, `core-domain`, `lifecycle-map`, `system-architecture`),
`package.json` и `src/lib/server/platform/config.ts` как persistence context.
Сохранённые W5 check/build/test verdicts не переоценивались и checks заново не
запускались; debt-механизмы проверены по текущему source.

Review не расширялся до repo-wide, других waves/tasks, routes/UI, production
provider adapters или persistent database contents. Уже существующие отчёты
`PAPERCUTS/TECHDEBTS/tech-debt-wave-W3-2026-08-08-02.md`,
`tech-debt-wave-W3-2026-08-08.md` и `tech-debt-wave-W4-2026-08-08.md` прочитаны
только для continuity/collision context.

## Подтверждённые material findings

### TD-W5-01 — Shared schema всё ещё не имеет upgrade path

- **Приоритет:** high — до первого real-data deployment или первого изменения
  формы существующей таблицы.
- **Evidence:** W5 execution reports называют
  `src/lib/server/platform/database.ts` фактическим schema surface для
  `TASK-008`, `TASK-009` и `TASK-011`; текущий constructor выполняет один
  блок `CREATE TABLE IF NOT EXISTS` (`database.ts:15-282`), включая W5
  `learning_*`, payment command/audit и collaboration tables. В `package.json:5-21`
  нет migration/schema command, а persistent default — `study-calendar.db`
  (`src/lib/server/platform/config.ts:5-8`).
- **Debt mechanism:** отсутствующая таблица создаётся, но уже существующая
  таблица прежней формы не version-ится, не проверяется и не преобразуется.
  Fresh `:memory:` W5 probes не воспроизводят upgrade persistent базы.
- **Impact:** следующая schema change может запустить приложение на stale
  schema или потребовать ручного вмешательства после появления финансовых,
  grade и private-discussion данных; стоимость и риск восстановления растут
  вместе с данными.
- **Минимальное направление remediation:** ввести одну линейную transactional
  SQLite migration sequence с монотонной schema version и probe
  `previous schema -> current`; startup должен применять sequence, а не
  использовать bootstrap DDL как upgrade mechanism.

### TD-W5-02 — Application composition root по-прежнему раскрывает raw DB bypass

- **Приоритет:** high — privacy/authorization и financial-integrity blast
  radius увеличился с W5 tables.
- **Evidence:** `CompositionRoot` экспортирует `database: SharedDatabase`
  (`src/lib/server/composition-root.ts:10-17`), возвращает его из
  `createCompositionRoot` (`:19-38`) и application singleton
  (`:41-45`). W5 tests используют тот же `root.database.sqlite` для прямых
  writes/reads, например `tests/learning-progress/homework-grades.test.ts:156-170`
  и `tests/financial-ledger/payments.test.ts:403-424`; production W5
  boundaries также получают write-capable `SharedDatabase`.
- **Debt mechanism:** любой будущий route или соседний slice, импортирующий
  application root, технически может писать `learning_*`, financial или
  collaboration tables в обход owner-side authorization, audit и invariants.
  Соблюдение write ownership зависит от review/search discipline, а не от
  доступного API.
- **Impact:** случайный bypass может создать приватный grade/comment или
  финансовый факт без server-side actor/scope checks; каждый новый consumer
  расширяет blast radius и стоимость повторного bypass review.
- **Минимальное направление remediation:** application-facing root должен
  экспортировать только capability boundaries; raw database lifecycle оставить
  внутри wiring, а direct-SQL fixture/inspection передать отдельному test
  harness.
- **Uncertainty:** фактический production misuse не наблюдался; finding
  фиксирует уже экспортированную write-capable capability.

### TD-W5-03 — Learning Progress читает Center & Scheduling table напрямую

- **Приоритет:** medium — закрыть до следующего изменения membership или
  class-visible progress projection.
- **Evidence:** `LearningProgressBoundary` уже получает публичный
  `getAuthorizedClassScope` (`src/lib/server/modules/learning-progress/public.ts:71-80`),
  но `getHomeworkCompletions` после scope check строит проекцию прямым
  `FROM class_students` (`:145-170`). `class_students` принадлежит Center &
  Scheduling (`.memory-bank/contracts/boundary-map.md:112-128`), а canonical
  read-flow запрещает consumer-у читать соседнюю таблицу для реконструкции
  scope/lifecycle (`.memory-bank/domains/core-domain.md:50-60`).
- **Debt mechanism:** Learning Progress связан с физической схемой
  Center & Scheduling и повторно реализует roster join вместо named public
  query. Поэтому изменение membership schema или различий между
  class-visible roster и personal scope требует синхронной правки и повторной
  проверки нескольких slices.
- **Impact:** растёт coupling и regression risk для removal/reassignment,
  parent scope и будущих progress projections; текущий initial authorization
  check снижает риск немедленной утечки, но не устраняет bypass boundary.
- **Минимальное направление remediation:** добавить в Center & Scheduling
  явную authorized class-roster query с зафиксированной семантикой
  `class-visible`, а Learning Progress строить completion view только через
  неё и свои completion rows.

### TD-W5-04 — Financial reconciliation принимает caller-trusted attendance transition

- **Приоритет:** high — financial correctness до real attendance/payment data.
- **Evidence:** публичный `reconcileLessonCharge` принимает
  `attendanceTransition` от caller и сам разрешает `admin`/`teacher`
  (`src/lib/server/modules/financial-ledger/public.ts:209-245`). После actor и
  lesson-fact checks `applyAttendanceTarget` меняет Charge по `to`; `from`
  используется только как условие no-op (`:238-243,828-898`). Канонический
  contract требует, чтобы Learning Progress валидировал attendance и только
  затем вызывал Financial Ledger reconciliation
  (`.memory-bank/contracts/boundary-map.md:187-203`,
  `.memory-bank/contracts/financial-ledger.md:17-20,72-80`).
- **Debt mechanism:** прямой consumer с валидным Admin/Teacher actor может
  предъявить transition, не совпадающий с persisted Attendance state, и
  создать или отменить Charge с корректными на вид allocation/audit, но без
  подтверждённого attendance события. W5 добавляет payment/replay consumers,
  поэтому последствия такого расхождения распространяются на balance.
- **Impact:** возможны финансовые факты, не соответствующие attendance;
  ошибка обнаруживается только при последующей сверке, а не на owner boundary.
- **Минимальное направление remediation:** сделать reconciliation
  transaction-scoped internal command, вызываемый после owner-validated
  Learning Progress transition; альтернативно Financial Ledger должен
  проверять persisted attendance state до charge mutation.

### TD-W5-05 — Collaboration сводит разные UNIQUE conflicts к SQLite-text error

- **Приоритет:** medium.
- **Evidence:** `createFieldComment` ловит любое исключение с подстрокой
  `UNIQUE constraint failed` и возвращает `comment-already-exists`
  (`src/lib/server/modules/collaboration/public.ts:131-157,479-481`). На
  W5 schema surface одновременно существуют `collaboration_comments.id`
  `PRIMARY KEY` и отдельный owner/field unique index
  (`src/lib/server/platform/database.ts:227-251`). Поэтому duplicate caller
  `commentId` и duplicate account-owned field comment получают один и тот же
  результат; mapping также зависит от SQLite wording.
- **Debt mechanism:** public Collaboration error contract не различает
  duplicate resource ID, ownership conflict и неизвестную persistence error.
  Adapter/schema rename или другой SQLite-compatible driver может изменить
  observable failure без изменения product behavior.
- **Impact:** caller не может выбрать корректный retry/UI path, а storage
  detail протекает через public boundary; это добавляет regression risk при
  переходе от текущего SQLite scaffold к миграциям/adapter-слою.
- **Минимальное направление remediation:** проверять/различать конкретный
  owner-field conflict и ID collision внутри Collaboration, возвращая
  стабильные domain errors; неизвестные persistence failures не маскировать.

### TD-W5-06 — Transaction participation cross-slice остаётся implicit wiring contract

- **Приоритет:** medium — до расширения W5 boundary pattern в следующие
  cross-slice commands.
- **Evidence:** W5 boundaries принимают конкретный `SharedDatabase`
  (`financial-ledger/public.ts:190-196`, `learning-progress/public.ts:71-80`,
  `collaboration/public.ts:102-112`) и выполняют external scope calls внутри
  своих transaction blocks, например Financial Ledger `:218-245`, Learning
  Progress `:89-116` и Collaboration `:124-159,222-260`. Только composition
  root связывает все slices одним database instance
  (`src/lib/server/composition-root.ts:19-37`); public port types не выражают
  transaction-scoped participation. Canonical rule разрешает shared
  transaction при требуемой atomicity, но требует сохранить owner boundaries
  (`.memory-bank/domains/core-domain.md:64-72`).
- **Debt mechanism:** TypeScript-compatible provider, подключённый к другой
  connection/adapter или открывающий собственную transaction, может читать
  scope/facts вне caller transaction и отделить их от rollback. Current
  singleton wiring скрывает эту предпосылку.
- **Impact:** изменение persistence wiring или копирование pattern для
  attendance/payment orchestration создаёт silent partial-state или stale-read
  risk; semantics приходится восстанавливать из implementation details.
- **Минимальное направление remediation:** выразить transaction-scoped
  provider/command handle в internal port contract и закрепить failure probe,
  где provider read succeeds, последующий owner write fails, а обе связанные
  mutations откатываются.

## Неопределённость и исключённые утверждения

- Persistent `study-calendar.db` не инспектировалась; TD-W5-01 подтверждает
  отсутствие upgrade mechanism, но не утверждает уже произошедшую corruption.
- W5 functional и semantic reports показывают PASS/semantic-pass для
  task-owned outcomes; перечисленные findings — advisory debt mechanisms и не
  отменяют эти verdicts.
- Routes/UI, real provider I/O и production misuse application root не входили
  в scope; claims о них не делаются.

## Reviewer summary

- **verdict:** `REQUEST_CHANGES` — advisory technical-debt verdict, не gate и не
  workflow route.
- **findings:** шесть подтверждённых material mechanisms: три high и три
  medium; два high (schema upgrade и raw DB) являются carry-forward,
  расширенными W5 schema/boundary surface.
- **evidence_checked:** indexed W5 task records; W5 task protocols/final
  reports; current Financial Ledger, Learning Progress, Collaboration,
  database, composition and focused-test source; direct canonical contracts;
  package/config persistence context.
- **risks_or_questions:** operator-owned product/spec decision не требуется;
  remediation принадлежит implementation owner.

Этот report создан без implementation, verification, red-verification,
promotion, selection, lifecycle change, task-card edit или Memory Bank sync.
