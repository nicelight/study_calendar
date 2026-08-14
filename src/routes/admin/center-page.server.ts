import {
	error as kitError,
	fail,
	redirect,
	type ActionFailure,
	type RequestEvent
} from '@sveltejs/kit';
import { getCompositionRoot } from '$lib/server/composition-root';
import type { CenterSchedulingBoundary } from '$lib/server/modules/center-scheduling/public';

type AdminCenterPort = Pick<
	CenterSchedulingBoundary,
	'getAdminEntry' | 'createBootstrapCenter'
>;

export type AdminCenterPageData = { mode: 'bootstrap' };
export type AdminCenterFailure = ActionFailure<{
	error:
		| 'invalid_name'
		| 'invalid_request'
		| 'unauthorized'
		| 'forbidden'
		| 'center_already_created'
		| 'center_creation_failed';
}>;

function messageOf(cause: unknown): string {
	return cause instanceof Error ? cause.message : '';
}

function requireRouteAdmin(event: RequestEvent): void {
	if (!event.locals.actor) {
		throw redirect(303, '/login');
	}
	if (event.locals.actor.role !== 'admin') {
		throw kitError(403, 'Forbidden');
	}
}

export function createAdminCenterPageLoad(
	centerScheduling: AdminCenterPort = getCompositionRoot().centerScheduling
): (event: RequestEvent) => AdminCenterPageData {
	return (event) => {
		requireRouteAdmin(event);
		let entry;
		try {
			entry = centerScheduling.getAdminEntry({
				sessionToken: event.cookies.get('foundation_session')
			});
		} catch (cause) {
			if (messageOf(cause) === 'not-authorized') {
				throw kitError(403, 'Forbidden');
			}
			throw kitError(500, 'Admin entry could not be resolved');
		}

		if (entry.mode === 'center') {
			throw redirect(303, `/admin/${encodeURIComponent(entry.centerId)}`);
		}
		return { mode: 'bootstrap' };
	};
}

export function createAdminCenterActions(
	centerScheduling: AdminCenterPort = getCompositionRoot().centerScheduling
): { default: (event: RequestEvent) => Promise<never | AdminCenterFailure> } {
	return {
		default: async (event) => {
			if (!event.locals.actor) {
				return fail(401, { error: 'unauthorized' });
			}
			if (event.locals.actor.role !== 'admin') {
				return fail(403, { error: 'forbidden' });
			}

			const formData = await event.request.formData();
			const fields = [...formData.keys()];
			if (fields.some((field) => field !== 'name') || formData.getAll('name').length !== 1) {
				return fail(400, { error: 'invalid_request' });
			}
			const name = formData.get('name');
			if (typeof name !== 'string' || !name.trim()) {
				return fail(400, { error: 'invalid_name' });
			}

			try {
				const center = centerScheduling.createBootstrapCenter({
					sessionToken: event.cookies.get('foundation_session'),
					name
				});
				throw redirect(
					303,
					`/admin/${encodeURIComponent(center.centerId)}`
				);
			} catch (cause) {
				const message = messageOf(cause);
				if (message === 'not-authorized') {
					return fail(403, { error: 'forbidden' });
				}
				if (message === 'invalid-center-name') {
					return fail(400, { error: 'invalid_name' });
				}
				if (message === 'bootstrap-center-already-created') {
					return fail(409, { error: 'center_already_created' });
				}
				if (cause && typeof cause === 'object' && 'status' in cause && cause.status === 303) {
					throw cause;
				}
				return fail(500, { error: 'center_creation_failed' });
			}
		}
	};
}
