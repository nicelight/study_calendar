<script lang="ts">
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
			<dd>{data.profile.registeredAt}</dd>
		</div>
	</dl>
</main>

<style>
	:global(*) { box-sizing: border-box; }
	:global(body) { margin: 0; background: #f7f3eb; color: #25332e; font-family: ui-rounded, "SF Pro Rounded", "Segoe UI", sans-serif; }
	.profile-shell { width: min(100% - 2rem, 42rem); margin: 0 auto; padding: 3rem 0 5rem; }
	.eyebrow { margin: 0 0 .55rem; color: #3f765d; font-size: .72rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
	h1 { margin: 0 0 2rem; font-size: clamp(2.5rem, 8vw, 5rem); letter-spacing: -.07em; line-height: .95; }
	dl { display: grid; gap: .8rem; margin: 0; }
	dl div { padding: 1rem 1.15rem; border: 1px solid #d9e0d8; border-radius: .8rem; background: #fffdf8; box-shadow: 0 12px 30px rgba(39, 61, 48, .08); }
	dt { color: #3f765d; font-size: .75rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
	dd { margin: .35rem 0 0; font-size: 1.1rem; font-weight: 700; }
</style>
