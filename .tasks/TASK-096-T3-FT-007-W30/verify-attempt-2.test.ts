import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type { ActorContext } from '../../src/lib/server/modules/identity-access/public';
import { LessonContextBoundary } from '../../src/lib/server/modules/lesson-context/public';
import { _createStatisticsPageLoad } from '../../src/routes/statistics/+page.server';

const teacher: ActorContext = { accountId: 'teacher-one', role: 'teacher' };
const facts = {
	centerId: 'center-own',
	institution: { centerId: 'center-own', name: 'Own Center' },
	accountIds: ['student-one', 'parent-one', 'teacher-one', 'teacher-two'],
	memberships: [],
	parentLinks: [{ centerId: 'center-own', parentAccountId: 'parent-one', studentAccountId: 'student-one' }],
	assignments: [],
	classes: [
		{ classId: 'alpha', centerId: 'center-own', name: 'Alpha', mode: 'group' as const, studentAccountIds: ['student-one'], teacherAccountIds: ['teacher-one'], studentCount: 1 },
		{ classId: 'beta', centerId: 'center-own', name: 'Beta', mode: 'group' as const, studentAccountIds: ['student-one'], teacherAccountIds: ['teacher-one', 'teacher-two'], studentCount: 1 }
	]
};
const profiles = [
	{ accountId: 'student-one', fullName: 'Student One', registeredAt: '2026-01-01T00:00:00.000Z' },
	{ accountId: 'parent-one', fullName: 'Parent One', registeredAt: '2026-01-02T00:00:00.000Z' },
	{ accountId: 'teacher-one', fullName: 'Teacher One', registeredAt: '2026-01-03T00:00:00.000Z' },
	{ accountId: 'teacher-two', fullName: 'Teacher Two', registeredAt: '2026-01-04T00:00:00.000Z' }
];

function build(currentActor: ActorContext | null = teacher) {
	const trace: string[] = [];
	const identity = {
		resolveActor: vi.fn(),
		getStatisticsProfiles: vi.fn((ids: string[]) => {
			trace.push(`profiles:${ids.join(',')}`);
			return structuredClone(profiles);
		})
	};
	const scheduling = {
		getAuthorizedClassScope: vi.fn(), getLessons: vi.fn(),
		getRegistryFacts: vi.fn(({ actor }: { actor: ActorContext | null }) => {
			trace.push(`registry:${actor?.accountId ?? 'anonymous'}`);
			return actor === currentActor ? structuredClone(facts) : null;
		})
	};
	const progress = {
		getAttendance: vi.fn(), getGradeForLesson: vi.fn(),
		getAttendancePercentage: vi.fn(({ studentAccountId, teacherAccountId }: { studentAccountId?: string; teacherAccountId?: string }) => {
			trace.push(`attendance:${studentAccountId ?? teacherAccountId}`);
			return studentAccountId ? 75 : 80;
		})
	};
	const financial = {
		getBalanceProjection: vi.fn(), getPaymentMarkers: vi.fn(),
		getPaymentCapability: vi.fn(({ studentAccountId }: { studentAccountId: string }) => {
			trace.push(`payment:${studentAccountId}`);
			return 50;
		})
	};
	return {
		trace, identity, scheduling, progress, financial,
		boundary: new LessonContextBoundary({} as never, identity as never, scheduling as never, progress as never, { getDayDiscussion: vi.fn() } as never, financial as never)
	};
}

function event(actor: ActorContext | null): any {
	const url = new URL('https://calendar.test/statistics');
	return { url, params: {}, request: new Request(url), locals: { actor }, cookies: { get: () => 'session-teacher' } };
}

async function capture(action: () => unknown): Promise<any> {
	try { await action(); throw new Error('expected control flow'); } catch (error) { return error; }
}

