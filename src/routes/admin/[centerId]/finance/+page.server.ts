import { error, fail, redirect, type Actions, type RequestEvent, type ServerLoad } from '@sveltejs/kit';
import { getCompositionRoot } from '$lib/server/composition-root';
import type {
	AdminCenterView,
	CenterSchedulingBoundary
} from '$lib/server/modules/center-scheduling/public';
import type {
	BalanceProjectionView,
	FinancialLedgerBoundary,
	PaymentAllocationView,
	PaymentAuditView,
	PriceSettingView
} from '$lib/server/modules/financial-ledger/public';

type FinancePorts = {
	centerScheduling: Pick<CenterSchedulingBoundary, 'getAdminCenter'>;
	financialLedger: Pick<
		FinancialLedgerBoundary,
		| 'getPriceSettings'
		| 'getPaymentDefault'
		| 'getBalanceProjection'
		| 'setClassPrice'
		| 'setStudentPriceOverride'
		| 'editPayment'
		| 'cancelPayment'
	>;
};

export type AdminFinanceStudent = {
	accountId: string;
	label: string;
};

export type AdminFinanceClass = {
	classId: string;
	name: string;
	students: AdminFinanceStudent[];
	currentAmount: string | null;
	settings: PriceSettingView[];
};

export type AdminFinanceJournalEntry = {
	paymentId: string;
	classId: string;
	className: string;
	studentAccountId: string;
	studentLabel: string;
	amount: string;
	factualDate: string;
	status: 'recorded' | 'cancelled';
	createdByAccountId: string;
	createdAt: string;
	allocations: PaymentAllocationView[];
	balance: string;
	advance: string;
	audit: PaymentAuditView[];
};

export type AdminFinancePageData = {
	centerId: string;
	name: string;
	classes: AdminFinanceClass[];
	journal: AdminFinanceJournalEntry[];
};

type FinanceActionFailure = ReturnType<typeof fail<{
	error:
		| 'unauthorized'
		| 'forbidden'
		| 'invalid_price_request'
		| 'invalid_price_amount'
		| 'invalid_price_date'
		| 'price_forbidden'
		| 'price_operation_failed'
		| 'invalid_payment_request'
		| 'invalid_payment_amount'
		| 'invalid_payment_date'
		| 'payment_confirmation_required'
		| 'payment_forbidden'
		| 'payment_not_editable'
		| 'payment_not_cancellable'
		| 'payment_confirmation_conflict'
		| 'payment_operation_failed'
}>>;

type FinanceSuccessMessage =
	| 'class_price_saved'
	| 'student_price_saved'
	| 'payment_edited'
	| 'payment_cancelled';
type FinanceActionResult = { ok: true; message: FinanceSuccessMessage } | FinanceActionFailure;

function sessionToken(event: RequestEvent): string | undefined {
	return event.cookies.get('foundation_session');
}

function messageOf(cause: unknown): string {
	return cause instanceof Error ? cause.message : '';
}

function participantLabel(fullName: string | null, email: string | null): string {
	if (fullName && email) return `${fullName} · ${email}`;
	return fullName ?? email ?? 'Ученик без ФИО';
}

function getCenter(event: RequestEvent, centerScheduling: FinancePorts['centerScheduling']): AdminCenterView {
	const centerId = event.params.centerId;
	if (!centerId) throw new Error('not-authorized');
	return centerScheduling.getAdminCenter({ sessionToken: sessionToken(event), centerId });
}

function loadData(
	event: RequestEvent,
	{ centerScheduling, financialLedger }: FinancePorts
): AdminFinancePageData {
	const center = getCenter(event, centerScheduling);
	const labels = new Map(
		center.participants.map((participant) => [
			participant.accountId,
			participantLabel(participant.fullName, participant.email)
		])
	);

	const classes = center.classes.map((classView) => ({
		classId: classView.classId,
		name: classView.name,
		students: classView.studentAccountIds.map((accountId) => ({
			accountId,
			label: labels.get(accountId) ?? 'Ученик без ФИО'
		})),
		currentAmount: financialLedger.getPaymentDefault({
			sessionToken: sessionToken(event),
			classId: classView.classId
		}),
		settings: financialLedger.getPriceSettings({
			sessionToken: sessionToken(event),
			classId: classView.classId
		})
	}));
	const journal = classes.flatMap((classView) =>
		classView.students.flatMap((student) => {
			const projection = financialLedger.getBalanceProjection({
				sessionToken: sessionToken(event),
				classId: classView.classId,
				studentAccountId: student.accountId
			});
			return projection.payments.map((payment) => ({
				paymentId: payment.id,
				classId: classView.classId,
				className: classView.name,
				studentAccountId: student.accountId,
				studentLabel: student.label,
				amount: payment.amount,
				factualDate: payment.factualDate,
				status: payment.status,
				createdByAccountId: payment.createdByAccountId,
				createdAt: payment.createdAt,
				allocations: projection.allocations.filter(
					(allocation) => allocation.paymentId === payment.id
				),
				balance: projection.balance,
				advance: projection.advance,
				audit: projection.audit.filter((entry) => entry.after.id === payment.id)
			}));
		})
	);

	return {
		centerId: center.centerId,
		name: center.name,
		classes,
		journal
	};
}

