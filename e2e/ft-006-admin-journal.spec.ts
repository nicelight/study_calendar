import { randomBytes, scryptSync } from 'node:crypto';
import { relative, resolve } from 'node:path';
import Database from 'better-sqlite3';
import { expect, test } from '@playwright/test';

const databaseFilename = process.env.DATABASE_URL;
const adminEmail = 'admin.task-100@example.test';
const adminPassword = 'Admin-task-100!';
const projectRoot = resolve(process.cwd());
const centerId = 'center-e2e-100';
const classId = 'class-e2e-100';
const studentAccountId = 'student-e2e-100';
const paymentId = 'payment-e2e-100';
const secondPaymentId = 'payment-e2e-101';

if (!databaseFilename || !relative(projectRoot, resolve(databaseFilename)).startsWith('tmp/')) {
	throw new Error('TASK-100 disposable E2E requires DATABASE_URL under tmp/');
}

function withDatabase<T>(callback: (database: Database.Database) => T): T {
	const database = new Database(databaseFilename!);
	try {
		return callback(database);
	} finally {
		database.close();
	}
}

function insertPassword(database: Database.Database): void {
	const salt = randomBytes(32);
	const passwordHash = scryptSync(adminPassword, salt, 64);
	database.prepare(
		'INSERT INTO password_credentials (account_id, email, salt, password_hash) VALUES (?, ?, ?, ?)'
	).run('admin-e2e-100', adminEmail, salt, passwordHash);
}

function seedFixture(): void {
	withDatabase((database) => {
		database.pragma('foreign_keys = ON');
		database.transaction(() => {
			database.exec(`
				INSERT INTO centers (id, name) VALUES ('center-e2e-100', 'Disposable Journal Center');
				INSERT INTO accounts (id, role) VALUES
					('admin-e2e-100', 'admin'),
					('student-e2e-100', 'student');
				INSERT INTO account_profiles (account_id, full_name, registered_at) VALUES
					('admin-e2e-100', 'Admin TASK-100', '2026-01-01T00:00:00.000Z'),
					('student-e2e-100', 'Student TASK-100', '2026-01-01T00:00:00.000Z');
				INSERT INTO center_memberships (center_id, account_id) VALUES
					('center-e2e-100', 'admin-e2e-100'),
					('center-e2e-100', 'student-e2e-100');
				INSERT INTO classes (id, center_id, name, mode)
					VALUES ('class-e2e-100', 'center-e2e-100', 'Disposable Journal Class', 'individual');
				INSERT INTO class_students (center_id, class_id, student_account_id)
					VALUES ('center-e2e-100', 'class-e2e-100', 'student-e2e-100');
				INSERT INTO financial_lesson_charges (
					center_id, class_id, lesson_id, student_account_id, lesson_date,
					applied_price, status, created_at, cancelled_at
				) VALUES (
					'center-e2e-100', 'class-e2e-100', 'lesson-e2e-100', 'student-e2e-100',
					'2026-08-01', '10.125', 'active', '2026-08-01T00:00:00.000Z', NULL
				);
				INSERT INTO financial_payments (
					id, center_id, class_id, student_account_id, amount, factual_date,
					status, created_by_account_id, created_at
				) VALUES (
					'payment-e2e-100', 'center-e2e-100', 'class-e2e-100', 'student-e2e-100',
					'4.125', '2026-08-02', 'recorded', 'admin-e2e-100', '2026-08-02T00:00:00.000Z'
				);
				INSERT INTO financial_payments (
					id, center_id, class_id, student_account_id, amount, factual_date,
					status, created_by_account_id, created_at
				) VALUES (
					'payment-e2e-101', 'center-e2e-100', 'class-e2e-100', 'student-e2e-100',
					'1.000', '2026-08-03', 'recorded', 'admin-e2e-100', '2026-08-03T00:00:00.000Z'
				);
				INSERT INTO financial_payment_allocations (payment_id, lesson_id, student_account_id, amount)
					VALUES
						('payment-e2e-100', 'lesson-e2e-100', 'student-e2e-100', '4.125'),
						('payment-e2e-101', 'lesson-e2e-100', 'student-e2e-100', '1.000');
			`);
			insertPassword(database);
			const insertCreatedAudit = database.prepare(
				`INSERT INTO financial_payment_audit_records (
					center_id, class_id, payment_id, student_account_id, action,
					actor_account_id, changed_at, before_state, after_state
				) VALUES (?, ?, ?, ?, 'payment-created', ?, ?, NULL, ?)`
			);
			insertCreatedAudit.run(
				centerId,
				classId,
				paymentId,
				studentAccountId,
				'admin-e2e-100',
				'2026-08-02T00:00:00.000Z',
				JSON.stringify({
					id: paymentId,
					centerId,
					classId,
					studentAccountId,
					amount: '4.125',
					factualDate: '2026-08-02',
					status: 'recorded',
					createdByAccountId: 'admin-e2e-100',
					createdAt: '2026-08-02T00:00:00.000Z'
				})
			);
			insertCreatedAudit.run(
				centerId,
				classId,
				secondPaymentId,
				studentAccountId,
				'admin-e2e-100',
				'2026-08-03T00:00:00.000Z',
				JSON.stringify({
					id: secondPaymentId,
					centerId,
					classId,
					studentAccountId,
					amount: '1.000',
					factualDate: '2026-08-03',
					status: 'recorded',
					createdByAccountId: 'admin-e2e-100',
					createdAt: '2026-08-03T00:00:00.000Z'
				})
			);
		})();
	});
}

