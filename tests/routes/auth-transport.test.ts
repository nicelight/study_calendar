import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import {
	ProviderAdapterRegistry,
	type ProviderAdapter
} from '../../src/lib/server/adapters';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { AuthenticationStateStore } from '../../src/lib/server/platform/auth-state';
import { readPlatformConfig } from '../../src/lib/server/platform/config';
import { AUTHENTICATION_BINDING_COOKIE } from '../../src/lib/server/platform/session-cookie';
import {
	AuthenticationTransport,
	createAuthenticationTransport
} from '../../src/routes/auth/transport.server';

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

function requestEvent(
	url: string,
	params: Record<string, string>,
	cookies = cookieJar().cookies
): RequestEvent {
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

function seedAccount(root: CompositionRoot, accountId: string, role: 'admin' | 'teacher' | 'student' | 'parent') {
	root.database.sqlite.prepare('INSERT INTO accounts (id, role) VALUES (?, ?)').run(accountId, role);
}

function seedInvitation(
	root: CompositionRoot,
	token: string,
	accountId: string,
	expiresAt = '2099-01-01T00:00:00.000Z'
) {
	root.database.sqlite
		.prepare("INSERT INTO invitations (token, account_id, status, expires_at) VALUES (?, ?, 'pending', ?)")
		.run(token, accountId, expiresAt);
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

function providerDouble(
	provider: 'telegram' | 'google',
	subject: string
): ProviderAdapter {
	return {
		provider,
		begin: ({ state }) => `https://provider.test/${provider}?state=${encodeURIComponent(state)}`,
		verifyCallback: vi.fn(async () => ({ provider, subject }))
	};
}

function trackedProviderDouble(provider: 'telegram' | 'google', subject: string) {
	const verifyCallback = vi.fn(async () => ({ provider, subject }));
	return {
		adapter: {
			provider,
			begin: ({ state }: { state: string }) =>
				`https://provider.test/${provider}?state=${encodeURIComponent(state)}`,
			verifyCallback
		} satisfies ProviderAdapter,
		verifyCallback
	};
}

function transportFor(
	root: CompositionRoot,
	telegramSubject = 'telegram-subject',
	googleSubject = 'google-subject'
): AuthenticationTransport {
	return createAuthenticationTransport({
		identityAccess: root.identityAccess,
		providers: new ProviderAdapterRegistry([
			providerDouble('telegram', telegramSubject),
			providerDouble('google', googleSubject)
		]),
		stateStore: new AuthenticationStateStore()
	});
}

describe('browser authentication transport', () => {
	let root: CompositionRoot;

	afterEach(() => root?.database.close());

	it('preserves invitation context through server-owned state issuance and consumption', () => {
		const callbackUrl = 'https://calendar.test/auth/google/callback';
		const stateStore = new AuthenticationStateStore({ stateFactory: () => 'server-state' });
		const issuedState = stateStore.issue({
			provider: 'google',
			callbackUrl,
			invitationToken: 'invite-server-bound'
		});

		expect(stateStore.consume({
			provider: 'google',
			callbackUrl,
			state: issuedState.state,
			browserBinding: issuedState.browserBinding
		})).toEqual({
			provider: 'google',
			callbackUrl,
			invitationToken: 'invite-server-bound'
		});
	});

	it('discards state when provider start fails so a retry can issue a fresh capability', async () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		let failStart = true;
		const begin = vi.fn(({ state }: { state: string }) => {
			if (failStart) {
				failStart = false;
				throw new Error('google-provider-outage');
			}
			return `https://provider.test/google?state=${encodeURIComponent(state)}`;
		});
		const browser = cookieJar();
		const transport = createAuthenticationTransport({
			identityAccess: root.identityAccess,
			providers: new ProviderAdapterRegistry([{
				provider: 'google',
				begin,
				verifyCallback: vi.fn(async () => ({ provider: 'google' as const, subject: 'unused' }))
			}]),
			stateStore: new AuthenticationStateStore({
				stateFactory: () => 'reusable-state',
				bindingFactory: () => 'reusable-binding'
			})
		});

		const firstFailure = await thrown(() =>
			transport.start(requestEvent('https://calendar.test/auth/google/start', { provider: 'google' }, browser.cookies))
		);
		expect(firstFailure).toMatchObject({ status: 502 });

		const secondStart = await thrown(() =>
			transport.start(requestEvent('https://calendar.test/auth/google/start', { provider: 'google' }, browser.cookies))
		);
		expect(redirectLocation(secondStart)).toContain('state=reusable-state');
		expect(begin).toHaveBeenCalledTimes(2);
	});

	it('discards only the failed-start state while preserving a valid sibling capability', async () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		seedAccount(root, 'sibling-account', 'teacher');
		root.database.sqlite
			.prepare('INSERT INTO external_identities (provider, subject, account_id) VALUES (?, ?, ?)')
			.run('telegram', 'sibling-subject', 'sibling-account');

		const stateValues = ['sibling-state', 'failed-state'];
		const bindingValues = ['sibling-binding', 'failed-binding'];
		const providerFailure = vi.fn(() => {
			throw new Error('google-provider-outage');
		});
		const telegramVerify = vi.fn(async () => ({ provider: 'telegram' as const, subject: 'sibling-subject' }));
		const stateStore = new AuthenticationStateStore({
			stateFactory: () => stateValues.shift()!,
			bindingFactory: () => bindingValues.shift()!
		});
		const transport = createAuthenticationTransport({
			identityAccess: root.identityAccess,
			providers: new ProviderAdapterRegistry([
				{
					provider: 'telegram',
					begin: ({ state }) => `https://provider.test/telegram?state=${encodeURIComponent(state)}`,
					verifyCallback: telegramVerify
				},
				{
					provider: 'google',
					begin: providerFailure,
					verifyCallback: vi.fn(async () => ({ provider: 'google' as const, subject: 'unused' }))
				}
			]),
			stateStore
		});
		const initialProductState = productState(root);
		const siblingBrowser = cookieJar();
		const siblingStart = await thrown(() => transport.start(
			requestEvent('https://calendar.test/auth/telegram/start', { provider: 'telegram' }, siblingBrowser.cookies)
		));
		const siblingState = new URL(redirectLocation(siblingStart)).searchParams.get('state')!;
		const failedBrowser = cookieJar();
		const failedStart = await thrown(() => transport.start(
			requestEvent('https://calendar.test/auth/google/start', { provider: 'google' }, failedBrowser.cookies)
		));

		expect(failedStart).toMatchObject({ status: 502 });
		expect(providerFailure).toHaveBeenCalledTimes(1);
		expect(productState(root)).toEqual(initialProductState);
		expect(() => stateStore.consume({
			provider: 'google',
			callbackUrl: 'https://calendar.test/auth/google/callback',
			state: 'failed-state',
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
		expect(telegramVerify).toHaveBeenCalledTimes(1);
		expect(root.identityAccess.resolveActor(siblingBrowser.writes.find(({ name }) => name === 'foundation_session')?.value))
			.toEqual({ accountId: 'sibling-account', role: 'teacher' });
	});

	it('rejects a callback from another or cookie-less browser before provider and state completion', async () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		seedAccount(root, 'login-account', 'teacher');
		root.database.sqlite
			.prepare('INSERT INTO external_identities (provider, subject, account_id) VALUES (?, ?, ?)')
			.run('google', 'login-subject', 'login-account');
		seedAccount(root, 'invite-account', 'parent');
		seedInvitation(root, 'invite-browser-bound', 'invite-account');

		const google = trackedProviderDouble('google', 'login-subject');
		const transport = createAuthenticationTransport({
			identityAccess: root.identityAccess,
			providers: new ProviderAdapterRegistry([google.adapter]),
			stateStore: new AuthenticationStateStore()
		});

		const loginStartCookies = cookieJar();
		const loginStart = await thrown(() =>
			transport.start(
				requestEvent('https://calendar.test/auth/google/start', { provider: 'google' }, loginStartCookies.cookies)
			)
		);
		const loginState = new URL(redirectLocation(loginStart)).searchParams.get('state')!;
		const loginRejection = await thrown(() =>
			transport.callback(
				requestEvent(
					`https://calendar.test/auth/google/callback?state=${encodeURIComponent(loginState)}`,
					{ provider: 'google' },
					cookieJar().cookies
				)
			)
		);
		expect(loginRejection).toMatchObject({ status: 400 });
		expect(google.verifyCallback).not.toHaveBeenCalled();
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM sessions').get()).toEqual({ count: 0 });

		const invitationStartCookies = cookieJar();
		const invitationStart = await thrown(() =>
			transport.start(
				requestEvent(
					'https://calendar.test/auth/google/start?invitation=invite-browser-bound',
					{ provider: 'google' },
					invitationStartCookies.cookies
				)
			)
		);
		const invitationState = new URL(redirectLocation(invitationStart)).searchParams.get('state')!;
		const invitationRejection = await thrown(() =>
			transport.callback(
				requestEvent(
					`https://calendar.test/auth/google/callback?state=${encodeURIComponent(invitationState)}`,
					{ provider: 'google' },
					cookieJar().cookies
				)
			)
		);
		expect(invitationRejection).toMatchObject({ status: 400 });
		expect(google.verifyCallback).not.toHaveBeenCalled();
		expect(root.database.sqlite.prepare('SELECT status FROM invitations WHERE token = ?').get('invite-browser-bound'))
			.toEqual({ status: 'pending' });
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM sessions').get()).toEqual({ count: 0 });
	});

	it('rejects mismatched and expired browser bindings without consuming the valid flow', async () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		seedAccount(root, 'binding-account', 'teacher');
		root.database.sqlite
			.prepare('INSERT INTO external_identities (provider, subject, account_id) VALUES (?, ?, ?)')
			.run('google', 'binding-subject', 'binding-account');

		let currentTime = new Date('2026-08-11T00:00:00.000Z');
		let stateNumber = 0;
		let bindingNumber = 0;
		const google = trackedProviderDouble('google', 'binding-subject');
		const transport = createAuthenticationTransport({
			identityAccess: root.identityAccess,
			providers: new ProviderAdapterRegistry([google.adapter]),
			stateStore: new AuthenticationStateStore({
				now: () => currentTime,
				ttlMs: 1_000,
				stateFactory: () => `state-${++stateNumber}`,
				bindingFactory: () => `binding-${++bindingNumber}`
			})
		});

		const browserA = cookieJar();
		const startA = await thrown(() =>
			transport.start(requestEvent('https://calendar.test/auth/google/start', { provider: 'google' }, browserA.cookies))
		);
		const stateA = new URL(redirectLocation(startA)).searchParams.get('state')!;
		const browserB = cookieJar();
		const startB = await thrown(() =>
			transport.start(requestEvent('https://calendar.test/auth/google/start', { provider: 'google' }, browserB.cookies))
		);
		const stateB = new URL(redirectLocation(startB)).searchParams.get('state')!;
		expect(stateB).not.toBe(stateA);

		const mismatch = await thrown(() =>
			transport.callback(
				requestEvent(
					`https://calendar.test/auth/google/callback?state=${encodeURIComponent(stateA)}`,
					{ provider: 'google' },
					browserB.cookies
				)
			)
		);
		expect(mismatch).toMatchObject({ status: 400 });
		expect(google.verifyCallback).not.toHaveBeenCalled();
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM sessions').get()).toEqual({ count: 0 });

		currentTime = new Date('2026-08-11T00:00:01.001Z');
		const expired = await thrown(() =>
			transport.callback(
				requestEvent(
					`https://calendar.test/auth/google/callback?state=${encodeURIComponent(stateA)}`,
					{ provider: 'google' },
					browserA.cookies
				)
			)
		);
		expect(expired).toMatchObject({ status: 400 });
		expect(google.verifyCallback).not.toHaveBeenCalled();
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM sessions').get()).toEqual({ count: 0 });
		expect(browserA.deletions).toContainEqual(expect.objectContaining({ name: AUTHENTICATION_BINDING_COOKIE }));
	});

	it('logs in with Telegram and Google, sets the exact session cookie, and revokes on logout', async () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		const transport = transportFor(root);
		for (const [provider, protocol] of [
			['telegram', 'http:'],
			['google', 'https:']
		] as const) {
			const accountId = `${provider}-account`;
			const subject = `${provider}-subject`;
			seedAccount(root, accountId, 'teacher');
			root.database.sqlite
				.prepare('INSERT INTO external_identities (provider, subject, account_id) VALUES (?, ?, ?)')
				.run(provider, subject, accountId);

			const startCookies = cookieJar();
			const startControlFlow = await thrown(() =>
				transport.start(
					requestEvent(
						`${protocol}//calendar.test/auth/${provider}/start`,
						{ provider },
						startCookies.cookies
					)
				)
			);
			const providerUrl = redirectLocation(startControlFlow);
			const state = new URL(providerUrl).searchParams.get('state');
			expect(state).toBeTruthy();
			expect(startCookies.writes[0]).toMatchObject({
				name: AUTHENTICATION_BINDING_COOKIE,
				value: startCookies.cookies.get(AUTHENTICATION_BINDING_COOKIE),
				options: {
					httpOnly: true,
					path: '/',
					sameSite: 'lax',
					secure: protocol === 'https:',
					maxAge: 300
				}
			});

			const sessionCookies = startCookies;
			const callbackControlFlow = await thrown(() =>
				transport.callback(
					requestEvent(
						`${protocol}//calendar.test/auth/${provider}/callback?state=${encodeURIComponent(state!)}`,
						{ provider },
						sessionCookies.cookies
					)
				)
			);
			expect(redirectLocation(callbackControlFlow)).toBe('/');
			const sessionWrite = sessionCookies.writes.find(({ name }) => name === 'foundation_session');
			expect(sessionWrite).toMatchObject({
				name: 'foundation_session',
				options: {
					httpOnly: true,
					path: '/',
					sameSite: 'lax',
					secure: protocol === 'https:'
				}
			});
			expect(sessionCookies.deletions).toContainEqual(expect.objectContaining({
			name: AUTHENTICATION_BINDING_COOKIE,
			options: expect.objectContaining({ maxAge: 300 })
		}));
			const sessionToken = sessionWrite!.value;
			expect(root.identityAccess.resolveActor(sessionToken)).toEqual({ accountId, role: 'teacher' });

			const logoutControlFlow = await thrown(() => transport.logout(requestEvent(
				`${protocol}//calendar.test/auth/logout`,
				{},
				sessionCookies.cookies
			)));
			expect(redirectLocation(logoutControlFlow)).toBe('/login');
			expect(sessionCookies.deletions.find(({ name }) => name === 'foundation_session')).toMatchObject({
				name: 'foundation_session',
				options: {
					httpOnly: true,
					path: '/',
					sameSite: 'lax',
					secure: protocol === 'https:'
				}
			});
			expect(root.identityAccess.resolveActor(sessionToken)).toBeNull();
		}
	});

	it('keeps invitation state server-bound through valid acceptance and rejects tampering, mismatch, and replay', async () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		seedAccount(root, 'precreated-account', 'parent');
		seedInvitation(root, 'invite-one', 'precreated-account');
		const transport = transportFor(root);
		const startCookies = cookieJar();
		const startControlFlow = await thrown(() =>
			transport.start(
				requestEvent('https://calendar.test/auth/google/start?invitation=invite-one', {
					provider: 'google'
				}, startCookies.cookies)
			)
		);
		const state = new URL(redirectLocation(startControlFlow)).searchParams.get('state')!;

		for (const [provider, tamperedState] of [
			['google', `${state}-tampered`],
			['telegram', state],
			['google', 'forged-state']
		] as const) {
			const rejection = await thrown(() =>
				transport.callback(
					requestEvent(
						`https://calendar.test/auth/${provider}/callback?state=${encodeURIComponent(tamperedState)}`,
						{ provider }
					)
				)
			);
			expect(rejection).toMatchObject({ status: 400 });
			expect(rejection.body).toEqual({ message: 'Invalid authentication state' });
			expect(root.database.sqlite.prepare('SELECT status FROM invitations WHERE token = ?').get('invite-one'))
				.toEqual({ status: 'pending' });
		}

		const sessionCookies = startCookies;
		const success = await thrown(() =>
			transport.callback(
				requestEvent(
					`https://calendar.test/auth/google/callback?state=${encodeURIComponent(state)}`,
					{ provider: 'google' },
					sessionCookies.cookies
				)
			)
		);
		expect(redirectLocation(success)).toBe('/');
		expect(root.database.sqlite.prepare('SELECT status FROM invitations WHERE token = ?').get('invite-one'))
			.toEqual({ status: 'consumed' });
		const sessionWrite = sessionCookies.writes.find(({ name }) => name === 'foundation_session');
		expect(root.identityAccess.resolveActor(sessionWrite!.value)).toEqual({
			accountId: 'precreated-account',
			role: 'parent'
		});
		const sessionsBeforeReplay = root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM sessions').get();

		const replay = await thrown(() =>
			transport.callback(
				requestEvent(
					`https://calendar.test/auth/google/callback?state=${encodeURIComponent(state)}`,
					{ provider: 'google' }
				)
			)
		);
		expect(replay).toMatchObject({ status: 400 });
		expect(replay.body).toEqual({ message: 'Invalid authentication state' });
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM sessions').get()).toEqual(sessionsBeforeReplay);
	});

	it('rejects invalid, expired, revoked, reused, and wrong-account invitations without consuming them', async () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		seedAccount(root, 'target-account', 'student');
		seedAccount(root, 'other-account', 'teacher');
		seedInvitation(root, 'invite-expired', 'target-account', '2000-01-01T00:00:00.000Z');
		seedInvitation(root, 'invite-revoked', 'target-account');
		root.database.sqlite.prepare("UPDATE invitations SET status = 'revoked' WHERE token = ?").run('invite-revoked');
		seedInvitation(root, 'invite-wrong-account', 'target-account');
		root.database.sqlite
			.prepare('INSERT INTO external_identities (provider, subject, account_id) VALUES (?, ?, ?)')
			.run('google', 'already-bound', 'other-account');
		const transport = transportFor(root, 'telegram-new', 'already-bound');

		for (const token of ['missing', 'invite-expired', 'invite-revoked']) {
			const rejection = await thrown(() =>
				transport.invitePage(requestEvent(`https://calendar.test/invite/${token}`, { token }))
			);
			expect(rejection).toMatchObject({ status: 410 });
		}

		const startCookies = cookieJar();
		const startControlFlow = await thrown(() =>
			transport.start(
				requestEvent('https://calendar.test/auth/google/start?invitation=invite-wrong-account', {
					provider: 'google'
				}, startCookies.cookies)
			)
		);
		const state = new URL(redirectLocation(startControlFlow)).searchParams.get('state')!;
		const wrongAccount = await thrown(() =>
			transport.callback(
				requestEvent(`https://calendar.test/auth/google/callback?state=${encodeURIComponent(state)}`, {
					provider: 'google'
				}, startCookies.cookies)
			)
		);
		expect(wrongAccount).toMatchObject({ status: 410 });
		expect(wrongAccount.body).toEqual({ message: 'Invitation is invalid or no longer available' });
		expect(root.database.sqlite.prepare('SELECT status FROM invitations WHERE token = ?').get('invite-wrong-account'))
			.toEqual({ status: 'pending' });
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM sessions').get()).toEqual({ count: 0 });
	});

	it('preserves invitation and identity state when session persistence fails', async () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		seedAccount(root, 'atomic-account', 'student');
		seedInvitation(root, 'invite-atomic', 'atomic-account');
		root.database.sqlite.exec(`
			CREATE TRIGGER fail_session_insert
			BEFORE INSERT ON sessions
			BEGIN
				SELECT RAISE(ABORT, 'induced-session-write-failure');
			END;
		`);
		const transport = transportFor(root);
		const startCookies = cookieJar();
		const startControlFlow = await thrown(() =>
			transport.start(
				requestEvent('https://calendar.test/auth/telegram/start?invitation=invite-atomic', {
					provider: 'telegram'
				}, startCookies.cookies)
			)
		);
		const state = new URL(redirectLocation(startControlFlow)).searchParams.get('state')!;

		const failure = await thrown(() =>
			transport.callback(
				requestEvent(`https://calendar.test/auth/telegram/callback?state=${encodeURIComponent(state)}`, {
					provider: 'telegram'
				}, startCookies.cookies)
			)
		);
		expect(failure).toMatchObject({ status: 500 });
		expect(failure.body).toEqual({ message: 'Authentication could not be completed' });
		expect(root.database.sqlite.prepare('SELECT status FROM invitations WHERE token = ?').get('invite-atomic'))
			.toEqual({ status: 'pending' });
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM external_identities').get()).toEqual({ count: 0 });
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM sessions').get()).toEqual({ count: 0 });
	});
});

