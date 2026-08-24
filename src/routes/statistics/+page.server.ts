import { error as httpError, redirect, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCompositionRoot } from '$lib/server/composition-root';
import type {
	LessonContextBoundary,
	StatisticsRegistryView
} from '$lib/server/modules/lesson-context/public';

export type StatisticsPageData = {
	registry: StatisticsRegistryView;
};

export type StatisticsPort = Pick<LessonContextBoundary, 'getStatisticsRegistry'>;

export function _createStatisticsPageLoad(
	lessonContext: StatisticsPort = getCompositionRoot().lessonContext
): (event: RequestEvent) => StatisticsPageData {
	return (event) => {
		if (!event.locals.actor) {
			throw redirect(303, '/login');
		}

		try {
			return {
				registry: lessonContext.getStatisticsRegistry({
					actor: event.locals.actor,
					sessionToken: event.cookies.get('foundation_session')
				})
			};
		} catch (cause) {
			if (cause instanceof Error && cause.message === 'not-authorized') {
				throw httpError(403, 'Forbidden');
			}
			throw cause;
		}
	};
}

export const load: PageServerLoad = (event) => _createStatisticsPageLoad()(event);
