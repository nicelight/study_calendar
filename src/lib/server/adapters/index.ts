import type { Provider } from '$lib/server/modules/identity-access/public';
import { GoogleOAuthAdapter, type GoogleOAuthAdapterOptions } from './google';
import { TelegramLoginAdapter, type TelegramLoginAdapterOptions } from './telegram';
import type { ProviderAdapter } from './types';

export * from './google';
export * from './telegram';
export * from './types';

export class ProviderAdapterRegistry {
	private readonly adapters: ReadonlyMap<Provider, ProviderAdapter>;

	constructor(adapters: readonly ProviderAdapter[]) {
		this.adapters = new Map(adapters.map((adapter) => [adapter.provider, adapter]));
	}

	get(provider: Provider): ProviderAdapter {
		const adapter = this.adapters.get(provider);
		if (!adapter) {
			throw new Error('provider-configuration-missing');
		}
		return adapter;
	}
}

export type ProviderAdapterFactoryOptions = {
	telegram?: TelegramLoginAdapterOptions;
	google?: GoogleOAuthAdapterOptions;
};

export function createProviderAdapters(options: ProviderAdapterFactoryOptions = {}): ProviderAdapterRegistry {
	return new ProviderAdapterRegistry([
		new TelegramLoginAdapter(options.telegram),
		new GoogleOAuthAdapter(options.google)
	]);
}
