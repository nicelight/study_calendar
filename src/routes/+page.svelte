<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { formatDateInput, formatDisplayDate, parseDisplayDate } from '$lib/date-input';
	import {
		buildCalendarWeeks,
		DEFAULT_SELECTED_DATE,
		formatCalendarDate,
		isIsoDate
	} from '$lib/calendar';

	let requestedDate = $derived(page.url.searchParams.get('date'));
	let selectedDate = $derived(
		isIsoDate(requestedDate) ? requestedDate : DEFAULT_SELECTED_DATE
	);
	let weeks = $derived(buildCalendarWeeks(selectedDate));
	let selectedDateLabel = $derived(formatCalendarDate(selectedDate));

	function selectDate(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const inputEvent = event as InputEvent;
		input.value = formatDateInput(input.value, inputEvent.inputType ?? '');
		const isoDate = parseDisplayDate(input.value);
		const invalid = input.value !== '' && isoDate === null;
		input.setCustomValidity(invalid ? 'Введите существующую дату в формате dd.mm.yyyy.' : '');
		input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
		if (!isoDate || !isIsoDate(isoDate)) return;

		void goto(`/?date=${isoDate}`, {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}
</script>

<svelte:head>
	<title>Study Calendar — календарь занятий</title>
	<meta
		name="description"
		content="Спокойный календарь занятий с точной навигацией по датам."
	/>
</svelte:head>

<main class="page-shell">
	<section class="calendar-intro" aria-labelledby="calendar-title">
		<div class="eyebrow"><span class="eyebrow-marker" aria-hidden="true"></span>Ритм обучения</div>
		<div class="intro-row">
			<div class="intro-content">
				<h1 id="calendar-title">Календарь занятий</h1>
				<p class="intro-copy">
					Занятия получают больше места, а свободные дни остаются рядом — чтобы видеть
					всю неделю и не терять точную дату.
				</p>
				<div class="intro-actions">
					<a class="login-link" href="/login">Вход</a>
					<span class="intro-note">Публичный обзор</span>
				</div>
			</div>

			<label class="date-picker">
				<span class="field-label">
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
					value={formatDisplayDate(selectedDate)}
					aria-invalid="false"
					oninput={selectDate}
					onchange={selectDate}
				/>
			</label>
		</div>
	</section>

	<section class="calendar-card" aria-labelledby="selected-day-title">
		<header class="calendar-card-header">
			<div>
				<div class="eyebrow"><span class="eyebrow-marker" aria-hidden="true"></span>Выбранный день</div>
				<h2 id="selected-day-title">{selectedDateLabel}</h2>
				<p class="calendar-card-note">Три недели вокруг выбранной даты</p>
			</div>
			<div class="calendar-legend" aria-label="Обозначения календаря">
				<span class="legend-item">
					<span class="lesson-symbol" aria-hidden="true">✦</span>
					<span>Занятие</span>
				</span>
				<span class="legend-item">
					<span class="free-symbol" aria-hidden="true">·</span>
					<span>Свободный день</span>
				</span>
			</div>
		</header>

		<div class="weeks" aria-label="Недели календаря">
			{#each weeks as week (week.startDate)}
				<section class="week" aria-label={`Неделя ${week.label}`}>
					<h3>{week.label}</h3>
					<div class="week-grid" style={`--week-columns: ${week.columnTemplate}`}>
						{#each week.days as day (day.date)}
							<a
								class="day"
								class:lesson-day={day.isLesson}
								class:selected-day={day.isSelected}
								href={`/?date=${day.date}`}
								aria-current={day.isSelected ? 'date' : undefined}
								aria-label={day.isLesson
									? `Занятие, ${day.weekday}, ${day.dayNumber} число`
									: `Свободный день, ${day.weekday}, ${day.dayNumber} число`}
							>
								<span class="weekday">{day.weekday}</span>
								<span class="day-number">{day.dayNumber}</span>
								{#if day.isLesson}
									<span class="day-state"><span class="lesson-dot" aria-hidden="true"></span>Урок</span>
								{:else}
									<span class="day-state free-state">Свободно</span>
								{/if}
							</a>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	</section>
</main>

<style>
	main.page-shell {
		box-sizing: border-box;
		width: min(100% - 2rem, 74rem);
		margin: 0 auto;
		padding: 1.75rem 0 4rem;
		color: var(--ui-text);
		font-family: var(--ui-font);
	}

	.calendar-intro {
		padding: 0.5rem 0 1.5rem;
	}

	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
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

	.intro-row,
	.calendar-card-header {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 2rem;
	}

	.intro-row {
		margin-top: 1rem;
	}

	h1,
	h2,
	h3,
	p {
		margin: 0;
	}

	h1 {
		font-size: clamp(1.5rem, 4vw, 1.75rem);
		font-weight: 780;
		letter-spacing: -0.055em;
		line-height: 1.1;
	}

	.intro-copy {
		max-width: 39rem;
		margin-top: 1rem;
		color: var(--ui-muted);
		font-size: 1rem;
		line-height: 1.55;
	}

	.intro-actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.8rem 1rem;
		margin-top: 1.25rem;
	}

	.login-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 2.75rem;
		padding: 0.65rem 0.95rem;
		border: 1px solid var(--ui-accent);
		border-radius: 0.55rem;
		background-color: var(--ui-accent);
		color: var(--ui-on-accent);
		font-size: 0.9rem;
		font-weight: 800;
		text-decoration: none;
		transition: background-color 140ms ease, border-color 140ms ease, transform 140ms ease;
	}

	.login-link:hover {
		border-color: var(--ui-text);
		background-color: var(--ui-text);
		transform: translateY(-1px);
	}

	.intro-note,
	.calendar-card-note {
		color: var(--ui-muted);
		font-size: 0.82rem;
		line-height: 1.4;
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
	}

	.field-label {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		color: var(--ui-muted);
		font-size: 0.74rem;
		font-weight: 750;
		line-height: 1.25;
	}

	.field-label svg {
		width: 1rem;
		height: 1rem;
		flex: 0 0 auto;
	}

	.date-picker input {
		width: 100%;
		min-height: 2.75rem;
		padding: 0;
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

	.login-link:focus-visible,
	.date-picker input:focus-visible,
	.day:focus-visible {
		outline: 3px solid var(--ui-accent);
		outline-offset: 3px;
	}

	.calendar-card {
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
		margin-top: 0.25rem;
		font-size: clamp(1.125rem, 3vw, 1.25rem);
		font-weight: 760;
		letter-spacing: -0.04em;
		line-height: 1.08;
	}

	.calendar-card-note {
		margin-top: 0.45rem;
	}

	.calendar-legend {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.7rem 1rem;
		color: var(--ui-muted);
		font-size: 0.82rem;
		font-weight: 700;
	}

	.legend-item {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
	}

	.lesson-symbol,
	.free-symbol {
		display: inline-grid;
		width: 1.25rem;
		height: 1.25rem;
		place-items: center;
		border-radius: 50%;
		font-weight: 900;
	}

	.lesson-symbol {
		background-color: var(--ui-accent);
		color: var(--ui-on-accent);
	}

	.free-symbol {
		border: 1px solid var(--ui-line);
		color: var(--ui-muted);
	}

	.weeks {
		display: grid;
		gap: 1.5rem;
		padding-top: 1.5rem;
	}

	.week h3 {
		margin-bottom: 0.65rem;
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
		min-height: 7.25rem;
		flex-direction: column;
		justify-content: space-between;
		padding: 0.8rem;
		border: 1px solid var(--ui-line);
		border-radius: 0.7rem;
		background-color: var(--ui-surface);
		background-image: linear-gradient(145deg, var(--ui-surface), #f2f8fa);
		color: var(--ui-text);
		text-decoration: none;
		transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
	}

	.day:hover {
		border-color: var(--ui-accent);
		box-shadow: 0 7px 16px rgb(47 165 191 / 10%);
		transform: translateY(-1px);
	}

	.lesson-day {
		border-color: var(--ui-accent);
		background-color: var(--ui-accent-soft);
		background-image: linear-gradient(145deg, rgb(255 255 255 / 45%), rgb(237 247 249 / 20%));
	}

	.selected-day {
		box-shadow: inset 0 0 0 2px var(--ui-accent);
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
		white-space: normal;
	}

	.lesson-dot {
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 50%;
		background: currentColor;
	}

	.free-state {
		color: var(--ui-muted);
		font-weight: 700;
	}

	@media (min-width: 48rem) {
		.calendar-intro {
			padding-bottom: 2rem;
		}

		.day {
			min-height: 8.25rem;
			padding: 0.95rem;
		}
	}

	@media (max-width: 42rem) {
		.intro-row,
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
			min-width: 30rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.page-shell *,
		.page-shell *::before,
		.page-shell *::after {
			transition-duration: 0ms !important;
		}
	}
</style>
