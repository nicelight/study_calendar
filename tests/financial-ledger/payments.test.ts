import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import {
	FinancialLedgerBoundary,
	type FinancialLessonFacts,
	type FinancialScopePort
} from '../../src/lib/server/modules/financial-ledger/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

type PaymentRequest = {
	sessionToken?: string;
	classId: string;
	studentAccountId: string;
	amount: string;
	factualDate: string;
	confirmation: string;
};

type PaymentView = {
	id: string;
	centerId: string;
	classId: string;
	studentAccountId: string;
	amount: string;
	factualDate: string;
	status: 'recorded' | 'cancelled';
};

type PaymentProjection = {
	charges: Array<{
		lessonId: string;
		state: 'open' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
		allocatedAmount: string;
		remainingAmount: string;
	}>;
	balance: string;
	advance: string;
	allocations: Array<{ paymentId: string; lessonId: string; amount: string }>;
	payments: PaymentView[];
	audit: Array<{ action: string; actorAccountId: string; before: unknown; after: unknown }>;
};

type PaymentMarker = {
	paymentId: string;
	markerDate: string;
	factualDate: string;
	amount: string;
};

type PaymentApi = {
	createPayment(request: PaymentRequest): PaymentView;
	editPayment(request: {
		sessionToken?: string;
		paymentId: string;
		change: { amount?: string; factualDate?: string };
		confirmation: string;
	}): PaymentView;
	cancelPayment(request: {
		sessionToken?: string;
		paymentId: string;
		confirmation: string;
	}): PaymentView;
	getBalanceProjection(request: {
		sessionToken?: string;
		classId: string;
		studentAccountId: string;
		range?: { from?: string; to?: string };
	}): PaymentProjection;
	getPaymentMarkers(request: {
		sessionToken?: string;
		classId: string;
		studentAccountId: string;
		range?: { from?: string; to?: string };
	}): PaymentMarker[];
};

const lessonFacts = new Map<string, FinancialLessonFacts>([
	[
		'lesson-oldest:student-own',
		{
			centerId: 'center-own',
			classId: 'class-own',
			lessonId: 'lesson-oldest',
			studentAccountId: 'student-own',
			lessonDate: '2026-01-10'
		}
	],
	[
		'lesson-newer:student-own',
		{
			centerId: 'center-own',
			classId: 'class-own',
			lessonId: 'lesson-newer',
			studentAccountId: 'student-own',
			lessonDate: '2026-02-10'
		}
	],
	[
		'lesson-marker:student-own',
		{
			centerId: 'center-own',
			classId: 'class-own',
			lessonId: 'lesson-marker',
			studentAccountId: 'student-own',
			lessonDate: '2026-03-01'
		}
	]
]);

const scope: FinancialScopePort = {
	getFinancialClassScope: (actor, classId, studentAccountId) => {
		if (
			classId !== 'class-own' ||
			!['admin-own', 'teacher-own'].includes(actor.accountId) ||
			(actor.accountId === 'teacher-own' && actor.role !== 'teacher') ||
			(actor.accountId === 'admin-own' && actor.role !== 'admin')
		) {
			return null;
		}
		const studentAccountIds = ['student-own'];
		if (studentAccountId && !studentAccountIds.includes(studentAccountId)) {
			return null;
		}
		return { centerId: 'center-own', classId, studentAccountIds };
	},
	getFinancialLessonFacts: (actor, lessonId, studentAccountId) => {
		if (!['admin-own', 'teacher-own'].includes(actor.accountId)) {
			return null;
		}
		return lessonFacts.get(`${lessonId}:${studentAccountId}`) ?? null;
	},
	getFinancialLessonDates: (actor, classId) => {
		if (!scope.getFinancialClassScope(actor, classId)) {
			return null;
		}
		return ['2026-02-28', '2026-03-01', '2026-03-02'];
	}
};

type Harness = {
	database: SharedDatabase;
	ledger: FinancialLedgerBoundary;
	api: PaymentApi;
};

function createHarness(): Harness {
	const database = new SharedDatabase({ filename: ':memory:' });
	const identityAccess = new IdentityAccessBoundary(database);
	database.sqlite.exec(`
		INSERT INTO accounts (id, role) VALUES
			('admin-own', 'admin'),
			('teacher-own', 'teacher'),
			('admin-other', 'admin'),
			('student-own', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-own', 'admin-own', NULL),
			('session-teacher-own', 'teacher-own', NULL),
			('session-admin-other', 'admin-other', NULL);
	`);
	const ledger = new FinancialLedgerBoundary(database, identityAccess, scope, {
		now: () => new Date('2026-03-10T00:00:00.000Z')
	});
	return { database, ledger, api: ledger as unknown as PaymentApi };
}

