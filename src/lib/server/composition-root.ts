import { CenterSchedulingBoundary } from '$lib/server/modules/center-scheduling/public';
import { IdentityAccessBoundary } from '$lib/server/modules/identity-access/public';
import { readPlatformConfig } from '$lib/server/platform/config';
import { SharedDatabase } from '$lib/server/platform/database';

export type CompositionRoot = {
	database: SharedDatabase;
	identityAccess: IdentityAccessBoundary;
	centerScheduling: CenterSchedulingBoundary;
};

export function createCompositionRoot(options: { database?: SharedDatabase; databaseFilename?: string } = {}): CompositionRoot {
	const database =
		options.database ??
		new SharedDatabase({ filename: options.databaseFilename ?? readPlatformConfig().databaseFilename });
	const identityAccess = new IdentityAccessBoundary(database);

	return {
		database,
		identityAccess,
		centerScheduling: new CenterSchedulingBoundary(database, identityAccess)
	};
}

let applicationRoot: CompositionRoot | undefined;

export function getCompositionRoot(): CompositionRoot {
	applicationRoot ??= createCompositionRoot();
	return applicationRoot;
}
