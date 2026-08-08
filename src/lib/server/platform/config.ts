export type PlatformConfig = {
	databaseFilename: string;
};

export function readPlatformConfig(env: Record<string, string | undefined> = process.env): PlatformConfig {
	return {
    databaseFilename: env.DATABASE_URL ?? 'study-calendar.db'
	};
}
