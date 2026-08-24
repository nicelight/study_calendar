import fs from 'node:fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import {
	FinancialLedgerBoundary,
	type FinancialLessonFacts,
	type FinancialScopePort
} from '../../src/lib/server/modules/financial-ledger/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const centerId = 'verify-center';
const classId = 'verify-class';
const students = [
	'verify-none',
	'verify-mixed',
	'verify-overdue',
	'verify-unallocated',
	'verify-cancelled-payment',
	'verify-cancelled-charge'
];

function financialState(database: SharedDatabase): Record<string, unknown[]> {
	const tables = [
		'financial_price_settings',
		'financial_lesson_charges',
		'financial_payments',
		'financial_payment_commands',
		'financial_payment_allocations',
		'financial_audit_records',
		'financial_payment_audit_records'
	];
	return Object.fromEntries(
		tables.map((table) => [
			table,
			database.sqlite.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()
		])
	);
}

describe('fresh verifier-owned proof: TASK-090-T3-FT-007-W29', () => {
	let database: SharedDatabase;
	let ledger: FinancialLedgerBoundary;
	let lessonFacts: Map<string, FinancialLessonFacts>;
	let teacherAssigned: boolean;
	let classScopeCalls: Array<{ actor: string; classId: string; student?: string }>;
	let lessonFactCalls: Array<{ actor: string; lessonId: string; student: string }>;

	beforeEach(() => {
		database = new SharedDatabase({ filename: ':memory:' });
		const identityAccess = new IdentityAccessBoundary(database);
		database.sqlite.exec(`
			INSERT INTO accounts (id, role) VALUES
				('verify-admin', 'admin'),
				('verify-teacher', 'teacher'),
				('verify-student-actor', 'student'),
				('verify-parent', 'parent'),
				('verify-revoked', 'admin');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('verify-admin-session', 'verify-admin', NULL),
				('verify-teacher-session', 'verify-teacher', NULL),
				('verify-student-session', 'verify-student-actor', NULL),
				('verify-parent-session', 'verify-parent', NULL),
				('verify-revoked-session', 'verify-revoked', '2026-08-01T00:00:00.000Z');
		`);

		lessonFacts = new Map();
		teacherAssigned = true;
		classScopeCalls = [];
		lessonFactCalls = [];
		const scope: FinancialScopePort = {
			getFinancialClassScope: (actor, requestedClassId, studentAccountId) => {
				classScopeCalls.push({
					actor: actor.accountId,
					classId: requestedClassId,
					student: studentAccountId
				});
				const permitted =
					actor.accountId === 'verify-admin' ||
					(actor.accountId === 'verify-teacher' && teacherAssigned);
				if (
					!permitted ||
					requestedClassId !== classId ||
					(studentAccountId !== undefined && !students.includes(studentAccountId))
				) {
					return null;
				}
				return { centerId, classId, studentAccountIds: students };
			},
			getFinancialLessonFacts: (actor, lessonId, studentAccountId) => {
				lessonFactCalls.push({ actor: actor.accountId, lessonId, student: studentAccountId });
				if (
					actor.accountId !== 'verify-admin' &&
					!(actor.accountId === 'verify-teacher' && teacherAssigned)
				) {
					return null;
				}
				return lessonFacts.get(`${lessonId}:${studentAccountId}`) ?? null;
			}
		};
		ledger = new FinancialLedgerBoundary(database, identityAccess, scope, {
			now: () => new Date('2026-12-31T00:00:00.000Z')
		});
		ledger.setClassPrice({
			sessionToken: 'verify-admin-session',
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
			sessionToken: 'verify-admin-session',
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
	): string {
		return ledger.createPayment({
			sessionToken: 'verify-admin-session',
			classId,
			studentAccountId,
			amount,
			factualDate,
			confirmation
		}).id;
	}

	it('proves counted-allocation semantics, current actual dates, exclusions, and state preservation', () => {
		addCharge('verify-none', 'verify-none-lesson', '2026-01-10');

		addCharge('verify-mixed', 'verify-mixed-first', '2026-02-10');
		addCharge('verify-mixed', 'verify-mixed-second', '2026-02-20');
		addPayment('verify-mixed', '25', '2026-02-01', 'verify-mixed-payment');
		lessonFacts.set('verify-mixed-second:verify-mixed', {
			centerId,
			classId,
			lessonId: 'verify-mixed-second',
			studentAccountId: 'verify-mixed',
			lessonDate: '2026-02-01'
		});

		addCharge('verify-overdue', 'verify-overdue-lesson', '2026-03-10');
		addPayment('verify-overdue', '10', '2026-03-11', 'verify-overdue-payment');

		addPayment('verify-unallocated', '30', '2026-04-01', 'verify-unallocated-payment');

		addCharge('verify-cancelled-payment', 'verify-cancelled-payment-lesson', '2026-05-10');
		const cancelledPaymentId = addPayment(
			'verify-cancelled-payment',
			'10',
			'2026-05-01',
			'verify-payment-to-cancel'
		);
		ledger.cancelPayment({
			sessionToken: 'verify-admin-session',
			paymentId: cancelledPaymentId,
			confirmation: 'verify-cancel-payment'
		});

		addCharge('verify-cancelled-charge', 'verify-cancelled-charge-lesson', '2026-06-10');
		addPayment('verify-cancelled-charge', '10', '2026-06-01', 'verify-charge-payment');
		ledger.reconcileLessonCharge({
			sessionToken: 'verify-admin-session',
			lessonId: 'verify-cancelled-charge-lesson',
			studentAccountId: 'verify-cancelled-charge',
			attendanceTransition: { from: 'present', to: 'absent' }
		});

		classScopeCalls = [];
		lessonFactCalls = [];
		const before = financialState(database);
		const capability = (studentAccountId: string) =>
			ledger.getPaymentCapability({
				sessionToken: 'verify-admin-session',
				classId,
				studentAccountId
			});

		expect(capability('verify-none')).toBe(0);
		expect(capability('verify-mixed')).toBe(50);
		expect(capability('verify-overdue')).toBe(0);
		expect(capability('verify-unallocated')).toBe(0);
		expect(capability('verify-cancelled-payment')).toBe(0);
		expect(capability('verify-cancelled-charge')).toBe(0);
		expect(financialState(database)).toEqual(before);

		expect(classScopeCalls).toHaveLength(6);
		expect(classScopeCalls.every(({ actor }) => actor === 'verify-admin')).toBe(true);
		expect(lessonFactCalls.map(({ lessonId }) => lessonId)).toEqual([
			'verify-mixed-first',
			'verify-mixed-second',
			'verify-overdue-lesson'
		]);
	});

	it('proves current authorization, accepted provider seams, and no direct C&S persistence bypass', () => {
		addCharge('verify-mixed', 'verify-authorized-lesson', '2026-07-10');
		addPayment('verify-mixed', '10', '2026-07-01', 'verify-authorized-payment');
		const before = financialState(database);

		expect(ledger.getPaymentCapability({
			sessionToken: 'verify-admin-session', classId, studentAccountId: 'verify-mixed'
		})).toBe(100);
		expect(ledger.getPaymentCapability({
			sessionToken: 'verify-teacher-session', classId, studentAccountId: 'verify-mixed'
		})).toBe(100);

		for (const sessionToken of [
			undefined,
			'verify-revoked-session',
			'verify-student-session',
			'verify-parent-session'
		]) {
			expect(() => ledger.getPaymentCapability({
				sessionToken, classId, studentAccountId: 'verify-mixed'
			})).toThrow('not-authorized');
		}
		expect(() => ledger.getPaymentCapability({
			sessionToken: 'verify-admin-session',
			classId: 'verify-other-class',
			studentAccountId: 'verify-mixed'
		})).toThrow('not-authorized');
		expect(() => ledger.getPaymentCapability({
			sessionToken: 'verify-admin-session',
			classId,
			studentAccountId: 'verify-other-student'
		})).toThrow('not-authorized');

		teacherAssigned = false;
		expect(() => ledger.getPaymentCapability({
			sessionToken: 'verify-teacher-session', classId, studentAccountId: 'verify-mixed'
		})).toThrow('not-authorized');
		expect(financialState(database)).toEqual(before);

		const source = fs.readFileSync('src/lib/server/modules/financial-ledger/public.ts', 'utf8');
		const methodStart = source.indexOf('\tgetPaymentCapability(');
		const methodEnd = source.indexOf('\n\tprivate requirePaymentScope(', methodStart);
		const method = source.slice(methodStart, methodEnd);
		expect(method).toContain('this.requireActor');
		expect(method).toContain('this.requirePaymentScope');
		expect(method).toContain('this.scope.getFinancialLessonFacts');
		expect(method).not.toMatch(/(?:FROM|JOIN)\s+(?:lessons|classes|teacher_assignments|class_students)\b/);

		const helperStart = source.indexOf('\tprivate getPaymentCapabilityAllocationRows(');
		const helperEnd = source.indexOf('\n\tprivate getChargeState(', helperStart);
		const helper = source.slice(helperStart, helperEnd);
		expect(helper).toContain('financial_payment_allocations');
		expect(helper).toContain("p.status = 'recorded'");
		expect(helper).toContain("c.status = 'active'");
		expect(helper).not.toMatch(/(?:FROM|JOIN)\s+(?:lessons|classes|teacher_assignments|class_students)\b/);
	});
});
