import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const routeRoot = vi.hoisted(() => ({ current: undefined as any }));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../../src/lib/server/composition-root')>();
	return { ...actual, getCompositionRoot: () => routeRoot.current };
});

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { actions as lessonContextActions } from '../../src/routes/lesson-context/+page.server';

function editEvent(studentAccountId: string | undefined, commentId: string, body: string) {
	const url = new URL('https://attempt-2.test/lesson-context');
	url.searchParams.set('classId', 'class-personal-attempt-2');
	url.searchParams.set('lessonId', 'lesson-personal-attempt-2');
	if (studentAccountId) url.searchParams.set('studentAccountId', studentAccountId);
	const formData = new FormData();
	formData.append('commentId', commentId);
	formData.append('body', body);
	return lessonContextActions.editFieldComment({
		url,
		request: new Request(url, { method: 'POST', body: formData }),
		cookies: {
			get: (name: string) =>
				name === 'foundation_session' ? 'session-admin-personal-attempt-2' : undefined
		}
	} as any);
}

function stateOf(root: CompositionRoot, commentId: string) {
	return root.database.sqlite
		.prepare('SELECT body, last_changed_at FROM collaboration_comments WHERE id = ?')
		.get(commentId);
}

function fixture(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-personal-attempt-2', 'Attempt 2 Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-personal-attempt-2', 'admin'),
			('student-one-personal-attempt-2', 'student'),
			('student-two-personal-attempt-2', 'student');
		INSERT INTO sessions (token, account_id, revoked_at)
			VALUES ('session-admin-personal-attempt-2', 'admin-personal-attempt-2', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-personal-attempt-2', 'admin-personal-attempt-2'),
			('center-personal-attempt-2', 'student-one-personal-attempt-2'),
			('center-personal-attempt-2', 'student-two-personal-attempt-2');
		INSERT INTO classes (id, center_id, name, mode)
			VALUES ('class-personal-attempt-2', 'center-personal-attempt-2', 'Attempt 2 Class', 'group');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('center-personal-attempt-2', 'class-personal-attempt-2', 'student-one-personal-attempt-2'),
			('center-personal-attempt-2', 'class-personal-attempt-2', 'student-two-personal-attempt-2');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES (
			'schedule-personal-attempt-2', 'center-personal-attempt-2',
			'class-personal-attempt-2', '2026-09-01', '2026-09-30', '[1]',
			'admin-personal-attempt-2', '2026-09-01T00:00:00.000Z'
		);
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES (
			'lesson-personal-attempt-2', 'center-personal-attempt-2',
			'class-personal-attempt-2', 'schedule-personal-attempt-2', '2026-09-07',
			'planned', 'admin-personal-attempt-2', '2026-09-01T00:00:00.000Z'
		);
	`);
	return root;
}

describe('TASK-107 Attempt 2 selected personal student scope', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = fixture();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it('denies student-one URL edits of student-two personal comments before mutation', async () => {
		root.collaboration.createFieldComment({
			sessionToken: 'session-admin-personal-attempt-2',
			classId: 'class-personal-attempt-2',
			lessonId: 'lesson-personal-attempt-2',
			scope: 'personal',
			studentAccountId: 'student-two-personal-attempt-2',
			fieldKey: 'topic',
			commentId: 'comment-student-two-attempt-2',
			body: 'Student two before'
		});
		const before = stateOf(root, 'comment-student-two-attempt-2');

		const result = await editEvent(
			'student-one-personal-attempt-2',
			'comment-student-two-attempt-2',
			'Forged through student one'
		);

		expect(result).toMatchObject({ status: 403, data: { error: 'comment_forbidden' } });
		expect(stateOf(root, 'comment-student-two-attempt-2')).toEqual(before);
	});

	it('preserves same-context owner success for a personal comment', async () => {
		root.collaboration.createFieldComment({
			sessionToken: 'session-admin-personal-attempt-2',
			classId: 'class-personal-attempt-2',
			lessonId: 'lesson-personal-attempt-2',
			scope: 'personal',
			studentAccountId: 'student-two-personal-attempt-2',
			fieldKey: 'topic',
			commentId: 'comment-same-context-attempt-2',
			body: 'Same context before'
		});

		const result = await editEvent(
			'student-two-personal-attempt-2',
			'comment-same-context-attempt-2',
			'Same context after'
		);

		expect(result).toEqual({ collaborationSuccess: true });
		expect(stateOf(root, 'comment-same-context-attempt-2')).toMatchObject({
			body: 'Same context after'
		});
	});
});
