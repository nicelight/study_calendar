import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('TASK-079 disposable E2E runner', () => {
	it('accepts only a direct project tmp/*.db path and rejects the real database', async () => {
		if (!existsSync(resolve(process.cwd(), 'scripts/run-disposable-e2e.mjs'))) {
			expect(existsSync(resolve(process.cwd(), 'scripts/run-disposable-e2e.mjs'))).toBe(true);
			return;
		}
		const { resolveDisposableDatabasePath } = await import('../../scripts/run-disposable-e2e.mjs');
		const projectRoot = process.cwd();

		expect(resolveDisposableDatabasePath('tmp/ft-007-navigation.db', projectRoot)).toBe(
			resolve(projectRoot, 'tmp/ft-007-navigation.db')
		);
		expect(() => resolveDisposableDatabasePath('study-calendar.db', projectRoot)).toThrow();
		expect(() => resolveDisposableDatabasePath('tmp/study-calendar.db', projectRoot)).toThrow();
		expect(() => resolveDisposableDatabasePath('tmp/nested/ft-007.db', projectRoot)).toThrow();
		expect(() => resolveDisposableDatabasePath('../ft-007.db', projectRoot)).toThrow();
		expect(() => resolveDisposableDatabasePath('/tmp/ft-007.db', projectRoot)).toThrow();
	});

	it('prepares the parent, removes a stale target, and cleans the exact database after a run', async () => {
		if (!existsSync(resolve(process.cwd(), 'scripts/run-disposable-e2e.mjs'))) {
			expect(existsSync(resolve(process.cwd(), 'scripts/run-disposable-e2e.mjs'))).toBe(true);
			return;
		}
		const { prepareDisposableDatabase, cleanupDisposableDatabase } = await import(
			'../../scripts/run-disposable-e2e.mjs'
		);
		const root = mkdtempSync(join(tmpdir(), 'task-079-runner-'));
		const databasePath = join(root, 'nested', 'ft-007.db');

		await expect(prepareDisposableDatabase(databasePath)).resolves.toBeUndefined();
		expect(existsSync(resolve(root, 'nested'))).toBe(true);

		await import('node:fs/promises').then(({ writeFile }) => writeFile(databasePath, 'stale'));
		expect(statSync(databasePath).isFile()).toBe(true);
		await expect(prepareDisposableDatabase(databasePath)).resolves.toBeUndefined();
		expect(existsSync(databasePath)).toBe(false);

		await import('node:fs/promises').then(({ writeFile }) => writeFile(databasePath, 'database'));
		await expect(cleanupDisposableDatabase(databasePath)).resolves.toBeUndefined();
		expect(existsSync(databasePath)).toBe(false);
	});

	it('configures disposable Playwright to use an explicit database and never reuse a server', () => {
		const config = readFileSync(resolve(process.cwd(), 'playwright.config.ts'), 'utf8');

		expect(config).toContain('DATABASE_URL');
		expect(config).toContain('DISPOSABLE_E2E');
		expect(config).toContain('reuseExistingServer: !disposable');
	});

	it('keeps ordinary E2E on the two real-database specs and allows explicit disposable selection', () => {
		const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
		const projectRoot = process.cwd();
		const list = (args: string[], disposable: boolean) => {
			const env: NodeJS.ProcessEnv = { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' };
			if (disposable) {
				env.DISPOSABLE_E2E = '1';
				env.DATABASE_URL = resolve(projectRoot, 'tmp/ft-007-navigation.db');
			} else {
				delete env.DISPOSABLE_E2E;
			}
			const result = spawnSync(npm, ['run', 'e2e', '--', ...args], {
				cwd: projectRoot,
				env,
				encoding: 'utf8'
			});
			expect(result.status, result.stderr).toBe(0);
			return `${result.stdout}${result.stderr}`;
		};

		const ordinary = list(['--list'], false);
		expect(ordinary).toContain('Total: 2 tests in 2 files');
		expect(ordinary).toContain('real-database-payment.spec.ts');
		expect(ordinary).toContain('real-database-smoke.spec.ts');
		expect(ordinary).not.toContain('ft-007-navigation.spec.ts');

		const disposable = list(['--list', 'e2e/ft-007-navigation.spec.ts'], true);
		expect(disposable).toContain('Total: 1 test in 1 file');
		expect(disposable).toContain('ft-007-navigation.spec.ts');
	}, 15_000);

	it('cleans the exact task database when the owned run returns a failure', async () => {
		const { main } = await import('../../scripts/run-disposable-e2e.mjs');
		const databasePath = resolve(process.cwd(), 'tmp/ft-007-navigation.db');

		await expect(
			main(
				['--database', 'tmp/ft-007-navigation.db', '--spec', 'e2e/ft-007-navigation.spec.ts'],
				process.cwd(),
				({ databasePath }) => {
					writeFileSync(databasePath, 'forced-failure-database');
					writeFileSync(`${databasePath}-journal`, 'rollback-journal');
					return 1;
				}
			)
		).resolves.toBe(1);
		expect(existsSync(databasePath)).toBe(false);
		expect(existsSync(`${databasePath}-journal`)).toBe(false);
	});
});
