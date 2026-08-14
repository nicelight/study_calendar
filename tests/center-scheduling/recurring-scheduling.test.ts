import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

type SchedulingApi = {
	createRecurringSchedule(request: {
		sessionToken?: string;
		classId: string;
		scheduleId: string;
		startDate: string;
		endDate: string;
		weekdays: number[];
	}): unknown;
	addLesson(request: {
		sessionToken?: string;
		scheduleId: string;
		lessonId: string;
		lessonDate: string;
	}): any;
	transferLesson(request: {
		sessionToken?: string;
		lessonId: string;
		lessonDate: string;
	}): any;
	cancelLesson(request: { sessionToken?: string; lessonId: string }): any;
	getLessons(request: { sessionToken?: string; classId: string }): any[] | null;
};

type LedgerApi = {
	setClassPrice(request: {
		sessionToken?: string;
		classId: string;
		amount: string;
		effectiveFrom: string;
	}): void;
	reconcileLessonCharge(request: {
		sessionToken?: string;
		lessonId: string;
		studentAccountId: string;
		attendanceTransition: { from: 'present' | 'absent'; to: 'present' | 'absent' };
	}): { charges: any[] };
	getChargeReplay(request: {
		sessionToken?: string;
		classId: string;
		studentAccountId: string;
	}): { charges: any[] };
};

type TestRoot = CompositionRoot & {
	centerScheduling: SchedulingApi;
	financialLedger: LedgerApi;
};

function scheduling(root: CompositionRoot): SchedulingApi {
	return root.centerScheduling as unknown as SchedulingApi;
}

function ledger(root: CompositionRoot): LedgerApi {
	return (root as unknown as TestRoot).financialLedger;
}

