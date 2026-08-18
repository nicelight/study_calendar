import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import {
	FinancialLedgerBoundary,
	type FinancialLessonFacts,
	type FinancialScopePort
} from '../../src/lib/server/modules/financial-ledger/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const lessonFacts = new Map<string, FinancialLessonFacts>([
	...['one', 'two', 'three'].map((suffix, index) => [
		`lesson-semantic-045-${suffix}:student-semantic-045`,
		{
			centerId: 'center-semantic-045', classId: 'class-semantic-045',
			lessonId: `lesson-semantic-045-${suffix}`,
			studentAccountId: 'student-semantic-045',
			lessonDate: `2026-01-${String(index + 10).padStart(2, '0')}`
		}
	] as const)
]);

const scope: FinancialScopePort = {
	getFinancialClassScope: (actor, classId, studentAccountId) => {
		if (actor.role !== 'admin' || classId !== 'class-semantic-045') return null;
		if (studentAccountId && studentAccountId !== 'student-semantic-045') return null;
		return {
			centerId: 'center-semantic-045', classId,
			studentAccountIds: ['student-semantic-045']
		};
	},
	getFinancialLessonFacts: (actor, lessonId, studentAccountId) =>
		actor.role === 'admin' ? lessonFacts.get(`${lessonId}:${studentAccountId}`) ?? null : null
};

describe('TASK-045 semantic exact-scale allocation checks', () => {
	let database: SharedDatabase;
	let ledger: FinancialLedgerBoundary;

	beforeEach(() => {
		database = new SharedDatabase({ filename: ':memory:' });
		const identityAccess = new IdentityAccessBoundary(database);
		database.sqlite.exec(`
			INSERT INTO accounts (id, role) VALUES ('admin-semantic-045', 'admin');
			INSERT INTO sessions (token, account_id, revoked_at)
			VALUES ('session-semantic-045', 'admin-semantic-045', NULL);
		`);
		ledger = new FinancialLedgerBoundary(database, identityAccess, scope, {
			now: () => new Date('2026-02-01T00:00:00.000Z')
		});
	});

	afterEach(() => database.close());

	it('does not lose sub-unit remainder or excess across repeated recomputation', () => {
		const sessionToken = 'session-semantic-045';
		ledger.setClassPrice({
			sessionToken, classId: 'class-semantic-045', amount: '0.125', effectiveFrom: '2026-01-01'
		});
		for (const lessonId of ['lesson-semantic-045-one', 'lesson-semantic-045-two', 'lesson-semantic-045-three']) {
			ledger.reconcileLessonCharge({
				sessionToken, lessonId, studentAccountId: 'student-semantic-045',
				attendanceTransition: { from: 'absent', to: 'present' }
			});
		}

		const firstPayment = ledger.createPayment({
			sessionToken, classId: 'class-semantic-045', studentAccountId: 'student-semantic-045',
			amount: '0.333', factualDate: '2026-01-20', confirmation: 'first-semantic-045'
		});
		const partial = ledger.getBalanceProjection({
			sessionToken, classId: 'class-semantic-045', studentAccountId: 'student-semantic-045'
		});
		expect(partial.allocations).toEqual([
			{ paymentId: firstPayment.id, lessonId: 'lesson-semantic-045-one', amount: '0.125' },
			{ paymentId: firstPayment.id, lessonId: 'lesson-semantic-045-two', amount: '0.125' },
			{ paymentId: firstPayment.id, lessonId: 'lesson-semantic-045-three', amount: '0.083' }
		]);
		expect(partial.charges.map(({ state, remainingAmount }) => ({ state, remainingAmount }))).toEqual([
			{ state: 'paid', remainingAmount: '0' },
			{ state: 'paid', remainingAmount: '0' },
			{ state: 'partially_paid', remainingAmount: '0.042' }
		]);
		expect(partial.balance).toBe('0.042');

		const secondPayment = ledger.createPayment({
			sessionToken, classId: 'class-semantic-045', studentAccountId: 'student-semantic-045',
			amount: '0.05', factualDate: '2026-01-21', confirmation: 'second-semantic-045'
		});
		const final = ledger.getBalanceProjection({
			sessionToken, classId: 'class-semantic-045', studentAccountId: 'student-semantic-045'
		});
		expect(final.allocations.at(-1)).toEqual({
			paymentId: secondPayment.id, lessonId: 'lesson-semantic-045-three', amount: '0.042'
		});
		expect(final.charges.every(({ state }) => state === 'paid')).toBe(true);
		expect(final.advance).toBe('0.008');
		expect(final.balance).toBe('-0.008');
	});
});
