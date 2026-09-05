import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const routeRoot = vi.hoisted(() => ({ current: undefined as any }));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return { ...actual, getCompositionRoot: () => routeRoot.current };
});

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import {
	actions as lessonContextActions,
	load as lessonContextLoad
} from '../../src/routes/lesson-context/+page.server';

function contextUrl(classId = 'verify-class-a', lessonId = 'verify-lesson-a'): URL {
	return new URL(`https://calendar.test/lesson-context?classId=${classId}&lessonId=${lessonId}`);
}

function actionEvent(
	sessionToken: string,
	fields: Record<string, string>,
	classId = 'verify-class-a',
	lessonId = 'verify-lesson-a'
) {
	const url = contextUrl(classId, lessonId);
	const formData = new FormData();
	for (const [name, value] of Object.entries(fields)) formData.append(name, value);
	return {
		url,
		request: new Request(url, { method: 'POST', body: formData }),
		cookies: { get: (name: string) => name === 'foundation_session' ? sessionToken : undefined }
	} as any;
}

function loadEvent(
	sessionToken: string,
	classId = 'verify-class-a',
	lessonId = 'verify-lesson-a',
	studentAccountId?: string
) {
	const url = contextUrl(classId, lessonId);
	if (studentAccountId) url.searchParams.set('studentAccountId', studentAccountId);
	return {
		url,
		cookies: { get: (name: string) => name === 'foundation_session' ? sessionToken : undefined }
	} as any;
}

