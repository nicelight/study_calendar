import Database from 'better-sqlite3';
import { expect, test } from '@playwright/test';
import { resolve, sep } from 'node:path';
import { statSync } from 'node:fs';

const databaseFilename = process.env.DATABASE_URL;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5174';
const sessionToken = 'task-098-profile-session';
const revokedToken = 'task-098-revoked-session';
const realDatabasePath = resolve(process.cwd(), 'study-calendar.db');

function requireDisposableDatabase(): string {
	const disposableRoot = `${resolve(process.cwd(), 'tmp')}${sep}`;
	if (!databaseFilename || !resolve(databaseFilename).startsWith(disposableRoot)) {
		throw new Error('TASK-098 disposable E2E requires DATABASE_URL under tmp/');
	}
	return databaseFilename;
}

function seedDatabase(): void {
	const database = new Database(requireDisposableDatabase());
	try {
		database.exec(`
			INSERT INTO centers (id, name) VALUES ('task-098-center', 'Центр Профиля');
			INSERT INTO accounts (id, role) VALUES ('task-098-admin', 'admin');
			INSERT INTO account_profiles (account_id, full_name, registered_at)
				VALUES ('task-098-admin', 'Админ Профиля', '2026-08-24T10:00:00.000Z');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('${sessionToken}', 'task-098-admin', NULL),
				('${revokedToken}', 'task-098-admin', '2026-08-24T10:05:00.000Z');
			INSERT INTO center_memberships (center_id, account_id)
				VALUES ('task-098-center', 'task-098-admin');
		`);
	} finally {
		database.close();
	}
}

function profileSnapshot(): string {
	const database = new Database(requireDisposableDatabase(), { readonly: true });
	try {
		return JSON.stringify(database.prepare(
			'SELECT account_id, full_name, registered_at FROM account_profiles ORDER BY account_id'
		).all());
	} finally {
		database.close();
	}
}

function realDatabaseMetadata(): { size: number; mtimeMs: number } {
	const metadata = statSync(realDatabasePath);
	return { size: metadata.size, mtimeMs: metadata.mtimeMs };
}

async function openHydratedMenu(page: import('@playwright/test').Page) {
	const menuToggle = page.locator('[data-protected-shell] .menu-toggle');
	await expect(menuToggle).toBeVisible();
	// The existing disposable E2E convention waits briefly after route hydration.
	await page.waitForTimeout(500);
	if (await menuToggle.getAttribute('aria-expanded') === 'false') {
		await menuToggle.click();
	}
	await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
	return page.locator('[data-protected-shell]');
}

test('canonical protected routes include a bounded read-only Profile and fail closed after revocation', async ({ page, request }) => {
	const realDatabaseBefore = realDatabaseMetadata();
	seedDatabase();
	const profileBefore = profileSnapshot();

	for (const route of ['/home', '/classes', '/statistics', '/profile']) {
		const anonymous = await request.get(route, { maxRedirects: 0 });
		expect(anonymous.status()).toBe(303);
		expect(anonymous.headers().location).toBe('/login');
		const revoked = await request.get(route, {
			headers: { cookie: `foundation_session=${revokedToken}` },
			maxRedirects: 0
		});
		expect(revoked.status()).toBe(303);
		expect(revoked.headers().location).toBe('/login');
	}

	await page.context().addCookies([{
		name: 'foundation_session', value: sessionToken, url: baseURL, httpOnly: true, sameSite: 'Lax'
	}]);
	for (const route of ['/home', '/classes', '/statistics', '/profile']) {
		await page.goto(route);
		await expect(page).toHaveURL(new RegExp(`${route}$`));
	}
	await expect(page.locator('[data-profile-page]')).toBeVisible();
	await expect(page.locator('dt')).toHaveText(['ФИО', 'Роль', 'Регистрация']);
	await expect(page.locator('dd')).toHaveText(['Админ Профиля', 'admin', '2026-08-24T10:00:00.000Z']);
	await expect(page.locator('[data-profile-page] form, [data-profile-page] input, [data-profile-page] button')).toHaveCount(0);
	await expect.poll(profileSnapshot).toBe(profileBefore);

	const shell = await openHydratedMenu(page);
	const links = [
		['Home', '/home'],
		['Classes', '/classes'],
		['Statistics', '/statistics'],
		['Profile', '/profile']
	] as const;
	for (const [name, href] of links) {
		await expect(shell.getByRole('link', { name })).toHaveAttribute('href', href);
	}
	const logoutForm = shell.locator('form');
	await expect(logoutForm).toHaveAttribute('method', 'POST');
	await expect(logoutForm).toHaveAttribute('action', '/auth/logout');
	await shell.locator('.menu-toggle').click();
	await expect(shell.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');

	for (const [name, href] of links) {
		const currentShell = await openHydratedMenu(page);
		await currentShell.getByRole('link', { name }).click();
		await expect(page).toHaveURL(new RegExp(`${href}$`));
	}

	const logoutShell = await openHydratedMenu(page);
	await Promise.all([
		page.waitForURL(/\/login$/),
		logoutShell.locator('form').getByRole('button', { name: 'Выйти' }).click()
	]);
	const oldToken = await request.get('/profile', {
		headers: { cookie: `foundation_session=${sessionToken}` },
		maxRedirects: 0
	});
	expect(oldToken.status()).toBe(303);
	expect(oldToken.headers().location).toBe('/login');
	expect(realDatabaseMetadata()).toEqual(realDatabaseBefore);
});
