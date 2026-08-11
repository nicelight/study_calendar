<script lang="ts">
	let { data }: { data: { providers: readonly string[] } } = $props();
</script>

<svelte:head>
	<title>Вход</title>
</svelte:head>

<h1>Вход</h1>
<nav aria-label="Провайдер входа">
	{#each data.providers as provider}
		<a href={`/auth/${provider}/start`}>Войти через {provider}</a>
	{/each}
</nav>
