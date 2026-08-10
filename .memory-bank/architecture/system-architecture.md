---
description: Global system architecture, runtime shape, composition root, and Architecture Spine.
status: active
last_updated: 2026-08-10
source_of_truth:
  - .memory-bank/architecture/system-architecture.md
---
# System Architecture

## System Goal

Provide one SvelteKit application for the small educational center MVP. The
application presents the shared class day and the permitted personal student
context through one deployable server while keeping role, center, class,
student, and financial boundaries explicit.

## Accepted Target

- Architecture style: modular monolith with capability/vertical slices.
- Runtime and deployment: one SvelteKit server process hosts the complete
  application; no independently deployed service is part of the MVP.
- Persisted source of truth: one shared application database. A shared physical
  database does not grant a module permission to write another module's
  business state.
- Primary change unit: a capability slice with a narrow public application
  boundary, not a technical layer or a product-task ID.

## Main Constraints

- SvelteKit is the product framework; browser/UI and HTTP adapters remain thin
  and do not own cross-slice business orchestration.
- Privacy of children's data, role-based access, historical pricing, exact
  monetary behavior, deterministic allocation, and auditability are product and
  Constitution constraints.
- The MVP has no accepted asynchronous event bus, external service boundary,
  agent/tool runtime, or multi-server deployment requirement.
- The repository began as a greenfield documentation baseline; the completed
  Foundation gate now provides the product runtime, package manifest, shared
  database schema/adapter, and test harness. Current product implementation is
  as-is evidence and remains subordinate to the accepted target contracts.

## Architecture Spine

Use this section for durable rules that constrain shared-boundary, state/data,
runtime, security, or strict work. Detailed contracts live in the linked
subject specifications.

### Architecture Decisions

#### AD-001 — One deployable modular monolith
- Binds: all six capability slices, the SvelteKit application shell, and the
  deployment boundary.
- Prevents: distributed runtime coordination, accidental service extraction,
  and business orchestration in HTTP/UI infrastructure.
- Rule: `src/routes/` and UI adapters invoke module public boundaries; the
  single composition root wires settings, adapters, lifecycle, start, and
  shutdown only. Cross-slice business orchestration belongs to the named
  owning capability slice.
- Verification: Foundation smoke proves one server starts and serves the
  application; boundary review checks that routes and composition code contain
  no business ownership.
