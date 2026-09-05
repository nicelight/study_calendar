import { randomBytes, scryptSync } from 'node:crypto';
import { relative, resolve } from 'node:path';
import Database from 'better-sqlite3';
import { expect, test, type Page } from '@playwright/test';

const databaseFilename = process.env.DATABASE_URL;
const projectRoot = resolve(process.cwd());
const adminEmail = 'admin.task-101@example.test';
const adminPassword = 'Admin-task-101!';
const teacherEmail = 'teacher.task-101@example.test';
const teacherPassword = 'Teacher-task-101!';
const studentEmail = 'student.task-101@example.test';
const studentPassword = 'Student-task-101!';
const parentEmail = 'parent.task-101@example.test';
const parentPassword = 'Parent-task-101!';
const centerId = 'center-e2e-101';
const classId = 'class-e2e-101';
const studentAccountId = 'student-e2e-101';

if (!databaseFilename || !relative(projectRoot, resolve(databaseFilename)).startsWith('tmp/')) {
	throw new Error('TASK-101 disposable E2E requires DATABASE_URL under tmp/');
}

function withDatabase<T>(callback: (database: Database.Database) => T): T {
	const database = new Database(databaseFilename!);
	try {
		return callback(database);
	} finally {
		database.close();
	}
}

function insertPassword(
	database: Database.Database,
	accountId: string,
	email: string,
	password: string
): void {
	const salt = randomBytes(32);
	const passwordHash = scryptSync(password, salt, 64);
	database
		.prepare(
			'INSERT INTO password_credentials (account_id, email, salt, password_hash) VALUES (?, ?, ?, ?)'
		)
		.run(accountId, email, salt, passwordHash);
}

function seedFixture(): void {
	withDatabase((database) => {
		database.pragma('foreign_keys = ON');
		database.transaction(() => {
			database.exec(`
				INSERT INTO centers (id, name) VALUES ('center-e2e-101', 'Disposable Marker Center');
				INSERT INTO accounts (id, role) VALUES
					('admin-e2e-101', 'admin'),
					('teacher-e2e-101', 'teacher'),
					('student-e2e-101', 'student'),
					('parent-e2e-101', 'parent');
				INSERT INTO account_profiles (account_id, full_name, registered_at) VALUES
					('admin-e2e-101', 'Admin TASK-101', '2026-01-01T00:00:00.000Z'),
					('teacher-e2e-101', 'Teacher TASK-101', '2026-01-01T00:00:00.000Z'),
					('student-e2e-101', 'Student TASK-101', '2026-01-01T00:00:00.000Z'),
					('parent-e2e-101', 'Parent TASK-101', '2026-01-01T00:00:00.000Z');
				INSERT INTO center_memberships (center_id, account_id) VALUES
					('center-e2e-101', 'admin-e2e-101'),
					('center-e2e-101', 'teacher-e2e-101'),
					('center-e2e-101', 'student-e2e-101'),
					('center-e2e-101', 'parent-e2e-101');
				INSERT INTO classes (id, center_id, name, mode)
					VALUES ('class-e2e-101', 'center-e2e-101', 'Disposable Marker Class', 'individual');
				INSERT INTO class_students (center_id, class_id, student_account_id)
					VALUES ('center-e2e-101', 'class-e2e-101', 'student-e2e-101');
				INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id)
					VALUES ('center-e2e-101', 'parent-e2e-101', 'student-e2e-101');
				INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
					VALUES ('center-e2e-101', 'class-e2e-101', 'teacher-e2e-101');
				INSERT INTO schedules (
					id, center_id, class_id, start_date, end_date, weekdays,
					created_by_account_id, created_at
				) VALUES (
					'schedule-e2e-101', 'center-e2e-101', 'class-e2e-101', '2026-08-01', '2026-09-30',
					'[1,2]', 'admin-e2e-101', '2026-08-01T00:00:00.000Z'
				);
				INSERT INTO lessons (
					id, center_id, class_id, schedule_id, lesson_date, status,
					created_by_account_id, created_at
				) VALUES
					('lesson-e2e-101-week', 'center-e2e-101', 'class-e2e-101', 'schedule-e2e-101', '2026-08-10', 'planned', 'admin-e2e-101', '2026-08-01T00:00:00.000Z'),
					('lesson-e2e-101-month', 'center-e2e-101', 'class-e2e-101', 'schedule-e2e-101', '2026-09-01', 'planned', 'admin-e2e-101', '2026-08-01T00:00:00.000Z');
				INSERT INTO financial_lesson_charges (
					center_id, class_id, lesson_id, student_account_id, lesson_date,
					applied_price, status, created_at, cancelled_at
				) VALUES
					('center-e2e-101', 'class-e2e-101', 'lesson-e2e-101-week', 'student-e2e-101', '2026-08-10', '10', 'active', '2026-08-10T00:00:00.000Z', NULL),
					('center-e2e-101', 'class-e2e-101', 'lesson-e2e-101-month', 'student-e2e-101', '2026-09-01', '10', 'active', '2026-09-01T00:00:00.000Z', NULL);
				INSERT INTO financial_payments (
					id, center_id, class_id, student_account_id, amount, factual_date,
					status, created_by_account_id, created_at
				) VALUES
					('payment-e2e-101-week-first', 'center-e2e-101', 'class-e2e-101', 'student-e2e-101', '12.5', '2026-08-10', 'recorded', 'admin-e2e-101', '2026-08-10T00:00:00.000Z'),
					('payment-e2e-101-week-second', 'center-e2e-101', 'class-e2e-101', 'student-e2e-101', '3.125', '2026-08-10', 'recorded', 'admin-e2e-101', '2026-08-10T00:00:00.000Z'),
					('payment-e2e-101-month', 'center-e2e-101', 'class-e2e-101', 'student-e2e-101', '4.25', '2026-09-01', 'recorded', 'admin-e2e-101', '2026-09-01T00:00:00.000Z');
				INSERT INTO financial_payment_allocations (payment_id, lesson_id, student_account_id, amount)
					VALUES ('payment-e2e-101-week-first', 'lesson-e2e-101-week', 'student-e2e-101', '10');
			`);
			insertPassword(database, 'admin-e2e-101', adminEmail, adminPassword);
			insertPassword(database, 'teacher-e2e-101', teacherEmail, teacherPassword);
			insertPassword(database, 'student-e2e-101', studentEmail, studentPassword);
			insertPassword(database, 'parent-e2e-101', parentEmail, parentPassword);
		})();
	});
}

