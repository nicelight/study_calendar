# TASK-097-T3-FT-007-W31 — Fresh Verification Report

- role: Reviewer
- mode: scheduler
- verification: fresh after bounded Attempt 1 browser-evidence completion

## verdict

VERDICT: PASS

## findings

- None. The prior `NEEDS-CLARIFICATION` is historical only: it concerned the
  earlier 12-click browser flow, now replaced by current full-matrix evidence.

## evidence_checked

- Normative basis: `FT-007-AC-004 / REQ-017`,
  `.memory-bank/contracts/statistics-projection.md#sorting-and-presentation`,
  `#registry-cardinality-and-teacher-view-scope`,
  `.memory-bank/contracts/access-control.md#authority-and-scope`, and
  `.memory-bank/testing/strategy.md#disposable-browser-proof`.
- Fresh current gates: `npm run check` (`0` errors / `0` warnings), `npm run
  test` (`67` files / `225` tests), `npm run build`, `git diff --check`,
  `node scripts/mb-lint.mjs` (`74` files, pre-existing advisories only), and
  `node scripts/mb-doctor.mjs --strict` (`0` errors / `0` warnings / `2`
  info) all passed.
- Fresh verifier-owned browser command, run twice:
  `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-statistics.db --spec e2e/ft-007-statistics.spec.ts`.
  Each run passed `1` Playwright test on an owned disposable server. The second
  run retained `study-calendar.db` metadata at `356352` bytes / mtime
  `1787567348`; no port `5174` listener, disposable DB, or SQLite sidecar
  remained afterward.
- The browser spec has `8 + 6 + 4 = 18` controls and `18` invocations of a
  helper that clicks and checks `aria-sort` in both directions: `36`
  directional interactions. It proves text/date/percentage/count ordering,
  Teacher first rendered ordered class, and equality of `15` source/provider
  tables before and after all clicks.
- Current source and diff inspection confirm only the authorized serializable
  TASK-096 output is consumed, copied before presentation sorting, with no
  provider/query/scope/cardinality/source mutation and no forbidden-path delta.

## risks_or_questions

- None task-local. The identical scoped Institution values exercise visible
  ascending and descending state through the deterministic stable-tie path;
  non-tied text, date, percentage, count, and first-class cases establish typed
  reordering.

## scheduler_handoff

- Next route: `/red-verify TASK-097-T3-FT-007-W31`.
- No lifecycle/status, planning, implementation, specification, dependencies,
  TASK-098, Judge, scheduler, or `mb-sync` action was changed or invoked.
