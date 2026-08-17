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
	:global(*) { box-sizing: border-box; }
	:global(body) { margin: 0; background: #f7f3eb; color: #25332e; font-family: ui-rounded, "SF Pro Rounded", "Segoe UI", sans-serif; }
	.class-entry-shell { width: min(100% - 2rem, 44rem); margin: 0 auto; padding: 3rem 0 5rem; }
	.eyebrow, dt { color: #3f765d; font-size: .72rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
	h1 { margin: .4rem 0 1rem; font-size: clamp(2.5rem, 8vw, 5rem); letter-spacing: -.07em; line-height: .95; }
	.intro { color: #6d7a73; line-height: 1.6; }
	dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin: 2rem 0 0; }
	dl div { padding: 1rem; border: 1px solid #d9e0d8; border-radius: .8rem; background: #fffdf8; }
	dd { margin: .4rem 0 0; font-size: 1.1rem; font-weight: 800; }
	.class-actions { display: flex; margin-top: 2rem; }
	.button { display: inline-flex; min-height: 2.75rem; align-items: center; justify-content: center; padding: .65rem .9rem; border: 1px solid #3f765d; border-radius: .65rem; background: #3f765d; color: #fffdf8; font-weight: 800; text-decoration: none; }
	@media (max-width: 32rem) { dl { grid-template-columns: 1fr; } }
</style>
