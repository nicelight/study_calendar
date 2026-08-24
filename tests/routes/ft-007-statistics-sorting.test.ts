import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import type { StatisticsRegistryView } from '../../src/lib/server/modules/lesson-context/public';
import StatisticsPage from '../../src/routes/statistics/+page.svelte';

const registry: StatisticsRegistryView = {
	students: [
		{
			fullName: 'Яна',
			registeredAt: '2026-02-01T00:00:00.000Z',
			className: 'Бета',
			parentNames: ['Родитель Бета'],
			teacherNames: ['Учитель Бета'],
			paymentCapabilityPercentage: 9,
			attendancePercentage: 100,
			institutionName: 'Центр'
		},
		{
			fullName: 'Анна',
			registeredAt: '2026-01-01T00:00:00.000Z',
			className: 'Альфа',
			parentNames: ['Родитель Альфа'],
			teacherNames: ['Учитель Альфа'],
			paymentCapabilityPercentage: 100,
			attendancePercentage: 9,
			institutionName: 'Академия'
		}
	],
	teachers: [
		{
			fullName: 'Учитель Бета',
			registeredAt: '2026-02-01T00:00:00.000Z',
			classNames: ['Бета', 'Альфа'],
			attendancePercentage: 9,
			institutionName: 'Центр',
			studentCount: 10
		},
		{
			fullName: 'Учитель Альфа',
			registeredAt: '2026-01-01T00:00:00.000Z',
			classNames: ['Альфа'],
			attendancePercentage: 100,
			institutionName: 'Академия',
			studentCount: 2
		}
	],
	classes: [
		{ className: 'Бета', institutionName: 'Центр', studentCount: 10, teacherNames: ['Учитель Бета'] },
		{ className: 'Альфа', institutionName: 'Академия', studentCount: 2, teacherNames: ['Учитель Альфа'] }
	]
};

describe('FT-007-AC-004 Statistics sorting presentation', () => {
	it('renders an accessible sorting control for every registry column', () => {
		const body = render(StatisticsPage, { props: { data: { registry } } } as any).body;

		for (const label of [
			'ФИО', 'Регистрация', 'Класс', 'Родитель', 'Teacher', 'Payment capability', 'Attendance',
			'Institution', 'Классы', 'Students', 'Название'
		]) {
			expect(body).toContain(`role="button" href="#`);
			expect(body).toContain(`aria-label="Сортировать ${label}`);
		}
	});
});
