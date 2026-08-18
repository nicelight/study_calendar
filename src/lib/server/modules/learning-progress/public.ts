import {
	CenterSchedulingBoundary,
	type AuthorizedClassScope,
	type LessonView
} from '$lib/server/modules/center-scheduling/public';
import type { FinancialLedgerBoundary } from '$lib/server/modules/financial-ledger/public';
import {
	IdentityAccessBoundary,
	type ActorContext
} from '$lib/server/modules/identity-access/public';
import type { SharedDatabase } from '$lib/server/platform/database';

export type Grade = 'α' | 'β' | 'γ' | 'F';

export type HomeworkView = {
	homeworkId: string;
	centerId: string;
	classId: string;
	title: string;
	createdByAccountId: string;
	createdAt: string;
};

export type HomeworkCompletionView = {
	homeworkId: string;
	classId: string;
	studentAccountId: string;
	completed: boolean;
	completedAt: string | null;
};

export type GradeView = {
	homeworkId: string;
	classId: string;
	studentAccountId: string;
	grade: Grade;
	recordedByAccountId: string;
	recordedAt: string;
};

export type AttendanceStatus = 'present' | 'absent';

export type AttendanceView = {
	lessonId: string;
	classId: string;
	studentAccountId: string;
	attendance: AttendanceStatus;
	recordedByAccountId: string | null;
	recordedAt: string | null;
};

type HomeworkRow = {
	id: string;
	center_id: string;
	class_id: string;
	title: string;
	created_by_account_id: string;
	created_at: string;
};

type CompletionRow = {
	homework_id: string;
	class_id: string;
	student_account_id: string;
	completed_at: string | null;
};

type GradeRow = {
	homework_id: string;
	class_id: string;
	student_account_id: string;
	grade: Grade;
	recorded_by_account_id: string;
	recorded_at: string;
};

type AttendanceRow = {
	center_id: string;
	class_id: string;
	lesson_id: string;
	student_account_id: string;
	attendance: AttendanceStatus;
	recorded_by_account_id: string;
	recorded_at: string;
};

type LearningProgressOptions = {
	now?: () => Date;
};

export class LearningProgressBoundary {
	private readonly now: () => Date;

	constructor(
		private readonly database: SharedDatabase,
		private readonly identityAccess: Pick<IdentityAccessBoundary, 'resolveActor'>,
		private readonly centerScheduling: Pick<
			CenterSchedulingBoundary,
			'getAuthorizedClassScope' | 'getLessons'
		>,
		private readonly financialLedger: Pick<FinancialLedgerBoundary, 'reconcileLessonCharge'>,
		options: LearningProgressOptions = {}
	) {
		this.now = options.now ?? (() => new Date());
	}

	getLessonAttendance(request: {
		sessionToken?: string;
		classId: string;
		lessonId: string;
	}): AttendanceView[] {
		const { scope } = this.requireAssignedTeacherClassScope(request.sessionToken, request.classId);
		this.requireAttendanceEntryLesson(request.sessionToken, scope, request.lessonId);
		return scope.studentAccountIds.map((studentAccountId) => {
			const row = this.getAttendanceRow(request.lessonId, studentAccountId);
			return row
				? this.toAttendanceView(row)
				: {
					lessonId: request.lessonId,
					classId: scope.classId,
					studentAccountId,
					attendance: 'absent' as const,
					recordedByAccountId: null,
					recordedAt: null
				};
		});
	}

