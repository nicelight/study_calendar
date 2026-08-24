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
		const surname = typeof provisioning.surname === 'string' ? provisioning.surname.trim() : '';
		const givenName = typeof provisioning.givenName === 'string' ? provisioning.givenName.trim() : '';
		if (!surname || !givenName) {
			throw new Error('invalid-name');
		}
		const fullName = `${surname} ${givenName}`;
		const registeredAt = now().toISOString();
		const expiresAt = provisioning.expiresAt ?? new Date(now().getTime() + 24 * 60 * 60 * 1000).toISOString();
		database.transaction(() => {
			database.sqlite
				.prepare('INSERT INTO accounts (id, role) VALUES (?, ?)')
				.run(provisioning.accountId, provisioning.role);
			database.sqlite
				.prepare(
					'INSERT INTO account_profiles (account_id, full_name, registered_at) VALUES (?, ?, ?)'
				)
				.run(provisioning.accountId, fullName, registeredAt);
			database.sqlite
				.prepare(
					"INSERT INTO invitations (token, account_id, status, expires_at) VALUES (?, ?, 'pending', ?)"
				)
				.run(provisioning.invitationToken, provisioning.accountId, expiresAt);
		});
	};
}

export function createIdentityAccessPasswordProvisioningWriter(
	database: SharedDatabase,
	now: () => Date = () => new Date()
): IdentityAccessPasswordProvisioningWriter {
	return (provisioning) => {
		const surname = typeof provisioning.surname === 'string' ? provisioning.surname.trim() : '';
		const givenName = typeof provisioning.givenName === 'string' ? provisioning.givenName.trim() : '';
		if (!surname || !givenName) {
			throw new Error('invalid-name');
		}
		const email = typeof provisioning.email === 'string' ? provisioning.email.trim().toLowerCase() : '';
		if (!email || !email.includes('@')) {
			throw new Error('invalid-email');
		}
		if (typeof provisioning.password !== 'string' || provisioning.password.length === 0) {
			throw new Error('invalid-password');
		}

		const salt = randomBytes(32);
		const passwordHash = scryptSync(provisioning.password, salt, 64);
		database.transaction(() => {
			database.sqlite
				.prepare('INSERT INTO accounts (id, role) VALUES (?, ?)')
				.run(provisioning.accountId, provisioning.role);
			database.sqlite
				.prepare(
					'INSERT INTO account_profiles (account_id, full_name, registered_at) VALUES (?, ?, ?)'
				)
				.run(provisioning.accountId, `${surname} ${givenName}`, now().toISOString());
			database.sqlite
				.prepare(
					'INSERT INTO password_credentials (account_id, email, salt, password_hash) VALUES (?, ?, ?, ?)'
				)
				.run(provisioning.accountId, email, salt, passwordHash);
		});
	};
}
