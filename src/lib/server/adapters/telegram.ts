import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { ProviderAdapter, ProviderBeginInput, ProviderCallbackInput } from './types';
import { assertCallbackState, readCallbackParameters, requiredConfig, requiredSubject } from './types';

export type TelegramLoginAdapterOptions = {
	botToken?: string;
	maxAuthAgeSeconds?: number;
	now?: () => Date;
};

export class TelegramLoginAdapter implements ProviderAdapter {
	readonly provider = 'telegram' as const;
	private readonly botToken: string | undefined;
	private readonly maxAuthAgeSeconds: number;
	private readonly now: () => Date;

	constructor(options: TelegramLoginAdapterOptions = {}) {
		this.botToken = options.botToken;
		this.maxAuthAgeSeconds = options.maxAuthAgeSeconds ?? 300;
		this.now = options.now ?? (() => new Date());
	}

	begin(input: ProviderBeginInput): string {
		const botToken = requiredConfig(this.botToken);
		const separator = botToken.indexOf(':');
		const botId = separator > 0 ? botToken.slice(0, separator) : '';
		requiredConfig(botId);
		if (!input.callbackUrl || !input.state) {
			throw new Error('invalid-provider-start');
		}

		const returnTo = new URL(input.callbackUrl);
		returnTo.searchParams.set('state', input.state);
		const authorizationUrl = new URL('https://oauth.telegram.org/auth');
		authorizationUrl.search = new URLSearchParams({
			bot_id: botId,
			origin: new URL(input.callbackUrl).origin,
			return_to: returnTo.toString(),
			request_access: 'write'
		}).toString();
		return authorizationUrl.toString();
	}

	async verifyCallback(input: ProviderCallbackInput) {
		const parameters = readCallbackParameters(input.request);
		assertCallbackState(parameters, input.state);
		const botToken = requiredConfig(this.botToken);
		const hash = parameters.get('hash');
		const id = parameters.get('id');
		const authDate = parameters.get('auth_date');
		if (!hash || !id || !authDate) {
			throw new Error('invalid-telegram-callback');
		}

		const authTimestamp = Number(authDate);
		const nowTimestamp = Math.floor(this.now().getTime() / 1000);
		if (
			!Number.isInteger(authTimestamp) ||
			authTimestamp > nowTimestamp ||
			nowTimestamp - authTimestamp > this.maxAuthAgeSeconds
		) {
			throw new Error('invalid-telegram-auth-date');
		}

		const checkString = [...parameters.entries()]
			.filter(([key]) => key !== 'hash' && key !== 'state')
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([key, value]) => `${key}=${value}`)
			.join('\n');
		const secretKey = createHash('sha256').update(botToken).digest();
		const expectedHash = createHmac('sha256', secretKey).update(checkString).digest('hex');
		const expectedBuffer = Buffer.from(expectedHash, 'utf8');
		const actualBuffer = Buffer.from(hash, 'utf8');
		if (
			expectedBuffer.length !== actualBuffer.length ||
			!timingSafeEqual(expectedBuffer, actualBuffer)
		) {
			throw new Error('invalid-telegram-signature');
		}

		return { provider: this.provider, subject: requiredSubject(id) };
	}
}
