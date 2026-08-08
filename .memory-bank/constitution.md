---
description: Project Constitution — governing principles for AI-first development.
status: active
version: 1
project_principles: ratified
ratified: 2026-08-08
last_updated: 2026-08-08
---
# Project Constitution

## Purpose

This Constitution defines the non-negotiable principles that guide AI agents when planning, implementing, verifying, and synchronizing project work.

## Governance Decisions

- **Project level:** `medium` — a working MVP intended for a real small
  educational center after final validation.
- **Architecture priority:** KISS. Agents MUST NOT introduce overengineering;
  every additional mechanism needs an accepted requirement, applicable
  constraint, or evidenced material risk.
- **Agent autonomy:** agents may make technical decisions independently inside
  accepted product and architecture boundaries. They MUST stop for unresolved
  material product behavior, privacy/access boundaries, irreversible actions,
  or another operator-owned branch.
- **Task-level Definition of Done:** an implementation task requires a
  successful build and basic smoke check, plus every stronger check and evidence
  gate required by its tier, accepted criteria, or repository configuration.
- **Final validation:** before the MVP is demonstrated as complete or used with
  real data, run integrated functional validation and focused privacy/access and
  financial-correctness checks.
- **Human checkpoint:** final product acceptance is the operator's explicit
  feedback on the working MVP.
- **Critical non-negotiables:** privacy of children's data, role-based access,
  and correctness of financial records MUST hold before real data is used.

These project decisions refine but do not weaken the mandatory DevRails tier,
verification, evidence, and workflow contracts.

## Core Principles

### 0. Project Principles Status

Project-specific principles were ratified by the operator on 2026-08-08.

### I. AI-First Spec-Driven Development

Agents MUST derive implementation work from explicit product, requirement, feature, task, and workflow artifacts. Agents MUST NOT invent product scope without evidence or user instruction.

### II. Memory Bank Is Durable Project Knowledge

`.memory-bank/` is the durable source of project knowledge. Chat context is temporary. Agents MUST update Memory Bank after meaningful changes.

### III. Schema-Backed Task Execution

Tasks MUST use the current schema-backed JSON task record model. If the framework uses `tier: T0|T1|T2|T3`, agents MUST route execution and verification through that tier model.

### IV. Minimal Verifiable Change

Agents SHOULD prefer the smallest change that satisfies the task. Every completed task MUST have clear checks or evidence.

### V. Evidence Before Done

A task MUST NOT be marked done without verification evidence appropriate to its tier and scope.

### VI. No Legacy Fallback and No Speculation

Agents MUST NOT rely on deprecated task formats, old risk models, or undocumented assumptions. Unknowns MUST be recorded as blockers or explicit assumptions.

### VII. Context Discipline

Agents SHOULD read the smallest sufficient context for the task. Higher-tier or cross-cutting tasks MUST read relevant normative docs such as invariants, contracts, states, testing, and workflow policies.

### VIII. Synchronization

After meaningful changes, agents MUST synchronize affected Memory Bank docs, task state, changelog, and routing files.

## Governance

- Constitution has precedence over workflow habits and generated plans.
- MBB, spec-index, spec-backbone, invariants, contracts, states, testing, and workflow docs refine this Constitution; they must not contradict it.
- Amendments must include rationale and update affected docs if needed.
- Constitution should stay short. Put concrete project rules into `invariants.md`, `contracts/*`, `states/*`, or workflow policy docs.

**Version**: 1 | **Ratified**: 2026-08-08 | **Last updated**: 2026-08-08
