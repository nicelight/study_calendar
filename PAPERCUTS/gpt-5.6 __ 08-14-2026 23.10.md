# Papercuts

- Broad `rg` output while locating the TASK-035 planning approval was truncated; narrow searches by exact review artifact or task ID first.

- `ajv` schema validation command failed because the installed legacy Ajv
  package does not preload the Draft 2020-12 meta-schema; JSON/index and
  mb-lint validation remained available as the fallback checks.
