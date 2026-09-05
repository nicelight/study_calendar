import { relative, resolve } from 'node:path';
import Database from 'better-sqlite3';
import { expect, test, type Locator, type Page } from '@playwright/test';

const databaseFilename = process.env.DATABASE_URL;
const projectRoot = resolve(process.cwd());
const centerId = 'center-ui-103';
const otherCenterId = 'center-other-ui-103';
const classId = 'class-ui-103';
const otherClassId = 'class-other-ui-103';
const otherCenterClassId = 'class-other-center-ui-103';
const lessonId = 'lesson-ui-103';
const otherLessonId = 'lesson-other-ui-103';
const otherCenterLessonId = 'lesson-other-center-ui-103';
const adminAccountId = 'admin-ui-103';
const teacherAccountId = 'teacher-ui-103';
const unassignedTeacherAccountId = 'teacher-unassigned-ui-103';
const studentOneId = 'student-one-ui-103';
const studentTwoId = 'student-two-ui-103';
const parentAccountId = 'parent-ui-103';
const otherAdminAccountId = 'admin-other-ui-103';
const adminSession = 'session-admin-ui-103';
const teacherSession = 'session-teacher-ui-103';
const unassignedTeacherSession = 'session-teacher-unassigned-ui-103';
const studentSession = 'session-student-one-ui-103';
const parentSession = 'session-parent-ui-103';
const otherAdminSession = 'session-admin-other-ui-103';

