# TASK-099-T3-FT-006-W32 — Attempt 1 RED

- Claim: `FT-006-AC-009 / REQ-011 / REQ-014`.
- Phase: claim-specific pre-implementation probe, after the durable `ready -> in_progress` transition.
- Command:

  ```sh
  node --input-type=module -e "import assert from 'node:assert/strict'; import { existsSync, readFileSync } from 'node:fs'; assert.ok(existsSync('src/routes/admin/[centerId]/finance/+page.server.ts'), 'FT-006-AC-009 finance route is missing'); const source=readFileSync('src/lib/server/modules/financial-ledger/public.ts','utf8'); assert.match(source, /getPriceSettings\s*\(/, 'FT-006-AC-009 price history query is missing'); assert.match(source, /getPaymentDefault\s*\(/, 'FT-006-AC-009 payment default query is missing');"
  ```

- Working directory: `/home/serg/Projects/study_calendar`.
- Result: `exit_code=1`.
- Observation: `AssertionError [ERR_ASSERTION]: FT-006-AC-009 finance route is missing`.
- Interpretation: the accepted protected Admin pricing/history surface was absent before implementation. This was a real claim-specific absence probe, not a setup or syntax failure.

## Retry disposition

- attempt: 1
- receipt_status: supporting-only
- The original claim-specific RED remains the durable pre-correction baseline
  for Attempt 2 and is not backfilled or replayed as a new RED.
