# `/verify` attempt 1 — TASK-104-T3-FT-002-W20

## Verifier-owned targeted probe

- command: `npx vitest run --config .tasks/TASK-104-T3-FT-002-W20/verify-vite.config.ts`
- cwd: `/home/serg/Projects/study_calendar`
- result: exit code `0`; 1 test file / 1 test passed
- probe: `.tasks/TASK-104-T3-FT-002-W20/verify-probe.test.ts`
- isolation: fresh in-memory database per test; disposable Admin and Teacher
  sessions; no production database or external state

The probe independently observed the protected Admin projection and SSR output,
then exercised the exported route actions. It proved:

- `lessons` projection contains the server-resolved class lessons and the SSR
  page renders `?/addLesson`, `?/transferLesson`, and `?/cancelLesson`;
- add succeeds for the selected own-center schedule while ignoring a submitted
  browser `lessonId`, producing a different persisted ID with the expected
  class/schedule/date/status;
- transfer succeeds for one lesson with the same ID and leaves a sibling row
  unchanged;
- a schedule from another class is rejected as `403 forbidden` and the full
  Schedule/Lesson snapshot remains equal;
- cancellation of a completed lesson returns the existing safe `500
  operation_failed` envelope and leaves the full Schedule/Lesson snapshot equal;
- a non-Admin cancellation is rejected as `403 forbidden`.

## Repeated project gates

- `npm run check` → exit `0`; svelte-check 0 errors / 0 warnings
- `npm run build` → exit `0`; client and SSR bundles built
- `npm run test` → exit `0`; 69 files / 240 tests passed
- `git diff --check` → exit `0`

## Source and boundary review

The current diff keeps Schedule/Lesson writes in Center & Scheduling, resolves
the own-center class projection before each new owner call, and does not add
route/component persistence or client-owned authorization. The two required
Codex Luna xhigh co-reviews returned `candidate_findings: none` for behavior
and architecture/boundary focus.