describe('recurring schedules and stable lesson exceptions', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES ('center-own', 'Own Center');
			INSERT INTO accounts (id, role) VALUES
				('admin-own', 'admin'),
				('teacher-own', 'teacher'),
				('teacher-unassigned', 'teacher'),
				('student-one', 'student');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('session-admin-own', 'admin-own', NULL),
				('session-teacher-own', 'teacher-own', NULL),
				('session-teacher-unassigned', 'teacher-unassigned', NULL);
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('center-own', 'admin-own'),
				('center-own', 'teacher-own'),
				('center-own', 'teacher-unassigned'),
				('center-own', 'student-one');
		`);
		root.centerScheduling.createClass({
			sessionToken: 'session-admin-own',
			centerId: 'center-own',
			classId: 'class-own',
			name: 'Own Class',
			mode: 'group'
		});
		root.centerScheduling.assignTeacher({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			teacherAccountId: 'teacher-own'
		});
		root.centerScheduling.addStudentToClass({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			studentAccountId: 'student-one'
		});
	});

	afterEach(() => root.database.close());

	function createWeeklySchedule(scheduleId = 'schedule-own') {
		return scheduling(root).createRecurringSchedule({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			scheduleId,
			startDate: '2026-08-03',
			endDate: '2026-08-17',
			weekdays: [1, 3]
		});
	}

	it('rejects a valid zero-occurrence request for an assigned teacher before persistence', () => {
		const api = scheduling(root);
		const before = {
			schedules: root.database.sqlite.prepare('SELECT * FROM schedules ORDER BY id').all(),
			lessons: root.database.sqlite.prepare('SELECT * FROM lessons ORDER BY id').all()
		};
		let cause: unknown;
		try {
			api.createRecurringSchedule({
				sessionToken: 'session-teacher-own',
				classId: 'class-own',
				scheduleId: 'schedule-teacher-zero',
				startDate: '2026-08-03',
				endDate: '2026-08-03',
				weekdays: [2]
			});
		} catch (error) {
			cause = error;
		}
		expect(cause).toMatchObject({ message: 'invalid-schedule-occurrences' });
		expect({
			schedules: root.database.sqlite.prepare('SELECT * FROM schedules ORDER BY id').all(),
			lessons: root.database.sqlite.prepare('SELECT * FROM lessons ORDER BY id').all()
		}).toEqual(before);
	});

	it('FT-002-AC-003 creates planned repetitions and isolates add/transfer/cancel exceptions', () => {
		const api = scheduling(root);
		const created = createWeeklySchedule() as any[];
		expect(created.map((lesson) => lesson.lessonDate)).toEqual([
			'2026-08-03',
			'2026-08-05',
			'2026-08-10',
			'2026-08-12',
			'2026-08-17'
		]);

		const before = api.getLessons({ sessionToken: 'session-admin-own', classId: 'class-own' })!;
		const selectedTransfer = before[0];
		const selectedCancel = before[1];
		api.addLesson({
			sessionToken: 'session-admin-own',
			scheduleId: 'schedule-own',
			lessonId: 'lesson-added',
			lessonDate: '2026-08-19'
		});
		api.transferLesson({
			sessionToken: 'session-admin-own',
			lessonId: selectedTransfer.lessonId,
			lessonDate: '2026-08-04'
		});
		api.cancelLesson({ sessionToken: 'session-admin-own', lessonId: selectedCancel.lessonId });

		const after = api.getLessons({ sessionToken: 'session-admin-own', classId: 'class-own' });
		expect(after).toEqual(
			expect.arrayContaining([
			expect.objectContaining({ lessonId: selectedTransfer.lessonId, lessonDate: '2026-08-04', status: 'planned' }),
			expect.objectContaining({ lessonId: selectedCancel.lessonId, lessonDate: '2026-08-05', status: 'cancelled' }),
			expect.objectContaining({ lessonId: 'lesson-added', lessonDate: '2026-08-19', status: 'planned' }),
			expect.objectContaining({ lessonId: before[2].lessonId, lessonDate: '2026-08-10', status: 'planned' }),
			expect.objectContaining({ lessonId: before[3].lessonId, lessonDate: '2026-08-12', status: 'planned' }),
			expect.objectContaining({ lessonId: before[4].lessonId, lessonDate: '2026-08-17', status: 'planned' })
			])
		);
	});

	it('FT-002-AC-004 preserves transfer identity/context and prevents duplicate chargeable lesson identity', () => {
		const api = scheduling(root);
		const financial = ledger(root);
		financial.setClassPrice({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			amount: '10.00',
			effectiveFrom: '2026-01-01'
		});
		api.createRecurringSchedule({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			scheduleId: 'schedule-transfer',
			startDate: '2026-08-03',
			endDate: '2026-08-03',
			weekdays: [1]
		});
		const before = api.getLessons({ sessionToken: 'session-admin-own', classId: 'class-own' })![0];
		financial.reconcileLessonCharge({
			sessionToken: 'session-admin-own',
			lessonId: before.lessonId,
			studentAccountId: 'student-one',
			attendanceTransition: { from: 'absent', to: 'present' }
		});

		api.transferLesson({
			sessionToken: 'session-admin-own',
			lessonId: before.lessonId,
			lessonDate: '2026-08-04'
		});
		const moved = api.getLessons({ sessionToken: 'session-admin-own', classId: 'class-own' })![0];
		expect(moved).toMatchObject({
			lessonId: before.lessonId,
			centerId: 'center-own',
			classId: 'class-own',
			scheduleId: 'schedule-transfer',
			lessonDate: '2026-08-04',
			status: 'planned',
			createdByAccountId: 'admin-own'
		});

		financial.reconcileLessonCharge({
			sessionToken: 'session-admin-own',
			lessonId: moved.lessonId,
			studentAccountId: 'student-one',
			attendanceTransition: { from: 'absent', to: 'present' }
		});
		expect(
			financial.getChargeReplay({
				sessionToken: 'session-admin-own',
				classId: 'class-own',
				studentAccountId: 'student-one'
			}).charges
		).toHaveLength(1);
		expect(
			root.database.sqlite
				.prepare('SELECT lesson_id, COUNT(*) AS count FROM financial_lesson_charges GROUP BY lesson_id')
				.all()
		).toEqual([{ lesson_id: before.lessonId, count: 1 }]);
	});

	it('FT-002-AC-005 gives an assigned teacher historical access and preserves authored attribution', () => {
		const api = scheduling(root);
		root.centerScheduling.removeTeacherAssignment({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			teacherAccountId: 'teacher-own'
		});
		api.createRecurringSchedule({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			scheduleId: 'schedule-history',
			startDate: '2026-08-03',
			endDate: '2026-08-03',
			weekdays: [1]
		});
		root.centerScheduling.assignTeacher({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			teacherAccountId: 'teacher-own'
		});

		expect(root.centerScheduling.getAuthorizedClassScope('session-teacher-own', 'class-own')).toMatchObject({
			classId: 'class-own',
			role: 'teacher'
		});
		expect(api.getLessons({ sessionToken: 'session-teacher-own', classId: 'class-own' })).toEqual([
			expect.objectContaining({ createdByAccountId: 'admin-own', scheduleId: 'schedule-history' })
		]);
	});

	it('FT-002-AC-006 denies the removed teacher immediately while authored lessons remain attributable', () => {
		const api = scheduling(root);
		api.createRecurringSchedule({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			scheduleId: 'schedule-removal',
			startDate: '2026-08-03',
			endDate: '2026-08-03',
			weekdays: [1]
		});
		const lesson = api.getLessons({ sessionToken: 'session-admin-own', classId: 'class-own' })![0];
		root.centerScheduling.removeTeacherAssignment({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			teacherAccountId: 'teacher-own'
		});

		expect(root.centerScheduling.getAuthorizedClassScope('session-teacher-own', 'class-own')).toBeNull();
		expect(api.getLessons({ sessionToken: 'session-teacher-own', classId: 'class-own' })).toBeNull();
		expect(() =>
			ledger(root).getChargeReplay({
				sessionToken: 'session-teacher-own',
				classId: 'class-own',
				studentAccountId: 'student-one'
			})
		).toThrow('not-authorized');
		expect(() =>
			api.transferLesson({
				sessionToken: 'session-teacher-own',
				lessonId: lesson.lessonId,
				lessonDate: '2026-08-04'
			})
		).toThrow('not-authorized');
		expect(api.getLessons({ sessionToken: 'session-admin-own', classId: 'class-own' })).toEqual([
			expect.objectContaining({ lessonId: lesson.lessonId, createdByAccountId: 'admin-own' })
		]);
	});
});
