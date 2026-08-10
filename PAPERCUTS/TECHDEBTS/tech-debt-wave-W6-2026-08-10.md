# Technical Debt Review — Wave W6 / TASK-016 + TASK-017

## Checked scope

Проверена только завершённая поверхность `W6` для `TASK-016-T3-FT-004-W6` и
`TASK-017-T3-FT-004-W6`: их task cards, `.tasks/` execution/functional/semantic/
MB-SYNC evidence, `.protocols/` durable evidence, task-local probes/configs и
текущий diff в заявленных Collaboration/database/test paths.

Проверенные источники:

- `.memory-bank/tasks/TASK-016-T3-FT-004-W6.task.json`;
- `.memory-bank/tasks/TASK-017-T3-FT-004-W6.task.json`;
- `.tasks/TASK-016-T3-FT-004-W6/` и
  `.protocols/TASK-016-T3-FT-004-W6/`;
- `.tasks/TASK-017-T3-FT-004-W6/` и
  `.protocols/TASK-017-T3-FT-004-W6/`;
- текущий diff для `src/lib/server/modules/collaboration/`,
  `src/lib/server/platform/database.ts` и `tests/collaboration/`.

В production source и зарегистрированных Collaboration tests текущего diff
нет; фактическая W6 evidence surface состоит из task-local probes/configs,
protocols и отчётов.

## Confirmed findings

### TD-W6-001 — Identity-reuse regression proof не входит в native test gate

- **Priority:** MEDIUM.
- **Evidence:** TASK-016 прямо фиксирует отсутствие изменений production и
  registered tests и оставляет disposable probe/config единственным isolated
  evidence surface (`.tasks/TASK-016-T3-FT-004-W6/execution-evidence.md:14-15,29-41`).
  TASK-017 фиксирует тот же факт (`.tasks/TASK-017-T3-FT-004-W6/execution-evidence.md:12-14,66-71`),
  а root Vitest invocation отдельно не обнаружил hidden `.tasks` files
  (`.tasks/TASK-017-T3-FT-004-W6/execution-evidence.md:18-23`). Native
  `npm run test` receipt при этом содержит только `12` файлов и `39` тестов
  (`.tasks/TASK-017-T3-FT-004-W6/execution-evidence.md:128-136`). Оба task-local
  config запускают ровно один скрытый probe-файл (`.tasks/TASK-016-T3-FT-004-W6/vitest.config.ts:4-9`,
  `.tasks/TASK-017-T3-FT-004-W6/vitest.config.ts:4-9`).
- **Observable debt mechanism:** принятые W6 сценарии center identity reuse,
  retained-row isolation и cross-center target/mutation denial проверяются
  disposable evidence, но не постоянным тестовым набором, который проходит
  стандартный проектный gate. Изменение Collaboration/database может вернуть
  дефект, а `npm run test` останется зелёным, потому что exact regression
  scenarios находятся в hidden `.tasks/`.
- **Practical impact:** material regression risk для последующих изменений
  scope/ownership/persistence; ручной повтор task-local probes становится
  обязательным, а отсутствие native coverage повышает стоимость безопасного
  сопровождения W6 boundary.
- **Smallest remediation direction:** перенести минимальные identity-reuse
  assertions для comments/reactions и threaded discussions в
  `tests/collaboration/` и включить их в native Vitest gate; task-local probes
  оставить только как одноразовое verifier evidence, а не единственную
  постоянную защиту.

### TD-W6-002 — Terminal lifecycle state противоречит durable handoff evidence

- **Priority:** MEDIUM.
- **Evidence:** обе authoritative task cards имеют `"status": "done"`
  (`.memory-bank/tasks/TASK-016-T3-FT-004-W6.task.json:4`,
  `.memory-bank/tasks/TASK-017-T3-FT-004-W6.task.json:4`). Одновременно
  TASK-016 execution/functional/semantic handoffs продолжают фиксировать или
  рекомендовать `in_progress` (`.tasks/TASK-016-T3-FT-004-W6/TASK-016-T3-FT-004-W6-S-EXE-final-report-docs-01.md:35-37`,
  `.tasks/TASK-016-T3-FT-004-W6/TASK-016-T3-FT-004-W6-S-VERIFY-final-report-docs-01.md:9-13`,
  `.tasks/TASK-016-T3-FT-004-W6/TASK-016-T3-FT-004-W6-S-RED-VERIFY-final-report-docs-01.md:9-13`).
  TASK-017 functional/semantic reports также рекомендуют сохранить
  `in_progress` (`.tasks/TASK-017-T3-FT-004-W6/TASK-017-T3-FT-004-W6-S-VERIFY-final-report-docs-01.md:34-41`,
  `.tasks/TASK-017-T3-FT-004-W6/TASK-017-T3-FT-004-W6-S-RED-VERIFY-final-report-docs-01.md:27-33`),
  тогда как combined W6 MB-SYNC называет обе карточки `done`
  (`.tasks/TASK-017-T3-FT-004-W6/TASK-017-T3-FT-004-W6-S-MB-SYNC-final-report-docs-01.md:25-28`).
- **Observable debt mechanism:** durable corpus содержит несколько
  несогласованных lifecycle interpretations без явной пометки, какие
  handoff snapshots superseded terminal state. Следующий scheduler/оператор
  должен вручную разрешать конфликт между карточкой, per-task reports и
  boundary sync.
- **Practical impact:** повторные audits могут ошибочно повторить verify/
  red-verify, удержать закрытые задачи открытыми или неверно оценить готовность
  зависимостей; это создаёт operational coupling и постоянную стоимость
  reconciliation.
- **Smallest remediation direction:** закрепить один workflow-owned canonical
  terminal marker и явно пометить прежние in-progress handoffs как historical/
  superseded, не переписывая immutable evidence.

## Uncertainty

Не запускались code, tests, verify, red-verify или sync; выводы основаны только
на существующих receipts, статических evidence и текущем diff. Runtime impact
регрессионного gap и частота lifecycle-конфликтов не измерялись. Production
correctness debt в source не подтверждён: task evidence и semantic reports
фиксируют зелёные isolated сценарии; подтверждён именно эксплуатационный debt
в test coverage и durable workflow evidence.

Этот отчёт advisory-only: он не меняет implementation, lifecycle, verdict,
blocker, gate, routing или workflow state.
