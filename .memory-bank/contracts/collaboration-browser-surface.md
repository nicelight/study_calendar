---
description: Canonical browser projection and server-authorized transport for Collaboration in Lesson Context.
status: active
last_updated: 2026-09-03
source_of_truth:
  - .memory-bank/contracts/collaboration-browser-surface.md
---
# Collaboration Browser Surface Contract

## Ownership and route

The existing `/lesson-context` route is the only planned Collaboration user
surface. Lesson Context composes the authorized day projection and adapts it
to SvelteKit page data; Collaboration remains the semantic owner and sole
writer of comments, reactions, messages, replies, and branch activity.

Identity & Access remains the owner of participant `fullName`. Collaboration
remains the owner of discussion authorization and selects author/reactor IDs
only from its server-authorized current resource projection. It may consume
the named `getParticipantLabels` bounded Actor Context participant-label
projection for those IDs; labels
are display data only and never authority.

The `/api/lesson-context` endpoint remains a GET-only read projection. This
feature does not add a top-level route, a Collaboration mutation API, a second
frontend state layer, or a duplicate persistence abstraction.

## Server-composed projection

For the current server-authorized class/lesson and optional permitted student
context, the Lesson Context projection MUST provide both shared and personal
Collaboration sections when each is permitted. A section contains:

- supported field entries (`topic`, `practicalWork`, and `homework`) with
  account-owned comments, author display label, creation time, and last-change
  time. The author label is resolved through the bounded Identity & Access
  participant-label projection after Collaboration scope authorization;
- the five standard reactions (`like`, `love`, `laugh`, `celebrate`,
  `question`) for each supported field/comment/message target, including the
  permitted participant display labels for each reaction. Reactor labels use
  the same bounded projection and are limited to IDs from the current
  authorized discussion projection;
- the common feed of all messages visible in the section;
- root messages and replies of arbitrary depth;
- at most ten most recently active branch tabs, each with enough identity to
  select its root and display its complete retained thread; a branch tab is
  absent until its root has a first reply.

Hidden branches are a projection concern, not deletion: messages and replies
remain retained and become visible again after new activity. Personal data is
composed only for the server-authorized student scope and is never mixed into
the shared section or another student's section.

## Authorized mutation transport

Browser mutations use named SvelteKit form actions on `/lesson-context`:
`createFieldComment`, `editFieldComment`, `setReaction`, `createMessage`, and
`replyToMessage`. Each action accepts only the minimum untrusted selector and
content fields needed to identify the current route context and target. The
session cookie is the sole actor authority.

The server MUST resolve and validate, before any write:

1. authenticated session actor and current role;
2. current center, class, lesson, and optional student scope from accepted
   Identity & Access and Calendar/Membership queries;
3. target existence and target scope, including comment ownership for edits,
   permitted parent/root relationship for replies, and personal-discussion
   ownership.

Client-supplied `role`, `centerId`, `authorAccountId`, `scope`, or authority
   claims are ignored or rejected and never authorize a request. Forged class,
   lesson, student, target, or scope selectors, a removed membership, and a
   removed teacher assignment are denied before mutation on the next server
   check, without exposing unrelated object existence. All writes delegate to
   the existing Collaboration public boundary and preserve its attribution,
   retention, uniqueness, and scope rules.

## Browser user surface and persistence

The page renders the actual content, not only counts: comment text and own
create/edit controls, author and last-change time, reaction controls and
reactor participants, day-chat common feed, reply controls with nested thread
display, and separate shared/personal sections. A branch tab appears after the
first reply, no more than ten recent tabs are visible, and selecting a tab is
URL state so the chosen thread survives SSR/reload without a client store.

After a successful form action the page reload/navigation MUST obtain the
projection from the server. Browser proof MUST verify that created comments,
reactions, messages, replies, and branch activity persist after reload and
that hidden messages are retained. Admin, assigned Teacher, Student, and
linked Parent receive only the views and mutations allowed by the access
control contract; negative cases cover forged authority/scope and revoked
membership or assignment.

## Verification target

Implementation evidence consists of claim-linked RED/GREEN route/action
integration tests over isolated SQLite state and Playwright browser scenarios
run by `scripts/run-disposable-e2e.mjs` against a disposable `tmp/` database.
The browser suite MUST exercise both shared and personal contexts, positive
and negative role/privacy cases, real form transport, reload persistence,
eleven-plus branch ordering, hidden-branch reactivation, and state-before/
state-after checks for denied mutations. Cleanup MUST run on success and test
failure and MUST never target `study-calendar.db`.
