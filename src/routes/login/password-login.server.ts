import { fail, redirect, type ActionFailure, type RequestEvent } from '@sveltejs/kit';
import { getCompositionRoot } from '$lib/server/composition-root';
import type { IdentityAccessBoundary } from '$lib/server/modules/identity-access/public';
import {
	FOUNDATION_SESSION_COOKIE,
	foundationSessionCookieOptions
} from '$lib/server/platform/session-cookie';

type PasswordLoginPort = Pick<IdentityAccessBoundary, 'authenticatePassword' | 'resolveActor'>;

type PasswordLoginFailure = ActionFailure<{ error: 'invalid_credentials' }>;

function invalidCredentials(): PasswordLoginFailure {
	return fail(401, { error: 'invalid_credentials' });
}

export function createPasswordLoginActions(
	identityAccess: PasswordLoginPort = getCompositionRoot().identityAccess
): { default: (event: RequestEvent) => Promise<never | PasswordLoginFailure> } {
	return {
		default: async (event) => {
			const formData = await event.request.formData();
			const fields = [...formData.keys()];
			if (
				fields.some((field) => field !== 'email' && field !== 'password') ||
				formData.getAll('email').length !== 1 ||
				formData.getAll('password').length !== 1
			) {
				return invalidCredentials();
			}

			const email = formData.get('email');
			const password = formData.get('password');
			if (typeof email !== 'string' || typeof password !== 'string') {
				return invalidCredentials();
			}

			let sessionToken: string;
			try {
				sessionToken = identityAccess.authenticatePassword({ email, password });
			} catch {
				return invalidCredentials();
			}

			event.cookies.set(
				FOUNDATION_SESSION_COOKIE,
				sessionToken,
				foundationSessionCookieOptions(event.url.protocol)
			);
			const actor = identityAccess.resolveActor(sessionToken);
			throw redirect(303, actor?.role === 'admin' ? '/admin' : '/');
		}
	};
}
