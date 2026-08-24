import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const routeRoot = vi.hoisted(() => ({ current: undefined as CompositionRoot | undefined }));

vi.mock('$lib/server/composition-root', async (importOriginal) => ({
	...(await importOriginal()),
	getCompositionRoot: () => routeRoot.current
}));

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

type Route = 'home' | 'classes';
type Session =
	| 'session-admin-own'
	| 'session-admin-other'
	| 'session-teacher-assigned'
	| 'session-teacher-removed'
	| 'session-student-own'
	| 'session-student-empty'
	| 'session-parent-own'
	| 'session-parent-empty'
	| 'session-revoked';

const allStateTables = [
	'accounts',
	'sessions',
	'centers',
	'center_memberships',
	'classes',
	'teacher_assignments',
	'class_students',
	'parent_student_links'
] as const;

function requestEvent(root: CompositionRoot, route: Route, sessionToken?: Session, classId?: string): any {
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
	route: Route,
	sessionToken?: Session,
	classId?: string
): Promise<any> {
	const module = route === 'home'
		? await import('../../src/routes/home/+page.server')
		: await import('../../src/routes/classes/+page.server');
	return module.load(requestEvent(root, route, sessionToken, classId));
}

async function rejected(action: () => unknown | Promise<unknown>): Promise<any> {
	try {
		await action();
		return null;
	} catch (cause) {
		return cause;
	}
}

