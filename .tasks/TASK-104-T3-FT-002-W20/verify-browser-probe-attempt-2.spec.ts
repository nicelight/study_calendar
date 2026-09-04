import Database from 'better-sqlite3';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { resolve, sep } from 'node:path';

const databaseFilename = process.env.DATABASE_URL;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5187';
const adminToken = 'task-104-admin-session';
const otherAdminToken = 'task-104-other-admin-session';
const teacherToken = 'task-104-teacher-session';

const stateTables = [
	'schedules',
	'lessons',
	'lesson_context_material',
	'learning_attendance',
	'financial_lesson_charges',
	'financial_payment_allocations'
] as const;

function disposableDatabase(): string {
	const tmpRoot = `${resolve(process.cwd(), 'tmp')}${sep}`;
	if (!databaseFilename || !resolve(databaseFilename).startsWith(tmpRoot)) {
		throw new Error('TASK-104 browser probe requires DATABASE_URL under tmp/');
	}
	return databaseFilename;
}

function seedDatabase(): void {
	const database = new Database(disposableDatabase());
	try {
		database.exec(`
			INSERT INTO centers (id, name) VALUES
				('task-104-center-own', 'Центр TASK-104'),
				('task-104-center-other', 'Другой центр');
			INSERT INTO accounts (id, role) VALUES
				('task-104-admin', 'admin'),
				('task-104-other-admin', 'admin'),
				('task-104-teacher', 'teacher'),
				('task-104-student', 'student');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('${adminToken}', 'task-104-admin', NULL),
				('${otherAdminToken}', 'task-104-other-admin', NULL),
				('${teacherToken}', 'task-104-teacher', NULL);
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('task-104-center-own', 'task-104-admin'),
				('task-104-center-own', 'task-104-teacher'),
				('task-104-center-own', 'task-104-student'),
				('task-104-center-other', 'task-104-other-admin');
			INSERT INTO classes (id, center_id, name, mode) VALUES
				('task-104-class-own', 'task-104-center-own', 'Класс TASK-104', 'group'),
				('task-104-class-own-other', 'task-104-center-own', 'Соседний класс', 'group'),
				('task-104-class-other', 'task-104-center-other', 'Чужой класс', 'group');
			INSERT INTO class_students (center_id, class_id, student_account_id)
				VALUES ('task-104-center-own', 'task-104-class-own', 'task-104-student');
			INSERT INTO schedules (id, center_id, class_id, start_date, end_date, weekdays, created_by_account_id, created_at) VALUES
				('task-104-schedule-own', 'task-104-center-own', 'task-104-class-own', '2026-10-01', '2026-10-31', '[1]', 'task-104-admin', '2026-10-01T00:00:00.000Z'),
				('task-104-schedule-own-other', 'task-104-center-own', 'task-104-class-own-other', '2026-10-01', '2026-10-31', '[1]', 'task-104-admin', '2026-10-01T00:00:00.000Z'),
				('task-104-schedule-other', 'task-104-center-other', 'task-104-class-other', '2026-10-01', '2026-10-31', '[1]', 'task-104-other-admin', '2026-10-01T00:00:00.000Z');
			INSERT INTO lessons (id, center_id, class_id, schedule_id, lesson_date, status, created_by_account_id, created_at) VALUES
				('task-104-lesson-target', 'task-104-center-own', 'task-104-class-own', 'task-104-schedule-own', '2026-10-05', 'planned', 'task-104-admin', '2026-10-01T00:00:00.000Z'),
				('task-104-lesson-sibling', 'task-104-center-own', 'task-104-class-own', 'task-104-schedule-own', '2026-10-06', 'planned', 'task-104-admin', '2026-10-01T00:00:00.000Z'),
				('task-104-lesson-completed', 'task-104-center-own', 'task-104-class-own', 'task-104-schedule-own', '2026-10-07', 'completed', 'task-104-admin', '2026-10-01T00:00:00.000Z'),
				('task-104-lesson-other', 'task-104-center-other', 'task-104-class-other', 'task-104-schedule-other', '2026-10-05', 'planned', 'task-104-other-admin', '2026-10-01T00:00:00.000Z');
			INSERT INTO lesson_context_material (lesson_id, center_id, class_id, topic, practical_work, homework, created_at, updated_at)
				VALUES ('task-104-lesson-target', 'task-104-center-own', 'task-104-class-own', 'Сохраняемый контекст', 'Практика', 'Домашняя работа', '2026-10-01T00:00:00.000Z', '2026-10-01T00:00:00.000Z');
			INSERT INTO learning_attendance (center_id, class_id, lesson_id, student_account_id, attendance, recorded_by_account_id, recorded_at)
				VALUES ('task-104-center-own', 'task-104-class-own', 'task-104-lesson-target', 'task-104-student', 'present', 'task-104-admin', '2026-10-05T12:00:00.000Z');
			INSERT INTO financial_lesson_charges (center_id, class_id, lesson_id, student_account_id, lesson_date, applied_price, status, created_at, cancelled_at)
				VALUES ('task-104-center-own', 'task-104-class-own', 'task-104-lesson-target', 'task-104-student', '2026-10-05', '100', 'active', '2026-10-05T00:00:00.000Z', NULL);
		`);
	} finally {
		database.close();
	}
}

