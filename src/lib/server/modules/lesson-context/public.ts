import type {
	CenterSchedulingBoundary,
	AuthorizedClassScope,
	CenterSchedulingRegistryFacts,
	LessonView
} from '$lib/server/modules/center-scheduling/public';
import type {
	CollaborationBoundary,
	CollaborationBrowserProjection
} from '$lib/server/modules/collaboration/public';
import type {
	FinancialLedgerBoundary,
	BalanceProjectionView,
	PaymentMarkerView
} from '$lib/server/modules/financial-ledger/public';
import type {
	IdentityAccessBoundary,
	ActorContext,
	AccountProfile
} from '$lib/server/modules/identity-access/public';
import type {
	AttendanceView,
	Grade,
	GradeView,
	HomeworkCompletionView,
	HomeworkProgressView,
	HomeworkView,
	LearningProgressBoundary
} from '$lib/server/modules/learning-progress/public';
import type { SharedDatabase } from '$lib/server/platform/database';

export type SharedLessonMaterial = {
	lessonId: string;
	classId: string;
	topic: string;
	practicalWork: string;
	homework: string;
};

export type DayContextRequest = {
	sessionToken?: string;
	classId: string;
	lessonId: string;
	studentAccountId?: string;
};

export type PersonalDayProjection = {
	studentAccountId: string;
	progress: {
		attendance: AttendanceView;
		completion: HomeworkCompletionView | null;
		grade: GradeView | null;
	};
	discussion: CollaborationBrowserProjection;
	financial: {
		balance: BalanceProjectionView;
		paymentMarkers: PaymentMarkerView[];
	};
};

export type DayContextView = {
	mode: 'shared' | 'personal';
	lesson: {
		lessonId: string;
		centerId: string;
		classId: string;
		className: string;
		lessonDate: string;
		status: LessonView['status'];
	};
	navigation: {
		date: string;
		classId: string;
		lessonId: string;
		studentAccountId: string | null;
	};
	material: SharedLessonMaterial;
	homeworkProgress: HomeworkProgressView;
	discussion: CollaborationBrowserProjection;
	personal: PersonalDayProjection | null;
};

export type StudentLessonPaymentStatus = {
	lessonId: string;
	status: 'paid' | 'unpaid';
};

export type StatisticsStudentRow = {
	fullName: string;
	registeredAt: string;
	className: string;
	parentNames: string[];
	teacherNames: string[];
	paymentCapabilityPercentage: number;
	attendancePercentage: number;
	institutionName: string;
};

export type StatisticsTeacherRow = {
	fullName: string;
	registeredAt: string;
	classNames: string[];
	attendancePercentage: number;
	institutionName: string;
	studentCount: number;
};

export type StatisticsClassRow = {
	className: string;
	institutionName: string;
	studentCount: number;
	teacherNames: string[];
};

export type StatisticsRegistryView = {
	students: StatisticsStudentRow[];
	teachers: StatisticsTeacherRow[];
	classes: StatisticsClassRow[];
};

type LessonContextIdentityPort = Pick<
	IdentityAccessBoundary,
	'resolveActor' | 'getStatisticsProfiles'
>;
type LessonContextCalendarPort = Pick<
	CenterSchedulingBoundary,
	'getAuthorizedClassScope' | 'getLessons' | 'getRegistryFacts'
>;
type LessonContextProgressPort = Pick<
	LearningProgressBoundary,
	| 'getAttendance'
	| 'getGradeForLesson'
	| 'getAttendancePercentage'
	| 'getHomeworkForLesson'
	| 'getHomeworkProgressForLesson'
	| 'createHomework'
	| 'completeHomework'
	| 'recordGrade'
>;
type LessonContextDiscussionPort = Pick<
	CollaborationBoundary,
	'getBrowserProjection'
>;
type LessonContextFinancialPort = Pick<
	FinancialLedgerBoundary,
	'getBalanceProjection' | 'getPaymentMarkers' | 'getPaymentCapability'
