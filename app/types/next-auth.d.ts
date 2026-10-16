import type { AuthSessionUser } from './auth'
import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: AuthSessionUser & DefaultSession['user']
  }

  interface User extends AuthSessionUser {
    id: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user?: AuthSessionUser
  }
}