function snapshot(): string {
	const database = new Database(disposableDatabase(), { readonly: true });
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

function rows(table: string): Record<string, unknown>[] {
	const database = new Database(disposableDatabase(), { readonly: true });
	try {
		return database.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all() as Record<string, unknown>[];
	} finally {
		database.close();
	}
}

async function setSession(page: Page, token?: string): Promise<void> {
	await page.context().clearCookies();
	if (token) {
		await page.context().addCookies([
			{ name: 'foundation_session', value: token, url: baseURL, httpOnly: true, sameSite: 'Lax' }
		]);
	}
}

async function postAction(
	request: APIRequestContext,
	centerId: string,
	action: string,
	token: string | undefined,
	form: Record<string, string>
) {
	return request.post(`/admin/${centerId}?/${action}`, {
		headers: {
			accept: 'application/json',
			'x-sveltekit-action': 'true',
			...(token ? { cookie: `foundation_session=${token}` } : {})
		},
		form,
		maxRedirects: 0
	});
}

test('protected Admin single-lesson browser flow preserves scope, identity, and state', async ({ page, request }) => {
	seedDatabase();
	const initialState = snapshot();

	await setSession(page, adminToken);
	const dashboard = await page.goto('/admin/task-104-center-own');
	expect(dashboard?.status()).toBe(200);
	const targetCard = page.locator('article.class-card').filter({ hasText: 'Класс TASK-104' });
	await expect(targetCard).toContainText('Отдельные уроки');
	await expect(targetCard.locator('li.lesson-row')).toHaveCount(3);
	await expect(targetCard.locator('li.lesson-row').filter({ hasText: '05.10.2026' })).toHaveCount(1);
	await expect(targetCard.locator('form[action="?/addLesson"]')).toHaveCount(1);
	await expect(targetCard.locator('form[action="?/transferLesson"]')).toHaveCount(2);
	await expect(targetCard.locator('form[action="?/cancelLesson"]')).toHaveCount(2);

	const addForm = targetCard.locator('form[action="?/addLesson"]');
	await addForm.locator('select[name="scheduleId"]').selectOption('task-104-schedule-own');
	await addForm.locator('input[name="lessonDate"]').fill('2026-10-08');
	await addForm.getByRole('button', { name: 'Добавить урок' }).click();
	await expect(page.getByText('Отдельный урок добавлен.')).toBeVisible();
	const afterBrowserAdd = rows('lessons');
	const addedRows = afterBrowserAdd.filter((row) => row.lesson_date === '2026-10-08');
	expect(addedRows).toHaveLength(1);
	expect(addedRows[0].id).not.toBe('browser-chosen-id');
	expect(addedRows[0]).toMatchObject({
		class_id: 'task-104-class-own',
		schedule_id: 'task-104-schedule-own',
		status: 'planned'
	});

	const transferForm = targetCard.locator(
		'form[action="?/transferLesson"]:has(input[name="lessonId"][value="task-104-lesson-target"])'
	);
	await transferForm.locator('input[name="lessonDate"]').fill('2026-10-09');
	await transferForm.getByRole('button', { name: 'Перенести' }).click();
	await expect(page.getByText('Урок перенесён.')).toBeVisible();
	const transferred = rows('lessons').find((row) => row.id === 'task-104-lesson-target');
	expect(transferred).toMatchObject({
		id: 'task-104-lesson-target',
		class_id: 'task-104-class-own',
		schedule_id: 'task-104-schedule-own',
		lesson_date: '2026-10-09',
		status: 'planned'
	});
	expect(rows('lesson_context_material')).toHaveLength(1);
	expect(rows('learning_attendance')).toHaveLength(1);
	expect(rows('financial_lesson_charges')).toEqual([
		expect.objectContaining({ lesson_id: 'task-104-lesson-target', lesson_date: '2026-10-05', status: 'active' })
	]);

	const siblingBeforeCancel = rows('lessons').find((row) => row.id === 'task-104-lesson-sibling');
	const siblingCancelForm = targetCard.locator(
		'form[action="?/cancelLesson"]:has(input[name="lessonId"][value="task-104-lesson-sibling"])'
	);
	await siblingCancelForm.getByRole('button', { name: 'Отменить' }).click();
	await expect(page.getByText('Урок отменён.')).toBeVisible();
	const siblingAfterCancel = rows('lessons').find((row) => row.id === 'task-104-lesson-sibling');
	expect(siblingAfterCancel).toMatchObject({
		id: siblingBeforeCancel?.id,
		lesson_date: siblingBeforeCancel?.lesson_date,
		status: 'cancelled'
	});

	const deniedCases: Array<[string, string, string | undefined, Record<string, string>, number, string]> = [
		['unauthenticated', 'task-104-center-own', 'addLesson', undefined, 401, 'unauthorized'],
		['non-admin', 'task-104-center-own', 'transferLesson', teacherToken, 403, 'forbidden'],
		['cross-center route', 'task-104-center-other', 'addLesson', adminToken, 403, 'forbidden'],
		['forged class', 'task-104-center-own', 'addLesson', adminToken, 403, 'forbidden'],
		['mismatched schedule', 'task-104-center-own', 'addLesson', adminToken, 403, 'forbidden'],
		['forged lesson', 'task-104-center-own', 'cancelLesson', adminToken, 403, 'forbidden'],
		['invalid date', 'task-104-center-own', 'addLesson', adminToken, 400, 'invalid_schedule'],
		['completed cancel', 'task-104-center-own', 'cancelLesson', adminToken, 500, 'operation_failed']
	];
	const forms = [
		{ classId: 'task-104-class-own', scheduleId: 'task-104-schedule-own', lessonDate: '2026-10-11' },
		{ classId: 'task-104-class-own', lessonId: 'task-104-lesson-target', lessonDate: '2026-10-12' },
		{ classId: 'task-104-class-other', scheduleId: 'task-104-schedule-other', lessonDate: '2026-10-13' },
		{ classId: 'task-104-class-other', scheduleId: 'task-104-schedule-other', lessonDate: '2026-10-14' },
		{ classId: 'task-104-class-own', scheduleId: 'task-104-schedule-own-other', lessonDate: '2026-10-15' },
		{ classId: 'task-104-class-own', lessonId: 'forged-lesson' },
		{ classId: 'task-104-class-own', scheduleId: 'task-104-schedule-own', lessonDate: 'not-a-date' },
		{ classId: 'task-104-class-own', lessonId: 'task-104-lesson-completed' }
	];
	const actions = ['addLesson', 'transferLesson', 'addLesson', 'addLesson', 'addLesson', 'cancelLesson', 'addLesson', 'cancelLesson'];
	for (let index = 0; index < deniedCases.length; index += 1) {
		const [label, centerId, action, token, status, error] = deniedCases[index];
		const beforeDenied = snapshot();
		const response = await postAction(request, centerId, action, token, forms[index]);
		const responseBody = await response.text();
		// SvelteKit encodes fail(status, data) in a 200 response for the JSON action protocol.
		expect(response.status(), label).toBe(200);
		expect(responseBody, label).toContain(`"status":${status}`);
		expect(responseBody, label).toContain(error);
		expect(snapshot(), `${label} must preserve complete scheduling state`).toBe(beforeDenied);
	}

	const injectedIdentity = await postAction(request, 'task-104-center-own', 'addLesson', adminToken, {
		classId: 'task-104-class-own',
		scheduleId: 'task-104-schedule-own',
		lessonDate: '2026-10-16',
		lessonId: 'browser-chosen-id'
	});
	expect(injectedIdentity.status()).toBe(200);
	const injectedRow = rows('lessons').find((row) => row.lesson_date === '2026-10-16');
	expect(injectedRow?.id).toBeTruthy();
	expect(injectedRow?.id).not.toBe('browser-chosen-id');

	await setSession(page);
	const anonymous = await page.goto('/admin/task-104-center-own');
	expect(anonymous?.status()).toBe(200);
	await expect(page).toHaveURL(/\/login$/);
	await expect(page.locator('form[action="?/addLesson"]')).toHaveCount(0);

	const finalState = snapshot();
	expect(finalState).not.toBe(initialState);
});
