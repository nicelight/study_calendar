---
description: Execution progress for TASK-038-T3-FT-003-W10.
status: active
---
# Progress — TASK-038-T3-FT-003-W10

## Current status

- state: implementing
- last update: 2026-08-15

## What was done

- Preflight confirmed the indexed T3 identity, current `ready` lifecycle,
  done prerequisites, Planning Revision 2, and current FT-003 plan approval.
- Started Attempt 1 and transitioned only this task to `in_progress` before
  prospective RED, production writes, or other side effects.
- Added and ran the isolated SSR RED probe. It proves that a current rendered
  calendar lesson exposes no `/lesson-context` link for its exact identity.
- Stopped before production code because current server-rendered calendar data
  has no permitted student identity/scope to carry; fabricating one from role,
  URL, or client state would violate the task and Access Control contract.

## Commands run (with results)

- Static context/source inspection → OK.
- `npm run test -- tests/routes/calendar-navigation.test.ts` → expected RED:
  one failed assertion; evidence in
  `.tasks/TASK-038-T3-FT-003-W10/attempt-1-red.md`.
- `git diff --check` → OK; the task card/component/test and all protocol files
  are currently untracked, so their final diff remains visible via
  `git status --short` for the lifecycle owner.

## Claim-linked RED / GREEN (T2/T3)

- attempt: Attempt 1
- applicability: applicable
- accepted claim locator(s): FT-003-AC-008 / REQ-005 / REQ-006 / REQ-014
- accepted not-applicable reason and alternative proof: not applicable
- RED command/probe: `npm run test -- tests/routes/calendar-navigation.test.ts`
- RED observation and evidence: SSR output renders the lesson only as a
  calendar-day fact; it lacks the required existing Lesson Context href. See
  `.tasks/TASK-038-T3-FT-003-W10/attempt-1-red.md`.
- GREEN command/probe: unavailable without a server-authorized optional
  student identity in current calendar output.
- GREEN observation and evidence: blocked; no production behavior was changed.
- claim-equivalent probe changes and rationale: added the isolated navigation
  test as the first prospective claim probe; it is intentionally RED.
- T3 isolation/cleanup/permission evidence: SSR-only component probe used no
  external service or persistence. The blocked full-route probe would require
  a scope value absent from route output.

## Reuse Candidates (optional)

- None proposed before final gates.

## Evidence links

- `.tasks/TASK-038-T3-FT-003-W10/attempt-1-red.md`.

## Open issues / risks

- Material boundary/task contradiction: the direct stop condition prohibits
  generating/guessing a `studentAccountId`, while the current immutable loader
  omits every server-authorized student identity needed by the required
  with-and-without-student link proof.

  Safe alternatives needing owner choice:
  1. `/feature-to-tasks FT-003` (and review) scopes an accepted loader/output
     change that serializes only a server-permitted selected student identity;
     then a replacement task can implement both link variants.
  2. The feature/task is explicitly narrowed to a shared-only link with no
     student query parameter; that would not preserve the current AC-008 proof
     contract and therefore needs durable planning acceptance.

## Next step (single concrete action)

- Route the blocked decision to `/feature-to-tasks FT-003`; do not run GREEN,
  full gates, `/verify`, or `/red-verify` against incomplete behavior.
