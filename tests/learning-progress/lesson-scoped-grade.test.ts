import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

describe('Learning Progress lesson-scoped grade query', () => {
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
				('center-own', 'class-own-secondary', 'teacher-own'),
				('center-other', 'class-other', 'teacher-other');
			INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
				('center-own', 'class-own', 'student-one'),
				('center-own', 'class-own', 'student-two'),
				('center-other', 'class-other', 'student-other');
			INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id) VALUES
				('center-own', 'parent-one', 'student-one'),
				('center-own', 'parent-two', 'student-two');
			INSERT INTO schedules (
				id, center_id, class_id, start_date, end_date, weekdays,
				created_by_account_id, created_at
			) VALUES
				('schedule-own', 'center-own', 'class-own', '2026-08-10', '2026-08-10', '[1]', 'admin-own', '2026-08-01T00:00:00.000Z'),
				('schedule-own-secondary', 'center-own', 'class-own-secondary', '2026-08-10', '2026-08-10', '[1]', 'admin-own', '2026-08-01T00:00:00.000Z'),
				('schedule-other', 'center-other', 'class-other', '2026-08-10', '2026-08-10', '[1]', 'admin-other', '2026-08-01T00:00:00.000Z');
			INSERT INTO lessons (
				id, center_id, class_id, schedule_id, lesson_date, status,
				created_by_account_id, created_at
			) VALUES
				('lesson-own', 'center-own', 'class-own', 'schedule-own', '2026-08-10', 'planned', 'admin-own', '2026-08-01T00:00:00.000Z'),
				('lesson-own-secondary', 'center-own', 'class-own-secondary', 'schedule-own-secondary', '2026-08-10', 'planned', 'admin-own', '2026-08-01T00:00:00.000Z'),
				('lesson-other', 'center-other', 'class-other', 'schedule-other', '2026-08-10', 'planned', 'admin-other', '2026-08-01T00:00:00.000Z');
		`);
	});

	afterEach(() => root.database.close());

	function query(overrides: Partial<{
		sessionToken: string;
		classId: string;
		lessonId: string;
		studentAccountId: string;
	}> = {}) {
		return root.learningProgress.getGradeForLesson({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own',
			studentAccountId: 'student-one',
			...overrides
		});
	}

	function createHomework(homeworkId: string, title: string) {
		return root.learningProgress.createHomework({
			sessionToken: 'session-teacher-own',
			classId: 'class-own',
			homeworkId,
			title
		});
	}

	function stateSnapshot() {
		return {
			homework: root.database.sqlite
				.prepare('SELECT * FROM learning_homework ORDER BY id')
				.all(),
			grades: root.database.sqlite
				.prepare('SELECT * FROM learning_grades ORDER BY homework_id, student_account_id')
				.all(),
			completions: root.database.sqlite
				.prepare('SELECT * FROM learning_homework_completions ORDER BY homework_id, student_account_id')
				.all(),
			attendance: root.database.sqlite
				.prepare('SELECT * FROM learning_attendance ORDER BY lesson_id, student_account_id')
				.all()
		};
	}

	it('returns the selected grade for the permitted student, family, teacher, and admin', () => {
		const homework = createHomework('homework-one', 'First worksheet');
		root.learningProgress.recordGrade({
			sessionToken: 'session-teacher-own',
			classId: 'class-own',
			homeworkId: homework.homeworkId,
			studentAccountId: 'student-one',
			grade: 'β'
		});

		for (const sessionToken of [
			'session-student-one',
			'session-parent-one',
			'session-teacher-own',
			'session-admin-own'
		]) {
			expect(query({ sessionToken })).toMatchObject({
				homeworkId: 'homework-one',
				classId: 'class-own',
				studentAccountId: 'student-one',
				grade: 'β'
			});
		}
	});

	it('returns null for zero class-scoped homework candidates and is safely rerunnable', () => {
		root.learningProgress.createHomework({
			sessionToken: 'session-teacher-own',
			classId: 'class-own-secondary',
			homeworkId: 'homework-other-class',
			title: 'Other class worksheet'
		});
		const before = stateSnapshot();

		expect(query()).toBeNull();
		expect(query()).toBeNull();

		expect(stateSnapshot()).toEqual(before);
	});

	it('fails closed for multiple class-scoped candidates without selecting a grade', () => {
		const first = createHomework('homework-first', 'First worksheet');
		const second = createHomework('homework-second', 'Second worksheet');
		for (const homeworkId of [first.homeworkId, second.homeworkId]) {
			root.learningProgress.recordGrade({
				sessionToken: 'session-teacher-own',
				classId: 'class-own',
				homeworkId,
				studentAccountId: 'student-one',
				grade: homeworkId === first.homeworkId ? 'α' : 'F'
			});
		}
		const before = stateSnapshot();

		expect(() => query()).toThrow('ambiguous-homework-selection');
		expect(() => query()).toThrow('ambiguous-homework-selection');

		expect(stateSnapshot()).toEqual(before);
	});

	it('returns null for exactly one candidate when its grade row is absent', () => {
		createHomework('homework-without-grade', 'Ungraded worksheet');

		expect(query()).toBeNull();
	});

	it('denies unauthenticated, wrong-student, wrong-class, and cross-center reads without mutation', () => {
		const homework = createHomework('homework-private', 'Private worksheet');
		root.learningProgress.recordGrade({
			sessionToken: 'session-teacher-own',
			classId: 'class-own',
			homeworkId: homework.homeworkId,
			studentAccountId: 'student-one',
			grade: 'γ'
		});
		const deniedRequests = [
			{ sessionToken: undefined },
			{ sessionToken: 'session-student-two' },
			{ sessionToken: 'session-parent-two' },
			{ sessionToken: 'session-teacher-own', classId: 'class-own-secondary' },
			{ sessionToken: 'session-admin-own', classId: 'class-other', lessonId: 'lesson-other', studentAccountId: 'student-other' },
			{ sessionToken: 'session-admin-other', classId: 'class-own', lessonId: 'lesson-own', studentAccountId: 'student-one' }
		];

		for (const request of deniedRequests) {
			const before = stateSnapshot();
			expect(() => query(request)).toThrow();
			expect(stateSnapshot()).toEqual(before);
		}
	});
});