function seedCharges(ledger: FinancialLedgerBoundary): void {
	ledger.setClassPrice({
		sessionToken: 'session-admin-own',
		classId: 'class-own',
		amount: '10.125',
		effectiveFrom: '2026-01-01'
	});
	ledger.reconcileLessonCharge({
		sessionToken: 'session-admin-own',
		lessonId: 'lesson-oldest',
		studentAccountId: 'student-own',
		attendanceTransition: { from: 'absent', to: 'present' }
	});
	ledger.reconcileLessonCharge({
		sessionToken: 'session-admin-own',
		lessonId: 'lesson-newer',
		studentAccountId: 'student-own',
		attendanceTransition: { from: 'absent', to: 'present' }
	});
}

describe('payments, allocation, authority, markers, and retry safety', () => {
	let harness: Harness;

	beforeEach(() => {
		harness = createHarness();
	});

	afterEach(() => harness.database.close());

	it('FT-006-AC-002 allocates oldest uncovered charges deterministically for the same factual sequence', () => {
		seedCharges(harness.ledger);
		const first = harness.api.createPayment({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-own',
			amount: '15',
			factualDate: '2026-02-15',
			confirmation: 'create-oldest-1'
		});
		const replay = harness.api.getBalanceProjection({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-own'
		});

		expect(replay.allocations.map(({ lessonId, amount }) => ({ lessonId, amount }))).toEqual([
			{ lessonId: 'lesson-oldest', amount: '10.125' },
			{ lessonId: 'lesson-newer', amount: '4.875' }
		]);
		expect(replay.balance).toBe('5.25');
		expect(first.status).toBe('recorded');

		const repeatedHarness = createHarness();
		try {
			seedCharges(repeatedHarness.ledger);
			repeatedHarness.api.createPayment({
				sessionToken: 'session-admin-own',
				classId: 'class-own',
				studentAccountId: 'student-own',
				amount: '15',
				factualDate: '2026-02-15',
				confirmation: 'create-oldest-1'
			});
			expect(repeatedHarness.api.getBalanceProjection({
				sessionToken: 'session-admin-own',
				classId: 'class-own',
				studentAccountId: 'student-own'
			})).toEqual(replay);
		} finally {
			repeatedHarness.database.close();
		}
	});

	it('FT-006-AC-003 preserves exact partial remainder, paid, overdue, and advance states', () => {
		seedCharges(harness.ledger);
		const initialProjection = harness.api.getBalanceProjection({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-own'
		});
		expect(initialProjection.charges.map(({ state }) => state)).toEqual(['overdue', 'overdue']);
		harness.api.createPayment({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-own',
			amount: '12.345',
			factualDate: '2026-02-15',
			confirmation: 'create-partial-1'
		});
		let projection = harness.api.getBalanceProjection({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-own'
		});
		expect(projection.charges.map(({ lessonId, state, remainingAmount }) => ({ lessonId, state, remainingAmount }))).toEqual([
			{ lessonId: 'lesson-oldest', state: 'paid', remainingAmount: '0' },
			{ lessonId: 'lesson-newer', state: 'partially_paid', remainingAmount: '7.905' }
		]);

		harness.api.createPayment({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-own',
			amount: '10',
			factualDate: '2026-02-16',
			confirmation: 'create-excess-1'
		});
		projection = harness.api.getBalanceProjection({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-own'
		});
		expect(projection.charges.every(({ state }) => state === 'paid')).toBe(true);
		expect(projection.advance).toBe('2.095');
		expect(projection.balance).toBe('-2.095');
	});

	it('keeps bounded balance projection allocations and charge state in range', () => {
		seedCharges(harness.ledger);
		harness.api.createPayment({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-own',
			amount: '15',
			factualDate: '2026-01-15',
			confirmation: 'create-bounded-range-1'
		});

		const projection = harness.api.getBalanceProjection({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-own',
			range: { from: '2026-02-01', to: '2026-02-28' }
		});

		expect(projection.charges).toEqual([
			{
				lessonId: 'lesson-newer',
				state: 'overdue',
				allocatedAmount: '0',
				remainingAmount: '10.125'
			}
		]);
		expect(projection.balance).toBe('10.125');
		expect(projection.advance).toBe('0');
		expect(projection.allocations).toEqual([]);
		expect(projection.payments).toEqual([]);
	});

	it('FT-006-AC-005 enforces role/center authority and audits Admin edit/cancel recomputation', () => {
		seedCharges(harness.ledger);
		const payment = harness.api.createPayment({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-own',
			amount: '10',
			factualDate: '2026-02-15',
			confirmation: 'create-authority-1'
		});
		harness.api.createPayment({
			sessionToken: 'session-teacher-own',
			classId: 'class-own',
			studentAccountId: 'student-own',
			amount: '2',
			factualDate: '2026-02-16',
			confirmation: 'create-teacher-1'
		});
		expect(() => harness.api.editPayment({
			sessionToken: 'session-teacher-own',
			paymentId: payment.id,
			change: { amount: '8' },
			confirmation: 'edit-teacher-1'
		})).toThrow('not-authorized');
		expect(() => harness.api.createPayment({
			sessionToken: 'session-admin-other',
			classId: 'class-own',
			studentAccountId: 'student-own',
			amount: '1',
			factualDate: '2026-02-17',
			confirmation: 'create-cross-center-1'
		})).toThrow('not-authorized');

		const edited = harness.api.editPayment({
			sessionToken: 'session-admin-own',
			paymentId: payment.id,
			change: { amount: '8' },
			confirmation: 'edit-admin-1'
		});
		expect(edited.amount).toBe('8');
		expect(harness.api.getBalanceProjection({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-own'
		}).allocations).toEqual([
			{ paymentId: payment.id, lessonId: 'lesson-oldest', amount: '8' },
			{ paymentId: expect.any(String), lessonId: 'lesson-oldest', amount: '2' }
		]);
		const cancelled = harness.api.cancelPayment({
			sessionToken: 'session-admin-own',
			paymentId: payment.id,
			confirmation: 'cancel-admin-1'
		});
		expect(cancelled.status).toBe('cancelled');
		const projection = harness.api.getBalanceProjection({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-own'
		});
		expect(projection.balance).toBe('18.25');
		expect(projection.allocations).toEqual([
			{ paymentId: expect.any(String), lessonId: 'lesson-oldest', amount: '2' }
		]);
		expect(projection.audit.map(({ action, actorAccountId }) => ({ action, actorAccountId }))).toEqual(expect.arrayContaining([
			{ action: 'payment-edited', actorAccountId: 'admin-own' },
			{ action: 'payment-cancelled', actorAccountId: 'admin-own' }
		]));
	});

	it('FT-006-AC-006 projects factual-date markers across lesson boundaries without mutation', () => {
		seedCharges(harness.ledger);
		const payment = harness.api.createPayment({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-own',
			amount: '1',
			factualDate: '2026-03-01',
			confirmation: 'create-marker-1'
		});
		harness.api.createPayment({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-own',
			amount: '2',
			factualDate: '2026-03-01',
			confirmation: 'create-marker-2'
		});
		const before = harness.database.sqlite.prepare(`
			SELECT
			(SELECT COUNT(*) FROM financial_payments) AS payments,
				(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
				(SELECT COUNT(*) FROM financial_lesson_charges) AS charges
		`).get();
		const markers = harness.api.getPaymentMarkers({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-own',
			range: { from: '2026-02-28', to: '2026-03-02' }
		});
		expect(markers).toEqual([
			{ paymentId: payment.id, markerDate: '2026-02-27', factualDate: '2026-03-01', amount: '1' },
			{ paymentId: expect.any(String), markerDate: '2026-02-27', factualDate: '2026-03-01', amount: '2' }
		]);
		expect(harness.database.sqlite.prepare(`
			SELECT
				(SELECT COUNT(*) FROM financial_payments) AS payments,
				(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
				(SELECT COUNT(*) FROM financial_lesson_charges) AS charges
		`).get()).toEqual(before);
	});

	it('FT-006-AC-007 makes a repeated confirmed create idempotent while a new confirmation creates a new Payment', () => {
		seedCharges(harness.ledger);
		const request = {
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-own',
			amount: '3',
			factualDate: '2026-02-15',
			confirmation: 'create-retry-1'
		};
		const first = harness.api.createPayment(request);
		const repeated = harness.api.createPayment(request);
		expect(repeated).toEqual(first);
		expect(harness.database.sqlite.prepare('SELECT COUNT(*) AS count FROM financial_payments').get()).toEqual({ count: 1 });
		const newPayment = harness.api.createPayment({ ...request, confirmation: 'create-retry-2' });
		expect(newPayment.id).not.toBe(first.id);
		expect(harness.database.sqlite.prepare('SELECT COUNT(*) AS count FROM financial_payments').get()).toEqual({ count: 2 });
	});
});
