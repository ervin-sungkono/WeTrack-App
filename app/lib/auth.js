import CredentialsProvider from "next-auth/providers/credentials";
import { signIn } from "./fetch/user";

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

        if(user.data) return user.data
        else {
          throw new Error( JSON.stringify({ errors: user.message, status: false }))
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
        user && (token.user = user)
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