import { json, type RequestHandler } from '@sveltejs/kit';
import { getCompositionRoot } from '$lib/server/composition-root';

export const GET: RequestHandler = ({ cookies, url }) => {
	const classId = url.searchParams.get('classId');
	const lessonId = url.searchParams.get('lessonId');
	if (!classId || !lessonId) {
		return json({ error: 'forbidden' }, { status: 403 });
	}

	try {
		const context = getCompositionRoot().lessonContext.getDayContext({
			sessionToken: cookies.get('foundation_session'),
			classId,
			lessonId,
			studentAccountId: url.searchParams.get('studentAccountId') ?? undefined
		});
		return json(context);
	} catch {
		// Keep target existence and private provider details out of denied responses.
		return json({ error: 'forbidden' }, { status: 403 });
	}
};
