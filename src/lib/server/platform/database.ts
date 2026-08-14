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
			CREATE TABLE IF NOT EXISTS password_credentials (
				account_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
				email TEXT NOT NULL UNIQUE,
				salt BLOB NOT NULL,
				password_hash BLOB NOT NULL
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
			CREATE TABLE IF NOT EXISTS provider_binding_confirmations (
				session_token TEXT PRIMARY KEY REFERENCES sessions(token) ON DELETE CASCADE
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
			CREATE TABLE IF NOT EXISTS classes (
				id TEXT PRIMARY KEY,
				center_id TEXT NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
				name TEXT NOT NULL,
				mode TEXT NOT NULL CHECK (mode IN ('individual', 'group')),
				UNIQUE (id, center_id)
			);
			CREATE TABLE IF NOT EXISTS teacher_assignments (
				center_id TEXT NOT NULL,
				class_id TEXT NOT NULL,
				teacher_account_id TEXT NOT NULL,
				PRIMARY KEY (class_id, teacher_account_id),
				FOREIGN KEY (class_id, center_id) REFERENCES classes(id, center_id) ON DELETE CASCADE,
				FOREIGN KEY (center_id, teacher_account_id) REFERENCES center_memberships(center_id, account_id) ON DELETE CASCADE
			);
			CREATE TABLE IF NOT EXISTS class_students (
				center_id TEXT NOT NULL,
				class_id TEXT NOT NULL,
				student_account_id TEXT NOT NULL,
				PRIMARY KEY (class_id, student_account_id),
				FOREIGN KEY (class_id, center_id) REFERENCES classes(id, center_id) ON DELETE CASCADE,
				FOREIGN KEY (center_id, student_account_id) REFERENCES center_memberships(center_id, account_id) ON DELETE CASCADE
			);
			CREATE TABLE IF NOT EXISTS parent_student_links (
				center_id TEXT NOT NULL,
				parent_account_id TEXT NOT NULL,
				student_account_id TEXT NOT NULL,
				PRIMARY KEY (center_id, parent_account_id, student_account_id),
				FOREIGN KEY (center_id, parent_account_id) REFERENCES center_memberships(center_id, account_id) ON DELETE CASCADE,
				FOREIGN KEY (center_id, student_account_id) REFERENCES center_memberships(center_id, account_id) ON DELETE CASCADE
			);
			CREATE TABLE IF NOT EXISTS schedules (
				id TEXT PRIMARY KEY,
				center_id TEXT NOT NULL,
				class_id TEXT NOT NULL,
				start_date TEXT NOT NULL,
				end_date TEXT NOT NULL,
				weekdays TEXT NOT NULL,
				created_by_account_id TEXT NOT NULL REFERENCES accounts(id),
				created_at TEXT NOT NULL,
				CHECK (start_date <= end_date),
				FOREIGN KEY (class_id, center_id) REFERENCES classes(id, center_id) ON DELETE CASCADE
			);
			CREATE INDEX IF NOT EXISTS schedules_class_lookup
				ON schedules (class_id, start_date, id);
			CREATE TABLE IF NOT EXISTS lessons (
				id TEXT PRIMARY KEY,
				center_id TEXT NOT NULL,
				class_id TEXT NOT NULL,
				schedule_id TEXT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
				lesson_date TEXT NOT NULL,
				status TEXT NOT NULL CHECK (status IN ('planned', 'completed', 'cancelled')),
				created_by_account_id TEXT NOT NULL REFERENCES accounts(id),
				created_at TEXT NOT NULL,
				UNIQUE (schedule_id, lesson_date),
				FOREIGN KEY (class_id, center_id) REFERENCES classes(id, center_id) ON DELETE CASCADE
			);
			CREATE INDEX IF NOT EXISTS lessons_class_lookup
				ON lessons (class_id, lesson_date, id);
			CREATE TABLE IF NOT EXISTS lesson_context_material (
				lesson_id TEXT PRIMARY KEY REFERENCES lessons(id) ON DELETE CASCADE,
				center_id TEXT NOT NULL,
				class_id TEXT NOT NULL,
				topic TEXT NOT NULL,
				practical_work TEXT NOT NULL,
				homework TEXT NOT NULL,
				created_at TEXT NOT NULL,
				updated_at TEXT NOT NULL,
				FOREIGN KEY (class_id, center_id) REFERENCES classes(id, center_id) ON DELETE CASCADE
			);
			CREATE INDEX IF NOT EXISTS lesson_context_material_class_lookup
				ON lesson_context_material (class_id, lesson_id);
			CREATE TABLE IF NOT EXISTS learning_homework (
				id TEXT PRIMARY KEY,
				center_id TEXT NOT NULL,
				class_id TEXT NOT NULL,
				title TEXT NOT NULL,
				created_by_account_id TEXT NOT NULL REFERENCES accounts(id),
				created_at TEXT NOT NULL,
				FOREIGN KEY (class_id, center_id) REFERENCES classes(id, center_id) ON DELETE CASCADE
			);
			CREATE INDEX IF NOT EXISTS learning_homework_class_lookup
				ON learning_homework (class_id, id);
			CREATE TABLE IF NOT EXISTS learning_homework_completions (
				homework_id TEXT NOT NULL REFERENCES learning_homework(id) ON DELETE CASCADE,
				student_account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
				completed_at TEXT NOT NULL,
				PRIMARY KEY (homework_id, student_account_id)
			);
			CREATE INDEX IF NOT EXISTS learning_homework_completions_student_lookup
				ON learning_homework_completions (student_account_id, homework_id);
			CREATE TABLE IF NOT EXISTS learning_grades (
				homework_id TEXT NOT NULL REFERENCES learning_homework(id) ON DELETE CASCADE,
				student_account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
				grade TEXT NOT NULL CHECK (grade IN ('α', 'β', 'γ', 'F')),
				recorded_by_account_id TEXT NOT NULL REFERENCES accounts(id),
				recorded_at TEXT NOT NULL,
				PRIMARY KEY (homework_id, student_account_id)
			);
			CREATE INDEX IF NOT EXISTS learning_grades_student_lookup
				ON learning_grades (student_account_id, homework_id);
			CREATE TABLE IF NOT EXISTS learning_attendance (
				center_id TEXT NOT NULL,
				class_id TEXT NOT NULL,
				lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
				student_account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
				attendance TEXT NOT NULL CHECK (attendance IN ('present', 'absent')),
				recorded_by_account_id TEXT NOT NULL REFERENCES accounts(id),
				recorded_at TEXT NOT NULL,
				PRIMARY KEY (lesson_id, student_account_id),
				FOREIGN KEY (class_id, center_id) REFERENCES classes(id, center_id) ON DELETE CASCADE
			);
			CREATE INDEX IF NOT EXISTS learning_attendance_student_lookup
				ON learning_attendance (class_id, student_account_id, lesson_id);
			CREATE TABLE IF NOT EXISTS financial_price_settings (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				center_id TEXT NOT NULL,
				class_id TEXT NOT NULL,
				student_account_id TEXT,
				amount TEXT NOT NULL,
				effective_from TEXT NOT NULL,
				created_by_account_id TEXT NOT NULL,
				created_at TEXT NOT NULL
			);
			CREATE INDEX IF NOT EXISTS financial_price_settings_lookup
				ON financial_price_settings (class_id, student_account_id, effective_from, id);
			CREATE TABLE IF NOT EXISTS financial_lesson_charges (
				center_id TEXT NOT NULL,
				class_id TEXT NOT NULL,
				lesson_id TEXT NOT NULL,
				student_account_id TEXT NOT NULL,
				lesson_date TEXT NOT NULL,
				applied_price TEXT NOT NULL,
				status TEXT NOT NULL CHECK (status IN ('active', 'cancelled')),
				created_at TEXT NOT NULL,
				cancelled_at TEXT,
				PRIMARY KEY (lesson_id, student_account_id)
			);
			CREATE INDEX IF NOT EXISTS financial_lesson_charges_replay
				ON financial_lesson_charges (class_id, student_account_id, lesson_date, lesson_id);
			CREATE TABLE IF NOT EXISTS financial_payments (
				id TEXT PRIMARY KEY,
				center_id TEXT NOT NULL,
				class_id TEXT NOT NULL,
				student_account_id TEXT NOT NULL,
				amount TEXT NOT NULL,
				factual_date TEXT NOT NULL,
				status TEXT NOT NULL CHECK (status IN ('recorded', 'cancelled')),
				created_by_account_id TEXT NOT NULL,
				created_at TEXT NOT NULL
			);
			CREATE INDEX IF NOT EXISTS financial_payments_replay
				ON financial_payments (class_id, student_account_id, factual_date, id);
			CREATE TABLE IF NOT EXISTS financial_payment_commands (
				actor_account_id TEXT NOT NULL REFERENCES accounts(id),
				operation TEXT NOT NULL CHECK (operation IN ('create', 'edit', 'cancel')),
				confirmation TEXT NOT NULL,
				payment_id TEXT NOT NULL REFERENCES financial_payments(id),
				payload TEXT NOT NULL,
				created_at TEXT NOT NULL,
				PRIMARY KEY (actor_account_id, operation, confirmation)
			);
			CREATE INDEX IF NOT EXISTS financial_payment_commands_payment
				ON financial_payment_commands (payment_id, operation);
			CREATE TABLE IF NOT EXISTS financial_payment_allocations (
				payment_id TEXT NOT NULL REFERENCES financial_payments(id) ON DELETE CASCADE,
				lesson_id TEXT NOT NULL,
				student_account_id TEXT NOT NULL,
				amount TEXT NOT NULL,
				PRIMARY KEY (payment_id, lesson_id, student_account_id),
				FOREIGN KEY (lesson_id, student_account_id)
					REFERENCES financial_lesson_charges(lesson_id, student_account_id) ON DELETE CASCADE
			);
			CREATE INDEX IF NOT EXISTS financial_payment_allocations_replay
				ON financial_payment_allocations (student_account_id, lesson_id, payment_id);
			CREATE TABLE IF NOT EXISTS financial_audit_records (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				center_id TEXT NOT NULL,
				class_id TEXT NOT NULL,
				lesson_id TEXT NOT NULL,
				student_account_id TEXT NOT NULL,
				action TEXT NOT NULL CHECK (action IN ('charge-created', 'charge-cancelled', 'charge-reactivated')),
				actor_account_id TEXT NOT NULL,
				changed_at TEXT NOT NULL,
				before_state TEXT,
				after_state TEXT
			);
			CREATE INDEX IF NOT EXISTS financial_audit_records_replay
				ON financial_audit_records (class_id, student_account_id, id);
			CREATE TABLE IF NOT EXISTS financial_payment_audit_records (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				center_id TEXT NOT NULL,
				class_id TEXT NOT NULL,
				payment_id TEXT NOT NULL REFERENCES financial_payments(id),
				student_account_id TEXT NOT NULL,
				action TEXT NOT NULL CHECK (action IN ('payment-created', 'payment-edited', 'payment-cancelled')),
				actor_account_id TEXT NOT NULL REFERENCES accounts(id),
				changed_at TEXT NOT NULL,
				before_state TEXT,
				after_state TEXT NOT NULL
			);
			CREATE INDEX IF NOT EXISTS financial_payment_audit_replay
				ON financial_payment_audit_records (class_id, student_account_id, id);
			CREATE TABLE IF NOT EXISTS collaboration_comments (
				id TEXT PRIMARY KEY,
				center_id TEXT NOT NULL,
				class_id TEXT NOT NULL,
				lesson_id TEXT NOT NULL,
				scope TEXT NOT NULL CHECK (scope IN ('shared', 'personal')),
				student_account_id TEXT REFERENCES accounts(id) ON DELETE CASCADE,
				field_key TEXT NOT NULL,
				author_account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
				body TEXT NOT NULL,
				created_at TEXT NOT NULL,
				last_changed_at TEXT NOT NULL,
				CHECK (
					(scope = 'shared' AND student_account_id IS NULL)
					OR (scope = 'personal' AND student_account_id IS NOT NULL)
				)
			);
			DROP INDEX IF EXISTS collaboration_comments_owner_field;
			CREATE UNIQUE INDEX collaboration_comments_owner_field
				ON collaboration_comments (
					center_id,
					author_account_id,
					lesson_id,
					scope,
					field_key,
					COALESCE(student_account_id, '')
				);
			CREATE INDEX IF NOT EXISTS collaboration_comments_scope_lookup
				ON collaboration_comments (class_id, lesson_id, scope, student_account_id, field_key);
			CREATE TABLE IF NOT EXISTS collaboration_messages (
				id TEXT PRIMARY KEY,
				center_id TEXT NOT NULL,
				class_id TEXT NOT NULL,
				lesson_id TEXT NOT NULL,
				scope TEXT NOT NULL CHECK (scope IN ('shared', 'personal')),
				student_account_id TEXT REFERENCES accounts(id) ON DELETE CASCADE,
				parent_message_id TEXT REFERENCES collaboration_messages(id) ON DELETE CASCADE,
				root_message_id TEXT NOT NULL REFERENCES collaboration_messages(id) ON DELETE CASCADE,
				author_account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
				body TEXT NOT NULL,
				created_at TEXT NOT NULL,
				CHECK (
					(scope = 'shared' AND student_account_id IS NULL)
					OR (scope = 'personal' AND student_account_id IS NOT NULL)
				),
				CHECK (
					(parent_message_id IS NULL AND root_message_id = id)
					OR parent_message_id IS NOT NULL
				)
			);
			CREATE INDEX IF NOT EXISTS collaboration_messages_scope_activity
				ON collaboration_messages (
					class_id, lesson_id, scope, student_account_id, root_message_id
				);
			CREATE INDEX IF NOT EXISTS collaboration_messages_parent_lookup
				ON collaboration_messages (parent_message_id);
			CREATE TABLE IF NOT EXISTS collaboration_reactions (
				target_type TEXT NOT NULL CHECK (target_type IN ('field', 'comment', 'message')),
				target_id TEXT NOT NULL,
				center_id TEXT NOT NULL,
				class_id TEXT NOT NULL,
				lesson_id TEXT NOT NULL,
				scope TEXT NOT NULL CHECK (scope IN ('shared', 'personal')),
				student_account_id TEXT REFERENCES accounts(id) ON DELETE CASCADE,
				reaction TEXT NOT NULL CHECK (reaction IN ('like', 'love', 'laugh', 'celebrate', 'question')),
				reactor_account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
				created_at TEXT NOT NULL,
				last_changed_at TEXT NOT NULL,
				CHECK (
					(scope = 'shared' AND student_account_id IS NULL)
					OR (scope = 'personal' AND student_account_id IS NOT NULL)
				)
			);
			DROP INDEX IF EXISTS collaboration_reactions_one_per_actor;
			CREATE UNIQUE INDEX collaboration_reactions_one_per_actor
				ON collaboration_reactions (
					center_id,
					target_type,
					target_id,
					lesson_id,
					scope,
					COALESCE(student_account_id, ''),
					reactor_account_id
				);
			CREATE INDEX IF NOT EXISTS collaboration_reactions_target_lookup
				ON collaboration_reactions (class_id, lesson_id, scope, student_account_id, target_type, target_id, reaction);
		`);
	}

	transaction<T>(operation: () => T): T {
		return this.sqlite.transaction(operation)();
	}

	close(): void {
		this.sqlite.close();
	}
}
