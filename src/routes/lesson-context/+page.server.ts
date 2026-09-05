import { error, fail, type Actions, type RequestEvent, type ServerLoad } from '@sveltejs/kit';
import { getCompositionRoot } from '$lib/server/composition-root';
import type { AuthorizedClassScope, LessonView } from '$lib/server/modules/center-scheduling/public';
import type { AttendanceView, Grade } from '$lib/server/modules/learning-progress/public';

type LessonSummary = Pick<LessonView, 'lessonId' | 'classId' | 'lessonDate' | 'status'> & {
	className: string;
	canEditMaterial: boolean;
	canEditAttendance: boolean;
	attendance: AttendanceFormEntry[] | null;
	payment: PaymentFormData | null;
	studentLabels: Record<string, string>;
};

export type PaymentFormData = {
	studentAccountIds: string[];
	studentLabels: Record<string, string>;
	factualDate: string;
	defaultAmount: string | null;
};

type AttendanceFormEntry = AttendanceView & {
	studentLabel: string;
};

function studentLabels(
	root: ReturnType<typeof getCompositionRoot>,
	studentAccountIds: string[]
): Record<string, string> {
	const profiles = new Map(
		root.identityAccess
			.getStatisticsProfiles(studentAccountIds)
			.map((profile) => [profile.accountId, profile.fullName] as const)
	);

	return Object.fromEntries(
		studentAccountIds.map((studentAccountId) => [
			studentAccountId,
			(() => {
				const fullName = profiles.get(studentAccountId);
				const email = root.identityAccess.getAccountEmail(studentAccountId);
				return fullName && email ? `${fullName} · ${email}` : fullName ?? email ?? 'Ученик без ФИО';
			})()
		])
	);
}

function canEditMaterial(role: string | undefined): boolean {
	return role === 'admin' || role === 'teacher';
}

function paymentForm(
	root: ReturnType<typeof getCompositionRoot>,
	sessionToken: string | undefined,
	scope: ReturnType<ReturnType<typeof getCompositionRoot>['centerScheduling']['getAuthorizedClassScope']>,
	lessonDate: string,
	labels: Record<string, string>
): PaymentFormData | null {
	if (!scope || (scope.role !== 'admin' && scope.role !== 'teacher')) return null;
	return {
		studentAccountIds: scope.studentAccountIds,
		studentLabels: labels,
		factualDate: lessonDate,
		defaultAmount: root.financialLedger.getPaymentDefault({ sessionToken, classId: scope.classId })
	};
}

function attendanceForm(
	root: ReturnType<typeof getCompositionRoot>,
	sessionToken: string | undefined,
	scope: AuthorizedClassScope,
	lessonId: string,
	labels: Record<string, string>
): AttendanceFormEntry[] | null {
	if (scope.role !== 'teacher') return null;
	return root.learningProgress
		.getLessonAttendance({ sessionToken, classId: scope.classId, lessonId })
		.map((entry) => ({ ...entry, studentLabel: labels[entry.studentAccountId] ?? entry.studentAccountId }));
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
	const labels = studentLabels(root, scope.studentAccountIds);

	return {
		lessonId: lesson.lessonId,
		classId: lesson.classId,
		lessonDate: lesson.lessonDate,
		status: lesson.status,
		className: scope.className,
		canEditMaterial: canEditMaterial(scope.role),
		canEditAttendance: scope.role === 'teacher',
		attendance: attendanceForm(root, sessionToken, scope, lesson.lessonId, labels),
		payment: paymentForm(root, sessionToken, scope, lesson.lessonDate, labels),
		studentLabels: labels
	};
}

