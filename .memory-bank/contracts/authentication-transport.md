---
description: Minimal SvelteKit browser and HTTP transport for login, invitations, sessions, and Admin provisioning.
status: active
last_updated: 2026-08-11
source_of_truth:
  - .memory-bank/contracts/authentication-transport.md
---
# Authentication Transport Contract

## Browser/API path

The application shell is a thin transport adapter over Identity & Access and
Center & Scheduling. The minimum real path is:

1. `GET /login` presents Telegram and Google choices for an already bound
   account.
2. `GET /auth/{provider}/start` creates a short-lived server-owned state,
   starts the selected provider adapter, and redirects to the provider.
3. `GET /auth/{provider}/callback` validates state through the adapter, asks
   Identity & Access to authenticate the verified identity or atomically accept
   the pending invitation, sets the session cookie, and redirects to the
   permitted application context.
4. `GET /invite/{token}` validates the one-time capability without mutating it
   and presents the same provider choices. The invitation capability remains
   server-bound through the authentication state until callback completion.
5. `POST /auth/logout` revokes the current session through Identity & Access
   and clears the browser cookie.
6. `GET/POST /admin/{centerId}/participants` is the protected Admin page and
   form action for creating a center participant and returning its one-time
   invitation link.

Concrete SvelteKit route files may vary only within this path. Routes, loads,
form actions, and components MUST adapt transport data and call public module
boundaries; they MUST NOT own authorization, provider verification, or direct
database writes.

## Browser-bound callback state and bounded retention

- The provider start path MUST issue an opaque server-owned authentication state
  record together with a short-lived browser-binding cookie. The record keeps
  the binding server-side; the browser receives only the opaque state in the
  provider redirect and the opaque binding value in the cookie.
- The browser-binding cookie MUST be `HttpOnly`, `Path=/`, and `SameSite=Lax`.
  Its `Secure` condition follows the existing `foundation_session` rule
  (required for HTTPS and relaxed only for local HTTP), and its `Max-Age` MUST
  not exceed the authentication-state TTL (currently five minutes).
- Callback completion MUST require the state and the matching browser-binding
  cookie from the browser that started the flow. Missing, mismatched, expired,
  or replayed state fails closed before provider identity completion or session
  issuance; it MUST NOT consume an otherwise valid invitation or mutate
  account, identity, invitation, or session state. A matched state/binding is
  one-use and the binding cookie is cleared after the callback attempt.
- The accepted one-server runtime may keep this short-lived state in its
  process-local server memory. Expired records MUST be removed during state
  issue/consume, and a record issued for a provider start that fails MUST be
  discarded. No second durable store, browser-readable authorization state,
  background cleanup service, or development-login bypass is part of this
  correction.

## Session issuance and revocation

- Identity & Access MUST generate the opaque session token server-side only
  after a verified bound identity is resolved or an invitation binding commits.
- The existing `foundation_session` request cookie is reused as the single
  browser session cookie for the local MVP. It MUST be `HttpOnly`, `Path=/`,
  and `SameSite=Lax`; `Secure` is required for HTTPS deployment and relaxed
  only for local HTTP development.
- `hooks.server` resolves the cookie on every request. Invalid, missing, or
  revoked sessions resolve to no actor; protected routes return a redirect or
  `401`, and protected Admin actions return `403` for a valid non-Admin or
  wrong-center actor.
- Logout revokes the current server session before clearing the cookie. No
  client-provided role, center, account, or session identity is trusted.

## Invitation acceptance path

- The invite page and provider start path MUST preserve the invitation as a
  server-issued, expiring authentication capability; the browser never chooses
  the target account, role, membership, or center.
- Callback completion MUST call one Identity & Access operation that verifies
  the normalized provider identity, consumes the invitation, binds the exact
  pre-created account, and issues its first session atomically.
- Expired, revoked, reused, duplicate, invalid, or provider-failed callbacks
  return an explicit safe error and leave account, membership, invitation,
  identity, and session state unchanged.

## Protected Admin provisioning path

- The Admin page and every form action MUST resolve `locals.actor` on the
  server and recheck the target center through Center & Scheduling. UI hiding
  is not an authorization mechanism.
- A successful participant form action generates the account and invitation
  capability server-side, calls the existing authorized
  `CenterSchedulingBoundary.createParticipant` path, and returns only the
  resulting invitation URL/status needed by the Admin UI.
- The action accepts only a permitted requested participant role. Authorization
  still uses the server-resolved Admin actor and own-center membership; a
  submitted center, role, or hidden field cannot widen access.
- Unauthenticated, non-Admin, and cross-center requests are rejected before
  the Identity & Access or Center & Scheduling state changes.

## Verification target

The minimum transport proof is a disposable HTTP/SSR flow covering both
provider choices, cookie attributes, valid and revoked session access, logout,
invite acceptance/reuse, Admin own-center success, non-Admin and cross-center
denial, safe errors, and no direct route persistence. A running local server
smoke must reach the protected Admin response with a server-issued fixture
session; live provider credentials are required only for an operational
provider smoke.
