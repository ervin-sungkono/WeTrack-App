import CredentialsProvider from "next-auth/providers/credentials";
// import { loginUser } from "./fetch/user";

export const nextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "Enter your username",
        },
        password: { 
          label: "Password",
          type: "password",
          placeholder: "Enter your password"
        },
      },
      async authorize(credentials, req) {
        // Call Login API and pass in credentials variable
        if (!credentials?.username || !credentials?.password) return null

        const user = null
        // const user = await loginUser(credentials)

        if(user.data) return user.data
        else {
          throw new Error( JSON.stringify({ errors: user.message, status: false }))
        }
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          randomKey: token.randomKey,
        },
      };
    },
    jwt: ({ token, user }) => {
      if (user) {
        const u = user;
        return {
          ...token,
          id: u.id,
          randomKey: u.randomKey,
        };
      }
      return token;
    },
  },
  pages:{
    signIn: "/login",
    error: "/login"
  }
}