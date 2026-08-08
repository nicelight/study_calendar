---
description: Advisory technical-debt report for the completed Wave 3 boundary.
status: advisory
scope: wave W3
created: 2026-08-08
---
# Technical Debt — Wave 3

## Advisory status

Этот отчёт не меняет implementation или workflow state, не отменяет текущие
functional/semantic verdicts и не является blocker, gate либо lifecycle route.

## Проверенная поверхность

Review intent: `/tech-debt wave W3`.

Wave 3 разрешена через `.memory-bank/tasks/index.json` в два завершённых T3 task:

- `.memory-bank/tasks/TASK-004-T3-FT-001-W3.task.json` — external identity binding;
- `.memory-bank/tasks/TASK-005-T3-FT-002-W3.task.json` — center membership и class modes,
  включая сохранённый Attempt 1 semantic-fail и текущую исправленную Attempt 2
  пару functional PASS / semantic-pass.

Проверен task-owned production/test delta:

- `src/lib/server/modules/identity-access/public.ts`;
- `src/lib/server/modules/center-scheduling/public.ts`;
- `src/lib/server/platform/database.ts`;
- `tests/identity-access/provider-binding.test.ts`;
- `tests/center-scheduling/membership-class-mode.test.ts`;
- `tests/foundation/index.test.ts`.

Для проверки непосредственного wiring и persistence context также прочитаны
`src/lib/server/modules/identity-access/internal.ts`,
`src/lib/server/composition-root.ts` и `src/lib/server/platform/config.ts`.
Evidence basis включает task records, execution evidence и все текущие/исторические
Wave 3 final reports под `.tasks/TASK-004-T3-FT-001-W3/` и
`.tasks/TASK-005-T3-FT-002-W3/`, а также task-linked feature, boundary,
access-control, lifecycle, domain и architecture contracts.

Review не расширялся до repo-wide, других waves или downstream features.
Project checks не перезапускались: уже сохранённые evidence использовались как
input locator, а debt-механизмы проверялись статически по текущему source.

## Подтверждённые findings

### TD-W3-01 — Schema bootstrap не является upgrade path

- Приоритет: **high**, до первого real-data deployment либо первого
  non-additive schema change.
- Evidence: `src/lib/server/platform/database.ts:15-81` повторно исполняет один
  блок `CREATE TABLE IF NOT EXISTS`; Wave 3 добавила туда
  `provider_binding_confirmations`, `classes`, `teacher_assignments`,
  `class_students` и `parent_student_links`. В source/package scripts нет
  schema version или упорядоченной migration sequence. При этом runtime по
  умолчанию открывает persistent `study-calendar.db`
  (`src/lib/server/platform/config.ts:5-8`).
- Debt mechanism: отсутствующая таблица будет создана, но уже существующая
  таблица с прежней формой не будет проверена или изменена. In-memory Wave 3
  probes каждый раз строят fresh schema и поэтому не воспроизводят upgrade
  существующей базы.
- Практический impact: последующие schema changes требуют ручной совместимости
  внутри constructor DDL и несут риск запуска приложения на silently stale
  schema; стоимость и риск возрастают после появления реальных данных.
- Минимальное направление remediation: до real data ввести одну линейную,
  transactional SQLite migration sequence с монотонной schema version и одним
  probe `previous version -> current`; constructor должен применять только эту
  sequence.

### TD-W3-02 — Application-facing composition root раскрывает raw database bypass

- Приоритет: **high** из-за privacy/authorization blast radius последующих
  slices.
- Evidence: публичный `CompositionRoot` содержит `database: SharedDatabase`
  (`src/lib/server/composition-root.ts:7-11`), а `getCompositionRoot()` возвращает
  тот же объект (`src/lib/server/composition-root.ts:30-35`). Wave 3 tests уже
  используют `root.database.sqlite` для прямых записей и чтений, например
  `tests/foundation/index.test.ts:34-39`,
  `tests/identity-access/provider-binding.test.ts:20-64` и
  `tests/center-scheduling/membership-class-mode.test.ts:7-24`.
