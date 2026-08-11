import { randomBytes } from 'node:crypto';
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

export interface ProviderVerifier {
	verify(identity: ProviderIdentity): boolean;
}

type IdentityAccessOptions = {
	now?: () => Date;
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

export class IdentityAccessBoundary {
	private readonly now: () => Date;

	constructor(
		private readonly database: SharedDatabase,
		options: IdentityAccessOptions = {}
	) {
		this.now = options.now ?? (() => new Date());
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
