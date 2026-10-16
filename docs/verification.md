# Verification evidence

Local verification for the migration branch, using Node.js 24:

| Check | Result |
| --- | --- |
| `npm ci` | Clean lockfile installation; no ignored peer dependency errors |
| `npm run typecheck` | Next.js route type generation and strict TypeScript pass |
| `npm run lint` | No errors; one React Compiler compatibility notice for TanStack Table |
| `npm test` | 33 tests pass: identity parsing/projection, official Firebase REST response shape, origin policy, byte caps, project access policy, task input relationships, generated-task limits, quota policy and attachment path validation |
| `npm run build` | Next.js 16.4.2 production build passes with Turbopack |
| `npm run smoke` | Four public pages return 200; all 47 discovered protected API methods return JSON 401 before parsing malformed input; two cross-origin mutations return 403; malformed login/register requests are rejected; reset-password response does not reveal account existence |
| `npm audit --omit=dev` | Zero known runtime dependency advisories |
| Full `npm audit` | Seven affected development/build packages from one unpatched `braces` advisory chain; see [dependencies.md](dependencies.md) |

The production build and smoke check used deliberately non-production Firebase public identifiers. No real Firebase, mail or AI service operations were performed. The smoke runner discovers exported protected API methods from the source tree; it checks anonymous denial behavior, not successful authenticated operations.

Authenticated collaboration, account mutation, SMTP delivery, AI responses, actual private file downloads and Firebase rule evaluation still require a configured test project or emulators. Java was available, but Firebase CLI, Rules testing libraries and an emulator JAR were absent; no emulator was installed. Browser automation could not be run: the browser daemon did not start and the Chromium download returned invalid/truncated archives. HTTP smoke checks do not verify browser hydration, interactions or visual layout.

Neither migration script was run against user data, and neither database nor Storage rules were deployed. Follow the coordinated rollout in [architecture.md](architecture.md), including revoking old attachment download tokens. A clean local build does not substitute for those external integration checks.
