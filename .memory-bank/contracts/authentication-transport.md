---
description: Minimal SvelteKit browser and HTTP transport for password/provider login, invitations, sessions, and Admin provisioning.
status: active
last_updated: 2026-08-13
source_of_truth:
  - .memory-bank/contracts/authentication-transport.md
---
# Authentication Transport Contract

## Browser/API path

The application shell is a thin transport adapter over Identity & Access and
Center & Scheduling. The minimum real path is:

1. `GET /login` presents an email/password form for a password-credential
   account and retains Telegram and Google choices for already bound provider
   identities, including a bootstrapped Admin without center membership.
2. `POST /login` normalizes the submitted email, asks Identity & Access to
   verify the password, sets the existing session cookie on success, and
   returns one generic invalid-credentials response for unknown email or wrong
   password.
3. `GET /auth/{provider}/start` creates a short-lived server-owned state,
   starts the selected provider adapter, and redirects to the provider.
4. `GET /auth/{provider}/callback` validates state through the adapter, asks
   Identity & Access to authenticate the verified identity or atomically accept
   the pending invitation, sets the session cookie, and redirects to the
   permitted application context.
5. `GET /invite/{token}` validates the one-time capability without mutating it
   and presents the same provider choices. The invitation capability remains
   server-bound through the authentication state until callback completion.
6. `POST /auth/logout` revokes the current session through Identity & Access
   and clears the browser cookie.
7. `GET/POST /admin` is the protected Admin entry point. A bootstrapped Admin
   without center membership may create the first center in the browser; the
   server then creates the Admin membership and redirects to
   `GET/POST /admin/{centerId}`, the protected own-center surface for class
   CRUD, recurring schedules, participant invitations, and teacher
   assignment/removal. The narrower `/admin/{centerId}/participants` transport
   remains available for participant provisioning.

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
  after a verified bound identity is resolved, an invitation binding commits,
  or a password credential verifies.
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
- The own-center Admin surface reads center participants, classes, teacher
  assignments, and schedules only through an authorized Center & Scheduling
  query. Its form actions generate class/schedule identities server-side and
  call owner commands; submitted role, center, or Admin fields cannot widen
  access.

## Bootstrap Admin and center creation

- The supported empty-database bootstrap is a local server-only CLI which uses
  the same `DATABASE_URL` as the application and prompts interactively for email
  and password. The password prompt MUST be hidden. Password MUST NOT be
  accepted through argv or emitted to stdout/stderr/logs.
- The CLI normalizes email with `trim().toLowerCase()` and atomically creates
  one `accounts` row with `role = 'admin'` plus one password-credential row.
  It MUST fail before mutation when any account already exists, normalized email
  is empty/duplicate, the prompt is cancelled, or credential derivation/write
  fails. Re-running is a denial, not an update or second-Admin path.
- The credential stores normalized unique email, a cryptographically random
  per-credential salt, and a Node built-in `scrypt` result only. Plaintext
  password MUST NOT be persisted. Browser verification uses `timingSafeEqual`
  and returns the same generic invalid-credentials response for unknown email
  and wrong password without issuing a session.
- The CLI MUST NOT create a center or membership, expose a client-selected role,
  or add self-registration, recovery/reset, email verification, MFA, password
  history, or a new dependency. Center creation remains the authenticated
  browser action below. Existing Telegram/Google provider flows remain valid.
- A bound Admin without center membership may create one center through the
  protected Admin UI. Center & Scheduling creates the center and the Admin's
  membership atomically. Once membership exists, this bootstrap path is no
  longer authorized.

## Verification target

The minimum transport proof is a disposable HTTP/SSR flow covering both
provider choices, cookie attributes, valid and revoked session access, logout,
invite acceptance/reuse, Admin own-center success, non-Admin and cross-center
denial, safe errors, and no direct route persistence. A running local server
smoke must reach the protected Admin response with a server-issued fixture
session; live provider credentials are required only for an operational
provider smoke. The password bootstrap proof additionally uses a disposable
database and interactive-CLI doubles to prove hidden input, no password argv or
output, normalized uniqueness, salted `scrypt` storage, account+credential
atomicity, safe rerun, and unchanged state on every failure. HTTP/SSR proof
covers successful password login, generic invalid credentials, existing cookie
attributes, protected Admin entry, logout, and revoked-session denial.
