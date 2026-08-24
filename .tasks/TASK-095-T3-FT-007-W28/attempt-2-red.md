---
description: Retry-bound claim-linked RED evidence for TASK-095-T3-FT-007-W28.
status: active
---
# Attempt 2 — retry-bound claim-linked RED

- attempt: 2
- claim: `FT-007-AC-009` / `REQ-014` / `REQ-017`; the C&S registry provider
  must use server-resolved actor context and remain free of Identity & Access
  calls, account-table reads/joins, and Identity & Access-owned role/profile
  output.
- RED source: the preserved fresh independent Attempt 1 verification report
  identified the current implementation's two HIGH boundary violations:
  provider-side `resolveActor` and `accounts`/`role` access in the registry
  membership helper.
- bound evidence: `.protocols/TASK-095-T3-FT-007-W28/verification.md` and
  `.tasks/TASK-095-T3-FT-007-W28/TASK-095-T3-FT-007-W28-S-VERIFY-final-report-docs-01.md`.
- retry handling: the original durable RED is retained and bound to this
  correction; the original probe was not artificially rerun before the retry
  change. Attempt 1 RED/GREEN artifacts remain supporting-only.
- correction under test: `getRegistryFacts({ actor })` receives the
  server-resolved `ActorContext`; C&S membership projection returns only
  `centerId` and `accountId`.
