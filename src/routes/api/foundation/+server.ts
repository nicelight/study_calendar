import { json, type RequestHandler } from '@sveltejs/kit';
import { getCompositionRoot } from '$lib/server/composition-root';

export const GET: RequestHandler = ({ locals, url }) => {
	if (!locals.actor) {
		return json({ error: 'unauthorized' }, { status: 401 });
	}

	const centerId = url.searchParams.get('centerId');
	if (!centerId) {
		return json({ error: 'center_required' }, { status: 400 });
	}

	const scope = getCompositionRoot().centerScheduling.getAuthorizedCenterScope(locals.actor, centerId);
	if (!scope) {
		return json({ error: 'forbidden' }, { status: 403 });
	}

	return json({ actor: locals.actor, scope });
};
