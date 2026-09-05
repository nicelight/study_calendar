import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const routeRoot = vi.hoisted(() => ({ current: undefined as any }));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../../src/lib/server/composition-root')>();
	return { ...actual, getCompositionRoot: () => routeRoot.current };
});

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { actions, load } from '../../src/routes/lesson-context/+page.server';

const classId = 'class-verify-102';
const lessonId = 'lesson-verify-102';

function actionEvent(
	sessionToken: string | undefined,
	url: URL,
	fields: Array<[string, string]>
) {
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

function routeActionUrl(action: string): URL {
	const pageUrl = new URL(`https://calendar.test/lesson-context?classId=${classId}&lessonId=${lessonId}`);
	const params = new URLSearchParams({ classId, lessonId });
	return new URL(`?${params.toString()}&/${action}`, pageUrl);
}

function invoke(
	name: keyof typeof actions,
	sessionToken: string | undefined,
	url: URL,
	fields: Array<[string, string]>
) {
	return actions[name](actionEvent(sessionToken, url, fields));
}

function collaborationState(root: CompositionRoot) {
	return root.database.sqlite
		.prepare(`
			SELECT
				(SELECT COUNT(*) FROM collaboration_comments) AS comments,
				(SELECT COUNT(*) FROM collaboration_reactions) AS reactions,
				(SELECT COUNT(*) FROM collaboration_messages) AS messages
		`)
		.get();
}

function fixture(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-verify-102', 'Verify Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-verify-102', 'admin'),
			('teacher-verify-102', 'teacher'),
			('unassigned-teacher-verify-102', 'teacher'),
			('student-one-verify-102', 'student'),
			('student-two-verify-102', 'student'),
			('parent-verify-102', 'parent');
		INSERT INTO account_profiles (account_id, full_name, registered_at) VALUES
			('admin-verify-102', 'Admin Verify', '2026-01-01T00:00:00.000Z'),
			('teacher-verify-102', 'Teacher Verify', '2026-01-01T00:00:00.000Z'),
			('unassigned-teacher-verify-102', 'Unassigned Teacher Verify', '2026-01-01T00:00:00.000Z'),
			('student-one-verify-102', 'Student One Verify', '2026-01-01T00:00:00.000Z'),
			('student-two-verify-102', 'Student Two Verify', '2026-01-01T00:00:00.000Z'),
			('parent-verify-102', 'Parent Verify', '2026-01-01T00:00:00.000Z');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-verify-102', 'admin-verify-102', NULL),
			('session-teacher-verify-102', 'teacher-verify-102', NULL),
			('session-unassigned-teacher-verify-102', 'unassigned-teacher-verify-102', NULL),
			('session-student-one-verify-102', 'student-one-verify-102', NULL),
			('session-student-two-verify-102', 'student-two-verify-102', NULL),
			('session-parent-verify-102', 'parent-verify-102', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-verify-102', 'admin-verify-102'),
			('center-verify-102', 'teacher-verify-102'),
			('center-verify-102', 'unassigned-teacher-verify-102'),
			('center-verify-102', 'student-one-verify-102'),
			('center-verify-102', 'student-two-verify-102'),
			('center-verify-102', 'parent-verify-102');
		INSERT INTO classes (id, center_id, name, mode)
			VALUES ('${classId}', 'center-verify-102', 'Verify Class', 'group');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('center-verify-102', '${classId}', 'student-one-verify-102'),
			('center-verify-102', '${classId}', 'student-two-verify-102');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
			VALUES ('center-verify-102', '${classId}', 'teacher-verify-102');
		INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id)
			VALUES ('center-verify-102', 'parent-verify-102', 'student-one-verify-102');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES (
			'schedule-verify-102', 'center-verify-102', '${classId}', '2026-09-01', '2026-09-30',
			'[1]', 'admin-verify-102', '2026-09-01T00:00:00.000Z'
		);
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES (
			'${lessonId}', 'center-verify-102', '${classId}', 'schedule-verify-102', '2026-09-07',
			'planned', 'admin-verify-102', '2026-09-01T00:00:00.000Z'
		);
	`);
	root.lessonContext.setSharedLessonMaterial({
		sessionToken: 'session-admin-verify-102',
		classId,
		lessonId,
		topic: 'Verify topic',
		practicalWork: 'Verify practice',
		homework: 'Verify homework'
	});
	root.collaboration.createFieldComment({
		sessionToken: 'session-admin-verify-102', classId, lessonId,
		scope: 'shared', fieldKey: 'topic', commentId: 'comment-shared-verify-102', body: 'Shared note'
	});
	root.collaboration.setReaction({
		sessionToken: 'session-student-one-verify-102', classId, lessonId,
		scope: 'shared', targetType: 'field', targetId: 'topic', reaction: 'like'
	});
	root.collaboration.createMessage({
		sessionToken: 'session-admin-verify-102', classId, lessonId,
		scope: 'shared', messageId: 'message-shared-verify-102', body: 'Shared root'
	});
	root.collaboration.replyToMessage({
		sessionToken: 'session-teacher-verify-102', classId, lessonId,
		scope: 'shared', parentMessageId: 'message-shared-verify-102',
		messageId: 'reply-shared-verify-102', body: 'Shared reply'
	});
	root.collaboration.createMessage({
		sessionToken: 'session-student-one-verify-102', classId, lessonId,
		scope: 'personal', studentAccountId: 'student-one-verify-102',
		messageId: 'message-personal-verify-102', body: 'Personal note'
	});
	return root;
}

describe('TASK-102 Attempt 2 independent verifier probes', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = fixture();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it('proves native named-form URL context, named action registry, and route composition', async () => {
		const pageSource = readFileSync(resolve(process.cwd(), 'src/routes/lesson-context/+page.svelte'), 'utf8');
		const routeSource = readFileSync(resolve(process.cwd(), 'src/routes/lesson-context/+page.server.ts'), 'utf8');
		expect(Object.keys(actions).sort()).toEqual([
			'completeHomework', 'createFieldComment', 'createHomework', 'createMessage', 'createPayment',
			'editFieldComment', 'recordGrade', 'replyToMessage', 'saveAttendance', 'setReaction',
			'setSharedLessonMaterial'
		]);
		expect(routeSource).not.toMatch(/\bdefault\s*:/);
		expect(pageSource).toContain('new URLSearchParams({ classId, lessonId })');
		expect(pageSource).toContain('return `?${params.toString()}&/${action}`');
		expect(pageSource).not.toMatch(/name="action"/);

		const nativeUrl = routeActionUrl('createMessage');
		expect(nativeUrl.searchParams.get('classId')).toBe(classId);
		expect(nativeUrl.searchParams.get('lessonId')).toBe(lessonId);
		expect(nativeUrl.searchParams.has('/createMessage')).toBe(true);
		const result = await invoke('createMessage', 'session-admin-verify-102', nativeUrl, [
			['scope', 'shared'], ['messageId', 'message-native-verify-102'], ['body', 'Native route form']
		]);
		expect(result).toEqual({ collaborationSuccess: true });
		expect(root.database.sqlite.prepare(
			'SELECT class_id, lesson_id, body FROM collaboration_messages WHERE id = ?'
		).get('message-native-verify-102')).toEqual({
			class_id: classId, lesson_id: lessonId, body: 'Native route form'
		});

		const loaded = load({
			url: new URL(`https://calendar.test/lesson-context?classId=${classId}&lessonId=${lessonId}`),
			cookies: { get: (name: string) => name === 'foundation_session' ? 'session-admin-verify-102' : undefined }
		} as any);
		expect(loaded.dayContext.discussion.fieldComments.topic[0]).toMatchObject({
			body: 'Shared note', authorLabel: 'Admin Verify'
		});
	});

	it('proves complete scoped projection, labels, depth, tab bound, retention, and reactivation', () => {
		for (let branch = 1; branch <= 11; branch += 1) {
			root.collaboration.createMessage({
				sessionToken: 'session-admin-verify-102', classId, lessonId, scope: 'shared',
				messageId: `root-verify-102-${branch}`, body: `Root ${branch}`
			});
			root.collaboration.replyToMessage({
				sessionToken: 'session-teacher-verify-102', classId, lessonId, scope: 'shared',
				parentMessageId: `root-verify-102-${branch}`,
				messageId: `reply-verify-102-${branch}`, body: `Reply ${branch}`
			});
		}
		const shared = root.lessonContext.getDayContext({
			sessionToken: 'session-admin-verify-102', classId, lessonId
		});
		const personal = root.lessonContext.getDayContext({
			sessionToken: 'session-parent-verify-102', classId, lessonId,
			studentAccountId: 'student-one-verify-102'
		});
		expect(shared.discussion.fieldComments.topic[0]).toMatchObject({
			authorLabel: 'Admin Verify', body: 'Shared note', createdAt: expect.any(String), lastChangedAt: expect.any(String)
		});
		expect(shared.discussion.fieldReactions.topic[0]).toMatchObject({
			reactorLabel: 'Student One Verify', reaction: 'like'
		});
		expect(shared.discussion.commonMessages.some((message) => message.body === 'Shared reply')).toBe(true);
		expect(shared.discussion.branchMessages['root-verify-102-11']).toHaveLength(2);
		expect(shared.discussion.recentBranchTabs).toHaveLength(10);
		expect(shared.discussion.commonMessages.some((message) => message.body === 'Root 1')).toBe(true);
		expect(personal.personal?.discussion.commonMessages.map((message) => message.body)).toEqual(['Personal note']);
		expect(personal.discussion.commonMessages.some((message) => message.body === 'Shared root')).toBe(false);
		expect(personal.personal?.discussion.commonMessages.some((message) => message.body === 'Shared root')).toBe(false);

		root.collaboration.replyToMessage({
			sessionToken: 'session-admin-verify-102', classId, lessonId, scope: 'shared',
			parentMessageId: 'reply-verify-102-1', messageId: 'reactivate-verify-102', body: 'Reactivated branch'
		});
		root.collaboration.replyToMessage({
			sessionToken: 'session-teacher-verify-102', classId, lessonId, scope: 'shared',
			parentMessageId: 'reactivate-verify-102', messageId: 'deep-verify-102-1', body: 'Deep reply'
		});
		root.collaboration.replyToMessage({
			sessionToken: 'session-admin-verify-102', classId, lessonId, scope: 'shared',
			parentMessageId: 'deep-verify-102-1', messageId: 'deep-verify-102-2', body: 'Deeper reply'
		});
		const reactivated = root.collaboration.getBrowserProjection({
			sessionToken: 'session-admin-verify-102', classId, lessonId, scope: 'shared'
		});
		expect(reactivated.recentBranchTabs[0].rootMessageId).toBe('root-verify-102-1');
		expect(reactivated.branchMessages['root-verify-102-1']).toHaveLength(5);
		expect(reactivated.branchMessages['root-verify-102-1']?.at(-1)?.body).toBe('Deeper reply');
	});

	it('proves all five named mutations and deny-before-write for invalid, forged, and revoked contexts', async () => {
		const nativeBase = routeActionUrl('createFieldComment');
		const created = await invoke('createFieldComment', 'session-parent-verify-102', nativeBase, [
			['scope', 'personal'], ['studentAccountId', 'student-one-verify-102'], ['fieldKey', 'homework'],
			['commentId', 'comment-route-verify-102'], ['body', 'Parent note']
		]);
		expect(created).toEqual({ collaborationSuccess: true });
		expect(await invoke('editFieldComment', 'session-parent-verify-102', nativeBase, [
			['commentId', 'comment-route-verify-102'], ['body', 'Parent edited note']
		])).toEqual({ collaborationSuccess: true });
		expect(await invoke('setReaction', 'session-parent-verify-102', routeActionUrl('setReaction'), [
			['scope', 'personal'], ['studentAccountId', 'student-one-verify-102'], ['targetType', 'comment'],
			['targetId', 'comment-route-verify-102'], ['reaction', 'love']
		])).toEqual({ collaborationSuccess: true });
		expect(await invoke('createMessage', 'session-parent-verify-102', routeActionUrl('createMessage'), [
			['scope', 'personal'], ['studentAccountId', 'student-one-verify-102'],
			['messageId', 'message-route-verify-102'], ['body', 'Parent message']
		])).toEqual({ collaborationSuccess: true });
		expect(await invoke('replyToMessage', 'session-parent-verify-102', routeActionUrl('replyToMessage'), [
			['scope', 'personal'], ['studentAccountId', 'student-one-verify-102'],
			['parentMessageId', 'message-route-verify-102'], ['messageId', 'reply-route-verify-102'],
			['body', 'Parent reply']
		])).toEqual({ collaborationSuccess: true });

		const beforeInvalid = collaborationState(root);
		expect(await invoke('createFieldComment', 'session-admin-verify-102', routeActionUrl('createFieldComment'), [
			['scope', 'shared'], ['fieldKey', 'unsupported-field'],
			['commentId', 'comment-invalid-field-verify-102'], ['body', 'Must not write']
		])).toMatchObject({ status: 400, data: { error: 'comment_invalid' } });
		expect(await invoke('setReaction', 'session-admin-verify-102', routeActionUrl('setReaction'), [
			['scope', 'shared'], ['targetType', 'field'], ['targetId', 'unsupported-field'], ['reaction', 'like']
		])).toMatchObject({ status: 400, data: { error: 'reaction_invalid' } });
		expect(collaborationState(root)).toEqual(beforeInvalid);

		const beforeDenied = collaborationState(root);
		const denied = [
			invoke('createMessage', undefined, routeActionUrl('createMessage'), [
				['scope', 'shared'], ['messageId', 'message-no-cookie-verify-102'], ['body', 'deny']
			]),
			invoke('createMessage', 'invalid-session-verify-102', routeActionUrl('createMessage'), [
				['scope', 'shared'], ['messageId', 'message-invalid-session-verify-102'], ['body', 'deny']
			]),
			invoke('createMessage', 'session-student-one-verify-102', routeActionUrl('createMessage'), [
				['scope', 'personal'], ['studentAccountId', 'student-two-verify-102'],
				['messageId', 'message-cross-student-verify-102'], ['body', 'deny']
			]),
			invoke('createMessage', 'session-admin-verify-102', routeActionUrl('createMessage'), [
				['scope', 'shared'], ['messageId', 'message-forged-role-verify-102'], ['body', 'deny'], ['role', 'student']
			]),
			invoke('createMessage', 'session-unassigned-teacher-verify-102', routeActionUrl('createMessage'), [
				['scope', 'shared'], ['messageId', 'message-unassigned-verify-102'], ['body', 'deny']
			])
		];
		for (const result of await Promise.all(denied)) {
			expect(result).toMatchObject({ status: expect.any(Number), data: { error: expect.any(String) } });
		}
		expect(collaborationState(root)).toEqual(beforeDenied);

		root.identityAccess.revokeSession('session-student-one-verify-102');
		const beforeRevoked = collaborationState(root);
		expect(await invoke('createMessage', 'session-student-one-verify-102', routeActionUrl('createMessage'), [
			['scope', 'personal'], ['studentAccountId', 'student-one-verify-102'],
			['messageId', 'message-revoked-verify-102'], ['body', 'deny']
		])).toMatchObject({ status: 403 });
		expect(collaborationState(root)).toEqual(beforeRevoked);

		root.database.sqlite.prepare('DELETE FROM center_memberships WHERE account_id = ?').run('student-two-verify-102');
		expect(() => root.lessonContext.getDayContext({
			sessionToken: 'session-student-two-verify-102', classId, lessonId,
			studentAccountId: 'student-two-verify-102'
		})).toThrow('not-authorized');
	});
});
