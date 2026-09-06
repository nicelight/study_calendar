<script lang="ts">
	import { formatDateTime } from '$lib/date-input';
	import type { ProfilePageData } from './+page.server';

	let { data }: { data: ProfilePageData } = $props();
</script>

<svelte:head>
	<title>Profile</title>
	<meta name="description" content="Ваши серверные данные профиля." />
</svelte:head>

<main class="profile-shell" data-profile-page>
	<p class="eyebrow">Защищённый раздел</p>
	<h1>Профиль</h1>
	<dl>
		<div>
			<dt>ФИО</dt>
			<dd>{data.profile.fullName}</dd>
		</div>
		<div>
			<dt>Роль</dt>
			<dd>{data.profile.role}</dd>
		</div>
		<div>
			<dt>Регистрация</dt>
			<dd>{formatDateTime(data.profile.registeredAt)}</dd>
		</div>
	</dl>
</main>

<style>
	.profile-shell { width: min(100% - 2rem, 42rem); margin: 0 auto; padding: 1.75rem 0 3rem; }
	.eyebrow { margin: 0 0 .55rem; color: var(--ui-accent-ink); font-size: .8125rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
	h1 { margin: 0 0 2rem; font-size: clamp(1.5rem, 4vw, 1.75rem); letter-spacing: -.035em; line-height: 1.2; }
	dl { display: grid; gap: .8rem; margin: 0; }
	dl div { padding: 1rem 1.15rem; border: 1px solid var(--ui-line); border-radius: .8rem; background: var(--ui-surface);  }
	dt { color: var(--ui-accent-ink); font-size: .75rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
	dd { margin: .35rem 0 0; font-size: 1.1rem; font-weight: 700; }
</style>
