# Attempt 1 — claim-equivalent GREEN route matrix

## Claim

`FT-002-AC-011 / REQ-003 / REQ-014`: the exact class path serves only the matching server-authorized Admin, Teacher, Student, or Parent with role/class context; unauthenticated, cross-center, non-member, unassigned, and removed-assignment requests are denied before protected data renders and route reads do not mutate state.

## Command and result

```text
npm run test -- tests/routes/center-class-entry.test.ts

Test Files  1 passed (1)
Tests  11 passed (11)
```

The final focused run completed after the route-module export correction at
2026-08-14T23:22:03+05:00. It uses a fresh `createCompositionRoot({
databaseFilename: ':memory:' })` for every test and closes that root in
`afterEach`; no shared database, pre-existing session, external network, or
browser state participates.

## SSR/HTTP observations

Each probe builds a request-shaped SvelteKit `RequestEvent`, resolves its
Actor Context from the fixture session through Identity & Access, calls the
actual page `load`, and server-renders the actual Svelte component:

| Fixture / request | Expected status | Observed body or control flow |
|---|---:|---|
| own-center Admin | 200 | matching `center-own` / `class-own`, `data-role="admin"`, class name |
| assigned Teacher | 200 | matching scope, `data-role="teacher"`, class name |
| enrolled Student | 200 | matching scope, `data-role="student"`, class name |
| linked Parent | 200 | matching scope, `data-role="parent"`, class name |
| no session | 303 | redirect to `/login`, no load data/body rendered |
| own Admin with `center-other` path for own class | 403 | `{ message: 'Forbidden' }`, path scope mismatch denied |
| cross-center Admin | 403 | `{ message: 'Forbidden' }`, query returns no permitted scope |
| unassigned Teacher | 403 | `{ message: 'Forbidden' }`, no assignment scope |
| same-center Student not in the class | 403 | `{ message: 'Forbidden' }`, no class membership scope |
| Teacher after assignment deletion | 403 | `{ message: 'Forbidden' }`, fresh server check denies immediately |

All success renders deliberately omit `accountId` and `studentAccountIds`; the
test asserts the rendered body does not contain the student fixture account ID.
For every read, including each denied request, a complete fixture snapshot of
accounts, sessions, centers, memberships, classes, assignments, class students,
parent links, schedules, and lessons matched before and after the route read.

## Boundary proof

- `+page.server.ts` consumes request-scoped `event.locals.actor` and the public
  Center & Scheduling `getAuthorizedClassScope` query.
- It compares both returned `scope.centerId` and `scope.classId` with the URL
  path before projecting data.
- It imports no platform database and contains no `.sqlite` access.
- `+page.svelte` imports only its server-provided page-data type and contains no
  server boundary, authorization query, student list, Lesson Context, or
  calendar reference.

The focused test contains executable source assertions for each of those facts.
