import {
	IdentityAccessBoundary,
	type ActorContext,
	type Role
} from '$lib/server/modules/identity-access/public';
import type { SharedDatabase } from '$lib/server/platform/database';

export type CenterScope = {
	centerId: string;
	accountId: string;
	role: Role;
};

export type AccountProvisioningRequest = {
	sessionToken?: string;
	centerId: string;
	accountId: string;
	role: Role;
	invitationToken: string;
	expiresAt?: string;
};

export class CenterSchedulingBoundary {
	constructor(
		private readonly database: SharedDatabase,
		private readonly identityAccess: Pick<IdentityAccessBoundary, 'resolveActor' | 'provisionAccount'>
	) {}

	provisionAccount(request: AccountProvisioningRequest): void {
		const actor = this.identityAccess.resolveActor(request.sessionToken);
		if (!this.getAuthorizedCenterAdminScope(actor, request.centerId)) {
			throw new Error('not-authorized');
		}

		this.identityAccess.provisionAccount({
			accountId: request.accountId,
			role: request.role,
			invitationToken: request.invitationToken,
			expiresAt: request.expiresAt
		});
	}

	createCenter(center: { id: string; name: string }): void {
		this.database.sqlite
			.prepare('INSERT INTO centers (id, name) VALUES (?, ?)')
			.run(center.id, center.name);
	}

	grantMembership(membership: { centerId: string; accountId: string }): void {
		this.database.sqlite
			.prepare('INSERT INTO center_memberships (center_id, account_id) VALUES (?, ?)')
			.run(membership.centerId, membership.accountId);
	}

	getAuthorizedCenterScope(actor: ActorContext | null, centerId: string): CenterScope | null {
		if (!actor) {
			return null;
		}

		const membership = this.database.sqlite
			.prepare(
				'SELECT center_id FROM center_memberships WHERE center_id = ? AND account_id = ?'
			)
			.get(centerId, actor.accountId) as { center_id: string } | undefined;

		return membership
			? { centerId: membership.center_id, accountId: actor.accountId, role: actor.role }
			: null;
	}

	getAuthorizedCenterAdminScope(actor: ActorContext | null, centerId: string): CenterScope | null {
		const scope = this.getAuthorizedCenterScope(actor, centerId);
		return scope?.role === 'admin' ? scope : null;
	}

}
