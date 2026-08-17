# Attempt 2 — fresh claim-equivalent GREEN real-route matrix

## Claim and runtime

This probe proves the corrected `FT-002-AC-011 / REQ-003 / REQ-014` route
through real Vite/SvelteKit SSR, not through a factory-only invocation.

- Runtime: Node `v22.22.1`, Vite/SvelteKit at `http://127.0.0.1:5188`.
- Isolated state: a one-use SQLite database at
  `/tmp/study-calendar-task035-retry-green.Tv7yge/app.db` with only the matrix
  fixtures and server-session cookies.
- Route path: `/center/{centerId}/class/{classId}`.
- No client role, center, class, membership, or assignment fields were sent.

## Results

| Case | Observed HTTP | Protected shell result |
|---|---:|---|
| own-center Admin | 200 | `Algebra`, `data-center-id="center-own"`, `data-role="admin"` |
| assigned Teacher | 200 | matching class context and `data-role="teacher"` |
| own-class Student | 200 | matching class context and `data-role="student"` |
| linked Parent | 200 | matching class context and `data-role="parent"` |
| anonymous | 303 | `Location: /login`; no class data |
| mismatched center path | 403 | no class name or center marker |
| mismatched class path | 403 | no class name or center marker |
| cross-center Admin | 403 | no class name or center marker |
| unassigned Teacher | 403 | no class name or center marker |
| removed Teacher assignment | 403 | no class name or center marker |
| non-member Student | 403 | no class name or center marker |
| non-member Parent | 403 | no class name or center marker |
| revoked session | 303 | `Location: /login`; no class data |

The complete persisted-state snapshot (accounts, sessions, centers,
memberships, classes, assignments, class students, parent links, schedules,
and lessons) had the same SHA-256 before and after all requests:

```text
51da50545cd5d40d7ce17db3351455a9d7014533983bd47db15097d4a8bc94e9
```

Vite was stopped after the matrix; the exact disposable database file was
removed with `unlink` and its empty directory with `rmdir`.

## Route-level regression

`tests/routes/center-class-entry.test.ts` now imports the recognized exported
`load` and calls it—not `_createClassEntryPageLoad`—with a mocked composition
root backed by a fresh in-memory boundary per test. The test would fail to
compile if the route export disappeared and would fail behaviorally if the
recognized `load` stopped delegating to the authorized factory. Its 11 passing
cases cover the permitted four-role SSR projection, anonymous redirect,
path/cross-center/non-member/unassigned/removed denials, state equality, and
the no-direct-DB/no-component-authorization boundary.
