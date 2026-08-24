import { readFileSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

try {
	const localEnv = readFileSync('.env.e2e.local', 'utf8');
	for (const line of localEnv.split(/\r?\n/)) {
		const match = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line.trim());
		if (match && process.env[match[1]] === undefined) {
			process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
		}
	}
} catch {
	// The real E2E credentials may be supplied by the process environment.
}

const disposable = process.env.DISPOSABLE_E2E === '1';
const serverPort = Number(process.env.PLAYWRIGHT_PORT ?? 5173);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${serverPort}`;
const realDatabaseSpecs = ['real-database-payment.spec.ts', 'real-database-smoke.spec.ts'];

export default defineConfig({
	testDir: './e2e',
	testMatch: disposable ? '**/*.spec.ts' : realDatabaseSpecs,
	fullyParallel: false,
	workers: 1,
	reporter: 'list',
	use: {
		baseURL,
		channel: 'chrome',
		headless: true,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		...devices['Desktop Chrome']
	},
	webServer: {
		command: `npm run dev -- --host 127.0.0.1 --port ${serverPort}`,
		url: baseURL,
		reuseExistingServer: !disposable,
		timeout: 120_000,
		env: {
			...process.env,
			DATABASE_URL: process.env.DATABASE_URL ?? 'study-calendar.db'
		}
	}
});