function field(formData: FormData, name: string): string | null {
	const value = formData.get(name);
	return typeof value === 'string' ? value : null;
}

function hasExactlyFields(formData: FormData, expected: string[]): boolean {
	const fields = [...formData.keys()];
	return (
		fields.length === expected.length &&
		expected.every((name) => formData.getAll(name).length === 1) &&
		fields.every((name) => expected.includes(name))
	);
}

function requireClass(center: AdminCenterView, classId: string | null): string {
	if (!classId || !center.classes.some((classView) => classView.classId === classId)) {
		throw new Error('not-authorized');
	}
	return classId;
}

function requireStudent(center: AdminCenterView, classId: string, studentAccountId: string | null): string {
	const classView = center.classes.find((candidate) => candidate.classId === classId);
	if (!studentAccountId || !classView?.studentAccountIds.includes(studentAccountId)) {
		throw new Error('not-authorized');
	}
	return studentAccountId;
}

async function authorizedAction(
	event: RequestEvent,
	ports: FinancePorts,
	operation: (center: AdminCenterView, formData: FormData) => void,
	successMessage: FinanceSuccessMessage
): Promise<FinanceActionResult> {
	if (!event.locals.actor) return fail(401, { error: 'unauthorized' });
	if (event.locals.actor.role !== 'admin') return fail(403, { error: 'forbidden' });

	try {
		const center = getCenter(event, ports.centerScheduling);
		operation(center, await event.request.formData());
		return { ok: true, message: successMessage };
	} catch (cause) {
		const message = messageOf(cause);
		if (message === 'invalid-request') return fail(400, { error: 'invalid_price_request' });
		if (message === 'not-authorized') return fail(403, { error: 'price_forbidden' });
		if (message === 'invalid-amount') return fail(400, { error: 'invalid_price_amount' });
		if (message === 'invalid-date') return fail(400, { error: 'invalid_price_date' });
		return fail(500, { error: 'price_operation_failed' });
	}
}

function requirePayment(
	event: RequestEvent,
	center: AdminCenterView,
	financialLedger: FinancePorts['financialLedger'],
	formData: FormData
): {
	paymentId: string;
	amount: string | null;
	factualDate: string | null;
	confirmation: string;
} {
	const classId = requireClass(center, field(formData, 'classId'));
	const studentAccountId = requireStudent(
		center,
		classId,
		field(formData, 'studentAccountId')
	);
	const paymentId = field(formData, 'paymentId');
	const confirmation = field(formData, 'confirmation');
	if (!paymentId || confirmation === null) throw new Error('invalid-request');

	const projection: BalanceProjectionView = financialLedger.getBalanceProjection({
		sessionToken: sessionToken(event),
		classId,
		studentAccountId
	});
	if (!projection.payments.some((payment) => payment.id === paymentId)) {
		throw new Error('not-authorized');
	}

	return {
		paymentId,
		amount: field(formData, 'amount'),
		factualDate: field(formData, 'factualDate'),
		confirmation
	};
}

async function authorizedPaymentAction(
	event: RequestEvent,
	ports: FinancePorts,
	expectedFields: string[],
	operation: (
		payment: ReturnType<typeof requirePayment>
	) => void,
	successMessage: FinanceSuccessMessage
): Promise<FinanceActionResult> {
	if (!event.locals.actor) return fail(401, { error: 'unauthorized' });
	if (event.locals.actor.role !== 'admin') return fail(403, { error: 'forbidden' });

	try {
		const center = getCenter(event, ports.centerScheduling);
		const formData = await event.request.formData();
		if (!hasExactlyFields(formData, expectedFields)) throw new Error('invalid-request');
		operation(requirePayment(event, center, ports.financialLedger, formData));
		return { ok: true, message: successMessage };
	} catch (cause) {
		const message = messageOf(cause);
		if (message === 'invalid-request' || message === 'empty-payment-change') {
			return fail(400, { error: 'invalid_payment_request' });
		}
		if (message === 'invalid-amount') return fail(400, { error: 'invalid_payment_amount' });
		if (message === 'invalid-date') return fail(400, { error: 'invalid_payment_date' });
		if (message === 'confirmation-required') {
			return fail(400, { error: 'payment_confirmation_required' });
		}
		if (
			message === 'not-authorized' ||
			message === 'center-not-found' ||
			message === 'payment-not-found'
		) {
			return fail(403, { error: 'payment_forbidden' });
		}
		if (message === 'payment-not-editable') {
			return fail(409, { error: 'payment_not_editable' });
		}
		if (message === 'payment-not-cancellable') {
			return fail(409, { error: 'payment_not_cancellable' });
		}
		if (message === 'confirmation-conflict') {
			return fail(409, { error: 'payment_confirmation_conflict' });
		}
		return fail(500, { error: 'payment_operation_failed' });
	}
}