describe('TASK-096 Attempt 2 verifier-owned functional probe', () => {
	it('preserves relationship rows, counts distinct students, and limits a Teacher view to the current Teacher', () => {
		const before = structuredClone({ facts, profiles });
		const { boundary, trace, identity, scheduling, progress, financial } = build();
		const result = boundary.getStatisticsRegistry({ actor: teacher, sessionToken: 'session-teacher' });

		expect(trace).toEqual([
			'registry:teacher-one', 'profiles:student-one,parent-one,teacher-one,teacher-two',
			'payment:student-one', 'attendance:student-one', 'payment:student-one', 'attendance:student-one', 'attendance:teacher-one'
		]);
		expect(scheduling.getRegistryFacts).toHaveBeenCalledExactlyOnceWith({ actor: teacher });
		expect(identity.getStatisticsProfiles).toHaveBeenCalledExactlyOnceWith(facts.accountIds);
		expect(financial.getPaymentCapability).toHaveBeenCalledTimes(2);
		expect(progress.getAttendancePercentage).toHaveBeenLastCalledWith({ sessionToken: 'session-teacher', teacherAccountId: 'teacher-one' });
		expect(result.students).toHaveLength(2);
		expect(Object.keys(result.students[0]).sort()).toEqual([
			'attendancePercentage', 'className', 'fullName', 'institutionName', 'parentNames',
			'paymentCapabilityPercentage', 'registeredAt', 'teacherNames'
		]);
		expect(result.students.map((row) => [row.className, row.teacherNames])).toEqual([
			['Alpha', ['Teacher One']], ['Beta', ['Teacher One', 'Teacher Two']]
		]);
		expect(result.students[0]).toMatchObject({ fullName: 'Student One', parentNames: ['Parent One'], paymentCapabilityPercentage: 50, attendancePercentage: 75, institutionName: 'Own Center' });
		expect(result.teachers).toEqual([expect.objectContaining({ fullName: 'Teacher One', classNames: ['Alpha', 'Beta'], studentCount: 1 })]);
		expect(Object.keys(result.teachers[0]).sort()).toEqual(['attendancePercentage', 'classNames', 'fullName', 'institutionName', 'registeredAt', 'studentCount']);
		expect(result.classes).toHaveLength(2);
		expect(Object.keys(result.classes[0]).sort()).toEqual(['className', 'institutionName', 'studentCount', 'teacherNames']);
		expect(JSON.parse(JSON.stringify(result))).toEqual(result);
		expect({ facts, profiles }).toEqual(before);
	});

	it('returns every scoped Teacher row for an Admin while retaining the same relationship cardinality', () => {
		const admin: ActorContext = { accountId: 'admin-own', role: 'admin' };
		const { boundary } = build(admin);
		const result = boundary.getStatisticsRegistry({ actor: admin, sessionToken: 'session-admin' });
		expect(result.students).toHaveLength(2);
		expect(result.teachers.map((row) => [row.fullName, row.studentCount])).toEqual([
			['Teacher One', 1], ['Teacher Two', 1]
		]);
	});

	it.each([
		{ accountId: 'student-one', role: 'student' } as ActorContext,
		{ accountId: 'parent-one', role: 'parent' } as ActorContext,
		{ accountId: 'admin-other', role: 'admin' } as ActorContext,
		{ accountId: 'teacher-removed', role: 'teacher' } as ActorContext
	])('denies unauthorized registry callers before profile or metric enrichment', (actor) => {
		const { boundary, identity, progress, financial } = build();
		expect(() => boundary.getStatisticsRegistry({ actor, sessionToken: 'denied' })).toThrow('not-authorized');
		expect(identity.getStatisticsProfiles).not.toHaveBeenCalled();
		expect(progress.getAttendancePercentage).not.toHaveBeenCalled();
		expect(financial.getPaymentCapability).not.toHaveBeenCalled();
	});

	it('keeps /statistics a protected Lesson Context adapter without direct provider or table access', async () => {
		const anonymousPort = { getStatisticsRegistry: vi.fn() };
		const anonymous = await capture(() => _createStatisticsPageLoad(anonymousPort)(event(null)));
		expect(anonymous.status).toBe(303);
		expect(anonymousPort.getStatisticsRegistry).not.toHaveBeenCalled();
		const denied = await capture(() => _createStatisticsPageLoad({ getStatisticsRegistry: () => { throw new Error('not-authorized'); } })(event(teacher)));
		expect(denied.status).toBe(403);

		const lessonContext = readFileSync(resolve(process.cwd(), 'src/lib/server/modules/lesson-context/public.ts'), 'utf8');
		const method = lessonContext.slice(lessonContext.indexOf('\n\tgetStatisticsRegistry('), lessonContext.indexOf('\n\tprivate getStatisticsAccountIds('));
		const route = readFileSync(resolve(process.cwd(), 'src/routes/statistics/+page.server.ts'), 'utf8');
		const page = readFileSync(resolve(process.cwd(), 'src/routes/statistics/+page.svelte'), 'utf8');
		expect(method).toContain('this.centerScheduling.getRegistryFacts');
		expect(method).toContain('this.identityAccess.getStatisticsProfiles');
		expect(method).toContain('this.learningProgress.getAttendancePercentage');
		expect(method).toContain('this.financialLedger.getPaymentCapability');
		expect(method).not.toMatch(/database|sqlite|\b(SELECT|INSERT|UPDATE|DELETE)\b/i);
		expect(route).toContain('lessonContext.getStatisticsRegistry');
		expect(route).not.toMatch(/identity-access|center-scheduling|learning-progress|financial-ledger|sqlite|\b(SELECT|INSERT|UPDATE|DELETE)\b/i);
		expect(page).not.toMatch(/<(form|input|button)\b/i);
	});
});
