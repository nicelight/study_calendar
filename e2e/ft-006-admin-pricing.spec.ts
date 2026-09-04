import { randomBytes, scryptSync } from 'node:crypto';
import { resolve, relative } from 'node:path';
import Database from 'better-sqlite3';
import { expect, test } from '@playwright/test';

const databaseFilename = process.env.DATABASE_URL;
const adminEmail = 'admin.task-099@example.test';
const adminPassword = 'Admin-task-099!';
const teacherEmail = 'teacher.task-099@example.test';
const teacherPassword = 'Teacher-task-099!';
const projectRoot = resolve(process.cwd());

if (!databaseFilename || !relative(projectRoot, resolve(databaseFilename)).startsWith('tmp/')) {
	throw new Error('TASK-099 disposable E2E requires DATABASE_URL under tmp/');
}

function withDatabase<T>(callback: (database: Database.Database) => T): T {
	const database = new Database(databaseFilename!);
	try {
		return callback(database);
	} finally {
		database.close();
	}
}

function insertPassword(database: Database.Database, accountId: string, email: string, password: string): void {
	const salt = randomBytes(32);
	const passwordHash = scryptSync(password, salt, 64);
	database.prepare(
		'INSERT INTO password_credentials (account_id, email, salt, password_hash) VALUES (?, ?, ?, ?)'
	).run(accountId, email, salt, passwordHash);
}

function seedFixture(): void {
	withDatabase((database) => {
		database.pragma('foreign_keys = ON');
		database.transaction(() => {
			database.exec(`
				INSERT INTO centers (id, name) VALUES ('center-e2e-099', 'Disposable Pricing Center');
				INSERT INTO accounts (id, role) VALUES
					('admin-e2e-099', 'admin'),
					('teacher-e2e-099', 'teacher'),
					('student-e2e-099', 'student'),
					('student-two-e2e-099', 'student');
				INSERT INTO account_profiles (account_id, full_name, registered_at) VALUES
					('admin-e2e-099', 'Admin TASK-099', '2026-01-01T00:00:00.000Z'),
					('teacher-e2e-099', 'Teacher TASK-099', '2026-01-01T00:00:00.000Z'),
					('student-e2e-099', 'Student One TASK-099', '2026-01-01T00:00:00.000Z'),
					('student-two-e2e-099', 'Student Two TASK-099', '2026-01-01T00:00:00.000Z');
				INSERT INTO center_memberships (center_id, account_id) VALUES
					('center-e2e-099', 'admin-e2e-099'),
					('center-e2e-099', 'teacher-e2e-099'),
					('center-e2e-099', 'student-e2e-099'),
					('center-e2e-099', 'student-two-e2e-099');
				INSERT INTO classes (id, center_id, name, mode)
					VALUES ('class-e2e-099', 'center-e2e-099', 'Disposable Pricing Class', 'group');
				INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
					('center-e2e-099', 'class-e2e-099', 'student-e2e-099'),
					('center-e2e-099', 'class-e2e-099', 'student-two-e2e-099');
				INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
					VALUES ('center-e2e-099', 'class-e2e-099', 'teacher-e2e-099');
				INSERT INTO schedules (
					id, center_id, class_id, start_date, end_date, weekdays,
					created_by_account_id, created_at
				) VALUES (
					'schedule-e2e-099', 'center-e2e-099', 'class-e2e-099',
					'2026-01-01', '2026-12-31', '[1]', 'admin-e2e-099',
					'2026-01-01T00:00:00.000Z'
				);
				INSERT INTO lessons (
					id, center_id, class_id, schedule_id, lesson_date, status,
					created_by_account_id, created_at
				) VALUES
					('lesson-old-e2e-099', 'center-e2e-099', 'class-e2e-099', 'schedule-e2e-099', '2026-08-03', 'planned', 'admin-e2e-099', '2026-01-01T00:00:00.000Z'),
					('lesson-future-e2e-099', 'center-e2e-099', 'class-e2e-099', 'schedule-e2e-099', '2026-10-05', 'planned', 'admin-e2e-099', '2026-01-01T00:00:00.000Z');
			`);
			insertPassword(database, 'admin-e2e-099', adminEmail, adminPassword);
			insertPassword(database, 'teacher-e2e-099', teacherEmail, teacherPassword);
			database.prepare(
				`INSERT INTO financial_lesson_charges (
					center_id, class_id, lesson_id, student_account_id, lesson_date,
					applied_price, status, created_at, cancelled_at
				) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, NULL)`
			).run(
				'center-e2e-099', 'class-e2e-099', 'lesson-old-e2e-099',
				'student-e2e-099', '2026-08-03', '10', '2026-08-03T00:00:00.000Z'
			);
		})();
	});
}

test.beforeAll(() => seedFixture());

