import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

describe('TASK-012 Attempt 2 independent current-source verification', () => {
	let root: CompositionRoot;
	let lessonId: string;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES ('center-a', 'Center A'), ('center-b', 'Center B');
			INSERT INTO accounts (id, role) VALUES
				('admin-shared', 'admin'),
				('admin-b', 'admin'),
				('student-shared', 'student');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('session-admin-shared', 'admin-shared', NULL),
				('session-admin-b', 'admin-b', NULL),
				('session-student-shared', 'student-shared', NULL);
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('center-a', 'admin-shared'),
				('center-a', 'student-shared'),
				('center-b', 'admin-shared'),
				('center-b', 'admin-b'),
				('center-b', 'student-shared');
		`);

		root.centerScheduling.createClass({
			sessionToken: 'session-admin-shared',
			centerId: 'center-a',
			classId: 'class-reused',
			name: 'Original class',
			mode: 'group'
		});
		root.centerScheduling.addStudentToClass({
			sessionToken: 'session-admin-shared',
			classId: 'class-reused',
			studentAccountId: 'student-shared'
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
			commentId: 'old-shared-comment',
			body: 'old shared comment'
		});
		root.collaboration.createFieldComment({
			sessionToken: 'session-student-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'personal',
			studentAccountId: 'student-shared',
			fieldKey: 'homework',
			commentId: 'old-personal-comment',
			body: 'old personal comment'
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
		root.collaboration.setReaction({
			sessionToken: 'session-student-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'personal',
			studentAccountId: 'student-shared',
			targetType: 'comment',
			targetId: 'old-personal-comment',
			reaction: 'love'
		});
		root.collaboration.createMessage({
			sessionToken: 'session-admin-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			messageId: 'old-shared-root',
			body: 'old shared root'
		});
		root.collaboration.replyToMessage({
			sessionToken: 'session-admin-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			parentMessageId: 'old-shared-root',
			messageId: 'old-shared-reply',
			body: 'old shared reply'
		});
		root.collaboration.createMessage({
			sessionToken: 'session-student-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'personal',
			studentAccountId: 'student-shared',
			messageId: 'old-personal-root',
			body: 'old personal root'
		});
		root.collaboration.replyToMessage({
			sessionToken: 'session-student-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'personal',
			studentAccountId: 'student-shared',
			parentMessageId: 'old-personal-root',
			messageId: 'old-personal-reply',
			body: 'old personal reply'
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
		root.centerScheduling.addStudentToClass({
			sessionToken: 'session-admin-b',
			classId: 'class-reused',
			studentAccountId: 'student-shared'
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

	it('isolates retained prior-center shared/personal rows, identities, targets, and ownership', () => {
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
		expect(
			root.collaboration.getDayDiscussion({
				sessionToken: 'session-student-shared',
				classId: 'class-reused',
				lessonId,
				scope: 'personal',
				studentAccountId: 'student-shared'
			})
		).toEqual({ commonMessages: [], recentBranchTabs: [] });
		expect(
			root.collaboration.getFieldComments({
				sessionToken: 'session-student-shared',
				classId: 'class-reused',
				lessonId,
				scope: 'personal',
				studentAccountId: 'student-shared',
				fieldKey: 'homework'
			})
		).toEqual([]);

		expect(() =>
			root.collaboration.getBranchMessages({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				rootMessageId: 'old-shared-root'
			})
		).toThrow('not-authorized');
		expect(() =>
			root.collaboration.editFieldComment({
				sessionToken: 'session-admin-shared',
				commentId: 'old-shared-comment',
				body: 'forbidden cross-lifecycle edit'
			})
		).toThrow('not-authorized');
		expect(() =>
			root.collaboration.replyToMessage({
				sessionToken: 'session-admin-shared',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				parentMessageId: 'old-shared-reply',
				messageId: 'forbidden-old-reply',
				body: 'forbidden old reply'
			})
		).toThrow('not-authorized');
		expect(() =>
			root.collaboration.setReaction({
				sessionToken: 'session-student-shared',
				classId: 'class-reused',
				lessonId,
				scope: 'personal',
				studentAccountId: 'student-shared',
				targetType: 'comment',
				targetId: 'old-personal-comment',
				reaction: 'question'
			})
		).toThrow('not-authorized');

		expect(
			root.database.sqlite
				.prepare(
					`SELECT id, center_id, body FROM collaboration_comments
					 WHERE id IN ('old-shared-comment', 'old-personal-comment') ORDER BY id`
				)
				.all()
		).toEqual([
			{ id: 'old-personal-comment', center_id: 'center-a', body: 'old personal comment' },
			{ id: 'old-shared-comment', center_id: 'center-a', body: 'old shared comment' }
		]);
		expect(
			root.database.sqlite
				.prepare(
					`SELECT center_id, target_type, target_id, reaction
					 FROM collaboration_reactions ORDER BY target_type, target_id`
				)
				.all()
		).toEqual([
			{
				center_id: 'center-a',
				target_type: 'comment',
				target_id: 'old-personal-comment',
				reaction: 'love'
			},
			{ center_id: 'center-a', target_type: 'field', target_id: 'topic', reaction: 'like' }
		]);
	});

	it('preserves new-lifecycle ownership, scope, arbitrary depth, and ten-tab retention/reactivation', () => {
		root.collaboration.createFieldComment({
			sessionToken: 'session-admin-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			fieldKey: 'topic',
			commentId: 'new-shared-comment',
			body: 'new shared comment'
		});
		expect(() =>
			root.collaboration.editFieldComment({
				sessionToken: 'session-admin-b',
				commentId: 'new-shared-comment',
				body: 'not the owner'
			})
		).toThrow('not-authorized');
		expect(
			root.collaboration.editFieldComment({
				sessionToken: 'session-admin-shared',
				commentId: 'new-shared-comment',
				body: 'owner edit'
			})
		).toMatchObject({ centerId: 'center-b', body: 'owner edit', authorAccountId: 'admin-shared' });

		root.collaboration.setReaction({
			sessionToken: 'session-admin-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			targetType: 'field',
			targetId: 'topic',
			reaction: 'celebrate'
		});
		expect(
			root.collaboration.getReactions({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				targetType: 'field',
				targetId: 'topic'
			})
		).toMatchObject([{ centerId: 'center-b', reactorAccountId: 'admin-shared', reaction: 'celebrate' }]);

		root.collaboration.createMessage({
			sessionToken: 'session-student-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'personal',
			studentAccountId: 'student-shared',
			messageId: 'new-personal-root',
			body: 'new personal root'
		});
		root.collaboration.createMessage({
			sessionToken: 'session-admin-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			messageId: 'deep-root',
			body: 'deep root'
		});
		expect(
			root.collaboration.getDayDiscussion({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared'
			}).recentBranchTabs
		).toEqual([]);

		let parentMessageId = 'deep-root';
		for (let depth = 1; depth <= 18; depth += 1) {
			const messageId = `deep-reply-${depth}`;
			root.collaboration.replyToMessage({
				sessionToken: 'session-admin-shared',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				parentMessageId,
				messageId,
				body: `deep reply ${depth}`
			});
			parentMessageId = messageId;
		}
		expect(
			root.collaboration.getBranchMessages({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				rootMessageId: 'deep-root'
			})
		).toHaveLength(19);

		for (let branch = 1; branch <= 11; branch += 1) {
			root.collaboration.createMessage({
				sessionToken: 'session-admin-shared',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				messageId: `recent-root-${branch}`,
				body: `recent root ${branch}`
			});
			root.collaboration.replyToMessage({
				sessionToken: 'session-admin-shared',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				parentMessageId: `recent-root-${branch}`,
				messageId: `recent-reply-${branch}`,
				body: `recent reply ${branch}`
			});
		}

		const initial = root.collaboration.getDayDiscussion({
			sessionToken: 'session-admin-b',
			classId: 'class-reused',
			lessonId,
			scope: 'shared'
		});
		expect(initial.recentBranchTabs.map((tab) => tab.rootMessageId)).toEqual([
			'recent-root-11',
			'recent-root-10',
			'recent-root-9',
			'recent-root-8',
			'recent-root-7',
			'recent-root-6',
			'recent-root-5',
			'recent-root-4',
			'recent-root-3',
			'recent-root-2'
		]);
		expect(initial.commonMessages.map((message) => message.messageId)).not.toContain(
			'new-personal-root'
		);
		expect(initial.commonMessages.map((message) => message.messageId)).not.toContain(
			'old-shared-root'
		);
		expect(
			root.collaboration.getBranchMessages({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				rootMessageId: 'recent-root-1'
			})
		).toHaveLength(2);

		root.collaboration.replyToMessage({
			sessionToken: 'session-admin-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			parentMessageId: 'recent-reply-1',
			messageId: 'recent-reply-1-reactivated',
			body: 'reactivated'
		});
		const reactivated = root.collaboration.getDayDiscussion({
			sessionToken: 'session-admin-b',
			classId: 'class-reused',
			lessonId,
			scope: 'shared'
		});
		expect(reactivated.recentBranchTabs).toHaveLength(10);
		expect(reactivated.recentBranchTabs[0].rootMessageId).toBe('recent-root-1');
		expect(reactivated.recentBranchTabs.map((tab) => tab.rootMessageId)).not.toContain(
			'recent-root-2'
		);
		expect(
			root.collaboration.getBranchMessages({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				rootMessageId: 'recent-root-1'
			})
		).toHaveLength(3);

		const personal = root.collaboration.getDayDiscussion({
			sessionToken: 'session-student-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'personal',
			studentAccountId: 'student-shared'
		});
		expect(personal.commonMessages.map((message) => message.messageId)).toEqual([
			'new-personal-root'
		]);
		expect(personal.recentBranchTabs).toEqual([]);
	});
});
