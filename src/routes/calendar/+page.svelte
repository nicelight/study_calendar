<script lang="ts">
	import { goto } from '$app/navigation';
	import { buildCalendarWeeks, formatCalendarDate, isIsoDate } from '$lib/calendar';
	import type { CalendarPageData } from './+page.server';

	let { data }: { data: CalendarPageData } = $props();

	function groupLessonsByDate(lessons: CalendarPageData['lessons']) {
		const grouped = new Map<string, CalendarPageData['lessons']>();
		for (const lesson of lessons) {
			const lessonsOnDate = grouped.get(lesson.lessonDate) ?? [];
			lessonsOnDate.push(lesson);
			grouped.set(lesson.lessonDate, lessonsOnDate);
		}
		return grouped;
	}

	function calendarHref(date: string): string {
		const params = new URLSearchParams({ classId: data.classId, date });
		return `/calendar?${params.toString()}`;
	}

	function lessonContextHref(lesson: CalendarPageData['lessons'][number]): string {
		const params = new URLSearchParams({
			date: lesson.lessonDate,
			classId: lesson.classId,
			lessonId: lesson.lessonId
		});
		return `/lesson-context?${params.toString()}`;
	}

	function statusLabel(status: CalendarPageData['lessons'][number]['status']): string {
		return {
			planned: 'Запланировано',
			completed: 'Завершено',
			cancelled: 'Отменено'
		}[status];
	}

	function selectDate(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		if (!isIsoDate(input.value)) return;

		void goto(calendarHref(input.value), {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}

	let lessonsByDate = $derived(groupLessonsByDate(data.lessons));
	let lessonWeekdays = $derived(
		buildCalendarWeeks(data.selectedDate, [[], [], []]).map((week) =>
			week.days.flatMap((day, dayIndex) => (lessonsByDate.has(day.date) ? [dayIndex] : []))
		)
	);
	let weeks = $derived(buildCalendarWeeks(data.selectedDate, lessonWeekdays));
	let selectedDateLabel = $derived(formatCalendarDate(data.selectedDate));
</script>

<svelte:head>
	<title>{data.className} — календарь занятий</title>
	<meta name="description" content="Защищённый календарь занятий выбранного класса." />
</svelte:head>

<main class="calendar-shell" data-class-id={data.classId} data-role={data.role}>
	<header class="calendar-header">
		<div>
			<p class="eyebrow">Календарь класса</p>
			<h1>{data.className}</h1>
			<p class="intro">Занятия и их текущий статус предоставлены сервером.</p>
		</div>

		<label class="date-picker">
			<span>Перейти к дате</span>
			<input
				aria-label="Выбранная дата"
				type="date"
				value={data.selectedDate}
				onchange={selectDate}
			/>
		</label>
	</header>

	<section class="calendar-card" aria-labelledby="selected-day-title">
		<header class="calendar-card-header">
			<div>
				<p class="eyebrow">Выбранный день</p>
				<h2 id="selected-day-title">{selectedDateLabel}</h2>
			</div>
			<p class="legend"><span aria-hidden="true">✦</span> Занятие</p>
		</header>

		<div class="weeks" aria-label="Недели календаря">
			{#each weeks as week (week.startDate)}
				<section class="week" aria-label={`Неделя ${week.label}`}>
					<h3>{week.label}</h3>
					<div class="week-grid" style={`--week-columns: ${week.columnTemplate}`}>
						{#each week.days as day (day.date)}
							<div
								class="day"
								class:lesson-day={day.isLesson}
								class:selected-day={day.isSelected}
							>
								<a
									class="day-link"
									href={calendarHref(day.date)}
									aria-current={day.isSelected ? 'date' : undefined}
								>
									<span class="weekday">{day.weekday}</span>
									<span class="day-number">{day.dayNumber}</span>
								</a>
								{#if day.isLesson}
									<span class="day-state"><span aria-hidden="true">✦</span> Урок</span>
									{#each lessonsByDate.get(day.date) ?? [] as lesson (lesson.lessonId)}
										<a class="lesson-link" href={lessonContextHref(lesson)}>
											<span
												class="lesson-fact"
												data-lesson-id={lesson.lessonId}
												data-lesson-date={lesson.lessonDate}
												data-lesson-status={lesson.status}
											>
												{lesson.lessonId} · {statusLabel(lesson.status)}
											</span>
											<span class="lesson-action">Открыть урок →</span>
										</a>
									{/each}
								{:else}
									<span class="day-state free-state">Свободно</span>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	</section>
</main>

<style>
	:global(*) { box-sizing: border-box; }
	:global(body) { margin: 0; background: #f7f3eb; color: #25332e; font-family: ui-rounded, "SF Pro Rounded", "Segoe UI", sans-serif; }
	.calendar-shell { width: min(100% - 2rem, 74rem); margin: 0 auto; padding: 3rem 0 5rem; }
	.calendar-header, .calendar-card-header { display: flex; align-items: end; justify-content: space-between; gap: 1.5rem; }
	.eyebrow { margin: 0 0 .55rem; color: #3f765d; font-size: .72rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
	h1, h2, h3, p { margin-top: 0; }
	h1 { margin-bottom: 1rem; font-size: clamp(2.5rem, 8vw, 5rem); letter-spacing: -.07em; line-height: .95; }
	.intro, .legend { color: #6d7a73; line-height: 1.6; }
	.date-picker { display: grid; min-width: 13.5rem; gap: .45rem; padding: .75rem .9rem; border: 1px solid #d9e0d8; border-radius: .75rem; background: #fffdf8; color: #6d7a73; font-size: .74rem; font-weight: 800; }
	.date-picker input { min-height: 2.2rem; border: 0; background: transparent; color: #25332e; font: inherit; font-size: 1rem; font-weight: 800; }
	.calendar-card { margin-top: 2rem; padding: clamp(1rem, 3vw, 2.25rem); border: 1px solid #d9e0d8; border-radius: 1.25rem; background: #fffdf8; box-shadow: 0 20px 50px rgba(39, 61, 48, .09); }
	.calendar-card-header { padding-bottom: 1.5rem; border-bottom: 1px solid #d9e0d8; }
	h2 { margin-bottom: 0; font-size: clamp(1.5rem, 3vw, 2.25rem); letter-spacing: -.04em; }
	.weeks { display: grid; gap: 1.75rem; padding-top: 1.75rem; }
	.week h3 { margin-bottom: .7rem; color: #6d7a73; font-size: .8rem; letter-spacing: .03em; }
	.week-grid { display: grid; grid-template-columns: var(--week-columns); gap: .45rem; }
	.day { display: flex; min-width: 0; min-height: 7.2rem; flex-direction: column; gap: .38rem; padding: .7rem; border: 1px solid #d9e0d8; border-radius: .8rem; background: #fbfaf5; color: #25332e; }
	.day:hover { border-color: #3f765d; }
	.lesson-day { border-color: rgba(185, 104, 78, .58); background: #dcebdd; }
	.selected-day { box-shadow: inset 0 0 0 3px #b9684e; }
	.day-link { display: flex; min-width: 0; flex-direction: column; gap: .38rem; color: #25332e; text-decoration: none; }
	.weekday { color: #6d7a73; font-size: .72rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
	.day-number { font-size: clamp(1.7rem, 4vw, 2.6rem); font-weight: 800; letter-spacing: -.07em; line-height: 1; }
	.day-state { color: #b9684e; font-size: .7rem; font-weight: 900; }
	.free-state { color: #6d7a73; font-weight: 700; }
	.lesson-link { display: grid; gap: .25rem; padding: .42rem; border: 1px solid #d9e0d8; border-radius: .55rem; background: #fffdf8; color: #25332e; text-decoration: none; }
	.lesson-link:hover { border-color: #3f765d; background: #f2f7f0; }
	.lesson-fact { display: block; overflow-wrap: anywhere; font-size: .68rem; font-weight: 800; line-height: 1.25; }
	.lesson-action { color: #3f765d; font-size: .68rem; font-weight: 900; }
	.date-picker input:focus-visible, .day-link:focus-visible, .lesson-link:focus-visible { outline: 3px solid #b9684e; outline-offset: 3px; }
	@media (max-width: 42rem) { .calendar-header, .calendar-card-header { align-items: start; flex-direction: column; } .date-picker { width: 100%; } }
</style>
