import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { DEFAULT_SELECTED_DATE, isIsoDate } from '$lib/calendar';
import { getCompositionRoot } from '$lib/server/composition-root';
import type {
	AuthorizedClassScope,
	CenterSchedulingBoundary,
	LessonView
} from '$lib/server/modules/center-scheduling/public';
import type { LessonContextBoundary } from '$lib/server/modules/lesson-context/public';
import type { PageServerLoad } from './$types';

type CalendarPort = Pick<CenterSchedulingBoundary, 'getAuthorizedClassScope' | 'getLessons'>;
type CalendarLessonContextPort = Pick<LessonContextBoundary, 'getStudentPaymentStatuses'>;

export type CalendarPaymentStatus = 'paid' | 'unpaid';
export type CalendarLessonView = LessonView & { paymentStatus?: CalendarPaymentStatus };

export type CalendarPageData = Pick<AuthorizedClassScope, 'classId' | 'className' | 'role'> & {
	selectedDate: string;
	lessons: CalendarLessonView[];
};

export function _createCalendarPageLoad(
	centerScheduling: CalendarPort = getCompositionRoot().centerScheduling,
	lessonContext: CalendarLessonContextPort = getCompositionRoot().lessonContext
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

		const calendarLessons: CalendarLessonView[] =
			scope.role === 'student'
				? (() => {
						const paymentStatuses = lessonContext.getStudentPaymentStatuses({
							sessionToken,
							classId: scope.classId
						});
						const paymentStatusByLesson = new Map(
							paymentStatuses.map((paymentStatus) => [paymentStatus.lessonId, paymentStatus.status])
						);
						return lessons.map((lesson) => ({
							...lesson,
							paymentStatus: paymentStatusByLesson.get(lesson.lessonId)
						}));
					})()
				: lessons;

		const requestedDate = event.url.searchParams.get('date');
		return {
			classId: scope.classId,
			className: scope.className,
			role: scope.role,
			selectedDate: isIsoDate(requestedDate) ? requestedDate : DEFAULT_SELECTED_DATE,
			lessons: calendarLessons
		};
	};
}

export const load: PageServerLoad = (event) => _createCalendarPageLoad()(event);
