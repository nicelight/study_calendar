import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

const verifiedProvider = {
	verify: () => true
};

describe('Foundation walking skeleton', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
	});

	afterEach(() => {
		root.database.close();
	});

	it('round-trips an isolated fixture through the shared database adapter', () => {
		root.database.sqlite.exec(
			'CREATE TEMP TABLE foundation_fixture (id TEXT PRIMARY KEY, value TEXT NOT NULL)'
		);
		root.database.sqlite
			.prepare('INSERT INTO foundation_fixture (id, value) VALUES (?, ?)')
			.run('fixture-1', 'roundtrip');

		const row = root.database.sqlite
			.prepare('SELECT id, value FROM foundation_fixture WHERE id = ?')
			.get('fixture-1') as { id: string; value: string } | undefined;

		expect(row).toEqual({ id: 'fixture-1', value: 'roundtrip' });
	});

	it('resolves a server actor and reaches only the accepted public seams', () => {
		root.database.sqlite.exec(`
			INSERT INTO accounts (id, role) VALUES ('account-1', 'teacher');
			INSERT INTO centers (id, name) VALUES ('center-1', 'Foundation Center');
			INSERT INTO center_memberships (center_id, account_id) VALUES ('center-1', 'account-1');
		`);
		root.database.sqlite
			.prepare('INSERT INTO external_identities (provider, subject, account_id) VALUES (?, ?, ?)')
			.run('google', 'foundation-subject', 'account-1');
		const sessionToken = root.identityAccess.authenticateVerifiedIdentity({
			provider: 'google',
			subject: 'foundation-subject'
		});

		const actor = root.identityAccess.resolveActor(sessionToken);

		expect(actor).toEqual({ accountId: 'account-1', role: 'teacher' });
		expect(root.centerScheduling.getAuthorizedCenterScope(actor, 'center-1')).toEqual({
			centerId: 'center-1',
			accountId: 'account-1',
			role: 'teacher'
		});
		expect(root.centerScheduling.getAuthorizedCenterScope(null, 'center-1')).toBeNull();
	});

	it('rolls back invitation consumption when a provider binding fails', () => {
		root.database.sqlite.exec("INSERT INTO accounts (id, role) VALUES ('account-1', 'student'), ('account-2', 'student')");
		root.database.sqlite.prepare("INSERT INTO invitations (token, account_id, status, expires_at) VALUES (?, ?, 'pending', ?)").run('invite-1', 'account-1', new Date(Date.now() + 86_400_000).toISOString());
		root.database.sqlite.prepare("INSERT INTO invitations (token, account_id, status, expires_at) VALUES (?, ?, 'pending', ?)").run('invite-2', 'account-2', new Date(Date.now() + 86_400_000).toISOString());

		root.identityAccess.bindProvider(
			{
				invitationToken: 'invite-1',
				provider: 'google',
				providerSubject: 'subject-1'
			},
			verifiedProvider
		);

		const stateBefore = root.database.sqlite
			.prepare(`
				SELECT
					(SELECT status FROM invitations WHERE token = 'invite-2') AS invitation_status,
					(SELECT COUNT(*) FROM external_identities WHERE account_id = 'account-2') AS identity_count
			`)
			.get() as { invitation_status: string; identity_count: number };

		expect(() =>
			root.identityAccess.bindProvider(
				{
					invitationToken: 'invite-2',
					provider: 'google',
					providerSubject: 'subject-1'
				},
				verifiedProvider
			)
		).toThrow();

		const stateAfter = root.database.sqlite
			.prepare(`
				SELECT
					(SELECT status FROM invitations WHERE token = 'invite-2') AS invitation_status,
					(SELECT COUNT(*) FROM external_identities WHERE account_id = 'account-2') AS identity_count
			`)
			.get() as { invitation_status: string; identity_count: number };

		expect(stateAfter).toEqual(stateBefore);
	});

	it('rejects provider failure and invitation reuse without changing binding state', () => {
		root.database.sqlite.prepare("INSERT INTO accounts (id, role) VALUES (?, 'student')").run('account-1');
		root.database.sqlite.prepare("INSERT INTO invitations (token, account_id, status, expires_at) VALUES (?, ?, 'pending', ?)").run('invite-1', 'account-1', new Date(Date.now() + 86_400_000).toISOString());
		const failedProvider = { verify: () => false };

		expect(() =>
			root.identityAccess.bindProvider(
				{
					invitationToken: 'invite-1',
					provider: 'telegram',
					providerSubject: 'subject-1'
				},
				failedProvider
			)
		).toThrow('provider-verification-failed');

		const stateAfterProviderFailure = root.database.sqlite
			.prepare(`
				SELECT
					(SELECT status FROM invitations WHERE token = 'invite-1') AS invitation_status,
					(SELECT COUNT(*) FROM external_identities WHERE account_id = 'account-1') AS identity_count
			`)
			.get() as { invitation_status: string; identity_count: number };

		expect(stateAfterProviderFailure).toEqual({ invitation_status: 'pending', identity_count: 0 });

		root.identityAccess.bindProvider(
			{
				invitationToken: 'invite-1',
				provider: 'telegram',
				providerSubject: 'subject-1'
			},
			verifiedProvider
		);

		expect(() =>
			root.identityAccess.bindProvider(
				{
					invitationToken: 'invite-1',
					provider: 'telegram',
					providerSubject: 'subject-2'
				},
				verifiedProvider
			)
		).toThrow('invalid-invitation');

		const stateAfterReuse = root.database.sqlite
			.prepare(`
				SELECT
					(SELECT status FROM invitations WHERE token = 'invite-1') AS invitation_status,
					(SELECT COUNT(*) FROM external_identities WHERE account_id = 'account-1') AS identity_count
			`)
			.get() as { invitation_status: string; identity_count: number };

		expect(stateAfterReuse).toEqual({ invitation_status: 'consumed', identity_count: 1 });
	});
});
