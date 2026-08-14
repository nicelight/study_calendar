import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { scryptSync } from 'node:crypto';
import type { RequestEvent } from '@sveltejs/kit';
import { ProviderAdapterRegistry, type ProviderAdapter } from '../../src/lib/server/adapters';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import { AuthenticationStateStore } from '../../src/lib/server/platform/auth-state';
import { FOUNDATION_SESSION_COOKIE } from '../../src/lib/server/platform/session-cookie';
import { createAdminCenterPageLoad } from '../../src/routes/admin/center-page.server';
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

function event(
	url: string,
	root: CompositionRoot,
	cookies = cookieJar().cookies,
	request = new Request(url),
	params: Record<string, string> = {}
): RequestEvent {
	return {
		url: new URL(url),
		params,
		request,
		cookies,
		locals: { actor: root.identityAccess.resolveActor(cookies.get(FOUNDATION_SESSION_COOKIE)) }
	} as unknown as RequestEvent;
}

function loginRequest(email: string, password: string): Request {
	return new Request('https://calendar.test/login', {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ email, password })
	});
}

async function thrown(action: () => unknown | Promise<unknown>): Promise<any> {
	try {
		await action();
		throw new Error('expected SvelteKit control-flow exception');
	} catch (cause) {
		return cause;
	}
}

function provider(provider: 'telegram' | 'google'): ProviderAdapter {
	return {
		provider,
		begin: ({ state }) => `https://provider.test/${provider}?state=${encodeURIComponent(state)}`,
		verifyCallback: vi.fn(async () => ({ provider, subject: `${provider}-subject` }))
	};
}

