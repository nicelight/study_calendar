<script lang="ts">
	import '$lib/workspace-theme.css';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
	let menuOpen = $state(false);

	function toggleMenu() {
		menuOpen = !menuOpen;
	}
</script>

{#if data.actor}
	<header class="protected-shell" data-protected-shell>
		<a class="brand" href="/home" aria-label="Study Calendar">
			<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="4"/><path d="M7 3v4m10-4v4M3 10h18m-14 5 3 3 6-5"/></svg>
			<span>Study Calendar</span>
		</a>
		<button
			class="menu-toggle"
			type="button"
			aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
			aria-controls={menuOpen ? 'protected-navigation' : undefined}
			aria-expanded={menuOpen}
			onclick={toggleMenu}
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d={menuOpen ? 'M6 6l12 12M6 18 18 6' : 'M4 6h16M4 12h16M4 18h16'}/></svg>
		</button>

		{#if menuOpen}
			<nav id="protected-navigation" aria-label="Навигация приложения">
				<a href="/home" aria-current={page.url.pathname === '/home' ? 'page' : undefined}>Home</a>
				<a href="/classes" aria-current={page.url.pathname === '/classes' ? 'page' : undefined}>Classes</a>
				<a href="/statistics" aria-current={page.url.pathname === '/statistics' ? 'page' : undefined}>Statistics</a>
				<a href="/profile" aria-current={page.url.pathname === '/profile' ? 'page' : undefined}>Profile</a>
				<form method="POST" action="/auth/logout">
					<button type="submit" data-navigation-control="Logout" title="Logout">Выйти</button>
				</form>
			</nav>
		{/if}
	</header>
{/if}

{@render children()}

<style>
	.protected-shell {
		position: relative;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		z-index: 10;
		width: min(100% - 2rem, 74rem);
		margin: 0 auto;
		padding: .75rem 0;
		border-bottom: 1px solid var(--ui-line);
	}
	.brand { display: inline-flex; align-items: center; gap: .65rem; min-height: 44px; color: var(--ui-accent-ink); font-size: .95rem; font-weight: 650; text-decoration: none; }

	.menu-toggle {
		display: inline-grid;
		width: 2.8rem;
		height: 2.8rem;
		place-items: center;
		border: 1px solid var(--ui-line);
		border-radius: 0.7rem;
		background: var(--ui-surface);
		color: var(--ui-text);
		cursor: pointer;
		font: inherit;
	}

	.menu-toggle:focus-visible,
	nav a:focus-visible,
	nav button:focus-visible {
		outline: 2px solid var(--ui-accent);
		outline-offset: 3px;
	}

	nav {
		display: flex;
		flex-basis: 100%;
		align-items: center;
		gap: 0.55rem;
		margin-top: 0.7rem;
		padding: 0.7rem;
		border: 1px solid var(--ui-line);
		border-radius: 0.8rem;
		background: linear-gradient(120deg, #fff, #f2f8fa);
		transition: opacity 160ms ease, transform 160ms ease;
	}
	@starting-style { nav { opacity: 0; transform: translateY(-3px); } }

	nav a,
	nav button {
		min-height: 44px;
		display: inline-flex;
		align-items: center;
		padding: 0.55rem 0.75rem;
		border: 0;
		border-radius: 0.55rem;
		background: transparent;
		color: var(--ui-text);
		font: inherit;
		font-size: 0.9rem;
		font-weight: 600;
		text-decoration: none;
	}

	nav a:hover,
	nav button:hover {
		background: var(--ui-accent-soft);
	}
	nav a[aria-current='page'] { background: var(--ui-accent-soft); color: var(--ui-accent-ink); box-shadow: inset 0 -2px var(--ui-accent); }

	nav form {
		margin: 0 0 0 auto;
	}

	@media (max-width: 38rem) {
		nav {
			align-items: stretch;
			flex-direction: column;
		}

		nav form {
			margin: 0;
		}

		nav a,
		nav button {
			text-align: left;
		}
	}
</style>
