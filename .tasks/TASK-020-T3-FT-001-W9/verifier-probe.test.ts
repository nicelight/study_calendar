import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import {
	ProviderAdapterRegistry,
	type ProviderAdapter
} from '../../src/lib/server/adapters';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { AuthenticationStateStore } from '../../src/lib/server/platform/auth-state';
import {
	AuthenticationTransport,
	createAuthenticationTransport
} from '../../src/routes/auth/transport.server';

type CookieOptions = Record<string, unknown>;

function cookieJar() {
	const values = new Map<string, string>();
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

function event(url: string, params: Record<string, string>, cookies = cookieJar().cookies): RequestEvent {
	return {
		url: new URL(url),
		request: new Request(url),
		params,
		cookies
	} as unknown as RequestEvent;
}

async function thrown(action: () => unknown | Promise<unknown>): Promise<any> {
	try {
		await action();
		throw new Error('expected transport control-flow exception');
	} catch (cause) {
		return cause;
	}
}

function redirectLocation(controlFlow: any): string {
	expect(controlFlow).toMatchObject({ status: 303 });
	return controlFlow.location;
}

function seedAccount(root: CompositionRoot, accountId: string, role: 'teacher' | 'student' | 'parent') {
	root.database.sqlite.prepare('INSERT INTO accounts (id, role) VALUES (?, ?)').run(accountId, role);
}

function seedInvitation(root: CompositionRoot, token: string, accountId: string, expiresAt = '2099-01-01T00:00:00.000Z') {
	root.database.sqlite
		.prepare("INSERT INTO invitations (token, account_id, status, expires_at) VALUES (?, ?, 'pending', ?)")
		.run(token, accountId, expiresAt);
}

function providerDouble(provider: 'telegram' | 'google', subject: string, failure?: string): ProviderAdapter {
	return {
		provider,
		begin: ({ state }) => `https://provider.test/${provider}?state=${encodeURIComponent(state)}`,
		verifyCallback: vi.fn(async () => {
			if (failure) throw new Error(failure);
			return { provider, subject };
		})
	};
}

function transportFor(
	root: CompositionRoot,
	provider: 'telegram' | 'google',
	 subject: string,
	stateStore = new AuthenticationStateStore(),
	failure?: string
): AuthenticationTransport {
	return createAuthenticationTransport({
		identityAccess: root.identityAccess,
		providers: new ProviderAdapterRegistry([providerDouble(provider, subject, failure)]),
		stateStore
	});
}

function invitationState(
	stateStore: AuthenticationStateStore,
	provider: 'telegram' | 'google',
	token: string,
	protocol = 'https:'
): string {
	return stateStore.issue({
		provider,
		callbackUrl: `${protocol}//calendar.test/auth/${provider}/callback`,
		invitationToken: token
	});
}

describe('TASK-020 independent browser transport probe', () => {
	let root: CompositionRoot | undefined;

	afterEach(() => root?.database.close());

	it('completes both provider login paths, exact cookies, logout, and revocation', async () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });

		for (const [provider, protocol] of [['telegram', 'http:'], ['google', 'https:']] as const) {
			const accountId = `${provider}-login-account`;
			const subject = `${provider}-login-subject`;
			seedAccount(root, accountId, 'teacher');
			root.database.sqlite
				.prepare('INSERT INTO external_identities (provider, subject, account_id) VALUES (?, ?, ?)')
				.run(provider, subject, accountId);
			const transport = transportFor(root, provider, subject);
			const cookies = cookieJar();
			const start = await thrown(() => transport.start(event(`${protocol}//calendar.test/auth/${provider}/start`, { provider })));
			const state = new URL(redirectLocation(start)).searchParams.get('state');
			expect(state).toBeTruthy();
			const callback = await thrown(() => transport.callback(
				event(`${protocol}//calendar.test/auth/${provider}/callback?state=${encodeURIComponent(state!)}`, { provider }, cookies.cookies)
			));
			expect(redirectLocation(callback)).toBe('/');
			expect(cookies.writes).toEqual([{
				name: 'foundation_session',
				value: expect.any(String),
				options: { httpOnly: true, path: '/', sameSite: 'lax', secure: protocol === 'https:' }
			}]);
			const sessionToken = cookies.writes[0].value;
			expect(root.identityAccess.resolveActor(sessionToken)).toEqual({ accountId, role: 'teacher' });

			const logout = await thrown(() => transport.logout(event(`${protocol}//calendar.test/auth/logout`, {}, cookies.cookies)));
			expect(redirectLocation(logout)).toBe('/login');
			expect(cookies.deletions).toEqual([{
				name: 'foundation_session',
				options: { httpOnly: true, path: '/', sameSite: 'lax', secure: protocol === 'https:' }
			}]);
			expect(root.identityAccess.resolveActor(sessionToken)).toBeNull();
		}
	});

	it('preserves server-bound invitation state and accepts the exact account once for both providers', async () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });

		for (const [provider, protocol] of [['telegram', 'http:'], ['google', 'https:']] as const) {
			const accountId = `${provider}-invite-account`;
			const token = `${provider}-invite-token`;
			const subject = `${provider}-invite-subject`;
			seedAccount(root, accountId, 'parent');
			seedInvitation(root, token, accountId);
			const stateStore = new AuthenticationStateStore();
			const transport = transportFor(root, provider, subject, stateStore);
			const start = await thrown(() => transport.start(
				event(`${protocol}//calendar.test/auth/${provider}/start?invitation=${token}`, { provider })
			));
			const state = new URL(redirectLocation(start)).searchParams.get('state')!;
			const cookies = cookieJar();
			const callback = await thrown(() => transport.callback(
				event(`${protocol}//calendar.test/auth/${provider}/callback?state=${encodeURIComponent(state)}`, { provider }, cookies.cookies)
			));
			expect(redirectLocation(callback)).toBe('/');
			expect(root.database.sqlite.prepare('SELECT status FROM invitations WHERE token = ?').get(token)).toEqual({ status: 'consumed' });
			expect(root.database.sqlite.prepare('SELECT account_id FROM external_identities WHERE provider = ? AND subject = ?').get(provider, subject))
				.toEqual({ account_id: accountId });
			expect(root.identityAccess.resolveActor(cookies.writes[0].value)).toEqual({ accountId, role: 'parent' });
			expect(cookies.writes[0].options).toEqual({ httpOnly: true, path: '/', sameSite: 'lax', secure: protocol === 'https:' });

			const replay = await thrown(() => transport.callback(
				event(`${protocol}//calendar.test/auth/${provider}/callback?state=${encodeURIComponent(state)}`, { provider })
			));
			expect(replay).toMatchObject({ status: 400, body: { message: 'Invalid authentication state' } });
			expect(root.database.sqlite.prepare('SELECT status FROM invitations WHERE token = ?').get(token)).toEqual({ status: 'consumed' });
		}
	});

	it('rejects forged/tampered/mismatched/replayed/expired/wrong-account/failed callbacks without consuming valid invites', async () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		seedAccount(root, 'target', 'student');
		seedAccount(root, 'other', 'teacher');
		seedInvitation(root, 'pending', 'target');
		seedInvitation(root, 'expired', 'target', '2000-01-01T00:00:00.000Z');
		seedInvitation(root, 'revoked', 'target');
		root.database.sqlite.prepare("UPDATE invitations SET status = 'revoked' WHERE token = 'revoked'").run();
		seedInvitation(root, 'wrong-account', 'target');
		seedInvitation(root, 'duplicate', 'target');
		root.database.sqlite
			.prepare('INSERT INTO external_identities (provider, subject, account_id) VALUES (?, ?, ?)')
			.run('google', 'already-bound', 'other');
		const stateStore = new AuthenticationStateStore();
		const transport = transportFor(root, 'google', 'already-bound', stateStore);

		const validState = invitationState(stateStore, 'google', 'pending');
		for (const [provider, state] of [['google', `${validState}-tampered`], ['telegram', validState], ['google', 'forged-state']] as const) {
			const rejection = await thrown(() => transport.callback(
				event(`https://calendar.test/auth/${provider}/callback?state=${encodeURIComponent(state)}`, { provider })
			));
			expect(rejection).toMatchObject({ status: 400, body: { message: 'Invalid authentication state' } });
			expect(root.database.sqlite.prepare('SELECT status FROM invitations WHERE token = ?').get('pending')).toEqual({ status: 'pending' });
		}

		for (const token of ['expired', 'revoked']) {
			const state = invitationState(stateStore, 'google', token);
			const rejection = await thrown(() => transport.callback(
				event(`https://calendar.test/auth/google/callback?state=${encodeURIComponent(state)}`, { provider: 'google' })
			));
			expect(rejection).toMatchObject({ status: 410 });
			expect(root.database.sqlite.prepare('SELECT status FROM invitations WHERE token = ?').get(token)).toEqual({ status: token === 'revoked' ? 'revoked' : 'pending' });
		}

		for (const [token, expectedStatus] of [['wrong-account', 410], ['duplicate', 410]] as const) {
			const state = invitationState(stateStore, 'google', token);
			const rejection = await thrown(() => transport.callback(
				event(`https://calendar.test/auth/google/callback?state=${encodeURIComponent(state)}`, { provider: 'google' })
			));
			expect(rejection).toMatchObject({ status: expectedStatus });
			expect(root.database.sqlite.prepare('SELECT status FROM invitations WHERE token = ?').get(token)).toEqual({ status: 'pending' });
		}

		const outageState = invitationState(stateStore, 'google', 'pending');
		const outage = transportFor(root, 'google', 'new-subject', stateStore, 'google-provider-outage');
		const outageRejection = await thrown(() => outage.callback(
			event(`https://calendar.test/auth/google/callback?state=${encodeURIComponent(outageState)}`, { provider: 'google' })
		));
		expect(outageRejection).toMatchObject({ status: 502, body: { message: 'Authentication provider unavailable' } });
		expect(root.database.sqlite.prepare('SELECT status FROM invitations WHERE token = ?').get('pending')).toEqual({ status: 'pending' });

		seedInvitation(root, 'rollback', 'target');
		root.database.sqlite.exec(`
			CREATE TRIGGER fail_session_insert_review
			BEFORE INSERT ON sessions
			BEGIN
				SELECT RAISE(ABORT, 'induced-session-write-failure');
			END;
		`);
		const rollbackState = invitationState(stateStore, 'google', 'rollback');
		const rollbackTransport = transportFor(root, 'google', 'rollback-subject', stateStore);
		const rollback = await thrown(() => rollbackTransport.callback(
			event(`https://calendar.test/auth/google/callback?state=${encodeURIComponent(rollbackState)}`, { provider: 'google' })
		));
		expect(rollback).toMatchObject({ status: 500, body: { message: 'Authentication could not be completed' } });
		expect(root.database.sqlite.prepare('SELECT status FROM invitations WHERE token = ?').get('rollback')).toEqual({ status: 'pending' });
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM external_identities WHERE account_id = ?').get('target')).toEqual({ count: 0 });
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM sessions').get()).toEqual({ count: 0 });
	});
});
