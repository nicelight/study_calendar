<script lang="ts">
	import type { DestinationPageData } from './destination.server';

	let {
		data,
		title,
		intro
	}: {
		data: DestinationPageData;
		title: string;
		intro: string;
	} = $props();

	function roleLabel(role: DestinationPageData['role']): string {
		return {
			admin: 'Администратор',
			teacher: 'Учитель',
			student: 'Ученик',
			parent: 'Родитель'
		}[role];
	}

	function destinationLabel(destination: DestinationPageData['destinations'][number]): string {
		if (destination.kind === 'center') return 'Открыть свой центр';
		if (destination.kind === 'class') return 'Открыть класс';
		return 'Открыть календарь';
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={intro} />
</svelte:head>

<main class="destination-shell" data-role={data.role} data-destination-page>
	<header class="hero">
		<div>
			<p class="eyebrow">Защищённый раздел</p>
			<h1>{title}</h1>
			<p class="intro">{intro}</p>
		</div>
		<p class="role" data-role-label>{roleLabel(data.role)}</p>
	</header>

	<section class="destinations" aria-label="Доступные направления">
		{#each data.destinations as destination (destination.href)}
			<article
				class="destination-card"
				data-destination-kind={destination.kind}
				data-center-id={destination.centerId}
				data-class-id={destination.kind === 'center' ? undefined : destination.classId}
			>
				<div>
					<p class="eyebrow">{destination.kind === 'center' ? 'Center' : 'Class'}</p>
					<h2>{destination.kind === 'center' ? destination.centerName : destination.className}</h2>
					{#if destination.kind !== 'center'}
						<p class="meta">{destination.mode === 'individual' ? 'Индивидуальный формат' : 'Групповой формат'}</p>
					{/if}
				</div>
				<a class="button" href={destination.href}>{destinationLabel(destination)}</a>
			</article>
		{:else}
			<p class="empty">Сейчас нет доступных направлений.</p>
		{/each}
	</section>
</main>

<style>
	.destination-shell { width: min(100% - 2rem, 66rem); margin: 0 auto; padding: 1.75rem 0 3rem; }
	.hero { display: flex; align-items: end; justify-content: space-between; gap: 1.5rem; }
	.eyebrow { margin: 0 0 .55rem; color: var(--ui-accent-ink); font-size: .8125rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
	h1, h2, p { margin-top: 0; }
	h1 { margin-bottom: 1rem; font-size: clamp(1.5rem, 4vw, 1.75rem); letter-spacing: -.035em; line-height: 1.2; }
	.intro, .meta { color: var(--ui-muted); line-height: 1.6; }
	.role { margin-bottom: .2rem; padding: .55rem .75rem; border: 1px solid var(--ui-line); border-radius: 999px; background: var(--ui-surface); color: var(--ui-accent-ink); font-size: .78rem; font-weight: 600; }
	.destinations { display: grid; gap: 1rem; margin-top: 2rem; }
	.destination-card { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.25rem; border: 1px solid var(--ui-line); border-radius: var(--ui-radius); background: linear-gradient(130deg, var(--ui-surface), #f5f9fa); }
	h2 { margin-bottom: .35rem; font-size: 1.125rem; letter-spacing: -.04em; }
	.meta { margin-bottom: 0; font-size: .9rem; }
	.button { display: inline-flex; min-height: 2.75rem; align-items: center; justify-content: center; flex: 0 0 auto; padding: .65rem .9rem; border: 1px solid var(--ui-accent); border-radius: .65rem; background: var(--ui-accent); color: var(--ui-on-accent); font-weight: 600; text-decoration: none; }
	.button:hover { background: var(--ui-accent-hover); }
	.button:focus-visible { outline: 3px solid var(--ui-accent); outline-offset: 3px; }
	.empty { padding: 1.25rem; border: 1px dashed #7c9299; border-radius: var(--ui-radius); color: var(--ui-muted); }
	@media (max-width: 38rem) { .hero, .destination-card { align-items: start; flex-direction: column; } .role { margin-bottom: 0; } .button { width: 100%; } }
</style>
