import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const routeRoot = vi.hoisted(() => ({ current: undefined as any }));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../../src/lib/server/composition-root')>();
	return { ...actual, getCompositionRoot: () => routeRoot.current };
});

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { actions as lessonContextActions } from '../../src/routes/lesson-context/+page.server';

function actionEvent(
	sessionToken: string | undefined,
	classId: string,
	lessonId: string,
	fields: Array<[string, string]>
) {
	const url = new URL(`https://calendar.test/lesson-context?classId=${classId}&lessonId=${lessonId}`);
	const formData = new FormData();
	for (const [name, value] of fields) formData.append(name, value);
	return {
		url,
		request: new Request(url, { method: 'POST', body: formData }),
		cookies: {
			get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined)
		}
	} as any;
}

async function invoke(
	root: CompositionRoot,
	sessionToken: string,
	classId: string,
	lessonId: string,
	commentId: string,
	body: string
) {
	return lessonContextActions.editFieldComment(
		actionEvent(sessionToken, classId, lessonId, [
			['commentId', commentId],
			['body', body]
		])
	);
}

function commentState(root: CompositionRoot, commentId: string) {
	return root.database.sqlite
		.prepare(
			`SELECT body, last_changed_at
			 FROM collaboration_comments
			 WHERE id = ?`
		)
		.get(commentId);
}

function createFixture(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES
			('center-route', 'Route Center'),
			('center-other', 'Other Center');
		INSERT INTO accounts (id, role) VALUES ('admin-route', 'admin');
		INSERT INTO sessions (token, account_id, revoked_at)
			VALUES ('session-admin-route', 'admin-route', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-route', 'admin-route'),
			('center-other', 'admin-route');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('class-route', 'center-route', 'Route Class', 'group'),
			('class-other', 'center-other', 'Other Class', 'group');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES
			('schedule-route-one', 'center-route', 'class-route', '2026-09-01', '2026-09-30', '[1]', 'admin-route', '2026-09-01T00:00:00.000Z'),
			('schedule-route-two', 'center-route', 'class-route', '2026-10-01', '2026-10-31', '[1]', 'admin-route', '2026-10-01T00:00:00.000Z'),
			('schedule-other', 'center-other', 'class-other', '2026-09-01', '2026-09-30', '[1]', 'admin-route', '2026-09-01T00:00:00.000Z');
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES
			('lesson-route-one', 'center-route', 'class-route', 'schedule-route-one', '2026-09-07', 'planned', 'admin-route', '2026-09-01T00:00:00.000Z'),
			('lesson-route-two', 'center-route', 'class-route', 'schedule-route-two', '2026-10-05', 'planned', 'admin-route', '2026-10-01T00:00:00.000Z'),
			('lesson-other', 'center-other', 'class-other', 'schedule-other', '2026-09-07', 'planned', 'admin-route', '2026-09-01T00:00:00.000Z');
	`);
	return root;
}

describe('TASK-107 named editFieldComment route-scope correction', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createFixture();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it('denies forged lesson and class scope before mutating an owned comment', async () => {
		root.collaboration.createFieldComment({
			sessionToken: 'session-admin-route',
			classId: 'class-route',
			lessonId: 'lesson-route-two',
			scope: 'shared',
			fieldKey: 'topic',
			commentId: 'comment-stored-lesson-two',
			body: 'Stored lesson-two body'
		});
		root.collaboration.createFieldComment({
			sessionToken: 'session-admin-route',
			classId: 'class-other',
			lessonId: 'lesson-other',
			scope: 'shared',
			fieldKey: 'topic',
			commentId: 'comment-stored-other-class',
			body: 'Stored other-class body'
		});

		const lessonBefore = commentState(root, 'comment-stored-lesson-two');
		const classBefore = commentState(root, 'comment-stored-other-class');
		const forgedLesson = await invoke(
			root,
			'session-admin-route',
			'class-route',
			'lesson-route-one',
			'comment-stored-lesson-two',
			'Forged lesson edit'
		);
		const forgedClass = await invoke(
			root,
			'session-admin-route',
			'class-route',
			'lesson-route-one',
			'comment-stored-other-class',
			'Forged class edit'
		);

		expect(forgedLesson).toMatchObject({ status: 403, data: { error: 'comment_forbidden' } });
		expect(forgedClass).toMatchObject({ status: 403, data: { error: 'comment_forbidden' } });
		expect(commentState(root, 'comment-stored-lesson-two')).toEqual(lessonBefore);
		expect(commentState(root, 'comment-stored-other-class')).toEqual(classBefore);
	});

	it('delegates same-context owner edits with the current route scope', async () => {
		root.collaboration.createFieldComment({
			sessionToken: 'session-admin-route',
			classId: 'class-route',
			lessonId: 'lesson-route-one',
			scope: 'shared',
			fieldKey: 'topic',
			commentId: 'comment-current-scope',
			body: 'Original body'
		});
		const editSpy = vi.spyOn(root.collaboration, 'editFieldComment');

		const result = await invoke(
			root,
			'session-admin-route',
			'class-route',
			'lesson-route-one',
			'comment-current-scope',
			'Updated body'
		);

		expect(result).toEqual({ collaborationSuccess: true });
		expect(editSpy).toHaveBeenCalledWith({
			sessionToken: 'session-admin-route',
			classId: 'class-route',
			lessonId: 'lesson-route-one',
			commentId: 'comment-current-scope',
			body: 'Updated body'
		});
		expect(commentState(root, 'comment-current-scope')).toMatchObject({ body: 'Updated body' });
	});
});
