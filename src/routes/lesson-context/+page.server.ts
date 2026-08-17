import { error, type ServerLoad } from '@sveltejs/kit';
import { getCompositionRoot } from '$lib/server/composition-root';
import type { LessonView } from '$lib/server/modules/center-scheduling/public';

type LessonSummary = Pick<LessonView, 'lessonId' | 'classId' | 'lessonDate' | 'status'> & {
	className: string;
};

function lessonSummary(
	root: ReturnType<typeof getCompositionRoot>,
	sessionToken: string | undefined,
	classId: string,
	lessonId: string
): LessonSummary {
	const scope = root.centerScheduling.getAuthorizedClassScope(sessionToken, classId);
	const lesson = root.centerScheduling
		.getLessons({ sessionToken, classId })
		?.find((candidate) => candidate.lessonId === lessonId && candidate.status !== 'cancelled');
	if (!scope || !lesson) {
		throw new Error('not-authorized');
	}

	return {
		lessonId: lesson.lessonId,
		classId: lesson.classId,
		lessonDate: lesson.lessonDate,
		status: lesson.status,
		className: scope.className
	};
}

export const load: ServerLoad = ({ cookies, url }) => {
	const classId = url.searchParams.get('classId');
	const lessonId = url.searchParams.get('lessonId');
	if (!classId || !lessonId) {
		return { dayContext: null, lesson: null };
	}

	const root = getCompositionRoot();
	const sessionToken = cookies.get('foundation_session');
	try {
		return {
			dayContext: root.lessonContext.getDayContext({
				sessionToken,
				classId,
				lessonId,
				studentAccountId: url.searchParams.get('studentAccountId') ?? undefined
			}),
			lesson: null
		};
	} catch (cause) {
		if (cause instanceof Error && cause.message === 'lesson-material-not-found') {
			return {
				dayContext: null,
				lesson: lessonSummary(root, sessionToken, classId, lessonId)
			};
		}
		throw error(403, 'Forbidden');
	}
};
