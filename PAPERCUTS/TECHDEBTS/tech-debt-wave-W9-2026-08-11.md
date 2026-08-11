---
description: Advisory technical-debt report for W9 TASK-019, TASK-020, and TASK-021.
status: advisory
---

# Technical Debt — Wave W9 / FT-001 / TASK-019 + TASK-020 + TASK-021

## RESULT

Подтверждены три material/minor findings на проверенной change surface:
один security-boundary finding средней приоритетности и два minor coupling/
reliability finding. Provider verification, session/invitation atomicity и
protected Admin authorization имеют независимые `PASS` + `semantic-pass`
evidence; отдельный debt по этим outcome не подтверждён.

## Checked scope

Проверены только W9 task cards и их фактическая implementation/evidence
surface:

- `.memory-bank/tasks/TASK-019-T3-FT-001-W9.task.json` — provider adapters и
  server-side session/invitation lifecycle;
- `.memory-bank/tasks/TASK-020-T3-FT-001-W9.task.json` — browser login,
  logout и invitation acceptance transport;
- `.memory-bank/tasks/TASK-021-T3-FT-001-W9.task.json` — protected Admin
  participant provisioning;
- `src/lib/server/adapters/`, `src/lib/server/platform/auth-state.ts`,
  `src/lib/server/platform/session-cookie.ts`,
  `src/lib/server/modules/identity-access/public.ts`;
- `src/routes/auth/`, `src/routes/login/`, `src/routes/invite/`,
  `src/routes/admin/`, `src/hooks.server.ts` и соответствующие
  `tests/adapters/`, `tests/routes/`,
  `tests/identity-access/session-lifecycle.test.ts`;
- task-local execution/verification/red-verification evidence в
  `.tasks/TASK-019-T3-FT-001-W9/`, `.tasks/TASK-020-T3-FT-001-W9/`,
  `.tasks/TASK-021-T3-FT-001-W9/` и `.protocols/TASK-019-T3-FT-001-W9/`,
  `.protocols/TASK-020-T3-FT-001-W9/`, `.protocols/TASK-021-T3-FT-001-W9/`;
- normative basis: `.memory-bank/architecture/system-architecture.md`,
  `.memory-bank/contracts/provider-adapters.md`,
  `.memory-bank/contracts/authentication-transport.md`,
  `.memory-bank/contracts/access-control.md` и
  `.memory-bank/contracts/boundary-map.md`.

Unrelated dirty-worktree changes, lifecycle/state files и historical tasks
вне TASK-019/020/021 не оценивались.

## FINDINGS

### TD-W9-001 — callback state не привязан к browser context

- **Priority:** Medium — security/access boundary.
- **Evidence:** `src/lib/server/platform/auth-state.ts:24-31,45-60`
  хранит в state только `provider`, `callbackUrl`, optional
  `invitationToken` и `issuedAt`; browser-specific nonce/cookie binding там
  отсутствует. `src/routes/auth/transport.server.ts:91-119` выпускает state и
  редиректит к provider, но не устанавливает browser-bound state cookie.
  `src/routes/auth/transport.server.ts:122-168` принимает для callback только
  `provider`, `callbackUrl` и query `state`, затем устанавливает
  `foundation_session` в browser, отправивший callback.
- **Observable debt mechanism:** один и тот же действительный callback URL со
  state может быть передан в другой browser/request: callback contract не
  содержит проверки, отличающей browser, который начал flow. Existing
  verifier evidence покрывает tampered/mismatched/replayed state, но не
  cross-browser state binding (`.protocols/TASK-020-T3-FT-001-W9/red-verification.md`,
  `.tasks/TASK-020-T3-FT-001-W9/verifier-probe.test.ts`).
- **Impact:** provider-authenticated callback может установить login session в
  browser, который flow не начинал (login-CSRF/session-fixation path). Для
  invitation flow тот же portable state позволяет завершить acceptance в
  другом browser и переносит session результата туда; это повышает риск
  ошибочного account context и стоимость последующей security regression
  проверки.
- **Smallest remediation direction:** при `start` связать opaque state с
  короткоживущим HttpOnly browser nonce (или эквивалентным server-side
  pre-auth handle), при `callback` проверить и одноразово удалить эту связь;
  добавить один cross-browser negative regression рядом с существующей
  state-проверкой.

### TD-W9-002 — TTL auth-state не ограничивает lifetime in-memory entries

- **Priority:** Minor — reliability/memory retention.
- **Evidence:** `src/lib/server/platform/auth-state.ts:30-31,45-60`
  добавляет каждый issued state в process-local `Map`. В
  `src/lib/server/platform/auth-state.ts:63-87` запись удаляется только после
  успешного `consume` (`:81`); expired/mismatched/invalid paths на `:69-79`
  запись не удаляют. Дополнительно `src/routes/auth/transport.server.ts:102-116`
  выпускает state до provider `begin`, поэтому missing configuration или
  provider start failure также оставляет entry в Map.
