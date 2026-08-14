# Papercuts

- The mandatory `finding-adjudication.md` pack requires two co-reviewers on
  model `Codex Luna`, but `spawn_agent` exposes only `gpt-5.6-sol` and
  `gpt-5.6-terra`; both prescribed retry attempts fail with `Unknown model`, so
  the skill can only use its continue-without-co-reviewer fallback.
- `npx vite-node --help` unexpectedly attempts to install the absent
  `vite-node@6.0.0` package instead of providing a local no-install diagnostic;
  verifier probes should use the existing Vitest/Vite runner only.
- An inline Vite virtual-module probe failed import parsing because
  `String.raw` preserved escaped template-literal delimiters in the generated
  module; use ordinary quoted SQL in virtual sources.
