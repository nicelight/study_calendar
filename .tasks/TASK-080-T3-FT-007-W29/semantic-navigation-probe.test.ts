import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const routeRoot = vi.hoisted(() => ({ current: undefined as CompositionRoot | undefined }));

vi.mock('$lib/server/composition-root', async (importOriginal) => ({
	...(await importOriginal()),
	getCompositionRoot: () => routeRoot.current
}));

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

type Route = 'home' | 'classes';

function requestEvent(root: CompositionRoot, route: Route, sessionToken: string, classId?: string): any {
	const url = new URL(`https://calendar.test/${route}`);
	if (classId) url.searchParams.set('classId', classId);
	return {
		url,
		params: {},
		request: new Request(url),
		cookies: {
			get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined)
		},
		locals: { actor: root.identityAccess.resolveActor(sessionToken) }
	};
}

async function loadRoute(root: CompositionRoot, route: Route, sessionToken: string, classId?: string): Promise<unknown> {
	const module = route === 'home'
		? await import('../../src/routes/home/+page.server')
		: await import('../../src/routes/classes/+page.server');
	return module.load(requestEvent(root, route, sessionToken, classId));
}

async function controlResponse(action: () => unknown | Promise<unknown>): Promise<any> {
	try {
		await action();
		return null;
	} catch (cause) {
		return cause;
	}
}

describe('TASK-080 fresh semantic navigation probe', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		routeRoot.current = root;
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES ('center-own', 'Own Center');
			INSERT INTO accounts (id, role) VALUES
				('student-own', 'student'), ('parent-own', 'parent');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('student-session', 'student-own', NULL), ('parent-session', 'parent-own', NULL);
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('center-own', 'student-own'), ('center-own', 'parent-own');
			INSERT INTO classes (id, center_id, name, mode) VALUES
				('class-own', 'center-own', 'Алгебра', 'group');
			INSERT INTO class_students (center_id, class_id, student_account_id)
				VALUES ('center-own', 'class-own', 'student-own');
			INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id)
				VALUES ('center-own', 'parent-own', 'student-own');
		`);
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it.each([
		['student', 'student-session'],
		['parent', 'parent-session']
	] as const)('observes %s denial on bare /home and /classes despite an authorized class', async (_role, sessionToken) => {
		for (const route of ['home', 'classes'] as const) {
			const authorized = await loadRoute(root, route, sessionToken, 'class-own');
			expect(authorized).toMatchObject({
				destinations: [{ kind: 'calendar', classId: 'class-own', href: '/calendar?classId=class-own' }]
			});

			const rejected = await controlResponse(() => loadRoute(root, route, sessionToken));
			expect(rejected).toMatchObject({ status: 403, body: { message: 'Forbidden' } });
		}
	});
});
