import { describe, expect, it, vi } from 'vitest';
import {
	LessonContextBoundary,
	type StatisticsRegistryView
} from '../../src/lib/server/modules/lesson-context/public';
import type { ActorContext } from '../../src/lib/server/modules/identity-access/public';
import { createCompositionRoot } from '../../src/lib/server/composition-root';

type StatisticsApi = {
	getStatisticsRegistry(request: {
		actor: ActorContext | null;
		sessionToken?: string;
	}): StatisticsRegistryView;
};

const admin: ActorContext = { accountId: 'admin-own', role: 'admin' };
const teacher: ActorContext = { accountId: 'teacher-one', role: 'teacher' };

const adminFacts = {
	centerId: 'center-own',
	institution: { centerId: 'center-own', name: 'Own Center' },
	accountIds: ['student-one', 'student-two', 'parent-one', 'teacher-one', 'teacher-two'],
	memberships: [
		{ centerId: 'center-own', accountId: 'student-one' },
		{ centerId: 'center-own', accountId: 'student-two' },
		{ centerId: 'center-own', accountId: 'parent-one' },
		{ centerId: 'center-own', accountId: 'teacher-one' },
		{ centerId: 'center-own', accountId: 'teacher-two' }
	],
	parentLinks: [
		{ centerId: 'center-own', parentAccountId: 'parent-one', studentAccountId: 'student-one' }
	],
	assignments: [
		{ centerId: 'center-own', classId: 'class-alpha', teacherAccountId: 'teacher-one' },
		{ centerId: 'center-own', classId: 'class-beta', teacherAccountId: 'teacher-one' },
		{ centerId: 'center-own', classId: 'class-beta', teacherAccountId: 'teacher-two' }
	],
	classes: [
		{
			classId: 'class-alpha',
			centerId: 'center-own',
			name: 'Alpha',
			mode: 'group' as const,
			studentAccountIds: ['student-one'],
			teacherAccountIds: ['teacher-one'],
			studentCount: 1
		},
		{
			classId: 'class-beta',
			centerId: 'center-own',
			name: 'Beta',
			mode: 'group' as const,
			studentAccountIds: ['student-two'],
			teacherAccountIds: ['teacher-one', 'teacher-two'],
			studentCount: 1
		}
	]
};

const profiles = [
	{ accountId: 'student-one', fullName: 'Student One', registeredAt: '2026-01-01T00:00:00.000Z' },
	{ accountId: 'student-two', fullName: 'Student Two', registeredAt: '2026-01-02T00:00:00.000Z' },
	{ accountId: 'parent-one', fullName: 'Parent One', registeredAt: '2026-01-03T00:00:00.000Z' },
	{ accountId: 'teacher-one', fullName: 'Teacher One', registeredAt: '2026-01-04T00:00:00.000Z' },
	{ accountId: 'teacher-two', fullName: 'Teacher Two', registeredAt: '2026-01-05T00:00:00.000Z' }
];

function createApi(options: {
	facts?: typeof adminFacts | null;
	trace?: string[];
	profileRows?: typeof profiles;
} = {}) {
	const trace = options.trace ?? [];
	const identityAccess = {
		resolveActor: vi.fn(),
		getStatisticsProfiles: vi.fn((accountIds: string[]) => {
			trace.push(`profiles:${accountIds.join(',')}`);
			return options.profileRows ?? profiles;
		})
	};
	const centerScheduling = {
		getAuthorizedClassScope: vi.fn(),
		getLessons: vi.fn(),
		getRegistryFacts: vi.fn(() => {
			trace.push('registry');
			return options.facts === undefined ? adminFacts : options.facts;
		})
	};
	const learningProgress = {
		getAttendance: vi.fn(),
		getGradeForLesson: vi.fn(),
		getAttendancePercentage: vi.fn((request: { studentAccountId?: string; teacherAccountId?: string }) => {
			const accountId = request.studentAccountId ?? request.teacherAccountId;
			trace.push(`attendance:${accountId}`);
			return accountId === 'student-one' ? 75 : accountId === 'student-two' ? 50 : 80;
		})
	};
	const financialLedger = {
		getBalanceProjection: vi.fn(),
		getPaymentMarkers: vi.fn(),
		getPaymentCapability: vi.fn((request: { studentAccountId: string }) => {
			trace.push(`payment:${request.studentAccountId}`);
			return request.studentAccountId === 'student-one' ? 100 : 25;
		})
	};

	const boundary = new LessonContextBoundary(
		{} as never,
		identityAccess as never,
		centerScheduling as never,
		learningProgress as never,
		{ getDayDiscussion: vi.fn() } as never,
		financialLedger as never
	) as unknown as StatisticsApi;

	return { boundary, identityAccess, centerScheduling, learningProgress, financialLedger, trace };
}

