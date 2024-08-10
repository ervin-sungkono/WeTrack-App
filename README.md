# WeTrack
A task management app with features like team collaboration and AI recommendation, this project is built for the purpose of our Computer Science thesis project.

## Resources
- [NextJS v13](https://nextjs.org/)
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
cp .env.example .env
```
| Variable | Description |
| :--- | :--- |
| `NEXTAUTH_SECRET` | Random string used to encrypt the NextAuth.js JWT, and to hash email verification tokens. |
| `NEXT_PUBLIC_LOGIN_DOMAIN` | Your site's domain |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase credentials, get it [here](https://console.firebase.google.com/) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase credentials, get it [here](https://console.firebase.google.com/) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase credentials, get it [here](https://console.firebase.google.com/) |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase credentials, get it [here](https://console.firebase.google.com/) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase credentials, get it [here](https://console.firebase.google.com/) | 
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase credentials, get it [here](https://console.firebase.google.com/) |
| `EMAIL` | Email used for sending project invitations |
| `EMAIL_PASS` | Password for the email, [how to get it](https://knowledge.workspace.google.com/kb/how-to-create-app-passwords-000009237) |
| `CHATGPT_SECRET_KEY` | ChatGPT API key, get it [here](https://platform.openai.com/api-keys) |

3. Install dependency
```sh
npm install
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