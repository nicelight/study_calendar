- Cleanup of an exact disposable `/tmp` fixture was first rejected for `rm -rf`,
  then `gio trash` reported that trash is unsupported on the system-internal
  mount; `find <validated-exact-path> -depth -delete` was required instead.
- The reusable TASK-034 Chrome probe waits for `document.readyState` and the
  schedule form but not Svelte hydration. Its first cold-server pass observed
  native pattern state before client handlers were attached; a warmed rerun
  was required for FormData/localStorage evidence.
- A bounded pre-TASK-035 route scan queried the not-yet-created
  `src/routes/center/` tree and emitted a harmless missing-path error; the
  planned TASK-035 route is intentionally absent until execution.
