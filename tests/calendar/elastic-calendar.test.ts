import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildCalendarWeeks } from '../../src/lib/calendar';

const routeSource = readFileSync(resolve(process.cwd(), 'src/routes/+page.svelte'), 'utf8');

describe('FT-003 calendar presentation claims', () => {
	it('FT-003-AC-001 exposes exact date navigation and elastic weekly geometry', () => {
		expect(routeSource).toMatch(/type=["']date["']/);
		expect(routeSource).toMatch(/searchParams|page\.url/);
		expect(routeSource).toMatch(/grid-template-columns/);
		expect(routeSource).toMatch(/selectedDate/);
		expect(routeSource).toContain('href={`/?date=${day.date}`}');

		const weeks = buildCalendarWeeks('2026-08-13');
		const allDays = weeks.flatMap((week) => week.days);
		const selectedDays = allDays.filter((day) => day.isSelected);

		expect(selectedDays).toHaveLength(1);
		expect(selectedDays[0].date).toBe('2026-08-13');
		expect(allDays).toHaveLength(21);
		expect(new Set(allDays.map((day) => day.date)).size).toBe(21);
		expect(weeks.map((week) => week.days.filter((day) => day.isLesson).length)).toEqual([2, 1, 3]);
		expect(new Set(weeks.map((week) => week.columnTemplate)).size).toBe(3);

		for (const week of weeks) {
			const widths = week.columnTemplate.split(' ');
			const lessonWidths = week.days
				.map((day, index) => (day.isLesson ? widths[index] : null))
				.filter((width): width is string => width !== null);
			const freeWidths = week.days
				.map((day, index) => (!day.isLesson ? widths[index] : null))
				.filter((width): width is string => width !== null);

			expect(lessonWidths.every((width) => width === '1.8fr')).toBe(true);
			expect(freeWidths.every((width) => width === '0.8fr')).toBe(true);
		}
	});

	it('FT-003-AC-002 exposes a non-color lesson-state cue', () => {
		expect(routeSource).toMatch(/aria-label/);
		expect(routeSource).toMatch(/Урок|lesson|Занятие/);
		expect(routeSource).toMatch(/day-state/);
		expect(routeSource).toMatch(/✦/);
	});
});
