import type { AccountProvisioning } from './public';
import type { SharedDatabase } from '$lib/server/platform/database';

export type IdentityAccessProvisioningWriter = (provisioning: AccountProvisioning) => void;

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
