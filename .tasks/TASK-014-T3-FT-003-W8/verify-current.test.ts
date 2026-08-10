import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const routeState = vi.hoisted(() => ({ root: undefined as any }));

vi.mock('$lib/server/composition-root', () => ({
	getCompositionRoot: () => routeState.root
}));

const actualComposition = await vi.importActual<
	typeof import('../../src/lib/server/composition-root')
>('../../src/lib/server/composition-root');
const { GET } = await import('../../src/routes/api/lesson-context/+server');
const { load } = await import('../../src/routes/lesson-context/+page.server');

const tables = [
	'lesson_context_material',
	'learning_homework',
	'learning_homework_completions',
	'learning_grades',
	'learning_attendance',
	'financial_price_settings',
	'financial_lesson_charges',
	'financial_payments',
	'financial_payment_commands',
	'financial_payment_allocations',
	'financial_audit_records',
	'financial_payment_audit_records',
	'collaboration_messages',
	'collaboration_comments',
	'collaboration_reactions'
] as const;

function seed(root: ReturnType<typeof actualComposition.createCompositionRoot>) {
	root.database.sqlite.exec(`
		INSERT INTO accounts (id, role) VALUES
			('admin-own', 'admin'),
			('admin-other', 'admin'),
			('teacher-own', 'teacher'),
			('student-one', 'student'),
			('student-two', 'student'),
			('parent-one', 'parent');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-own', 'admin-own', NULL),
			('session-admin-other', 'admin-other', NULL),
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
			('center-own', 'parent-one'),
			('center-other', 'admin-other');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('class-own', 'center-own', 'Own Class', 'group'),
			('class-own-other', 'center-own', 'Other Own-Center Class', 'group'),
			('class-other', 'center-other', 'Other Center Class', 'group');
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
		) VALUES
			('schedule-own', 'center-own', 'class-own', '2026-08-10', '2026-08-10', '[1]', 'admin-own', '2026-08-01T00:00:00.000Z'),
			('schedule-own-other', 'center-own', 'class-own-other', '2026-08-10', '2026-08-10', '[1]', 'admin-own', '2026-08-01T00:00:00.000Z'),
			('schedule-other', 'center-other', 'class-other', '2026-08-10', '2026-08-10', '[1]', 'admin-other', '2026-08-01T00:00:00.000Z');
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES
			('lesson-own', 'center-own', 'class-own', 'schedule-own', '2026-08-10', 'planned', 'admin-own', '2026-08-01T00:00:00.000Z'),
			('lesson-own-other', 'center-own', 'class-own-other', 'schedule-own-other', '2026-08-10', 'planned', 'admin-own', '2026-08-01T00:00:00.000Z'),
			('lesson-other', 'center-other', 'class-other', 'schedule-other', '2026-08-10', 'planned', 'admin-other', '2026-08-01T00:00:00.000Z');
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
		sessionToken: 'session-teacher-own',
		classId: 'class-own',
		homeworkId: 'homework-own',
		title: 'Newton worksheet'
	});
	root.learningProgress.recordGrade({
		sessionToken: 'session-teacher-own',
		classId: 'class-own',
		homeworkId: 'homework-own',
		studentAccountId: 'student-one',
		grade: 'β'
	});
	root.learningProgress.recordGrade({
		sessionToken: 'session-teacher-own',
		classId: 'class-own',
		homeworkId: 'homework-own',
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
	root.collaboration.createMessage({
		sessionToken: 'session-student-one',
		classId: 'class-own',
		lessonId: 'lesson-own',
		scope: 'shared',
		messageId: 'shared-one',
		body: 'Shared question'
	});
}

function cookies(sessionToken?: string) {
	return { get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined) };
}

function requestUrl(
	classId = 'class-own',
	lessonId = 'lesson-own',
	studentAccountId?: string,
	role?: string
): URL {
	const url = new URL('http://127.0.0.1/lesson-context');
	url.searchParams.set('date', '1900-01-01');
	url.searchParams.set('classId', classId);
	url.searchParams.set('lessonId', lessonId);
	if (studentAccountId !== undefined) url.searchParams.set('studentAccountId', studentAccountId);
	if (role !== undefined) url.searchParams.set('role', role);
	return url;
}

function snapshot(root: ReturnType<typeof actualComposition.createCompositionRoot>) {
	return Object.fromEntries(
		tables.map((table) => [
			table,
			root.database.sqlite.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()
		])
	);
}

describe('TASK-014 fresh verifier-owned functional proof', () => {
	let root: ReturnType<typeof actualComposition.createCompositionRoot>;

	beforeEach(() => {
		root = actualComposition.createCompositionRoot({ databaseFilename: ':memory:' });
		routeState.root = root;
		seed(root);
	});

	afterEach(() => {
		root.database.close();
		routeState.root = undefined;
	});

	it('AC-003/AC-004 compose shared and selected personal context across permitted roles', () => {
		const shared = root.lessonContext.getDayContext({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own'
		});
		const sharedViews = ['session-admin-own', 'session-teacher-own', 'session-student-one', 'session-parent-one']
			.map((sessionToken) => root.lessonContext.getDayContext({ sessionToken, classId: 'class-own', lessonId: 'lesson-own' }));
		expect(sharedViews.map((view) => view.material)).toEqual(sharedViews.map(() => shared.material));
		expect(sharedViews.every((view) => view.mode === 'shared' && view.personal === null)).toBe(true);

		const captured: Record<string, unknown>[] = [];
		const original = root.learningProgress.getGradeForLesson.bind(root.learningProgress);
		root.learningProgress.getGradeForLesson = ((request: Record<string, unknown>) => {
			captured.push({ ...request });
			return original(request as Parameters<typeof original>[0]);
		}) as typeof root.learningProgress.getGradeForLesson;

		const personalViews = ['session-admin-own', 'session-teacher-own', 'session-student-one', 'session-parent-one']
			.map((sessionToken) => root.lessonContext.getDayContext({
				sessionToken,
				classId: 'class-own',
				lessonId: 'lesson-own',
				studentAccountId: 'student-one'
			}));
		for (const view of personalViews) {
			expect(view.mode).toBe('personal');
			expect(view.material).toEqual(shared.material);
			expect(view.personal).toMatchObject({
				studentAccountId: 'student-one',
				progress: {
					attendance: { studentAccountId: 'student-one', attendance: 'present' },
					grade: { homeworkId: 'homework-own', studentAccountId: 'student-one', grade: 'β' }
				},
				discussion: {
					commonMessages: [expect.objectContaining({ messageId: 'private-one', studentAccountId: 'student-one' })]
				},
				financial: { balance: { charges: [expect.objectContaining({ lessonId: 'lesson-own' })] } }
			});
			expect(JSON.stringify(view)).not.toContain('private-two');
			expect(JSON.stringify(view)).not.toContain('grade":"F"');
		}
		expect(captured).toHaveLength(4);
		for (const request of captured) {
			expect(request).toEqual({
				sessionToken: expect.any(String),
				classId: 'class-own',
				lessonId: 'lesson-own',
				studentAccountId: 'student-one'
			});
			expect(request).not.toHaveProperty('homeworkId');
		}
		expect(readFileSync(resolve(process.cwd(), 'src/lib/server/modules/lesson-context/public.ts'), 'utf8')).not.toContain('homeworkId');
	});

	it('AC-005 preserves authoritative navigation identity through API and SSR', async () => {
		const apiShared = await GET({ cookies: cookies('session-student-one'), url: requestUrl() } as any);
		expect(apiShared.status).toBe(200);
		expect(await apiShared.json()).toMatchObject({
			navigation: { date: '2026-08-10', classId: 'class-own', lessonId: 'lesson-own', studentAccountId: null }
		});

		const apiPersonal = await GET({
			cookies: cookies('session-student-one'),
			url: requestUrl('class-own', 'lesson-own', 'student-one')
		} as any);
		expect(apiPersonal.status).toBe(200);
		expect(await apiPersonal.json()).toMatchObject({
			navigation: { date: '2026-08-10', classId: 'class-own', lessonId: 'lesson-own', studentAccountId: 'student-one' }
		});

		const ssr = await load({
			cookies: cookies('session-parent-one'),
			url: requestUrl('class-own', 'lesson-own', 'student-one')
		} as any);
		expect(ssr.dayContext.navigation).toEqual({
			date: '2026-08-10',
			classId: 'class-own',
			lessonId: 'lesson-own',
			studentAccountId: 'student-one'
		});
	});

	it('AC-006 denies unauthenticated, wrong-student, wrong-class, and cross-center access with generic 403 and no mutation', async () => {
		const before = snapshot(root);
		const denied = [
			{ token: undefined, classId: 'class-own', lessonId: 'lesson-own', student: 'student-one' },
			{ token: 'session-student-one', classId: 'class-own', lessonId: 'lesson-own', student: 'student-two' },
			{ token: 'session-parent-one', classId: 'class-own', lessonId: 'lesson-own', student: 'student-two' },
			{ token: 'session-student-one', classId: 'class-own-other', lessonId: 'lesson-own-other', student: 'student-one' },
			{ token: 'session-admin-own', classId: 'class-other', lessonId: 'lesson-other', student: 'student-one' },
			{ token: 'session-admin-other', classId: 'class-own', lessonId: 'lesson-own', student: 'student-one' }
		];

		for (const request of denied) {
			const response = await GET({
				cookies: cookies(request.token),
				url: requestUrl(request.classId, request.lessonId, request.student, 'admin')
			} as any);
			expect(response.status).toBe(403);
			expect(await response.json()).toEqual({ error: 'forbidden' });
			let ssrError: unknown;
			try {
				load({ cookies: cookies(request.token), url: requestUrl(request.classId, request.lessonId, request.student) } as any);
			} catch (error) {
				ssrError = error;
			}
			expect(ssrError).toMatchObject({ status: 403 });
			expect(() => root.lessonContext.getDayContext({
				sessionToken: request.token,
				classId: request.classId,
				lessonId: request.lessonId,
				studentAccountId: request.student
			})).toThrow();
		}

		const providerDenied = [
			{ sessionToken: undefined },
			{ sessionToken: 'session-student-one', studentAccountId: 'student-two' },
			{ sessionToken: 'session-parent-one', studentAccountId: 'student-two' },
			{ sessionToken: 'session-student-one', classId: 'class-own-other', lessonId: 'lesson-own-other' },
			{ sessionToken: 'session-admin-own', classId: 'class-other', lessonId: 'lesson-other' },
			{ sessionToken: 'session-admin-other' }
		];
		for (const request of providerDenied) {
			expect(() => root.learningProgress.getGradeForLesson({
				sessionToken: request.sessionToken,
				classId: request.classId ?? 'class-own',
				lessonId: request.lessonId ?? 'lesson-own',
				studentAccountId: request.studentAccountId ?? 'student-one'
			})).toThrow();
		}
		expect(snapshot(root)).toEqual(before);
	});
});
