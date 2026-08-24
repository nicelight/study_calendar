# TASK-097 — Attempt 1 GREEN

- claim: `FT-007-AC-004 / REQ-017` and `statistics-projection.md#sorting-and-presentation`.
- focused route command: `npx vitest run tests/routes/ft-007-statistics-sorting.test.ts tests/routes/ft-007-statistics.test.ts`.
- focused result: exit `0`; `2` files / `5` tests passed. The SSR matrix confirms an accessible presentation sorting control for every registry column while retaining the pre-existing no-mutation-control AC-003 assertion.
- owned browser command: `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-statistics.db --spec e2e/ft-007-statistics.spec.ts`.
- browser result: exit `0`; `1` Playwright test passed. It waits for hydration, then verifies all 18 registry controls, visible `aria-sort` direction changes, text/date/percentage/count asc/desc behavior, Teacher first-rendered-class ordering, and exact provider/source table equality before and after presentation clicks.
- isolation and cleanup: the authorized runner started a disposable-mode owned server with the exact tmp database and rejected server reuse/real database paths by contract. After the final run, `test ! -e tmp/ft-007-statistics.db` passed. The task neither opened nor changed `study-calendar.db`.
- receipt status: current supporting execution evidence; no reusable gate receipt is offered because unrelated dirty work prevents a bounded input-state basis.
