import { randomUUID } from 'node:crypto';
import {
	error as kitError,
	fail,
	redirect,
	type ActionFailure,
	type RequestEvent
} from '@sveltejs/kit';
import { getCompositionRoot } from '$lib/server/composition-root';
import type {
	AdminCenterView,
	CenterSchedulingBoundary,
	ClassMode
} from '$lib/server/modules/center-scheduling/public';
import {
	getAdminProvisioningTransport,
	type AdminProvisioningTransport
} from './provisioning.server';

type AdminCenterPort = Pick<
	CenterSchedulingBoundary,
	| 'getAdminCenter'
	| 'createClass'
	| 'updateClass'
	| 'deleteClass'
	| 'createRecurringSchedule'
	| 'assignTeacher'
	| 'removeTeacherAssignment'
	| 'removeCenterParticipant'
>;

type ProvisioningPort = Pick<AdminProvisioningTransport, 'provision' | 'provisionPassword'>;

type SuccessMessage =
	| 'class_created'
	| 'class_updated'
	| 'class_deleted'
	| 'schedule_created'
	| 'teacher_assigned'
	| 'teacher_removed'
	| 'teacher_membership_removed'
	| 'participant_created'
	| 'invitation_created';

type DashboardError =
	| 'unauthorized'
	| 'forbidden'
	| 'invalid_request'
	| 'invalid_name'
	| 'invalid_mode'
	| 'invalid_schedule'
	| 'schedule_conflict'
	| 'invalid_teacher'
	| 'invalid_role'
	| 'invalid_email'
	| 'invalid_password'
	| 'invalid_parent_student'
	| 'email_exists'
	| 'conflict'
	| 'provisioning_failed'
	| 'operation_failed';

type DashboardSuccess = {
	ok: true;
	message: SuccessMessage;
	invitationUrl?: string;
	participantEmail?: string;
	status?: 'pending';
	expiresAt?: string;
};

type DashboardFailure = ActionFailure<{ error: DashboardError }>;
type DashboardResult = DashboardSuccess | DashboardFailure;
type DashboardAction = (event: RequestEvent) => Promise<DashboardResult>;

export type AdminDashboardActions = {
	createClass: DashboardAction;
	updateClass: DashboardAction;
	deleteClass: DashboardAction;
	createSchedule: DashboardAction;
	assignTeacher: DashboardAction;
	removeTeacher: DashboardAction;
	removeTeacherMembership: DashboardAction;
	createParticipant: DashboardAction;
	inviteParticipant: DashboardAction;
};

function sessionToken(event: RequestEvent): string | undefined {
	return event.cookies.get('foundation_session');
}

function messageOf(cause: unknown): string {
	return cause instanceof Error ? cause.message : '';
}

function field(formData: FormData, name: string): string | null {
	const value = formData.get(name);
	return typeof value === 'string' ? value : null;
}

function classMode(value: string | null): ClassMode | null {
	return value === 'individual' || value === 'group' ? value : null;
}

function actionError(cause: unknown): DashboardFailure {
	const message = messageOf(cause);
	if (message === 'not-authorized' || message === 'center-not-found') {
		return fail(403, { error: 'forbidden' });
	}
	if (message === 'invalid-class-name') {
		return fail(400, { error: 'invalid_name' });
	}
	if (message === 'invalid-class-mode') {
		return fail(400, { error: 'invalid_mode' });
	}
	if (
		message === 'invalid-weekdays' ||
		message === 'invalid-date-range' ||
		message === 'invalid-iso-date' ||
		message === 'invalid-schedule-occurrences'
	) {
		return fail(400, { error: 'invalid_schedule' });
	}
	if (message === 'schedule-date-conflict') {
		return fail(409, { error: 'schedule_conflict' });
	}
	if (
		message === 'individual-class-capacity-exceeded' ||
		message.includes('UNIQUE constraint failed')
	) {
		return fail(409, { error: 'conflict' });
	}
	return fail(500, { error: 'operation_failed' });
}

function loadAdminCenter(event: RequestEvent, centerScheduling: AdminCenterPort): AdminCenterView {
	const centerId = event.params.centerId;
	if (!centerId) {
		throw new Error('not-authorized');
	}
	return centerScheduling.getAdminCenter({
		sessionToken: sessionToken(event),
		centerId
	});
}

function requireClass(center: AdminCenterView, classId: string | null): string {
	if (!classId || !center.classes.some((classView) => classView.classId === classId)) {
		throw new Error('not-authorized');
	}
	return classId;
}

function requireTeacher(center: AdminCenterView, accountId: string | null): string {
	if (
		!accountId ||
		!center.participants.some(
			(participant) => participant.accountId === accountId && participant.role === 'teacher'
		)
	) {
		throw new Error('invalid-teacher');
	}
	return accountId;
}

async function authorizedAction(
	event: RequestEvent,
	centerScheduling: AdminCenterPort,
	operation: (center: AdminCenterView, formData: FormData) => DashboardSuccess
): Promise<DashboardResult> {
	if (!event.locals.actor) {
		return fail(401, { error: 'unauthorized' });
	}
	if (event.locals.actor.role !== 'admin') {
		return fail(403, { error: 'forbidden' });
	}

	try {
		const center = loadAdminCenter(event, centerScheduling);
		return operation(center, await event.request.formData());
	} catch (cause) {
		if (messageOf(cause) === 'invalid-teacher') {
			return fail(400, { error: 'invalid_teacher' });
		}
		return actionError(cause);
	}
}

