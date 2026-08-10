---
description: Current independent feature-level adversarial semantic verification report for FT-003.
status: final
---
# Red Verify — FT-003 Calendar and Lesson Context

## Accepted semantic target

The current W7 feature surface must provide elastic weekly geometry, exact URL
date navigation, reachable non-lesson days, and a lesson-state cue that remains
perceivable without color. The route/helper remain presentation-only; provider
writes, authorization, cross-slice orchestration, and downstream day-context
composition are outside this task. AC-003..AC-006 remain owned by
`TASK-014-T3-FT-003-W8` and are not silently claimed here.

## Evidence and adversarial coverage

- Inspected the FT-003 feature, both FT-003 task cards, direct architecture,
  boundary, access-control, domain, lifecycle, and testing specs, current diff,
  source/helper/tests, executor RED/GREEN, and fresh functional evidence.
- Replayed the production preview through headless Chromium CDP: the hydrated
  page navigated from `?date=2026-08-13` to `?date=2026-08-22` through the
  actual date-input change handler; URL, input, heading, and selected link stayed
  exact. Browser console errors/warnings: none.
- SSR fetch returned the exact selected date, 21 unique reachable links, 3
  distinct weekly templates, and visible state labels. The inspected 1440×1400
  preview shows larger lesson cards and `✦ Урок`/`Свободно` labels.
- Source inspection found Svelte 5 `$derived`/`$app/state` usage and no
  browser-global client-only dependency, server `load`/action, provider,
  authorization, or persistence write path. Calendar geometry remains a pure
  universal helper and URL `goto` is the only navigation side effect.

## Admitted findings

None. No material semantic drift, color-only accessibility failure, exact
navigation regression, coupled-week geometry, SSR/hydration defect, or
boundary/ownership violation was evidenced on the supported current surface.

## Operator questions

None.

## Verdict

SEMANTIC_VERDICT: semantic-pass

## Owner handoff

- Evidence/report paths: this report and
  `.protocols/TASK-013-T2-FT-003-W7/verification.md`.
- Recommended owner action: scheduler may consume the current W7 functional
  and semantic results; retain `TASK-014` as owner of remaining AC-003..AC-006.
- Resume route: `n/a` for this semantic review.
- Lifecycle, queue, scheduler state, specs, implementation, and `/mb-sync`
  were not changed.
