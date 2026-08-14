import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { ProviderAdapterRegistry, type ProviderAdapter } from '../../src/lib/server/adapters';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { AuthenticationStateStore } from '../../src/lib/server/platform/auth-state';
import { createAdminCenterActions, createAdminCenterPageLoad } from '../../src/routes/admin/center-page.server';
import { createAuthenticationTransport } from '../../src/routes/auth/transport.server';

function cookieJar(initial: Record<string, string> = {}) {
	const values = new Map(Object.entries(initial));
	const writes: Array<{ name: string; value: string }> = [];
	return {
		cookies: {
			get: (name: string) => values.get(name),
			set: (name: string, value: string) => {
				values.set(name, value);
				writes.push({ name, value });
			},
			delete: (name: string) => values.delete(name),
			getAll: () => [...values].map(([name, value]) => ({ name, value })),
			serialize: () => ''
		},
		writes
	};
}

function event(
	url: string,
	root: CompositionRoot,
	sessionToken?: string,
	request = new Request(url)
): RequestEvent {
	return {
		url: new URL(url),
		params: {},
		request,
		cookies: cookieJar(sessionToken ? { foundation_session: sessionToken } : {}).cookies,
		locals: { actor: root.identityAccess.resolveActor(sessionToken) }
	} as unknown as RequestEvent;
}

function formRequest(url: string, fields: Record<string, string>): Request {
	return new Request(url, {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams(fields)
	});
}

async function thrown(action: () => unknown | Promise<unknown>): Promise<any> {
	try {
		await action();
		throw new Error('expected control-flow exception');
	} catch (cause) {
		return cause;
	}
}

function googleProvider(subject: string): ProviderAdapter {
	return {
		provider: 'google',
		begin: ({ state }) => `https://provider.test/google?state=${encodeURIComponent(state)}`,
		verifyCallback: vi.fn(async () => ({ provider: 'google' as const, subject }))
	};
}

