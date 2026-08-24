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
	return createDestinationPageLoad(centerScheduling);
}

export const load: PageServerLoad = (event) => _createHomePageLoad()(event);
