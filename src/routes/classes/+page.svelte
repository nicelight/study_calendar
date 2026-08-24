<script lang="ts">
	import DestinationPage from '../home/DestinationPage.svelte';
	import type { ClassesPageData } from './+page.server';

	let { data }: { data: ClassesPageData } = $props();
</script>

<DestinationPage
	{data}
	title="Classes"
	intro="Здесь собраны только классы и календари, разрешённые сервером."
/>
