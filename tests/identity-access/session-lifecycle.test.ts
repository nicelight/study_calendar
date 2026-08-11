import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

describe('server-owned Identity & Access session lifecycle', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
	});

	afterEach(() => root.database.close());

	function seedAccount(accountId = 'account-one', role: 'admin' | 'teacher' | 'student' | 'parent' = 'student') {
		root.database.sqlite.prepare('INSERT INTO accounts (id, role) VALUES (?, ?)').run(accountId, role);
	}

	it('issues an opaque session only for a bound verified identity and revocation is enforced', () => {
		seedAccount('account-one', 'teacher');
		root.database.sqlite
			.prepare('INSERT INTO external_identities (provider, subject, account_id) VALUES (?, ?, ?)')
			.run('google', 'google-subject', 'account-one');

		const sessionToken = root.identityAccess.authenticateVerifiedIdentity({
			provider: 'google',
			subject: 'google-subject',
			role: 'admin',
			accountId: 'attacker-account'
		} as never);

		expect(sessionToken).toMatch(/^[A-Za-z0-9_-]{40,}$/);
		expect(root.identityAccess.resolveActor(sessionToken)).toEqual({
			accountId: 'account-one',
			role: 'teacher'
		});

		root.identityAccess.revokeSession(sessionToken);
		expect(root.identityAccess.resolveActor(sessionToken)).toBeNull();
	});

	it('does not expose caller-controlled session minting for a forged account and token', () => {
		seedAccount('target-account');
		const before = root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM sessions').get();
		const forgedCreateSession = (root.identityAccess as unknown as {
			createSession?: (session: { token: string; accountId: string }) => void;
		}).createSession;

		expect(forgedCreateSession).toBeUndefined();
		expect(root.identityAccess.resolveActor('attacker-controlled-token')).toBeNull();
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM sessions').get()).toEqual(before);
	});

	it('accepts the exact invitation account and atomically issues its first session', () => {
		seedAccount('precreated-account', 'parent');
		root.database.sqlite
			.prepare("INSERT INTO invitations (token, account_id, status, expires_at) VALUES (?, ?, 'pending', ?)")
			.run('invite-one', 'precreated-account', '2026-08-12T00:00:00.000Z');

		const sessionToken = root.identityAccess.acceptInvitation({
			invitationToken: 'invite-one',
			identity: {
				provider: 'telegram',
				subject: 'telegram-subject',
				accountId: 'wrong-account',
				role: 'admin',
				centerId: 'wrong-center'
			} as never
		});

		expect(root.identityAccess.resolveActor(sessionToken)).toEqual({
			accountId: 'precreated-account',
			role: 'parent'
		});
		expect(root.database.sqlite.prepare('SELECT status FROM invitations WHERE token = ?').get('invite-one')).toEqual({
			status: 'consumed'
		});
		expect(
			root.database.sqlite
				.prepare('SELECT account_id FROM external_identities WHERE provider = ? AND subject = ?')
				.get('telegram', 'telegram-subject')
		).toEqual({ account_id: 'precreated-account' });
	});

	it('rejects unknown or duplicate identities without creating a session', () => {
		seedAccount();
		const before = root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM sessions').get();

		expect(() =>
			root.identityAccess.authenticateVerifiedIdentity({ provider: 'google', subject: 'not-bound' })
		).toThrow('unknown-provider-identity');

		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM sessions').get()).toEqual(before);
	});

	it('rejects an expired, revoked, reused, or duplicate invitation without mutation', () => {
		seedAccount('existing-account', 'teacher');
		root.database.sqlite
			.prepare('INSERT INTO external_identities (provider, subject, account_id) VALUES (?, ?, ?)')
			.run('google', 'already-bound', 'existing-account');
		root.database.sqlite
			.prepare("INSERT INTO invitations (token, account_id, status, expires_at) VALUES (?, ?, 'pending', ?)")
			.run('invite-duplicate', 'existing-account', '2026-08-12T00:00:00.000Z');
		root.database.sqlite
			.prepare("INSERT INTO invitations (token, account_id, status, expires_at) VALUES (?, ?, 'revoked', ?)")
			.run('invite-revoked', 'existing-account', '2026-08-12T00:00:00.000Z');
		root.database.sqlite
			.prepare("INSERT INTO invitations (token, account_id, status, expires_at) VALUES (?, ?, 'pending', ?)")
			.run('invite-expired', 'existing-account', '2026-08-10T00:00:00.000Z');

		const before = root.database.sqlite
			.prepare(
				`SELECT
					(SELECT status FROM invitations WHERE token IN ('invite-duplicate', 'invite-revoked', 'invite-expired') ORDER BY token LIMIT 1) AS first_status,
					(SELECT COUNT(*) FROM external_identities) AS identity_count,
					(SELECT COUNT(*) FROM sessions) AS session_count`
			)
			.get() as { first_status: string; identity_count: number; session_count: number };

		for (const [invitationToken, subject, error] of [
			['invite-duplicate', 'already-bound', 'duplicate-provider-identity'],
			['invite-revoked', 'new-revoked', 'invalid-invitation'],
			['invite-expired', 'new-expired', 'invalid-invitation']
		] as const) {
			expect(() =>
				root.identityAccess.acceptInvitation({
					invitationToken,
					identity: { provider: 'google', subject }
				})
			).toThrow(error);
		}

		expect(
			root.database.sqlite
				.prepare(
					`SELECT
						(SELECT status FROM invitations WHERE token = 'invite-duplicate') AS duplicate_status,
						(SELECT status FROM invitations WHERE token = 'invite-revoked') AS revoked_status,
						(SELECT status FROM invitations WHERE token = 'invite-expired') AS expired_status,
						(SELECT COUNT(*) FROM external_identities) AS identity_count,
						(SELECT COUNT(*) FROM sessions) AS session_count`
				)
				.get()
		).toEqual({
			duplicate_status: 'pending',
			revoked_status: 'revoked',
			expired_status: 'pending',
			identity_count: before.identity_count,
			session_count: before.session_count
		});
	});

	it('rolls back invitation and identity state when session persistence fails', () => {
		seedAccount('atomic-account', 'student');
		root.database.sqlite
			.prepare("INSERT INTO invitations (token, account_id, status, expires_at) VALUES (?, ?, 'pending', ?)")
			.run('invite-atomic', 'atomic-account', '2026-08-12T00:00:00.000Z');
		root.database.sqlite.exec(`
			CREATE TRIGGER fail_session_insert
			BEFORE INSERT ON sessions
			BEGIN
				SELECT RAISE(ABORT, 'induced-session-write-failure');
			END;
		`);
		const before = root.database.sqlite
			.prepare(`
				SELECT
					(SELECT status FROM invitations WHERE token = 'invite-atomic') AS invitation_status,
					(SELECT COUNT(*) FROM external_identities) AS identity_count,
					(SELECT COUNT(*) FROM sessions) AS session_count
			`)
			.get();

		expect(() =>
			root.identityAccess.acceptInvitation({
				invitationToken: 'invite-atomic',
				identity: { provider: 'google', subject: 'atomic-subject' }
			})
		).toThrow('induced-session-write-failure');

		expect(
			root.database.sqlite
				.prepare(`
					SELECT
						(SELECT status FROM invitations WHERE token = 'invite-atomic') AS invitation_status,
						(SELECT COUNT(*) FROM external_identities) AS identity_count,
						(SELECT COUNT(*) FROM sessions) AS session_count
				`)
				.get()
		).toEqual(before);
	});
});
