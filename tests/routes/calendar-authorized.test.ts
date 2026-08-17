import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'svelte/server';

const routeRoot = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return {
		...actual,
		getCompositionRoot: () => routeRoot.current
	};
});

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import CalendarPage from '../../src/routes/calendar/+page.svelte';
import { load, type CalendarPageData } from '../../src/routes/calendar/+page.server';

const serverPath = resolve(process.cwd(), 'src/routes/calendar/+page.server.ts');
const componentPath = resolve(process.cwd(), 'src/routes/calendar/+page.svelte');
const publicHomePath = resolve(process.cwd(), 'src/routes/+page.svelte');

type SessionFixture =
	| 'session-admin-own'
	| 'session-admin-other'
	| 'session-teacher-assigned'
	| 'session-teacher-unassigned'
	| 'session-teacher-removed'
	| 'session-student-own'
	| 'session-student-non-member'
	| 'session-parent-own'
	| 'session-revoked';

function requestEvent(
	root: CompositionRoot,
	sessionToken: SessionFixture | undefined,
	classId = 'class-own',
	date = '2026-08-10'
): Parameters<typeof load>[0] {
	const url = new URL('https://calendar.test/calendar');
	url.searchParams.set('classId', classId);
	url.searchParams.set('date', date);

	return {
		url,
		request: new Request(url),
		cookies: {
			get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined)
		},
		locals: { actor: sessionToken ? root.identityAccess.resolveActor(sessionToken) : null }
	} as Parameters<typeof load>[0];
}

function snapshot(root: CompositionRoot): Record<string, unknown[]> {
	const tables = root.database.sqlite
		.prepare(
			"SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
		)
		.all() as Array<{ name: string }>;

	return Object.fromEntries(
		tables.map(({ name }) => [
			name,
			root.database.sqlite.prepare(`SELECT * FROM "${name.replaceAll('"', '""')}" ORDER BY rowid`).all()
		])
	);
}

async function thrown(action: () => unknown | Promise<unknown>): Promise<unknown> {
	try {
		await action();
		throw new Error('expected a SvelteKit control-flow response');
	} catch (cause) {
		return cause;
	}
}