if (!databaseFilename || !relative(projectRoot, resolve(databaseFilename)).startsWith('tmp/')) {
	throw new Error('TASK-103 disposable E2E requires DATABASE_URL under tmp/');
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
					('${centerId}', 'Disposable UI Center'),
					('${otherCenterId}', 'Other UI Center');
				INSERT INTO accounts (id, role) VALUES
					('${adminAccountId}', 'admin'),
					('${teacherAccountId}', 'teacher'),
					('${unassignedTeacherAccountId}', 'teacher'),
					('${studentOneId}', 'student'),
					('${studentTwoId}', 'student'),
					('${parentAccountId}', 'parent'),
					('${otherAdminAccountId}', 'admin');
				INSERT INTO account_profiles (account_id, full_name, registered_at) VALUES
					('${adminAccountId}', 'Admin UI', '2026-01-01T00:00:00.000Z'),
					('${teacherAccountId}', 'Teacher UI', '2026-01-01T00:00:00.000Z'),
					('${unassignedTeacherAccountId}', 'Unassigned Teacher UI', '2026-01-01T00:00:00.000Z'),
					('${studentOneId}', 'Student One UI', '2026-01-01T00:00:00.000Z'),
					('${studentTwoId}', 'Student Two UI', '2026-01-01T00:00:00.000Z'),
					('${parentAccountId}', 'Parent UI', '2026-01-01T00:00:00.000Z'),
					('${otherAdminAccountId}', 'Other Admin UI', '2026-01-01T00:00:00.000Z');
				INSERT INTO sessions (token, account_id, revoked_at) VALUES
					('${adminSession}', '${adminAccountId}', NULL),
					('${teacherSession}', '${teacherAccountId}', NULL),
					('${unassignedTeacherSession}', '${unassignedTeacherAccountId}', NULL),
					('${studentSession}', '${studentOneId}', NULL),
					('${parentSession}', '${parentAccountId}', NULL),
					('${otherAdminSession}', '${otherAdminAccountId}', NULL);
				INSERT INTO center_memberships (center_id, account_id) VALUES
					('${centerId}', '${adminAccountId}'),
					('${centerId}', '${teacherAccountId}'),
					('${centerId}', '${unassignedTeacherAccountId}'),
					('${centerId}', '${studentOneId}'),
					('${centerId}', '${studentTwoId}'),
					('${centerId}', '${parentAccountId}'),
					('${otherCenterId}', '${otherAdminAccountId}');
				INSERT INTO classes (id, center_id, name, mode) VALUES
					('${classId}', '${centerId}', 'Disposable UI Class', 'group'),
					('${otherClassId}', '${centerId}', 'Other UI Class', 'group'),
					('${otherCenterClassId}', '${otherCenterId}', 'Other Center UI Class', 'group');
				INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
					('${centerId}', '${classId}', '${studentOneId}'),
					('${centerId}', '${classId}', '${studentTwoId}'),
					('${centerId}', '${otherClassId}', '${studentTwoId}');
				INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
					VALUES ('${centerId}', '${classId}', '${teacherAccountId}');
				INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id)
					VALUES ('${centerId}', '${parentAccountId}', '${studentOneId}');
				INSERT INTO schedules (
					id, center_id, class_id, start_date, end_date, weekdays,
					created_by_account_id, created_at
				) VALUES
					('schedule-ui-103', '${centerId}', '${classId}', '2026-09-01', '2026-09-30', '[1]', '${adminAccountId}', '2026-09-01T00:00:00.000Z'),
					('schedule-other-ui-103', '${centerId}', '${otherClassId}', '2026-09-01', '2026-09-30', '[1]', '${adminAccountId}', '2026-09-01T00:00:00.000Z'),
					('schedule-other-center-ui-103', '${otherCenterId}', '${otherCenterClassId}', '2026-09-01', '2026-09-30', '[1]', '${otherAdminAccountId}', '2026-09-01T00:00:00.000Z');
				INSERT INTO lessons (
					id, center_id, class_id, schedule_id, lesson_date, status,
					created_by_account_id, created_at
				) VALUES
					('${lessonId}', '${centerId}', '${classId}', 'schedule-ui-103', '2026-09-07', 'planned', '${adminAccountId}', '2026-09-01T00:00:00.000Z'),
					('${otherLessonId}', '${centerId}', '${otherClassId}', 'schedule-other-ui-103', '2026-09-07', 'planned', '${adminAccountId}', '2026-09-01T00:00:00.000Z'),
					('${otherCenterLessonId}', '${otherCenterId}', '${otherCenterClassId}', 'schedule-other-center-ui-103', '2026-09-07', 'planned', '${otherAdminAccountId}', '2026-09-01T00:00:00.000Z');
				INSERT INTO lesson_context_material (
					lesson_id, center_id, class_id, topic, practical_work, homework,
					created_at, updated_at
				) VALUES (
					'${lessonId}', '${centerId}', '${classId}', 'UI topic',
					'UI practical work', 'UI homework',
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

async function useSession(page: Page, sessionToken: string): Promise<void> {
	await page.context().clearCookies();
	await page.context().addCookies([{
		name: 'foundation_session',
		value: sessionToken,
		domain: '127.0.0.1',
		path: '/'
	}]);
}

function fieldCommentForm(page: Page, fieldKey: string): Locator {
	return page.locator(`article[data-field-key="${fieldKey}"] form.comment-create`);
}

function fieldReactionForm(page: Page, fieldKey: string): Locator {
	return page.locator('form.reaction-form').filter({
		has: page.locator('input[name="targetType"][value="field"]')
	}).filter({
		has: page.locator(`input[name="targetId"][value="${fieldKey}"]`)
	}).first();
}

function messageByBody(page: Page, body: string): Locator {
	return page.locator('article.message').filter({ has: page.locator('p', { hasText: body }) }).first();
}

async function createReply(page: Page, parent: Locator, body: string): Promise<void> {
	await parent.locator('form.reply-form').getByRole('textbox').fill(body);
	await parent.locator('form.reply-form').getByRole('button', { name: 'Ответить' }).click();
	await expect(page.getByText(body, { exact: true })).toBeVisible();
}

async function reactTo(form: Locator, reaction: string): Promise<void> {
	await form.locator('select[name="reaction"]').selectOption(reaction);
	await form.getByRole('button', { name: 'React' }).click();
}

test('TASK-103 collaboration UI is usable, URL-backed, nested, and privacy-bound', async ({ page }) => {
	await page.goto('/');
	seedFixture();
	try {
		await useSession(page, adminSession);
		const sharedResponse = await page.goto(lessonUrl());
		expect(sharedResponse?.status()).toBe(200);
		await page.waitForTimeout(1000);
		await expect(page.locator('section.collaboration')).toBeVisible();
		await expect(page.locator('article.field-card')).toHaveCount(3);
		await expect(page.locator('form.reaction-form')).toHaveCount(3);

		for (const [fieldKey, body] of [
			['topic', 'Topic note UI'],
			['practicalWork', 'Practical note UI'],
			['homework', 'Homework note UI']
		] as const) {
			const form = fieldCommentForm(page, fieldKey);
			await form.locator('input[name="body"]').fill(body);
			await form.getByRole('button', { name: 'Добавить' }).click();
			await expect(page.getByText(body, { exact: true })).toBeVisible();
		}

		const topicComment = page.locator('[data-comment-id]').filter({ hasText: 'Topic note UI' }).first();
		await topicComment.locator('form.inline-form input[name="body"]').fill('Topic note UI edited');
		await topicComment.locator('form.inline-form').getByRole('button', { name: 'Изменить' }).click();
		await expect(page.getByText('Topic note UI edited', { exact: true })).toBeVisible();

		await reactTo(fieldReactionForm(page, 'topic'), 'like');
		await expect(page.locator('article[data-field-key="topic"] [data-reaction-participants]')).toContainText('Admin UI');
		await reactTo(topicComment.locator('form.reaction-form'), 'celebrate');
		await expect(page.locator('[data-comment-id]').filter({ hasText: 'Topic note UI edited' }).locator('[data-reaction-participants]')).toContainText('Admin UI');

		await page.locator('form.message-create textarea[name="body"]').fill('Root message UI');
		await page.locator('form.message-create').getByRole('button', { name: 'Опубликовать' }).click();
		await expect(page.getByText('Root message UI', { exact: true })).toBeVisible();
		const rootMessage = messageByBody(page, 'Root message UI');
		const rootMessageId = await rootMessage.getAttribute('data-message-id');
		expect(rootMessageId).toBeTruthy();
		await createReply(page, rootMessage, 'Reply depth 1 UI');
		const replyOne = page.locator('[data-message-depth="1"]').filter({ hasText: 'Reply depth 1 UI' }).first();
		await createReply(page, replyOne, 'Reply depth 2 UI');
		await expect(page.locator('[data-message-depth="2"]').filter({ hasText: 'Reply depth 2 UI' })).toBeVisible();
		await reactTo(messageByBody(page, 'Root message UI').locator('form.reaction-form').first(), 'question');
		await expect(messageByBody(page, 'Root message UI').locator('[data-reaction-participants]')).toContainText('Admin UI');

		const branchLink = page.locator(`a[data-branch-id="${rootMessageId}"]`);
		await expect(branchLink).toBeVisible();
		await branchLink.click();
		await page.waitForURL(/branchRootId=/);
		expect(new URL(page.url()).searchParams.get('branchRootId')).toBe(rootMessageId);
		await expect(page.locator(`section[data-selected-branch="${rootMessageId}"]`)).toBeVisible();
		await expect(page.locator(`section[data-selected-branch="${rootMessageId}"] [data-message-depth="2"]`)).toContainText('Reply depth 2 UI');
		await page.reload();
		expect(new URL(page.url()).searchParams.get('branchRootId')).toBe(rootMessageId);
		await expect(page.locator(`section[data-selected-branch="${rootMessageId}"]`)).toBeVisible();

		await page.goto(lessonUrl());
		for (let index = 1; index <= 11; index += 1) {
			const rootBody = `Branch root ${index} UI`;
			await page.locator('form.message-create textarea[name="body"]').fill(rootBody);
			await page.locator('form.message-create').getByRole('button', { name: 'Опубликовать' }).click();
			const branchRoot = messageByBody(page, rootBody);
			await createReply(page, branchRoot, `Branch reply ${index} UI`);
		}
		await expect(page.locator('[data-branch-id]')).toHaveCount(10);
		await expect(page.locator(`a[data-branch-id="${rootMessageId}"]`)).toHaveCount(0);
		await expect(page.getByText('Root message UI', { exact: true })).toBeVisible();

		await useSession(page, studentSession);
		const studentSharedResponse = await page.goto(lessonUrl());
		expect(studentSharedResponse?.status()).toBe(200);
		await expect(page.getByText('Root message UI', { exact: true })).toBeVisible();
		await expect(page.getByText('Personal note UI', { exact: true })).toHaveCount(0);

		const personalResponse = await page.goto(lessonUrl(classId, lessonId, studentOneId));
		expect(personalResponse?.status()).toBe(200);
		const personalCommentForm = fieldCommentForm(page, 'topic');
		await personalCommentForm.locator('input[name="body"]').fill('Personal note UI');
		await personalCommentForm.getByRole('button', { name: 'Добавить' }).click();
		await expect(page.getByText('Personal note UI', { exact: true })).toBeVisible();
		await page.locator('form.message-create textarea[name="body"]').fill('Personal message UI');
		await page.locator('form.message-create').getByRole('button', { name: 'Опубликовать' }).click();
		await expect(page.getByText('Personal message UI', { exact: true })).toBeVisible();

		await useSession(page, parentSession);
		const parentResponse = await page.goto(lessonUrl(classId, lessonId, studentOneId));
		expect(parentResponse?.status()).toBe(200);
		await expect(page.getByText('Personal note UI', { exact: true })).toBeVisible();
		await expect(page.getByText('Personal message UI', { exact: true })).toBeVisible();
		await expect(page.getByText('Root message UI', { exact: true })).toHaveCount(0);

		await useSession(page, teacherSession);
		const teacherResponse = await page.goto(lessonUrl());
		expect(teacherResponse?.status()).toBe(200);
		const stateBeforeForbiddenEdit = collaborationState();
		const teacherComment = page.locator('[data-comment-id]').filter({ hasText: 'Topic note UI edited' }).first();
		await teacherComment.locator('form.inline-form input[name="body"]').fill('Teacher must not edit');
		await teacherComment.locator('form.inline-form').getByRole('button', { name: 'Изменить' }).click();
		await expect(page.getByRole('alert').filter({ hasText: 'Комментарий недоступен' })).toBeVisible();
		expect(collaborationState()).toEqual(stateBeforeForbiddenEdit);

		await useSession(page, unassignedTeacherSession);
		expect((await page.goto(lessonUrl()))?.status()).toBe(403);
		await useSession(page, studentSession);
		expect((await page.goto(lessonUrl(classId, lessonId, studentTwoId)))?.status()).toBe(403);
		expect((await page.goto(lessonUrl(otherClassId, otherLessonId)))?.status()).toBe(403);
		await useSession(page, otherAdminSession);
		expect((await page.goto(lessonUrl()))?.status()).toBe(403);
		await page.context().clearCookies();
		expect((await page.goto(lessonUrl()))?.status()).toBe(403);
		expect(collaborationState()).toEqual({ comments: 4, reactions: 3, messages: 26 });
	} finally {
		await page.context().clearCookies();
	}
});
