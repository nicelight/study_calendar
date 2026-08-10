

## SvelteKit / Svelte 5

* MUST use runes mode and current non-legacy Svelte 5 APIs in new Svelte components/reactive modules; preserve existing legacy mode unless migration is task-required.
* MUST keep reactive state at the narrowest owner: local `$state`/props first, context for subtree-shared state, URL for state that must survive reload or affect SSR; use stores only when their stream/subscription semantics are needed.
* MUST use `$derived` for values computable from reactive state; treat `$effect` as a client-only escape hatch for side effects/external sync when no direct Svelte primitive fits; NEVER mirror derivable state with it.
* NEVER mutate props; use callback props, or `$bindable` only when parent and child intentionally share writable state.
* NEVER keep request/user state in server module scope or mutate shared state from `load`; `load` MUST remain side-effect-free.
* MUST keep secrets, DB/filesystem access and server-only utilities in `$lib/server` or `.server.*`; treat server `load`/action returns as client-visible and serializable.
* SHOULD use `load` for route data participating in SSR/navigation, server `load` when server-only access is required, and the provided `fetch` inside `load`; follow established remote-function usage when the project has opted in.
* SHOULD use form actions for browser form submissions and `+server` for HTTP APIs/non-page clients; use remote functions only when the project has explicitly opted in.
* MUST keep components and universal modules SSR-safe; isolate browser-only execution/imports and NEVER disable SSR merely to bypass browser-only code.
* SHOULD use `<a>`/`<form>` declaratively, `$app/navigation` for imperative internal navigation/history, and `$app/state` in runes code; use `window.location` for external URLs and `$app/stores` only for legacy compatibility.


