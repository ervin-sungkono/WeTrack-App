# WeTrack architecture and migration review

## Scope and findings

This review started from `master` commit `e46390024e6ef81a8ef304e0e516d9f6b07ddc5b`. The application is a collaborative task manager built as a Next.js monolith with Firebase, NextAuth, Formik, realtime listeners, and AI assistance. Its 207 JavaScript application modules had untyped component and HTTP contracts, mixed privileged/browser Firebase helpers, and duplicated HTTP request handling.

The highest-risk findings were inconsistent resource authorization and a server-wide mutable Firebase client-auth instance. Some reads checked only that a user was logged in, and nested deletion routes did not consistently bind a child resource to the task in the URL. Stale or unaccepted team rows could grant access. The API implementation and browser visibility of buttons are separate security boundaries; hiding a button is not authorization.

The appropriate design is a typed, feature-oriented monolith. A separate backend, generic repository framework, global data store, or microservices would add coordination costs without resolving the application's current problems.

## Implemented boundaries

| Area | Responsibility | Dependency direction |
| --- | --- | --- |
| `app/**/page.tsx`, `app/layout.tsx`, `proxy.ts` | Routing, shell, page access and request-origin checks | Compose UI; do not implement database policies |
| `app/components/common/` | Shared controls and form primitives | React, typed props and local form state |
| `app/components/projects/`, task/dashboard/profile features | Feature UI and authorized realtime subscriptions | Client adapters and domain/view models |
| `app/types/` | Stored domain records, hydrated view models and authentication contracts | Type-only shared dependencies |
| `app/lib/fetch/` | Same-origin HTTP adapters with one error/envelope implementation | API routes; no service credentials |
| `app/firebase/` | Browser Firebase setup and typed permitted read references | Firebase browser SDK and deployed rules |
| `app/lib/context/` | Scoped task UI store, project draft and role access | UI and API adapters; no server persistence cache |
| `server/authorization.ts`, `server/project-access-policy.ts` | Session checks, active membership and role policies | Trusted server data |
| `server/http.ts`, validation modules | Bounded request parsing and consistent safe failures | Request data treated as unknown |
| `server/db.ts`, `server/firestore.ts`, `server/data/` | Server-only Admin access and privileged shared operations | Firebase Admin SDK |
| `server/rate-limit.ts` | Persistent per-user AI quotas across server instances | Firestore transactions |
| `firestore.rules`, `storage.rules` | Independent authorization for browser SDK access | Authenticated Firebase identity and membership index |

Existing feature directory names are retained to keep this migration reviewable. New feature behavior should live with its feature; extract a shared helper when there is actual repeated behavior. The small Admin facade preserves the existing modular Firestore calling style while replacing unsafe client SDK use in server code. It is a migration boundary, not a general database abstraction; new server logic can use the Admin SDK directly.

## TypeScript and framework migration

The target is stable Next.js 16.4.2 with React/React DOM 19.3.1 on Node.js 24. TypeScript is strict, application JavaScript is migrated, and request/route parameters follow the asynchronous Next.js APIs. `next lint` is replaced with ESLint's CLI, the page guard uses `proxy.ts`, and removed configuration is eliminated. Type errors are not bypassed during production builds.

Stored records and hydrated UI records have different types: IDs in Firestore can become user/status/label objects in a view. React event targets, refs, Formik values, component props and nullable loading state are explicit. HTTP input is parsed and validated before it becomes a domain operation. A TypeScript assertion does not replace server validation.

## Authentication and authorization

Server login verifies credentials through Firebase's stateless identity API instead of signing a shared Firebase browser `auth` object into a request's user. NextAuth keeps the signed session; profile-session updates reload trusted server fields instead of accepting arbitrary client-provided identity changes. Sensitive account changes verify the current password. Errors avoid exposing provider internals, and public profile projections omit email/account state.

Every business handler authenticates the caller and checks accepted, non-deleted membership in an active project. Owner, Member and Viewer are the existing roles. Project administration is Owner-only; task mutation is limited to permitted roles. Resource relationships are verified from stored data: attachment/comment IDs belong to the task path, labels/statuses belong to the task's project, assignees are accepted members, and invitations belong to their intended recipient.

