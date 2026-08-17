import { randomBytes, scryptSync } from 'node:crypto';
import type { AccountProvisioning, PasswordAccountProvisioning } from './public';
import type { SharedDatabase } from '$lib/server/platform/database';

export type IdentityAccessProvisioningWriter = (provisioning: AccountProvisioning) => void;
export type IdentityAccessPasswordProvisioningWriter = (
	provisioning: PasswordAccountProvisioning
) => void;

export function createIdentityAccessProvisioningWriter(
	database: SharedDatabase,
	now: () => Date = () => new Date()
): IdentityAccessProvisioningWriter {
	return (provisioning) => {
		const expiresAt = provisioning.expiresAt ?? new Date(now().getTime() + 24 * 60 * 60 * 1000).toISOString();
		database.transaction(() => {
			database.sqlite
				.prepare('INSERT INTO accounts (id, role) VALUES (?, ?)')
				.run(provisioning.accountId, provisioning.role);
			database.sqlite
				.prepare(
					"INSERT INTO invitations (token, account_id, status, expires_at) VALUES (?, ?, 'pending', ?)"
				)
				.run(provisioning.invitationToken, provisioning.accountId, expiresAt);
		});
	};
}

export function createIdentityAccessPasswordProvisioningWriter(
	database: SharedDatabase
): IdentityAccessPasswordProvisioningWriter {
	return (provisioning) => {
		const email = typeof provisioning.email === 'string' ? provisioning.email.trim().toLowerCase() : '';
		if (!email || !email.includes('@')) {
			throw new Error('invalid-email');
		}
		if (typeof provisioning.password !== 'string' || provisioning.password.length === 0) {
			throw new Error('invalid-password');
		}

		const salt = randomBytes(32);
		const passwordHash = scryptSync(provisioning.password, salt, 64);
		database.sqlite
			.prepare('INSERT INTO accounts (id, role) VALUES (?, ?)')
			.run(provisioning.accountId, provisioning.role);
		database.sqlite
			.prepare(
				'INSERT INTO password_credentials (account_id, email, salt, password_hash) VALUES (?, ?, ?, ?)'
			)
			.run(provisioning.accountId, email, salt, passwordHash);
	};
}