export function _createAdminFinancePageLoad(
	ports: FinancePorts = {
		centerScheduling: getCompositionRoot().centerScheduling,
		financialLedger: getCompositionRoot().financialLedger
	}
): (event: RequestEvent) => AdminFinancePageData {
	return (event) => {
		if (!event.locals.actor) throw redirect(303, '/login');
		if (event.locals.actor.role !== 'admin') throw error(403, 'Forbidden');

		try {
			return loadData(event, ports);
		} catch (cause) {
			if (messageOf(cause) === 'not-authorized' || messageOf(cause) === 'center-not-found') {
				throw error(403, 'Forbidden');
			}
			throw error(500, 'Admin finance could not be loaded');
		}
	};
}

export function _createAdminFinanceActions(
	ports: FinancePorts = {
		centerScheduling: getCompositionRoot().centerScheduling,
		financialLedger: getCompositionRoot().financialLedger
	}
): Actions {
	return {
		setClassPrice: (event) =>
			authorizedAction(event, ports, (center, formData) => {
				if (!hasExactlyFields(formData, ['classId', 'amount', 'effectiveFrom'])) {
					throw new Error('invalid-request');
				}
				const classIdValue = field(formData, 'classId');
				const amount = field(formData, 'amount');
				const effectiveFrom = field(formData, 'effectiveFrom');
				if (classIdValue === null || amount === null || effectiveFrom === null) {
					throw new Error('invalid-request');
				}
				const classId = requireClass(center, classIdValue);
				ports.financialLedger.setClassPrice({
					sessionToken: sessionToken(event),
					classId,
					amount,
					effectiveFrom
				});
			}, 'class_price_saved'),
		setStudentPriceOverride: (event) =>
			authorizedAction(event, ports, (center, formData) => {
				if (!hasExactlyFields(formData, ['classId', 'studentAccountId', 'amount', 'effectiveFrom'])) {
					throw new Error('invalid-request');
				}
				const classIdValue = field(formData, 'classId');
				const studentAccountIdValue = field(formData, 'studentAccountId');
				const amount = field(formData, 'amount');
				const effectiveFrom = field(formData, 'effectiveFrom');
				if (
					classIdValue === null ||
					studentAccountIdValue === null ||
					amount === null ||
					effectiveFrom === null
				) {
					throw new Error('invalid-request');
				}
				const classId = requireClass(center, classIdValue);
				const studentAccountId = requireStudent(
					center,
					classId,
					studentAccountIdValue
				);
				ports.financialLedger.setStudentPriceOverride({
					sessionToken: sessionToken(event),
					classId,
					studentAccountId,
					amount,
					effectiveFrom
				});
			}, 'student_price_saved'),
		editPayment: (event) =>
			authorizedPaymentAction(
				event,
				ports,
				['classId', 'studentAccountId', 'paymentId', 'amount', 'factualDate', 'confirmation'],
				(payment) => {
					if (payment.amount === null || payment.factualDate === null) {
						throw new Error('invalid-request');
					}
					ports.financialLedger.editPayment({
						sessionToken: sessionToken(event),
						paymentId: payment.paymentId,
						change: { amount: payment.amount, factualDate: payment.factualDate },
						confirmation: payment.confirmation
					});
				},
				'payment_edited'
			),
		cancelPayment: (event) =>
			authorizedPaymentAction(
				event,
				ports,
				['classId', 'studentAccountId', 'paymentId', 'confirmation'],
				(payment) => {
					ports.financialLedger.cancelPayment({
						sessionToken: sessionToken(event),
						paymentId: payment.paymentId,
						confirmation: payment.confirmation
					});
				},
				'payment_cancelled'
			)
	};
}

export const load: ServerLoad = (event) => _createAdminFinancePageLoad()(event);

export const actions: Actions = _createAdminFinanceActions();
