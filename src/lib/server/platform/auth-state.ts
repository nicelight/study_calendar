import { randomBytes } from 'node:crypto';
import type { Provider } from '$lib/server/modules/identity-access/public';

export const DEFAULT_AUTHENTICATION_STATE_TTL_MS = 5 * 60 * 1000;

export type AuthenticationStateInput = {
	provider: Provider;
	callbackUrl: string;
	invitationToken?: string;
};

export type AuthenticationState = AuthenticationStateInput;

export type AuthenticationStateIssue = {
	state: string;
	browserBinding: string;
};

export type AuthenticationStateStoreOptions = {
	now?: () => Date;
	stateFactory?: () => string;
	bindingFactory?: () => string;
	ttlMs?: number;
};

type StoredAuthenticationState = AuthenticationState & {
	browserBinding: string;
	issuedAt: number;
};

/**
 * Server-owned, short-lived and one-use provider callback state.
 *
 * The store deliberately keeps the capability in the owning server instance;
 * the browser only receives the opaque token and cannot choose its binding.
 */
export class AuthenticationStateStore {
	private readonly states = new Map<string, StoredAuthenticationState>();
	private readonly now: () => Date;
	private readonly stateFactory: () => string;
	private readonly bindingFactory: () => string;
	private readonly stateTtlMs: number;

	constructor(options: AuthenticationStateStoreOptions = {}) {
		this.now = options.now ?? (() => new Date());
		this.stateFactory = options.stateFactory ?? (() => randomBytes(32).toString('base64url'));
		this.bindingFactory = options.bindingFactory ?? (() => randomBytes(32).toString('base64url'));
		this.stateTtlMs = options.ttlMs ?? DEFAULT_AUTHENTICATION_STATE_TTL_MS;
		if (!Number.isFinite(this.stateTtlMs) || this.stateTtlMs <= 0) {
			throw new Error('invalid-auth-state-ttl');
		}
	}

	get ttlMs(): number {
		return this.stateTtlMs;
	}

	issue(input: AuthenticationStateInput): AuthenticationStateIssue {
		this.validateInput(input);
		const issuedAt = this.now().getTime();
		this.pruneExpired(issuedAt);
		const state = this.stateFactory();
		const browserBinding = this.bindingFactory();
		if (
			typeof state !== 'string' ||
			state.length === 0 ||
			typeof browserBinding !== 'string' ||
			browserBinding.length === 0 ||
			this.states.has(state) ||
			[...this.states.values()].some((stored) => stored.browserBinding === browserBinding)
		) {
			throw new Error('invalid-auth-state');
		}

		this.states.set(state, {
			provider: input.provider,
			callbackUrl: input.callbackUrl,
			browserBinding,
			issuedAt,
			...(input.invitationToken !== undefined
				? { invitationToken: input.invitationToken }
					: {})
		});
		return { state, browserBinding };
	}

	discard(state: string): void {
		this.states.delete(state);
	}

	consume(input: AuthenticationStateInput & { state: string; browserBinding: string }): AuthenticationState {
		if (
			typeof input.state !== 'string' ||
			input.state.length === 0 ||
			typeof input.browserBinding !== 'string' ||
			input.browserBinding.length === 0
		) {
			throw new Error('invalid-auth-state');
		}
		this.validateInput(input);

		const now = this.now().getTime();
		this.pruneExpired(now);
		const stored = this.states.get(input.state);
		if (
			!stored ||
			stored.provider !== input.provider ||
			stored.callbackUrl !== input.callbackUrl ||
			stored.browserBinding !== input.browserBinding ||
			!Number.isFinite(now) ||
			now >= stored.issuedAt + this.stateTtlMs
		) {
			throw new Error('invalid-auth-state');
		}

		this.states.delete(input.state);
		return {
			provider: stored.provider,
			callbackUrl: stored.callbackUrl,
			...(stored.invitationToken ? { invitationToken: stored.invitationToken } : {})
		};
	}

	private pruneExpired(now: number): void {
		if (!Number.isFinite(now)) {
			return;
		}
		for (const [state, stored] of this.states) {
			if (now >= stored.issuedAt + this.stateTtlMs) {
				this.states.delete(state);
			}
		}
	}

	private validateInput(input: AuthenticationStateInput): void {
		if (
			!input ||
			(input.provider !== 'telegram' && input.provider !== 'google') ||
			typeof input.callbackUrl !== 'string' ||
			input.callbackUrl.length === 0 ||
			(input.invitationToken !== undefined &&
				(typeof input.invitationToken !== 'string' || input.invitationToken.length === 0))
		) {
			throw new Error('invalid-auth-state');
		}
	}
}
