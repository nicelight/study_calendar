import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import {
	FinancialLedgerBoundary,
	type FinancialLessonFacts,
	type FinancialScopePort
} from '../../src/lib/server/modules/financial-ledger/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const lessonFacts = new Map<string, FinancialLessonFacts>([
	['lesson-exec-old:student-exec', {
		centerId: 'center-task-045', classId: 'class-task-045', lessonId: 'lesson-exec-old',
		studentAccountId: 'student-exec', lessonDate: '2026-01-10'
	}],
	['lesson-exec-new:student-exec', {
		centerId: 'center-task-045', classId: 'class-task-045', lessonId: 'lesson-exec-new',
		studentAccountId: 'student-exec', lessonDate: '2026-02-10'
	}]
]);

const scope: FinancialScopePort = {
	getFinancialClassScope: (actor, classId, studentAccountId) => {
		if (actor.role !== 'admin' || classId !== 'class-task-045') {
			return null;
		}
		if (studentAccountId && studentAccountId !== 'student-exec') {
			return null;
		}
		return { centerId: 'center-task-045', classId, studentAccountIds: ['student-exec'] };
	},
	getFinancialLessonFacts: (actor, lessonId, studentAccountId) =>
		actor.role === 'admin' ? lessonFacts.get(`${lessonId}:${studentAccountId}`) ?? null : null
};

function createHarness(): { database: SharedDatabase; ledger: FinancialLedgerBoundary } {
	const database = new SharedDatabase({ filename: ':memory:' });
	const identityAccess = new IdentityAccessBoundary(database);
	database.sqlite.exec(`
		INSERT INTO accounts (id, role) VALUES ('admin-task-045', 'admin');
		INSERT INTO sessions (token, account_id, revoked_at)
		VALUES ('session-task-045', 'admin-task-045', NULL);
	`);
	const ledger = new FinancialLedgerBoundary(database, identityAccess, scope, {
		now: () => new Date('2026-03-10T00:00:00.000Z')
	});
	return { database, ledger };
}

function seedCharges(ledger: FinancialLedgerBoundary): void {
	ledger.setClassPrice({
		sessionToken: 'session-task-045', classId: 'class-task-045',
		amount: '10.125', effectiveFrom: '2026-01-01'
	});
	for (const lessonId of ['lesson-exec-old', 'lesson-exec-new']) {
		ledger.reconcileLessonCharge({
			sessionToken: 'session-task-045', lessonId, studentAccountId: 'student-exec',
			attendanceTransition: { from: 'absent', to: 'present' }
		});
	}
}

function runScenario(ledger: FinancialLedgerBoundary) {
	seedCharges(ledger);
	const before = ledger.getBalanceProjection({
		sessionToken: 'session-task-045', classId: 'class-task-045', studentAccountId: 'student-exec'
	});
	const partialPayment = ledger.createPayment({
		sessionToken: 'session-task-045', classId: 'class-task-045', studentAccountId: 'student-exec',
		amount: '12.345', factualDate: '2026-02-15', confirmation: 'partial-task-045'
	});
	const partial = ledger.getBalanceProjection({
		sessionToken: 'session-task-045', classId: 'class-task-045', studentAccountId: 'student-exec'
	});
	const excessPayment = ledger.createPayment({
		sessionToken: 'session-task-045', classId: 'class-task-045', studentAccountId: 'student-exec',
		amount: '10', factualDate: '2026-02-16', confirmation: 'excess-task-045'
	});
	const final = ledger.getBalanceProjection({
		sessionToken: 'session-task-045', classId: 'class-task-045', studentAccountId: 'student-exec'
	});
	return { before, partialPayment, partial, excessPayment, final };
}

describe('TASK-045 payment allocation', () => {
	let database: SharedDatabase;
	let ledger: FinancialLedgerBoundary;

	beforeEach(() => {
		({ database, ledger } = createHarness());
	});

	afterEach(() => database.close());

	it('allocates oldest-first and preserves exact partial, excess, paid, overdue, and replay states', () => {
		const first = runScenario(ledger);
		const repeated = createHarness();
		try {
			expect(runScenario(repeated.ledger)).toEqual(first);
		} finally {
			repeated.database.close();
		}

		expect(first.before.charges.map(({ state, remainingAmount }) => ({ state, remainingAmount }))).toEqual([
			{ state: 'overdue', remainingAmount: '10.125' },
			{ state: 'overdue', remainingAmount: '10.125' }
		]);
		expect(first.partialPayment.amount).toBe('12.345');
		expect(first.partial.allocations).toEqual([
			{ paymentId: first.partialPayment.id, lessonId: 'lesson-exec-old', amount: '10.125' },
			{ paymentId: first.partialPayment.id, lessonId: 'lesson-exec-new', amount: '2.22' }
		]);
		expect(first.partial.charges.map(({ lessonId, state, allocatedAmount, remainingAmount }) => ({
			lessonId, state, allocatedAmount, remainingAmount
		}))).toEqual([
			{ lessonId: 'lesson-exec-old', state: 'paid', allocatedAmount: '10.125', remainingAmount: '0' },
			{ lessonId: 'lesson-exec-new', state: 'partially_paid', allocatedAmount: '2.22', remainingAmount: '7.905' }
		]);
		expect(first.partial.balance).toBe('7.905');
		expect(first.excessPayment.amount).toBe('10');
		expect(first.final.charges.every(({ state }) => state === 'paid')).toBe(true);
		expect(first.final.allocations).toEqual([
			{ paymentId: first.partialPayment.id, lessonId: 'lesson-exec-old', amount: '10.125' },
			{ paymentId: first.partialPayment.id, lessonId: 'lesson-exec-new', amount: '2.22' },
			{ paymentId: first.excessPayment.id, lessonId: 'lesson-exec-new', amount: '7.905' }
		]);
		expect(first.final.advance).toBe('2.095');
		expect(first.final.balance).toBe('-2.095');
		expect(first.final.payments.map(({ amount }) => amount)).toEqual(['12.345', '10']);
	});
});
