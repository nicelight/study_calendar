import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { RequestEvent } from '@sveltejs/kit';
import { ProviderAdapterRegistry } from '../../src/lib/server/adapters';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { AuthenticationStateStore } from '../../src/lib/server/platform/auth-state';
import { FOUNDATION_SESSION_COOKIE } from '../../src/lib/server/platform/session-cookie';
import { createAuthenticationTransport } from '../../src/routes/auth/transport.server';
import { createPasswordLoginActions } from '../../src/routes/login/password-login.server';

type CookieOptions = Record<string, unknown>;

function cookieJar(initial: Record<string, string> = {}) {
	const values = new Map(Object.entries(initial));
	const writes: Array<{ name: string; value: string; options: CookieOptions }> = [];
	const deletions: Array<{ name: string; options: CookieOptions }> = [];
	return {
		cookies: {
			get: (name: string) => values.get(name),
			set: (name: string, value: string, options: CookieOptions) => {
				values.set(name, value);
				writes.push({ name, value, options });
			},
			delete: (name: string, options: CookieOptions) => {
				values.delete(name);
				deletions.push({ name, options });
			},
			getAll: () => [...values].map(([name, value]) => ({ name, value })),
			serialize: () => ''
		},
		writes,
		deletions
	};
}

function requestEvent(formData: FormData, cookies = cookieJar().cookies): RequestEvent {
	return {
		url: new URL('https://calendar.test/login'),
		request: new Request('https://calendar.test/login', { method: 'POST', body: formData }),
		cookies
	} as unknown as RequestEvent;
}

async function thrown(action: () => unknown | Promise<unknown>): Promise<any> {
	try {
		await action();
		throw new Error('expected SvelteKit redirect');
	} catch (cause) {
		return cause;
	}
}

function loginForm(email: string, password: string): FormData {
	const formData = new FormData();
	formData.set('email', email);
	formData.set('password', password);
	return formData;
}

describe('password login route', () => {
	let root: CompositionRoot;

	afterEach(() => root?.database.close());

	it('sets the existing cookie and redirects the password-authenticated Admin to /admin', async () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.identityAccess.bootstrapFirstAdmin({
			email: 'admin@example.com',
			password: 'task-030-test-password'
		});
		const jar = cookieJar();

		const controlFlow = await thrown(() =>
			createPasswordLoginActions(root.identityAccess).default(
				requestEvent(loginForm(' ADMIN@Example.com ', 'task-030-test-password'), jar.cookies)
			)
		);

		expect(controlFlow).toMatchObject({ status: 303, location: '/admin' });
		const cookie = jar.writes.find(({ name }) => name === FOUNDATION_SESSION_COOKIE);
		expect(cookie).toMatchObject({
			name: FOUNDATION_SESSION_COOKIE,
			options: { httpOnly: true, path: '/', sameSite: 'lax', secure: true }
		});
		const account = root.database.sqlite.prepare('SELECT id FROM accounts').get() as { id: string };
		expect(root.identityAccess.resolveActor(cookie?.value)).toEqual({
			accountId: account.id,
			role: 'admin'
		});

		const logout = await thrown(() =>
			createAuthenticationTransport({
				identityAccess: root.identityAccess,
				providers: new ProviderAdapterRegistry([]),
				stateStore: new AuthenticationStateStore()
			}).logout({
				url: new URL('https://calendar.test/auth/logout'),
				cookies: jar.cookies
			} as unknown as RequestEvent)
		);

		expect(logout).toMatchObject({ status: 303, location: '/login' });
		expect(jar.deletions).toContainEqual(expect.objectContaining({ name: FOUNDATION_SESSION_COOKIE }));
		expect(root.identityAccess.resolveActor(cookie?.value)).toBeNull();
	});

	it('returns one sessionless invalid-credentials action failure for unknown email and wrong password', async () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.identityAccess.bootstrapFirstAdmin({
			email: 'admin@example.com',
			password: 'task-030-test-password'
		});
		const action = createPasswordLoginActions(root.identityAccess).default;
		const unknownCookies = cookieJar();
		const wrongCookies = cookieJar();

		const unknown = await action(
			requestEvent(loginForm('unknown@example.com', 'task-030-test-password'), unknownCookies.cookies)
		);
		const wrong = await action(
			requestEvent(loginForm('admin@example.com', 'wrong-password'), wrongCookies.cookies)
		);

		expect(unknown).toEqual(wrong);
		expect(unknown).toEqual({ status: 401, data: { error: 'invalid_credentials' } });
		expect(unknownCookies.writes).toEqual([]);
		expect(wrongCookies.writes).toEqual([]);
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM sessions').get()).toEqual({ count: 0 });
	});

	it('keeps the SvelteKit password adapter free of credential and session persistence writes', () => {
		const routeSource = readFileSync('src/routes/login/password-login.server.ts', 'utf8');

		expect(routeSource).not.toMatch(/\.sqlite|password_credentials|INSERT INTO|UPDATE sessions/);
		expect(routeSource).toContain('identityAccess.authenticatePassword({ email, password })');
	});
});
