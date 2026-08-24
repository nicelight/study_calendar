# Papercuts

- A combined read-only verifier command failed before execution because nested shell quoting conflicted with a JavaScript regex. Re-ran the probes as separate commands.
- A follow-up inline Node assertion still contained an embedded quote in its source-text check and failed without touching workspace state; use simpler read-only pattern checks instead.
