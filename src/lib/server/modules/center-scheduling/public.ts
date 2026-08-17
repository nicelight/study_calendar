import { randomUUID } from 'node:crypto';
import {
	IdentityAccessBoundary,
	type ActorContext,
	type AccountProvisioning,
	type Role
} from '$lib/server/modules/identity-access/public';
import type { SharedDatabase } from '$lib/server/platform/database';

export type CenterScope = {
	centerId: string;
	accountId: string;
	role: Role;
};

export type ClassMode = 'individual' | 'group';

export type CenterView = {
	centerId: string;
	name: string;
};

export type AdminParticipantView = {
	accountId: string;
	role: Role;
};

export type AdminClassView = {
	classId: string;
	name: string;
	mode: ClassMode;
	teacherAccountIds: string[];
	studentCount: number;
	schedules: ScheduleView[];
};

export type AdminCenterView = CenterView & {
	participants: AdminParticipantView[];
	classes: AdminClassView[];
};

export type AdminEntry =
	| { mode: 'bootstrap' }
	| ({ mode: 'center' } & CenterView);

export type AuthorizedClassScope = CenterScope & {
	classId: string;
	className: string;
	mode: ClassMode;
	studentAccountIds: string[];
};

export type LessonStatus = 'planned' | 'completed' | 'cancelled';

export type RecurringScheduleRequest = {
	sessionToken?: string;
	classId: string;
	scheduleId: string;
	startDate: string;
	endDate: string;
	weekdays: number[];
};

export type ScheduleView = {
	scheduleId: string;
	centerId: string;
	classId: string;
	startDate: string;
	endDate: string;
	weekdays: number[];
	createdByAccountId: string;
	createdAt: string;
};

export type LessonView = {
	lessonId: string;
	centerId: string;
	classId: string;
	scheduleId: string;
	lessonDate: string;
	status: LessonStatus;
	createdByAccountId: string;
	createdAt: string;
};

export type AccountProvisioningRequest = {
	sessionToken?: string;
	centerId: string;
	accountId: string;
	role: Role;
	invitationToken: string;
	expiresAt?: string;
};

export type ParticipantRequest = Omit<AccountProvisioningRequest, 'role'> & {
	role: Exclude<Role, 'admin'>;
};

type ClassRow = {
	id: string;
	center_id: string;
	name: string;
	mode: ClassMode;
};

type ScheduleRow = {
	id: string;
	center_id: string;
	class_id: string;
	start_date: string;
	end_date: string;
	weekdays: string;
	created_by_account_id: string;
	created_at: string;
};

type LessonRow = {
	id: string;
	center_id: string;
	class_id: string;
	schedule_id: string;
	lesson_date: string;
	status: LessonStatus;
	created_by_account_id: string;
	created_at: string;
};

type ParticipantRow = {
	account_id: string;
	role: Role;
};

type IdentityAccessProvisioningPort = Pick<IdentityAccessBoundary, 'resolveActor'> & {
	provisionAccount: (provisioning: AccountProvisioning) => void;
};

type CenterSchedulingOptions = {
	now?: () => Date;
	centerIdFactory?: () => string;
};

export class CenterSchedulingBoundary {
	private readonly now: () => Date;
	private readonly centerIdFactory: () => string;

	constructor(
		private readonly database: SharedDatabase,
		private readonly identityAccess: IdentityAccessProvisioningPort,
		options: CenterSchedulingOptions = {}
	) {
		this.now = options.now ?? (() => new Date());
		this.centerIdFactory = options.centerIdFactory ?? randomUUID;
	}

	getAdminEntry(request: { sessionToken?: string }): AdminEntry {
		const actor = this.identityAccess.resolveActor(request.sessionToken);
		if (!actor || actor.role !== 'admin') {
			throw new Error('not-authorized');
		}

		const center = this.database.sqlite
			.prepare(
				`SELECT centers.id, centers.name
				 FROM center_memberships
				 JOIN centers ON centers.id = center_memberships.center_id
				 WHERE center_memberships.account_id = ?
				 ORDER BY centers.id
				 LIMIT 1`
			)
			.get(actor.accountId) as { id: string; name: string } | undefined;

		return center
			? { mode: 'center', centerId: center.id, name: center.name }
			: { mode: 'bootstrap' };
	}

