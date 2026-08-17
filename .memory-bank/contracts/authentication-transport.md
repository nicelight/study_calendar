---
description: Minimal SvelteKit browser and HTTP transport for authentication, sessions, Admin provisioning, and schedule-form drafts.
status: active
last_updated: 2026-08-14
source_of_truth:
  - .memory-bank/contracts/authentication-transport.md
---
# Authentication Transport Contract

## Browser/API path

The application shell is a thin transport adapter over Identity & Access and
Center & Scheduling. The minimum real path is:

1. `GET /` remains public and MUST expose a visible ordinary `Вход` anchor to
   `/login`. It has no authentication/session side effect.
2. `GET /login` presents an email/password form for a password-credential
   account and retains Telegram and Google choices for already bound provider
   identities, including a bootstrapped Admin without center membership.
3. `POST /login` normalizes the submitted email, asks Identity & Access to
   verify the password, sets the existing session cookie on success, and
   returns one generic invalid-credentials response for unknown email or wrong
   password.
4. `GET /auth/{provider}/start` creates a short-lived server-owned state,
   starts the selected provider adapter, and redirects to the provider.
5. `GET /auth/{provider}/callback` validates state through the adapter, asks
   Identity & Access to authenticate the verified identity or atomically accept
   the pending invitation, sets the session cookie, and redirects to the
   permitted application context.
6. `GET /invite/{token}` validates the one-time capability without mutating it
   and presents the same provider choices. The invitation capability remains
   server-bound through the authentication state until callback completion.
7. `POST /auth/logout` revokes the current session through Identity & Access
   and clears the browser cookie.
8. `GET/POST /admin` is the protected Admin entry point. A bootstrapped Admin
   without center membership may create the first center in the browser; the
   server then creates the Admin membership and redirects to
   `GET/POST /admin/{centerId}`, the protected own-center surface for class
   CRUD, recurring schedules, participant invitations, and teacher
   assignment/removal. The narrower `/admin/{centerId}/participants` transport
   remains available for participant provisioning.
9. `GET /center/{centerId}/class/{classId}` is the protected role-scoped class
   entry shell. The server resolves the actor and permitted class scope through
   Center & Scheduling; Admin, Teacher, Student, and Parent members may receive
   the shell only when their center/class membership or assignment permits it.
   Unauthenticated requests redirect to `/login`; cross-center, non-member,
   and removed-assignment requests fail before protected class data renders.
   This entry does not replace `/admin/{centerId}`, add lesson-context or
   calendar content, trust client role/center/class fields, or own direct
   persistence.
10. `GET /calendar?classId={classId}&date={YYYY-MM-DD}` is the protected
   database-backed class calendar path. The server resolves the request actor,
   matching `AuthorizedClassScope`, and current lessons through the existing
   Calendar and Membership Query Boundary; it MUST NOT render the public home
   fixture as an authenticated calendar. Unauthenticated/revoked sessions
   redirect to `/login`, and cross-center, non-member, unassigned, or removed
   access fails before class lessons render. Calendar lesson links preserve
   exactly the `date`, `classId`, and `lessonId` query values when navigating to
   the existing `/lesson-context` path and MUST NOT add `studentAccountId`.
   That path remains the Lesson Context owner and rechecks authorization
   server-side. Personal student context is deferred to a separate role-scoped
   follow-up after dashboard work.

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

## Class schedule draft retention

- Each recurring-schedule form MAY retain its unfinished browser draft only in
  `localStorage` under
  `study-calendar:schedule-draft:${centerId}:${classId}`. The exact JSON value
  is `{ "startDate": string, "endDate": string, "weekdays": number[] }`:
  each stored date is a canonical ISO calendar date `YYYY-MM-DD`, and weekdays
  are unique integers from `0` through `6`.
- The writer MUST serialize only `startDate`, `endDate`, and `weekdays`. It MUST
  NOT store passwords, session/authentication values, invitation capabilities,
  account/role data, arbitrary form fields, or other secrets in this draft.
- Storage access MUST occur only in browser lifecycle/event code after client
  mount. SSR and module evaluation MUST NOT read `window` or `localStorage`;
  before restoration the form uses
  `{ startDate: "", endDate: "", weekdays: [] }`.
- A missing entry, unavailable storage, invalid JSON, wrong shape, non-ISO
  non-empty date, or weekday outside integer range `0..6` MUST be ignored
  without a render failure and MUST leave the clean default. A valid draft is
  restored only into the form whose current `centerId` and `classId` produced
  the key; it MUST NOT cross centers or classes.
- A failed or rejected submission retains the matching draft. Only a confirmed
  successful `schedule_created` result clears that exact key; submission alone
  and failures MUST NOT clear it.
- The draft is disposable UI state, not authorization or durable product data.
  Existing form payloads and the server-side `invalid_schedule` error envelope
  remain authoritative; the separate AC-009 rule rejects zero-occurrence
  ranges before persistence without changing that payload or public shape. No
  server draft persistence, dependency, migration, cookie, or alternate
  schedule command is introduced.
- The schedule form's visible date controls MUST present and accept strict
  `dd/mm/yyyy` user-facing values, reject malformed or impossible calendar
  dates explicitly, and convert valid values to canonical ISO `YYYY-MM-DD`
  before ordinary Form Data submission. The existing ISO wire payload and
  scoped draft JSON remain unchanged; this is presentation/input formatting,
  not a server or storage contract change.

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
Schedule draft proof uses the real protected browser form to compare current
draft loss with same-form reload/return restoration, cross-class isolation,
malformed-value fallback, retention after validation failure, and matching-key
removal after successful creation while submitted weekday Form Data remains
observable.
