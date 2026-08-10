import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

describe('TASK-017 threaded discussion center lifecycle isolation probe', () => {
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
		root.database.sqlite
			.prepare('INSERT INTO class_students (center_id, class_id, student_account_id) VALUES (?, ?, ?)')
			.run('center-a', 'class-reused', 'student-shared');
		const [originalLesson] = root.centerScheduling.createRecurringSchedule({
			sessionToken: 'session-admin-shared',
			classId: 'class-reused',
			scheduleId: 'schedule-reused',
			startDate: '2026-08-03',
			endDate: '2026-08-03',
			weekdays: [1]
		});
		lessonId = originalLesson.lessonId;

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
		root.collaboration.setReaction({
			sessionToken: 'session-admin-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			targetType: 'message',
			targetId: 'root-center-a',
			reaction: 'like'
		});
		root.collaboration.createMessage({
			sessionToken: 'session-student-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'personal',
			studentAccountId: 'student-shared',
			messageId: 'root-personal-a',
			body: 'center A personal root'
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
	});

	afterEach(() => root.database.close());

	it('preserves old rows but denies replacement-center threaded reads, targets, and mutations', () => {
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

		expect(() =>
			root.collaboration.getBranchMessages({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				rootMessageId: 'root-center-a'
			})
		).toThrow('not-authorized');
		expect(() =>
			root.collaboration.getBranchMessages({
				sessionToken: 'session-student-shared',
				classId: 'class-reused',
				lessonId,
				scope: 'personal',
				studentAccountId: 'student-shared',
				rootMessageId: 'root-personal-a'
			})
		).toThrow('not-authorized');
		expect(() =>
			root.collaboration.getReactions({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				targetType: 'message',
				targetId: 'root-center-a'
			})
		).toThrow('reaction-target-not-found');
		expect(() =>
			root.collaboration.setReaction({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				targetType: 'message',
				targetId: 'root-center-a',
				reaction: 'love'
			})
		).toThrow('reaction-target-not-found');
		expect(() =>
			root.collaboration.replyToMessage({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				parentMessageId: 'reply-center-a',
				messageId: 'cross-center-reply',
				body: 'must be denied'
			})
		).toThrow('not-authorized');

		expect(
			root.database.sqlite
				.prepare('SELECT center_id, id FROM collaboration_messages ORDER BY id')
				.all()
		).toEqual([
			{ center_id: 'center-a', id: 'reply-center-a' },
			{ center_id: 'center-a', id: 'root-center-a' },
			{ center_id: 'center-a', id: 'root-personal-a' }
		]);
		expect(
			root.database.sqlite
				.prepare('SELECT center_id, target_id, reactor_account_id FROM collaboration_reactions')
				.all()
		).toEqual([
			{ center_id: 'center-a', target_id: 'root-center-a', reactor_account_id: 'admin-shared' }
		]);
	});

	it('keeps new replacement-center shared/personal discussion and message reactions usable', () => {
		root.collaboration.createMessage({
			sessionToken: 'session-admin-b',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			messageId: 'root-center-b',
			body: 'center B root'
		});
		root.collaboration.replyToMessage({
			sessionToken: 'session-admin-b',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			parentMessageId: 'root-center-b',
			messageId: 'reply-center-b',
			body: 'center B reply'
		});
		root.collaboration.setReaction({
			sessionToken: 'session-admin-b',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			targetType: 'message',
			targetId: 'root-center-b',
			reaction: 'love'
		});
		root.collaboration.createMessage({
			sessionToken: 'session-student-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'personal',
			studentAccountId: 'student-shared',
			messageId: 'root-personal-b',
			body: 'center B personal root'
		});

		expect(
			root.collaboration.getDayDiscussion({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared'
			})
		).toMatchObject({
			commonMessages: [
				{ messageId: 'root-center-b', authorAccountId: 'admin-b' },
				{ messageId: 'reply-center-b', authorAccountId: 'admin-b' }
			],
			recentBranchTabs: [{ rootMessageId: 'root-center-b', messageCount: 2 }]
		});
		expect(
			root.collaboration.getReactions({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				targetType: 'message',
				targetId: 'root-center-b'
			})
		).toMatchObject([{ centerId: 'center-b', reactorAccountId: 'admin-b', reaction: 'love' }]);
		expect(
			root.collaboration.getDayDiscussion({
				sessionToken: 'session-student-shared',
				classId: 'class-reused',
				lessonId,
				scope: 'personal',
				studentAccountId: 'student-shared'
			}).commonMessages.map((message) => message.messageId)
		).toEqual(['root-personal-b']);
	});
});
