<script lang="ts">
	let {
		data,
		form
	}: {
		data: { providers: readonly string[] };
		form?: { error?: 'invalid_credentials' };
	} = $props();
</script>

<svelte:head>
	<title>Вход</title>
</svelte:head>

<h1>Вход</h1>
<form method="POST">
	<label>
		<span>Email</span>
		<input name="email" type="email" required autocomplete="email" />
	</label>
	<label>
		<span>Пароль</span>
		<input name="password" type="password" required autocomplete="current-password" />
	</label>
	<button type="submit">Войти</button>
</form>

{#if form?.error === 'invalid_credentials'}
	<p role="alert">Email или пароль неверны.</p>
{/if}

<nav aria-label="Провайдер входа">
	{#each data.providers as provider}
		<a href={`/auth/${provider}/start`}>Войти через {provider}</a>
	{/each}
</nav>
