import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const routeRoot = vi.hoisted(() => ({ current: undefined as any }));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../../src/lib/server/composition-root')>();
	return { ...actual, getCompositionRoot: () => routeRoot.current };
});

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import {
	actions,
	load
} from '../../src/routes/lesson-context/+page.server';
import {
	STANDARD_REACTIONS,
	SUPPORTED_FIELD_KEYS
} from '../../src/lib/server/modules/collaboration/public';

type ActionName = keyof typeof actions;

function actionEvent(
	sessionToken: string | undefined,
	classId: string,
	lessonId: string,
	fields: Array<[string, string]>,
	query = ''
) {
	const url = new URL(`https://calendar.test/lesson-context?classId=${classId}&lessonId=${lessonId}${query}`);
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
	name: Exclude<ActionName, 'default'>,
	sessionToken: string | undefined,
	classId: string,
	lessonId: string,
	fields: Array<[string, string]>,
	query = ''
) {
	return actions[name](actionEvent(sessionToken, classId, lessonId, fields, query));
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

function loadFailure(run: () => unknown): any {
	try {
		run();
		throw new Error('expected protected load failure');
	} catch (cause) {
		return cause;
	}
}

function createFixture(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES
			('center-final', 'Final Probe Center'),
			('center-other-final', 'Other Final Probe Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-final', 'admin'),
			('admin-other-final', 'admin'),
			('teacher-final', 'teacher'),
			('teacher-unassigned-final', 'teacher'),
			('student-one-final', 'student'),
			('student-two-final', 'student'),
			('parent-final', 'parent');
		INSERT INTO account_profiles (account_id, full_name, registered_at) VALUES
			('admin-final', 'Admin Final', '2026-01-01T00:00:00.000Z'),
			('admin-other-final', 'Admin Other Final', '2026-01-01T00:00:00.000Z'),
			('teacher-final', 'Teacher Final', '2026-01-01T00:00:00.000Z'),
			('teacher-unassigned-final', 'Teacher Unassigned Final', '2026-01-01T00:00:00.000Z'),
			('student-one-final', 'Student One Final', '2026-01-01T00:00:00.000Z'),
			('student-two-final', 'Student Two Final', '2026-01-01T00:00:00.000Z'),
			('parent-final', 'Parent Final', '2026-01-01T00:00:00.000Z');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-final', 'admin-final', NULL),
			('session-admin-other-final', 'admin-other-final', NULL),
			('session-teacher-final', 'teacher-final', NULL),
			('session-teacher-unassigned-final', 'teacher-unassigned-final', NULL),
			('session-student-one-final', 'student-one-final', NULL),
			('session-student-two-final', 'student-two-final', NULL),
			('session-parent-final', 'parent-final', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-final', 'admin-final'),
			('center-final', 'teacher-final'),
			('center-final', 'teacher-unassigned-final'),
			('center-final', 'student-one-final'),
			('center-final', 'student-two-final'),
			('center-final', 'parent-final'),
			('center-other-final', 'admin-other-final');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('class-final', 'center-final', 'Final Probe Class', 'group'),
			('class-other-final', 'center-other-final', 'Other Final Class', 'group');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('center-final', 'class-final', 'student-one-final'),
			('center-final', 'class-final', 'student-two-final');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
			VALUES ('center-final', 'class-final', 'teacher-final');
		INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id)
			VALUES ('center-final', 'parent-final', 'student-one-final');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES
			('schedule-final', 'center-final', 'class-final', '2026-09-01', '2026-09-30', '[1]', 'admin-final', '2026-09-01T00:00:00.000Z'),
			('schedule-other-final', 'center-other-final', 'class-other-final', '2026-09-01', '2026-09-30', '[1]', 'admin-other-final', '2026-09-01T00:00:00.000Z');
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES
			('lesson-final-one', 'center-final', 'class-final', 'schedule-final', '2026-09-07', 'planned', 'admin-final', '2026-09-01T00:00:00.000Z'),
			('lesson-final-two', 'center-final', 'class-final', 'schedule-final', '2026-09-14', 'planned', 'admin-final', '2026-09-01T00:00:00.000Z'),
			('lesson-other-final', 'center-other-final', 'class-other-final', 'schedule-other-final', '2026-09-07', 'planned', 'admin-other-final', '2026-09-01T00:00:00.000Z');
	`);
	for (const [lessonId, topic] of [
		['lesson-final-one', 'Final topic one'],
		['lesson-final-two', 'Final topic two']
	] as const) {
		root.lessonContext.setSharedLessonMaterial({
			sessionToken: 'session-admin-final',
			classId: 'class-final',
			lessonId,
			topic,
			practicalWork: 'Final practice',
			homework: 'Final homework'
		});
	}

	root.collaboration.createFieldComment({
		sessionToken: 'session-admin-final',
		classId: 'class-final',
		lessonId: 'lesson-final-one',
		scope: 'shared',
		fieldKey: 'topic',
		commentId: 'comment-final-shared',
		body: 'Shared comment'
	});
	root.collaboration.createFieldComment({
		sessionToken: 'session-admin-final',
		classId: 'class-final',
		lessonId: 'lesson-final-two',
		scope: 'shared',
		fieldKey: 'topic',
		commentId: 'comment-final-other-lesson',
		body: 'Other lesson comment'
	});
	root.collaboration.createMessage({
		sessionToken: 'session-admin-final',
		classId: 'class-final',
		lessonId: 'lesson-final-one',
		scope: 'shared',
		messageId: 'message-final-root',
		body: 'Shared root'
	});
	root.collaboration.replyToMessage({
		sessionToken: 'session-teacher-final',
		classId: 'class-final',
		lessonId: 'lesson-final-one',
		scope: 'shared',
		parentMessageId: 'message-final-root',
		messageId: 'message-final-reply',
		body: 'Shared reply'
	});
	root.collaboration.replyToMessage({
		sessionToken: 'session-student-one-final',
		classId: 'class-final',
		lessonId: 'lesson-final-one',
		scope: 'shared',
		parentMessageId: 'message-final-reply',
		messageId: 'message-final-nested',
		body: 'Nested reply'
	});
	root.collaboration.createFieldComment({
		sessionToken: 'session-student-one-final',
		classId: 'class-final',
		lessonId: 'lesson-final-one',
		scope: 'personal',
		studentAccountId: 'student-one-final',
		fieldKey: 'homework',
		commentId: 'comment-final-personal',
		body: 'Personal comment'
	});
	root.collaboration.createMessage({
		sessionToken: 'session-student-one-final',
		classId: 'class-final',
		lessonId: 'lesson-final-one',
		scope: 'personal',
		studentAccountId: 'student-one-final',
		messageId: 'message-final-personal',
		body: 'Personal message'
	});

	return root;
}

describe('TASK-102 fresh Attempt 3 verifier probes', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createFixture();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it('exposes the exact named route contract and selector-preserving form URLs', () => {
		const pageSource = readFileSync(resolve(process.cwd(), 'src/routes/lesson-context/+page.svelte'), 'utf8');
		const routeSource = readFileSync(resolve(process.cwd(), 'src/routes/lesson-context/+page.server.ts'), 'utf8');
		expect(Object.keys(actions).sort()).toEqual([
			'completeHomework',
			'createFieldComment',
			'createHomework',
			'createMessage',
			'createPayment',
			'editFieldComment',
			'recordGrade',
			'replyToMessage',
			'saveAttendance',
			'setReaction',
			'setSharedLessonMaterial'
		]);
		expect(routeSource).not.toMatch(/\bdefault\s*:/);
		for (const action of [
			'saveAttendance',
			'createHomework',
			'completeHomework',
			'recordGrade',
			'setSharedLessonMaterial',
			'createPayment'
		]) {
			expect(pageSource).toContain(`action={actionHref('${action}')}`);
		}
		expect(pageSource).toContain("const studentAccountId = context?.navigation.studentAccountId;");
		expect(pageSource).toContain("params.set('studentAccountId', studentAccountId);");
		expect(pageSource).not.toMatch(/name="action"/);

		const personalPageUrl = new URL(
			'https://calendar.test/lesson-context?classId=class-final&lessonId=lesson-final-one&studentAccountId=student-one-final'
		);
		const nativeActionUrl = new URL(
			'?classId=class-final&lessonId=lesson-final-one&studentAccountId=student-one-final&/completeHomework',
			personalPageUrl
		);
		expect(nativeActionUrl.searchParams.get('classId')).toBe('class-final');
		expect(nativeActionUrl.searchParams.get('lessonId')).toBe('lesson-final-one');
		expect(nativeActionUrl.searchParams.get('studentAccountId')).toBe('student-one-final');
	});

	it('composes shared/personal projections, labels, reactions, deep branches, and hidden retention', () => {
		for (const [index, reaction] of STANDARD_REACTIONS.entries()) {
			root.collaboration.setReaction({
				sessionToken: [
					'session-admin-final',
					'session-teacher-final',
					'session-student-one-final',
					'session-student-two-final',
					'session-parent-final'
				][index],
				classId: 'class-final',
				lessonId: 'lesson-final-one',
				scope: 'shared',
				targetType: 'field',
				targetId: 'topic',
				reaction
			});
		}
		root.collaboration.setReaction({
			sessionToken: 'session-student-two-final',
			classId: 'class-final',
			lessonId: 'lesson-final-one',
			scope: 'shared',
			targetType: 'comment',
			targetId: 'comment-final-shared',
			reaction: 'love'
		});
		root.collaboration.setReaction({
			sessionToken: 'session-teacher-final',
			classId: 'class-final',
			lessonId: 'lesson-final-one',
			scope: 'shared',
			targetType: 'message',
			targetId: 'message-final-root',
			reaction: 'celebrate'
		});
		for (let index = 1; index <= 11; index += 1) {
			root.collaboration.createMessage({
				sessionToken: 'session-admin-final',
				classId: 'class-final',
				lessonId: 'lesson-final-one',
				scope: 'shared',
				messageId: `message-final-branch-${index}`,
				body: `Branch root ${index}`
			});
			root.collaboration.replyToMessage({
				sessionToken: 'session-admin-final',
				classId: 'class-final',
				lessonId: 'lesson-final-one',
				scope: 'shared',
				parentMessageId: `message-final-branch-${index}`,
				messageId: `message-final-branch-reply-${index}`,
				body: `Branch reply ${index}`
			});
		}

		const shared = root.lessonContext.getDayContext({
			sessionToken: 'session-admin-final',
			classId: 'class-final',
			lessonId: 'lesson-final-one'
		});
		const personal = root.lessonContext.getDayContext({
			sessionToken: 'session-student-one-final',
			classId: 'class-final',
			lessonId: 'lesson-final-one',
			studentAccountId: 'student-one-final'
		});

		expect(shared.discussion.fieldComments.topic[0]).toMatchObject({
			commentId: 'comment-final-shared',
			authorLabel: 'Admin Final',
			body: 'Shared comment'
		});
		expect(shared.discussion.fieldReactions.topic.map((reaction) => reaction.reaction).sort()).toEqual(
			[...STANDARD_REACTIONS].sort()
		);
		expect(shared.discussion.fieldReactions.topic[0]).toHaveProperty('reactorLabel');
		expect(shared.discussion.fieldComments.topic[0].reactions[0]).toMatchObject({
			reactorLabel: 'Student Two Final'
		});
		expect(shared.discussion.commonMessages[0]).toMatchObject({
			messageId: 'message-final-root',
			authorLabel: 'Admin Final'
		});
		expect(shared.discussion.commonMessages[0].reactions[0]).toMatchObject({
			reactorLabel: 'Teacher Final'
		});
		expect(shared.discussion.commonMessages.some((message) => message.messageId === 'message-final-nested')).toBe(true);
		expect(shared.discussion.recentBranchTabs).toHaveLength(10);
		expect(shared.discussion.recentBranchTabs.map((tab) => tab.rootMessageId)).not.toContain(
			'message-final-branch-1'
		);
		expect(shared.discussion.commonMessages.some((message) => message.messageId === 'message-final-branch-reply-1')).toBe(true);

		root.collaboration.replyToMessage({
			sessionToken: 'session-admin-final',
			classId: 'class-final',
			lessonId: 'lesson-final-one',
			scope: 'shared',
			parentMessageId: 'message-final-branch-reply-1',
			messageId: 'message-final-branch-reactivated',
			body: 'Reactivated hidden branch'
		});
		const reactivated = root.collaboration.getBrowserProjection({
			sessionToken: 'session-admin-final',
			classId: 'class-final',
			lessonId: 'lesson-final-one',
			scope: 'shared'
		});
		expect(reactivated.recentBranchTabs[0].rootMessageId).toBe('message-final-branch-1');
		expect(reactivated.branchMessages['message-final-branch-1']).toHaveLength(3);

		expect(personal.personal?.studentAccountId).toBe('student-one-final');
		expect(personal.personal?.discussion.commonMessages.map((message) => message.body)).toEqual([
			'Personal message'
		]);
		expect(personal.discussion.commonMessages.map((message) => message.body)).not.toContain('Shared root');
		expect(personal.discussion.fieldComments.homework[0].authorLabel).toBe('Student One Final');
		expect(personal.discussion.commonMessages[0].authorLabel).toBe('Student One Final');

		const labels = root.identityAccess.getParticipantLabels([
			'admin-final',
			'student-one-final'
		]);
		expect(labels).toEqual([
			{ accountId: 'admin-final', fullName: 'Admin Final' },
			{ accountId: 'student-one-final', fullName: 'Student One Final' }
		]);
		expect(labels[0]).not.toHaveProperty('role');
		expect(labels[0]).not.toHaveProperty('registeredAt');
		expect(Object.keys(shared.discussion.fieldComments)).toEqual([...SUPPORTED_FIELD_KEYS]);
	});

	it('delegates all five actions and preserves state on unauthorized or forged requests', async () => {
		const seen: string[] = [];
		for (const name of [
			'createFieldComment',
			'editFieldComment',
			'setReaction',
			'createMessage',
			'replyToMessage'
		] as const) {
			const original = root.collaboration[name].bind(root.collaboration);
			(root.collaboration as any)[name] = (request: unknown) => {
				seen.push(name);
				return original(request as never);
			};
		}

		expect(await invoke('createFieldComment', 'session-student-one-final', 'class-final', 'lesson-final-one', [
			['scope', 'personal'],
			['studentAccountId', 'student-one-final'],
			['fieldKey', 'practicalWork'],
			['commentId', 'comment-final-action'],
			['body', 'Action comment']
		])).toEqual({ collaborationSuccess: true });
		expect(await invoke('editFieldComment', 'session-student-one-final', 'class-final', 'lesson-final-one', [
			['commentId', 'comment-final-action'],
			['body', 'Edited action comment']
		])).toEqual({ collaborationSuccess: true });
		expect(await invoke('setReaction', 'session-student-one-final', 'class-final', 'lesson-final-one', [
			['scope', 'personal'],
			['studentAccountId', 'student-one-final'],
			['targetType', 'comment'],
			['targetId', 'comment-final-action'],
			['reaction', 'like']
		])).toEqual({ collaborationSuccess: true });
		expect(await invoke('createMessage', 'session-student-one-final', 'class-final', 'lesson-final-one', [
			['scope', 'personal'],
			['studentAccountId', 'student-one-final'],
			['messageId', 'message-final-action'],
			['body', 'Action message']
		])).toEqual({ collaborationSuccess: true });
		expect(await invoke('replyToMessage', 'session-student-one-final', 'class-final', 'lesson-final-one', [
			['scope', 'personal'],
			['studentAccountId', 'student-one-final'],
			['parentMessageId', 'message-final-action'],
			['messageId', 'message-final-action-reply'],
			['body', 'Action reply']
		])).toEqual({ collaborationSuccess: true });
		expect(seen).toEqual([
			'createFieldComment',
			'editFieldComment',
			'setReaction',
			'createMessage',
			'replyToMessage'
		]);

		const beforeDenied = collaborationState(root);
		const denied = await Promise.all([
			invoke('createMessage', undefined, 'class-final', 'lesson-final-one', [
				['scope', 'shared'], ['messageId', 'message-final-no-cookie'], ['body', 'deny']
			]),
			invoke('createMessage', 'invalid-final-session', 'class-final', 'lesson-final-one', [
				['scope', 'shared'], ['messageId', 'message-final-invalid-session'], ['body', 'deny']
			]),
			invoke('createMessage', 'session-student-one-final', 'class-final', 'lesson-final-one', [
				['scope', 'personal'], ['studentAccountId', 'student-two-final'],
				['messageId', 'message-final-cross-student'], ['body', 'deny']
			]),
			invoke('createMessage', 'session-admin-other-final', 'class-final', 'lesson-final-one', [
				['scope', 'shared'], ['messageId', 'message-final-cross-center'], ['body', 'deny']
			]),
			invoke('createMessage', 'session-teacher-unassigned-final', 'class-final', 'lesson-final-one', [
				['scope', 'shared'], ['messageId', 'message-final-unassigned-teacher'], ['body', 'deny']
			]),
			invoke('createMessage', 'session-admin-final', 'class-final', 'lesson-final-one', [
				['scope', 'shared'], ['messageId', 'message-final-forged-authority'], ['body', 'deny'],
				['role', 'student']
			]),
			invoke('createFieldComment', 'session-admin-final', 'class-final', 'lesson-final-one', [
				['scope', 'shared'], ['fieldKey', 'unsupported'],
				['commentId', 'comment-final-unsupported'], ['body', 'deny']
			]),
			invoke('setReaction', 'session-admin-final', 'class-final', 'lesson-final-one', [
				['scope', 'shared'], ['targetType', 'field'], ['targetId', 'unsupported'], ['reaction', 'like']
			])
		]);
		for (const result of denied) expect(result).toMatchObject({ status: expect.any(Number) });
		expect(collaborationState(root)).toEqual(beforeDenied);
		for (const id of [
			'message-final-no-cookie',
			'message-final-invalid-session',
			'message-final-cross-student',
			'message-final-cross-center',
			'message-final-unassigned-teacher',
			'message-final-forged-authority',
			'comment-final-unsupported',
			'unsupported'
		]) {
			expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM collaboration_messages WHERE id = ? OR body = ?').get(id, 'deny')).toEqual({ count: 0 });
		}

		const crossLessonBefore = root.database.sqlite.prepare(
			'SELECT body FROM collaboration_comments WHERE id = ?'
		).get('comment-final-other-lesson');
		const crossLessonEdit = await invoke('editFieldComment', 'session-admin-final', 'class-final', 'lesson-final-one', [
			['commentId', 'comment-final-other-lesson'],
			['body', 'cross-lesson forged edit']
		]);
		expect(crossLessonEdit).toMatchObject({ status: 403, data: { error: 'comment_forbidden' } });
		expect(root.database.sqlite.prepare(
			'SELECT body FROM collaboration_comments WHERE id = ?'
		).get('comment-final-other-lesson')).toEqual(crossLessonBefore);
	});

	it('records the cross-lesson edit mutation observed through the forged route context', async () => {
		const before = root.database.sqlite.prepare(
			'SELECT body FROM collaboration_comments WHERE id = ?'
		).get('comment-final-other-lesson');
		const result = await invoke('editFieldComment', 'session-admin-final', 'class-final', 'lesson-final-one', [
			['commentId', 'comment-final-other-lesson'],
			['body', 'cross-lesson mutation observed']
		]);
		const after = root.database.sqlite.prepare(
			'SELECT body FROM collaboration_comments WHERE id = ?'
		).get('comment-final-other-lesson');
		expect(result).toEqual({ collaborationSuccess: true });
		expect(before).toEqual({ body: 'Other lesson comment' });
		expect(after).toEqual({ body: 'cross-lesson mutation observed' });
	});

	it('denies protected projection and actions after session, membership, or assignment revocation', async () => {
		const sharedUrl = new URL('https://calendar.test/lesson-context?classId=class-final&lessonId=lesson-final-one');
		expect(loadFailure(() => load({
			url: sharedUrl,
			cookies: { get: () => undefined }
		} as any))).toMatchObject({ status: 403 });
		expect(loadFailure(() => load({
			url: sharedUrl,
			cookies: { get: () => 'invalid-final-session' }
		} as any))).toMatchObject({ status: 403 });

		root.identityAccess.revokeSession('session-student-one-final');
		expect(loadFailure(() => load({
			url: new URL(`${sharedUrl}&studentAccountId=student-one-final`),
			cookies: { get: () => 'session-student-one-final' }
		} as any))).toMatchObject({ status: 403 });

		const beforeMembershipDenial = collaborationState(root);
		root.database.sqlite.prepare(
			'DELETE FROM center_memberships WHERE center_id = ? AND account_id = ?'
		).run('center-final', 'student-two-final');
		const memberDenied = await invoke('createMessage', 'session-student-two-final', 'class-final', 'lesson-final-one', [
			['scope', 'personal'], ['studentAccountId', 'student-two-final'],
			['messageId', 'message-final-removed-membership'], ['body', 'deny']
		]);
		expect(memberDenied).toMatchObject({ status: 403, data: { error: 'message_forbidden' } });
		expect(collaborationState(root)).toEqual(beforeMembershipDenial);

		const beforeAssignmentDenial = collaborationState(root);
		root.database.sqlite.prepare(
			'DELETE FROM teacher_assignments WHERE class_id = ? AND teacher_account_id = ?'
		).run('class-final', 'teacher-final');
		const assignmentDenied = await invoke('createMessage', 'session-teacher-final', 'class-final', 'lesson-final-one', [
			['scope', 'shared'], ['messageId', 'message-final-removed-assignment'], ['body', 'deny']
		]);
		expect(assignmentDenied).toMatchObject({ status: 403, data: { error: 'message_forbidden' } });
		expect(collaborationState(root)).toEqual(beforeAssignmentDenial);
	});
});
