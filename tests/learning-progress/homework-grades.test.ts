import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

describe('Learning Progress homework completion and private grades', () => {
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
				('student-three', 'student'),
				('student-other', 'student'),
				('parent-one', 'parent'),
				('parent-two', 'parent');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('session-admin-own', 'admin-own', NULL),
				('session-admin-other', 'admin-other', NULL),
				('session-teacher-own', 'teacher-own', NULL),
				('session-teacher-other', 'teacher-other', NULL),
				('session-student-one', 'student-one', NULL),
				('session-student-two', 'student-two', NULL),
				('session-student-other', 'student-other', NULL),
				('session-parent-one', 'parent-one', NULL),
				('session-parent-two', 'parent-two', NULL);
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('center-own', 'admin-own'),
				('center-own', 'teacher-own'),
				('center-own', 'student-one'),
				('center-own', 'student-two'),
				('center-own', 'student-three'),
				('center-own', 'parent-one'),
				('center-own', 'parent-two'),
				('center-other', 'admin-other'),
				('center-other', 'teacher-other'),
				('center-other', 'student-other');
			INSERT INTO classes (id, center_id, name, mode) VALUES
				('class-own', 'center-own', 'Own Class', 'group'),
				('class-own-secondary', 'center-own', 'Own Secondary Class', 'group'),
				('class-other', 'center-other', 'Other Class', 'group');
			INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id) VALUES
				('center-own', 'class-own', 'teacher-own'),
				('center-other', 'class-other', 'teacher-other');
			INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
				('center-own', 'class-own', 'student-one'),
				('center-own', 'class-own', 'student-two'),
				('center-own', 'class-own-secondary', 'student-three'),
				('center-other', 'class-other', 'student-other');
			INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id) VALUES
				('center-own', 'parent-one', 'student-one'),
				('center-own', 'parent-two', 'student-two');
		`);
	});

	afterEach(() => root.database.close());

	it('FT-005-AC-001 persists student completion and exposes it only through an authorized class view', () => {
		const homework = root.learningProgress.createHomework({
			sessionToken: 'session-teacher-own',
			classId: 'class-own',
			homeworkId: 'homework-one',
			title: 'Read chapter one'
		});

		root.learningProgress.completeHomework({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			homeworkId: homework.homeworkId
		});

		const classView = root.learningProgress.getHomeworkCompletions({
			sessionToken: 'session-student-two',
			classId: 'class-own',
			homeworkId: homework.homeworkId
		});
		expect(classView).toEqual([
			{
				homeworkId: 'homework-one',
				classId: 'class-own',
				studentAccountId: 'student-one',
				completed: true,
				completedAt: expect.any(String)
			},
			{
				homeworkId: 'homework-one',
				classId: 'class-own',
				studentAccountId: 'student-two',
				completed: false,
				completedAt: null
			}
		]);
		expect(classView[0]).not.toHaveProperty('grade');

		expect(() =>
			root.learningProgress.getHomeworkCompletions({
				sessionToken: 'session-student-other',
				classId: 'class-own',
				homeworkId: homework.homeworkId
			})
		).toThrow('not-authorized');
	});

	it('FT-005-AC-002 enforces accepted grades and the student/family/teacher/admin privacy matrix', () => {
		const homework = root.learningProgress.createHomework({
			sessionToken: 'session-teacher-own',
			classId: 'class-own',
			homeworkId: 'homework-two',
			title: 'Solve exercises'
		});

		root.learningProgress.recordGrade({
			sessionToken: 'session-teacher-own',
			classId: 'class-own',
			homeworkId: homework.homeworkId,
			studentAccountId: 'student-one',
			grade: 'α'
		});
		for (const grade of ['β', 'γ', 'F'] as const) {
			root.learningProgress.recordGrade({
				sessionToken: 'session-teacher-own',
				classId: 'class-own',
				homeworkId: homework.homeworkId,
				studentAccountId: 'student-one',
				grade
			});
		}
		expect(root.learningProgress.getGrade({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			homeworkId: homework.homeworkId,
			studentAccountId: 'student-one'
		})?.grade).toBe('F');

		for (const sessionToken of [
			'session-student-one',
			'session-parent-one',
			'session-teacher-own',
			'session-admin-own'
		]) {
			expect(root.learningProgress.getGrade({
				sessionToken,
				classId: 'class-own',
				homeworkId: homework.homeworkId,
				studentAccountId: 'student-one'
			})).toMatchObject({ grade: 'F', studentAccountId: 'student-one' });
		}

		const beforeInvalid = root.database.sqlite
			.prepare('SELECT grade FROM learning_grades WHERE homework_id = ? AND student_account_id = ?')
			.get(homework.homeworkId, 'student-one');
		expect(() =>
			root.learningProgress.recordGrade({
				sessionToken: 'session-teacher-own',
				classId: 'class-own',
				homeworkId: homework.homeworkId,
				studentAccountId: 'student-one',
				grade: 'A' as unknown as 'α'
			})
		).toThrow('invalid-grade');
		expect(root.database.sqlite
			.prepare('SELECT grade FROM learning_grades WHERE homework_id = ? AND student_account_id = ?')
			.get(homework.homeworkId, 'student-one')).toEqual(beforeInvalid);

		for (const sessionToken of ['session-student-two', 'session-parent-two', 'session-teacher-other', 'session-admin-other']) {
			expect(() =>
				root.learningProgress.getGrade({
					sessionToken,
					classId: 'class-own',
					homeworkId: homework.homeworkId,
					studentAccountId: 'student-one'
			})
			).toThrow('not-authorized');
		}
	});

	it('requires teacher and own-center Admin grade targets to belong to the requested class', () => {
		const homework = root.learningProgress.createHomework({
			sessionToken: 'session-teacher-own',
			classId: 'class-own',
			homeworkId: 'homework-class-membership',
			title: 'Class membership check'
		});

		for (const sessionToken of ['session-teacher-own', 'session-admin-own']) {
			expect(() =>
				root.learningProgress.recordGrade({
					sessionToken,
					classId: 'class-own',
					homeworkId: homework.homeworkId,
					studentAccountId: 'student-three',
					grade: 'α'
				})
			).toThrow('not-authorized');
		}
		expect(
			root.database.sqlite
				.prepare('SELECT COUNT(*) AS count FROM learning_grades WHERE homework_id = ?')
				.get(homework.homeworkId)
		).toEqual({ count: 0 });

		root.database.sqlite
			.prepare(
				`INSERT INTO learning_grades (
					homework_id, student_account_id, grade, recorded_by_account_id, recorded_at
				) VALUES (?, ?, ?, ?, ?)`
			)
			.run(homework.homeworkId, 'student-three', 'β', 'teacher-own', '2026-08-08T00:00:00.000Z');

		for (const sessionToken of ['session-teacher-own', 'session-admin-own']) {
			expect(() =>
				root.learningProgress.getGrade({
					sessionToken,
					classId: 'class-own',
					homeworkId: homework.homeworkId,
					studentAccountId: 'student-three'
				})
			).toThrow('not-authorized');
		}
	});
});
