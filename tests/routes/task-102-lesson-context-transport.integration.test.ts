import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const routeRoot = vi.hoisted(() => ({ current: undefined as any }));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../../src/lib/server/composition-root')>();
	return { ...actual, getCompositionRoot: () => routeRoot.current };
});

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { actions as lessonContextActions } from '../../src/routes/lesson-context/+page.server';

type ActionName = Exclude<keyof typeof lessonContextActions, 'default'>;

function actionEvent(
	sessionToken: string | undefined,
	classId: string,
	lessonId: string,
	fields: Array<[string, string]>,
	extraQuery = ''
) {
	const url = new URL(
		`https://calendar.test/lesson-context?classId=${classId}&lessonId=${lessonId}${extraQuery}`
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
	extraQuery = ''
) {
	return lessonContextActions[name](
		actionEvent(sessionToken, classId, lessonId, fields, extraQuery)
	);
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

function createFixture(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES
			('center-transport', 'Transport Center'),
			('center-other-transport', 'Other Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-transport', 'admin'),
			('admin-other-transport', 'admin'),
			('teacher-transport', 'teacher'),
			('teacher-unassigned-transport', 'teacher'),
			('student-one-transport', 'student'),
			('student-two-transport', 'student'),
			('parent-transport', 'parent');
		INSERT INTO account_profiles (account_id, full_name, registered_at) VALUES
			('admin-transport', 'Admin Transport', '2026-01-01T00:00:00.000Z'),
			('admin-other-transport', 'Admin Other', '2026-01-01T00:00:00.000Z'),
			('teacher-transport', 'Teacher Transport', '2026-01-01T00:00:00.000Z'),
			('teacher-unassigned-transport', 'Teacher Unassigned', '2026-01-01T00:00:00.000Z'),
			('student-one-transport', 'Student One', '2026-01-01T00:00:00.000Z'),
			('student-two-transport', 'Student Two', '2026-01-01T00:00:00.000Z'),
			('parent-transport', 'Parent Transport', '2026-01-01T00:00:00.000Z');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-transport', 'admin-transport', NULL),
			('session-admin-other-transport', 'admin-other-transport', NULL),
			('session-teacher-transport', 'teacher-transport', NULL),
			('session-teacher-unassigned-transport', 'teacher-unassigned-transport', NULL),
			('session-student-one-transport', 'student-one-transport', NULL),
			('session-student-two-transport', 'student-two-transport', NULL),
			('session-parent-transport', 'parent-transport', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-transport', 'admin-transport'),
			('center-transport', 'teacher-transport'),
			('center-transport', 'teacher-unassigned-transport'),
			('center-transport', 'student-one-transport'),
			('center-transport', 'student-two-transport'),
			('center-transport', 'parent-transport'),
			('center-other-transport', 'admin-other-transport');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('class-transport', 'center-transport', 'Transport Class', 'group'),
			('class-other-transport', 'center-other-transport', 'Other Class', 'group');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('center-transport', 'class-transport', 'student-one-transport'),
			('center-transport', 'class-transport', 'student-two-transport');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
			VALUES ('center-transport', 'class-transport', 'teacher-transport');
		INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id)
			VALUES ('center-transport', 'parent-transport', 'student-one-transport');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES
			('schedule-transport', 'center-transport', 'class-transport', '2026-09-01', '2026-09-30', '[1]', 'admin-transport', '2026-09-01T00:00:00.000Z'),
			('schedule-other-transport', 'center-other-transport', 'class-other-transport', '2026-09-01', '2026-09-30', '[1]', 'admin-other-transport', '2026-09-01T00:00:00.000Z');
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES
			('lesson-transport', 'center-transport', 'class-transport', 'schedule-transport', '2026-09-07', 'planned', 'admin-transport', '2026-09-01T00:00:00.000Z'),
			('lesson-other-transport', 'center-other-transport', 'class-other-transport', 'schedule-other-transport', '2026-09-07', 'planned', 'admin-other-transport', '2026-09-01T00:00:00.000Z');
	`);
	root.lessonContext.setSharedLessonMaterial({
		sessionToken: 'session-admin-transport',
		classId: 'class-transport',
		lessonId: 'lesson-transport',
		topic: 'Kinematics',
		practicalWork: 'Measure velocity',
		homework: 'Solve exercise 4'
	});
	root.collaboration.createFieldComment({
		sessionToken: 'session-admin-transport',
		classId: 'class-transport',
		lessonId: 'lesson-transport',
		scope: 'shared',
		fieldKey: 'topic',
		commentId: 'comment-shared-transport',
		body: 'Shared topic note'
	});
	root.collaboration.createMessage({
		sessionToken: 'session-admin-transport',
		classId: 'class-transport',
		lessonId: 'lesson-transport',
		scope: 'shared',
		messageId: 'message-root-transport',
		body: 'Shared root'
	});
	root.collaboration.replyToMessage({
		sessionToken: 'session-teacher-transport',
		classId: 'class-transport',
		lessonId: 'lesson-transport',
		scope: 'shared',
		parentMessageId: 'message-root-transport',
		messageId: 'message-reply-transport',
		body: 'Shared reply'
	});
	root.collaboration.setReaction({
		sessionToken: 'session-student-one-transport',
		classId: 'class-transport',
		lessonId: 'lesson-transport',
		scope: 'shared',
		targetType: 'field',
		targetId: 'topic',
		reaction: 'like'
	});
	root.collaboration.createMessage({
		sessionToken: 'session-student-one-transport',
		classId: 'class-transport',
		lessonId: 'lesson-transport',
		scope: 'personal',
		studentAccountId: 'student-one-transport',
		messageId: 'message-personal-transport',
		body: 'Personal note'
	});
	return root;
}

describe('TASK-102 Lesson Context Collaboration projection and transport', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createFixture();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it('composes shared and personal content with bounded participant labels', () => {
		const labels = root.identityAccess.getParticipantLabels([
			'admin-transport',
			'student-one-transport'
		]);
		expect(labels).toEqual([
			{ accountId: 'admin-transport', fullName: 'Admin Transport' },
			{ accountId: 'student-one-transport', fullName: 'Student One' }
		]);
		expect(labels[0]).not.toHaveProperty('registeredAt');

		const shared = root.lessonContext.getDayContext({
			sessionToken: 'session-admin-transport',
			classId: 'class-transport',
			lessonId: 'lesson-transport'
		});
		const personal = root.lessonContext.getDayContext({
			sessionToken: 'session-student-one-transport',
			classId: 'class-transport',
			lessonId: 'lesson-transport',
			studentAccountId: 'student-one-transport'
		});

		expect(shared.discussion.fieldComments.topic).toEqual([
			expect.objectContaining({
				commentId: 'comment-shared-transport',
				authorLabel: 'Admin Transport',
				body: 'Shared topic note'
			})
		]);
		expect(shared.discussion.fieldReactions.topic).toEqual([
			expect.objectContaining({ reactorLabel: 'Student One' })
		]);
		expect(shared.discussion.commonMessages.map((message) => message.body)).toEqual([
			'Shared root',
			'Shared reply'
		]);
		expect(shared.discussion.recentBranchTabs).toHaveLength(1);
		expect(shared.discussion.branchMessages['message-root-transport']).toHaveLength(2);
		expect(personal.personal?.discussion.commonMessages.map((message) => message.body)).toEqual([
			'Personal note'
		]);
		expect(personal.discussion.commonMessages.map((message) => message.body)).not.toContain(
			'Shared root'
		);
	});

	it('delegates all five named mutations and rejects forged or revoked contexts before mutation', async () => {
		const invalidBefore = collaborationState(root);
		const invalidComment = await invoke(
			'createFieldComment',
			'session-admin-transport',
			'class-transport',
			'lesson-transport',
			[
				['scope', 'shared'],
				['fieldKey', 'unsupported-field'],
				['commentId', 'comment-unsupported-route-transport'],
				['body', 'must be rejected']
			]
		);
		const invalidReaction = await invoke(
			'setReaction',
			'session-admin-transport',
			'class-transport',
			'lesson-transport',
			[
				['scope', 'shared'],
				['targetType', 'field'],
				['targetId', 'unsupported-field'],
				['reaction', 'like']
			]
		);
		expect(invalidComment).toMatchObject({ status: 400, data: { error: 'comment_invalid' } });
		expect(invalidReaction).toMatchObject({ status: 400, data: { error: 'reaction_invalid' } });
		expect(collaborationState(root)).toEqual(invalidBefore);

		const createdComment = await invoke(
			'createFieldComment',
			'session-student-one-transport',
			'class-transport',
			'lesson-transport',
			[
				['scope', 'personal'],
				['studentAccountId', 'student-one-transport'],
				['fieldKey', 'homework'],
				['commentId', 'comment-route-transport'],
				['body', 'Personal field note']
			]
		);
		expect(createdComment).toEqual({ collaborationSuccess: true });

		const editedComment = await invoke(
			'editFieldComment',
			'session-student-one-transport',
			'class-transport',
			'lesson-transport',
			[
				['commentId', 'comment-route-transport'],
				['body', 'Edited personal field note']
			],
			'&studentAccountId=student-one-transport'
		);
		expect(editedComment).toEqual({ collaborationSuccess: true });

		const reaction = await invoke(
			'setReaction',
			'session-student-one-transport',
			'class-transport',
			'lesson-transport',
			[
				['scope', 'personal'],
				['studentAccountId', 'student-one-transport'],
				['targetType', 'comment'],
				['targetId', 'comment-route-transport'],
				['reaction', 'love']
			]
		);
		expect(reaction).toEqual({ collaborationSuccess: true });

		const message = await invoke(
			'createMessage',
			'session-student-one-transport',
			'class-transport',
			'lesson-transport',
			[
				['scope', 'personal'],
				['studentAccountId', 'student-one-transport'],
				['messageId', 'message-route-transport'],
				['body', 'Route personal message']
			]
		);
		expect(message).toEqual({ collaborationSuccess: true });

		const reply = await invoke(
			'replyToMessage',
			'session-student-one-transport',
			'class-transport',
			'lesson-transport',
			[
				['scope', 'personal'],
				['studentAccountId', 'student-one-transport'],
				['parentMessageId', 'message-route-transport'],
				['messageId', 'reply-route-transport'],
				['body', 'Route personal reply']
			]
		);
		expect(reply).toEqual({ collaborationSuccess: true });

		const unchangedCases: Array<Promise<unknown>> = [
			invoke(
				'createMessage',
				undefined,
				'class-transport',
				'lesson-transport',
				[
					['scope', 'shared'],
					['messageId', 'message-no-cookie-transport'],
					['body', 'must deny']
				]
			),
			invoke(
				'createMessage',
				'invalid-session-transport',
				'class-transport',
				'lesson-transport',
				[
					['scope', 'shared'],
					['messageId', 'message-invalid-session-transport'],
					['body', 'must deny']
				]
			),
			invoke(
				'createMessage',
				'session-student-one-transport',
				'class-transport',
				'lesson-transport',
				[
					['scope', 'personal'],
					['studentAccountId', 'student-two-transport'],
					['messageId', 'message-cross-student-transport'],
					['body', 'must deny']
				]
			),
			invoke(
				'createMessage',
				'session-admin-other-transport',
				'class-transport',
				'lesson-transport',
				[
					['scope', 'shared'],
					['messageId', 'message-cross-center-transport'],
					['body', 'must deny']
				]
			),
			invoke(
				'createMessage',
				'session-admin-transport',
				'class-transport',
				'lesson-transport',
				[
					['scope', 'shared'],
					['messageId', 'message-forged-authority-transport'],
					['body', 'must deny'],
					['role', 'student']
				]
			)
		];
		const beforeDenied = collaborationState(root);
		const denied = await Promise.all(unchangedCases);
		for (const result of denied) {
			expect(result).toMatchObject({ status: expect.any(Number), data: { error: expect.any(String) } });
		}
		expect(collaborationState(root)).toEqual(beforeDenied);

		root.database.sqlite
			.prepare('DELETE FROM teacher_assignments WHERE teacher_account_id = ?')
			.run('teacher-transport');
		const beforeTeacherRevocation = collaborationState(root);
		const revokedTeacher = await invoke(
			'createMessage',
			'session-teacher-transport',
			'class-transport',
			'lesson-transport',
			[
				['scope', 'shared'],
				['messageId', 'message-revoked-teacher-transport'],
				['body', 'must deny']
			]
		);
		expect(revokedTeacher).toMatchObject({ status: 403 });
		expect(collaborationState(root)).toEqual(beforeTeacherRevocation);

		root.identityAccess.revokeSession('session-student-one-transport');
		const beforeRevokedSession = collaborationState(root);
		const revokedSession = await invoke(
			'createMessage',
			'session-student-one-transport',
			'class-transport',
			'lesson-transport',
			[
				['scope', 'personal'],
				['studentAccountId', 'student-one-transport'],
				['messageId', 'message-revoked-session-transport'],
				['body', 'must deny']
			]
		);
		expect(revokedSession).toMatchObject({ status: 403 });
		expect(collaborationState(root)).toEqual(beforeRevokedSession);
	});

	it('denies a removed membership before projection and does not disclose retained data', () => {
		root.database.sqlite
			.prepare('DELETE FROM center_memberships WHERE account_id = ?')
			.run('student-one-transport');

		expect(() =>
			root.lessonContext.getDayContext({
				sessionToken: 'session-student-one-transport',
				classId: 'class-transport',
				lessonId: 'lesson-transport',
				studentAccountId: 'student-one-transport'
			})
		).toThrow('not-authorized');
		expect(root.database.sqlite
			.prepare('SELECT body FROM collaboration_messages WHERE id = ?')
			.get('message-personal-transport')).toEqual({ body: 'Personal note' });
	});
});
