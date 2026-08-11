export const FOUNDATION_SESSION_COOKIE = 'foundation_session' as const;
export const AUTHENTICATION_BINDING_COOKIE = 'foundation_auth_binding' as const;

export type FoundationSessionCookieOptions = {
	httpOnly: true;
	path: '/';
	sameSite: 'lax';
	secure: boolean;
};

export type AuthenticationBindingCookieOptions = FoundationSessionCookieOptions & {
	maxAge: number;
};

export function foundationSessionCookieOptions(protocol: string): FoundationSessionCookieOptions {
	return {
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		secure: protocol === 'https:'
	};
}

export function authenticationBindingCookieOptions(
	protocol: string,
	ttlMs: number
): AuthenticationBindingCookieOptions {
	return {
		...foundationSessionCookieOptions(protocol),
		maxAge: Math.max(0, Math.floor(ttlMs / 1000))
	};
}
