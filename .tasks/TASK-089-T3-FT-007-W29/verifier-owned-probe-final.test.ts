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
		INSERT INTO centers (id, name) VALUES ('final-own', 'Final Own'), ('final-other', 'Final Other');
		INSERT INTO accounts (id, role) VALUES
			('final-admin', 'admin'), ('final-teacher', 'teacher'),
			('final-unassigned', 'teacher'), ('final-other-teacher', 'teacher'),
			('final-student-a', 'student'), ('final-student-b', 'student'),
			('final-other-student', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('final-admin-session', 'final-admin', NULL),
			('final-teacher-session', 'final-teacher', NULL),
			('final-unassigned-session', 'final-unassigned', NULL),
			('final-other-teacher-session', 'final-other-teacher', NULL),
			('final-a-session', 'final-student-a', NULL),
			('final-b-session', 'final-student-b', NULL),
			('final-revoked-session', 'final-student-a', '2026-08-22T00:00:00.000Z');
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('final-own', 'final-admin'), ('final-own', 'final-teacher'),
			('final-own', 'final-unassigned'), ('final-own', 'final-student-a'),
			('final-own', 'final-student-b'),
			('final-other', 'final-other-teacher'), ('final-other', 'final-other-student');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('final-main', 'final-own', 'Final Main', 'group'),
			('final-secondary', 'final-own', 'Final Secondary', 'group'),
			('final-empty', 'final-own', 'Final Empty', 'group'),
			('final-other-class', 'final-other', 'Final Other Class', 'group');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id) VALUES
			('final-own', 'final-main', 'final-teacher'),
			('final-own', 'final-secondary', 'final-teacher'),
			('final-own', 'final-empty', 'final-teacher'),
			('final-other', 'final-other-class', 'final-other-teacher');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('final-own', 'final-main', 'final-student-a'),
			('final-own', 'final-main', 'final-student-b'),
			('final-own', 'final-secondary', 'final-student-a'),
			('final-own', 'final-empty', 'final-student-a'),
			('final-other', 'final-other-class', 'final-other-student');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays, created_by_account_id, created_at
		) VALUES
			('final-main-schedule', 'final-own', 'final-main', '2026-08-01', '2026-08-31', '[1]', 'final-admin', '2026-08-01T00:00:00.000Z'),
			('final-secondary-schedule', 'final-own', 'final-secondary', '2026-08-01', '2026-08-31', '[1]', 'final-admin', '2026-08-01T00:00:00.000Z'),
			('final-other-schedule', 'final-other', 'final-other-class', '2026-08-01', '2026-08-31', '[1]', 'final-other-teacher', '2026-08-01T00:00:00.000Z');
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status, created_by_account_id, created_at
		) VALUES
			('final-main-one', 'final-own', 'final-main', 'final-main-schedule', '2026-08-03', 'completed', 'final-admin', '2026-08-01T00:00:00.000Z'),
			('final-main-two', 'final-own', 'final-main', 'final-main-schedule', '2026-08-10', 'completed', 'final-admin', '2026-08-01T00:00:00.000Z'),
			('final-main-planned', 'final-own', 'final-main', 'final-main-schedule', '2026-08-17', 'planned', 'final-admin', '2026-08-01T00:00:00.000Z'),
			('final-main-cancelled', 'final-own', 'final-main', 'final-main-schedule', '2026-08-24', 'cancelled', 'final-admin', '2026-08-01T00:00:00.000Z'),
			('final-secondary-one', 'final-own', 'final-secondary', 'final-secondary-schedule', '2026-08-04', 'completed', 'final-admin', '2026-08-01T00:00:00.000Z'),
			('final-other-one', 'final-other', 'final-other-class', 'final-other-schedule', '2026-08-03', 'completed', 'final-other-teacher', '2026-08-01T00:00:00.000Z');
	`);

	for (const classId of ['final-main', 'final-secondary']) {
		root.financialLedger.setClassPrice({
			sessionToken: 'final-admin-session', classId, amount: '10', effectiveFrom: '2026-01-01'
		});
	}

	root.learningProgress.recordLessonAttendance({
		sessionToken: 'final-teacher-session', classId: 'final-main',
		lessonId: 'final-main-one', absentStudentAccountIds: ['final-student-b']
	});
	root.learningProgress.recordLessonAttendance({
		sessionToken: 'final-teacher-session', classId: 'final-main',
		lessonId: 'final-main-two', absentStudentAccountIds: []
	});
	root.learningProgress.recordLessonAttendance({
		sessionToken: 'final-teacher-session', classId: 'final-secondary',
		lessonId: 'final-secondary-one', absentStudentAccountIds: ['final-student-a']
	});

	for (const lessonId of ['final-main-planned', 'final-main-cancelled']) {
		root.database.sqlite.prepare(`
			INSERT INTO learning_attendance (
				center_id, class_id, lesson_id, student_account_id, attendance,
				recorded_by_account_id, recorded_at
			) VALUES (?, ?, ?, ?, ?, ?, ?)
		`).run(
			'final-own', 'final-main', lessonId, 'final-student-a', 'present',
			'final-admin', '2026-08-22T00:00:00.000Z'
		);
	}
}

function sourceFacts(root: CompositionRoot): Record<string, unknown[]> {
	const tables = [
		'learning_attendance', 'financial_lesson_charges', 'financial_payments',
		'financial_payment_allocations', 'financial_audit_records', 'financial_payment_audit_records'
	];
	return Object.fromEntries(tables.map((table) => [
		table, root.database.sqlite.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()
	]));
}

describe('fresh verifier-owned proof: TASK-089-T3-FT-007-W29', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		seed(root);
	});

	afterEach(() => root.database.close());

	it('proves the full attendance claim and the accepted provider path', () => {
		const api = attendance(root);

		expect(api.getAttendancePercentage({
			sessionToken: 'final-a-session', classId: 'final-main', studentAccountId: 'final-student-a'
		})).toBe(100);
		expect(api.getAttendancePercentage({
			sessionToken: 'final-b-session', classId: 'final-main', studentAccountId: 'final-student-b'
		})).toBe(50);
		expect(api.getAttendancePercentage({
			sessionToken: 'final-teacher-session', teacherAccountId: 'final-teacher'
		})).toBe(60);
		expect(api.getAttendancePercentage({
			sessionToken: 'final-a-session', classId: 'final-empty', studentAccountId: 'final-student-a'
		})).toBe(0);

		const beforeRead = sourceFacts(root);
		expect(api.getAttendancePercentage({
			sessionToken: 'final-a-session', classId: 'final-main', studentAccountId: 'final-student-a'
		})).toBe(100);
		expect(sourceFacts(root)).toEqual(beforeRead);

		root.learningProgress.recordAttendance({
			sessionToken: 'final-admin-session', classId: 'final-main',
			lessonId: 'final-main-one', studentAccountId: 'final-student-b', attendance: 'present'
		});
		const beforeCorrectedRead = sourceFacts(root);
		expect(api.getAttendancePercentage({
			sessionToken: 'final-b-session', classId: 'final-main', studentAccountId: 'final-student-b'
		})).toBe(100);
		expect(api.getAttendancePercentage({
			sessionToken: 'final-admin-session', teacherAccountId: 'final-teacher'
		})).toBe(80);
		expect(sourceFacts(root)).toEqual(beforeCorrectedRead);

		for (const request of [
			{ classId: 'final-main', studentAccountId: 'final-student-a' },
			{ sessionToken: 'final-revoked-session', classId: 'final-main', studentAccountId: 'final-student-a' },
			{ sessionToken: 'final-a-session', classId: 'final-main', studentAccountId: 'final-student-b' },
			{ sessionToken: 'final-unassigned-session', classId: 'final-main', studentAccountId: 'final-student-a' },
			{ sessionToken: 'final-other-teacher-session', classId: 'final-main', studentAccountId: 'final-student-a' },
			{ sessionToken: 'final-teacher-session', classId: 'final-main', teacherAccountId: 'final-teacher' }
		]) {
			expect(() => api.getAttendancePercentage(request)).toThrow('not-authorized');
		}

		root.centerScheduling.removeTeacherAssignment({
			sessionToken: 'final-admin-session', classId: 'final-main', teacherAccountId: 'final-teacher'
		});
		expect(() => api.getAttendancePercentage({
			sessionToken: 'final-teacher-session', classId: 'final-main', studentAccountId: 'final-student-a'
		})).toThrow('not-authorized');

		const source = fs.readFileSync('src/lib/server/modules/learning-progress/public.ts', 'utf8');
		const methodStart = source.indexOf('\tgetAttendancePercentage(');
		const methodEnd = source.indexOf('\n\tcreateHomework(', methodStart);
		const method = source.slice(methodStart, methodEnd);
		expect(method).toContain('this.identityAccess.resolveActor');
		expect(method).toContain('this.centerScheduling.getAuthorizedClassScope');
		expect(method).toContain('this.centerScheduling.getRegistryFacts');
		expect(method).toContain('this.requireConductedLessons');
		expect(method).not.toContain('this.database.sqlite');
		expect(method).not.toMatch(/FROM (?:classes|teacher_assignments|class_students|center_memberships)\b/);

		const helperStart = source.indexOf('\tprivate requireConductedLessons(');
		const helperEnd = source.indexOf('\n\tprivate calculateAttendancePercentage(', helperStart);
		const helper = source.slice(helperStart, helperEnd);
		expect(helper).toContain('this.centerScheduling.getLessons');
		expect(helper).not.toContain('this.database.sqlite');
	});
});
