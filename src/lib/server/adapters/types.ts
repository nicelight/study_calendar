import type { Provider } from '$lib/server/modules/identity-access/public';

export type NormalizedProviderIdentity = {
	provider: Provider;
	subject: string;
};

export type ProviderCallbackRequest =
	| Request
	| URL
	| URLSearchParams
	| Record<string, string | undefined>;

export type ProviderBeginInput = {
	callbackUrl: string;
	state: string;
};

export type ProviderCallbackInput = {
	request: ProviderCallbackRequest;
	state: string;
};

export interface ProviderAdapter {
	readonly provider: Provider;
	begin(input: ProviderBeginInput): string;
	verifyCallback(input: ProviderCallbackInput): Promise<NormalizedProviderIdentity>;
}

export function readCallbackParameters(request: ProviderCallbackRequest): URLSearchParams {
	if (request instanceof URLSearchParams) {
		return new URLSearchParams(request);
	}

	if (request instanceof URL) {
		return new URLSearchParams(request.searchParams);
	}

	if (typeof Request !== 'undefined' && request instanceof Request) {
		return new URL(request.url).searchParams;
	}

	if ('url' in request && typeof request.url === 'string') {
		return new URL(request.url).searchParams;
	}

	return new URLSearchParams(
		Object.entries(request)
			.filter((entry): entry is [string, string] => typeof entry[1] === 'string')
	);
}

export function assertCallbackState(parameters: URLSearchParams, expectedState: string): void {
	if (!expectedState || parameters.get('state') !== expectedState) {
		throw new Error('invalid-provider-state');
	}
}

export function requiredConfig(value: string | undefined): string {
	if (!value) {
		throw new Error('provider-configuration-missing');
	}
	return value;
}

export function requiredSubject(value: unknown): string {
	if (typeof value !== 'string' || value.length === 0) {
		throw new Error('provider-subject-missing');
	}
	return value;
}
