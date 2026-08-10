# /review-tasks-plan --all

- ROLE: Reviewer
- Scope: FT-001..FT-006 product queue; FT-000 reviewed only as the Foundation gate constraint; special focus FT-005/TASK-018 and downstream TASK-014
- Mode: fresh independent read-only semantic planning review after TASK-018 correction
- Reviewed Planning Revision: 2
- Required architecture subreview: completed by bounded local Reviewer passes using `/architecture-review`; no separate artifact created
- Prohibited operations honored: no edits to specs, plans, task cards, index, feature lifecycle, statuses, execution, verification, doctor, autopilot, or sync
- Historical handling: existing done/in_progress/failed records, including TASK-009/TASK-010 evidence and TASK-014 retry history, remain preserved; no historical evidence was backfilled or promoted
- Validation: canonical schema `.memory-bank/schemas/task.schema.json`; project-native `node scripts/mb-lint.mjs` passed; index/DAG/Revision 2 checks passed
