import { afterEach, describe, expect, it } from 'vitest';
import { scryptSync } from 'node:crypto';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

describe('first Admin password bootstrap boundary', () => {
	const databases: SharedDatabase[] = [];

	afterEach(() => {
		for (const database of databases.splice(0)) {
			database.close();
		}
	});

	it('creates one normalized Admin credential with a random salt and Node scrypt result', () => {
		const database = new SharedDatabase({ filename: ':memory:' });
		databases.push(database);
		const identityAccess = new IdentityAccessBoundary(database);
		const password = 'task-029-test-password';

		identityAccess.bootstrapFirstAdmin({ email: '  ADMIN@Example.COM  ', password });

		const account = database.sqlite.prepare('SELECT id, role FROM accounts').get() as {
			id: string;
			role: string;
		};
		const credential = database.sqlite
			.prepare('SELECT account_id, email, salt, password_hash FROM password_credentials')
			.get() as { account_id: string; email: string; salt: Buffer; password_hash: Buffer };

		expect(account.role).toBe('admin');
		expect(credential.account_id).toBe(account.id);
		expect(credential.email).toBe('admin@example.com');
		expect(credential.salt).toHaveLength(32);
		expect(credential.password_hash).toEqual(scryptSync(password, credential.salt, 64));
		expect(credential.password_hash.toString('utf8')).not.toBe(password);
	});

	it('uses a distinct salt for the same password in separately bootstrapped disposable databases', () => {
		const first = new SharedDatabase({ filename: ':memory:' });
		const second = new SharedDatabase({ filename: ':memory:' });
		databases.push(first, second);
		new IdentityAccessBoundary(first).bootstrapFirstAdmin({
			email: 'admin-one@example.com',
			password: 'task-029-test-password'
		});
		new IdentityAccessBoundary(second).bootstrapFirstAdmin({
			email: 'admin-two@example.com',
			password: 'task-029-test-password'
		});

		const firstSalt = first.sqlite
			.prepare('SELECT salt FROM password_credentials')
			.get() as { salt: Buffer };
		const secondSalt = second.sqlite
			.prepare('SELECT salt FROM password_credentials')
			.get() as { salt: Buffer };

		expect(firstSalt.salt.equals(secondSalt.salt)).toBe(false);
	});

	it('rejects a non-empty account set without a credential write', () => {
		const database = new SharedDatabase({ filename: ':memory:' });
		databases.push(database);
		database.sqlite.prepare("INSERT INTO accounts (id, role) VALUES ('existing', 'admin')").run();
		const before = database.sqlite
			.prepare('SELECT (SELECT COUNT(*) FROM accounts) AS accounts, (SELECT COUNT(*) FROM password_credentials) AS credentials')
			.get();

		expect(() =>
			new IdentityAccessBoundary(database).bootstrapFirstAdmin({
				email: 'new@example.com',
				password: 'task-029-test-password'
			})
		).toThrow('first-admin-already-bootstrapped');
		expect(
			database.sqlite
				.prepare('SELECT (SELECT COUNT(*) FROM accounts) AS accounts, (SELECT COUNT(*) FROM password_credentials) AS credentials')
				.get()
		).toEqual(before);
	});

	it('rejects an empty normalized email before persistence', () => {
		const database = new SharedDatabase({ filename: ':memory:' });
		databases.push(database);

		expect(() =>
			new IdentityAccessBoundary(database).bootstrapFirstAdmin({
				email: '   ',
				password: 'task-029-test-password'
			})
		).toThrow('invalid-email');
		expect(database.sqlite.prepare('SELECT COUNT(*) AS count FROM accounts').get()).toEqual({ count: 0 });
		expect(database.sqlite.prepare('SELECT COUNT(*) AS count FROM password_credentials').get()).toEqual({ count: 0 });
	});

	it('rolls back the account when credential persistence fails', () => {
		const database = new SharedDatabase({ filename: ':memory:' });
		databases.push(database);
		database.sqlite.exec(`
			CREATE TRIGGER fail_password_credential
			BEFORE INSERT ON password_credentials
			BEGIN
				SELECT RAISE(ABORT, 'forced-credential-write-failure');
			END;
		`);

		expect(() =>
			new IdentityAccessBoundary(database).bootstrapFirstAdmin({
				email: 'admin@example.com',
				password: 'task-029-test-password'
			})
		).toThrow('forced-credential-write-failure');
		expect(database.sqlite.prepare('SELECT COUNT(*) AS count FROM accounts').get()).toEqual({ count: 0 });
		expect(database.sqlite.prepare('SELECT COUNT(*) AS count FROM password_credentials').get()).toEqual({ count: 0 });
	});

	it('leaves persistence unchanged when scrypt derivation fails', () => {
		const database = new SharedDatabase({ filename: ':memory:' });
		databases.push(database);
		const identityAccess = new IdentityAccessBoundary(database, {
			derivePasswordCredential: () => {
				throw new Error('forced-derivation-failure');
			}
		});

		expect(() =>
			identityAccess.bootstrapFirstAdmin({ email: 'admin@example.com', password: 'task-029-test-password' })
		).toThrow('forced-derivation-failure');
		expect(database.sqlite.prepare('SELECT COUNT(*) AS count FROM accounts').get()).toEqual({ count: 0 });
		expect(database.sqlite.prepare('SELECT COUNT(*) AS count FROM password_credentials').get()).toEqual({ count: 0 });
	});

	it('enforces normalized email uniqueness in the database', () => {
		const database = new SharedDatabase({ filename: ':memory:' });
		databases.push(database);
		database.sqlite.exec(`
			INSERT INTO accounts (id, role) VALUES ('first', 'admin'), ('second', 'admin');
			INSERT INTO password_credentials (account_id, email, salt, password_hash)
			VALUES ('first', 'admin@example.com', X'00', X'00');
		`);

		expect(() =>
			database.sqlite
				.prepare('INSERT INTO password_credentials (account_id, email, salt, password_hash) VALUES (?, ?, ?, ?)')
				.run('second', 'admin@example.com', Buffer.from([1]), Buffer.from([1]))
		).toThrow();
	});
});
