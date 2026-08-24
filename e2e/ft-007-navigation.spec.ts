import Database from 'better-sqlite3';
import { expect, test } from '@playwright/test';
import { resolve, sep } from 'node:path';

const sessionToken = 'task-079-disposable-session';
const databaseFilename = process.env.DATABASE_URL;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5174';

function seedAdmin(): void {
	const disposableRoot = `${resolve(process.cwd(), 'tmp')}${sep}`;
	if (!databaseFilename || !resolve(databaseFilename).startsWith(disposableRoot)) {
		throw new Error('TASK-079 disposable E2E requires DATABASE_URL under tmp/');
	}

	const database = new Database(databaseFilename);
	try {
		database.exec(`
			INSERT INTO accounts (id, role) VALUES ('task-079-admin', 'admin');
			INSERT INTO account_profiles (account_id, full_name, registered_at)
			VALUES ('task-079-admin', 'Task 079 Admin', '2026-08-22T00:00:00.000Z');
			INSERT INTO sessions (token, account_id, revoked_at)
			VALUES ('${sessionToken}', 'task-079-admin', NULL);
		`);
	} finally {
		database.close();
	}
}

test('protected navigation is server-aware and logout revokes the old token', async ({ page, request }) => {
	seedAdmin();
	await page.context().addCookies([
		{
			name: 'foundation_session',
			value: sessionToken,
			url: baseURL,
			httpOnly: true,
			sameSite: 'Lax'
		}
	]);

	await page.goto('/');
	await expect(page.getByRole('button', { name: /меню/i })).toHaveCount(0);
	await expect(page.locator('body')).not.toContainText('Task 079 Admin');

	await page.goto('/admin');
	const menu = page.getByRole('button', { name: /меню/i });
	await expect(menu).toBeVisible();
	await menu.click();

	for (const [label, href] of [
		['Home', '/home'],
		['Classes', '/classes'],
		['Statistics', '/statistics'],
		['Profile', '/profile']
	] as const) {
		const link = page.getByRole('link', { name: label });
		await expect(link).toBeVisible();
		await expect(link).toHaveAttribute('href', href);
	}

	const logout = page.getByRole('button', { name: 'Выйти' });
	await expect(logout).toBeVisible();
	await logout.click();
	await expect(page).toHaveURL(/\/login$/);
	await expect(page.getByRole('button', { name: /меню/i })).toHaveCount(0);

	const oldTokenResponse = await request.get('/admin', {
		headers: { cookie: `foundation_session=${sessionToken}` },
		maxRedirects: 0
	});
	expect(oldTokenResponse.status()).toBe(303);
	expect(oldTokenResponse.headers().location).toBe('/login');
});