export const load: ServerLoad = ({ cookies, url }) => {
	const classId = url.searchParams.get('classId');
	const lessonId = url.searchParams.get('lessonId');
	if (!classId || !lessonId) {
		return {
			dayContext: null,
			lesson: null,
			canEditMaterial: false,
			canEditAttendance: false,
			attendance: null,
			canCreatePayment: false,
			payment: null,
			studentLabels: {}
		};
	}

	const root = getCompositionRoot();
	const sessionToken = cookies.get('foundation_session');
	try {
		const scope = root.centerScheduling.getAuthorizedClassScope(sessionToken, classId);
		const labels = scope ? studentLabels(root, scope.studentAccountIds) : {};
		const dayContext = root.lessonContext.getDayContext({
			sessionToken,
			classId,
			lessonId,
			studentAccountId: url.searchParams.get('studentAccountId') ?? undefined
		});
		const attendance = scope
			? attendanceForm(root, sessionToken, scope, dayContext.lesson.lessonId, labels)
			: null;
		const payment = paymentForm(root, sessionToken, scope, dayContext.lesson.lessonDate, labels);
		return {
			dayContext,
			lesson: null,
			canEditMaterial: canEditMaterial(scope?.role),
			canEditAttendance: scope?.role === 'teacher',
			attendance,
			canCreatePayment: payment !== null,
			payment,
			studentLabels: labels
		};
	} catch (cause) {
		if (cause instanceof Error && cause.message === 'lesson-material-not-found') {
			const summary = lessonSummary(root, sessionToken, classId, lessonId);
			return {
				dayContext: null,
				lesson: summary,
				canEditMaterial: summary.canEditMaterial,
				canEditAttendance: summary.canEditAttendance,
				attendance: summary.attendance,
				canCreatePayment: summary.payment !== null,
				payment: summary.payment,
				studentLabels: summary.studentLabels
			};
		}
		throw error(403, 'Forbidden');
	}
};

type LessonActionEvent = Pick<RequestEvent, 'cookies' | 'request' | 'url'>;

function actionContext(event: LessonActionEvent): {
	root: ReturnType<typeof getCompositionRoot>;
	sessionToken: string | undefined;
	classId: string;
	lessonId: string;
	studentAccountId?: string;
} | null {
	const classId = event.url.searchParams.get('classId');
	const lessonId = event.url.searchParams.get('lessonId');
	if (!classId || !lessonId) return null;
	const studentAccountId = event.url.searchParams.get('studentAccountId') ?? undefined;
	return {
		root: getCompositionRoot(),
		sessionToken: event.cookies.get('foundation_session'),
		classId,
		lessonId,
		studentAccountId
	};
}

function hasOnlyFields(
	formData: FormData,
	allowedFields: readonly string[],
	requiredFields: readonly string[] = []
): boolean {
	const fields = [...new Set(formData.keys())];
	return (
		fields.every((field) => allowedFields.includes(field)) &&
		requiredFields.every((field) => formData.getAll(field).length === 1)
	);
}

function textField(formData: FormData, field: string): string | null {
	const value = formData.get(field);
	return typeof value === 'string' ? value : null;
}

function collaborationRequestFields(formData: FormData): {
	scope: 'shared' | 'personal';
	studentAccountId?: string;
} | null {
	const scope = textField(formData, 'scope');
	if (scope !== 'shared' && scope !== 'personal') return null;
	const studentAccountId = textField(formData, 'studentAccountId');
	return { scope, ...(studentAccountId === null ? {} : { studentAccountId }) };
}

function collaborationFailure(cause: unknown, operation: string) {
	const code = cause instanceof Error ? cause.message : '';
	if (code === 'comment-already-exists') return fail(409, { error: 'comment_already_exists' as const });
	if (code === 'not-authorized' || code === 'reaction-target-not-found') {
		return fail(403, { error: `${operation}_forbidden` as const });
	}
	if (code.startsWith('invalid-')) return fail(400, { error: `${operation}_invalid` as const });
	return fail(500, { error: `${operation}_failed` as const });
}

