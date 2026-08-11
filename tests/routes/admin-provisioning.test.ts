import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { ProviderAdapterRegistry, type ProviderAdapter } from '../../src/lib/server/adapters';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { AuthenticationStateStore } from '../../src/lib/server/platform/auth-state';
import {
	AuthenticationTransport,
	createAuthenticationTransport
} from '../../src/routes/auth/transport.server';
import { createAdminPageLoad, createAdminActions } from '../../src/routes/admin/participants-page.server';
import { createAdminPostHandler } from '../../src/routes/admin/participants-api.server';
import { createAdminProvisioningTransport, type AdminProvisioningTransport } from '../../src/routes/admin/provisioning.server';

type CookieJar = ReturnType<typeof cookieJar>;
type StateSnapshot = {
	accounts: number;
	invitations: number;
	memberships: number;
	identities: number;
	sessions: number;
};
type ProvisionedStateSnapshot = Pick<StateSnapshot, 'accounts' | 'invitations' | 'memberships'>;
type InvitationAccountRow = { account_id: string };

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

function requestEvent(
	url: string,
	centerId: string,
	actor: { accountId: string; role: 'admin' | 'teacher' | 'student' | 'parent' } | null,
	cookies: CookieJar['cookies'],
	request = new Request(url)
): RequestEvent {
	return {
		url: new URL(url),
		params: { centerId },
		request,
		cookies,
		locals: { actor }
	} as unknown as RequestEvent;
}

function providerRequestEvent(
	url: string,
	provider: 'google',
	cookies: CookieJar['cookies'],
	request = new Request(url)
): RequestEvent {
	return {
		url: new URL(url),
		params: { provider },
		request,
		cookies,
		locals: { actor: null }
	} as unknown as RequestEvent;
}

function formRequest(url: string, fields: Record<string, string>): Request {
	return new Request(url, {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams(fields)
	});
}

function jsonRequest(url: string, body: Record<string, unknown>): Request {
	return new Request(url, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body)
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

function seedRoot(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-own', 'Own Center'), ('center-other', 'Other Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-own', 'admin'), ('admin-other', 'admin'), ('teacher-own', 'teacher');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-own', 'admin-own', NULL),
			('session-admin-other', 'admin-other', NULL),
			('session-teacher-own', 'teacher-own', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-own', 'admin-own'),
			('center-own', 'teacher-own'),
			('center-other', 'admin-other');
	`);
	return root;
}

function state(root: CompositionRoot): StateSnapshot {
	return root.database.sqlite
		.prepare(`
			SELECT
				(SELECT COUNT(*) FROM accounts) AS accounts,
				(SELECT COUNT(*) FROM invitations) AS invitations,
				(SELECT COUNT(*) FROM center_memberships) AS memberships,
				(SELECT COUNT(*) FROM external_identities) AS identities,
				(SELECT COUNT(*) FROM sessions) AS sessions
		`)
			.get() as StateSnapshot;
}

function provisionedState(root: CompositionRoot): ProvisionedStateSnapshot {
	return root.database.sqlite
		.prepare(`
			SELECT
				(SELECT COUNT(*) FROM accounts WHERE id LIKE 'account_%') AS accounts,
				(SELECT COUNT(*) FROM invitations WHERE account_id LIKE 'account_%') AS invitations,
				(SELECT COUNT(*) FROM center_memberships WHERE account_id LIKE 'account_%') AS memberships
		`)
			.get() as ProvisionedStateSnapshot;
}

function actor(root: CompositionRoot, sessionToken: string) {
	return root.identityAccess.resolveActor(sessionToken);
}

function adminEvent(
	root: CompositionRoot,
	transport: AdminProvisioningTransport,
	request: Request,
	centerId = 'center-own',
	sessionToken = 'session-admin-own'
) {
	return requestEvent(
		`https://calendar.test/admin/${centerId}/participants`,
		centerId,
		actor(root, sessionToken),
		cookieJar({ foundation_session: sessionToken }).cookies,
		request
	);
}

function tokenFromInvitationUrl(invitationUrl: string): string {
	return new URL(invitationUrl).pathname.split('/').at(-1)!;
}