describe('FT-007-AC-003 Lesson Context Statistics composition', () => {
	it('scopes through Center & Scheduling before profile enrichment and returns complete serializable Admin rows', () => {
		const sourceState = structuredClone(adminFacts);
		const { boundary, identityAccess, centerScheduling, learningProgress, financialLedger, trace } = createApi();

		const result = boundary.getStatisticsRegistry({ actor: admin, sessionToken: 'session-admin' });

		expect(trace.slice(0, 2)).toEqual([
			'registry',
			'profiles:student-one,student-two,parent-one,teacher-one,teacher-two'
		]);
		expect(centerScheduling.getRegistryFacts).toHaveBeenCalledExactlyOnceWith({ actor: admin });
		expect(identityAccess.getStatisticsProfiles).toHaveBeenCalledExactlyOnceWith(adminFacts.accountIds);
		expect(learningProgress.getAttendancePercentage.mock.calls).toEqual([
			[{ sessionToken: 'session-admin', classId: 'class-alpha', studentAccountId: 'student-one' }],
			[{ sessionToken: 'session-admin', classId: 'class-beta', studentAccountId: 'student-two' }],
			[{ sessionToken: 'session-admin', teacherAccountId: 'teacher-one' }],
			[{ sessionToken: 'session-admin', teacherAccountId: 'teacher-two' }]
		]);
		expect(financialLedger.getPaymentCapability.mock.calls).toEqual([
			[{ sessionToken: 'session-admin', classId: 'class-alpha', studentAccountId: 'student-one' }],
			[{ sessionToken: 'session-admin', classId: 'class-beta', studentAccountId: 'student-two' }]
		]);

		expect(result).toEqual({
			students: [
				{
					fullName: 'Student One',
					registeredAt: '2026-01-01T00:00:00.000Z',
					className: 'Alpha',
					parentNames: ['Parent One'],
					teacherNames: ['Teacher One'],
					paymentCapabilityPercentage: 100,
					attendancePercentage: 75,
					institutionName: 'Own Center'
				},
				{
					fullName: 'Student Two',
					registeredAt: '2026-01-02T00:00:00.000Z',
					className: 'Beta',
					parentNames: [],
					teacherNames: ['Teacher One', 'Teacher Two'],
					paymentCapabilityPercentage: 25,
					attendancePercentage: 50,
					institutionName: 'Own Center'
				}
			],
			teachers: [
				{
					fullName: 'Teacher One',
					registeredAt: '2026-01-04T00:00:00.000Z',
					classNames: ['Alpha', 'Beta'],
					attendancePercentage: 80,
					institutionName: 'Own Center',
					studentCount: 2
				},
				{
					fullName: 'Teacher Two',
					registeredAt: '2026-01-05T00:00:00.000Z',
					classNames: ['Beta'],
					attendancePercentage: 80,
					institutionName: 'Own Center',
					studentCount: 1
				}
			],
			classes: [
				{
					className: 'Alpha',
					institutionName: 'Own Center',
					studentCount: 1,
					teacherNames: ['Teacher One']
				},
				{
					className: 'Beta',
					institutionName: 'Own Center',
					studentCount: 1,
					teacherNames: ['Teacher One', 'Teacher Two']
				}
			]
		});
		expect(JSON.parse(JSON.stringify(result))).toEqual(result);
		expect(adminFacts).toEqual(sourceState);
	});

	it('keeps Teacher rows limited to provider-scoped assigned classes', () => {
		const teacherFacts = {
			...adminFacts,
			accountIds: ['student-one', 'parent-one', 'teacher-one', 'teacher-two'],
			memberships: adminFacts.memberships.filter(({ accountId }) => accountId !== 'student-two'),
			assignments: [
				adminFacts.assignments[0],
				{ centerId: 'center-own', classId: 'class-alpha', teacherAccountId: 'teacher-two' }
			],
			classes: [{ ...adminFacts.classes[0], teacherAccountIds: ['teacher-one', 'teacher-two'] }]
		};
		const profileRows = profiles.filter(({ accountId }) => teacherFacts.accountIds.includes(accountId));
		const { boundary, learningProgress } = createApi({ facts: teacherFacts, profileRows });

		const result = boundary.getStatisticsRegistry({ actor: teacher, sessionToken: 'session-teacher' });

		expect(result.students.map(({ className }) => className)).toEqual(['Alpha']);
		expect(result.teachers).toHaveLength(1);
		expect(result.teachers[0].fullName).toBe('Teacher One');
		expect(result.students[0].teacherNames).toEqual(['Teacher One', 'Teacher Two']);
		expect(result.classes.map(({ className }) => className)).toEqual(['Alpha']);
		expect(learningProgress.getAttendancePercentage).not.toHaveBeenCalledWith(
			expect.objectContaining({ teacherAccountId: 'teacher-two' })
		);
		expect(JSON.stringify(result)).not.toContain('Beta');
	});

	it('counts a shared Student once across a Teacher\'s assigned classes', () => {
		const factsWithSharedStudent = {
			...adminFacts,
			accountIds: ['student-one', 'parent-one', 'teacher-one', 'teacher-two'],
			memberships: adminFacts.memberships.filter(({ accountId }) => accountId !== 'student-two'),
			classes: adminFacts.classes.map((classView) =>
				classView.classId === 'class-beta'
					? { ...classView, studentAccountIds: ['student-one'], studentCount: 1 }
					: classView
			)
		};
		const profileRows = profiles.filter(({ accountId }) =>
			factsWithSharedStudent.accountIds.includes(accountId)
		);
		const { boundary } = createApi({ facts: factsWithSharedStudent, profileRows });

		const result = boundary.getStatisticsRegistry({ actor: admin, sessionToken: 'session-admin' });

		expect(result.students.filter(({ fullName }) => fullName === 'Student One')).toHaveLength(2);
		expect(result.teachers.find(({ fullName }) => fullName === 'Teacher One')?.studentCount).toBe(1);
	});

	it.each([
		[null, 'anonymous'],
		[{ accountId: 'student-one', role: 'student' } as ActorContext, 'student'],
		[{ accountId: 'parent-one', role: 'parent' } as ActorContext, 'parent'],
		[{ accountId: 'admin-other', role: 'admin' } as ActorContext, 'cross-center Admin'],
		[{ accountId: 'teacher-removed', role: 'teacher' } as ActorContext, 'removed Teacher']
	])('denies %s scope before profile or metric enrichment (%s)', (actor, _label) => {
		const { boundary, identityAccess, learningProgress, financialLedger } = createApi({ facts: null });

		expect(() => boundary.getStatisticsRegistry({ actor, sessionToken: 'denied-session' })).toThrow('not-authorized');
		expect(identityAccess.getStatisticsProfiles).not.toHaveBeenCalled();
		expect(learningProgress.getAttendancePercentage).not.toHaveBeenCalled();
		expect(financialLedger.getPaymentCapability).not.toHaveBeenCalled();
	});

	it('fails closed instead of emitting incomplete rows when a scoped participant profile is absent', () => {
		const { boundary, learningProgress, financialLedger } = createApi({
			profileRows: profiles.filter(({ accountId }) => accountId !== 'student-two')
		});

		expect(() => boundary.getStatisticsRegistry({ actor: admin, sessionToken: 'session-admin' })).toThrow('not-authorized');
		expect(learningProgress.getAttendancePercentage).not.toHaveBeenCalled();
		expect(financialLedger.getPaymentCapability).not.toHaveBeenCalled();
	});

	it('leaves every provider-owned source table unchanged through the real in-memory boundaries', () => {
		const root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES ('center-real', 'Real Center');
			INSERT INTO accounts (id, role) VALUES
				('admin-real', 'admin'), ('teacher-real', 'teacher'),
				('student-real', 'student'), ('parent-real', 'parent');
			INSERT INTO account_profiles (account_id, full_name, registered_at) VALUES
				('admin-real', 'Admin Real', '2026-01-01T00:00:00.000Z'),
				('teacher-real', 'Teacher Real', '2026-01-02T00:00:00.000Z'),
				('student-real', 'Student Real', '2026-01-03T00:00:00.000Z'),
				('parent-real', 'Parent Real', '2026-01-04T00:00:00.000Z');
			INSERT INTO sessions (token, account_id, revoked_at)
				VALUES ('session-admin-real', 'admin-real', NULL);
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('center-real', 'admin-real'), ('center-real', 'teacher-real'),
				('center-real', 'student-real'), ('center-real', 'parent-real');
			INSERT INTO classes (id, center_id, name, mode)
				VALUES ('class-real', 'center-real', 'Real Class', 'group');
			INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
				VALUES ('center-real', 'class-real', 'teacher-real');
			INSERT INTO class_students (center_id, class_id, student_account_id)
				VALUES ('center-real', 'class-real', 'student-real');
			INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id)
				VALUES ('center-real', 'parent-real', 'student-real');
		`);
		const tables = [
			'accounts', 'account_profiles', 'sessions', 'centers', 'center_memberships',
			'classes', 'teacher_assignments', 'class_students', 'parent_student_links',
			'schedules', 'lessons', 'learning_attendance', 'financial_price_settings',
			'financial_lesson_charges', 'financial_payments', 'financial_payment_commands',
			'financial_payment_allocations', 'financial_audit_records',
			'financial_payment_audit_records', 'lesson_context_material'
		];
		const snapshot = () => Object.fromEntries(tables.map((table) => [
			table,
			root.database.sqlite.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()
		]));
		const before = snapshot();

		try {
			const result = root.lessonContext.getStatisticsRegistry({
				actor: root.identityAccess.resolveActor('session-admin-real'),
				sessionToken: 'session-admin-real'
			});

			expect(result.students).toEqual([expect.objectContaining({
				fullName: 'Student Real',
				className: 'Real Class',
				parentNames: ['Parent Real'],
				teacherNames: ['Teacher Real'],
				paymentCapabilityPercentage: 0,
				attendancePercentage: 0
			})]);
			expect(result.teachers).toEqual([expect.objectContaining({
				fullName: 'Teacher Real',
				classNames: ['Real Class'],
				attendancePercentage: 0,
				studentCount: 1
			})]);
			expect(result.classes).toEqual([expect.objectContaining({
				className: 'Real Class',
				teacherNames: ['Teacher Real'],
				studentCount: 1
			})]);
			expect(snapshot()).toEqual(before);
		} finally {
			root.database.close();
		}
	});
});
