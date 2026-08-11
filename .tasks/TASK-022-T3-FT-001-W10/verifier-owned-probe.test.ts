import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import {
	ProviderAdapterRegistry,
	type ProviderAdapter
} from '../../src/lib/server/adapters';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { AuthenticationStateStore } from '../../src/lib/server/platform/auth-state';
import {
	AUTHENTICATION_BINDING_COOKIE,
	authenticationBindingCookieOptions
} from '../../src/lib/server/platform/session-cookie';
import { createAuthenticationTransport } from '../../src/routes/auth/transport.server';

type Provider = 'telegram' | 'google';
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
		deletions,
		values
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

async function controlFlow(action: () => unknown | Promise<unknown>): Promise<any> {
	try {
		await action();
		throw new Error('expected transport control flow');
	} catch (cause) {
		return cause;
	}
}

function redirectLocation(result: any): string {
	expect(result).toMatchObject({ status: 303 });
	return result.location;
}

function seedAccount(root: CompositionRoot, id: string, role: 'teacher' | 'parent') {
	root.database.sqlite.prepare('INSERT INTO accounts (id, role) VALUES (?, ?)').run(id, role);
}

function seedInvitation(root: CompositionRoot, token: string, accountId: string) {
	root.database.sqlite
		.prepare("INSERT INTO invitations (token, account_id, status, expires_at) VALUES (?, ?, 'pending', ?)")
		.run(token, accountId, '2099-01-01T00:00:00.000Z');
}

