# TASK-098 Attempt 1 — hydrated shell browser evidence

- Attempt: `1` (resume evidence only; no retry or lifecycle change).
- Recorded at: `2026-08-24T16:12:26+05:00`.
- Task-owned probe: `e2e/ft-007-profile-routes.spec.ts` (`sha256` `c51168a0b1efc69c65ba8b0c7c320eb589b91c2c989fafaf6e8920df8fafcec3`).

## Runtime observation

The owned disposable Playwright server loaded authenticated `/profile`, waited
using the established local 500 ms hydration timing, clicked the actual shell
menu, and observed the menu toggle's `aria-expanded="true"`. From
`[data-protected-shell]`, it then observed these runtime attributes:

| Control | Observed attribute |
| --- | --- |
| Home | `href="/home"` |
| Classes | `href="/classes"` |
| Statistics | `href="/statistics"` |
| Profile | `href="/profile"` |
| Logout form | `method="POST"`, `action="/auth/logout"` |

The test did not assume the form was under `nav`: it locates `form` from the
observed protected shell. It then exercised each displayed link from the
hydrated menu and observed its exact destination. Finally, it submitted the
same observed form through the visible Logout button, observed `/login`, and
confirmed the old session token was rejected for `/profile` with `303` to
`/login`.

## Command and isolation result

```text
node scripts/run-disposable-e2e.mjs --database tmp/ft-007-profile-routes.db --spec e2e/ft-007-profile-routes.spec.ts
exit: 0
result: 1 Playwright test passed
```

The runner owned `tmp/ft-007-profile-routes.db`; after completion the exact
database, WAL, SHM, and JOURNAL paths were all absent. `study-calendar.db`
metadata before and after this final browser run was identical:

```text
size=356352 mtime=1787569891 inode=265994
```

This supplements, and does not replace, Attempt 1 RED, the prior focused
GREEN, and `execution-evidence-attempt-1.md`.
