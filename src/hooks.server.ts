import type { Handle } from '@sveltejs/kit';
import { getCompositionRoot } from '$lib/server/composition-root';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get('foundation_session');
	event.locals.actor = getCompositionRoot().identityAccess.resolveActor(sessionToken);

	return resolve(event);
};
