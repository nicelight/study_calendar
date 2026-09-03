---
description: Bounded Revision 2 task-plan review for the FT-004 browser-completion delta.
status: active
---
# Review FT-004 task planning surface

VERDICT: REJECT

REVIEWED_PLANNING_REVISION: 2

ARCHITECTURE_REVIEW: OWNER_DECISION_NEEDED

## Review mode and retained evidence

Это bounded rerun: текущая `Planning Revision: 2` совпадает с предыдущим
отчётом `APPROVE`, а exact delta установлен прямым сравнением текущих файлов.
Проверен новый browser surface: subject contract, изменения FT-004 и
IMPL-FT-004, protocol plan/decision log, индекс и `TASK-102`/`TASK-103`.
Неизменённые backend claims из предыдущего отчёта и TASK-011/TASK-016/TASK-017
удержаны только для backend scope; они не закрывают browser acceptance.

Оба semantic co-review focus обновлены fresh-контекстами на `gpt-5.6-luna`
(`xhigh`): (A) acceptance closure, exact claims, ownership and slicing; (B)
structural integrity, execution readiness, boundaries and T3 proof. Результаты
обоих focus учтены ниже. Отдельный fresh architecture review проведён для
вопроса о владельце participant labels.

## Structural integrity

- PASS: `Planning Revision: 2` положительный, Global Backbone `complete`, а
  Foundation gate `TASK-002-T3-FT-000-W1` имеет статус `done`.
- PASS: все 61 индексированных task entries уникальны и разрешаются; текущие
  FT-004 IDs согласованы с `T3/T2`, feature и wave; schema validation всех
  `*.task.json` проходит; dependency graph не содержит циклов или отсутствующих
  IDs.
- PASS: `TASK-102` и `TASK-103` — корректные product waves `W35/W36`, имеют
  валидные `planned` статусы при незавершённых зависимостях. Исторический
  `TASK-012-T2-FT-004-W6` не используется как dependency или fresh proof.

Evidence: `.memory-bank/spec-backbone.md:84-98`,
`.memory-bank/foundation.md:10-25`, `.memory-bank/tasks/index.json`,
`.memory-bank/schemas/task.schema.json`,
`.memory-bank/tasks/TASK-102-T3-FT-004-W35.task.json:1-26`,
`.memory-bank/tasks/TASK-103-T3-FT-004-W36.task.json:1-23`.

## Coverage and slicing

- PASS: accepted feature outcomes имеют стабильные headings
  `FT-004-AC-001`…`FT-004-AC-005` в feature и exact task locators в
  `TASK-103` (`source_artifacts:82-95`); `TASK-103.reqs` согласованы с AC.
- PASS: две browser задачи образуют независимые implementation outcomes:
  `TASK-102` владеет server projection/transport, `TASK-103` — UI/browser
  surface; их последовательность и зависимости согласованы с
  `IMPL-FT-004:30-42` и `:118-133`. Нет proof-only sibling task или лишней
  production-acceptance task.
- BLOCKING gap: `TASK-102` одновременно требует material privacy/NFR result
  по `REQ-014` — revocation, deny-before-mutation и no-existence-leakage — в
  `evidence_required[2]` (`:72`), но не имеет exact feature AC locator
  `FT-004-AC-005` ни в `source_artifacts` (`:82-93`), ни в
  `verification_targets` (`:128-131`). Это нарушает prospective NFR proof
  mapping из `.memory-bank/workflows/tier-policy.md:94-116` и оставляет
  ownership этой части closure неявным.

Repair owner: `/feature-doctor FT-004` для подтверждения ownership; затем
`/feature-to-tasks FT-004` для reconciliation task card/plan.

## Design readiness and architecture review

