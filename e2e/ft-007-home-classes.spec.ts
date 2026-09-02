import Database from 'better-sqlite3';
import { scryptSync } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';

const databaseFilename = process.env.DATABASE_URL;
const tokens = {
	admin: 'task-080-admin-session',
	teacher: 'task-080-teacher-session',
	student: 'task-080-student-session',
	parent: 'task-080-parent-session',
	nonMember: 'task-080-non-member-session',
	revoked: 'task-080-revoked-session'
} as const;
const password = 'Task-080-role-home!';
const emails = {
	teacher: 'task-080-teacher@example.test',
	student: 'task-080-student@example.test',
	parent: 'task-080-parent@example.test'
} as const;

const stateTables = [
	'accounts',
	'sessions',
	'centers',
	'center_memberships',
	'classes',
	'teacher_assignments',
	'class_students',
	'parent_student_links',
	'schedules',
	'lessons'
] as const;

function requireDisposableDatabase(): string {
	if (!databaseFilename || !databaseFilename.includes('/tmp/')) {
		throw new Error('TASK-080 disposable E2E requires DATABASE_URL under tmp/');
	}
	return databaseFilename;
}

function seedDatabase(): void {
	const database = new Database(requireDisposableDatabase());
	try {
		database.exec(`
			INSERT INTO centers (id, name) VALUES ('center-own', 'Own Center'), ('center-other', 'Other Center');
			INSERT INTO accounts (id, role) VALUES
				('task-080-admin', 'admin'),
				('task-080-admin-other', 'admin'),
				('task-080-teacher', 'teacher'),
				('task-080-removed-teacher', 'teacher'),
				('task-080-student', 'student'),
				('task-080-non-member', 'student'),
				('task-080-parent', 'parent'),
				('task-080-revoked', 'admin');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('${tokens.admin}', 'task-080-admin', NULL),
				('${tokens.teacher}', 'task-080-teacher', NULL),
				('task-080-removed-teacher-session', 'task-080-removed-teacher', NULL),
				('${tokens.student}', 'task-080-student', NULL),
				('${tokens.nonMember}', 'task-080-non-member', NULL),
				('${tokens.parent}', 'task-080-parent', NULL),
				('${tokens.revoked}', 'task-080-revoked', '2026-08-22T06:00:00.000Z');
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('center-own', 'task-080-admin'),
				('center-other', 'task-080-admin-other'),
				('center-own', 'task-080-teacher'),
				('center-own', 'task-080-removed-teacher'),
				('center-own', 'task-080-student'),
				('center-own', 'task-080-non-member'),
				('center-own', 'task-080-parent'),
				('center-own', 'task-080-revoked');
			INSERT INTO classes (id, center_id, name, mode) VALUES
				('task-080-class-own', 'center-own', 'Алгебра', 'group'),
				('task-080-class-second', 'center-own', 'Геометрия', 'individual'),
				('task-080-class-other', 'center-other', 'Геометрия', 'group');
			INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id) VALUES
				('center-own', 'task-080-class-own', 'task-080-teacher'),
				('center-own', 'task-080-class-own', 'task-080-removed-teacher');
			INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
				('center-own', 'task-080-class-own', 'task-080-student'),
				('center-own', 'task-080-class-second', 'task-080-student');
			INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id) VALUES
				('center-own', 'task-080-parent', 'task-080-student');
			INSERT INTO schedules (id, center_id, class_id, start_date, end_date, weekdays, created_by_account_id, created_at) VALUES
				('task-080-schedule-own', 'center-own', 'task-080-class-own', '2026-08-01', '2026-08-31', '[1]', 'task-080-admin', '2026-08-01T00:00:00.000Z');
			INSERT INTO lessons (id, center_id, class_id, schedule_id, lesson_date, status, created_by_account_id, created_at) VALUES
				('task-080-lesson-own', 'center-own', 'task-080-class-own', 'task-080-schedule-own', '2026-08-10', 'planned', 'task-080-admin', '2026-08-01T00:00:00.000Z');
		`);
		const insertCredential = database.prepare(
			'INSERT INTO password_credentials (account_id, email, salt, password_hash) VALUES (?, ?, ?, ?)'
		);
		for (const role of ['teacher', 'student', 'parent'] as const) {
			const salt = Buffer.from(`task-080-${role}-password-salt`);
			insertCredential.run(`task-080-${role}`, emails[role], salt, scryptSync(password, salt, 64));
		}
	} finally {
		database.close();
	}
}

function snapshotDatabase(): string {
	const database = new Database(requireDisposableDatabase(), { readonly: true });
	try {
		return JSON.stringify(
			Object.fromEntries(
				stateTables.map((table) => [table, database.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()])
			)
		);
	} finally {
		database.close();
	}
}

async function setSession(page: Page, token?: string) {
	await page.context().clearCookies();
	if (token) {
		await page.context().addCookies([
			{
				name: 'foundation_session',
				value: token,
				url: 'http://127.0.0.1:5174',
				httpOnly: true,
				sameSite: 'Lax'
			}
		]);
	}
}

