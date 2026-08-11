import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import {
	ProviderAdapterRegistry,
	type ProviderAdapter
} from '../../src/lib/server/adapters';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { AuthenticationStateStore } from '../../src/lib/server/platform/auth-state';
import { AUTHENTICATION_BINDING_COOKIE } from '../../src/lib/server/platform/session-cookie';
import { createAuthenticationTransport } from '../../src/routes/auth/transport.server';

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

function requestEvent(url: string, params: Record<string, string>, cookies = cookieJar().cookies): RequestEvent {
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

function productState(root: CompositionRoot) {
	return {
		accounts: root.database.sqlite.prepare('SELECT id, role FROM accounts ORDER BY id').all(),
		invitations: root.database.sqlite
			.prepare('SELECT token, account_id, status, expires_at FROM invitations ORDER BY token')
			.all(),
		identities: root.database.sqlite
			.prepare('SELECT provider, subject, account_id FROM external_identities ORDER BY provider, subject')
			.all(),
		sessions: root.database.sqlite
			.prepare('SELECT token, account_id, revoked_at FROM sessions ORDER BY token')
			.all()
	};
}

function seedAccount(root: CompositionRoot, accountId: string, role: 'teacher' | 'parent') {
	root.database.sqlite.prepare('INSERT INTO accounts (id, role) VALUES (?, ?)').run(accountId, role);
}

function seedInvitation(root: CompositionRoot, token: string, accountId: string) {
	root.database.sqlite
		.prepare("INSERT INTO invitations (token, account_id, status, expires_at) VALUES (?, ?, 'pending', ?)")
		.run(token, accountId, '2099-01-01T00:00:00.000Z');
}

describe('TASK-023 verifier-owned bounded retention and failed-start probe', () => {
	let root: CompositionRoot | undefined;

	afterEach(() => root?.database.close());

	it('removes every expired record during issue while preserving all valid siblings', () => {
		let currentTime = new Date('2026-08-11T00:00:00.000Z');
		const states = ['expired-a', 'expired-b', 'sibling', 'expired-a', 'expired-b'];
		const bindings = ['binding-a', 'binding-b', 'binding-sibling', 'replacement-a', 'replacement-b'];
		const store = new AuthenticationStateStore({
			now: () => currentTime,
			ttlMs: 1_000,
			stateFactory: () => states.shift()!,
			bindingFactory: () => bindings.shift()!
		});
		const callbackUrl = 'https://calendar.test/auth/google/callback';
		const expiredA = store.issue({ provider: 'google', callbackUrl });
		const expiredB = store.issue({ provider: 'google', callbackUrl });
		currentTime = new Date('2026-08-11T00:00:00.500Z');
		const sibling = store.issue({ provider: 'google', callbackUrl });

		currentTime = new Date('2026-08-11T00:00:01.001Z');
		const replacementA = store.issue({ provider: 'google', callbackUrl });
		const replacementB = store.issue({ provider: 'google', callbackUrl });

		expect(replacementA.state).toBe(expiredA.state);
		expect(replacementB.state).toBe(expiredB.state);
		expect(store.consume({ ...sibling, provider: 'google', callbackUrl })).toEqual({
			provider: 'google',
			callbackUrl
		});
		expect(store.consume({ ...replacementA, provider: 'google', callbackUrl })).toEqual({
			provider: 'google',
			callbackUrl
		});
		expect(store.consume({ ...replacementB, provider: 'google', callbackUrl })).toEqual({
			provider: 'google',
			callbackUrl
		});
	});

	it('removes expired records during consume while retaining a later valid sibling', () => {
		let currentTime = new Date('2026-08-11T00:00:00.000Z');
		const store = new AuthenticationStateStore({
			now: () => currentTime,
			ttlMs: 1_000,
			stateFactory: (() => {
				const values = ['expired', 'sibling'];
				return () => values.shift()!;
			})(),
			bindingFactory: (() => {
				const values = ['expired-binding', 'sibling-binding'];
				return () => values.shift()!;
			})()
		});
		const callbackUrl = 'https://calendar.test/auth/telegram/callback';
		const expired = store.issue({ provider: 'telegram', callbackUrl });
		currentTime = new Date('2026-08-11T00:00:00.500Z');
		const sibling = store.issue({ provider: 'telegram', callbackUrl });
		currentTime = new Date('2026-08-11T00:00:01.001Z');

		expect(() => store.consume({ ...expired, provider: 'telegram', callbackUrl })).toThrow('invalid-auth-state');
		expect(store.consume({ ...sibling, provider: 'telegram', callbackUrl })).toEqual({
			provider: 'telegram',
			callbackUrl
		});
	});

	it('discards only a failed invitation start, preserves product state, and keeps a sibling login usable', async () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		seedAccount(root, 'sibling-account', 'teacher');
		root.database.sqlite
			.prepare('INSERT INTO external_identities (provider, subject, account_id) VALUES (?, ?, ?)')
			.run('telegram', 'sibling-subject', 'sibling-account');
		seedAccount(root, 'invite-account', 'parent');
		seedInvitation(root, 'failed-invite', 'invite-account');

		const stateValues = ['sibling-state', 'failed-state'];
		const bindingValues = ['sibling-binding', 'failed-binding'];
		let failedBeginState: string | undefined;
		let failedBeginCalls = 0;
		let siblingVerifyCalls = 0;
		const store = new AuthenticationStateStore({
			stateFactory: () => stateValues.shift()!,
			bindingFactory: () => bindingValues.shift()!
		});
		const providers = new ProviderAdapterRegistry([
			{
				provider: 'telegram',
				begin: ({ state }) => `https://provider.test/telegram?state=${encodeURIComponent(state)}`,
				verifyCallback: async () => {
					siblingVerifyCalls += 1;
					return { provider: 'telegram' as const, subject: 'sibling-subject' };
				}
			} satisfies ProviderAdapter,
			{
				provider: 'google',
				begin: ({ state }) => {
					failedBeginCalls += 1;
					failedBeginState = state;
					throw new Error('google-provider-outage');
				},
				verifyCallback: async () => ({ provider: 'google' as const, subject: 'unused' })
			} satisfies ProviderAdapter
		]);
		const transport = createAuthenticationTransport({
			identityAccess: root.identityAccess,
			providers,
			stateStore: store
		});
		const siblingBrowser = cookieJar();
		const siblingStart = await thrown(() => transport.start(
			requestEvent('https://calendar.test/auth/telegram/start', { provider: 'telegram' }, siblingBrowser.cookies)
		));
		const siblingState = new URL(redirectLocation(siblingStart)).searchParams.get('state')!;
		const beforeFailedStart = productState(root);

		const failedBrowser = cookieJar();
		const failure = await thrown(() => transport.start(
			requestEvent(
				'https://calendar.test/auth/google/start?invitation=failed-invite',
				{ provider: 'google' },
				failedBrowser.cookies
			)
		));

		expect(failure).toMatchObject({ status: 502, body: { message: 'Authentication provider unavailable' } });
		expect(failedBeginCalls).toBe(1);
		expect(failedBeginState).toBe('failed-state');
		expect(failedBrowser.cookies.get(AUTHENTICATION_BINDING_COOKIE)).toBeUndefined();
		expect(productState(root)).toEqual(beforeFailedStart);
		expect(() => store.consume({
			provider: 'google',
			callbackUrl: 'https://calendar.test/auth/google/callback',
			state: failedBeginState!,
			browserBinding: 'failed-binding'
		})).toThrow('invalid-auth-state');

		const siblingCallback = await thrown(() => transport.callback(
			requestEvent(
				`https://calendar.test/auth/telegram/callback?state=${encodeURIComponent(siblingState)}`,
				{ provider: 'telegram' },
				siblingBrowser.cookies
			)
		));
		expect(redirectLocation(siblingCallback)).toBe('/');
		expect(siblingVerifyCalls).toBe(1);
		expect(root.identityAccess.resolveActor(
			siblingBrowser.writes.find(({ name }) => name === 'foundation_session')?.value
		)).toEqual({ accountId: 'sibling-account', role: 'teacher' });
	});

	it('keeps state process-local and the auth route on public boundaries only', () => {
		const stateSource = readFileSync('src/lib/server/platform/auth-state.ts', 'utf8');
		const transportSource = readFileSync('src/routes/auth/transport.server.ts', 'utf8');
		const routeSource = readFileSync('src/routes/auth/[provider]/start/+server.ts', 'utf8');

		expect(stateSource).toContain('new Map<string, StoredAuthenticationState>()');
		expect(stateSource).not.toMatch(/setInterval|worker_threads|Worker|sqlite|better-sqlite|writeFile|readFile/);
		expect(transportSource).not.toMatch(/sqlite|better-sqlite|INSERT|UPDATE|DELETE|setInterval|worker_threads|writeFile|readFile/);
		expect(transportSource).toContain("from '$lib/server/modules/identity-access/public'");
		expect(transportSource).toContain('getCompositionRoot().identityAccess');
		expect(routeSource).toContain("from '../../transport.server'");
		expect(routeSource).not.toMatch(/sqlite|database|INSERT|UPDATE|DELETE/);
	});
});
