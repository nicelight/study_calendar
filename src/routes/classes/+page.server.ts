import type { PageServerLoad } from './$types';
import { getCompositionRoot } from '$lib/server/composition-root';
import {
	createDestinationPageLoad,
	type DestinationPageData,
	type DestinationPort
} from '../home/destination.server';

export type ClassesPageData = DestinationPageData;

export function _createClassesPageLoad(
	centerScheduling: DestinationPort = getCompositionRoot().centerScheduling
): (event: Parameters<PageServerLoad>[0]) => ClassesPageData {
	return createDestinationPageLoad(centerScheduling);
}

export const load: PageServerLoad = (event) => _createClassesPageLoad()(event);