function providerDouble(provider: 'telegram' | 'google', subject: string): ProviderAdapter {
	return {
		provider,
		begin: ({ state }) => `https://provider.test/${provider}?state=${encodeURIComponent(state)}`,
		verifyCallback: vi.fn(async () => ({ provider, subject }))
	};
}

function authTransport(root: CompositionRoot, subject: string): AuthenticationTransport {
	return createAuthenticationTransport({
		identityAccess: root.identityAccess,
		providers: new ProviderAdapterRegistry([providerDouble('google', subject)]),
		stateStore: new AuthenticationStateStore({ stateFactory: () => `state-${subject}` })
	});
}

async function acceptInvitation(
	root: CompositionRoot,
	token: string,
	subject: string
): Promise<{ accountId: string; sessionToken: string }> {
	const transport = authTransport(root, subject);
	const startCookies = cookieJar();
	const start = await thrown(() =>
		transport.start(
			providerRequestEvent(
				`https://calendar.test/auth/google/start?invitation=${encodeURIComponent(token)}`,
				'google',
				startCookies.cookies,
				new Request(`https://calendar.test/auth/google/start?invitation=${encodeURIComponent(token)}`)
			)
		)
	);
	const stateValue = new URL(start.location).searchParams.get('state')!;
	const sessionCookies = cookieJar(
		Object.fromEntries(startCookies.cookies.getAll().map(({ name, value }) => [name, value]))
	);
	const callbackUrl = `https://calendar.test/auth/google/callback?state=${encodeURIComponent(stateValue)}`;
	const callback = await thrown(() =>
		transport.callback(
			providerRequestEvent(callbackUrl, 'google', sessionCookies.cookies, new Request(callbackUrl))
		)
	);
	expect(callback).toMatchObject({ status: 303, location: '/' });
	const invitation = root.database.sqlite
		.prepare('SELECT account_id FROM invitations WHERE token = ?')
		.get(token) as InvitationAccountRow | undefined;
	if (!invitation) throw new Error('invitation not found after acceptance');
	return {
		accountId: invitation.account_id,
		sessionToken: sessionCookies.writes[0].value
	};
}

