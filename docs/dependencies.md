# Dependency decisions

The application targets Node.js 24, Next.js **16.4.2**, React/React DOM **19.3.1**, and strict TypeScript **5.9.3**. The framework and React versions were resolved from npm's stable tags on 2026-10-16; prereleases were excluded. TypeScript is pinned to a stable version supported by the installed ESLint parser. Next.js 16 uses Turbopack by default and its bundled documentation is available under `node_modules/next/dist/docs/`.

The NextAuth v4 stable branch is retained with its latest compatible patch. This avoids coupling the framework upgrade to a prerelease authentication migration. The app uses only its Credentials provider. Firebase Admin is a server-only dependency, while the Firebase browser SDK handles authorized realtime reads. No privileged credentials are sent to the client.

React integrations were updated where required for React 19 peer support or security: drag and drop, charts, loaders, Markdown rendering and hooks. Tailwind remains on v3 to preserve the existing design and avoid an unrelated CSS migration.

## Narrow dependency overrides

- `@grpc/grpc-js` 1.14.6 replaces the browser Firebase package's old pinned Node transport; the same patched version is used by Firebase Admin.
- `@babel/runtime` >=7.29.10 replaces an old exact pin inside react-mentions.
- `postcss-selector-parser` >=7.1.6 addresses the selector parser advisory in build tooling. The production CSS build checks compatibility with Tailwind v3.
- Nodemailer 10.1.2 addresses advisories affecting older versions. The optional NextAuth Nodemailer peer is overridden to that version; NextAuth's email provider is unused. The app's own SMTP code uses Nodemailer's current API.

Run `npm audit --omit=dev` for runtime dependencies and `npm audit` for the whole toolchain. Do not use `npm audit fix --force`: its proposed solutions can downgrade Next.js/Firebase or introduce unrelated major upgrades.

## Remaining tooling advisory

At the time of migration, `braces` <=3.0.3 has an upstream stack exhaustion advisory with no published fix: [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). It is brought in by development/build tools (Next ESLint and Tailwind globs). Application API requests do not supply glob patterns to these tools. Use the repository's fixed trusted glob configuration, and track the upstream patch. Audit may count the single underlying issue against several dependent packages. This does not mean the advisory is fixed; it remains a documented tooling limitation.

ESLint 9 is retained because the React, import and accessibility plugins bundled with the current Next.js lint config do not yet declare ESLint 10 compatibility. The lockfile must install without ignored peer dependency errors.
