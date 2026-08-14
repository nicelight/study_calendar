import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { scryptSync } from 'node:crypto';
import type { RequestEvent } from '@sveltejs/kit';
import { ProviderAdapterRegistry, type ProviderAdapter } from '../../src/lib/server/adapters';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
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

function loginEvent(
	root: CompositionRoot,
	url: string,
	email: string,
	password: string,
	jar: ReturnType<typeof cookieJar>
): RequestEvent {
	return {
		url: new URL(url),
		request: new Request(url, {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ email, password })
		}),
		cookies: jar.cookies,
		locals: { actor: root.identityAccess.resolveActor(jar.cookies.get(FOUNDATION_SESSION_COOKIE)) }
	} as unknown as RequestEvent;
}

function transportEvent(
	url: string,
	jar: ReturnType<typeof cookieJar>,
	params: Record<string, string> = {}
): RequestEvent {
	return {
		url: new URL(url),
		request: new Request(url),
		params,
		cookies: jar.cookies,
		locals: { actor: null }
	} as unknown as RequestEvent;
}

async function thrown(action: () => unknown | Promise<unknown>): Promise<any> {
	try {
		await action();
		throw new Error('expected SvelteKit control-flow exception');
	} catch (cause) {
		return cause;
	}
}

function provider(providerName: 'telegram' | 'google', subject: string): ProviderAdapter {
	return {
		provider: providerName,
		begin: ({ state }) =>
			`https://provider.test/${providerName}?state=${encodeURIComponent(state)}`,
		verifyCallback: vi.fn(async () => ({ provider: providerName, subject }))
	};
}

function clientFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		return entry.isDirectory() ? clientFiles(path) : [path];
	});
}

