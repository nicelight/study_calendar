import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

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
			('session-teacher-other', 'teacher-other', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-own', 'admin-own'),
			('center-own', 'teacher-own'), ('center-own', 'teacher-unassigned'),
			('center-own', 'student-one'), ('center-own', 'student-two'),
			('center-other', 'teacher-other'), ('center-other', 'student-other');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('class-individual', 'center-own', 'Individual', 'individual'),
			('class-group', 'center-own', 'Group', 'group'),
			('class-other', 'center-other', 'Other', 'group');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id) VALUES
			('center-own', 'class-individual', 'teacher-own'),
			('center-own', 'class-group', 'teacher-own'),
			('center-other', 'class-other', 'teacher-other');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('center-own', 'class-individual', 'student-one'),
			('center-own', 'class-group', 'student-one'),
			('center-own', 'class-group', 'student-two'),
			('center-other', 'class-other', 'student-other');
		INSERT INTO schedules (id, center_id, class_id, start_date, end_date, weekdays, created_by_account_id, created_at) VALUES
			('schedule-individual', 'center-own', 'class-individual', '2026-08-01', '2026-08-31', '[1]', 'teacher-own', '2026-08-01T00:00:00.000Z'),
			('schedule-group', 'center-own', 'class-group', '2026-08-01', '2026-08-31', '[1]', 'teacher-own', '2026-08-01T00:00:00.000Z'),
			('schedule-other', 'center-other', 'class-other', '2026-08-01', '2026-08-31', '[1]', 'teacher-other', '2026-08-01T00:00:00.000Z');
		INSERT INTO lessons (id, center_id, class_id, schedule_id, lesson_date, status, created_by_account_id, created_at) VALUES
			('lesson-individual', 'center-own', 'class-individual', 'schedule-individual', '2026-08-03', 'planned', 'teacher-own', '2026-08-01T00:00:00.000Z'),
			('lesson-group', 'center-own', 'class-group', 'schedule-group', '2026-08-03', 'planned', 'teacher-own', '2026-08-01T00:00:00.000Z'),
			('lesson-other', 'center-other', 'class-other', 'schedule-other', '2026-08-03', 'planned', 'teacher-other', '2026-08-01T00:00:00.000Z');
	`);
}

describe('FT-005-AC-005 lesson-day attendance entry', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		seed(root);
		root.financialLedger.setClassPrice({
			sessionToken: 'session-admin-own', classId: 'class-individual', amount: '10', effectiveFrom: '2026-01-01'
		});
		root.financialLedger.setClassPrice({
			sessionToken: 'session-admin-own', classId: 'class-group', amount: '10', effectiveFrom: '2026-01-01'
		});
	});

	afterEach(() => root.database.close());

	it('stores the absent subset and defaults every other individual/group student to present', () => {
		for (const request of [
			{ classId: 'class-individual', lessonId: 'lesson-individual', absentStudentAccountIds: [] },
			{ classId: 'class-group', lessonId: 'lesson-group', absentStudentAccountIds: ['student-two'] }
		]) {
			const result = root.learningProgress.recordLessonAttendance({
				sessionToken: 'session-teacher-own',
				...request
			});
			expect(result).toEqual(expect.arrayContaining(
				root.centerScheduling.getAuthorizedClassScope('session-teacher-own', request.classId)!.studentAccountIds.map((studentAccountId) => expect.objectContaining({
					lessonId: request.lessonId,
					classId: request.classId,
					studentAccountId,
					attendance: request.absentStudentAccountIds.includes(studentAccountId) ? 'absent' : 'present'
				}))
			));
		}
	});

	it('denies unassigned, cross-center, and forged scope without mutation', () => {
		const before = root.database.sqlite.prepare(
			'SELECT * FROM learning_attendance ORDER BY lesson_id, student_account_id'
		).all();
		for (const request of [
			{ sessionToken: 'session-teacher-unassigned', classId: 'class-group', lessonId: 'lesson-group', absentStudentAccountIds: [] },
			{ sessionToken: 'session-teacher-other', classId: 'class-group', lessonId: 'lesson-group', absentStudentAccountIds: [] },
			{ sessionToken: 'session-teacher-own', classId: 'class-group', lessonId: 'lesson-other', absentStudentAccountIds: ['student-other'] }
		]) {
			expect(() => root.learningProgress.recordLessonAttendance(request)).toThrow('not-authorized');
		}
		expect(root.database.sqlite.prepare(
			'SELECT * FROM learning_attendance ORDER BY lesson_id, student_account_id'
		).all()).toEqual(before);
	});
});
