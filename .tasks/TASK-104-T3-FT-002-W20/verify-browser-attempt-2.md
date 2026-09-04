# TASK-104-T3-FT-002-W20 — verifier-owned browser evidence

## Runtime and isolation

- Command: `DATABASE_URL=tmp/task-104-browser-verify.db PLAYWRIGHT_BASE_URL=http://127.0.0.1:5187 npx playwright test .tasks/TASK-104-T3-FT-002-W20/verify-browser-probe-attempt-2.spec.ts --config=.tasks/TASK-104-T3-FT-002-W20/verify-browser-probe-attempt-2.config.ts`
- CWD: `/home/serg/Projects/study_calendar`
- Runtime: local SvelteKit dev server, HTTP base URL `http://127.0.0.1:5187`, headless Desktop Chrome, one worker.
- State: fresh disposable SQLite database under `tmp/`, seeded only by the probe; database, journal, WAL, and SHM files were removed by `cleanupDisposableDatabase` after the run.
- Result: exit code `0`; one test passed in `6.6s`.

## New targeted probe observations

The probe opened the actual protected `/admin/task-104-center-own` route with a
server-issued session cookie and observed the rendered class projection:

- three server-resolved lesson rows and the three named form actions rendered;
- browser add created one planned lesson for the selected server-projected
  schedule and displayed the success result; the submitted `lessonId` field,
  when injected through the HTTP action request, was ignored in favor of a
  fresh persisted identity;
- browser transfer changed only the selected lesson date, retaining its
  `lessonId`, class, schedule, authored context, attendance, and existing
  charge row; the sibling lesson retained its identity/date/status;
- browser cancel changed only the selected planned lesson to `cancelled` and
  displayed the success result.

The same HTTP action boundary returned encoded SvelteKit failure results and
preserved the complete snapshot of `schedules`, `lessons`,
`lesson_context_material`, `learning_attendance`,
`financial_lesson_charges`, and `financial_payment_allocations` for each case:

| case | logical failure | result |
|---|---:|---|
| no session | 401 `unauthorized` | denied, unchanged snapshot |
| non-Admin session | 403 `forbidden` | denied, unchanged snapshot |
| own Admin on another-center route | 403 `forbidden` | denied, unchanged snapshot |
| forged class | 403 `forbidden` | denied, unchanged snapshot |
| class/schedule mismatch | 403 `forbidden` | denied, unchanged snapshot |
| forged lesson | 403 `forbidden` | denied, unchanged snapshot |
| invalid ISO date | 400 `invalid_schedule` | denied, unchanged snapshot |
| completed lesson cancellation | 500 `operation_failed` | denied, unchanged snapshot |

The final anonymous browser navigation to the protected dashboard redirected to
`/login` and rendered no lesson form. The complete probe source is
`verify-browser-probe-attempt-2.spec.ts`; the custom config records the runtime
and viewport/device selection.

## Claim mapping

- `FT-002-AC-003` / `REQ-004`: protected projection, add, transfer, cancel,
  sibling preservation, completed-cancel rejection.
- `FT-002-AC-004` / `REQ-004`: transfer identity/context and charge identity
  remained stable; no duplicate charge row was created.
- `REQ-014`: server-side role/center/class/schedule/lesson checks denied all
  forged, invalid, unauthenticated, non-Admin, and cross-center requests before
  scheduling mutation.
- Boundary proof: the route adapter calls only
  `centerScheduling.getAdminCenter`, `addLesson`, `transferLesson`, and
  `cancelLesson`; no route/component persistence access is present.

## Reproducibility notes

The first two local probe invocations exposed and corrected only verifier
locator/transport assertions; no production source or durable database was
changed by them. The final invocation above is the accepted outcome-level
observation. Required project gates were independently rerun afterward:
`npm run check` (0 errors/0 warnings), `npm run build` (client and SSR build),
`npm run test` (69 files/240 tests), and `git diff --check` (exit code 0).
