import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

function thrownCode(operation: () => unknown): string {
	try {
		operation();
		throw new Error('operation unexpectedly succeeded');
	} catch (error) {
		return error instanceof Error ? error.message : String(error);
	}
}

describe('TASK-017 verifier-owned threaded discussion boundary probe', () => {
	let root: CompositionRoot;
	let lessonId: string;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES ('center-a', 'Center A'), ('center-b', 'Center B');
			INSERT INTO accounts (id, role) VALUES
				('admin-a', 'admin'),
				('admin-b', 'admin'),
				('student-shared', 'student');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('session-admin-a', 'admin-a', NULL),
				('session-admin-b', 'admin-b', NULL),
				('session-student', 'student-shared', NULL);
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('center-a', 'admin-a'),
				('center-a', 'student-shared'),
				('center-b', 'admin-b'),
				('center-b', 'student-shared');
		`);

		root.centerScheduling.createClass({
			sessionToken: 'session-admin-a',
			centerId: 'center-a',
			classId: 'class-reused',
			name: 'Original class',
			mode: 'group'
		});
		root.database.sqlite
			.prepare('INSERT INTO class_students (center_id, class_id, student_account_id) VALUES (?, ?, ?)')
			.run('center-a', 'class-reused', 'student-shared');
		const [oldLesson] = root.centerScheduling.createRecurringSchedule({
			sessionToken: 'session-admin-a',
			classId: 'class-reused',
			scheduleId: 'schedule-reused',
			startDate: '2026-08-03',
			endDate: '2026-08-03',
			weekdays: [1]
		});
		lessonId = oldLesson.lessonId;

		root.collaboration.createMessage({
			sessionToken: 'session-admin-a',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			messageId: 'old-shared-root',
			body: 'retained old shared root'
		});
		root.collaboration.replyToMessage({
			sessionToken: 'session-admin-a',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			parentMessageId: 'old-shared-root',
			messageId: 'old-shared-reply',
			body: 'retained old shared reply'
		});
		root.collaboration.replyToMessage({
			sessionToken: 'session-admin-a',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			parentMessageId: 'old-shared-reply',
			messageId: 'old-shared-deep-reply',
			body: 'retained old deep reply'
		});
		root.collaboration.setReaction({
			sessionToken: 'session-admin-a',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			targetType: 'message',
			targetId: 'old-shared-root',
			reaction: 'like'
		});
		root.collaboration.createMessage({
			sessionToken: 'session-student',
			classId: 'class-reused',
			lessonId,
			scope: 'personal',
			studentAccountId: 'student-shared',
			messageId: 'old-personal-root',
			body: 'retained old personal root'
		});
		root.collaboration.replyToMessage({
			sessionToken: 'session-student',
			classId: 'class-reused',
			lessonId,
			scope: 'personal',
			studentAccountId: 'student-shared',
			parentMessageId: 'old-personal-root',
			messageId: 'old-personal-reply',
			body: 'retained old personal reply'
		});

		const oldShared = root.collaboration.getDayDiscussion({
			sessionToken: 'session-admin-a',
			classId: 'class-reused',
			lessonId,
			scope: 'shared'
		});
		const oldPersonal = root.collaboration.getDayDiscussion({
			sessionToken: 'session-student',
			classId: 'class-reused',
			lessonId,
			scope: 'personal',
			studentAccountId: 'student-shared'
		});
		expect(oldShared.commonMessages.map((message) => message.messageId)).toEqual([
			'old-shared-root',
			'old-shared-reply',
			'old-shared-deep-reply'
		]);
		expect(oldShared.recentBranchTabs).toMatchObject([
			{ rootMessageId: 'old-shared-root', messageCount: 3 }
		]);
		expect(oldPersonal.recentBranchTabs).toMatchObject([
			{ rootMessageId: 'old-personal-root', messageCount: 2 }
		]);

		root.centerScheduling.deleteClass({
			sessionToken: 'session-admin-a',
			classId: 'class-reused'
		});
		root.centerScheduling.createClass({
			sessionToken: 'session-admin-b',
			centerId: 'center-b',
			classId: 'class-reused',
			name: 'Replacement class',
			mode: 'group'
		});
		root.database.sqlite
			.prepare('INSERT INTO class_students (center_id, class_id, student_account_id) VALUES (?, ?, ?)')
			.run('center-b', 'class-reused', 'student-shared');
		const [replacementLesson] = root.centerScheduling.createRecurringSchedule({
			sessionToken: 'session-admin-b',
			classId: 'class-reused',
			scheduleId: 'schedule-reused',
			startDate: '2026-08-03',
			endDate: '2026-08-03',
			weekdays: [1]
		});
		expect(replacementLesson.lessonId).toBe(lessonId);
		expect(replacementLesson.centerId).toBe('center-b');
	});

	afterEach(() => root.database.close());

	it('isolates retained messages, reactions, authors, feeds, and projected tabs across class identity reuse', () => {
		const replacementShared = () =>
			root.collaboration.getDayDiscussion({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared'
			});
		const replacementPersonal = () =>
			root.collaboration.getDayDiscussion({
				sessionToken: 'session-student',
				classId: 'class-reused',
				lessonId,
				scope: 'personal',
				studentAccountId: 'student-shared'
			});

		expect(replacementShared()).toEqual({ commonMessages: [], recentBranchTabs: [] });
		expect(replacementPersonal()).toEqual({ commonMessages: [], recentBranchTabs: [] });

		const oldBranchRead = () =>
			root.collaboration.getBranchMessages({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				rootMessageId: 'old-shared-root'
			});
		const missingBranchRead = () =>
			root.collaboration.getBranchMessages({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				rootMessageId: 'missing-root'
			});
		expect(thrownCode(oldBranchRead)).toBe('not-authorized');
		expect(thrownCode(oldBranchRead)).toBe(thrownCode(missingBranchRead));

		const oldReactionRead = () =>
			root.collaboration.getReactions({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				targetType: 'message',
				targetId: 'old-shared-root'
			});
		const missingReactionRead = () =>
			root.collaboration.getReactions({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				targetType: 'message',
				targetId: 'missing-root'
			});
		expect(thrownCode(oldReactionRead)).toBe('reaction-target-not-found');
		expect(thrownCode(oldReactionRead)).toBe(thrownCode(missingReactionRead));

		const oldReactionMutation = () =>
			root.collaboration.setReaction({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				targetType: 'message',
				targetId: 'old-shared-root',
				reaction: 'love'
			});
		const missingReactionMutation = () =>
			root.collaboration.setReaction({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				targetType: 'message',
				targetId: 'missing-root',
				reaction: 'love'
			});
		expect(thrownCode(oldReactionMutation)).toBe('reaction-target-not-found');
		expect(thrownCode(oldReactionMutation)).toBe(thrownCode(missingReactionMutation));

		const oldReplyMutation = () =>
			root.collaboration.replyToMessage({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				parentMessageId: 'old-shared-deep-reply',
				messageId: 'must-not-be-created',
				body: 'cross-center reply'
			});
		const missingReplyMutation = () =>
			root.collaboration.replyToMessage({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				parentMessageId: 'missing-root',
				messageId: 'missing-reply',
				body: 'missing reply'
			});
		expect(thrownCode(oldReplyMutation)).toBe('not-authorized');
		expect(thrownCode(oldReplyMutation)).toBe(thrownCode(missingReplyMutation));

		const oldRows = root.database.sqlite
			.prepare(
				`SELECT center_id, id, parent_message_id, root_message_id, author_account_id
				 FROM collaboration_messages WHERE id LIKE 'old-%' ORDER BY id`
			)
			.all();
		expect(oldRows).toEqual([
			{
				center_id: 'center-a',
				id: 'old-personal-reply',
				parent_message_id: 'old-personal-root',
				root_message_id: 'old-personal-root',
				author_account_id: 'student-shared'
			},
			{
				center_id: 'center-a',
				id: 'old-personal-root',
				parent_message_id: null,
				root_message_id: 'old-personal-root',
				author_account_id: 'student-shared'
			},
			{
				center_id: 'center-a',
				id: 'old-shared-deep-reply',
				parent_message_id: 'old-shared-reply',
				root_message_id: 'old-shared-root',
				author_account_id: 'admin-a'
			},
			{
				center_id: 'center-a',
				id: 'old-shared-reply',
				parent_message_id: 'old-shared-root',
				root_message_id: 'old-shared-root',
				author_account_id: 'admin-a'
			},
			{
				center_id: 'center-a',
				id: 'old-shared-root',
				parent_message_id: null,
				root_message_id: 'old-shared-root',
				author_account_id: 'admin-a'
			}
		]);
		expect(
			root.database.sqlite
				.prepare(
					`SELECT center_id, target_id, reaction, reactor_account_id
					 FROM collaboration_reactions WHERE target_id = 'old-shared-root'`
				)
				.all()
		).toEqual([
			{
				center_id: 'center-a',
				target_id: 'old-shared-root',
				reaction: 'like',
				reactor_account_id: 'admin-a'
			}
		]);

		root.collaboration.createMessage({
			sessionToken: 'session-admin-b',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			messageId: 'new-deep-root',
			body: 'current center root'
		});
		expect(replacementShared().recentBranchTabs).toEqual([]);
		let parentMessageId = 'new-deep-root';
		for (let depth = 1; depth <= 16; depth += 1) {
			const messageId = `new-deep-reply-${depth}`;
			root.collaboration.replyToMessage({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				parentMessageId,
				messageId,
				body: `current depth ${depth}`
			});
			parentMessageId = messageId;
			if (depth === 1) {
				expect(replacementShared().recentBranchTabs).toMatchObject([
					{ rootMessageId: 'new-deep-root', messageCount: 2 }
				]);
			}
		}

		root.collaboration.createMessage({
			sessionToken: 'session-student',
			classId: 'class-reused',
			lessonId,
			scope: 'personal',
			studentAccountId: 'student-shared',
			messageId: 'new-personal-root',
			body: 'current center personal root'
		});
		root.collaboration.replyToMessage({
			sessionToken: 'session-student',
			classId: 'class-reused',
			lessonId,
			scope: 'personal',
			studentAccountId: 'student-shared',
			parentMessageId: 'new-personal-root',
			messageId: 'new-personal-reply',
			body: 'current center personal reply'
		});
		root.collaboration.setReaction({
			sessionToken: 'session-admin-b',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			targetType: 'message',
			targetId: 'new-deep-root',
			reaction: 'celebrate'
		});
		expect(
			root.collaboration.getReactions({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				targetType: 'message',
				targetId: 'new-deep-root'
			})
		).toMatchObject([
			{ centerId: 'center-b', targetId: 'new-deep-root', reactorAccountId: 'admin-b', reaction: 'celebrate' }
		]);

		for (let branch = 1; branch <= 11; branch += 1) {
			root.collaboration.createMessage({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				messageId: `new-branch-root-${branch}`,
				body: `current branch ${branch}`
			});
			root.collaboration.replyToMessage({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				parentMessageId: `new-branch-root-${branch}`,
				messageId: `new-branch-reply-${branch}`,
				body: `current branch reply ${branch}`
			});
		}

		const beforeReactivation = replacementShared();
		expect(beforeReactivation.recentBranchTabs).toHaveLength(10);
		expect(beforeReactivation.recentBranchTabs.map((tab) => tab.rootMessageId)).toEqual([
			'new-branch-root-11',
			'new-branch-root-10',
			'new-branch-root-9',
			'new-branch-root-8',
			'new-branch-root-7',
			'new-branch-root-6',
			'new-branch-root-5',
			'new-branch-root-4',
			'new-branch-root-3',
			'new-branch-root-2'
		]);
		expect(
			root.collaboration.getBranchMessages({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				rootMessageId: 'new-branch-root-1'
			})
		).toHaveLength(2);

		root.collaboration.replyToMessage({
			sessionToken: 'session-admin-b',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			parentMessageId: 'new-branch-reply-1',
			messageId: 'new-branch-reactivated',
			body: 'reactivated hidden branch'
		});
		const afterReactivation = replacementShared();
		expect(afterReactivation.recentBranchTabs).toHaveLength(10);
		expect(afterReactivation.recentBranchTabs[0]).toMatchObject({
			rootMessageId: 'new-branch-root-1',
			messageCount: 3
		});
		expect(afterReactivation.recentBranchTabs.map((tab) => tab.rootMessageId)).not.toContain(
			'old-shared-root'
		);
		expect(
			root.collaboration.getBranchMessages({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				rootMessageId: 'new-branch-root-1'
			})
		).toHaveLength(3);

		const sharedMessages = afterReactivation.commonMessages;
		expect(sharedMessages.every((message) => message.centerId === 'center-b')).toBe(true);
		expect(sharedMessages.every((message) => message.authorAccountId === 'admin-b')).toBe(true);
		expect(sharedMessages.map((message) => message.messageId)).not.toContain('new-personal-root');
		expect(sharedMessages.map((message) => message.messageId)).not.toContain('old-shared-root');
		expect(sharedMessages.map((message) => message.messageId)).toContain('new-deep-reply-16');
		expect(sharedMessages.map((message) => message.messageId)).toContain('new-branch-reactivated');

		const personalMessages = replacementPersonal().commonMessages;
		expect(personalMessages.map((message) => message.messageId)).toEqual([
			'new-personal-root',
			'new-personal-reply'
		]);
		expect(personalMessages.every((message) => message.centerId === 'center-b')).toBe(true);
		expect(personalMessages.every((message) => message.authorAccountId === 'student-shared')).toBe(true);
		expect(personalMessages.map((message) => message.messageId)).not.toContain('old-personal-root');
		expect(thrownCode(() =>
			root.collaboration.getBranchMessages({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				rootMessageId: 'new-personal-root'
			})
		)).toBe('not-authorized');

		expect(thrownCode(() =>
			root.collaboration.getDayDiscussion({
				sessionToken: 'session-admin-a',
				classId: 'class-reused',
				lessonId,
				scope: 'shared'
			})
		)).toBe('not-authorized');
		expect(thrownCode(() =>
			root.collaboration.replyToMessage({
				sessionToken: 'session-admin-a',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				parentMessageId: 'new-deep-root',
				messageId: 'old-actor-must-not-write',
				body: 'old center actor cannot mutate current center'
			})
		)).toBe('not-authorized');

		expect(
			root.database.sqlite
				.prepare("SELECT COUNT(*) AS count FROM collaboration_messages WHERE id = 'old-actor-must-not-write'")
				.get()
		).toEqual({ count: 0 });
	});
});
