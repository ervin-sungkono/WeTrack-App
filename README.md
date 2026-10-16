# WeTrack
A task management app with features like team collaboration and AI recommendation, this project is built for the purpose of our Computer Science thesis project.

## Resources
- [Next.js 16](https://nextjs.org/)
- [Nodemailer](https://www.npmjs.com/package/nodemailer)
- [Chart.js](https://www.chartjs.org/)
- [OpenAI API](https://platform.openai.com/docs/overview)
- [Firebase](https://console.firebase.google.com/)
- [Formik](https://www.npmjs.com/package/formik)
- [FullCalendar](https://fullcalendar.io/docs)
- [React Beautiful DnD(hello-pangea)](https://www.npmjs.com/package/@hello-pangea/dnd)
- [React Icons](https://www.npmjs.com/package/react-icons)
- [React Markdown](https://www.npmjs.com/package/react-markdown)
- [React Mentions](https://www.npmjs.com/package/react-mentions)
- [React Syntax Highlighter](https://www.npmjs.com/package/react-syntax-highlighter)
- [React Table v8](https://tanstack.com/table/latest/docs/introduction)
- [Tagify](https://www.npmjs.com/package/@yaireo/tagify)

## Key Features
1. Task management and tracking
2. Collaboration
3. Scheduling
4. AI integration for task creation and recommendation
5. Kanban Board
6. Attachments
7. Dashboard
8. History and Notification
9. User Profile

## Preview Image
<img src="https://raw.githubusercontent.com/ervin-sungkono/web-assets/master/images/WeTrack-App.png" width=480/>

## Installation and Setup
1. Clone this repository
```sh
git clone https://github.com/ervin-sungkono/WeTrack-App.git
```
2. Setup env variables
```sh
cp .env.example .env.local
```
Set the Firebase browser configuration, `NEXTAUTH_URL`, and a random `NEXTAUTH_SECRET`. Server operations now require Firebase Admin credentials through `FIREBASE_SERVICE_ACCOUNT_JSON` (the standard downloaded JSON) or application-default credentials. Credentials stay on the server. SMTP is required for verification/invitation emails; the existing AI key is required only for AI features.

Use Node.js 24 (`.nvmrc`) and follow [the migration and rollout guide](docs/architecture.md) before deploying this branch against existing Firebase data. The access-control rules and membership/public-profile backfill are required parts of the migration.

3. Install dependency
```sh
npm ci
```
4. Run the app
```sh
npm run dev
```

This project is deployed using Vercel, [click here](https://wetrack-app.vercel.app) to see the result.

## Team
This project is made by a team of 3 people:
- Ervin Cahyadinata Sungkono
- Christopher Vinantius
- Kenneth Nathanael

## Engineering and validation

- [Architecture, security review and state-management decision](docs/architecture.md)
- [Dependency choices and remaining tooling advisory](docs/dependencies.md)
- [Verification evidence and integration limits](docs/verification.md)
- `npm run typecheck`: strict TypeScript validation.
- `npm run lint`: ESLint with Next.js, React and TypeScript rules.
- `npm test`: security policy, input validation and quota regression tests.
- `npm run build`: production build using Turbopack.
- `npm run smoke`: start the production build and check public pages plus anonymous API denial cases.
- `npm run migrate:attachment-privacy`: inspect persistent attachment URLs; `-- --apply` revokes the old download tokens.
- `npm run migrate:firebase-access`: inspect the data backfill without writes; pass `-- --apply` after reviewing the dry run.

All application source uses TypeScript/TSX. ESLint and PostCSS keep native `.mjs` configuration files because their loaders execute JavaScript configuration.
