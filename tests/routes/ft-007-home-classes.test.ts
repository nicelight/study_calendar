import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'svelte/server';

const routeRoot = vi.hoisted(() => ({ current: undefined as any }));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return {
		...actual,
		getCompositionRoot: () => routeRoot.current
	};
});

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

	const routePaths = {
		homeServer: resolve(process.cwd(), 'src/routes/home/+page.server.ts'),
		destinationServer: resolve(process.cwd(), 'src/routes/home/destination.server.ts'),
		destinationPage: resolve(process.cwd(), 'src/routes/home/DestinationPage.svelte'),
		homePage: resolve(process.cwd(), 'src/routes/home/+page.svelte'),
	classesServer: resolve(process.cwd(), 'src/routes/classes/+page.server.ts'),
	classesPage: resolve(process.cwd(), 'src/routes/classes/+page.svelte')
};

const stateTables = [
	'accounts',
	'sessions',
	'centers',
	'center_memberships',
	'classes',
	'teacher_assignments',
	'class_students',
	'parent_student_links'
] as const;

type RouteName = keyof typeof routePaths;
type SessionToken =
	| 'session-admin-own'
	| 'session-admin-other'
	| 'session-teacher-assigned'
	| 'session-teacher-removed'
	| 'session-student-own'
	| 'session-student-non-member'
	| 'session-parent-own'
	| 'session-revoked';

function requestEvent(
	root: CompositionRoot,
	sessionToken: SessionToken | undefined,
	route: 'home' | 'classes',
	classId?: string
): any {
	const url = new URL(`https://calendar.test/${route}`);
	if (classId) url.searchParams.set('classId', classId);
	return {
		url,
		params: {},
		request: new Request(url),
		cookies: {
			get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined)
		},
		locals: { actor: sessionToken ? root.identityAccess.resolveActor(sessionToken) : null }
	};
}

async function loadRoute(
	root: CompositionRoot,
	route: 'home' | 'classes',
	sessionToken: SessionToken | undefined,
	classId?: string
): Promise<any> {
	const module = route === 'home'
		? await import('../../src/routes/home/+page.server')
		: await import('../../src/routes/classes/+page.server');
	return module.load(requestEvent(root, sessionToken, route, classId));
}

async function renderRoute(route: 'home' | 'classes', data: any): Promise<string> {
	const module = route === 'home'
		? await import('../../src/routes/home/+page.svelte')
		: await import('../../src/routes/classes/+page.svelte');
	return render(module.default, { props: { data } } as any).body;
}

async function thrown(action: () => unknown | Promise<unknown>): Promise<any> {
	try {
		await action();
		throw new Error('expected a SvelteKit control-flow response');
	} catch (cause) {
		return cause;
	}
}

function snapshot(root: CompositionRoot): Record<(typeof stateTables)[number], unknown[]> {
	return Object.fromEntries(
		stateTables.map((table) => [table, root.database.sqlite.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()])
	) as Record<(typeof stateTables)[number], unknown[]>;
}

