import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { STANDARD_REACTIONS } from '../../src/lib/server/modules/collaboration/public';

describe('TASK-016 comments/reactions identity-reuse probe', () => {
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

	it('keeps retained prior-center comments and reactions out of replacement projection and targets', () => {
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
		expect(() =>
			root.collaboration.editFieldComment({
				sessionToken: 'session-admin-b',
				commentId: 'comment-center-a',
				body: 'cross-center edit'
			})
		).toThrow('not-authorized');
		expect(() =>
			root.collaboration.setReaction({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				targetType: 'comment',
				targetId: 'comment-center-a',
				reaction: 'love'
			})
		).toThrow('not-authorized');
	});

	it('preserves prior rows and permits attributed, center-scoped current rows and reaction values', () => {
		root.collaboration.createFieldComment({
			sessionToken: 'session-admin-shared',
			classId: 'class-reused',
			lessonId,
			scope: 'shared',
			fieldKey: 'topic',
			commentId: 'comment-center-b',
			body: 'center B comment'
		});
		expect(() =>
			root.collaboration.createFieldComment({
				sessionToken: 'session-admin-shared',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				fieldKey: 'topic',
				commentId: 'comment-center-b-duplicate',
				body: 'duplicate current-center comment'
			})
		).toThrow('comment-already-exists');

		for (const reaction of STANDARD_REACTIONS) {
			root.collaboration.setReaction({
				sessionToken: 'session-admin-shared',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				targetType: 'field',
				targetId: 'topic',
				reaction
			});
		}

		expect(
			root.collaboration.getFieldComments({
				sessionToken: 'session-admin-shared',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				fieldKey: 'topic'
			})
		).toMatchObject([
			{ commentId: 'comment-center-b', body: 'center B comment', authorAccountId: 'admin-shared' }
		]);
		expect(
			root.collaboration.getReactions({
				sessionToken: 'session-admin-shared',
				classId: 'class-reused',
				lessonId,
				scope: 'shared',
				targetType: 'field',
				targetId: 'topic'
			})
		).toMatchObject([
			{ centerId: 'center-b', reaction: 'question', reactorAccountId: 'admin-shared' }
		]);
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
				.prepare("SELECT center_id, reaction FROM collaboration_reactions WHERE target_type = 'field' AND target_id = 'topic' ORDER BY center_id")
				.all()
		).toEqual([
			{ center_id: 'center-a', reaction: 'like' },
			{ center_id: 'center-b', reaction: 'question' }
		]);
	});
});