- **Observable debt mechanism:** заявленный пятихминутный TTL является только
  проверкой при consume, а не retention bound. Abandoned login/invite starts и
  provider failures накапливают state entries до завершения процесса; active
  cleanup, capacity limit или failed-start rollback отсутствуют.
- **Impact:** повторяемые незавершённые login attempts создают
  неограниченное удержание небольших server-memory records, что повышает
  memory pressure и усложняет эксплуатацию long-lived server process.
- **Smallest remediation direction:** удалять просроченные entries при
  `issue`/`consume` и удалять только что выпущенный state при ошибке provider
  `begin`; не вводить отдельное persistence store для этой локальной
  cleanup-задачи.

### TD-W9-003 — provider configuration wiring находится в route transport

- **Priority:** Minor — architecture coupling.
- **Evidence:** accepted architecture assigns settings/adapter wiring to the
  single composition root (`.memory-bank/architecture/system-architecture.md:55-57,162-164`)
  and says secrets enter through composition-root/platform adapters
  (`:240-245`). Фактический default construction находится в
  `src/routes/auth/transport.server.ts:190-201`: route-owned module читает
  `process.env.TELEGRAM_BOT_TOKEN`, `process.env.GOOGLE_CLIENT_ID` и
  `process.env.GOOGLE_CLIENT_SECRET`, создаёт provider registry и держит его в
  lazy module singleton. `src/lib/server/platform/config.ts:1-8` содержит
  только database config; provider config seam там отсутствует.
- **Observable debt mechanism:** auth route одновременно остаётся HTTP
  adapter и production composition seam для provider credentials/adapter
  construction. Добавление provider, изменение config source или отдельная
  runtime wiring policy требуют менять route module; injected test boundary и
  production default wiring живут в разных местах.
- **Impact:** лишняя coupling между route shape и provider runtime setup
  повышает стоимость повторного использования/замены provider adapter и риск
  расхождения между isolated tests и production wiring. Это не evidence
  secret leakage: текущий semantic evidence подтверждает, что secrets не
  попадают в client output.
- **Smallest remediation direction:** собрать provider registry из
  composition-root/platform configuration и передать его в
  `createAuthenticationTransport`; оставить route transport dependency-only.

## DEFERRED_RISKS

- `AuthenticationStateStore` намеренно process-local (`Map` в
  `src/lib/server/platform/auth-state.ts:30-31`). При process restart или
  смене server instance незавершённый provider callback станет invalid. Это
  наблюдаемое поведение, но принятая архитектура сейчас явно ограничена одним
  SvelteKit server process и не требует shared/multi-server auth-state store
  (`.memory-bank/architecture/system-architecture.md:50-58,240-247`), поэтому
  отдельным текущим finding не квалифицируется.
- Existing W9 verification использует disposable provider doubles и не
  является live credential/provider operational smoke; canonical contract
  прямо называет configured live provider smoke operational follow-up
  (`.memory-bank/contracts/provider-adapters.md:41-44,61-64`,
  `.memory-bank/contracts/authentication-transport.md:84-87`). Runtime
  provider compatibility в production не подтверждён этим audit и не
  преобразован в finding без live failure evidence.

## VALIDATION

- Read-only source/evidence cross-check выполнен для всех трёх task cards,
  direct linked contracts, current W9 source и task-local probes.
- Existing task verification cross-check: TASK-019 focused `2 files / 11
  tests` и project gates `check/build/test` (`19 files / 64 tests`); TASK-020
  verifier probe, SSR smoke и `20 files / 69 tests`; TASK-021 verifier probe,
  SSR/form/API smoke и `21 files / 74 tests` — все recorded as PASS.
- Existing T3 semantic reports for TASK-019, TASK-020 и TASK-021 record
  `semantic-pass`; их отсутствие findings принято как evidence по already
  checked ownership/atomicity/authorization claims, но не отменяет трёх
  additional mechanisms above, которые не были admitted там.
- Перед handoff отчёт перечитан; review не изменял code, tasks, specs,
  lifecycle или tests. После создания отчёта проверено, что единственный
  новый path от этого review — этот Markdown-файл.

## NEXT_STEP

Сначала устранить TD-W9-001 перед production browser-auth rollout; затем
сделать bounded cleanup для TD-W9-002 и вынести provider wiring по TD-W9-003
при следующем изменении auth transport. Workflow/lifecycle state не менять
этим advisory report.
