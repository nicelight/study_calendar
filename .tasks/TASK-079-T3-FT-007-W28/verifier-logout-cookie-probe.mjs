import { spawn } from 'node:child_process';
import Database from 'better-sqlite3';
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const databasePath = resolve(root, 'tmp/ft-007-navigation.db');
const baseURL = 'http://127.0.0.1:5175';
const sessionToken = 'verifier-attempt-3-logout-session';
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

for (const suffix of ['', '-wal', '-shm', '-journal']) rmSync(`${databasePath}${suffix}`, { force: true });

const server = spawn(npm, ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5175'], {
  cwd: root,
  env: {
    ...process.env,
    DATABASE_URL: databasePath,
    DISPOSABLE_E2E: '1',
    PLAYWRIGHT_PORT: '5175',
    PLAYWRIGHT_BASE_URL: baseURL
  },
  stdio: ['ignore', 'pipe', 'pipe']
});
let serverOutput = '';
server.stdout.on('data', (chunk) => { serverOutput += chunk.toString(); });
server.stderr.on('data', (chunk) => { serverOutput += chunk.toString(); });

async function waitForServer() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      await fetch(`${baseURL}/`);
      return;
    } catch {
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
    }
  }
  throw new Error(`owned server did not start: ${serverOutput}`);
}

try {
  await waitForServer();
  const database = new Database(databasePath);
  database.exec(`
    INSERT INTO accounts (id, role) VALUES ('verifier-attempt-3-admin', 'admin');
    INSERT INTO account_profiles (account_id, full_name, registered_at)
      VALUES ('verifier-attempt-3-admin', 'Verifier Attempt 3 Admin', '2026-08-22T00:00:00.000Z');
    INSERT INTO sessions (token, account_id, revoked_at)
      VALUES ('${sessionToken}', 'verifier-attempt-3-admin', NULL);
  `);
  database.close();

  const cookie = `foundation_session=${sessionToken}`;
  const protectedResponse = await fetch(`${baseURL}/admin`, {
    headers: { cookie },
    redirect: 'manual'
  });
  if (protectedResponse.status !== 200) throw new Error(`protected request was not authorized: ${protectedResponse.status}`);

  const logoutResponse = await fetch(`${baseURL}/auth/logout`, {
    method: 'POST',
    headers: { cookie },
    redirect: 'manual'
  });
  const setCookie = logoutResponse.headers.get('set-cookie') ?? '';
  const cookieCleared = /foundation_session=;/.test(setCookie) && /Max-Age=0/i.test(setCookie);
  if (logoutResponse.status !== 303 || logoutResponse.headers.get('location') !== '/login' || !cookieCleared) {
    throw new Error(`logout transport mismatch: status=${logoutResponse.status}, location=${logoutResponse.headers.get('location')}, set-cookie=${setCookie}`);
  }

  const oldTokenResponse = await fetch(`${baseURL}/admin`, {
    headers: { cookie },
    redirect: 'manual'
  });
  const verificationDatabase = new Database(databasePath);
  const state = verificationDatabase
    .prepare('SELECT revoked_at FROM sessions WHERE token = ?')
    .get(sessionToken);
  verificationDatabase.close();
  if (oldTokenResponse.status !== 303 || oldTokenResponse.headers.get('location') !== '/login' || !state?.revoked_at) {
    throw new Error(`revocation mismatch: status=${oldTokenResponse.status}, location=${oldTokenResponse.headers.get('location')}, state=${JSON.stringify(state)}`);
  }

  console.log(JSON.stringify({
    protectedStatus: protectedResponse.status,
    logoutStatus: logoutResponse.status,
    logoutLocation: logoutResponse.headers.get('location'),
    cookieCleared,
    oldTokenStatus: oldTokenResponse.status,
    oldTokenLocation: oldTokenResponse.headers.get('location'),
    sessionRevoked: true,
    VERIFIER_LOGOUT_COOKIE_PROBE_PASS: true
  }));
} finally {
  server.kill('SIGTERM');
  await new Promise((resolveExit) => setTimeout(resolveExit, 500));
  if (!server.killed) server.kill('SIGKILL');
  for (const suffix of ['', '-wal', '-shm', '-journal']) rmSync(`${databasePath}${suffix}`, { force: true });
}