- Debt mechanism: любой будущий route или соседний slice, импортирующий обычный
  application root, технически получает тот же write-capable SQLite handle,
  хотя canonical boundary запрещает consumer writes. Некоторые invariants,
  включая one-student `individual` mode, защищены owner commands
  (`src/lib/server/modules/center-scheduling/public.ts:124-188`), а не самой
  таблицей `class_students` (`src/lib/server/platform/database.ts:65-72`).
- Практический impact: соблюдение write ownership зависит от review/search, а
  не от доступного API; случайный bypass может обойти authorization и owner-side
  invariants и потребует повторных repository scans на каждом feature.
- Минимальное направление remediation: application-facing root должен
  экспортировать только capability boundaries; write-capable DB lifecycle
  оставить внутри composition wiring, а прямой handle предоставлять лишь
  отдельному test harness.

### TD-W3-03 — Public provider-binding failure зависит от SQLite error text

- Приоритет: **medium**.
- Evidence: duplicate identity завершается непосредственным SQLite exception
  из `INSERT` (`src/lib/server/modules/identity-access/public.ts:109-116`), а
  acceptance probe закрепляет vendor-specific текст
  `UNIQUE constraint failed` (`tests/identity-access/provider-binding.test.ts:232-242`).
  Ограничения, порождающие сообщение, находятся в
  `src/lib/server/platform/database.ts:31-36`.
- Debt mechanism: публичная Identity & Access boundary не переводит ожидаемый
  uniqueness conflict в стабильный domain failure, поэтому observable error
  contract связан с engine/schema naming.
- Практический impact: изменение schema, SQLite version или persistence adapter
  ломает caller handling и тесты, хотя product outcome не меняется; наружу также
  просачивается storage detail вместо устойчивого provider-binding результата.
- Минимальное направление remediation: внутри Identity & Access распознавать
  только ожидаемые uniqueness conflicts и преобразовывать их в стабильный
  domain error; неизвестные persistence failures не маскировать.

### TD-W3-04 — Cross-slice atomicity держится на невыраженном same-database wiring

- Приоритет: **medium**.
- Evidence: `createParticipant` открывает Center & Scheduling transaction и
  вызывает injected `provisionAccount`
  (`src/lib/server/modules/center-scheduling/public.ts:44-46,68-88`). Internal
  provisioning writer отдельно захватывает `SharedDatabase` и открывает свою
  transaction (`src/lib/server/modules/identity-access/internal.ts:6-21`).
  Только composition root связывает оба объекта с одним instance
  (`src/lib/server/composition-root.ts:13-26`); тип порта не выражает требование
  участия в caller transaction.
- Debt mechanism: текущая atomicity корректна лишь при сохранении конкретной
  скрытой wiring-предпосылки. Совместимый по TypeScript port, подключённый к
  другому connection/adapter или самостоятельно коммитящий write, может оставить
  account/invitation после сбоя membership insert.
- Практический impact: изменение persistence wiring или повторение этого pattern
  в следующем cross-slice command несёт тихий regression risk и заставляет
  поддерживающего агента заново восстанавливать transaction semantics из
  реализации.
- Минимальное направление remediation: сделать участие в одной transaction
  явным в internal provisioning port (transaction-scoped command/handle) и
  закрепить один failure probe, где provisioning succeeds, последующий
  membership write fails, а обе owner states откатываются.

## Неопределённость

- `provider_binding_confirmations` хранит только `session_token`
  (`src/lib/server/platform/database.ts:38-40`) и действует до успешного binding
  либо удаления/revocation session; freshness timestamp/expiry отсутствует.
  Contracts требуют re-confirmed current session, но не задают максимальный
  возраст confirmation. Поэтому этот механизм не принят как finding: без
  product/security policy нельзя доказать, что session-lifetime one-use
  confirmation неверна или создаёт material debt.
- Production Telegram/Google network adapters и credentials были явно вне
  Wave 3 task scope; синхронный `ProviderVerifier` проверен только deterministic
  doubles. Operational suitability реального provider I/O по этой поверхности
  подтвердить или опровергнуть нельзя.
- Persistent pre-W3 database не инспектировалась; TD-W3-01 фиксирует доказанный
  upgrade-path mechanism, а не утверждает уже случившуюся data corruption.

## Итог

Подтверждены четыре material technical-debt finding: два high и два medium.
Они advisory-only и не изменяют завершённость Wave 3 или её сохранённые verdicts.
