# TASK-098 executor evidence — attempt 1

## Change surface

- Changed task-owned source: `src/routes/profile/+page.server.ts`, `src/routes/profile/+page.svelte`.
- Changed task-owned probes: `tests/routes/ft-007-profile-routes.test.ts`, `e2e/ft-007-profile-routes.spec.ts`.
- `src/routes/+layout.svelte` was inspected only and remains unchanged; it already provides the exact canonical hrefs and existing logout form.
- No forbidden scope was touched. No `tmp/ft-007-profile-routes.db*` file remained after the disposable run.
- `PAPERCUTS/GPT-5 __ 08-24-2026 15.50.md` records the one observed disposable-E2E test-friction note as required by `AGENTS.md`; it is not production or task-lifecycle scope.

## Browser evidence

- Command: `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-profile-routes.db --spec e2e/ft-007-profile-routes.spec.ts`
- Result: exit `0`, one Playwright test passed.
- The owned disposable server verified all four authenticated canonical destinations, Profile's three fields and no mutation controls, anonymous and revoked denial, logout revocation, unchanged profile rows during navigation, and unchanged root `study-calendar.db` metadata.

## Required gates

| Command | Result |
| --- | --- |
| `npm run check` | exit 0; 0 errors, 0 warnings |
| `npm run test` | exit 0; 68 files, 228 tests passed |
| `npm run build` | exit 0 |
| `git diff --check` | exit 0 |
| `node scripts/mb-lint.mjs` | exit 0; 18 unrelated pre-existing warnings |
| `node scripts/mb-doctor.mjs --strict` | exit 0; 0 errors, 0 warnings, 2 info |

## Exact profile artifact checksums

- `src/routes/profile/+page.server.ts`: `aa24d98b31e04907e577ab8172fc8b5241e2b141b95b2114db4f258269e21091`
- `src/routes/profile/+page.svelte`: `547170ed41b0f4aa8a3875eba952bd5ab2f86fd8347e94d0f1f48fcbaa0c8da7`
- `tests/routes/ft-007-profile-routes.test.ts`: `660c172a98a8bdfd55ffd02119954b24a514779a375f09c66cfd5315580dabba`
- `e2e/ft-007-profile-routes.spec.ts`: `2844f4f1f2061ae4d9889ca75685ca65e5379358f3918c4e87918c4c0f37d53a`
