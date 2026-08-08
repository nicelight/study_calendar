---
description: Independent advisory technical-debt report for completed Wave 3 tasks.
status: advisory
scope: wave W3
created: 2026-08-08
---
# Technical Debt — Wave W3

## Статус отчёта

Review intent: `/tech-debt wave W3`.

Отчёт advisory-only: он не изменяет implementation, Memory Bank, task/spec/status,
workflow verdict, gate, blocker или lifecycle route.

## Точно проверенный scope

Wave W3 разрешена через `.memory-bank/tasks/index.json` ровно в две завершённые
задачи:

- `.memory-bank/tasks/TASK-004-T3-FT-001-W3.task.json` (`status: done`) —
  подтверждённая external identity binding и failure atomicity;
- `.memory-bank/tasks/TASK-005-T3-FT-002-W3.task.json` (`status: done`) —
  center membership и class modes, включая сохранённый Attempt 1
  `semantic-fail` и текущие Attempt 2 `PASS` / `semantic-pass`.

Проверен task-owned production/test surface, названный execution evidence и
final reports:

- `src/lib/server/modules/identity-access/public.ts`;
- `src/lib/server/modules/center-scheduling/public.ts`;
- `src/lib/server/platform/database.ts`;
- `tests/identity-access/provider-binding.test.ts`;
- `tests/center-scheduling/membership-class-mode.test.ts`;
- `tests/foundation/index.test.ts`;
- `.tasks/TASK-004-T3-FT-001-W3/` — execution evidence и все final reports;
- `.tasks/TASK-005-T3-FT-002-W3/` — execution evidence и все Attempt 1/2 final
  reports;
- текущие functional/semantic protocols в
  `.protocols/TASK-004-T3-FT-001-W3/` и
  `.protocols/TASK-005-T3-FT-002-W3/`.

Для непосредственного wiring и persistence context прочитаны только
`src/lib/server/modules/identity-access/internal.ts`,
`src/lib/server/composition-root.ts` и `src/lib/server/platform/config.ts`.
Normative basis ограничена прямыми task links: FT-001/FT-002 acceptance criteria,
Account Provisioning Boundary, Calendar and Membership Query Boundary, Access
Control Contract, Lifecycle Map access/membership, Core Domain ownership и
System Architecture shared-database/composition rules.

Review не расширялся до repo-wide, других waves/tasks, routes, downstream
features или production provider adapters. Checks не перезапускались: сохранённые
W3 verdict/evidence использовались как locators, а debt-механизмы проверялись по
текущему source. Уже существующий
`PAPERCUTS/TECHDEBTS/tech-debt-wave-W3-2026-08-08.md` был прочитан только для
collision/overwrite safety и не использовался как authority для findings.

## Подтверждённые material findings

### TD-W3-01 — Schema bootstrap не реализует upgrade path

- **Приоритет:** high — закрыть до первого real-data deployment или первого
  изменения формы существующей таблицы.
- **Evidence:** `src/lib/server/platform/database.ts:11-81` при каждом открытии
  исполняет единый блок `CREATE TABLE IF NOT EXISTS`; W3 добавляет в этот блок
  `provider_binding_confirmations`, `classes`, `teacher_assignments`,
  `class_students` и `parent_student_links`. Application wiring напрямую создаёт
  `SharedDatabase` (`src/lib/server/composition-root.ts:13-18`), а default config
  указывает persistent `study-calendar.db`
  (`src/lib/server/platform/config.ts:5-8`). Canonical persistence contract требует
  project-level linear schema/migration ownership
  (`.memory-bank/domains/core-domain.md:64-72`). W3 evidence использует fresh
  in-memory database per test.
- **Debt mechanism:** bootstrap создаёт отсутствующие таблицы, но не version-ит,
  не проверяет и не преобразует прежнюю форму уже существующей таблицы. Fresh-DB
  probes не воспроизводят upgrade persistent базы.
- **Impact:** последующие schema changes будут накапливать ручную совместимость
  внутри constructor DDL и риск запуска на stale schema; после появления данных
  recoverability и стоимость проверки существенно ухудшаются.
- **Минимальное remediation direction:** до real data ввести одну линейную
  transactional SQLite migration sequence с монотонной schema version и одним
  probe `previous schema -> current`; application startup должен применять эту
  sequence вместо использования bootstrap DDL как upgrade mechanism.
- **Uncertainty:** существующая persistent база не инспектировалась; finding
  подтверждает механизм и будущую стоимость, а не уже произошедшую corruption.

### TD-W3-02 — Application composition root раскрывает write-capable database bypass

- **Приоритет:** high — privacy/authorization blast radius растёт с каждым новым
  consumer slice.
- **Evidence:** exported `CompositionRoot` содержит `database: SharedDatabase`,
  а `getCompositionRoot()` возвращает этот же объект
  (`src/lib/server/composition-root.ts:7-11,30-35`). `SharedDatabase.sqlite`
  публично write-capable (`src/lib/server/platform/database.ts:7-10`). W3 probes
  уже используют этот путь для прямых business-table writes/reads:
  `tests/identity-access/provider-binding.test.ts:18-64`,
  `tests/center-scheduling/membership-class-mode.test.ts:7-24` и
  `tests/foundation/index.test.ts:34-39`. Canonical boundaries запрещают consumer
  writes и требуют owner commands (`.memory-bank/contracts/boundary-map.md:85-89,
  119-128`; `.memory-bank/architecture/system-architecture.md:162-167`).
