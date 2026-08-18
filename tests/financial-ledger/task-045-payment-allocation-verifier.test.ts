import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import {
	FinancialLedgerBoundary,
	type FinancialLessonFacts,
	type FinancialScopePort
} from '../../src/lib/server/modules/financial-ledger/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const lessonFacts = new Map<string, FinancialLessonFacts>([
	['lesson-verifier-045-old:student-verifier-045', {
		centerId: 'center-verifier-045', classId: 'class-verifier-045',
		lessonId: 'lesson-verifier-045-old', studentAccountId: 'student-verifier-045',
		lessonDate: '2026-02-03'
	}],
	['lesson-verifier-045-new:student-verifier-045', {
		centerId: 'center-verifier-045', classId: 'class-verifier-045',
		lessonId: 'lesson-verifier-045-new', studentAccountId: 'student-verifier-045',
		lessonDate: '2026-03-03'
	}]
]);

const scope: FinancialScopePort = {
	getFinancialClassScope: (actor, classId, studentAccountId) => {
		if (actor.role !== 'admin' || classId !== 'class-verifier-045') return null;
		if (studentAccountId && studentAccountId !== 'student-verifier-045') return null;
		return {
			centerId: 'center-verifier-045', classId,
			studentAccountIds: ['student-verifier-045']
		};
	},
	getFinancialLessonFacts: (actor, lessonId, studentAccountId) =>
		actor.role === 'admin' ? lessonFacts.get(`${lessonId}:${studentAccountId}`) ?? null : null
};

function createHarness(): { database: SharedDatabase; ledger: FinancialLedgerBoundary } {
	const database = new SharedDatabase({ filename: ':memory:' });
	const identityAccess = new IdentityAccessBoundary(database);
	database.sqlite.exec(`
		INSERT INTO accounts (id, role) VALUES ('admin-verifier-045', 'admin');
		INSERT INTO sessions (token, account_id, revoked_at)
		VALUES ('session-verifier-045', 'admin-verifier-045', NULL);
	`);
	const ledger = new FinancialLedgerBoundary(database, identityAccess, scope, {
		now: () => new Date('2026-04-01T00:00:00.000Z')
	});
	return { database, ledger };
}

function runScenario(ledger: FinancialLedgerBoundary) {
	const sessionToken = 'session-verifier-045';
	ledger.setClassPrice({
		sessionToken, classId: 'class-verifier-045', amount: '8.875', effectiveFrom: '2026-01-01'
	});
	for (const lessonId of ['lesson-verifier-045-old', 'lesson-verifier-045-new']) {
		ledger.reconcileLessonCharge({
			sessionToken, lessonId, studentAccountId: 'student-verifier-045',
			attendanceTransition: { from: 'absent', to: 'present' }
		});
	}

	const before = ledger.getBalanceProjection({
		sessionToken, classId: 'class-verifier-045', studentAccountId: 'student-verifier-045'
	});
	const partialPayment = ledger.createPayment({
		sessionToken, classId: 'class-verifier-045', studentAccountId: 'student-verifier-045',
		amount: '10.125', factualDate: '2026-03-10', confirmation: 'partial-verifier-045'
	});
	const partial = ledger.getBalanceProjection({
		sessionToken, classId: 'class-verifier-045', studentAccountId: 'student-verifier-045'
	});
	const excessPayment = ledger.createPayment({
		sessionToken, classId: 'class-verifier-045', studentAccountId: 'student-verifier-045',
		amount: '8', factualDate: '2026-03-11', confirmation: 'excess-verifier-045'
	});
	const final = ledger.getBalanceProjection({
		sessionToken, classId: 'class-verifier-045', studentAccountId: 'student-verifier-045'
	});
	return { before, partialPayment, partial, excessPayment, final };
}

describe('TASK-045 independent payment allocation verification', () => {
	let database: SharedDatabase;
	let ledger: FinancialLedgerBoundary;

	beforeEach(() => {
		({ database, ledger } = createHarness());
	});

	afterEach(() => database.close());

	it('replays exact oldest-first partial and excess states through public commands', () => {
		const first = runScenario(ledger);
		const repeated = createHarness();
		try {
			expect(runScenario(repeated.ledger)).toEqual(first);
		} finally {
			repeated.database.close();
		}

		expect(first.before.charges.map(({ state, remainingAmount }) => ({ state, remainingAmount }))).toEqual([
			{ state: 'overdue', remainingAmount: '8.875' },
			{ state: 'overdue', remainingAmount: '8.875' }
		]);
		expect(first.partial.allocations).toEqual([
			{ paymentId: first.partialPayment.id, lessonId: 'lesson-verifier-045-old', amount: '8.875' },
			{ paymentId: first.partialPayment.id, lessonId: 'lesson-verifier-045-new', amount: '1.25' }
		]);
		expect(first.partial.charges.map(({ lessonId, state, allocatedAmount, remainingAmount }) => ({
			lessonId, state, allocatedAmount, remainingAmount
		}))).toEqual([
			{ lessonId: 'lesson-verifier-045-old', state: 'paid', allocatedAmount: '8.875', remainingAmount: '0' },
			{ lessonId: 'lesson-verifier-045-new', state: 'partially_paid', allocatedAmount: '1.25', remainingAmount: '7.625' }
		]);
		expect(first.partial.balance).toBe('7.625');
		expect(first.final.allocations).toEqual([
			{ paymentId: first.partialPayment.id, lessonId: 'lesson-verifier-045-old', amount: '8.875' },
			{ paymentId: first.partialPayment.id, lessonId: 'lesson-verifier-045-new', amount: '1.25' },
			{ paymentId: first.excessPayment.id, lessonId: 'lesson-verifier-045-new', amount: '7.625' }
		]);
		expect(first.final.charges.every(({ state }) => state === 'paid')).toBe(true);
		expect(first.final.advance).toBe('0.375');
		expect(first.final.balance).toBe('-0.375');
	});
});
