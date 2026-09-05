---
description: Full Planning Revision 2 review of the current FT-004 browser-completion task queue.
status: active
---
# Review FT-004 task planning surface — full current-revision review R4

VERDICT: REJECT

REVIEWED_PLANNING_REVISION: 2

ARCHITECTURE_REVIEW: not_required

## Review mode and evidence basis

Проведён fresh full review всей текущей planning surface FT-004, а не bounded
проверка прежнего finding. Авторитетными входами были текущие Constitution,
MBB, Global Backbone и spec registry; execute-loop и tier-policy; feature,
implementation plan и protocol FT-004; TASK-102/TASK-103 и их зависимости;
canonical Collaboration browser, access-control, boundary, architecture,
domain, lifecycle и testing contracts. R1–R3 использованы только как
исторический контекст.

Для требуемого co-review были независимо запущены два fresh
`Codex Luna` / `xhigh` контекста с одинаковыми governing inputs:

1. acceptance closure, exact claim/proof ownership, execution-cohesive slicing,
   waves и dependencies;
2. canonical design/boundary alignment, structural/lifecycle integrity, T3
   proof realism/minimality и hard runtime scope.

Оба процесса не вернули завершённый candidate finding в установленное bounded
окно и были остановлены. Согласно fallback semantic pack отсутствие результата
учтено как отсутствие co-review finding; основной Reviewer самостоятельно
выполнил полный review и прямую adjudication ниже.

## Disposition прежнего R3 finding

Прежний R3 blocker **устранён и не воспроизводится**:

- TASK-102 непосредственно содержит `FT-004-AC-005` в
  `verification_targets` (`TASK-102:142-146`), а также тот же exact claim в
  `source_artifacts` и RED/GREEN evidence (`TASK-102:74-78,88-103`);
- TASK-103 непосредственно содержит `FT-004-AC-001`–`FT-004-AC-005` в
  `verification_targets` (`TASK-103:142-151`), с совпадающими feature locators
  и отдельными RED/GREEN evidence entries (`TASK-103:67-72,82-99`);
- feature, implementation plan и protocol согласованно фиксируют это текущее
  Revision 2 mapping
  (`FT-004-day-collaboration.md:187-195`, `IMPL-FT-004.md:139-146`,
  `.protocols/FT-004/plan.md:100-106`).

Этот исторический finding не влияет на текущий verdict.

## Blocking finding

### BLOCKER-1 — TASK-102 не имеет допустимого атомарного пути к обязательным named form actions

**Затронутые review groups:** coverage/slicing и execution readiness.

Canonical browser contract однозначно требует пять **named SvelteKit form
actions** на `/lesson-context`: `createFieldComment`, `editFieldComment`,
`setReaction`, `createMessage`, `replyToMessage`
(`collaboration-browser-surface.md:54-60`). TASK-102 принимает ownership этого
результата (`TASK-102:62-67,80-86`), но одновременно запрещает изменение
`src/routes/lesson-context/+page.svelte` (`TASK-102:148-159`).

Текущий route экспортирует только `actions.default` и внутри него dispatches
существующие мутации по полю `action`
(`src/routes/lesson-context/+page.server.ts:169-179`). Текущие формы отправляют
POST в default action без SvelteKit named-action target; это видно, например,
для homework, attendance, material и payment
(`src/routes/lesson-context/+page.svelte:127-168,229-244,258-272,286-295`). Это
не только незавершённый worktree delta: тот же default dispatcher и default
form transport присутствуют в committed baseline.

У установленного в проекте SvelteKit `2.70.2`
(`package-lock.json:354-355`) runtime запрещает одновременно экспортировать
`default` и named actions и выбрасывает ошибку при таком наборе
(`node_modules/@sveltejs/kit/src/runtime/server/page/actions.js:218-223`). Поэтому
TASK-102 не может:

- добавить требуемые named actions рядом с `default` — runtime отвергнет
  конфигурацию;
- удалить `default` — существующие формы продолжат POST в отсутствующий default
  action и сломаются;
- атомарно перевести существующие формы на named targets — `+page.svelte`
  находится в hard `forbidden_scope` TASK-102;