describe('TASK-030 fresh verifier-owned AC-011 flow', () => {
	let root: CompositionRoot;

	afterEach(() => root?.database.close());

	it('proves the complete password/session harm-driving outcome in disposable state', async () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		const password = 'verifier-only-password';
		const salt = Buffer.alloc(32, 19);
		root.database.sqlite.prepare("INSERT INTO accounts (id, role) VALUES ('verified-admin', 'admin')").run();
		root.database.sqlite
			.prepare(
				'INSERT INTO password_credentials (account_id, email, salt, password_hash) VALUES (?, ?, ?, ?)'
			)
			.run('verified-admin', 'admin@example.com', salt, scryptSync(password, salt, 64));
		root.database.sqlite
			.prepare("INSERT INTO invitations (token, account_id, status, expires_at) VALUES (?, ?, 'pending', ?)")
			.run('provider-invitation', 'verified-admin', '2099-01-01T00:00:00.000Z');

		const derivations: Array<{ password: string; salt: Buffer }> = [];
		const identityAccess = new IdentityAccessBoundary(root.database, {
			derivePasswordCredential: (candidate, candidateSalt) => {
				derivations.push({ password: candidate, salt: Buffer.from(candidateSalt) });
				return scryptSync(candidate, candidateSalt, 64);
			}
		});
		const action = createPasswordLoginActions(identityAccess).default;

		const browser = cookieJar();
		const success = await thrown(() =>
			action(
				event(
					'https://calendar.test/login',
					root,
					browser.cookies,
					loginRequest('  ADMIN@Example.COM  ', password)
				)
			)
		);
		expect(success).toMatchObject({ status: 303, location: '/admin' });
		const sessionWrite = browser.writes.find(({ name }) => name === FOUNDATION_SESSION_COOKIE);
		expect(sessionWrite).toMatchObject({
			name: 'foundation_session',
			options: { httpOnly: true, path: '/', sameSite: 'lax', secure: true }
		});
		expect(identityAccess.resolveActor(sessionWrite?.value)).toEqual({
			accountId: 'verified-admin',
			role: 'admin'
		});

		const adminLoad = createAdminCenterPageLoad(root.centerScheduling);
		expect(
			adminLoad(event('https://calendar.test/admin', root, browser.cookies))
		).toEqual({ mode: 'bootstrap' });

		identityAccess.revokeSession(sessionWrite!.value);
		expect(identityAccess.resolveActor(sessionWrite?.value)).toBeNull();
		const revoked = await thrown(() =>
			adminLoad(event('https://calendar.test/admin', root, browser.cookies))
		);
		expect(revoked).toMatchObject({ status: 303, location: '/login' });

		const logoutBrowser = cookieJar();
		const secondSuccess = await thrown(() =>
			action(
				event(
					'https://calendar.test/login',
					root,
					logoutBrowser.cookies,
					loginRequest('admin@example.com', password)
				)
			)
		);
		expect(secondSuccess).toMatchObject({ status: 303, location: '/admin' });
		const logoutToken = logoutBrowser.writes.find(
			({ name }) => name === FOUNDATION_SESSION_COOKIE
		)!.value;
		const authTransport = createAuthenticationTransport({
			identityAccess,
			providers: new ProviderAdapterRegistry([provider('telegram'), provider('google')]),
			stateStore: new AuthenticationStateStore()
		});
		const logout = await thrown(() =>
			authTransport.logout(
				event('https://calendar.test/auth/logout', root, logoutBrowser.cookies)
			)
		);
		expect(logout).toMatchObject({ status: 303, location: '/login' });
		expect(logoutBrowser.deletions).toContainEqual(
			expect.objectContaining({ name: FOUNDATION_SESSION_COOKIE })
		);
		expect(identityAccess.resolveActor(logoutToken)).toBeNull();
		const loggedOut = await thrown(() =>
			adminLoad(event('https://calendar.test/admin', root, logoutBrowser.cookies))
		);
		expect(loggedOut).toMatchObject({ status: 303, location: '/login' });

		const sessionsBeforeDenials = root.database.sqlite
			.prepare('SELECT COUNT(*) AS count FROM sessions')
			.get();
		const unknownBrowser = cookieJar();
		const wrongBrowser = cookieJar();
		const derivationsBeforeDenials = derivations.length;
		const unknown = await action(
			event(
				'https://calendar.test/login',
				root,
				unknownBrowser.cookies,
				loginRequest('unknown@example.com', password)
			)
		);
		const wrong = await action(
			event(
				'https://calendar.test/login',
				root,
				wrongBrowser.cookies,
				loginRequest('admin@example.com', 'wrong-password')
			)
		);
		expect(unknown).toEqual({ status: 401, data: { error: 'invalid_credentials' } });
		expect(wrong).toEqual(unknown);
		expect(unknownBrowser.writes).toEqual([]);
		expect(wrongBrowser.writes).toEqual([]);
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM sessions').get())
			.toEqual(sessionsBeforeDenials);
		expect(derivations.slice(derivationsBeforeDenials)).toHaveLength(2);

		expect(authTransport.loginPage()).toEqual({ providers: ['telegram', 'google'] });
		for (const providerName of ['telegram', 'google'] as const) {
			const providerBrowser = cookieJar();
			const started = await thrown(() =>
				authTransport.start(
					event(
						`https://calendar.test/auth/${providerName}/start?invitation=provider-invitation`,
						root,
						providerBrowser.cookies,
						undefined,
						{ provider: providerName }
					)
				)
			);
			expect(started).toMatchObject({ status: 303 });
			expect(started.location).toMatch(`https://provider.test/${providerName}`);
		}

		const identitySource = readFileSync('src/lib/server/modules/identity-access/public.ts', 'utf8');
		const actionSource = readFileSync('src/routes/login/password-login.server.ts', 'utf8');
		const pageServerSource = readFileSync('src/routes/login/+page.server.ts', 'utf8');
		const pageSource = readFileSync('src/routes/login/+page.svelte', 'utf8');
		expect(identitySource).toMatch(/scryptSync, timingSafeEqual|scryptSync.*timingSafeEqual/s);
		expect(identitySource).toContain('timingSafeEqual(comparableHash, expectedHash)');
		expect(identitySource).toContain('return this.issueSession(credential.account_id)');
		expect(actionSource).toContain('identityAccess.authenticatePassword({ email, password })');
		expect(actionSource).not.toMatch(
			/\.sqlite|password_credentials|INSERT INTO|UPDATE sessions|AuthenticationStateStore|centerScheduling|localStorage|sessionStorage/
		);
		expect(actionSource.match(/cookies\.set/g)).toHaveLength(1);
		expect(pageServerSource).toContain('export const load');
		expect(pageServerSource).toContain('export const actions');
		expect(pageSource).toContain('<form method="POST">');
		expect(pageSource).toContain('name="email"');
		expect(pageSource).toContain('name="password"');
		expect(pageSource).toContain('href={`/auth/${provider}/start`}');
		expect(pageSource).not.toMatch(/name=["']role|register|registration|reset|recovery/i);
	});
});
