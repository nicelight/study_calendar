<script lang="ts">
	import DestinationPage from './DestinationPage.svelte';
	import type { HomePageData } from './+page.server';

	let { data }: { data: HomePageData } = $props();
</script>

<DestinationPage
	{data}
	title="Home"
	intro="Доступные центр, классы и календарь определены сервером для вашей роли."
/>
