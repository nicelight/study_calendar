import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CenterSchedulingBoundary } from '../../src/lib/server/modules/center-scheduling/public';
import { FinancialLedgerBoundary } from '../../src/lib/server/modules/financial-ledger/public';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

type VerifierHarness = {
	database: SharedDatabase;
	centerScheduling: CenterSchedulingBoundary;
	financialLedger: FinancialLedgerBoundary;
};

function createHarness(): VerifierHarness {
	const database = new SharedDatabase({ filename: ':memory:' });
	const identityAccess = new IdentityAccessBoundary(database, {
		now: () => new Date('2026-03-10T00:00:00.000Z')
	});
	const now = () => new Date('2026-03-10T00:00:00.000Z');
	const centerScheduling = new CenterSchedulingBoundary(
		database,
		{
			resolveActor: identityAccess.resolveActor.bind(identityAccess),
			provisionAccount: () => undefined
		},
		{ now }
	);
	const financialLedger = new FinancialLedgerBoundary(database, identityAccess, centerScheduling, { now });

	database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES
			('center-own', 'Own Center'),
			('center-other', 'Other Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-own', 'admin'),
			('admin-other', 'admin'),
			('teacher-own', 'teacher'),
			('teacher-unassigned', 'teacher'),
			('student-own', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-own', 'admin-own', NULL),
			('session-admin-other', 'admin-other', NULL),
			('session-teacher-own', 'teacher-own', NULL),
			('session-teacher-unassigned', 'teacher-unassigned', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-own', 'admin-own'),
			('center-other', 'admin-other'),
			('center-own', 'teacher-own'),
			('center-own', 'teacher-unassigned'),
			('center-own', 'student-own');
	`);

	centerScheduling.createClass({
		sessionToken: 'session-admin-own',
		centerId: 'center-own',
		classId: 'class-own',
		name: 'Own Class',
		mode: 'group'
	});
	centerScheduling.assignTeacher({
		sessionToken: 'session-admin-own',
		classId: 'class-own',
		teacherAccountId: 'teacher-own'
	});
	centerScheduling.addStudentToClass({
		sessionToken: 'session-admin-own',
		classId: 'class-own',
		studentAccountId: 'student-own'
	});
	centerScheduling.createRecurringSchedule({
		sessionToken: 'session-admin-own',
		classId: 'class-own',
		scheduleId: 'schedule-old',
		startDate: '2026-01-10',
		endDate: '2026-01-10',
		weekdays: [6]
	});
	centerScheduling.addLesson({
		sessionToken: 'session-admin-own',
		scheduleId: 'schedule-old',
		lessonId: 'lesson-newer',
		lessonDate: '2026-02-10'
	});
	centerScheduling.createRecurringSchedule({
		sessionToken: 'session-admin-own',
		classId: 'class-own',
		scheduleId: 'schedule-marker',
		startDate: '2026-02-28',
		endDate: '2026-03-02',
		weekdays: [0, 1, 6]
	});

	return { database, centerScheduling, financialLedger };
}

function seedCharges(harness: VerifierHarness): void {
	harness.financialLedger.setClassPrice({
		sessionToken: 'session-admin-own',
		classId: 'class-own',
		amount: '10.125',
		effectiveFrom: '2026-01-01'
	});
	harness.financialLedger.reconcileLessonCharge({
		sessionToken: 'session-admin-own',
		lessonId: 'schedule-old:2026-01-10',
		studentAccountId: 'student-own',
		attendanceTransition: { from: 'absent', to: 'present' }
	});
	harness.financialLedger.reconcileLessonCharge({
		sessionToken: 'session-admin-own',
		lessonId: 'lesson-newer',
		studentAccountId: 'student-own',
		attendanceTransition: { from: 'absent', to: 'present' }
	});
}

function projection(harness: VerifierHarness) {
	return harness.financialLedger.getBalanceProjection({
		sessionToken: 'session-admin-own',
		classId: 'class-own',
		studentAccountId: 'student-own'
	});
}

describe('TASK-008 verifier-owned functional probe', () => {
	let harness: VerifierHarness;

	beforeEach(() => {
		harness = createHarness();
	});

	afterEach(() => harness.database.close());

	it('proves AC-002 deterministic oldest-first decimal allocation on the real scope port', () => {
		seedCharges(harness);
		const first = harness.financialLedger.createPayment({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-own',
			amount: '15',
			factualDate: '2026-02-15',
			confirmation: 'verify-ac002-1'
		});
		const firstProjection = projection(harness);

		const replayHarness = createHarness();
		try {
			seedCharges(replayHarness);
			replayHarness.financialLedger.createPayment({
				sessionToken: 'session-admin-own',
				classId: 'class-own',
				studentAccountId: 'student-own',
				amount: '15',
				factualDate: '2026-02-15',
				confirmation: 'verify-ac002-1'
			});
			expect(projection(replayHarness)).toEqual(firstProjection);
		} finally {
			replayHarness.database.close();
		}

		expect(first.status).toBe('recorded');
		expect(firstProjection.allocations).toEqual([
			{ paymentId: first.id, lessonId: 'schedule-old:2026-01-10', amount: '10.125' },
			{ paymentId: first.id, lessonId: 'lesson-newer', amount: '4.875' }
		]);
		expect(firstProjection.balance).toBe('5.25');
	});

	it('proves AC-003 exact partial, overdue, paid, and advance state transitions', () => {
		seedCharges(harness);
		expect(projection(harness).charges.map(({ state }) => state)).toEqual(['overdue', 'overdue']);

		harness.financialLedger.createPayment({
			sessionToken: 'session-admin-own',
		classId: 'class-own',
		studentAccountId: 'student-own',
		amount: '12.345',
		factualDate: '2026-02-15',
		confirmation: 'verify-ac003-partial'
	});
		expect(projection(harness).charges).toEqual([
			{
				lessonId: 'schedule-old:2026-01-10',
				state: 'paid',
				allocatedAmount: '10.125',
				remainingAmount: '0'
			},
			{
				lessonId: 'lesson-newer',
				state: 'partially_paid',
				allocatedAmount: '2.22',
				remainingAmount: '7.905'
			}
		]);

		harness.financialLedger.createPayment({
			sessionToken: 'session-admin-own',
		classId: 'class-own',
		studentAccountId: 'student-own',
		amount: '10',
		factualDate: '2026-02-16',
		confirmation: 'verify-ac003-excess'
		});
		const afterExcess = projection(harness);
		expect(afterExcess.charges.every(({ state }) => state === 'paid')).toBe(true);
		expect(afterExcess.advance).toBe('2.095');
		expect(afterExcess.balance).toBe('-2.095');
	});

	it('proves AC-005 assigned-teacher create-only, own-center Admin correction/audit, and denial matrix', () => {
		seedCharges(harness);
		const adminPayment = harness.financialLedger.createPayment({
			sessionToken: 'session-admin-own',
		classId: 'class-own',
		studentAccountId: 'student-own',
		amount: '10',
		factualDate: '2026-02-15',
		confirmation: 'verify-ac005-admin-create'
		});
		const teacherPayment = harness.financialLedger.createPayment({
			sessionToken: 'session-teacher-own',
		classId: 'class-own',
		studentAccountId: 'student-own',
		amount: '2',
		factualDate: '2026-02-16',
		confirmation: 'verify-ac005-teacher-create'
		});

		expect(teacherPayment.createdByAccountId).toBe('teacher-own');
		expect(() => harness.financialLedger.editPayment({
			sessionToken: 'session-teacher-own',
		paymentId: adminPayment.id,
		change: { amount: '8' },
		confirmation: 'verify-ac005-teacher-edit'
		})).toThrow('not-authorized');
		expect(() => harness.financialLedger.cancelPayment({
			sessionToken: 'session-teacher-own',
		paymentId: adminPayment.id,
		confirmation: 'verify-ac005-teacher-cancel'
		})).toThrow('not-authorized');
		expect(() => harness.financialLedger.createPayment({
			sessionToken: 'session-teacher-unassigned',
		classId: 'class-own',
		studentAccountId: 'student-own',
		amount: '1',
		factualDate: '2026-02-17',
		confirmation: 'verify-ac005-unassigned-create'
		})).toThrow('not-authorized');
		expect(() => harness.financialLedger.createPayment({
			sessionToken: 'session-admin-other',
		classId: 'class-own',
		studentAccountId: 'student-own',
		amount: '1',
		factualDate: '2026-02-17',
		confirmation: 'verify-ac005-cross-center-create'
		})).toThrow('not-authorized');

		const edited = harness.financialLedger.editPayment({
			sessionToken: 'session-admin-own',
		paymentId: adminPayment.id,
		change: { amount: '8' },
		confirmation: 'verify-ac005-admin-edit'
		});
		expect(edited.amount).toBe('8');
		harness.financialLedger.cancelPayment({
			sessionToken: 'session-admin-own',
		paymentId: adminPayment.id,
		confirmation: 'verify-ac005-admin-cancel'
		});

		const after = projection(harness);
		expect(after.balance).toBe('18.25');
		expect(after.allocations).toEqual([
			{ paymentId: teacherPayment.id, lessonId: 'schedule-old:2026-01-10', amount: '2' }
		]);
		expect(after.audit).toEqual(expect.arrayContaining([
			expect.objectContaining({
				action: 'payment-edited',
				actorAccountId: 'admin-own',
				before: expect.objectContaining({ amount: '10', status: 'recorded' }),
				after: expect.objectContaining({ amount: '8', status: 'recorded' })
		}),
			expect.objectContaining({
			action: 'payment-cancelled',
			actorAccountId: 'admin-own',
			before: expect.objectContaining({ amount: '8', status: 'recorded' }),
			after: expect.objectContaining({ amount: '8', status: 'cancelled' })
		})
	]));
	});

	it('proves AC-006 factual-date marker projection across month boundary without mutation', () => {
		seedCharges(harness);
		const first = harness.financialLedger.createPayment({
			sessionToken: 'session-admin-own',
		classId: 'class-own',
		studentAccountId: 'student-own',
		amount: '1',
		factualDate: '2026-03-01',
		confirmation: 'verify-ac006-1'
		});
		harness.financialLedger.createPayment({
			sessionToken: 'session-admin-own',
		classId: 'class-own',
		studentAccountId: 'student-own',
		amount: '2',
		factualDate: '2026-03-01',
		confirmation: 'verify-ac006-2'
		});
		const before = harness.database.sqlite.prepare(`
			SELECT
				(SELECT COUNT(*) FROM financial_payments) AS payments,
				(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
				(SELECT COUNT(*) FROM financial_lesson_charges) AS charges
		`).get();

		const markers = harness.financialLedger.getPaymentMarkers({
			sessionToken: 'session-admin-own',
		classId: 'class-own',
		studentAccountId: 'student-own',
		range: { from: '2026-02-27', to: '2026-03-02' }
		});
		expect(markers).toEqual([
			{ paymentId: first.id, markerDate: '2026-02-27', factualDate: '2026-03-01', amount: '1' },
			{ paymentId: expect.any(String), markerDate: '2026-02-27', factualDate: '2026-03-01', amount: '2' }
		]);
		expect(harness.database.sqlite.prepare(`
			SELECT
				(SELECT COUNT(*) FROM financial_payments) AS payments,
				(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
				(SELECT COUNT(*) FROM financial_lesson_charges) AS charges
		`).get()).toEqual(before);
	});

	it('proves AC-007 same-confirmation idempotency and explicit new confirmation', () => {
		seedCharges(harness);
		const request = {
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-own',
			amount: '3',
			factualDate: '2026-02-15',
			confirmation: 'verify-ac007-1'
		};
		const first = harness.financialLedger.createPayment(request);
		expect(harness.financialLedger.createPayment(request)).toEqual(first);
		expect(harness.database.sqlite.prepare('SELECT COUNT(*) AS count FROM financial_payments').get()).toEqual({ count: 1 });
		const second = harness.financialLedger.createPayment({ ...request, confirmation: 'verify-ac007-2' });
		expect(second.id).not.toBe(first.id);
		expect(harness.database.sqlite.prepare('SELECT COUNT(*) AS count FROM financial_payments').get()).toEqual({ count: 2 });
	});
});
