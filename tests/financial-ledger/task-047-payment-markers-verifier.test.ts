import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import {
	FinancialLedgerBoundary,
	type FinancialScopePort
} from '../../src/lib/server/modules/financial-ledger/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const scope: FinancialScopePort = {
	getFinancialClassScope: (actor, classId, studentAccountId) => {
		if (actor.role !== 'admin' || actor.accountId !== 'admin-v047' || classId !== 'class-v047') return null;
		if (studentAccountId && studentAccountId !== 'student-v047') return null;
		return { centerId: 'center-v047', classId, studentAccountIds: ['student-v047'] };
	},
	getFinancialLessonFacts: () => null,
	getFinancialLessonDates: (actor, classId) =>
		actor.accountId === 'admin-v047' && classId === 'class-v047'
			? ['2026-05-30', '2026-05-31', '2026-06-01']
			: null
};

function createHarness(): { database: SharedDatabase; ledger: FinancialLedgerBoundary } {
	const database = new SharedDatabase({ filename: ':memory:' });
	const identityAccess = new IdentityAccessBoundary(database);
	database.sqlite.exec(`
		INSERT INTO accounts (id, role) VALUES ('admin-v047', 'admin'), ('student-v047', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-v047', 'admin-v047', NULL), ('session-student-v047', 'student-v047', NULL);
	`);
	return {
		database,
		ledger: new FinancialLedgerBoundary(database, identityAccess, scope, {
			now: () => new Date('2026-07-01T00:00:00.000Z')
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

function runScenario(database: SharedDatabase, ledger: FinancialLedgerBoundary) {
	const sessionToken = 'session-admin-v047';
	const first = ledger.createPayment({
		sessionToken, classId: 'class-v047', studentAccountId: 'student-v047',
		amount: '4.25', factualDate: '2026-06-01', confirmation: 'marker-first-v047'
	});
	const second = ledger.createPayment({
		sessionToken, classId: 'class-v047', studentAccountId: 'student-v047',
		amount: '5.75', factualDate: '2026-06-01', confirmation: 'marker-second-v047'
	});
	const ordinary = ledger.createPayment({
		sessionToken, classId: 'class-v047', studentAccountId: 'student-v047',
		amount: '6', factualDate: '2026-06-15', confirmation: 'marker-ordinary-v047'
	});
	const before = snapshot(database);
	const boundary = ledger.getPaymentMarkers({
		sessionToken, classId: 'class-v047', studentAccountId: 'student-v047',
		range: { from: '2026-05-29', to: '2026-06-01' }
	});
	const ordinaryRange = ledger.getPaymentMarkers({
		sessionToken, classId: 'class-v047', studentAccountId: 'student-v047',
		range: { from: '2026-06-15', to: '2026-06-15' }
	});
	const after = snapshot(database);
	return { first, second, ordinary, boundary, ordinaryRange, before, after };
}

describe('TASK-047 independent payment marker verification', () => {
	let database: SharedDatabase;
	let ledger: FinancialLedgerBoundary;

	beforeEach(() => {
		({ database, ledger } = createHarness());
	});

	afterEach(() => database.close());

	it('keeps boundary markers factual, discoverable, ordered, and read-only', () => {
		const first = runScenario(database, ledger);
		const repeated = createHarness();
		try {
			expect(runScenario(repeated.database, repeated.ledger)).toEqual(first);
		} finally {
			repeated.database.close();
		}

		expect(first.boundary).toEqual([
			{ paymentId: first.first.id, markerDate: '2026-05-29', factualDate: '2026-06-01', amount: '4.25' },
			{ paymentId: first.second.id, markerDate: '2026-05-29', factualDate: '2026-06-01', amount: '5.75' }
		]);
		expect(first.ordinaryRange).toEqual([
			{ paymentId: first.ordinary.id, markerDate: '2026-06-15', factualDate: '2026-06-15', amount: '6' }
		]);
		expect(first.after).toEqual(first.before);
		expect(() => ledger.getPaymentMarkers({
			sessionToken: 'session-student-v047', classId: 'class-v047', studentAccountId: 'student-v047'
	})).toThrow('not-authorized');
		expect(snapshot(database)).toEqual(first.before);
	});
});