	createBootstrapCenter(request: { sessionToken?: string; name: string }): CenterView {
		const name = typeof request.name === 'string' ? request.name.trim() : '';
		if (!name) {
			throw new Error('invalid-center-name');
		}

		return this.database.transaction(() => {
			const actor = this.identityAccess.resolveActor(request.sessionToken);
			if (!actor || actor.role !== 'admin') {
				throw new Error('not-authorized');
			}

			const existingMembership = this.database.sqlite
				.prepare('SELECT 1 FROM center_memberships WHERE account_id = ? LIMIT 1')
				.get(actor.accountId);
			if (existingMembership) {
				throw new Error('bootstrap-center-already-created');
			}

			const centerId = this.centerIdFactory();
			this.database.sqlite
				.prepare('INSERT INTO centers (id, name) VALUES (?, ?)')
				.run(centerId, name);
			this.database.sqlite
				.prepare('INSERT INTO center_memberships (center_id, account_id) VALUES (?, ?)')
				.run(centerId, actor.accountId);

			return { centerId, name };
		});
	}

	getAdminCenter(request: { sessionToken?: string; centerId: string }): AdminCenterView {
		const actor = this.identityAccess.resolveActor(request.sessionToken);
		if (!this.getAuthorizedCenterAdminScope(actor, request.centerId)) {
			throw new Error('not-authorized');
		}

		const center = this.database.sqlite
			.prepare('SELECT id, name FROM centers WHERE id = ?')
			.get(request.centerId) as { id: string; name: string } | undefined;
		if (!center) {
			throw new Error('center-not-found');
		}

		const participants = this.database.sqlite
			.prepare(
				`SELECT center_memberships.account_id, accounts.role
				 FROM center_memberships
				 JOIN accounts ON accounts.id = center_memberships.account_id
				 WHERE center_memberships.center_id = ?
				 ORDER BY accounts.role, center_memberships.account_id`
			)
			.all(request.centerId) as ParticipantRow[];
		const classes = this.database.sqlite
			.prepare(
				`SELECT id, center_id, name, mode
				 FROM classes
				 WHERE center_id = ?
				 ORDER BY name, id`
			)
			.all(request.centerId) as ClassRow[];

		return {
			centerId: center.id,
			name: center.name,
			participants: participants.map((participant) => ({
				accountId: participant.account_id,
				role: participant.role
			})),
			classes: classes.map((classRow) => ({
				classId: classRow.id,
				name: classRow.name,
				mode: classRow.mode,
				teacherAccountIds: this.getClassTeacherIds(classRow.id),
				studentCount: this.getClassStudentCount(classRow.id),
				schedules: this.getScheduleViewsForClass(classRow.id)
			}))
		};
	}

	provisionAccount(request: AccountProvisioningRequest): void {
		const actor = this.identityAccess.resolveActor(request.sessionToken);
		if (!this.getAuthorizedCenterAdminScope(actor, request.centerId)) {
			throw new Error('not-authorized');
		}

		this.identityAccess.provisionAccount({
			accountId: request.accountId,
			role: request.role,
			invitationToken: request.invitationToken,
			expiresAt: request.expiresAt
		});
	}

	createParticipant(request: ParticipantRequest): void {
		if (!['teacher', 'student', 'parent'].includes(request.role)) {
			throw new Error('invalid-participant-role');
		}

		const actor = this.identityAccess.resolveActor(request.sessionToken);
		if (!this.getAuthorizedCenterAdminScope(actor, request.centerId)) {
			throw new Error('not-authorized');
		}

		this.database.transaction(() => {
			this.identityAccess.provisionAccount({
				accountId: request.accountId,
				role: request.role,
				invitationToken: request.invitationToken,
				expiresAt: request.expiresAt
			});
			this.database.sqlite
				.prepare('INSERT INTO center_memberships (center_id, account_id) VALUES (?, ?)')
				.run(request.centerId, request.accountId);
		});
	}

