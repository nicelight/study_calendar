---
description: Advisory technical-debt report for the completed Wave 4 change surface.
status: advisory
scope: wave W4
created: 2026-08-08
---
# Technical Debt — Wave 4

## Advisory status

Review intent: `/tech-debt wave W4`.

Этот отчёт advisory-only: он не меняет implementation, Memory Bank, task/spec/status,
workflow verdict, gate, blocker, promotion, closure или lifecycle route.

## Точно проверенный scope

Wave W4 разрешена через `.memory-bank/tasks/index.json:29-35` ровно в две
индексированные задачи со `status: done`:

- `.memory-bank/tasks/TASK-006-T2-FT-002-W4.task.json` — recurring schedules,
  stable Lesson exceptions, assignment authorization и Financial Ledger lesson
  integration;
- `.memory-bank/tasks/TASK-007-T3-FT-006-W4.task.json` — historical prices,
  charge correction/replay, persisted Payment/Allocation foundation и audit.

Проверена фактическая task-owned production/test surface:

- `src/lib/server/modules/center-scheduling/public.ts`;
- `src/lib/server/modules/financial-ledger/public.ts`;
- `src/lib/server/platform/database.ts`;
- `src/lib/server/composition-root.ts`;
- `tests/center-scheduling/recurring-scheduling.test.ts`;
- `tests/financial-ledger/historical-charges.test.ts`.

Для boundary и persistence контекста прочитаны task-linked feature/spec docs:
`.memory-bank/features/FT-002-center-and-scheduling.md`,
`.memory-bank/features/FT-006-financial-ledger.md`,
`.memory-bank/contracts/boundary-map.md`,
`.memory-bank/contracts/financial-ledger.md`,
`.memory-bank/contracts/access-control.md`,
`.memory-bank/domains/core-domain.md`,
`.memory-bank/states/lifecycle-map.md` и
`.memory-bank/architecture/system-architecture.md`. Сохранённые W4 execution,
functional и semantic artifacts использовались как input locators; их verdicts
не переоценивались и не изменялись.

Review не расширялся до repo-wide, downstream W5 payment commands, routes/UI,
других waves или lifecycle state. Project checks не перезапускались: advisory
review проверял debt-механизмы статически по текущему source и сохранённым
evidence.

## Подтверждённые material findings

### TD-W4-01 — Schema bootstrap не является upgrade path

- **Приоритет:** high — закрыть до первого real-data deployment или первого
  изменения формы существующей таблицы.
- **Evidence:** `src/lib/server/platform/database.ts:11-173` при каждом открытии
  выполняет единый блок `CREATE TABLE IF NOT EXISTS`; W4 добавил туда
  `schedules`, `lessons`, `financial_price_settings`,
  `financial_lesson_charges`, `financial_payments`,
  `financial_payment_allocations` и `financial_audit_records`.
  Persistent default задаётся как `study-calendar.db` в
  `src/lib/server/platform/config.ts:5-8`, а `package.json:5-10` содержит только
  dev/build/check/test scripts без schema version или migration command.
  Canonical rule требует project-level linear schema/migration ownership в
  `.memory-bank/domains/core-domain.md:64-72`.
- **Debt mechanism:** bootstrap создаёт отсутствующие таблицы, но не version-ит,
  не проверяет и не преобразует уже существующую таблицу прежней формы. Fresh
  `:memory:` probes в
  `.tasks/TASK-006-T2-FT-002-W4/execution-evidence.md` и
  `.tasks/TASK-007-T3-FT-006-W4/execution-evidence.md` не воспроизводят upgrade
  persistent базы.
- **Impact:** следующая schema change может оставить приложение на silently
  stale schema; стоимость и риск ручной совместимости растут после появления
  реальных финансовых и scheduling данных. W4 расширяет уже существующий
  W3-механизм на финансовые таблицы и Lesson lifecycle.
- **Минимальное remediation direction:** ввести одну линейную transactional
  SQLite migration sequence с монотонной schema version и probe
  `previous schema -> current`; startup должен применять sequence, а не
  трактовать bootstrap DDL как upgrade mechanism.

### TD-W4-02 — Application composition root раскрывает write-capable database bypass

