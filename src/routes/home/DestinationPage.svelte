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
	:global(*) { box-sizing: border-box; }
	:global(body) { margin: 0; background: #f7f3eb; color: #25332e; font-family: ui-rounded, "SF Pro Rounded", "Segoe UI", sans-serif; }
	.destination-shell { width: min(100% - 2rem, 66rem); margin: 0 auto; padding: 3rem 0 5rem; }
	.hero { display: flex; align-items: end; justify-content: space-between; gap: 1.5rem; }
	.eyebrow { margin: 0 0 .55rem; color: #3f765d; font-size: .72rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
	h1, h2, p { margin-top: 0; }
	h1 { margin-bottom: 1rem; font-size: clamp(2.5rem, 8vw, 5rem); letter-spacing: -.07em; line-height: .95; }
	.intro, .meta { color: #6d7a73; line-height: 1.6; }
	.role { margin-bottom: .2rem; padding: .55rem .75rem; border: 1px solid #d9e0d8; border-radius: 999px; background: #fffdf8; color: #3f765d; font-size: .78rem; font-weight: 800; }
	.destinations { display: grid; gap: 1rem; margin-top: 2rem; }
	.destination-card { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.25rem; border: 1px solid #d9e0d8; border-radius: 1rem; background: #fffdf8; box-shadow: 0 16px 36px rgba(39, 61, 48, .08); }
	h2 { margin-bottom: .35rem; font-size: clamp(1.4rem, 4vw, 2rem); letter-spacing: -.04em; }
	.meta { margin-bottom: 0; font-size: .9rem; }
	.button { display: inline-flex; min-height: 2.75rem; align-items: center; justify-content: center; flex: 0 0 auto; padding: .65rem .9rem; border: 1px solid #3f765d; border-radius: .65rem; background: #3f765d; color: #fffdf8; font-weight: 800; text-decoration: none; }
	.button:hover { background: #2f5f4a; }
	.button:focus-visible { outline: 3px solid #b9684e; outline-offset: 3px; }
	.empty { padding: 1.25rem; border: 1px dashed #b8c8ba; border-radius: 1rem; color: #6d7a73; }
	@media (max-width: 38rem) { .hero, .destination-card { align-items: start; flex-direction: column; } .role { margin-bottom: 0; } .button { width: 100%; } }
</style>
