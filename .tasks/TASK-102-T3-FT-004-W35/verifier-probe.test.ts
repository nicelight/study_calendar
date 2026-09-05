import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const routeRoot = vi.hoisted(() => ({ current: undefined as any }));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../../src/lib/server/composition-root')>();
	return { ...actual, getCompositionRoot: () => routeRoot.current };
});

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { actions, load } from '../../src/routes/lesson-context/+page.server';

function event(
	sessionToken: string | undefined,
	classId: string,
	lessonId: string,
	fields: Array<[string, string]> = [],
	studentAccountId?: string
) {
	const url = new URL('https://calendar.test/lesson-context');
	url.searchParams.set('classId', classId);
	url.searchParams.set('lessonId', lessonId);
	if (studentAccountId) url.searchParams.set('studentAccountId', studentAccountId);
	const formData = new FormData();
	for (const [name, value] of fields) formData.append(name, value);
	return {
		url,
		request: new Request(url, { method: 'POST', body: formData }),
		cookies: { get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined) }
	} as any;
}

function fixture(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-probe', 'Probe Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-probe', 'admin'), ('student-probe', 'student');
		INSERT INTO account_profiles (account_id, full_name, registered_at) VALUES
			('admin-probe', 'Admin Probe', '2026-01-01T00:00:00.000Z'),
			('student-probe', 'Student Probe', '2026-01-01T00:00:00.000Z');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-probe', 'admin-probe', NULL),
			('session-student-probe', 'student-probe', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-probe', 'admin-probe'), ('center-probe', 'student-probe');
		INSERT INTO classes (id, center_id, name, mode)
			VALUES ('class-probe', 'center-probe', 'Probe Class', 'group');
		INSERT INTO class_students (center_id, class_id, student_account_id)
			VALUES ('center-probe', 'class-probe', 'student-probe');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES (
			'schedule-probe', 'center-probe', 'class-probe', '2026-09-01', '2026-09-30',
			'[1]', 'admin-probe', '2026-09-01T00:00:00.000Z'
		);
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES (
			'lesson-probe', 'center-probe', 'class-probe', 'schedule-probe', '2026-09-07',
			'planned', 'admin-probe', '2026-09-01T00:00:00.000Z'
		);
	`);
	root.lessonContext.setSharedLessonMaterial({
		sessionToken: 'session-admin-probe',
		classId: 'class-probe',
		lessonId: 'lesson-probe',
		topic: 'Probe topic',
		practicalWork: 'Probe practice',
		homework: 'Probe homework'
	});
	return root;
}

describe('TASK-102 verifier-owned targeted probes', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = fixture();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it('observes unsupported field target acceptance through the named action', async () => {
		const result = await actions.createFieldComment(
			event('session-admin-probe', 'class-probe', 'lesson-probe', [
			['scope', 'shared'],
			['fieldKey', 'unsupported-field'],
			['commentId', 'comment-unsupported-field'],
			['body', 'must be rejected by the browser contract']
		])
		);

		expect(result).toEqual({ collaborationSuccess: true });
		expect(
			root.database.sqlite
				.prepare('SELECT field_key, body FROM collaboration_comments WHERE id = ?')
				.get('comment-unsupported-field')
		).toEqual({ field_key: 'unsupported-field', body: 'must be rejected by the browser contract' });
		const reactionResult = await actions.setReaction(
			event('session-admin-probe', 'class-probe', 'lesson-probe', [
			['scope', 'shared'],
			['targetType', 'field'],
			['targetId', 'unsupported-field'],
			['reaction', 'like']
		])
		);
		expect(reactionResult).toEqual({ collaborationSuccess: true });
		expect(
			root.database.sqlite
				.prepare('SELECT target_type, target_id FROM collaboration_reactions WHERE target_id = ?')
				.get('unsupported-field')
		).toEqual({ target_type: 'field', target_id: 'unsupported-field' });
		const projection = root.collaboration.getBrowserProjection({
			sessionToken: 'session-admin-probe', classId: 'class-probe', lessonId: 'lesson-probe', scope: 'shared'
		});
		expect(Object.values(projection.fieldComments).flat()).toEqual([]);
	});

	it('projects branch limit, retained hidden content, labels, and route load data', () => {
		for (let branch = 1; branch <= 11; branch += 1) {
			root.collaboration.createMessage({
				sessionToken: 'session-admin-probe',
				classId: 'class-probe',
				lessonId: 'lesson-probe',
				scope: 'shared',
				messageId: `root-probe-${branch}`,
				body: `Root ${branch}`
			});
			root.collaboration.replyToMessage({
				sessionToken: 'session-admin-probe',
				classId: 'class-probe',
				lessonId: 'lesson-probe',
				scope: 'shared',
				parentMessageId: `root-probe-${branch}`,
				messageId: `reply-probe-${branch}`,
				body: `Reply ${branch}`
			});
		}
		root.collaboration.setReaction({
			sessionToken: 'session-student-probe',
			classId: 'class-probe',
			lessonId: 'lesson-probe',
			scope: 'shared',
			targetType: 'field',
			targetId: 'topic',
			reaction: 'like'
		});

		const initial = root.collaboration.getBrowserProjection({
			sessionToken: 'session-admin-probe', classId: 'class-probe', lessonId: 'lesson-probe', scope: 'shared'
		});
		expect(initial.recentBranchTabs).toHaveLength(10);
		expect(initial.recentBranchTabs[0].rootMessageId).toBe('root-probe-11');
		expect(initial.recentBranchTabs.map((tab) => tab.rootMessageId)).not.toContain('root-probe-1');
		expect(initial.commonMessages).toHaveLength(22);
		expect(initial.commonMessages.find((message) => message.messageId === 'root-probe-1')?.authorLabel).toBe('Admin Probe');
		expect(initial.fieldReactions.topic[0].reactorLabel).toBe('Student Probe');

		root.collaboration.replyToMessage({
			sessionToken: 'session-admin-probe', classId: 'class-probe', lessonId: 'lesson-probe', scope: 'shared',
			parentMessageId: 'reply-probe-1', messageId: 'reply-probe-1-reactivated', body: 'New activity'
		});
		const reactivated = root.collaboration.getBrowserProjection({
			sessionToken: 'session-admin-probe', classId: 'class-probe', lessonId: 'lesson-probe', scope: 'shared'
		});
		expect(reactivated.recentBranchTabs[0].rootMessageId).toBe('root-probe-1');
		expect(reactivated.branchMessages['root-probe-1']).toHaveLength(3);
		expect(reactivated.commonMessages).toHaveLength(23);

		const loaded = load({
			url: new URL('https://calendar.test/lesson-context?classId=class-probe&lessonId=lesson-probe'),
			cookies: { get: (name: string) => name === 'foundation_session' ? 'session-admin-probe' : undefined }
		} as any);
		expect(loaded.dayContext.discussion.commonMessages).toHaveLength(23);
		expect(loaded.dayContext.discussion.fieldReactions.topic[0].reactorLabel).toBe('Student Probe');
	});

	it('observes that native relative named-action URLs drop the route selectors', async () => {
		const pageUrl = new URL(
			'https://calendar.test/lesson-context?classId=class-probe&lessonId=lesson-probe'
		);
		const nativeActionUrl = new URL('?/createMessage', pageUrl);
		expect(nativeActionUrl.searchParams.get('classId')).toBeNull();
		expect(nativeActionUrl.searchParams.get('lessonId')).toBeNull();
		const formData = new FormData();
		formData.append('scope', 'shared');
		formData.append('messageId', 'message-native-form-probe');
		formData.append('body', 'native form submission');
		const result = await actions.createMessage({
			url: nativeActionUrl,
			request: new Request(nativeActionUrl, { method: 'POST', body: formData }),
			cookies: { get: (name: string) => name === 'foundation_session' ? 'session-admin-probe' : undefined }
		} as any);
		expect(result).toMatchObject({ status: 400, data: { error: 'message_invalid' } });
		expect(
			root.database.sqlite
				.prepare('SELECT COUNT(*) AS count FROM collaboration_messages WHERE id = ?')
				.get('message-native-form-probe')
		).toEqual({ count: 0 });
	});
});
