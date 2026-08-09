import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

describe('Collaboration center lifecycle isolation', () => {
	let root: CompositionRoot;
	let lessonId: string;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES ('center-a', 'Center A'), ('center-b', 'Center B');
			INSERT INTO accounts (id, role) VALUES ('admin-shared', 'admin'), ('admin-b', 'admin');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('session-admin-shared', 'admin-shared', NULL),
				('session-admin-b', 'admin-b', NULL);
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('center-a', 'admin-shared'),
				('center-b', 'admin-shared'),
				('center-b', 'admin-b');
		`);

		root.centerScheduling.createClass({
			sessionToken: 'session-admin-shared',
			centerId: 'center-a',
			classId: 'class-reused',
			name: 'Original class',
			mode: 'group'
		});
		const [originalLesson] = root.centerScheduling.createRecurringSchedule({
			sessionToken: 'session-admin-shared',
			classId: 'class-reused',
			scheduleId: 'schedule-reused',
			startDate: '2026-08-03',
			endDate: '2026-08-03',
			weekdays: [1]
		});
		lessonId = originalLesson.lessonId;

		root.collaboration.createFieldComment({
			sessionToken: 'session-admin-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			fieldKey: 'topic',
			commentId: 'comment-center-a',
			body: 'center A comment'
		});
		root.collaboration.setReaction({
			sessionToken: 'session-admin-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			targetType: 'field',
			targetId: 'topic',
			reaction: 'like'
		});
		root.collaboration.createMessage({
			sessionToken: 'session-admin-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			messageId: 'root-center-a',
			body: 'center A root'
		});
		root.collaboration.replyToMessage({
			sessionToken: 'session-admin-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			parentMessageId: 'root-center-a',
			messageId: 'reply-center-a',
			body: 'center A reply'
		});

		root.centerScheduling.deleteClass({
			sessionToken: 'session-admin-shared',
			classId: 'class-reused'
		});
		root.centerScheduling.createClass({
			sessionToken: 'session-admin-b',
			centerId: 'center-b',
			classId: 'class-reused',
			name: 'Replacement class',
			mode: 'group'
		});
		const [replacementLesson] = root.centerScheduling.createRecurringSchedule({
			sessionToken: 'session-admin-b',
			classId: 'class-reused',
			scheduleId: 'schedule-reused',
			startDate: '2026-08-03',
			endDate: '2026-08-03',
			weekdays: [1]
		});
		expect(replacementLesson.lessonId).toBe(lessonId);
	});

	afterEach(() => root.database.close());

	it('does not expose retained comments, reactions, messages, tabs, or identities to the replacement center', () => {
		expect(
			root.collaboration.getFieldComments({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				fieldKey: 'topic'
			})
		).toEqual([]);
		expect(
			root.collaboration.getReactions({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				targetType: 'field',
				targetId: 'topic'
			})
		).toEqual([]);
		expect(
			root.collaboration.getDayDiscussion({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared'
			})
		).toEqual({ commonMessages: [], recentBranchTabs: [] });
		expect(() =>
			root.collaboration.getBranchMessages({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				rootMessageId: 'root-center-a'
			})
		).toThrow('not-authorized');
	});

	it('keeps prior-center rows unchanged while replacement-center mutations use distinct rows', () => {
		expect(() =>
			root.collaboration.editFieldComment({
				sessionToken: 'session-admin-shared',
				commentId: 'comment-center-a',
				body: 'cross-lifecycle edit'
			})
		).toThrow('not-authorized');
		expect(() =>
			root.collaboration.replyToMessage({
				sessionToken: 'session-admin-shared',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				parentMessageId: 'reply-center-a',
				messageId: 'cross-lifecycle-reply',
				body: 'cross-lifecycle reply'
			})
		).toThrow('not-authorized');
		expect(() =>
			root.collaboration.setReaction({
				sessionToken: 'session-admin-shared',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				targetType: 'comment',
				targetId: 'comment-center-a',
				reaction: 'love'
			})
		).toThrow('not-authorized');

		root.collaboration.createFieldComment({
			sessionToken: 'session-admin-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			fieldKey: 'topic',
			commentId: 'comment-center-b',
			body: 'center B comment'
		});
		root.collaboration.setReaction({
			sessionToken: 'session-admin-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			targetType: 'field',
			targetId: 'topic',
			reaction: 'love'
		});
		root.collaboration.createMessage({
			sessionToken: 'session-admin-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			messageId: 'root-center-b',
			body: 'center B root'
		});
		root.collaboration.replyToMessage({
			sessionToken: 'session-admin-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			parentMessageId: 'root-center-b',
			messageId: 'reply-center-b',
			body: 'center B reply'
		});

		expect(
			root.database.sqlite
				.prepare('SELECT center_id, body FROM collaboration_comments ORDER BY center_id')
				.all()
		).toEqual([
			{ center_id: 'center-a', body: 'center A comment' },
			{ center_id: 'center-b', body: 'center B comment' }
		]);
		expect(
			root.database.sqlite
				.prepare(
					`SELECT center_id, reaction FROM collaboration_reactions
					 WHERE target_type = 'field' AND target_id = 'topic'
					 ORDER BY center_id`
				)
				.all()
		).toEqual([
			{ center_id: 'center-a', reaction: 'like' },
			{ center_id: 'center-b', reaction: 'love' }
		]);
		expect(
			root.collaboration.getDayDiscussion({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared'
			})
		).toMatchObject({
			commonMessages: [
				{ messageId: 'root-center-b', authorAccountId: 'admin-shared' },
				{ messageId: 'reply-center-b', authorAccountId: 'admin-shared' }
			],
			recentBranchTabs: [{ rootMessageId: 'root-center-b', messageCount: 2 }]
		});
	});
});
