import { relative, resolve } from 'node:path';
import Database from 'better-sqlite3';
import { expect, test, type Page } from '@playwright/test';

const databaseFilename = process.env.DATABASE_URL;
const projectRoot = resolve(process.cwd());
const centerId = 'center-e2e-102';
const otherCenterId = 'center-other-e2e-102';
const classId = 'class-e2e-102';
const otherClassId = 'class-other-e2e-102';
const lessonId = 'lesson-e2e-102';
const otherLessonId = 'lesson-other-e2e-102';
const adminSession = 'session-admin-e2e-102';
const studentSession = 'session-student-e2e-102';
const studentId = 'student-e2e-102';

if (!databaseFilename || !relative(projectRoot, resolve(databaseFilename)).startsWith('tmp/')) {
	throw new Error('TASK-102 disposable E2E requires DATABASE_URL under tmp/');
}

function withDatabase<T>(callback: (database: Database.Database) => T): T {
	const database = new Database(databaseFilename!);
	try {
		return callback(database);
	} finally {
		database.close();
	}
}

function seedFixture(): void {
	withDatabase((database) => {
		database.pragma('foreign_keys = ON');
		database.transaction(() => {
			database.exec(`
				INSERT INTO centers (id, name) VALUES
					('${centerId}', 'Disposable Collaboration Center'),
					('${otherCenterId}', 'Other Collaboration Center');
				INSERT INTO accounts (id, role) VALUES
					('admin-e2e-102', 'admin'),
					('student-e2e-102', 'student'),
					('admin-other-e2e-102', 'admin');
				INSERT INTO account_profiles (account_id, full_name, registered_at) VALUES
					('admin-e2e-102', 'Admin TASK-102', '2026-01-01T00:00:00.000Z'),
					('student-e2e-102', 'Student TASK-102', '2026-01-01T00:00:00.000Z'),
					('admin-other-e2e-102', 'Other Admin TASK-102', '2026-01-01T00:00:00.000Z');
				INSERT INTO sessions (token, account_id, revoked_at) VALUES
					('${adminSession}', 'admin-e2e-102', NULL),
					('${studentSession}', '${studentId}', NULL),
					('session-admin-other-e2e-102', 'admin-other-e2e-102', NULL);
				INSERT INTO center_memberships (center_id, account_id) VALUES
					('${centerId}', 'admin-e2e-102'),
					('${centerId}', '${studentId}'),
					('${otherCenterId}', 'admin-other-e2e-102');
				INSERT INTO classes (id, center_id, name, mode) VALUES
					('${classId}', '${centerId}', 'Disposable Collaboration Class', 'group'),
					('${otherClassId}', '${otherCenterId}', 'Other Collaboration Class', 'group');
				INSERT INTO class_students (center_id, class_id, student_account_id)
					VALUES ('${centerId}', '${classId}', '${studentId}');
				INSERT INTO schedules (
					id, center_id, class_id, start_date, end_date, weekdays,
					created_by_account_id, created_at
				) VALUES
					('schedule-e2e-102', '${centerId}', '${classId}', '2026-09-01', '2026-09-30', '[1]', 'admin-e2e-102', '2026-09-01T00:00:00.000Z'),
					('schedule-other-e2e-102', '${otherCenterId}', '${otherClassId}', '2026-09-01', '2026-09-30', '[1]', 'admin-other-e2e-102', '2026-09-01T00:00:00.000Z');
				INSERT INTO lessons (
					id, center_id, class_id, schedule_id, lesson_date, status,
					created_by_account_id, created_at
				) VALUES
					('${lessonId}', '${centerId}', '${classId}', 'schedule-e2e-102', '2026-09-07', 'planned', 'admin-e2e-102', '2026-09-01T00:00:00.000Z'),
					('${otherLessonId}', '${otherCenterId}', '${otherClassId}', 'schedule-other-e2e-102', '2026-09-07', 'planned', 'admin-other-e2e-102', '2026-09-01T00:00:00.000Z');
				INSERT INTO lesson_context_material (
					lesson_id, center_id, class_id, topic, practical_work, homework,
					created_at, updated_at
				) VALUES (
					'${lessonId}', '${centerId}', '${classId}', 'Transport topic',
					'Transport practice', 'Transport homework',
					'2026-09-01T00:00:00.000Z', '2026-09-01T00:00:00.000Z'
				);
			`);
		})();
	});
}

function lessonUrl(classValue = classId, lessonValue = lessonId, studentAccountId?: string): string {
	const params = new URLSearchParams({ classId: classValue, lessonId: lessonValue });
	if (studentAccountId) params.set('studentAccountId', studentAccountId);
	return `/lesson-context?${params.toString()}`;
}

