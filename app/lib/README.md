# Shared application libraries

Utilities used by more than one route or component live here. Domain and API contracts are defined in `app/types/domain.ts` and `app/lib/fetch/http.ts`.

Client fetch modules use the same-origin `apiFetch` helper and preserve the existing JSON envelope shapes. Browser Firestore reads live in `app/firebase/util.ts`; the legacy `users` collection alias resolves to the sanitized `publicProfiles` collection. Keep Admin SDK access and destructive data operations in `server/data/util.ts` or another `server-only` module.

`file.ts`, `mail.ts`, and `OpenAIFunctions.ts` are server-only. Client components must not import them or other modules that use server credentials, file operations, or private user records.
