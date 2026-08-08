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

export type ProviderBinding = {
	invitationToken: string;
	provider: Provider;
	providerSubject: string;
};

export interface ProviderVerifier {
	verify(binding: ProviderBinding): boolean;
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

export class IdentityAccessBoundary {
	private readonly now: () => Date;

	constructor(
		private readonly database: SharedDatabase,
		options: IdentityAccessOptions = {}
	) {
		this.now = options.now ?? (() => new Date());
	}

	provisionAccount(provisioning: AccountProvisioning): void {
		const expiresAt = provisioning.expiresAt ?? this.defaultInvitationExpiry();
		this.database.transaction(() => {
			this.database.sqlite
				.prepare('INSERT INTO accounts (id, role) VALUES (?, ?)')
				.run(provisioning.accountId, provisioning.role);
			this.database.sqlite
				.prepare(
					"INSERT INTO invitations (token, account_id, status, expires_at) VALUES (?, ?, 'pending', ?)"
				)
				.run(provisioning.invitationToken, provisioning.accountId, expiresAt);
		});
	}

	revokeInvitation(invitationToken: string): void {
		this.database.transaction(() => {
			this.database.sqlite
				.prepare("UPDATE invitations SET status = 'revoked' WHERE token = ? AND status = 'pending'")
				.run(invitationToken);
		});
	}

	createSession(session: { token: string; accountId: string }): void {
		this.database.sqlite
			.prepare('INSERT INTO sessions (token, account_id, revoked_at) VALUES (?, ?, NULL)')
			.run(session.token, session.accountId);
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

	private defaultInvitationExpiry(): string {
		return new Date(this.now().getTime() + 24 * 60 * 60 * 1000).toISOString();
	}

	private isExpired(expiresAt: string): boolean {
		const expiryTime = Date.parse(expiresAt);
		return !Number.isFinite(expiryTime) || expiryTime <= this.now().getTime();
	}
}
