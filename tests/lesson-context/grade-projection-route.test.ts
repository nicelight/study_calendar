import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const routeState = vi.hoisted(() => ({
	root: undefined as any
}));

vi.mock('$lib/server/composition-root', () => ({
	getCompositionRoot: () => routeState.root
}));

const actualComposition = await vi.importActual<
	typeof import('../../src/lib/server/composition-root')
>('../../src/lib/server/composition-root');
const { GET } = await import('../../src/routes/api/lesson-context/+server');

function cookies(sessionToken?: string) {
	return { get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined) };
}

function requestUrl(studentAccountId: string): URL {
	const url = new URL('http://127.0.0.1/api/lesson-context');
	url.searchParams.set('classId', 'class-own');
	url.searchParams.set('lessonId', 'lesson-own');
	url.searchParams.set('studentAccountId', studentAccountId);
	return url;
}

describe('Lesson Context grade projection route privacy', () => {
	let root: ReturnType<typeof actualComposition.createCompositionRoot>;

	beforeEach(() => {
		root = actualComposition.createCompositionRoot({ databaseFilename: ':memory:' });
		routeState.root = root;
		root.database.sqlite.exec(`
			INSERT INTO accounts (id, role) VALUES
				('admin-own', 'admin'),
				('teacher-own', 'teacher'),
				('student-one', 'student'),
				('student-two', 'student');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('session-admin-own', 'admin-own', NULL),
				('session-teacher-own', 'teacher-own', NULL),
				('session-student-one', 'student-one', NULL),
				('session-student-two', 'student-two', NULL);
			INSERT INTO centers (id, name) VALUES ('center-own', 'Own Center');
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('center-own', 'admin-own'),
				('center-own', 'teacher-own'),
				('center-own', 'student-one'),
				('center-own', 'student-two');
			INSERT INTO classes (id, center_id, name, mode)
				VALUES ('class-own', 'center-own', 'Physics group', 'group');
			INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
				VALUES ('center-own', 'class-own', 'teacher-own');
			INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
				('center-own', 'class-own', 'student-one'),
				('center-own', 'class-own', 'student-two');
			INSERT INTO schedules (
				id, center_id, class_id, start_date, end_date, weekdays,
				created_by_account_id, created_at
			) VALUES (
				'schedule-own', 'center-own', 'class-own', '2026-08-10', '2026-08-10',
				'[1]', 'admin-own', '2026-08-01T00:00:00.000Z'
			);
			INSERT INTO lessons (
				id, center_id, class_id, schedule_id, lesson_date, status,
				created_by_account_id, created_at
			) VALUES (
				'lesson-own', 'center-own', 'class-own', 'schedule-own', '2026-08-10',
				'planned', 'admin-own', '2026-08-01T00:00:00.000Z'
			);
		`);

		root.lessonContext.setSharedLessonMaterial({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			lessonId: 'lesson-own',
			topic: 'Newton laws',
			practicalWork: 'Measure acceleration',
			homework: 'Solve exercises 1–3'
		});
		const homework = root.learningProgress.createHomework({
			sessionToken: 'session-teacher-own',
			classId: 'class-own',
			homeworkId: 'homework-private',
			title: 'Private worksheet'
		});
		root.learningProgress.recordGrade({
			sessionToken: 'session-teacher-own',
			classId: 'class-own',
			homeworkId: homework.homeworkId,
			studentAccountId: 'student-one',
			grade: 'γ'
		});
	});

	afterEach(() => {
		root.database.close();
		routeState.root = undefined;
	});

	it('returns generic 403 for a guessed student and does not mutate private state', async () => {
		const before = root.database.sqlite.prepare(`
			SELECT
				(SELECT COUNT(*) FROM lesson_context_material) AS material_count,
				(SELECT COUNT(*) FROM learning_homework) AS homework_count,
				(SELECT COUNT(*) FROM learning_grades) AS grade_count,
				(SELECT COUNT(*) FROM learning_attendance) AS attendance_count
		`).get();

		const response = await GET({
			cookies: cookies('session-student-one'),
			url: requestUrl('student-two')
		} as any);

		expect(response.status).toBe(403);
		expect(await response.json()).toEqual({ error: 'forbidden' });

		const after = root.database.sqlite.prepare(`
			SELECT
				(SELECT COUNT(*) FROM lesson_context_material) AS material_count,
				(SELECT COUNT(*) FROM learning_homework) AS homework_count,
				(SELECT COUNT(*) FROM learning_grades) AS grade_count,
				(SELECT COUNT(*) FROM learning_attendance) AS attendance_count
		`).get();
		expect(after).toEqual(before);
	});
});