describe('protected Admin participant transport', () => {
	let root: CompositionRoot;
	let transport: AdminProvisioningTransport;

	beforeEach(() => {
		root = seedRoot();
		transport = createAdminProvisioningTransport(root.centerScheduling, {
			now: () => new Date('2026-08-11T00:00:00.000Z')
		});
	});

	afterEach(() => root.database.close());

	it('guards SSR and form actions for unauthenticated, non-Admin, and wrong-center requests', async () => {
		const load = createAdminPageLoad(transport);
		const unauthorized = await thrown(() =>
			load(
				requestEvent(
					'https://calendar.test/admin/center-own/participants',
					'center-own',
					null,
					cookieJar().cookies
				)
			)
		);
		expect(unauthorized).toMatchObject({ status: 303, location: '/login' });

		for (const [sessionToken, centerId] of [
			['session-teacher-own', 'center-own'],
			['session-admin-own', 'center-other']
		] as const) {
			const rejected = await thrown(() =>
				load(
					requestEvent(
						`https://calendar.test/admin/${centerId}/participants`,
						centerId,
						actor(root, sessionToken),
						cookieJar({ foundation_session: sessionToken }).cookies
					)
				)
			);
			expect(rejected).toMatchObject({ status: 403, body: { message: 'Forbidden' } });
		}

		const before = state(root);
		const action = createAdminActions(transport);
		const result = await action.default(
			requestEvent(
				'https://calendar.test/admin/center-own/participants',
				'center-own',
				null,
				cookieJar().cookies,
				formRequest('https://calendar.test/admin/center-own/participants', { role: 'student' })
			)
		);
		expect(result).toMatchObject({ status: 401, data: { error: 'unauthorized' } });
		expect(state(root)).toEqual(before);
	});

	it('allows only an own-center Admin, ignores client scope fields, and returns a safe invitation status', async () => {
		const before = state(root);
		const action = createAdminActions(transport);
		const success = await action.default(
			adminEvent(
				root,
				transport,
				formRequest('https://calendar.test/admin/center-own/participants', {
					role: 'student',
					centerId: 'center-other',
					accountId: 'attacker-account',
					admin: 'true'
				})
			)
		);
		expect(success).toMatchObject({ ok: true, status: 'pending' });
		const invitationUrl = (success as { invitationUrl: string }).invitationUrl;
		const token = tokenFromInvitationUrl(invitationUrl);
		const created = root.database.sqlite
			.prepare('SELECT account_id, status, expires_at FROM invitations WHERE token = ?')
			.get(token) as { account_id: string; status: string; expires_at: string };
		expect(created).toMatchObject({ status: 'pending' });
		expect(created.account_id).not.toBe('attacker-account');
		expect(created.account_id).toMatch(/^account_[0-9a-f]{32}$/);
		expect(root.database.sqlite.prepare('SELECT role FROM accounts WHERE id = ?').get(created.account_id)).toEqual({
			role: 'student'
		});
		expect(
			root.database.sqlite
				.prepare('SELECT 1 FROM center_memberships WHERE center_id = ? AND account_id = ?')
				.get('center-own', created.account_id)
		).toEqual({ 1: 1 });
		expect(state(root)).toEqual({
			accounts: before.accounts + 1,
			invitations: before.invitations + 1,
			memberships: before.memberships + 1,
			identities: before.identities,
			sessions: before.sessions
		});
		expect((success as { expiresAt: string }).expiresAt).toBe(created.expires_at);

		const api = createAdminPostHandler(transport);
		const apiResponse = await api(
			adminEvent(
				root,
				transport,
				jsonRequest('https://calendar.test/admin/center-own/participants', {
					role: 'teacher',
					centerId: 'center-other',
					accountId: 'attacker-again',
					admin: false
				})
			)
		);
		expect(apiResponse.status).toBe(200);
		const apiBody = (await apiResponse.json()) as { invitationUrl: string; status: string };
		expect(apiBody.status).toBe('pending');
		expect(tokenFromInvitationUrl(apiBody.invitationUrl)).not.toBe(token);
		expect(state(root)).toEqual({
			accounts: before.accounts + 2,
			invitations: before.invitations + 2,
			memberships: before.memberships + 2,
			identities: before.identities,
			sessions: before.sessions
		});

		const invalidRole = await action.default(
			adminEvent(
				root,
				transport,
				formRequest('https://calendar.test/admin/center-own/participants', { role: 'admin' })
			)
		);
		expect(invalidRole).toMatchObject({ status: 400, data: { error: 'invalid_role' } });
	});

	it('reaches the existing one-time invitation browser path and keeps duplicate/replay errors safe', async () => {
		const result = transport.provision(
			adminEvent(
				root,
				transport,
				formRequest('https://calendar.test/admin/center-own/participants', { role: 'parent' })
			),
			'parent'
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const token = tokenFromInvitationUrl(result.invitationUrl);
		const accepted = await acceptInvitation(root, token, 'provisioned-subject');
		expect(root.database.sqlite.prepare('SELECT status FROM invitations WHERE token = ?').get(token)).toEqual({
			status: 'consumed'
		});
		expect(root.identityAccess.resolveActor(accepted.sessionToken)).toEqual({
			accountId: accepted.accountId,
			role: 'parent'
		});

		const replayTransport = authTransport(root, 'provisioned-subject');
		const replay = await thrown(() =>
			replayTransport.invitePage(
				requestEvent(`https://calendar.test/invite/${token}`, 'center-own', null, cookieJar().cookies)
			)
		);
		expect(replay).toMatchObject({ status: 410, body: { message: 'Invitation is invalid or expired' } });

		const duplicateResult = transport.provision(
			adminEvent(
				root,
				transport,
				formRequest('https://calendar.test/admin/center-own/participants', { role: 'teacher' })
			),
			'teacher'
		);
		expect(duplicateResult.ok).toBe(true);
		if (!duplicateResult.ok) return;
		const duplicateToken = tokenFromInvitationUrl(duplicateResult.invitationUrl);
		const duplicateStartTransport = authTransport(root, 'provisioned-subject');
		const duplicateStartCookies = cookieJar();
		const duplicateStart = await thrown(() =>
			duplicateStartTransport.start(
				providerRequestEvent(
					`https://calendar.test/auth/google/start?invitation=${duplicateToken}`,
					'google',
					duplicateStartCookies.cookies
				)
			)
		);
		const duplicateState = new URL(duplicateStart.location).searchParams.get('state')!;
		const duplicateCallback = await thrown(() =>
			duplicateStartTransport.callback(
				providerRequestEvent(
					`https://calendar.test/auth/google/callback?state=${encodeURIComponent(duplicateState)}`,
					'google',
					duplicateStartCookies.cookies
				)
			)
		);
		expect(duplicateCallback).toMatchObject({
			status: 410,
			body: { message: 'Invitation is invalid or no longer available' }
		});
		expect(root.database.sqlite.prepare('SELECT status FROM invitations WHERE token = ?').get(duplicateToken)).toEqual({
			status: 'pending'
		});
	});

	it('shows safe expiry/revocation errors and rolls back account, invitation, and membership together', async () => {
		for (const status of ['expired', 'revoked'] as const) {
			const result = transport.provision(
				adminEvent(
					root,
					transport,
					formRequest('https://calendar.test/admin/center-own/participants', { role: 'student' })
				),
				'student'
			);
			expect(result.ok).toBe(true);
			if (!result.ok) continue;
			const token = tokenFromInvitationUrl(result.invitationUrl);
			if (status === 'expired') {
				root.database.sqlite
					.prepare('UPDATE invitations SET expires_at = ? WHERE token = ?')
					.run('2000-01-01T00:00:00.000Z', token);
			} else {
				root.database.sqlite
					.prepare("UPDATE invitations SET status = 'revoked' WHERE token = ?")
					.run(token);
			}
			const rejection = await thrown(() =>
				authTransport(root, `subject-${status}`).invitePage(
					requestEvent(`https://calendar.test/invite/${token}`, 'center-own', null, cookieJar().cookies)
				)
			);
			expect(rejection).toMatchObject({ status: 410, body: { message: 'Invitation is invalid or expired' } });
		}

		root.database.sqlite.exec(`
			CREATE TRIGGER fail_admin_membership_insert
			BEFORE INSERT ON center_memberships
			WHEN NEW.account_id LIKE 'account_%'
			BEGIN
				SELECT RAISE(ABORT, 'induced-membership-failure');
			END;
		`);
		const before = state(root);
		const beforeProvisioned = provisionedState(root);
		const rollback = transport.provision(
			adminEvent(
				root,
				transport,
				formRequest('https://calendar.test/admin/center-own/participants', { role: 'student' })
			),
			'student'
		);
		expect(rollback).toEqual({ ok: false, status: 500, error: 'provisioning_failed' });
		expect(state(root)).toEqual(before);
		expect(provisionedState(root)).toEqual(beforeProvisioned);
	});

	it('returns no authorization or persistence details and keeps route adapters free of direct writes/provider logic', async () => {
		const api = createAdminPostHandler(transport);
		const before = state(root);
		const unauthorized = await api(
			requestEvent(
				'https://calendar.test/admin/center-own/participants',
				'center-own',
				null,
				cookieJar().cookies,
				jsonRequest('https://calendar.test/admin/center-own/participants', {
					role: 'student',
					centerId: 'center-other',
					accountId: 'secret-account',
					admin: true
				})
			)
		);
		expect(unauthorized.status).toBe(401);
		expect(await unauthorized.json()).toEqual({ error: 'unauthorized' });
		expect(state(root)).toEqual(before);

		const sourceFiles = [
			'src/routes/admin/provisioning.server.ts',
			'src/routes/admin/[centerId]/participants/+page.server.ts',
			'src/routes/admin/[centerId]/participants/+server.ts'
		];
		for (const file of sourceFiles) {
			const source = readFileSync(file, 'utf8');
			expect(source).not.toMatch(/sqlite|prepare|createAccount|issueInvitation|TELEGRAM_BOT_TOKEN|GOOGLE_CLIENT_SECRET/);
		}
	});
});
