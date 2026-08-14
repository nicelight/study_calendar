import { createInterface } from 'node:readline/promises';
import { pathToFileURL } from 'node:url';
import { IdentityAccessBoundary } from '../src/lib/server/modules/identity-access/public';
import { SharedDatabase } from '../src/lib/server/platform/database';

/**
 * @typedef {{
 * 	argv?: string[];
 * 	env?: Record<string, string | undefined>;
 * 	output?: { write: (value: string) => unknown };
 * 	promptEmailInput?: () => Promise<string>;
 * 	promptPasswordInput?: () => Promise<string>;
 * 	createDatabase?: (filename: string) => SharedDatabase;
 * 	createIdentityAccess?: (database: SharedDatabase) => IdentityAccessBoundary;
 * 	closeDatabase?: boolean;
 * }} BootstrapOptions
 */

export class BootstrapCancelledError extends Error {
	constructor() {
		super('bootstrap-cancelled');
	}
}

/** @param {NodeJS.ReadStream} input @param {NodeJS.WriteStream} output */
export async function promptEmail(input = process.stdin, output = process.stdout) {
	if (!input.isTTY || !output.isTTY) {
		throw new Error('interactive-terminal-required');
	}

	const prompt = createInterface({ input, output, terminal: true });
	try {
		const email = await prompt.question('Email: ');
		if (email.length === 0) {
			throw new BootstrapCancelledError();
		}
		return email;
	} finally {
		prompt.close();
	}
}

/** @param {NodeJS.ReadStream} input @param {NodeJS.WriteStream} output */
export function promptHiddenPassword(input = process.stdin, output = process.stdout) {
	if (!input.isTTY || !output.isTTY || typeof input.setRawMode !== 'function') {
		return Promise.reject(new Error('interactive-terminal-required'));
	}

	output.write('Password: ');
	input.setRawMode(true);
	input.resume();

	return new Promise((resolve, reject) => {
		let password = '';
		const cleanup = () => {
			input.off('data', onData);
			input.setRawMode(false);
			input.pause();
		};
		const cancel = () => {
			cleanup();
			output.write('\n');
			reject(new BootstrapCancelledError());
		};
		/** @param {Buffer} chunk */
		const onData = (chunk) => {
			for (const character of chunk.toString('utf8')) {
				if (character === '\r' || character === '\n') {
					cleanup();
					output.write('\n');
					if (password.length === 0) {
						reject(new BootstrapCancelledError());
					} else {
						resolve(password);
					}
					return;
				}
				if (character === '\u0003' || character === '\u0004') {
					cancel();
					return;
				}
				if (character === '\b' || character === '\u007f') {
					password = password.slice(0, -1);
					continue;
				}
				if (character >= ' ') {
					password += character;
				}
			}
		};
		input.on('data', onData);
	});
}

/** @param {string} filename */
function createSharedDatabase(filename) {
	return new SharedDatabase({ filename });
}

/** @param {SharedDatabase} database */
function createFirstAdminBoundary(database) {
	return new IdentityAccessBoundary(database);
}

/** @param {BootstrapOptions} options */
export async function runBootstrapAdmin({
	argv = process.argv.slice(2),
	env = process.env,
	output = process.stdout,
	promptEmailInput = promptEmail,
	promptPasswordInput = promptHiddenPassword,
	createDatabase = createSharedDatabase,
	createIdentityAccess = createFirstAdminBoundary,
	closeDatabase = true
} = {}) {
	if (argv.length !== 0) {
		throw new Error('command-does-not-accept-arguments');
	}

	const database = createDatabase(env.DATABASE_URL ?? 'study-calendar.db');
	try {
		const email = await promptEmailInput();
		const password = await promptPasswordInput();
		createIdentityAccess(database).bootstrapFirstAdmin({ email, password });
		output.write('Bootstrap complete.\n');
	} finally {
		if (closeDatabase) {
			database.close();
		}
	}
}

async function main() {
	try {
		await runBootstrapAdmin();
	} catch {
		process.stderr.write('Bootstrap failed. No changes were made.\n');
		process.exitCode = 1;
	}
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	await main();
}