>;

type MaterialRow = {
	lesson_id: string;
	class_id: string;
	topic: string;
	practical_work: string;
	homework: string;
};

export class LessonContextBoundary {
	constructor(
		private readonly database: SharedDatabase,
		private readonly identityAccess: LessonContextIdentityPort,
		private readonly centerScheduling: LessonContextCalendarPort,
		private readonly learningProgress: LessonContextProgressPort,
		private readonly collaboration: LessonContextDiscussionPort,
		private readonly financialLedger: LessonContextFinancialPort,
		private readonly now: () => Date = () => new Date()
	) {}

	setSharedLessonMaterial(request: {
		sessionToken?: string;
		classId: string;
		lessonId: string;
		topic: string;
		practicalWork: string;
		homework: string;
	}): SharedLessonMaterial {
		const actor = this.identityAccess.resolveActor(request.sessionToken);
		const scope = actor
			? this.centerScheduling.getAuthorizedClassScope(request.sessionToken, request.classId)
			: null;
		const lesson = scope ? this.findLesson(scope, request.lessonId, request.sessionToken) : null;
		if (!actor || !scope || !lesson || (actor.role !== 'admin' && actor.role !== 'teacher')) {
			throw new Error('not-authorized');
		}

		const material = {
			topic: this.requireText(request.topic, 'invalid-topic'),
			practicalWork: this.requireText(request.practicalWork, 'invalid-practical-work'),
			homework: this.requireText(request.homework, 'invalid-homework')
		};
		const timestamp = this.now().toISOString();
		this.database.transaction(() => {
			this.database.sqlite
				.prepare(
					`INSERT INTO lesson_context_material (
						lesson_id, center_id, class_id, topic, practical_work, homework,
						created_at, updated_at
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
					 ON CONFLICT (lesson_id) DO UPDATE SET
						 topic = excluded.topic,
						 practical_work = excluded.practical_work,
						 homework = excluded.homework,
						 updated_at = excluded.updated_at`
				)
				.run(
					request.lessonId,
					lesson.centerId,
					lesson.classId,
					material.topic,
					material.practicalWork,
					material.homework,
					timestamp,
					timestamp
				);
		});

		return {
			lessonId: request.lessonId,
			classId: request.classId,
			...material
		};
	}

	getDayContext(request: DayContextRequest): DayContextView {
		const { scope, lesson } = this.requireAuthorizedLesson(request);

		const material = this.requireMaterial(lesson, scope);
		if (
			request.studentAccountId !== undefined &&
			!scope.studentAccountIds.includes(request.studentAccountId)
		) {
			throw new Error('not-authorized');
		}

		const homeworkProgress = this.learningProgress.getHomeworkProgressForLesson({
			sessionToken: request.sessionToken,
			classId: scope.classId,
			lessonId: lesson.lessonId
		});
		const sharedDiscussion = this.collaboration.getBrowserProjection({
			sessionToken: request.sessionToken,
			classId: scope.classId,
			lessonId: lesson.lessonId,
			scope: 'shared'
		});
		const navigation = {
			date: lesson.lessonDate,
			classId: lesson.classId,
			lessonId: lesson.lessonId,
			studentAccountId: request.studentAccountId ?? null
		};

		if (request.studentAccountId === undefined) {
			return {
				mode: 'shared',
				lesson: this.toLessonContextView(lesson, scope),
				navigation,
				material,
				homeworkProgress,
				discussion: sharedDiscussion,
				personal: null
			};
		}

		const personalDiscussion = this.collaboration.getBrowserProjection({
			sessionToken: request.sessionToken,
			classId: scope.classId,
			lessonId: lesson.lessonId,
			scope: 'personal',
			studentAccountId: request.studentAccountId
		});
		const dateRange = { from: lesson.lessonDate, to: lesson.lessonDate };
		const personal: PersonalDayProjection = {
			studentAccountId: request.studentAccountId,
			progress: {
				attendance: this.learningProgress.getAttendance({
					sessionToken: request.sessionToken,
					classId: scope.classId,
					lessonId: lesson.lessonId,
					studentAccountId: request.studentAccountId
				}),
				completion:
					homeworkProgress.completions.find(
					(completion) => completion.studentAccountId === request.studentAccountId
				) ?? null,
				grade: this.learningProgress.getGradeForLesson({
					sessionToken: request.sessionToken,
					classId: scope.classId,
					lessonId: lesson.lessonId,
					studentAccountId: request.studentAccountId
				})
			},
			discussion: personalDiscussion,
			financial: {
				balance: this.financialLedger.getBalanceProjection({
					sessionToken: request.sessionToken,
					classId: scope.classId,
					studentAccountId: request.studentAccountId,
					range: dateRange
				}),
				paymentMarkers: this.financialLedger.getPaymentMarkers({
					sessionToken: request.sessionToken,
					classId: scope.classId,
					studentAccountId: request.studentAccountId,
					range: dateRange
				})
			}
		};

		return {
			mode: 'personal',
			lesson: this.toLessonContextView(lesson, scope),
			navigation,
			material,
			homeworkProgress,
			discussion: personalDiscussion,
			personal
		};
	}

