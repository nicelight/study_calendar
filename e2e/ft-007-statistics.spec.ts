import Database from 'better-sqlite3';
import { expect, test } from '@playwright/test';
import { resolve, sep } from 'node:path';

const databaseFilename = process.env.DATABASE_URL;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5174';
const sessionToken = 'task-097-admin-session';
const stateTables = [
	'accounts', 'account_profiles', 'sessions', 'centers', 'center_memberships', 'classes',
	'teacher_assignments', 'class_students', 'parent_student_links', 'schedules', 'lessons',
	'learning_attendance', 'financial_lesson_charges', 'financial_payments',
	'financial_payment_allocations'
] as const;

function requireDisposableDatabase(): string {
	const disposableRoot = `${resolve(process.cwd(), 'tmp')}${sep}`;
	if (!databaseFilename || !resolve(databaseFilename).startsWith(disposableRoot)) {
		throw new Error('TASK-097 disposable E2E requires DATABASE_URL under tmp/');
	}
	return databaseFilename;
}

function seedDatabase(): void {
	const database = new Database(requireDisposableDatabase());
	try {
			database.exec(`
			INSERT INTO centers (id, name) VALUES ('task-097-center', 'Центр Бета');
			INSERT INTO accounts (id, role) VALUES
				('task-097-admin', 'admin'),
				('task-097-teacher-alpha', 'teacher'),
				('task-097-teacher-beta', 'teacher'),
				('task-097-student-alpha', 'student'),
				('task-097-student-beta', 'student'),
				('task-097-student-gamma', 'student'),
				('task-097-parent', 'parent');
			INSERT INTO account_profiles (account_id, full_name, registered_at) VALUES
				('task-097-admin', 'Админ Центра', '2026-01-01T00:00:00.000Z'),
				('task-097-teacher-alpha', 'Учитель Альфа', '2026-01-02T00:00:00.000Z'),
				('task-097-teacher-beta', 'Учитель Бета', '2026-02-02T00:00:00.000Z'),
				('task-097-student-alpha', 'Анна Альфа', '2026-01-03T00:00:00.000Z'),
				('task-097-student-beta', 'Яна Бета', '2026-02-03T00:00:00.000Z'),
				('task-097-student-gamma', 'Галя Бета', '2026-02-05T00:00:00.000Z'),
				('task-097-parent', 'Родитель Бета', '2026-02-04T00:00:00.000Z');
			INSERT INTO sessions (token, account_id, revoked_at)
				VALUES ('${sessionToken}', 'task-097-admin', NULL);
			INSERT INTO center_memberships (center_id, account_id)
				SELECT 'task-097-center', id FROM accounts;
			INSERT INTO classes (id, center_id, name, mode) VALUES
				('task-097-class-alpha', 'task-097-center', 'Альфа', 'group'),
				('task-097-class-beta', 'task-097-center', 'Бета', 'group');
			INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id) VALUES
				('task-097-center', 'task-097-class-alpha', 'task-097-teacher-beta'),
				('task-097-center', 'task-097-class-beta', 'task-097-teacher-alpha'),
				('task-097-center', 'task-097-class-beta', 'task-097-teacher-beta');
			INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
				('task-097-center', 'task-097-class-alpha', 'task-097-student-alpha'),
				('task-097-center', 'task-097-class-beta', 'task-097-student-beta'),
				('task-097-center', 'task-097-class-beta', 'task-097-student-gamma');
			INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id)
				VALUES ('task-097-center', 'task-097-parent', 'task-097-student-beta');
			INSERT INTO schedules (id, center_id, class_id, start_date, end_date, weekdays, created_by_account_id, created_at)
				VALUES ('task-097-schedule-beta', 'task-097-center', 'task-097-class-beta', '2026-02-01', '2026-02-28', '[1]', 'task-097-admin', '2026-02-01T00:00:00.000Z');
			INSERT INTO lessons (id, center_id, class_id, schedule_id, lesson_date, status, created_by_account_id, created_at)
				VALUES ('task-097-lesson-beta', 'task-097-center', 'task-097-class-beta', 'task-097-schedule-beta', '2026-02-02', 'completed', 'task-097-admin', '2026-02-02T00:00:00.000Z');
			INSERT INTO learning_attendance (center_id, class_id, lesson_id, student_account_id, attendance, recorded_by_account_id, recorded_at) VALUES
				('task-097-center', 'task-097-class-beta', 'task-097-lesson-beta', 'task-097-student-beta', 'present', 'task-097-teacher-alpha', '2026-02-02T01:00:00.000Z'),
				('task-097-center', 'task-097-class-beta', 'task-097-lesson-beta', 'task-097-student-gamma', 'absent', 'task-097-teacher-alpha', '2026-02-02T01:00:00.000Z');
			INSERT INTO financial_lesson_charges (center_id, class_id, lesson_id, student_account_id, lesson_date, applied_price, status, created_at, cancelled_at)
				VALUES ('task-097-center', 'task-097-class-beta', 'task-097-lesson-beta', 'task-097-student-beta', '2026-02-02', '100', 'active', '2026-02-02T00:00:00.000Z', NULL);
			INSERT INTO financial_payments (id, center_id, class_id, student_account_id, amount, factual_date, status, created_by_account_id, created_at)
				VALUES ('task-097-payment', 'task-097-center', 'task-097-class-beta', 'task-097-student-beta', '100', '2026-02-01', 'recorded', 'task-097-admin', '2026-02-01T00:00:00.000Z');
			INSERT INTO financial_payment_allocations (payment_id, lesson_id, student_account_id, amount)
				VALUES ('task-097-payment', 'task-097-lesson-beta', 'task-097-student-beta', '100');
		`);
	} finally {
		database.close();
	}
}

