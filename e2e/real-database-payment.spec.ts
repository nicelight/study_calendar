import Database from 'better-sqlite3';
import { expect, test, type Page } from '@playwright/test';

const adminEmail = process.env.E2E_ADMIN_EMAIL ?? 'admin@nicelight.ai';
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const databaseFilename = process.env.DATABASE_URL ?? 'study-calendar.db';
const teacherEmail = process.env.E2E_TEACHER_EMAIL ?? 'e2e.teacher@study-calendar.test';
const teacherPassword = process.env.E2E_TEACHER_PASSWORD ?? 'E2eTeacher-20260817!';
const studentEmail = process.env.E2E_STUDENT_EMAIL ?? 'e2e.student@study-calendar.test';
const studentPassword = process.env.E2E_STUDENT_PASSWORD ?? 'E2eStudent-20260817!';

type AccountRow = { id: string; role: 'admin' | 'teacher' | 'student' | 'parent' };
type ClassRow = { id: string; center_id: string; name: string };
type LessonRow = { id: string; lesson_date: string };

function withDatabase<T>(callback: (database: Database.Database) => T): T {
	const database = new Database(databaseFilename);
	try {
		return callback(database);
	} finally {
		database.close();
	}
}

function findAccount(email: string): AccountRow | undefined {
	return withDatabase((database) =>
		database
			.prepare(
				`SELECT accounts.id, accounts.role
				 FROM accounts
				 JOIN password_credentials ON password_credentials.account_id = accounts.id
				 WHERE password_credentials.email = ?`
			)
			.get(email.trim().toLowerCase()) as AccountRow | undefined
	);
}

async function ensureParticipant(
	page: Page,
	role: 'teacher' | 'student',
	email: string,
	password: string
): Promise<string> {
	let account = findAccount(email);
	if (account) {
		expect(account.role).toBe(role);
		return account.id;
	}

	const form = page.locator('form[action="?/createParticipant"]');
	await form.locator('select[name="role"]').selectOption(role);
	await form.locator('input[name="email"]').fill(email);
	await form.locator('input[name="password"]').fill(password);
	await form.getByRole('button', { name: 'Создать аккаунт' }).click();
	await expect(page.getByText(email)).toBeVisible();

	account = findAccount(email);
	if (!account || account.role !== role) {
		throw new Error(`The real Admin flow did not create ${role} ${email}`);
	}
	return account.id;
}

function readTestClass(studentAccountId: string): ClassRow {
	return withDatabase((database) => {
		const row = database
			.prepare(
				`SELECT classes.id, classes.center_id, classes.name
				 FROM classes
				 LEFT JOIN class_students ON class_students.class_id = classes.id
				 GROUP BY classes.id
				 HAVING COUNT(class_students.student_account_id) = 0
					OR (COUNT(class_students.student_account_id) = 1 AND MAX(class_students.student_account_id) = ?)
				 ORDER BY classes.id
				 LIMIT 1`
			)
			.get(studentAccountId) as ClassRow | undefined;
		if (!row) throw new Error('Real E2E needs an existing class with no student assignment');
		return row;
	});
}

function readLessons(classId: string): LessonRow[] {
	return withDatabase((database) =>
		database
			.prepare(
				`SELECT id, lesson_date
				 FROM lessons
				 WHERE class_id = ? AND status <> 'cancelled'
				 ORDER BY lesson_date, id
				 LIMIT 2`
			)
			.all(classId) as LessonRow[]
	);
}

