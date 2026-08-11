import { afterEach, describe, expect, it } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { createAdminProvisioningTransport } from '../../src/routes/admin/provisioning.server';

function cookies(sessionToken: string) {
	return {
		get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined),
		set: () => undefined,
		delete: () => undefined,
		getAll: () => [],
		serialize: () => ''
	};
}

function event(
	centerId: string,
	localActor: { accountId: string; role: 'admin' | 'teacher' } | null,
	cookieSession: string
): RequestEvent {
	const url = `https://calendar.test/admin/${centerId}/participants`;
	return {
		url: new URL(url),
		params: { centerId },
		request: new Request(url),
		cookies: cookies(cookieSession),
		locals: { actor: localActor }
	} as unknown as RequestEvent;
}

function snapshot(root: CompositionRoot) {
	return root.database.sqlite.prepare(`
		SELECT
			(SELECT COUNT(*) FROM accounts) AS accounts,
			(SELECT COUNT(*) FROM invitations) AS invitations,
			(SELECT COUNT(*) FROM center_memberships) AS memberships
	`).get();
}

describe('TASK-021 adversarial authorization-boundary probe', () => {
	let root: CompositionRoot;

	afterEach(() => root?.database.close());

	it('does not trust stale locals.actor or a mismatched client session cookie', () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES ('center-own', 'Own'), ('center-other', 'Other');
			INSERT INTO accounts (id, role) VALUES ('admin-own', 'admin'), ('teacher-own', 'teacher');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('session-admin-own', 'admin-own', NULL), ('session-teacher-own', 'teacher-own', NULL);
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('center-own', 'admin-own'), ('center-own', 'teacher-own');
		`);
		const transport = createAdminProvisioningTransport(root.centerScheduling);
		const before = snapshot(root);

		const staleLocalAdmin = transport.provision(
			event('center-own', { accountId: 'admin-own', role: 'admin' }, 'session-teacher-own'),
			'student'
		);
		expect(staleLocalAdmin).toEqual({ ok: false, status: 403, error: 'forbidden' });
		expect(snapshot(root)).toEqual(before);

		const nonAdminLocal = transport.provision(
			event('center-own', { accountId: 'teacher-own', role: 'teacher' }, 'session-admin-own'),
			'student'
		);
		expect(nonAdminLocal).toEqual({ ok: false, status: 403, error: 'forbidden' });
		expect(snapshot(root)).toEqual(before);

		const wrongCenter = transport.provision(
			event('center-other', { accountId: 'admin-own', role: 'admin' }, 'session-admin-own'),
			'student'
		);
		expect(wrongCenter).toEqual({ ok: false, status: 403, error: 'forbidden' });
		expect(snapshot(root)).toEqual(before);
	});
});
