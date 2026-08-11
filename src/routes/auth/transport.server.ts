import { error as kitError, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { ProviderAdapter, ProviderAdapterRegistry } from '$lib/server/adapters';
import { getCompositionRoot } from '$lib/server/composition-root';
import type {
	IdentityAccessBoundary,
	Provider,
	VerifiedProviderIdentity
} from '$lib/server/modules/identity-access/public';
import { AuthenticationStateStore, type AuthenticationState } from '$lib/server/platform/auth-state';
import {
	AUTHENTICATION_BINDING_COOKIE,
	authenticationBindingCookieOptions,
	FOUNDATION_SESSION_COOKIE,
	foundationSessionCookieOptions
} from '$lib/server/platform/session-cookie';

const PROVIDERS = ['telegram', 'google'] as const satisfies readonly Provider[];

type IdentityAccessTransportBoundary = Pick<
	IdentityAccessBoundary,
	| 'isInvitationUsable'
	| 'authenticateVerifiedIdentity'
	| 'acceptInvitation'
	| 'revokeSession'
>;

export type AuthenticationTransportDependencies = {
	identityAccess: IdentityAccessTransportBoundary;
	providers: ProviderAdapterRegistry;
	stateStore: AuthenticationStateStore;
};

export type AuthenticationPageData = {
	providers: readonly Provider[];
};

function isProvider(value: string | undefined): value is Provider {
	return value === 'telegram' || value === 'google';
}

function callbackUrl(url: URL, provider: Provider): string {
	return new URL(`/auth/${provider}/callback`, url.origin).toString();
}

function safeProviderError(cause: unknown): never {
	const message = cause instanceof Error ? cause.message : '';
	if (message === 'invalid-provider-state' || message === 'invalid-auth-state') {
		throw kitError(400, 'Invalid authentication state');
	}
	if (
		message === 'provider-configuration-missing' ||
		message.endsWith('-provider-outage') ||
		message.includes('provider-callback-failed') ||
		message.includes('token-exchange-failed') ||
		message.includes('userinfo-failed')
	) {
		throw kitError(502, 'Authentication provider unavailable');
	}
	throw kitError(400, 'Authentication failed');
}

function safeIdentityAccessError(cause: unknown): never {
	const message = cause instanceof Error ? cause.message : '';
	if (message === 'invalid-invitation' || message === 'duplicate-provider-identity') {
		throw kitError(410, 'Invitation is invalid or no longer available');
	}
	if (message === 'unknown-provider-identity') {
		throw kitError(401, 'Authentication failed');
	}
	throw kitError(500, 'Authentication could not be completed');
}

export class AuthenticationTransport {
	constructor(private readonly dependencies: AuthenticationTransportDependencies) {}

	loginPage(): AuthenticationPageData {
		return { providers: PROVIDERS };
	}

	invitePage(event: RequestEvent): AuthenticationPageData & { invitationToken: string } {
		const invitationToken = event.params.token;
		if (!invitationToken || !this.dependencies.identityAccess.isInvitationUsable(invitationToken)) {
			throw kitError(410, 'Invitation is invalid or expired');
		}
		return { invitationToken, providers: PROVIDERS };
	}

	start(event: RequestEvent): never {
		const providerName = event.params.provider;
		if (!isProvider(providerName)) {
			throw kitError(404, 'Not found');
		}

		const invitationToken = event.url.searchParams.get('invitation') ?? undefined;
		if (invitationToken && !this.dependencies.identityAccess.isInvitationUsable(invitationToken)) {
			throw kitError(410, 'Invitation is invalid or expired');
		}

		const redirectUri = callbackUrl(event.url, providerName);
		const issuedState = this.dependencies.stateStore.issue({
			provider: providerName,
			callbackUrl: redirectUri,
			...(invitationToken ? { invitationToken } : {})
		});

		let authorizationUrl: string;
		try {
				authorizationUrl = this.dependencies.providers.get(providerName).begin({
					callbackUrl: redirectUri,
					state: issuedState.state
				});
			} catch (cause) {
				this.dependencies.stateStore.discard(issuedState.state);
				safeProviderError(cause);
			}

		event.cookies.set(
			AUTHENTICATION_BINDING_COOKIE,
			issuedState.browserBinding,
			authenticationBindingCookieOptions(event.url.protocol, this.dependencies.stateStore.ttlMs)
		);

		throw redirect(303, authorizationUrl);
	}

	async callback(event: RequestEvent): Promise<never> {
		try {
			const providerName = event.params.provider;
			const state = event.url.searchParams.get('state');
			const browserBinding = event.cookies.get(AUTHENTICATION_BINDING_COOKIE);
			if (!isProvider(providerName) || !state || !browserBinding) {
				throw kitError(400, 'Invalid authentication state');
			}

			const redirectUri = callbackUrl(event.url, providerName);
			let authenticationState: AuthenticationState;
			try {
				authenticationState = this.dependencies.stateStore.consume({
					provider: providerName,
					callbackUrl: redirectUri,
					state,
					browserBinding
				});
			} catch (cause) {
				safeProviderError(cause);
			}

			let identity: VerifiedProviderIdentity;
			try {
				identity = await this.dependencies.providers.get(providerName).verifyCallback({
					request: event.request,
					state
				});
			} catch (cause) {
				safeProviderError(cause);
			}

			let sessionToken: string;
			try {
				sessionToken = authenticationState.invitationToken
					? this.dependencies.identityAccess.acceptInvitation({
							invitationToken: authenticationState.invitationToken,
							identity
						})
					: this.dependencies.identityAccess.authenticateVerifiedIdentity(identity);
			} catch (cause) {
				safeIdentityAccessError(cause);
			}

			event.cookies.set(
				FOUNDATION_SESSION_COOKIE,
				sessionToken,
				foundationSessionCookieOptions(event.url.protocol)
			);
			throw redirect(303, '/');
		} finally {
			event.cookies.delete(
			AUTHENTICATION_BINDING_COOKIE,
			authenticationBindingCookieOptions(event.url.protocol, this.dependencies.stateStore.ttlMs)
		);
		}
	}

	logout(event: RequestEvent): never {
		const sessionToken = event.cookies.get(FOUNDATION_SESSION_COOKIE);
		this.dependencies.identityAccess.revokeSession(sessionToken ?? '');
		event.cookies.delete(
			FOUNDATION_SESSION_COOKIE,
			foundationSessionCookieOptions(event.url.protocol)
		);
		throw redirect(303, '/login');
	}
}

let defaultTransport: AuthenticationTransport | undefined;

export function createAuthenticationTransport(
	dependencies: AuthenticationTransportDependencies
): AuthenticationTransport {
	return new AuthenticationTransport(dependencies);
}

export function getAuthenticationTransport(): AuthenticationTransport {
	defaultTransport ??= createAuthenticationTransport({
		identityAccess: getCompositionRoot().identityAccess,
		providers: getCompositionRoot().providers,
		stateStore: new AuthenticationStateStore()
	});
	return defaultTransport;
}

export type AuthenticationProviderAdapter = ProviderAdapter;
