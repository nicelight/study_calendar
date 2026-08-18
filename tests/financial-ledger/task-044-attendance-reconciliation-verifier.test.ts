import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import {
	FinancialLedgerBoundary,
	type FinancialLessonFacts,
	type FinancialScopePort
} from '../../src/lib/server/modules/financial-ledger/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const lessonFacts = new Map<string, FinancialLessonFacts>([
	['lesson-v-individual-1:student-v-individual', {
		centerId: 'center-verifier-044', classId: 'class-v-individual', lessonId: 'lesson-v-individual-1',
		studentAccountId: 'student-v-individual', lessonDate: '2026-03-05'
	}],
	['lesson-v-individual-2:student-v-individual', {
		centerId: 'center-verifier-044', classId: 'class-v-individual', lessonId: 'lesson-v-individual-2',
		studentAccountId: 'student-v-individual', lessonDate: '2026-04-05'
	}],
	['lesson-v-unrelated:student-v-unrelated', {
		centerId: 'center-verifier-044', classId: 'class-v-individual', lessonId: 'lesson-v-unrelated',
		studentAccountId: 'student-v-unrelated', lessonDate: '2026-03-06'
	}],
	['lesson-v-group-1:student-v-group', {
		centerId: 'center-verifier-044', classId: 'class-v-group', lessonId: 'lesson-v-group-1',
		studentAccountId: 'student-v-group', lessonDate: '2026-03-07'
	}],
	['lesson-v-group-2:student-v-group', {
		centerId: 'center-verifier-044', classId: 'class-v-group', lessonId: 'lesson-v-group-2',
		studentAccountId: 'student-v-group', lessonDate: '2026-04-07'
	}],
	['lesson-v-failure:student-v-individual', {
		centerId: 'center-verifier-044', classId: 'class-v-individual', lessonId: 'lesson-v-failure',
		studentAccountId: 'student-v-individual', lessonDate: '2026-02-01'
	}]
]);

const scope: FinancialScopePort = {
	getFinancialClassScope: (actor, classId, studentAccountId) => {
		if (actor.role !== 'admin') {
			return null;
		}
		const studentsByClass: Record<string, string[]> = {
			'class-v-individual': ['student-v-individual', 'student-v-unrelated'],
			'class-v-group': ['student-v-group']
		};
		const studentAccountIds = studentsByClass[classId];
		if (!studentAccountIds || (studentAccountId && !studentAccountIds.includes(studentAccountId))) {
			return null;
		}
		return { centerId: 'center-verifier-044', classId, studentAccountIds };
	},
	getFinancialLessonFacts: (actor, lessonId, studentAccountId) =>
		actor.role === 'admin' ? lessonFacts.get(`${lessonId}:${studentAccountId}`) ?? null : null
};

function createHarness(): { database: SharedDatabase; ledger: FinancialLedgerBoundary } {
	const database = new SharedDatabase({ filename: ':memory:' });
	const identityAccess = new IdentityAccessBoundary(database);
	database.sqlite.exec(`
		INSERT INTO accounts (id, role) VALUES
			('admin-verifier-044', 'admin'),
			('student-outsider-verifier-044', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-verifier-044', 'admin-verifier-044', NULL),
			('session-outsider-verifier-044', 'student-outsider-verifier-044', NULL);
	`);
	let tick = 0;
	const ledger = new FinancialLedgerBoundary(database, identityAccess, scope, {
		now: () => new Date(Date.UTC(2026, 5, 1, 0, 0, tick++))
	});
	return { database, ledger };
}

function seedPayment(database: SharedDatabase): void {
	database.sqlite.exec(`
		INSERT INTO financial_payments (
			id, center_id, class_id, student_account_id, amount, factual_date,
			status, created_by_account_id, created_at
		) VALUES (
			'payment-verifier-044', 'center-verifier-044', 'class-v-individual',
			'student-v-individual', '11', '2026-04-20', 'recorded',
			'admin-verifier-044', '2026-04-20T00:00:00.000Z'
		);
	`);
}

function transition(
	ledger: FinancialLedgerBoundary,
	lessonId: string,
	studentAccountId: string,
	from: 'present' | 'absent',
	to: 'present' | 'absent'
) {
	return ledger.reconcileLessonCharge({
		sessionToken: 'session-admin-verifier-044',
		lessonId,
		studentAccountId,
		attendanceTransition: { from, to }
	});
}

