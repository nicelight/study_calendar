import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import {
	FinancialLedgerBoundary,
	type FinancialLessonFacts,
	type FinancialScopePort
} from '../../src/lib/server/modules/financial-ledger/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const lessonFacts = new Map<string, FinancialLessonFacts>([
	['lesson-authority-046-old:student-authority-046', {
		centerId: 'center-authority-046', classId: 'class-authority-046',
		lessonId: 'lesson-authority-046-old', studentAccountId: 'student-authority-046',
		lessonDate: '2026-01-10'
	}],
	['lesson-authority-046-new:student-authority-046', {
		centerId: 'center-authority-046', classId: 'class-authority-046',
		lessonId: 'lesson-authority-046-new', studentAccountId: 'student-authority-046',
		lessonDate: '2026-02-10'
	}]
]);

const scope: FinancialScopePort = {
	getFinancialClassScope: (actor, classId, studentAccountId) => {
		const permitted =
			(classId === 'class-authority-046' &&
				((actor.accountId === 'admin-authority-046' && actor.role === 'admin') ||
					(actor.accountId === 'teacher-authority-046' && actor.role === 'teacher')));
		if (!permitted) return null;
		if (studentAccountId && studentAccountId !== 'student-authority-046') return null;
		return {
			centerId: 'center-authority-046', classId,
			studentAccountIds: ['student-authority-046']
		};
	},
	getFinancialLessonFacts: (actor, lessonId, studentAccountId) =>
		(actor.accountId === 'admin-authority-046' || actor.accountId === 'teacher-authority-046') &&
			actor.role !== 'student'
			? lessonFacts.get(`${lessonId}:${studentAccountId}`) ?? null
			: null
};

function createHarness(): { database: SharedDatabase; ledger: FinancialLedgerBoundary } {
	const database = new SharedDatabase({ filename: ':memory:' });
	const identityAccess = new IdentityAccessBoundary(database);
	database.sqlite.exec(`
		INSERT INTO accounts (id, role) VALUES
			('admin-authority-046', 'admin'),
			('teacher-authority-046', 'teacher'),
			('student-authority-046', 'student'),
			('admin-outsider-046', 'admin');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-authority-046', 'admin-authority-046', NULL),
			('session-teacher-authority-046', 'teacher-authority-046', NULL),
			('session-student-authority-046', 'student-authority-046', NULL),
			('session-admin-outsider-046', 'admin-outsider-046', NULL);
	`);
	const ledger = new FinancialLedgerBoundary(database, identityAccess, scope, {
		now: () => new Date('2026-03-01T00:00:00.000Z')
	});
	return { database, ledger };
}

function seedCharges(ledger: FinancialLedgerBoundary): void {
	const sessionToken = 'session-admin-authority-046';
	ledger.setClassPrice({
		sessionToken, classId: 'class-authority-046', amount: '10', effectiveFrom: '2026-01-01'
	});
	for (const lessonId of ['lesson-authority-046-old', 'lesson-authority-046-new']) {
		ledger.reconcileLessonCharge({
			sessionToken, lessonId, studentAccountId: 'student-authority-046',
			attendanceTransition: { from: 'absent', to: 'present' }
		});
	}
}

function counts(database: SharedDatabase) {
	return database.sqlite.prepare(`
		SELECT
			(SELECT COUNT(*) FROM financial_payments) AS payments,
			(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
			(SELECT COUNT(*) FROM financial_payment_commands) AS commands,
			(SELECT COUNT(*) FROM financial_payment_audit_records) AS audit
	`).get();
}