function snapshot(root: CompositionRoot) {
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

function trackedAdapter(provider: Provider, subject: string, begin = ({ state }: { state: string }) =>
	`https://provider.test/${provider}?state=${encodeURIComponent(state)}`) {
	const verifyCallback = vi.fn(async () => ({ provider, subject }));
	return {
		adapter: { provider, begin, verifyCallback } satisfies ProviderAdapter,
		verifyCallback
	};
}

function transportFor(
	root: CompositionRoot,
	provider: Provider,
	tracked: ReturnType<typeof trackedAdapter>,
	stateStore = new AuthenticationStateStore()
) {
	return createAuthenticationTransport({
		identityAccess: root.identityAccess,
		providers: new ProviderAdapterRegistry([tracked.adapter]),
		stateStore
	});
}

async function startFlow(
	transport: ReturnType<typeof createAuthenticationTransport>,
	provider: Provider,
	url: string,
	cookies: ReturnType<typeof cookieJar>
) {
	const start = await controlFlow(() => transport.start(requestEvent(url, { provider }, cookies.cookies)));
	const location = redirectLocation(start);
	return {
		state: new URL(location).searchParams.get('state')!,
		binding: cookies.values.get(AUTHENTICATION_BINDING_COOKIE)!,
		location
	};
}

async function callbackFlow(
	transport: ReturnType<typeof createAuthenticationTransport>,
	provider: Provider,
	state: string,
	cookies: ReturnType<typeof cookieJar>,
	protocol = 'https:'
) {
	return controlFlow(() => transport.callback(
		requestEvent(
			`${protocol}//calendar.test/auth/${provider}/callback?state=${encodeURIComponent(state)}`,
			{ provider },
			cookies.cookies
		)
	));
}

function expectBindingCleanup(cookies: ReturnType<typeof cookieJar>, protocol: string, ttlMs: number) {
	expect(cookies.deletions.filter(({ name }) => name === AUTHENTICATION_BINDING_COOKIE)).toHaveLength(1);
	expect(cookies.deletions.at(-1)).toMatchObject({
		name: AUTHENTICATION_BINDING_COOKIE,
		options: authenticationBindingCookieOptions(protocol, ttlMs)
	});
}

describe('TASK-022 independent verifier-owned browser binding probe', () => {
	let root: CompositionRoot | undefined;

	afterEach(() => root?.database.close());

	it.each([
		['telegram', 'http:'],
		['google', 'https:']
	] as const)('proves login binding matrix for %s', async (provider, protocol) => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		seedAccount(root, `${provider}-login`, 'teacher');
		root.database.sqlite
			.prepare('INSERT INTO external_identities (provider, subject, account_id) VALUES (?, ?, ?)')
			.run(provider, `${provider}-subject`, `${provider}-login`);
		const tracked = trackedAdapter(provider, `${provider}-subject`);
		const transport = transportFor(root, provider, tracked);
		const initial = snapshot(root);

		const browserA = cookieJar();
		const flowA = await startFlow(
			transport,
			provider,
			`${protocol}//calendar.test/auth/${provider}/start`,
			browserA
		);
		expect(browserA.writes[0]).toMatchObject({
			name: AUTHENTICATION_BINDING_COOKIE,
			value: flowA.binding,
			options: authenticationBindingCookieOptions(protocol, 5 * 60 * 1000)
		});

		const emptyBrowser = cookieJar();
		const missing = await callbackFlow(transport, provider, flowA.state, emptyBrowser, protocol);
		expect(missing).toMatchObject({ status: 400 });
		expect(tracked.verifyCallback).not.toHaveBeenCalled();
		expect(snapshot(root)).toEqual(initial);
		expectBindingCleanup(emptyBrowser, protocol, 5 * 60 * 1000);

		const browserB = cookieJar();
		const flowB = await startFlow(
			transport,
			provider,
			`${protocol}//calendar.test/auth/${provider}/start`,
			browserB
		);
		const mismatch = await callbackFlow(transport, provider, flowA.state, browserB, protocol);
		expect(mismatch).toMatchObject({ status: 400 });
		expect(flowB.state).not.toBe(flowA.state);
		expect(tracked.verifyCallback).not.toHaveBeenCalled();
		expect(snapshot(root)).toEqual(initial);
		expectBindingCleanup(browserB, protocol, 5 * 60 * 1000);

		const expiredClock = { current: new Date('2026-08-11T00:00:00.000Z') };
		const expiringTracked = trackedAdapter(provider, `${provider}-subject`);
		const expiringTransport = transportFor(
			root,
			provider,
			expiringTracked,
			new AuthenticationStateStore({ now: () => expiredClock.current, ttlMs: 1_000 })
		);
		const expiringBrowser = cookieJar();
		const expiring = await startFlow(
			expiringTransport,
			provider,
			`${protocol}//calendar.test/auth/${provider}/start`,
			expiringBrowser
		);
		const beforeExpiry = snapshot(root);
		expiredClock.current = new Date('2026-08-11T00:00:01.001Z');
		const expired = await callbackFlow(expiringTransport, provider, expiring.state, expiringBrowser, protocol);
		expect(expired).toMatchObject({ status: 400 });
		expect(expiringTracked.verifyCallback).not.toHaveBeenCalled();
		expect(snapshot(root)).toEqual(beforeExpiry);
		expectBindingCleanup(expiringBrowser, protocol, 1_000);

		const validBrowser = cookieJar();
		const valid = await startFlow(
			transport,
			provider,
			`${protocol}//calendar.test/auth/${provider}/start`,
			validBrowser
		);
		const success = await callbackFlow(transport, provider, valid.state, validBrowser, protocol);
		expect(redirectLocation(success)).toBe('/');
		expect(tracked.verifyCallback).toHaveBeenCalledTimes(1);
		expect(root.identityAccess.resolveActor(validBrowser.writes.find(({ name }) => name === 'foundation_session')?.value))
			.toEqual({ accountId: `${provider}-login`, role: 'teacher' });
		expectBindingCleanup(validBrowser, protocol, 5 * 60 * 1000);

		const afterSuccess = snapshot(root);
		const replayBrowser = cookieJar({ [AUTHENTICATION_BINDING_COOKIE]: valid.binding });
		const replay = await callbackFlow(transport, provider, valid.state, replayBrowser, protocol);
		expect(replay).toMatchObject({ status: 400 });
		expect(tracked.verifyCallback).toHaveBeenCalledTimes(1);
		expect(snapshot(root)).toEqual(afterSuccess);
		expectBindingCleanup(replayBrowser, protocol, 5 * 60 * 1000);
	});

	it.each(['telegram', 'google'] as const)('proves invitation binding matrix for %s', async (provider) => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		seedAccount(root, `${provider}-invite`, 'parent');
		seedInvitation(root, `${provider}-invite-token`, `${provider}-invite`);
		const tracked = trackedAdapter(provider, `${provider}-invite-subject`);
		const transport = transportFor(root, provider, tracked);
		const initial = snapshot(root);

		const browserA = cookieJar();
		const flowA = await startFlow(
			transport,
			provider,
			`https://calendar.test/auth/${provider}/start?invitation=${provider}-invite-token`,
			browserA
		);
		const missing = await callbackFlow(transport, provider, flowA.state, cookieJar());
		expect(missing).toMatchObject({ status: 400 });
		expect(tracked.verifyCallback).not.toHaveBeenCalled();
		expect(snapshot(root)).toEqual(initial);

		const browserB = cookieJar();
		await startFlow(
			transport,
			provider,
			`https://calendar.test/auth/${provider}/start?invitation=${provider}-invite-token`,
			browserB
		);
		const mismatch = await callbackFlow(transport, provider, flowA.state, browserB);
		expect(mismatch).toMatchObject({ status: 400 });
		expect(tracked.verifyCallback).not.toHaveBeenCalled();
		expect(snapshot(root)).toEqual(initial);

		const expiringClock = { current: new Date('2026-08-11T00:00:00.000Z') };
		const expiringTracked = trackedAdapter(provider, `${provider}-invite-subject`);
		const expiringTransport = transportFor(
			root,
			provider,
			expiringTracked,
			new AuthenticationStateStore({ now: () => expiringClock.current, ttlMs: 1_000 })
		);
		const expiringBrowser = cookieJar();
		const expiring = await startFlow(
			expiringTransport,
			provider,
			`https://calendar.test/auth/${provider}/start?invitation=${provider}-invite-token`,
			expiringBrowser
		);
		const beforeExpiry = snapshot(root);
		expiringClock.current = new Date('2026-08-11T00:00:01.001Z');
		const expired = await callbackFlow(expiringTransport, provider, expiring.state, expiringBrowser);
		expect(expired).toMatchObject({ status: 400 });
		expect(expiringTracked.verifyCallback).not.toHaveBeenCalled();
		expect(snapshot(root)).toEqual(beforeExpiry);

		const validRoot = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.close();
		root = validRoot;
		seedAccount(root, `${provider}-valid-invite`, 'parent');
		seedInvitation(root, `${provider}-valid-token`, `${provider}-valid-invite`);
		const validTracked = trackedAdapter(provider, `${provider}-valid-subject`);
		const validTransport = transportFor(root, provider, validTracked);
		const validBrowser = cookieJar();
		const valid = await startFlow(
			validTransport,
			provider,
			`https://calendar.test/auth/${provider}/start?invitation=${provider}-valid-token`,
			validBrowser
		);
		const success = await callbackFlow(validTransport, provider, valid.state, validBrowser);
		expect(redirectLocation(success)).toBe('/');
		expect(validTracked.verifyCallback).toHaveBeenCalledTimes(1);
		expect(root.database.sqlite.prepare('SELECT status FROM invitations WHERE token = ?').get(`${provider}-valid-token`))
			.toEqual({ status: 'consumed' });
		expect(root.database.sqlite
		.prepare('SELECT account_id FROM external_identities WHERE provider = ? AND subject = ?')
		.get(provider, `${provider}-valid-subject`)).toEqual({ account_id: `${provider}-valid-invite` });
		expect(root.identityAccess.resolveActor(validBrowser.writes.find(({ name }) => name === 'foundation_session')?.value))
			.toEqual({ accountId: `${provider}-valid-invite`, role: 'parent' });
		expectBindingCleanup(validBrowser, 'https:', 5 * 60 * 1000);

		const afterSuccess = snapshot(root);
		const replayBrowser = cookieJar({ [AUTHENTICATION_BINDING_COOKIE]: valid.binding });
		const replay = await callbackFlow(validTransport, provider, valid.state, replayBrowser);
		expect(replay).toMatchObject({ status: 400 });
		expect(validTracked.verifyCallback).toHaveBeenCalledTimes(1);
		expect(snapshot(root)).toEqual(afterSuccess);
		expectBindingCleanup(replayBrowser, 'https:', 5 * 60 * 1000);
	});

	it('prunes expired server state and discards state when provider start fails', async () => {
		let now = new Date('2026-08-11T00:00:00.000Z');
		let bindingNumber = 0;
		const store = new AuthenticationStateStore({
			now: () => now,
			ttlMs: 1_000,
			stateFactory: () => 'reusable-state',
			bindingFactory: () => `binding-${++bindingNumber}`
		});
		store.issue({ provider: 'google', callbackUrl: 'https://calendar.test/auth/google/callback' });
		now = new Date('2026-08-11T00:00:01.001Z');
		expect(store.issue({ provider: 'google', callbackUrl: 'https://calendar.test/auth/google/callback' })).toEqual({
			state: 'reusable-state',
			browserBinding: 'binding-2'
		});

		root = createCompositionRoot({ databaseFilename: ':memory:' });
		let fail = true;
		const begin = vi.fn(({ state }: { state: string }) => {
			if (fail) {
				fail = false;
				throw new Error('google-provider-outage');
			}
			return `https://provider.test/google?state=${encodeURIComponent(state)}`;
		});
		const tracked = trackedAdapter('google', 'unused', begin);
		const transport = transportFor(
			root,
			'google',
			tracked,
			new AuthenticationStateStore({ stateFactory: () => 'reusable-state', bindingFactory: () => 'reusable-binding' })
		);
		const browser = cookieJar();
		expect(await controlFlow(() => transport.start(
			requestEvent('https://calendar.test/auth/google/start', { provider: 'google' }, browser.cookies)
		))).toMatchObject({ status: 502 });
		expect(redirectLocation(await controlFlow(() => transport.start(
			requestEvent('https://calendar.test/auth/google/start', { provider: 'google' }, browser.cookies)
		)))).toContain('state=reusable-state');
		expect(begin).toHaveBeenCalledTimes(2);
	});
});