function collaborationState(): { comments: number; reactions: number; messages: number } {
	return withDatabase((database) => database.prepare(`
		SELECT
			(SELECT COUNT(*) FROM collaboration_comments) AS comments,
			(SELECT COUNT(*) FROM collaboration_reactions) AS reactions,
			(SELECT COUNT(*) FROM collaboration_messages) AS messages
	`).get() as { comments: number; reactions: number; messages: number });
}

function revokeSession(sessionToken: string): void {
	withDatabase((database) => {
		database.prepare('UPDATE sessions SET revoked_at = ? WHERE token = ?')
			.run('2026-09-07T00:00:00.000Z', sessionToken);
	});
}

async function useSession(page: Page, sessionToken: string): Promise<void> {
	await page.context().clearCookies();
	await page.context().addCookies([{
		name: 'foundation_session',
		value: sessionToken,
		domain: '127.0.0.1',
		path: '/'
	}]);
}

async function submit(page: Page, action: string, fields: Record<string, string>): Promise<void> {
	const response = await page.request.post(`${lessonUrl()}&/${action}`, { form: fields });
	expect(response.status()).toBe(200);
}

test('disposable browser transport reaches named actions and preserves denied state', async ({ page }) => {
	seedFixture();
	await useSession(page, adminSession);

	const sharedResponse = await page.goto(lessonUrl());
	expect(sharedResponse?.status()).toBe(200);
	for (const [action, count] of Object.entries({
		saveAttendance: 0,
		createHomework: 1,
		completeHomework: 0,
		recordGrade: 0,
		setSharedLessonMaterial: 1,
		createPayment: 1
	})) {
		await expect(page.locator(`form[action*="/${action}"]`)).toHaveCount(count);
	}
	await expect(page.locator('input[name="action"]')).toHaveCount(0);
	await page.locator('form[action*="/createHomework"]').getByRole('button', { name: 'Создать домашнее задание' }).click();
	await expect(page.getByText('Изменение домашнего задания сохранено.')).toBeVisible();
	await page.reload();
	expect(page.url()).toContain(`classId=${classId}`);
	expect(page.url()).toContain(`lessonId=${lessonId}`);

	await submit(page, 'createFieldComment', {
		scope: 'shared',
		fieldKey: 'topic',
		commentId: 'comment-browser-e2e-102',
		body: 'Browser field note'
	});
	await submit(page, 'createMessage', {
		scope: 'shared',
		messageId: 'message-browser-e2e-102',
		body: 'Browser root message'
	});
	await submit(page, 'replyToMessage', {
		scope: 'shared',
		parentMessageId: 'message-browser-e2e-102',
		messageId: 'reply-browser-e2e-102',
		body: 'Browser reply'
	});
	await submit(page, 'setReaction', {
		scope: 'shared',
		targetType: 'field',
		targetId: 'topic',
		reaction: 'like'
	});

	await useSession(page, studentSession);
	const personalResponse = await page.goto(lessonUrl(classId, lessonId, studentId));
	expect(personalResponse?.status()).toBe(200);
	const personalCompletionForm = page.locator('form[action*="/completeHomework"]');
	await expect(personalCompletionForm).toHaveCount(1);
	await personalCompletionForm.getByRole('button', { name: 'Отметить выполненным' }).click();
	await expect(page.getByText('Изменение домашнего задания сохранено.')).toBeVisible();
	expect(page.url()).toContain(`studentAccountId=${studentId}`);
	const beforeDenied = collaborationState();
	await page.context().clearCookies();
	const noCookieResponse = await page.goto(lessonUrl());
	expect(noCookieResponse?.status()).toBe(403);
	await useSession(page, 'invalid-session-e2e-102');
	const invalidSessionResponse = await page.goto(lessonUrl());
	expect(invalidSessionResponse?.status()).toBe(403);
	revokeSession(studentSession);
	await useSession(page, studentSession);
	const revokedSessionResponse = await page.goto(lessonUrl(classId, lessonId, studentId));
	expect(revokedSessionResponse?.status()).toBe(403);
	await useSession(page, 'session-admin-other-e2e-102');
	const crossCenterResponse = await page.goto(lessonUrl());
	expect(crossCenterResponse?.status()).toBe(403);
	const deniedAction = await page.request.post(`${lessonUrl(classId, lessonId)}&/createMessage`, {
		form: {
			scope: 'personal',
			studentAccountId: studentId,
			messageId: 'forged-browser-e2e-102',
			body: 'Should be denied'
		}
	});
	expect(deniedAction.status()).toBe(200);
	expect(await deniedAction.text()).toContain('message_forbidden');
	expect(collaborationState()).toEqual(beforeDenied);
});