- **Debt mechanism:** обычный application root технически выдаёт каждому
  импортирующему его consumer тот же raw SQLite handle, которым можно обойти
  owner-side authorization и invariants. Например, one-student meaning
  защищается командами в `center-scheduling/public.ts:124-188`, но не самой
  таблицей `class_students` в `database.ts:65-72`.
- **Impact:** write ownership поддерживается review/search discipline, а не
  доступным API; каждый следующий slice увеличивает regression risk и повторную
  стоимость bypass review, включая риск обхода privacy boundaries.
- **Минимальное remediation direction:** application-facing root экспортирует
  только capability boundaries; raw database lifecycle остаётся внутри wiring,
  а disposable direct-SQL setup/inspection получает отдельный test harness.
- **Uncertainty:** routes и downstream consumers не инспектировались по заданному
  scope; finding относится к уже экспортированной bypass capability, а не к
  утверждению о текущем production misuse.

### TD-W3-03 — Ожидаемый provider-binding conflict зависит от SQLite error text

- **Приоритет:** medium.
- **Evidence:** duplicate external identity доходит напрямую до SQLite `INSERT`
  (`src/lib/server/modules/identity-access/public.ts:95-117`), а W3 acceptance
  probe требует vendor-specific `/UNIQUE constraint failed/`
  (`tests/identity-access/provider-binding.test.ts:212-242`). Сообщение порождают
  schema constraints в `src/lib/server/platform/database.ts:31-36`.
- **Debt mechanism:** публичная Identity & Access boundary не переводит
  ожидаемый uniqueness conflict в стабильный domain failure, поэтому observable
  error contract связан с engine error wording и schema identity.
- **Impact:** изменение constraint/schema, SQLite version или persistence adapter
  ломает caller handling и тест без изменения product outcome; storage detail
  протекает через capability boundary.
- **Минимальное remediation direction:** внутри Identity & Access распознавать
  только ожидаемые uniqueness conflicts и преобразовывать их в один стабильный
  domain error; остальные persistence failures не маскировать.
- **Uncertainty:** HTTP/UI error mapping не входил в scope; finding ограничен
  текущим public boundary и закрепившим его W3 probe.

### TD-W3-04 — Cross-slice atomicity зависит от невыраженного same-database wiring

- **Приоритет:** medium.
- **Evidence:** `createParticipant` открывает Center & Scheduling transaction и
  вызывает injected `provisionAccount`
  (`src/lib/server/modules/center-scheduling/public.ts:44-46,68-88`). Internal
  provisioning writer независимо замыкает `SharedDatabase` и открывает свою
  transaction (`src/lib/server/modules/identity-access/internal.ts:4-21`). Только
  composition root связывает оба с одним database instance
  (`src/lib/server/composition-root.ts:13-26`); тип порта не выражает участие в
  caller transaction. Canonical contract разрешает cross-slice owners
  участвовать в одной transaction, когда use case требует atomicity
  (`.memory-bank/domains/core-domain.md:64-72`).
- **Debt mechanism:** текущая atomicity зависит от скрытого identity-of-instance
  wiring contract. Type-compatible writer, подключённый к другому
  connection/adapter или самостоятельно завершающий write, способен отделить
  account/invitation commit от membership insert.
- **Impact:** изменение persistence wiring или повторение pattern в следующих
  cross-slice commands несёт silent partial-state regression risk и заставляет
  заново восстанавливать transaction semantics из implementation details.
- **Минимальное remediation direction:** явно выразить same-transaction
  participation в internal provisioning port/writer contract и закрепить один
  failure probe: provisioning succeeds, последующий membership insert fails,
  обе owner states откатываются.
- **Uncertainty:** текущая composition wiring использует один `SharedDatabase`,
  поэтому finding не утверждает, что W3 сейчас оставляет partial state; он
  фиксирует доказанную скрытую coupling dependency.

## Не принятые как findings неопределённости

- `provider_binding_confirmations` хранит только `session_token`
  (`src/lib/server/platform/database.ts:38-40`) и не имеет отдельного TTL.
  Contracts требуют re-confirmed current session, но не задают максимальный
  возраст confirmation, поэтому material debt без product/security policy не
  доказан.
- Production Telegram/Google network adapters и credentials явно не входили в
  W3 task outcome; deterministic synchronous verifier doubles не позволяют
  оценить operational provider I/O.
- Checks и persistent upgrade не запускались в этой advisory review; их
  результаты не заявлены сверх сохранённого task-owned evidence.

## Итог

Подтверждены четыре material technical-debt findings: два high и два medium.
Они не отменяют завершённость `TASK-004`/`TASK-005` и не меняют сохранённые
functional или semantic verdicts.
