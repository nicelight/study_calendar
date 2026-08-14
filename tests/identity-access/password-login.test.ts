import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { scryptSync } from 'node:crypto';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

describe('password credential authentication boundary', () => {
	const databases: SharedDatabase[] = [];

	afterEach(() => {
		for (const database of databases.splice(0)) {
			database.close();
		}
	});

	it('authenticates a normalized credential into the existing exact account session', () => {
		const database = new SharedDatabase({ filename: ':memory:' });
		databases.push(database);
		const identityAccess = new IdentityAccessBoundary(database);
		identityAccess.bootstrapFirstAdmin({
			email: '  ADMIN@Example.COM  ',
			password: 'task-030-test-password'
		});

		const sessionToken = identityAccess.authenticatePassword({
			email: ' admin@example.COM ',
			password: 'task-030-test-password'
		});

		expect(sessionToken).toMatch(/^[A-Za-z0-9_-]{40,}$/);
		expect(identityAccess.resolveActor(sessionToken)).toMatchObject({ role: 'admin' });
	});

	it('uses the same derivation/comparison path and generic denial for unknown email and wrong password', () => {
		const database = new SharedDatabase({ filename: ':memory:' });
		databases.push(database);
		const salt = Buffer.alloc(32, 7);
		const password = 'task-030-test-password';
		database.sqlite.prepare("INSERT INTO accounts (id, role) VALUES ('password-account', 'admin')").run();
		database.sqlite
			.prepare(
				'INSERT INTO password_credentials (account_id, email, salt, password_hash) VALUES (?, ?, ?, ?)'
			)
			.run('password-account', 'admin@example.com', salt, scryptSync(password, salt, 64));

		const derivations: Array<{ password: string; salt: Buffer }> = [];
		const identityAccess = new IdentityAccessBoundary(database, {
			derivePasswordCredential: (submittedPassword, submittedSalt) => {
				derivations.push({ password: submittedPassword, salt: submittedSalt });
				return scryptSync(submittedPassword, submittedSalt, 64);
			}
		});

		for (const request of [
			{ email: 'unknown@example.com', password },
			{ email: 'admin@example.com', password: 'wrong-password' }
		]) {
			expect(() => identityAccess.authenticatePassword(request)).toThrow('invalid-credentials');
		}

		expect(derivations).toHaveLength(2);
		expect(database.sqlite.prepare('SELECT COUNT(*) AS count FROM sessions').get()).toEqual({ count: 0 });
		expect(
			readFileSync('src/lib/server/modules/identity-access/public.ts', 'utf8')
		).toContain('timingSafeEqual(comparableHash, expectedHash)');

	});
});
