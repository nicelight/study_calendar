import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import {
	FinancialLedgerBoundary,
	type FinancialLessonFacts,
	type FinancialScopePort
} from '../../src/lib/server/modules/financial-ledger/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const lessonFacts = new Map<string, FinancialLessonFacts>([
	[
		'lesson-early-default:student-default',
		{
			centerId: 'center-own',
			classId: 'class-own',
			lessonId: 'lesson-early-default',
			studentAccountId: 'student-default',
			lessonDate: '2026-01-10'
		}
	],
	[
		'lesson-late-default:student-default',
		{
			centerId: 'center-own',
			classId: 'class-own',
			lessonId: 'lesson-late-default',
			studentAccountId: 'student-default',
			lessonDate: '2026-02-10'
		}
	],
	[
		'lesson-early-override:student-override',
		{
			centerId: 'center-own',
			classId: 'class-own',
			lessonId: 'lesson-early-override',
			studentAccountId: 'student-override',
			lessonDate: '2026-01-10'
		}
	],
	[
		'lesson-late-override:student-override',
		{
			centerId: 'center-own',
			classId: 'class-own',
			lessonId: 'lesson-late-override',
			studentAccountId: 'student-override',
			lessonDate: '2026-02-10'
		}
	]
]);

const scope: FinancialScopePort = {
	getFinancialClassScope: (actor, classId, studentAccountId) => {
		if (actor.role !== 'admin' || classId !== 'class-own') {
			return null;
		}
		const studentAccountIds = ['student-default', 'student-override'];
		if (studentAccountId && !studentAccountIds.includes(studentAccountId)) {
			return null;
		}
		return { centerId: 'center-own', classId, studentAccountIds };
	},
	getFinancialLessonFacts: (actor, lessonId, studentAccountId) => {
		if (actor.role !== 'admin') {
			return null;
		}
		return lessonFacts.get(`${lessonId}:${studentAccountId}`) ?? null;
	}
};

type Harness = {
	database: SharedDatabase;
	ledger: FinancialLedgerBoundary;
};

function createHarness(): Harness {
	const database = new SharedDatabase({ filename: ':memory:' });
	const identityAccess = new IdentityAccessBoundary(database);
	database.sqlite.exec(`
		INSERT INTO accounts (id, role) VALUES
			('admin-own', 'admin'),
			('student-outsider', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-own', 'admin-own', NULL),
			('session-outsider', 'student-outsider', NULL);
	`);
	let clockTick = 0;
	const ledger = new FinancialLedgerBoundary(database, identityAccess, scope, {
		now: () => new Date(Date.UTC(2026, 2, 1, 0, 0, clockTick++))
	});
	return { database, ledger };
}

function reconcile(
	ledger: FinancialLedgerBoundary,
	lessonId: string,
	studentAccountId: string,
	from: 'present' | 'absent',
	to: 'present' | 'absent'
) {
	return ledger.reconcileLessonCharge({
		sessionToken: 'session-admin-own',
		lessonId,
		studentAccountId,
		attendanceTransition: { from, to }
	});
}

function seedPaymentHistory(database: SharedDatabase): void {
	database.sqlite.exec(`
		INSERT INTO financial_payments (
			id,
			center_id,
			class_id,
			student_account_id,
			amount,
			factual_date,
			status,
			created_by_account_id,
			created_at
		) VALUES (
			'payment-history-1',
			'center-own',
			'class-own',
			'student-default',
			'15',
			'2026-02-15',
			'recorded',
			'admin-own',
			'2026-02-15T00:00:00.000Z'
		);
	`);
}

