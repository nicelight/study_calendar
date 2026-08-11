<script lang="ts">
	let { data, form } = $props();
</script>

<svelte:head>
	<title>Участники центра</title>
</svelte:head>

<main class="admin-shell">
	<header>
		<p class="eyebrow">Protected Admin</p>
		<h1>Участники центра</h1>
		<p class="intro">Создайте участника и передайте ему одноразовое приглашение.</p>
	</header>

	<section class="card" aria-labelledby="create-participant-title">
		<h2 id="create-participant-title">Новое приглашение</h2>
		<form method="POST">
			<label>
				<span>Роль участника</span>
				<select name="role" required>
					<option value="teacher">Учитель</option>
					<option value="student">Ученик</option>
					<option value="parent">Родитель</option>
				</select>
			</label>
			<button type="submit">Создать приглашение</button>
		</form>

		{#if form?.error}
			<p class="message error" role="alert">Не удалось создать приглашение.</p>
		{/if}

		{#if form?.invitationUrl}
			<aside class="message success" aria-live="polite">
				<strong>Приглашение создано</strong>
				<p>Статус: {form.status}</p>
				<p>Действует до: {form.expiresAt}</p>
				<a href={form.invitationUrl}>Открыть одноразовую ссылку</a>
			</aside>
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
	form { display: grid; gap: 1rem; }
	label { display: grid; gap: .45rem; color: #6d7a73; font-size: .86rem; font-weight: 800; }
	select, button { min-height: 2.8rem; padding: .65rem .8rem; border: 1px solid #b8c8ba; border-radius: .65rem; font: inherit; }
	select { background: #fffdf8; color: #25332e; }
	button { border-color: #3f765d; background: #3f765d; color: white; cursor: pointer; font-weight: 800; }
	.message { margin: 0; padding: 1rem; border-radius: .75rem; line-height: 1.5; }
	.message p { margin: .35rem 0; }
	.error { background: #f9e7e2; color: #873d2b; }
	.success { background: #e9f2e9; color: #28583f; }
	.success a { color: inherit; font-weight: 800; overflow-wrap: anywhere; }
</style>
