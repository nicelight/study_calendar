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

function contextUrl(classId = 'class-homework', lessonId = 'lesson-homework'): URL {
	return new URL(`https://calendar.test/lesson-context?classId=${classId}&lessonId=${lessonId}`);
}

function seed(root: CompositionRoot): void {
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES
			('center-homework', 'Homework Center'),
			('center-other-homework', 'Other Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-homework', 'admin'),
			('admin-other-homework', 'admin'),
			('teacher-homework', 'teacher'),
			('teacher-unassigned-homework', 'teacher'),
			('student-one-homework', 'student'),
			('student-two-homework', 'student'),
			('student-other-homework', 'student'),
			('parent-linked-homework', 'parent'),
			('parent-unlinked-homework', 'parent');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-homework', 'admin-homework', NULL),
			('session-admin-other-homework', 'admin-other-homework', NULL),
			('session-teacher-homework', 'teacher-homework', NULL),
			('session-teacher-unassigned-homework', 'teacher-unassigned-homework', NULL),
			('session-student-one-homework', 'student-one-homework', NULL),
			('session-student-two-homework', 'student-two-homework', NULL),
			('session-student-other-homework', 'student-other-homework', NULL),
			('session-parent-linked-homework', 'parent-linked-homework', NULL),
			('session-parent-unlinked-homework', 'parent-unlinked-homework', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-homework', 'admin-homework'),
			('center-homework', 'teacher-homework'),
			('center-homework', 'teacher-unassigned-homework'),
			('center-homework', 'student-one-homework'),
			('center-homework', 'student-two-homework'),
			('center-homework', 'parent-linked-homework'),
			('center-homework', 'parent-unlinked-homework'),
			('center-other-homework', 'admin-other-homework'),
			('center-other-homework', 'student-other-homework');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('class-homework', 'center-homework', 'Homework Class', 'group'),
			('class-secondary-homework', 'center-homework', 'Secondary Class', 'group'),
			('class-other-homework', 'center-other-homework', 'Other Class', 'group');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id) VALUES
			('center-homework', 'class-homework', 'teacher-homework'),
			('center-homework', 'class-secondary-homework', 'teacher-homework');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('center-homework', 'class-homework', 'student-one-homework'),
			('center-homework', 'class-homework', 'student-two-homework'),
			('center-homework', 'class-secondary-homework', 'student-two-homework'),
			('center-other-homework', 'class-other-homework', 'student-other-homework');
		INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id)
			VALUES ('center-homework', 'parent-linked-homework', 'student-one-homework');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES
			('schedule-homework', 'center-homework', 'class-homework',
			 '2026-08-10', '2026-08-10', '[1]', 'admin-homework',
			 '2026-08-01T00:00:00.000Z'),
			('schedule-secondary-homework', 'center-homework', 'class-secondary-homework',
			 '2026-08-11', '2026-08-11', '[2]', 'admin-homework',
			 '2026-08-01T00:00:00.000Z'),
			('schedule-other-homework', 'center-other-homework', 'class-other-homework',
			 '2026-08-12', '2026-08-12', '[3]', 'admin-other-homework',
			 '2026-08-01T00:00:00.000Z');
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES
			('lesson-homework', 'center-homework', 'class-homework',
			 'schedule-homework', '2026-08-10', 'planned', 'admin-homework',
			 '2026-08-01T00:00:00.000Z'),
			('lesson-secondary-homework', 'center-homework', 'class-secondary-homework',
			 'schedule-secondary-homework', '2026-08-11', 'planned', 'admin-homework',
			 '2026-08-01T00:00:00.000Z'),
			('lesson-other-homework', 'center-other-homework', 'class-other-homework',
			 'schedule-other-homework', '2026-08-12', 'planned', 'admin-other-homework',
			 '2026-08-01T00:00:00.000Z');
	`);

	for (const [classId, lessonId, homework] of [
		['class-homework', 'lesson-homework', 'Read chapter one'],
		['class-secondary-homework', 'lesson-secondary-homework', 'Read chapter two']
	] as const) {
		root.lessonContext.setSharedLessonMaterial({
			sessionToken: 'session-admin-homework',
			classId,
			lessonId,
			topic: 'Topic',
			practicalWork: 'Practice',
			homework
		});
	}
}

function actionEvent(
	root: CompositionRoot,
	sessionToken: string,
	fields: Record<string, string>,
	classId = 'class-homework',
	lessonId = 'lesson-homework'
) {
	const url = contextUrl(classId, lessonId);
	const formData = new FormData();
	for (const [name, value] of Object.entries(fields)) {
		if (name !== 'action') formData.append(name, value);
	}
	return {
		url,
		request: new Request(url, { method: 'POST', body: formData }),
		cookies: { get: (name: string) => name === 'foundation_session' ? sessionToken : undefined },
		root,
		actionName: fields.action
	} as any;
}

async function invoke(request: any) {
	return lessonContextActions[request.actionName](request);
}

function loadEvent(sessionToken: string, classId = 'class-homework', lessonId = 'lesson-homework') {
	const url = contextUrl(classId, lessonId);
	return {
		url,
		cookies: { get: (name: string) => name === 'foundation_session' ? sessionToken : undefined }
	} as any;
}

function progressState(root: CompositionRoot) {
	return {
		homework: root.database.sqlite.prepare('SELECT * FROM learning_homework ORDER BY id').all(),
		completions: root.database.sqlite
			.prepare('SELECT * FROM learning_homework_completions ORDER BY homework_id, student_account_id')
			.all(),
		grades: root.database.sqlite
			.prepare('SELECT * FROM learning_grades ORDER BY homework_id, student_account_id')
			.all()
	};
}

describe('TASK-105 server homework transport', () => {
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

	it('projects zero/one/multiple selection and makes named create idempotent', async () => {
		const empty = root.learningProgress.getHomeworkProgressForLesson({
			sessionToken: 'session-student-one-homework',
			classId: 'class-homework',
			lessonId: 'lesson-homework'
		});
		expect(empty).toEqual({ homework: null, completions: [], grades: [] });

		const forgedBefore = progressState(root);
		const forged = await invoke(actionEvent(
			root,
			'session-admin-homework',
			{ action: 'createHomework', homeworkId: 'forged-homework-id' }
		));
		expect(forged).toMatchObject({ status: 400, data: { error: 'invalid_homework_request' } });
		expect(progressState(root)).toEqual(forgedBefore);

		const created = await invoke(actionEvent(
			root,
			'session-admin-homework',
			{ action: 'createHomework' }
		));
		expect(created).toEqual({ homeworkSuccess: true });
		const firstId = (root.database.sqlite
			.prepare('SELECT id FROM learning_homework WHERE class_id = ?')
			.get('class-homework') as { id: string }).id;
		expect(firstId).toMatch(/^[A-Za-z0-9_-]{20,}$/);
		expect(firstId).not.toBe('forged-homework-id');

		const repeatedBefore = progressState(root);
		const repeated = await invoke(actionEvent(
			root,
			'session-teacher-homework',
			{ action: 'createHomework' }
		));
		expect(repeated).toEqual({ homeworkSuccess: true });
		expect(progressState(root)).toEqual(repeatedBefore);

		const teacherContext = lessonContextLoad(loadEvent('session-teacher-homework')) as any;
		expect(teacherContext.dayContext.homeworkProgress).toMatchObject({
			homework: { homeworkId: firstId, title: 'Read chapter one' },
		completions: [
			{ studentAccountId: 'student-one-homework', completed: false, completedAt: null },
			{ studentAccountId: 'student-two-homework', completed: false, completedAt: null }
		],
		grades: []
	});
		expect(teacherContext.dayContext.homeworkProgress.completions.every((entry: any) => !('grade' in entry))).toBe(true);

		root.learningProgress.createHomework({
			sessionToken: 'session-teacher-homework',
			classId: 'class-homework',
			homeworkId: 'second-homework-id',
			title: 'Second worksheet'
		});
		const ambiguousBefore = progressState(root);
		expect(() => root.learningProgress.getHomeworkProgressForLesson({
			sessionToken: 'session-teacher-homework',
			classId: 'class-homework',
			lessonId: 'lesson-homework'
		})).toThrow('ambiguous-homework-selection');
		expect(progressState(root)).toEqual(ambiguousBefore);
	});

	it('delegates completion and all accepted grades while keeping grade privacy separate', async () => {
		await invoke(actionEvent(root, 'session-admin-homework', {
			action: 'createHomework'
		}));

		for (const grade of ['α', 'β', 'γ', 'F']) {
			const result = await invoke(actionEvent(
				root,
				'session-teacher-homework',
				{ action: 'recordGrade', studentAccountId: 'student-one-homework', grade }
			));
			expect(result).toEqual({ homeworkSuccess: true });
		}
		const adminGrade = await invoke(actionEvent(
			root,
			'session-admin-homework',
			{ action: 'recordGrade', studentAccountId: 'student-two-homework', grade: 'β' }
		));
		expect(adminGrade).toEqual({ homeworkSuccess: true });

		const beforeCompletion = progressState(root);
		const completed = await invoke(actionEvent(
			root,
			'session-student-one-homework',
			{ action: 'completeHomework' }
		));
		expect(completed).toEqual({ homeworkSuccess: true });
		const repeatedCompletion = await invoke(actionEvent(
			root,
			'session-student-one-homework',
			{ action: 'completeHomework' }
		));
		expect(repeatedCompletion).toEqual({ homeworkSuccess: true });
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM learning_homework_completions').get()).toEqual({ count: 1 });
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM learning_grades').get()).toEqual({ count: 2 });
		expect(progressState(root).homework).toHaveLength(beforeCompletion.homework.length);

		const teacherProgress = root.learningProgress.getHomeworkProgressForLesson({
			sessionToken: 'session-teacher-homework',
			classId: 'class-homework',
			lessonId: 'lesson-homework'
		});
		expect(teacherProgress.completions).toEqual(expect.arrayContaining([
			expect.objectContaining({ studentAccountId: 'student-one-homework', completed: true }),
			expect.objectContaining({ studentAccountId: 'student-two-homework', completed: false })
		]));
		expect(teacherProgress.completions.every((entry) => !('grade' in entry))).toBe(true);
		expect(teacherProgress.grades).toEqual(expect.arrayContaining([
			expect.objectContaining({ studentAccountId: 'student-one-homework', grade: 'F' }),
			expect.objectContaining({ studentAccountId: 'student-two-homework', grade: 'β' })
		]));

		const studentTwoShared = root.lessonContext.getDayContext({
			sessionToken: 'session-student-two-homework',
			classId: 'class-homework',
			lessonId: 'lesson-homework'
		});
		expect(studentTwoShared.homeworkProgress.completions).toEqual(expect.arrayContaining([
			expect.objectContaining({ studentAccountId: 'student-one-homework', completed: true }),
			expect.objectContaining({ studentAccountId: 'student-two-homework', completed: false })
		]));
		expect(studentTwoShared.homeworkProgress.completions.every((entry) => !('grade' in entry))).toBe(true);

		const studentShared = root.lessonContext.getDayContext({
			sessionToken: 'session-student-one-homework',
			classId: 'class-homework',
			lessonId: 'lesson-homework'
		});
		expect(studentShared.homeworkProgress.grades).toEqual([]);
		const studentPersonal = root.lessonContext.getDayContext({
			sessionToken: 'session-student-one-homework',
			classId: 'class-homework',
			lessonId: 'lesson-homework',
			studentAccountId: 'student-one-homework'
		});
		expect(studentPersonal.personal?.progress).toMatchObject({
			completion: { completed: true, studentAccountId: 'student-one-homework' },
			grade: { grade: 'F', studentAccountId: 'student-one-homework' }
		});

		const parentPersonal = root.lessonContext.getDayContext({
			sessionToken: 'session-parent-linked-homework',
			classId: 'class-homework',
			lessonId: 'lesson-homework',
			studentAccountId: 'student-one-homework'
		});
		expect(parentPersonal.personal?.progress.grade?.grade).toBe('F');
		expect(parentPersonal.homeworkProgress.grades).toEqual([]);
	});

	it('denies forged, wrong-role, unassigned, cross-center, invalid-grade, and unlinked-parent paths before write', async () => {
		await invoke(actionEvent(root, 'session-admin-homework', {
			action: 'createHomework'
		}));
		const requests: Array<[string, Record<string, string>]> = [
			['session-student-one-homework', { action: 'createHomework' }],
			['session-teacher-unassigned-homework', { action: 'createHomework' }],
			['session-admin-other-homework', { action: 'createHomework' }],
			['session-admin-homework', { action: 'createHomework', homeworkId: 'forged-homework-id' }],
			['session-student-one-homework', { action: 'completeHomework', homeworkId: 'forged-homework-id' }],
			['session-teacher-homework', { action: 'recordGrade', studentAccountId: 'student-other-homework', grade: 'α' }],
			['session-student-one-homework', { action: 'recordGrade', studentAccountId: 'student-one-homework', grade: 'α' }],
			['session-teacher-homework', { action: 'recordGrade', studentAccountId: 'student-one-homework', grade: 'A' }]
		];

		for (const [sessionToken, fields] of requests) {
			const before = progressState(root);
			const result = await invoke(actionEvent(root, sessionToken, fields));
			expect(result).toMatchObject({ status: expect.any(Number), data: { error: expect.any(String) } });
			expect(progressState(root)).toEqual(before);
		}

		const unlinkedBefore = progressState(root);
		expect(() => lessonContextLoad(loadEvent('session-parent-unlinked-homework'))).toThrowError(
			expect.objectContaining({ status: 403 })
		);
		expect(progressState(root)).toEqual(unlinkedBefore);

		const routeSource = readFileSync(resolve(process.cwd(), 'src/routes/lesson-context/+page.server.ts'), 'utf8');
		const apiSource = readFileSync(resolve(process.cwd(), 'src/routes/api/lesson-context/+server.ts'), 'utf8');
		expect(routeSource).not.toContain('.sqlite');
		expect(routeSource).not.toMatch(/learning_(homework|grades|homework_completions)/);
		expect(apiSource).not.toContain('export const POST');
	});

	it('generates distinct IDs in distinct authorized class fixtures and keeps a fresh rerun isolated', async () => {
		const own = await invoke(actionEvent(
			root,
			'session-admin-homework',
			{ action: 'createHomework' },
			'class-homework',
			'lesson-homework'
		));
		const secondary = await invoke(actionEvent(
			root,
			'session-teacher-homework',
			{ action: 'createHomework' },
			'class-secondary-homework',
			'lesson-secondary-homework'
		));
		expect(own).toEqual({ homeworkSuccess: true });
		expect(secondary).toEqual({ homeworkSuccess: true });

		const ids = root.database.sqlite.prepare('SELECT class_id, id FROM learning_homework ORDER BY class_id').all() as Array<{ class_id: string; id: string }>;
		expect(ids).toHaveLength(2);
		expect(ids[0].id).not.toBe(ids[1].id);
		expect(root.learningProgress.getHomeworkForLesson({
			sessionToken: 'session-teacher-homework',
			classId: 'class-secondary-homework',
			lessonId: 'lesson-secondary-homework'
		})?.homeworkId).toBe(ids[1].id);

		const beforeRerun = progressState(root);
		const secondLoad = lessonContextLoad(loadEvent('session-student-two-homework', 'class-secondary-homework', 'lesson-secondary-homework')) as any;
		expect(secondLoad.dayContext.homeworkProgress.homework.homeworkId).toBe(ids[1].id);
		expect(progressState(root)).toEqual(beforeRerun);
	});
});
