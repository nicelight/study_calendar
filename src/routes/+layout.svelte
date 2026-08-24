<script lang="ts">
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
		<button
			class="menu-toggle"
			type="button"
			aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
			aria-controls="protected-navigation"
			aria-expanded={menuOpen}
			onclick={toggleMenu}
		>
			<span aria-hidden="true" class="menu-icon">☰</span>
		</button>

		{#if menuOpen}
			<nav id="protected-navigation" aria-label="Навигация приложения">
				<a href="/home">Home</a>
				<a href="/classes">Classes</a>
				<a href="/statistics">Statistics</a>
				<a href="/profile">Profile</a>
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
		z-index: 10;
		width: min(100% - 2rem, 74rem);
		margin: 0 auto;
		padding-top: 1rem;
	}

	.menu-toggle {
		display: inline-grid;
		width: 2.8rem;
		height: 2.8rem;
		place-items: center;
		border: 1px solid #b8c8ba;
		border-radius: 0.7rem;
		background: #fffdf8;
		color: #25332e;
		cursor: pointer;
		font: inherit;
	}

	.menu-toggle:focus-visible,
	nav a:focus-visible,
	nav button:focus-visible {
		outline: 3px solid #b9684e;
		outline-offset: 3px;
	}

	.menu-icon {
		font-size: 1.3rem;
		line-height: 1;
	}

	nav {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		margin-top: 0.7rem;
		padding: 0.7rem;
		border: 1px solid #d9e0d8;
		border-radius: 0.8rem;
		background: #fffdf8;
		box-shadow: 0 12px 30px rgba(39, 61, 48, 0.1);
	}

	nav a,
	nav button {
		min-height: 2.4rem;
		padding: 0.55rem 0.75rem;
		border: 0;
		border-radius: 0.55rem;
		background: transparent;
		color: #25332e;
		font: inherit;
		font-size: 0.9rem;
		font-weight: 800;
		text-decoration: none;
	}

	nav a:hover,
	nav button:hover {
		background: #dcebdd;
	}

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