describe('historical prices and charge correction foundations', () => {
	let harness: Harness;

	beforeEach(() => {
		harness = createHarness();
	});

	afterEach(() => harness.database.close());

	it('FT-006-AC-001 snapshots exact class and student prices so later settings affect only future charges', () => {
		harness.ledger.setClassPrice({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			amount: '10.1250',
			effectiveFrom: '2026-01-01'
		});
		harness.ledger.setStudentPriceOverride({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-override',
			amount: '7.500',
			effectiveFrom: '2026-01-01'
		});

		reconcile(harness.ledger, 'lesson-early-default', 'student-default', 'absent', 'present');
		reconcile(harness.ledger, 'lesson-early-override', 'student-override', 'absent', 'present');

		harness.ledger.setClassPrice({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			amount: '12.34',
			effectiveFrom: '2026-02-01'
		});
		harness.ledger.setStudentPriceOverride({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-override',
			amount: '8.75',
			effectiveFrom: '2026-02-01'
		});

		expect(
			harness.ledger.getChargeReplay({
				sessionToken: 'session-admin-own',
				classId: 'class-own',
				studentAccountId: 'student-default'
			}).charges.map((charge) => charge.appliedPrice)
		).toEqual(['10.125']);
		expect(
			harness.ledger.getChargeReplay({
				sessionToken: 'session-admin-own',
				classId: 'class-own',
				studentAccountId: 'student-override'
			}).charges.map((charge) => charge.appliedPrice)
		).toEqual(['7.5']);

		reconcile(harness.ledger, 'lesson-late-default', 'student-default', 'absent', 'present');
		reconcile(harness.ledger, 'lesson-late-override', 'student-override', 'absent', 'present');

		const defaultReplay = harness.ledger.getChargeReplay({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-default'
		});
		const overrideReplay = harness.ledger.getChargeReplay({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-override'
		});

		expect(defaultReplay.charges.map((charge) => charge.appliedPrice)).toEqual([
			'10.125',
			'12.34'
		]);
		expect(defaultReplay.balance).toBe('22.465');
		expect(overrideReplay.charges.map((charge) => charge.appliedPrice)).toEqual(['7.5', '8.75']);
		expect(overrideReplay.balance).toBe('16.25');
		expect(
			harness.database.sqlite
				.prepare(
					'SELECT applied_price FROM financial_lesson_charges ORDER BY lesson_id, student_account_id'
				)
				.all()
		).toEqual([
			{ applied_price: '10.125' },
			{ applied_price: '7.5' },
			{ applied_price: '12.34' },
			{ applied_price: '8.75' }
		]);
	});

	it('FT-006-AC-004 replays correction deterministically with exact balance and author/time/change audit', () => {
		function runHistory(target: Harness) {
			seedPaymentHistory(target.database);
			target.ledger.setClassPrice({
				sessionToken: 'session-admin-own',
				classId: 'class-own',
				amount: '10.125',
				effectiveFrom: '2026-01-01'
			});
			reconcile(target.ledger, 'lesson-early-default', 'student-default', 'absent', 'present');
			reconcile(target.ledger, 'lesson-late-default', 'student-default', 'absent', 'present');

			const beforeCorrection = target.ledger.getChargeReplay({
				sessionToken: 'session-admin-own',
				classId: 'class-own',
				studentAccountId: 'student-default'
			});
			const afterCancellation = reconcile(
				target.ledger,
				'lesson-early-default',
				'student-default',
				'present',
				'absent'
			);
			const afterReactivation = reconcile(
				target.ledger,
				'lesson-early-default',
				'student-default',
				'absent',
				'present'
			);

			return { beforeCorrection, afterCancellation, afterReactivation };
		}

		const firstHistory = runHistory(harness);
		const repeatedHarness = createHarness();
		try {
			const repeatedHistory = runHistory(repeatedHarness);
			expect(repeatedHistory).toEqual(firstHistory);
		} finally {
			repeatedHarness.database.close();
		}

		expect(firstHistory.beforeCorrection.allocations).toEqual([
			{
				paymentId: 'payment-history-1',
				lessonId: 'lesson-early-default',
				amount: '10.125'
			},
			{
				paymentId: 'payment-history-1',
				lessonId: 'lesson-late-default',
				amount: '4.875'
			}
		]);
		expect(firstHistory.beforeCorrection.balance).toBe('5.25');
		expect(firstHistory.afterCancellation.allocations).toEqual([
			{
				paymentId: 'payment-history-1',
				lessonId: 'lesson-late-default',
				amount: '10.125'
			}
		]);
		expect(firstHistory.afterCancellation.balance).toBe('-4.875');
		expect(firstHistory.afterReactivation.allocations).toEqual(
			firstHistory.beforeCorrection.allocations
		);
		expect(firstHistory.afterReactivation.balance).toBe('5.25');
		expect(
			harness.database.sqlite
				.prepare(
					`SELECT payment_id, lesson_id, amount
					 FROM financial_payment_allocations
					 ORDER BY payment_id, lesson_id`
				)
				.all()
		).toEqual([
			{
				payment_id: 'payment-history-1',
				lesson_id: 'lesson-early-default',
				amount: '10.125'
			},
			{
				payment_id: 'payment-history-1',
				lesson_id: 'lesson-late-default',
				amount: '4.875'
			}
		]);
		expect(firstHistory.afterReactivation.charges).toMatchObject([
			{
				lessonId: 'lesson-early-default',
				appliedPrice: '10.125',
				status: 'active',
				cancelledAt: null
			},
			{
				lessonId: 'lesson-late-default',
				appliedPrice: '10.125',
				status: 'active',
				cancelledAt: null
			}
		]);
		expect(firstHistory.afterReactivation.audit.map(({ action, actorAccountId, changedAt }) => ({
			action,
			actorAccountId,
			changedAt
		}))).toEqual([
			{
				action: 'charge-created',
				actorAccountId: 'admin-own',
				changedAt: '2026-03-01T00:00:01.000Z'
			},
			{
				action: 'charge-created',
				actorAccountId: 'admin-own',
				changedAt: '2026-03-01T00:00:02.000Z'
			},
			{
				action: 'charge-cancelled',
				actorAccountId: 'admin-own',
				changedAt: '2026-03-01T00:00:03.000Z'
			},
			{
				action: 'charge-reactivated',
				actorAccountId: 'admin-own',
				changedAt: '2026-03-01T00:00:04.000Z'
			}
		]);
		expect(firstHistory.afterReactivation.audit[2]).toMatchObject({
			before: { status: 'active', appliedPrice: '10.125' },
			after: { status: 'cancelled', appliedPrice: '10.125' }
		});
		expect(firstHistory.afterReactivation.audit[3]).toMatchObject({
			before: { status: 'cancelled', appliedPrice: '10.125' },
			after: { status: 'active', appliedPrice: '10.125' }
		});

		const stateBeforeDenied = harness.database.sqlite
			.prepare(
				`SELECT
					(SELECT COUNT(*) FROM financial_lesson_charges) AS charges,
					(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
					(SELECT COUNT(*) FROM financial_audit_records) AS audit`
			)
			.get();
		expect(() =>
			harness.ledger.reconcileLessonCharge({
				sessionToken: 'session-outsider',
				lessonId: 'lesson-early-default',
				studentAccountId: 'student-default',
				attendanceTransition: { from: 'present', to: 'absent' }
			})
		).toThrow('not-authorized');
		expect(
			harness.database.sqlite
				.prepare(
					`SELECT
						(SELECT COUNT(*) FROM financial_lesson_charges) AS charges,
						(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
						(SELECT COUNT(*) FROM financial_audit_records) AS audit`
				)
				.get()
		).toEqual(stateBeforeDenied);
	});
});
