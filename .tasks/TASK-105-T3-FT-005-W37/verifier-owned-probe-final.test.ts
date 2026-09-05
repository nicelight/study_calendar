import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

function contextUrl(classId = 'probe-class', lessonId = 'probe-lesson'): URL {
	return new URL(`https://calendar.test/lesson-context?classId=${classId}&lessonId=${lessonId}`);
}

function actionEvent(
	sessionToken: string,
	fields: Record<string, string>,
	classId = 'probe-class',
	lessonId = 'probe-lesson'
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
	classId = 'probe-class',
	lessonId = 'probe-lesson',
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
			('probe-center', 'Probe Center'),
			('probe-other-center', 'Other Probe Center');
		INSERT INTO accounts (id, role) VALUES
			('probe-admin', 'admin'),
			('probe-other-admin', 'admin'),
			('probe-teacher', 'teacher'),
			('probe-unassigned-teacher', 'teacher'),
			('probe-student-one', 'student'),
			('probe-student-two', 'student'),
			('probe-other-student', 'student'),
			('probe-linked-parent', 'parent'),
			('probe-unlinked-parent', 'parent');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('probe-session-admin', 'probe-admin', NULL),
			('probe-session-other-admin', 'probe-other-admin', NULL),
			('probe-session-teacher', 'probe-teacher', NULL),
			('probe-session-unassigned-teacher', 'probe-unassigned-teacher', NULL),
			('probe-session-student-one', 'probe-student-one', NULL),
			('probe-session-student-two', 'probe-student-two', NULL),
			('probe-session-other-student', 'probe-other-student', NULL),
			('probe-session-linked-parent', 'probe-linked-parent', NULL),
			('probe-session-unlinked-parent', 'probe-unlinked-parent', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('probe-center', 'probe-admin'),
			('probe-center', 'probe-teacher'),
			('probe-center', 'probe-unassigned-teacher'),
			('probe-center', 'probe-student-one'),
			('probe-center', 'probe-student-two'),
			('probe-center', 'probe-linked-parent'),
			('probe-center', 'probe-unlinked-parent'),
			('probe-other-center', 'probe-other-admin'),
			('probe-other-center', 'probe-other-student');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('probe-class', 'probe-center', 'Probe Class', 'group'),
			('probe-secondary-class', 'probe-center', 'Probe Secondary Class', 'group'),
			('probe-other-class', 'probe-other-center', 'Other Class', 'group');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id) VALUES
			('probe-center', 'probe-class', 'probe-teacher'),
			('probe-center', 'probe-secondary-class', 'probe-teacher');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('probe-center', 'probe-class', 'probe-student-one'),
			('probe-center', 'probe-class', 'probe-student-two'),
			('probe-center', 'probe-secondary-class', 'probe-student-two'),
			('probe-other-center', 'probe-other-class', 'probe-other-student');
		INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id)
			VALUES ('probe-center', 'probe-linked-parent', 'probe-student-one');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES
			('probe-schedule', 'probe-center', 'probe-class',
			 '2026-08-10', '2026-08-10', '[1]', 'probe-admin',
			 '2026-08-01T00:00:00.000Z'),
			('probe-secondary-schedule', 'probe-center', 'probe-secondary-class',
			 '2026-08-11', '2026-08-11', '[2]', 'probe-admin',
			 '2026-08-01T00:00:00.000Z'),
			('probe-other-schedule', 'probe-other-center', 'probe-other-class',
			 '2026-08-12', '2026-08-12', '[3]', 'probe-other-admin',
			 '2026-08-01T00:00:00.000Z');
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES
			('probe-lesson', 'probe-center', 'probe-class',
			 'probe-schedule', '2026-08-10', 'planned', 'probe-admin',
			 '2026-08-01T00:00:00.000Z'),
			('probe-secondary-lesson', 'probe-center', 'probe-secondary-class',
			 'probe-secondary-schedule', '2026-08-11', 'planned', 'probe-admin',
			 '2026-08-01T00:00:00.000Z'),
			('probe-other-lesson', 'probe-other-center', 'probe-other-class',
			 'probe-other-schedule', '2026-08-12', 'planned', 'probe-other-admin',
			 '2026-08-01T00:00:00.000Z');
		INSERT INTO lesson_context_material (
			lesson_id, center_id, class_id, topic, practical_work, homework,
			created_at, updated_at
		) VALUES
			('probe-lesson', 'probe-center', 'probe-class', 'Probe topic', 'Probe practice', 'Read probe chapter',
			 '2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z'),
			('probe-secondary-lesson', 'probe-center', 'probe-secondary-class', 'Secondary topic', 'Secondary practice', 'Read second chapter',
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

describe('TASK-105 verifier-owned isolated probe', () => {
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

	it('proves the authorized projection/actions, privacy, rejection atomicity, idempotency, and selection failure', async () => {
		expect(root.learningProgress.getHomeworkProgressForLesson({
			sessionToken: 'probe-session-student-one',
			classId: 'probe-class',
			lessonId: 'probe-lesson'
		})).toEqual({ homework: null, completions: [], grades: [] });

		const created = await lessonContextActions.default(actionEvent('probe-session-admin', {
			action: 'createHomework'
		}));
		expect(created).toEqual({ homeworkSuccess: true });
		const firstId = (root.database.sqlite
			.prepare('SELECT id FROM learning_homework WHERE class_id = ?')
			.get('probe-class') as { id: string }).id;
		expect(firstId).toMatch(/^[A-Za-z0-9_-]{20,}$/);

		const repeatedBefore = progressState(root);
		expect(await lessonContextActions.default(actionEvent('probe-session-teacher', {
			action: 'createHomework'
		}))).toEqual({ homeworkSuccess: true });
		expect(progressState(root)).toEqual(repeatedBefore);

		expect(await lessonContextActions.default(actionEvent('probe-session-teacher', {
			action: 'createHomework'
		}, 'probe-secondary-class', 'probe-secondary-lesson'))).toEqual({ homeworkSuccess: true });
		const secondId = (root.database.sqlite
			.prepare('SELECT id FROM learning_homework WHERE class_id = ?')
			.get('probe-secondary-class') as { id: string }).id;
		expect(secondId).not.toBe(firstId);

		for (const grade of ['α', 'β', 'γ', 'F']) {
			expect(await lessonContextActions.default(actionEvent('probe-session-teacher', {
				action: 'recordGrade', studentAccountId: 'probe-student-one', grade
			}))).toEqual({ homeworkSuccess: true });
		}
		expect(await lessonContextActions.default(actionEvent('probe-session-student-one', {
			action: 'completeHomework'
		}))).toEqual({ homeworkSuccess: true });

		const teacherContext = lessonContextLoad(loadEvent('probe-session-teacher')) as any;
		expect(teacherContext.dayContext.homeworkProgress).toMatchObject({
			homework: { homeworkId: firstId, title: 'Read probe chapter' },
			completions: [
				{ studentAccountId: 'probe-student-one', completed: true },
				{ studentAccountId: 'probe-student-two', completed: false }
			],
			grades: [{ studentAccountId: 'probe-student-one', grade: 'F' }]
		});
		expect(teacherContext.dayContext.homeworkProgress.completions.every((entry: any) => !('grade' in entry))).toBe(true);

		const studentContext = lessonContextLoad(loadEvent(
			'probe-session-student-one', 'probe-class', 'probe-lesson', 'probe-student-one'
		)) as any;
		expect(studentContext.dayContext.homeworkProgress.grades).toEqual([]);
		expect(studentContext.dayContext.personal.progress).toMatchObject({
			completion: { homeworkId: firstId, completed: true },
			grade: { homeworkId: firstId, grade: 'F' }
		});
		const unrelatedStudentContext = lessonContextLoad(loadEvent(
			'probe-session-student-two', 'probe-class', 'probe-lesson', 'probe-student-two'
		)) as any;
		expect(unrelatedStudentContext.dayContext.homeworkProgress.grades).toEqual([]);
		expect(unrelatedStudentContext.dayContext.personal.progress.grade).toBeNull();
		const linkedParentContext = root.lessonContext.getDayContext({
			sessionToken: 'probe-session-linked-parent',
			classId: 'probe-class',
			lessonId: 'probe-lesson',
			studentAccountId: 'probe-student-one'
		});
		expect(linkedParentContext.homeworkProgress.grades).toEqual([]);
		expect(linkedParentContext.personal?.progress.grade?.grade).toBe('F');

		for (const [sessionToken, fields, classId, lessonId] of [
			['probe-session-unassigned-teacher', { action: 'createHomework' }, 'probe-class', 'probe-lesson'],
			['probe-session-other-admin', { action: 'createHomework' }, 'probe-other-class', 'probe-other-lesson'],
			['probe-session-admin', { action: 'createHomework', homeworkId: 'forged-id' }, 'probe-class', 'probe-lesson'],
			['probe-session-student-one', { action: 'completeHomework', homeworkId: 'forged-id' }, 'probe-class', 'probe-lesson'],
			['probe-session-student-one', { action: 'recordGrade', studentAccountId: 'probe-student-one', grade: 'α' }, 'probe-class', 'probe-lesson'],
			['probe-session-teacher', { action: 'recordGrade', studentAccountId: 'probe-other-student', grade: 'α' }, 'probe-class', 'probe-lesson'],
			['probe-session-teacher', { action: 'recordGrade', studentAccountId: 'probe-student-one', grade: 'A' }, 'probe-class', 'probe-lesson']
		] as const) {
			const before = progressState(root);
			const result = await lessonContextActions.default(actionEvent(sessionToken, fields, classId, lessonId));
			expect(result).toMatchObject({ status: expect.any(Number), data: { error: expect.any(String) } });
			expect(progressState(root)).toEqual(before);
		}

		root.database.sqlite
			.prepare(`INSERT INTO learning_homework (id, center_id, class_id, title, created_by_account_id, created_at)
				VALUES (?, ?, ?, ?, ?, ?)`)
			.run('probe-ambiguous-id', 'probe-center', 'probe-class', 'Ambiguous', 'probe-admin', '2026-08-01T00:00:00.000Z');
		const ambiguousBefore = progressState(root);
		expect(() => root.learningProgress.getHomeworkProgressForLesson({
			sessionToken: 'probe-session-teacher', classId: 'probe-class', lessonId: 'probe-lesson'
		})).toThrow('ambiguous-homework-selection');
		expect(progressState(root)).toEqual(ambiguousBefore);
		expect(await lessonContextActions.default(actionEvent('probe-session-admin', {
			action: 'createHomework'
		}))).toMatchObject({ status: 409, data: { error: 'homework_ambiguous' } });
		expect(progressState(root)).toEqual(ambiguousBefore);

		const unlinkedBefore = progressState(root);
		expect(() => lessonContextLoad(loadEvent('probe-session-unlinked-parent'))).toThrowError(
			expect.objectContaining({ status: 403 })
		);
		expect(progressState(root)).toEqual(unlinkedBefore);
	});
});
