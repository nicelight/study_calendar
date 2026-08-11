import {
	error as kitError,
	fail,
	redirect,
	type ActionFailure,
	type RequestEvent
} from '@sveltejs/kit';
import {
	getAdminProvisioningTransport,
	type AdminPageData,
	type AdminProvisioningFailure,
	type AdminProvisioningSuccess
} from './provisioning.server';

type AdminRequestEvent = RequestEvent;
type AdminPageLoad = (event: AdminRequestEvent) => AdminPageData;
type AdminActionFailure = ActionFailure<{ error: AdminProvisioningFailure['error'] }>;
type AdminActionResult = AdminProvisioningSuccess | AdminActionFailure;
type AdminAction = (event: AdminRequestEvent) => Promise<AdminActionResult>;

function routeError(cause: unknown): never {
	if (cause instanceof Error && cause.message === 'unauthorized') {
		throw redirect(303, '/login');
	}
	if (cause instanceof Error && cause.message === 'forbidden') {
		throw kitError(403, 'Forbidden');
	}
	throw kitError(404, 'Not found');
}

function actionFailure(result: AdminProvisioningFailure): AdminActionFailure {
	return fail(result.status, { error: result.error });
}

export function createAdminPageLoad(
	transport = getAdminProvisioningTransport()
): AdminPageLoad {
	return (event) => {
		try {
			return transport.page(event);
		} catch (cause) {
			routeError(cause);
		}
	};
}

export function createAdminActions(
	transport = getAdminProvisioningTransport()
): { default: AdminAction } {
	return {
		default: async (event) => {
			const formData = await event.request.formData();
			const result = transport.provision(event, formData.get('role'));
			return result.ok ? result : actionFailure(result);
		}
	};
}
