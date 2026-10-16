# WeTrack engineering guide

## Framework reference

Use Node.js 24 (`.nvmrc`) and `npm ci`. This app uses Next.js 16 App Router, React 19 and strict TypeScript.
Read the relevant version-matched reference in `node_modules/next/dist/docs/` before changing Next.js APIs; in particular, request parameters and route parameters are asynchronous. Do not introduce `any`, `@ts-nocheck`, or `ignoreBuildErrors` to bypass migration errors.

## Boundaries

- `app/**/page.tsx` and `app/api/**/route.ts`: framework entry points.
- `app/components/`: UI organized by feature plus shared controls.
- `app/types/`: domain contracts shared with client views.
- `app/lib/fetch/`: same-origin HTTP adapters; never trust client roles or resource ownership.
- `server/`: authenticated authorization, Admin SDK database access, privileged operations. Keep these modules server-only.
- `app/firebase/`: browser SDK and permitted realtime reads. Database and Storage rules are part of the security boundary; direct browser writes should not bypass API validation.
- Shared client state should have a scoped lifetime and narrow subscriptions. Keep form state local and keep credentials out of persisted state.

## Validation

Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` for substantial changes. Security tests must exercise denial cases and cross-project ownership, not merely mirror the implementation. Provider integration tests require an isolated configured Firebase project or emulators; do not test destructive requests on production data.

Read `docs/architecture.md` and the rollout instructions before deploying changes to authentication or Firebase rules.
