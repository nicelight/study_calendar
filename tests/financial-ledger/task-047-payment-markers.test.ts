import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import {
	FinancialLedgerBoundary,
	type FinancialScopePort
} from '../../src/lib/server/modules/financial-ledger/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const lessonDates = ['2026-02-28', '2026-03-01', '2026-03-02', '2026-04-01'];
const scope: FinancialScopePort = {
	getFinancialClassScope: (actor, classId, studentAccountId) => {
		if (actor.role !== 'admin' || actor.accountId !== 'admin-markers-047' || classId !== 'class-markers-047') return null;
		if (studentAccountId && studentAccountId !== 'student-markers-047') return null;
		return { centerId: 'center-markers-047', classId, studentAccountIds: ['student-markers-047'] };
	},
	getFinancialLessonFacts: () => null,
	getFinancialLessonDates: (actor, classId) =>
		actor.accountId === 'admin-markers-047' && classId === 'class-markers-047' ? lessonDates : null
};

function createHarness(): { database: SharedDatabase; ledger: FinancialLedgerBoundary } {
	const database = new SharedDatabase({ filename: ':memory:' });
	const identityAccess = new IdentityAccessBoundary(database);
	database.sqlite.exec(`
		INSERT INTO accounts (id, role) VALUES
			('admin-markers-047', 'admin'), ('student-markers-047', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-markers-047', 'admin-markers-047', NULL),
			('session-student-markers-047', 'student-markers-047', NULL);
	`);
	return {
		database,
		ledger: new FinancialLedgerBoundary(database, identityAccess, scope, {
			now: () => new Date('2026-05-01T00:00:00.000Z')
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

describe('TASK-047 payment markers', () => {
	let database: SharedDatabase;
	let ledger: FinancialLedgerBoundary;

	beforeEach(() => {
		({ database, ledger } = createHarness());
	});

	afterEach(() => database.close());

	it('projects previous non-lesson days and preserves factual dates without mutation', () => {
		const sessionToken = 'session-admin-markers-047';
		const first = ledger.createPayment({
			sessionToken, classId: 'class-markers-047', studentAccountId: 'student-markers-047',
			amount: '1', factualDate: '2026-03-01', confirmation: 'marker-first-047'
		});
		const second = ledger.createPayment({
			sessionToken, classId: 'class-markers-047', studentAccountId: 'student-markers-047',
			amount: '2', factualDate: '2026-03-01', confirmation: 'marker-second-047'
		});
		const monthBoundary = ledger.createPayment({
			sessionToken, classId: 'class-markers-047', studentAccountId: 'student-markers-047',
			amount: '3', factualDate: '2026-04-01', confirmation: 'marker-month-047'
		});
		const before = snapshot(database);

		expect(ledger.getPaymentMarkers({
			sessionToken, classId: 'class-markers-047', studentAccountId: 'student-markers-047',
			range: { from: '2026-02-27', to: '2026-03-02' }
		})).toEqual([
			{ paymentId: first.id, markerDate: '2026-02-27', factualDate: '2026-03-01', amount: '1' },
			{ paymentId: second.id, markerDate: '2026-02-27', factualDate: '2026-03-01', amount: '2' }
		]);
		expect(ledger.getPaymentMarkers({
			sessionToken, classId: 'class-markers-047', studentAccountId: 'student-markers-047',
			range: { from: '2026-03-31', to: '2026-04-01' }
		})).toEqual([
			{ paymentId: monthBoundary.id, markerDate: '2026-03-31', factualDate: '2026-04-01', amount: '3' }
		]);
		expect(snapshot(database)).toEqual(before);
		expect(() => ledger.getPaymentMarkers({
			sessionToken: 'session-student-markers-047', classId: 'class-markers-047', studentAccountId: 'student-markers-047'
		})).toThrow('not-authorized');
		expect(snapshot(database)).toEqual(before);
	});
});
