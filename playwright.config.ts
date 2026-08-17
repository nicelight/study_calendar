import { readFileSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:5173';

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

export default defineConfig({
	testDir: './e2e',
	testMatch: '**/*.spec.ts',
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
		command: 'npm run dev -- --host 127.0.0.1 --port 5173',
		url: baseURL,
		reuseExistingServer: true,
		timeout: 120_000,
		env: {
			...process.env,
			DATABASE_URL: process.env.DATABASE_URL ?? 'study-calendar.db'
		}
	}
});
