---
description: Pending feature-level clarification for FT-007 navigation endpoint identities and Profile behavior.
status: active
---
# FT-007 Clarification

- Clarification status: complete
- Clarification questions: 1
- Last clarified: 2026-08-21
- Target feature: `.memory-bank/features/FT-007-navigation-and-statistics.md`

## Pending question — 2026-08-21

### Question

What is the minimum accepted Profile destination for FT-007, and what canonical
SvelteKit route identities should Home, Classes, Statistics, and Profile use?

### Why this changes decomposition

REQ-017 and FT-007-AC-001 require all four named navigation destinations, but
the accepted feature and contracts define neither a working Profile outcome nor
canonical endpoint identities. The current shell task cannot create a Profile
route inside its hard write boundary, while Home, Classes, Statistics, and
sorting cards use broad `src/routes/` boundaries. Task slicing, exact claim
ownership, endpoint verification, and hard runtime scope therefore depend on
the operator answer.

### Recommended bounded answer

Use stable protected top-level routes `/home`, `/classes`, `/statistics`, and
`/profile`. Keep logout on the existing server-owned `POST /auth/logout` path.
Make `/profile` a read-only page over existing Identity & Access actor/profile
facts: `fullName`, `role`, and immutable `registeredAt`; it adds no editing,
password/provider management, membership controls, or new persistence.

### Alternatives and impact

1. Accept the recommended bounded answer. This remains a feature-local
   clarification grounded in REQ-014/REQ-017 and routes directly to
   `/feature-to-tasks FT-007`.
2. Use another explicit set of protected routes or another bounded read-only
   Profile projection. The operator must name the exact paths and fields; then
   rerun `/feature-doctor FT-007` before tasking.
3. Remove or defer Profile. This changes the accepted REQ-017/PRD navigation
   target and must route first to `/write-prd`, not be decided locally.

### Answer

Accepted by the operator on 2026-08-21: use dedicated protected routes
`/home`, `/classes`, `/statistics`, and `/profile`; keep logout on the existing
server-owned `POST /auth/logout` path; make `/profile` read-only over existing
Identity & Access `fullName`, `role`, and immutable `registeredAt`, with no
editing, password/provider management, membership controls, or new persistence.

### Current disposition

- Changed sections: feature frontmatter, Use Cases, Edge / Failure Behavior,
  FT-007-AC-007, Acceptance Closure, SDD Design Gate, and Clarifications.
- Remaining ambiguity: none for feature decomposition.
- Design impact: none
- Behavior spec impact: none
- Immediate repair route: `/feature-to-tasks FT-007` to reconcile the plan,
  exact task ownership, endpoint write boundaries, and proof mapping before a
  fresh `/review-tasks-plan FT-007`.