function runScenario(database: SharedDatabase, ledger: FinancialLedgerBoundary) {
	seedCharges(ledger);
	const admin = 'session-admin-authority-046';
	const teacher = 'session-teacher-authority-046';
	const beforeDenied = counts(database);

	for (const sessionToken of [undefined, 'session-student-authority-046', 'session-admin-outsider-046']) {
		expect(() => ledger.createPayment({
			sessionToken, classId: 'class-authority-046', studentAccountId: 'student-authority-046',
			amount: '1', factualDate: '2026-02-15', confirmation: `denied-${sessionToken ?? 'anonymous'}-046`
		})).toThrow('not-authorized');
	}
	expect(() => ledger.createPayment({
		sessionToken: admin, classId: 'class-outside-046', studentAccountId: 'student-authority-046',
		amount: '1', factualDate: '2026-02-15', confirmation: 'denied-class-046'
	})).toThrow('not-authorized');
	expect(counts(database)).toEqual(beforeDenied);

	const adminPayment = ledger.createPayment({
		sessionToken: admin, classId: 'class-authority-046', studentAccountId: 'student-authority-046',
		amount: '12', factualDate: '2026-02-15', confirmation: 'admin-create-046'
	});
	const teacherPayment = ledger.createPayment({
		sessionToken: teacher, classId: 'class-authority-046', studentAccountId: 'student-authority-046',
		amount: '3', factualDate: '2026-02-16', confirmation: 'teacher-create-046'
	});
	expect(() => ledger.editPayment({
		sessionToken: teacher, paymentId: adminPayment.id, change: { amount: '8' }, confirmation: 'teacher-edit-046'
	})).toThrow('not-authorized');
	expect(() => ledger.cancelPayment({
		sessionToken: teacher, paymentId: adminPayment.id, confirmation: 'teacher-cancel-046'
	})).toThrow('not-authorized');

	const edited = ledger.editPayment({
		sessionToken: admin, paymentId: adminPayment.id, change: { amount: '8' }, confirmation: 'admin-edit-046'
	});
	const afterEdit = ledger.getBalanceProjection({
		sessionToken: admin, classId: 'class-authority-046', studentAccountId: 'student-authority-046'
	});
	const cancelled = ledger.cancelPayment({
		sessionToken: admin, paymentId: adminPayment.id, confirmation: 'admin-cancel-046'
	});
	const afterCancel = ledger.getBalanceProjection({
		sessionToken: admin, classId: 'class-authority-046', studentAccountId: 'student-authority-046'
	});

	return {
		adminPayment, teacherPayment, edited, afterEdit, cancelled, afterCancel,
		counts: counts(database)
	};
}

describe('TASK-046 payment authority and Admin replay', () => {
	let database: SharedDatabase;
	let ledger: FinancialLedgerBoundary;

	beforeEach(() => {
		({ database, ledger } = createHarness());
	});

	afterEach(() => database.close());

	it('enforces actor/scope authority and deterministically audits edit/cancel replay', () => {
		const first = runScenario(database, ledger);
		const repeated = createHarness();
		try {
			expect(runScenario(repeated.database, repeated.ledger)).toEqual(first);
		} finally {
			repeated.database.close();
		}

		expect(first.adminPayment).toMatchObject({ amount: '12', status: 'recorded', createdByAccountId: 'admin-authority-046' });
		expect(first.teacherPayment).toMatchObject({ amount: '3', status: 'recorded', createdByAccountId: 'teacher-authority-046' });
		expect(first.edited).toMatchObject({ id: first.adminPayment.id, amount: '8', status: 'recorded' });
		expect(first.afterEdit.allocations).toEqual([
		{ paymentId: first.adminPayment.id, lessonId: 'lesson-authority-046-old', amount: '8' },
		{ paymentId: first.teacherPayment.id, lessonId: 'lesson-authority-046-old', amount: '2' },
		{ paymentId: first.teacherPayment.id, lessonId: 'lesson-authority-046-new', amount: '1' }
	]);
		expect(first.cancelled).toMatchObject({ id: first.adminPayment.id, status: 'cancelled' });
		expect(first.afterCancel.allocations).toEqual([
		{ paymentId: first.teacherPayment.id, lessonId: 'lesson-authority-046-old', amount: '3' }
	]);
		expect(first.afterCancel.balance).toBe('17');
		expect(first.afterCancel.audit.map(({ action, actorAccountId }) => ({ action, actorAccountId }))).toEqual([
		{ action: 'payment-created', actorAccountId: 'admin-authority-046' },
		{ action: 'payment-created', actorAccountId: 'teacher-authority-046' },
		{ action: 'payment-edited', actorAccountId: 'admin-authority-046' },
		{ action: 'payment-cancelled', actorAccountId: 'admin-authority-046' }
	]);
		expect(first.counts).toEqual({ payments: 2, allocations: 1, commands: 4, audit: 4 });
	});
});
