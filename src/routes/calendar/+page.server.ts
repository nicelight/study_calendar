import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { DEFAULT_SELECTED_DATE, isIsoDate } from '$lib/calendar';
import { getCompositionRoot } from '$lib/server/composition-root';
import type {
	AuthorizedClassScope,
	CenterSchedulingBoundary,
	LessonView
} from '$lib/server/modules/center-scheduling/public';
import type { PageServerLoad } from './$types';

type CalendarPort = Pick<CenterSchedulingBoundary, 'getAuthorizedClassScope' | 'getLessons'>;

export type CalendarPageData = Pick<AuthorizedClassScope, 'classId' | 'className' | 'role'> & {
	selectedDate: string;
	lessons: LessonView[];
};

export function _createCalendarPageLoad(
	centerScheduling: CalendarPort = getCompositionRoot().centerScheduling
): (event: RequestEvent) => CalendarPageData {
	return (event) => {
		const actor = event.locals.actor;
		if (!actor) {
			throw redirect(303, '/login');
		}

		const classId = event.url.searchParams.get('classId');
		if (!classId) {
			throw error(403, 'Forbidden');
		}

		const sessionToken = event.cookies.get('foundation_session');
		const scope = centerScheduling.getAuthorizedClassScope(sessionToken, classId);
		const lessons = centerScheduling.getLessons({ sessionToken, classId });
		if (
			!scope ||
			!lessons ||
			scope.classId !== classId ||
			scope.accountId !== actor.accountId ||
			scope.role !== actor.role
		) {
			throw error(403, 'Forbidden');
		}

		const requestedDate = event.url.searchParams.get('date');
		return {
			classId: scope.classId,
			className: scope.className,
			role: scope.role,
			selectedDate: isIsoDate(requestedDate) ? requestedDate : DEFAULT_SELECTED_DATE,
			lessons
		};
	};
}

export const load: PageServerLoad = (event) => _createCalendarPageLoad()(event);
