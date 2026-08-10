import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const verifierState = vi.hoisted(() => ({
	root: undefined as any
}));

vi.mock('$lib/server/composition-root', () => ({
	getCompositionRoot: () => verifierState.root
}));

const actualComposition = await vi.importActual<
	typeof import('../../src/lib/server/composition-root')
>('../../src/lib/server/composition-root');
const { GET } = await import('../../src/routes/api/lesson-context/+server');
const { load } = await import('../../src/routes/lesson-context/+page.server');

function seed(root: ReturnType<typeof actualComposition.createCompositionRoot>) {
	root.database.sqlite.exec(`
		INSERT INTO accounts (id, role) VALUES
			('admin-own', 'admin'),
			('teacher-own', 'teacher'),
			('student-one', 'student'),
			('student-two', 'student'),
			('parent-one', 'parent');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-own', 'admin-own', NULL),
			('session-teacher-own', 'teacher-own', NULL),
			('session-student-one', 'student-one', NULL),
			('session-student-two', 'student-two', NULL),
			('session-parent-one', 'parent-one', NULL);
		INSERT INTO centers (id, name) VALUES
			('center-own', 'Own Center'),
			('center-other', 'Other Center');
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-own', 'admin-own'),
			('center-own', 'teacher-own'),
			('center-own', 'student-one'),
			('center-own', 'student-two'),
			('center-own', 'parent-one');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('class-own', 'center-own', 'Physics group', 'group'),
			('class-other', 'center-other', 'Other class', 'group');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
			VALUES ('center-own', 'class-own', 'teacher-own');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('center-own', 'class-own', 'student-one'),
			('center-own', 'class-own', 'student-two');
		INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id)
			VALUES ('center-own', 'parent-one', 'student-one');
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
	root.learningProgress.createHomework({
		sessionToken: 'session-admin-own',
		classId: 'class-own',
		homeworkId: 'homework-one',
		title: 'Newton worksheet'
	});
	root.learningProgress.recordGrade({
		sessionToken: 'session-teacher-own',
		classId: 'class-own',
		homeworkId: 'homework-one',
		studentAccountId: 'student-one',
		grade: 'β'
	});
	root.learningProgress.recordGrade({
		sessionToken: 'session-teacher-own',
		classId: 'class-own',
		homeworkId: 'homework-one',
		studentAccountId: 'student-two',
		grade: 'F'
	});
	root.financialLedger.setClassPrice({
		sessionToken: 'session-admin-own',
		classId: 'class-own',
		amount: '20',
		effectiveFrom: '2026-01-01'
	});
	for (const studentAccountId of ['student-one', 'student-two']) {
		root.learningProgress.recordAttendance({
			sessionToken: 'session-teacher-own',
			classId: 'class-own',
			lessonId: 'lesson-own',
			studentAccountId,
			attendance: 'present'
		});
	}
	root.collaboration.createMessage({
		sessionToken: 'session-student-one',
		classId: 'class-own',
		lessonId: 'lesson-own',
		scope: 'personal',
		studentAccountId: 'student-one',
		messageId: 'private-one',
		body: 'Private one'
	});
	root.collaboration.createMessage({
		sessionToken: 'session-student-two',
		classId: 'class-own',
		lessonId: 'lesson-own',
		scope: 'personal',
		studentAccountId: 'student-two',
		messageId: 'private-two',
		body: 'Private two'
	});
}

function requestUrl(studentAccountId?: string, role?: string): URL {
	const url = new URL('http://127.0.0.1/lesson-context');
	url.searchParams.set('date', '2026-08-10');
	url.searchParams.set('classId', 'class-own');
	url.searchParams.set('lessonId', 'lesson-own');
	if (studentAccountId !== undefined) url.searchParams.set('studentAccountId', studentAccountId);
	if (role !== undefined) url.searchParams.set('role', role);
	return url;
}

function cookies(sessionToken?: string) {
	return { get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined) };
}

async function jsonResponse(sessionToken: string | undefined, studentAccountId?: string, role?: string) {
	return GET({ cookies: cookies(sessionToken), url: requestUrl(studentAccountId, role) } as any);
}

describe('TASK-014 verifier-owned disposable functional proof', () => {
	let root: ReturnType<typeof actualComposition.createCompositionRoot>;

	beforeEach(() => {
		root = actualComposition.createCompositionRoot({ databaseFilename: ':memory:' });
		verifierState.root = root;
		seed(root);
	});

	afterEach(() => {
		root.database.close();
		verifierState.root = undefined;
	});

	it('AC-003 serves identical shared material to every authorized role', () => {
		const contexts = [
			'session-admin-own',
			'session-teacher-own',
			'session-student-one',
			'session-parent-one'
		].map((sessionToken) => root.lessonContext.getDayContext({
			sessionToken,
			classId: 'class-own',
			lessonId: 'lesson-own'
		}));

		expect(contexts.map((context) => context.material)).toEqual([
			{
				lessonId: 'lesson-own',
				classId: 'class-own',
				topic: 'Newton laws',
				practicalWork: 'Measure acceleration',
				homework: 'Solve exercises 1–3'
			},
			{
				lessonId: 'lesson-own',
				classId: 'class-own',
				topic: 'Newton laws',
				practicalWork: 'Measure acceleration',
				homework: 'Solve exercises 1–3'
			},
			{
				lessonId: 'lesson-own',
				classId: 'class-own',
				topic: 'Newton laws',
				practicalWork: 'Measure acceleration',
				homework: 'Solve exercises 1–3'
			},
			{
				lessonId: 'lesson-own',
				classId: 'class-own',
				topic: 'Newton laws',
				practicalWork: 'Measure acceleration',
				homework: 'Solve exercises 1–3'
			}
		]);
	});

	it('AC-004 composes the selected student and includes all required personal projections', () => {
		const shared = root.lessonContext.getDayContext({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own'
		});
		const personal = root.lessonContext.getDayContext({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own',
			studentAccountId: 'student-one'
		});

		expect(personal.material).toEqual(shared.material);
		expect(personal.personal?.studentAccountId).toBe('student-one');
		expect(personal.personal?.progress.attendance.studentAccountId).toBe('student-one');
		expect(personal.personal?.discussion.commonMessages).toEqual([
			expect.objectContaining({ messageId: 'private-one', studentAccountId: 'student-one' })
		]);
		expect(personal.personal?.discussion.commonMessages).not.toEqual(
			expect.arrayContaining([expect.objectContaining({ messageId: 'private-two' })])
		);
		expect(personal.personal?.financial.balance.charges).toEqual([
			expect.objectContaining({ lessonId: 'lesson-own' })
		]);
		expect(root.learningProgress.getGrade({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			homeworkId: 'homework-one',
			studentAccountId: 'student-one'
		})?.grade).toBe('β');
		// REQ-006/access-control: the personal response must carry the permitted grade projection.
		expect(personal.personal?.progress).toHaveProperty('grades');
		expect(personal.personal?.progress).toMatchObject({
			grades: [expect.objectContaining({ studentAccountId: 'student-one', grade: 'β' })]
		});
	});

	it('AC-005 preserves authoritative date/class/lesson/student context through API and SSR adapters', async () => {
		const apiShared = await jsonResponse('session-student-one');
		expect(apiShared.status).toBe(200);
		expect(await apiShared.json()).toMatchObject({
			navigation: {
				date: '2026-08-10',
				classId: 'class-own',
				lessonId: 'lesson-own',
				studentAccountId: null
			}
		});

		const apiPersonal = await jsonResponse('session-student-one', 'student-one');
		expect(apiPersonal.status).toBe(200);
		expect(await apiPersonal.json()).toMatchObject({
			navigation: {
				date: '2026-08-10',
				classId: 'class-own',
				lessonId: 'lesson-own',
				studentAccountId: 'student-one'
			}
		});

		const ssr = await load({
			cookies: cookies('session-student-one'),
			url: requestUrl('student-one')
		} as any);
		expect(ssr.dayContext.navigation).toMatchObject({
			date: '2026-08-10',
			classId: 'class-own',
			lessonId: 'lesson-own',
			studentAccountId: 'student-one'
		});
	});

	it('AC-006 denies guessed/cross-context reads with generic API/SSR failures and no mutation', async () => {
		const before = root.database.sqlite.prepare(`
			SELECT
				(SELECT COUNT(*) FROM lesson_context_material) AS material_count,
				(SELECT COUNT(*) FROM learning_grades) AS grade_count,
				(SELECT COUNT(*) FROM learning_attendance) AS attendance_count,
				(SELECT COUNT(*) FROM collaboration_messages) AS message_count,
				(SELECT COUNT(*) FROM financial_lesson_charges) AS charge_count
		`).get();

		for (const request of [
			['session-student-one', 'student-two'],
			['session-student-two', 'student-one'],
			['session-student-one', 'student-one']
		] as const) {
			const [sessionToken, studentAccountId] = request;
			if (studentAccountId === 'student-one' && sessionToken === 'session-student-one') continue;
			expect(() => root.lessonContext.getDayContext({
				sessionToken,
				classId: 'class-own',
				lessonId: 'lesson-own',
				studentAccountId
			})).toThrow('not-authorized');
		}
		expect(() => root.lessonContext.getDayContext({
			sessionToken: 'session-student-one',
			classId: 'class-other',
			lessonId: 'lesson-own',
			studentAccountId: 'student-one'
		})).toThrow('not-authorized');
		expect(() => root.lessonContext.getDayContext({
			sessionToken: 'unknown-session',
			classId: 'class-own',
			lessonId: 'lesson-own',
			studentAccountId: 'student-one'
		})).toThrow('not-authorized');

		for (const [sessionToken, studentAccountId] of [
			['session-student-one', 'student-two'],
			['session-student-two', 'student-one']
		] as const) {
			const response = await jsonResponse(sessionToken, studentAccountId, 'admin');
			expect(response.status).toBe(403);
			expect(await response.json()).toEqual({ error: 'forbidden' });
		}
		let ssrError: unknown;
		try {
			load({
				cookies: cookies('session-student-one'),
				url: requestUrl('student-two')
			} as any);
		} catch (error) {
			ssrError = error;
		}
		expect(ssrError).toMatchObject({ status: 403 });

		const after = root.database.sqlite.prepare(`
			SELECT
				(SELECT COUNT(*) FROM lesson_context_material) AS material_count,
				(SELECT COUNT(*) FROM learning_grades) AS grade_count,
				(SELECT COUNT(*) FROM learning_attendance) AS attendance_count,
				(SELECT COUNT(*) FROM collaboration_messages) AS message_count,
				(SELECT COUNT(*) FROM financial_lesson_charges) AS charge_count
		`).get();
		expect(after).toEqual(before);
	});
});
