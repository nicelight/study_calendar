# FT-004 task-plan review — Browser R5

REVIEWED_PLANNING_REVISION: 2

ARCHITECTURE_REVIEW: not_required

VERDICT: APPROVE

## Review basis

Это свежая полная проверка текущей Revision 2 planning surface. Предыдущие
FT-004 review reports не использовались как proof или источник verdict.
Проверены текущие:

- `.memory-bank/constitution.md`, `.memory-bank/mbb/index.md`,
  `.memory-bank/spec-backbone.md`, `.memory-bank/spec-index.md`,
  `.memory-bank/requirements.md`, `.memory-bank/foundation.md`;
- `.memory-bank/features/FT-004-day-collaboration.md`,
  `.memory-bank/tasks/plans/IMPL-FT-004.md`, весь
  `.protocols/FT-004/{clarification,decision-log,plan}.md`;
- все индексированные FT-004 cards: TASK-011, TASK-012, TASK-016, TASK-017,
  TASK-102 и TASK-103, а также прямые dependency records TASK-004, TASK-005 и
  TASK-039;
- `.memory-bank/schemas/task.schema.json`,
  `.memory-bank/tasks/index.json`,
  `.memory-bank/workflows/execute-loop.md` и
  `.memory-bank/workflows/tier-policy.md`;
- canonical Collaboration browser surface, access control, boundary map,
  system architecture, core domain, lifecycle и testing strategy;
- текущие `src/routes/lesson-context/+page.svelte`,
  `src/routes/lesson-context/+page.server.ts`, связанные route tests/E2E
  callers и существующий disposable E2E runner/config.

`node .memory-bank/scripts/mb-lint.mjs` завершился успешно: 76 files, без
errors. Его предупреждения касаются рекомендованного metadata других epic/
feature docs и не затрагивают FT-004 queue. `/mb-doctor` не запускался.

## Co-review focuses and fallback

1. Execution cohesion: atomic default-to-named migration всех существующих
   Lesson Context forms, владение route registry и стабильный handoff от
   TASK-102 к TASK-103.
2. Planning closure: schema/index, AC/REQ/exact-claim coverage, slicing,
   dependencies, lifecycle, T3 RED/GREEN sufficiency и hard scopes.

Для каждого фокуса был запрошен независимый fresh `Codex Luna` / `xhigh`
reviewer без передачи результатов другого фокуса. Первичные запуски и по одному
разрешённому повтору не дали результата: среда отклонила модель как
недоступную для текущего ChatGPT account. После bounded wait применён
semantic-pack fallback. Оба фокуса выполнены непосредственно основным
Reviewer; из отсутствия co-review ответов никаких findings не выводилось.

## Findings

Блокирующих findings нет.

## Structural integrity

- Global Backbone имеет положительную текущую `Planning Revision: 2` и статус
  `complete`. FT-004 имеет `clarification_status: complete`,
  `spec_design_status: complete`, lifecycle `planned` и не содержит
  `PLANNING_RECONCILIATION_REQUIRED`.
- Schema/index validation проходит. Index entries уникальны, их files и IDs
  разрешаются; task filename/ID, tier, feature и wave согласованы.
- TASK-011, TASK-016, TASK-017 и TASK-039 имеют `done` с записанными
  functional и T3 semantic results. TASK-012 корректно сохранён как
  исторический `failed`/`superseded` и не используется как dependency или
  свежий T3 proof.
- TASK-102 `planned` зависит только от завершённых TASK-016, TASK-017 и
  TASK-039. TASK-103 `planned` зависит от TASK-102. Такой последовательный
  W35 -> W36 graph согласован с plan; текущие `planned` statuses не имитируют
  readiness и не меняют lifecycle ownership.
- REQ-006, REQ-007, REQ-008 и REQ-014 существуют и прямо связывают FT-004 с
  принятой browser completion surface.

## Coverage and execution-cohesive slicing

- Независимо выведенный acceptance set — FT-004-AC-001..005: attributable
  account-owned comments, five reactions/reactors, arbitrary-depth/common
  feed, ten-tab retention/reactivation и shared/personal privacy. TASK-103
  содержит точные feature locators и `verification_targets` для всех пяти AC.
  TASK-102 содержит точный FT-004-AC-005 locator/target для своего
  server-side privacy/transport delta и точные canonical locators для
  projection, mutation transport и participant-label boundary.
- Старые TASK-011/016/017 доказывают backend ownership/persistence/isolation,
  но не browser completion. TASK-102 добавляет independently provable route
  projection/transport result; TASK-103 добавляет independently provable UI
  result на этом transport. Это два material change outcomes, а не разделение
  implementation и proof. Отдельная proof-only или production-acceptance card
  не создана.
