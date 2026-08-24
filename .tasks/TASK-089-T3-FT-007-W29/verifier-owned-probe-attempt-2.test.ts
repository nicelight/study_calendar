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
		INSERT INTO centers (id, name) VALUES ('retry-own', 'Retry Own'), ('retry-other', 'Retry Other');
		INSERT INTO accounts (id, role) VALUES
			('retry-admin', 'admin'), ('retry-teacher', 'teacher'),
			('retry-unassigned', 'teacher'), ('retry-other-teacher', 'teacher'),
			('retry-student-a', 'student'), ('retry-student-b', 'student'),
			('retry-other-student', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('retry-admin-session', 'retry-admin', NULL),
			('retry-teacher-session', 'retry-teacher', NULL),
			('retry-unassigned-session', 'retry-unassigned', NULL),
			('retry-other-teacher-session', 'retry-other-teacher', NULL),
			('retry-student-a-session', 'retry-student-a', NULL),
			('retry-student-b-session', 'retry-student-b', NULL),
			('retry-revoked-session', 'retry-student-a', '2026-08-22T00:00:00.000Z');
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('retry-own', 'retry-admin'), ('retry-own', 'retry-teacher'),
			('retry-own', 'retry-unassigned'), ('retry-own', 'retry-student-a'),
			('retry-own', 'retry-student-b'),
			('retry-other', 'retry-other-teacher'), ('retry-other', 'retry-other-student');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('retry-group', 'retry-own', 'Retry Group', 'group'),
			('retry-secondary', 'retry-own', 'Retry Secondary', 'group'),
			('retry-empty', 'retry-own', 'Retry Empty', 'group'),
			('retry-other-class', 'retry-other', 'Retry Other Class', 'group');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id) VALUES
			('retry-own', 'retry-group', 'retry-teacher'),
			('retry-own', 'retry-secondary', 'retry-teacher'),
			('retry-own', 'retry-empty', 'retry-teacher'),
			('retry-other', 'retry-other-class', 'retry-other-teacher');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('retry-own', 'retry-group', 'retry-student-a'),
			('retry-own', 'retry-group', 'retry-student-b'),
			('retry-own', 'retry-secondary', 'retry-student-a'),
			('retry-own', 'retry-empty', 'retry-student-a'),
			('retry-other', 'retry-other-class', 'retry-other-student');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays, created_by_account_id, created_at
		) VALUES
			('retry-group-schedule', 'retry-own', 'retry-group', '2026-08-01', '2026-08-31', '[1]', 'retry-admin', '2026-08-01T00:00:00.000Z'),
			('retry-secondary-schedule', 'retry-own', 'retry-secondary', '2026-08-01', '2026-08-31', '[1]', 'retry-admin', '2026-08-01T00:00:00.000Z'),
			('retry-other-schedule', 'retry-other', 'retry-other-class', '2026-08-01', '2026-08-31', '[1]', 'retry-other-teacher', '2026-08-01T00:00:00.000Z');
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status, created_by_account_id, created_at
		) VALUES
			('retry-group-one', 'retry-own', 'retry-group', 'retry-group-schedule', '2026-08-03', 'completed', 'retry-admin', '2026-08-01T00:00:00.000Z'),
			('retry-group-two', 'retry-own', 'retry-group', 'retry-group-schedule', '2026-08-10', 'completed', 'retry-admin', '2026-08-01T00:00:00.000Z'),
			('retry-group-planned', 'retry-own', 'retry-group', 'retry-group-schedule', '2026-08-17', 'planned', 'retry-admin', '2026-08-01T00:00:00.000Z'),
			('retry-group-cancelled', 'retry-own', 'retry-group', 'retry-group-schedule', '2026-08-24', 'cancelled', 'retry-admin', '2026-08-01T00:00:00.000Z'),
			('retry-secondary-one', 'retry-own', 'retry-secondary', 'retry-secondary-schedule', '2026-08-04', 'completed', 'retry-admin', '2026-08-01T00:00:00.000Z'),
			('retry-other-one', 'retry-other', 'retry-other-class', 'retry-other-schedule', '2026-08-03', 'completed', 'retry-other-teacher', '2026-08-01T00:00:00.000Z');
	`);

	for (const classId of ['retry-group', 'retry-secondary']) {
		root.financialLedger.setClassPrice({
			sessionToken: 'retry-admin-session',
			classId,
			amount: '10',
			effectiveFrom: '2026-01-01'
		});
	}

	// The class-day path writes an explicit absence and default-present remainder.
	root.learningProgress.recordLessonAttendance({
		sessionToken: 'retry-teacher-session',
		classId: 'retry-group',
		lessonId: 'retry-group-one',
		absentStudentAccountIds: ['retry-student-b']
	});
	root.learningProgress.recordLessonAttendance({
		sessionToken: 'retry-teacher-session',
		classId: 'retry-group',
		lessonId: 'retry-group-two',
		absentStudentAccountIds: []
	});
	root.learningProgress.recordLessonAttendance({
		sessionToken: 'retry-teacher-session',
		classId: 'retry-secondary',
		lessonId: 'retry-secondary-one',
		absentStudentAccountIds: ['retry-student-a']
	});

	// These present rows must not make planned or cancelled lessons conducted.
	for (const lessonId of ['retry-group-planned', 'retry-group-cancelled']) {
		root.database.sqlite.prepare(`
			INSERT INTO learning_attendance (
				center_id, class_id, lesson_id, student_account_id, attendance,
				recorded_by_account_id, recorded_at
			) VALUES (?, ?, ?, ?, ?, ?, ?)
		`).run(
			'retry-own', 'retry-group', lessonId, 'retry-student-a', 'present',
			'retry-admin', '2026-08-22T00:00:00.000Z'
		);
	}
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

describe('fresh verifier-owned proof: TASK-089-T3-FT-007-W29 attempt 2', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		seed(root);
	});

	afterEach(() => root.database.close());

	it('proves formulas, scope denial, correction, and read-only behavior', () => {
		const api = attendance(root);

		// Conducted slots only: A is present twice; B is absent once and present once.
		expect(api.getAttendancePercentage({
			sessionToken: 'retry-student-a-session', classId: 'retry-group', studentAccountId: 'retry-student-a'
		})).toBe(100);
		expect(api.getAttendancePercentage({
			sessionToken: 'retry-student-b-session', classId: 'retry-group', studentAccountId: 'retry-student-b'
		})).toBe(50);
		// Group is 3/4 present; secondary is 0/1, so Teacher is 3/5 = 60%.
		expect(api.getAttendancePercentage({
			sessionToken: 'retry-teacher-session', teacherAccountId: 'retry-teacher'
		})).toBe(60);
		expect(api.getAttendancePercentage({
			sessionToken: 'retry-student-a-session', classId: 'retry-empty', studentAccountId: 'retry-student-a'
		})).toBe(0);

		const beforeRead = sourceFacts(root);
		expect(api.getAttendancePercentage({
			sessionToken: 'retry-student-a-session', classId: 'retry-group', studentAccountId: 'retry-student-a'
		})).toBe(100);
		expect(sourceFacts(root)).toEqual(beforeRead);

		// Correction is reflected on the next read, while the read itself remains non-mutating.
		root.learningProgress.recordAttendance({
			sessionToken: 'retry-admin-session',
			classId: 'retry-group',
			lessonId: 'retry-group-one',
			studentAccountId: 'retry-student-b',
			attendance: 'present'
		});
		const beforeCorrectedRead = sourceFacts(root);
		expect(api.getAttendancePercentage({
			sessionToken: 'retry-student-b-session', classId: 'retry-group', studentAccountId: 'retry-student-b'
		})).toBe(100);
		expect(api.getAttendancePercentage({
			sessionToken: 'retry-admin-session', teacherAccountId: 'retry-teacher'
		})).toBe(80);
		expect(sourceFacts(root)).toEqual(beforeCorrectedRead);

		// Fail closed for anonymous/revoked, private, unassigned, cross-center, and removed scope.
		expect(() => api.getAttendancePercentage({
			classId: 'retry-group', studentAccountId: 'retry-student-a'
		})).toThrow('not-authorized');
		expect(() => api.getAttendancePercentage({
			sessionToken: 'retry-revoked-session', classId: 'retry-group', studentAccountId: 'retry-student-a'
		})).toThrow('not-authorized');
		expect(() => api.getAttendancePercentage({
			sessionToken: 'retry-student-a-session', classId: 'retry-group', studentAccountId: 'retry-student-b'
		})).toThrow('not-authorized');
		expect(() => api.getAttendancePercentage({
			sessionToken: 'retry-unassigned-session', classId: 'retry-group', studentAccountId: 'retry-student-a'
		})).toThrow('not-authorized');
		expect(() => api.getAttendancePercentage({
			sessionToken: 'retry-other-teacher-session', classId: 'retry-group', studentAccountId: 'retry-student-a'
		})).toThrow('not-authorized');
		expect(() => api.getAttendancePercentage({
			sessionToken: 'retry-teacher-session', classId: 'retry-group', teacherAccountId: 'retry-teacher'
		})).toThrow('not-authorized');

		root.centerScheduling.removeTeacherAssignment({
			sessionToken: 'retry-admin-session', classId: 'retry-group', teacherAccountId: 'retry-teacher'
		});
		expect(() => api.getAttendancePercentage({
			sessionToken: 'retry-teacher-session', classId: 'retry-group', studentAccountId: 'retry-student-a'
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
		expect(projectionMethod).not.toMatch(/FROM (?:classes|teacher_assignments|class_students|center_memberships)\b/);
		const conductedStart = source.indexOf('\tprivate requireConductedLessons(');
		const conductedEnd = source.indexOf('\n\tprivate calculateAttendancePercentage(', conductedStart);
		expect(conductedStart).toBeGreaterThan(end);
		expect(conductedEnd).toBeGreaterThan(conductedStart);
		const conductedHelper = source.slice(conductedStart, conductedEnd);
		expect(conductedHelper).toContain('this.centerScheduling.getLessons');
		expect(conductedHelper).not.toContain('this.database.sqlite');
	});
});