test('disposable Admin journal proof lists, edits, cancels, and reloads authoritative results', async ({ page }) => {
	seedFixture();

	await page.goto('/login');
	await page.getByLabel('Email').fill(adminEmail);
	await page.getByLabel('Пароль').fill(adminPassword);
	await page.getByRole('button', { name: 'Войти' }).click();
	await expect(page).toHaveURL(`/admin/${centerId}`);
	await page.goto(`/admin/${centerId}/finance`);

	const journal = page.locator('[data-payment-journal]');
	const entry = journal.locator(`[data-payment-id="${paymentId}"]`);
	const secondEntry = journal.locator(`[data-payment-id="${secondPaymentId}"]`);
	await expect(journal).toBeVisible();
	await expect(entry).toHaveCount(1);
	await expect(secondEntry).toHaveCount(1);
	await expect(entry).toContainText('Student TASK-100');
	await expect(entry).toContainText('4.125');
	await expect(entry).toContainText('2026-08-02');
	await expect(entry).toContainText('Проведён');
	await expect(entry.locator('[data-payment-allocations]')).toContainText('lesson-e2e-100');
	await expect(entry.locator('[data-payment-balance]')).toHaveText('5');
	await expect(entry.locator('[data-payment-audit]')).toContainText('Создан');
	await expect(secondEntry).toContainText('1.000');
	await expect(secondEntry).toContainText('2026-08-03');
	await expect(secondEntry.locator('[data-payment-balance]')).toHaveText('5');
	await expect(secondEntry.locator('[data-payment-audit]')).toContainText('Создан');

	const editForm = entry.locator('form[action="?/editPayment"]');
	await expect(editForm.locator('input[name="confirmation"]')).toHaveAttribute('required', '');
	await editForm.locator('input[name="amount"]').fill('5.125');
	await editForm.locator('input[name="factualDate"]').fill('2026-08-03');
	await editForm.locator('input[name="confirmation"]').check();
	await editForm.getByRole('button', { name: 'Сохранить изменение' }).click();
	await expect(page.getByText('Платёж изменён.')).toBeVisible();
	await expect(entry.locator('[data-payment-amount]')).toHaveText('5.125');
	await expect(entry).toContainText('2026-08-03');
	await expect(entry.locator('[data-payment-balance]')).toHaveText('4');
	await expect(entry.locator('[data-payment-allocations]')).toContainText('5.125');
	await expect(entry.locator('[data-payment-audit]')).toContainText('Изменён');

	const secondEditForm = secondEntry.locator('form[action="?/editPayment"]');
	await secondEditForm.locator('input[name="amount"]').fill('2.125');
	await secondEditForm.locator('input[name="factualDate"]').fill('2026-08-04');
	await secondEditForm.locator('input[name="confirmation"]').check();
	await secondEditForm.getByRole('button', { name: 'Сохранить изменение' }).click();
	await expect(page.getByText('Платёж изменён.')).toBeVisible();
	await expect(secondEntry.locator('[data-payment-amount]')).toHaveText('2.125');
	await expect(secondEntry).toContainText('2026-08-04');
	await expect(secondEntry.locator('[data-payment-balance]')).toHaveText('2.875');
	await expect(secondEntry.locator('[data-payment-allocations]')).toContainText('2.125');
	await expect(secondEntry.locator('[data-payment-audit]')).toContainText('Изменён');

	const cancelForm = entry.locator('form[action="?/cancelPayment"]');
	await cancelForm.locator('input[name="confirmation"]').check();
	await cancelForm.getByRole('button', { name: 'Отменить платёж' }).click();
	await expect(page.getByText('Платёж отменён.')).toBeVisible();
	await expect(entry.locator('[data-payment-status="cancelled"]')).toHaveText('Отменён');
	await expect(entry.locator('[data-payment-balance]')).toHaveText('8');
	await expect(entry.locator('[data-payment-allocations]')).toHaveCount(0);
	await expect(entry).toContainText('Нет распределения.');
	await expect(entry.locator('[data-payment-audit]')).toContainText('Отменён');
	await expect(entry.locator('form[action="?/editPayment"]')).toHaveCount(0);
	await expect(entry.locator('form[action="?/cancelPayment"]')).toHaveCount(0);

	const secondCancelForm = secondEntry.locator('form[action="?/cancelPayment"]');
	await secondCancelForm.locator('input[name="confirmation"]').check();
	await secondCancelForm.getByRole('button', { name: 'Отменить платёж' }).click();
	await expect(page.getByText('Платёж отменён.')).toBeVisible();
	await expect(secondEntry.locator('[data-payment-status="cancelled"]')).toHaveText('Отменён');
	await expect(secondEntry.locator('[data-payment-balance]')).toHaveText('10.125');
	await expect(secondEntry.locator('[data-payment-allocations]')).toHaveCount(0);
	await expect(secondEntry).toContainText('Нет распределения.');
	await expect(secondEntry.locator('[data-payment-audit]')).toContainText('Отменён');
	await expect(secondEntry.locator('form[action="?/editPayment"]')).toHaveCount(0);
	await expect(secondEntry.locator('form[action="?/cancelPayment"]')).toHaveCount(0);

	withDatabase((database) => {
		expect(database.prepare('SELECT COUNT(*) AS count FROM financial_payments WHERE id = ?').get(paymentId)).toEqual({ count: 1 });
		expect(database.prepare('SELECT status, amount, factual_date FROM financial_payments WHERE id = ?').get(paymentId)).toEqual({
			status: 'cancelled',
			amount: '5.125',
			factual_date: '2026-08-03'
		});
		expect(database.prepare('SELECT COUNT(*) AS count FROM financial_payment_audit_records WHERE payment_id = ?').get(paymentId)).toEqual({ count: 3 });
		expect(database.prepare('SELECT COUNT(*) AS count FROM financial_payments WHERE id = ?').get(secondPaymentId)).toEqual({ count: 1 });
		expect(database.prepare('SELECT status, amount, factual_date FROM financial_payments WHERE id = ?').get(secondPaymentId)).toEqual({
			status: 'cancelled',
			amount: '2.125',
			factual_date: '2026-08-04'
		});
		expect(database.prepare('SELECT COUNT(*) AS count FROM financial_payment_audit_records WHERE payment_id = ?').get(secondPaymentId)).toEqual({ count: 3 });
	});
});
