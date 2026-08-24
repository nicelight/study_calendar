import type { LayoutServerLoad } from './$types';

const PROTECTED_ROUTE_PREFIXES = [
	'/admin',
	'/center',
	'/calendar',
	'/lesson-context',
	'/home',
	'/classes',
	'/statistics',
	'/profile'
] as const;

function isProtectedRoute(pathname: string): boolean {
	return PROTECTED_ROUTE_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
	);
}

export const load: LayoutServerLoad = ({ locals, url }) => ({
	actor: isProtectedRoute(url.pathname) && locals.actor ? { role: locals.actor.role } : null
});
