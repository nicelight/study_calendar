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

describe('FT-002-AC-010 schedule date presentation', () => {
	it('SSR-renders strict display controls with ISO-named Form Data inputs', () => {
		const rendered = render(AdminCenterPage, { props: { data, form: null } } as any);

		expect(rendered.body).toContain('type="hidden" name="startDate"');
		expect(rendered.body).toContain('type="hidden" name="endDate"');
		expect(rendered.body).toContain('data-schedule-date-field="startDate"');
		expect(rendered.body).toContain('data-schedule-date-field="endDate"');
		expect(rendered.body).toContain('placeholder="dd/mm/yyyy"');
		expect(rendered.body).toContain('pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"');
		expect(rendered.body).not.toContain('pattern="[0-9]2/[0-9]2/[0-9]4"');
		expect(rendered.body).not.toContain('type="date" name="startDate"');
		expect(rendered.body).not.toContain('type="date" name="endDate"');
	});

	it('serializes a native-valid strict pattern for leap and end-of-year dates', () => {
		const rendered = render(AdminCenterPage, { props: { data, form: null } } as any);
		const patterns = Array.from(rendered.body.matchAll(/pattern="([^"]+)"/g), (match) => match[1]);

		expect(patterns).toEqual([
			'[0-9]{2}/[0-9]{2}/[0-9]{4}',
			'[0-9]{2}/[0-9]{2}/[0-9]{4}'
		]);
		for (const pattern of patterns) {
			const nativePattern = new RegExp(`^(?:${pattern})$`);
			expect(nativePattern.test('29/02/2028')).toBe(true);
			expect(nativePattern.test('31/12/2028')).toBe(true);
		}
	});

	it('uses strict parsing, explicit invalid state, and ISO-only draft/form synchronization', () => {
		const source = readFileSync(pagePath, 'utf8');

		expect(source).toContain('function parseScheduleDate(value: string): string | null');
		expect(source).toContain('/^(\\d{2})\\/(\\d{2})\\/(\\d{4})$/');
		expect(source).toContain('return isStoredDate(isoDate) ? isoDate : null');
		expect(source).toContain('input.setCustomValidity(');
		expect(source).toContain("input.setAttribute('aria-invalid', invalid ? 'true' : 'false')");
		expect(source).toContain("hiddenInput.value = isoDate ?? ''");
		expect(source).toContain('formatScheduleDate(draft.startDate)');
		expect(source).toContain('formatScheduleDate(draft.endDate)');
	});
});
