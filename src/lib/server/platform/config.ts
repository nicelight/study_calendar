import type { GoogleOAuthAdapterOptions, TelegramLoginAdapterOptions } from '$lib/server/adapters';

export type PlatformConfig = {
	databaseFilename: string;
	providers: {
		telegram: Pick<TelegramLoginAdapterOptions, 'botToken'>;
		google: Pick<GoogleOAuthAdapterOptions, 'clientId' | 'clientSecret'>;
	};
};

export function readPlatformConfig(env: Record<string, string | undefined> = process.env): PlatformConfig {
	return {
		databaseFilename: env.DATABASE_URL ?? 'study-calendar.db',
		providers: {
			telegram: { botToken: env.TELEGRAM_BOT_TOKEN },
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET
			}
		}
	};
}
