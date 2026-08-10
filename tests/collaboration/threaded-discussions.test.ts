import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

describe('Collaboration threaded discussions and recent branch tabs', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES ('center-own', 'Own Center');
			INSERT INTO accounts (id, role) VALUES ('student-one', 'student');
			INSERT INTO sessions (token, account_id, revoked_at)
				VALUES ('session-student-one', 'student-one', NULL);
			INSERT INTO center_memberships (center_id, account_id)
				VALUES ('center-own', 'student-one');
			INSERT INTO classes (id, center_id, name, mode)
				VALUES ('class-own', 'center-own', 'Own Class', 'group');
			INSERT INTO class_students (center_id, class_id, student_account_id)
				VALUES ('center-own', 'class-own', 'student-one');
			INSERT INTO schedules (
				id, center_id, class_id, start_date, end_date, weekdays,
				created_by_account_id, created_at
			) VALUES (
				'schedule-own', 'center-own', 'class-own', '2026-08-01', '2026-08-31',
				'[1]', 'student-one', '2026-08-01T00:00:00.000Z'
			);
			INSERT INTO lessons (
				id, center_id, class_id, schedule_id, lesson_date, status,
				created_by_account_id, created_at
			) VALUES (
				'lesson-own', 'center-own', 'class-own', 'schedule-own', '2026-08-03',
				'planned', 'student-one', '2026-08-01T00:00:00.000Z'
			);
		`);
	});

	afterEach(() => root.database.close());

	it('FT-004-AC-003 retains arbitrary-depth replies, activates a tab on first reply, and keeps the scoped common feed complete', () => {
		root.collaboration.createMessage({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own',
			scope: 'shared',
			messageId: 'root-deep',
			body: 'Root'
		});

		expect(
			root.collaboration.getDayDiscussion({
				sessionToken: 'session-student-one',
				classId: 'class-own',
				lessonId: 'lesson-own',
				scope: 'shared'
			}).recentBranchTabs
		).toEqual([]);

		root.collaboration.replyToMessage({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own',
			scope: 'shared',
			parentMessageId: 'root-deep',
			messageId: 'reply-1',
			body: 'Reply 1'
		});

		expect(
			root.collaboration.getDayDiscussion({
				sessionToken: 'session-student-one',
				classId: 'class-own',
				lessonId: 'lesson-own',
				scope: 'shared'
			}).recentBranchTabs.map((tab) => tab.rootMessageId)
		).toEqual(['root-deep']);

		let parentMessageId = 'reply-1';
		for (let depth = 2; depth <= 24; depth += 1) {
			const messageId = `reply-${depth}`;
			root.collaboration.replyToMessage({
				sessionToken: 'session-student-one',
				classId: 'class-own',
				lessonId: 'lesson-own',
				scope: 'shared',
				parentMessageId,
				messageId,
				body: `Reply ${depth}`
			});
			parentMessageId = messageId;
		}

		root.collaboration.createMessage({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own',
			scope: 'shared',
			messageId: 'root-unbranched',
			body: 'Unbranched root'
		});
		root.collaboration.createMessage({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own',
			scope: 'personal',
			studentAccountId: 'student-one',
			messageId: 'root-personal',
			body: 'Personal root'
		});

		const shared = root.collaboration.getDayDiscussion({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own',
			scope: 'shared'
		});
		expect(shared.commonMessages).toHaveLength(26);
		expect(shared.commonMessages.map((message) => message.messageId)).not.toContain('root-personal');
		expect(shared.recentBranchTabs.map((tab) => tab.rootMessageId)).toEqual(['root-deep']);

		const deepBranch = root.collaboration.getBranchMessages({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own',
			scope: 'shared',
			rootMessageId: 'root-deep'
		});
		expect(deepBranch).toHaveLength(25);
		expect(deepBranch.every((message) => message.rootMessageId === 'root-deep')).toBe(true);
		expect(deepBranch.at(-1)).toMatchObject({
			messageId: 'reply-24',
			parentMessageId: 'reply-23'
		});

		const personal = root.collaboration.getDayDiscussion({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own',
			scope: 'personal',
			studentAccountId: 'student-one'
		});
		expect(personal.commonMessages.map((message) => message.messageId)).toEqual(['root-personal']);
		expect(personal.recentBranchTabs).toEqual([]);
	});

	it('FT-004-AC-004 projects only ten recent tabs, retains the hidden branch, and restores it after new activity', () => {
		for (let branch = 1; branch <= 11; branch += 1) {
			root.collaboration.createMessage({
				sessionToken: 'session-student-one',
				classId: 'class-own',
				lessonId: 'lesson-own',
				scope: 'shared',
				messageId: `root-${branch}`,
				body: `Root ${branch}`
			});
			root.collaboration.replyToMessage({
				sessionToken: 'session-student-one',
				classId: 'class-own',
				lessonId: 'lesson-own',
				scope: 'shared',
				parentMessageId: `root-${branch}`,
				messageId: `reply-${branch}`,
				body: `Reply ${branch}`
			});
		}

		const initialProjection = root.collaboration.getDayDiscussion({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own',
			scope: 'shared'
		});
		expect(initialProjection.recentBranchTabs.map((tab) => tab.rootMessageId)).toEqual([
			'root-11',
			'root-10',
			'root-9',
			'root-8',
			'root-7',
			'root-6',
			'root-5',
			'root-4',
			'root-3',
			'root-2'
		]);
		expect(
			root.collaboration.getBranchMessages({
				sessionToken: 'session-student-one',
				classId: 'class-own',
				lessonId: 'lesson-own',
				scope: 'shared',
				rootMessageId: 'root-1'
			})
		).toHaveLength(2);

		root.collaboration.replyToMessage({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own',
			scope: 'shared',
			parentMessageId: 'reply-1',
			messageId: 'reply-1-reactivated',
			body: 'New activity'
		});

		const reactivated = root.collaboration.getDayDiscussion({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own',
			scope: 'shared'
		});
		expect(reactivated.recentBranchTabs).toHaveLength(10);
		expect(reactivated.recentBranchTabs[0].rootMessageId).toBe('root-1');
		expect(reactivated.recentBranchTabs.map((tab) => tab.rootMessageId)).not.toContain('root-2');
		expect(reactivated.commonMessages).toHaveLength(23);
		expect(reactivated.commonMessages.map((message) => message.messageId)).toContain(
			'reply-1-reactivated'
		);
		expect(
			root.collaboration.getBranchMessages({
				sessionToken: 'session-student-one',
				classId: 'class-own',
				lessonId: 'lesson-own',
				scope: 'shared',
				rootMessageId: 'root-1'
			})
		).toHaveLength(3);
	});
});
