import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const routeRoot = vi.hoisted(() => ({ current: undefined as any }));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../../src/lib/server/composition-root')>();
	return { ...actual, getCompositionRoot: () => routeRoot.current };
});

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { actions as lessonContextActions } from '../../src/routes/lesson-context/+page.server';

function actionEvent(
	sessionToken: string,
	classId: string,
	lessonId: string,
	studentAccountId: string | undefined,
	commentId: string,
	body: string
) {
	const url = new URL('https://fresh-red-verify.test/lesson-context');
	url.searchParams.set('classId', classId);
	url.searchParams.set('lessonId', lessonId);
	if (studentAccountId) url.searchParams.set('studentAccountId', studentAccountId);
	const formData = new FormData();
	formData.append('commentId', commentId);
	formData.append('body', body);
	return {
		url,
		request: new Request(url, { method: 'POST', body: formData }),
		cookies: { get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined) }
	} as any;
}

function stateOf(root: CompositionRoot, commentId: string) {
	return root.database.sqlite
		.prepare('SELECT body, last_changed_at FROM collaboration_comments WHERE id = ?')
		.get(commentId);
}

function fixture(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES
			('center-red-a', 'Red A'), ('center-red-b', 'Red B');
		INSERT INTO accounts (id, role) VALUES
			('admin-red-owner', 'admin'), ('admin-red-other', 'admin'),
			('student-red-one', 'student'), ('student-red-two', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-red-owner', 'admin-red-owner', NULL),
			('session-red-other', 'admin-red-other', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-red-a', 'admin-red-owner'), ('center-red-a', 'admin-red-other'),
			('center-red-a', 'student-red-one'), ('center-red-a', 'student-red-two'),
			('center-red-b', 'admin-red-owner');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('class-red-a', 'center-red-a', 'Red A', 'group'),
			('class-red-b', 'center-red-b', 'Red B', 'group');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('center-red-a', 'class-red-a', 'student-red-one'),
			('center-red-a', 'class-red-a', 'student-red-two');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES
			('schedule-red-a', 'center-red-a', 'class-red-a', '2026-09-01', '2026-09-30', '[1]', 'admin-red-owner', '2026-09-01T00:00:00.000Z'),
			('schedule-red-b', 'center-red-b', 'class-red-b', '2026-09-01', '2026-09-30', '[1]', 'admin-red-owner', '2026-09-01T00:00:00.000Z');
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES
			('lesson-red-a-one', 'center-red-a', 'class-red-a', 'schedule-red-a', '2026-09-07', 'planned', 'admin-red-owner', '2026-09-01T00:00:00.000Z'),
			('lesson-red-a-two', 'center-red-a', 'class-red-a', 'schedule-red-a', '2026-09-14', 'planned', 'admin-red-owner', '2026-09-01T00:00:00.000Z'),
			('lesson-red-b-one', 'center-red-b', 'class-red-b', 'schedule-red-b', '2026-09-07', 'planned', 'admin-red-owner', '2026-09-01T00:00:00.000Z');
	`);
	return root;
}

describe('TASK-107 fresh independent semantic route-scope proof', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = fixture();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it('denies wrong lesson, class, selected student, and shared route before mutation', async () => {
		root.collaboration.createFieldComment({
			sessionToken: 'session-red-owner', classId: 'class-red-a', lessonId: 'lesson-red-a-two',
			scope: 'shared', fieldKey: 'topic', commentId: 'comment-red-lesson', body: 'lesson secret'
		});
		root.collaboration.createFieldComment({
			sessionToken: 'session-red-owner', classId: 'class-red-b', lessonId: 'lesson-red-b-one',
			scope: 'shared', fieldKey: 'topic', commentId: 'comment-red-class', body: 'class secret'
		});
		root.collaboration.createFieldComment({
			sessionToken: 'session-red-owner', classId: 'class-red-a', lessonId: 'lesson-red-a-one',
			scope: 'personal', studentAccountId: 'student-red-two', fieldKey: 'topic',
			commentId: 'comment-red-student', body: 'student two secret'
		});

		const before = {
			lesson: stateOf(root, 'comment-red-lesson'),
			class: stateOf(root, 'comment-red-class'),
			student: stateOf(root, 'comment-red-student')
		};
		const attempts = await Promise.all([
			lessonContextActions.editFieldComment(actionEvent(
				'session-red-owner', 'class-red-a', 'lesson-red-a-one', undefined,
				'comment-red-lesson', 'forged lesson'
			)),
			lessonContextActions.editFieldComment(actionEvent(
				'session-red-owner', 'class-red-a', 'lesson-red-a-one', undefined,
				'comment-red-class', 'forged class'
			)),
			lessonContextActions.editFieldComment(actionEvent(
				'session-red-owner', 'class-red-a', 'lesson-red-a-one', 'student-red-one',
				'comment-red-student', 'forged student'
			)),
			lessonContextActions.editFieldComment(actionEvent(
				'session-red-owner', 'class-red-a', 'lesson-red-a-one', undefined,
				'comment-red-student', 'forged shared route'
			))
		]);

		for (const result of attempts) {
			expect(result).toMatchObject({ status: 403, data: { error: 'comment_forbidden' } });
			expect(Object.keys((result as { data: Record<string, unknown> }).data)).toEqual(['error']);
			expect(JSON.stringify(result)).not.toMatch(/secret|student-red-two|grade/i);
		}
		expect(stateOf(root, 'comment-red-lesson')).toEqual(before.lesson);
		expect(stateOf(root, 'comment-red-class')).toEqual(before.class);
		expect(stateOf(root, 'comment-red-student')).toEqual(before.student);
	});

	it('allows only same-context owner edits and rejects another author', async () => {
		root.collaboration.createFieldComment({
			sessionToken: 'session-red-owner', classId: 'class-red-a', lessonId: 'lesson-red-a-one',
			scope: 'shared', fieldKey: 'topic', commentId: 'comment-red-owner', body: 'before'
		});
		const before = stateOf(root, 'comment-red-owner');
		const otherAuthor = await lessonContextActions.editFieldComment(actionEvent(
			'session-red-other', 'class-red-a', 'lesson-red-a-one', undefined,
			'comment-red-owner', 'other author'
		));
		expect(otherAuthor).toMatchObject({ status: 403, data: { error: 'comment_forbidden' } });
		expect(stateOf(root, 'comment-red-owner')).toEqual(before);

		const owner = await lessonContextActions.editFieldComment(actionEvent(
			'session-red-owner', 'class-red-a', 'lesson-red-a-one', undefined,
			'comment-red-owner', 'after'
		));
		expect(owner).toEqual({ collaborationSuccess: true });
		expect(stateOf(root, 'comment-red-owner')).toMatchObject({ body: 'after' });
	});
});
