import type { ProviderAdapter, ProviderBeginInput, ProviderCallbackInput, ProviderCallbackRequest } from './types';
import { assertCallbackState, readCallbackParameters, requiredConfig, requiredSubject } from './types';

type JsonRecord = Record<string, unknown>;

function callbackUrlFromRequest(request: ProviderCallbackRequest): string {
	const callbackUrl =
		request instanceof URL
			? new URL(request)
			: typeof Request !== 'undefined' && request instanceof Request
				? new URL(request.url)
				: 'url' in request && typeof request.url === 'string'
					? new URL(request.url)
					: undefined;

	if (!callbackUrl) {
		throw new Error('invalid-google-callback');
	}

	callbackUrl.search = '';
	callbackUrl.hash = '';
	return callbackUrl.toString();
}

function isJsonRecord(value: unknown): value is JsonRecord {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export type GoogleOAuthAdapterOptions = {
	clientId?: string;
	clientSecret?: string;
	authorizationEndpoint?: string;
	tokenEndpoint?: string;
	userInfoEndpoint?: string;
	fetchImpl?: typeof fetch;
};

export class GoogleOAuthAdapter implements ProviderAdapter {
	readonly provider = 'google' as const;
	private readonly clientId: string | undefined;
	private readonly clientSecret: string | undefined;
	private readonly authorizationEndpoint: string;
	private readonly tokenEndpoint: string;
	private readonly userInfoEndpoint: string;
	private readonly fetchImpl: typeof fetch;

	constructor(options: GoogleOAuthAdapterOptions = {}) {
		this.clientId = options.clientId;
		this.clientSecret = options.clientSecret;
		this.authorizationEndpoint =
			options.authorizationEndpoint ?? 'https://accounts.google.com/o/oauth2/v2/auth';
		this.tokenEndpoint = options.tokenEndpoint ?? 'https://oauth2.googleapis.com/token';
		this.userInfoEndpoint =
			options.userInfoEndpoint ?? 'https://openidconnect.googleapis.com/v1/userinfo';
		this.fetchImpl = options.fetchImpl ?? fetch;
	}

	begin(input: ProviderBeginInput): string {
		const clientId = requiredConfig(this.clientId);
		if (!input.callbackUrl || !input.state) {
			throw new Error('invalid-provider-start');
		}
		const authorizationUrl = new URL(this.authorizationEndpoint);
		authorizationUrl.search = new URLSearchParams({
			client_id: clientId,
			redirect_uri: input.callbackUrl,
			response_type: 'code',
			scope: 'openid email profile',
			state: input.state
		}).toString();
		return authorizationUrl.toString();
	}

	async verifyCallback(input: ProviderCallbackInput) {
		const parameters = readCallbackParameters(input.request);
		assertCallbackState(parameters, input.state);
		if (parameters.get('error')) {
			throw new Error('google-provider-callback-failed');
		}
		const code = parameters.get('code');
		const clientId = requiredConfig(this.clientId);
		const clientSecret = requiredConfig(this.clientSecret);
		if (!code) {
			throw new Error('invalid-google-callback');
		}

		let tokenResponse: Response;
		try {
			tokenResponse = await this.fetchImpl(this.tokenEndpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({
					code,
					client_id: clientId,
						client_secret: clientSecret,
						redirect_uri: callbackUrlFromRequest(input.request),
					grant_type: 'authorization_code'
				}).toString()
			});
		} catch {
			throw new Error('google-provider-outage');
		}
		if (!tokenResponse.ok) {
			throw new Error('google-token-exchange-failed');
		}

		const tokenPayload: unknown = await tokenResponse.json();
		const accessToken = isJsonRecord(tokenPayload) ? tokenPayload.access_token : undefined;
		if (typeof accessToken !== 'string' || accessToken.length === 0) {
			throw new Error('google-token-invalid');
		}

		let userInfoResponse: Response;
		try {
			userInfoResponse = await this.fetchImpl(this.userInfoEndpoint, {
				headers: { Authorization: `Bearer ${accessToken}` }
			});
		} catch {
			throw new Error('google-provider-outage');
		}
		if (!userInfoResponse.ok) {
			throw new Error('google-userinfo-failed');
		}
		const userInfo: unknown = await userInfoResponse.json();
		const subject = isJsonRecord(userInfo) ? userInfo.sub : undefined;
		return { provider: this.provider, subject: requiredSubject(subject) };
	}
}
