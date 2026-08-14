# Papercuts

- Broad combined Memory Bank inspection exceeded the command-output limit and truncated required context; read task-local materials in smaller bounded commands.
- A disposable probe under `.tasks/` was excluded by the repository Vitest include (`tests/**/*.test.ts`); moved the claim probe into the indexed focused test files instead.
