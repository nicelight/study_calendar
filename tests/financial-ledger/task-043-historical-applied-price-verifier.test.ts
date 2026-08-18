import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import {
	FinancialLedgerBoundary,
	type FinancialLessonFacts,
	type FinancialScopePort
} from '../../src/lib/server/modules/financial-ledger/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const lessonFacts = new Map<string, FinancialLessonFacts>([
	['lesson-v-default-1:student-v-default', {
		centerId: 'center-verifier-043', classId: 'class-verifier-043',
		lessonId: 'lesson-v-default-1', studentAccountId: 'student-v-default',
		lessonDate: '2026-05-04'
	}],
	['lesson-v-override-1:student-v-override', {
		centerId: 'center-verifier-043', classId: 'class-verifier-043',
		lessonId: 'lesson-v-override-1', studentAccountId: 'student-v-override',
		lessonDate: '2026-05-04'
	}],
	['lesson-v-default-2:student-v-default', {
		centerId: 'center-verifier-043', classId: 'class-verifier-043',
		lessonId: 'lesson-v-default-2', studentAccountId: 'student-v-default',
		lessonDate: '2026-06-04'
	}],
	['lesson-v-override-2:student-v-override', {
		centerId: 'center-verifier-043', classId: 'class-verifier-043',
		lessonId: 'lesson-v-override-2', studentAccountId: 'student-v-override',
		lessonDate: '2026-06-04'
	}]
]);

const scope: FinancialScopePort = {
	getFinancialClassScope: (actor, classId, studentAccountId) => {
		if (actor.role !== 'admin' || classId !== 'class-verifier-043') {
			return null;
		}
		const studentAccountIds = ['student-v-default', 'student-v-override'];
		if (studentAccountId && !studentAccountIds.includes(studentAccountId)) {
			return null;
		}
		return { centerId: 'center-verifier-043', classId, studentAccountIds };
	},
	getFinancialLessonFacts: (actor, lessonId, studentAccountId) =>
		actor.role === 'admin' ? lessonFacts.get(`${lessonId}:${studentAccountId}`) ?? null : null
};

describe('TASK-043 independent historical applied-price verification', () => {
	let database: SharedDatabase;
	let ledger: FinancialLedgerBoundary;

	beforeEach(() => {
		database = new SharedDatabase({ filename: ':memory:' });
		const identityAccess = new IdentityAccessBoundary(database);
		database.sqlite.exec(`
			INSERT INTO accounts (id, role) VALUES ('admin-verifier-043', 'admin');
			INSERT INTO sessions (token, account_id, revoked_at)
			VALUES ('session-verifier-043', 'admin-verifier-043', NULL);
		`);
		let tick = 0;
		ledger = new FinancialLedgerBoundary(database, identityAccess, scope, {
			now: () => new Date(Date.UTC(2026, 6, 1, 0, 0, tick++))
		});
	});

	afterEach(() => database.close());

	it('persists immutable default/override snapshots through setting changes and reactivation', () => {
		const sessionToken = 'session-verifier-043';
		const charge = (lessonId: string, studentAccountId: string) =>
			ledger.reconcileLessonCharge({
				sessionToken,
				lessonId,
				studentAccountId,
				attendanceTransition: { from: 'absent', to: 'present' }
			});

		ledger.setClassPrice({
			sessionToken,
			classId: 'class-verifier-043',
			amount: '19.8750',
			effectiveFrom: '2026-05-01'
		});
		ledger.setStudentPriceOverride({
			sessionToken,
			classId: 'class-verifier-043',
			studentAccountId: 'student-v-override',
			amount: '3.1250',
			effectiveFrom: '2026-05-01'
		});
		charge('lesson-v-default-1', 'student-v-default');
		charge('lesson-v-override-1', 'student-v-override');

		ledger.setClassPrice({
			sessionToken,
			classId: 'class-verifier-043',
			amount: '21.25',
			effectiveFrom: '2026-06-01'
		});
		ledger.setStudentPriceOverride({
			sessionToken,
			classId: 'class-verifier-043',
			studentAccountId: 'student-v-override',
			amount: '4.50',
			effectiveFrom: '2026-06-01'
		});
		charge('lesson-v-default-2', 'student-v-default');
		charge('lesson-v-override-2', 'student-v-override');

		const defaultReplay = ledger.getChargeReplay({
			sessionToken,
			classId: 'class-verifier-043',
			studentAccountId: 'student-v-default'
		});
		const overrideReplay = ledger.getChargeReplay({
			sessionToken,
			classId: 'class-verifier-043',
			studentAccountId: 'student-v-override'
		});
		expect(defaultReplay.charges.map((charge) => charge.appliedPrice)).toEqual(['19.875', '21.25']);
		expect(overrideReplay.charges.map((charge) => charge.appliedPrice)).toEqual(['3.125', '4.5']);

		const persisted = database.sqlite
			.prepare(
				`SELECT lesson_id, student_account_id, applied_price
				 FROM financial_lesson_charges
				 ORDER BY lesson_date, lesson_id`
			)
			.all();
		expect(persisted).toEqual([
			{ lesson_id: 'lesson-v-default-1', student_account_id: 'student-v-default', applied_price: '19.875' },
			{ lesson_id: 'lesson-v-override-1', student_account_id: 'student-v-override', applied_price: '3.125' },
			{ lesson_id: 'lesson-v-default-2', student_account_id: 'student-v-default', applied_price: '21.25' },
			{ lesson_id: 'lesson-v-override-2', student_account_id: 'student-v-override', applied_price: '4.5' }
		]);

		ledger.reconcileLessonCharge({
			sessionToken,
			lessonId: 'lesson-v-default-1',
			studentAccountId: 'student-v-default',
			attendanceTransition: { from: 'present', to: 'absent' }
		});
		ledger.reconcileLessonCharge({
			sessionToken,
			lessonId: 'lesson-v-default-1',
			studentAccountId: 'student-v-default',
			attendanceTransition: { from: 'absent', to: 'present' }
		});
		const reactivated = ledger.getChargeReplay({
			sessionToken,
			classId: 'class-verifier-043',
			studentAccountId: 'student-v-default'
		});
		expect(reactivated.charges[0]).toMatchObject({
			lessonId: 'lesson-v-default-1',
			appliedPrice: '19.875',
			status: 'active'
		});
		expect(database.sqlite
			.prepare('SELECT COUNT(*) AS count FROM financial_lesson_charges')
			.get()).toEqual({ count: 4 });
	});
});
