import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { ProviderAdapterRegistry, type ProviderAdapter } from '../../src/lib/server/adapters';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { AuthenticationStateStore } from '../../src/lib/server/platform/auth-state';
import { createAuthenticationTransport } from '../../src/routes/auth/transport.server';
import { createAdminActions, createAdminPageLoad } from '../../src/routes/admin/participants-page.server';
import { createAdminPostHandler } from '../../src/routes/admin/participants-api.server';
import { createAdminProvisioningTransport } from '../../src/routes/admin/provisioning.server';

type CookieJar = ReturnType<typeof cookieJar>;
type Snapshot = {
	accounts: number;
	invitations: number;
	memberships: number;
	identities: number;
	sessions: number;
};

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

function state(root: CompositionRoot): Snapshot {
	return root.database.sqlite.prepare(`
		SELECT
			(SELECT COUNT(*) FROM accounts) AS accounts,
			(SELECT COUNT(*) FROM invitations) AS invitations,
			(SELECT COUNT(*) FROM center_memberships) AS memberships,
			(SELECT COUNT(*) FROM external_identities) AS identities,
			(SELECT COUNT(*) FROM sessions) AS sessions
	`).get() as Snapshot;
}

function seedRoot(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-own', 'Own'), ('center-other', 'Other');
		INSERT INTO accounts (id, role) VALUES
			('admin-own', 'admin'), ('admin-other', 'admin'), ('teacher-own', 'teacher');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-own', 'admin-own', NULL),
			('session-admin-other', 'admin-other', NULL),
			('session-teacher-own', 'teacher-own', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-own', 'admin-own'), ('center-other', 'admin-other'),
			('center-own', 'teacher-own');
	`);
	return root;
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

function authEvent(url: string, provider: 'google', cookies: CookieJar['cookies']): RequestEvent {
	return {
		url: new URL(url),
		params: { provider },
		request: new Request(url),
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

function adminEvent(
	root: CompositionRoot,
	centerId = 'center-own',
	sessionToken = 'session-admin-own',
	request = new Request(`https://calendar.test/admin/${centerId}/participants`)
): RequestEvent {
	return requestEvent(
		`https://calendar.test/admin/${centerId}/participants`,
		centerId,
		root.identityAccess.resolveActor(sessionToken),
		cookieJar({ foundation_session: sessionToken }).cookies,
		request
	);
}

function tokenFrom(url: string): string {
	return new URL(url).pathname.split('/').at(-1)!;
}

function providerDouble(subject: string): ProviderAdapter {
	return {
		provider: 'google',
		begin: ({ state }) => `https://provider.test/google?state=${encodeURIComponent(state)}`,
		verifyCallback: vi.fn(async () => ({ provider: 'google' as const, subject }))
	};
}

function authTransport(root: CompositionRoot, subject: string, stateStore = new AuthenticationStateStore()) {
	return createAuthenticationTransport({
		identityAccess: root.identityAccess,
		providers: new ProviderAdapterRegistry([providerDouble(subject)]),
		stateStore
	});
}

async function acceptInvitation(root: CompositionRoot, token: string, subject: string) {
	const stateStore = new AuthenticationStateStore({ stateFactory: () => `state-${subject}` });
	const transport = authTransport(root, subject, stateStore);
	const start = await thrown(() => transport.start(
		authEvent(
			`https://calendar.test/auth/google/start?invitation=${encodeURIComponent(token)}`,
			'google',
			cookieJar().cookies
		)
	));
	const stateValue = new URL(start.location).searchParams.get('state')!;
	const cookies = cookieJar();
	const callback = await thrown(() => transport.callback(
		authEvent(
			`https://calendar.test/auth/google/callback?state=${encodeURIComponent(stateValue)}`,
			'google',
			cookies.cookies
		)
	));
	return { transport, stateStore, stateValue, cookies, callback };
}

describe('TASK-021 independent protected Admin provisioning probe', () => {
	let root: CompositionRoot;

	afterEach(() => root?.database.close());

	it('protects SSR, form, and JSON actions with generic denial before mutation', async () => {
		root = seedRoot();
		const transport = createAdminProvisioningTransport(root.centerScheduling);
		const load = createAdminPageLoad(transport);
		const action = createAdminActions(transport);
		const api = createAdminPostHandler(transport);
		const before = state(root);

		const unauthenticatedPage = await thrown(() => load(
			requestEvent('https://calendar.test/admin/center-own/participants', 'center-own', null, cookieJar().cookies)
		));
		expect(unauthenticatedPage).toMatchObject({ status: 303, location: '/login' });

		for (const [sessionToken, centerId] of [
			['session-teacher-own', 'center-own'],
			['session-admin-own', 'center-other']
		] as const) {
			const page = await thrown(() => load(
				adminEvent(root!, centerId, sessionToken)
			));
			expect(page).toMatchObject({ status: 403, body: { message: 'Forbidden' } });
		}

		for (const sessionToken of ['missing', 'session-teacher-own', 'session-admin-other'] as const) {
			const centerId = sessionToken === 'session-admin-other' ? 'center-own' : 'center-own';
			const formResult = await action.default(
				adminEvent(root, centerId, sessionToken, formRequest(
					`https://calendar.test/admin/${centerId}/participants`,
					{ role: 'student', centerId: 'center-other', accountId: 'caller-id', admin: 'true' }
				))
			);
			if (sessionToken === 'missing') {
				expect(formResult).toMatchObject({ status: 401, data: { error: 'unauthorized' } });
			} else {
				expect(formResult).toMatchObject({ status: 403, data: { error: 'forbidden' } });
			}

			const response = await api(
				adminEvent(root, centerId, sessionToken, jsonRequest(
					`https://calendar.test/admin/${centerId}/participants`,
					{ role: 'student', centerId: 'center-other', accountId: 'caller-id', admin: true }
				))
			);
			expect(response.status).toBe(sessionToken === 'missing' ? 401 : 403);
			expect(await response.json()).toEqual({ error: sessionToken === 'missing' ? 'unauthorized' : 'forbidden' });
		}

		expect(state(root)).toEqual(before);
	});

	it('uses only server scope, generates identities, and supports each participant role', async () => {
		root = seedRoot();
		const transport = createAdminProvisioningTransport(root.centerScheduling, {
			now: () => new Date('2026-08-11T00:00:00.000Z')
		});
		const action = createAdminActions(transport);

		for (const [role, mode] of [['teacher', 'form'], ['student', 'api'], ['parent', 'form']] as const) {
			const url = 'https://calendar.test/admin/center-own/participants';
			const request = mode === 'form'
				? formRequest(url, { role, centerId: 'center-other', accountId: 'caller-id', admin: 'false' })
				: jsonRequest(url, { role, centerId: 'center-other', accountId: 'caller-id', admin: false });
			const result = mode === 'form'
				? await action.default(adminEvent(root, 'center-own', 'session-admin-own', request))
				: await createAdminPostHandler(transport)(adminEvent(root, 'center-own', 'session-admin-own', request));
			const payload = mode === 'form' ? result : await (result as Response).json();
			if (mode === 'form') {
				expect(payload).toMatchObject({ ok: true, status: 'pending' });
			} else {
				expect(payload).toMatchObject({ status: 'pending' });
			}
			const invitationUrl = (payload as { invitationUrl: string }).invitationUrl;
			expect(invitationUrl).toMatch(/^https:\/\/calendar\.test\/invite\/[A-Za-z0-9_-]+$/);
			const token = tokenFrom(invitationUrl);
			const invitation = root.database.sqlite.prepare(
				'SELECT account_id, status, expires_at FROM invitations WHERE token = ?'
			).get(token) as { account_id: string; status: string; expires_at: string };
			expect(invitation.status).toBe('pending');
			expect(invitation.account_id).toMatch(/^account_[0-9a-f]{32}$/);
			expect(root.database.sqlite.prepare('SELECT role FROM accounts WHERE id = ?').get(invitation.account_id)).toEqual({ role });
			expect(root.database.sqlite.prepare(
				'SELECT 1 FROM center_memberships WHERE center_id = ? AND account_id = ?'
			).get('center-own', invitation.account_id)).toEqual({ 1: 1 });
			expect(root.database.sqlite.prepare(
				'SELECT 1 FROM center_memberships WHERE center_id = ? AND account_id = ?'
			).get('center-other', invitation.account_id)).toBeUndefined();
			expect((payload as { expiresAt?: string }).expiresAt ?? (payload as { expires_at?: string }).expires_at).toBe(invitation.expires_at);
		}

		const invalid = await action.default(adminEvent(
			root,
			'center-own',
			'session-admin-own',
			formRequest('https://calendar.test/admin/center-own/participants', { role: 'admin' })
		));
		expect(invalid).toMatchObject({ status: 400, data: { error: 'invalid_role' } });
	});

	it('hands the URL into TASK-020 and preserves safe duplicate, replay, revoke, and expiry behavior', async () => {
		root = seedRoot();
		const admin = createAdminProvisioningTransport(root.centerScheduling, {
			now: () => new Date('2026-08-11T00:00:00.000Z')
		});
		const provisioned = admin.provision(adminEvent(root), 'parent');
		expect(provisioned.ok).toBe(true);
		if (!provisioned.ok) return;
		const token = tokenFrom(provisioned.invitationUrl);
		const accepted = await acceptInvitation(root, token, 'admin-provisioned-subject');
		expect(accepted.callback).toMatchObject({ status: 303, location: '/' });
		expect(root.database.sqlite.prepare('SELECT status FROM invitations WHERE token = ?').get(token)).toEqual({ status: 'consumed' });
		const acceptedIdentity = root.database.sqlite.prepare(
			'SELECT provider, subject, account_id FROM external_identities WHERE subject = ?'
		).get('admin-provisioned-subject') as { provider: string; subject: string; account_id: string };
		expect(acceptedIdentity).toMatchObject({ provider: 'google', subject: 'admin-provisioned-subject' });
		expect(root.database.sqlite.prepare('SELECT role FROM accounts WHERE id = ?').get(acceptedIdentity.account_id)).toEqual({ role: 'parent' });
		expect(root.database.sqlite.prepare(
			'SELECT 1 FROM center_memberships WHERE center_id = ? AND account_id = ?'
		).get('center-own', acceptedIdentity.account_id)).toEqual({ 1: 1 });
	expect(root.identityAccess.resolveActor(accepted.cookies.writes[0].value)).toEqual({
		accountId: acceptedIdentity.account_id,
		role: 'parent'
	});

		const replay = await thrown(() => accepted.transport.callback(
			authEvent(`https://calendar.test/auth/google/callback?state=${encodeURIComponent(accepted.stateValue)}`, 'google', cookieJar().cookies)
		));
		expect(replay).toMatchObject({ status: 400, body: { message: 'Invalid authentication state' } });
		const consumedPage = await thrown(() => accepted.transport.invitePage(
			requestEvent(`https://calendar.test/invite/${token}`, 'center-own', null, cookieJar().cookies)
		));
		expect(consumedPage).toMatchObject({ status: 410, body: { message: 'Invitation is invalid or expired' } });

		const duplicate = admin.provision(adminEvent(root), 'teacher');
		expect(duplicate.ok).toBe(true);
		if (!duplicate.ok) return;
		const duplicateToken = tokenFrom(duplicate.invitationUrl);
		const duplicateBefore = state(root);
		const duplicateStateStore = new AuthenticationStateStore({ stateFactory: () => 'duplicate-state' });
		const duplicateTransport = authTransport(root, 'admin-provisioned-subject', duplicateStateStore);
		const duplicateStart = await thrown(() => duplicateTransport.start(
			authEvent(`https://calendar.test/auth/google/start?invitation=${encodeURIComponent(duplicateToken)}`, 'google', cookieJar().cookies)
		));
		const duplicateState = new URL(duplicateStart.location).searchParams.get('state')!;
		const duplicateAttempt = await thrown(() => duplicateTransport.callback(
			authEvent(`https://calendar.test/auth/google/callback?state=${encodeURIComponent(duplicateState)}`, 'google', cookieJar().cookies)
		));
		expect(duplicateAttempt).toMatchObject({ status: 410, body: { message: 'Invitation is invalid or no longer available' } });
		expect(root.database.sqlite.prepare('SELECT status FROM invitations WHERE token = ?').get(duplicateToken)).toEqual({ status: 'pending' });
		expect(state(root).sessions).toBe(duplicateBefore.sessions);
		expect(state(root).identities).toBe(duplicateBefore.identities);

		for (const status of ['revoked', 'expired'] as const) {
			const result = admin.provision(adminEvent(root), 'student');
			expect(result.ok).toBe(true);
			if (!result.ok) continue;
			const invalidToken = tokenFrom(result.invitationUrl);
			if (status === 'revoked') {
				root.database.sqlite.prepare("UPDATE invitations SET status = 'revoked' WHERE token = ?").run(invalidToken);
			} else {
				root.database.sqlite.prepare('UPDATE invitations SET expires_at = ? WHERE token = ?').run('2000-01-01T00:00:00.000Z', invalidToken);
			}
			const before = state(root);
			const rejection = await thrown(() => authTransport(root!, `unused-${status}`).invitePage(
				requestEvent(`https://calendar.test/invite/${invalidToken}`, 'center-own', null, cookieJar().cookies)
			));
			expect(rejection).toMatchObject({ status: 410, body: { message: 'Invitation is invalid or expired' } });
			expect(state(root)).toEqual(before);
		}
	});

	it('rolls back account, invitation, and membership atomically on membership failure', () => {
		root = seedRoot();
		const transport = createAdminProvisioningTransport(root.centerScheduling);
		root.database.sqlite.exec(`
			CREATE TRIGGER fail_admin_membership_insert_review
			BEFORE INSERT ON center_memberships
			WHEN NEW.account_id LIKE 'account_%'
			BEGIN
				SELECT RAISE(ABORT, 'induced-membership-failure');
			END;
		`);
		const before = state(root);
		const result = transport.provision(adminEvent(root), 'student');
		expect(result).toEqual({ ok: false, status: 500, error: 'provisioning_failed' });
		expect(state(root)).toEqual(before);
	});
});
