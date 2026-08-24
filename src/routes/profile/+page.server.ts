import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { getCompositionRoot } from '$lib/server/composition-root';
import type { CurrentActorProfile, IdentityAccessBoundary } from '$lib/server/modules/identity-access/public';

export type ProfilePageData = {
	profile: Pick<CurrentActorProfile, 'fullName' | 'role' | 'registeredAt'>;
};

export type ProfilePort = Pick<IdentityAccessBoundary, 'getCurrentActorProfile'>;

export function _createProfilePageLoad(
	identityAccess: ProfilePort = getCompositionRoot().identityAccess
): (event: RequestEvent) => ProfilePageData {
	return (event) => {
		if (!event.locals.actor) {
			throw redirect(303, '/login');
		}

		const profile = identityAccess.getCurrentActorProfile(
			event.cookies.get('foundation_session')
		);
		if (!profile) {
			throw error(403, 'Forbidden');
		}

		return {
			profile: {
				fullName: profile.fullName,
				role: profile.role,
				registeredAt: profile.registeredAt
			}
		};
	};
}

export const load = (event: RequestEvent) => _createProfilePageLoad()(event);
