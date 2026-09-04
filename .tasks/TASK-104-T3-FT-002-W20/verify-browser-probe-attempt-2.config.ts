import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: process.cwd(),
	testMatch: '**/.tasks/TASK-104-T3-FT-002-W20/verify-browser-probe-attempt-2.spec.ts',
	fullyParallel: false,
	workers: 1,
	reporter: 'list',
	use: {
		baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5187',
		channel: 'chrome',
		headless: true,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		...devices['Desktop Chrome']
	},
	webServer: {
		command: 'npm run dev -- --host 127.0.0.1 --port 5187',
		url: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5187',
		reuseExistingServer: false,
		timeout: 120_000,
		env: {
		...process.env,
		DATABASE_URL: process.env.DATABASE_URL
	}
	}
});
