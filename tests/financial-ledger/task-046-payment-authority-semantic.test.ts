import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import {
	FinancialLedgerBoundary,
	type FinancialLessonFacts,
	type FinancialScopePort
} from '../../src/lib/server/modules/financial-ledger/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const lesson: FinancialLessonFacts = {
	centerId: 'center-semantic-046', classId: 'class-semantic-046',
	lessonId: 'lesson-semantic-046', studentAccountId: 'student-semantic-046',
	lessonDate: '2026-04-10'
};

const scope: FinancialScopePort = {
	getFinancialClassScope: (actor, classId, studentAccountId) => {
		if (
			classId !== 'class-semantic-046' ||
			!((actor.accountId === 'admin-semantic-046' && actor.role === 'admin') ||
				(actor.accountId === 'teacher-semantic-046' && actor.role === 'teacher'))
		) return null;
		if (studentAccountId && studentAccountId !== 'student-semantic-046') return null;
		return { centerId: 'center-semantic-046', classId, studentAccountIds: ['student-semantic-046'] };
	},
	getFinancialLessonFacts: (actor, lessonId, studentAccountId) =>
		actor.accountId === 'admin-semantic-046' && lessonId === lesson.lessonId && studentAccountId === lesson.studentAccountId
			? lesson
			: null
};

function createHarness(): { database: SharedDatabase; ledger: FinancialLedgerBoundary } {
	const database = new SharedDatabase({ filename: ':memory:' });
	const identityAccess = new IdentityAccessBoundary(database);
	database.sqlite.exec(`
		INSERT INTO accounts (id, role) VALUES
			('admin-semantic-046', 'admin'), ('teacher-semantic-046', 'teacher'),
			('admin-outsider-semantic-046', 'admin');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-semantic-046', 'admin-semantic-046', NULL),
			('session-teacher-semantic-046', 'teacher-semantic-046', NULL),
			('session-outsider-semantic-046', 'admin-outsider-semantic-046', NULL);
	`);
	return {
		database,
		ledger: new FinancialLedgerBoundary(database, identityAccess, scope, {
			now: () => new Date('2026-05-01T00:00:00.000Z')
		})
	};
}

describe('TASK-046 semantic authority and audit checks', () => {
	let database: SharedDatabase;
	let ledger: FinancialLedgerBoundary;

	beforeEach(() => {
		({ database, ledger } = createHarness());
	});

	afterEach(() => database.close());

	it('rejects forged scope mutations before financial/audit writes and preserves audit snapshots', () => {
		const admin = 'session-admin-semantic-046';
		ledger.setClassPrice({ sessionToken: admin, classId: lesson.classId, amount: '5.50', effectiveFrom: '2026-04-01' });
		ledger.reconcileLessonCharge({
			sessionToken: admin, lessonId: lesson.lessonId, studentAccountId: lesson.studentAccountId,
			attendanceTransition: { from: 'absent', to: 'present' }
		});
		const payment = ledger.createPayment({
			sessionToken: admin, classId: lesson.classId, studentAccountId: lesson.studentAccountId,
			amount: '7', factualDate: '2026-04-20', confirmation: 'create-semantic-046'
		});
		const before = ledger.getBalanceProjection({
			sessionToken: admin, classId: lesson.classId, studentAccountId: lesson.studentAccountId
		});
		const countsBefore = database.sqlite.prepare(`
			SELECT
				(SELECT COUNT(*) FROM financial_payments) AS payments,
				(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
				(SELECT COUNT(*) FROM financial_payment_commands) AS commands,
				(SELECT COUNT(*) FROM financial_payment_audit_records) AS audit
		`).get();

		for (const request of [
			{ sessionToken: 'session-outsider-semantic-046', confirmation: 'outsider-edit-semantic-046' },
			{ sessionToken: 'session-teacher-semantic-046', confirmation: 'teacher-edit-semantic-046' }
		]) {
			expect(() => ledger.editPayment({
				sessionToken: request.sessionToken, paymentId: payment.id,
				change: { amount: '1' }, confirmation: request.confirmation
			})).toThrow('not-authorized');
		}
		for (const request of [
			{ sessionToken: 'session-outsider-semantic-046', confirmation: 'outsider-cancel-semantic-046' },
			{ sessionToken: 'session-teacher-semantic-046', confirmation: 'teacher-cancel-semantic-046' }
		]) {
			expect(() => ledger.cancelPayment({
				sessionToken: request.sessionToken, paymentId: payment.id, confirmation: request.confirmation
			})).toThrow('not-authorized');
		}
		expect(ledger.getBalanceProjection({
			sessionToken: admin, classId: lesson.classId, studentAccountId: lesson.studentAccountId
		})).toEqual(before);
		expect(database.sqlite.prepare(`
			SELECT
				(SELECT COUNT(*) FROM financial_payments) AS payments,
				(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
				(SELECT COUNT(*) FROM financial_payment_commands) AS commands,
				(SELECT COUNT(*) FROM financial_payment_audit_records) AS audit
		`).get()).toEqual(countsBefore);

		const edited = ledger.editPayment({
			sessionToken: admin, paymentId: payment.id, change: { amount: '3' }, confirmation: 'edit-semantic-046'
		});
		expect(edited.amount).toBe('3');
		const editedAudit = ledger.getBalanceProjection({
			sessionToken: admin, classId: lesson.classId, studentAccountId: lesson.studentAccountId
		}).audit.at(-1);
		expect(editedAudit).toMatchObject({
			action: 'payment-edited', actorAccountId: 'admin-semantic-046',
			before: { id: payment.id, amount: '7', status: 'recorded' },
			after: { id: payment.id, amount: '3', status: 'recorded' }
		});
	});
});
