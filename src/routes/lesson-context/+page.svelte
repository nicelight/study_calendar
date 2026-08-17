<script lang="ts">
	let { data } = $props();
	let context = $derived(data.dayContext);
	let lesson = $derived(data.lesson);

	function contextHref(
		current: NonNullable<typeof context>,
		studentAccountId?: string | null
	): string {
		const params = new URLSearchParams({
			date: current.navigation.date,
			classId: current.navigation.classId,
			lessonId: current.navigation.lessonId
		});
		if (studentAccountId) params.set('studentAccountId', studentAccountId);
		return `/lesson-context?${params.toString()}`;
	}

	function statusLabel(status: 'planned' | 'completed' | 'cancelled'): string {
		return {
			planned: 'Запланировано',
			completed: 'Завершено',
			cancelled: 'Отменено'
		}[status];
	}
</script>

<svelte:head>
	<title>Study Calendar — день занятия</title>
	<meta name="description" content="Общий и личный контекст выбранного занятия." />
</svelte:head>

<main class="context-shell">
	{#if context}
		<header class="context-header">
			<div>
				<p class="eyebrow">{context.lesson.className}</p>
				<h1>{context.lesson.lessonDate}</h1>
				<p class="identity-line">
					Класс <strong>{context.navigation.classId}</strong> · Урок
					<strong>{context.navigation.lessonId}</strong>
				</p>
			</div>
			<nav aria-label="Контекст дня">
				<a href={contextHref(context)}>Общий день</a>
				{#if context.navigation.studentAccountId}
					<a href={contextHref(context, context.navigation.studentAccountId)}>Личный день</a>
				{/if}
			</nav>
		</header>

		<section class="material" aria-labelledby="material-title">
			<div class="section-label">Общий материал</div>
			<h2 id="material-title">{context.material.topic}</h2>
			<dl>
				<div><dt>Практическая работа</dt><dd>{context.material.practicalWork}</dd></div>
				<div><dt>Домашнее задание</dt><dd>{context.material.homework}</dd></div>
			</dl>
		</section>

		{#if context.personal}
			<section class="personal" aria-labelledby="personal-title">
				<div class="section-label">Личный контекст</div>
				<h2 id="personal-title">Ученик {context.personal.studentAccountId}</h2>
				<p>Посещаемость: {context.personal.progress.attendance.attendance}</p>
				{#if context.personal.progress.grade}
					<p>Оценка: {context.personal.progress.grade.grade}</p>
				{:else}
					<p>Оценка: пока не выставлена</p>
				{/if}
				<p>Личная дискуссия: {context.personal.discussion.commonMessages.length} сообщений</p>
				<p>Баланс: {context.personal.financial.balance.balance}</p>
			</section>
		{:else}
			<section class="shared" aria-labelledby="shared-title">
				<div class="section-label">Класс</div>
				<h2 id="shared-title">Общий день доступен в рамках разрешённого класса</h2>
				<p>Личные оценки, обсуждения и финансовые данные здесь не раскрываются.</p>
			</section>
		{/if}
	{:else if lesson}
		<header class="context-header">
			<div>
				<p class="eyebrow">{lesson.className}</p>
				<h1>{lesson.lessonDate}</h1>
				<p class="identity-line">
					Класс <strong>{lesson.classId}</strong> · Урок <strong>{lesson.lessonId}</strong>
				</p>
			</div>
			<p class="status">{statusLabel(lesson.status)}</p>
		</header>

		<section class="empty" aria-labelledby="empty-material-title">
			<div class="section-label">Урок открыт</div>
			<h2 id="empty-material-title">Материал пока не добавлен</h2>
			<p>Доступ к уроку есть. Общий материал, домашнее задание и практическая работа появятся здесь после заполнения.</p>
		</section>
	{:else}
		<section class="empty" aria-labelledby="empty-title">
			<p class="eyebrow">Lesson Context</p>
			<h1 id="empty-title">Выберите занятие</h1>
			<p>Передайте дату, класс и lesson identity через URL календаря.</p>
		</section>
	{/if}
</main>

<style>
	:global(*) { box-sizing: border-box; }
	:global(body) { margin: 0; background: #f7f3eb; color: #25332e; font-family: ui-rounded, "SF Pro Rounded", "Segoe UI", sans-serif; }
	.context-shell { width: min(100% - 2rem, 58rem); margin: 0 auto; padding: 3rem 0 5rem; }
	.context-header { display: flex; align-items: end; justify-content: space-between; gap: 2rem; padding-bottom: 2rem; border-bottom: 1px solid #d9e0d8; }
	.context-header h1, .empty h1 { margin: 0; font-size: clamp(2.5rem, 8vw, 5rem); letter-spacing: -0.07em; line-height: .95; }
	.eyebrow, .section-label { color: #3f765d; font-size: .72rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
	.identity-line { color: #6d7a73; }
	nav { display: flex; flex-wrap: wrap; gap: .65rem; }
	nav a { padding: .65rem .85rem; border: 1px solid #d9e0d8; border-radius: .65rem; color: #25332e; font-weight: 800; text-decoration: none; }
	.material, .personal, .shared, .empty { margin-top: 2rem; padding: 1.5rem; border: 1px solid #d9e0d8; border-radius: 1rem; background: #fffdf8; }
	h2 { margin: .4rem 0 1rem; letter-spacing: -.03em; }
	dl { display: grid; gap: 1rem; margin: 0; }
	dl div { display: grid; gap: .25rem; }
	dt { color: #6d7a73; font-size: .78rem; font-weight: 800; text-transform: uppercase; }
	dd { margin: 0; font-size: 1.1rem; }
	.personal { background: #e9f2e9; }
	.shared p, .empty p { color: #6d7a73; line-height: 1.6; }
	@media (max-width: 42rem) { .context-header { align-items: start; flex-direction: column; } }
</style>