	removeCenterParticipant(request: {
		sessionToken?: string;
		centerId: string;
		accountId: string;
	}): void {
		const actor = this.identityAccess.resolveActor(request.sessionToken);
		if (!this.getAuthorizedCenterAdminScope(actor, request.centerId)) {
			throw new Error('not-authorized');
		}

		this.database.sqlite
			.prepare('DELETE FROM center_memberships WHERE center_id = ? AND account_id = ?')
			.run(request.centerId, request.accountId);
	}

	createClass(request: {
		sessionToken?: string;
		centerId: string;
		classId: string;
		name: string;
		mode: ClassMode;
	}): void {
		this.requireClassMode(request.mode);
		const name = this.requireName(request.name, 'invalid-class-name');
		const actor = this.identityAccess.resolveActor(request.sessionToken);
		if (!this.getAuthorizedCenterAdminScope(actor, request.centerId)) {
			throw new Error('not-authorized');
		}

		this.database.sqlite
			.prepare('INSERT INTO classes (id, center_id, name, mode) VALUES (?, ?, ?, ?)')
			.run(request.classId, request.centerId, name, request.mode);
	}

	updateClass(request: {
		sessionToken?: string;
		classId: string;
		name: string;
		mode: ClassMode;
	}): void {
		this.requireClassMode(request.mode);
		const name = this.requireName(request.name, 'invalid-class-name');
		const classRow = this.requireAuthorizedClassAdmin(request.sessionToken, request.classId);
		if (request.mode === 'individual' && this.getClassStudentCount(classRow.id) > 1) {
			throw new Error('individual-class-capacity-exceeded');
		}
		this.database.sqlite
			.prepare('UPDATE classes SET name = ?, mode = ? WHERE id = ? AND center_id = ?')
			.run(name, request.mode, classRow.id, classRow.center_id);
	}

	deleteClass(request: { sessionToken?: string; classId: string }): void {
		const classRow = this.requireAuthorizedClassAdmin(request.sessionToken, request.classId);
		this.database.sqlite
			.prepare('DELETE FROM classes WHERE id = ? AND center_id = ?')
			.run(classRow.id, classRow.center_id);
	}

	assignTeacher(request: {
		sessionToken?: string;
		classId: string;
		teacherAccountId: string;
	}): void {
		const classRow = this.requireAuthorizedClassAdmin(request.sessionToken, request.classId);
		this.requireCenterMemberRole(classRow.center_id, request.teacherAccountId, 'teacher');
		this.database.sqlite
			.prepare(
				'INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id) VALUES (?, ?, ?)'
			)
			.run(classRow.center_id, classRow.id, request.teacherAccountId);
	}

	removeTeacherAssignment(request: {
		sessionToken?: string;
		classId: string;
		teacherAccountId: string;
	}): void {
		const classRow = this.requireAuthorizedClassAdmin(request.sessionToken, request.classId);
		this.database.sqlite
			.prepare(
				'DELETE FROM teacher_assignments WHERE center_id = ? AND class_id = ? AND teacher_account_id = ?'
			)
			.run(classRow.center_id, classRow.id, request.teacherAccountId);
	}

