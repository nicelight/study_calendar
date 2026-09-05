import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const routeRoot = vi.hoisted(() => ({ current: undefined as any }));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../../src/lib/server/composition-root')>();
	return { ...actual, getCompositionRoot: () => routeRoot.current };
});

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { actions as lessonContextActions } from '../../src/routes/lesson-context/+page.server';

function eventFor(
	sessionToken: string,
	classId: string,
	lessonId: string,
	fields: Array<[string, string]>
) {
	const url = new URL(`https://verify.test/lesson-context?classId=${classId}&lessonId=${lessonId}`);
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

async function editThroughRoute(
	sessionToken: string,
	classId: string,
	lessonId: string,
	commentId: string,
	body: string
) {
	return lessonContextActions.editFieldComment(
		eventFor(sessionToken, classId, lessonId, [
			['commentId', commentId],
			['body', body]
		])
	);
}

function stateOf(root: CompositionRoot, commentId: string) {
	return root.database.sqlite
		.prepare(
			`SELECT body, last_changed_at
			 FROM collaboration_comments
			 WHERE id = ?`
		)
		.get(commentId);
}

function fixture(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES
			('center-verifier-a', 'Verifier A'),
			('center-verifier-b', 'Verifier B');
		INSERT INTO accounts (id, role) VALUES ('admin-verifier', 'admin');
		INSERT INTO sessions (token, account_id, revoked_at)
			VALUES ('session-verifier', 'admin-verifier', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-verifier-a', 'admin-verifier'),
			('center-verifier-b', 'admin-verifier');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('class-verifier-a', 'center-verifier-a', 'Verifier A', 'group'),
			('class-verifier-b', 'center-verifier-b', 'Verifier B', 'group');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES
			('schedule-verifier-a', 'center-verifier-a', 'class-verifier-a', '2026-09-01', '2026-09-30', '[1]', 'admin-verifier', '2026-09-01T00:00:00.000Z'),
			('schedule-verifier-b', 'center-verifier-b', 'class-verifier-b', '2026-09-01', '2026-09-30', '[1]', 'admin-verifier', '2026-09-01T00:00:00.000Z');
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES
			('lesson-verifier-a-one', 'center-verifier-a', 'class-verifier-a', 'schedule-verifier-a', '2026-09-07', 'planned', 'admin-verifier', '2026-09-01T00:00:00.000Z'),
			('lesson-verifier-a-two', 'center-verifier-a', 'class-verifier-a', 'schedule-verifier-a', '2026-09-14', 'planned', 'admin-verifier', '2026-09-01T00:00:00.000Z'),
			('lesson-verifier-b-one', 'center-verifier-b', 'class-verifier-b', 'schedule-verifier-b', '2026-09-07', 'planned', 'admin-verifier', '2026-09-01T00:00:00.000Z');
	`);
	return root;
}

describe('TASK-107 verifier-owned route scope proof', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = fixture();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it('denies cross-lesson and cross-class owned targets without disclosure or mutation', async () => {
		root.collaboration.createFieldComment({
			sessionToken: 'session-verifier',
			classId: 'class-verifier-a',
			lessonId: 'lesson-verifier-a-two',
			scope: 'shared',
			fieldKey: 'topic',
			commentId: 'comment-verifier-lesson',
			body: 'lesson-private-body'
		});
		root.collaboration.createFieldComment({
			sessionToken: 'session-verifier',
			classId: 'class-verifier-b',
			lessonId: 'lesson-verifier-b-one',
			scope: 'shared',
			fieldKey: 'topic',
			commentId: 'comment-verifier-class',
			body: 'class-private-body'
		});

		const lessonBefore = stateOf(root, 'comment-verifier-lesson');
		const classBefore = stateOf(root, 'comment-verifier-class');
		const forgedLesson = await editThroughRoute(
			'session-verifier',
			'class-verifier-a',
			'lesson-verifier-a-one',
			'comment-verifier-lesson',
			'forged-lesson-body'
		);
		const forgedClass = await editThroughRoute(
			'session-verifier',
			'class-verifier-a',
			'lesson-verifier-a-one',
			'comment-verifier-class',
			'forged-class-body'
		);

		for (const result of [forgedLesson, forgedClass]) {
			expect(result).toMatchObject({ status: 403, data: { error: 'comment_forbidden' } });
			expect(Object.keys((result as { data: Record<string, unknown> }).data)).toEqual(['error']);
			expect(JSON.stringify(result)).not.toContain('private-body');
		}
		expect(stateOf(root, 'comment-verifier-lesson')).toEqual(lessonBefore);
		expect(stateOf(root, 'comment-verifier-class')).toEqual(classBefore);
	});

	it('permits the current account owner and forwards the server-checked route scope', async () => {
		root.collaboration.createFieldComment({
			sessionToken: 'session-verifier',
			classId: 'class-verifier-a',
			lessonId: 'lesson-verifier-a-one',
			scope: 'shared',
			fieldKey: 'topic',
			commentId: 'comment-verifier-current',
			body: 'before-edit'
		});
		const editSpy = vi.spyOn(root.collaboration, 'editFieldComment');

		const result = await editThroughRoute(
			'session-verifier',
			'class-verifier-a',
			'lesson-verifier-a-one',
			'comment-verifier-current',
			'after-edit'
		);

		expect(result).toEqual({ collaborationSuccess: true });
		expect(editSpy).toHaveBeenCalledWith({
			sessionToken: 'session-verifier',
			classId: 'class-verifier-a',
			lessonId: 'lesson-verifier-a-one',
			commentId: 'comment-verifier-current',
			body: 'after-edit'
		});
		expect(stateOf(root, 'comment-verifier-current')).toMatchObject({ body: 'after-edit' });
	});
});
