# Attempt 1 — AC-007 RED

- Claim: `FT-003-AC-007 / REQ-005 / REQ-014 / REQ-016`
- Command: `test -f src/routes/calendar/+page.server.ts && test -f src/routes/calendar/+page.svelte`
- CWD: `/home/serg/Projects/study_calendar`
- Result: exit `1`
- Observation: both route files were absent before production work. The current
  application therefore had no authenticated `/calendar` load or presentation
  capable of resolving authorized DB-backed class lessons. This is the task
  card's explicit route-absence RED, not a setup/syntax failure.
- State effect: none; the probe only inspected the filesystem.
