import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { SharedDatabase } from '$lib/server/platform/database';

export type Role = 'admin' | 'teacher' | 'student' | 'parent';
export type Provider = 'telegram' | 'google';

export type ActorContext = {
	accountId: string;
	role: Role;
};

export type AccountProvisioning = {
	accountId: string;
	role: Role;
	invitationToken: string;
	expiresAt?: string;
};

export type ProviderIdentity = {
	provider: Provider;
	providerSubject: string;
};

export type VerifiedProviderIdentity = {
	provider: Provider;
	subject: string;
};

export type InvitationAcceptance = {
	invitationToken: string;
	identity: VerifiedProviderIdentity;
};

export type ProviderBinding = ProviderIdentity & {
	invitationToken: string;
};

export type ConfirmedProviderBinding = ProviderIdentity & {
	confirmedSessionToken?: string;
};

export type ProviderBindingSessionConfirmation = ProviderIdentity & {
	sessionToken?: string;
};

export type FirstAdminBootstrap = {
	email: string;
	password: string;
};

export type PasswordAuthentication = {
	email: string;
	password: string;
};

export interface ProviderVerifier {
	verify(identity: ProviderIdentity): boolean;
}

type IdentityAccessOptions = {
	now?: () => Date;
	derivePasswordCredential?: (password: string, salt: Buffer) => Buffer;
};

type InvitationRow = {
	account_id: string;
	status: 'pending' | 'consumed' | 'revoked';
	expires_at: string;
};

type ActorRow = {
	account_id: string;
	role: Role;
};

type ExternalIdentityRow = {
	account_id: string;
};

type PasswordCredentialRow = {
	account_id: string;
	salt: Buffer;
	password_hash: Buffer;
};

const UNKNOWN_PASSWORD_CREDENTIAL_SALT = Buffer.from('identity-access-password-denial-salt');
const UNKNOWN_PASSWORD_CREDENTIAL_HASH = scryptSync(
	'identity-access-password-denial',
	UNKNOWN_PASSWORD_CREDENTIAL_SALT,
	64
);

export class IdentityAccessBoundary {
	private readonly now: () => Date;
	private readonly derivePasswordCredential: (password: string, salt: Buffer) => Buffer;

	constructor(
		private readonly database: SharedDatabase,
		options: IdentityAccessOptions = {}
	) {
		this.now = options.now ?? (() => new Date());
		this.derivePasswordCredential =
			options.derivePasswordCredential ?? ((password, salt) => scryptSync(password, salt, 64));
	}

	bootstrapFirstAdmin(request: FirstAdminBootstrap): void {
		const email = this.normalizePasswordEmail(request?.email);
		if (typeof request?.password !== 'string' || request.password.length === 0) {
			throw new Error('invalid-password');
		}

		const salt = randomBytes(32);
		const passwordHash = this.derivePasswordCredential(request.password, salt);
		if (!Buffer.isBuffer(passwordHash) || passwordHash.length === 0) {
			throw new Error('credential-derivation-failed');
		}

		this.database.transaction(() => {
			const accountCount = this.database.sqlite
				.prepare('SELECT COUNT(*) AS count FROM accounts')
				.get() as { count: number };
			if (accountCount.count !== 0) {
				throw new Error('first-admin-already-bootstrapped');
			}

			const accountId = randomBytes(16).toString('base64url');
			this.database.sqlite
				.prepare("INSERT INTO accounts (id, role) VALUES (?, 'admin')")
				.run(accountId);
			this.database.sqlite
				.prepare(
					'INSERT INTO password_credentials (account_id, email, salt, password_hash) VALUES (?, ?, ?, ?)'
				)
				.run(accountId, email, salt, passwordHash);
		});
	}

	authenticatePassword(request: PasswordAuthentication): string {
		const email = this.normalizePasswordEmailForAuthentication(request?.email);
		const password = typeof request?.password === 'string' ? request.password : '';

		return this.database.transaction(() => {
			const credential = email
				? (this.database.sqlite
						.prepare(
							'SELECT account_id, salt, password_hash FROM password_credentials WHERE email = ?'
						)
						.get(email) as PasswordCredentialRow | undefined)
				: undefined;
			const salt = Buffer.isBuffer(credential?.salt)
				? credential.salt
				: UNKNOWN_PASSWORD_CREDENTIAL_SALT;
			const expectedHash =
				Buffer.isBuffer(credential?.password_hash) &&
				credential.password_hash.length === UNKNOWN_PASSWORD_CREDENTIAL_HASH.length
					? credential.password_hash
					: UNKNOWN_PASSWORD_CREDENTIAL_HASH;
			const derivedHash = this.derivePasswordCredential(password, salt);
			const comparableHash =
				Buffer.isBuffer(derivedHash) && derivedHash.length === expectedHash.length
					? derivedHash
					: UNKNOWN_PASSWORD_CREDENTIAL_HASH;
			const passwordMatches = timingSafeEqual(comparableHash, expectedHash);

			if (!credential || !passwordMatches) {
				throw new Error('invalid-credentials');
			}

			return this.issueSession(credential.account_id);
		});
	}