- оставить server-side миграцию TASK-103 — TASK-103, в свою очередь, запрещает
  изменение `+page.server.ts` (`TASK-103:153-169`).

Это противоречит execution-cohesive boundary: каждый task должен завершать и
доказывать самостоятельный material result
(`execute-loop.md:100-110`). Omitted write allow-list не отменяет
`forbidden_scope` (`tier-policy.md:37-43`). Текущая последовательность W35 → W36
вынуждает executor либо нарушить hard scope, либо оставить route в сломанном
промежуточном состоянии, либо ослабить ясный canonical contract. Поэтому обе
карточки пока не образуют исполнимую очередь.

**Repair owner:** `/feature-doctor FT-004`.

**Точный вопрос для adjudication:** сохраняется ли буквальное требование
canonical contract к SvelteKit named form actions, и какой task владеет
атомарной миграцией существующего `actions.default` и всех уже работающих
default-posting форм `/lesson-context`? Если contract сохраняется, затем
`/feature-to-tasks FT-004` должен согласовать task boundary, waves и hard
forbidden scopes так, чтобы миграция завершалась без промежуточной поломки. Если
требуется изменить canonical contract, doctor должен направить это отдельному
владельцу spec redesign до нового tasking review.

## Full review coverage

### Structural integrity

Текущий Global Backbone имеет `Status: complete` и `Planning Revision: 2`
(`spec-backbone.md:84-98`); Foundation gate TASK-002 завершён
(`foundation.md:10-26`). Read-only проверка task index/schema/DAG нашла 64
уникальные resolving entries, согласованные IDs/tier/feature/wave, существующие
dependencies и отсутствие циклов. Все прямые prerequisite TASK-102 завершены;
TASK-103 корректно зависит от planned TASK-102. Исторический TASK-012 остаётся
terminal `failed`/`superseded` и не используется как dependency или новое T3
proof. `mb-lint` прошёл 76 файлов; его advisory metadata warnings относятся к
другим документам и не меняют FT-004 verdict.

### Coverage and slicing

Stable FT-004 AC headings, governing REQ links, exact claim locators,
verification targets и отдельные RED/GREEN artifacts теперь покрыты. Ownership
между существующим backend evidence, TASK-102 server transport и TASK-103 UI
proof в целом согласован, как и W35 → W36 dependencies. Единственное
блокирующее исключение — невозможность самостоятельно завершить W35 при
текущем split/hard scope, описанная в BLOCKER-1.

### Design readiness

Participant-label clarification завершена: Identity & Access владеет
`fullName`, Collaboration после авторизации выбирает participant IDs, Lesson
Context только композирует labels. Canonical route, authority, privacy,
deny-before-mutation и GET-only API boundaries определены; незакрытого вопроса
об архитектурном ownership нет. BLOCKER-1 относится к task slicing и hard scope,
а не требует нового архитектурного решения, поэтому отдельный architecture
review не требуется.

### Execution and proof readiness

Обе карточки корректно классифицированы как T3. Их claim-linked RED/GREEN
контракты, role/revocation/forgery matrix, state-before/state-after assertions,
disposable SQLite/Playwright runner и failure-safe cleanup достаточно конкретны
и не требуют real database. Однако proof plan не может сделать неисполнимый
TASK-102 самостоятельным GREEN; BLOCKER-1 обязан быть устранён до execution.

## Precise handoff

1. Не запускать `/exe` для TASK-102 или TASK-103.
2. Запустить `/feature-doctor FT-004` с точным named/default action ownership
   вопросом из BLOCKER-1.
3. При подтверждении planning repair выполнить `/feature-to-tasks FT-004`,
   согласовав card scopes и plan/protocol, затем провести новый fresh
   `/review-tasks-plan FT-004` на той же положительной Planning Revision.
4. Только после положительного task-plan review выполнить требуемый strict
   `/mb-doctor` gate перед T3 execution.

Reviewed feature/spec/plan/protocol/task/source/evidence artifacts не
изменялись. В рамках review записаны только `REQUEST.md` и этот единственный R4
final report.
