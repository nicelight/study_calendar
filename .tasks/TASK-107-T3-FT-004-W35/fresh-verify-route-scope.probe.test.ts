import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const routeRoot = vi.hoisted(() => ({ current: undefined as any }));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../../src/lib/server/composition-root')>();
	return { ...actual, getCompositionRoot: () => routeRoot.current };
});

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { actions as lessonContextActions } from '../../src/routes/lesson-context/+page.server';

function editEvent({
	classId,
	lessonId,
	studentAccountId,
	commentId,
	body
}: {
	classId: string;
	lessonId: string;
	studentAccountId?: string;
	commentId: string;
	body: string;
}) {
	const url = new URL('https://fresh-verify.test/lesson-context');
	url.searchParams.set('classId', classId);
	url.searchParams.set('lessonId', lessonId);
	if (studentAccountId) url.searchParams.set('studentAccountId', studentAccountId);
	const formData = new FormData();
	formData.append('commentId', commentId);
	formData.append('body', body);
	return lessonContextActions.editFieldComment({
		url,
		request: new Request(url, { method: 'POST', body: formData }),
		cookies: {
			get: (name: string) => (name === 'foundation_session' ? 'session-fresh-verify' : undefined)
		}
	} as any);
}

function commentState(root: CompositionRoot, commentId: string) {
	return root.database.sqlite
		.prepare('SELECT body, last_changed_at FROM collaboration_comments WHERE id = ?')
		.get(commentId);
}

