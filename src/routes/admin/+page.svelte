<script lang="ts">
	let { form } = $props();
</script>

<svelte:head>
	<title>Создание центра</title>
</svelte:head>

<main class="admin-shell">
	<header>
		<p class="eyebrow">Protected Admin</p>
		<h1>Создайте центр</h1>
		<p class="intro">Центр объединяет классы, учителей и учеников.</p>
	</header>

	<section class="card" aria-labelledby="create-center-title">
		<h2 id="create-center-title">Первый учебный центр</h2>
		<form method="POST">
			<label>
				<span>Название</span>
				<input name="name" required autocomplete="organization" />
			</label>
			<button type="submit">Создать центр</button>
		</form>

		{#if form?.error === 'invalid_name'}
			<p class="message error" role="alert">Укажите название центра.</p>
		{:else if form?.error === 'center_already_created'}
			<p class="message error" role="alert">Центр для этого Admin уже создан.</p>
		{:else if form?.error}
			<p class="message error" role="alert">Не удалось создать центр.</p>
		{/if}
	</section>
</main>

<style>
	.admin-shell {
		--surface: var(--ui-surface, #fff);
		--ink: var(--ui-text, #202a2d);
		--muted: var(--ui-muted, #58666b);
		--line: var(--ui-line, #e3eaed);
		--field-line: #7c9299;
		--accent: var(--ui-accent, #2fa5bf);
		--accent-soft: var(--ui-accent-soft, #edf7f9);
		--danger: var(--ui-danger, #a23d42);
		--danger-soft: #fbeff0;
		--radius: var(--ui-radius, 12px);
		--font: var(--ui-font, system-ui, sans-serif);
		width: min(calc(100% - 2rem), 44rem);
		margin: 0 auto;
		padding: 1.75rem 0 5rem;
		color: var(--ink);
		font-family: var(--font);
	}
	header { margin-bottom: 2rem; }
	.eyebrow { margin: 0; color: var(--ui-accent-ink); font-size: .72rem; font-weight: 750; letter-spacing: .13em; text-transform: uppercase; }
	h1 { margin: .55rem 0 .9rem; font-size: clamp(1.5rem, 4vw, 1.75rem); letter-spacing: -.04em; line-height: 1.1; }
	.intro { max-width: 34rem; margin: 0; color: var(--muted); font-size: 1rem; line-height: 1.55; }
	.card {
		display: grid;
		gap: 1.25rem;
		padding: clamp(1.25rem, 4vw, 2rem);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: linear-gradient(135deg, var(--surface), var(--accent-soft));
	}
	h2 { margin: 0; font-size: clamp(1.125rem, 3vw, 1.25rem); letter-spacing: -.025em; }
	form, label { display: grid; gap: .5rem; }
	label { color: var(--muted); font-size: .9rem; font-weight: 700; }
	input, button {
		min-height: 2.75rem;
		padding: .65rem .8rem;
		border: 1px solid var(--field-line);
		border-radius: 8px;
		background: var(--surface);
		color: var(--ink);
		font: inherit;
		font-size: 1rem;
	}
	button { border-color: var(--accent); background: var(--accent); color: var(--ui-on-accent); cursor: pointer; font-weight: 750; transition: opacity 140ms ease, background-color 140ms ease; }
	button:hover:not(:disabled) { opacity: .9; }
	button:disabled { cursor: not-allowed; opacity: .5; }
	:where(input, button):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
	.message { margin: 0; padding: 1rem; border: 1px solid transparent; border-radius: 8px; line-height: 1.5; }
	.error { border-color: color-mix(in srgb, var(--danger) 24%, var(--line)); background: var(--danger-soft); color: var(--danger); }
	@media (prefers-reduced-motion: reduce) {
		button { transition: none; }
	}
</style>
