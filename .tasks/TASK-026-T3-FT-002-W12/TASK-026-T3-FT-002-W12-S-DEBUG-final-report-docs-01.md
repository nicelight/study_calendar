---
description: Read-only diagnosis of the observed recurring-schedule form failure for TASK-026-T3-FT-002-W12.
status: final
---
# Debug — TASK-026-T3-FT-002-W12

## Symptom and reproduction evidence

The operator-provided before/after screenshots show `12/08/2026` to
`01/09/2026`, visually green `Вт`/`Чт`/`Сб`, then HTTP `400` with
`Проверьте даты и выберите хотя бы один день недели.` and blank schedule
controls. The screenshots are conversation attachments, not local files; no
HAR or DevTools request payload for that exact run was supplied.

The current route was exercised in isolated disposable SQLite state with a
server-issued fixture session and Chrome 151. No user database, account, or
session was accessed or changed.

1. With the exact ISO values produced by those displayed dates and native label
   clicks on `Вт`/`Чт`/`Сб`, the submitted request was:
   `POST /admin/debug-center?/createSchedule`
   `classId=debug-class&startDate=2026-08-12&endDate=2026-09-01&weekdays=2&weekdays=4&weekdays=6`.
   It returned success, displayed `Расписание и запланированные уроки
   созданы.`, and persisted schedule weekdays `[2,4,6]`.
2. With the same valid dates but no selected checkbox, the network request was:
   `POST /admin/debug-center?/createSchedule`
   `classId=debug-class&startDate=2026-08-12&endDate=2026-09-01`.
   It returned `400`, displayed the exact reported banner, and returned the
   form with blank native controls. This reproduces the visible failure only
   for an empty `weekdays` payload.

## Current execution attempt and change surface

- Execution Attempt: `not reconstructed` in
  `.protocols/TASK-026-T3-FT-002-W12/context.md`; this debug run did not alter
  it.
- Current implementation surface: clean (`git status --short` and `git diff`
  had no output). The historical task surface is recorded in
  `.memory-bank/tasks/TASK-026-T3-FT-002-W12.task.json`.
- Read evidence: task card and direct FT-002/authorization/boundary/lifecycle
  specs; all retained TASK-026 protocol and verification reports; current
  page, action, owner boundary, and `tests/routes/admin-center-management.test.ts`.

## Causal trace and first violated invariant

`src/routes/admin/[centerId]/+page.svelte:192-210` renders one native schedule
form per class. Each visible day is a `<span>` following an enabled native
`<input type="checkbox" name="weekdays">`; the green state at
`:360` is strictly `input:checked + span`. The exact selected values are
therefore successful form controls: `2`, `4`, and `6`.

`src/routes/admin/center-dashboard.server.ts:256-275` reads
`formData.getAll('weekdays')` and sends their numeric values to
`CenterSchedulingBoundary.createRecurringSchedule`. The first validation
invariant reached there is
`src/lib/server/modules/center-scheduling/public.ts:841-849`:
`normalizeWeekdays` requires a non-empty array of integer weekdays from `0`
through `6`. An absent set violates `normalized.length === 0`, throws
`invalid-weekdays`, and `actionError` maps it to the shared `invalid_schedule`
400 banner (`center-dashboard.server.ts:97-114`). The valid equivalent dates
pass the separate ISO/range checks at `public.ts:852-880`.

Thus the root cause of the reproduced 400 is exact: **the submitted form has
no `weekdays` entries, so the non-empty-weekdays invariant is violated**. The
post-failure reset is expected current behavior: the normal form navigation
re-renders inputs that have no returned values or browser-side retained state.

The root cause of the operator's specific screenshot run is not confirmed.
In the current source and browser, a green checkbox is `checked`, and a checked
enabled checkbox in that same submitted form produces its `weekdays` entry.
There is no client script, disabled control, or action-side filtering that can
turn the traced green `2/4/6` state into the empty payload. The missing
distinguishing evidence is that exact request's Form Data/HAR (and confirmation
that the submit button belonged to the same class card as the green controls).

## Materially useful rejected hypotheses

- Locale display of `<input type="date">` is not the cause: the browser sends
  `2026-08-12` and `2026-09-01`, which pass parsing and range validation.
- `pointer-events: none` on the visually hidden checkbox is not the cause:
  native label clicks toggled it, produced the green state, and included it in
  the real request.
- The server does not discard supplied weekdays: the isolated end-to-end
  request with `2,4,6` succeeded and stored that same normalized set.

## Minimum correction and requested KISS retention behavior

Do not change server schedule validation: rejecting an empty weekday set is
expected and necessary.

For the separately requested retained-draft behavior, the minimum contained
browser-only correction is appropriate: persist only `startDate`, `endDate`,
and selected weekday strings in `localStorage` under a key scoped by the
current `centerId` and `classId`; restore it after client mount into that same
class form; clear that key after its successful `schedule_created` submission.
It needs no server state, dependency, migration, authorization change, or
cross-class restore. It will prevent loss of an otherwise valid pending draft
after a return/error, but it is **not** a fix for an actual request that omits
checked weekday controls.

## Suitable regression check

Add one browser-level form test with two assertions:

1. select `Вт`/`Чт`/`Сб`, set 12 Aug to 1 Sep 2026, submit, and assert the
   observed POST body contains three `weekdays=2|4|6` entries plus success;
2. submit with no selected day, assert the same 400/banner, then navigate back
   to that exact class form and assert the accepted local draft is restored.

The existing route test (`admin-center-management.test.ts:276-303`) already
proves the server action succeeds when it receives weekday values, but not the
browser DOM-to-network path or browser draft retention.

## Residual uncertainty and next owner

Obtain the failing browser request's Form Data/HAR before treating this as a
current checkbox UI defect. If the operator accepts retained drafts as new
scope for the already-done TASK-026 surface, the planning/task owner should
route that small UI change to its proper implementation task; `/debug` makes
no lifecycle or scope decision.

DIAGNOSIS: INCONCLUSIVE