	revokeInvitation(invitationToken: string): void {
		this.database.transaction(() => {
			this.database.sqlite
				.prepare("UPDATE invitations SET status = 'revoked' WHERE token = ? AND status = 'pending'")
				.run(invitationToken);
		});
	}

	isInvitationUsable(invitationToken: string): boolean {
		if (typeof invitationToken !== 'string' || invitationToken.length === 0) {
			return false;
		}

		const invitation = this.database.sqlite
			.prepare('SELECT status, expires_at FROM invitations WHERE token = ?')
			.get(invitationToken) as Pick<InvitationRow, 'status' | 'expires_at'> | undefined;

		return Boolean(
			invitation && invitation.status === 'pending' && !this.isExpired(invitation.expires_at)
		);
	}

	authenticateVerifiedIdentity(identity: VerifiedProviderIdentity): string {
		this.assertVerifiedIdentity(identity);

		return this.database.transaction(() => {
			const row = this.database.sqlite
				.prepare(
					`SELECT account_id
					 FROM external_identities
					 WHERE provider = ? AND subject = ?`
				)
				.get(identity.provider, identity.subject) as ExternalIdentityRow | undefined;

			if (!row) {
				throw new Error('unknown-provider-identity');
			}

			return this.issueSession(row.account_id);
		});
	}

	acceptInvitation(request: InvitationAcceptance): string {
		if (typeof request?.invitationToken !== 'string' || request.invitationToken.length === 0) {
			throw new Error('invalid-invitation');
		}
		this.assertVerifiedIdentity(request.identity);

		return this.database.transaction(() => {
			const invitation = this.database.sqlite
				.prepare('SELECT account_id, status, expires_at FROM invitations WHERE token = ?')
				.get(request.invitationToken) as InvitationRow | undefined;

			if (!invitation || invitation.status !== 'pending' || this.isExpired(invitation.expires_at)) {
				throw new Error('invalid-invitation');
			}

			const existingIdentity = this.database.sqlite
				.prepare(
					`SELECT account_id
					 FROM external_identities
					 WHERE provider = ? AND subject = ?`
				)
				.get(request.identity.provider, request.identity.subject) as ExternalIdentityRow | undefined;
			if (existingIdentity) {
				throw new Error('duplicate-provider-identity');
			}

			this.database.sqlite
				.prepare('INSERT INTO external_identities (provider, subject, account_id) VALUES (?, ?, ?)')
				.run(request.identity.provider, request.identity.subject, invitation.account_id);
			const consumed = this.database.sqlite
				.prepare("UPDATE invitations SET status = 'consumed' WHERE token = ? AND status = 'pending'")
				.run(request.invitationToken);
			if (consumed.changes !== 1) {
				throw new Error('invalid-invitation');
			}

			return this.issueSession(invitation.account_id);
		});
	}

	revokeSession(sessionToken: string): void {
		if (!sessionToken) {
			return;
		}

		this.database.transaction(() => {
			this.database.sqlite
				.prepare('UPDATE sessions SET revoked_at = ? WHERE token = ? AND revoked_at IS NULL')
				.run(this.now().toISOString(), sessionToken);
		});
	}

	resolveActor(sessionToken: string | undefined): ActorContext | null {
		if (!sessionToken) {
			return null;
		}

		const row = this.database.sqlite
			.prepare(`
				SELECT accounts.id AS account_id, accounts.role AS role
				FROM sessions
				JOIN accounts ON accounts.id = sessions.account_id
				WHERE sessions.token = ? AND sessions.revoked_at IS NULL
			`)
			.get(sessionToken) as ActorRow | undefined;

		return row ? { accountId: row.account_id, role: row.role } : null;
	}

