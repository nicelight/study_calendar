import { EventEmitter } from 'node:events';
import { fork, type ChildProcess } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	BootstrapCancelledError,
	promptHiddenPassword
} from '../../scripts/bootstrap-admin.mjs';
import { SharedDatabase } from '../../src/lib/server/platform/database';

type WorkerResult = 'success' | 'denied';

function spawnContender(databaseFilename: string, email: string): {
	child: ChildProcess;
	ready: Promise<void>;
	finished: Promise<WorkerResult>;
} {
	const child = fork(
		resolve('.tasks/TASK-029-T3-FT-001-W13/TASK-029-T3-FT-001-W13-S-RED-VERIFY-concurrency-worker.mjs'),
		[databaseFilename, email],
		{
			cwd: process.cwd(),
			execArgv: ['--loader', './scripts/bootstrap-admin-loader.mjs'],
			silent: true
		}
	);

	const ready = new Promise<void>((resolveReady, reject) => {
		child.on('message', (message) => {
			if ((message as { state?: string }).state === 'ready') resolveReady();
		});
		child.once('error', reject);
		child.once('exit', (code) => {
			if (code && code !== 0) reject(new Error(`contender-exit-${code}`));
		});
	});
	const finished = new Promise<WorkerResult>((resolveFinished, reject) => {
		child.on('message', (message) => {
			const result = message as { state?: string; outcome?: WorkerResult };
			if (result.state === 'finished' && result.outcome) resolveFinished(result.outcome);
		});
		child.once('error', reject);
	});

	return { child, ready, finished };
}

describe('TASK-029 hostile semantic probes', () => {
	const disposableDirectories: string[] = [];

	afterEach(() => {
		vi.restoreAllMocks();
		for (const directory of disposableDirectories.splice(0)) {
			rmSync(directory, { recursive: true, force: true });
		}
	});

	it('allows at most one Admin credential when two supported local owners race on one empty DB', async () => {
		const directory = mkdtempSync(join(tmpdir(), 'task-029-red-verify-'));
		disposableDirectories.push(directory);
		const databaseFilename = join(directory, 'race.sqlite');
		const initialized = new SharedDatabase({ filename: databaseFilename });
		initialized.close();

		const first = spawnContender(databaseFilename, 'first@example.com');
		const second = spawnContender(databaseFilename, 'second@example.com');
		await Promise.all([first.ready, second.ready]);
		first.child.send('go');
		second.child.send('go');
		const outcomes = await Promise.all([first.finished, second.finished]);

		expect(outcomes.sort()).toEqual(['denied', 'success']);
		const observed = new SharedDatabase({ filename: databaseFilename });
		try {
			expect(
				observed.sqlite
					.prepare(`
						SELECT
							(SELECT COUNT(*) FROM accounts) AS accounts,
							(SELECT COUNT(*) FROM password_credentials) AS credentials,
							(SELECT COUNT(*) FROM accounts WHERE role = 'admin') AS admins
					`)
					.get()
			).toEqual({ accounts: 1, credentials: 1, admins: 1 });
		} finally {
			observed.close();
		}
	});

	it('restores the terminal and detaches input when the hidden prompt is cancelled', async () => {
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

		const prompt = promptHiddenPassword(input as never, output as never);
		input.emit('data', Buffer.from('discarded-local-test-input\u0003'));

		await expect(prompt).rejects.toBeInstanceOf(BootstrapCancelledError);
		expect(input.setRawMode.mock.calls).toEqual([[true], [false]]);
		expect(input.pause).toHaveBeenCalledTimes(1);
		expect(input.listenerCount('data')).toBe(0);
		expect(output.write.mock.calls.map(([value]) => String(value)).join('')).toBe('Password: \n');
	});
});
