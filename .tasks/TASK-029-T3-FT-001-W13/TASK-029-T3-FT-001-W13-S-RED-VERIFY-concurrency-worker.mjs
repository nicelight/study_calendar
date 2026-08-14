import { randomBytes } from 'node:crypto';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const [databaseFilename, email] = process.argv.slice(2);
const database = new SharedDatabase({ filename: databaseFilename });

process.send?.({ state: 'ready' });
process.once('message', (message) => {
	if (message !== 'go') return;

	try {
		new IdentityAccessBoundary(database).bootstrapFirstAdmin({
			email,
			password: `red-verify-${process.pid}-${randomBytes(24).toString('base64url')}`
		});
		process.send?.({ state: 'finished', outcome: 'success' });
	} catch {
		process.send?.({ state: 'finished', outcome: 'denied' });
	} finally {
		database.close();
	}
});
