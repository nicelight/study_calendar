import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { STANDARD_REACTIONS } from '../../src/lib/server/modules/collaboration/public';

describe('TASK-011 fresh verifier-owned Collaboration probes', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES
				('center-a', 'Center A'),
				('center-b', 'Center B');
			INSERT INTO accounts (id, role) VALUES
				('admin-a', 'admin'),
				('admin-b', 'admin'),
				('teacher-a', 'teacher'),
				('student-a', 'student'),
				('student-b', 'student'),
				('student-b-center', 'student'),
				('parent-a', 'parent');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('session-admin-a', 'admin-a', NULL),
				('session-admin-b', 'admin-b', NULL),
				('session-teacher-a', 'teacher-a', NULL),
				('session-student-a', 'student-a', NULL),
				('session-student-b', 'student-b', NULL),
				('session-student-b-center', 'student-b-center', NULL),
				('session-parent-a', 'parent-a', NULL);
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('center-a', 'admin-a'),
				('center-a', 'teacher-a'),
				('center-a', 'student-a'),
				('center-a', 'student-b'),
				('center-a', 'parent-a'),
				('center-b', 'admin-b'),
				('center-b', 'student-b-center');
			INSERT INTO classes (id, center_id, name, mode) VALUES
				('class-a', 'center-a', 'Class A', 'group'),
				('class-b', 'center-b', 'Class B', 'group');
			INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id) VALUES
				('center-a', 'class-a', 'teacher-a');
			INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
				('center-a', 'class-a', 'student-a'),
				('center-a', 'class-a', 'student-b'),
				('center-b', 'class-b', 'student-b-center');
			INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id)
				VALUES ('center-a', 'parent-a', 'student-a');
			INSERT INTO schedules (
				id, center_id, class_id, start_date, end_date, weekdays,
				created_by_account_id, created_at
			) VALUES
				('schedule-a', 'center-a', 'class-a', '2026-08-01', '2026-08-31', '[1]', 'admin-a', '2026-08-01T00:00:00.000Z'),
				('schedule-b', 'center-b', 'class-b', '2026-08-01', '2026-08-31', '[1]', 'admin-b', '2026-08-01T00:00:00.000Z');
			INSERT INTO lessons (
				id, center_id, class_id, schedule_id, lesson_date, status,
				created_by_account_id, created_at
			) VALUES
				('lesson-a', 'center-a', 'class-a', 'schedule-a', '2026-08-03', 'planned', 'admin-a', '2026-08-01T00:00:00.000Z'),
				('lesson-b', 'center-b', 'class-b', 'schedule-b', '2026-08-03', 'planned', 'admin-b', '2026-08-01T00:00:00.000Z');
		`);
	});

	afterEach(() => root.database.close());

	it('proves attributable comments, one-owner edit, separated personal scope, and cross-center denial', () => {
		const shared = root.collaboration.createFieldComment({
			sessionToken: 'session-student-a',
			classId: 'class-a',
			lessonId: 'lesson-a',
			scope: 'shared',
			fieldKey: 'topic',
			commentId: 'shared-comment',
			body: 'Initial shared note'
		});

		expect(shared).toMatchObject({
			commentId: 'shared-comment',
			centerId: 'center-a',
			classId: 'class-a',
			lessonId: 'lesson-a',
			scope: 'shared',
			studentAccountId: null,
			fieldKey: 'topic',
			body: 'Initial shared note',
			authorAccountId: 'student-a',
			createdAt: expect.any(String),
			lastChangedAt: expect.any(String)
		});

		const edited = root.collaboration.editFieldComment({
			sessionToken: 'session-student-a',
			commentId: 'shared-comment',
			body: 'Edited shared note'
		});
		expect(edited).toMatchObject({
			body: 'Edited shared note',
			authorAccountId: 'student-a',
			createdAt: shared.createdAt,
			lastChangedAt: expect.any(String)
		});

		expect(() =>
			root.collaboration.createFieldComment({
				sessionToken: 'session-student-a',
				classId: 'class-a',
				lessonId: 'lesson-a',
				scope: 'shared',
				fieldKey: 'topic',
				commentId: 'shared-duplicate',
				body: 'Duplicate shared note'
			})
		).toThrow('comment-already-exists');
		expect(() =>
			root.collaboration.editFieldComment({
				sessionToken: 'session-student-b',
				commentId: 'shared-comment',
				body: 'Non-owner mutation'
			})
		).toThrow('not-authorized');

		expect(
			root.collaboration.getFieldComments({
				sessionToken: 'session-student-b',
				classId: 'class-a',
				lessonId: 'lesson-a',
				scope: 'shared',
				fieldKey: 'topic'
			})
		).toMatchObject([{ body: 'Edited shared note', authorAccountId: 'student-a' }]);

		const personal = root.collaboration.createFieldComment({
			sessionToken: 'session-student-a',
			classId: 'class-a',
			lessonId: 'lesson-a',
			scope: 'personal',
			studentAccountId: 'student-a',
			fieldKey: 'homework',
			commentId: 'personal-comment',
			body: 'Private note'
		});
		expect(personal).toMatchObject({
			scope: 'personal',
			studentAccountId: 'student-a',
			authorAccountId: 'student-a'
		});
		expect(
			root.collaboration.getFieldComments({
				sessionToken: 'session-parent-a',
				classId: 'class-a',
				lessonId: 'lesson-a',
				scope: 'personal',
				studentAccountId: 'student-a',
				fieldKey: 'homework'
			})
		).toMatchObject([{ commentId: 'personal-comment', studentAccountId: 'student-a' }]);
		expect(
			root.collaboration.getFieldComments({
				sessionToken: 'session-student-a',
				classId: 'class-a',
				lessonId: 'lesson-a',
				scope: 'shared',
				fieldKey: 'homework'
			})
		).toEqual([]);

		for (const sessionToken of ['session-student-b', 'session-admin-b']) {
			expect(() =>
				root.collaboration.getFieldComments({
					sessionToken,
					classId: 'class-a',
					lessonId: 'lesson-a',
					scope: 'personal',
					studentAccountId: 'student-a',
					fieldKey: 'homework'
				})
			).toThrow('not-authorized');
		}
		expect(() =>
			root.collaboration.editFieldComment({
				sessionToken: 'session-student-b',
				commentId: 'personal-comment',
				body: 'Cross-student mutation'
			})
		).toThrow('not-authorized');

		expect(() =>
			root.collaboration.createFieldComment({
				sessionToken: 'session-admin-b',
				classId: 'class-a',
				lessonId: 'lesson-a',
				scope: 'shared',
				fieldKey: 'foreign',
				commentId: 'cross-center-comment',
				body: 'Cross-center mutation'
			})
		).toThrow('not-authorized');
		expect(() =>
			root.collaboration.getFieldComments({
				sessionToken: 'session-admin-a',
				classId: 'class-b',
				lessonId: 'lesson-b',
				scope: 'shared',
				fieldKey: 'topic'
			})
		).toThrow('not-authorized');
		expect(
			root.database.sqlite
				.prepare('SELECT COUNT(*) AS count FROM collaboration_comments WHERE id = ?')
				.get('cross-center-comment')
		).toEqual({ count: 0 });
	});

	it('proves all five reactions, per-actor replacement, object ownership, and scope denial', () => {
		root.collaboration.createFieldComment({
			sessionToken: 'session-admin-a',
			classId: 'class-a',
			lessonId: 'lesson-a',
			scope: 'shared',
			fieldKey: 'topic',
			commentId: 'reactable-comment',
			body: 'Reactable'
		});

		const reactors = [
			'session-admin-a',
			'session-teacher-a',
			'session-student-a',
			'session-student-b',
			'session-parent-a'
		];
		for (const [index, reaction] of STANDARD_REACTIONS.entries()) {
			root.collaboration.setReaction({
				sessionToken: reactors[index],
				classId: 'class-a',
				lessonId: 'lesson-a',
				scope: 'shared',
				targetType: 'field',
				targetId: 'topic',
				reaction
			});
		}

		let fieldReactions = root.collaboration.getReactions({
			sessionToken: 'session-student-b',
			classId: 'class-a',
			lessonId: 'lesson-a',
			scope: 'shared',
			targetType: 'field',
			targetId: 'topic'
		});
		expect(fieldReactions).toHaveLength(5);
		expect(fieldReactions.map(({ reaction }) => reaction).sort()).toEqual(
			[...STANDARD_REACTIONS].sort()
		);
		expect(fieldReactions.map(({ reactorAccountId }) => reactorAccountId).sort()).toEqual([
			'admin-a',
			'parent-a',
			'student-a',
			'student-b',
			'teacher-a'
		]);

		root.collaboration.setReaction({
			sessionToken: 'session-student-a',
			classId: 'class-a',
			lessonId: 'lesson-a',
			scope: 'shared',
			targetType: 'field',
			targetId: 'topic',
			reaction: 'love'
		});
		fieldReactions = root.collaboration.getReactions({
			sessionToken: 'session-student-b',
			classId: 'class-a',
			lessonId: 'lesson-a',
			scope: 'shared',
			targetType: 'field',
			targetId: 'topic'
		});
		expect(fieldReactions).toHaveLength(5);
		expect(fieldReactions.filter(({ reactorAccountId }) => reactorAccountId === 'student-a')).toMatchObject([
			{ reaction: 'love' }
		]);
		expect(() =>
			root.collaboration.setReaction({
				sessionToken: 'session-student-a',
				classId: 'class-a',
				lessonId: 'lesson-a',
				scope: 'shared',
				targetType: 'field',
				targetId: 'topic',
				reaction: 'unsupported' as never
			})
		).toThrow('invalid-reaction');
		expect(
			root.database.sqlite
				.prepare('SELECT COUNT(*) AS count FROM collaboration_reactions WHERE target_type = ? AND target_id = ?')
				.get('field', 'topic')
		).toEqual({ count: 5 });

		const commentReaction = root.collaboration.setReaction({
			sessionToken: 'session-student-b',
			classId: 'class-a',
			lessonId: 'lesson-a',
			scope: 'shared',
			targetType: 'comment',
			targetId: 'reactable-comment',
			reaction: 'celebrate'
		});
		expect(commentReaction).toMatchObject({
			targetType: 'comment',
			targetId: 'reactable-comment',
			reactorAccountId: 'student-b',
			reaction: 'celebrate',
			scope: 'shared'
		});
		expect(
			root.collaboration.getReactions({
				sessionToken: 'session-student-a',
				classId: 'class-a',
				lessonId: 'lesson-a',
				scope: 'shared',
				targetType: 'comment',
				targetId: 'reactable-comment'
			})
		).toMatchObject([{ reactorAccountId: 'student-b', reaction: 'celebrate' }]);

		root.collaboration.createFieldComment({
			sessionToken: 'session-student-a',
			classId: 'class-a',
			lessonId: 'lesson-a',
			scope: 'personal',
			studentAccountId: 'student-a',
			fieldKey: 'private-topic',
			commentId: 'private-reactable-comment',
			body: 'Private reactable'
		});
		root.collaboration.setReaction({
			sessionToken: 'session-student-a',
			classId: 'class-a',
			lessonId: 'lesson-a',
			scope: 'personal',
			studentAccountId: 'student-a',
			targetType: 'comment',
			targetId: 'private-reactable-comment',
			reaction: 'like'
		});
		expect(() =>
			root.collaboration.getReactions({
				sessionToken: 'session-student-b',
				classId: 'class-a',
				lessonId: 'lesson-a',
				scope: 'personal',
				studentAccountId: 'student-a',
				targetType: 'comment',
				targetId: 'private-reactable-comment'
			})
		).toThrow('not-authorized');
		expect(() =>
			root.collaboration.getReactions({
				sessionToken: 'session-admin-b',
				classId: 'class-a',
				lessonId: 'lesson-a',
				scope: 'shared',
				targetType: 'comment',
				targetId: 'reactable-comment'
			})
		).toThrow('not-authorized');
	});
});