	recordLessonAttendance(request: {
		sessionToken?: string;
		classId: string;
		lessonId: string;
		absentStudentAccountIds: string[];
	}): AttendanceView[] {
		return this.database.transaction(() => {
			const { actor, scope } = this.requireAssignedTeacherClassScope(
				request.sessionToken,
				request.classId
			);
			this.requireAttendanceEntryLesson(request.sessionToken, scope, request.lessonId);
			const absentStudentAccountIds = new Set(request.absentStudentAccountIds);
			for (const studentAccountId of absentStudentAccountIds) {
				this.requireClassStudent(scope, studentAccountId);
			}

			const recordedAt = this.now().toISOString();
			for (const studentAccountId of scope.studentAccountIds) {
				const attendance = absentStudentAccountIds.has(studentAccountId) ? 'absent' : 'present';
				const before = this.getAttendanceRow(request.lessonId, studentAccountId);
				const from = before?.attendance ?? 'absent';
				if (from !== attendance) {
					this.financialLedger.reconcileLessonCharge({
						sessionToken: request.sessionToken,
						lessonId: request.lessonId,
						studentAccountId,
						attendanceTransition: { from, to: attendance }
					});
				}

				this.database.sqlite
					.prepare(
						`INSERT INTO learning_attendance (
							center_id,
							class_id,
							lesson_id,
							student_account_id,
							attendance,
							recorded_by_account_id,
							recorded_at
						) VALUES (?, ?, ?, ?, ?, ?, ?)
						 ON CONFLICT (lesson_id, student_account_id) DO UPDATE SET
							attendance = excluded.attendance,
							recorded_by_account_id = excluded.recorded_by_account_id,
							recorded_at = excluded.recorded_at`
					)
					.run(
						scope.centerId,
						scope.classId,
						request.lessonId,
						studentAccountId,
						attendance,
						actor.accountId,
						recordedAt
					);
			}

			return scope.studentAccountIds.map((studentAccountId) =>
				this.requireAttendanceView(request.lessonId, scope.classId, studentAccountId)
			);
		});
	}

	recordAttendance(request: {
		sessionToken?: string;
		classId: string;
		lessonId: string;
		studentAccountId: string;
		attendance: AttendanceStatus;
	}): AttendanceView {
		return this.database.transaction(() => {
			const { actor, scope } = this.requireTeacherOrAdminClassScope(
				request.sessionToken,
				request.classId
			);
			this.requireAttendance(request.attendance);
			this.requireClassStudent(scope, request.studentAccountId);
			this.requireLesson(request.sessionToken, scope, request.lessonId);

			const before = this.getAttendanceRow(request.lessonId, request.studentAccountId);
			const from = before?.attendance ?? 'absent';
			if (from !== request.attendance) {
				this.financialLedger.reconcileLessonCharge({
					sessionToken: request.sessionToken,
					lessonId: request.lessonId,
					studentAccountId: request.studentAccountId,
					attendanceTransition: { from, to: request.attendance }
				});
			}

			this.database.sqlite
				.prepare(
					`INSERT INTO learning_attendance (
						center_id,
						class_id,
						lesson_id,
						student_account_id,
						attendance,
						recorded_by_account_id,
						recorded_at
					) VALUES (?, ?, ?, ?, ?, ?, ?)
					 ON CONFLICT (lesson_id, student_account_id) DO UPDATE SET
						attendance = excluded.attendance,
						recorded_by_account_id = excluded.recorded_by_account_id,
						recorded_at = excluded.recorded_at`
				)
				.run(
					scope.centerId,
					scope.classId,
					request.lessonId,
					request.studentAccountId,
					request.attendance,
					actor.accountId,
					this.now().toISOString()
				);

			return this.requireAttendanceView(request.lessonId, scope.classId, request.studentAccountId);
		});
	}

	getAttendance(request: {
		sessionToken?: string;
		classId: string;
		lessonId: string;
		studentAccountId: string;
	}): AttendanceView {
		const { scope } = this.requireClassScope(request.sessionToken, request.classId);
		this.requireClassStudent(scope, request.studentAccountId);
		this.requireLesson(request.sessionToken, scope, request.lessonId);
		const row = this.getAttendanceRow(request.lessonId, request.studentAccountId);
		return row
			? this.toAttendanceView(row)
			: {
				lessonId: request.lessonId,
				classId: scope.classId,
				studentAccountId: request.studentAccountId,
				attendance: 'absent',
				recordedByAccountId: null,
				recordedAt: null
			};
	}

