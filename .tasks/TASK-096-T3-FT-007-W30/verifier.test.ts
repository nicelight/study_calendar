import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type { ActorContext } from '../../src/lib/server/modules/identity-access/public';
import {
	LessonContextBoundary,
	type StatisticsRegistryView
} from '../../src/lib/server/modules/lesson-context/public';
import { _createStatisticsPageLoad } from '../../src/routes/statistics/+page.server';

const ownAdmin: ActorContext = { accountId: 'verify-admin', role: 'admin' };
const facts = {
	centerId: 'verify-center',
	institution: { centerId: 'verify-center', name: 'Verifier Center' },
	accountIds: ['verify-student', 'verify-parent', 'verify-teacher'],
	memberships: [
		{ centerId: 'verify-center', accountId: 'verify-student' },
		{ centerId: 'verify-center', accountId: 'verify-parent' },
		{ centerId: 'verify-center', accountId: 'verify-teacher' }
	],
	parentLinks: [{
		centerId: 'verify-center',
		parentAccountId: 'verify-parent',
		studentAccountId: 'verify-student'
	}],
	assignments: [{
		centerId: 'verify-center',
		classId: 'verify-class',
		teacherAccountId: 'verify-teacher'
	}],
	classes: [{
		classId: 'verify-class',
		centerId: 'verify-center',
		name: 'Verifier Class',
		mode: 'group' as const,
		studentAccountIds: ['verify-student'],
		teacherAccountIds: ['verify-teacher'],
		studentCount: 1
	}]
};
const profiles = [
	{
		accountId: 'verify-student',
		fullName: 'Verifier Student',
		registeredAt: '2026-02-01T00:00:00.000Z'
	},
	{
		accountId: 'verify-parent',
		fullName: 'Verifier Parent',
		registeredAt: '2026-02-02T00:00:00.000Z'
	},
	{
		accountId: 'verify-teacher',
		fullName: 'Verifier Teacher',
		registeredAt: '2026-02-03T00:00:00.000Z'
	}
];

function event(actor: ActorContext | null, sessionToken = 'verify-session'): any {
	const url = new URL('https://calendar.test/statistics');
	return {
		url,
		params: {},
		request: new Request(url),
		locals: { actor },
		cookies: { get: (name: string) => name === 'foundation_session' ? sessionToken : undefined }
	};
}

async function thrown(action: () => unknown): Promise<any> {
	try {
		await action();
		throw new Error('expected SvelteKit control flow');
	} catch (cause) {
		return cause;
	}
}

function createBoundary(trace: string[], currentActor: ActorContext | null = ownAdmin) {
	const identityAccess = {
		resolveActor: vi.fn(),
		getStatisticsProfiles: vi.fn((accountIds: string[]) => {
			trace.push(`profiles:${accountIds.join(',')}`);
			return structuredClone(profiles);
		})
	};
	const centerScheduling = {
		getAuthorizedClassScope: vi.fn(),
		getLessons: vi.fn(),
		getRegistryFacts: vi.fn(({ actor }: { actor: ActorContext | null }) => {
			trace.push(`registry:${actor?.accountId ?? 'anonymous'}`);
			return actor === currentActor ? structuredClone(facts) : null;
		})
	};
	const learningProgress = {
		getAttendance: vi.fn(),
		getGradeForLesson: vi.fn(),
		getAttendancePercentage: vi.fn((request: {
			studentAccountId?: string;
			teacherAccountId?: string;
		}) => {
			trace.push(`attendance:${request.studentAccountId ?? request.teacherAccountId}`);
			return request.studentAccountId ? 62.5 : 75;
		})
	};
	const financialLedger = {
		getBalanceProjection: vi.fn(),
		getPaymentMarkers: vi.fn(),
		getPaymentCapability: vi.fn((request: { studentAccountId: string }) => {
			trace.push(`payment:${request.studentAccountId}`);
			return 50;
		})
	};
	const boundary = new LessonContextBoundary(
		{} as never,
		identityAccess as never,
		centerScheduling as never,
		learningProgress as never,
		{ getDayDiscussion: vi.fn() } as never,
		financialLedger as never
	);
	return { boundary, identityAccess, centerScheduling, learningProgress, financialLedger };
}

