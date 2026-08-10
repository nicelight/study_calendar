---
description: Advisory technical-debt report for W8 TASK-018 and TASK-014.
status: advisory
---

# Technical Debt — W8 / TASK-018 + TASK-014

## RESULT

Подтверждён один material reliability debt на стыке Learning Progress и Lesson
Context. Других material/minor findings на проверенной surface не подтверждено.

## Checked scope

Проверены только `TASK-018-T3-FT-005-W8` (Learning Progress provider boundary) и
`TASK-014-T3-FT-003-W8` (Lesson Context grade projection/UI): их task cards,
нормативные boundary/access/domain документы, W8 execution/verification/red-
verification evidence, текущие production changes в
`src/lib/server/modules/{learning-progress,lesson-context}/`,
`src/routes/lesson-context/+page.svelte` и соответствующие tests.

Изменения в других task cards, lifecycle, specs, Memory Bank и tests вне этой
surface не оценивались и не менялись.

## FINDINGS

### TD-W8-001 — provider ambiguity aborts the whole authorized personal-day view

- **Priority:** Medium.
- **Evidence:** `TASK-018` explicitly requires multiple class-scoped homework
  candidates to fail closed as `ambiguous-homework-selection` with no grade
  (`.memory-bank/tasks/TASK-018-T3-FT-005-W8.task.json:71-74,128-140`). The
  provider implements this as a thrown error at
  `src/lib/server/modules/learning-progress/public.ts:346-376`, specifically
  `:364-365`. The personal projection calls it without an ambiguity branch at
  `src/lib/server/modules/lesson-context/public.ts:214-245`, `:223-228`.
  Both adapters catch every error and convert it to `403 forbidden` at
  `src/routes/lesson-context/+page.server.ts:11-21` and
  `src/routes/api/lesson-context/+server.ts:11-21`.
- **Observable debt mechanism:** when an authorized class has two or more
  `learning_homework` rows, the provider's accepted fail-closed case is not
  represented as `grade: null` in the consumer projection. The exception
  aborts the complete personal-day response, so shared material and the other
  already-authorized projections are unavailable and the route reports the
  condition as forbidden.
- **Impact:** recurring class homework creation can turn a valid personal-day
  read into an authorization-looking outage; it also couples the provider's
  ambiguity error to the route's generic denial path, increasing reliability
  and diagnosis cost.
- **Smallest remediation direction:** preserve provider-owned fail-closed
  selection, but handle only `ambiguous-homework-selection` at the
  Lesson Context boundary as an explicit no-grade outcome while retaining
  `403` for authorization failures. Add one consumer/adapter regression for
  the multiple-candidate case.

## DEFERRED_RISKS

Отдельных deferred risks, не покрытых finding выше, не подтверждено. The
class-scoped cardinality rule and отсутствие consumer-owned `lessonId` →
`homeworkId` relation are explicit accepted decisions, not separate findings;
the current ambiguity behavior remains the evidenced deferred integration
point.

## VALIDATION

- Read-only `npm run check`: passed, 0 errors / 0 warnings.
- Focused read-only Vitest run for the four W8 provider/composition/route/UI
  files: 4 files / 12 tests passed.
- Existing W8 evidence was cross-checked: TASK-018 functional/semantic PASS
  and TASK-014 functional/semantic PASS; the finding is a downstream control-
  flow gap not covered by the provider-only ambiguity assertion.
- No code, task card, lifecycle, spec, or test file was changed by this review.

## NEXT_STEP

Перед дальнейшим использованием personal-day flow на данных с несколькими
homework в классе устранить TD-W8-001 на Lesson Context/provider boundary и
повторить focused adapter regression; workflow state advisory report не меняет.