	createHomework(request: {
		sessionToken?: string;
		classId: string;
		homeworkId: string;
		title: string;
	}): HomeworkView {
		return this.database.transaction(() => {
			const { actor, scope } = this.requireTeacherOrAdminClassScope(
				request.sessionToken,
				request.classId
			);
			const title = request.title.trim();
			if (!title) {
				throw new Error('invalid-homework-title');
			}

			const createdAt = this.now().toISOString();
			this.database.sqlite
				.prepare(
					`INSERT INTO learning_homework (
						id, center_id, class_id, title, created_by_account_id, created_at
					) VALUES (?, ?, ?, ?, ?, ?)`
				)
				.run(
					request.homeworkId,
					scope.centerId,
					scope.classId,
					title,
					actor.accountId,
					createdAt
				);

			return this.requireHomeworkView(request.homeworkId, scope.classId);
		});
	}

	completeHomework(request: {
		sessionToken?: string;
		classId: string;
		homeworkId: string;
	}): HomeworkCompletionView {
		return this.database.transaction(() => {
			const { actor, scope } = this.requireClassScope(request.sessionToken, request.classId);
			if (actor.role !== 'student' || !scope.studentAccountIds.includes(actor.accountId)) {
				throw new Error('not-authorized');
			}
			this.requireHomework(request.homeworkId, scope.classId);

			const completedAt = this.now().toISOString();
			this.database.sqlite
				.prepare(
					`INSERT INTO learning_homework_completions (
						homework_id, student_account_id, completed_at
					) VALUES (?, ?, ?)
					 ON CONFLICT (homework_id, student_account_id) DO NOTHING`
				)
				.run(request.homeworkId, actor.accountId, completedAt);

			return this.requireCompletionView(request.homeworkId, scope.classId, actor.accountId);
		});
	}

	getHomeworkCompletions(request: {
		sessionToken?: string;
		classId: string;
		homeworkId: string;
	}): HomeworkCompletionView[] {
		const { scope } = this.requireClassScope(request.sessionToken, request.classId);
		this.requireHomework(request.homeworkId, scope.classId);
		const rows = this.database.sqlite
			.prepare(
				`SELECT
					learning_homework.id AS homework_id,
					learning_homework.class_id,
					class_students.student_account_id,
					learning_homework_completions.completed_at
				 FROM class_students
				 JOIN learning_homework
				   ON learning_homework.class_id = class_students.class_id
				  AND learning_homework.center_id = class_students.center_id
				 LEFT JOIN learning_homework_completions
				   ON learning_homework_completions.homework_id = learning_homework.id
				  AND learning_homework_completions.student_account_id = class_students.student_account_id
				 WHERE learning_homework.id = ?
				   AND class_students.class_id = ?
				 ORDER BY class_students.student_account_id`
			)
			.all(request.homeworkId, scope.classId) as CompletionRow[];

		return rows.map((row) => this.toCompletionView(row));
	}

	recordGrade(request: {
		sessionToken?: string;
		classId: string;
		homeworkId: string;
		studentAccountId: string;
		grade: Grade;
	}): GradeView {
		return this.database.transaction(() => {
			const { actor, scope } = this.requireTeacherOrAdminClassScope(
				request.sessionToken,
				request.classId
			);
			this.requireGrade(request.grade);
			this.requireHomework(request.homeworkId, scope.classId);
			this.requireClassStudent(scope, request.studentAccountId);

			const recordedAt = this.now().toISOString();
			this.database.sqlite
				.prepare(
					`INSERT INTO learning_grades (
						homework_id, student_account_id, grade, recorded_by_account_id, recorded_at
					) VALUES (?, ?, ?, ?, ?)
					 ON CONFLICT (homework_id, student_account_id) DO UPDATE SET
						grade = excluded.grade,
						recorded_by_account_id = excluded.recorded_by_account_id,
						recorded_at = excluded.recorded_at`
				)
				.run(
					request.homeworkId,
					request.studentAccountId,
					request.grade,
					actor.accountId,
					recordedAt
				);

			return this.requireGradeView(
				request.homeworkId,
				scope.classId,
				request.studentAccountId
			);
		});
	}

