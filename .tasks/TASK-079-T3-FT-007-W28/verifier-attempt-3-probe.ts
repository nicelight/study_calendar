import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { load as layoutLoad } from '../../src/routes/+layout.server';

const root = process.cwd();
const databasePath = resolve(root, 'tmp/ft-007-navigation.db');
const layout = readFileSync(resolve(root, 'src/routes/+layout.svelte'), 'utf8');
const logout = readFileSync(resolve(root, 'src/routes/auth/logout/+server.ts'), 'utf8');
const config = readFileSync(resolve(root, 'playwright.config.ts'), 'utf8');
const runner = await import('../../scripts/run-disposable-e2e.mjs');

const actor = { accountId: 'verifier-attempt-3', role: 'admin' as const };
const protectedPaths = [
  '/admin',
  '/admin/center-one',
  '/center/center-one/class/class-one',
  '/calendar',
  '/lesson-context',
  '/home',
  '/classes',
  '/statistics',
  '/profile'
];

for (const pathname of protectedPaths) {
  const authenticated = layoutLoad({ locals: { actor }, url: new URL(`http://calendar.test${pathname}`) } as never);
  const anonymous = layoutLoad({ locals: { actor: null }, url: new URL(`http://calendar.test${pathname}`) } as never);
  if (JSON.stringify(authenticated) !== JSON.stringify({ actor: { role: 'admin' } })) {
    throw new Error(`authenticated protected projection mismatch at ${pathname}`);
  }
  if (JSON.stringify(anonymous) !== JSON.stringify({ actor: null })) {
    throw new Error(`anonymous protected projection mismatch at ${pathname}`);
  }
}

for (const pathname of ['/', '/login', '/invite/token']) {
  const publicData = layoutLoad({ locals: { actor }, url: new URL(`http://calendar.test${pathname}`) } as never);
  if (JSON.stringify(publicData) !== JSON.stringify({ actor: null })) {
    throw new Error(`public projection mismatch at ${pathname}`);
  }
}

for (const expected of [
  'href="/home"',
  'href="/classes"',
  'href="/statistics"',
  'href="/profile"',
  'data-navigation-control="Logout"',
  'action="/auth/logout"'
]) {
  if (!layout.includes(expected)) throw new Error(`missing exact shell control: ${expected}`);
}
if (!layout.includes('$state') || layout.includes('localStorage')) throw new Error('shell state boundary mismatch');
if (!logout.includes('getAuthenticationTransport().logout(event)')) throw new Error('logout owner changed');
if (!config.includes("testMatch: disposable ? '**/*.spec.ts' : realDatabaseSpecs")) {
  throw new Error('ordinary/disposable Playwright selection is not conditional');
}

for (const rejected of [
  'study-calendar.db',
  'tmp/study-calendar.db',
  'tmp/nested/ft-007.db',
  '../ft-007.db',
  '/tmp/ft-007.db'
]) {
  try {
    runner.resolveDisposableDatabasePath(rejected, root);
    throw new Error(`accepted forbidden database path: ${rejected}`);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('accepted forbidden')) throw error;
  }
}

const preparedRoot = mkdtempSync(join(tmpdir(), 'task-079-verifier-parent-'));
const preparedPath = join(preparedRoot, 'nested', 'prepared.db');
await runner.prepareDisposableDatabase(preparedPath);
if (!existsSync(join(preparedRoot, 'nested'))) throw new Error('runner did not prepare parent');
writeFileSync(preparedPath, 'stale');
await runner.prepareDisposableDatabase(preparedPath);
if (existsSync(preparedPath)) throw new Error('runner did not remove stale target');
rmSync(preparedRoot, { recursive: true, force: true });

const failureResult = await runner.main(
  ['--database', 'tmp/ft-007-navigation.db', '--spec', 'e2e/ft-007-navigation.spec.ts'],
  root,
  ({ databasePath: target }) => {
    for (const suffix of ['', '-wal', '-shm', '-journal']) writeFileSync(`${target}${suffix}`, 'forced-failure');
    return 1;
  }
);
const cleanupState = ['', '-wal', '-shm', '-journal'].map((suffix) => existsSync(`${databasePath}${suffix}`));
if (failureResult !== 1 || cleanupState.some(Boolean)) {
  throw new Error(`failure cleanup mismatch: result=${failureResult}, state=${cleanupState.join(',')}`);
}

console.log(JSON.stringify({
  protectedPaths: protectedPaths.length,
  publicPaths: 3,
  exactControls: 6,
  rejectedDatabasePaths: 5,
  parentPrepared: true,
  staleTargetRemoved: true,
  forcedFailureResult: failureResult,
  cleanup: { database: false, wal: false, shm: false, journal: false },
  ordinarySelectionConfig: 'real-database-payment.spec.ts + real-database-smoke.spec.ts',
  disposableSelectionConfig: 'explicit spec under DISPOSABLE_E2E=1',
  VERIFIER_PROBE_PASS: true
}));
