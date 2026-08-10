---
description: Canonical capability-slice inventory, dependency graph, public boundaries, and write ownership.
status: active
last_updated: 2026-08-10
source_of_truth:
  - .memory-bank/contracts/boundary-map.md
---
# Boundary Map

## Purpose

This document is the single detailed inventory of the modular-monolith
capability slices and their accepted dependency edges. `Consumer -> Provider`
is the direction of dependency. A shared database is physically common, but
business state and mutable invariants remain slice-owned.

## Modules

| Module / Change Unit | Parent Architecture Unit | Code Root | Responsibility |
|---|---|---|---|
| Identity & Access | [Capability module runtime](../architecture/system-architecture.md#2-capability-module-runtime) | `src/lib/server/modules/identity-access/` | Internal accounts, roles, external identities, invitations, sessions, and authentication context. |
| Center & Scheduling | [Capability module runtime](../architecture/system-architecture.md#2-capability-module-runtime) | `src/lib/server/modules/center-scheduling/` | Centers, classes, class/center membership, parent links, teacher assignment, schedules, lesson identity, dates, and schedule lifecycle. |
| Lesson Context | [Capability module runtime](../architecture/system-architecture.md#2-capability-module-runtime) | `src/lib/server/modules/lesson-context/` | Calendar navigation, shared lesson material, and composition of authorized shared/personal day views. |
| Collaboration | [Capability module runtime](../architecture/system-architecture.md#2-capability-module-runtime) | `src/lib/server/modules/collaboration/` | Field comments, reactions, shared/personal discussion scope, threaded messages, and branch visibility. |
| Learning Progress | [Capability module runtime](../architecture/system-architecture.md#2-capability-module-runtime) | `src/lib/server/modules/learning-progress/` | Homework completion, grades, attendance state, and attendance-change workflow. |
| Financial Ledger | [Capability module runtime](../architecture/system-architecture.md#2-capability-module-runtime) | `src/lib/server/modules/financial-ledger/` | Price settings, historical charges, payments, allocations, balances, payment markers, and financial audit records. |

The application shell, composition root, platform adapters, and database are
architecture units described in
[.memory-bank/architecture/system-architecture.md](../architecture/system-architecture.md);
they are not additional business slices.

## Dependency Graph

Only these significant inter-slice edges are accepted. Every row links to one
exact public contract heading below; an absent edge is not authorized.

| Consumer | Provider | Contract |
|---|---|---|
| Center & Scheduling | Identity & Access | [Account Provisioning Boundary](#account-provisioning-boundary) |
| Lesson Context | Identity & Access | [Actor Context Boundary](#actor-context-boundary) |
| Lesson Context | Center & Scheduling | [Calendar and Membership Query Boundary](#calendar-and-membership-query-boundary) |
| Lesson Context | Learning Progress | [Personal Progress Query Boundary](#personal-progress-query-boundary) |
| Lesson Context | Collaboration | [Day Discussion Query Boundary](#day-discussion-query-boundary) |
| Lesson Context | Financial Ledger | [Financial Projection Query Boundary](#financial-projection-query-boundary) |
| Collaboration | Identity & Access | [Actor Context Boundary](#actor-context-boundary) |
| Collaboration | Center & Scheduling | [Calendar and Membership Query Boundary](#calendar-and-membership-query-boundary) |
| Learning Progress | Identity & Access | [Actor Context Boundary](#actor-context-boundary) |
| Learning Progress | Center & Scheduling | [Calendar and Membership Query Boundary](#calendar-and-membership-query-boundary) |
| Learning Progress | Financial Ledger | [Attendance Charge Reconciliation Boundary](#attendance-charge-reconciliation-boundary) |
| Financial Ledger | Identity & Access | [Actor Context Boundary](#actor-context-boundary) |
| Financial Ledger | Center & Scheduling | [Financial Scope and Lesson Fact Boundary](#financial-scope-and-lesson-fact-boundary) |

No event bus, message broker, agent boundary, or cross-slice shared repository
is accepted. Persisted chat messages are Collaboration data, not integration
events.

## Inline Contracts

Each block names the public surface, ownership, forbidden bypasses, and minimum
credible proof. Internal classes, repositories, route names, and table names
remain implementation details.

### Account Provisioning Boundary

- **Provider:** Identity & Access.
- **Public surface:** expose one authoritative provisioning command,
  `provisionAccount`, for the account-plus-invitation write; also expose the
  named invitation lifecycle, provider-binding, second-provider, and actor
  context operations. `createAccount` and `issueInvitation` are not alternate
  public write commands.
- **State/data authority:** Identity & Access exclusively writes account,
  role, invitation, external-identity, and session state.
- **Allowed interaction:** Center & Scheduling resolves the server-side actor
  and the actor's own-center Admin authorization before requesting
  `provisionAccount`; Identity & Access then performs the account-plus-
  invitation write. The command does not accept caller-trusted role or center
  scope as authorization. Center & Scheduling receives only the resulting
  account/invitation facts needed to continue. Provider adapters are invoked
  through this boundary.
- **Failure/compatibility:** the account and invitation are one atomic write;
  duplicate or failed provisioning rolls both back. Expired, revoked, reused,
  duplicate, or failed provider operations are rejected atomically; no partial
  account, role, membership, or binding is left behind.
- **Forbidden bypasses:** no route, UI, or other slice may assign a role, bind
  an identity, or trust a provider response directly. No public
  `createAccount`/`issueInvitation` write bypass may exist beside
  `provisionAccount`; no caller may bypass the Center & Scheduling actor and
  own-center Admin authorization or write Identity & Access persistence.
- **Verification:** provider integration scenarios cover both providers,
  unauthenticated/non-Admin/cross-center denial, valid own-center Admin
  provisioning, invitation reuse/failure, duplicate identities, alternate
  command absence, and state-before/state-after atomicity.

### Actor Context Boundary

- **Provider:** Identity & Access.
- **Public surface:** resolve the authenticated actor and stable role-bearing
  account context for a request; reject absent, invalid, or revoked sessions.
- **State/data authority:** Identity & Access owns authentication facts; it does
  not own class/student membership facts.
- **Allowed interaction:** every protected slice may consume actor identity and
  role facts, then must combine them with its own resource-scope facts before
  authorizing an operation.
- **Failure/compatibility:** an invalid or unauthenticated actor cannot reach a
  protected command or receive protected data.
- **Forbidden bypasses:** no client-supplied role, center, class, or student ID
  is trusted as authorization; no module caches request/user state globally.
- **Verification:** negative unauthenticated, revoked-session, and role/context
  mismatch scenarios at each protected public boundary.

### Calendar and Membership Query Boundary

- **Provider:** Center & Scheduling.
- **Public surface:** return authorized center/class membership, teacher
  assignment, student/parent links, lesson identity/date/status, schedule facts,
  and the class context needed by a consumer; accept owner-side center,
  membership, assignment, and schedule commands.
- **State/data authority:** Center & Scheduling exclusively writes Center,
  Class, membership, parent-link, assignment, schedule, and Lesson state.
- **Allowed interaction:** consumers use scoped queries and named commands; the
  slice may call Identity & Access for account/invitation provisioning during
  an admin-owned membership workflow.
- **Failure/compatibility:** moved lessons retain identity and context; removed
  assignments are denied at the next authorization check; unrelated recurring
  lessons remain unchanged.
- **Forbidden bypasses:** no consumer writes membership, assignment, lesson,
  or schedule tables or reconstructs class authorization from a UI route.
- **Verification:** individual/group scheduling lifecycle, transfer identity,
  cross-center membership, assignment removal, and historical access scenarios.

### Personal Progress Query Boundary

- **Provider:** Learning Progress.
- **Public surface:** return authorized homework completion, attendance, and
  personal grade facts for a selected student/lesson; expose a lesson-scoped
  grade query such as
  `getGradeForLesson({ sessionToken, classId, lessonId, studentAccountId }) -> GradeView | null`.
  The query receives the stable lesson identity plus server-resolved actor and
  scope context; the consumer does not supply a homework identity. Owner-side
  completion, grade, and attendance commands remain on this boundary.
- **State/data authority:** Learning Progress exclusively writes homework,
  grade, and attendance state. It also owns the lesson-to-homework
  selection/relation semantics used by the lesson-scoped grade projection and
  owns the attendance transition workflow. This decision does not create an
  alternative consumer-owned or separately persisted `lessonId -> homeworkId`
  relation.
- **Allowed interaction:** Lesson Context composes read-only personal views and
  calls the lesson-scoped query with `lessonId` and the selected student/server-
  resolved actor context. Lesson Context never resolves the homework identity.
  Learning Progress may call Financial Ledger for charge reconciliation after
  an attendance change.
- **Failure/compatibility:** grades and personal progress are never returned
  outside the permitted family/teacher/admin context; an unauthorized or
  wrong-scope lesson query fails without revealing private target existence;
  attendance correction is auditable and isolated to the affected student.
  The existing single-homework `getGrade(homeworkId)` implementation is
  current-state evidence, not the accepted Lesson Context provider contract.
- **Forbidden bypasses:** no calendar/UI route writes progress, no consumer
  changes attendance or grades through a financial or collaboration boundary,
  no consumer invents `homeworkId`, and no consumer reads Learning Progress
  tables to reconstruct the selection.
- **Verification:** role-based grade privacy and lesson-scoped query checks
  prove selected-student isolation, provider-owned selection, no direct
  database mapping, and both individual/group attendance plus absent-to-present
  correction scenarios.

### Day Discussion Query Boundary

- **Provider:** Collaboration.
- **Public surface:** return permitted field comments, reactions, common-day
  messages, personal discussions, and branch/tab projection; accept owner-side
  comment, reaction, message, and reply commands.
- **State/data authority:** Collaboration exclusively writes comments, reactions,
  messages, reply relationships, and branch activity/visibility facts.
- **Allowed interaction:** Lesson Context asks for a scoped day discussion
  projection; Collaboration uses actor and class/student scope facts.
- **Failure/compatibility:** arbitrary reply depth and hidden branch retention
  are preserved; visibility never crosses the selected shared/personal scope.
- **Forbidden bypasses:** no consumer writes discussion objects or treats a
  hidden branch as deleted.
- **Verification:** ownership, five-reaction, nested-reply, eleven-plus branch,
  retention, and cross-context privacy scenarios.

### Financial Projection Query Boundary

- **Provider:** Financial Ledger.
- **Public surface:** return an authorized balance, charge/payment/allocation
  status, and payment-marker projection for a student and date range; accept
  owner-side payment and financial correction commands.
- **State/data authority:** Financial Ledger exclusively writes price settings,
  charges, payments, allocations, balances, payment markers, and financial
  audit records.
- **Allowed interaction:** Lesson Context reads the projection for a personal
  day; no consumer changes it through a projection query.
- **Failure/compatibility:** marker placement is a read projection and cannot
  change Payment, allocation, or balance; exact values remain stable across
  replay.
- **Forbidden bypasses:** no UI or neighbor module writes financial tables or
  derives a balance from presentation data.
- **Verification:** financial contract replay, marker projection, and
  cross-student/cross-center read denial.

### Attendance Charge Reconciliation Boundary

- **Provider:** Financial Ledger.
- **Public surface:** reconcile the charge consequence for one owned lesson and
  student after an authorized attendance transition; return the resulting
  charge/balance facts to the Learning Progress orchestrator.
- **State/data authority:** Learning Progress owns attendance; Financial Ledger
  owns charge creation/recalculation, allocation, balance, and financial audit.
- **Allowed interaction:** Learning Progress calls this command after it
  validates the attendance transition; both owners may participate in the same
  transaction without bypassing ownership.
- **Failure/compatibility:** `absent` creates no charge; `absent -> present`
  creates the historically applicable charge, deterministically recalculates,
  and records author/time/change evidence; failure leaves the command atomic.
- **Forbidden bypasses:** Learning Progress never inserts or edits charge,
  allocation, or audit rows directly.
- **Verification:** individual/group correction replay, historical price,
  balance, audit, and unrelated-student isolation checks.

### Financial Scope and Lesson Fact Boundary

- **Provider:** Center & Scheduling.
- **Public surface:** provide the financial slice with the target center/class/
  student scope, current teacher assignment, lesson identity/date/status, and
  class pricing context needed to authorize or price a financial command.
- **State/data authority:** Center & Scheduling owns the referenced scope and
  lesson facts; Financial Ledger owns the applied price snapshot in a Charge.
- **Allowed interaction:** Financial Ledger uses a server-resolved actor plus
  these facts to enforce Admin center-wide and Teacher assigned-class payment
  permissions, and to place a marker relative to lesson dates.
- **Failure/compatibility:** cross-center and unassigned-teacher commands are
  denied; lesson transfer preserves the identity used by existing charges.
- **Forbidden bypasses:** Financial Ledger does not rewrite class membership,
  assignments, lesson dates, or schedule rows.
- **Verification:** payment authority matrix, transfer/charge identity, and
  cross-center negative scenarios.

## Cross-Slice Orchestration

The following accepted workflows make the owner and legal interaction explicit:

| Use case | Orchestration owner | Allowed calls | Write owners |
|---|---|---|---|
| Create a center participant and class membership | Center & Scheduling | Identity & Access account provisioning; own membership commands | Identity & Access for account/invitation; Center & Scheduling for center/member/class state |
| Open an authorized personal day | Lesson Context | Identity & Access actor; Center & Scheduling lesson/scope; Learning Progress lesson-scoped grade/progress query, Collaboration, and Financial Ledger scoped queries | Lesson Context passes `lessonId` and selected actor/student context; no homework mapping, neighbor writes, or direct table reads |
| Correct `absent` to `present` | Learning Progress | Identity & Access actor; Center & Scheduling lesson/scope; Financial Ledger attendance reconciliation | Learning Progress for attendance; Financial Ledger for charge/allocation/balance/audit |
| Record, edit, or cancel a payment | Financial Ledger | Identity & Access actor; Center & Scheduling financial scope/lesson facts | Financial Ledger only |
| Add a comment/reply/reaction | Collaboration | Identity & Access actor; Center & Scheduling scope facts | Collaboration only |

Routes, form actions, page load functions, generic helpers, and the composition
root may adapt and wire these flows but may not own or sequence their business
rules.

## Update Rules

- `Module / Change Unit` is the unique graph key. Use stable functional
  responsibility names, never feature/task IDs or generic technical layers.
- Every accepted significant inter-module dependency appears once in the
  graph and points to one exact contract heading.
- Detailed module identity, code roots, ownership, and edges live here;
  `system-architecture.md` owns only parent architecture units and the global
  spine.
- Feature and task documents link these contracts; they do not copy or expand
  the global graph.