- Прямой source audit обнаружил шесть текущих default-posting форм:
  `completeHomework`, `recordGrade`, `createHomework`, `saveAttendance`,
  shared-material save и `createPayment`. Текущий server route действительно
  экспортирует только `actions.default`; это подтверждает реальную migration
  surface, а не формулировку caller prompt.
- TASK-102 теперь атомарно владеет обеими сторонами migration:
  `src/routes/lesson-context/+page.server.ts` и
  `src/routes/lesson-context/+page.svelte` входят в `touched_files`, page
  удалена из `forbidden_scope`, а constraints/invariants/verification требуют
  named actions для existing homework, attendance, material и payment
  operations, named targets у каждой существующей формы, отсутствие
  оставшегося default action и regression coverage существующего поведения.
  Это охватывает все шесть фактических форм, включая три разные homework
  операции и material form без текущего hidden dispatcher value.
- Связанные tests в `tests/lesson-context/` и `tests/routes/` входят в
  advisory change surface. Другие transport callers не заблокированы hard
  scope: `touched_files` не является allow-list, а механическая адаптация
  caller к новому transport относится к этой migration и не принимает на себя
  чужой feature outcome.
- TASK-103 зависит от завершения TASK-102, изменяет страницу для Collaboration
  controls, требует использовать TASK-102 projection/named actions и жёстко
  запрещает `src/routes/lesson-context/+page.server.ts`. Поэтому W36 не может
  заново открыть action registry или обойти стабильный transport. Последующее
  редактирование одной page двумя последовательными tasks не является
  конфликтом: W35 оставляет рабочий named transport для existing forms, W36
  добавляет independently testable Collaboration UI.

## Design readiness and boundaries

- Canonical browser contract однозначно требует named actions
  `createFieldComment`, `editFieldComment`, `setReaction`, `createMessage` и
  `replyToMessage`, `/lesson-context` как единственную user surface и
  `/api/lesson-context` как GET-only projection. TASK-102/103 сохраняют эти
  решения и не оставляют executor выбирать другой transport.
- Feature-doctor clarification завершена. Принятый `getParticipantLabels`
  contract оставляет `fullName` у Identity & Access, discussion authorization
  и выбор IDs у Collaboration, а Lesson Context — composition-only owner.
  TASK-102 прямо реализует и доказывает эту существующую accepted edge; route
  не получает profile/storage authority.
- Boundary map, architecture, domain и lifecycle согласованы: Collaboration —
  единственный writer comments/reactions/messages/replies/branch facts;
  Lesson Context — route/read composition adapter; actor и membership scope
  разрешаются server-side; скрытые branches сохраняются, а tabs остаются
  projection.
- Новый module edge, writer, store, schema, route/API, compatibility branch или
  rollout decision не требуется. Поэтому отдельный architecture review не
  нужен: после accepted doctor repair не осталось material ownership,
  dependency или boundary question, способного изменить verdict.

## Execution readiness and proof

- T3 у TASK-102 и TASK-103 соответствует auth/privacy/protected browser
  mutations. Cards содержат purpose, scalar success outcome, direct canonical
  inputs, gates, constraints, invariants, stop conditions и task-scoped proof.
- TASK-102 RED/GREEN различает отсутствие named transport/default remnants,
  projection omissions, authority forgery, revoked access, label-boundary
  bypass и state mutation. TASK-103 RED/GREEN различает каждый AC в реальном
  browser UI, reload persistence, eleven-plus branch retention/reactivation и
  shared/personal denial. Dependency proof не подменяет эти два integration
  deltas.
- Негативные T3 cases используют isolated/disposable SQLite, сравнение state
  before/after и failure-safe cleanup. Существующий
  `scripts/run-disposable-e2e.mjs` принимает отдельный `tmp/*.db`, запускает
  собственный server, запрещает `study-calendar.db` и удаляет exact DB plus
  sidecars в `finally`; TASK-103 может потреблять его, не меняя запрещённые
  runner/config files.
- У TASK-102 нет hard `write_boundary`; его `forbidden_scope` больше не
  запрещает page и сохраняет запреты на API mutation, neighbor writers,
  database schema и historical cards. TASK-103 жёстко запрещает server route
  и backend modules, что соответствует UI-only outcome. Реалистичный путь
  выполнения не требует нарушения hard scope.

## Precise handoff

Этот review не продвигает tasks и не меняет status, lifecycle, plan, specs,
code или execution evidence. Следующий обязательный readiness step для T3
feature queue — запустить `/mb-doctor` на текущем состоянии (для scheduler
handoff — strict mode). После законного promotion TASK-102 можно опционально
провести `/technical-premortem TASK-102-T3-FT-004-W35`, поскольку он затрагивает
protected cross-slice transport и atomic caller migration; затем выполнить
`/exe TASK-102-T3-FT-004-W35` с обычными `/verify`, `/red-verify`, lifecycle и
wave-sync gates. TASK-103 запускается только после terminal dependency outcome
TASK-102 и проходит собственные T3 functional/semantic gates.
