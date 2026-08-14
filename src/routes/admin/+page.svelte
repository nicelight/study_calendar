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
	:global(*) { box-sizing: border-box; }
	:global(body) { margin: 0; background: #f7f3eb; color: #25332e; font-family: ui-rounded, "SF Pro Rounded", "Segoe UI", sans-serif; }
	.admin-shell { width: min(100% - 2rem, 44rem); margin: 0 auto; padding: 3rem 0 5rem; }
	header { margin-bottom: 2rem; }
	.eyebrow { color: #3f765d; font-size: .72rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
	h1 { margin: .4rem 0 1rem; font-size: clamp(2.5rem, 8vw, 5rem); letter-spacing: -.07em; line-height: .95; }
	.intro { color: #6d7a73; line-height: 1.6; }
	.card { display: grid; gap: 1.25rem; padding: clamp(1rem, 4vw, 2rem); border: 1px solid #d9e0d8; border-radius: 1rem; background: #fffdf8; box-shadow: 0 20px 50px rgba(39, 61, 48, .09); }
	h2 { margin: 0; letter-spacing: -.03em; }
	form, label { display: grid; gap: .8rem; }
	label { color: #6d7a73; font-size: .86rem; font-weight: 800; }
	input, button { min-height: 2.8rem; padding: .65rem .8rem; border: 1px solid #b8c8ba; border-radius: .65rem; font: inherit; }
	input { background: #fffdf8; color: #25332e; }
	button { border-color: #3f765d; background: #3f765d; color: white; cursor: pointer; font-weight: 800; }
	.message { margin: 0; padding: 1rem; border-radius: .75rem; line-height: 1.5; }
	.error { background: #f9e7e2; color: #873d2b; }
</style>
