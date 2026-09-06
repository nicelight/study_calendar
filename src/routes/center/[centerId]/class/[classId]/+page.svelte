<script lang="ts">
	import type { ClassEntryPageData } from './+page.server';

	let { data }: { data: ClassEntryPageData } = $props();

	function roleLabel(role: ClassEntryPageData['role']): string {
		return {
			admin: 'Администратор',
			teacher: 'Учитель',
			student: 'Ученик',
			parent: 'Родитель'
		}[role];
	}

	function modeLabel(mode: ClassEntryPageData['mode']): string {
		return mode === 'individual' ? 'Индивидуальный' : 'Групповой';
	}
</script>

<svelte:head>
	<title>{data.className} — класс</title>
</svelte:head>

<main class="class-entry-shell" data-center-id={data.centerId} data-class-id={data.classId}>
	<p class="eyebrow">Protected class entry</p>
	<h1>{data.className}</h1>
	<p class="intro">Контекст класса предоставлен сервером.</p>

	<dl aria-label="Контекст класса">
		<div>
			<dt>Роль</dt>
			<dd data-role={data.role}>{roleLabel(data.role)}</dd>
		</div>
		<div>
			<dt>Формат</dt>
			<dd>{modeLabel(data.mode)}</dd>
		</div>
	</dl>

	<nav class="class-actions" aria-label="Действия класса">
		<a class="button" href={`/calendar?classId=${encodeURIComponent(data.classId)}`}>Открыть календарь</a>
	</nav>
</main>

<style>
	.class-entry-shell { width: min(100% - 2rem, 44rem); margin: 0 auto; padding: 1.75rem 0 3rem; }
	.eyebrow, dt { color: var(--ui-accent-ink); font-size: .8125rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
	h1 { margin: .4rem 0 1rem; font-size: clamp(1.5rem, 4vw, 1.75rem); letter-spacing: -.035em; line-height: 1.2; }
	.intro { color: var(--ui-muted); line-height: 1.6; }
	dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin: 2rem 0 0; }
	dl div { padding: 1rem; border: 1px solid var(--ui-line); border-radius: .8rem; background: var(--ui-surface); }
	dd { margin: .4rem 0 0; font-size: 1.1rem; font-weight: 600; }
	.class-actions { display: flex; margin-top: 2rem; }
	.button { display: inline-flex; min-height: 2.75rem; align-items: center; justify-content: center; padding: .65rem .9rem; border: 1px solid var(--ui-accent); border-radius: .65rem; background: var(--ui-accent); color: var(--ui-on-accent); font-weight: 600; text-decoration: none; }
	@media (max-width: 32rem) { dl { grid-template-columns: 1fr; } }
</style>
