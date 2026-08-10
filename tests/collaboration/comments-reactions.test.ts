import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { STANDARD_REACTIONS } from '../../src/lib/server/modules/collaboration/public';

describe('Collaboration comments, reactions, and scoped discussion access', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES
				('center-own', 'Own Center'),
				('center-other', 'Other Center');
			INSERT INTO accounts (id, role) VALUES
				('admin-own', 'admin'),
				('admin-other', 'admin'),
				('teacher-own', 'teacher'),
				('teacher-other', 'teacher'),
				('student-one', 'student'),
				('student-two', 'student'),
				('student-other', 'student'),
				('parent-one', 'parent');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('session-admin-own', 'admin-own', NULL),
				('session-admin-other', 'admin-other', NULL),
				('session-teacher-own', 'teacher-own', NULL),
				('session-teacher-other', 'teacher-other', NULL),
				('session-student-one', 'student-one', NULL),
				('session-student-two', 'student-two', NULL),
				('session-student-other', 'student-other', NULL),
				('session-parent-one', 'parent-one', NULL);
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('center-own', 'admin-own'),
				('center-own', 'teacher-own'),
				('center-own', 'student-one'),
				('center-own', 'student-two'),
				('center-own', 'parent-one'),
				('center-other', 'admin-other'),
				('center-other', 'teacher-other'),
				('center-other', 'student-other');
			INSERT INTO classes (id, center_id, name, mode) VALUES
				('class-own', 'center-own', 'Own Class', 'group'),
				('class-other', 'center-other', 'Other Class', 'group');
			INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id) VALUES
				('center-own', 'class-own', 'teacher-own'),
				('center-other', 'class-other', 'teacher-other');
			INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
				('center-own', 'class-own', 'student-one'),
				('center-own', 'class-own', 'student-two'),
				('center-other', 'class-other', 'student-other');
			INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id) VALUES
				('center-own', 'parent-one', 'student-one');
			INSERT INTO schedules (
				id, center_id, class_id, start_date, end_date, weekdays,
				created_by_account_id, created_at
			) VALUES
				('schedule-own', 'center-own', 'class-own', '2026-08-01', '2026-08-31', '[1]', 'admin-own', '2026-08-01T00:00:00.000Z'),
				('schedule-other', 'center-other', 'class-other', '2026-08-01', '2026-08-31', '[1]', 'admin-other', '2026-08-01T00:00:00.000Z');
			INSERT INTO lessons (
				id, center_id, class_id, schedule_id, lesson_date, status,
				created_by_account_id, created_at
			) VALUES
				('lesson-own', 'center-own', 'class-own', 'schedule-own', '2026-08-03', 'planned', 'admin-own', '2026-08-01T00:00:00.000Z'),
				('lesson-other', 'center-other', 'class-other', 'schedule-other', '2026-08-03', 'planned', 'admin-other', '2026-08-01T00:00:00.000Z');
		`);
	});

	afterEach(() => root.database.close());

	it('FT-004-AC-001 keeps one editable account-owned field comment with attribution', () => {
		const created = root.collaboration.createFieldComment({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own',
			scope: 'shared',
			fieldKey: 'topic',
			commentId: 'comment-one',
			body: 'First note'
		});

		expect(created).toMatchObject({
			commentId: 'comment-one',
			fieldKey: 'topic',
			body: 'First note',
			authorAccountId: 'student-one',
			createdAt: expect.any(String),
			lastChangedAt: expect.any(String)
		});

		const edited = root.collaboration.editFieldComment({
			sessionToken: 'session-student-one',
			commentId: 'comment-one',
			body: 'Edited note'
		});
		expect(edited).toMatchObject({
			commentId: 'comment-one',
			body: 'Edited note',
			authorAccountId: 'student-one'
		});
		expect(edited.lastChangedAt).toBeTruthy();

		expect(() =>
			root.collaboration.createFieldComment({
				sessionToken: 'session-student-one',
				classId: 'class-own',
				lessonId: 'lesson-own',
				scope: 'shared',
				fieldKey: 'topic',
				commentId: 'comment-duplicate',
				body: 'Duplicate'
			})
		).toThrow('comment-already-exists');

		const visibleToClassParticipant = root.collaboration.getFieldComments({
			sessionToken: 'session-student-two',
			classId: 'class-own',
			lessonId: 'lesson-own',
			scope: 'shared',
			fieldKey: 'topic'
		});
		expect(visibleToClassParticipant).toHaveLength(1);
		expect(visibleToClassParticipant[0]).toMatchObject({
			body: 'Edited note',
			authorAccountId: 'student-one'
		});

		expect(() =>
			root.collaboration.editFieldComment({
				sessionToken: 'session-student-two',
				commentId: 'comment-one',
				body: 'Unauthorized edit'
			})
		).toThrow('not-authorized');
	});

	it('FT-004-AC-002 applies exactly one of five reactions and projects permitted reactors', () => {
		root.collaboration.createFieldComment({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			lessonId: 'lesson-own',
			scope: 'shared',
			fieldKey: 'topic',
			commentId: 'comment-reactable',
			body: 'React to this'
		});
		root.collaboration.setReaction({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own',
			scope: 'shared',
			targetType: 'comment',
			targetId: 'comment-reactable',
			reaction: 'like'
		});
		expect(root.collaboration.getReactions({
			sessionToken: 'session-student-two',
			classId: 'class-own',
			lessonId: 'lesson-own',
			scope: 'shared',
			targetType: 'comment',
			targetId: 'comment-reactable'
		})).toMatchObject([{ targetType: 'comment', reactorAccountId: 'student-one', reaction: 'like' }]);

		for (const [index, reaction] of STANDARD_REACTIONS.entries()) {
			root.collaboration.setReaction({
				sessionToken: ['session-admin-own', 'session-teacher-own', 'session-student-one', 'session-student-two', 'session-parent-one'][index],
				classId: 'class-own',
				lessonId: 'lesson-own',
				scope: 'shared',
				targetType: 'field',
				targetId: 'topic',
				reaction
			});
		}

		const reactions = root.collaboration.getReactions({
			sessionToken: 'session-student-two',
			classId: 'class-own',
			lessonId: 'lesson-own',
			scope: 'shared',
			targetType: 'field',
			targetId: 'topic'
		});
		expect(reactions).toHaveLength(5);
		expect(reactions.map((reaction) => reaction.reaction).sort()).toEqual(
			[...STANDARD_REACTIONS].sort()
		);
		expect(reactions.map((reaction) => reaction.reactorAccountId).sort()).toEqual([
			'admin-own',
			'parent-one',
			'student-one',
			'student-two',
			'teacher-own'
		]);

		root.collaboration.setReaction({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own',
			scope: 'shared',
			targetType: 'field',
			targetId: 'topic',
			reaction: 'love'
		});
		expect(
			root.collaboration.getReactions({
				sessionToken: 'session-student-two',
				classId: 'class-own',
				lessonId: 'lesson-own',
				scope: 'shared',
				targetType: 'field',
				targetId: 'topic'
			}).filter((reaction) => reaction.reactorAccountId === 'student-one')
		).toEqual([
			expect.objectContaining({ reaction: 'love', reactorAccountId: 'student-one' })
		]);

		expect(() =>
			root.collaboration.setReaction({
				sessionToken: 'session-student-one',
				classId: 'class-own',
				lessonId: 'lesson-own',
				scope: 'shared',
				targetType: 'field',
				targetId: 'topic',
				reaction: 'unsupported' as never
			})
		).toThrow('invalid-reaction');
	});

	it('FT-004-AC-005 separates shared and personal discussion by current server scope', () => {
		root.collaboration.createFieldComment({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own',
			scope: 'personal',
			studentAccountId: 'student-one',
			fieldKey: 'homework',
			commentId: 'comment-personal-one',
			body: 'Private note'
		});

		expect(
			root.collaboration.getFieldComments({
				sessionToken: 'session-parent-one',
				classId: 'class-own',
				lessonId: 'lesson-own',
				scope: 'personal',
				studentAccountId: 'student-one',
				fieldKey: 'homework'
			})
		).toMatchObject([{ studentAccountId: 'student-one', body: 'Private note' }]);

		for (const sessionToken of ['session-student-two', 'session-admin-other', 'session-teacher-other']) {
			expect(() =>
				root.collaboration.getFieldComments({
					sessionToken,
					classId: 'class-own',
					lessonId: 'lesson-own',
					scope: 'personal',
					studentAccountId: 'student-one',
					fieldKey: 'homework'
				})
			).toThrow('not-authorized');
		}

		expect(() =>
			root.collaboration.editFieldComment({
				sessionToken: 'session-student-two',
				commentId: 'comment-personal-one',
				body: 'Cross-student mutation'
			})
		).toThrow('not-authorized');

		expect(() =>
			root.collaboration.setReaction({
				sessionToken: 'session-student-two',
				classId: 'class-own',
				lessonId: 'lesson-own',
				scope: 'shared',
				targetType: 'comment',
				targetId: 'comment-personal-one',
				reaction: 'like'
			})
		).toThrow('not-authorized');

		expect(() =>
			root.collaboration.createFieldComment({
				sessionToken: 'session-student-one',
				classId: 'class-other',
				lessonId: 'lesson-other',
				scope: 'shared',
				fieldKey: 'topic',
				commentId: 'comment-cross-center',
				body: 'Cross-center'
			})
		).toThrow('not-authorized');
	});
});
