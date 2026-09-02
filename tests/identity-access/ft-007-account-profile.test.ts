import { afterEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const REGISTERED_AT = '2099-01-02T03:04:05.000Z';

describe('FT-007-AC-008 account profile facts and queries', () => {
	const databases: SharedDatabase[] = [];

	afterEach(() => {
		for (const database of databases.splice(0)) database.close();
	});

	function rootWithAdmin(): CompositionRoot {
		const root = createCompositionRoot({ databaseFilename: ':memory:' });
		databases.push(root.database);
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES ('center-own', 'Own Center');
			INSERT INTO accounts (id, role) VALUES ('admin-own', 'admin');
			INSERT INTO sessions (token, account_id, revoked_at)
			VALUES ('session-admin-own', 'admin-own', NULL);
			INSERT INTO center_memberships (center_id, account_id)
			VALUES ('center-own', 'admin-own');
		`);
		return root;
	}

	function state(root: CompositionRoot) {
		return root.database.sqlite
			.prepare(`
				SELECT
					(SELECT COUNT(*) FROM accounts) AS accounts,
					(SELECT COUNT(*) FROM account_profiles) AS profiles,
					(SELECT COUNT(*) FROM password_credentials) AS credentials,
					(SELECT COUNT(*) FROM invitations) AS invitations,
					(SELECT COUNT(*) FROM center_memberships) AS memberships,
					(SELECT COUNT(*) FROM parent_student_links) AS parent_links,
					(SELECT COUNT(*) FROM sessions) AS sessions
			`)
			.get();
	}

	it('stores all-path profile facts and returns only the two exact projections', () => {
		const bootstrapDatabase = new SharedDatabase({ filename: ':memory:' });
		databases.push(bootstrapDatabase);
		const bootstrap = new IdentityAccessBoundary(bootstrapDatabase, {
			now: () => new Date(REGISTERED_AT)
		});
		bootstrap.bootstrapFirstAdmin({
			email: 'admin@example.com',
			surname: '  Admin  ',
			givenName: '  Bootstrap  ',
			password: 'task-094-bootstrap-password'
		});
		const bootstrapAccount = bootstrapDatabase.sqlite
			.prepare('SELECT id FROM accounts')
			.get() as { id: string };
		bootstrapDatabase.sqlite
			.prepare('INSERT INTO sessions (token, account_id, revoked_at) VALUES (?, ?, NULL)')
			.run('bootstrap-session', bootstrapAccount.id);

		expect(bootstrapDatabase.sqlite
			.prepare('SELECT full_name, registered_at FROM account_profiles WHERE account_id = ?')
			.get(bootstrapAccount.id)).toEqual({ full_name: 'Admin Bootstrap', registered_at: REGISTERED_AT });
		expect(bootstrap.getCurrentActorProfile('bootstrap-session')).toEqual({
			accountId: bootstrapAccount.id,
			fullName: 'Admin Bootstrap',
			role: 'admin',
			registeredAt: REGISTERED_AT
		});
		expect(bootstrap.getStatisticsProfiles([bootstrapAccount.id, bootstrapAccount.id, 'missing-account']))
			.toEqual([{ accountId: bootstrapAccount.id, fullName: 'Admin Bootstrap', registeredAt: REGISTERED_AT }]);
		expect(Object.keys(bootstrap.getCurrentActorProfile('bootstrap-session') ?? {}).sort()).toEqual([
			'accountId',
			'fullName',
			'registeredAt',
			'role'
		].sort());
		expect(Object.keys(bootstrap.getStatisticsProfiles([bootstrapAccount.id])[0] ?? {}).sort()).toEqual([
			'accountId',
			'fullName',
			'registeredAt'
		].sort());

		const root = rootWithAdmin();
		root.centerScheduling.provisionAccount({
			sessionToken: 'session-admin-own',
			centerId: 'center-own',
			accountId: 'invited-participant',
			role: 'student',
			surname: '  Invited  ',
			givenName: '  Participant  ',
			invitationToken: 'invite-participant'
		});
		root.centerScheduling.createPasswordParticipant({
			sessionToken: 'session-admin-own',
			centerId: 'center-own',
			accountId: 'password-participant',
			role: 'teacher',
			surname: '  Password  ',
			givenName: '  Participant  ',
			email: 'password@example.com',
			password: 'task-094-password'
		});

		expect(root.database.sqlite.prepare(
			'SELECT full_name FROM account_profiles WHERE account_id = ?'
		).get('invited-participant')).toEqual({ full_name: 'Invited Participant' });
		expect(root.database.sqlite.prepare(
			'SELECT full_name FROM account_profiles WHERE account_id = ?'
		).get('password-participant')).toEqual({ full_name: 'Password Participant' });
		expect(root.database.sqlite.prepare(
			'SELECT account_id, email FROM password_credentials WHERE account_id = ?'
		).get('password-participant')).toEqual({ account_id: 'password-participant', email: 'password@example.com' });

		const invitationSession = root.identityAccess.acceptInvitation({
			invitationToken: 'invite-participant',
			identity: { provider: 'google', subject: 'invited-subject' }
		});
		expect(root.identityAccess.getCurrentActorProfile(invitationSession)).toEqual({
			accountId: 'invited-participant',
			fullName: 'Invited Participant',
			role: 'student',
			registeredAt: expect.any(String)
		});

		const passwordSession = root.identityAccess.authenticatePassword({
			email: 'password@example.com',
			password: 'task-094-password'
		});
		expect(root.identityAccess.getCurrentActorProfile(passwordSession)).toMatchObject({
			accountId: 'password-participant',
			fullName: 'Password Participant',
			role: 'teacher'
		});
	});

	it('denies revoked current-actor profiles and preserves state on invalid or failed paths', () => {
		const root = rootWithAdmin();
		const beforeInvalidInvitation = state(root);
		expect(() => root.centerScheduling.provisionAccount({
			sessionToken: 'session-admin-own',
			centerId: 'center-own',
			accountId: 'invalid-invitation-profile',
			role: 'student',
			surname: 'Only Surname',
			givenName: '   ',
			invitationToken: 'invalid-invitation-profile-token'
		})).toThrow('invalid-name');
		expect(state(root)).toEqual(beforeInvalidInvitation);

		root.centerScheduling.createPasswordParticipant({
			sessionToken: 'session-admin-own',
			centerId: 'center-own',
			accountId: 'first-password',
			role: 'student',
			surname: 'First',
			givenName: 'Password',
			email: 'first@example.com',
			password: 'task-094-first-password'
		});
		const beforeDuplicate = state(root);
		expect(() => root.centerScheduling.createPasswordParticipant({
			sessionToken: 'session-admin-own',
			centerId: 'center-own',
			accountId: 'duplicate-password',
			role: 'teacher',
			surname: 'Duplicate',
			givenName: 'Password',
			email: 'first@example.com',
			password: 'task-094-duplicate-password'
		})).toThrow();
		expect(state(root)).toEqual(beforeDuplicate);

		root.database.sqlite.exec(`
			CREATE TRIGGER fail_profile_write
			BEFORE INSERT ON account_profiles
			WHEN NEW.account_id = 'failed-profile'
			BEGIN
				SELECT RAISE(ABORT, 'forced-profile-write-failure');
			END;
		`);
		const beforeFailed = state(root);
		expect(() => root.centerScheduling.provisionAccount({
			sessionToken: 'session-admin-own',
			centerId: 'center-own',
			accountId: 'failed-profile',
			role: 'student',
			surname: 'Failed',
			givenName: 'Profile',
			invitationToken: 'failed-profile-invitation'
		})).toThrow('forced-profile-write-failure');
		expect(state(root)).toEqual(beforeFailed);

		root.identityAccess.revokeSession('session-admin-own');
		expect(root.identityAccess.getCurrentActorProfile('session-admin-own')).toBeNull();
	});

	it('keeps an incomplete legacy fixture out of profile projections', () => {
		const root = rootWithAdmin();
		expect(root.identityAccess.getCurrentActorProfile('session-admin-own')).toBeNull();
		expect(root.identityAccess.getStatisticsProfiles(['admin-own'])).toEqual([]);
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM account_profiles').get()).toEqual({ count: 0 });
	});

	it('rejects incomplete bootstrap input before any persistence', () => {
		const database = new SharedDatabase({ filename: ':memory:' });
		databases.push(database);
		const identityAccess = new IdentityAccessBoundary(database);
		const before = database.sqlite.prepare('SELECT COUNT(*) AS accounts FROM accounts').get();
		expect(() => identityAccess.bootstrapFirstAdmin({
			email: 'admin@example.com',
			surname: 'Admin',
			givenName: '   ',
			password: 'task-094-invalid-name'
		})).toThrow('invalid-name');
		expect(database.sqlite.prepare('SELECT COUNT(*) AS accounts FROM accounts').get()).toEqual(before);
	});
});
