---
description: Fresh verifier-owned real-route SSR/HTTP matrix after TASK-035 Attempt 2.
status: final
---
# Fresh verifier SSR/HTTP matrix — TASK-035 Attempt 2

## Environment and isolation

- Runtime: Node `v22.22.1`, Vite dev / SvelteKit SSR at
  `http://127.0.0.1:5186`.
- Database: unique disposable SQLite file
  `/tmp/task035-verify-retry.yI392J/app.db`; the Vite process and exact
  temporary directory were removed after the probe.
- Startup:
  `DATABASE_URL=/tmp/task035-verify-retry.yI392J/app.db npm run dev -- --host 127.0.0.1 --port 5186`.
- A first public `GET /` initialized the lazy composition root. The fixture then
  inserted two centers/classes, all four accepted roles, own/other center
  actors, assigned/unassigned/removed members, linked/unlinked family scope,
  and one revoked session.
- Requests supplied only the opaque `foundation_session` cookie and URL path;
  no role, center, class, membership, or assignment authorization field was
  submitted by the client.
- Ordered snapshots of `accounts`, `sessions`, `centers`,
  `center_memberships`, `classes`, `teacher_assignments`, `class_students`,
  `parent_student_links`, `schedules`, and `lessons` were equal before and
  after all requests.

## Results

| Case | HTTP | Location | Matching class/role body | Result |
|---|---:|---|---|---|
| own-center Admin | 200 | none | yes, `admin` | pass |
| assigned Teacher | 200 | none | yes, `teacher` | pass |
| own-class Student | 200 | none | yes, `student` | pass |
| linked Parent | 200 | none | yes, `parent` | pass |
| anonymous | 303 | `/login` | absent | pass |
| mismatched center path | 403 | none | absent | pass |
| mismatched class path | 403 | none | absent | pass |
| cross-center Admin | 403 | none | absent | pass |
| unassigned Teacher | 403 | none | absent | pass |
| removed Teacher assignment | 403 | none | absent | pass |
| non-member Student | 403 | none | absent | pass |
| non-member Parent | 403 | none | absent | pass |
| revoked session | 303 | `/login` | absent | pass |

Every allowed response contained `Algebra`, matching
`data-center-id="center-own"`, `data-class-id="class-own"`, and the exact
role marker. Every denial body omitted all four protected markers.

## Actual route and boundary proof

- Source `src/routes/center/[centerId]/class/[classId]/+page.server.ts` exports
  `load: PageServerLoad` and delegates it to `_createClassEntryPageLoad`.
- The generated production entry contains
  `var load = (event) => _createClassEntryPageLoad()(event)` and exports both
  `_createClassEntryPageLoad` and `load`.
- The route obtains request Actor Context from `event.locals.actor`, calls the
  existing Center & Scheduling `getAuthorizedClassScope` with the server
  session token/class, and compares returned center, class, account, and role
  to the request actor/path.
- Neither route nor component imports platform database, Lesson Context,
  calendar, or downstream projections. The component renders only the
  serialized server-provided class/role context.

## Fresh gates and regressions

- Actual exported-`load` test plus `/admin`, TASK-032, TASK-034, calendar, and
  Lesson Context regression selection: 8 files / 36 tests passed.
- `npm run check`: passed, 0 errors and 0 warnings.
- `npm run test`: passed, 30 files / 131 tests.
- `npm run build`: passed and generated the recognized `load` export.
- `git diff --check`: passed.

The current real HTTP outcome, route-export regression, source/build boundary,
and required gates agree.
