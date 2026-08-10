import { afterEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

describe('FT-004 feature-level adversarial supported-path probe', () => {
	let root: CompositionRoot | undefined;

	afterEach(() => root?.database.close());

	it('does not expose prior-center discussion data after supported class identity reuse', () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES ('center-a', 'Center A'), ('center-b', 'Center B');
			INSERT INTO accounts (id, role) VALUES ('admin-a', 'admin'), ('admin-b', 'admin');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('session-admin-a', 'admin-a', NULL),
				('session-admin-b', 'admin-b', NULL);
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('center-a', 'admin-a'),
				('center-b', 'admin-b');
		`);

		root.centerScheduling.createClass({
			sessionToken: 'session-admin-a',
			centerId: 'center-a',
			classId: 'class-reused',
			name: 'Original class',
			mode: 'group'
		});
		const [originalLesson] = root.centerScheduling.createRecurringSchedule({
			sessionToken: 'session-admin-a',
			classId: 'class-reused',
			scheduleId: 'schedule-reused',
			startDate: '2026-08-03',
			endDate: '2026-08-03',
			weekdays: [1]
		});

		root.collaboration.createFieldComment({
			sessionToken: 'session-admin-a',
			classId: 'class-reused',
			lessonId: originalLesson.lessonId,
			scope: 'shared',
			fieldKey: 'topic',
			commentId: 'comment-center-a',
			body: 'private center A comment'
		});
		root.collaboration.setReaction({
			sessionToken: 'session-admin-a',
			classId: 'class-reused',
			lessonId: originalLesson.lessonId,
			scope: 'shared',
			targetType: 'field',
			targetId: 'topic',
			reaction: 'like'
		});
		root.collaboration.createMessage({
			sessionToken: 'session-admin-a',
			classId: 'class-reused',
			lessonId: originalLesson.lessonId,
			scope: 'shared',
			messageId: 'root-center-a',
			body: 'private center A message'
		});
		root.collaboration.replyToMessage({
			sessionToken: 'session-admin-a',
			classId: 'class-reused',
			lessonId: originalLesson.lessonId,
			scope: 'shared',
			parentMessageId: 'root-center-a',
			messageId: 'reply-center-a',
			body: 'private center A reply'
		});

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
		const [replacementLesson] = root.centerScheduling.createRecurringSchedule({
			sessionToken: 'session-admin-b',
			classId: 'class-reused',
			scheduleId: 'schedule-reused',
			startDate: '2026-08-03',
			endDate: '2026-08-03',
			weekdays: [1]
		});
		expect(replacementLesson.lessonId).toBe(originalLesson.lessonId);

		expect(
			root.collaboration.getFieldComments({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId: replacementLesson.lessonId,
				scope: 'shared',
				fieldKey: 'topic'
			})
		).toEqual([]);
		expect(
			root.collaboration.getReactions({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId: replacementLesson.lessonId,
				scope: 'shared',
				targetType: 'field',
				targetId: 'topic'
			})
		).toEqual([]);
		expect(
			root.collaboration.getDayDiscussion({
				sessionToken: 'session-admin-b',
				classId: 'class-reused',
				lessonId: replacementLesson.lessonId,
				scope: 'shared'
			})
		).toEqual({ commonMessages: [], recentBranchTabs: [] });
	});
});
