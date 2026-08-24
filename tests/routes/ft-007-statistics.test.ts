import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'svelte/server';
import type { ActorContext } from '../../src/lib/server/modules/identity-access/public';
import type { StatisticsRegistryView } from '../../src/lib/server/modules/lesson-context/public';
import { _createStatisticsPageLoad } from '../../src/routes/statistics/+page.server';
import StatisticsPage from '../../src/routes/statistics/+page.svelte';

const actor: ActorContext = { accountId: 'admin-own', role: 'admin' };
const registry: StatisticsRegistryView = {
	students: [{
		fullName: 'Student One',
		registeredAt: '2026-01-01T00:00:00.000Z',
		className: 'Alpha',
		parentNames: ['Parent One'],
		teacherNames: ['Teacher One'],
		paymentCapabilityPercentage: 100,
		attendancePercentage: 75,
		institutionName: 'Own Center'
	}],
	teachers: [{
		fullName: 'Teacher One',
		registeredAt: '2026-01-02T00:00:00.000Z',
		classNames: ['Alpha'],
		attendancePercentage: 80,
		institutionName: 'Own Center',
		studentCount: 1
	}],
	classes: [{
		className: 'Alpha',
		institutionName: 'Own Center',
		studentCount: 1,
		teacherNames: ['Teacher One']
	}]
};

function event(currentActor: ActorContext | null, token = 'session-admin'): any {
	const url = new URL('https://calendar.test/statistics');
	return {
		url,
		params: {},
		request: new Request(url),
		locals: { actor: currentActor },
		cookies: { get: (name: string) => name === 'foundation_session' ? token : undefined }
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

describe('FT-007-AC-003 /statistics adapter', () => {
	it('passes only request actor/session to Lesson Context and returns its serializable projection unchanged', () => {
		const getStatisticsRegistry = vi.fn(() => registry);
		const load = _createStatisticsPageLoad({ getStatisticsRegistry });

		const data = load(event(actor));

		expect(getStatisticsRegistry).toHaveBeenCalledExactlyOnceWith({
			actor,
			sessionToken: 'session-admin'
		});
		expect(data).toEqual({ registry });
		expect(JSON.parse(JSON.stringify(data))).toEqual(data);
	});

	it('renders every accepted Students, Teachers, and Classes field without mutation controls', () => {
		const body = render(StatisticsPage, { props: { data: { registry } } } as any).body;

		for (const value of [
			'Students', 'Student One', 'Alpha', 'Parent One', 'Teacher One', '100%', '75%',
			'Teachers', '80%', 'Own Center', 'Classes'
		]) {
			expect(body).toContain(value);
		}
		expect(body).not.toContain('<form');
		expect(body).not.toContain('<input');
		expect(body).not.toContain('<button');
	});

	it('redirects anonymous requests and maps Lesson Context denials to safe 403 responses', async () => {
		const anonymousCall = vi.fn(() => registry);
		const anonymous = await thrown(() => _createStatisticsPageLoad({ getStatisticsRegistry: anonymousCall })(event(null)));
		expect(anonymous.status).toBe(303);
		expect(anonymous.location).toBe('/login');
		expect(anonymousCall).not.toHaveBeenCalled();

		for (const deniedActor of [
			{ accountId: 'student-one', role: 'student' },
			{ accountId: 'parent-one', role: 'parent' },
			{ accountId: 'admin-other', role: 'admin' },
			{ accountId: 'teacher-removed', role: 'teacher' }
		] as ActorContext[]) {
			const denied = await thrown(() => _createStatisticsPageLoad({
				getStatisticsRegistry: () => { throw new Error('not-authorized'); }
			})(event(deniedActor, 'denied-session')));
			expect(denied.status).toBe(403);
			expect(denied.body?.message ?? denied.message).toContain('Forbidden');
		}
	});

	it('keeps the route as an adapter with no provider/table access', () => {
		const source = readFileSync(
			resolve(process.cwd(), 'src/routes/statistics/+page.server.ts'),
			'utf8'
		);
		expect(source).toContain('lessonContext.getStatisticsRegistry');
		expect(source).not.toContain('identity-access');
		expect(source).not.toContain('center-scheduling');
		expect(source).not.toContain('learning-progress');
		expect(source).not.toContain('financial-ledger');
		expect(source).not.toContain('.sqlite');
		expect(source).not.toMatch(/\b(accounts|classes|payments|attendance)\b/i);
	});
});
