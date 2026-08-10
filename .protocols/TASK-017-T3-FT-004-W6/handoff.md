---
description: Implementer handoff for TASK-017-T3-FT-004-W6.
status: active
---
# Handoff — TASK-017-T3-FT-004-W6

## Summary

- Fresh T3 execution attempt initialized for the selected threaded-discussion
  center-lifecycle isolation task.
- Production change decision is deferred until the smallest isolated
  claim-scoped probe runs after task start.

## Where to look

- key files:
  - `.protocols/TASK-017-T3-FT-004-W6/{context,plan,progress,verification,handoff}.md`
  - `.tasks/TASK-017-T3-FT-004-W6/`
  - task-scoped Collaboration source/tests listed in the task card
- advisory `touched_files` deviations and rationale:
  - none at preflight
- hard write-boundary compliance: not set; forbidden scope clear

## How to run / verify

- gates:
  - pending `npm run check`, `npm run build`, `npm run test`
- claim-linked RED/GREEN evidence:
  - pending attempt 1 probe and `progress.md`
- current-attempt reuse candidate locators:
  - none yet
- superseded/supporting-only receipt locators:
  - historical TASK-012/TASK-016 evidence is supporting context only and is not
    current TASK-017 proof

## Known issues

- None at preflight.

## Follow-ups

- After this `/exe` handoff, the next owner must run fresh independent
  `/verify TASK-017-T3-FT-004-W6`; T3 `/red-verify` remains due after
  functional PASS. Do not close, sync, promote, or run those workflows here.
