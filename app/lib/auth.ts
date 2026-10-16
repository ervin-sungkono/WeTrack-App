import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'
import { getActiveAuthProfile, authenticateFirebaseUser } from '@/server/auth'
import { parseLoginInput, sanitizeAuthUser, toAuthUser } from '@/server/security'

const maxAge = 60 * 60 * 24 * 7

export const nextAuthOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge,
  },
  jwt: { maxAge },
  providers: [
    CredentialsProvider({
      name: 'Email and password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const input = parseLoginInput(credentials)
        if (!input) return null

        try {
          const user = await authenticateFirebaseUser(input.email, input.password)
          return { ...user, id: user.uid }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        const safeUser = sanitizeAuthUser(user)
        if (safeUser) token.user = safeUser
      }

      if (trigger === 'update' && token.user?.uid) {
        const profile = await getActiveAuthProfile(token.user.uid)
        if (profile?.emailVerified) {
          token.user = toAuthUser({
            uid: profile.uid,
            email: profile.email,
            fullName: profile.profile.fullName,
            profileImage: profile.profile.profileImage,
            isVerified: profile.emailVerified,
          })
        } else {
          delete token.user
        }
      }

      return token
    },
    async session({ session, token }) {
      const safeUser = sanitizeAuthUser(token.user)
      if (safeUser) session.user = safeUser
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
}
