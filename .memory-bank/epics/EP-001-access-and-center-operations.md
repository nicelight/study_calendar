---
description: Epic for controlled access, center membership, and scheduling operations.
status: active
type: epic
id: EP-001
lifecycle: verified
---
# EP-001 — Access and Center Operations

## Value
Центр безопасно создаёт участников, назначает контекст и поддерживает
расписание классов без самовольного получения роли или потери истории урока.

## Scope
- [.memory-bank/features/FT-001-authentication-and-binding.md](../features/FT-001-authentication-and-binding.md)
- [.memory-bank/features/FT-002-center-and-scheduling.md](../features/FT-002-center-and-scheduling.md)

## Requirements
- REQ-001, REQ-002, REQ-003, REQ-004, REQ-014.

## Success / acceptance
- Все внешние identity привязаны только к заранее созданному аккаунту и
  разрешённому контексту.
- Admin управляет центром, участниками и классами, а расписание поддерживает
  повторения и безопасные исключения без дублирования уроков.
- Назначение и снятие teacher немедленно меняют доступ по правилам PRD.

## Source / constraints
- [.memory-bank/prd.md](../prd.md#users--actors), `FR-AUTH-*`, `FR-ORG-*`,
  `NFR-PRIV-*` и разделы Edge Cases.
