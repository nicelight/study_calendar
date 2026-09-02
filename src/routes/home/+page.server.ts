import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCompositionRoot } from '$lib/server/composition-root';
import {
	createDestinationPageLoad,
	type DestinationPageData,
	type DestinationPort
} from './destination.server';

export type HomePageData = DestinationPageData;

export function _createHomePageLoad(
	centerScheduling: DestinationPort = getCompositionRoot().centerScheduling
): (event: Parameters<PageServerLoad>[0]) => HomePageData {
	const loadDestinations = createDestinationPageLoad(centerScheduling);
	return (event) => {
		const data = loadDestinations(event);
		const [firstDestination] = data.destinations;
		if ((data.role === 'student' || data.role === 'parent') && firstDestination) {
			throw redirect(303, firstDestination.href);
		}
		return data;
	};
}

export const load: PageServerLoad = (event) => _createHomePageLoad()(event);
