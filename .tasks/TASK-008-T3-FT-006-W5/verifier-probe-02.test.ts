import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CenterSchedulingBoundary } from '../../src/lib/server/modules/center-scheduling/public';
import { FinancialLedgerBoundary } from '../../src/lib/server/modules/financial-ledger/public';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

type Harness = {
	database: SharedDatabase;
	ledger: FinancialLedgerBoundary;
};

function createHarness(): Harness {
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
	const ledger = new FinancialLedgerBoundary(database, identityAccess, centerScheduling, { now });

	database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-own', 'Own Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-own', 'admin'),
			('student-own', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-own', 'admin-own', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-own', 'admin-own'),
			('center-own', 'student-own');
	`);

	centerScheduling.createClass({
		sessionToken: 'session-admin-own',
		centerId: 'center-own',
		classId: 'class-own',
		name: 'Own Class',
		mode: 'group'
	});
	centerScheduling.addStudentToClass({
		sessionToken: 'session-admin-own',
		classId: 'class-own',
		studentAccountId: 'student-own'
	});
	centerScheduling.createRecurringSchedule({
		sessionToken: 'session-admin-own',
		classId: 'class-own',
		scheduleId: 'schedule-jan',
		startDate: '2026-01-10',
		endDate: '2026-01-10',
		weekdays: [6]
	});
	centerScheduling.createRecurringSchedule({
		sessionToken: 'session-admin-own',
		classId: 'class-own',
		scheduleId: 'schedule-feb',
		startDate: '2026-02-10',
		endDate: '2026-02-10',
		weekdays: [2]
	});

	return { database, ledger };
}

function seedCharges(ledger: FinancialLedgerBoundary): void {
	ledger.setClassPrice({
		sessionToken: 'session-admin-own',
		classId: 'class-own',
		amount: '10.125',
		effectiveFrom: '2026-01-01'
	});
	for (const lessonId of ['schedule-jan:2026-01-10', 'schedule-feb:2026-02-10']) {
		ledger.reconcileLessonCharge({
			sessionToken: 'session-admin-own',
			lessonId,
			studentAccountId: 'student-own',
			attendanceTransition: { from: 'absent', to: 'present' }
		});
	}
}

function projection(ledger: FinancialLedgerBoundary, range: { from: string; to: string }) {
	return ledger.getBalanceProjection({
		sessionToken: 'session-admin-own',
		classId: 'class-own',
		studentAccountId: 'student-own',
		range
	});
}

describe('TASK-008 Attempt 2 verifier-owned bounded projection probe', () => {
	let harness: Harness;

	beforeEach(() => {
		harness = createHarness();
	});

	afterEach(() => harness.database.close());

	it('keeps bounded charges, payments, allocations, and derived charge state date-consistent', () => {
		seedCharges(harness.ledger);
		const payment = harness.ledger.createPayment({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-own',
			amount: '15',
			factualDate: '2026-01-15',
			confirmation: 'verify-attempt2-range-1'
		});

		const unbounded = harness.ledger.getBalanceProjection({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-own'
		});
		expect(unbounded.allocations).toEqual([
			{ paymentId: payment.id, lessonId: 'schedule-jan:2026-01-10', amount: '10.125' },
			{ paymentId: payment.id, lessonId: 'schedule-feb:2026-02-10', amount: '4.875' }
		]);

		const february = projection(harness.ledger, { from: '2026-02-01', to: '2026-02-28' });
		expect(february.charges).toEqual([
			{
				lessonId: 'schedule-feb:2026-02-10',
				state: 'overdue',
				allocatedAmount: '0',
				remainingAmount: '10.125'
			}
		]);
		expect(february.balance).toBe('10.125');
		expect(february.advance).toBe('0');
		expect(february.allocations).toEqual([]);
		expect(february.payments).toEqual([]);

		const january = projection(harness.ledger, { from: '2026-01-01', to: '2026-01-31' });
		expect(january.charges).toEqual([
			{
				lessonId: 'schedule-jan:2026-01-10',
				state: 'paid',
				allocatedAmount: '10.125',
				remainingAmount: '0'
			}
		]);
		expect(january.payments.map(({ id, factualDate }) => ({ id, factualDate }))).toEqual([
			{ id: payment.id, factualDate: '2026-01-15' }
		]);
		expect(january.allocations).toEqual([
			{ paymentId: payment.id, lessonId: 'schedule-jan:2026-01-10', amount: '10.125' }
		]);
	});
});
