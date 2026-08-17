<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
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
		if (!isIsoDate(input.value)) return;

		void goto(`/?date=${input.value}`, {
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
		<div class="eyebrow">Ритм обучения</div>
		<div class="intro-row">
			<div>
				<h1 id="calendar-title">Календарь занятий</h1>
				<p class="intro-copy">
					Занятия получают больше места, а свободные дни остаются рядом — чтобы видеть
					всю неделю и не терять точную дату.
				</p>
				<a class="login-link" href="/login">Вход</a>
			</div>

			<label class="date-picker">
				<span class="field-label">Перейти к дате</span>
				<input
					aria-label="Выбранная дата"
					type="date"
					value={selectedDate}
					onchange={selectDate}
				/>
			</label>
		</div>
	</section>

	<section class="calendar-card" aria-labelledby="selected-day-title">
		<header class="calendar-card-header">
			<div>
				<div class="eyebrow">Выбранный день</div>
				<h2 id="selected-day-title">{selectedDateLabel}</h2>
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
									<span class="day-state"><span aria-hidden="true">✦</span> Урок</span>
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
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		background: var(--paper);
		color: var(--ink);
		font-family: ui-rounded, "SF Pro Rounded", "Segoe UI", sans-serif;
	}

	:global(:root) {
		--paper: #f7f3eb;
		--surface: #fffdf8;
		--ink: #25332e;
		--muted: #6d7a73;
		--line: #d9e0d8;
		--sage: #dcebdd;
		--sage-deep: #3f765d;
		--clay: #b9684e;
		--shadow: 0 20px 50px rgba(39, 61, 48, 0.09);
	}

	.page-shell {
		width: min(100% - 2rem, 74rem);
		margin: 0 auto;
		padding: 2.5rem 0 4rem;
	}

	.calendar-intro {
		padding: 1rem 0 2rem;
	}

	.eyebrow {
		margin-bottom: 0.6rem;
		color: var(--sage-deep);
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.intro-row,
	.calendar-card-header {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1.5rem;
	}

	h1,
	h2,
	h3,
	p {
		margin: 0;
	}

	h1 {
		max-width: 12ch;
		font-size: clamp(2.5rem, 8vw, 5.8rem);
		font-weight: 800;
		letter-spacing: -0.07em;
		line-height: 0.92;
	}

	.intro-copy {
		max-width: 42rem;
		margin-top: 1.2rem;
		color: var(--muted);
		font-size: 1rem;
		line-height: 1.6;
	}

	.login-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.5rem;
		margin-top: 1.2rem;
		padding: 0.55rem 1rem;
		border: 1px solid var(--sage-deep);
		border-radius: 999px;
		background: var(--sage-deep);
		color: var(--surface);
		font-size: 0.9rem;
		font-weight: 800;
		text-decoration: none;
	}

	.login-link:hover {
		filter: brightness(0.92);
	}

	.date-picker {
		display: grid;
		min-width: 13.5rem;
		gap: 0.45rem;
		padding: 0.8rem 0.9rem 0.7rem;
		border: 1px solid var(--line);
		border-radius: 0.75rem;
		background: rgba(255, 253, 248, 0.7);
	}

	.field-label {
		color: var(--muted);
		font-size: 0.74rem;
		font-weight: 700;
	}

	.date-picker input {
		min-height: 2.4rem;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--ink);
		font: inherit;
		font-size: 1rem;
		font-weight: 800;
	}

	.login-link:focus-visible,
	.date-picker input:focus-visible,
	.day:focus-visible {
		outline: 3px solid var(--clay);
		outline-offset: 3px;
	}

	.calendar-card {
		padding: clamp(1rem, 3vw, 2.25rem);
		border: 1px solid rgba(151, 169, 154, 0.32);
		border-radius: 1.25rem;
		background: var(--surface);
		box-shadow: var(--shadow);
	}

	.calendar-card-header {
		padding-bottom: 1.75rem;
		border-bottom: 1px solid var(--line);
	}

	h2 {
		font-size: clamp(1.5rem, 3vw, 2.25rem);
		letter-spacing: -0.04em;
	}

	.calendar-legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.9rem 1.25rem;
		color: var(--muted);
		font-size: 0.84rem;
		font-weight: 700;
	}

	.legend-item {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	.lesson-symbol,
	.free-symbol {
		display: inline-grid;
		width: 1.3rem;
		height: 1.3rem;
		place-items: center;
		border-radius: 50%;
		font-weight: 900;
	}

	.lesson-symbol {
		background: var(--clay);
		color: #fffaf3;
	}

	.free-symbol {
		border: 1px solid var(--line);
		color: var(--muted);
	}

	.weeks {
		display: grid;
		gap: 1.75rem;
		padding-top: 1.75rem;
	}

	.week h3 {
		margin-bottom: 0.7rem;
		color: var(--muted);
		font-size: 0.8rem;
		font-weight: 800;
		letter-spacing: 0.03em;
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
		min-height: 6.8rem;
		flex-direction: column;
		justify-content: space-between;
		padding: 0.7rem;
		border: 1px solid var(--line);
		border-radius: 0.8rem;
		background: #fbfaf5;
		color: var(--ink);
		text-decoration: none;
		transition:
			transform 160ms ease,
			border-color 160ms ease,
			box-shadow 160ms ease;
	}

	.day:hover {
		border-color: var(--sage-deep);
		box-shadow: 0 8px 18px rgba(63, 118, 93, 0.12);
		transform: translateY(-2px);
	}

	.lesson-day {
		border-color: rgba(185, 104, 78, 0.58);
		background: var(--sage);
	}

	.selected-day {
		box-shadow: inset 0 0 0 3px var(--clay);
	}

	.weekday {
		color: var(--muted);
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.day-number {
		font-size: clamp(1.7rem, 4vw, 2.6rem);
		font-weight: 800;
		letter-spacing: -0.07em;
		line-height: 1;
	}

	.day-state {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--clay);
		font-size: 0.7rem;
		font-weight: 900;
		line-height: 1.15;
		white-space: normal;
	}

	.free-state {
		color: var(--muted);
		font-weight: 700;
	}

	@media (min-width: 48rem) {
		.page-shell {
			padding-top: 4.5rem;
		}

		.calendar-intro {
			padding-bottom: 3.5rem;
		}

		.day {
			min-height: 8.5rem;
			padding: 0.95rem;
		}
	}

	@media (prefers-color-scheme: dark) {
		:global(:root) {
			--paper: #18201d;
			--surface: #202b26;
			--ink: #eef3ed;
			--muted: #a7b5ab;
			--line: #405149;
			--sage: #314b3e;
			--sage-deep: #9ed2b2;
			--clay: #ed9a7c;
			--shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
		}

		.date-picker,
		.day {
			background: rgba(32, 43, 38, 0.76);
		}

		.lesson-day {
			background: var(--sage);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.day {
			transition: none;
		}
	}
</style>
