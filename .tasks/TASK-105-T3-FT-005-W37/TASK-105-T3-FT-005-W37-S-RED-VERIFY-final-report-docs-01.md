# Semantic verification report — TASK-105-T3-FT-005-W37

- Role: `Reviewer`
- Task: `TASK-105-T3-FT-005-W37`
- Tier / wave / feature: `T3` / `W37` / `FT-005`
- Planning Revision: `2`
- Lifecycle at handoff: `in_progress`

## Basis and coverage

Проверены indexed task card, direct canonical contracts по Learning Progress,
boundary/access-control, architecture/domain/state/testing policy, фактический
diff W37, executor evidence, независимый functional `VERDICT: PASS`,
verifier-owned isolated probe, hard boundaries и сохранение несвязанных FT-006
изменений. `/verify`, Judge, `/mb-sync`, promotion и lifecycle closure не
выполнялись.

## Finding

`getHomeworkProgressForLesson` ограничивает completion projection списком
`scope.studentAccountIds` (`src/lib/server/modules/learning-progress/public.ts:463-477, 635-664`).
Для authenticated Student этот scope содержит только его собственный account ID
(`src/lib/server/modules/center-scheduling/public.ts:937-942`). Значит, после
completion Student A shared `/lesson-context` Student B не получает completion
Student A. Это material break принятого class-visible результата
`REQ-009` / `FT-005-AC-001`; прежний authorized class-view test фиксирует именно
видимость записи Student A для Student B
(`tests/learning-progress/homework-grades.test.ts:65-99`). Новый Lesson Context
projection передаёт этот урезанный результат без другого источника
(`src/lib/server/modules/lesson-context/public.ts:223-261`), поэтому W38 не
может восстановить отсутствующий статус на UI-слое.

## Owner action

Активный lifecycle owner должен вернуть W37 implementation owner на исправление
projection в пределах существующей границы, затем заново провести `/verify` и
`/red-verify`. Задача должна оставаться `in_progress`; закрытие, promotion,
`/mb-sync` и запуск TASK-106 до нового semantic-pass не рекомендуются.

SEMANTIC_VERDICT: semantic-fail