The root authentication bridge exchanges the NextAuth session for a Firebase custom token so realtime reads use the same UID as server requests. It prevents protected views from subscribing before that identity is ready. Rules deny direct browser writes; mutations use authenticated APIs. The private `projectMembers/{projectId_uid}` index gives Firestore/Storage rules a deterministic membership lookup. Team and project mutations maintain it along with their business changes. Public collaborator names and avatars live separately in `publicProfiles`; listing that collection is denied. Description, location and job details are returned only through a self/shared-project authorized profile API. Firebase rules require the verified access claim minted by the server. Storage checks the private user's `activeProjectIds` and the authoritative project document, respecting its two-document Firestore lookup limit.

Mutation requests reject cross-origin browser requests, body readers enforce actual streamed byte limits, and file operations have size/type/path checks. Task attachments use authenticated download routes with private, no-store responses; newly uploaded files have no persistent bearer download token. Profile avatars remain deliberately shareable. AI routes share a transaction-backed per-user allowance (6 requests/minute and 60/day by default) and bound prompts/output. Both quotas are configurable through server environment variables. Fixed windows permit bursts at a boundary; the aim is a simple account budget, not a distributed bot-prevention product.

## State-management decision

| State | Decision | Reason |
| --- | --- | --- |
| Shared task dialog, selected task and task actions | Provider-scoped Zustand store | Stable action selectors avoid broadcasting unrelated modal changes to every consumer; state/actions are explicit and testable |
| Project creation wizard draft | Typed, scoped Context | Low-frequency state with a small lifetime; adding another store provides little benefit |
| Current project role | Scoped Context with identity/project-aware loading | A read-only UI hint; the server remains the authority |
| Form fields and local dropdown state | Local React/Formik state | The nearest component owns it |
| Tasks, memberships, comments and other persisted data | API/realtime data flow | Avoid duplicating the database into another global store |
| Session | NextAuth provider | One authentication lifecycle at the root |

Zustand and Context solve different parts of this app. Zustand is useful for changing shared UI state and narrow subscriptions. Context remains useful for scoping a store or a low-frequency value. Neither improves security by itself. There is no module-global store containing user data, and credentials are not persisted in client state.

## DRY, KISS and YAGNI

The migration centralizes request parsing/errors, HTTP adapters, membership policy and privileged helpers. It removes obsolete JavaScript copies, the unused skeleton controls and Formik checkbox, and commented/dead implementations, keeps the existing feature scope, and avoids adding frameworks for hypothetical growth. Project draft reset replaces the old merge-with-empty-object behavior. Subscription cleanup and identity-aware state prevent stale UI results from surviving navigation or sign-out.

Further extraction should follow concrete need. Large task/detail views can be split by an independently changing section when that makes ownership clearer. A new query-cache library or a full filesystem reorganization should follow measured duplication or loading problems, not precede them.

## Rollout for an existing Firebase project

1. Use an isolated Firebase project or emulators to validate authenticated collaboration, invitations, file upload/delete, account changes and role changes. Unit tests and an anonymous HTTP smoke test do not prove those external operations work.
2. Configure Node.js 24, the public Firebase variables, a fresh `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and server-only Admin credentials. Standard downloaded service-account JSON is supported. Configure SMTP and the existing AI key for their respective features.
3. Back up Firestore and Storage. Run `npm run migrate:firebase-access` to review counts without writes, then `npm run migrate:firebase-access -- --apply` to build public profiles, active membership indexes accepted-team email removal, and required legacy child-record scope fields. The script is idempotent and does not print personal data. Also run `npm run migrate:attachment-privacy` to inspect existing project files, then `npm run migrate:attachment-privacy -- --apply` to revoke their persistent download tokens. This step is required to invalidate old copied attachment URLs; replacing links in the UI alone does not revoke them. Keep profile avatars outside this revocation scope.
4. Deploy the new backend/client and the rules as one coordinated release. Use the intended Firebase project explicitly. Applying the stricter rules to the old client will block its unauthenticated realtime access. Do not deploy rules to an unknown project or assume repository edits update cloud configuration.
5. Verify Owner/Member/Viewer flows with at least two accounts in different projects, including removal/revocation while a view is open. Verify that cross-project resource requests fail and valid collaboration still works. Resolve any Firestore composite-index requirements reported by the configured test project.
6. Monitor authorization failures, failed identity bootstrap, invitation delivery, quota responses and upload cleanup. Retain the previous deployment and backup for a coordinated rollback; do not roll back to permissive database rules as a shortcut.

Cloud credentials, active rules, data and composite indexes were not available to this code review. The branch prepares the implementation and rollout; it does not claim that existing cloud resources have been migrated. Dependency audit limitations are recorded separately in [dependencies.md](dependencies.md).
