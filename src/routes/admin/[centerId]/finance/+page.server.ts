import { error, fail, redirect, type Actions, type RequestEvent, type ServerLoad } from '@sveltejs/kit';
import { getCompositionRoot } from '$lib/server/composition-root';
import type {
	AdminCenterView,
	CenterSchedulingBoundary
} from '$lib/server/modules/center-scheduling/public';
import type {
	FinancialLedgerBoundary,
	PriceSettingView
} from '$lib/server/modules/financial-ledger/public';

type FinancePorts = {
	centerScheduling: Pick<CenterSchedulingBoundary, 'getAdminCenter'>;
	financialLedger: Pick<
		FinancialLedgerBoundary,
		'getPriceSettings' | 'getPaymentDefault' | 'setClassPrice' | 'setStudentPriceOverride'
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

export type AdminFinancePageData = {
	centerId: string;
	name: string;
	classes: AdminFinanceClass[];
};

type PriceActionFailure = ReturnType<typeof fail<{
	error:
		| 'unauthorized'
		| 'forbidden'
		| 'invalid_price_request'
		| 'invalid_price_amount'
		| 'invalid_price_date'
		| 'price_forbidden'
		| 'price_operation_failed'
}>>;

type PriceSuccessMessage = 'class_price_saved' | 'student_price_saved';
type PriceActionResult = { ok: true; message: PriceSuccessMessage } | PriceActionFailure;

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

	return {
		centerId: center.centerId,
		name: center.name,
		classes: center.classes.map((classView) => ({
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
		}))
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
	successMessage: PriceSuccessMessage
): Promise<PriceActionResult> {
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
			}, 'student_price_saved')
	};
}

export const load: ServerLoad = (event) => _createAdminFinancePageLoad()(event);

export const actions: Actions = _createAdminFinanceActions();