function seedFinancialFixture(classRow: ClassRow, studentAccountId: string, paidLesson: LessonRow): void {
	withDatabase((database) => {
		database.pragma('foreign_keys = ON');
		database.transaction(() => {
			const paymentIds = database
				.prepare('SELECT id FROM financial_payments WHERE class_id = ? AND student_account_id = ?')
				.all(classRow.id, studentAccountId) as Array<{ id: string }>;
			for (const payment of paymentIds) {
				database.prepare('DELETE FROM financial_payment_audit_records WHERE payment_id = ?').run(payment.id);
				database.prepare('DELETE FROM financial_payment_commands WHERE payment_id = ?').run(payment.id);
				database.prepare('DELETE FROM financial_payment_allocations WHERE payment_id = ?').run(payment.id);
			database.prepare('DELETE FROM financial_payments WHERE id = ?').run(payment.id);
			}
			database
				.prepare('DELETE FROM financial_lesson_charges WHERE class_id = ? AND student_account_id = ?')
				.run(classRow.id, studentAccountId);
			database
				.prepare('DELETE FROM financial_price_settings WHERE class_id = ? AND student_account_id = ?')
				.run(classRow.id, studentAccountId);

			const now = new Date().toISOString();
			database
				.prepare(
					`INSERT INTO financial_price_settings (
						center_id, class_id, student_account_id, amount, effective_from,
						created_by_account_id, created_at
					) VALUES (?, ?, ?, ?, ?,
						(SELECT account_id FROM center_memberships WHERE center_id = ? AND account_id IN (SELECT id FROM accounts WHERE role = 'admin') LIMIT 1), ?)`
				)
				.run(classRow.center_id, classRow.id, studentAccountId, '20', paidLesson.lesson_date, classRow.center_id, now);
			database
				.prepare(
					`INSERT INTO financial_lesson_charges (
						center_id, class_id, lesson_id, student_account_id, lesson_date,
						applied_price, status, created_at, cancelled_at
					) VALUES (?, ?, ?, ?, ?, '20', 'active', ?, NULL)`
				)
				.run(classRow.center_id, classRow.id, paidLesson.id, studentAccountId, paidLesson.lesson_date, now);
		})();
	});
}

async function logout(page: Page): Promise<void> {
	await page.evaluate(async () => {
		await fetch('/auth/logout', { method: 'POST' });
	});
	await page.goto('/login');
}

async function sessionToken(page: Page): Promise<string> {
	const token = (await page.context().cookies()).find((cookie) => cookie.name === 'foundation_session')?.value;
	if (!token) throw new Error('The real login did not set foundation_session');
	return token;
}

function deleteSessions(tokens: string[]): void {
	if (tokens.length === 0) return;
	withDatabase((database) => {
		const statement = database.prepare('DELETE FROM sessions WHERE token = ?');
		for (const token of tokens) statement.run(token);
	});
}

