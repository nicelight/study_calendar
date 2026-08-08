import Database from 'better-sqlite3';

export type SharedDatabaseOptions = {
	filename?: string;
};

export class SharedDatabase {
	readonly filename: string;
	readonly sqlite: Database.Database;

	constructor(options: SharedDatabaseOptions = {}) {
		this.filename = options.filename ?? ':memory:';
		this.sqlite = new Database(this.filename);
		this.sqlite.pragma('foreign_keys = ON');
		this.sqlite.exec(`
			CREATE TABLE IF NOT EXISTS accounts (
				id TEXT PRIMARY KEY,
				role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent'))
			);
			CREATE TABLE IF NOT EXISTS sessions (
				token TEXT PRIMARY KEY,
				account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
				revoked_at TEXT
			);
			CREATE TABLE IF NOT EXISTS invitations (
				token TEXT PRIMARY KEY,
				account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
				status TEXT NOT NULL CHECK (status IN ('pending', 'consumed', 'revoked')),
				expires_at TEXT NOT NULL
			);
			CREATE TABLE IF NOT EXISTS external_identities (
				provider TEXT NOT NULL CHECK (provider IN ('telegram', 'google')),
				subject TEXT NOT NULL,
				account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
				PRIMARY KEY (provider, subject),
				UNIQUE (account_id, provider)
			);
			CREATE TABLE IF NOT EXISTS centers (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL
			);
			CREATE TABLE IF NOT EXISTS center_memberships (
				center_id TEXT NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
				account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
				PRIMARY KEY (center_id, account_id)
			);
		`);
	}

	transaction<T>(operation: () => T): T {
		return this.sqlite.transaction(operation)();
	}

	close(): void {
		this.sqlite.close();
	}
}