- BLOCKER: accepted architecture не даёт legal owner/path для обязательных
  display labels авторов и reactors. Contract требует labels в
  `.memory-bank/contracts/collaboration-browser-surface.md:21-42`, а
  `TASK-102` требует их в RED/GREEN contract (`:70`), но текущие Collaboration
  views возвращают только `authorAccountId`/`reactorAccountId`
  (`src/lib/server/modules/collaboration/public.ts:24-75`). Lesson Context
  принимает только `getDayDiscussion` projection
  (`src/lib/server/modules/lesson-context/public.ts:115-130`), тогда как
  Actor Context разрешает profile lookup только для IDs, предварительно
  выбранных Center & Scheduling (`.memory-bank/contracts/boundary-map.md:116-142`).
  `AuthorizedClassScope` предоставляет только student IDs
  (`src/lib/server/modules/center-scheduling/public.ts:88-93,907-960`), а
  registry facts доступны лишь Admin/Teacher и не являются day-discussion
  participant scope (`src/lib/server/modules/center-scheduling/public.ts:331-385`).
  Передача произвольных discussion IDs в `getStatisticsProfiles`, прямой DB
  read или изменение Collaboration/C&S boundary нарушит принятые границы;
  при этом `TASK-102` запрещает соответствующие изменения
  (`:133-150`), а `TASK-103` запрещает затрагивать relevant server-side
  modules/routes (`:140-160`).
- Architecture review verdict: `OWNER_DECISION_NEEDED`. Требуется ответ на
  вопрос: какая capability предоставляет разрешённый participant-label
  projection и каким server-resolved scope подтверждается каждый
  author/reactor ID? Fallback на account IDs и прямое чтение Identity & Access
  persistence не принимаются.

Repair owner: `/feature-doctor FT-004`; если потребуется изменение принятого
shared contract, его дальнейший route определяется doctor через `/spec-redesign`.
До решения W35 небезопасна, а W36 транзитивно не может доказать AC-001/AC-002.

## Execution readiness

- BLOCKER: обе новые T3 cards содержат неисполняемые обязательные gates:
  `TASK-102.gates[4..5]` (`:49-56`) и `TASK-103.gates[4..5]` (`:46-53`)
  используют `node scripts/mb-lint.mjs` и `node scripts/mb-doctor.mjs --strict`,
  но эти пути отсутствуют и дают `MODULE_NOT_FOUND`. Canonical paths находятся
  в `.memory-bank/scripts/`; workflow прямо указывает
  `node .memory-bank/scripts/mb-lint.mjs`
  (`.memory-bank/workflows/mb-sync.md:142-149`).
- BLOCKER: `TASK-103.evidence_required[4]` (`:72`) содержит RED/GREEN и
  decisive conditions для `FT-004-AC-005`, но не содержит `artifact:`; первые
  четыре claim contracts artifact указывают (`:68-71`). Поэтому AC-005 не
  имеет полного claim-linked evidence contract.
- BLOCKER: новый protected route/transport T3 proof не содержит явных
  unauthenticated/invalid-session cases. `TASK-102.verification_targets`
  (`:128-131`) и `TASK-103.verification_targets` (`:134-138`) перечисляют
  Admin/Teacher/Student/Parent и revoked/forged cases, но не anonymous и
  invalid-session requests. Canonical minimum proof требует их на каждом
  protected boundary (`.memory-bank/contracts/access-control.md:142-151`;
  `.memory-bank/runbooks/mvp-verification.md:45-54`). Это нельзя считать
  inherited dependency proof.
- PASS: tier/status/dependency legality, T3 classification, non-empty
  verification targets, disposable-state constraints, state-before/state-after
  requirements, forbidden scopes and sequential dependency order otherwise
  match the accepted policy. No hard write boundary was incorrectly inferred
  from `touched_files`.

Repair owner for mechanical card reconciliation: `/feature-to-tasks FT-004`.
The display-label and AC ownership questions remain `/feature-doctor FT-004`.

## Handoff

`FT-004` is not safe to hand to `/exe`. Resolve the named feature/contract
ownership question, reconcile the affected cards and proof contracts, then
rerun `/review-tasks-plan FT-004`. After a current-revision `APPROVE`, run the
conditional `/mb-doctor` gate (strict before scheduler handoff) before
execution. This review did not mutate feature, plan, task cards, index,
lifecycle, statuses, code, or evidence artifacts.
