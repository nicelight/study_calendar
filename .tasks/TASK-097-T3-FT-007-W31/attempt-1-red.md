# TASK-097 — Attempt 1 RED

- claim: `FT-007-AC-004 / REQ-017` — every authorized registry column exposes visible typed sort direction.
- command: `npx vitest run tests/routes/ft-007-statistics-sorting.test.ts`
- result: exit `1` before production changes.
- observation: the rendered Statistics page contained static `<th>` labels and no sorting control; the probe specifically failed because it could not find the expected accessible control for `ФИО` (`<button aria-label="Сортировать ФИО...`). Therefore an active sort direction was not visible and the page could not provide bidirectional presentation sorting.
- isolation: SSR fixture only; no server, database, provider, or product state was opened or changed.
- receipt status: current supporting execution evidence; it is not a workflow verdict or reusable gate receipt.
