import type {
	CenterSchedulingBoundary,
	AuthorizedClassScope,
	LessonView
} from '$lib/server/modules/center-scheduling/public';
import type {
	CollaborationBoundary,
	DayDiscussionView
} from '$lib/server/modules/collaboration/public';
import type {
	FinancialLedgerBoundary,
	BalanceProjectionView,
	PaymentMarkerView
} from '$lib/server/modules/financial-ledger/public';
import type {
	IdentityAccessBoundary,
	ActorContext
} from '$lib/server/modules/identity-access/public';
import type {
	AttendanceView,
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
	};
	discussion: DayDiscussionView;
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
	discussion: DayDiscussionView;
	personal: PersonalDayProjection | null;
};

type LessonContextIdentityPort = Pick<IdentityAccessBoundary, 'resolveActor'>;
type LessonContextCalendarPort = Pick<
	CenterSchedulingBoundary,
	'getAuthorizedClassScope' | 'getLessons'
>;
type LessonContextProgressPort = Pick<LearningProgressBoundary, 'getAttendance'>;
type LessonContextDiscussionPort = Pick<
	CollaborationBoundary,
	'getDayDiscussion'
>;
type LessonContextFinancialPort = Pick<
	FinancialLedgerBoundary,
	'getBalanceProjection' | 'getPaymentMarkers'
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
		const actor = this.identityAccess.resolveActor(request.sessionToken);
		const scope = actor
			? this.centerScheduling.getAuthorizedClassScope(request.sessionToken, request.classId)
			: null;
		const lesson = scope ? this.findLesson(scope, request.lessonId, request.sessionToken) : null;
		if (!actor || !scope || !lesson) {
			throw new Error('not-authorized');
		}

		const material = this.requireMaterial(lesson, scope);
		const sharedDiscussion = this.collaboration.getDayDiscussion({
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
				discussion: sharedDiscussion,
				personal: null
			};
		}

		if (!scope.studentAccountIds.includes(request.studentAccountId)) {
			throw new Error('not-authorized');
		}

		const personalDiscussion = this.collaboration.getDayDiscussion({
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
			discussion: personalDiscussion,
			personal
		};
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