- Source: accepted operator target in
  [.protocols/AUTONOMOUS-RUN/decision-log.md](../../.protocols/AUTONOMOUS-RUN/decision-log.md#2026-08-08-operator-decision-applied-for-resume).

#### AD-002 — Shared database, single business write owner
- Binds: every persisted product entity, transaction, projection, and audit
  record.
- Prevents: duplicated business rules, competing updates, and treating a
  shared schema as shared ownership.
- Rule: the shared database is the persisted source of truth; each mutable
  invariant and transition has exactly one capability owner. Neighbor slices
  use public queries/commands and never write another slice's tables or
  duplicate its business rules, even inside the same database.
- Verification: slice integration checks assert owner-side transitions and
  reject direct-bypass paths; financial replay and privacy checks cover the
  highest-blast-radius owners.
- Source: operator decision log and
  [.memory-bank/contracts/boundary-map.md](../contracts/boundary-map.md).

#### AD-003 — Capability slices expose narrow public application boundaries
- Binds: module dependencies, code roots, and feature composition.
- Prevents: technical-layer modules becoming business owners, broad shared
  helpers, and undocumented imports.
- Rule: each registered slice owns a complete observable capability and exposes
  only its public commands and queries. `src/lib/server/modules/<slice>/` is
  the code root; internal persistence and domain details stay behind that
  boundary.
- Verification: the accepted dependency graph and contract headings in
  [.memory-bank/contracts/boundary-map.md](../contracts/boundary-map.md) are the
  review surface for every inter-slice call.
- Source: capability decomposition in the accepted product features and the
  `/spec-design` boundary contract.

#### AD-004 — Server-side authorization is part of every capability boundary
- Binds: all reads, changes, provider binding, class history, personal context,
  and financial commands.
- Prevents: UI-only access control, guessed URLs, stale assignment access, and
  cross-center or cross-student disclosure.
- Rule: a protected public operation receives the authenticated actor and
  resolves role, center, class, and student scope on the server before reading
  or changing data. Admin's own-center financial authority and Teacher's
  assigned-class create-only payment authority are explicit exceptions, not
  generic cross-class access.
- Verification: negative role/membership/student/cross-center scenarios are
  required in the access contract and feature verification paths.
- Source: [.memory-bank/constitution.md](../constitution.md#governance-decisions),
  [.memory-bank/invariants.md](../invariants.md), and
  [.memory-bank/contracts/access-control.md](../contracts/access-control.md).

#### AD-005 — Cross-slice orchestration stays with a capability owner
- Binds: attendance-to-charge correction, personal-day composition, payment
  entry, and other multi-slice use cases.
- Prevents: business workflows in route handlers, generic utilities, the
  composition root, or direct neighbor-table writes.
- Rule: every cross-slice use case names one orchestration owner. The owner
  calls neighbor public boundaries, and the involved owners write only their
  own state within the applicable transaction boundary.
- Verification: contract review and integration scenarios trace the owner,
  calls, write owners, failure behavior, and replay behavior.
- Source: [.memory-bank/contracts/boundary-map.md#cross-slice-orchestration](../contracts/boundary-map.md#cross-slice-orchestration).

#### AD-006 — One server and one durable data path
- Binds: deployment, storage, migrations, request data flow, and operational
  verification.
- Prevents: hidden secondary stores, split source-of-truth behavior, and a
  deployment that requires an unrecorded second service.
- Rule: the deployment contains one SvelteKit server and one shared database;
  provider integrations are outbound adapters, not additional product stores.
  Database migration and backup/restore ownership is project-level while
  business table write authority remains slice-owned.
- Verification: Foundation proves the server/database connection path and the
  runbook records the single-server smoke and data-integrity checks.
- Source: accepted operator target, [.memory-bank/domains/core-domain.md](../domains/core-domain.md),
  and [.memory-bank/runbooks/mvp-verification.md](../runbooks/mvp-verification.md).

#### AD-007 — Lesson-scoped grade projection remains Learning Progress-owned
- Binds: personal day composition, lesson-to-homework selection, and grade
  privacy across Lesson Context and Learning Progress.
- Prevents: invented `homeworkId` values, Lesson Context direct database
  mapping, duplicated grade-selection rules, and a consumer-owned persisted
  relation.
- Rule: Learning Progress owns lesson-to-homework selection/relation semantics
  and exposes an authorized lesson-scoped personal progress query such as
  `getGradeForLesson({ lessonId, actor/context })`. Lesson Context passes the
  stable lesson identity and server-resolved context and consumes the result;
  it never resolves or persists the homework identity itself.
- Verification: the personal-day integration path proves the query receives
  `lessonId` plus actor/context, returns only the selected student's permitted
  grade, and denies wrong-student or wrong-scope access without a database
  bypass.
- Source: explicit operator decision applied by `/spec-design --all` on
  2026-08-10 and
  [.memory-bank/contracts/boundary-map.md#personal-progress-query-boundary](../contracts/boundary-map.md#personal-progress-query-boundary).

## Main Architecture Units

### 1. SvelteKit application shell

- `src/routes/` — page, form-action, and HTTP adapters only.
- `src/lib/components/` — browser presentation only; no server authority.
- `src/hooks.server.ts` — request/session integration adapter only.
- `src/lib/server/composition-root.ts` — the single composition root for
  settings, database/provider adapters, module wiring, lifecycle, start, and
  shutdown. It must not own product behavior.

### 2. Capability module runtime

The six capability slices are registered in
[.memory-bank/contracts/boundary-map.md#modules](../contracts/boundary-map.md#modules).
Each slice lives under `src/lib/server/modules/<slice>/`, owns its public
commands/queries and mutable business state, and may use only the accepted
edges in the dependency graph.

### 3. Platform adapters

`src/lib/server/platform/` contains configuration, database/session/provider
adapters, clock, and other infrastructure seams needed by the modules. It is
not a business slice, does not define product ownership, and cannot be used as
an unbounded shared business helper.

### 4. Shared application database

One database is the durable product source of truth. Module-owned persistence
is physically colocated there, but ownership and access remain contractual;
read composition goes through public module queries and writes go through the
owning module's commands.

## Composition and Request Data Flow

1. A browser request reaches a SvelteKit route, form action, or HTTP adapter.
2. The server resolves the current actor through the Identity & Access public
   boundary. Provider callbacks are translated by adapters and completed
   atomically inside that slice.
3. The capability that owns the requested outcome checks the actor's server-side
   role and context, then executes its command/query.
4. A cross-slice use case calls named public boundaries from its orchestration
  owner. A single transaction may cover the participating owners, but no
  participant bypasses another owner's command boundary.
   For a personal day, Lesson Context passes `lessonId` and the selected
   student/server-resolved actor context to Learning Progress's lesson-scoped
   query; it does not construct a `homeworkId` or persist a mapping.
5. The owning modules persist to the shared database or read through their
   public queries. Projections are read models; they never become a second
   source of truth.
6. The adapter returns a serializable result to the UI/client. No request/user
   state is stored in server module scope.

## Storage and Data Flow Rules

- Durable product data, module-owned state, payment allocations, and financial
  audit records are persisted in the one shared database.
- A public query may expose the minimum facts required by a consumer; a
  consumer may not infer authority from physical table visibility.
- Commands that change an invariant use an explicit transaction boundary and
  re-check authorization and current state at write time.
- Monetary values use one exact decimal-safe representation end to end; binary
  floating-point arithmetic is forbidden. The concrete representation and
  migration tooling are execution-level choices constrained by the financial
  contract.
- Provider outages, rejected authorization, duplicate financial submissions,
  and failed state transitions leave no partial business mutation.

## API / Contract Boundaries

- The module graph and exact public contract headings are in
  [.memory-bank/contracts/boundary-map.md](../contracts/boundary-map.md).
- Shared authorization semantics are in
  [.memory-bank/contracts/access-control.md](../contracts/access-control.md).
- The lesson-scoped grade projection is owned by Learning Progress through the
  [Personal Progress Query Boundary](../contracts/boundary-map.md#personal-progress-query-boundary);
  Lesson Context is only its authorized composition consumer.
- Financial command, state, projection, and replay rules are in
  [.memory-bank/contracts/financial-ledger.md](../contracts/financial-ledger.md).
- Detailed domain ownership and lifecycles are in
  [.memory-bank/domains/core-domain.md](../domains/core-domain.md) and
  [.memory-bank/states/lifecycle-map.md](../states/lifecycle-map.md).

## Deployment

- One production deployment runs one SvelteKit server process and connects to
  one shared database.
- Telegram and Google are outbound provider integrations behind the Identity &
  Access adapter; they are not persisted product sources of truth.
- Configuration and secrets enter through the composition root/platform
  adapters; they do not appear in client-visible route data.
- No second application server, queue, event broker, cache, or replicated
  business store is required by the accepted MVP target.

## Current-State Evidence and Foundation Pressure

The Foundation gate has established the SvelteKit package/runtime, executable
entry path, shared-database adapter, and project-native test harness now present
under `src/` and `tests/`. The target still retains the separate Foundation Dev
Path decision and completed gate anchor; current product code is as-is evidence
only and does not override the accepted lesson-scoped provider contract. The
Foundation decision and exit probes are canonical in
[.memory-bank/foundation.md](../foundation.md).

## Deferred Decisions

| Decision | Deferred because | Revisit when |
|---|---|---|
| Database engine and migration library | No executable baseline exists; the accepted target constrains one shared transactional database, not a vendor. | Foundation storage probe and operator-approved project bootstrap select the smallest compatible option. |
| Exact provider SDK configuration | Telegram and Google integrations are accepted, but no runtime baseline or credentials exist. | Foundation provider compatibility probe. |
| Concrete HTTP route names and payload schemas | Product behavior is accepted while feature-level composition and endpoint detail belong to downstream feature design. | `/feature-to-tasks` links the applicable public contract and acceptance evidence. |