function seedRoot(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-own', 'Own Center'), ('center-other', 'Other Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-own', 'admin'),
			('admin-other', 'admin'),
			('teacher-assigned', 'teacher'),
			('teacher-unassigned', 'teacher'),
			('teacher-removed', 'teacher'),
			('student-own', 'student'),
			('student-non-member', 'student'),
			('parent-own', 'parent');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-own', 'admin-own', NULL),
			('session-admin-other', 'admin-other', NULL),
			('session-teacher-assigned', 'teacher-assigned', NULL),
			('session-teacher-unassigned', 'teacher-unassigned', NULL),
			('session-teacher-removed', 'teacher-removed', NULL),
			('session-student-own', 'student-own', NULL),
			('session-student-non-member', 'student-non-member', NULL),
			('session-parent-own', 'parent-own', NULL),
			('session-revoked', 'admin-own', '2026-08-09T00:00:00.000Z');
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-own', 'admin-own'),
			('center-other', 'admin-other'),
			('center-own', 'teacher-assigned'),
			('center-own', 'teacher-unassigned'),
			('center-own', 'teacher-removed'),
			('center-own', 'student-own'),
			('center-own', 'student-non-member'),
			('center-own', 'parent-own');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('class-own', 'center-own', 'Алгебра', 'group'),
			('class-other', 'center-other', 'Геометрия', 'group');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id) VALUES
			('center-own', 'class-own', 'teacher-assigned'),
			('center-own', 'class-own', 'teacher-removed');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('center-own', 'class-own', 'student-own');
		INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id) VALUES
			('center-own', 'parent-own', 'student-own');
		INSERT INTO schedules (id, center_id, class_id, start_date, end_date, weekdays, created_by_account_id, created_at) VALUES
			('schedule-own', 'center-own', 'class-own', '2026-08-01', '2026-08-31', '[1,2]', 'admin-own', '2026-08-01T00:00:00.000Z'),
			('schedule-other', 'center-other', 'class-other', '2026-08-01', '2026-08-31', '[1]', 'admin-other', '2026-08-01T00:00:00.000Z');
		INSERT INTO lessons (id, center_id, class_id, schedule_id, lesson_date, status, created_by_account_id, created_at) VALUES
			('lesson-own-planned', 'center-own', 'class-own', 'schedule-own', '2026-08-10', 'planned', 'admin-own', '2026-08-01T00:00:00.000Z'),
			('lesson-own-completed', 'center-own', 'class-own', 'schedule-own', '2026-08-11', 'completed', 'admin-own', '2026-08-01T00:00:00.000Z'),
			('lesson-other-secret', 'center-other', 'class-other', 'schedule-other', '2026-08-10', 'cancelled', 'admin-other', '2026-08-01T00:00:00.000Z');
	`);
	return root;
}

describe('FT-003-AC-007 authorized database-backed calendar', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = seedRoot();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it.each([
		['session-admin-own', 'admin'],
		['session-teacher-assigned', 'teacher'],
		['session-student-own', 'student'],
		['session-parent-own', 'parent']
	] as const)('renders only current DB lesson facts for permitted %s', (sessionToken, role) => {
		const before = snapshot(root);
		const data = load(requestEvent(root, sessionToken)) as CalendarPageData;
		const response = { status: 200, body: render(CalendarPage, { props: { data } } as any).body };

		expect(data).toMatchObject({
			classId: 'class-own',
			className: 'Алгебра',
			role,
			selectedDate: '2026-08-10',
			lessons: [
				{ lessonId: 'lesson-own-planned', lessonDate: '2026-08-10', status: 'planned' },
				{ lessonId: 'lesson-own-completed', lessonDate: '2026-08-11', status: 'completed' }
			]
		});
		expect(data.lessons).toHaveLength(2);
		expect(response.status).toBe(200);
		expect(response.body).toContain('data-class-id="class-own"');
		expect(response.body).toContain(`data-role="${role}"`);
		expect(response.body).toContain('data-lesson-id="lesson-own-planned"');
		expect(response.body).toContain('data-lesson-date="2026-08-10"');
		expect(response.body).toContain('data-lesson-status="completed"');
		expect(response.body).toContain('Завершено');
		expect(response.body).not.toContain('lesson-other-secret');
		expect(response.body).not.toContain('Ритм обучения');
		expect(snapshot(root)).toEqual(before);
	});

	it.each([
		['anonymous', undefined],
		['revoked', 'session-revoked']
	] as const)('%s request redirects before protected calendar data renders', async (_, sessionToken) => {
		const before = snapshot(root);
		const rejected = await thrown(() => load(requestEvent(root, sessionToken)));

		expect(rejected).toMatchObject({ status: 303, location: '/login' });
		expect(snapshot(root)).toEqual(before);
	});

	it.each([
		['cross-center Admin', 'session-admin-other'],
		['non-member Student', 'session-student-non-member'],
		['unassigned Teacher', 'session-teacher-unassigned']
	] as const)('%s receives a 403 before lesson data renders', async (_, sessionToken) => {
		const before = snapshot(root);
		const rejected = await thrown(() => load(requestEvent(root, sessionToken)));

		expect(rejected).toMatchObject({ status: 403, body: { message: 'Forbidden' } });
		expect(snapshot(root)).toEqual(before);
	});

	it('denies a removed Teacher on the next server-side calendar read without mutation', async () => {
		expect(load(requestEvent(root, 'session-teacher-removed'))).toMatchObject({
			classId: 'class-own',
			role: 'teacher'
		});
		root.database.sqlite
			.prepare('DELETE FROM teacher_assignments WHERE class_id = ? AND teacher_account_id = ?')
			.run('class-own', 'teacher-removed');
		const afterRemoval = snapshot(root);

		const rejected = await thrown(() => load(requestEvent(root, 'session-teacher-removed')));

		expect(rejected).toMatchObject({ status: 403, body: { message: 'Forbidden' } });
		expect(snapshot(root)).toEqual(afterRemoval);
	});

	it('keeps authorization and DB reads in existing public server boundaries and preserves the public fixture', () => {
		const server = readFileSync(serverPath, 'utf8');
		const component = readFileSync(componentPath, 'utf8');
		const publicHome = readFileSync(publicHomePath, 'utf8');

		expect(server).toContain('event.locals.actor');
		expect(server).toContain('getAuthorizedClassScope');
		expect(server).toContain('getLessons');
		expect(server).toContain('scope.accountId !== actor.accountId');
		expect(server).toContain('scope.role !== actor.role');
		expect(server).not.toContain('platform/database');
		expect(server).not.toContain('.sqlite');
		expect(component).toContain('buildCalendarWeeks(data.selectedDate, lessonWeekdays)');
		expect(component).not.toContain('$lib/server');
		expect(component).not.toContain('DEFAULT_LESSON_WEEKDAYS');
		expect(component).toContain('/lesson-context?');
		expect(publicHome).toContain('Ритм обучения');
		expect(publicHome).toContain('href="/login"');
	});
});