	createHomework(request: {
		sessionToken?: string;
		classId: string;
		lessonId: string;
	}): HomeworkView {
		const { actor, scope, lesson } = this.requireAuthorizedLesson(request);
		if (actor.role !== 'admin' && actor.role !== 'teacher') {
			throw new Error('not-authorized');
		}

		const existing = this.learningProgress.getHomeworkForLesson({
			sessionToken: request.sessionToken,
			classId: scope.classId,
			lessonId: lesson.lessonId
		});
		if (existing) return existing;

		const material = this.requireMaterial(lesson, scope);
		return this.learningProgress.createHomework({
			sessionToken: request.sessionToken,
			classId: scope.classId,
			title: material.homework
		});
	}

	completeHomework(request: {
		sessionToken?: string;
		classId: string;
		lessonId: string;
	}): HomeworkCompletionView {
		const { actor, scope, lesson } = this.requireAuthorizedLesson(request);
		if (actor.role !== 'student' || !scope.studentAccountIds.includes(actor.accountId)) {
			throw new Error('not-authorized');
		}

		const homework = this.learningProgress.getHomeworkForLesson({
			sessionToken: request.sessionToken,
			classId: scope.classId,
			lessonId: lesson.lessonId
		});
		if (!homework) throw new Error('homework-not-found');

		return this.learningProgress.completeHomework({
			sessionToken: request.sessionToken,
			classId: scope.classId,
			homeworkId: homework.homeworkId
		});
	}

	recordGrade(request: {
		sessionToken?: string;
		classId: string;
		lessonId: string;
		studentAccountId: string;
		grade: Grade;
	}): GradeView {
		const { actor, scope, lesson } = this.requireAuthorizedLesson(request);
		if (
			(actor.role !== 'admin' && actor.role !== 'teacher') ||
			!scope.studentAccountIds.includes(request.studentAccountId)
		) {
			throw new Error('not-authorized');
		}

		const homework = this.learningProgress.getHomeworkForLesson({
			sessionToken: request.sessionToken,
			classId: scope.classId,
			lessonId: lesson.lessonId
		});
		if (!homework) throw new Error('homework-not-found');

		return this.learningProgress.recordGrade({
			sessionToken: request.sessionToken,
			classId: scope.classId,
			homeworkId: homework.homeworkId,
			studentAccountId: request.studentAccountId,
			grade: request.grade
		});
	}

