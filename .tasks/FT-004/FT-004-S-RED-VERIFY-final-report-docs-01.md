---
description: Current independent feature-level adversarial semantic verification report for FT-004.
status: final
---
# Red Verify — FT-004 Day Collaboration

## Accepted semantic target

FT-004 must keep comments, reactions, common/personal discussions, retained
thread branches, and their projections inside the current server-resolved
center/class/student scope. Cross-center reads are unambiguously forbidden.

## Evidence and adversarial coverage

- Inspected both indexed FT-004 task cards and all current execution,
  functional, semantic, and sync reports; prior PASS claims were supporting
  context only.
- Inspected the feature/REQ mapping, direct canonical architecture, boundary,
  access-control, domain, and collaboration-lifecycle specs, plus the current
  Collaboration boundary, shared schema, Center & Scheduling provider, tests,
  and actual W6 diff.
- Fresh routine Collaboration execution passed 2 files / 5 tests for comment
  ownership, five reactions, ordinary shared/personal scope, arbitrary-depth
  replies, first-reply activation, ten-tab retention, and reactivation.
- A fresh disposable public-boundary probe at
  `.tasks/FT-004/red-feature-probe.test.ts` (using the adjacent verifier
  config) exercised supported Admin CRUD across two centers. After center A
  created a class/lesson and FT-004 data,
  deleted the class, and center B recreated the same caller-supplied class and
  schedule identities, center B received center A's comment, reaction,
  root/reply bodies, author/reactor identities, and branch tab. The probe failed
  1/1 with that complete cross-center disclosure.
- Source evidence: `src/lib/server/platform/database.ts` retains Collaboration
  rows when class/lesson rows are deleted; `getFieldComments`, `getReactions`,
  and `getDayDiscussion` in
  `src/lib/server/modules/collaboration/public.ts` query class/lesson/scope
  without constraining the persisted `center_id`.

## Admitted material finding

**Cross-center Collaboration disclosure after supported class identity reuse.**
The path uses only current public commands: create class/schedule, create
comments/reactions/messages/replies, delete class, recreate the same identities
in another center, then query FT-004 projections. It exposes attributable
discussion data from the prior center to an actor authorized only for the new
center, materially breaking `REQ-014`, `FT-004-AC-005`, the Access Control
Contract, and the Day Discussion Query Boundary. No operator interpretation is
required to judge cross-center disclosure as forbidden.

## Reviewer report

- verdict: `REQUEST_CHANGES`.
- findings: the supported cross-center disclosure above is material and
  blocks semantic completion.
- evidence_checked: accepted FT-004 intent/specs, all current FT-004 task
  cards/reports, actual source/schema/provider surface, routine focused tests,
  and the fresh adversarial public-boundary probe.
- risks_or_questions: no operator-owned interpretation is unresolved.

## Owner handoff

The explicit lifecycle owner should treat FT-004 completion as semantically
failed, route this defect through the existing BUG/follow-up mechanism, and
rerun affected functional verification plus `/red-verify --feature FT-004`
after repair. This review changed no task/feature lifecycle, scheduler state,
queue, retry, BUG record, dependency, or promotion.

SEMANTIC_VERDICT: semantic-fail