async function login(page: Page, role: keyof typeof emails) {
	await setSession(page);
	await page.goto('/login');
	await page.getByLabel('Email').fill(emails[role]);
	await page.getByLabel('Пароль').fill(password);
	await page.getByRole('button', { name: 'Войти' }).click();
}

test('Home and Classes expose only server-authorized role destinations', async ({ page }) => {
	seedDatabase();

	for (const route of ['/home', '/classes']) {
		await setSession(page, tokens.admin);
		await page.goto(route);
		await expect(page.locator('main[data-role="admin"]')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Открыть свой центр' })).toHaveAttribute('href', '/admin/center-own');
		await expect(page.locator('[data-destination-kind="center"]')).toContainText('Own Center');
		await expect(page.locator('body')).not.toContainText('Other Center');

		await setSession(page, tokens.teacher);
		await page.goto(route);
		await expect(page.locator('main[data-role="teacher"]')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Открыть календарь' })).toHaveAttribute('href', '/calendar?classId=task-080-class-own');
		await expect(page.locator('body')).toContainText('Алгебра');
		await expect(page.locator('body')).not.toContainText('Геометрия');

		for (const [token, role] of [[tokens.student, 'student'], [tokens.parent, 'parent']] as const) {
			await setSession(page, token);
			await page.goto(route);
			if (route === '/home') {
				await expect(page).toHaveURL(/\/calendar\?classId=task-080-class-own$/);
				await expect(page.locator(`main.calendar-shell[data-role="${role}"]`)).toBeVisible();
				await expect(page.locator('[data-lesson-id="task-080-lesson-own"]')).toBeVisible();
			} else {
				await expect(page.locator(`main[data-role="${role}"]`)).toBeVisible();
				await expect(page.locator('a[href="/calendar?classId=task-080-class-own"]')).toHaveCount(1);
				await expect(page.locator('a[href="/calendar?classId=task-080-class-second"]')).toHaveCount(1);
				await expect(page.locator('body')).toContainText('Алгебра');
				await expect(page.locator('body')).toContainText('Геометрия');
				await expect(page.locator('body')).not.toContainText('task-080-student');
			}
		}
	}

	const deniedBefore = snapshotDatabase();
	for (const route of ['/home', '/classes']) {
		await setSession(page);
		const anonymousResponse = await page.goto(route);
		expect(anonymousResponse?.status()).toBe(200);
		expect(page.url()).toMatch(/\/login$/);
		await expect(page.locator('main[data-destination-page]')).toHaveCount(0);

		await setSession(page, tokens.revoked);
		const revokedResponse = await page.goto(route);
		expect(revokedResponse?.status()).toBe(200);
		expect(page.url()).toMatch(/\/login$/);
		await expect(page.locator('main[data-destination-page]')).toHaveCount(0);

		for (const [token, classId] of [
			[tokens.admin, 'task-080-class-other'],
			[tokens.student, 'task-080-class-other'],
			[tokens.parent, 'task-080-class-other'],
			[tokens.nonMember, 'task-080-class-own']
		] as const) {
			await setSession(page, token);
			const response = await page.goto(`${route}?classId=${classId}`);
			expect(response?.status()).toBe(403);
			await expect(page.locator('body')).not.toContainText('Алгебра');
		}
	}
	 expect(snapshotDatabase()).toBe(deniedBefore);

	await setSession(page, 'task-080-removed-teacher-session');
	await page.goto('/home');
	await expect(page.locator('main[data-role="teacher"]')).toBeVisible();
	const afterPositiveRemovedTeacher = snapshotDatabase();
	const database = new Database(requireDisposableDatabase());
	try {
		database.prepare('DELETE FROM teacher_assignments WHERE class_id = ? AND teacher_account_id = ?').run(
			'task-080-class-own',
			'task-080-removed-teacher'
		);
	} finally {
		database.close();
	}
	const afterRemoval = snapshotDatabase();
	for (const route of ['/home', '/classes']) {
		await setSession(page, 'task-080-removed-teacher-session');
		const response = await page.goto(route);
		expect(response?.status()).toBe(403);
		await expect(page.locator('body')).not.toContainText('Алгебра');
	}
	 expect(snapshotDatabase()).toBe(afterRemoval);
	 expect(afterRemoval).not.toBe(afterPositiveRemovedTeacher);

	await login(page, 'teacher');
	await expect(page).toHaveURL(/\/home$/);
	await expect(page.locator('main[data-role="teacher"]')).toBeVisible();
	await expect(page.locator('[data-destination-kind="calendar"]')).toHaveCount(1);
	await expect(page.locator('body')).toContainText('Алгебра');
	await expect(page.locator('body')).not.toContainText('Геометрия');

	for (const role of ['student', 'parent'] as const) {
		await login(page, role);
		await expect(page).toHaveURL(/\/calendar\?classId=task-080-class-own$/);
		await expect(page.locator(`main.calendar-shell[data-role="${role}"]`)).toBeVisible();
		await expect(page.locator('[data-lesson-id="task-080-lesson-own"]')).toHaveAttribute(
			'data-lesson-date',
			'2026-08-10'
		);
	}
});