	getStudentPaymentStatuses(request: {
		sessionToken?: string;
		classId: string;
	}): StudentLessonPaymentStatus[] {
		const actor = this.identityAccess.resolveActor(request.sessionToken);
		const scope = actor
			? this.centerScheduling.getAuthorizedClassScope(request.sessionToken, request.classId)
			: null;
		const lessons = scope
			? this.centerScheduling.getLessons({ sessionToken: request.sessionToken, classId: request.classId })
			: null;
		if (
			!actor ||
			!scope ||
			!lessons ||
			scope.role !== 'student' ||
			scope.accountId !== actor.accountId
		) {
			throw new Error('not-authorized');
		}

		const projection = this.financialLedger.getBalanceProjection({
			sessionToken: request.sessionToken,
			classId: scope.classId,
			studentAccountId: actor.accountId
		});
		const paidLessons = new Set(
			projection.charges
				.filter((charge) => charge.state === 'paid')
				.map((charge) => charge.lessonId)
		);
		return lessons.map((lesson) => ({
			lessonId: lesson.lessonId,
			status: paidLessons.has(lesson.lessonId) ? 'paid' : 'unpaid'
		}));
	}

	getPersonalPaymentMarkers(request: {
		sessionToken?: string;
		classId: string;
	}): PaymentMarkerView[] {
		const actor = this.identityAccess.resolveActor(request.sessionToken);
		const scope = actor
			? this.centerScheduling.getAuthorizedClassScope(request.sessionToken, request.classId)
			: null;
		if (
			!actor ||
			!scope ||
			scope.accountId !== actor.accountId ||
			(scope.role !== 'student' && scope.role !== 'parent')
		) {
			throw new Error('not-authorized');
		}

		const studentAccountIds = scope.role === 'student' ? [actor.accountId] : scope.studentAccountIds;
		return studentAccountIds
			.flatMap((studentAccountId) =>
				this.financialLedger.getPaymentMarkers({
					sessionToken: request.sessionToken,
					classId: scope.classId,
					studentAccountId
				})
			)
			.sort((left, right) =>
				`${left.markerDate}:${left.factualDate}:${left.paymentId}`.localeCompare(
					`${right.markerDate}:${right.factualDate}:${right.paymentId}`
				)
			);
	}

	getStatisticsRegistry(request: {
		actor: ActorContext | null;
		sessionToken?: string;
	}): StatisticsRegistryView {
		const facts = this.centerScheduling.getRegistryFacts({ actor: request.actor });
		if (!facts) {
			throw new Error('not-authorized');
		}

		const relevantAccountIds = this.getStatisticsAccountIds(facts);
		const profiles = this.identityAccess.getStatisticsProfiles(relevantAccountIds);
		const profilesByAccountId = new Map(
			profiles.map((profile) => [profile.accountId, profile] as const)
		);
		if (profilesByAccountId.size !== relevantAccountIds.length) {
			throw new Error('not-authorized');
		}

		const requireProfile = (accountId: string): AccountProfile => {
			const profile = profilesByAccountId.get(accountId);
			if (!profile) {
				throw new Error('not-authorized');
			}
			return profile;
		};
		const institutionName = facts.institution.name;
		const students = facts.classes.flatMap((classView) =>
			classView.studentAccountIds.map((studentAccountId) => {
				const profile = requireProfile(studentAccountId);
				return {
					fullName: profile.fullName,
					registeredAt: profile.registeredAt,
					className: classView.name,
					parentNames: facts.parentLinks
						.filter((link) => link.studentAccountId === studentAccountId)
						.map((link) => requireProfile(link.parentAccountId).fullName),
					teacherNames: classView.teacherAccountIds.map(
						(teacherAccountId) => requireProfile(teacherAccountId).fullName
					),
					paymentCapabilityPercentage: this.financialLedger.getPaymentCapability({
						sessionToken: request.sessionToken,
						classId: classView.classId,
						studentAccountId
					}),
					attendancePercentage: this.learningProgress.getAttendancePercentage({
						sessionToken: request.sessionToken,
						classId: classView.classId,
						studentAccountId
					}),
					institutionName
				};
			})
		);
		const teacherAccountIds = [
			...new Set(facts.classes.flatMap((classView) => classView.teacherAccountIds))
		].filter(
			(teacherAccountId) =>
				request.actor?.role !== 'teacher' || teacherAccountId === request.actor.accountId
		);
		const teachers = teacherAccountIds.map((teacherAccountId) => {
			const profile = requireProfile(teacherAccountId);
			const assignedClasses = facts.classes.filter((classView) =>
				classView.teacherAccountIds.includes(teacherAccountId)
			);
			return {
				fullName: profile.fullName,
				registeredAt: profile.registeredAt,
				classNames: assignedClasses.map((classView) => classView.name),
				attendancePercentage: this.learningProgress.getAttendancePercentage({
					sessionToken: request.sessionToken,
					teacherAccountId
				}),
				institutionName,
				studentCount: new Set(
					assignedClasses.flatMap((classView) => classView.studentAccountIds)
				).size
			};
		});
		const classes = facts.classes.map((classView) => ({
			className: classView.name,
			institutionName,
			studentCount: classView.studentCount,
			teacherNames: classView.teacherAccountIds.map(
				(teacherAccountId) => requireProfile(teacherAccountId).fullName
			)
		}));

		return { students, teachers, classes };
	}

