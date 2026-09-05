---
description: Bounded feature-doctor clarification for FT-004 participant-label ownership and named-action task boundary.
status: complete
last_updated: 2026-09-05
source_of_truth:
  - .protocols/FT-004/clarification.md
---
# FT-004 Feature Doctor Clarification

## Finding

The browser contract requires display labels for comment authors and reaction
participants. Identity & Access owns `fullName`, but the accepted Actor Context
Boundary currently exposes profile lookup only for IDs already selected by
Center & Scheduling's statistics composition. Collaboration views currently
return only `authorAccountId` and `reactorAccountId`; passing arbitrary
discussion IDs to the existing statistics query, reading Identity & Access
tables directly, or broadening the existing task cards implicitly would violate
the accepted boundary.

Evidence:

- `.memory-bank/contracts/boundary-map.md#actor-context-boundary`
- `.memory-bank/contracts/access-control.md#account-profile-facts`
- `src/lib/server/modules/collaboration/public.ts`
- `src/lib/server/modules/lesson-context/public.ts`
- `src/lib/server/modules/center-scheduling/public.ts`
- review artifact `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-004-BROWSER-R1-final-report-docs-01.md`

## Options

### Option A — bounded Collaboration participant-label projection (recommended)

Extend the accepted Actor Context public contract, through `/spec-redesign`,
with a read-only profile-label projection usable by Collaboration after
Collaboration has authorized the current discussion resource. Collaboration
passes only account IDs present in its server-resolved permitted shared or
personal discussion projection; Identity & Access returns only
`{accountId, fullName}`. The result grants no role, center, class, student, or
session authority.

This keeps Identity & Access as the profile owner, Collaboration as the
resource/privacy owner, and Lesson Context as the composition/UI adapter. It is
the smallest legal extension that covers authors and reactors across Admin,
Teacher, Student, and Parent without exposing a whole class registry.

Affected surface: Actor Context Boundary, access-control/profile consumer
wording, Collaboration browser contract, TASK-102, TASK-103, and their
claim-linked tests. After the shared contract is accepted, rerun
`/feature-to-tasks FT-004` and then `/review-tasks-plan FT-004`.

### Option B — broaden Center & Scheduling participant projection

Extend Center & Scheduling to return role-filtered labels for every account
that may appear in a permitted discussion, then let Lesson Context compose
those labels. This preserves Identity & Access ownership but broadens the
Calendar/Membership Query Boundary and risks exposing unnecessary participant
registry data to Student/Parent contexts. It requires a larger shared-contract
and privacy review and is not recommended under KISS.

### Rejected shortcut — raw IDs or existing statistics lookup

Rendering account IDs is not the accepted product surface. Calling
`getStatisticsProfiles` with discussion IDs is not legal under the current
boundary because those IDs are not selected by Center & Scheduling's registry
scope. Direct Identity & Access persistence reads are forbidden.

## Decision required

May FT-004 use Option A: a bounded, read-only Identity & Access participant-
label projection requested by Collaboration only after its server-authorized
discussion scope has selected the author/reactor IDs, with no authority fields
in the projection?

## Routing state

- Decision: Option A accepted by the operator on 2026-09-03 under the KISS
  preference.
- `Design impact: bounded`; Planning Revision remains `2`, Foundation is
  unaffected, and FT-004 is the only affected feature.
- `Behavior spec impact: refresh_recommended`; the bounded owner contract is
  now recorded in `.memory-bank/contracts/boundary-map.md`,
  `.memory-bank/contracts/access-control.md`, and
  `.memory-bank/contracts/collaboration-browser-surface.md`.
- Immediate route: reconcile TASK-102/TASK-103 through
  `/feature-to-tasks FT-004`, then rerun `/review-tasks-plan FT-004`.
- Mechanical review findings (gate paths, AC-005 locator, AC-005 artifact,
  anonymous/invalid-session proof) are task-card reconciliation items.

## 2026-09-05 — Named-action task-boundary finding

### Finding

The fresh FT-004 planning review found that the canonical browser contract
requires five named SvelteKit form actions, while the current route and all
existing Lesson Context forms still use one `default` action. TASK-102 owns
the named transport but forbids the existing page forms; TASK-103 owns the
page but forbids the route server. Because SvelteKit 2.70.2 rejects exporting
`default` together with named actions, the current W35/W36 split cannot reach a
working intermediate state without violating a hard scope or breaking current
forms.

Evidence:

- `.memory-bank/contracts/collaboration-browser-surface.md#authorized-mutation-transport`
  requires `createFieldComment`, `editFieldComment`, `setReaction`,
  `createMessage`, and `replyToMessage`.
- `src/routes/lesson-context/+page.server.ts:169-179` exports only
  `actions.default`.
- `src/routes/lesson-context/+page.svelte:127-320` submits existing forms to
  the default action without named targets.
- `.memory-bank/tasks/TASK-102-T3-FT-004-W35.task.json` forbids the page, while
  `.memory-bank/tasks/TASK-103-T3-FT-004-W36.task.json` forbids the server
  route.

### Repair options

1. **Preserve the accepted named-action contract (recommended).** Reconcile
   `/feature-to-tasks FT-004` so TASK-102 atomically migrates the existing
   Lesson Context form callers and route transport to named actions, while
   TASK-103 adds the Collaboration UI/forms on that stable transport. This
   keeps the contract, avoids a broken intermediate route, and changes only
   task ownership/hard scope.
2. **Replace the named-action contract with one default dispatcher.** This
   would require a canonical contract/spec redesign and a larger revalidation
   surface; it is not selected because it contradicts the current accepted
   browser contract.

Decision: no product or canonical-contract decision remains unresolved. The
accepted named-action contract is authoritative; the repair is a local task
boundary/proof reconciliation owned by `/feature-to-tasks FT-004`.

Design impact: none.

Behavior spec impact: none.

Immediate route: `/feature-to-tasks FT-004`, then fresh
`/review-tasks-plan FT-004`. Do not execute TASK-102/TASK-103 before approval.

### Resolution

The accepted named-action contract is retained. `/feature-to-tasks FT-004`
reconciled TASK-102 to own the existing default-form caller migration together
with the named route actions and removed the page from its forbidden scope;
TASK-103 now consumes that stable transport and remains the owner of the
Collaboration UI and browser proof. No feature behavior, canonical contract,
task identity, tier, dependency, lifecycle, or Planning Revision changed.
