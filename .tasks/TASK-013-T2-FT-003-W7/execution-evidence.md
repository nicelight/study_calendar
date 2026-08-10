---
description: Execution evidence for TASK-013-T2-FT-003-W7.
status: active
---
# Execution Evidence — TASK-013-T2-FT-003-W7

## Attempt 1

### Initial claim-specific RED

- claim mapping: `FT-003-AC-001`, `FT-003-AC-002`.
- command: `npm run test -- tests/calendar/elastic-calendar.test.ts`.
- cwd: `/home/serg/Projects/study_calendar`.
- result: exit `1`; both tests reached claim assertions against the existing route. AC-001 failed because the placeholder had no `type="date"`, URL-state, or geometry contract. AC-002 failed because it had no `aria-label` or lesson-state cue. This is an honest behavior RED, not setup/import/syntax failure.
- input basis: pre-implementation `src/routes/+page.svelte` was the Foundation placeholder; the focused probe was the only new test input; no production calendar helper existed.

### Claim-equivalent GREEN

- claim mapping: `FT-003-AC-001`, `FT-003-AC-002`.
- command: `npm run test -- tests/calendar/elastic-calendar.test.ts`.
- cwd: `/home/serg/Projects/study_calendar`.
- result: exit `0`; 1 file and 2/2 tests passed.
- AC-001 evidence: `buildCalendarWeeks('2026-08-13')` returns exactly one selected `2026-08-13`, 21 unique reachable day records, per-week lesson counts `[2, 1, 3]`, three distinct `columnTemplate` values, and lesson tracks `1.8fr` versus non-lesson tracks `0.8fr`; route source contains the standard date input, URL-derived selection, and an `href` for every `day.date`.
- AC-002 evidence: route source contains semantic `aria-label` text for lesson/free days, visible `Урок`/`Занятие` labels, `.day-state`, and the `✦` cue; meaning is not dependent on color alone.
- input basis: current Attempt 1 source after implementation; focused probe includes deterministic helper assertions and route contract assertions; no external state.

### Probe correction note

- The first post-change invocation exited `1` only because a regex in the focused probe did not match the literal Svelte `/?date` template; AC-002 and helper assertions passed. The probe was corrected to `toContain('href={`/?date=${day.date}`}')`, then rerun unchanged in claim intent and passed. No production file changed for this correction.

### Attempt 1 final preview smoke

- claim mapping: `FT-003-AC-001`, `FT-003-AC-002`; final CSS/runtime evidence only, supporting the unchanged claim-equivalent GREEN.
- actual changed files: `src/routes/+page.svelte`, `src/lib/calendar.ts`, `tests/calendar/elastic-calendar.test.ts`. Protocol/evidence artifacts are task-owned bookkeeping; no other product files were changed for W7.
- scope: advisory `touched_files` stayed within `src/routes/`, `src/lib/`, and `tests/calendar/`; no hard `write_boundary` was configured; neither forbidden Foundation task record was touched; no provider write, authorization, server loader/action, public boundary, or dependency-graph change was introduced.
- input snapshot immediately before preview: source object hashes were `src/routes/+page.svelte=ef03cdec1ee786cb05a6e9f0ec1f93bba970aa5f`, `src/lib/calendar.ts=a3ff81d93730234563fb6a8ab30bb0ec818cc2e2`, `tests/calendar/elastic-calendar.test.ts=6cebf10965c0056d1e5825843745d541ccce29e7`; generated SSR entry SHA-256 was `9ade6eea51ace908c7611143e012eac49bc1196f095e89f94d6203f6e81f3e0e`; generated CSS SHA-256 was `d78c873394f3379a6353800d2b97197e4171e5bd5af022b5198effcd3f252289`. Other worktree changes were pre-existing/unrelated and preserved.
- build command: `npm run build`.
- build result: exit `0`; current source was materialized into the production SSR/client output before serving.
- preview command: `npm run preview -- --host 127.0.0.1`.
- browser command: `google-chrome --headless --no-sandbox --disable-gpu --hide-scrollbars --window-size=1440,1400 --virtual-time-budget=2000 --screenshot=/home/serg/Projects/study_calendar/.tasks/TASK-013-T2-FT-003-W7/preview-smoke-desktop.png 'http://127.0.0.1:4173/?date=2026-08-13'`.
- browser result: exit `0`; `/home/serg/Projects/study_calendar/.tasks/TASK-013-T2-FT-003-W7/preview-smoke-desktop.png` is a 1440×1400 PNG with SHA-256 `e9143072d4e9b96fce33cb989c55237e6d90aa6388aae95c6642fded12b44dd8`. Visual review observed the selected date heading, date input, lesson symbol/label, free-day label, and distinct lesson-weighted week geometry.
- DOM command: `google-chrome --headless --no-sandbox --disable-gpu --virtual-time-budget=2000 --dump-dom 'http://127.0.0.1:4173/?date=2026-08-13' 2>/dev/null | rg -o 'value="2026-08-13"|aria-current="date"|href="/\?date=2026-08-13"|<h2 id="selected-day-title"[^>]*>[^<]+' | sort | uniq -c`.
- DOM result: exit `0`; one exact input value, one selected-day marker, one exact date link, and heading `13 августа 2026 г.` were observed. A separate DOM extraction observed three distinct weekly templates: `0.8fr 1.8fr 0.8fr 1.8fr 0.8fr 0.8fr 0.8fr`, `0.8fr 0.8fr 1.8fr 0.8fr 0.8fr 0.8fr 0.8fr`, and `1.8fr 0.8fr 1.8fr 0.8fr 0.8fr 1.8fr 0.8fr`, plus 15 `Свободно` labels and visible `Урок` cues.
- DOM geometry/cue extraction command: `google-chrome --headless --no-sandbox --disable-gpu --virtual-time-budget=2000 --dump-dom 'http://127.0.0.1:4173/?date=2026-08-13' 2>/dev/null | rg -o 'class="day-state[^>]*>[^<]+|style="--week-columns: [^"]+' | sort | uniq -c`.
- DOM geometry/cue extraction result: exit `0`; three distinct inline weekly templates, 15 `Свободно` labels, and visible `Урок` cues were observed.
- SSR command: `curl --fail --silent --show-error 'http://127.0.0.1:4173/?date=2026-08-13' | rg -o 'value="2026-08-13"|aria-current="date"|href="/\?date=2026-08-13"|<h2 id="selected-day-title"[^>]*>[^<]+' | sort | uniq -c`.
- SSR result: exit `0`; the same exact date value, selected marker, selected-day heading, and reachable exact-date link were present in the served HTML.
- completed_at: `2026-08-10T01:07:36+05:00`.
- status: supporting-only; browser/runtime evidence is not offered as a reusable independent verifier receipt.
