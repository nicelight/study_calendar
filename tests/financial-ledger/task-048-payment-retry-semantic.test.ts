import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import {
	FinancialLedgerBoundary,
	type FinancialScopePort
} from '../../src/lib/server/modules/financial-ledger/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const scope: FinancialScopePort = {
	getFinancialClassScope: (actor, classId, studentAccountId) => {
		if (actor.role !== 'admin' || actor.accountId !== 'admin-semantic-048' || classId !== 'class-semantic-048') return null;
		if (studentAccountId && studentAccountId !== 'student-semantic-048') return null;
		return { centerId: 'center-semantic-048', classId, studentAccountIds: ['student-semantic-048'] };
	},
	getFinancialLessonFacts: () => null
};

function createHarness(): { database: SharedDatabase; ledger: FinancialLedgerBoundary } {
	const database = new SharedDatabase({ filename: ':memory:' });
	const identityAccess = new IdentityAccessBoundary(database);
	database.sqlite.exec(`
		INSERT INTO accounts (id, role) VALUES ('admin-semantic-048', 'admin');
		INSERT INTO sessions (token, account_id, revoked_at)
		VALUES ('session-admin-semantic-048', 'admin-semantic-048', NULL);
	`);
	return {
		database,
		ledger: new FinancialLedgerBoundary(database, identityAccess, scope, {
			now: () => new Date('2026-07-15T00:00:00.000Z')
		})
	};
}

function counts(database: SharedDatabase) {
	return database.sqlite.prepare(`
		SELECT
			(SELECT COUNT(*) FROM financial_payments) AS payments,
			(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
			(SELECT COUNT(*) FROM financial_payment_commands) AS commands,
			(SELECT COUNT(*) FROM financial_payment_audit_records) AS audit
	`).get();
}

describe('TASK-048 semantic retry identity checks', () => {
	let database: SharedDatabase;
	let ledger: FinancialLedgerBoundary;

	beforeEach(() => {
		({ database, ledger } = createHarness());
	});

	afterEach(() => database.close());

	it('normalizes equivalent amount retries but rejects changed factual payloads', () => {
		const request = {
			sessionToken: 'session-admin-semantic-048', classId: 'class-semantic-048',
			studentAccountId: 'student-semantic-048', amount: '4.00', factualDate: '2026-07-10',
			confirmation: 'semantic-intent-048'
		};
		const first = ledger.createPayment(request);
		const beforeRetry = counts(database);
		const equivalent = ledger.createPayment({ ...request, amount: '4' });
		expect(equivalent).toEqual(first);
		expect(counts(database)).toEqual(beforeRetry);

		const beforeConflict = counts(database);
		expect(() => ledger.createPayment({ ...request, factualDate: '2026-07-11' })).toThrow('confirmation-conflict');
		expect(counts(database)).toEqual(beforeConflict);
	});
});