test('disposable Admin pricing history and future-charge proof', async ({ page }) => {
	await page.goto('/login');
	await page.getByLabel('Email').fill(adminEmail);
	await page.getByLabel('Пароль').fill(adminPassword);
	await page.getByRole('button', { name: 'Войти' }).click();
	await expect(page).toHaveURL('/admin/center-e2e-099');

	await page.getByRole('link', { name: 'Финансы' }).click();
	await expect(page).toHaveURL('/admin/center-e2e-099/finance');
	const classCard = page.locator('[data-class-id="class-e2e-099"]');
	await expect(classCard).toBeVisible();

	const classPriceForm = classCard.locator('form[action="?/setClassPrice"]');
	await classPriceForm.locator('input[name="effectiveFrom"]').fill('2026-01-01');
	const classAmount = classPriceForm.locator('input[name="amount"]');
	await classAmount.fill('10.125');
	await expect(classAmount).toHaveValue('10.125');
	expect(await classAmount.evaluate((element) => {
		const input = element as HTMLInputElement;
		return {
			step: input.getAttribute('step'),
			valid: input.validity.valid,
			stepMismatch: input.validity.stepMismatch,
			formValid: input.form?.checkValidity() ?? false
		};
	})).toEqual({ step: 'any', valid: true, stepMismatch: false, formValid: true });
	await classPriceForm.getByRole('button', { name: 'Сохранить цену класса' }).click();
	await expect(page.getByText('Цена класса сохранена.')).toBeVisible();

	const overrideForm = classCard.locator('form[action="?/setStudentPriceOverride"]');
	await overrideForm.locator('select[name="studentAccountId"]').selectOption('student-e2e-099');
	const overrideAmount = overrideForm.locator('input[name="amount"]');
	await overrideAmount.fill('15.125');
	await overrideForm.locator('input[name="effectiveFrom"]').fill('2026-01-01');
	await expect(overrideAmount).toHaveValue('15.125');
	expect(await overrideAmount.evaluate((element) => {
		const input = element as HTMLInputElement;
		return { step: input.getAttribute('step'), valid: input.validity.valid, stepMismatch: input.validity.stepMismatch, formValid: input.form?.checkValidity() ?? false };
	})).toEqual({ step: 'any', valid: true, stepMismatch: false, formValid: true });
	await overrideForm.getByRole('button', { name: 'Сохранить override' }).click();
	await expect(page.getByText('Цена ученика сохранена.')).toBeVisible();
	await expect(classCard.locator('[data-price-history]')).toContainText('Student One TASK-099');
	await expect(classCard.locator('[data-price-history]')).toContainText('admin-e2e-099');
	await expect(classCard.locator('[data-price-history]')).toContainText('10.125');
	await expect(classCard.locator('[data-price-history]')).toContainText('15.125');
	await expect(classCard.locator('[data-price-history] time')).toHaveCount(2);

	await page.goto('/lesson-context?classId=class-e2e-099&lessonId=lesson-future-e2e-099');
	const paymentForm = page.getByRole('form', { name: 'Оплата занятия' });
	const paymentAmount = paymentForm.locator('input[name="amount"]');
	await expect(paymentAmount).toHaveValue('10.125');
	await paymentForm.locator('input[name="confirmation"]').fill('precision-validity-probe');
	expect(await paymentAmount.evaluate((element) => {
		const input = element as HTMLInputElement;
		return { step: input.getAttribute('step'), valid: input.validity.valid, stepMismatch: input.validity.stepMismatch, formValid: input.form?.checkValidity() ?? false };
	})).toEqual({ step: 'any', valid: true, stepMismatch: false, formValid: true });
	await paymentAmount.fill('7.25');
	await expect(paymentAmount).toHaveValue('7.25');

	await page.goto('/admin/center-e2e-099');
	await page.getByRole('button', { name: 'Выйти' }).click();
	await expect(page).toHaveURL('/login');
	await page.getByLabel('Email').fill(teacherEmail);
	await page.getByLabel('Пароль').fill(teacherPassword);
	await page.getByRole('button', { name: 'Войти' }).click();
	await expect(page).toHaveURL('/home');
	await page.goto('/lesson-context?classId=class-e2e-099&lessonId=lesson-future-e2e-099');
	const attendanceForm = page.getByRole('form', { name: 'Посещаемость урока' });
	await attendanceForm.getByRole('button', { name: 'Сохранить посещаемость' }).click();
	await expect(page.getByText('Посещаемость сохранена.')).toBeVisible();

	withDatabase((database) => {
		const oldCharge = database.prepare(
			'SELECT applied_price, status, cancelled_at FROM financial_lesson_charges WHERE lesson_id = ? AND student_account_id = ?'
		).get('lesson-old-e2e-099', 'student-e2e-099');
		expect(oldCharge).toEqual({ applied_price: '10', status: 'active', cancelled_at: null });
		expect(database.prepare(
			'SELECT student_account_id, applied_price FROM financial_lesson_charges WHERE lesson_id = ? ORDER BY student_account_id'
		).all('lesson-future-e2e-099')).toEqual([
			{ student_account_id: 'student-e2e-099', applied_price: '15.125' },
			{ student_account_id: 'student-two-e2e-099', applied_price: '10.125' }
		]);
	});
});