	bindProvider(binding: ProviderBinding, verifier: ProviderVerifier): void {
		if (!verifier.verify(binding)) {
			throw new Error('provider-verification-failed');
		}

		this.database.transaction(() => {
			const invitation = this.database.sqlite
				.prepare('SELECT account_id, status, expires_at FROM invitations WHERE token = ?')
				.get(binding.invitationToken) as InvitationRow | undefined;

			if (!invitation || invitation.status !== 'pending' || this.isExpired(invitation.expires_at)) {
				throw new Error('invalid-invitation');
			}

			this.database.sqlite
				.prepare("UPDATE invitations SET status = 'consumed' WHERE token = ?")
				.run(binding.invitationToken);
			this.database.sqlite
				.prepare(
					'INSERT INTO external_identities (provider, subject, account_id) VALUES (?, ?, ?)'
				)
				.run(binding.provider, binding.providerSubject, invitation.account_id);
		});
	}

	reconfirmSessionForProviderBinding(
		confirmation: ProviderBindingSessionConfirmation,
		verifier: ProviderVerifier
	): void {
		const actor = this.resolveActor(confirmation.sessionToken);
		if (!actor || !confirmation.sessionToken) {
			throw new Error('confirmed-session-required');
		}

		if (!verifier.verify(confirmation)) {
			throw new Error('provider-verification-failed');
		}

		const ownedIdentity = this.database.sqlite
			.prepare(
				`SELECT 1
				 FROM external_identities
				 WHERE provider = ? AND subject = ? AND account_id = ?`
			)
			.get(confirmation.provider, confirmation.providerSubject, actor.accountId);
		if (!ownedIdentity) {
			throw new Error('session-reconfirmation-failed');
		}

		this.database.sqlite
			.prepare(
				`INSERT INTO provider_binding_confirmations (session_token)
				 VALUES (?)
				 ON CONFLICT(session_token) DO NOTHING`
			)
			.run(confirmation.sessionToken);
	}

	bindSecondProvider(binding: ConfirmedProviderBinding, verifier: ProviderVerifier): void {
		const actor = this.resolveConfirmedProviderBindingActor(binding.confirmedSessionToken);
		if (!actor) {
			throw new Error('confirmed-session-required');
		}

		if (!verifier.verify(binding)) {
			throw new Error('provider-verification-failed');
		}

		this.database.transaction(() => {
			this.database.sqlite
				.prepare(
					'INSERT INTO external_identities (provider, subject, account_id) VALUES (?, ?, ?)'
				)
				.run(binding.provider, binding.providerSubject, actor.accountId);
			this.database.sqlite
				.prepare('DELETE FROM provider_binding_confirmations WHERE session_token = ?')
				.run(binding.confirmedSessionToken);
		});
	}

	private resolveConfirmedProviderBindingActor(
		sessionToken: string | undefined
	): ActorContext | null {
		if (!sessionToken) {
			return null;
		}

		const row = this.database.sqlite
			.prepare(`
				SELECT accounts.id AS account_id, accounts.role AS role
				FROM provider_binding_confirmations
				JOIN sessions ON sessions.token = provider_binding_confirmations.session_token
				JOIN accounts ON accounts.id = sessions.account_id
				WHERE sessions.token = ? AND sessions.revoked_at IS NULL
			`)
			.get(sessionToken) as ActorRow | undefined;

		return row ? { accountId: row.account_id, role: row.role } : null;
	}

	private isExpired(expiresAt: string): boolean {
		const expiryTime = Date.parse(expiresAt);
		return !Number.isFinite(expiryTime) || expiryTime <= this.now().getTime();
	}

	private normalizePasswordEmail(email: unknown): string {
		if (typeof email !== 'string') {
			throw new Error('invalid-email');
		}

		const normalized = email.trim().toLowerCase();
		if (!normalized) {
			throw new Error('invalid-email');
		}

		return normalized;
	}

	private normalizePasswordEmailForAuthentication(email: unknown): string {
		return typeof email === 'string' ? email.trim().toLowerCase() : '';
	}

	private assertVerifiedIdentity(identity: VerifiedProviderIdentity): void {
		if (
			!identity ||
			(identity.provider !== 'telegram' && identity.provider !== 'google') ||
			typeof identity.subject !== 'string' ||
			identity.subject.length === 0
		) {
			throw new Error('invalid-provider-identity');
		}
	}

	private issueSession(accountId: string): string {
		const token = randomBytes(32).toString('base64url');
		this.database.sqlite
			.prepare('INSERT INTO sessions (token, account_id, revoked_at) VALUES (?, ?, NULL)')
			.run(token, accountId);
		return token;
	}
}
