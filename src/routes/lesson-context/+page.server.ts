import { error, type ServerLoad } from '@sveltejs/kit';
import { getCompositionRoot } from '$lib/server/composition-root';

export const load: ServerLoad = ({ cookies, url }) => {
	const classId = url.searchParams.get('classId');
	const lessonId = url.searchParams.get('lessonId');
	if (!classId || !lessonId) {
		return { dayContext: null };
	}

	try {
		return {
			dayContext: getCompositionRoot().lessonContext.getDayContext({
				sessionToken: cookies.get('foundation_session'),
				classId,
				lessonId,
				studentAccountId: url.searchParams.get('studentAccountId') ?? undefined
			})
		};
	} catch {
		throw error(403, 'Forbidden');
	}
};
