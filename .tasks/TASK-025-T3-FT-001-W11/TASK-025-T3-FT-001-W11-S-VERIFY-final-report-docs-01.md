---
description: Independent functional re-verification report for TASK-025 bootstrap Admin center creation.
status: final
---
# TASK-025-T3-FT-001-W11 — Functional Verification

Attempt 2 satisfies the complete bounded outcome. The provider-bound Admin
success path, callback redirect to `/admin`, atomic center/membership
transaction, once-only bootstrap, own-center member routing, and
unauthenticated/non-Admin denial passed independent focused checks.

The original failing verifier probe was retained and expanded. Fresh Attempt 2
evidence shows valid name-only creation succeeds, while `centerId`, `role`,
`accountId`, unknown fields, and duplicate `name` fields return
`400 invalid_request` with unchanged center/membership state. The route performs
this shape check before the public mutating command; actor/role, server-generated
center ID, membership ownership, and transaction logic remain server-side.

Fresh gates: verifier probe 2/2, focused tests 6/6, `npm run check` 0 errors and
0 warnings, `npm test` 23 files / 90 tests, and `npm run build` passed.

Evidence:

- `.protocols/TASK-025-T3-FT-001-W11/verification.md`
- `.tasks/TASK-025-T3-FT-001-W11/TASK-025-T3-FT-001-W11-S-VERIFY-bootstrap-probe.test.ts`
- `.tasks/TASK-025-T3-FT-001-W11/vitest.verify.config.ts`

Recommended owner action: explicit lifecycle owner may close after the required
T3 semantic verdict; no further functional fix is required.

VERDICT: PASS