function financialState(): string {
	return withDatabase((database) =>
		JSON.stringify({
			priceSettings: database.prepare('SELECT * FROM financial_price_settings ORDER BY rowid').all(),
			charges: database.prepare('SELECT * FROM financial_lesson_charges ORDER BY rowid').all(),
			payments: database.prepare('SELECT * FROM financial_payments ORDER BY rowid').all(),
			allocations: database.prepare('SELECT * FROM financial_payment_allocations ORDER BY rowid').all(),
			commands: database.prepare('SELECT * FROM financial_payment_commands ORDER BY rowid').all(),
			audit: database.prepare('SELECT * FROM financial_payment_audit_records ORDER BY rowid').all()
		})
	);
}

async function login(page: Page, email: string, password: string): Promise<void> {
	await page.goto('/login');
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Пароль').fill(password);
	await page.getByRole('button', { name: 'Войти' }).click();
	await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
}

async function logout(page: Page): Promise<void> {
	await page.evaluate(async () => {
		await fetch('/auth/logout', { method: 'POST' });
	});
}

test('disposable personal calendar renders projected payment markers without financial mutation', async ({ page }) => {
	seedFixture();
	const before = financialState();

	await login(page, studentEmail, studentPassword);
	await page.goto(`/calendar?classId=${classId}&date=2026-08-10`);
	await expect(page.locator('[data-role="student"]')).toBeVisible();
	const weekMarkers = page.locator('[data-payment-marker-date="2026-08-09"]');
	await expect(weekMarkers).toHaveCount(2);
	await expect(weekMarkers.nth(0)).toContainText('12.5');
	await expect(weekMarkers.nth(0)).toContainText('Фактическая дата: 2026-08-10');
	await expect(weekMarkers.nth(1)).toContainText('3.125');
	await expect(page.locator('.day[data-payment-status="paid"]')).toHaveCount(1);

	await page.goto(`/calendar?classId=${classId}&date=2026-09-01`);
	const monthMarker = page.locator('[data-payment-marker-date="2026-08-31"]');
	await expect(monthMarker).toHaveCount(1);
	await expect(monthMarker).toContainText('4.25');
	await expect(monthMarker).toContainText('Фактическая дата: 2026-09-01');
	await expect(page.locator('.day[data-payment-status="unpaid"]')).toHaveCount(1);
	await logout(page);

	await login(page, parentEmail, parentPassword);
	await page.goto(`/calendar?classId=${classId}&date=2026-09-01`);
	await expect(page.locator('[data-role="parent"]')).toBeVisible();
	await expect(page.locator('[data-payment-marker-date="2026-08-31"]')).toHaveCount(1);
	await expect(page.locator('[data-payment-marker-date="2026-08-31"]')).toContainText('4.25');
	await logout(page);

	for (const [email, password, role] of [
		[adminEmail, adminPassword, 'admin'],
		[teacherEmail, teacherPassword, 'teacher']
	] as const) {
		await login(page, email, password);
		await page.goto(`/calendar?classId=${classId}&date=2026-09-01`);
		await expect(page.locator(`[data-role="${role}"]`)).toBeVisible();
		await expect(page.locator('[data-payment-marker-id]')).toHaveCount(0);
		await expect(page.locator('[data-payment-marker]')).toHaveCount(0);
		await logout(page);
	}

	expect(financialState()).toBe(before);
	withDatabase((database) => {
		expect(database.prepare('SELECT COUNT(*) AS count FROM financial_payments').get()).toEqual({ count: 3 });
		expect(database.prepare('SELECT COUNT(*) AS count FROM financial_payment_allocations').get()).toEqual({ count: 1 });
	});
});
