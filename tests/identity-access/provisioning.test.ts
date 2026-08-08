import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

describe('authoritative account provisioning boundary', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES ('center-own', 'Own Center'), ('center-other', 'Other Center');
			INSERT INTO accounts (id, role) VALUES ('admin-own', 'admin'), ('teacher-own', 'teacher'), ('admin-other', 'admin');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('session-admin-own', 'admin-own', NULL),
				('session-teacher-own', 'teacher-own', NULL),
				('session-admin-other', 'admin-other', NULL);
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('center-own', 'admin-own'), ('center-own', 'teacher-own'), ('center-other', 'admin-other');
		`);
	});

	afterEach(() => root.database.close());

	function state(): { accounts: number; invitations: number; memberships: number; identities: number } {
		return root.database.sqlite
			.prepare(`
				SELECT
					(SELECT COUNT(*) FROM accounts) AS accounts,
					(SELECT COUNT(*) FROM invitations) AS invitations,
					(SELECT COUNT(*) FROM center_memberships) AS memberships,
					(SELECT COUNT(*) FROM external_identities) AS identities
			`)
			.get() as { accounts: number; invitations: number; memberships: number; identities: number };
	}

	it('exposes one write command and rejects unauthorized or caller-forged scope before persistence', () => {
		const before = state();

		expect('createAccount' in root.identityAccess).toBe(false);
		expect('issueInvitation' in root.identityAccess).toBe(false);

		for (const sessionToken of [undefined, 'session-teacher-own', 'session-admin-other']) {
			expect(() =>
				root.centerScheduling.provisionAccount({
					sessionToken,
					centerId: 'center-own',
					accountId: `denied-${sessionToken ?? 'anonymous'}`,
					role: 'admin',
					invitationToken: `invite-${sessionToken ?? 'anonymous'}`
				})
			).toThrow('not-authorized');
		}

		expect(() =>
			root.centerScheduling.provisionAccount({
				sessionToken: 'session-admin-own',
				centerId: 'center-other',
				accountId: 'cross-center',
				role: 'teacher',
				invitationToken: 'invite-cross-center'
			})
		).toThrow('not-authorized');

		expect(state()).toEqual(before);
	});

	it('allows own-center Admin and commits account plus invitation together', () => {
		const before = state();

		root.centerScheduling.provisionAccount({
			sessionToken: 'session-admin-own',
			centerId: 'center-own',
			accountId: 'student-new',
			role: 'student',
			invitationToken: 'invite-new'
		});

		expect(state()).toEqual({ accounts: before.accounts + 1, invitations: 1, memberships: before.memberships, identities: 0 });
		expect(root.database.sqlite.prepare('SELECT role FROM accounts WHERE id = ?').get('student-new')).toEqual({ role: 'student' });
		expect(root.database.sqlite.prepare('SELECT status FROM invitations WHERE token = ?').get('invite-new')).toEqual({ status: 'pending' });
	});

	it('rolls back the account when duplicate invitation prevents provisioning', () => {
		root.database.sqlite
			.prepare("INSERT INTO invitations (token, account_id, status, expires_at) VALUES (?, ?, 'pending', ?)")
			.run('invite-duplicate', 'admin-own', new Date(Date.now() + 60_000).toISOString());
		const before = state();

		expect(() =>
			root.centerScheduling.provisionAccount({
				sessionToken: 'session-admin-own', centerId: 'center-own', accountId: 'rollback-account', role: 'student', invitationToken: 'invite-duplicate'
			})
		).toThrow();

		expect(state()).toEqual(before);
		expect(root.database.sqlite.prepare('SELECT 1 FROM accounts WHERE id = ?').get('rollback-account')).toBeUndefined();
	});

	it('rejects reused or expired invitations without changing state', () => {
		root.centerScheduling.provisionAccount({
			sessionToken: 'session-admin-own', centerId: 'center-own', accountId: 'first-account', role: 'student', invitationToken: 'reusable'
		});
		root.identityAccess.bindProvider({ invitationToken: 'reusable', provider: 'google', providerSubject: 'subject-1' }, { verify: () => true });
		const beforeReuse = state();
		expect(() => root.identityAccess.bindProvider({ invitationToken: 'reusable', provider: 'google', providerSubject: 'subject-2' }, { verify: () => true })).toThrow('invalid-invitation');
		expect(state()).toEqual(beforeReuse);

		root.database.sqlite
			.prepare("INSERT INTO invitations (token, account_id, status, expires_at) VALUES (?, ?, 'pending', ?)")
			.run('expired', 'first-account', new Date(Date.now() - 60_000).toISOString());
		const beforeExpired = state();
		expect(() => root.identityAccess.bindProvider({ invitationToken: 'expired', provider: 'telegram', providerSubject: 'subject-3' }, { verify: () => true })).toThrow('invalid-invitation');
		expect(state()).toEqual(beforeExpired);
	});
});
