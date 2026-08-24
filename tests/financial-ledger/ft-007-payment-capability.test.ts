import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import {
	FinancialLedgerBoundary,
	type FinancialLessonFacts,
	type FinancialScopePort
} from '../../src/lib/server/modules/financial-ledger/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const centerId = 'center-ft-007-payment';
const classId = 'class-ft-007-payment';
const students = [
	'student-no-payment',
	'student-on-time',
	'student-overdue',
	'student-equal-date',
	'student-mixed',
	'student-advance'
];

function snapshotFinancialState(database: SharedDatabase): string {
	const tables = [
		'financial_price_settings',
		'financial_lesson_charges',
		'financial_payments',
		'financial_payment_commands',
		'financial_payment_allocations',
		'financial_audit_records',
		'financial_payment_audit_records'
	];
	return JSON.stringify(
		Object.fromEntries(
			tables.map((table) => [
				table,
				database.sqlite.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()
			])
		)
	);
}

describe('TASK-090 factual payment capability projection', () => {
	let database: SharedDatabase;
	let ledger: FinancialLedgerBoundary;
	let lessonFacts: Map<string, FinancialLessonFacts>;
	let teacherAssigned: boolean;
	let classScopeCalls: Array<{ actorAccountId: string; studentAccountId?: string }>;
	let lessonFactCalls: Array<{ actorAccountId: string; lessonId: string; studentAccountId: string }>;

	beforeEach(() => {
		database = new SharedDatabase({ filename: ':memory:' });
		const identityAccess = new IdentityAccessBoundary(database);
		database.sqlite.exec(`
			INSERT INTO accounts (id, role) VALUES
				('admin-ft-007-payment', 'admin'),
				('teacher-ft-007-payment', 'teacher'),
				('student-ft-007-payment', 'student'),
				('parent-ft-007-payment', 'parent'),
				('revoked-ft-007-payment', 'admin');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('session-admin-ft-007-payment', 'admin-ft-007-payment', NULL),
				('session-teacher-ft-007-payment', 'teacher-ft-007-payment', NULL),
				('session-student-ft-007-payment', 'student-ft-007-payment', NULL),
				('session-parent-ft-007-payment', 'parent-ft-007-payment', NULL),
				('session-revoked-ft-007-payment', 'revoked-ft-007-payment', '2026-08-01T00:00:00.000Z');
		`);

		lessonFacts = new Map();
		teacherAssigned = true;
		classScopeCalls = [];
		lessonFactCalls = [];
		const scope: FinancialScopePort = {
			getFinancialClassScope: (actor, requestedClassId, studentAccountId) => {
				classScopeCalls.push({ actorAccountId: actor.accountId, studentAccountId });
				const actorPermitted =
					(actor.role === 'admin' && actor.accountId === 'admin-ft-007-payment') ||
					(actor.role === 'teacher' &&
						actor.accountId === 'teacher-ft-007-payment' &&
						teacherAssigned);
				if (
					!actorPermitted ||
					requestedClassId !== classId ||
					(studentAccountId !== undefined && !students.includes(studentAccountId))
				) {
					return null;
				}
				return { centerId, classId, studentAccountIds: students };
			},
			getFinancialLessonFacts: (actor, lessonId, studentAccountId) => {
				lessonFactCalls.push({ actorAccountId: actor.accountId, lessonId, studentAccountId });
				const actorPermitted =
					(actor.role === 'admin' && actor.accountId === 'admin-ft-007-payment') ||
					(actor.role === 'teacher' &&
						actor.accountId === 'teacher-ft-007-payment' &&
						teacherAssigned);
				return actorPermitted
					? lessonFacts.get(`${lessonId}:${studentAccountId}`) ?? null
					: null;
			}
		};
		ledger = new FinancialLedgerBoundary(database, identityAccess, scope, {
			now: () => new Date('2026-12-01T00:00:00.000Z')
		});
		ledger.setClassPrice({
			sessionToken: 'session-admin-ft-007-payment',
			classId,
			amount: '10',
			effectiveFrom: '2026-01-01'
		});
	});

	afterEach(() => database.close());

	function addCharge(studentAccountId: string, lessonId: string, lessonDate: string): void {
		lessonFacts.set(`${lessonId}:${studentAccountId}`, {
			centerId,
			classId,
			lessonId,
			studentAccountId,
			lessonDate
		});
		ledger.reconcileLessonCharge({
			sessionToken: 'session-admin-ft-007-payment',
			lessonId,
			studentAccountId,
			attendanceTransition: { from: 'absent', to: 'present' }
		});
	}

	function addPayment(
		studentAccountId: string,
		amount: string,
		factualDate: string,
		confirmation: string
	): void {
		ledger.createPayment({
			sessionToken: 'session-admin-ft-007-payment',
			classId,
			studentAccountId,
			amount,
			factualDate,
			confirmation
		});
	}

	it('uses counted allocations and current lesson facts for 0/100/mixed/overdue/equal/advance cases without mutation', () => {
		addCharge('student-no-payment', 'lesson-no-payment', '2026-01-10');

		addCharge('student-on-time', 'lesson-on-time', '2026-02-10');
		addPayment('student-on-time', '20', '2026-02-01', 'payment-on-time');

		addCharge('student-overdue', 'lesson-overdue', '2026-03-10');
		addPayment('student-overdue', '10', '2026-03-11', 'payment-overdue');

		addCharge('student-equal-date', 'lesson-equal-date', '2026-04-10');
		addPayment('student-equal-date', '10', '2026-04-05', 'payment-equal-date');
		lessonFacts.set('lesson-equal-date:student-equal-date', {
			centerId,
			classId,
			lessonId: 'lesson-equal-date',
			studentAccountId: 'student-equal-date',
			lessonDate: '2026-04-05'
		});

		addCharge('student-mixed', 'lesson-mixed-on-time', '2026-05-10');
		addCharge('student-mixed', 'lesson-mixed-equal', '2026-06-10');
		addPayment('student-mixed', '10', '2026-05-01', 'payment-mixed-on-time');
		addPayment('student-mixed', '10', '2026-06-10', 'payment-mixed-equal');

		addPayment('student-advance', '15', '2026-07-01', 'payment-advance-only');

		classScopeCalls = [];
		lessonFactCalls = [];
		const before = snapshotFinancialState(database);
		const capability = (studentAccountId: string) =>
			ledger.getPaymentCapability({
				sessionToken: 'session-admin-ft-007-payment',
				classId,
				studentAccountId
			});

		expect(capability('student-no-payment')).toBe(0);
		expect(capability('student-on-time')).toBe(100);
		expect(capability('student-overdue')).toBe(0);
		expect(capability('student-equal-date')).toBe(0);
		expect(capability('student-mixed')).toBe(50);
		expect(capability('student-advance')).toBe(0);
		expect(snapshotFinancialState(database)).toBe(before);

		expect(classScopeCalls).toHaveLength(6);
		expect(classScopeCalls.every(({ actorAccountId }) => actorAccountId === 'admin-ft-007-payment')).toBe(true);
		expect(lessonFactCalls.map(({ lessonId }) => lessonId)).toEqual([
			'lesson-on-time',
			'lesson-overdue',
			'lesson-equal-date',
			'lesson-mixed-on-time',
			'lesson-mixed-equal'
		]);
	});

	it('enforces current Actor Context and Financial Scope for Admin/Teacher while denying revoked and out-of-scope actors', () => {
		addCharge('student-on-time', 'lesson-authorized', '2026-08-10');
		addPayment('student-on-time', '10', '2026-08-01', 'payment-authorized');
		const before = snapshotFinancialState(database);

		expect(
			ledger.getPaymentCapability({
				sessionToken: 'session-admin-ft-007-payment',
				classId,
				studentAccountId: 'student-on-time'
			})
		).toBe(100);
		expect(
			ledger.getPaymentCapability({
				sessionToken: 'session-teacher-ft-007-payment',
				classId,
				studentAccountId: 'student-on-time'
			})
		).toBe(100);

		for (const sessionToken of [
			undefined,
			'session-revoked-ft-007-payment',
			'session-student-ft-007-payment',
			'session-parent-ft-007-payment'
		]) {
			expect(() =>
				ledger.getPaymentCapability({ sessionToken, classId, studentAccountId: 'student-on-time' })
			).toThrow('not-authorized');
		}
		expect(() =>
			ledger.getPaymentCapability({
				sessionToken: 'session-admin-ft-007-payment',
				classId: 'class-outside-ft-007-payment',
				studentAccountId: 'student-on-time'
			})
		).toThrow('not-authorized');
		expect(() =>
			ledger.getPaymentCapability({
				sessionToken: 'session-admin-ft-007-payment',
				classId,
				studentAccountId: 'student-outside-ft-007-payment'
			})
		).toThrow('not-authorized');

		teacherAssigned = false;
		expect(() =>
			ledger.getPaymentCapability({
				sessionToken: 'session-teacher-ft-007-payment',
				classId,
				studentAccountId: 'student-on-time'
			})
		).toThrow('not-authorized');
		expect(snapshotFinancialState(database)).toBe(before);
	});
});
