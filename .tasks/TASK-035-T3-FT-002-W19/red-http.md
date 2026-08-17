# Attempt 1 — claim-linked RED HTTP probe

- Claim: `FT-002-AC-011 / REQ-003 / REQ-014` requires a protected role-scoped class entry shell at `/center/{centerId}/class/{classId}`.
- Time: 2026-08-14T23:18:09+05:00.
- Isolation: `DATABASE_URL=/tmp/study-calendar-task035-red.lfLIPc/app.db` on a one-use local Vite server at `127.0.0.1:5179`; no production database, fixture, account, session, or external service was used.
- Command: `curl --silent --show-error --include --max-time 10 http://127.0.0.1:5179/center/center-own/class/class-own`
- Observation: `HTTP/1.1 404 Not Found`; the body contained only SvelteKit's `404` / `Not Found` response and no class shell.
- Why this is a valid RED: before any route implementation, the exact accepted protected path did not exist. This directly demonstrates the missing AC-011 entry behavior rather than an artificial test/setup failure.
- Cleanup: Vite received SIGINT immediately after the one request; its exact disposable SQLite file was removed with `unlink`, then the empty `/tmp/study-calendar-task035-red.lfLIPc` directory was removed with `rmdir`.