	getGrade(request: {
		sessionToken?: string;
		classId: string;
		homeworkId: string;
		studentAccountId: string;
	}): GradeView | null {
		const { scope } = this.requireClassScope(request.sessionToken, request.classId);
		this.requireHomework(request.homeworkId, scope.classId);
		this.requireClassStudent(scope, request.studentAccountId);

		const row = this.database.sqlite
			.prepare(
				`SELECT homework_id, class_id, student_account_id, grade,
					recorded_by_account_id, recorded_at
				 FROM learning_grades
				 JOIN learning_homework ON learning_homework.id = learning_grades.homework_id
				 WHERE learning_grades.homework_id = ?
				   AND learning_homework.class_id = ?
				   AND learning_grades.student_account_id = ?`
			)
			.get(request.homeworkId, scope.classId, request.studentAccountId) as GradeRow | undefined;

		return row ? this.toGradeView(row) : null;
	}

	getGradeForLesson(request: {
		sessionToken?: string;
		classId: string;
		lessonId: string;
		studentAccountId: string;
	}): GradeView | null {
		const { scope } = this.requireClassScope(request.sessionToken, request.classId);
		this.requireClassStudent(scope, request.studentAccountId);
		const lesson = this.requireLesson(request.sessionToken, scope, request.lessonId);

		const candidates = this.database.sqlite
			.prepare(
				`SELECT id, center_id, class_id, title, created_by_account_id, created_at
				 FROM learning_homework
				 WHERE center_id = ? AND class_id = ?`
			)
			.all(lesson.centerId, lesson.classId) as HomeworkRow[];

		if (candidates.length > 1) {
			throw new Error('ambiguous-homework-selection');
		}
		if (candidates.length === 0) {
			return null;
		}

		return this.getGrade({
			sessionToken: request.sessionToken,
			classId: lesson.classId,
			homeworkId: candidates[0].id,
			studentAccountId: request.studentAccountId
		});
	}

	private requireClassScope(
		sessionToken: string | undefined,
		classId: string
	): { actor: ActorContext; scope: AuthorizedClassScope } {
		const actor = this.identityAccess.resolveActor(sessionToken);
		const scope = this.centerScheduling.getAuthorizedClassScope(sessionToken, classId);
		if (!actor || !scope) {
			throw new Error('not-authorized');
		}
		return { actor, scope };
	}

	private requireTeacherOrAdminClassScope(
		sessionToken: string | undefined,
		classId: string
	): { actor: ActorContext; scope: AuthorizedClassScope } {
		const result = this.requireClassScope(sessionToken, classId);
		if (result.actor.role !== 'admin' && result.actor.role !== 'teacher') {
			throw new Error('not-authorized');
		}
		return result;
	}

	private requireAssignedTeacherClassScope(
		sessionToken: string | undefined,
		classId: string
	): { actor: ActorContext; scope: AuthorizedClassScope } {
		const result = this.requireClassScope(sessionToken, classId);
		if (result.actor.role !== 'teacher') {
			throw new Error('not-authorized');
		}
		return result;
	}

	private requireAttendanceEntryLesson(
		sessionToken: string | undefined,
		scope: AuthorizedClassScope,
		lessonId: string
	): LessonView {
		try {
			return this.requireLesson(sessionToken, scope, lessonId);
		} catch (cause) {
			if (cause instanceof Error && cause.message === 'lesson-not-found') {
				throw new Error('not-authorized');
			}
			throw cause;
		}
	}

	private requireHomework(homeworkId: string, classId: string): HomeworkRow {
		const row = this.database.sqlite
			.prepare(
				`SELECT id, center_id, class_id, title, created_by_account_id, created_at
				 FROM learning_homework
				 WHERE id = ? AND class_id = ?`
			)
			.get(homeworkId, classId) as HomeworkRow | undefined;
		if (!row) {
			throw new Error('homework-not-found');
		}
		return row;
	}

	private requireLesson(
		sessionToken: string | undefined,
		scope: AuthorizedClassScope,
		lessonId: string
	): LessonView {
		const lesson = this.centerScheduling
			.getLessons({ sessionToken, classId: scope.classId })
			?.find((candidate) => candidate.lessonId === lessonId && candidate.status !== 'cancelled');
		if (!lesson) {
			throw new Error('lesson-not-found');
		}
		return lesson;
	}

	private requireClassStudent(scope: AuthorizedClassScope, studentAccountId: string): void {
		const isAllowed = scope.studentAccountIds.includes(studentAccountId);
		if (!isAllowed) {
			throw new Error('not-authorized');
		}
	}