- **Приоритет:** high — privacy/authorization и financial-integrity blast radius
  растёт с каждым новым consumer slice.
- **Evidence:** exported `CompositionRoot` содержит `database: SharedDatabase` и
  возвращает его через `createCompositionRoot`/`getCompositionRoot`
  (`src/lib/server/composition-root.ts:8-12,15-30,34-39`). W4 tests используют
  этот raw handle для fixture writes и assertions:
  `tests/center-scheduling/recurring-scheduling.test.ts:65-82,210-213` и
  `tests/financial-ledger/historical-charges.test.ts:77-91,110-133`.
  Canonical architecture требует, чтобы module-owned writes шли через owner
  commands, а read composition — через public queries
  (`.memory-bank/architecture/system-architecture.md:162-182`).
- **Debt mechanism:** любой future route или neighbor slice, импортирующий
  обычный application root, технически получает write-capable
  `root.database.sqlite` и может обойти owner-side authorization, audit и
  financial invariants. W4 сделал bypass шире, добавив в тот же доступный handle
  Payment/Allocation и charge tables.
- **Impact:** write ownership зависит от review/search discipline, а не от
  доступного API; случайный bypass может создать приватные или финансовые
  факты без текущего actor/scope check и потребует повторного scan на каждой
  новой capability.
- **Минимальное remediation direction:** application-facing root должен
  экспортировать только capability boundaries; lifecycle raw database оставить
  внутри composition wiring, а direct-SQL setup/inspection перенести в отдельный
  test harness.

### TD-W4-03 — Attendance reconciliation принимает caller-supplied transition как источник финансовой мутации

- **Приоритет:** high — риск financial correctness до появления реального
  attendance и payment data.
- **Evidence:** `FinancialLedgerBoundary.reconcileLessonCharge` принимает
  `attendanceTransition` от public caller и сам разрешает `admin`/`teacher`
  (`src/lib/server/modules/financial-ledger/public.ts:131-168`). После проверки
  только actor и Scheduling lesson scope он вызывает
  `applyAttendanceTarget` и записывает/отменяет Charge; persisted Attendance
  state или Learning Progress owner command не читаются и не валидируются.
  W4 tests вызывают эту public method напрямую, например
  `tests/center-scheduling/recurring-scheduling.test.ts:173-201` и
  `tests/financial-ledger/historical-charges.test.ts:95-107`.
  При этом canonical boundary требует, чтобы Learning Progress владел
  attendance и вызывал reconciliation после собственной validation
  (`.memory-bank/contracts/boundary-map.md:187-204`; orchestration row
  `:228-233`), а Financial Contract фиксирует ту же последовательность
  (`.memory-bank/contracts/financial-ledger.md:17-20,72-80`).
- **Debt mechanism:** caller может предъявить transition, не совпадающий с
  фактическим attendance state, и изменить Charge/Allocation/Audit без
  соответствующего attendance transition. Текущий `from` используется только
  как условие ветвления и не является проверкой owner-owned state.
- **Impact:** direct route/consumer misuse может создать charge для фактически
  absent lesson или отменить active charge без attendance change; downstream
  balance и audit будут internally consistent, но отражать неверное событие.
  Это скрывает нарушение ownership до сверки с Learning Progress.
- **Минимальное remediation direction:** сделать reconciliation
  transaction-scoped internal port, вызываемый только после owner-validated
  Learning Progress transition, либо передавать и проверять persisted
  attendance state внутри orchestration transaction; Financial Ledger при этом
  сохраняет исключительное право записи финансовых фактов.

### TD-W4-04 — Cross-slice atomicity зависит от невыраженного same-database wiring

- **Приоритет:** medium — закрыть до повторения этого boundary pattern для
  attendance, payment или других cross-slice commands.
- **Evidence:** `FinancialScopePort` передаёт только обычные query methods
  (`src/lib/server/modules/financial-ledger/public.ts:21-32`), а
  `reconcileLessonCharge` открывает transaction Financial Ledger и затем
  вызывает внешний scope port внутри неё (`:140-167`). Composition root
  отдельно injects `database` в Center & Scheduling и Financial Ledger
  (`src/lib/server/composition-root.ts:15-30`), но тип порта не выражает, что
  provider обязан читать через тот же transaction/connection.
  Canonical persistence rule допускает shared transaction для atomicity, но
  требует explicit boundary (`.memory-bank/domains/core-domain.md:64-72`;
  `.memory-bank/contracts/financial-ledger.md:72-80`).