test('real teacher payment is recorded and appears as paid on the student calendar', async ({ page }) => {
	test.skip(!adminPassword, 'E2E_ADMIN_PASSWORD is required for the real database payment test');
	const sessionTokens: string[] = [];

	try {
		await page.goto('/login');
		await page.getByLabel('Email').fill(adminEmail);
		await page.getByLabel('Пароль').fill(adminPassword!);
		await page.getByRole('button', { name: 'Войти' }).click();
		await expect(page).toHaveURL(/\/admin\/[^/]+$/);
		sessionTokens.push(await sessionToken(page));

	const centerId = new URL(page.url()).pathname.split('/').at(-1);
	if (!centerId) throw new Error('Admin center URL has no center id');
	const teacherAccountId = await ensureParticipant(page, 'teacher', teacherEmail, teacherPassword);
	const studentAccountId = await ensureParticipant(page, 'student', studentEmail, studentPassword);
	const classRow = readTestClass(studentAccountId);
	const lessons = readLessons(classRow.id);
	if (lessons.length < 2) throw new Error('Real E2E needs two active lessons to show paid and unpaid days');
	const paidLesson = lessons[0];
	const unpaidLesson = lessons[1];

	const teacherAssignment = page
		.locator('.class-card')
		.filter({ hasText: classRow.name })
		.locator('form[action="?/assignTeacher"] select[name="teacherAccountId"]');
	if (await teacherAssignment.count()) {
		await teacherAssignment.selectOption(teacherAccountId);
		await page.getByRole('button', { name: 'Назначить' }).click();
	}

	withDatabase((database) => {
		database
			.prepare(
				'INSERT OR IGNORE INTO class_students (center_id, class_id, student_account_id) VALUES (?, ?, ?)'
			)
			.run(classRow.center_id, classRow.id, studentAccountId);
	});
	seedFinancialFixture(classRow, studentAccountId, paidLesson);

		await logout(page);
		await page.getByLabel('Email').fill(teacherEmail);
		await page.getByLabel('Пароль').fill(teacherPassword);
		await page.getByRole('button', { name: 'Войти' }).click();
		await expect(page).toHaveURL(/\/$/);
		sessionTokens.push(await sessionToken(page));
		await page.goto(
		`/lesson-context?classId=${encodeURIComponent(classRow.id)}&lessonId=${encodeURIComponent(paidLesson.id)}&date=${encodeURIComponent(paidLesson.lesson_date)}`
		);

	const paymentForm = page.getByRole('form', { name: 'Оплата занятия' });
	await expect(paymentForm).toBeVisible();
	let paymentPostCount = 0;
	page.on('request', (request) => {
		if (request.method() === 'POST' && new URL(request.url()).pathname === '/lesson-context') {
			paymentPostCount += 1;
		}
	});
	await paymentForm.locator('select[name="studentAccountId"]').selectOption(studentAccountId);
	await paymentForm.locator('input[name="amount"]').fill('20');
	await paymentForm.locator('input[name="factualDate"]').fill(paidLesson.lesson_date);
	const confirmation = `e2e-payment-${Date.now()}`;
	await paymentForm.locator('input[name="confirmation"]').fill(confirmation);
	await paymentForm.getByRole('button', { name: 'Внести оплату' }).click();
	await expect(page.getByText('Оплата внесена.')).toBeVisible();
	await expect.poll(() => paymentPostCount).toBe(1);

	withDatabase((database) => {
		expect(
			database
				.prepare('SELECT COUNT(*) AS count FROM financial_payments WHERE class_id = ? AND student_account_id = ? AND status = \'recorded\'')
				.get(classRow.id, studentAccountId)
		).toEqual({ count: 1 });
		expect(
			database
				.prepare('SELECT COUNT(*) AS count FROM financial_payment_allocations WHERE lesson_id = ? AND student_account_id = ?')
				.get(paidLesson.id, studentAccountId)
		).toEqual({ count: 1 });
	});

		await logout(page);
		await page.getByLabel('Email').fill(studentEmail);
		await page.getByLabel('Пароль').fill(studentPassword);
		await page.getByRole('button', { name: 'Войти' }).click();
		await expect(page).toHaveURL(/\/$/);
		sessionTokens.push(await sessionToken(page));
		await page.goto(`/calendar?classId=${encodeURIComponent(classRow.id)}&date=${encodeURIComponent(paidLesson.lesson_date)}`);

	await expect(page.locator(`.day[data-payment-status="paid"]`).first()).toBeVisible();
	await expect(page.locator(`.day[data-payment-status="unpaid"]`).first()).toBeVisible();
	await expect(page.getByText('Оплачено', { exact: true })).toBeVisible();
	await expect(page.getByText('Не оплачено', { exact: true }).first()).toBeVisible();
	await expect(page.locator('.paid-lesson').first()).toBeVisible();
	await expect(page.locator('.unpaid-lesson').first()).toBeVisible();
	await expect(page.locator(`.lesson-link[data-lesson-id="${paidLesson.id}"]`)).toHaveAttribute(
		'data-lesson-id',
		paidLesson.id
	);
	await expect(page.locator(`.lesson-link[data-lesson-id="${unpaidLesson.id}"]`)).toHaveAttribute(
		'data-lesson-id',
		unpaidLesson.id
	);
		await logout(page);
	} finally {
		deleteSessions(sessionTokens);
	}
});