	private requireGrade(grade: Grade): void {
		if (grade !== 'α' && grade !== 'β' && grade !== 'γ' && grade !== 'F') {
			throw new Error('invalid-grade');
		}
	}

	private requireAttendance(attendance: AttendanceStatus): void {
		if (attendance !== 'present' && attendance !== 'absent') {
			throw new Error('invalid-attendance');
		}
	}

	private getAttendanceRow(lessonId: string, studentAccountId: string): AttendanceRow | undefined {
		return this.database.sqlite
			.prepare(
				`SELECT center_id, class_id, lesson_id, student_account_id, attendance,
					recorded_by_account_id, recorded_at
				 FROM learning_attendance
				 WHERE lesson_id = ? AND student_account_id = ?`
			)
			.get(lessonId, studentAccountId) as AttendanceRow | undefined;
	}

	private requireAttendanceView(
		lessonId: string,
		classId: string,
		studentAccountId: string
	): AttendanceView {
		const row = this.getAttendanceRow(lessonId, studentAccountId);
		if (!row || row.class_id !== classId) {
			throw new Error('attendance-not-found');
		}
		return this.toAttendanceView(row);
	}

	private requireHomeworkView(homeworkId: string, classId: string): HomeworkView {
		return this.toHomeworkView(this.requireHomework(homeworkId, classId));
	}

	private requireCompletionView(
		homeworkId: string,
		classId: string,
		studentAccountId: string
	): HomeworkCompletionView {
		const row = this.database.sqlite
			.prepare(
				`SELECT
					learning_homework_completions.homework_id,
					learning_homework.class_id,
					learning_homework_completions.student_account_id,
					learning_homework_completions.completed_at
				 FROM learning_homework_completions
				 JOIN learning_homework ON learning_homework.id = learning_homework_completions.homework_id
				 WHERE learning_homework_completions.homework_id = ?
				   AND learning_homework.class_id = ?
				   AND learning_homework_completions.student_account_id = ?`
			)
			.get(homeworkId, classId, studentAccountId) as CompletionRow | undefined;
		if (!row) {
			throw new Error('completion-not-found');
		}
		return this.toCompletionView(row);
	}

	private requireGradeView(
		homeworkId: string,
		classId: string,
		studentAccountId: string
	): GradeView {
		const row = this.database.sqlite
			.prepare(
				`SELECT homework_id, class_id, student_account_id, grade,
					recorded_by_account_id, recorded_at
				 FROM learning_grades
				 JOIN learning_homework ON learning_homework.id = learning_grades.homework_id
				 WHERE learning_grades.homework_id = ?
				   AND learning_homework.class_id = ?
				   AND learning_grades.student_account_id = ?`
			)
			.get(homeworkId, classId, studentAccountId) as GradeRow | undefined;
		if (!row) {
			throw new Error('grade-not-found');
		}
		return this.toGradeView(row);
	}

	private toHomeworkView(row: HomeworkRow): HomeworkView {
		return {
			homeworkId: row.id,
			centerId: row.center_id,
			classId: row.class_id,
			title: row.title,
			createdByAccountId: row.created_by_account_id,
			createdAt: row.created_at
		};
	}

	private toCompletionView(row: CompletionRow): HomeworkCompletionView {
		return {
			homeworkId: row.homework_id,
			classId: row.class_id,
			studentAccountId: row.student_account_id,
			completed: row.completed_at !== null,
			completedAt: row.completed_at
		};
	}

	private toGradeView(row: GradeRow): GradeView {
		return {
			homeworkId: row.homework_id,
			classId: row.class_id,
			studentAccountId: row.student_account_id,
			grade: row.grade,
			recordedByAccountId: row.recorded_by_account_id,
			recordedAt: row.recorded_at
		};
	}

	private toAttendanceView(row: AttendanceRow): AttendanceView {
		return {
			lessonId: row.lesson_id,
			classId: row.class_id,
			studentAccountId: row.student_account_id,
			attendance: row.attendance,
			recordedByAccountId: row.recorded_by_account_id,
			recordedAt: row.recorded_at
		};
	}
}
