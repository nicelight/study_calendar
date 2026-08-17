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
import { load as calendarLoad, type CalendarPageData } from '../../src/routes/calendar/+page.server';
import { load as lessonContextLoad } from '../../src/routes/lesson-context/+page.server';

function calendarRequest(root: CompositionRoot): Parameters<typeof calendarLoad>[0] {
	const url = new URL('https://verify.test/calendar?classId=class-own&date=2026-08-10');
	return {
		url,
		request: new Request(url),
		cookies: {
			get: (name: string) => (name === 'foundation_session' ? 'session-student-own' : undefined)
		},
		locals: { actor: root.identityAccess.resolveActor('session-student-own') }
	} as Parameters<typeof calendarLoad>[0];
}

function lessonRequest(href: string, sessionToken = 'session-student-own'): Parameters<typeof lessonContextLoad>[0] {
	const url = new URL(`https://verify.test${href}`);
	return {
		url,
		request: new Request(url),
		cookies: {
			get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined)
		}
	} as Parameters<typeof lessonContextLoad>[0];
}

function databaseSnapshot(root: CompositionRoot): Record<string, unknown[]> {
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

function seedRoot(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-own', 'Own Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-own', 'admin'),
			('student-own', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-student-own', 'student-own', NULL),
			('session-admin-own', 'admin-own', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-own', 'admin-own'),
			('center-own', 'student-own');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('class-own', 'center-own', 'Алгебра', 'group');
		INSERT INTO class_students (center_id, class_id, student_account_id)
			VALUES ('center-own', 'class-own', 'student-own');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES (
			'schedule-own', 'center-own', 'class-own', '2026-08-01', '2026-08-31',
			'[1,2]', 'admin-own', '2026-08-01T00:00:00.000Z'
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
		topic: 'Linear equations',
		practicalWork: 'Solve examples',
		homework: 'Exercises 1–3'
	});
	return root;
}

describe('verifier-owned AC-008 route and ownership probe', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = seedRoot();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it('preserves the shared lesson identity through the real route boundaries without a student contract or mutation', () => {
		const calendarData = calendarLoad(calendarRequest(root)) as CalendarPageData;
		const rendered = render(CalendarPage, { props: { data: calendarData } } as any);
		const hrefs = [...rendered.body.matchAll(/href="(\/lesson-context\?[^\"]+)"/g)].map(
			(match) => match[1]
		);

		expect(hrefs).toHaveLength(1);
		const encodedHref = hrefs[0];
		expect(encodedHref).toBe(
			'/lesson-context?date=2026-08-10&amp;classId=class-own&amp;lessonId=lesson-own'
		);

		const href = encodedHref.replaceAll('&amp;', '&');
		const navigationUrl = new URL(`https://verify.test${href}`);
		expect([...navigationUrl.searchParams.keys()]).toEqual(['date', 'classId', 'lessonId']);
		expect([...navigationUrl.searchParams.entries()]).toEqual([
			['date', '2026-08-10'],
			['classId', 'class-own'],
			['lessonId', 'lesson-own']
		]);
		expect(navigationUrl.searchParams.has('studentAccountId')).toBe(false);

		const beforeReads = databaseSnapshot(root);
		const sharedResponse = lessonContextLoad(lessonRequest(href)) as {
			dayContext: NonNullable<ReturnType<CompositionRoot['lessonContext']['getDayContext']>>;
		};
		expect(sharedResponse.dayContext).toMatchObject({
			mode: 'shared',
			lesson: {
				lessonId: 'lesson-own',
				classId: 'class-own',
				lessonDate: '2026-08-10'
			},
			navigation: {
				date: '2026-08-10',
				classId: 'class-own',
				lessonId: 'lesson-own',
				studentAccountId: null
			},
			material: {
				topic: 'Linear equations',
				practicalWork: 'Solve examples',
				homework: 'Exercises 1–3'
			},
			personal: null
		});

		let denied = false;
		try {
			lessonContextLoad(lessonRequest(`${href}&studentAccountId=student-guess`));
		} catch (error) {
			denied = true;
			expect(error).toMatchObject({ status: 403 });
		}
		expect(denied).toBe(true);
		expect(databaseSnapshot(root)).toEqual(beforeReads);
	});
});
