import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import {
	FinancialLedgerBoundary,
	type FinancialLessonFacts,
	type FinancialScopePort
} from '../../src/lib/server/modules/financial-ledger/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const lesson: FinancialLessonFacts = {
	centerId: 'center-retry-048', classId: 'class-retry-048', lessonId: 'lesson-retry-048',
	studentAccountId: 'student-retry-048', lessonDate: '2026-06-10'
};
const scope: FinancialScopePort = {
	getFinancialClassScope: (actor, classId, studentAccountId) => {
		if (actor.role !== 'admin' || actor.accountId !== 'admin-retry-048' || classId !== 'class-retry-048') return null;
		if (studentAccountId && studentAccountId !== 'student-retry-048') return null;
		return { centerId: 'center-retry-048', classId, studentAccountIds: ['student-retry-048'] };
	},
	getFinancialLessonFacts: (actor, lessonId, studentAccountId) =>
		actor.accountId === 'admin-retry-048' && lessonId === lesson.lessonId && studentAccountId === lesson.studentAccountId
			? lesson
			: null
};

function createHarness(): { database: SharedDatabase; ledger: FinancialLedgerBoundary } {
	const database = new SharedDatabase({ filename: ':memory:' });
	const identityAccess = new IdentityAccessBoundary(database);
	database.sqlite.exec(`
		INSERT INTO accounts (id, role) VALUES ('admin-retry-048', 'admin');
		INSERT INTO sessions (token, account_id, revoked_at)
		VALUES ('session-admin-retry-048', 'admin-retry-048', NULL);
	`);
	return {
		database,
		ledger: new FinancialLedgerBoundary(database, identityAccess, scope, {
			now: () => new Date('2026-07-01T00:00:00.000Z')
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

function runScenario(database: SharedDatabase, ledger: FinancialLedgerBoundary) {
	const sessionToken = 'session-admin-retry-048';
	ledger.setClassPrice({ sessionToken, classId: lesson.classId, amount: '4.25', effectiveFrom: '2026-06-01' });
	ledger.reconcileLessonCharge({
		sessionToken, lessonId: lesson.lessonId, studentAccountId: lesson.studentAccountId,
		attendanceTransition: { from: 'absent', to: 'present' }
	});
	const request = {
		sessionToken, classId: lesson.classId, studentAccountId: lesson.studentAccountId,
		amount: '5', factualDate: '2026-06-20', confirmation: 'retry-intent-048'
	};
	const first = ledger.createPayment(request);
	const afterFirst = ledger.getBalanceProjection({
		sessionToken, classId: lesson.classId, studentAccountId: lesson.studentAccountId
	});
	const beforeRetry = counts(database);
	const repeated = ledger.createPayment(request);
	const afterRetry = ledger.getBalanceProjection({
		sessionToken, classId: lesson.classId, studentAccountId: lesson.studentAccountId
	});
	const retryCounts = counts(database);
	const beforeConflict = counts(database);
	let conflict = '';
	try {
		ledger.createPayment({ ...request, amount: '6' });
	} catch (error) {
		conflict = error instanceof Error ? error.message : String(error);
	}
	const afterConflict = counts(database);
	const newPayment = ledger.createPayment({ ...request, confirmation: 'retry-intent-new-048' });
	const final = ledger.getBalanceProjection({
		sessionToken, classId: lesson.classId, studentAccountId: lesson.studentAccountId
	});
	return { first, afterFirst, beforeRetry, repeated, afterRetry, retryCounts, conflict, beforeConflict, afterConflict, newPayment, final, counts: counts(database) };
}

describe('TASK-048 payment retry identity', () => {
	let database: SharedDatabase;
	let ledger: FinancialLedgerBoundary;

	beforeEach(() => {
		({ database, ledger } = createHarness());
	});

	afterEach(() => database.close());

	it('deduplicates identical confirmation and distinguishes explicit new intent', () => {
		const first = runScenario(database, ledger);
		const repeated = createHarness();
		try {
			expect(runScenario(repeated.database, repeated.ledger)).toEqual(first);
		} finally {
			repeated.database.close();
		}

		expect(first.repeated).toEqual(first.first);
		expect(first.afterRetry).toEqual(first.afterFirst);
		expect(first.retryCounts).toEqual(first.beforeRetry);
		expect(first.conflict).toBe('confirmation-conflict');
		expect(first.afterConflict).toEqual(first.beforeConflict);
		expect(first.newPayment.id).not.toBe(first.first.id);
		expect(first.final.payments.map(({ amount }) => amount)).toEqual(['5', '5']);
		expect(first.final.advance).toBe('5.75');
		expect(first.final.balance).toBe('-5.75');
		expect(first.counts).toEqual({ payments: 2, allocations: 1, commands: 2, audit: 2 });
	});
});