describe('provider composition ownership', () => {
	it('keeps provider configuration and registry construction out of route transport', () => {
		const source = readFileSync('src/routes/auth/transport.server.ts', 'utf8');

		expect(source).not.toMatch(/TELEGRAM_BOT_TOKEN|GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET/);
		expect(source).not.toMatch(/createProviderAdapters|new ProviderAdapterRegistry/);
	});

	it('keeps provider registry construction in the composition root', () => {
		const source = readFileSync('src/lib/server/composition-root.ts', 'utf8');

		expect(source).toMatch(/createProviderAdapters/);
		expect(source).toMatch(/providers/);
	});

	it('supplies both provider starts from composition and keeps missing config safe', async () => {
		const providerSecrets = {
			telegram: '123456:telegram-secret',
			google: 'google-client-secret'
		};
		const configuredRoot = createCompositionRoot({
			databaseFilename: ':memory:',
			platformConfig: readPlatformConfig({
				DATABASE_URL: ':memory:',
				TELEGRAM_BOT_TOKEN: providerSecrets.telegram,
				GOOGLE_CLIENT_ID: 'google-client-id',
				GOOGLE_CLIENT_SECRET: providerSecrets.google
			})
		});
		try {

		const telegramStart = configuredRoot.providers.get('telegram').begin({
			callbackUrl: 'https://calendar.test/auth/telegram/callback',
			state: 'telegram-state'
		});
		const googleStart = configuredRoot.providers.get('google').begin({
			callbackUrl: 'https://calendar.test/auth/google/callback',
			state: 'google-state'
		});
		expect(new URL(telegramStart).searchParams.get('bot_id')).toBe('123456');
		expect(new URL(googleStart).searchParams.get('client_id')).toBe('google-client-id');
		expect(`${telegramStart}${googleStart}`).not.toContain(providerSecrets.telegram);
		expect(`${telegramStart}${googleStart}`).not.toContain(providerSecrets.google);

		const missingRoot = createCompositionRoot({
			databaseFilename: ':memory:',
			platformConfig: {
				databaseFilename: ':memory:',
				providers: { telegram: {}, google: {} }
			}
		});
		try {
			const transport = createAuthenticationTransport({
				identityAccess: missingRoot.identityAccess,
				providers: missingRoot.providers,
				stateStore: new AuthenticationStateStore({
					stateFactory: () => 'missing-config-state',
					bindingFactory: () => 'missing-config-binding'
				})
			});

			for (const provider of ['telegram', 'google'] as const) {
				const failure = await thrown(() =>
					transport.start(
						requestEvent(`https://calendar.test/auth/${provider}/start`, { provider })
					)
				);
				expect(failure).toMatchObject({
					status: 502,
					body: { message: 'Authentication provider unavailable' }
				});
				expect(JSON.stringify(failure)).not.toContain(providerSecrets.telegram);
				expect(JSON.stringify(failure)).not.toContain(providerSecrets.google);
			}
			} finally {
				missingRoot.database.close();
			}
		} finally {
			configuredRoot.database.close();
		}
	});
});
