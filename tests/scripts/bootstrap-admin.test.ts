import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	BootstrapCancelledError,
	promptHiddenPassword,
	runBootstrapAdmin
} from '../../scripts/bootstrap-admin.mjs';
import { SharedDatabase } from '../../src/lib/server/platform/database';

describe('bootstrap-admin local CLI adapter', () => {
	const databases: SharedDatabase[] = [];

	afterEach(() => {
		for (const database of databases.splice(0)) {
			database.close();
		}
	});

	it('takes email and hidden password only from local prompts and does not expose the password in output', async () => {
		const database = new SharedDatabase({ filename: ':memory:' });
		databases.push(database);
		const output = { write: vi.fn() };
		const password = 'task-029-cli-test-password';

		await runBootstrapAdmin({
			argv: [],
			env: { DATABASE_URL: ':memory:' },
			output,
			promptEmailInput: async () => '  ADMIN@example.com ',
			promptPasswordInput: async () => password,
			createDatabase: () => database,
			closeDatabase: false
		});

		const outputText = output.write.mock.calls.map(([value]) => String(value)).join('');
		expect(outputText).toBe('Bootstrap complete.\n');
		expect(outputText).not.toContain(password);
		expect(database.sqlite.prepare('SELECT email FROM password_credentials').get()).toEqual({ email: 'admin@example.com' });
	});

	it('rejects command-line arguments before opening a database or prompting', async () => {
		const createDatabase = vi.fn();
		const promptEmailInput = vi.fn();
		const promptPasswordInput = vi.fn();

		await expect(
			runBootstrapAdmin({ argv: ['not-accepted'], createDatabase, promptEmailInput, promptPasswordInput })
		).rejects.toThrow('command-does-not-accept-arguments');
		expect(createDatabase).not.toHaveBeenCalled();
		expect(promptEmailInput).not.toHaveBeenCalled();
		expect(promptPasswordInput).not.toHaveBeenCalled();
	});

	it('does not mutate state when the hidden prompt is cancelled', async () => {
		const database = new SharedDatabase({ filename: ':memory:' });
		databases.push(database);

		await expect(
			runBootstrapAdmin({
				argv: [],
				promptEmailInput: async () => 'admin@example.com',
				promptPasswordInput: async () => {
					throw new BootstrapCancelledError();
				},
				createDatabase: () => database,
				closeDatabase: false
			})
		).rejects.toThrow('bootstrap-cancelled');
		expect(database.sqlite.prepare('SELECT COUNT(*) AS count FROM accounts').get()).toEqual({ count: 0 });
		expect(database.sqlite.prepare('SELECT COUNT(*) AS count FROM password_credentials').get()).toEqual({ count: 0 });
	});

	it('denies a safe rerun without creating a second Admin or credential', async () => {
		const database = new SharedDatabase({ filename: ':memory:' });
		databases.push(database);
		const options = {
			argv: [],
			output: { write: vi.fn() },
			promptEmailInput: async () => 'admin@example.com',
			promptPasswordInput: async () => 'task-029-cli-test-password',
			createDatabase: () => database,
			closeDatabase: false
		};

		await runBootstrapAdmin(options);
		await expect(runBootstrapAdmin(options)).rejects.toThrow('first-admin-already-bootstrapped');
		expect(database.sqlite.prepare('SELECT COUNT(*) AS count FROM accounts').get()).toEqual({ count: 1 });
		expect(database.sqlite.prepare('SELECT COUNT(*) AS count FROM password_credentials').get()).toEqual({ count: 1 });
	});

	it('hides typed password characters in the terminal prompt', async () => {
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
		const password = 'task-029-hidden-test';

		const prompt = promptHiddenPassword(input as never, output as never);
		input.emit('data', Buffer.from(`${password}\r`));

		await expect(prompt).resolves.toBe(password);
		const outputText = output.write.mock.calls.map(([value]) => String(value)).join('');
		expect(outputText).toBe('Password: \n');
		expect(outputText).not.toContain(password);
		expect(input.setRawMode).toHaveBeenNthCalledWith(1, true);
		expect(input.setRawMode).toHaveBeenNthCalledWith(2, false);
	});

	it('keeps the command as an adapter without direct account or credential table writes', () => {
		const source = readFileSync('scripts/bootstrap-admin.mjs', 'utf8');

		expect(source).toContain('bootstrapFirstAdmin');
		expect(source).not.toMatch(/INSERT\s+INTO\s+(accounts|password_credentials)/i);
		expect(source).not.toMatch(/\.prepare\(/);
		expect(source.match(/env\.[A-Z_]+/g)).toEqual(['env.DATABASE_URL']);
		expect(source).not.toContain('env[');
	});
});