export function createAdminDashboardPageLoad(
	centerScheduling: AdminCenterPort = getCompositionRoot().centerScheduling
): (event: RequestEvent) => AdminCenterView {
	return (event) => {
		if (!event.locals.actor) {
			throw redirect(303, '/login');
		}
		if (event.locals.actor.role !== 'admin') {
			throw kitError(403, 'Forbidden');
		}

		try {
			return loadAdminCenter(event, centerScheduling);
		} catch (cause) {
			if (
				messageOf(cause) === 'not-authorized' ||
				messageOf(cause) === 'center-not-found'
			) {
				throw kitError(403, 'Forbidden');
			}
			throw kitError(500, 'Admin center could not be loaded');
		}
	};
}

export function createAdminDashboardActions(
	centerScheduling: AdminCenterPort = getCompositionRoot().centerScheduling,
	provisioning: ProvisioningPort = getAdminProvisioningTransport()
): AdminDashboardActions {
	return {
		createClass: (event) =>
			authorizedAction(event, centerScheduling, (center, formData) => {
				const name = field(formData, 'name');
				const mode = classMode(field(formData, 'mode'));
				if (!name?.trim()) {
					throw new Error('invalid-class-name');
				}
				if (!mode) {
					throw new Error('invalid-class-mode');
				}
				centerScheduling.createClass({
					sessionToken: sessionToken(event),
					centerId: center.centerId,
					classId: randomUUID(),
					name,
					mode
				});
				return { ok: true, message: 'class_created' };
			}),

		updateClass: (event) =>
			authorizedAction(event, centerScheduling, (center, formData) => {
				const classId = requireClass(center, field(formData, 'classId'));
				const name = field(formData, 'name');
				const mode = classMode(field(formData, 'mode'));
				if (!name?.trim()) {
					throw new Error('invalid-class-name');
				}
				if (!mode) {
					throw new Error('invalid-class-mode');
				}
				centerScheduling.updateClass({
					sessionToken: sessionToken(event),
					classId,
					name,
					mode
				});
				return { ok: true, message: 'class_updated' };
			}),

		deleteClass: (event) =>
			authorizedAction(event, centerScheduling, (center, formData) => {
				centerScheduling.deleteClass({
					sessionToken: sessionToken(event),
					classId: requireClass(center, field(formData, 'classId'))
				});
				return { ok: true, message: 'class_deleted' };
			}),

		createSchedule: (event) =>
			authorizedAction(event, centerScheduling, (center, formData) => {
				const classId = requireClass(center, field(formData, 'classId'));
				const startDate = field(formData, 'startDate');
				const endDate = field(formData, 'endDate');
				const weekdays = formData
					.getAll('weekdays')
					.map((value) => (typeof value === 'string' ? Number(value) : Number.NaN));
				if (!startDate || !endDate) {
					throw new Error('invalid-date-range');
				}
				centerScheduling.createRecurringSchedule({
					sessionToken: sessionToken(event),
					classId,
					scheduleId: randomUUID(),
					startDate,
					endDate,
					weekdays
				});
				return { ok: true, message: 'schedule_created' };
			}),

		assignTeacher: (event) =>
			authorizedAction(event, centerScheduling, (center, formData) => {
				centerScheduling.assignTeacher({
					sessionToken: sessionToken(event),
					classId: requireClass(center, field(formData, 'classId')),
					teacherAccountId: requireTeacher(center, field(formData, 'teacherAccountId'))
				});
				return { ok: true, message: 'teacher_assigned' };
			}),

		removeTeacher: (event) =>
			authorizedAction(event, centerScheduling, (center, formData) => {
				centerScheduling.removeTeacherAssignment({
					sessionToken: sessionToken(event),
					classId: requireClass(center, field(formData, 'classId')),
					teacherAccountId: requireTeacher(center, field(formData, 'teacherAccountId'))
				});
				return { ok: true, message: 'teacher_removed' };
			}),

		removeTeacherMembership: (event) =>
			authorizedAction(event, centerScheduling, (center, formData) => {
				centerScheduling.removeCenterParticipant({
					sessionToken: sessionToken(event),
					centerId: center.centerId,
					accountId: requireTeacher(center, field(formData, 'teacherAccountId'))
				});
				return { ok: true, message: 'teacher_membership_removed' };
			}),

		inviteParticipant: async (event) => {
			if (!event.locals.actor) {
				return fail(401, { error: 'unauthorized' });
			}
			if (event.locals.actor.role !== 'admin') {
				return fail(403, { error: 'forbidden' });
			}
			try {
				loadAdminCenter(event, centerScheduling);
			} catch (cause) {
				return actionError(cause);
			}
			const formData = await event.request.formData();
			const result = provisioning.provision(event, formData.get('role'));
			if (!result.ok) {
				return fail(result.status, { error: result.error });
			}
			return {
				ok: true,
				message: 'invitation_created',
				invitationUrl: result.invitationUrl,
				status: result.status,
				expiresAt: result.expiresAt
			};
		},

		createParticipant: async (event) => {
			if (!event.locals.actor) {
				return fail(401, { error: 'unauthorized' });
			}
			if (event.locals.actor.role !== 'admin') {
				return fail(403, { error: 'forbidden' });
			}
			try {
				loadAdminCenter(event, centerScheduling);
			} catch (cause) {
				return actionError(cause);
			}
			const formData = await event.request.formData();
			const result = provisioning.provisionPassword(event, {
				role: formData.get('role'),
				email: formData.get('email'),
				password: formData.get('password'),
				studentAccountId: formData.get('studentAccountId')
			});
			if (!result.ok) {
				return fail(result.status, { error: result.error });
			}
			return {
				ok: true,
				message: 'participant_created',
				participantEmail: result.email
			};
		}
	};
}