describe('TASK-030 hostile semantic paths', () => {
	let root: CompositionRoot;

	afterEach(() => root?.database.close());

	it('keeps dummy denial, fresh sessions, role routing, and provider paths semantically closed', async () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		const adminPassword = 'semantic-admin-password';
		const teacherPassword = 'semantic-teacher-password';
		const adminSalt = Buffer.alloc(32, 31);
		const teacherSalt = Buffer.alloc(32, 32);
		root.database.sqlite.exec(`
			INSERT INTO accounts (id, role) VALUES
				('admin-account', 'admin'),
				('teacher-account', 'teacher'),
				('malformed-account', 'admin'),
				('provider-account', 'teacher');
		`);
		root.database.sqlite
			.prepare('INSERT INTO password_credentials (account_id, email, salt, password_hash) VALUES (?, ?, ?, ?)')
			.run('admin-account', 'admin@example.com', adminSalt, scryptSync(adminPassword, adminSalt, 64));
		root.database.sqlite
			.prepare('INSERT INTO password_credentials (account_id, email, salt, password_hash) VALUES (?, ?, ?, ?)')
			.run(
				'teacher-account',
				'teacher@example.com',
				teacherSalt,
				scryptSync(teacherPassword, teacherSalt, 64)
			);
		root.database.sqlite
			.prepare('INSERT INTO password_credentials (account_id, email, salt, password_hash) VALUES (?, ?, ?, ?)')
			.run('malformed-account', 'malformed@example.com', Buffer.from([1]), Buffer.from([2]));
		root.database.sqlite
			.prepare('INSERT INTO external_identities (provider, subject, account_id) VALUES (?, ?, ?)')
			.run('google', 'provider-subject', 'provider-account');
		root.database.sqlite
			.prepare("INSERT INTO sessions (token, account_id, revoked_at) VALUES ('attacker-fixed', 'teacher-account', NULL)")
			.run();

		const derivations: Array<{ password: string; salt: Buffer }> = [];
		const identityAccess = new IdentityAccessBoundary(root.database, {
			derivePasswordCredential: (password, salt) => {
				derivations.push({ password, salt: Buffer.from(salt) });
				return scryptSync(password, salt, 64);
			}
		});
		const action = createPasswordLoginActions(identityAccess).default;

		for (const [email, password] of [
			['unknown@example.com', 'identity-access-password-denial'],
			['admin@example.com', 'wrong-password'],
			['malformed@example.com', 'anything']
		]) {
			const jar = cookieJar();
			const denial = await action(
				loginEvent(root, 'https://calendar.test/login', email, password, jar)
			);
			expect(denial).toEqual({ status: 401, data: { error: 'invalid_credentials' } });
			expect(jar.writes).toEqual([]);
		}
		expect(derivations).toHaveLength(3);

		const fixedJar = cookieJar({ [FOUNDATION_SESSION_COOKIE]: 'attacker-fixed' });
		const firstLogin = await thrown(() =>
			action(
				loginEvent(
					root,
					'https://calendar.test/login',
					'admin@example.com',
					adminPassword,
					fixedJar
				)
			)
		);
		expect(firstLogin).toMatchObject({ status: 303, location: '/admin' });
		const firstToken = fixedJar.writes.at(-1)!.value;
		expect(firstToken).not.toBe('attacker-fixed');
		expect(identityAccess.resolveActor(firstToken)).toEqual({ accountId: 'admin-account', role: 'admin' });
		expect(identityAccess.resolveActor('attacker-fixed')).toEqual({
			accountId: 'teacher-account',
			role: 'teacher'
		});

		const secondJar = cookieJar();
		const secondLogin = await thrown(() =>
			action(
				loginEvent(
					root,
					'http://127.0.0.1:5173/login',
					'admin@example.com',
					adminPassword,
					secondJar
				)
			)
		);
		expect(secondLogin).toMatchObject({ status: 303, location: '/admin' });
		const secondWrite = secondJar.writes.at(-1)!;
		expect(secondWrite.value).not.toBe(firstToken);
		expect(secondWrite.options).toMatchObject({
			httpOnly: true,
			path: '/',
			sameSite: 'lax',
			secure: false
		});

		const teacherJar = cookieJar();
		const teacherLogin = await thrown(() =>
			action(
				loginEvent(
					root,
					'https://calendar.test/login',
					'teacher@example.com',
					teacherPassword,
					teacherJar
				)
			)
		);
		expect(teacherLogin).toMatchObject({ status: 303, location: '/' });
		expect(teacherJar.writes.at(-1)!.options).toMatchObject({ secure: true, path: '/' });

		const auth = createAuthenticationTransport({
			identityAccess,
			providers: new ProviderAdapterRegistry([
				provider('telegram', 'telegram-subject'),
				provider('google', 'provider-subject')
			]),
			stateStore: new AuthenticationStateStore({
				stateFactory: () => 'provider-state',
				bindingFactory: () => 'provider-binding'
			})
		});
		const providerJar = cookieJar();
		const providerStart = await thrown(() =>
			auth.start(
				transportEvent(
					'https://calendar.test/auth/google/start',
					providerJar,
					{ provider: 'google' }
				)
			)
		);
		const state = new URL(providerStart.location).searchParams.get('state')!;
		const providerCallback = await thrown(() =>
			auth.callback(
				transportEvent(
					`https://calendar.test/auth/google/callback?state=${state}`,
					providerJar,
					{ provider: 'google' }
				)
			)
		);
		expect(providerCallback).toMatchObject({ status: 303, location: '/' });
		const providerToken = providerJar.writes.find(
			({ name }) => name === FOUNDATION_SESSION_COOKIE
		)!.value;
		expect(identityAccess.resolveActor(providerToken)).toEqual({
			accountId: 'provider-account',
			role: 'teacher'
		});

		const logout = await thrown(() =>
			auth.logout(transportEvent('https://calendar.test/auth/logout', secondJar))
		);
		expect(logout).toMatchObject({ status: 303, location: '/login' });
		expect(identityAccess.resolveActor(secondWrite.value)).toBeNull();
		expect(identityAccess.resolveActor(firstToken)).toEqual({
			accountId: 'admin-account',
			role: 'admin'
		});
		expect(identityAccess.resolveActor(providerToken)).toEqual({
			accountId: 'provider-account',
			role: 'teacher'
		});
	});

	it('keeps password/session internals and provider secrets out of the client build', () => {
		const clientText = clientFiles('.svelte-kit/output/client')
			.filter((file) => file.endsWith('.js') || file.endsWith('.json'))
			.map((file) => readFileSync(file, 'utf8'))
			.join('\n');
		expect(clientText).not.toMatch(
			/identity-access-password-denial-salt|identity-access-password-denial|timingSafeEqual|scryptSync|password_credentials|GOOGLE_CLIENT_SECRET|TELEGRAM_BOT_TOKEN|google-client-secret|telegram-secret/
		);
		expect(clientText).toContain('invalid_credentials');
		expect(clientText).toContain('/auth/');
	});
});