describe('bootstrap Admin center entry', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO accounts (id, role) VALUES
				('bootstrap-admin', 'admin'),
				('member-admin', 'admin'),
				('teacher', 'teacher');
			INSERT INTO external_identities (provider, subject, account_id)
				VALUES ('google', 'bootstrap-google-sub', 'bootstrap-admin');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('member-admin-session', 'member-admin', NULL),
				('teacher-session', 'teacher', NULL);
			INSERT INTO centers (id, name) VALUES ('existing-center', 'Existing Center');
			INSERT INTO center_memberships (center_id, account_id)
				VALUES ('existing-center', 'member-admin');
		`);
	});

	afterEach(() => root.database.close());

	it('authenticates a manually bound Admin and creates one center from the expected form', async () => {
		const browser = cookieJar();
		const auth = createAuthenticationTransport({
			identityAccess: root.identityAccess,
			providers: new ProviderAdapterRegistry([googleProvider('bootstrap-google-sub')]),
			stateStore: new AuthenticationStateStore({
				stateFactory: () => 'bootstrap-state',
				bindingFactory: () => 'bootstrap-binding'
			})
		});
		const start = await thrown(() =>
			auth.start({
				...event('https://calendar.test/auth/google/start', root),
				params: { provider: 'google' },
				cookies: browser.cookies
			} as RequestEvent)
		);
		const state = new URL(start.location).searchParams.get('state')!;
		const callback = await thrown(() =>
			auth.callback({
				...event(`https://calendar.test/auth/google/callback?state=${state}`, root),
				params: { provider: 'google' },
				cookies: browser.cookies
			} as RequestEvent)
		);
		expect(callback).toMatchObject({ status: 303, location: '/admin' });
		const sessionToken = browser.writes.find(({ name }) => name === 'foundation_session')!.value;

		const load = createAdminCenterPageLoad(root.centerScheduling);
		expect(load(event('https://calendar.test/admin', root, sessionToken))).toEqual({ mode: 'bootstrap' });

		const actions = createAdminCenterActions(root.centerScheduling);
		const created = await thrown(() =>
			actions.default(
				event(
					'https://calendar.test/admin',
					root,
					sessionToken,
					formRequest('https://calendar.test/admin', {
						name: '  Центр Альфа  '
					})
				)
			)
		);
		expect(created).toMatchObject({ status: 303 });
		const centerId = created.location.split('/')[2];
		expect(created.location).toBe(`/admin/${centerId}`);
		expect(root.database.sqlite.prepare('SELECT id, name FROM centers WHERE id = ?').get(centerId))
			.toEqual({ id: centerId, name: 'Центр Альфа' });
		expect(root.database.sqlite.prepare(
			'SELECT center_id, account_id FROM center_memberships WHERE account_id = ?'
		).get('bootstrap-admin')).toEqual({ center_id: centerId, account_id: 'bootstrap-admin' });

		const repeated = await actions.default(
			event(
				'https://calendar.test/admin',
				root,
				sessionToken,
				formRequest('https://calendar.test/admin', { name: 'Second Center' })
			)
		);
		expect(repeated).toMatchObject({ status: 409, data: { error: 'center_already_created' } });
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM centers').get()).toEqual({ count: 2 });
	});

	it('rejects submitted center or role authority fields before calling the bootstrap command', async () => {
		const sessionToken = root.identityAccess.authenticateVerifiedIdentity({
			provider: 'google',
			subject: 'bootstrap-google-sub'
		});
		const createBootstrapCenter = vi.spyOn(root.centerScheduling, 'createBootstrapCenter');
		const actions = createAdminCenterActions(root.centerScheduling);
		const forgedRequests: Array<Record<string, string>> = [
			{ name: 'Forged Center', centerId: 'forged-center' },
			{ name: 'Forged Role', role: 'admin' },
			{ name: 'Forged Both', centerId: 'forged-center', role: 'admin' },
			{ name: 'Forged Account', accountId: 'forged-admin' }
		];

		for (const fields of forgedRequests) {
			const before = root.database.sqlite.prepare(`
				SELECT
					(SELECT COUNT(*) FROM centers) AS centers,
					(SELECT COUNT(*) FROM center_memberships) AS memberships
			`).get();
			const result = await actions.default(
				event(
					'https://calendar.test/admin',
					root,
					sessionToken,
					formRequest('https://calendar.test/admin', fields)
				)
			);

			expect(result).toMatchObject({ status: 400, data: { error: 'invalid_request' } });
			expect(root.database.sqlite.prepare(`
				SELECT
					(SELECT COUNT(*) FROM centers) AS centers,
					(SELECT COUNT(*) FROM center_memberships) AS memberships
			`).get()).toEqual(before);
		}
		expect(createBootstrapCenter).not.toHaveBeenCalled();
	});

	it('rolls back center creation when membership persistence fails', () => {
		root.database.sqlite
			.prepare("INSERT INTO sessions (token, account_id, revoked_at) VALUES ('bootstrap-session', 'bootstrap-admin', NULL)")
			.run();
		root.database.sqlite.exec(`
			CREATE TRIGGER fail_bootstrap_membership
			BEFORE INSERT ON center_memberships
			WHEN NEW.account_id = 'bootstrap-admin'
			BEGIN
				SELECT RAISE(ABORT, 'induced-membership-failure');
			END;
		`);
		const centersBefore = root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM centers').get();
		const membershipsBefore = root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM center_memberships').get();

		expect(() => root.centerScheduling.createBootstrapCenter({
			sessionToken: 'bootstrap-session',
			name: 'Rollback Center'
		})).toThrow('induced-membership-failure');
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM centers').get()).toEqual(centersBefore);
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM center_memberships').get())
			.toEqual(membershipsBefore);
	});

	it('routes an existing member Admin and rejects unauthenticated or non-Admin entry without mutation', async () => {
		const load = createAdminCenterPageLoad(root.centerScheduling);
		const unauthenticated = await thrown(() => load(event('https://calendar.test/admin', root)));
		expect(unauthenticated).toMatchObject({ status: 303, location: '/login' });
		const teacher = await thrown(() =>
			load(event('https://calendar.test/admin', root, 'teacher-session'))
		);
		expect(teacher).toMatchObject({ status: 403, body: { message: 'Forbidden' } });
		const memberAdmin = await thrown(() =>
			load(event('https://calendar.test/admin', root, 'member-admin-session'))
		);
		expect(memberAdmin).toMatchObject({
			status: 303,
			location: '/admin/existing-center'
		});

		const before = root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM centers').get();
		const result = await createAdminCenterActions(root.centerScheduling).default(
			event(
				'https://calendar.test/admin',
				root,
				'teacher-session',
				formRequest('https://calendar.test/admin', { name: 'Forged Teacher Center' })
			)
		);
		expect(result).toMatchObject({ status: 403, data: { error: 'forbidden' } });
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM centers').get()).toEqual(before);
	});

	it('keeps route adapters free of direct persistence and role or center authority', () => {
		for (const file of [
			'src/routes/admin/center-page.server.ts',
			'src/routes/admin/+page.server.ts'
		]) {
			const source = readFileSync(file, 'utf8');
			expect(source).not.toMatch(/sqlite|prepare|INSERT INTO|UPDATE |DELETE FROM/);
			expect(source).not.toMatch(/formData\.get\(['"](?:role|centerId|accountId)['"]\)/);
		}
	});
});
