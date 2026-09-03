---
description: Epic for comments, reactions, and threaded day communication.
status: active
last_updated: 2026-09-03
source_of_truth:
  - .memory-bank/epics/EP-003-day-collaboration.md
  - .memory-bank/features/FT-004-day-collaboration.md
type: epic
id: EP-003
lifecycle: planned
---
# EP-003 — Day Collaboration

## Value
Участники обсуждают конкретный учебный день и его поля, сохраняя авторство,
реакции, глубину ответов и личные границы.

## Scope
- [.memory-bank/features/FT-004-day-collaboration.md](../features/FT-004-day-collaboration.md)

## Requirements
- REQ-006, REQ-007, REQ-008, REQ-014.

## Success / acceptance
- Поля, комментарии и сообщения поддерживают установленную модель реакций и
  авторских комментариев.
- Ответы образуют вкладки активных веток без удаления скрытых сообщений.

## Browser completion reconciliation — 2026-09-03

The prior `verified` interpretation was based on Collaboration backend-boundary
and persistence evidence. The operator requires the whole Collaboration
experience to be available through the browser; the existing `/lesson-context`
currently exposes neither the content nor the mutation controls. EP-003 is
therefore `active`/`planned` pending the sequential FT-004 browser projection,
form transport, UI, and disposable Playwright cards. Historical task evidence
and task lifecycles remain unchanged.

## Source / constraints
- [.memory-bank/prd.md](../prd.md#reactions-and-day-chat), `FR-COM-*`,
  `FR-DAY-003..005`, `NFR-PRIV-*`.
