# Fresh re-verification evidence — TASK-039-T3-FT-003-W10

## Run context

- Reviewer command: `/verify TASK-039-T3-FT-003-W10`.
- CWD: `/home/serg/Projects/study_calendar`.
- Observed at: `2026-08-15T17:13:12+05:00`.
- Runtime: Node `v22.22.1`, Vitest `4.1.10`, Vite `8.2.1`.
- Task lifecycle remained `in_progress`; no task card, index, dependency,
  plan, status, or lifecycle file was changed by this verification.

## Current source/test state

- `tests/routes/calendar-authorized.test.ts:232` contains the operator-authorized
  reconciliation `expect(component).toContain('/lesson-context?')`.
- `src/routes/calendar/+page.svelte:23-29` constructs the existing
  `/lesson-context` path from `lessonDate`, `classId`, and `lessonId`; line 116
  renders the lesson anchor.
- The reconciliation file is outside TASK-039's non-empty implementation/test
  write boundary and was observed as pre-existing operator-authorized state;
  this verification did not edit it.
- Stable SHA-256 observations after all gates:

  - `src/routes/calendar/+page.svelte`:
    `419330c5d73b47e47f64e3004ae9e57de8958dbe4d0d7987b6191008c37f7038`
  - `tests/routes/calendar-navigation.test.ts`:
    `0a38030aa3686cb4709c604c94ad423e769466758b11ee01e0d83b05fc5c8f11`
  - `tests/routes/calendar-authorized.test.ts`:
    `0955fdc00a33626e108d78c57b6142c1e78812ebd7652400fe290d73c072040b`

## Fresh verifier-owned outcome probe

Command:

```text
npm exec vitest -- --config .tasks/TASK-039-T3-FT-003-W10/verify-probe.vitest.config.ts --reporter=verbose
```

Result: exit `0`; 1 test file and 1 test passed. The disposable `:memory:`
probe performed the real calendar load, current Svelte SSR, rendered-link
extraction, and existing Lesson Context load. It observed:

- exact `/lesson-context?date=2026-08-10&classId=class-own&lessonId=lesson-own`
  identity;
- exact query keys `date`, `classId`, `lessonId`, with no `studentAccountId`;
- existing shared response identity/material and `personal: null`;
- denial of a guessed `studentAccountId` through the existing route with `403`;
- equal complete database snapshots before and after both reads.

This single fresh probe covers the complete task-owned AC-008 / REQ-005 /
REQ-006 / REQ-014 claim set. The database is closed after the test and no
external or persistent state is used.

## Required gates

| Command | Result |
|---|---|
| `npm run test` | exit `0`; 32 files / 143 tests passed |
| `npm run check` | exit `0`; 0 errors and 0 warnings |
| `npm run build` | exit `0`; client and SSR production build completed |
| `git diff --check` | exit `0`; no whitespace diagnostics |
| `git diff --no-index --check /dev/null <untracked target>` | exit `1` with no output for the two task target files and reconciled test, the normal no-index difference status with no whitespace diagnostics |

## Architecture, hard boundary, and non-goals

- The accepted graph path remains `Lesson Context -> Center & Scheduling`
  through `Calendar and Membership Query Boundary`; the existing Lesson Context
  route remains composition and server-side authorization owner.
- The calendar component is presentation-only: no server capability import,
  database access, authorization decision, client-trusted student contract, or
  persistence write was observed. Existing route/module sources were not
  changed by this verification.
- No second API, personal student context, direct Lesson Context/module change,
  or change to the calendar server load was observed.
- The verifier changed only the task-owned verification protocol and added this
  evidence artifact; no source, task card, index, dependency, plan, status, or
  lifecycle was changed.

## Adjudication pack

Two independent `Codex Luna` co-review focuses were attempted twice each. The
runtime rejected the model as unsupported for the current ChatGPT account on
all four attempts, so no co-review findings were available; verification
continued under the pack's prescribed fallback.
