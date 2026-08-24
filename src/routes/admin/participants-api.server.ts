import { json, type RequestHandler } from '@sveltejs/kit';
import { getAdminProvisioningTransport } from './provisioning.server';

async function requestedFields(request: Request): Promise<{
	role: unknown;
	surname: unknown;
	givenName: unknown;
}> {
	const contentType = request.headers.get('content-type') ?? '';
	if (contentType.includes('application/json')) {
		try {
			const body = (await request.json()) as {
				role?: unknown;
				surname?: unknown;
				givenName?: unknown;
			};
			return { role: body?.role, surname: body?.surname, givenName: body?.givenName };
		} catch {
			return { role: undefined, surname: undefined, givenName: undefined };
		}
	}

	try {
		const formData = await request.formData();
		return {
			role: formData.get('role'),
			surname: formData.get('surname'),
			givenName: formData.get('givenName')
		};
	} catch {
		return { role: undefined, surname: undefined, givenName: undefined };
	}
}

export function createAdminPostHandler(
	transport = getAdminProvisioningTransport()
): RequestHandler {
	return async (event) => {
		const fields = await requestedFields(event.request);
		const result = transport.provision(event, fields.role, fields);

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
