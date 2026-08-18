import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const routeRoot = vi.hoisted(() => ({ current: undefined as any }));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return { ...actual, getCompositionRoot: () => routeRoot.current };
});

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { actions as lessonContextActions } from '../../src/routes/lesson-context/+page.server';

function seed(root: CompositionRoot): void {
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-verifier', 'Verifier Center'), ('center-foreign', 'Foreign Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-verifier', 'admin'), ('teacher-verifier', 'teacher'), ('teacher-spare', 'teacher'),
			('teacher-foreign', 'teacher'), ('student-a', 'student'), ('student-b', 'student'), ('student-foreign', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-verifier', 'admin-verifier', NULL), ('session-teacher-verifier', 'teacher-verifier', NULL),
			('session-teacher-spare', 'teacher-spare', NULL), ('session-teacher-foreign', 'teacher-foreign', NULL),
			('session-student-a', 'student-a', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-verifier', 'admin-verifier'), ('center-verifier', 'teacher-verifier'),
			('center-verifier', 'teacher-spare'), ('center-verifier', 'student-a'), ('center-verifier', 'student-b'),
			('center-foreign', 'teacher-foreign'), ('center-foreign', 'student-foreign');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('class-individual-v', 'center-verifier', 'Individual', 'individual'),
			('class-group-v', 'center-verifier', 'Group', 'group'),
			('class-foreign-v', 'center-foreign', 'Foreign', 'group');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id) VALUES
			('center-verifier', 'class-individual-v', 'teacher-verifier'),
			('center-verifier', 'class-group-v', 'teacher-verifier'),
			('center-foreign', 'class-foreign-v', 'teacher-foreign');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('center-verifier', 'class-individual-v', 'student-a'),
			('center-verifier', 'class-group-v', 'student-a'), ('center-verifier', 'class-group-v', 'student-b'),
			('center-foreign', 'class-foreign-v', 'student-foreign');
		INSERT INTO schedules (id, center_id, class_id, start_date, end_date, weekdays, created_by_account_id, created_at) VALUES
			('schedule-individual-v', 'center-verifier', 'class-individual-v', '2026-09-01', '2026-09-30', '[2]', 'admin-verifier', '2026-09-01T00:00:00.000Z'),
			('schedule-group-v', 'center-verifier', 'class-group-v', '2026-09-01', '2026-09-30', '[2]', 'admin-verifier', '2026-09-01T00:00:00.000Z'),
			('schedule-foreign-v', 'center-foreign', 'class-foreign-v', '2026-09-01', '2026-09-30', '[2]', 'teacher-foreign', '2026-09-01T00:00:00.000Z');
		INSERT INTO lessons (id, center_id, class_id, schedule_id, lesson_date, status, created_by_account_id, created_at) VALUES
			('lesson-individual-v', 'center-verifier', 'class-individual-v', 'schedule-individual-v', '2026-09-02', 'planned', 'admin-verifier', '2026-09-01T00:00:00.000Z'),
			('lesson-group-v', 'center-verifier', 'class-group-v', 'schedule-group-v', '2026-09-02', 'planned', 'admin-verifier', '2026-09-01T00:00:00.000Z'),
			('lesson-foreign-v', 'center-foreign', 'class-foreign-v', 'schedule-foreign-v', '2026-09-02', 'planned', 'teacher-foreign', '2026-09-01T00:00:00.000Z');
	`);
	for (const classId of ['class-individual-v', 'class-group-v']) {
		root.financialLedger.setClassPrice({
			sessionToken: 'session-admin-verifier', classId, amount: '15', effectiveFrom: '2026-01-01'
		});
	}
}

function routeEvent(sessionToken: string, fields: Record<string, string | string[]>) {
	const url = new URL('https://calendar.test/lesson-context?classId=class-group-v&lessonId=lesson-group-v');
	const formData = new FormData();
	for (const [name, value] of Object.entries(fields)) {
		for (const entry of Array.isArray(value) ? value : [value]) formData.append(name, entry);
	}
	return {
		url,
		request: new Request(url, { method: 'POST', body: formData }),
		cookies: { get: (name: string) => name === 'foundation_session' ? sessionToken : undefined }
	} as any;
}

describe('verifier-owned FT-005-AC-005 probe', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		seed(root);
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it('proves individual/group full-list persistence and authorization isolation', () => {
		const individual = root.learningProgress.recordLessonAttendance({
			sessionToken: 'session-teacher-verifier',
			classId: 'class-individual-v',
			lessonId: 'lesson-individual-v',
			absentStudentAccountIds: []
		});
		const group = root.learningProgress.recordLessonAttendance({
			sessionToken: 'session-teacher-verifier',
			classId: 'class-group-v',
			lessonId: 'lesson-group-v',
			absentStudentAccountIds: ['student-b']
		});
		expect(individual.map(({ studentAccountId, attendance }) => ({ studentAccountId, attendance }))).toEqual([
			{ studentAccountId: 'student-a', attendance: 'present' }
		]);
		expect(group.map(({ studentAccountId, attendance }) => ({ studentAccountId, attendance }))).toEqual([
			{ studentAccountId: 'student-a', attendance: 'present' },
			{ studentAccountId: 'student-b', attendance: 'absent' }
		]);

		const before = root.database.sqlite.prepare('SELECT * FROM learning_attendance ORDER BY lesson_id, student_account_id').all();
		for (const request of [
			{ sessionToken: undefined, classId: 'class-group-v', lessonId: 'lesson-group-v', absentStudentAccountIds: [] },
			{ sessionToken: 'session-teacher-spare', classId: 'class-group-v', lessonId: 'lesson-group-v', absentStudentAccountIds: [] },
			{ sessionToken: 'session-teacher-foreign', classId: 'class-group-v', lessonId: 'lesson-group-v', absentStudentAccountIds: [] },
			{ sessionToken: 'session-teacher-verifier', classId: 'class-group-v', lessonId: 'lesson-group-v', absentStudentAccountIds: ['student-foreign'] },
			{ sessionToken: 'session-teacher-verifier', classId: 'class-group-v', lessonId: 'lesson-foreign-v', absentStudentAccountIds: ['student-foreign'] }
		]) {
			expect(() => root.learningProgress.recordLessonAttendance(request)).toThrow('not-authorized');
		}
		expect(root.database.sqlite.prepare('SELECT * FROM learning_attendance ORDER BY lesson_id, student_account_id').all()).toEqual(before);
	});

	it('proves the route delegates and rejects a non-Teacher before mutation', async () => {
		const saved = await lessonContextActions.default(routeEvent('session-teacher-verifier', {
			action: 'saveAttendance', absentStudentAccountId: 'student-b'
		}));
		expect(saved).toEqual({ attendanceSuccess: true });
		const before = root.database.sqlite.prepare('SELECT * FROM learning_attendance ORDER BY lesson_id, student_account_id').all();
		const denied = await lessonContextActions.default(routeEvent('session-student-a', {
			action: 'saveAttendance', absentStudentAccountId: 'student-a'
		}));
		expect(denied).toMatchObject({ status: 403, data: { error: 'attendance_forbidden' } });
		expect(root.database.sqlite.prepare('SELECT * FROM learning_attendance ORDER BY lesson_id, student_account_id').all()).toEqual(before);
	});
});
