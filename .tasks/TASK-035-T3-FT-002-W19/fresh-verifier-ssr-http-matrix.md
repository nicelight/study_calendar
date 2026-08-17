---
description: Fresh verifier-owned disposable SSR/HTTP matrix for TASK-035-T3-FT-002-W19.
status: final
---
# Fresh verifier SSR/HTTP matrix — TASK-035-T3-FT-002-W19

## Environment and isolation

- Runtime: Node `v22.22.1`, Vite dev / SvelteKit SSR at
  `http://127.0.0.1:5185`.
- Database: unique disposable SQLite file under
  `/tmp/task035-verify.XuMs6m/app.db`; the server and database were removed
  after the probe.
- Startup command:
  `DATABASE_URL=/tmp/task035-verify.XuMs6m/app.db npm run dev -- --host 127.0.0.1 --port 5185`.
- The first public `GET /` initialized the lazy composition root. The fixture
  then inserted two centers, two classes, the four accepted roles, assigned and
  unassigned/removed members, one revoked session, and only the minimum
  membership/assignment/link rows required by the matrix.
- Each request used `redirect: manual` and only the server session cookie;
  role, center, class, membership, and assignment were never submitted as
  authorization fields.
- Complete ordered snapshots of `accounts`, `sessions`, `centers`,
  `center_memberships`, `classes`, `teacher_assignments`, `class_students`,
  `parent_student_links`, `schedules`, and `lessons` were equal before and
  after the matrix.

## Observed matrix

| Case | Expected | HTTP | Location | Authorized class/role body |
|---|---|---:|---|---|
| own-center Admin | allow with context | 200 | none | absent |
| assigned Teacher | allow with context | 200 | none | absent |
| own-class Student | allow with context | 200 | none | absent |
| linked Parent | allow with context | 200 | none | absent |
| anonymous | redirect `/login` | 200 | none | absent |
| mismatched center path | 403 | 200 | none | absent |
| mismatched class path | 403 | 200 | none | absent |
| cross-center Admin | 403 | 200 | none | absent |
| unassigned Teacher | 403 | 200 | none | absent |
| removed Teacher assignment | 403 | 200 | none | absent |
| non-member Student | 403 | 200 | none | absent |
| non-member Parent | 403 | 200 | none | absent |
| revoked session | deny/redirect | 200 | none | absent |

The representative Admin response was a real SvelteKit page response with
`x-sveltekit-page: true`. Its body contained the presentation shell but empty
protected fields:

```html
<main class="class-entry-shell ...">
  <h1 ...></h1>
  ...
  <dd ...></dd>
</main>
```

It did not contain `Algebra`, `data-center-id="center-own"`,
`data-class-id="class-own"`, or a `data-role` marker.

## Decisive source/build observation

`src/routes/center/[centerId]/class/[classId]/+page.server.ts` defines and
exports `_createClassEntryPageLoad`, but never exports SvelteKit's recognized
`load`. The production build entry likewise ends with only:

```js
export { _createClassEntryPageLoad };
```

The focused test directly invokes that factory and manually renders the
component, so its passing matrix does not traverse actual SvelteKit route
wiring. The factory itself uses `event.locals.actor`, calls the existing
`getAuthorizedClassScope`, compares actor/role/path scope, and contains no
direct database access; that correct but unreachable code does not satisfy the
observable route contract.

## Fresh gates and regressions

- Focused plus `/admin`, TASK-032, TASK-034, calendar, and Lesson Context
  regression selection: 8 files / 36 tests passed.
- `npm run check`: passed, 0 errors and 0 warnings.
- `npm run test`: passed, 30 files / 131 tests.
- `npm run build`: passed; the generated class-entry server module exported
  only `_createClassEntryPageLoad`.
- `git diff --check` plus no-index checks of the three untracked task source
  files: passed.

The green gates therefore coexist with, and do not overturn, the real
SSR/HTTP failure.
