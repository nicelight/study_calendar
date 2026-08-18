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
		'lesson-default-before:student-default',
		{
			centerId: 'center-task-043',
			classId: 'class-task-043',
			lessonId: 'lesson-default-before',
			studentAccountId: 'student-default',
			lessonDate: '2026-03-10'
		}
	],
	[
		'lesson-override-before:student-override',
		{
			centerId: 'center-task-043',
			classId: 'class-task-043',
			lessonId: 'lesson-override-before',
			studentAccountId: 'student-override',
			lessonDate: '2026-03-10'
		}
	],
	[
		'lesson-default-after:student-default',
		{
			centerId: 'center-task-043',
			classId: 'class-task-043',
			lessonId: 'lesson-default-after',
			studentAccountId: 'student-default',
			lessonDate: '2026-04-10'
		}
	],
	[
		'lesson-override-after:student-override',
		{
			centerId: 'center-task-043',
			classId: 'class-task-043',
			lessonId: 'lesson-override-after',
			studentAccountId: 'student-override',
			lessonDate: '2026-04-10'
		}
	]
]);

const scope: FinancialScopePort = {
	getFinancialClassScope: (actor, classId, studentAccountId) => {
		if (actor.role !== 'admin' || classId !== 'class-task-043') {
			return null;
		}
		const studentAccountIds = ['student-default', 'student-override'];
		if (studentAccountId && !studentAccountIds.includes(studentAccountId)) {
			return null;
		}
		return { centerId: 'center-task-043', classId, studentAccountIds };
	},
	getFinancialLessonFacts: (actor, lessonId, studentAccountId) => {
		if (actor.role !== 'admin') {
			return null;
		}
		return lessonFacts.get(`${lessonId}:${studentAccountId}`) ?? null;
	}
};

describe('TASK-043 historical applied price', () => {
	let database: SharedDatabase;
	let ledger: FinancialLedgerBoundary;

	beforeEach(() => {
		database = new SharedDatabase({ filename: ':memory:' });
		const identityAccess = new IdentityAccessBoundary(database);
		database.sqlite.exec(`
			INSERT INTO accounts (id, role) VALUES ('admin-task-043', 'admin');
			INSERT INTO sessions (token, account_id, revoked_at)
			VALUES ('session-task-043', 'admin-task-043', NULL);
		`);
		let tick = 0;
		ledger = new FinancialLedgerBoundary(database, identityAccess, scope, {
			now: () => new Date(Date.UTC(2026, 4, 1, 0, 0, tick++))
		});
	});

	afterEach(() => database.close());

	it('keeps exact historical default and override prices while later settings apply only to future charges', () => {
		ledger.setClassPrice({
			sessionToken: 'session-task-043',
			classId: 'class-task-043',
			amount: '10.1250',
			effectiveFrom: '2026-03-01'
		});
		ledger.setStudentPriceOverride({
			sessionToken: 'session-task-043',
			classId: 'class-task-043',
			studentAccountId: 'student-override',
			amount: '7.500',
			effectiveFrom: '2026-03-01'
		});

		const addCharge = (lessonId: string, studentAccountId: string) =>
			ledger.reconcileLessonCharge({
				sessionToken: 'session-task-043',
				lessonId,
				studentAccountId,
				attendanceTransition: { from: 'absent', to: 'present' }
			});

		addCharge('lesson-default-before', 'student-default');
		addCharge('lesson-override-before', 'student-override');

		ledger.setClassPrice({
			sessionToken: 'session-task-043',
			classId: 'class-task-043',
			amount: '12.34',
			effectiveFrom: '2026-04-01'
		});
		ledger.setStudentPriceOverride({
			sessionToken: 'session-task-043',
			classId: 'class-task-043',
			studentAccountId: 'student-override',
			amount: '8.75',
			effectiveFrom: '2026-04-01'
		});

		const beforeDefault = ledger.getChargeReplay({
			sessionToken: 'session-task-043',
			classId: 'class-task-043',
			studentAccountId: 'student-default'
		});
		const beforeOverride = ledger.getChargeReplay({
			sessionToken: 'session-task-043',
			classId: 'class-task-043',
			studentAccountId: 'student-override'
		});
		expect(beforeDefault.charges.map((charge) => charge.appliedPrice)).toEqual(['10.125']);
		expect(beforeOverride.charges.map((charge) => charge.appliedPrice)).toEqual(['7.5']);

		addCharge('lesson-default-after', 'student-default');
		addCharge('lesson-override-after', 'student-override');

		expect(
			ledger
				.getChargeReplay({
					sessionToken: 'session-task-043',
					classId: 'class-task-043',
					studentAccountId: 'student-default'
				})
				.charges.map((charge) => charge.appliedPrice)
		).toEqual(['10.125', '12.34']);
		expect(
			ledger
				.getChargeReplay({
					sessionToken: 'session-task-043',
					classId: 'class-task-043',
					studentAccountId: 'student-override'
				})
				.charges.map((charge) => charge.appliedPrice)
		).toEqual(['7.5', '8.75']);
		expect(
			database.sqlite
				.prepare(
					`SELECT lesson_id, student_account_id, applied_price
					 FROM financial_lesson_charges
					 ORDER BY lesson_id, student_account_id`
				)
				.all()
		).toEqual([
			{ lesson_id: 'lesson-default-after', student_account_id: 'student-default', applied_price: '12.34' },
			{ lesson_id: 'lesson-default-before', student_account_id: 'student-default', applied_price: '10.125' },
			{ lesson_id: 'lesson-override-after', student_account_id: 'student-override', applied_price: '8.75' },
			{ lesson_id: 'lesson-override-before', student_account_id: 'student-override', applied_price: '7.5' }
		]);

		const rerun = ledger.reconcileLessonCharge({
			sessionToken: 'session-task-043',
			lessonId: 'lesson-default-before',
			studentAccountId: 'student-default',
			attendanceTransition: { from: 'present', to: 'present' }
		});
		expect(rerun.charges.map((charge) => charge.appliedPrice)).toEqual(['10.125', '12.34']);
	});
});
