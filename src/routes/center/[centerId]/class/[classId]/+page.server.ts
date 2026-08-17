import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { getCompositionRoot } from '$lib/server/composition-root';
import type {
	AuthorizedClassScope,
	CenterSchedulingBoundary
} from '$lib/server/modules/center-scheduling/public';
import type { PageServerLoad } from './$types';

type ClassEntryPort = Pick<CenterSchedulingBoundary, 'getAuthorizedClassScope'>;

export type ClassEntryPageData = Pick<
	AuthorizedClassScope,
	'centerId' | 'classId' | 'className' | 'mode' | 'role'
>;

export function _createClassEntryPageLoad(
	centerScheduling: ClassEntryPort = getCompositionRoot().centerScheduling
): (event: RequestEvent) => ClassEntryPageData {
	return (event) => {
		const actor = event.locals.actor;
		if (!actor) {
			throw redirect(303, '/login');
		}

		const { centerId, classId } = event.params;
		if (!centerId || !classId) {
			throw error(403, 'Forbidden');
		}

		const scope = centerScheduling.getAuthorizedClassScope(
			event.cookies.get('foundation_session'),
			classId
		);
		if (
			!scope ||
			scope.centerId !== centerId ||
			scope.classId !== classId ||
			scope.accountId !== actor.accountId ||
			scope.role !== actor.role
		) {
			throw error(403, 'Forbidden');
		}

		return {
			centerId: scope.centerId,
			classId: scope.classId,
			className: scope.className,
			mode: scope.mode,
			role: scope.role
		};
	};
}

export const load: PageServerLoad = (event) => _createClassEntryPageLoad()(event);
