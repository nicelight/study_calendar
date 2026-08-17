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
import ClassEntryPage from '../../src/routes/center/[centerId]/class/[classId]/+page.svelte';
import {
	load,
	type ClassEntryPageData
} from '../../src/routes/center/[centerId]/class/[classId]/+page.server';

const serverPath = resolve(
	process.cwd(),
	'src/routes/center/[centerId]/class/[classId]/+page.server.ts'
);
const componentPath = resolve(
	process.cwd(),
	'src/routes/center/[centerId]/class/[classId]/+page.svelte'
);
const stateTables = [
	'accounts',
	'sessions',
	'centers',
	'center_memberships',
	'classes',
	'teacher_assignments',
	'class_students',
	'parent_student_links',
	'schedules',
	'lessons'
] as const;

type SessionFixture =
	| 'session-admin-own'
	| 'session-admin-other'
	| 'session-teacher-assigned'
	| 'session-teacher-unassigned'
	| 'session-teacher-removed'
	| 'session-student-own'
	| 'session-student-non-member'
	| 'session-parent-own';

function requestEvent(
	root: CompositionRoot,
	sessionToken: SessionFixture | undefined,
	centerId = 'center-own',
	classId = 'class-own'
): Parameters<typeof load>[0] {
	return {
		url: new URL(`https://calendar.test/center/${centerId}/class/${classId}`),
		params: { centerId, classId },
		request: new Request(`https://calendar.test/center/${centerId}/class/${classId}`),
		cookies: {
			get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined)
		},
		locals: { actor: sessionToken ? root.identityAccess.resolveActor(sessionToken) : null }
	} as Parameters<typeof load>[0];
}

function snapshot(root: CompositionRoot): Record<(typeof stateTables)[number], unknown[]> {
	return Object.fromEntries(
		stateTables.map((table) => [
			table,
			root.database.sqlite.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()
		])
	) as Record<(typeof stateTables)[number], unknown[]>;
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
			('session-parent-own', 'parent-own', NULL);
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
	`);
	return root;
}

describe('FT-002-AC-011 protected class entry shell', () => {
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
	] as const)('actual SvelteKit load returns only matching class context for %s', (sessionToken, role) => {
		const before = snapshot(root);
		const data = load(requestEvent(root, sessionToken));
		const response = { status: 200, body: render(ClassEntryPage, { props: { data } } as any).body };

		expect(data).toEqual<ClassEntryPageData>({
			centerId: 'center-own',
			classId: 'class-own',
			className: 'Алгебра',
			mode: 'group',
			role
		});
		expect(response.status).toBe(200);
		expect(response.body).toContain('data-center-id="center-own"');
		expect(response.body).toContain('data-class-id="class-own"');
		expect(response.body).toContain(`data-role="${role}"`);
		expect(response.body).toContain('Алгебра');
		expect(response.body).toContain('href="/calendar?classId=class-own"');
		expect(response.body).not.toContain('student-own');
		expect(snapshot(root)).toEqual(before);
	});

	it('redirects an unauthenticated HTTP request before any protected data can render', async () => {
		const before = snapshot(root);
		const rejected = await thrown(() => load(requestEvent(root, undefined)));

		expect(rejected).toMatchObject({ status: 303, location: '/login' });
		expect(snapshot(root)).toEqual(before);
	});

	it.each([
		['mismatched center path', 'session-admin-own', 'center-other', 'class-own'],
		['cross-center Admin', 'session-admin-other', 'center-own', 'class-own'],
		['unassigned Teacher', 'session-teacher-unassigned', 'center-own', 'class-own'],
		['non-member Student', 'session-student-non-member', 'center-own', 'class-own']
	] as const)('%s receives a 403 before the protected shell is rendered', async (_, sessionToken, centerId, classId) => {
		const before = snapshot(root);
		const rejected = await thrown(() => load(requestEvent(root, sessionToken, centerId, classId)));

		expect(rejected).toMatchObject({ status: 403, body: { message: 'Forbidden' } });
		expect(snapshot(root)).toEqual(before);
	});

	it('denies a Teacher immediately after assignment removal without changing the read state', async () => {
		expect(load(requestEvent(root, 'session-teacher-removed'))).toMatchObject({
			role: 'teacher',
			classId: 'class-own'
		});
		root.database.sqlite
			.prepare('DELETE FROM teacher_assignments WHERE class_id = ? AND teacher_account_id = ?')
			.run('class-own', 'teacher-removed');
		const afterRemoval = snapshot(root);

		const rejected = await thrown(() => load(requestEvent(root, 'session-teacher-removed')));
		expect(rejected).toMatchObject({ status: 403, body: { message: 'Forbidden' } });
		expect(snapshot(root)).toEqual(afterRemoval);
	});

	it('keeps authorization in Actor Context and AuthorizedClassScope, not the route component', () => {
		const server = readFileSync(serverPath, 'utf8');
		const component = readFileSync(componentPath, 'utf8');

		expect(server).toContain('export const load: PageServerLoad');
		expect(server).toContain('_createClassEntryPageLoad()(event)');
		expect(server).toContain('event.locals.actor');
		expect(server).toContain('getAuthorizedClassScope');
		expect(server).toContain('scope.centerId !== centerId');
		expect(server).toContain('scope.classId !== classId');
		expect(server).not.toContain('platform/database');
		expect(server).not.toContain('.sqlite');
		expect(component).not.toContain('$lib/server');
		expect(component).not.toContain('getAuthorizedClassScope');
		expect(component).not.toContain('studentAccountIds');
		expect(component).not.toContain('lesson-context');
		expect(component).toContain('/calendar?classId=');
	});
});