function runScenario(database: SharedDatabase, ledger: FinancialLedgerBoundary) {
	seedPayment(database);
	ledger.setClassPrice({
		sessionToken: 'session-admin-verifier-044', classId: 'class-v-individual',
		amount: '6.750', effectiveFrom: '2026-03-01'
	});
	ledger.setClassPrice({
		sessionToken: 'session-admin-verifier-044', classId: 'class-v-group',
		amount: '4.125', effectiveFrom: '2026-03-01'
	});
	transition(ledger, 'lesson-v-individual-1', 'student-v-individual', 'absent', 'present');
	transition(ledger, 'lesson-v-individual-2', 'student-v-individual', 'absent', 'present');
	transition(ledger, 'lesson-v-unrelated', 'student-v-unrelated', 'absent', 'present');
	transition(ledger, 'lesson-v-group-1', 'student-v-group', 'absent', 'present');
	transition(ledger, 'lesson-v-group-2', 'student-v-group', 'absent', 'present');

	const individualBefore = ledger.getChargeReplay({
		sessionToken: 'session-admin-verifier-044', classId: 'class-v-individual', studentAccountId: 'student-v-individual'
	});
	const unrelatedBefore = ledger.getChargeReplay({
		sessionToken: 'session-admin-verifier-044', classId: 'class-v-individual', studentAccountId: 'student-v-unrelated'
	});
	const cancelled = transition(ledger, 'lesson-v-individual-1', 'student-v-individual', 'present', 'absent');
	const reactivated = transition(ledger, 'lesson-v-individual-1', 'student-v-individual', 'absent', 'present');
	const group = transition(ledger, 'lesson-v-group-1', 'student-v-group', 'present', 'absent');
	transition(ledger, 'lesson-v-group-1', 'student-v-group', 'absent', 'present');

	return {
		individualBefore,
		cancelled,
		reactivated,
		group,
		unrelatedBefore,
		unrelatedAfter: ledger.getChargeReplay({
			sessionToken: 'session-admin-verifier-044', classId: 'class-v-individual', studentAccountId: 'student-v-unrelated'
		})
	};
}

describe('TASK-044 independent attendance reconciliation verification', () => {
	let database: SharedDatabase;
	let ledger: FinancialLedgerBoundary;

	beforeEach(() => {
		({ database, ledger } = createHarness());
	});

	afterEach(() => database.close());

	it('keeps individual/group replay exact, audited, isolated, and atomic', () => {
		const first = runScenario(database, ledger);
		const repeated = createHarness();
		try {
			expect(runScenario(repeated.database, repeated.ledger)).toEqual(first);
		} finally {
			repeated.database.close();
		}

		expect(first.individualBefore.allocations).toEqual([
			{ paymentId: 'payment-verifier-044', lessonId: 'lesson-v-individual-1', amount: '6.75' },
			{ paymentId: 'payment-verifier-044', lessonId: 'lesson-v-individual-2', amount: '4.25' }
		]);
		expect(first.individualBefore.balance).toBe('2.5');
		expect(first.cancelled.balance).toBe('-4.25');
		expect(first.cancelled.allocations).toEqual([
			{ paymentId: 'payment-verifier-044', lessonId: 'lesson-v-individual-2', amount: '6.75' }
		]);
		expect(first.reactivated.allocations).toEqual(first.individualBefore.allocations);
		expect(first.reactivated.audit.map(({ action, actorAccountId }) => ({ action, actorAccountId }))).toEqual([
			{ action: 'charge-created', actorAccountId: 'admin-verifier-044' },
			{ action: 'charge-created', actorAccountId: 'admin-verifier-044' },
			{ action: 'charge-cancelled', actorAccountId: 'admin-verifier-044' },
			{ action: 'charge-reactivated', actorAccountId: 'admin-verifier-044' }
		]);
		expect(first.group.charges).toMatchObject([
			{ lessonId: 'lesson-v-group-1', appliedPrice: '4.125', status: 'cancelled' },
			{ lessonId: 'lesson-v-group-2', appliedPrice: '4.125', status: 'active' }
		]);
		expect(first.unrelatedAfter).toEqual(first.unrelatedBefore);

		const countsBeforeFailure = database.sqlite.prepare(`
			SELECT
				(SELECT COUNT(*) FROM financial_lesson_charges) AS charges,
				(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
				(SELECT COUNT(*) FROM financial_audit_records) AS audit
		`).get();
		expect(() => transition(ledger, 'lesson-v-failure', 'student-v-individual', 'absent', 'present'))
			.toThrow('price-not-configured');
		expect(database.sqlite.prepare(`
			SELECT
				(SELECT COUNT(*) FROM financial_lesson_charges) AS charges,
				(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
				(SELECT COUNT(*) FROM financial_audit_records) AS audit
		`).get()).toEqual(countsBeforeFailure);

		const countsBeforeDenied = database.sqlite.prepare(`
			SELECT
				(SELECT COUNT(*) FROM financial_lesson_charges) AS charges,
				(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
				(SELECT COUNT(*) FROM financial_audit_records) AS audit
		`).get();
		expect(() => ledger.reconcileLessonCharge({
			sessionToken: 'session-outsider-verifier-044', lessonId: 'lesson-v-individual-1',
			studentAccountId: 'student-v-individual', attendanceTransition: { from: 'present', to: 'absent' }
		})).toThrow('not-authorized');
		expect(database.sqlite.prepare(`
			SELECT
				(SELECT COUNT(*) FROM financial_lesson_charges) AS charges,
				(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
				(SELECT COUNT(*) FROM financial_audit_records) AS audit
		`).get()).toEqual(countsBeforeDenied);
	});
});