export const actions: Actions = {
	saveAttendance: async (event) => {
		const context = actionContext(event);
		if (!context) return fail(400, { error: 'invalid_attendance_request' as const });
		const formData = await event.request.formData();
		const absentValues = formData.getAll('absentStudentAccountId');
		if (
			!hasOnlyFields(formData, ['absentStudentAccountId']) ||
			absentValues.some((value) => typeof value !== 'string' || !value.trim())
		) {
			return fail(400, { error: 'invalid_attendance_request' as const });
		}

		try {
			context.root.learningProgress.recordLessonAttendance({
				sessionToken: context.sessionToken,
				classId: context.classId,
				lessonId: context.lessonId,
				absentStudentAccountIds: absentValues as string[]
			});
			return { attendanceSuccess: true as const };
		} catch (cause) {
			if (cause instanceof Error && cause.message === 'not-authorized') {
				return fail(403, { error: 'attendance_forbidden' as const });
			}
			return fail(500, { error: 'attendance_operation_failed' as const });
		}
	},

	createHomework: async (event) => {
		const context = actionContext(event);
		if (!context) return fail(400, { error: 'invalid_homework_request' as const });
		const formData = await event.request.formData();
		if (!hasOnlyFields(formData, [])) return fail(400, { error: 'invalid_homework_request' as const });

		try {
			context.root.lessonContext.createHomework({
				sessionToken: context.sessionToken,
				classId: context.classId,
				lessonId: context.lessonId
			});
			return { homeworkSuccess: true as const };
		} catch (cause) {
			if (cause instanceof Error && cause.message === 'not-authorized') {
				return fail(403, { error: 'homework_forbidden' as const });
			}
			if (cause instanceof Error && cause.message === 'lesson-material-not-found') {
				return fail(400, { error: 'homework_material_missing' as const });
			}
			if (cause instanceof Error && cause.message === 'ambiguous-homework-selection') {
				return fail(409, { error: 'homework_ambiguous' as const });
			}
			return fail(500, { error: 'homework_operation_failed' as const });
		}
	},

	completeHomework: async (event) => {
		const context = actionContext(event);
		if (!context) return fail(400, { error: 'invalid_homework_request' as const });
		const formData = await event.request.formData();
		if (!hasOnlyFields(formData, [])) return fail(400, { error: 'invalid_homework_request' as const });

		try {
			context.root.lessonContext.completeHomework({
				sessionToken: context.sessionToken,
				classId: context.classId,
				lessonId: context.lessonId
			});
			return { homeworkSuccess: true as const };
		} catch (cause) {
			if (cause instanceof Error && cause.message === 'not-authorized') {
				return fail(403, { error: 'homework_forbidden' as const });
			}
			if (cause instanceof Error && cause.message === 'homework-not-found') {
				return fail(400, { error: 'homework_unavailable' as const });
			}
			if (cause instanceof Error && cause.message === 'ambiguous-homework-selection') {
				return fail(409, { error: 'homework_ambiguous' as const });
			}
			return fail(500, { error: 'homework_operation_failed' as const });
		}
	},

	recordGrade: async (event) => {
		const context = actionContext(event);
		if (!context) return fail(400, { error: 'invalid_homework_request' as const });
		const formData = await event.request.formData();
		if (!hasOnlyFields(formData, ['studentAccountId', 'grade'], ['studentAccountId', 'grade'])) {
			return fail(400, { error: 'invalid_homework_request' as const });
		}
		const studentAccountId = textField(formData, 'studentAccountId');
		const grade = textField(formData, 'grade');
		if (
			!studentAccountId?.trim() ||
			!grade ||
			!['α', 'β', 'γ', 'F'].includes(grade)
		) {
			return fail(400, { error: 'invalid_homework_grade' as const });
		}

		try {
			context.root.lessonContext.recordGrade({
				sessionToken: context.sessionToken,
				classId: context.classId,
				lessonId: context.lessonId,
				studentAccountId,
				grade: grade as Grade
			});
			return { homeworkSuccess: true as const };
		} catch (cause) {
			if (cause instanceof Error && cause.message === 'not-authorized') {
				return fail(403, { error: 'homework_forbidden' as const });
			}
			if (cause instanceof Error && cause.message === 'homework-not-found') {
				return fail(400, { error: 'homework_unavailable' as const });
			}
			if (cause instanceof Error && cause.message === 'ambiguous-homework-selection') {
				return fail(409, { error: 'homework_ambiguous' as const });
			}
			if (cause instanceof Error && cause.message === 'invalid-grade') {
				return fail(400, { error: 'invalid_homework_grade' as const });
			}
			return fail(500, { error: 'homework_operation_failed' as const });
		}
	},

	createPayment: async (event) => {
		const context = actionContext(event);
		if (!context) return fail(400, { error: 'invalid_payment_request' as const });
		const formData = await event.request.formData();
		if (
			!hasOnlyFields(
				formData,
				['studentAccountId', 'amount', 'factualDate', 'confirmation'],
				['studentAccountId', 'amount', 'factualDate', 'confirmation']
			)
		) {
			return fail(400, { error: 'invalid_payment_request' as const });
		}

		const studentAccountId = textField(formData, 'studentAccountId');
		const amount = textField(formData, 'amount');
		const factualDateValue = textField(formData, 'factualDate');
		const confirmation = textField(formData, 'confirmation');
		if (!studentAccountId || !amount || factualDateValue === null || !confirmation) {
			return fail(400, { error: 'invalid_payment_request' as const });
		}

		const scope = context.root.centerScheduling.getAuthorizedClassScope(
			context.sessionToken,
			context.classId
		);
		const lesson = context.root.centerScheduling
			.getLessons({ sessionToken: context.sessionToken, classId: context.classId })
			?.find((candidate) => candidate.lessonId === context.lessonId && candidate.status !== 'cancelled');
		if (
			!scope ||
			(scope.role !== 'admin' && scope.role !== 'teacher') ||
			!lesson ||
			!scope.studentAccountIds.includes(studentAccountId)
		) {
			return fail(403, { error: 'payment_forbidden' as const });
		}

		try {
			context.root.financialLedger.createPayment({
				sessionToken: context.sessionToken,
				classId: context.classId,
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
	},

	setSharedLessonMaterial: async (event) => {
		const context = actionContext(event);
		if (!context) return fail(400, { error: 'invalid_request' as const });
		const formData = await event.request.formData();
		if (
			!hasOnlyFields(formData, ['topic', 'practicalWork', 'homework'], [
				'topic',
				'practicalWork',
				'homework'
			])
		) {
			return fail(400, { error: 'invalid_request' as const });
		}
		const topic = textField(formData, 'topic');
		const practicalWork = textField(formData, 'practicalWork');
		const homework = textField(formData, 'homework');
		if (topic === null || practicalWork === null || homework === null) {
			return fail(400, { error: 'invalid_material' as const });
		}

		try {
			context.root.lessonContext.setSharedLessonMaterial({
				sessionToken: context.sessionToken,
				classId: context.classId,
				lessonId: context.lessonId,
				topic,
				practicalWork,
				homework
			});
			return { success: true as const };
		} catch (cause) {
			if (
				cause instanceof Error &&
				['invalid-topic', 'invalid-practical-work', 'invalid-homework'].includes(cause.message)
			) {
				return fail(400, { error: 'invalid_material' as const });
			}
			if (cause instanceof Error && cause.message === 'not-authorized') {
				return fail(403, { error: 'forbidden' as const });
			}
			return fail(500, { error: 'operation_failed' as const });
		}
	},

	createFieldComment: async (event) => {
		const context = actionContext(event);
		if (!context) return fail(400, { error: 'collaboration_invalid' as const });
		const formData = await event.request.formData();
		if (
			!hasOnlyFields(formData, ['scope', 'studentAccountId', 'fieldKey', 'commentId', 'body'], [
				'scope',
				'fieldKey',
				'commentId',
				'body'
			])
		) {
			return fail(400, { error: 'collaboration_invalid' as const });
		}
		const discussion = collaborationRequestFields(formData);
		const fieldKey = textField(formData, 'fieldKey');
		const commentId = textField(formData, 'commentId');
		const body = textField(formData, 'body');
		if (!discussion || !fieldKey || !commentId || !body) {
			return fail(400, { error: 'collaboration_invalid' as const });
		}

		try {
			context.root.collaboration.createFieldComment({
				sessionToken: context.sessionToken,
				classId: context.classId,
				lessonId: context.lessonId,
				...discussion,
				fieldKey,
				commentId,
				body
			});
			return { collaborationSuccess: true as const };
		} catch (cause) {
			return collaborationFailure(cause, 'comment');
		}
	},

	editFieldComment: async (event) => {
		const context = actionContext(event);
		if (!context) return fail(400, { error: 'comment_invalid' as const });
		const formData = await event.request.formData();
		if (!hasOnlyFields(formData, ['commentId', 'body'], ['commentId', 'body'])) {
			return fail(400, { error: 'comment_invalid' as const });
		}
		const commentId = textField(formData, 'commentId');
		const body = textField(formData, 'body');
		if (!commentId || !body) return fail(400, { error: 'comment_invalid' as const });

		try {
			context.root.collaboration.editFieldComment({
				sessionToken: context.sessionToken,
				classId: context.classId,
				lessonId: context.lessonId,
				studentAccountId: context.studentAccountId,
				commentId,
				body
			});
			return { collaborationSuccess: true as const };
		} catch (cause) {
			return collaborationFailure(cause, 'comment');
		}
	},

	setReaction: async (event) => {
		const context = actionContext(event);
		if (!context) return fail(400, { error: 'reaction_invalid' as const });
		const formData = await event.request.formData();
		if (
			!hasOnlyFields(formData, ['scope', 'studentAccountId', 'targetType', 'targetId', 'reaction'], [
				'scope',
				'targetType',
				'targetId',
				'reaction'
			])
		) {
			return fail(400, { error: 'reaction_invalid' as const });
		}
		const discussion = collaborationRequestFields(formData);
		const targetType = textField(formData, 'targetType');
		const targetId = textField(formData, 'targetId');
		const reaction = textField(formData, 'reaction');
		if (!discussion || !targetType || !targetId || !reaction) {
			return fail(400, { error: 'reaction_invalid' as const });
		}

		try {
			context.root.collaboration.setReaction({
				sessionToken: context.sessionToken,
				classId: context.classId,
				lessonId: context.lessonId,
				...discussion,
				targetType: targetType as 'field' | 'comment' | 'message',
				targetId,
				reaction: reaction as 'like' | 'love' | 'laugh' | 'celebrate' | 'question'
			});
			return { collaborationSuccess: true as const };
		} catch (cause) {
			return collaborationFailure(cause, 'reaction');
		}
	},

	createMessage: async (event) => {
		const context = actionContext(event);
		if (!context) return fail(400, { error: 'message_invalid' as const });
		const formData = await event.request.formData();
		if (
			!hasOnlyFields(formData, ['scope', 'studentAccountId', 'messageId', 'body'], [
				'scope',
				'messageId',
				'body'
			])
		) {
			return fail(400, { error: 'message_invalid' as const });
		}
		const discussion = collaborationRequestFields(formData);
		const messageId = textField(formData, 'messageId');
		const body = textField(formData, 'body');
		if (!discussion || !messageId || !body) return fail(400, { error: 'message_invalid' as const });

		try {
			context.root.collaboration.createMessage({
				sessionToken: context.sessionToken,
				classId: context.classId,
				lessonId: context.lessonId,
				...discussion,
				messageId,
				body
			});
			return { collaborationSuccess: true as const };
		} catch (cause) {
			return collaborationFailure(cause, 'message');
		}
	},

	replyToMessage: async (event) => {
		const context = actionContext(event);
		if (!context) return fail(400, { error: 'reply_invalid' as const });
		const formData = await event.request.formData();
		if (
			!hasOnlyFields(formData, ['scope', 'studentAccountId', 'parentMessageId', 'messageId', 'body'], [
				'scope',
				'parentMessageId',
				'messageId',
				'body'
			])
		) {
			return fail(400, { error: 'reply_invalid' as const });
		}
		const discussion = collaborationRequestFields(formData);
		const parentMessageId = textField(formData, 'parentMessageId');
		const messageId = textField(formData, 'messageId');
		const body = textField(formData, 'body');
		if (!discussion || !parentMessageId || !messageId || !body) {
			return fail(400, { error: 'reply_invalid' as const });
		}

		try {
			context.root.collaboration.replyToMessage({
				sessionToken: context.sessionToken,
				classId: context.classId,
				lessonId: context.lessonId,
				...discussion,
				parentMessageId,
				messageId,
				body
			});
			return { collaborationSuccess: true as const };
		} catch (cause) {
			return collaborationFailure(cause, 'reply');
		}
	}
};
