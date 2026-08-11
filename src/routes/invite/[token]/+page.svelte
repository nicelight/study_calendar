<script lang="ts">
	let { data }: { data: { invitationToken: string; providers: readonly string[] } } = $props();
</script>

<svelte:head>
	<title>Приглашение</title>
</svelte:head>

<h1>Принять приглашение</h1>
<nav aria-label="Провайдер входа">
	{#each data.providers as provider}
		<a href={`/auth/${provider}/start?invitation=${encodeURIComponent(data.invitationToken)}`}>
			Продолжить через {provider}
		</a>
	{/each}
</nav>