describe('TASK-096 fresh verifier probe', () => {
	it('proves exact composition path, complete serializable rows, thin route, and non-mutation', () => {
		const trace: string[] = [];
		const fixtureBefore = structuredClone({ facts, profiles });
		const { boundary, identityAccess, centerScheduling, learningProgress, financialLedger } =
			createBoundary(trace);

		const load = _createStatisticsPageLoad(boundary);
		const data = load(event(ownAdmin));

		expect(trace).toEqual([
			'registry:verify-admin',
			'profiles:verify-student,verify-parent,verify-teacher',
			'payment:verify-student',
			'attendance:verify-student',
			'attendance:verify-teacher'
		]);
		expect(centerScheduling.getRegistryFacts).toHaveBeenCalledExactlyOnceWith({ actor: ownAdmin });
		expect(identityAccess.getStatisticsProfiles).toHaveBeenCalledExactlyOnceWith(facts.accountIds);
		expect(financialLedger.getPaymentCapability).toHaveBeenCalledExactlyOnceWith({
			sessionToken: 'verify-session',
			classId: 'verify-class',
			studentAccountId: 'verify-student'
		});
		expect(learningProgress.getAttendancePercentage.mock.calls).toEqual([
			[{
				sessionToken: 'verify-session',
				classId: 'verify-class',
				studentAccountId: 'verify-student'
			}],
			[{ sessionToken: 'verify-session', teacherAccountId: 'verify-teacher' }]
		]);
		expect(data).toEqual({
			registry: {
				students: [{
					fullName: 'Verifier Student',
					registeredAt: '2026-02-01T00:00:00.000Z',
					className: 'Verifier Class',
					parentNames: ['Verifier Parent'],
					teacherNames: ['Verifier Teacher'],
					paymentCapabilityPercentage: 50,
					attendancePercentage: 62.5,
					institutionName: 'Verifier Center'
				}],
				teachers: [{
					fullName: 'Verifier Teacher',
					registeredAt: '2026-02-03T00:00:00.000Z',
					classNames: ['Verifier Class'],
					attendancePercentage: 75,
					institutionName: 'Verifier Center',
					studentCount: 1
				}],
				classes: [{
					className: 'Verifier Class',
					institutionName: 'Verifier Center',
					studentCount: 1,
					teacherNames: ['Verifier Teacher']
				}]
			} satisfies StatisticsRegistryView
		});
		expect(JSON.parse(JSON.stringify(data))).toEqual(data);
		expect({ facts, profiles }).toEqual(fixtureBefore);
	});

	it.each([
		[null, 'anonymous'],
		[{ accountId: 'verify-student', role: 'student' } as ActorContext, 'student'],
		[{ accountId: 'verify-parent', role: 'parent' } as ActorContext, 'parent'],
		[{ accountId: 'other-admin', role: 'admin' } as ActorContext, 'cross-center admin'],
		[{ accountId: 'removed-teacher', role: 'teacher' } as ActorContext, 'removed teacher']
	])('denies %s before profile and metric calls (%s)', async (deniedActor, _label) => {
		const trace: string[] = [];
		const { boundary, identityAccess, learningProgress, financialLedger } = createBoundary(trace);
		const denial = await thrown(() => _createStatisticsPageLoad(boundary)(event(deniedActor)));

		if (deniedActor === null) {
			expect(denial.status).toBe(303);
			expect(trace).toEqual([]);
		} else {
			expect(denial.status).toBe(403);
			expect(trace).toEqual([`registry:${deniedActor.accountId}`]);
		}
		expect(identityAccess.getStatisticsProfiles).not.toHaveBeenCalled();
		expect(learningProgress.getAttendancePercentage).not.toHaveBeenCalled();
		expect(financialLedger.getPaymentCapability).not.toHaveBeenCalled();
	});

	it('keeps the task-owned composition and destination free of table bypass and writes', () => {
		const lessonContextSource = readFileSync(
			resolve(process.cwd(), 'src/lib/server/modules/lesson-context/public.ts'),
			'utf8'
		);
		const statisticsMethod = lessonContextSource.slice(
			lessonContextSource.indexOf('\n\tgetStatisticsRegistry('),
			lessonContextSource.indexOf('\n\tprivate findLesson(')
		);
		const routeSource = readFileSync(
			resolve(process.cwd(), 'src/routes/statistics/+page.server.ts'),
			'utf8'
		);
		const pageSource = readFileSync(
			resolve(process.cwd(), 'src/routes/statistics/+page.svelte'),
			'utf8'
		);

		expect(statisticsMethod).toContain('this.centerScheduling.getRegistryFacts');
		expect(statisticsMethod).toContain('this.identityAccess.getStatisticsProfiles');
		expect(statisticsMethod).toContain('this.learningProgress.getAttendancePercentage');
		expect(statisticsMethod).toContain('this.financialLedger.getPaymentCapability');
		expect(statisticsMethod).not.toMatch(/database|sqlite|\b(SELECT|INSERT|UPDATE|DELETE)\b/i);
		expect(routeSource).toContain('lessonContext.getStatisticsRegistry');
		expect(routeSource).not.toMatch(/identity-access|center-scheduling|learning-progress|financial-ledger|sqlite|\b(SELECT|INSERT|UPDATE|DELETE)\b/i);
		expect(pageSource).not.toMatch(/<(form|input|button)\b/i);
	});
});
