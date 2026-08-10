import { CenterSchedulingBoundary } from '$lib/server/modules/center-scheduling/public';
import { CollaborationBoundary } from '$lib/server/modules/collaboration/public';
import { FinancialLedgerBoundary } from '$lib/server/modules/financial-ledger/public';
import { createIdentityAccessProvisioningWriter } from '$lib/server/modules/identity-access/internal';
import { IdentityAccessBoundary } from '$lib/server/modules/identity-access/public';
import { LearningProgressBoundary } from '$lib/server/modules/learning-progress/public';
import { LessonContextBoundary } from '$lib/server/modules/lesson-context/public';
import { readPlatformConfig } from '$lib/server/platform/config';
import { SharedDatabase } from '$lib/server/platform/database';

export type CompositionRoot = {
	database: SharedDatabase;
	identityAccess: IdentityAccessBoundary;
	centerScheduling: CenterSchedulingBoundary;
	collaboration: CollaborationBoundary;
	learningProgress: LearningProgressBoundary;
	financialLedger: FinancialLedgerBoundary;
	lessonContext: LessonContextBoundary;
};

export function createCompositionRoot(options: { database?: SharedDatabase; databaseFilename?: string } = {}): CompositionRoot {
	const database =
		options.database ??
		new SharedDatabase({ filename: options.databaseFilename ?? readPlatformConfig().databaseFilename });
	const identityAccess = new IdentityAccessBoundary(database);
	const provisioningWriter = createIdentityAccessProvisioningWriter(database);
	const centerScheduling = new CenterSchedulingBoundary(database, {
		resolveActor: identityAccess.resolveActor.bind(identityAccess),
		provisionAccount: provisioningWriter
	});
	const collaboration = new CollaborationBoundary(database, identityAccess, centerScheduling);
	const financialLedger = new FinancialLedgerBoundary(database, identityAccess, centerScheduling);
	const learningProgress = new LearningProgressBoundary(
		database,
		identityAccess,
		centerScheduling,
		financialLedger
	);
	const lessonContext = new LessonContextBoundary(
		database,
		identityAccess,
		centerScheduling,
		learningProgress,
		collaboration,
		financialLedger
	);

	return {
		database,
		identityAccess,
		centerScheduling,
		collaboration,
		learningProgress,
		financialLedger,
		lessonContext
	};
}

let applicationRoot: CompositionRoot | undefined;

export function getCompositionRoot(): CompositionRoot {
	applicationRoot ??= createCompositionRoot();
	return applicationRoot;
}
