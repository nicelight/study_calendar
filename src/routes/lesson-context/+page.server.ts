import { error, fail, type Actions, type ServerLoad } from '@sveltejs/kit';
import { getCompositionRoot } from '$lib/server/composition-root';
import type { LessonView } from '$lib/server/modules/center-scheduling/public';

type LessonSummary = Pick<LessonView, 'lessonId' | 'classId' | 'lessonDate' | 'status'> & {
	className: string;
	canEditMaterial: boolean;
	payment: PaymentFormData | null;
};

export type PaymentFormData = {
	studentAccountIds: string[];
	factualDate: string;
};

function canEditMaterial(role: string | undefined): boolean {
	return role === 'admin' || role === 'teacher';
}

function paymentForm(
	scope: ReturnType<ReturnType<typeof getCompositionRoot>['centerScheduling']['getAuthorizedClassScope']>,
	lessonDate: string
): PaymentFormData | null {
	return scope && (scope.role === 'admin' || scope.role === 'teacher')
		? { studentAccountIds: scope.studentAccountIds, factualDate: lessonDate }
		: null;
}

function lessonSummary(
	root: ReturnType<typeof getCompositionRoot>,
	sessionToken: string | undefined,
	classId: string,
	lessonId: string
): LessonSummary {
	const scope = root.centerScheduling.getAuthorizedClassScope(sessionToken, classId);
	const lesson = root.centerScheduling
		.getLessons({ sessionToken, classId })
		?.find((candidate) => candidate.lessonId === lessonId && candidate.status !== 'cancelled');
	if (!scope || !lesson) {
		throw new Error('not-authorized');
	}

	return {
		lessonId: lesson.lessonId,
		classId: lesson.classId,
		lessonDate: lesson.lessonDate,
		status: lesson.status,
		className: scope.className,
		canEditMaterial: canEditMaterial(scope.role),
		payment: paymentForm(scope, lesson.lessonDate)
	};
}

export const load: ServerLoad = ({ cookies, url }) => {
	const classId = url.searchParams.get('classId');
	const lessonId = url.searchParams.get('lessonId');
	if (!classId || !lessonId) {
		return { dayContext: null, lesson: null, canEditMaterial: false, canCreatePayment: false, payment: null };
	}

	const root = getCompositionRoot();
	const sessionToken = cookies.get('foundation_session');
	try {
		const scope = root.centerScheduling.getAuthorizedClassScope(sessionToken, classId);
		const dayContext = root.lessonContext.getDayContext({
			sessionToken,
			classId,
			lessonId,
			studentAccountId: url.searchParams.get('studentAccountId') ?? undefined
		});
		return {
			dayContext,
			lesson: null,
			canEditMaterial: canEditMaterial(scope?.role),
			canCreatePayment: paymentForm(scope, dayContext.lesson.lessonDate) !== null,
			payment: paymentForm(scope, dayContext.lesson.lessonDate)
		};
	} catch (cause) {
		if (cause instanceof Error && cause.message === 'lesson-material-not-found') {
			const summary = lessonSummary(root, sessionToken, classId, lessonId);
			return {
				dayContext: null,
				lesson: summary,
				canEditMaterial: summary.canEditMaterial,
				canCreatePayment: summary.payment !== null,
				payment: summary.payment
			};
		}
		throw error(403, 'Forbidden');
	}
};

export const actions: Actions = {
	default: async ({ cookies, request, url }) => {
		const classId = url.searchParams.get('classId');
		const lessonId = url.searchParams.get('lessonId');
		if (!classId || !lessonId) {
			return fail(400, { error: 'invalid_request' as const });
		}

		const formData = await request.formData();
		const fields = [...formData.keys()];
		if (formData.get('action') === 'createPayment') {
			if (
				fields.some((field) => !['action', 'studentAccountId', 'amount', 'factualDate', 'confirmation'].includes(field)) ||
				fields.length !== 5 ||
				formData.getAll('studentAccountId').length !== 1 ||
				formData.getAll('amount').length !== 1 ||
				formData.getAll('factualDate').length !== 1 ||
				formData.getAll('confirmation').length !== 1
			) {
				return fail(400, { error: 'invalid_payment_request' as const });
			}

			const studentAccountId = formData.get('studentAccountId');
			const amount = formData.get('amount');
			const factualDateValue = formData.get('factualDate');
			const confirmation = formData.get('confirmation');
			if (
				typeof studentAccountId !== 'string' ||
				typeof amount !== 'string' ||
				typeof factualDateValue !== 'string' ||
				typeof confirmation !== 'string'
			) {
				return fail(400, { error: 'invalid_payment_request' as const });
			}

			const root = getCompositionRoot();
			const sessionToken = cookies.get('foundation_session');
			const scope = root.centerScheduling.getAuthorizedClassScope(sessionToken, classId);
			const lesson = root.centerScheduling
				.getLessons({ sessionToken, classId })
				?.find((candidate) => candidate.lessonId === lessonId && candidate.status !== 'cancelled');
			if (
				!scope ||
				(scope.role !== 'admin' && scope.role !== 'teacher') ||
				!lesson ||
				!scope.studentAccountIds.includes(studentAccountId)
			) {
				return fail(403, { error: 'payment_forbidden' as const });
			}

			try {
				root.financialLedger.createPayment({
					sessionToken,
					classId,
					studentAccountId,
					amount,
					factualDate: factualDateValue.trim() || lesson.lessonDate,
					confirmation
				});
				return { paymentSuccess: true as const };
			} catch (cause) {
				if (cause instanceof Error && cause.message === 'not-authorized') {
					return fail(403, { error: 'payment_forbidden' as const });
				}
				if (cause instanceof Error && cause.message === 'invalid-amount') {
					return fail(400, { error: 'invalid_payment_amount' as const });
				}
				if (cause instanceof Error && cause.message === 'invalid-date') {
					return fail(400, { error: 'invalid_payment_date' as const });
				}
				if (cause instanceof Error && cause.message === 'confirmation-required') {
					return fail(400, { error: 'invalid_payment_confirmation' as const });
				}
				return fail(500, { error: 'payment_operation_failed' as const });
			}
		}

		if (
			fields.some((field) => !['topic', 'practicalWork', 'homework'].includes(field)) ||
			formData.getAll('topic').length !== 1 ||
			formData.getAll('practicalWork').length !== 1 ||
			formData.getAll('homework').length !== 1
		) {
			return fail(400, { error: 'invalid_request' as const });
		}

		const values = {
			topic: formData.get('topic'),
			practicalWork: formData.get('practicalWork'),
			homework: formData.get('homework')
		};
		if (
			typeof values.topic !== 'string' ||
			typeof values.practicalWork !== 'string' ||
			typeof values.homework !== 'string'
		) {
			return fail(400, { error: 'invalid_material' as const });
		}

		try {
			getCompositionRoot().lessonContext.setSharedLessonMaterial({
				sessionToken: cookies.get('foundation_session'),
				classId,
				lessonId,
				topic: values.topic,
				practicalWork: values.practicalWork,
				homework: values.homework
			});
			return { success: true as const };
		} catch (cause) {
			if (cause instanceof Error && ['invalid-topic', 'invalid-practical-work', 'invalid-homework'].includes(cause.message)) {
				return fail(400, { error: 'invalid_material' as const });
			}
			if (cause instanceof Error && cause.message === 'not-authorized') {
				return fail(403, { error: 'forbidden' as const });
			}
			return fail(500, { error: 'operation_failed' as const });
		}
	}
};
