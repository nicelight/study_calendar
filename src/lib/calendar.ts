export type CalendarDay = {
	date: string;
	weekday: string;
	dayNumber: number;
	isLesson: boolean;
	isSelected: boolean;
};

export type CalendarWeek = {
	startDate: string;
	endDate: string;
	label: string;
	columnTemplate: string;
	days: CalendarDay[];
};

export const DEFAULT_SELECTED_DATE = '2026-08-10';

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Presentation fixture until Lesson Context supplies the authorized lesson facts.
// Each visible week deliberately has its own rhythm and therefore its own tracks.
const DEFAULT_LESSON_WEEKDAYS = [
	[1, 3],
	[2],
	[0, 2, 5]
] as const;

function pad(value: number): string {
	return String(value).padStart(2, '0');
}

export function parseIsoDate(value: string): Date | null {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!match) return null;

	const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
	if (
		date.getUTCFullYear() !== Number(match[1]) ||
		date.getUTCMonth() !== Number(match[2]) - 1 ||
		date.getUTCDate() !== Number(match[3])
	) {
		return null;
	}

	return date;
}

export function isIsoDate(value: string | null): value is string {
	return value !== null && parseIsoDate(value) !== null;
}

export function toIsoDate(date: Date): string {
	return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function addDays(date: Date, days: number): Date {
	const result = new Date(date.getTime());
	result.setUTCDate(result.getUTCDate() + days);
	return result;
}

export function startOfWeek(date: Date): Date {
	const mondayOffset = (date.getUTCDay() + 6) % 7;
	return addDays(date, -mondayOffset);
}

export function formatCalendarDate(value: string): string {
	const date = parseIsoDate(value);
	if (!date) return value;

	return new Intl.DateTimeFormat('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	}).format(date);
}

function formatWeekLabel(startDate: string, endDate: string): string {
	const start = formatCalendarDate(startDate);
	const end = formatCalendarDate(endDate);
	return `${start} — ${end}`;
}

function getColumnTemplate(days: CalendarDay[]): string {
	return days.map((day) => (day.isLesson ? '1.8fr' : '0.8fr')).join(' ');
}

export function buildCalendarWeeks(
	requestedDate: string,
	lessonWeekdays: readonly (readonly number[])[] = DEFAULT_LESSON_WEEKDAYS
): CalendarWeek[] {
	const selected = parseIsoDate(requestedDate) ?? parseIsoDate(DEFAULT_SELECTED_DATE)!;
	const selectedWeek = startOfWeek(selected);

	return lessonWeekdays.map((weekLessonDays, weekIndex) => {
		const weekStart = addDays(selectedWeek, (weekIndex - 1) * 7);
		const days = Array.from({ length: 7 }, (_, dayIndex) => {
			const dayDate = toIsoDate(addDays(weekStart, dayIndex));
			return {
				date: dayDate,
				weekday: WEEKDAY_LABELS[dayIndex],
				dayNumber: Number(dayDate.slice(-2)),
				isLesson: weekLessonDays.includes(dayIndex),
				isSelected: dayDate === toIsoDate(selected)
			};
		});
		const startDate = days[0].date;
		const endDate = days[days.length - 1].date;

		return {
			startDate,
			endDate,
			label: formatWeekLabel(startDate, endDate),
			columnTemplate: getColumnTemplate(days),
			days
		};
	});
}
