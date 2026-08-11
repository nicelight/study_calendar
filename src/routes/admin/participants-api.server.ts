import { json, type RequestHandler } from '@sveltejs/kit';
import { getAdminProvisioningTransport } from './provisioning.server';

async function requestedRole(request: Request): Promise<unknown> {
	const contentType = request.headers.get('content-type') ?? '';
	if (contentType.includes('application/json')) {
		try {
			const body = (await request.json()) as { role?: unknown };
			return body?.role;
		} catch {
			return undefined;
		}
	}

	try {
		const formData = await request.formData();
		return formData.get('role');
	} catch {
		return undefined;
	}
}

export function createAdminPostHandler(
	transport = getAdminProvisioningTransport()
): RequestHandler {
	return async (event) => {
		const result = transport.provision(event, await requestedRole(event.request));

		if (!result.ok) {
			return json({ error: result.error }, { status: result.status });
		}

		return json({
			invitationUrl: result.invitationUrl,
			status: result.status,
			expiresAt: result.expiresAt
		});
	};
}
