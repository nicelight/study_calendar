import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import {
	FinancialLedgerBoundary,
	type FinancialScopePort
} from '../../src/lib/server/modules/financial-ledger/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const scope: FinancialScopePort = {
	getFinancialClassScope: (actor, classId, studentAccountId) => {
		if (actor.role !== 'admin' || actor.accountId !== 'admin-semantic-047' || classId !== 'class-semantic-047') return null;
		if (studentAccountId && studentAccountId !== 'student-semantic-047') return null;
		return { centerId: 'center-semantic-047', classId, studentAccountIds: ['student-semantic-047'] };
	},
	getFinancialLessonFacts: () => null,
	getFinancialLessonDates: (actor, classId) =>
		actor.accountId === 'admin-semantic-047' && classId === 'class-semantic-047'
			? ['2026-07-04', '2026-07-05']
			: null
};

function createHarness(): { database: SharedDatabase; ledger: FinancialLedgerBoundary } {
	const database = new SharedDatabase({ filename: ':memory:' });
	const identityAccess = new IdentityAccessBoundary(database);
	database.sqlite.exec(`
		INSERT INTO accounts (id, role) VALUES
			('admin-semantic-047', 'admin'), ('student-semantic-047', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-semantic-047', 'admin-semantic-047', NULL),
			('session-student-semantic-047', 'student-semantic-047', NULL);
	`);
	return {
		database,
		ledger: new FinancialLedgerBoundary(database, identityAccess, scope, {
			now: () => new Date('2026-08-01T00:00:00.000Z')
		})
	};
}

function snapshot(database: SharedDatabase) {
	return database.sqlite.prepare(`
		SELECT
			(SELECT COUNT(*) FROM financial_payments) AS payments,
			(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
			(SELECT COUNT(*) FROM financial_lesson_charges) AS charges,
			(SELECT COUNT(*) FROM financial_payment_commands) AS commands,
			(SELECT COUNT(*) FROM financial_payment_audit_records) AS audit
	`).get();
}

describe('TASK-047 semantic marker projection checks', () => {
	let database: SharedDatabase;
	let ledger: FinancialLedgerBoundary;

	beforeEach(() => {
		({ database, ledger } = createHarness());
	});

	afterEach(() => database.close());

	it('keeps marker-only range discovery read-only across consecutive lesson dates', () => {
		const sessionToken = 'session-admin-semantic-047';
		const payment = ledger.createPayment({
			sessionToken, classId: 'class-semantic-047', studentAccountId: 'student-semantic-047',
			amount: '2.50', factualDate: '2026-07-05', confirmation: 'marker-semantic-047'
		});
		const before = snapshot(database);
		expect(ledger.getPaymentMarkers({
			sessionToken, classId: 'class-semantic-047', studentAccountId: 'student-semantic-047',
			range: { from: '2026-07-03', to: '2026-07-03' }
		})).toEqual([{
			paymentId: payment.id, markerDate: '2026-07-03', factualDate: '2026-07-05', amount: '2.5'
		}]);
		expect(snapshot(database)).toEqual(before);
		expect(() => ledger.getPaymentMarkers({
			sessionToken: 'session-student-semantic-047', classId: 'class-semantic-047', studentAccountId: 'student-semantic-047'
		})).toThrow('not-authorized');
		expect(snapshot(database)).toEqual(before);
	});
});
