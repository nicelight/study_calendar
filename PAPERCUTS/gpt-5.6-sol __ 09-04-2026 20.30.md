# Verification receipt path omits the wave suffix

`.tasks/TASK-099-T3-FT-006-W32/TASK-099-T3-FT-006-W32-S-VERIFY-final-report-docs-01.md`
names `.protocols/TASK-099-T3-FT-006/verification.md` in its `Receipt` line,
but the existing protocol is
`.protocols/TASK-099-T3-FT-006-W32/verification.md`. The authoritative task
card and current Memory Bank evidence routes use the correct W32 path. The
verification artifact was not edited during `/mb-sync` because verification
evidence was outside the assigned write authority.
