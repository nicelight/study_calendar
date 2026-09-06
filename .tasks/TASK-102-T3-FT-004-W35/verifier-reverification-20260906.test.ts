import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const routeRoot = vi.hoisted(() => ({ current: undefined as any }));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../../src/lib/server/composition-root')>();
	return { ...actual, getCompositionRoot: () => routeRoot.current };
});

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { actions, load } from '../../src/routes/lesson-context/+page.server';
import {
	STANDARD_REACTIONS,
	SUPPORTED_FIELD_KEYS
} from '../../src/lib/server/modules/collaboration/public';

type ActionName = Exclude<keyof typeof actions, 'default'>;

function actionEvent(
	sessionToken: string | undefined,
	classId: string,
	lessonId: string,
	fields: Array<[string, string]>,
	query = ''
) {
	const url = new URL(
		`https://calendar.test/lesson-context?classId=${classId}&lessonId=${lessonId}${query}`
	);
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
	name: ActionName,
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

function protectedLoad(sessionToken: string | undefined, query: string) {
	return load({
		url: new URL(`https://calendar.test/lesson-context?${query}`),
		cookies: { get: () => sessionToken }
	} as any);
}

function createFixture(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES
			('center-vr', 'Verifier Center'),
			('center-other-vr', 'Other Verifier Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-vr', 'admin'),
			('admin-other-vr', 'admin'),
			('teacher-vr', 'teacher'),
			('teacher-unassigned-vr', 'teacher'),
			('student-one-vr', 'student'),
			('student-two-vr', 'student'),
			('parent-vr', 'parent');
		INSERT INTO account_profiles (account_id, full_name, registered_at) VALUES
			('admin-vr', 'Admin Verifier', '2026-01-01T00:00:00.000Z'),
			('admin-other-vr', 'Other Admin Verifier', '2026-01-01T00:00:00.000Z'),
			('teacher-vr', 'Teacher Verifier', '2026-01-01T00:00:00.000Z'),
			('teacher-unassigned-vr', 'Unassigned Teacher Verifier', '2026-01-01T00:00:00.000Z'),
			('student-one-vr', 'Student One Verifier', '2026-01-01T00:00:00.000Z'),
			('student-two-vr', 'Student Two Verifier', '2026-01-01T00:00:00.000Z'),
			('parent-vr', 'Parent Verifier', '2026-01-01T00:00:00.000Z');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-vr', 'admin-vr', NULL),
			('session-admin-other-vr', 'admin-other-vr', NULL),
			('session-teacher-vr', 'teacher-vr', NULL),
			('session-teacher-unassigned-vr', 'teacher-unassigned-vr', NULL),
			('session-student-one-vr', 'student-one-vr', NULL),
			('session-student-two-vr', 'student-two-vr', NULL),
			('session-parent-vr', 'parent-vr', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-vr', 'admin-vr'),
			('center-vr', 'teacher-vr'),
			('center-vr', 'teacher-unassigned-vr'),
			('center-vr', 'student-one-vr'),
			('center-vr', 'student-two-vr'),
			('center-vr', 'parent-vr'),
			('center-other-vr', 'admin-other-vr');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('class-vr', 'center-vr', 'Verifier Class', 'group'),
			('class-foreign-vr', 'center-vr', 'Foreign Verifier Class', 'group'),
			('class-other-vr', 'center-other-vr', 'Other Verifier Class', 'group');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('center-vr', 'class-vr', 'student-one-vr'),
			('center-vr', 'class-vr', 'student-two-vr');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
			VALUES ('center-vr', 'class-vr', 'teacher-vr');
		INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id)
			VALUES ('center-vr', 'parent-vr', 'student-one-vr');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES
			('schedule-vr', 'center-vr', 'class-vr', '2026-09-01', '2026-09-30', '[1]', 'admin-vr', '2026-09-01T00:00:00.000Z'),
			('schedule-foreign-vr', 'center-vr', 'class-foreign-vr', '2026-09-01', '2026-09-30', '[1]', 'admin-vr', '2026-09-01T00:00:00.000Z'),
			('schedule-other-vr', 'center-other-vr', 'class-other-vr', '2026-09-01', '2026-09-30', '[1]', 'admin-other-vr', '2026-09-01T00:00:00.000Z');
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES
			('lesson-vr-one', 'center-vr', 'class-vr', 'schedule-vr', '2026-09-07', 'planned', 'admin-vr', '2026-09-01T00:00:00.000Z'),
			('lesson-vr-two', 'center-vr', 'class-vr', 'schedule-vr', '2026-09-14', 'planned', 'admin-vr', '2026-09-01T00:00:00.000Z'),
			('lesson-foreign-vr', 'center-vr', 'class-foreign-vr', 'schedule-foreign-vr', '2026-09-07', 'planned', 'admin-vr', '2026-09-01T00:00:00.000Z'),
			('lesson-other-vr', 'center-other-vr', 'class-other-vr', 'schedule-other-vr', '2026-09-07', 'planned', 'admin-other-vr', '2026-09-01T00:00:00.000Z');
	`);
	root.lessonContext.setSharedLessonMaterial({
		sessionToken: 'session-admin-vr',
		classId: 'class-vr',
		lessonId: 'lesson-vr-one',
		topic: 'Verifier topic',
		practicalWork: 'Verifier practice',
		homework: 'Verifier homework'
	});
	root.lessonContext.setSharedLessonMaterial({
		sessionToken: 'session-admin-vr',
		classId: 'class-vr',
		lessonId: 'lesson-vr-two',
		topic: 'Verifier topic two',
		practicalWork: 'Verifier practice two',
		homework: 'Verifier homework two'
	});
	root.collaboration.createFieldComment({
		sessionToken: 'session-admin-vr',
		classId: 'class-vr',
		lessonId: 'lesson-vr-one',
		scope: 'shared',
		fieldKey: 'topic',
		commentId: 'comment-vr-shared',
		body: 'Shared verifier comment'
	});
	root.collaboration.createFieldComment({
		sessionToken: 'session-admin-vr',
		classId: 'class-vr',
		lessonId: 'lesson-vr-two',
		scope: 'shared',
		fieldKey: 'topic',
		commentId: 'comment-vr-other-lesson',
		body: 'Other lesson verifier comment'
	});
	root.collaboration.createMessage({
		sessionToken: 'session-admin-vr',
		classId: 'class-vr',
		lessonId: 'lesson-vr-one',
		scope: 'shared',
		messageId: 'message-vr-root',
		body: 'Shared verifier root'
	});
	root.collaboration.replyToMessage({
		sessionToken: 'session-teacher-vr',
		classId: 'class-vr',
		lessonId: 'lesson-vr-one',
		scope: 'shared',
		parentMessageId: 'message-vr-root',
		messageId: 'message-vr-reply',
		body: 'Shared verifier reply'
	});
	root.collaboration.replyToMessage({
		sessionToken: 'session-student-one-vr',
		classId: 'class-vr',
		lessonId: 'lesson-vr-one',
		scope: 'shared',
		parentMessageId: 'message-vr-reply',
		messageId: 'message-vr-nested',
		body: 'Nested verifier reply'
	});
	root.collaboration.createFieldComment({
		sessionToken: 'session-student-one-vr',
		classId: 'class-vr',
		lessonId: 'lesson-vr-one',
		scope: 'personal',
		studentAccountId: 'student-one-vr',
		fieldKey: 'homework',
		commentId: 'comment-vr-personal',
		body: 'Personal verifier comment'
	});
	root.collaboration.createMessage({
		sessionToken: 'session-student-one-vr',
		classId: 'class-vr',
		lessonId: 'lesson-vr-one',
		scope: 'personal',
		studentAccountId: 'student-one-vr',
		messageId: 'message-vr-personal',
		body: 'Personal verifier message'
	});
	return root;
}

describe('TASK-102 fresh post-REQ-014 verification', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createFixture();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it('proves the named route contract and complete server-composed projection', () => {
		const pageSource = readFileSync(resolve(process.cwd(), 'src/routes/lesson-context/+page.svelte'), 'utf8');
		const routeSource = readFileSync(resolve(process.cwd(), 'src/routes/lesson-context/+page.server.ts'), 'utf8');
		expect(Object.keys(actions).sort()).toEqual([
			'completeHomework', 'createFieldComment', 'createHomework', 'createMessage',
			'createPayment', 'editFieldComment', 'recordGrade', 'replyToMessage',
			'saveAttendance', 'setReaction', 'setSharedLessonMaterial'
		]);
		expect(routeSource).not.toMatch(/\bdefault\s*:/);
		expect(pageSource).not.toMatch(/name="action"/);
		for (const action of [
			'saveAttendance', 'createHomework', 'completeHomework', 'recordGrade',
			'setSharedLessonMaterial', 'createPayment'
		]) expect(pageSource).toContain(`action={actionHref('${action}')}`);
		expect(pageSource).toContain('const studentAccountId = context?.navigation.studentAccountId;');
		expect(pageSource).toContain("params.set('studentAccountId', studentAccountId);");
		const personalPageUrl = new URL(
			'https://calendar.test/lesson-context?classId=class-vr&lessonId=lesson-vr-one&studentAccountId=student-one-vr'
		);
		const namedActionUrl = new URL(
			'?classId=class-vr&lessonId=lesson-vr-one&studentAccountId=student-one-vr&/completeHomework',
			personalPageUrl
		);
		expect(namedActionUrl.searchParams.get('classId')).toBe('class-vr');
		expect(namedActionUrl.searchParams.get('lessonId')).toBe('lesson-vr-one');
		expect(namedActionUrl.searchParams.get('studentAccountId')).toBe('student-one-vr');

		for (const [index, reaction] of STANDARD_REACTIONS.entries()) {
			root.collaboration.setReaction({
				sessionToken: [
					'session-admin-vr', 'session-teacher-vr', 'session-student-one-vr',
					'session-student-two-vr', 'session-parent-vr'
				][index],
				classId: 'class-vr', lessonId: 'lesson-vr-one', scope: 'shared',
				targetType: 'field', targetId: 'topic', reaction
			});
		}
		root.collaboration.setReaction({
			sessionToken: 'session-student-two-vr', classId: 'class-vr', lessonId: 'lesson-vr-one',
			scope: 'shared', targetType: 'comment', targetId: 'comment-vr-shared', reaction: 'love'
		});
		root.collaboration.setReaction({
			sessionToken: 'session-teacher-vr', classId: 'class-vr', lessonId: 'lesson-vr-one',
			scope: 'shared', targetType: 'message', targetId: 'message-vr-root', reaction: 'celebrate'
		});
		for (let index = 1; index <= 11; index += 1) {
			root.collaboration.createMessage({
				sessionToken: 'session-admin-vr', classId: 'class-vr', lessonId: 'lesson-vr-one',
				scope: 'shared', messageId: `message-vr-branch-${index}`, body: `Branch ${index}`
			});
			root.collaboration.replyToMessage({
				sessionToken: 'session-admin-vr', classId: 'class-vr', lessonId: 'lesson-vr-one',
				scope: 'shared', parentMessageId: `message-vr-branch-${index}`,
				messageId: `message-vr-branch-reply-${index}`, body: `Reply ${index}`
			});
		}

		const shared = root.lessonContext.getDayContext({
			sessionToken: 'session-admin-vr', classId: 'class-vr', lessonId: 'lesson-vr-one'
		});
		const personal = root.lessonContext.getDayContext({
			sessionToken: 'session-parent-vr', classId: 'class-vr', lessonId: 'lesson-vr-one',
			studentAccountId: 'student-one-vr'
		});
		expect(shared.discussion.fieldComments.topic[0]).toMatchObject({
			commentId: 'comment-vr-shared', authorLabel: 'Admin Verifier', body: 'Shared verifier comment'
		});
		expect(shared.discussion.fieldReactions.topic.map((item) => item.reaction).sort())
			.toEqual([...STANDARD_REACTIONS].sort());
		expect(shared.discussion.fieldReactions.topic[0]).toHaveProperty('reactorLabel');
		expect(shared.discussion.fieldComments.topic[0].reactions[0]).toHaveProperty('reactorLabel');
		expect(shared.discussion.commonMessages.some((item) => item.messageId === 'message-vr-nested')).toBe(true);
		expect(shared.discussion.recentBranchTabs).toHaveLength(10);
		expect(shared.discussion.recentBranchTabs.map((item) => item.rootMessageId))
			.not.toContain('message-vr-branch-1');
		expect(shared.discussion.commonMessages.some((item) => item.messageId === 'message-vr-branch-reply-1')).toBe(true);
		root.collaboration.replyToMessage({
			sessionToken: 'session-admin-vr', classId: 'class-vr', lessonId: 'lesson-vr-one',
			scope: 'shared', parentMessageId: 'message-vr-branch-reply-1',
			messageId: 'message-vr-branch-reactivated', body: 'Reactivated hidden branch'
		});
		const reactivated = root.collaboration.getBrowserProjection({
			sessionToken: 'session-admin-vr', classId: 'class-vr', lessonId: 'lesson-vr-one', scope: 'shared'
		});
		expect(reactivated.recentBranchTabs[0].rootMessageId).toBe('message-vr-branch-1');
		expect(reactivated.branchMessages['message-vr-branch-1']).toHaveLength(3);
		expect(personal.personal?.studentAccountId).toBe('student-one-vr');
		expect(personal.personal?.discussion.commonMessages.map((item) => item.body))
			.toEqual(['Personal verifier message']);
		expect(personal.discussion.commonMessages.map((item) => item.body))
			.not.toContain('Shared verifier root');
		expect(Object.keys(shared.discussion.fieldComments)).toEqual([...SUPPORTED_FIELD_KEYS]);
		const labels = root.identityAccess.getParticipantLabels(['admin-vr', 'student-one-vr']);
		expect(labels).toEqual([
			{ accountId: 'admin-vr', fullName: 'Admin Verifier' },
			{ accountId: 'student-one-vr', fullName: 'Student One Verifier' }
		]);
		expect(labels[0]).not.toHaveProperty('role');
		expect(labels[0]).not.toHaveProperty('registeredAt');
		const loaded = protectedLoad('session-parent-vr', 'classId=class-vr&lessonId=lesson-vr-one&studentAccountId=student-one-vr') as any;
		expect(loaded.dayContext.mode).toBe('personal');
		expect(loaded.dayContext.personal.studentAccountId).toBe('student-one-vr');
	});

	it('delegates every named Collaboration action and preserves state for denied contexts', async () => {
		const seen: string[] = [];
		for (const name of ['createFieldComment', 'editFieldComment', 'setReaction', 'createMessage', 'replyToMessage'] as const) {
			const original = root.collaboration[name].bind(root.collaboration);
			(root.collaboration as any)[name] = (request: unknown) => {
				seen.push(name);
				return original(request as never);
			};
		}
		expect(await invoke('createFieldComment', 'session-student-one-vr', 'class-vr', 'lesson-vr-one', [
			['scope', 'personal'], ['studentAccountId', 'student-one-vr'], ['fieldKey', 'practicalWork'],
			['commentId', 'comment-vr-action'], ['body', 'Action comment']
		])).toEqual({ collaborationSuccess: true });
		expect(await invoke('editFieldComment', 'session-student-one-vr', 'class-vr', 'lesson-vr-one', [
			['commentId', 'comment-vr-action'], ['body', 'Edited action comment']
		], '&studentAccountId=student-one-vr')).toEqual({ collaborationSuccess: true });
		expect(await invoke('setReaction', 'session-student-one-vr', 'class-vr', 'lesson-vr-one', [
			['scope', 'personal'], ['studentAccountId', 'student-one-vr'], ['targetType', 'comment'],
			['targetId', 'comment-vr-action'], ['reaction', 'like']
		])).toEqual({ collaborationSuccess: true });
		expect(await invoke('createMessage', 'session-student-one-vr', 'class-vr', 'lesson-vr-one', [
			['scope', 'personal'], ['studentAccountId', 'student-one-vr'], ['messageId', 'message-vr-action'],
			['body', 'Action message']
		])).toEqual({ collaborationSuccess: true });
		expect(await invoke('replyToMessage', 'session-student-one-vr', 'class-vr', 'lesson-vr-one', [
			['scope', 'personal'], ['studentAccountId', 'student-one-vr'], ['parentMessageId', 'message-vr-action'],
			['messageId', 'message-vr-action-reply'], ['body', 'Action reply']
		])).toEqual({ collaborationSuccess: true });
		expect(seen).toEqual(['createFieldComment', 'editFieldComment', 'setReaction', 'createMessage', 'replyToMessage']);

		const beforeDenied = collaborationState(root);
		const denied = await Promise.all([
			invoke('createMessage', undefined, 'class-vr', 'lesson-vr-one', [
				['scope', 'shared'], ['messageId', 'message-vr-no-cookie'], ['body', 'deny']
			]),
			invoke('createMessage', 'invalid-vr-session', 'class-vr', 'lesson-vr-one', [
				['scope', 'shared'], ['messageId', 'message-vr-invalid'], ['body', 'deny']
			]),
			invoke('createMessage', 'session-student-one-vr', 'class-vr', 'lesson-vr-one', [
				['scope', 'personal'], ['studentAccountId', 'student-two-vr'],
				['messageId', 'message-vr-cross-student'], ['body', 'deny']
			]),
			invoke('createMessage', 'session-student-one-vr', 'class-foreign-vr', 'lesson-foreign-vr', [
				['scope', 'shared'], ['messageId', 'message-vr-cross-class'], ['body', 'deny']
			]),
			invoke('createMessage', 'session-parent-vr', 'class-vr', 'lesson-vr-one', [
				['scope', 'personal'], ['studentAccountId', 'student-two-vr'],
				['messageId', 'message-vr-parent-cross-student'], ['body', 'deny']
			]),
			invoke('createMessage', 'session-admin-other-vr', 'class-vr', 'lesson-vr-one', [
				['scope', 'shared'], ['messageId', 'message-vr-cross-center'], ['body', 'deny']
			]),
			invoke('createMessage', 'session-teacher-unassigned-vr', 'class-vr', 'lesson-vr-one', [
				['scope', 'shared'], ['messageId', 'message-vr-unassigned'], ['body', 'deny']
			]),
			invoke('createMessage', 'session-admin-vr', 'class-vr', 'lesson-vr-one', [
				['scope', 'shared'], ['messageId', 'message-vr-forged'], ['body', 'deny'], ['role', 'student']
			]),
			invoke('createFieldComment', 'session-admin-vr', 'class-vr', 'lesson-vr-one', [
				['scope', 'shared'], ['fieldKey', 'unsupported'], ['commentId', 'comment-vr-unsupported'], ['body', 'deny']
			]),
			invoke('setReaction', 'session-admin-vr', 'class-vr', 'lesson-vr-one', [
				['scope', 'shared'], ['targetType', 'field'], ['targetId', 'unsupported'], ['reaction', 'like']
			])
		]);
		for (const result of denied) expect(result).toMatchObject({ status: expect.any(Number) });
		expect(collaborationState(root)).toEqual(beforeDenied);
		const ownerBefore = root.database.sqlite.prepare(
			'SELECT body FROM collaboration_comments WHERE id = ?'
		).get('comment-vr-shared');
		const wrongOwner = await invoke('editFieldComment', 'session-student-one-vr', 'class-vr', 'lesson-vr-one', [
			['commentId', 'comment-vr-shared'], ['body', 'wrong owner']
		]);
		expect(wrongOwner).toMatchObject({ status: 403 });
		expect(root.database.sqlite.prepare(
			'SELECT body FROM collaboration_comments WHERE id = ?'
		).get('comment-vr-shared')).toEqual(ownerBefore);
		const beforeParentProjection = collaborationState(root);
		expect(() => protectedLoad('session-parent-vr',
			'classId=class-vr&lessonId=lesson-vr-one&studentAccountId=student-two-vr')).toThrow();
		expect(collaborationState(root)).toEqual(beforeParentProjection);
	});

	it('denies no-cookie, invalid/revoked sessions, removed membership/assignment before state change', async () => {
		expect(() => protectedLoad(undefined, 'classId=class-vr&lessonId=lesson-vr-one')).toThrow();
		expect(() => protectedLoad('invalid-vr-session', 'classId=class-vr&lessonId=lesson-vr-one')).toThrow();
		const beforeMembership = collaborationState(root);
		root.database.sqlite.prepare(
			'DELETE FROM center_memberships WHERE center_id = ? AND account_id = ?'
		).run('center-vr', 'student-two-vr');
		const removedMember = await invoke('createMessage', 'session-student-two-vr', 'class-vr', 'lesson-vr-one', [
			['scope', 'personal'], ['studentAccountId', 'student-two-vr'],
			['messageId', 'message-vr-removed-member'], ['body', 'deny']
		]);
		expect(removedMember).toMatchObject({ status: 403 });
		expect(collaborationState(root)).toEqual(beforeMembership);

		const beforeAssignment = collaborationState(root);
		root.database.sqlite.prepare(
			'DELETE FROM teacher_assignments WHERE class_id = ? AND teacher_account_id = ?'
		).run('class-vr', 'teacher-vr');
		const removedTeacher = await invoke('createMessage', 'session-teacher-vr', 'class-vr', 'lesson-vr-one', [
			['scope', 'shared'], ['messageId', 'message-vr-removed-assignment'], ['body', 'deny']
		]);
		expect(removedTeacher).toMatchObject({ status: 403 });
		expect(collaborationState(root)).toEqual(beforeAssignment);

		root.identityAccess.revokeSession('session-student-one-vr');
		const beforeSession = collaborationState(root);
		const revoked = await invoke('createMessage', 'session-student-one-vr', 'class-vr', 'lesson-vr-one', [
			['scope', 'personal'], ['studentAccountId', 'student-one-vr'],
			['messageId', 'message-vr-revoked'], ['body', 'deny']
		]);
		expect(revoked).toMatchObject({ status: 403 });
		expect(collaborationState(root)).toEqual(beforeSession);
		expect(() => protectedLoad('session-student-one-vr',
		'classId=class-vr&lessonId=lesson-vr-one&studentAccountId=student-one-vr')).toThrow();
	});
});
