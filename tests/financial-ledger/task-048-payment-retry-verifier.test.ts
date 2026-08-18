import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import {
	FinancialLedgerBoundary,
	type FinancialLessonFacts,
	type FinancialScopePort
} from '../../src/lib/server/modules/financial-ledger/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const lessonFacts = new Map<string, FinancialLessonFacts>([
	['lesson-v048-old:student-v048', {
		centerId: 'center-v048', classId: 'class-v048', lessonId: 'lesson-v048-old',
		studentAccountId: 'student-v048', lessonDate: '2026-05-10'
	}],
	['lesson-v048-new:student-v048', {
		centerId: 'center-v048', classId: 'class-v048', lessonId: 'lesson-v048-new',
		studentAccountId: 'student-v048', lessonDate: '2026-06-10'
	}]
]);
const scope: FinancialScopePort = {
	getFinancialClassScope: (actor, classId, studentAccountId) => {
		if (actor.role !== 'admin' || actor.accountId !== 'admin-v048' || classId !== 'class-v048') return null;
		if (studentAccountId && studentAccountId !== 'student-v048') return null;
		return { centerId: 'center-v048', classId, studentAccountIds: ['student-v048'] };
	},
	getFinancialLessonFacts: (actor, lessonId, studentAccountId) =>
		actor.accountId === 'admin-v048' ? lessonFacts.get(`${lessonId}:${studentAccountId}`) ?? null : null
};

function createHarness(): { database: SharedDatabase; ledger: FinancialLedgerBoundary } {
	const database = new SharedDatabase({ filename: ':memory:' });
	const identityAccess = new IdentityAccessBoundary(database);
	database.sqlite.exec(`
		INSERT INTO accounts (id, role) VALUES ('admin-v048', 'admin');
		INSERT INTO sessions (token, account_id, revoked_at)
		VALUES ('session-admin-v048', 'admin-v048', NULL);
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
	const sessionToken = 'session-admin-v048';
	ledger.setClassPrice({ sessionToken, classId: 'class-v048', amount: '3.75', effectiveFrom: '2026-05-01' });
	for (const lessonId of ['lesson-v048-old', 'lesson-v048-new']) {
		ledger.reconcileLessonCharge({
			sessionToken, lessonId, studentAccountId: 'student-v048',
			attendanceTransition: { from: 'absent', to: 'present' }
		});
	}
	const request = {
		sessionToken, classId: 'class-v048', studentAccountId: 'student-v048',
		amount: '4.5', factualDate: '2026-06-20', confirmation: 'intent-v048'
	};
	const first = ledger.createPayment(request);
	const afterFirst = ledger.getBalanceProjection({ sessionToken, classId: 'class-v048', studentAccountId: 'student-v048' });
	const beforeRetry = counts(database);
	const repeated = ledger.createPayment(request);
	const afterRetry = ledger.getBalanceProjection({ sessionToken, classId: 'class-v048', studentAccountId: 'student-v048' });
	const afterRetryCounts = counts(database);
	const beforeConflict = counts(database);
	let conflict = '';
	try {
		ledger.createPayment({ ...request, amount: '6' });
	} catch (error) {
		conflict = error instanceof Error ? error.message : String(error);
	}
	const afterConflict = counts(database);
	const explicit = ledger.createPayment({ ...request, amount: '2', confirmation: 'intent-v048-new' });
	const final = ledger.getBalanceProjection({ sessionToken, classId: 'class-v048', studentAccountId: 'student-v048' });
	return { first, afterFirst, beforeRetry, repeated, afterRetry, afterRetryCounts, beforeConflict, conflict, afterConflict, explicit, final, counts: counts(database) };
}

describe('TASK-048 independent payment retry verification', () => {
	let database: SharedDatabase;
	let ledger: FinancialLedgerBoundary;

	beforeEach(() => {
		({ database, ledger } = createHarness());
	});

	afterEach(() => database.close());

	it('keeps the same intent idempotent and accepts only explicit new confirmation', () => {
		const first = runScenario(database, ledger);
		const repeated = createHarness();
		try {
			expect(runScenario(repeated.database, repeated.ledger)).toEqual(first);
		} finally {
			repeated.database.close();
		}

		expect(first.repeated).toEqual(first.first);
		expect(first.afterRetry).toEqual(first.afterFirst);
		expect(first.afterRetryCounts).toEqual(first.beforeRetry);
		expect(first.conflict).toBe('confirmation-conflict');
		expect(first.afterConflict).toEqual(first.beforeConflict);
		expect(first.explicit.id).not.toBe(first.first.id);
		expect(first.final.allocations).toEqual([
		{ paymentId: first.first.id, lessonId: 'lesson-v048-old', amount: '3.75' },
		{ paymentId: first.first.id, lessonId: 'lesson-v048-new', amount: '0.75' },
		{ paymentId: first.explicit.id, lessonId: 'lesson-v048-new', amount: '2' }
	]);
		expect(first.final.balance).toBe('1');
		expect(first.final.advance).toBe('0');
		expect(first.counts).toEqual({ payments: 2, allocations: 3, commands: 2, audit: 2 });
	});
});