- **Debt mechanism:** текущий singleton wiring корректен только при сохранении
  конкретного общего `SharedDatabase` instance. Совместимый по TypeScript port,
  подключённый к другой connection/adapter или самостоятельно создающий
  transaction, может прочитать stale scope/lesson facts или отделить их от
  financial rollback.
- **Impact:** изменение persistence wiring или копирование этого pattern в
  Learning Progress/payment commands создаёт silent partial-state или
  authorization race risk; transaction semantics приходится восстанавливать из
  implementation details.
- **Минимальное remediation direction:** выразить transaction-scoped provider
  handle/command contract и закрепить failure probe, где provider fact read
  succeeds, последующая owner write fails, и финансовая мутация полностью
  откатывается.

### TD-W4-05 — Scheduling conflict errors протекают как SQLite-specific failures

- **Приоритет:** medium.
- **Evidence:** `createRecurringSchedule` и `addLesson` выполняют прямые
  `INSERT`, а `transferLesson` — прямой `UPDATE` без mapping ожидаемых
  uniqueness conflicts (`src/lib/server/modules/center-scheduling/public.ts:248-365`).
  Схема закрепляет `UNIQUE (schedule_id, lesson_date)` и идентичность schedule
  (`src/lib/server/platform/database.ts:81-108`). Поэтому повторный schedule ID,
  duplicate lesson date или transfer на уже занятую дату выбрасывает raw
  better-sqlite3 exception вместо устойчивого domain error; W4 acceptance tests
  проверяют успешные selected-exception paths, но не нормализуют этот failure contract
  (`tests/center-scheduling/recurring-scheduling.test.ts:115-153`).
- **Debt mechanism:** public Center & Scheduling boundary связывает callers и
  tests с SQLite constraint wording/engine behavior, хотя конфликт является
  ожидаемым domain outcome, а не неизвестным persistence failure.
- **Impact:** смена SQLite version/adapter или добавление route-level retry/UI
  handling меняет observable failure без изменения product semantics; callers не
  могут надёжно отличить duplicate/occupied schedule state от infrastructure
  failure.
- **Минимальное remediation direction:** внутри scheduling boundary распознавать
  только ожидаемые uniqueness conflicts и преобразовывать их в стабильные
  domain errors (`schedule-exists`, `lesson-date-occupied` и т.п.); неизвестные
  persistence failures оставлять исходными.

## Неопределённость и исключённые утверждения

- Persistent `study-calendar.db` не инспектировалась; TD-W4-01 подтверждает
  отсутствие upgrade mechanism, но не утверждает, что уже произошла corruption.
- В репозитории нет W4 routes/UI, поэтому фактический production misuse raw DB
  или direct reconciliation не наблюдался; TD-W4-02 и TD-W4-03 фиксируют
  доступный механизм и его material blast radius.
- Payment command, edit/cancel payment, marker placement и idempotency принадлежат
  TASK-008 / W5 и не оценивались как W4 debt.
- Existing W3 debt reports были прочитаны для collision/continuity context;
  этот отчёт не перезаписывает и не изменяет их.

## Reviewer summary

- **verdict:** `REQUEST_CHANGES` — advisory technical-debt verdict, не gate и не
  workflow route.
- **findings:** пять подтверждённых material mechanisms: два high carry-forward/
  expanded boundary findings, один high financial ownership finding и два medium
  coupling/error-contract findings.
- **evidence_checked:** indexed W4 task records; W4 task protocols and final
  reports; actual scheduling, financial, database, composition and focused-test
  source; direct canonical feature, boundary, access, domain, lifecycle and
  architecture contracts.
- **risks_or_questions:** remediation priority is implementation-owner work;
  no operator-owned product/spec decision is required to record these findings.

Этот report создан без implementation, verification, red-verification,
promotion, selection, lifecycle change, task-card edit или Memory Bank sync.
