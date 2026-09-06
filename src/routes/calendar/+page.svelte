<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatDateInput, formatDisplayDate, parseDisplayDate } from '$lib/date-input';
	import { buildCalendarWeeks, formatCalendarDate, isIsoDate } from '$lib/calendar';
	import type { CalendarPageData } from './+page.server';

	let { data }: { data: CalendarPageData } = $props();

	function modeLabel(mode: CalendarPageData['mode']): string {
		return mode === 'individual' ? 'Индивидуальный' : 'Групповой';
	}

	function groupLessonsByDate(lessons: CalendarPageData['lessons']) {
		const grouped = new Map<string, CalendarPageData['lessons']>();
		for (const lesson of lessons) {
			const lessonsOnDate = grouped.get(lesson.lessonDate) ?? [];
			lessonsOnDate.push(lesson);
			grouped.set(lesson.lessonDate, lessonsOnDate);
		}
		return grouped;
	}

	function groupPaymentMarkersByDate(markers: CalendarPageData['paymentMarkers']) {
		const grouped = new Map<string, CalendarPageData['paymentMarkers']>();
		for (const marker of markers) {
			const markersOnDate = grouped.get(marker.markerDate) ?? [];
			markersOnDate.push(marker);
			grouped.set(marker.markerDate, markersOnDate);
		}
		return grouped;
	}

	function paymentStatusForDate(date: string): 'paid' | 'unpaid' | undefined {
		if (data.role !== 'student') return undefined;
		const lessons = lessonsByDate.get(date) ?? [];
		if (lessons.length === 0) return undefined;
		return lessons.every((lesson) => lesson.paymentStatus === 'paid') ? 'paid' : 'unpaid';
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

	function selectDate(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const inputEvent = event as InputEvent;
		input.value = formatDateInput(input.value, inputEvent.inputType ?? '');
		const isoDate = parseDisplayDate(input.value);
		const invalid = input.value !== '' && isoDate === null;
		input.setCustomValidity(invalid ? 'Введите существующую дату в формате dd.mm.yyyy.' : '');
		input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
		if (!isoDate || !isIsoDate(isoDate)) return;

		void goto(calendarHref(isoDate), {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}

	let lessonsByDate = $derived(groupLessonsByDate(data.lessons));
	let paymentMarkersByDate = $derived(groupPaymentMarkersByDate(data.paymentMarkers));
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
			<p class="eyebrow"><span class="eyebrow-marker" aria-hidden="true"></span>Календарь класса</p>
			<h1>{data.className}</h1>
			<p class="intro">Формат: {modeLabel(data.mode)}</p>
		</div>

		<label class="date-picker">
			<span class="date-label">
				<svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
					<rect x="3.25" y="4.5" width="13.5" height="12" rx="1.75" fill="none" stroke="currentColor" stroke-width="1.5" />
					<path d="M6.5 3v3M13.5 3v3M3.5 8h13" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" />
				</svg>
				Перейти к дате (дд.мм.гггг)
			</span>
			<input
				aria-label="Выбранная дата"
				type="text"
				inputmode="numeric"
				maxlength="10"
				placeholder="дд.мм.гггг"
				pattern={'[0-9]{2}\\.[0-9]{2}\\.[0-9]{4}'}
				value={formatDisplayDate(data.selectedDate)}
				aria-invalid="false"
				oninput={selectDate}
				onchange={selectDate}
			/>
		</label>
	</header>

	<section class="calendar-card" aria-labelledby="selected-day-title">
		<header class="calendar-card-header">
			<div>
				<p class="eyebrow"><span class="eyebrow-marker" aria-hidden="true"></span>Выбранный день</p>
				<h2 id="selected-day-title">{selectedDateLabel}</h2>
				<p class="calendar-card-note">Занятия и свободные дни вокруг выбранной даты</p>
			</div>
			<p class="legend"><span class="lesson-dot" aria-hidden="true"></span>Занятие</p>
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
								class:paid-lesson={paymentStatusForDate(day.date) === 'paid'}
								class:unpaid-lesson={paymentStatusForDate(day.date) === 'unpaid'}
								class:selected-day={day.isSelected}
								data-payment-status={paymentStatusForDate(day.date)}
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
									<span class="day-state"><span class="lesson-dot" aria-hidden="true"></span>Урок</span>
									{#each lessonsByDate.get(day.date) ?? [] as lesson (lesson.lessonId)}
										<a
											class="lesson-link"
											href={lessonContextHref(lesson)}
											data-lesson-id={lesson.lessonId}
												data-lesson-date={lesson.lessonDate}
												data-lesson-status={lesson.status}
												data-payment-status={lesson.paymentStatus}
											>
												<span class="lesson-action">Открыть урок →</span>
											</a>
										{/each}
									{#if data.role === 'student'}
										<span class="payment-state" aria-label={paymentStatusForDate(day.date) === 'paid' ? 'Оплачено' : 'Не оплачено'}>
											{paymentStatusForDate(day.date) === 'paid' ? 'Оплачено' : 'Не оплачено'}
										</span>
									{/if}
									{:else}
										<span class="day-state free-state">Свободно</span>
									{/if}
									{#if paymentMarkersByDate.has(day.date)}
										<div class="payment-markers" aria-label="Платежи">
											<span class="payment-marker-title">Оплата</span>
											{#each paymentMarkersByDate.get(day.date) ?? [] as marker (marker.paymentId)}
												<div
													class="payment-marker"
													data-payment-marker-id={marker.paymentId}
													data-payment-marker-date={marker.markerDate}
												>
													<span>{marker.amount}</span>
													<time datetime={marker.factualDate}>Фактическая дата: {marker.factualDate}</time>
												</div>
											{/each}
										</div>
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
	main.calendar-shell {
		box-sizing: border-box;
		width: min(100% - 2rem, 74rem);
		margin: 0 auto;
		padding: 1.75rem 0 4.5rem;
		color: var(--ui-text);
		font-family: var(--ui-font);
	}

	.calendar-header,
	.calendar-card-header {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 2rem;
	}

	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0 0 0.65rem;
		color: var(--ui-accent-ink);
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		line-height: 1.2;
		text-transform: uppercase;
	}

	.eyebrow-marker {
		display: inline-block;
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 50%;
		background: var(--ui-accent);
	}

	h1,
	h2,
	h3,
	p {
		margin-top: 0;
	}

	h1 {
		margin-bottom: 0.7rem;
		font-size: clamp(1.5rem, 4vw, 1.75rem);
		font-weight: 780;
		letter-spacing: -0.055em;
		line-height: 1.1;
	}

	.intro,
	.legend {
		color: var(--ui-muted);
		line-height: 1.5;
	}

	.intro {
		font-size: 0.92rem;
	}

	.date-picker {
		display: grid;
		flex: 0 0 min(100%, 15rem);
		min-width: 13.5rem;
		gap: 0.55rem;
		padding: 0.9rem 1rem 0.85rem;
		border: 1px solid var(--ui-line);
		border-radius: var(--ui-radius);
		background-color: var(--ui-surface);
		background-image: linear-gradient(145deg, var(--ui-surface), #f2f8fa);
		color: var(--ui-muted);
		font-size: 0.74rem;
		font-weight: 750;
	}

	.date-label {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		line-height: 1.25;
	}

	.date-label svg {
		width: 1rem;
		height: 1rem;
		flex: 0 0 auto;
	}

	.date-picker input {
		width: 100%;
		min-height: 2.75rem;
		border: 0;
		border-bottom: 1px solid var(--ui-line);
		background: transparent;
		color: var(--ui-text);
		font: inherit;
		font-size: 1rem;
		font-weight: 800;
	}

	.date-picker:focus-within {
		border-color: var(--ui-accent);
	}

	.calendar-card {
		margin-top: 1.75rem;
		padding: clamp(1rem, 3vw, 2.25rem);
		border: 1px solid var(--ui-line);
		border-radius: var(--ui-radius);
		background-color: var(--ui-surface);
		background-image: linear-gradient(155deg, var(--ui-surface) 0%, #f2f8fa 145%);
		box-shadow: 0 16px 36px rgb(32 42 45 / 7%);
	}

	.calendar-card-header {
		padding-bottom: 1.35rem;
		border-bottom: 1px solid var(--ui-line);
	}

	h2 {
		margin-bottom: 0;
		font-size: clamp(1.125rem, 3vw, 1.25rem);
		font-weight: 760;
		letter-spacing: -0.04em;
		line-height: 1.08;
	}

	.calendar-card-note {
		margin: 0.45rem 0 0;
		color: var(--ui-muted);
		font-size: 0.82rem;
		line-height: 1.4;
	}

	.legend {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		margin: 0;
		font-size: 0.82rem;
		font-weight: 750;
		white-space: nowrap;
	}

	.weeks {
		display: grid;
		gap: 1.5rem;
		padding-top: 1.5rem;
	}

	.week h3 {
		margin: 0 0 0.65rem;
		color: var(--ui-muted);
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.045em;
		line-height: 1.3;
	}

	.week-grid {
		display: grid;
		grid-template-columns: var(--week-columns);
		gap: 0.45rem;
		align-items: stretch;
	}

	.day {
		display: flex;
		min-width: 0;
		min-height: 8rem;
		flex-direction: column;
		justify-content: space-between;
		gap: 0.45rem;
		padding: 0.8rem;
		border: 1px solid var(--ui-line);
		border-radius: 0.7rem;
		background-color: var(--ui-surface);
		background-image: linear-gradient(145deg, var(--ui-surface), #f2f8fa);
		color: var(--ui-text);
	}

	.day:hover {
		border-color: var(--ui-accent);
	}

	.lesson-day {
		border-color: var(--ui-accent);
		background-color: var(--ui-accent-soft);
		background-image: linear-gradient(145deg, rgb(255 255 255 / 45%), rgb(237 247 249 / 20%));
	}

	.paid-lesson {
		border-color: var(--ui-accent);
		background-color: var(--ui-accent-soft);
	}

	.unpaid-lesson {
		border-color: #c8944f;
		background-color: var(--ui-warn-soft);
		background-image: linear-gradient(145deg, rgb(255 255 255 / 42%), rgb(251 244 233 / 18%));
	}

	.selected-day {
		box-shadow: inset 0 0 0 2px var(--ui-accent);
	}

	.day-link {
		display: flex;
		min-width: 0;
		min-height: 2.75rem;
		flex-direction: column;
		gap: 0.38rem;
		color: var(--ui-text);
		text-decoration: none;
	}

	.weekday {
		color: var(--ui-muted);
		font-size: 0.7rem;
		font-weight: 800;
		letter-spacing: 0.06em;
		line-height: 1.2;
		text-transform: uppercase;
	}

	.day-number {
		font-size: clamp(1.7rem, 4vw, 2.45rem);
		font-weight: 780;
		letter-spacing: -0.06em;
		line-height: 1;
	}

	.day-state {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		color: var(--ui-accent-ink);
		font-size: 0.7rem;
		font-weight: 850;
		line-height: 1.2;
	}

	.lesson-dot {
		display: inline-block;
		width: 0.42rem;
		height: 0.42rem;
		flex: 0 0 auto;
		border-radius: 50%;
		background: currentColor;
	}

	.free-state {
		color: var(--ui-muted);
		font-weight: 700;
		overflow-wrap: anywhere;
	}

	.lesson-link {
		display: grid;
		min-height: 2.75rem;
		align-items: center;
		gap: 0.25rem;
		padding: 0.45rem 0.5rem;
		border: 1px solid var(--ui-line);
		border-radius: 0.55rem;
		background-color: var(--ui-surface);
		background-image: linear-gradient(145deg, var(--ui-surface), #f2f8fa);
		color: var(--ui-text);
		text-decoration: none;
	}

	.lesson-link:hover {
		border-color: var(--ui-accent);
	}

	.lesson-action {
		color: var(--ui-accent-ink);
		font-size: 0.68rem;
		font-weight: 900;
		line-height: 1.2;
	}

	.payment-state {
		font-size: 0.7rem;
		font-weight: 900;
		line-height: 1.2;
	}

	.paid-lesson .payment-state {
		color: var(--ui-accent-ink);
	}

	.unpaid-lesson .payment-state {
		color: #84551f;
	}

	.payment-markers {
		display: grid;
		gap: 0.3rem;
		margin-top: auto;
		padding-top: 0.45rem;
		border-top: 1px solid var(--ui-line);
	}

	.payment-marker-title {
		color: var(--ui-accent-ink);
		font-size: 0.68rem;
		font-weight: 900;
	}

	.payment-marker {
		display: grid;
		gap: 0.1rem;
		padding: 0.4rem;
		border: 1px solid var(--ui-line);
		border-radius: 0.45rem;
		background-color: var(--ui-accent-soft);
		color: var(--ui-text);
		font-size: 0.68rem;
		font-weight: 800;
	}

	.payment-marker time {
		color: var(--ui-muted);
		font-size: 0.62rem;
		font-weight: 700;
		line-height: 1.3;
	}

	.date-picker input:focus-visible,
	.day-link:focus-visible,
	.lesson-link:focus-visible {
		outline: 3px solid var(--ui-accent);
		outline-offset: 3px;
	}

	@media (max-width: 42rem) {
		.calendar-header,
		.calendar-card-header {
			align-items: stretch;
			flex-direction: column;
			gap: 1.25rem;
		}

		.date-picker {
			width: 100%;
			flex-basis: auto;
		}

		.week {
			min-width: 0;
			overflow-x: auto;
			padding: 0.05rem 0.1rem 0.35rem;
		}

		.week-grid {
			min-width: 32rem;
		}

		.day {
			min-width: 5.5rem;
			padding-inline: .5rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.calendar-shell *,
		.calendar-shell *::before,
		.calendar-shell *::after {
			transition-duration: 0ms !important;
		}
	}
</style>
