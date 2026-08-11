import { createHmac, createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import {
	GoogleOAuthAdapter,
	TelegramLoginAdapter,
	type ProviderCallbackRequest
} from '../../src/lib/server/adapters';
import { AuthenticationStateStore } from '../../src/lib/server/platform/auth-state';
import {
	AUTHENTICATION_BINDING_COOKIE,
	authenticationBindingCookieOptions,
	foundationSessionCookieOptions
} from '../../src/lib/server/platform/session-cookie';

function callbackRequest(
	provider: 'telegram' | 'google',
	params: Record<string, string>
): ProviderCallbackRequest {
	return new Request(`https://calendar.test/auth/${provider}/callback?${new URLSearchParams(params)}`);
}

function telegramHash(params: Record<string, string>, botToken: string): string {
	const checkString = Object.entries(params)
		.filter(([key]) => key !== 'hash' && key !== 'state')
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([key, value]) => `${key}=${value}`)
		.join('\n');
	const secretKey = createHash('sha256').update(botToken).digest();
	return createHmac('sha256', secretKey).update(checkString).digest('hex');
}

describe('server-only provider verification boundary', () => {
	it('normalizes a server-verified Telegram callback and excludes caller context', async () => {
		const botToken = '123456:telegram-secret';
		const telegram = new TelegramLoginAdapter({
			botToken,
			now: () => new Date('2026-08-11T00:00:00.000Z')
		});
		const params = {
			id: 'telegram-subject',
			auth_date: String(Math.floor(Date.parse('2026-08-11T00:00:00.000Z') / 1000)),
			first_name: 'Ada',
			role: 'admin',
			centerId: 'attacker-center'
		};

		const identity = await telegram.verifyCallback({
			request: callbackRequest('telegram', {
				...params,
				state: 'server-state',
				hash: telegramHash(params, botToken)
			}),
			state: 'server-state'
		});

		expect(identity).toEqual({ provider: 'telegram', subject: 'telegram-subject' });
		expect(identity).not.toHaveProperty('role');
		expect(identity).not.toHaveProperty('centerId');
	});

	it('normalizes Google only after server-side code exchange and never exposes the client secret', async () => {
		const clientSecret = 'fixture-client-secret';
		const callbackUrl = 'https://calendar.test/auth/google/callback';
		const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
			if (String(input).includes('/token')) {
				const tokenRequest = new URLSearchParams(String(init?.body));
				expect(tokenRequest.get('code')).toBe('authorization-code');
				expect(tokenRequest.get('redirect_uri')).toBe(callbackUrl);
				return new Response(JSON.stringify({ access_token: 'server-access-token' }), { status: 200 });
			}
			expect(init?.headers).toMatchObject({ Authorization: 'Bearer server-access-token' });
			return new Response(JSON.stringify({ sub: 'google-subject', email: 'not-a-product-field' }), {
				status: 200
			});
		});
		const google = new GoogleOAuthAdapter({
			clientId: 'google-client-id',
			clientSecret,
			fetchImpl
		});
		const startUrl = google.begin({ callbackUrl, state: 'server-state' });
		expect(new URL(startUrl).searchParams.get('redirect_uri')).toBe(callbackUrl);

		const identity = await google.verifyCallback({
			request: callbackRequest('google', { code: 'authorization-code', state: 'server-state' }),
			state: 'server-state'
		});

		expect(identity).toEqual({ provider: 'google', subject: 'google-subject' });
		expect(startUrl).not.toContain(clientSecret);
		expect(JSON.stringify(identity)).not.toContain(clientSecret);
	});

	it('rejects invalid, tampered, and replayed server authentication state', () => {
		const store = new AuthenticationStateStore({
			now: () => new Date('2026-08-11T00:00:00.000Z'),
			stateFactory: () => 'issued-state'
		});
		const issuedState = store.issue({ provider: 'google', callbackUrl: 'https://calendar.test/auth/google/callback' });

		expect(() =>
			store.consume({
				provider: 'google',
				state: `${issuedState.state}-tampered`,
				callbackUrl: 'https://calendar.test/auth/google/callback',
				browserBinding: issuedState.browserBinding
			})
		).toThrow('invalid-auth-state');
		expect(() =>
			store.consume({ provider: 'telegram', state: issuedState.state, callbackUrl: 'https://calendar.test/auth/google/callback', browserBinding: issuedState.browserBinding })
		).toThrow('invalid-auth-state');
		expect(
			store.consume({ provider: 'google', state: issuedState.state, callbackUrl: 'https://calendar.test/auth/google/callback', browserBinding: issuedState.browserBinding })
		).toMatchObject({ provider: 'google', callbackUrl: 'https://calendar.test/auth/google/callback' });
		expect(() =>
			store.consume({ provider: 'google', state: issuedState.state, callbackUrl: 'https://calendar.test/auth/google/callback', browserBinding: issuedState.browserBinding })
		).toThrow('invalid-auth-state');
	});

	it('rejects an expired state without consuming a still-unexpired capability', () => {
		let currentTime = new Date('2026-08-11T00:00:00.000Z');
		const store = new AuthenticationStateStore({
			now: () => currentTime,
			ttlMs: 1_000,
			stateFactory: () => 'expiring-state'
		});
		const issuedState = store.issue({ provider: 'telegram', callbackUrl: 'https://calendar.test/auth/telegram/callback' });

		currentTime = new Date('2026-08-11T00:00:00.001Z');
		// A mismatch must not consume the state; the valid callback remains usable.
		expect(() =>
			store.consume({ provider: 'telegram', state: issuedState.state, callbackUrl: 'https://calendar.test/other-callback', browserBinding: issuedState.browserBinding })
		).toThrow('invalid-auth-state');
		expect(store.consume({ provider: 'telegram', state: issuedState.state, callbackUrl: 'https://calendar.test/auth/telegram/callback', browserBinding: issuedState.browserBinding })).toEqual({
			provider: 'telegram',
			callbackUrl: 'https://calendar.test/auth/telegram/callback'
		});

		const expiredState = store.issue({ provider: 'telegram', callbackUrl: 'https://calendar.test/auth/telegram/callback' });
		currentTime = new Date('2026-08-11T00:00:01.001Z');
		expect(() =>
			store.consume({ provider: 'telegram', state: expiredState.state, callbackUrl: 'https://calendar.test/auth/telegram/callback', browserBinding: expiredState.browserBinding })
		).toThrow('invalid-auth-state');
	});

	it('prunes expired state before issuing a replacement capability', () => {
		let currentTime = new Date('2026-08-11T00:00:00.000Z');
		let bindingNumber = 0;
		const store = new AuthenticationStateStore({
			now: () => currentTime,
			ttlMs: 1_000,
			stateFactory: () => 'reusable-state',
			bindingFactory: () => `binding-${++bindingNumber}`
		});

		store.issue({ provider: 'google', callbackUrl: 'https://calendar.test/auth/google/callback' });
		currentTime = new Date('2026-08-11T00:00:01.001Z');

			expect(store.issue({ provider: 'google', callbackUrl: 'https://calendar.test/auth/google/callback' })).toMatchObject({
				state: 'reusable-state',
				browserBinding: 'binding-2'
			});
	});

	it('prunes expired records during issue and consume while preserving valid siblings', () => {
		let currentTime = new Date('2026-08-11T00:00:00.000Z');
		const issueStates = ['expired-state', 'sibling-state', 'expired-state'];
		const issueBindings = ['expired-binding', 'sibling-binding', 'replacement-binding'];
		const issueStore = new AuthenticationStateStore({
			now: () => currentTime,
			ttlMs: 1_000,
			stateFactory: () => issueStates.shift()!,
			bindingFactory: () => issueBindings.shift()!
		});
		const expired = issueStore.issue({ provider: 'google', callbackUrl: 'https://calendar.test/auth/google/callback' });
		currentTime = new Date('2026-08-11T00:00:00.500Z');
		const sibling = issueStore.issue({ provider: 'google', callbackUrl: 'https://calendar.test/auth/google/callback' });
		currentTime = new Date('2026-08-11T00:00:01.001Z');

		expect(issueStore.issue({ provider: 'google', callbackUrl: 'https://calendar.test/auth/google/callback' })).toEqual({
			state: expired.state,
			browserBinding: 'replacement-binding'
		});
		expect(issueStore.consume({
			provider: 'google',
			callbackUrl: 'https://calendar.test/auth/google/callback',
			state: sibling.state,
			browserBinding: sibling.browserBinding
		})).toEqual({ provider: 'google', callbackUrl: 'https://calendar.test/auth/google/callback' });

		const consumeStates = ['expired-for-consume', 'sibling-for-consume'];
		const consumeBindings = ['expired-consume-binding', 'sibling-consume-binding'];
		const consumeStore = new AuthenticationStateStore({
			now: () => currentTime,
			ttlMs: 1_000,
			stateFactory: () => consumeStates.shift()!,
			bindingFactory: () => consumeBindings.shift()!
		});
		currentTime = new Date('2026-08-11T00:00:00.000Z');
		const expiredForConsume = consumeStore.issue({ provider: 'telegram', callbackUrl: 'https://calendar.test/auth/telegram/callback' });
		currentTime = new Date('2026-08-11T00:00:00.500Z');
		const siblingForConsume = consumeStore.issue({ provider: 'telegram', callbackUrl: 'https://calendar.test/auth/telegram/callback' });
		currentTime = new Date('2026-08-11T00:00:01.001Z');

		expect(() => consumeStore.consume({
			provider: 'telegram',
			callbackUrl: 'https://calendar.test/auth/telegram/callback',
			state: expiredForConsume.state,
			browserBinding: expiredForConsume.browserBinding
		})).toThrow('invalid-auth-state');
		expect(consumeStore.consume({
			provider: 'telegram',
			callbackUrl: 'https://calendar.test/auth/telegram/callback',
			state: siblingForConsume.state,
			browserBinding: siblingForConsume.browserBinding
		})).toEqual({ provider: 'telegram', callbackUrl: 'https://calendar.test/auth/telegram/callback' });
	});

	it('keeps foundation_session cookie attributes exact for HTTPS and local HTTP', () => {
		expect(foundationSessionCookieOptions('https:')).toEqual({
			httpOnly: true,
			path: '/',
			sameSite: 'lax',
			secure: true
		});
		expect(foundationSessionCookieOptions('http:')).toEqual({
			httpOnly: true,
			path: '/',
			sameSite: 'lax',
			secure: false
		});
	});

	it('keeps browser-binding cookie opaque and aligned with the state TTL', () => {
		expect(AUTHENTICATION_BINDING_COOKIE).toBe('foundation_auth_binding');
		expect(authenticationBindingCookieOptions('https:', 5 * 60 * 1000)).toEqual({
			httpOnly: true,
			path: '/',
			sameSite: 'lax',
			secure: true,
			maxAge: 300
		});
		expect(authenticationBindingCookieOptions('http:', 1_500)).toEqual({
			httpOnly: true,
			path: '/',
			sameSite: 'lax',
			secure: false,
			maxAge: 1
		});
	});
});
