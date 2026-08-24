import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

type AttendanceProjectionApi = {
	getAttendancePercentage(request: {
		sessionToken?: string;
		classId?: string;
		studentAccountId?: string;
		teacherAccountId?: string;
	}): number;
};

function api(root: CompositionRoot): AttendanceProjectionApi {
	return root.learningProgress as unknown as AttendanceProjectionApi;
}

function seed(root: CompositionRoot): void {
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-own', 'Own Center'), ('center-other', 'Other Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-own', 'admin'),
			('teacher-own', 'teacher'), ('teacher-unassigned', 'teacher'), ('teacher-other', 'teacher'),
			('student-one', 'student'), ('student-two', 'student'), ('student-other', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-own', 'admin-own', NULL),
			('session-teacher-own', 'teacher-own', NULL),
			('session-teacher-unassigned', 'teacher-unassigned', NULL),
			('session-teacher-other', 'teacher-other', NULL),
			('session-student-one', 'student-one', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-own', 'admin-own'), ('center-own', 'teacher-own'), ('center-own', 'teacher-unassigned'),
			('center-own', 'student-one'), ('center-own', 'student-two'),
			('center-other', 'teacher-other'), ('center-other', 'student-other');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('class-group', 'center-own', 'Group', 'group'),
			('class-secondary', 'center-own', 'Secondary', 'group'),
			('class-empty', 'center-own', 'Empty', 'group'),
			('class-other', 'center-other', 'Other', 'group');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id) VALUES
			('center-own', 'class-group', 'teacher-own'),
			('center-own', 'class-secondary', 'teacher-own'),
			('center-own', 'class-empty', 'teacher-own'),
			('center-other', 'class-other', 'teacher-other');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('center-own', 'class-group', 'student-one'),
			('center-own', 'class-group', 'student-two'),
			('center-own', 'class-secondary', 'student-one'),
			('center-own', 'class-empty', 'student-one'),
			('center-other', 'class-other', 'student-other');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays, created_by_account_id, created_at
		) VALUES
			('schedule-group', 'center-own', 'class-group', '2026-08-01', '2026-08-31', '[1]', 'admin-own', '2026-08-01T00:00:00.000Z'),
			('schedule-secondary', 'center-own', 'class-secondary', '2026-08-01', '2026-08-31', '[1]', 'admin-own', '2026-08-01T00:00:00.000Z'),
			('schedule-other', 'center-other', 'class-other', '2026-08-01', '2026-08-31', '[1]', 'teacher-other', '2026-08-01T00:00:00.000Z');
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status, created_by_account_id, created_at
		) VALUES
			('lesson-group-one', 'center-own', 'class-group', 'schedule-group', '2026-08-03', 'completed', 'admin-own', '2026-08-01T00:00:00.000Z'),
			('lesson-group-two', 'center-own', 'class-group', 'schedule-group', '2026-08-10', 'completed', 'admin-own', '2026-08-01T00:00:00.000Z'),
			('lesson-group-planned', 'center-own', 'class-group', 'schedule-group', '2026-08-17', 'planned', 'admin-own', '2026-08-01T00:00:00.000Z'),
			('lesson-group-cancelled', 'center-own', 'class-group', 'schedule-group', '2026-08-24', 'cancelled', 'admin-own', '2026-08-01T00:00:00.000Z'),
			('lesson-secondary', 'center-own', 'class-secondary', 'schedule-secondary', '2026-08-04', 'completed', 'admin-own', '2026-08-01T00:00:00.000Z'),
			('lesson-other', 'center-other', 'class-other', 'schedule-other', '2026-08-03', 'completed', 'teacher-other', '2026-08-01T00:00:00.000Z');
	`);

	for (const classId of ['class-group', 'class-secondary']) {
		root.financialLedger.setClassPrice({
			sessionToken: 'session-admin-own',
			classId,
			amount: '10',
			effectiveFrom: '2026-01-01'
		});
	}

	root.learningProgress.recordLessonAttendance({
		sessionToken: 'session-teacher-own',
		classId: 'class-group',
		lessonId: 'lesson-group-one',
		absentStudentAccountIds: ['student-two']
	});
	root.learningProgress.recordLessonAttendance({
		sessionToken: 'session-teacher-own',
		classId: 'class-group',
		lessonId: 'lesson-group-two',
		absentStudentAccountIds: []
	});
	root.learningProgress.recordLessonAttendance({
		sessionToken: 'session-teacher-own',
		classId: 'class-secondary',
		lessonId: 'lesson-secondary',
		absentStudentAccountIds: ['student-one']
	});

	root.database.sqlite.prepare(`
		INSERT INTO learning_attendance (
			center_id, class_id, lesson_id, student_account_id, attendance,
			recorded_by_account_id, recorded_at
		) VALUES (?, ?, ?, ?, ?, ?, ?)
	`).run(
		'center-own', 'class-group', 'lesson-group-planned', 'student-one', 'present',
		'admin-own', '2026-08-17T00:00:00.000Z'
	);
	root.database.sqlite.prepare(`
		INSERT INTO learning_attendance (
			center_id, class_id, lesson_id, student_account_id, attendance,
			recorded_by_account_id, recorded_at
		) VALUES (?, ?, ?, ?, ?, ?, ?)
	`).run(
		'center-own', 'class-group', 'lesson-group-cancelled', 'student-one', 'present',
		'admin-own', '2026-08-24T00:00:00.000Z'
	);
}

function sourceFacts(root: CompositionRoot): Record<string, unknown[]> {
	const tableNames = [
		'learning_attendance',
		'financial_lesson_charges',
		'financial_payments',
		'financial_payment_allocations',
		'financial_audit_records',
		'financial_payment_audit_records'
	];
	return Object.fromEntries(tableNames.map((tableName) => [
		tableName,
		root.database.sqlite.prepare(`SELECT * FROM ${tableName} ORDER BY rowid`).all()
	]));
}

describe('FT-007-AC-006 Learning Progress attendance projection', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		seed(root);
	});

	afterEach(() => root.database.close());

	it('returns student ratios over conducted slots and ignores planned/cancelled lessons', () => {
		const attendance = api(root);

		expect(attendance.getAttendancePercentage({
			sessionToken: 'session-student-one',
			classId: 'class-group',
			studentAccountId: 'student-one'
		})).toBe(100);
		expect(attendance.getAttendancePercentage({
			sessionToken: 'session-admin-own',
			classId: 'class-group',
			studentAccountId: 'student-two'
		})).toBe(50);
		expect(attendance.getAttendancePercentage({
			sessionToken: 'session-admin-own',
			classId: 'class-secondary',
			studentAccountId: 'student-one'
		})).toBe(0);
	});

	it('uses default-present rows, reflects correction, and aggregates assigned Teacher slots', () => {
		const attendance = api(root);

		expect(attendance.getAttendancePercentage({
			sessionToken: 'session-admin-own',
			classId: 'class-group',
			studentAccountId: 'student-two'
		})).toBe(50);
		expect(attendance.getAttendancePercentage({
			sessionToken: 'session-teacher-own',
			teacherAccountId: 'teacher-own'
		})).toBe(60);

		root.learningProgress.recordAttendance({
			sessionToken: 'session-admin-own',
			classId: 'class-group',
			lessonId: 'lesson-group-one',
			studentAccountId: 'student-two',
			attendance: 'present'
		});

		expect(attendance.getAttendancePercentage({
			sessionToken: 'session-admin-own',
			classId: 'class-group',
			studentAccountId: 'student-two'
		})).toBe(100);
		expect(attendance.getAttendancePercentage({
			sessionToken: 'session-admin-own',
			teacherAccountId: 'teacher-own'
		})).toBe(80);
	});

	it('returns zero for an authorized student with no conducted slots and preserves source facts', () => {
		const attendance = api(root);
		const before = sourceFacts(root);

		expect(attendance.getAttendancePercentage({
			sessionToken: 'session-student-one',
			classId: 'class-empty',
			studentAccountId: 'student-one'
		})).toBe(0);
		expect(attendance.getAttendancePercentage({
			sessionToken: 'session-admin-own',
			classId: 'class-group',
			studentAccountId: 'student-one'
		})).toBe(100);

		expect(sourceFacts(root)).toEqual(before);
	});

	it('denies unassigned, cross-center, removed-assignment, and private student scope', () => {
		const attendance = api(root);

		expect(() => attendance.getAttendancePercentage({
			sessionToken: 'session-teacher-unassigned',
			classId: 'class-group',
			studentAccountId: 'student-one'
		})).toThrow('not-authorized');
		expect(() => attendance.getAttendancePercentage({
			sessionToken: 'session-teacher-other',
			classId: 'class-group',
			studentAccountId: 'student-one'
		})).toThrow('not-authorized');
		expect(() => attendance.getAttendancePercentage({
			sessionToken: 'session-student-one',
			classId: 'class-group',
			studentAccountId: 'student-two'
		})).toThrow('not-authorized');

		root.centerScheduling.removeTeacherAssignment({
			sessionToken: 'session-admin-own',
			classId: 'class-group',
			teacherAccountId: 'teacher-own'
		});
		expect(() => attendance.getAttendancePercentage({
			sessionToken: 'session-teacher-own',
			classId: 'class-group',
			studentAccountId: 'student-one'
		})).toThrow('not-authorized');
	});
});
