import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import AdminCenterPage from '../../src/routes/admin/[centerId]/+page.svelte';

const pagePath = resolve(process.cwd(), 'src/routes/admin/[centerId]/+page.svelte');

const data = {
	centerId: 'center-draft',
	name: 'Draft Center',
	participants: [],
	classes: [
		{
			classId: 'class-draft',
			name: 'Draft Class',
			mode: 'group',
			studentCount: 0,
			teacherAccountIds: [],
			schedules: []
		}
	]
};

describe('FT-002-AC-008 schedule form draft transport', () => {
	it('SSR-renders the native schedule payload without browser storage access', () => {
		const rendered = render(AdminCenterPage, { props: { data, form: null } } as any);

		expect(rendered.body).toContain('data-schedule-draft-key="study-calendar:schedule-draft:center-draft:class-draft"');
		expect(rendered.body).toContain('name="startDate"');
		expect(rendered.body).toContain('name="endDate"');
		expect(rendered.body).toContain('name="weekdays"');
	});

	it('limits browser persistence to the scoped date/weekdays whitelist and confirmed success', () => {
		const source = readFileSync(pagePath, 'utf8');

		expect(source).toContain('study-calendar:schedule-draft:${centerId}:${classId}');
		expect(source).toContain("Object.keys(draft).length !== 3");
		expect(source).toContain("'startDate' in draft");
		expect(source).toContain("'endDate' in draft");
		expect(source).toContain("'weekdays' in draft");
		expect(source).toContain('Number.isInteger(weekday) && weekday >= 0 && weekday <= 6');
		expect(source).toContain("result.data?.message === 'schedule_created'");
		expect(source).toContain('use:enhance={handleScheduleSubmit}');
		expect(source).not.toContain('document.cookie');
	});
});