function seedRoot(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-own', 'Own Center'), ('center-other', 'Other Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-own', 'admin'),
			('admin-other', 'admin'),
			('teacher-assigned', 'teacher'),
			('teacher-removed', 'teacher'),
			('student-own', 'student'),
			('student-non-member', 'student'),
			('parent-own', 'parent'),
			('admin-revoked', 'admin');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-own', 'admin-own', NULL),
			('session-admin-other', 'admin-other', NULL),
			('session-teacher-assigned', 'teacher-assigned', NULL),
			('session-teacher-removed', 'teacher-removed', NULL),
			('session-student-own', 'student-own', NULL),
			('session-student-non-member', 'student-non-member', NULL),
			('session-parent-own', 'parent-own', NULL),
			('session-revoked', 'admin-revoked', '2026-08-22T06:00:00.000Z');
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-own', 'admin-own'),
			('center-other', 'admin-other'),
			('center-own', 'teacher-assigned'),
			('center-own', 'teacher-removed'),
			('center-own', 'student-own'),
			('center-own', 'student-non-member'),
			('center-own', 'parent-own'),
			('center-own', 'admin-revoked');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('class-own', 'center-own', 'Алгебра', 'group'),
			('class-second', 'center-own', 'Геометрия', 'individual'),
			('class-other', 'center-other', 'Геометрия', 'group');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id) VALUES
			('center-own', 'class-own', 'teacher-assigned'),
			('center-own', 'class-own', 'teacher-removed');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('center-own', 'class-own', 'student-own'),
			('center-own', 'class-second', 'student-own');
		INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id) VALUES
			('center-own', 'parent-own', 'student-own');
	`);
	return root;
}

describe('FT-007-AC-002 role-oriented Home and Classes', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = seedRoot();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
	root.database.close();
	});

	it.each(['home', 'classes'] as const)('proves Admin own-center destination on /%s', async (route) => {
		const data = await loadRoute(root, route, 'session-admin-own');
		const body = await renderRoute(route, data);

		expect(data).toMatchObject({ role: 'admin', destinations: [{ kind: 'center', centerId: 'center-own', href: '/admin/center-own' }] });
		expect(body).toContain('Own Center');
		expect(body).toContain('/admin/center-own');
		expect(body).not.toContain('Other Center');
	});

	it.each(['home', 'classes'] as const)('proves Teacher assigned-class destinations on /%s', async (route) => {
		const data = await loadRoute(root, route, 'session-teacher-assigned');
		const body = await renderRoute(route, data);

		expect(data).toMatchObject({ role: 'teacher', destinations: [{ kind: 'class', classId: 'class-own', centerId: 'center-own' }] });
		expect(body).toContain('Алгебра');
		expect(body).toContain('/center/center-own/class/class-own');
		expect(body).not.toContain('Геометрия');
	});

	it.each(['home', 'classes'] as const)('proves Student and Parent accessible-calendar destinations on /%s', async (route) => {
		for (const [sessionToken, role] of [
			['session-student-own', 'student'],
			['session-parent-own', 'parent']
		] as const) {
			const data = await loadRoute(root, route, sessionToken);
			const body = await renderRoute(route, data);

			expect(data).toMatchObject({
				role,
				destinations: [
					{ kind: 'calendar', classId: 'class-own', centerId: 'center-own', href: '/calendar?classId=class-own' },
					{ kind: 'calendar', classId: 'class-second', centerId: 'center-own', href: '/calendar?classId=class-second' }
				]
			});
			expect(body).toContain('Алгебра');
			expect(body).toContain('Геометрия');
			expect(body).toContain('/calendar?classId=class-own');
			expect(body).toContain('/calendar?classId=class-second');
			expect(body).not.toContain('student-own');

			const selected = await loadRoute(root, route, sessionToken, 'class-own');
			expect(selected.destinations).toEqual([
				expect.objectContaining({ kind: 'calendar', classId: 'class-own' })
			]);
		}
	});

	it.each(['home', 'classes'] as const)('denies anonymous and revoked requests before rendering /%s', async (route) => {
		const before = snapshot(root);
		for (const sessionToken of [undefined, 'session-revoked'] as const) {
			const rejected = await thrown(() => loadRoute(root, route, sessionToken));
			expect(rejected).toMatchObject({ status: 303, location: '/login' });
		}
		expect(snapshot(root)).toEqual(before);
	});

	it.each(['home', 'classes'] as const)('denies cross-center/class and non-member targets on /%s', async (route) => {
		const cases: [string, SessionToken, string][] = [
			['Admin cross-center class', 'session-admin-own', 'class-other'],
			['Student cross-center class', 'session-student-own', 'class-other'],
			['Parent cross-center class', 'session-parent-own', 'class-other'],
			['Student non-member class', 'session-student-non-member', 'class-own']
		];

		for (const [, sessionToken, classId] of cases) {
			const before = snapshot(root);
			const rejected = await thrown(() => loadRoute(root, route, sessionToken, classId));
			expect(rejected).toMatchObject({ status: 403, body: { message: 'Forbidden' } });
			expect(snapshot(root)).toEqual(before);
		}
	});

	it.each(['home', 'classes'] as const)('denies a removed Teacher assignment on the next /%s request', async (route) => {
		expect((await loadRoute(root, route, 'session-teacher-removed')).destinations).toHaveLength(1);
		root.database.sqlite
			.prepare('DELETE FROM teacher_assignments WHERE class_id = ? AND teacher_account_id = ?')
			.run('class-own', 'teacher-removed');
		const before = snapshot(root);
		const rejected = await thrown(() => loadRoute(root, route, 'session-teacher-removed'));
		expect(rejected).toMatchObject({ status: 403, body: { message: 'Forbidden' } });
		expect(snapshot(root)).toEqual(before);
	});

	it('keeps both adapters on existing server boundaries and destination owners', () => {
		if (!Object.values(routePaths).every((path) => existsSync(path))) {
			expect(Object.values(routePaths).every((path) => existsSync(path))).toBe(true);
			return;
		}

		const serverSources = [routePaths.homeServer, routePaths.destinationServer, routePaths.classesServer].map((path) => readFileSync(path, 'utf8'));
		const pageSources = [routePaths.homePage, routePaths.destinationPage, routePaths.classesPage].map((path) => readFileSync(path, 'utf8'));
		const boundarySource = serverSources.join('\n');
		expect(boundarySource).toContain('event.locals.actor');
		expect(boundarySource).toContain('getAccessibleClassList');
		expect(boundarySource).toContain('getRegistryFacts');
		expect(boundarySource).not.toContain('getAuthorizedClassScope');
		for (const source of serverSources) {
			expect(source).not.toContain('platform/database');
			expect(source).not.toContain('.sqlite');
		}
		for (const source of pageSources) {
			expect(source).not.toContain('$lib/server');
		}
		expect(pageSources[0]).toContain('DestinationPage');
		expect(pageSources[2]).toContain('DestinationPage');
		expect(pageSources[1]).toContain('href={destination.href}');
	});
});
