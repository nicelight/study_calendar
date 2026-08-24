# Papercuts

- `wait_agent` accepts a minimum timeout of 10000 ms; a shorter requested wait is silently clamped after the call.
- A terminal call returned at its yield limit while its repeated Playwright subprocess continued, so subsequent probes must check for the owned runner before starting another one.
- A process check whose search pattern included its own full command self-matched; use a bracketed or narrowed pattern for runner-state checks.