function snapshotDatabase(): string {
	const database = new Database(requireDisposableDatabase(), { readonly: true });
	try {
		return JSON.stringify(Object.fromEntries(
			stateTables.map((table) => [table, database.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()])
		));
	} finally {
		database.close();
	}
}

test('Statistics sorting is a typed read-only presentation over the authorized registry', async ({ page }) => {
	seedDatabase();
	const stateBefore = snapshotDatabase();
	await page.context().addCookies([{
		name: 'foundation_session', value: sessionToken, url: baseURL, httpOnly: true, sameSite: 'Lax'
	}]);

	await page.goto('/statistics');
	await expect(page.locator('[data-statistics-page]')).toBeVisible();
	await page.waitForTimeout(500);

	const students = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Students' }) });
	const teachers = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Teachers' }) });
	const classes = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Classes' }) });
	for (const table of [students, teachers, classes]) {
		await expect(table.getByRole('button')).toHaveCount(table === students ? 8 : table === teachers ? 6 : 4);
	}

	async function assertBothDirections(
		table: typeof students,
		label: string,
		headerIndex: number,
		ascendingFirstRow: string | null,
		descendingFirstRow: string | null,
		startsActiveAscending = false
	): Promise<void> {
		if (startsActiveAscending) {
			await table.getByRole('button', { name: `Сортировать ${label} по убыванию` }).click();
			await expect(table.locator('th').nth(headerIndex)).toHaveAttribute('aria-sort', 'descending');
			if (descendingFirstRow) await expect(table.locator('tbody tr').first()).toContainText(descendingFirstRow);
			await table.getByRole('button', { name: `Сортировать ${label} по возрастанию` }).click();
			await expect(table.locator('th').nth(headerIndex)).toHaveAttribute('aria-sort', 'ascending');
			if (ascendingFirstRow) await expect(table.locator('tbody tr').first()).toContainText(ascendingFirstRow);
			return;
		}

		await table.getByRole('button', { name: `Сортировать ${label} по возрастанию` }).click();
		await expect(table.locator('th').nth(headerIndex)).toHaveAttribute('aria-sort', 'ascending');
		if (ascendingFirstRow) await expect(table.locator('tbody tr').first()).toContainText(ascendingFirstRow);
		await table.getByRole('button', { name: `Сортировать ${label} по убыванию` }).click();
		await expect(table.locator('th').nth(headerIndex)).toHaveAttribute('aria-sort', 'descending');
		if (descendingFirstRow) await expect(table.locator('tbody tr').first()).toContainText(descendingFirstRow);
	}

	// Every rendered control is clicked in both directions. Rows with a single
	// center-wide institution value still prove their visible active direction.
	await assertBothDirections(students, 'ФИО', 0, 'Анна Альфа', 'Яна Бета', true);
	await assertBothDirections(students, 'Регистрация', 1, 'Анна Альфа', 'Галя Бета');
	await assertBothDirections(students, 'Класс', 2, 'Анна Альфа', 'Яна Бета');
	await assertBothDirections(students, 'Родитель', 3, 'Анна Альфа', 'Яна Бета');
	await assertBothDirections(students, 'Teacher', 4, 'Яна Бета', 'Анна Альфа');
	await assertBothDirections(students, 'Payment capability', 5, 'Анна Альфа', 'Яна Бета');
	await assertBothDirections(students, 'Attendance', 6, 'Анна Альфа', 'Яна Бета');
	await assertBothDirections(students, 'Institution', 7, null, null);

	await assertBothDirections(teachers, 'ФИО', 0, 'Учитель Альфа', 'Учитель Бета', true);
	await assertBothDirections(teachers, 'Регистрация', 1, 'Учитель Альфа', 'Учитель Бета');
	await assertBothDirections(teachers, 'Классы', 2, 'Учитель Бета', 'Учитель Альфа');
	await assertBothDirections(teachers, 'Attendance', 3, 'Учитель Бета', 'Учитель Бета');
	await assertBothDirections(teachers, 'Institution', 4, null, null);
	await assertBothDirections(teachers, 'Students', 5, 'Учитель Альфа', 'Учитель Бета');

	await assertBothDirections(classes, 'Название', 0, 'Альфа', 'Бета', true);
	await assertBothDirections(classes, 'Institution', 1, null, null);
	await assertBothDirections(classes, 'Students', 2, 'Альфа', 'Бета');
	await assertBothDirections(classes, 'Teacher', 3, 'Бета', 'Альфа');
	await expect.poll(snapshotDatabase).toBe(stateBefore);
});
