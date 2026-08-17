# Attempt 2 — fresh claim-linked RED real-route matrix

## Basis

`VERIFY FAIL` showed that Attempt 1's private factory was unreachable from the
actual SvelteKit route. This fresh pre-correction probe reran that exact
harm-driving failure on new isolated state.

## Isolation and cleanup

- Runtime: local Vite/SvelteKit SSR at `http://127.0.0.1:5187`.
- Database: `/tmp/study-calendar-task035-retry-red.rBjWeW/app.db`, initialized
  by the server after a public GET and seeded only with disposable fixture rows.
- Fixtures: own-center Admin, assigned/unassigned/removed Teachers, own and
  non-member Students, linked and non-member Parents, cross-center Admin, and
  a revoked session. Requests contained only the server session cookie.
- Cleanup: Vite received SIGINT after the matrix. The exact SQLite file was
  deleted with `unlink` and its empty directory removed with `rmdir`.

## Command outcome

The fresh matrix issued real `curl` GET requests with `redirect: manual`
semantics. Before and after full persisted-state SHA-256 values were identical:

```text
b28ed412f634d38489bbd15ea0c910599eba0ab5db6131d31b25e515d49e80f4
```

Every case returned `200` with no class name, no role marker, and no login
redirect:

| Cases | Observed HTTP / body |
|---|---|
| own Admin, assigned Teacher, own Student, linked Parent | `200`; no `Algebra`, no `data-role` |
| anonymous | `200`; no `Location: /login` |
| mismatched center/class, cross-center Admin | `200`; no authorization failure |
| unassigned/removed Teacher, non-member Student/Parent, revoked session | `200`; no authorization failure |

This is a claim-specific RED: the real protected route bypassed its only
authorization/data factory and therefore failed both the permitted-context and
denial sides of `FT-002-AC-011 / REQ-003 / REQ-014`.
