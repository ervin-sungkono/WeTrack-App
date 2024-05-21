import CredentialsProvider from "next-auth/providers/credentials";
import { signIn } from "./fetch/user";

const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export const nextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Enter your email",
        },
        password: { 
          label: "Password",
          type: "password",
          placeholder: "Enter your password"
        },
      },
      async authorize(credentials) {
        // Call Login API and pass in credentials variable
        if (!credentials?.email || !credentials?.password) return null

        const user = await signIn(credentials)

        if(user.data) return {
          ...user.data,
          expires: Date.now() + (1000 * MAX_AGE)
        }
        else {
          throw new Error( JSON.stringify({ errors: user.message, status: false }))
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
        user && (token.user = user)
        if(trigger === "update"){
          if(session?.fullName){
            token.user.fullName = session.fullName
          }
          if(session?.profileImage !== undefined){
            token.user.profileImage = session.profileImage
          }
        }
        if (Date.now() > token.user.expires) {
          return null; // Return null to invalidate the session
        }
        return token
    },
    session: async ({ session, token }) => {
        session.user = token.user
        return session
    }
  },
  pages:{
    signIn: "/login",
    error: "/login"
  }
}