---
description: Execution context for TASK-013-T2-FT-003-W7.
status: active
---
# Context — TASK-013-T2-FT-003-W7

## Purpose

Implement the presentation-only calendar surface for elastic weekly geometry,
exact date navigation, and a color-independent lesson cue.

## Execution Attempt

- attempt: 1
- started: 2026-08-10T00:52:00+05:00

## Inputs (what drives this task)

- Task record: `.memory-bank/tasks/TASK-013-T2-FT-003-W7.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Specs: `.memory-bank/features/FT-003-calendar-and-lesson-context.md`, `.memory-bank/architecture/system-architecture.md`, `.memory-bank/contracts/boundary-map.md`, `.memory-bank/contracts/access-control.md`, `.memory-bank/domains/core-domain.md`, `.memory-bank/states/lifecycle-map.md`
- Acceptance criteria source: `.memory-bank/features/FT-003-calendar-and-lesson-context.md#ft-003-ac-001` and `#ft-003-ac-002`

## Richer inputs

- Source Artifacts: task card, `IMPL-FT-003`, and `.protocols/FT-003/plan.md`.
- Normative Inputs: composition/request data flow; Calendar and Membership Query Boundary; scheduling and lesson context lifecycle.
- Constraints / Invariants: SSR-safe Svelte 5 runes; URL state only for exact date navigation; color is not the sole state signal; no provider writes or authorization in the presentation component; selected date remains exact; non-lesson days remain reachable.
- Verification Targets: UI smoke/exact date picker navigation, independent-week geometry, and color-independent lesson cue.

## Loaded context set (what was read)

- `AGENTS.md`
- `.memory-bank/constitution.md`, `.memory-bank/mbb/index.md`, `.memory-bank/spec-backbone.md`, `.memory-bank/spec-index.md`
- `.memory-bank/roles/implementer.md`, `.agents/skills/exe/SKILL.md`, `.memory-bank/workflows/tier-policy.md`
- Task card, FT-003 feature, `IMPL-FT-003`, FT-003 planning `APPROVE`
- Direct architecture, boundary, access, domain, and lifecycle specs
- Existing `src/routes/+page.svelte`, package scripts, Svelte rules, and tests

## Decisions / assumptions

- Point-of-use preflight confirms only the selected task is being executed; no task scan or lifecycle closure is performed.
- The existing route is the accepted application-shell presentation boundary. Calendar geometry and URL date formatting live in a universal pure helper; no server module or provider boundary is changed.
- The current repository has no existing calendar UI harness, so claim evidence will use a focused deterministic helper/UI-contract probe plus required project-native check, build, and test gates; a runtime smoke artifact will be captured if the built route can be served locally.
- Existing dirty changes outside the target surface belong to the user and are preserved.

## Commands run / environment notes

- Read-only preflight commands → OK; details are recorded in `progress.md`.
- No prospective probe or production change occurred before this attempt and `in_progress` transition.

## Open questions / blockers

- None at preflight.

## Next session

- Start by reading: `context.md`, `plan.md`, `progress.md`.
- Next action (one concrete step): hand off to fresh `/verify TASK-013-T2-FT-003-W7`; do not replay the completed Attempt 1 RED/GREEN or production implementation.
