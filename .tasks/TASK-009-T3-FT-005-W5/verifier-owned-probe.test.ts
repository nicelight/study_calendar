import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

describe('TASK-009 verifier-owned AC-001/AC-002 probe', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES
				('v-center-a', 'Verifier Center A'),
				('v-center-b', 'Verifier Center B');
			INSERT INTO accounts (id, role) VALUES
				('v-admin-a', 'admin'),
				('v-admin-b', 'admin'),
				('v-teacher-a', 'teacher'),
				('v-teacher-b', 'teacher'),
				('v-student-a1', 'student'),
				('v-student-a2', 'student'),
				('v-student-b1', 'student'),
				('v-parent-a1', 'parent'),
				('v-parent-a2', 'parent');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('v-session-admin-a', 'v-admin-a', NULL),
				('v-session-admin-b', 'v-admin-b', NULL),
				('v-session-teacher-a', 'v-teacher-a', NULL),
				('v-session-teacher-b', 'v-teacher-b', NULL),
				('v-session-student-a1', 'v-student-a1', NULL),
				('v-session-student-a2', 'v-student-a2', NULL),
				('v-session-student-b1', 'v-student-b1', NULL),
				('v-session-parent-a1', 'v-parent-a1', NULL),
				('v-session-parent-a2', 'v-parent-a2', NULL);
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('v-center-a', 'v-admin-a'),
				('v-center-a', 'v-teacher-a'),
				('v-center-a', 'v-student-a1'),
				('v-center-a', 'v-student-a2'),
				('v-center-a', 'v-parent-a1'),
				('v-center-a', 'v-parent-a2'),
				('v-center-b', 'v-admin-b'),
				('v-center-b', 'v-teacher-b'),
				('v-center-b', 'v-student-b1');
			INSERT INTO classes (id, center_id, name, mode) VALUES
				('v-class-a', 'v-center-a', 'Verifier Class A', 'group'),
				('v-class-b', 'v-center-b', 'Verifier Class B', 'group');
			INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id) VALUES
				('v-center-a', 'v-class-a', 'v-teacher-a'),
				('v-center-b', 'v-class-b', 'v-teacher-b');
			INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
				('v-center-a', 'v-class-a', 'v-student-a1'),
				('v-center-a', 'v-class-a', 'v-student-a2'),
				('v-center-b', 'v-class-b', 'v-student-b1');
			INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id) VALUES
				('v-center-a', 'v-parent-a1', 'v-student-a1'),
				('v-center-a', 'v-parent-a2', 'v-student-a2');
		`);
	});

	afterEach(() => root.database.close());

	it('AC-001 persists completion, exposes a grade-free class projection, and denies out-of-context access', () => {
		const homework = root.learningProgress.createHomework({
			sessionToken: 'v-session-teacher-a',
			classId: 'v-class-a',
			homeworkId: 'v-homework-completion',
			title: 'Verifier homework'
		});

		const completion = root.learningProgress.completeHomework({
			sessionToken: 'v-session-student-a1',
			classId: 'v-class-a',
			homeworkId: homework.homeworkId
		});
		expect(completion).toMatchObject({
			homeworkId: 'v-homework-completion',
			classId: 'v-class-a',
			studentAccountId: 'v-student-a1',
			completed: true
		});

		const classProjection = root.learningProgress.getHomeworkCompletions({
			sessionToken: 'v-session-student-a2',
			classId: 'v-class-a',
			homeworkId: homework.homeworkId
		});
		expect(classProjection).toEqual([
			{
				homeworkId: 'v-homework-completion',
				classId: 'v-class-a',
				studentAccountId: 'v-student-a1',
				completed: true,
				completedAt: expect.any(String)
			},
			{
				homeworkId: 'v-homework-completion',
				classId: 'v-class-a',
				studentAccountId: 'v-student-a2',
				completed: false,
				completedAt: null
			}
		]);
		expect(classProjection.every((item) => !Object.hasOwn(item, 'grade'))).toBe(true);
		expect(
			root.database.sqlite
				.prepare(
					'SELECT completed_at FROM learning_homework_completions WHERE homework_id = ? AND student_account_id = ?'
				)
				.get('v-homework-completion', 'v-student-a1')
		).toMatchObject({ completed_at: expect.any(String) });

		expect(() =>
			root.learningProgress.getHomeworkCompletions({
				sessionToken: 'v-session-student-b1',
				classId: 'v-class-a',
				homeworkId: homework.homeworkId
			})
		).toThrow('not-authorized');
	});

	it('AC-002 accepts exactly α/β/γ/F and enforces positive and negative private-read scope', () => {
		const homework = root.learningProgress.createHomework({
			sessionToken: 'v-session-teacher-a',
			classId: 'v-class-a',
			homeworkId: 'v-homework-grade',
			title: 'Verifier grading'
		});

		for (const [index, grade] of (['α', 'β', 'γ', 'F'] as const).entries()) {
			root.learningProgress.recordGrade({
				sessionToken: 'v-session-teacher-a',
				classId: 'v-class-a',
				homeworkId: homework.homeworkId,
				studentAccountId: 'v-student-a1',
				grade
			});
			expect(
				root.learningProgress.getGrade({
					sessionToken: 'v-session-student-a1',
					classId: 'v-class-a',
					homeworkId: homework.homeworkId,
					studentAccountId: 'v-student-a1'
				})?.grade
			).toBe(grade);
			expect(index).toBeLessThan(4);
		}

		const persistedBeforeInvalid = root.database.sqlite
			.prepare('SELECT grade FROM learning_grades WHERE homework_id = ? AND student_account_id = ?')
			.get('v-homework-grade', 'v-student-a1');
		expect(() =>
			root.learningProgress.recordGrade({
				sessionToken: 'v-session-teacher-a',
				classId: 'v-class-a',
				homeworkId: homework.homeworkId,
				studentAccountId: 'v-student-a1',
				grade: 'A' as unknown as 'α'
			})
		).toThrow('invalid-grade');
		expect(
			root.database.sqlite
				.prepare('SELECT grade FROM learning_grades WHERE homework_id = ? AND student_account_id = ?')
				.get('v-homework-grade', 'v-student-a1')
		).toEqual(persistedBeforeInvalid);

		for (const sessionToken of [
			'v-session-student-a1',
			'v-session-parent-a1',
			'v-session-teacher-a',
			'v-session-admin-a'
		]) {
			expect(
				root.learningProgress.getGrade({
					sessionToken,
					classId: 'v-class-a',
					homeworkId: homework.homeworkId,
					studentAccountId: 'v-student-a1'
				})
			).toMatchObject({ grade: 'F', studentAccountId: 'v-student-a1' });
		}

		for (const sessionToken of [
			'v-session-student-a2',
			'v-session-parent-a2',
			'v-session-teacher-b',
			'v-session-admin-b'
		]) {
			expect(() =>
				root.learningProgress.getGrade({
					sessionToken,
					classId: 'v-class-a',
					homeworkId: homework.homeworkId,
					studentAccountId: 'v-student-a1'
				})
			).toThrow('not-authorized');
		}
	});
});