function fixture(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES
			('center-fresh-a', 'Fresh A'),
			('center-fresh-b', 'Fresh B');
		INSERT INTO accounts (id, role) VALUES
			('admin-fresh', 'admin'),
			('student-fresh-one', 'student'),
			('student-fresh-two', 'student');
		INSERT INTO sessions (token, account_id, revoked_at)
			VALUES ('session-fresh-verify', 'admin-fresh', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-fresh-a', 'admin-fresh'),
			('center-fresh-b', 'admin-fresh'),
			('center-fresh-a', 'student-fresh-one'),
			('center-fresh-a', 'student-fresh-two');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('class-fresh-a', 'center-fresh-a', 'Fresh A', 'group'),
			('class-fresh-b', 'center-fresh-b', 'Fresh B', 'group');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('center-fresh-a', 'class-fresh-a', 'student-fresh-one'),
			('center-fresh-a', 'class-fresh-a', 'student-fresh-two');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES
			('schedule-fresh-a', 'center-fresh-a', 'class-fresh-a', '2026-09-01', '2026-09-30', '[1]', 'admin-fresh', '2026-09-01T00:00:00.000Z'),
			('schedule-fresh-b', 'center-fresh-b', 'class-fresh-b', '2026-09-01', '2026-09-30', '[1]', 'admin-fresh', '2026-09-01T00:00:00.000Z');
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES
			('lesson-fresh-a-one', 'center-fresh-a', 'class-fresh-a', 'schedule-fresh-a', '2026-09-07', 'planned', 'admin-fresh', '2026-09-01T00:00:00.000Z'),
			('lesson-fresh-a-two', 'center-fresh-a', 'class-fresh-a', 'schedule-fresh-a', '2026-09-14', 'planned', 'admin-fresh', '2026-09-01T00:00:00.000Z'),
			('lesson-fresh-b-one', 'center-fresh-b', 'class-fresh-b', 'schedule-fresh-b', '2026-09-07', 'planned', 'admin-fresh', '2026-09-01T00:00:00.000Z');
	`);
	return root;
}

describe('TASK-107 fresh verifier-owned route scope proof', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = fixture();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it('denies forged lesson, class, and personal student targets before mutation', async () => {
		root.collaboration.createFieldComment({
			sessionToken: 'session-fresh-verify',
			classId: 'class-fresh-a',
			lessonId: 'lesson-fresh-a-two',
			scope: 'shared',
			fieldKey: 'topic',
			commentId: 'comment-fresh-lesson',
			body: 'lesson target before'
		});
		root.collaboration.createFieldComment({
			sessionToken: 'session-fresh-verify',
			classId: 'class-fresh-b',
			lessonId: 'lesson-fresh-b-one',
			scope: 'shared',
			fieldKey: 'topic',
			commentId: 'comment-fresh-class',
			body: 'class target before'
		});
		root.collaboration.createFieldComment({
			sessionToken: 'session-fresh-verify',
			classId: 'class-fresh-a',
			lessonId: 'lesson-fresh-a-one',
			scope: 'personal',
			studentAccountId: 'student-fresh-two',
			fieldKey: 'topic',
			commentId: 'comment-fresh-student',
			body: 'student target before'
		});

		const before = new Map([
			['comment-fresh-lesson', commentState(root, 'comment-fresh-lesson')],
			['comment-fresh-class', commentState(root, 'comment-fresh-class')],
			['comment-fresh-student', commentState(root, 'comment-fresh-student')]
		]);
		const results = await Promise.all([
			editEvent({
				classId: 'class-fresh-a',
				lessonId: 'lesson-fresh-a-one',
				commentId: 'comment-fresh-lesson',
				body: 'forged lesson edit'
			}),
			editEvent({
				classId: 'class-fresh-a',
				lessonId: 'lesson-fresh-a-one',
				commentId: 'comment-fresh-class',
				body: 'forged class edit'
			}),
			editEvent({
				classId: 'class-fresh-a',
				lessonId: 'lesson-fresh-a-one',
				studentAccountId: 'student-fresh-one',
				commentId: 'comment-fresh-student',
				body: 'forged student edit'
			})
		]);

		for (const result of results) {
			expect(result).toMatchObject({ status: 403, data: { error: 'comment_forbidden' } });
			expect(Object.keys((result as { data: Record<string, unknown> }).data)).toEqual(['error']);
			expect(JSON.stringify(result)).not.toMatch(/comment-fresh|target before/);
		}
		expect(commentState(root, 'comment-fresh-lesson')).toEqual(before.get('comment-fresh-lesson'));
		expect(commentState(root, 'comment-fresh-class')).toEqual(before.get('comment-fresh-class'));
		expect(commentState(root, 'comment-fresh-student')).toEqual(before.get('comment-fresh-student'));
	});

	it('preserves same-context shared and personal owner edits through Collaboration', async () => {
		root.collaboration.createFieldComment({
			sessionToken: 'session-fresh-verify',
			classId: 'class-fresh-a',
			lessonId: 'lesson-fresh-a-one',
			scope: 'shared',
			fieldKey: 'topic',
			commentId: 'comment-fresh-shared-owner',
			body: 'shared before'
		});
		root.collaboration.createFieldComment({
			sessionToken: 'session-fresh-verify',
			classId: 'class-fresh-a',
			lessonId: 'lesson-fresh-a-one',
			scope: 'personal',
			studentAccountId: 'student-fresh-two',
			fieldKey: 'topic',
			commentId: 'comment-fresh-personal-owner',
			body: 'personal before'
		});
		const editSpy = vi.spyOn(root.collaboration, 'editFieldComment');

		const sharedResult = await editEvent({
			classId: 'class-fresh-a',
			lessonId: 'lesson-fresh-a-one',
			commentId: 'comment-fresh-shared-owner',
			body: 'shared after'
		});
		const personalResult = await editEvent({
			classId: 'class-fresh-a',
			lessonId: 'lesson-fresh-a-one',
			studentAccountId: 'student-fresh-two',
			commentId: 'comment-fresh-personal-owner',
			body: 'personal after'
		});

		expect(sharedResult).toEqual({ collaborationSuccess: true });
		expect(personalResult).toEqual({ collaborationSuccess: true });
		expect(commentState(root, 'comment-fresh-shared-owner')?.body).toBe('shared after');
		expect(commentState(root, 'comment-fresh-personal-owner')?.body).toBe('personal after');
		expect(editSpy).toHaveBeenNthCalledWith(1, {
			sessionToken: 'session-fresh-verify',
			classId: 'class-fresh-a',
			lessonId: 'lesson-fresh-a-one',
			studentAccountId: undefined,
			commentId: 'comment-fresh-shared-owner',
			body: 'shared after'
		});
		expect(editSpy).toHaveBeenNthCalledWith(2, {
			sessionToken: 'session-fresh-verify',
			classId: 'class-fresh-a',
			lessonId: 'lesson-fresh-a-one',
			studentAccountId: 'student-fresh-two',
			commentId: 'comment-fresh-personal-owner',
			body: 'personal after'
		});
	});
});
