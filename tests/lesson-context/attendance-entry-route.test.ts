import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from 'svelte/server';

const routeRoot = vi.hoisted(() => ({ current: undefined as any }));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return { ...actual, getCompositionRoot: () => routeRoot.current };
});

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import LessonContextPage from '../../src/routes/lesson-context/+page.svelte';
import {
	actions as lessonContextActions,
	load as lessonContextLoad
} from '../../src/routes/lesson-context/+page.server';

function seed(root: CompositionRoot): void {
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-own', 'Own Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-own', 'admin'), ('teacher-own', 'teacher'), ('teacher-unassigned', 'teacher'),
			('student-one', 'student'), ('student-two', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-own', 'admin-own', NULL), ('session-teacher-own', 'teacher-own', NULL),
			('session-teacher-unassigned', 'teacher-unassigned', NULL), ('session-student-one', 'student-one', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-own', 'admin-own'), ('center-own', 'teacher-own'), ('center-own', 'teacher-unassigned'),
			('center-own', 'student-one'), ('center-own', 'student-two');
		INSERT INTO classes (id, center_id, name, mode) VALUES ('class-group', 'center-own', 'Group', 'group');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
			VALUES ('center-own', 'class-group', 'teacher-own');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('center-own', 'class-group', 'student-one'), ('center-own', 'class-group', 'student-two');
		INSERT INTO schedules (id, center_id, class_id, start_date, end_date, weekdays, created_by_account_id, created_at)
			VALUES ('schedule-group', 'center-own', 'class-group', '2026-08-01', '2026-08-31', '[1]', 'admin-own', '2026-08-01T00:00:00.000Z');
		INSERT INTO lessons (id, center_id, class_id, schedule_id, lesson_date, status, created_by_account_id, created_at)
			VALUES ('lesson-group', 'center-own', 'class-group', 'schedule-group', '2026-08-03', 'planned', 'admin-own', '2026-08-01T00:00:00.000Z');
	`);
	root.lessonContext.setSharedLessonMaterial({
		sessionToken: 'session-admin-own',
		classId: 'class-group',
		lessonId: 'lesson-group',
		topic: 'Topic',
		practicalWork: 'Practice',
		homework: 'Homework'
	});
	root.financialLedger.setClassPrice({
		sessionToken: 'session-admin-own',
		classId: 'class-group',
		amount: '10',
		effectiveFrom: '2026-01-01'
	});
}

function event(root: CompositionRoot, sessionToken: string, fields?: Record<string, string | string[]>) {
	const url = new URL('https://calendar.test/lesson-context?classId=class-group&lessonId=lesson-group');
	const formData = new FormData();
	for (const [name, value] of Object.entries(fields ?? {})) {
		for (const entry of Array.isArray(value) ? value : [value]) formData.append(name, entry);
	}
	return {
		url,
		request: new Request(url, { method: fields ? 'POST' : 'GET', body: fields ? formData : undefined }),
		cookies: { get: (name: string) => name === 'foundation_session' ? sessionToken : undefined }
	} as any;
}

describe('FT-005-AC-005 lesson context attendance entry', () => {
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

	it('shows the assigned Teacher list and submits the absent subset through Learning Progress', async () => {
		const data = lessonContextLoad(event(root, 'session-teacher-own')) as any;
		expect(data.canEditAttendance).toBe(true);
		expect(data.attendance).toEqual(expect.arrayContaining([
			expect.objectContaining({ studentAccountId: 'student-one', recordedAt: null }),
			expect.objectContaining({ studentAccountId: 'student-two', recordedAt: null })
		]));
		expect(render(LessonContextPage, { props: { data } } as any).body).toContain('Отметить отсутствующих');

		const saved = await lessonContextActions.default(event(root, 'session-teacher-own', {
			action: 'saveAttendance',
			absentStudentAccountId: 'student-two'
		}));
		expect(saved).toEqual({ attendanceSuccess: true });
		expect(root.database.sqlite.prepare(
			'SELECT student_account_id, attendance FROM learning_attendance ORDER BY student_account_id'
		).all()).toEqual([
			{ student_account_id: 'student-one', attendance: 'present' },
			{ student_account_id: 'student-two', attendance: 'absent' }
		]);
	});

	it('denies Student and unassigned Teacher without changing attendance', async () => {
		const before = root.database.sqlite.prepare('SELECT * FROM learning_attendance').all();
		const studentDenied = await lessonContextActions.default(event(root, 'session-student-one', {
			action: 'saveAttendance',
			absentStudentAccountId: 'student-one'
		}));
		const unassignedDenied = await lessonContextActions.default(event(root, 'session-teacher-unassigned', {
			action: 'saveAttendance',
			absentStudentAccountId: 'student-one'
		}));
		expect(studentDenied).toMatchObject({ status: 403, data: { error: 'attendance_forbidden' } });
		expect(unassignedDenied).toMatchObject({ status: 403, data: { error: 'attendance_forbidden' } });
		expect(root.database.sqlite.prepare('SELECT * FROM learning_attendance').all()).toEqual(before);

		const routeSource = readFileSync(resolve(process.cwd(), 'src/routes/lesson-context/+page.server.ts'), 'utf8');
		expect(routeSource).toContain('learningProgress.recordLessonAttendance');
		expect(routeSource).not.toContain('.sqlite');
	});
});
