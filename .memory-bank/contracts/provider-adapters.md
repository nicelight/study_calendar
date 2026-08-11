---
description: Server-only provider verification boundary for Telegram Login and Google OAuth.
status: active
last_updated: 2026-08-11
source_of_truth:
  - .memory-bank/contracts/provider-adapters.md
---
# Provider Adapter Boundary

## Purpose

Identity & Access accepts only a normalized, server-verified external identity.
Telegram Login and Google OAuth remain outbound integrations behind this
boundary; neither provider response data nor provider availability becomes a
product source of truth.

## Verified identity contract

Each configured adapter MUST expose the same conceptual operations:

- `begin({ callbackUrl, state }) -> authorizationUrl` starts the provider
  interaction without exposing credentials or internal account data.
- `verifyCallback({ request, state }) -> { provider, subject }` validates the
  provider-specific callback and returns only the stable provider kind and
  provider subject needed by Identity & Access.

The adapter MUST verify provider signatures/tokens and the server-issued state
before returning an identity. It MUST NOT accept a caller-supplied account,
role, center, membership, or invitation decision. It MUST NOT write the shared
database or create sessions.

## Accepted providers and local operation

- Telegram uses the accepted Telegram Login protocol and server-side bot
  secret verification.
- Google uses the accepted OAuth authorization-code protocol and server-side
  token/identity verification.
- Provider-specific SDK choice is not part of the product contract. The
  implementation MAY use the platform HTTP/crypto APIs or a small compatible
  dependency, provided the normalized contract and failure rules remain fixed.
- A local/test adapter MAY be injected into isolated tests. It MUST NOT create
  a role-selection, password, or unauthenticated development login route. A
  real local browser smoke uses configured provider credentials; missing
  configuration returns an explicit provider-configuration failure.

## Failure and ownership rules

- Invalid callback, state mismatch, provider outage, timeout, or missing
  provider configuration returns an explicit authentication failure and never
  writes account, invitation, identity, or session state.
- The adapter owns provider protocol verification only. Identity & Access owns
  invitation consumption, identity uniqueness, session issuance, and all
  product persistence.
- Provider secrets and callback verification stay server-only and are wired by
  the composition root/platform configuration. No provider token or secret is
  returned in a page, form result, or API response.

## Verification target

The minimum proof uses an isolated adapter double for both provider kinds and
covers valid normalized identities, invalid signatures/state, provider outage,
missing configuration, no direct persistence write, and unchanged state after
each failed callback. A configured live provider smoke is an operational
follow-up, not a substitute for the isolated boundary proof.