function seed(root: CompositionRoot): void {
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES
			('verify-center-a', 'Verify Center A'),
			('verify-center-b', 'Verify Center B');
		INSERT INTO accounts (id, role) VALUES
			('verify-admin-a', 'admin'),
			('verify-admin-b', 'admin'),
			('verify-teacher-a', 'teacher'),
			('verify-unassigned-teacher', 'teacher'),
			('verify-student-a', 'student'),
			('verify-student-b', 'student'),
			('verify-student-class-b-only', 'student'),
			('verify-student-other-center', 'student'),
			('verify-parent-a', 'parent');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('verify-session-admin-a', 'verify-admin-a', NULL),
			('verify-session-admin-b', 'verify-admin-b', NULL),
			('verify-session-teacher-a', 'verify-teacher-a', NULL),
			('verify-session-unassigned-teacher', 'verify-unassigned-teacher', NULL),
			('verify-session-student-a', 'verify-student-a', NULL),
			('verify-session-student-b', 'verify-student-b', NULL),
			('verify-session-class-b-only', 'verify-student-class-b-only', NULL),
			('verify-session-other-center', 'verify-student-other-center', NULL),
			('verify-session-parent-a', 'verify-parent-a', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('verify-center-a', 'verify-admin-a'),
			('verify-center-a', 'verify-teacher-a'),
			('verify-center-a', 'verify-unassigned-teacher'),
			('verify-center-a', 'verify-student-a'),
			('verify-center-a', 'verify-student-b'),
			('verify-center-a', 'verify-student-class-b-only'),
			('verify-center-a', 'verify-parent-a'),
			('verify-center-b', 'verify-admin-b'),
			('verify-center-b', 'verify-student-other-center');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('verify-class-a', 'verify-center-a', 'Verify Class A', 'group'),
			('verify-class-b', 'verify-center-a', 'Verify Class B', 'group'),
			('verify-class-other', 'verify-center-b', 'Verify Other Class', 'group');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id) VALUES
			('verify-center-a', 'verify-class-a', 'verify-teacher-a'),
			('verify-center-a', 'verify-class-b', 'verify-teacher-a');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('verify-center-a', 'verify-class-a', 'verify-student-a'),
			('verify-center-a', 'verify-class-a', 'verify-student-b'),
			('verify-center-a', 'verify-class-b', 'verify-student-class-b-only'),
			('verify-center-b', 'verify-class-other', 'verify-student-other-center');
		INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id)
			VALUES ('verify-center-a', 'verify-parent-a', 'verify-student-a');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES
			('verify-schedule-a', 'verify-center-a', 'verify-class-a',
				'2026-08-10', '2026-08-10', '[1]', 'verify-admin-a',
				'2026-08-01T00:00:00.000Z'),
			('verify-schedule-b', 'verify-center-a', 'verify-class-b',
				'2026-08-11', '2026-08-11', '[2]', 'verify-admin-a',
				'2026-08-01T00:00:00.000Z'),
			('verify-schedule-other', 'verify-center-b', 'verify-class-other',
				'2026-08-12', '2026-08-12', '[3]', 'verify-admin-b',
				'2026-08-01T00:00:00.000Z');
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES
			('verify-lesson-a', 'verify-center-a', 'verify-class-a',
				'verify-schedule-a', '2026-08-10', 'planned', 'verify-admin-a',
				'2026-08-01T00:00:00.000Z'),
			('verify-lesson-b', 'verify-center-a', 'verify-class-b',
				'verify-schedule-b', '2026-08-11', 'planned', 'verify-admin-a',
				'2026-08-01T00:00:00.000Z'),
			('verify-lesson-other', 'verify-center-b', 'verify-class-other',
				'verify-schedule-other', '2026-08-12', 'planned', 'verify-admin-b',
				'2026-08-01T00:00:00.000Z');
		INSERT INTO lesson_context_material (
			lesson_id, center_id, class_id, topic, practical_work, homework,
			created_at, updated_at
		) VALUES
			('verify-lesson-a', 'verify-center-a', 'verify-class-a', 'Topic A', 'Practice A', 'Read chapter A',
				'2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z'),
			('verify-lesson-b', 'verify-center-a', 'verify-class-b', 'Topic B', 'Practice B', 'Read chapter B',
				'2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z'),
			('verify-lesson-other', 'verify-center-b', 'verify-class-other', 'Topic Other', 'Practice Other', 'Read chapter Other',
				'2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z');
	`);
}

function progressState(root: CompositionRoot) {
	return {
		homework: root.database.sqlite.prepare('SELECT * FROM learning_homework ORDER BY id').all(),
		completions: root.database.sqlite
			.prepare('SELECT * FROM learning_homework_completions ORDER BY homework_id, student_account_id')
			.all(),
		grades: root.database.sqlite
			.prepare('SELECT * FROM learning_grades ORDER BY homework_id, student_account_id').all()
	};
}

describe('TASK-105 Attempt 2 verifier-owned functional probe', () => {
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

	it('proves Student A to Student B visibility, private grades, authorization isolation, and provider selection', async () => {
		expect(root.learningProgress.getHomeworkProgressForLesson({
			sessionToken: 'verify-session-student-b',
			classId: 'verify-class-a',
			lessonId: 'verify-lesson-a'
		})).toEqual({ homework: null, completions: [], grades: [] });

		const forgedBefore = progressState(root);
		expect(await lessonContextActions.default(actionEvent('verify-session-admin-a', {
			action: 'createHomework', homeworkId: 'forged-client-id'
		}))).toMatchObject({ status: 400, data: { error: 'invalid_homework_request' } });
		expect(progressState(root)).toEqual(forgedBefore);

		expect(await lessonContextActions.default(actionEvent('verify-session-admin-a', {
			action: 'createHomework'
		}))).toEqual({ homeworkSuccess: true });
	const firstId = (root.database.sqlite
			.prepare('SELECT id FROM learning_homework WHERE class_id = ?')
			.get('verify-class-a') as { id: string }).id;
		expect(firstId).toMatch(/^[A-Za-z0-9_-]{20,}$/);
		expect(firstId).not.toBe('forged-client-id');

		const repeatBefore = progressState(root);
		expect(await lessonContextActions.default(actionEvent('verify-session-teacher-a', {
			action: 'createHomework'
		}))).toEqual({ homeworkSuccess: true });
		expect(progressState(root)).toEqual(repeatBefore);

		expect(await lessonContextActions.default(actionEvent(
			'verify-session-teacher-a', { action: 'createHomework' }, 'verify-class-b', 'verify-lesson-b'
		))).toEqual({ homeworkSuccess: true });
		const secondId = (root.database.sqlite
			.prepare('SELECT id FROM learning_homework WHERE class_id = ?')
			.get('verify-class-b') as { id: string }).id;
		expect(secondId).not.toBe(firstId);

		for (const grade of ['α', 'β', 'γ', 'F']) {
			expect(await lessonContextActions.default(actionEvent('verify-session-teacher-a', {
				action: 'recordGrade', studentAccountId: 'verify-student-a', grade
			}))).toEqual({ homeworkSuccess: true });
		}
		expect(await lessonContextActions.default(actionEvent('verify-session-admin-a', {
			action: 'recordGrade', studentAccountId: 'verify-student-b', grade: 'β'
		}))).toEqual({ homeworkSuccess: true });

		expect(await lessonContextActions.default(actionEvent('verify-session-student-a', {
			action: 'completeHomework'
		}))).toEqual({ homeworkSuccess: true });
	const afterFirstCompletion = progressState(root);
		expect(await lessonContextActions.default(actionEvent('verify-session-student-a', {
			action: 'completeHomework'
		}))).toEqual({ homeworkSuccess: true });
		expect(progressState(root)).toEqual(afterFirstCompletion);

		const studentBShared = lessonContextLoad(loadEvent('verify-session-student-b')) as any;
		expect(studentBShared.dayContext.mode).toBe('shared');
		expect(studentBShared.dayContext.homeworkProgress.completions).toEqual(expect.arrayContaining([
			expect.objectContaining({ studentAccountId: 'verify-student-a', completed: true }),
			expect.objectContaining({ studentAccountId: 'verify-student-b', completed: false })
		]));
		expect(studentBShared.dayContext.homeworkProgress.grades).toEqual([]);
		expect(studentBShared.dayContext.homeworkProgress.completions.every((entry: any) => !('grade' in entry))).toBe(true);

		const studentAPersonal = lessonContextLoad(loadEvent(
			'verify-session-student-a', 'verify-class-a', 'verify-lesson-a', 'verify-student-a'
		)) as any;
		expect(studentAPersonal.dayContext.personal.progress).toMatchObject({
			completion: { homeworkId: firstId, studentAccountId: 'verify-student-a', completed: true },
			grade: { homeworkId: firstId, studentAccountId: 'verify-student-a', grade: 'F' }
		});
		expect(studentAPersonal.dayContext.homeworkProgress.grades).toEqual([]);

		const parentPersonal = lessonContextLoad(loadEvent(
			'verify-session-parent-a', 'verify-class-a', 'verify-lesson-a', 'verify-student-a'
		)) as any;
		expect(parentPersonal.dayContext.personal.progress.grade).toMatchObject({
			studentAccountId: 'verify-student-a', grade: 'F'
		});
		expect(parentPersonal.dayContext.homeworkProgress.grades).toEqual([]);

		const studentBPersonal = lessonContextLoad(loadEvent(
			'verify-session-student-b', 'verify-class-a', 'verify-lesson-a', 'verify-student-b'
		)) as any;
		expect(studentBPersonal.dayContext.personal.progress.grade).toMatchObject({
			studentAccountId: 'verify-student-b', grade: 'β'
		});
		expect(() => lessonContextLoad(loadEvent(
			'verify-session-student-b', 'verify-class-a', 'verify-lesson-a', 'verify-student-a'
		))).toThrow(expect.objectContaining({ status: 403 }));

		for (const [sessionToken, fields, classId, lessonId] of [
			['verify-session-unassigned-teacher', { action: 'createHomework' }, 'verify-class-a', 'verify-lesson-a'],
			['verify-session-admin-b', { action: 'createHomework' }, 'verify-class-a', 'verify-lesson-a'],
			['verify-session-student-a', { action: 'completeHomework', homeworkId: 'forged-client-id' }, 'verify-class-a', 'verify-lesson-a'],
			['verify-session-class-b-only', { action: 'completeHomework' }, 'verify-class-a', 'verify-lesson-a'],
			['verify-session-teacher-a', { action: 'recordGrade', studentAccountId: 'verify-student-class-b-only', grade: 'α' }, 'verify-class-a', 'verify-lesson-a'],
			['verify-session-student-b', { action: 'recordGrade', studentAccountId: 'verify-student-a', grade: 'α' }, 'verify-class-a', 'verify-lesson-a'],
			['verify-session-teacher-a', { action: 'recordGrade', studentAccountId: 'verify-student-a', grade: 'A' }, 'verify-class-a', 'verify-lesson-a']
		] as const) {
			const before = progressState(root);
			const result = await lessonContextActions.default(actionEvent(sessionToken, fields, classId, lessonId));
			expect(result).toMatchObject({ status: expect.any(Number), data: { error: expect.any(String) } });
			expect(progressState(root)).toEqual(before);
		}

		const crossClassBefore = progressState(root);
		expect(() => lessonContextLoad(loadEvent(
			'verify-session-class-b-only', 'verify-class-a', 'verify-lesson-a'
		))).toThrow(expect.objectContaining({ status: 403 }));
		expect(progressState(root)).toEqual(crossClassBefore);

		const ambiguousBefore = progressState(root);
		root.database.sqlite.prepare(`
			INSERT INTO learning_homework (id, center_id, class_id, title, created_by_account_id, created_at)
			VALUES (?, ?, ?, ?, ?, ?)
		`).run('verify-ambiguous-id', 'verify-center-a', 'verify-class-a', 'Ambiguous', 'verify-admin-a', '2026-08-01T00:00:00.000Z');
		const afterAmbiguousInsert = progressState(root);
		expect(() => root.learningProgress.getHomeworkProgressForLesson({
			sessionToken: 'verify-session-student-b',
			classId: 'verify-class-a',
			lessonId: 'verify-lesson-a'
		})).toThrow('ambiguous-homework-selection');
		expect(progressState(root)).toEqual(afterAmbiguousInsert);
		expect(afterAmbiguousInsert.homework.length).toBe(ambiguousBefore.homework.length + 1);

		const routeSource = readFileSync(resolve(process.cwd(), 'src/routes/lesson-context/+page.server.ts'), 'utf8');
		const apiSource = readFileSync(resolve(process.cwd(), 'src/routes/api/lesson-context/+server.ts'), 'utf8');
		expect(routeSource).not.toContain('.sqlite');
		expect(routeSource).not.toMatch(/learning_(homework|grades|homework_completions)/);
		expect(apiSource).not.toContain('export const POST');
	});
});
