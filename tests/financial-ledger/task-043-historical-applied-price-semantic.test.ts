import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import {
	FinancialLedgerBoundary,
	type FinancialLessonFacts,
	type FinancialScopePort
} from '../../src/lib/server/modules/financial-ledger/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const lessonFacts = new Map<string, FinancialLessonFacts>([
	['lesson-semantic-before:student-semantic', {
		centerId: 'center-semantic-043', classId: 'class-semantic-043',
		lessonId: 'lesson-semantic-before', studentAccountId: 'student-semantic',
		lessonDate: '2026-07-10'
	}],
	['lesson-semantic-after:student-semantic', {
		centerId: 'center-semantic-043', classId: 'class-semantic-043',
		lessonId: 'lesson-semantic-after', studentAccountId: 'student-semantic',
		lessonDate: '2026-08-10'
	}]
]);

const scope: FinancialScopePort = {
	getFinancialClassScope: (actor, classId, studentAccountId) => {
		if (actor.role !== 'admin' || classId !== 'class-semantic-043') {
			return null;
		}
		if (studentAccountId && studentAccountId !== 'student-semantic') {
			return null;
		}
		return { centerId: 'center-semantic-043', classId, studentAccountIds: ['student-semantic'] };
	},
	getFinancialLessonFacts: (actor, lessonId, studentAccountId) =>
		actor.role === 'admin' ? lessonFacts.get(`${lessonId}:${studentAccountId}`) ?? null : null
};

describe('TASK-043 semantic price boundary checks', () => {
	let database: SharedDatabase;
	let ledger: FinancialLedgerBoundary;

	beforeEach(() => {
		database = new SharedDatabase({ filename: ':memory:' });
		const identityAccess = new IdentityAccessBoundary(database);
		database.sqlite.exec(`
			INSERT INTO accounts (id, role) VALUES
				('admin-semantic-043', 'admin'),
				('student-semantic-043', 'student');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('session-admin-semantic-043', 'admin-semantic-043', NULL),
				('session-student-semantic-043', 'student-semantic-043', NULL);
		`);
		ledger = new FinancialLedgerBoundary(database, identityAccess, scope, {
			now: () => new Date('2026-09-01T00:00:00.000Z')
		});
	});

	afterEach(() => database.close());

	it('does not let actor or temporal-boundary mistakes rewrite historical prices', () => {
		const admin = 'session-admin-semantic-043';
		const student = 'session-student-semantic-043';
		ledger.setClassPrice({
			sessionToken: admin,
			classId: 'class-semantic-043',
			amount: '30.40',
			effectiveFrom: '2026-07-01'
		});
		ledger.setClassPrice({
			sessionToken: admin,
			classId: 'class-semantic-043',
			amount: '31.50',
			effectiveFrom: '2026-08-01'
		});
		ledger.setStudentPriceOverride({
			sessionToken: admin,
			classId: 'class-semantic-043',
			studentAccountId: 'student-semantic',
			amount: '29.75',
			effectiveFrom: '2026-08-01'
		});

		ledger.reconcileLessonCharge({
			sessionToken: admin,
			lessonId: 'lesson-semantic-before',
			studentAccountId: 'student-semantic',
			attendanceTransition: { from: 'absent', to: 'present' }
		});
		ledger.reconcileLessonCharge({
			sessionToken: admin,
			lessonId: 'lesson-semantic-after',
			studentAccountId: 'student-semantic',
			attendanceTransition: { from: 'absent', to: 'present' }
		});

		expect(() => ledger.setClassPrice({
			sessionToken: student,
			classId: 'class-semantic-043',
			amount: '999',
			effectiveFrom: '2026-09-01'
		})).toThrow('not-authorized');
		expect(() => ledger.reconcileLessonCharge({
			sessionToken: admin,
			lessonId: 'lesson-not-in-scope',
			studentAccountId: 'student-semantic',
			attendanceTransition: { from: 'absent', to: 'present' }
		})).toThrow('not-authorized');

		expect(ledger.getChargeReplay({
			sessionToken: admin,
			classId: 'class-semantic-043',
			studentAccountId: 'student-semantic'
		}).charges.map((charge) => charge.appliedPrice)).toEqual(['30.4', '29.75']);
		expect(database.sqlite
			.prepare('SELECT COUNT(*) AS count FROM financial_price_settings')
			.get()).toEqual({ count: 3 });
		expect(database.sqlite
			.prepare('SELECT COUNT(*) AS count FROM financial_lesson_charges')
			.get()).toEqual({ count: 2 });
	});
});