	private getStatisticsAccountIds(facts: CenterSchedulingRegistryFacts): string[] {
		const relevant = new Set([
			...facts.classes.flatMap((classView) => classView.studentAccountIds),
			...facts.classes.flatMap((classView) => classView.teacherAccountIds),
			...facts.parentLinks.map((link) => link.parentAccountId)
		]);
		const scoped = facts.accountIds.filter((accountId) => relevant.has(accountId));
		if (scoped.length !== relevant.size) {
			throw new Error('not-authorized');
		}
		return scoped;
	}

	private requireAuthorizedLesson(request: {
		sessionToken?: string;
		classId: string;
		lessonId: string;
	}): { actor: ActorContext; scope: AuthorizedClassScope; lesson: LessonView } {
		const actor = this.identityAccess.resolveActor(request.sessionToken);
		const scope = actor
			? this.centerScheduling.getAuthorizedClassScope(request.sessionToken, request.classId)
			: null;
		const lesson = scope ? this.findLesson(scope, request.lessonId, request.sessionToken) : null;
		if (!actor || !scope || !lesson) {
			throw new Error('not-authorized');
		}
		return { actor, scope, lesson };
	}

	private findLesson(
		scope: AuthorizedClassScope,
		lessonId: string,
		sessionToken: string | undefined
	): LessonView | null {
		return (
			this.centerScheduling
				.getLessons({ sessionToken, classId: scope.classId })
				?.find((lesson) => lesson.lessonId === lessonId && lesson.status !== 'cancelled') ?? null
		);
	}

	private requireMaterial(lesson: LessonView, scope: AuthorizedClassScope): SharedLessonMaterial {
		const row = this.database.sqlite
			.prepare(
				`SELECT lesson_id, class_id, topic, practical_work, homework
				 FROM lesson_context_material
				 WHERE lesson_id = ? AND center_id = ? AND class_id = ?`
			)
			.get(lesson.lessonId, scope.centerId, scope.classId) as MaterialRow | undefined;
		if (!row) {
			throw new Error('lesson-material-not-found');
		}
		return {
			lessonId: row.lesson_id,
			classId: row.class_id,
			topic: row.topic,
			practicalWork: row.practical_work,
			homework: row.homework
		};
	}

	private toLessonContextView(
		lesson: LessonView,
		scope: AuthorizedClassScope
	): DayContextView['lesson'] {
		return {
			lessonId: lesson.lessonId,
			centerId: lesson.centerId,
			classId: lesson.classId,
			className: scope.className,
			lessonDate: lesson.lessonDate,
			status: lesson.status
		};
	}

	private requireText(value: string, errorCode: string): string {
		const normalized = value.trim();
		if (!normalized) {
			throw new Error(errorCode);
		}
		return normalized;
	}
}
