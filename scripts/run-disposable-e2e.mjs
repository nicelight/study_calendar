import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { access, mkdir, unlink } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';

const DEFAULT_PORT = 5174;

/** @param {string} message */
function fail(message) {
	throw new Error(`disposable-e2e: ${message}`);
}

/** @param {string} databaseInput @param {string} [projectRoot] @returns {string} */
export function resolveDisposableDatabasePath(databaseInput, projectRoot = process.cwd()) {
	if (typeof databaseInput !== 'string' || !databaseInput.trim()) {
		fail('database path is required');
	}
	if (isAbsolute(databaseInput)) {
		fail('database path must be project-relative');
	}

	const root = resolve(projectRoot);
	const tmpRoot = resolve(root, 'tmp');
	const databasePath = resolve(root, databaseInput);
	const relativePath = relative(tmpRoot, databasePath);
	if (
		!relativePath ||
		relativePath.startsWith(`..${sep}`) ||
		relativePath === '..' ||
		isAbsolute(relativePath) ||
		relativePath.includes(sep) ||
		!relativePath.endsWith('.db') ||
		databasePath.endsWith(`${sep}study-calendar.db`)
	) {
		fail('database must be a direct project tmp/*.db path and cannot be study-calendar.db');
	}

	return databasePath;
}

/** @param {string} specInput @param {string} projectRoot @returns {string} */
function resolveSpecPath(specInput, projectRoot) {
	if (typeof specInput !== 'string' || !specInput.trim() || isAbsolute(specInput)) {
		fail('spec path must be project-relative');
	}
	const root = resolve(projectRoot);
	const specPath = resolve(root, specInput);
	const relativePath = relative(root, specPath);
	if (
		!relativePath ||
		relativePath.startsWith(`..${sep}`) ||
		relativePath === '..' ||
		isAbsolute(relativePath) ||
		!relativePath.startsWith(`e2e${sep}`) ||
		!relativePath.endsWith('.spec.ts')
	) {
		fail('spec must be an e2e/*.spec.ts path');
	}
	return specPath;
}

/** @param {string} filePath */
async function removeExactFile(filePath) {
	try {
		await access(filePath);
	} catch (cause) {
		if (cause && typeof cause === 'object' && 'code' in cause && cause.code === 'ENOENT') return;
		throw cause;
	}
	await unlink(filePath);
}

/** @param {string} databasePath */
export async function prepareDisposableDatabase(databasePath) {
	await mkdir(dirname(databasePath), { recursive: true });
	await removeExactFile(databasePath);
}

/** @param {string} databasePath */
export async function cleanupDisposableDatabase(databasePath) {
	await removeExactFile(databasePath);
	await removeExactFile(`${databasePath}-wal`);
	await removeExactFile(`${databasePath}-shm`);
	await removeExactFile(`${databasePath}-journal`);
}

/** @param {{databasePath: string, specPath: string, projectRoot?: string, port?: number}} options */
export function runDisposableE2E({ databasePath, specPath, projectRoot = process.cwd(), port = DEFAULT_PORT }) {
	const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
	const result = spawnSync(
		npm,
		['run', 'e2e', '--', '--config=playwright.config.ts', specPath],
		{
			cwd: projectRoot,
			stdio: 'inherit',
			env: {
				...process.env,
				DATABASE_URL: databasePath,
				DISPOSABLE_E2E: '1',
				PLAYWRIGHT_PORT: String(port),
				PLAYWRIGHT_BASE_URL: `http://127.0.0.1:${port}`
			}
		}
	);

	if (result.error) throw result.error;
	return result.status ?? 1;
}

/** @param {string[]} argv @returns {{database: string, spec: string}} */
function parseArguments(argv) {
	const values = new Map();
	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];
		if (argument !== '--database' && argument !== '--spec') {
			fail(`unknown argument ${argument}`);
		}
		const value = argv[index + 1];
		if (!value || value.startsWith('--')) fail(`${argument} requires a value`);
		values.set(argument, value);
		index += 1;
	}
	if (values.size !== 2) fail('usage: --database tmp/name.db --spec e2e/name.spec.ts');
	return { database: values.get('--database'), spec: values.get('--spec') };
}

/**
 * @param {string[]} [argv]
 * @param {string} [projectRoot]
 * @param {(options: {databasePath: string, specPath: string, projectRoot: string}) => number} [execute]
 * @returns {Promise<number>}
 */
export async function main(argv = process.argv.slice(2), projectRoot = process.cwd(), execute = runDisposableE2E) {
	const { database, spec } = parseArguments(argv);
	const databasePath = resolveDisposableDatabasePath(database, projectRoot);
	const specPath = resolveSpecPath(spec, projectRoot);
	await prepareDisposableDatabase(databasePath);
	let exitCode = 1;
	try {
		exitCode = execute({ databasePath, specPath, projectRoot });
	} finally {
		await cleanupDisposableDatabase(databasePath);
	}
	return exitCode;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	main().then((exitCode) => {
		process.exitCode = exitCode;
	}).catch((cause) => {
		console.error(cause instanceof Error ? cause.message : cause);
		process.exitCode = 1;
	});
}
