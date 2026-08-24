import fs from 'node:fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

type AttendanceApi = {
	getAttendancePercentage(request: {
		sessionToken?: string;
		classId?: string;
		studentAccountId?: string;
		teacherAccountId?: string;
	}): number;
};

function attendance(root: CompositionRoot): AttendanceApi {
	return root.learningProgress as unknown as AttendanceApi;
}

function seed(root: CompositionRoot): void {
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-own', 'Own'), ('center-other', 'Other');
		INSERT INTO accounts (id, role) VALUES
			('admin-own', 'admin'), ('teacher-own', 'teacher'), ('teacher-other', 'teacher'),
			('student-a', 'student'), ('student-b', 'student'), ('student-other', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin', 'admin-own', NULL), ('session-teacher', 'teacher-own', NULL),
			('session-other-teacher', 'teacher-other', NULL), ('session-a', 'student-a', NULL),
			('session-b', 'student-b', NULL), ('session-other-student', 'student-other', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-own', 'admin-own'), ('center-own', 'teacher-own'),
			('center-own', 'student-a'), ('center-own', 'student-b'),
			('center-other', 'teacher-other'), ('center-other', 'student-other');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('class-main', 'center-own', 'Main', 'group'),
			('class-secondary', 'center-own', 'Secondary', 'group'),
			('class-empty', 'center-own', 'Empty', 'group'),
			('class-other', 'center-other', 'Other', 'group');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id) VALUES
			('center-own', 'class-main', 'teacher-own'),
			('center-own', 'class-secondary', 'teacher-own'),
			('center-other', 'class-other', 'teacher-other');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('center-own', 'class-main', 'student-a'), ('center-own', 'class-main', 'student-b'),
			('center-own', 'class-secondary', 'student-a'),
			('center-own', 'class-empty', 'student-a'),
			('center-other', 'class-other', 'student-other');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays, created_by_account_id, created_at
		) VALUES
			('schedule-main', 'center-own', 'class-main', '2026-08-01', '2026-08-31', '[1]', 'admin-own', '2026-08-01T00:00:00.000Z'),
			('schedule-secondary', 'center-own', 'class-secondary', '2026-08-01', '2026-08-31', '[1]', 'admin-own', '2026-08-01T00:00:00.000Z'),
			('schedule-other', 'center-other', 'class-other', '2026-08-01', '2026-08-31', '[1]', 'teacher-other', '2026-08-01T00:00:00.000Z');
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status, created_by_account_id, created_at
		) VALUES
			('main-one', 'center-own', 'class-main', 'schedule-main', '2026-08-03', 'completed', 'admin-own', '2026-08-01T00:00:00.000Z'),
			('main-two', 'center-own', 'class-main', 'schedule-main', '2026-08-10', 'completed', 'admin-own', '2026-08-01T00:00:00.000Z'),
			('main-planned', 'center-own', 'class-main', 'schedule-main', '2026-08-17', 'planned', 'admin-own', '2026-08-01T00:00:00.000Z'),
			('main-cancelled', 'center-own', 'class-main', 'schedule-main', '2026-08-24', 'cancelled', 'admin-own', '2026-08-01T00:00:00.000Z'),
			('secondary-one', 'center-own', 'class-secondary', 'schedule-secondary', '2026-08-04', 'completed', 'admin-own', '2026-08-01T00:00:00.000Z'),
			('other-one', 'center-other', 'class-other', 'schedule-other', '2026-08-03', 'completed', 'teacher-other', '2026-08-01T00:00:00.000Z');
	`);

	for (const classId of ['class-main', 'class-secondary']) {
		root.financialLedger.setClassPrice({
			sessionToken: 'session-admin',
			classId,
			amount: '10',
			effectiveFrom: '2026-01-01'
		});
	}

	// The class-day command supplies the default-present remainder and one explicit absence.
	root.learningProgress.recordLessonAttendance({
		sessionToken: 'session-teacher',
		classId: 'class-main',
		lessonId: 'main-one',
		absentStudentAccountIds: ['student-b']
	});
	root.learningProgress.recordLessonAttendance({
		sessionToken: 'session-teacher',
		classId: 'class-main',
		lessonId: 'main-two',
		absentStudentAccountIds: []
	});
	root.learningProgress.recordLessonAttendance({
		sessionToken: 'session-teacher',
		classId: 'class-secondary',
		lessonId: 'secondary-one',
		absentStudentAccountIds: ['student-a']
	});

	// Rows on non-conducted lessons must not enter the denominator or numerator.
	root.database.sqlite.prepare(`
		INSERT INTO learning_attendance (
			center_id, class_id, lesson_id, student_account_id, attendance,
			recorded_by_account_id, recorded_at
		) VALUES (?, ?, ?, ?, ?, ?, ?)
	`).run(
		'center-own', 'class-main', 'main-planned', 'student-a', 'present',
		'admin-own', '2026-08-17T00:00:00.000Z'
	);
	root.database.sqlite.prepare(`
		INSERT INTO learning_attendance (
			center_id, class_id, lesson_id, student_account_id, attendance,
			recorded_by_account_id, recorded_at
		) VALUES (?, ?, ?, ?, ?, ?, ?)
	`).run(
		'center-own', 'class-main', 'main-cancelled', 'student-a', 'present',
		'admin-own', '2026-08-24T00:00:00.000Z'
	);
}

function sourceFacts(root: CompositionRoot): Record<string, unknown[]> {
	const tables = [
		'learning_attendance',
		'financial_lesson_charges',
		'financial_payments',
		'financial_payment_allocations',
		'financial_audit_records',
		'financial_payment_audit_records'
	];
	return Object.fromEntries(tables.map((table) => [
		table,
		root.database.sqlite.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()
	]));
}

describe('verifier-owned proof: TASK-089-T3-FT-007-W29', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		seed(root);
	});

	afterEach(() => root.database.close());

	it('proves the complete attendance projection claim and read-only behavior', () => {
		const api = attendance(root);

		// Two conducted slots: A is present twice; B is absent once and present once.
		expect(api.getAttendancePercentage({
			sessionToken: 'session-a', classId: 'class-main', studentAccountId: 'student-a'
		})).toBe(100);
		expect(api.getAttendancePercentage({
			sessionToken: 'session-b', classId: 'class-main', studentAccountId: 'student-b'
		})).toBe(50);
		// Main is 3/4 present; secondary is 0/1, so the assigned Teacher is 3/5 = 60%.
		expect(api.getAttendancePercentage({
			sessionToken: 'session-teacher', teacherAccountId: 'teacher-own'
		})).toBe(60);
		expect(api.getAttendancePercentage({
			sessionToken: 'session-a', classId: 'class-empty', studentAccountId: 'student-a'
		})).toBe(0);

		const beforeRead = sourceFacts(root);
		expect(api.getAttendancePercentage({
			sessionToken: 'session-a', classId: 'class-main', studentAccountId: 'student-a'
		})).toBe(100);
		expect(sourceFacts(root)).toEqual(beforeRead);

		// An absent-to-present correction is reflected by the next read and changes no projection-owned data.
		root.learningProgress.recordAttendance({
			sessionToken: 'session-admin',
			classId: 'class-main',
			lessonId: 'main-one',
			studentAccountId: 'student-b',
			attendance: 'present'
		});
		expect(api.getAttendancePercentage({
			sessionToken: 'session-b', classId: 'class-main', studentAccountId: 'student-b'
		})).toBe(100);
		expect(api.getAttendancePercentage({
			sessionToken: 'session-admin', teacherAccountId: 'teacher-own'
		})).toBe(80);

		// Authorization is server-side and fail-closed for private, unassigned, and cross-center scope.
		expect(() => api.getAttendancePercentage({
			sessionToken: 'session-a', classId: 'class-main', studentAccountId: 'student-b'
		})).toThrow('not-authorized');
		expect(() => api.getAttendancePercentage({
			sessionToken: 'session-other-teacher', classId: 'class-main', studentAccountId: 'student-a'
		})).toThrow('not-authorized');
		expect(() => api.getAttendancePercentage({
			sessionToken: 'session-other-student', classId: 'class-main', studentAccountId: 'student-a'
		})).toThrow('not-authorized');
		expect(() => api.getAttendancePercentage({
			sessionToken: 'session-teacher', classId: 'class-main', studentAccountId: 'student-a', teacherAccountId: 'teacher-own'
		})).toThrow('not-authorized');

		root.centerScheduling.removeTeacherAssignment({
			sessionToken: 'session-admin', classId: 'class-main', teacherAccountId: 'teacher-own'
		});
		expect(() => api.getAttendancePercentage({
			sessionToken: 'session-teacher', classId: 'class-main', studentAccountId: 'student-a'
		})).toThrow('not-authorized');

		const source = fs.readFileSync('src/lib/server/modules/learning-progress/public.ts', 'utf8');
		const start = source.indexOf('\tgetAttendancePercentage(');
		const end = source.indexOf('\n\tcreateHomework(', start);
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(start);
		const projectionMethod = source.slice(start, end);
		expect(projectionMethod).toContain('this.identityAccess.resolveActor');
		expect(projectionMethod).toContain('this.centerScheduling.getAuthorizedClassScope');
		expect(projectionMethod).toContain('this.requireConductedLessons');
		expect(projectionMethod).toContain('this.centerScheduling.getRegistryFacts');
		expect(projectionMethod).not.toContain('this.database.sqlite');
		expect(projectionMethod).not.toMatch(/FROM (?:classes|teacher_assignments|class_students|center_memberships)\\b/);
		const conductedStart = source.indexOf('\tprivate requireConductedLessons(');
		const conductedEnd = source.indexOf('\n\tprivate calculateAttendancePercentage(', conductedStart);
		expect(conductedStart).toBeGreaterThan(end);
		expect(conductedEnd).toBeGreaterThan(conductedStart);
		const conductedHelper = source.slice(conductedStart, conductedEnd);
		expect(conductedHelper).toContain('this.centerScheduling.getLessons');
		expect(conductedHelper).not.toContain('this.database.sqlite');
	});
});
