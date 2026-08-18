import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import {
	FinancialLedgerBoundary,
	type ChargeReplayView,
	type FinancialLessonFacts,
	type FinancialScopePort
} from '../../src/lib/server/modules/financial-ledger/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const lessonFacts = new Map<string, FinancialLessonFacts>([
	['lesson-individual-before:student-individual', {
		centerId: 'center-task-044', classId: 'class-individual-044',
		lessonId: 'lesson-individual-before', studentAccountId: 'student-individual',
		lessonDate: '2026-01-10'
	}],
	['lesson-individual-after:student-individual', {
		centerId: 'center-task-044', classId: 'class-individual-044',
		lessonId: 'lesson-individual-after', studentAccountId: 'student-individual',
		lessonDate: '2026-02-10'
	}],
	['lesson-individual-unrelated:student-unrelated', {
		centerId: 'center-task-044', classId: 'class-individual-044',
		lessonId: 'lesson-individual-unrelated', studentAccountId: 'student-unrelated',
		lessonDate: '2026-01-12'
	}],
	['lesson-group-before:student-group', {
		centerId: 'center-task-044', classId: 'class-group-044',
		lessonId: 'lesson-group-before', studentAccountId: 'student-group',
		lessonDate: '2026-01-15'
	}],
	['lesson-group-after:student-group', {
		centerId: 'center-task-044', classId: 'class-group-044',
		lessonId: 'lesson-group-after', studentAccountId: 'student-group',
		lessonDate: '2026-02-15'
	}],
	['lesson-failure:student-individual', {
		centerId: 'center-task-044', classId: 'class-individual-044',
		lessonId: 'lesson-failure', studentAccountId: 'student-individual',
		lessonDate: '2025-12-15'
	}]
]);

const scope: FinancialScopePort = {
	getFinancialClassScope: (actor, classId, studentAccountId) => {
		if (actor.role !== 'admin') {
			return null;
		}
		const studentsByClass: Record<string, string[]> = {
			'class-individual-044': ['student-individual', 'student-unrelated'],
			'class-group-044': ['student-group']
		};
		const studentAccountIds = studentsByClass[classId];
		if (!studentAccountIds || (studentAccountId && !studentAccountIds.includes(studentAccountId))) {
			return null;
		}
		return { centerId: 'center-task-044', classId, studentAccountIds };
	},
	getFinancialLessonFacts: (actor, lessonId, studentAccountId) =>
		actor.role === 'admin' ? lessonFacts.get(`${lessonId}:${studentAccountId}`) ?? null : null
};

type Harness = { database: SharedDatabase; ledger: FinancialLedgerBoundary };

function createHarness(): Harness {
	const database = new SharedDatabase({ filename: ':memory:' });
	const identityAccess = new IdentityAccessBoundary(database);
	database.sqlite.exec(`
		INSERT INTO accounts (id, role) VALUES
			('admin-task-044', 'admin'),
			('student-outsider-044', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-044', 'admin-task-044', NULL),
			('session-outsider-044', 'student-outsider-044', NULL);
	`);
	let tick = 0;
	const ledger = new FinancialLedgerBoundary(database, identityAccess, scope, {
		now: () => new Date(Date.UTC(2026, 2, 1, 0, 0, tick++))
	});
	return { database, ledger };
}

function seedPayment(database: SharedDatabase): void {
	database.sqlite.exec(`
		INSERT INTO financial_payments (
			id, center_id, class_id, student_account_id, amount, factual_date,
			status, created_by_account_id, created_at
		) VALUES (
			'payment-task-044', 'center-task-044', 'class-individual-044',
			'student-individual', '15', '2026-02-20', 'recorded',
			'admin-task-044', '2026-02-20T00:00:00.000Z'
		);
	`);
}

function reconcile(
	ledger: FinancialLedgerBoundary,
	lessonId: string,
	studentAccountId: string,
	from: 'present' | 'absent',
	to: 'present' | 'absent'
): ChargeReplayView {
	return ledger.reconcileLessonCharge({
		sessionToken: 'session-admin-044',
		lessonId,
		studentAccountId,
		attendanceTransition: { from, to }
	});
}