function snapshot(root: CompositionRoot): Record<string, unknown[]> {
	return Object.fromEntries(
		allStateTables.map((table) => [table, root.database.sqlite.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()])
	);
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
			('student-empty', 'student'),
			('parent-own', 'parent'),
			('parent-empty', 'parent'),
			('revoked-admin', 'admin');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-own', 'admin-own', NULL),
			('session-admin-other', 'admin-other', NULL),
			('session-teacher-assigned', 'teacher-assigned', NULL),
			('session-teacher-removed', 'teacher-removed', NULL),
			('session-student-own', 'student-own', NULL),
			('session-student-empty', 'student-empty', NULL),
			('session-parent-own', 'parent-own', NULL),
			('session-parent-empty', 'parent-empty', NULL),
			('session-revoked', 'revoked-admin', '2026-08-22T06:00:00.000Z');
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-own', 'admin-own'),
			('center-other', 'admin-other'),
			('center-own', 'teacher-assigned'),
			('center-own', 'teacher-removed'),
			('center-own', 'student-own'),
			('center-own', 'student-empty'),
			('center-own', 'parent-own'),
			('center-own', 'parent-empty'),
			('center-own', 'revoked-admin');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('class-alpha', 'center-own', 'Алгебра', 'group'),
			('class-beta', 'center-own', 'Геометрия', 'individual'),
			('class-other', 'center-other', 'Другая геометрия', 'group');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id) VALUES
			('center-own', 'class-alpha', 'teacher-assigned'),
			('center-own', 'class-alpha', 'teacher-removed');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('center-own', 'class-alpha', 'student-own'),
			('center-own', 'class-beta', 'student-own');
		INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id)
			VALUES ('center-own', 'parent-own', 'student-own');
	`);
	return root;
}

describe('TASK-080 fresh verifier-owned Attempt 2 functional proof', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = seedRoot();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
	root.database.close();
	});

	it('gets the complete Student/Parent class list from C&S and exposes only C&S facts', () => {
		const student = root.identityAccess.resolveActor('session-student-own');
		const parent = root.identityAccess.resolveActor('session-parent-own');
		const teacher = root.identityAccess.resolveActor('session-teacher-assigned');
		const before = snapshot(root);

		expect(root.centerScheduling.getAccessibleClassList({ actor: student })).toEqual([
			{ classId: 'class-alpha', centerId: 'center-own', name: 'Алгебра', mode: 'group' },
			{ classId: 'class-beta', centerId: 'center-own', name: 'Геометрия', mode: 'individual' }
		]);
		expect(root.centerScheduling.getAccessibleClassList({ actor: parent })).toEqual([
			{ classId: 'class-alpha', centerId: 'center-own', name: 'Алгебра', mode: 'group' },
			{ classId: 'class-beta', centerId: 'center-own', name: 'Геометрия', mode: 'individual' }
		]);
		for (const actor of [student, parent]) {
			const list = root.centerScheduling.getAccessibleClassList({ actor });
			for (const item of list ?? []) expect(Object.keys(item).sort()).toEqual(['centerId', 'classId', 'mode', 'name']);
		}
		expect(root.centerScheduling.getAccessibleClassList({ actor: null })).toBeNull();
		expect(root.centerScheduling.getAccessibleClassList({ actor: teacher })).toBeNull();
		expect(root.centerScheduling.getAccessibleClassList({ actor: root.identityAccess.resolveActor('session-student-empty') })).toBeNull();
		expect(root.centerScheduling.getAccessibleClassList({ actor: root.identityAccess.resolveActor('session-parent-empty') })).toBeNull();
		expect(snapshot(root)).toEqual(before);
	});

	it.each(['home', 'classes'] as const)('renders complete bare destinations and only post-filters for /%s', async (route) => {
		const before = snapshot(root);
		const admin = await loadRoute(root, route, 'session-admin-own');
		expect(admin).toMatchObject({ role: 'admin', destinations: [{ kind: 'center', centerId: 'center-own', href: '/admin/center-own' }] });

		const teacher = await loadRoute(root, route, 'session-teacher-assigned');
		expect(teacher).toMatchObject({
			role: 'teacher',
			destinations: [{ kind: 'class', classId: 'class-alpha', centerId: 'center-own', href: '/center/center-own/class/class-alpha' }]
		});

		for (const [session, role] of [['session-student-own', 'student'], ['session-parent-own', 'parent']] as const) {
			const bare = await loadRoute(root, route, session);
			expect(bare).toMatchObject({
				role,
				destinations: [
					{ kind: 'calendar', classId: 'class-alpha', href: '/calendar?classId=class-alpha' },
					{ kind: 'calendar', classId: 'class-beta', href: '/calendar?classId=class-beta' }
				]
			});
			const selected = await loadRoute(root, route, session, 'class-beta');
			expect(selected.destinations).toEqual([expect.objectContaining({ kind: 'calendar', classId: 'class-beta' })]);
		}
		expect(snapshot(root)).toEqual(before);
	});

	it.each(['home', 'classes'] as const)('denies anonymous, empty-scope, cross-scope, and removed-assignment access on /%s', async (route) => {
		const before = snapshot(root);
		for (const session of [undefined, 'session-revoked'] as const) {
			expect(await rejected(() => loadRoute(root, route, session))).toMatchObject({ status: 303, location: '/login' });
		}
		for (const [session, classId] of [
			['session-student-empty', 'class-alpha'],
			['session-parent-empty', 'class-alpha'],
			['session-student-own', 'class-other'],
			['session-parent-own', 'class-other'],
			['session-admin-own', 'class-other'],
			['session-teacher-assigned', 'class-beta']
		] as const) {
			expect(await rejected(() => loadRoute(root, route, session, classId))).toMatchObject({ status: 403, body: { message: 'Forbidden' } });
		}
		expect(snapshot(root)).toEqual(before);

		expect((await loadRoute(root, route, 'session-teacher-removed')).destinations).toHaveLength(1);
		root.database.sqlite
			.prepare('DELETE FROM teacher_assignments WHERE class_id = ? AND teacher_account_id = ?')
			.run('class-alpha', 'teacher-removed');
		const afterRemoval = snapshot(root);
		expect(await rejected(() => loadRoute(root, route, 'session-teacher-removed'))).toMatchObject({ status: 403, body: { message: 'Forbidden' } });
		expect(snapshot(root)).toEqual(afterRemoval);
	});

	it('keeps route adapters on C&S boundaries and existing destination owners', () => {
		const serverSources = [
			'src/routes/home/+page.server.ts',
			'src/routes/home/destination.server.ts',
			'src/routes/classes/+page.server.ts'
		].map((path) => readFileSync(resolve(process.cwd(), path), 'utf8'));
		const pageSources = [
			'src/routes/home/+page.svelte',
			'src/routes/home/DestinationPage.svelte',
			'src/routes/classes/+page.svelte'
		].map((path) => readFileSync(resolve(process.cwd(), path), 'utf8'));
		const serverSource = serverSources.join('\n');
		expect(serverSource).toContain('event.locals.actor');
		expect(serverSource).toContain('getAccessibleClassList');
		expect(serverSource).toContain('getRegistryFacts');
		expect(serverSource).not.toContain('platform/database');
		expect(serverSource).not.toContain('.sqlite');
		expect(serverSource).not.toContain('getAuthorizedClassScope');
		expect(pageSources.join('\n')).not.toContain('$lib/server');
		expect(readFileSync(resolve(process.cwd(), 'src/routes/home/DestinationPage.svelte'), 'utf8')).toContain('href={destination.href}');
		expect(existsSync(resolve(process.cwd(), 'src/routes/calendar/+page.server.ts'))).toBe(true);
		expect(existsSync(resolve(process.cwd(), 'src/routes/center/[centerId]/class/[classId]/+page.server.ts'))).toBe(true);
	});
});
