import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import {
	FinancialLedgerBoundary,
	type FinancialScopePort
} from '../../src/lib/server/modules/financial-ledger/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const scope: FinancialScopePort = {
	getFinancialClassScope: (actor, classId, studentAccountId) => {
		if (actor.role !== 'admin' || classId !== 'class-semantic-044') {
			return null;
		}
		if (studentAccountId && studentAccountId !== 'student-semantic-044') {
			return null;
		}
		return { centerId: 'center-semantic-044', classId, studentAccountIds: ['student-semantic-044'] };
	},
	getFinancialLessonFacts: (actor, lessonId, studentAccountId) =>
		actor.role === 'admin' && lessonId === 'lesson-semantic-044' && studentAccountId === 'student-semantic-044'
			? {
				centerId: 'center-semantic-044', classId: 'class-semantic-044',
				lessonId, studentAccountId, lessonDate: '2026-03-01'
			}
			: null
};

describe('TASK-044 semantic no-op and historical-state checks', () => {
	let database: SharedDatabase;
	let ledger: FinancialLedgerBoundary;

	beforeEach(() => {
		database = new SharedDatabase({ filename: ':memory:' });
		const identityAccess = new IdentityAccessBoundary(database);
		database.sqlite.exec(`
			INSERT INTO accounts (id, role) VALUES ('admin-semantic-044', 'admin');
			INSERT INTO sessions (token, account_id, revoked_at)
			VALUES ('session-semantic-044', 'admin-semantic-044', NULL);
			INSERT INTO financial_payments (
				id, center_id, class_id, student_account_id, amount, factual_date,
				status, created_by_account_id, created_at
			) VALUES (
				'payment-semantic-044', 'center-semantic-044', 'class-semantic-044',
				'student-semantic-044', '5', '2026-03-02', 'recorded',
				'admin-semantic-044', '2026-03-02T00:00:00.000Z'
			);
		`);
		ledger = new FinancialLedgerBoundary(database, identityAccess, scope, {
			now: () => new Date('2026-04-01T00:00:00.000Z')
		});
	});

	afterEach(() => database.close());

	it('keeps no-op retries side-effect free and preserves applied price across correction replay', () => {
		const request = {
			sessionToken: 'session-semantic-044',
			lessonId: 'lesson-semantic-044',
			studentAccountId: 'student-semantic-044'
		};
		ledger.setClassPrice({
			...request,
			classId: 'class-semantic-044',
			amount: '5.00',
			effectiveFrom: '2026-03-01'
		});
		ledger.reconcileLessonCharge({
			...request,
			attendanceTransition: { from: 'absent', to: 'present' }
		});
		const beforeNoOp = ledger.getChargeReplay({ ...request, classId: 'class-semantic-044' });
		const beforeCounts = database.sqlite.prepare(`
			SELECT
				(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
				(SELECT COUNT(*) FROM financial_audit_records) AS audit
		`).get();

		const afterNoOp = ledger.reconcileLessonCharge({
			...request,
			attendanceTransition: { from: 'present', to: 'present' }
		});
		expect(afterNoOp).toEqual(beforeNoOp);
		expect(database.sqlite.prepare(`
			SELECT
				(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
				(SELECT COUNT(*) FROM financial_audit_records) AS audit
		`).get()).toEqual(beforeCounts);

		const cancelled = ledger.reconcileLessonCharge({
			...request,
			attendanceTransition: { from: 'present', to: 'absent' }
		});
		expect(cancelled.charges[0]).toMatchObject({ appliedPrice: '5', status: 'cancelled' });
		expect(cancelled.allocations).toEqual([]);
		expect(cancelled.audit.at(-1)).toMatchObject({
			action: 'charge-cancelled',
			before: { appliedPrice: '5', status: 'active' },
			after: { appliedPrice: '5', status: 'cancelled' }
		});

		const reactivated = ledger.reconcileLessonCharge({
			...request,
			attendanceTransition: { from: 'absent', to: 'present' }
		});
		expect(reactivated.charges[0]).toMatchObject({ appliedPrice: '5', status: 'active' });
		expect(reactivated.allocations).toEqual([
			{ paymentId: 'payment-semantic-044', lessonId: 'lesson-semantic-044', amount: '5' }
		]);
	});
});