	createRecurringSchedule(request: RecurringScheduleRequest): LessonView[] {
		return this.database.transaction(() => {
			const { actor, scope } = this.requireScheduleMutationScope(
				request.sessionToken,
				request.classId
			);
			const weekdays = this.normalizeWeekdays(request.weekdays);
			const dates = this.getRecurringDates(request.startDate, request.endDate, weekdays);
			if (dates.length === 0) {
				throw new Error('invalid-schedule-occurrences');
			}

			const datePlaceholders = dates.map(() => '?').join(', ');
			const overlappingLessons = this.database.sqlite
				.prepare(
					`SELECT status
					 FROM lessons
					 WHERE class_id = ? AND lesson_date IN (${datePlaceholders})`
				)
				.all(scope.classId, ...dates) as Array<{ status: LessonStatus }>;
			if (overlappingLessons.some((lesson) => lesson.status !== 'planned')) {
				throw new Error('schedule-date-conflict');
			}

			this.database.sqlite
				.prepare(
					`DELETE FROM lessons
					 WHERE class_id = ? AND status = 'planned' AND lesson_date IN (${datePlaceholders})`
				)
				.run(scope.classId, ...dates);
			this.database.sqlite
				.prepare(
					`DELETE FROM schedules
					 WHERE class_id = ?
					   AND NOT EXISTS (
							SELECT 1 FROM lessons WHERE lessons.schedule_id = schedules.id
					   )`
				)
				.run(scope.classId);
			const createdAt = this.now().toISOString();

			this.database.sqlite
				.prepare(
					`INSERT INTO schedules (
						id,
						center_id,
						class_id,
						start_date,
						end_date,
						weekdays,
						created_by_account_id,
						created_at
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
				)
				.run(
					request.scheduleId,
					scope.centerId,
					scope.classId,
					request.startDate,
					request.endDate,
					JSON.stringify(weekdays),
					actor.accountId,
					createdAt
				);

			const insertLesson = this.database.sqlite.prepare(
				`INSERT INTO lessons (
					id,
					center_id,
					class_id,
					schedule_id,
					lesson_date,
					status,
					created_by_account_id,
					created_at
				) VALUES (?, ?, ?, ?, ?, 'planned', ?, ?)`
			);
			const lessonIds: string[] = [];
			for (const lessonDate of dates) {
				const lessonId = `${request.scheduleId}:${lessonDate}`;
				insertLesson.run(
					lessonId,
					scope.centerId,
					scope.classId,
					request.scheduleId,
					lessonDate,
					actor.accountId,
					createdAt
				);
				lessonIds.push(lessonId);
			}

			return lessonIds.map((lessonId) => this.requireLessonView(lessonId));
		});
	}

	addLesson(request: {
		sessionToken?: string;
		scheduleId: string;
		lessonId: string;
		lessonDate: string;
	}): LessonView {
		return this.database.transaction(() => {
			const schedule = this.getSchedule(request.scheduleId);
			if (!schedule) {
				throw new Error('schedule-not-found');
			}
			const { actor, scope } = this.requireScheduleMutationScope(
				request.sessionToken,
				schedule.class_id
			);
			this.requireIsoDate(request.lessonDate);
			const createdAt = this.now().toISOString();
			this.database.sqlite
				.prepare(
					`INSERT INTO lessons (
						id,
						center_id,
						class_id,
						schedule_id,
						lesson_date,
						status,
						created_by_account_id,
						created_at
					) VALUES (?, ?, ?, ?, ?, 'planned', ?, ?)`
				)
				.run(
					request.lessonId,
					scope.centerId,
					scope.classId,
					request.scheduleId,
					request.lessonDate,
					actor.accountId,
					createdAt
				);

			return this.requireLessonView(request.lessonId);
		});
	}

	transferLesson(request: {
		sessionToken?: string;
		lessonId: string;
		lessonDate: string;
	}): LessonView {
		return this.database.transaction(() => {
			const lesson = this.getLesson(request.lessonId);
			if (!lesson) {
				throw new Error('lesson-not-found');
			}
			this.requireScheduleMutationScope(request.sessionToken, lesson.class_id);
			if (lesson.status !== 'planned') {
				throw new Error('lesson-not-planned');
			}
			this.requireIsoDate(request.lessonDate);
			this.database.sqlite
				.prepare('UPDATE lessons SET lesson_date = ? WHERE id = ?')
				.run(request.lessonDate, request.lessonId);
			return this.requireLessonView(request.lessonId);
		});
	}

	cancelLesson(request: { sessionToken?: string; lessonId: string }): LessonView {
		return this.database.transaction(() => {
			const lesson = this.getLesson(request.lessonId);
			if (!lesson) {
				throw new Error('lesson-not-found');
			}
			this.requireScheduleMutationScope(request.sessionToken, lesson.class_id);
			if (lesson.status === 'completed') {
				throw new Error('lesson-not-cancellable');
			}
			this.database.sqlite
				.prepare("UPDATE lessons SET status = 'cancelled' WHERE id = ?")
				.run(request.lessonId);
			return this.requireLessonView(request.lessonId);
		});
	}

	getLessons(request: { sessionToken?: string; classId: string }): LessonView[] | null {
		const actor = this.identityAccess.resolveActor(request.sessionToken);
		const scope = actor ? this.getAuthorizedClassScopeForActor(actor, request.classId) : null;
		return scope ? this.getLessonViewsForClass(request.classId) : null;
	}

	getFinancialClassScope(
		actor: ActorContext,
		classId: string,
		studentAccountId?: string
	): { centerId: string; classId: string; studentAccountIds: string[] } | null {
		const scope = this.getAuthorizedClassScopeForActor(actor, classId);
		if (!scope || (studentAccountId && !scope.studentAccountIds.includes(studentAccountId))) {
			return null;
		}
		return {
			centerId: scope.centerId,
			classId: scope.classId,
			studentAccountIds: scope.studentAccountIds
		};
	}

	getFinancialLessonFacts(
		actor: ActorContext,
		lessonId: string,
		studentAccountId: string
	): {
		centerId: string;
		classId: string;
		lessonId: string;
		studentAccountId: string;
		lessonDate: string;
	} | null {
		const lesson = this.getLesson(lessonId);
		if (!lesson || lesson.status === 'cancelled') {
			return null;
		}
		const scope = this.getFinancialClassScope(actor, lesson.class_id, studentAccountId);
		return scope
			? {
				centerId: lesson.center_id,
				classId: lesson.class_id,
				lessonId: lesson.id,
				studentAccountId,
				lessonDate: lesson.lesson_date
			}
			: null;
	}

	getFinancialLessonDates(actor: ActorContext, classId: string): string[] | null {
		if (!this.getFinancialClassScope(actor, classId)) {
			return null;
		}
		const rows = this.database.sqlite
			.prepare(
				`SELECT lesson_date
				 FROM lessons
				 WHERE class_id = ? AND status <> 'cancelled'
				 ORDER BY lesson_date, id`
			)
			.all(classId) as Array<{ lesson_date: string }>;
		return rows.map((row) => row.lesson_date);
	}

	addStudentToClass(request: {
		sessionToken?: string;
		classId: string;
		studentAccountId: string;
	}): void {
		const classRow = this.requireAuthorizedClassAdmin(request.sessionToken, request.classId);
		this.requireCenterMemberRole(classRow.center_id, request.studentAccountId, 'student');
		if (classRow.mode === 'individual' && this.getClassStudentCount(classRow.id) >= 1) {
			throw new Error('individual-class-capacity-exceeded');
		}
		this.database.sqlite
			.prepare(
				'INSERT INTO class_students (center_id, class_id, student_account_id) VALUES (?, ?, ?)'
			)
			.run(classRow.center_id, classRow.id, request.studentAccountId);
	}

	removeStudentFromClass(request: {
		sessionToken?: string;
		classId: string;
		studentAccountId: string;
	}): void {
		const classRow = this.requireAuthorizedClassAdmin(request.sessionToken, request.classId);
		this.database.sqlite
			.prepare(
				'DELETE FROM class_students WHERE center_id = ? AND class_id = ? AND student_account_id = ?'
			)
			.run(classRow.center_id, classRow.id, request.studentAccountId);
	}

	linkParentToStudent(request: {
		sessionToken?: string;
		centerId: string;
		parentAccountId: string;
		studentAccountId: string;
	}): void {
		const actor = this.identityAccess.resolveActor(request.sessionToken);
		if (!this.getAuthorizedCenterAdminScope(actor, request.centerId)) {
			throw new Error('not-authorized');
		}

		this.requireCenterMemberRole(request.centerId, request.parentAccountId, 'parent');
		this.requireCenterMemberRole(request.centerId, request.studentAccountId, 'student');
		this.database.sqlite
			.prepare(
				'INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id) VALUES (?, ?, ?)'
			)
			.run(request.centerId, request.parentAccountId, request.studentAccountId);
	}

	unlinkParentFromStudent(request: {
		sessionToken?: string;
		centerId: string;
		parentAccountId: string;
		studentAccountId: string;
	}): void {
		const actor = this.identityAccess.resolveActor(request.sessionToken);
		if (!this.getAuthorizedCenterAdminScope(actor, request.centerId)) {
			throw new Error('not-authorized');
		}

		this.database.sqlite
			.prepare(
				'DELETE FROM parent_student_links WHERE center_id = ? AND parent_account_id = ? AND student_account_id = ?'
			)
			.run(request.centerId, request.parentAccountId, request.studentAccountId);
	}

	getAuthorizedClassScope(
		sessionToken: string | undefined,
		classId: string
	): AuthorizedClassScope | null {
		const actor = this.identityAccess.resolveActor(sessionToken);
		return actor ? this.getAuthorizedClassScopeForActor(actor, classId) : null;
	}

	private getAuthorizedClassScopeForActor(
		actor: ActorContext,
		classId: string
	): AuthorizedClassScope | null {
		const classRow = this.getClass(classId);
		if (!classRow || !this.getAuthorizedCenterScope(actor, classRow.center_id)) {
			return null;
		}

		let studentAccountIds: string[];
		switch (actor.role) {
			case 'admin':
				studentAccountIds = this.getClassStudentIds(classRow.id);
				break;
			case 'teacher':
				if (!this.hasTeacherAssignment(classRow.id, actor.accountId)) {
					return null;
				}
				studentAccountIds = this.getClassStudentIds(classRow.id);
				break;
			case 'student':
				if (!this.hasClassStudent(classRow.id, actor.accountId)) {
					return null;
				}
				studentAccountIds = [actor.accountId];
				break;
			case 'parent':
				studentAccountIds = this.getLinkedClassStudentIds(
					classRow.id,
					classRow.center_id,
					actor.accountId
				);
				if (studentAccountIds.length === 0) {
					return null;
				}
		}

		return {
			centerId: classRow.center_id,
			classId: classRow.id,
			className: classRow.name,
			mode: classRow.mode,
			accountId: actor.accountId,
			role: actor.role,
			studentAccountIds
		};
	}

	getAuthorizedCenterScope(actor: ActorContext | null, centerId: string): CenterScope | null {
		if (!actor) {
			return null;
		}

		const membership = this.database.sqlite
			.prepare(
				'SELECT center_id FROM center_memberships WHERE center_id = ? AND account_id = ?'
			)
			.get(centerId, actor.accountId) as { center_id: string } | undefined;

		return membership
			? { centerId: membership.center_id, accountId: actor.accountId, role: actor.role }
			: null;
	}

	getAuthorizedCenterAdminScope(actor: ActorContext | null, centerId: string): CenterScope | null {
		const scope = this.getAuthorizedCenterScope(actor, centerId);
		return scope?.role === 'admin' ? scope : null;
	}

	private requireAuthorizedClassAdmin(sessionToken: string | undefined, classId: string): ClassRow {
		const actor = this.identityAccess.resolveActor(sessionToken);
		const classRow = this.getClass(classId);
		if (!classRow || !this.getAuthorizedCenterAdminScope(actor, classRow.center_id)) {
			throw new Error('not-authorized');
		}
		return classRow;
	}

	private getClass(classId: string): ClassRow | undefined {
		return this.database.sqlite
			.prepare('SELECT id, center_id, name, mode FROM classes WHERE id = ?')
			.get(classId) as ClassRow | undefined;
	}

	private getSchedule(scheduleId: string): ScheduleRow | undefined {
		return this.database.sqlite
			.prepare(
				`SELECT id, center_id, class_id, start_date, end_date, weekdays,
						created_by_account_id, created_at
				 FROM schedules
				 WHERE id = ?`
			)
			.get(scheduleId) as ScheduleRow | undefined;
	}

	private getScheduleViewsForClass(classId: string): ScheduleView[] {
		const rows = this.database.sqlite
			.prepare(
				`SELECT id, center_id, class_id, start_date, end_date, weekdays,
						created_by_account_id, created_at
				 FROM schedules
				 WHERE class_id = ?
				 ORDER BY start_date, id`
			)
			.all(classId) as ScheduleRow[];
		return rows.map((row) => ({
			scheduleId: row.id,
			centerId: row.center_id,
			classId: row.class_id,
			startDate: row.start_date,
			endDate: row.end_date,
			weekdays: JSON.parse(row.weekdays) as number[],
			createdByAccountId: row.created_by_account_id,
			createdAt: row.created_at
		}));
	}

	private getLesson(lessonId: string): LessonRow | undefined {
		return this.database.sqlite
			.prepare(
				`SELECT id, center_id, class_id, schedule_id, lesson_date, status,
						created_by_account_id, created_at
				 FROM lessons
				 WHERE id = ?`
			)
			.get(lessonId) as LessonRow | undefined;
	}

	private getLessonViewsForClass(classId: string): LessonView[] {
		const rows = this.database.sqlite
			.prepare(
				`SELECT id, center_id, class_id, schedule_id, lesson_date, status,
						created_by_account_id, created_at
				 FROM lessons
				 WHERE class_id = ?
				 ORDER BY lesson_date, id`
			)
			.all(classId) as LessonRow[];
		return rows.map((row) => this.toLessonView(row));
	}

	private requireLessonView(lessonId: string): LessonView {
		const lesson = this.getLesson(lessonId);
		if (!lesson) {
			throw new Error('lesson-not-found');
		}
		return this.toLessonView(lesson);
	}

	private toLessonView(row: LessonRow): LessonView {
		return {
			lessonId: row.id,
			centerId: row.center_id,
			classId: row.class_id,
			scheduleId: row.schedule_id,
			lessonDate: row.lesson_date,
			status: row.status,
			createdByAccountId: row.created_by_account_id,
			createdAt: row.created_at
		};
	}

	private requireScheduleMutationScope(
		sessionToken: string | undefined,
		classId: string
	): { actor: ActorContext; scope: AuthorizedClassScope } {
		const actor = this.identityAccess.resolveActor(sessionToken);
		const scope = actor ? this.getAuthorizedClassScopeForActor(actor, classId) : null;
		if (!actor || !scope || (actor.role !== 'admin' && actor.role !== 'teacher')) {
			throw new Error('not-authorized');
		}
		return { actor, scope };
	}

	private normalizeWeekdays(weekdays: number[]): number[] {
		const normalized = [...new Set(weekdays)].sort((left, right) => left - right);
		if (
			normalized.length === 0 ||
			normalized.some((weekday) => !Number.isInteger(weekday) || weekday < 0 || weekday > 6)
		) {
			throw new Error('invalid-weekdays');
		}
		return normalized;
	}

	private getRecurringDates(startDate: string, endDate: string, weekdays: number[]): string[] {
		const start = this.parseIsoDate(startDate);
		const end = this.parseIsoDate(endDate);
		if (start.getTime() > end.getTime()) {
			throw new Error('invalid-date-range');
		}

		const dates: string[] = [];
		for (const current = new Date(start); current.getTime() <= end.getTime(); current.setUTCDate(current.getUTCDate() + 1)) {
			if (weekdays.includes(current.getUTCDay())) {
				dates.push(this.toIsoDate(current));
			}
		}
		return dates;
	}

	private requireIsoDate(value: string): void {
		this.parseIsoDate(value);
	}

	private parseIsoDate(value: string): Date {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
			throw new Error('invalid-iso-date');
		}
		const date = new Date(`${value}T00:00:00.000Z`);
		if (!Number.isFinite(date.getTime()) || this.toIsoDate(date) !== value) {
			throw new Error('invalid-iso-date');
		}
		return date;
	}

	private toIsoDate(date: Date): string {
		return date.toISOString().slice(0, 10);
	}

	private requireCenterMemberRole(centerId: string, accountId: string, role: Role): void {
		const member = this.database.sqlite
			.prepare(
				`SELECT 1
				 FROM center_memberships
				 JOIN accounts ON accounts.id = center_memberships.account_id
				 WHERE center_memberships.center_id = ?
				   AND center_memberships.account_id = ?
				   AND accounts.role = ?`
			)
			.get(centerId, accountId, role);
		if (!member) {
			throw new Error('not-authorized');
		}
	}

	private requireClassMode(mode: ClassMode): void {
		if (mode !== 'individual' && mode !== 'group') {
			throw new Error('invalid-class-mode');
		}
	}

	private requireName(value: string, errorCode: string): string {
		const name = typeof value === 'string' ? value.trim() : '';
		if (!name) {
			throw new Error(errorCode);
		}
		return name;
	}

	private getClassTeacherIds(classId: string): string[] {
		const rows = this.database.sqlite
			.prepare(
				`SELECT teacher_account_id
				 FROM teacher_assignments
				 WHERE class_id = ?
				 ORDER BY teacher_account_id`
			)
			.all(classId) as Array<{ teacher_account_id: string }>;
		return rows.map((row) => row.teacher_account_id);
	}

	private getClassStudentIds(classId: string): string[] {
		const rows = this.database.sqlite
			.prepare(
				'SELECT student_account_id FROM class_students WHERE class_id = ? ORDER BY student_account_id'
			)
			.all(classId) as Array<{ student_account_id: string }>;
		return rows.map((row) => row.student_account_id);
	}

	private getClassStudentCount(classId: string): number {
		const row = this.database.sqlite
			.prepare('SELECT COUNT(*) AS count FROM class_students WHERE class_id = ?')
			.get(classId) as { count: number };
		return row.count;
	}

	private hasTeacherAssignment(classId: string, accountId: string): boolean {
		return Boolean(
			this.database.sqlite
				.prepare(
					'SELECT 1 FROM teacher_assignments WHERE class_id = ? AND teacher_account_id = ?'
				)
				.get(classId, accountId)
		);
	}

	private hasClassStudent(classId: string, accountId: string): boolean {
		return Boolean(
			this.database.sqlite
				.prepare('SELECT 1 FROM class_students WHERE class_id = ? AND student_account_id = ?')
				.get(classId, accountId)
		);
	}

	private getLinkedClassStudentIds(
		classId: string,
		centerId: string,
		parentAccountId: string
	): string[] {
		const rows = this.database.sqlite
			.prepare(
				`SELECT class_students.student_account_id
				 FROM class_students
				 JOIN parent_student_links
				   ON parent_student_links.center_id = class_students.center_id
				  AND parent_student_links.student_account_id = class_students.student_account_id
				 WHERE class_students.class_id = ?
				   AND class_students.center_id = ?
				   AND parent_student_links.parent_account_id = ?
				 ORDER BY class_students.student_account_id`
			)
			.all(classId, centerId, parentAccountId) as Array<{ student_account_id: string }>;
		return rows.map((row) => row.student_account_id);
	}
}
