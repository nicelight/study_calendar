import { EventEmitter } from 'node:events';
import { randomBytes, scryptSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	BootstrapCancelledError,
	promptHiddenPassword,
	runBootstrapAdmin
} from '../../scripts/bootstrap-admin.mjs';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

type State = {
	accounts: number;
	credentials: number;
	centers: number;
	memberships: number;
};

function state(database: SharedDatabase): State {
	return database.sqlite
		.prepare(`
			SELECT
				(SELECT COUNT(*) FROM accounts) AS accounts,
				(SELECT COUNT(*) FROM password_credentials) AS credentials,
				(SELECT COUNT(*) FROM centers) AS centers,
				(SELECT COUNT(*) FROM center_memberships) AS memberships
		`)
		.get() as State;
}

function generatedSecret(label: string): string {
	return `${label}-${randomBytes(24).toString('base64url')}`;
}

describe('TASK-029 fresh verifier-owned functional probe', () => {
	const databases: SharedDatabase[] = [];

	afterEach(() => {
		vi.restoreAllMocks();
		for (const database of databases.splice(0)) database.close();
	});

	it('keeps secret input behind the prompt/argv boundary and delegates to Identity & Access', async () => {
		const database = new SharedDatabase({ filename: ':memory:' });
		databases.push(database);
		const promptedSecret = generatedSecret('prompt');
		const environmentDecoy = generatedSecret('environment-decoy');
		const output = { write: vi.fn() };
		const ownerCall = vi.spyOn(IdentityAccessBoundary.prototype, 'bootstrapFirstAdmin');

		await runBootstrapAdmin({
			argv: [],
			env: { DATABASE_URL: ':memory:', PASSWORD: environmentDecoy },
			output,
			promptEmailInput: async () => '  First.Admin@Example.COM  ',
			promptPasswordInput: async () => promptedSecret,
			createDatabase: () => database,
			closeDatabase: false
		});

		expect(ownerCall).toHaveBeenCalledTimes(1);
		const request = ownerCall.mock.calls[0]?.[0];
		expect(request?.email).toBe('  First.Admin@Example.COM  ');
		expect(request?.password === promptedSecret).toBe(true);
		const credential = database.sqlite
			.prepare('SELECT email, salt, password_hash FROM password_credentials')
			.get() as { email: string; salt: Buffer; password_hash: Buffer };
		expect(credential.email).toBe('first.admin@example.com');
		expect(credential.password_hash.equals(scryptSync(promptedSecret, credential.salt, 64))).toBe(true);
		expect(credential.password_hash.equals(scryptSync(environmentDecoy, credential.salt, 64))).toBe(false);
		const emitted = output.write.mock.calls.map(([value]) => String(value)).join('');
		expect(emitted).toBe('Bootstrap complete.\n');
		expect(emitted.includes(promptedSecret)).toBe(false);
		expect(emitted.includes(environmentDecoy)).toBe(false);

		const createDatabase = vi.fn();
		const promptEmailInput = vi.fn();
		const promptPasswordInput = vi.fn();
		await expect(
			runBootstrapAdmin({
				argv: [generatedSecret('argv-decoy')],
				createDatabase,
				promptEmailInput,
				promptPasswordInput
			})
		).rejects.toThrow('command-does-not-accept-arguments');
		expect(createDatabase).not.toHaveBeenCalled();
		expect(promptEmailInput).not.toHaveBeenCalled();
		expect(promptPasswordInput).not.toHaveBeenCalled();
	});

	it('suppresses terminal echo and restores raw mode after hidden input', async () => {
		const input = new EventEmitter() as EventEmitter & {
			isTTY: boolean;
			setRawMode: ReturnType<typeof vi.fn>;
			resume: ReturnType<typeof vi.fn>;
			pause: ReturnType<typeof vi.fn>;
		};
		input.isTTY = true;
		input.setRawMode = vi.fn();
		input.resume = vi.fn();
		input.pause = vi.fn();
		const output = { isTTY: true, write: vi.fn() };
		const secret = generatedSecret('hidden');

		const result = promptHiddenPassword(input as never, output as never);
		input.emit('data', Buffer.from(`${secret}\r`));

		expect(await result).toBe(secret);
		const emitted = output.write.mock.calls.map(([value]) => String(value)).join('');
		expect(emitted).toBe('Password: \n');
		expect(emitted.includes(secret)).toBe(false);
		expect(input.setRawMode.mock.calls).toEqual([[true], [false]]);
	});

	it('persists exactly one normalized Admin credential with unique random-salt scrypt and no plaintext', () => {
		const first = new SharedDatabase({ filename: ':memory:' });
		const second = new SharedDatabase({ filename: ':memory:' });
		databases.push(first, second);
		const secret = generatedSecret('credential');

		new IdentityAccessBoundary(first).bootstrapFirstAdmin({
			email: '  OWNER@Example.COM  ',
			password: secret
		});
		new IdentityAccessBoundary(second).bootstrapFirstAdmin({
			email: 'second@example.com',
			password: secret
		});

		const account = first.sqlite.prepare('SELECT id, role FROM accounts').get() as {
			id: string;
			role: string;
		};
		const credential = first.sqlite
			.prepare('SELECT account_id, email, salt, password_hash FROM password_credentials')
			.get() as { account_id: string; email: string; salt: Buffer; password_hash: Buffer };
		const secondSalt = second.sqlite.prepare('SELECT salt FROM password_credentials').get() as {
			salt: Buffer;
		};

		expect(state(first)).toEqual({ accounts: 1, credentials: 1, centers: 0, memberships: 0 });
		expect(account).toEqual({ id: credential.account_id, role: 'admin' });
		expect(credential.email).toBe('owner@example.com');
		expect(credential.salt).toHaveLength(32);
		expect(credential.salt.equals(secondSalt.salt)).toBe(false);
		expect(credential.password_hash.equals(scryptSync(secret, credential.salt, 64))).toBe(true);
		expect(first.sqlite.serialize().includes(Buffer.from(secret, 'utf8'))).toBe(false);

		first.sqlite.prepare("INSERT INTO accounts (id, role) VALUES ('other', 'admin')").run();
		expect(() =>
			first.sqlite
				.prepare('INSERT INTO password_credentials (account_id, email, salt, password_hash) VALUES (?, ?, ?, ?)')
				.run('other', 'owner@example.com', Buffer.alloc(32), Buffer.alloc(64))
		).toThrow();
	});

	it('rolls back write/derivation/cancellation failures and remains safely repeatable', async () => {
		const writeFailureDatabase = new SharedDatabase({ filename: ':memory:' });
		const derivationFailureDatabase = new SharedDatabase({ filename: ':memory:' });
		const cancellationDatabase = new SharedDatabase({ filename: ':memory:' });
		databases.push(writeFailureDatabase, derivationFailureDatabase, cancellationDatabase);
		const secret = generatedSecret('rollback');

		writeFailureDatabase.sqlite.exec(`
			CREATE TRIGGER verifier_fail_credential
			BEFORE INSERT ON password_credentials
			BEGIN
				SELECT RAISE(ABORT, 'verifier-forced-write-failure');
			END;
		`);
		const writeBoundary = new IdentityAccessBoundary(writeFailureDatabase);
		expect(() =>
			writeBoundary.bootstrapFirstAdmin({ email: 'write@example.com', password: secret })
		).toThrow('verifier-forced-write-failure');
		expect(state(writeFailureDatabase)).toEqual({ accounts: 0, credentials: 0, centers: 0, memberships: 0 });
		writeFailureDatabase.sqlite.exec('DROP TRIGGER verifier_fail_credential');
		writeBoundary.bootstrapFirstAdmin({ email: 'write@example.com', password: secret });
		const committed = writeFailureDatabase.sqlite.serialize();
		expect(() =>
			writeBoundary.bootstrapFirstAdmin({ email: 'again@example.com', password: secret })
		).toThrow('first-admin-already-bootstrapped');
		expect(writeFailureDatabase.sqlite.serialize().equals(committed)).toBe(true);

		const failingDerivation = new IdentityAccessBoundary(derivationFailureDatabase, {
			derivePasswordCredential: () => {
				throw new Error('verifier-forced-derivation-failure');
			}
		});
		expect(() =>
			failingDerivation.bootstrapFirstAdmin({ email: 'derive@example.com', password: secret })
		).toThrow('verifier-forced-derivation-failure');
		expect(state(derivationFailureDatabase)).toEqual({ accounts: 0, credentials: 0, centers: 0, memberships: 0 });
		new IdentityAccessBoundary(derivationFailureDatabase).bootstrapFirstAdmin({
			email: 'derive@example.com',
			password: secret
		});
		expect(state(derivationFailureDatabase)).toEqual({ accounts: 1, credentials: 1, centers: 0, memberships: 0 });

		await expect(
			runBootstrapAdmin({
				argv: [],
				promptEmailInput: async () => 'cancel@example.com',
				promptPasswordInput: async () => {
					throw new BootstrapCancelledError();
				},
				createDatabase: () => cancellationDatabase,
				closeDatabase: false
			})
		).rejects.toThrow('bootstrap-cancelled');
		expect(state(cancellationDatabase)).toEqual({ accounts: 0, credentials: 0, centers: 0, memberships: 0 });
		await runBootstrapAdmin({
			argv: [],
			output: { write: () => undefined },
			promptEmailInput: async () => 'cancel@example.com',
			promptPasswordInput: async () => secret,
			createDatabase: () => cancellationDatabase,
			closeDatabase: false
		});
		expect(state(cancellationDatabase)).toEqual({ accounts: 1, credentials: 1, centers: 0, memberships: 0 });
	});

	it('keeps the CLI SQL-free and leaves browser password login to TASK-030', () => {
		const adapter = readFileSync('scripts/bootstrap-admin.mjs', 'utf8');
		const loginRoute = readFileSync('src/routes/login/+page.server.ts', 'utf8');
		const authTransport = readFileSync('src/routes/auth/transport.server.ts', 'utf8');

		expect(adapter).toContain('bootstrapFirstAdmin');
		expect(adapter).not.toMatch(/\.(prepare|exec)\s*\(|\b(INSERT|UPDATE|DELETE)\b/i);
		expect(adapter.match(/env\.[A-Z_]+/g)).toEqual(['env.DATABASE_URL']);
		expect(`${loginRoute}\n${authTransport}`).not.toMatch(/password_credentials|bootstrapFirstAdmin|scrypt/i);
	});
});
