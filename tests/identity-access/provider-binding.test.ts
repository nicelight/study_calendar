import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

type BindingState = {
	accounts: unknown[];
	invitations: unknown[];
	memberships: unknown[];
	identities: unknown[];
};

const verifiedProvider = {
	verify: () => true
};

describe('external identity binding', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES
				('center-own', 'Own Center'),
				('center-other', 'Other Center');
		`);
	});

	afterEach(() => root.database.close());

	function seedInvitation(input: {
		accountId: string;
		role: 'admin' | 'teacher' | 'student' | 'parent';
		invitationToken: string;
		centerId?: string;
	}): void {
		root.database.sqlite
			.prepare('INSERT INTO accounts (id, role) VALUES (?, ?)')
			.run(input.accountId, input.role);
		root.database.sqlite
			.prepare(
				"INSERT INTO invitations (token, account_id, status, expires_at) VALUES (?, ?, 'pending', ?)"
			)
			.run(input.invitationToken, input.accountId, new Date(Date.now() + 60_000).toISOString());
		root.database.sqlite
			.prepare('INSERT INTO center_memberships (center_id, account_id) VALUES (?, ?)')
			.run(input.centerId ?? 'center-own', input.accountId);
	}

	function state(): BindingState {
		return {
			accounts: root.database.sqlite
				.prepare('SELECT id, role FROM accounts ORDER BY id')
				.all(),
			invitations: root.database.sqlite
				.prepare('SELECT token, account_id, status FROM invitations ORDER BY token')
				.all(),
			memberships: root.database.sqlite
				.prepare('SELECT center_id, account_id FROM center_memberships ORDER BY center_id, account_id')
				.all(),
			identities: root.database.sqlite
				.prepare(
					'SELECT provider, subject, account_id FROM external_identities ORDER BY provider, subject'
				)
				.all()
		};
	}

	it.each([
		{ provider: 'telegram' as const, accountId: 'student-telegram', role: 'student' as const },
		{ provider: 'google' as const, accountId: 'teacher-google', role: 'teacher' as const }
	])(
		'binds $provider to exactly the invitation account and preserves server-owned role and membership',
		({ provider, accountId, role }) => {
			const invitationToken = `invite-${provider}`;
			const providerSubject = `subject-${provider}`;
			seedInvitation({ accountId, role, invitationToken });

			const bindingWithForgedRole = {
				invitationToken,
				provider,
				providerSubject,
				role: 'admin'
			};
			root.identityAccess.bindProvider(bindingWithForgedRole, verifiedProvider);

			expect(
				root.database.sqlite
					.prepare('SELECT account_id FROM external_identities WHERE provider = ? AND subject = ?')
					.get(provider, providerSubject)
			).toEqual({ account_id: accountId });
			expect(root.database.sqlite.prepare('SELECT role FROM accounts WHERE id = ?').get(accountId)).toEqual({
				role
			});
			expect(
				root.database.sqlite
					.prepare('SELECT center_id FROM center_memberships WHERE account_id = ?')
					.get(accountId)
			).toEqual({ center_id: 'center-own' });

			root.identityAccess.createSession({ token: `session-${provider}`, accountId });
			const actor = root.identityAccess.resolveActor(`session-${provider}`);
			expect(root.centerScheduling.getAuthorizedCenterScope(actor, 'center-own')).toMatchObject({
				accountId,
				role
			});
			expect(root.centerScheduling.getAuthorizedCenterScope(actor, 'center-other')).toBeNull();
		}
	);

	it('requires a confirmed current session and binds the other provider to the same account', () => {
		seedInvitation({
			accountId: 'student-both',
			role: 'student',
			invitationToken: 'invite-student-both'
		});
		root.identityAccess.bindProvider(
			{
				invitationToken: 'invite-student-both',
				provider: 'telegram',
				providerSubject: 'telegram-student-both'
			},
			verifiedProvider
		);
		root.identityAccess.createSession({ token: 'confirmed-session', accountId: 'student-both' });

		const beforeUnauthenticated = state();
		expect(() =>
			root.identityAccess.bindSecondProvider(
				{ provider: 'google', providerSubject: 'google-student-both' },
				verifiedProvider
			)
		).toThrow('confirmed-session-required');
		expect(state()).toEqual(beforeUnauthenticated);

		const beforeUnconfirmed = state();
		expect(() =>
			root.identityAccess.bindSecondProvider(
				{
					confirmedSessionToken: 'confirmed-session',
					provider: 'google',
					providerSubject: 'google-student-both'
				},
				verifiedProvider
			)
		).toThrow('confirmed-session-required');
		expect(state()).toEqual(beforeUnconfirmed);

		expect(() =>
			root.identityAccess.reconfirmSessionForProviderBinding(
				{
					sessionToken: 'confirmed-session',
					provider: 'telegram',
					providerSubject: 'not-the-session-owner'
				},
				verifiedProvider
			)
		).toThrow('session-reconfirmation-failed');
		root.identityAccess.reconfirmSessionForProviderBinding(
			{
				sessionToken: 'confirmed-session',
				provider: 'telegram',
				providerSubject: 'telegram-student-both'
			},
			verifiedProvider
		);

		root.identityAccess.bindSecondProvider(
			{
				confirmedSessionToken: 'confirmed-session',
				provider: 'google',
				providerSubject: 'google-student-both'
			},
			verifiedProvider
		);

		expect(
			root.database.sqlite
				.prepare(
					'SELECT provider, account_id FROM external_identities WHERE account_id = ? ORDER BY provider'
				)
				.all('student-both')
		).toEqual([
			{ provider: 'google', account_id: 'student-both' },
			{ provider: 'telegram', account_id: 'student-both' }
		]);
		expect(
			root.database.sqlite
				.prepare('SELECT COUNT(*) AS confirmations FROM provider_binding_confirmations')
				.get()
		).toEqual({ confirmations: 0 });
	});

	it('returns explicit provider failures without partial invitation or identity state', () => {
		seedInvitation({
			accountId: 'student-outage',
			role: 'student',
			invitationToken: 'invite-outage'
		});
		const beforeOutage = state();

		expect(() =>
			root.identityAccess.bindProvider(
				{
					invitationToken: 'invite-outage',
					provider: 'telegram',
					providerSubject: 'telegram-outage'
				},
				{ verify: () => false }
			)
		).toThrow('provider-verification-failed');
		expect(state()).toEqual(beforeOutage);

		seedInvitation({
			accountId: 'student-existing',
			role: 'student',
			invitationToken: 'invite-existing'
		});
		root.identityAccess.bindProvider(
			{
				invitationToken: 'invite-existing',
				provider: 'google',
				providerSubject: 'duplicate-callback-subject'
			},
			verifiedProvider
		);
		seedInvitation({
			accountId: 'student-callback',
			role: 'student',
			invitationToken: 'invite-callback'
		});
		const beforeCallbackFailure = state();

		expect(() =>
			root.identityAccess.bindProvider(
				{
					invitationToken: 'invite-callback',
					provider: 'google',
					providerSubject: 'duplicate-callback-subject'
				},
				verifiedProvider
			)
		).toThrow(/UNIQUE constraint failed/);
		expect(state()).toEqual(beforeCallbackFailure);
	});
});
