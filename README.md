# Portfolio-Website-v2
An improvement of my old portfolio website, built using NextJS and Tailwind to showcase my projects and designs, this project uses ISR(Incremental Static Regeneration) to increase website performance while reducing server load. 

## Key Features
1. Task management and tracking
2. Collaboration
3. Scheduling
4. AI integration for task creation and recommendation
5. Kanban Board
6. Attachments
7. Dashboard
8. History
9. Notification

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