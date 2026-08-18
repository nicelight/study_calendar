import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import {
	FinancialLedgerBoundary,
	type FinancialLessonFacts,
	type FinancialScopePort
} from '../../src/lib/server/modules/financial-ledger/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const lessonFacts = new Map<string, FinancialLessonFacts>([
	['lesson-v046-first:student-v046', {
		centerId: 'center-v046', classId: 'class-v046', lessonId: 'lesson-v046-first',
		studentAccountId: 'student-v046', lessonDate: '2026-03-05'
	}],
	['lesson-v046-second:student-v046', {
		centerId: 'center-v046', classId: 'class-v046', lessonId: 'lesson-v046-second',
		studentAccountId: 'student-v046', lessonDate: '2026-04-05'
	}]
]);

const scope: FinancialScopePort = {
	getFinancialClassScope: (actor, classId, studentAccountId) => {
		if (
			classId !== 'class-v046' ||
			!((actor.accountId === 'admin-v046' && actor.role === 'admin') ||
				(actor.accountId === 'teacher-v046' && actor.role === 'teacher'))
		) return null;
		if (studentAccountId && studentAccountId !== 'student-v046') return null;
		return { centerId: 'center-v046', classId, studentAccountIds: ['student-v046'] };
	},
	getFinancialLessonFacts: (actor, lessonId, studentAccountId) =>
		(actor.accountId === 'admin-v046' || actor.accountId === 'teacher-v046')
			? lessonFacts.get(`${lessonId}:${studentAccountId}`) ?? null
			: null
};

function createHarness(): { database: SharedDatabase; ledger: FinancialLedgerBoundary } {
	const database = new SharedDatabase({ filename: ':memory:' });
	const identityAccess = new IdentityAccessBoundary(database);
	database.sqlite.exec(`
		INSERT INTO accounts (id, role) VALUES
			('admin-v046', 'admin'), ('teacher-v046', 'teacher'),
			('student-v046', 'student'), ('admin-cross-v046', 'admin');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-v046', 'admin-v046', NULL),
			('session-teacher-v046', 'teacher-v046', NULL),
			('session-student-v046', 'student-v046', NULL),
			('session-cross-v046', 'admin-cross-v046', NULL);
	`);
	const ledger = new FinancialLedgerBoundary(database, identityAccess, scope, {
		now: () => new Date('2026-05-01T00:00:00.000Z')
	});
	return { database, ledger };
}

function seedCharges(ledger: FinancialLedgerBoundary): void {
	const sessionToken = 'session-admin-v046';
	ledger.setClassPrice({ sessionToken, classId: 'class-v046', amount: '6.75', effectiveFrom: '2026-03-01' });
	for (const lessonId of ['lesson-v046-first', 'lesson-v046-second']) {
		ledger.reconcileLessonCharge({
			sessionToken, lessonId, studentAccountId: 'student-v046',
			attendanceTransition: { from: 'absent', to: 'present' }
		});
	}
}

function countRows(database: SharedDatabase) {
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
	const admin = 'session-admin-v046';
	const teacher = 'session-teacher-v046';
	const beforeDenied = countRows(database);

	for (const request of [
		{ sessionToken: 'session-student-v046', classId: 'class-v046', studentAccountId: 'student-v046' },
		{ sessionToken: 'session-cross-v046', classId: 'class-v046', studentAccountId: 'student-v046' },
		{ sessionToken: admin, classId: 'class-elsewhere-v046', studentAccountId: 'student-v046' }
	]) {
		expect(() => ledger.createPayment({
			...request, amount: '1', factualDate: '2026-04-20', confirmation: `denied-v046-${request.classId}`
		})).toThrow('not-authorized');
	}
	expect(countRows(database)).toEqual(beforeDenied);

	const adminPayment = ledger.createPayment({
		sessionToken: admin, classId: 'class-v046', studentAccountId: 'student-v046',
		amount: '9', factualDate: '2026-04-20', confirmation: 'admin-create-v046'
	});
	const teacherPayment = ledger.createPayment({
		sessionToken: teacher, classId: 'class-v046', studentAccountId: 'student-v046',
		amount: '2.5', factualDate: '2026-04-21', confirmation: 'teacher-create-v046'
	});
	expect(() => ledger.editPayment({
		sessionToken: teacher, paymentId: adminPayment.id, change: { amount: '4.5' }, confirmation: 'teacher-edit-v046'
	})).toThrow('not-authorized');
	expect(() => ledger.cancelPayment({
		sessionToken: teacher, paymentId: adminPayment.id, confirmation: 'teacher-cancel-v046'
	})).toThrow('not-authorized');

	const edited = ledger.editPayment({
		sessionToken: admin, paymentId: adminPayment.id, change: { amount: '4.5' }, confirmation: 'admin-edit-v046'
	});
	const afterEdit = ledger.getBalanceProjection({
		sessionToken: admin, classId: 'class-v046', studentAccountId: 'student-v046'
	});
	const cancelled = ledger.cancelPayment({
		sessionToken: admin, paymentId: adminPayment.id, confirmation: 'admin-cancel-v046'
	});
	const afterCancel = ledger.getBalanceProjection({
		sessionToken: admin, classId: 'class-v046', studentAccountId: 'student-v046'
	});
	return { adminPayment, teacherPayment, edited, afterEdit, cancelled, afterCancel, counts: countRows(database) };
}

describe('TASK-046 independent payment authority verification', () => {
	let database: SharedDatabase;
	let ledger: FinancialLedgerBoundary;

	beforeEach(() => {
		({ database, ledger } = createHarness());
	});

	afterEach(() => database.close());

	it('keeps denied commands non-mutating and replays Admin corrections exactly', () => {
		const first = runScenario(database, ledger);
		const repeated = createHarness();
		try {
			expect(runScenario(repeated.database, repeated.ledger)).toEqual(first);
		} finally {
			repeated.database.close();
		}

		expect(first.afterEdit.allocations).toEqual([
			{ paymentId: first.adminPayment.id, lessonId: 'lesson-v046-first', amount: '4.5' },
			{ paymentId: first.teacherPayment.id, lessonId: 'lesson-v046-first', amount: '2.25' },
			{ paymentId: first.teacherPayment.id, lessonId: 'lesson-v046-second', amount: '0.25' }
		]);
		expect(first.cancelled).toMatchObject({ id: first.adminPayment.id, amount: '4.5', status: 'cancelled' });
		expect(first.afterCancel.allocations).toEqual([
			{ paymentId: first.teacherPayment.id, lessonId: 'lesson-v046-first', amount: '2.5' }
		]);
		expect(first.afterCancel.balance).toBe('11');
		expect(first.afterCancel.audit.map(({ action, actorAccountId }) => ({ action, actorAccountId }))).toEqual([
			{ action: 'payment-created', actorAccountId: 'admin-v046' },
			{ action: 'payment-created', actorAccountId: 'teacher-v046' },
			{ action: 'payment-edited', actorAccountId: 'admin-v046' },
			{ action: 'payment-cancelled', actorAccountId: 'admin-v046' }
		]);
		expect(first.counts).toEqual({ payments: 2, allocations: 1, commands: 4, audit: 4 });
	});
});
