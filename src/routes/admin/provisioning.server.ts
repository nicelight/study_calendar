import { randomBytes } from 'node:crypto';
import type { RequestEvent } from '@sveltejs/kit';
import type {
	CenterSchedulingBoundary,
	ParticipantRequest
} from '$lib/server/modules/center-scheduling/public';
import type { ActorContext } from '$lib/server/modules/identity-access/public';
import { getCompositionRoot } from '$lib/server/composition-root';

const INVITATION_LIFETIME_MS = 24 * 60 * 60 * 1000;

type AdminEvent = Pick<RequestEvent, 'params' | 'locals' | 'cookies' | 'url'>;
type ParticipantRole = ParticipantRequest['role'];
type FailureStatus = 400 | 401 | 403 | 409 | 500;

type CenterSchedulingProvisioningPort = Pick<
	CenterSchedulingBoundary,
	'getAuthorizedCenterAdminScope' | 'createParticipant' | 'createPasswordParticipant'
>;

export type AdminPageData = {
	centerId: string;
};

export type AdminProvisioningSuccess = {
	ok: true;
	invitationUrl: string;
	status: 'pending';
	expiresAt: string;
};

export type AdminProvisioningFailure = {
	ok: false;
	status: FailureStatus;
	error:
		| 'invalid_role'
		| 'invalid_email'
		| 'invalid_password'
		| 'invalid_parent_student'
		| 'email_exists'
		| 'unauthorized'
		| 'forbidden'
		| 'provisioning_failed';
};

export type AdminProvisioningResult = AdminProvisioningSuccess | AdminProvisioningFailure;

export type AdminPasswordProvisioningSuccess = {
	ok: true;
	email: string;
	role: ParticipantRole;
};

export type AdminPasswordProvisioningResult =
	| AdminPasswordProvisioningSuccess
	| AdminProvisioningFailure;

type AdminProvisioningOptions = {
	now?: () => Date;
};

function isParticipantRole(value: unknown): value is ParticipantRole {
	return value === 'teacher' || value === 'student' || value === 'parent';
}

function failure(
	status: FailureStatus,
	error: AdminProvisioningFailure['error']
): AdminProvisioningFailure {
	return { ok: false, status, error };
}

function messageOf(cause: unknown): string {
	return cause instanceof Error ? cause.message : '';
}

export class AdminProvisioningTransport {
	private readonly now: () => Date;

	constructor(
		private readonly centerScheduling: CenterSchedulingProvisioningPort,
		options: AdminProvisioningOptions = {}
	) {
		this.now = options.now ?? (() => new Date());
	}

	page(event: AdminEvent): AdminPageData {
		const centerId = event.params.centerId;
		if (!centerId) {
			throw new Error('not-found');
		}

		if (!event.locals.actor) {
			throw new Error('unauthorized');
		}

		if (!this.isOwnCenterAdmin(event.locals.actor, centerId)) {
			throw new Error('forbidden');
		}

		return { centerId };
	}

	provision(event: AdminEvent, roleValue: unknown): AdminProvisioningResult {
		const centerId = event.params.centerId;
		if (!centerId) {
			return failure(400, 'forbidden');
		}

		// This is a route-level guard. The public command below repeats the check
		// from the server-issued session token immediately before mutation.
		if (!event.locals.actor) {
			return failure(401, 'unauthorized');
		}
		if (!this.isOwnCenterAdmin(event.locals.actor, centerId)) {
			return failure(403, 'forbidden');
		}
		if (!isParticipantRole(roleValue)) {
			return failure(400, 'invalid_role');
		}

		const accountId = `account_${randomBytes(16).toString('hex')}`;
		const invitationToken = randomBytes(32).toString('base64url');
		const expiresAt = new Date(this.now().getTime() + INVITATION_LIFETIME_MS).toISOString();

		try {
			this.centerScheduling.createParticipant({
				sessionToken: event.cookies.get('foundation_session'),
				centerId,
				accountId,
				role: roleValue,
				invitationToken,
				expiresAt
			});
		} catch (cause) {
			// Authorization failures are safe to expose; persistence/provider details
			// remain opaque to the browser and API caller.
			if (messageOf(cause) === 'not-authorized') {
				return failure(403, 'forbidden');
			}
			return failure(500, 'provisioning_failed');
		}

		return {
			ok: true,
			invitationUrl: new URL(`/invite/${encodeURIComponent(invitationToken)}`, event.url.origin).toString(),
			status: 'pending',
			expiresAt
		};
	}

	provisionPassword(
		event: AdminEvent,
		fields: {
			role: unknown;
			email: unknown;
			password: unknown;
			studentAccountId?: unknown;
		}
	): AdminPasswordProvisioningResult {
		const centerId = event.params.centerId;
		if (!centerId) {
			return failure(400, 'forbidden');
		}
		if (!event.locals.actor) {
			return failure(401, 'unauthorized');
		}
		if (!this.isOwnCenterAdmin(event.locals.actor, centerId)) {
			return failure(403, 'forbidden');
		}
		if (!isParticipantRole(fields.role)) {
			return failure(400, 'invalid_role');
		}

		const email = typeof fields.email === 'string' ? fields.email.trim().toLowerCase() : '';
		const password = typeof fields.password === 'string' ? fields.password : '';
		const studentAccountId =
			typeof fields.studentAccountId === 'string' && fields.studentAccountId
				? fields.studentAccountId
				: undefined;
		if (!email) return failure(400, 'invalid_email');
		if (!password) return failure(400, 'invalid_password');
		if (fields.role === 'parent' && !studentAccountId) {
			return failure(400, 'invalid_parent_student');
		}

		const accountId = `account_${randomBytes(16).toString('hex')}`;
		try {
			this.centerScheduling.createPasswordParticipant({
				sessionToken: event.cookies.get('foundation_session'),
				centerId,
				accountId,
				role: fields.role,
				email,
				password,
				studentAccountId
			});
		} catch (cause) {
			const message = messageOf(cause);
			if (message === 'not-authorized') return failure(403, 'forbidden');
			if (message === 'invalid-email') return failure(400, 'invalid_email');
			if (message === 'invalid-password') return failure(400, 'invalid_password');
			if (message === 'invalid-parent-student') return failure(400, 'invalid_parent_student');
			if (message.includes('UNIQUE constraint failed: password_credentials.email')) {
				return failure(409, 'email_exists');
			}
			return failure(500, 'provisioning_failed');
		}

		return { ok: true, email, role: fields.role };
	}

	private isOwnCenterAdmin(actor: ActorContext, centerId: string): boolean {
		return Boolean(this.centerScheduling.getAuthorizedCenterAdminScope(actor, centerId));
	}
}

export function createAdminProvisioningTransport(
	centerScheduling: CenterSchedulingProvisioningPort = getCompositionRoot().centerScheduling,
	options?: AdminProvisioningOptions
): AdminProvisioningTransport {
	return new AdminProvisioningTransport(centerScheduling, options);
}

let defaultTransport: AdminProvisioningTransport | undefined;

export function getAdminProvisioningTransport(): AdminProvisioningTransport {
	defaultTransport ??= createAdminProvisioningTransport();
	return defaultTransport;
}
