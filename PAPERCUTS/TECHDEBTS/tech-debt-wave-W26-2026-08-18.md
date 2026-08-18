# Technical-debt advisory — Wave W26

Date: 2026-08-18
Scope: TASK-050-T3-FT-006-W26; Calendar projection routes/components,
`tests/routes/calendar-navigation.test.ts`,
`e2e/real-database-payment.spec.ts`, local `study-calendar.db` fixture, and W26
Memory Bank synchronization.

## Evidence reviewed

- Fresh executor, functional verifier, and semantic verifier evidence for
  FT-006-AC-008 / REQ-013.
- Repeated check, build, full test, real-database browser E2E, diff, mb-lint,
  and strict doctor gates.
- In-memory route probes for Student paid/unpaid projection, shared-role
  omission, forged scope denial, and no-mutation behavior.
- Real local database assertions for one payment/allocation, dedicated
  Teacher/Student retention, and exact session cleanup.
- TASK-050 card, FT-006 closure links, changelog, task index, requirements
  mapping, accepted contracts, and strict Memory Bank doctor output.

## Findings

No material technical debt was found in the W26 change surface. Calendar
ownership, named projection consumption, shared-role privacy, real-DB fixture
discipline, and browser acceptance are covered by current evidence and do not
require a follow-up task.

Existing Memory Bank metadata warnings remain advisory and are outside the W26
semantic change surface.

## Decision

No debt item is admitted. This advisory does not change task, feature,
requirement, architecture, or queue state.
