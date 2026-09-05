import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const routeRoot = vi.hoisted(() => ({ current: undefined as any }));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../../src/lib/server/composition-root')>();
	return { ...actual, getCompositionRoot: () => routeRoot.current };
});

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { actions as lessonContextActions } from '../../src/routes/lesson-context/+page.server';

function editEvent(
	root: CompositionRoot,
	studentAccountId: string,
	commentId: string,
	body: string
) {
	const url = new URL(
		`https://verify.test/lesson-context?classId=class-personal&lessonId=lesson-personal&studentAccountId=${studentAccountId}`
	);
	const formData = new FormData();
	formData.append('commentId', commentId);
	formData.append('body', body);
	return lessonContextActions.editFieldComment({
		url,
		request: new Request(url, { method: 'POST', body: formData }),
		cookies: { get: (name: string) => (name === 'foundation_session' ? 'session-admin-personal' : undefined) }
	} as any);
}

function fixture(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-personal', 'Personal Center');
		INSERT INTO accounts (id, role) VALUES ('admin-personal', 'admin'), ('student-one-personal', 'student'), ('student-two-personal', 'student');
		INSERT INTO account_profiles (account_id, full_name, registered_at) VALUES
			('admin-personal', 'Admin Personal', '2026-01-01T00:00:00.000Z'),
			('student-one-personal', 'Student One', '2026-01-01T00:00:00.000Z'),
			('student-two-personal', 'Student Two', '2026-01-01T00:00:00.000Z');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES ('session-admin-personal', 'admin-personal', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-personal', 'admin-personal'), ('center-personal', 'student-one-personal'), ('center-personal', 'student-two-personal');
		INSERT INTO classes (id, center_id, name, mode) VALUES ('class-personal', 'center-personal', 'Personal Class', 'group');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('center-personal', 'class-personal', 'student-one-personal'), ('center-personal', 'class-personal', 'student-two-personal');
		INSERT INTO schedules (id, center_id, class_id, start_date, end_date, weekdays, created_by_account_id, created_at)
			VALUES ('schedule-personal', 'center-personal', 'class-personal', '2026-09-01', '2026-09-30', '[1]', 'admin-personal', '2026-09-01T00:00:00.000Z');
		INSERT INTO lessons (id, center_id, class_id, schedule_id, lesson_date, status, created_by_account_id, created_at)
			VALUES ('lesson-personal', 'center-personal', 'class-personal', 'schedule-personal', '2026-09-07', 'planned', 'admin-personal', '2026-09-01T00:00:00.000Z');
	`);
	return root;
}

describe('TASK-107 personal route scope probe', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = fixture();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it('shows editFieldComment ignores the selected student route scope', async () => {
		root.collaboration.createFieldComment({
			sessionToken: 'session-admin-personal',
			classId: 'class-personal',
			lessonId: 'lesson-personal',
			scope: 'personal',
			studentAccountId: 'student-two-personal',
			fieldKey: 'topic',
			commentId: 'comment-student-two',
			body: 'Student two body'
		});

		const result = await editEvent(root, 'student-one-personal', 'comment-student-two', 'Edited through student one');
		const state = root.database.sqlite
			.prepare('SELECT body FROM collaboration_comments WHERE id = ?')
			.get('comment-student-two');

		expect(result).toEqual({ collaborationSuccess: true });
		expect(state).toEqual({ body: 'Edited through student one' });
	});
});