function runHistory(target: Harness) {
	seedPayment(target.database);
	target.ledger.setClassPrice({
		sessionToken: 'session-admin-044',
		classId: 'class-individual-044',
		amount: '10.125',
		effectiveFrom: '2026-01-01'
	});
	target.ledger.setClassPrice({
		sessionToken: 'session-admin-044',
		classId: 'class-group-044',
		amount: '8.50',
		effectiveFrom: '2026-01-01'
	});

	reconcile(target.ledger, 'lesson-individual-before', 'student-individual', 'absent', 'present');
	reconcile(target.ledger, 'lesson-individual-after', 'student-individual', 'absent', 'present');
	reconcile(target.ledger, 'lesson-individual-unrelated', 'student-unrelated', 'absent', 'present');
	reconcile(target.ledger, 'lesson-group-before', 'student-group', 'absent', 'present');
	reconcile(target.ledger, 'lesson-group-after', 'student-group', 'absent', 'present');

	const beforeCorrection = target.ledger.getChargeReplay({
		sessionToken: 'session-admin-044',
		classId: 'class-individual-044',
		studentAccountId: 'student-individual'
	});
	const unrelatedBefore = target.ledger.getChargeReplay({
		sessionToken: 'session-admin-044',
		classId: 'class-individual-044',
		studentAccountId: 'student-unrelated'
	});
	const groupBefore = target.ledger.getChargeReplay({
		sessionToken: 'session-admin-044',
		classId: 'class-group-044',
		studentAccountId: 'student-group'
	});

	const afterCancellation = reconcile(
		target.ledger,
		'lesson-individual-before',
		'student-individual',
		'present',
		'absent'
	);
	const afterReactivation = reconcile(
		target.ledger,
		'lesson-individual-before',
		'student-individual',
		'absent',
		'present'
	);
	const groupAfterReactivation = reconcile(
		target.ledger,
		'lesson-group-before',
		'student-group',
		'present',
		'absent'
	);
	reconcile(target.ledger, 'lesson-group-before', 'student-group', 'absent', 'present');

	return {
		beforeCorrection,
		afterCancellation,
		afterReactivation,
		groupBefore,
		groupAfterReactivation,
		unrelatedBefore,
		unrelatedAfter: target.ledger.getChargeReplay({
			sessionToken: 'session-admin-044',
			classId: 'class-individual-044',
			studentAccountId: 'student-unrelated'
		})
	};
}

describe('TASK-044 attendance charge reconciliation', () => {
	let harness: Harness;

	beforeEach(() => {
		harness = createHarness();
	});

	afterEach(() => harness.database.close());

	it('replays individual/group corrections deterministically with audit and atomic failure', () => {
		const first = runHistory(harness);
		const repeatedHarness = createHarness();
		try {
			expect(runHistory(repeatedHarness)).toEqual(first);
		} finally {
			repeatedHarness.database.close();
		}

		expect(first.beforeCorrection.allocations).toEqual([
		{ paymentId: 'payment-task-044', lessonId: 'lesson-individual-before', amount: '10.125' },
		{ paymentId: 'payment-task-044', lessonId: 'lesson-individual-after', amount: '4.875' }
		]);
		expect(first.beforeCorrection.balance).toBe('5.25');
		expect(first.afterCancellation.allocations).toEqual([
		{ paymentId: 'payment-task-044', lessonId: 'lesson-individual-after', amount: '10.125' }
		]);
		expect(first.afterCancellation.balance).toBe('-4.875');
		expect(first.afterReactivation.allocations).toEqual(first.beforeCorrection.allocations);
		expect(first.afterReactivation.balance).toBe('5.25');
		expect(first.groupBefore.balance).toBe('17');
		expect(first.groupAfterReactivation.charges).toMatchObject([
			{ lessonId: 'lesson-group-before', appliedPrice: '8.5', status: 'cancelled' },
			{ lessonId: 'lesson-group-after', appliedPrice: '8.5', status: 'active' }
		]);
		expect(first.unrelatedAfter).toEqual(first.unrelatedBefore);
		expect(first.afterReactivation.audit.map(({ action, actorAccountId }) => ({ action, actorAccountId }))).toEqual([
		{ action: 'charge-created', actorAccountId: 'admin-task-044' },
		{ action: 'charge-created', actorAccountId: 'admin-task-044' },
		{ action: 'charge-cancelled', actorAccountId: 'admin-task-044' },
		{ action: 'charge-reactivated', actorAccountId: 'admin-task-044' }
		]);
		expect(first.afterReactivation.audit[2]).toMatchObject({
			before: { status: 'active', appliedPrice: '10.125' },
			after: { status: 'cancelled', appliedPrice: '10.125' }
		});

		const stateBeforeFailure = harness.database.sqlite.prepare(`
			SELECT
				(SELECT COUNT(*) FROM financial_lesson_charges) AS charges,
				(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
				(SELECT COUNT(*) FROM financial_audit_records) AS audit
		`).get();
		expect(() => reconcile(harness.ledger, 'lesson-failure', 'student-individual', 'absent', 'present'))
			.toThrow('price-not-configured');
		expect(harness.database.sqlite.prepare(`
			SELECT
				(SELECT COUNT(*) FROM financial_lesson_charges) AS charges,
				(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
				(SELECT COUNT(*) FROM financial_audit_records) AS audit
		`).get()).toEqual(stateBeforeFailure);

		const stateBeforeDenied = harness.database.sqlite.prepare(`
			SELECT
				(SELECT COUNT(*) FROM financial_lesson_charges) AS charges,
				(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
				(SELECT COUNT(*) FROM financial_audit_records) AS audit
		`).get();
		expect(() => harness.ledger.reconcileLessonCharge({
			sessionToken: 'session-outsider-044',
			lessonId: 'lesson-individual-before',
			studentAccountId: 'student-individual',
			attendanceTransition: { from: 'present', to: 'absent' }
		})).toThrow('not-authorized');
		expect(harness.database.sqlite.prepare(`
			SELECT
				(SELECT COUNT(*) FROM financial_lesson_charges) AS charges,
				(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
				(SELECT COUNT(*) FROM financial_audit_records) AS audit
		`).get()).toEqual(stateBeforeDenied);
	});
});
