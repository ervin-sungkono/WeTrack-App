import { getServerSession } from 'next-auth'
import type { NextAuthOptions, Session } from 'next-auth'
import { nextAuthOptions } from './auth'
import { getActiveAuthProfile } from '@/server/auth'
import { toAuthUser } from '@/server/security'

/**
 * App Router callers should pass only the auth options. The optional first two
 * parameters remain accepted for legacy route call sites during migration.
 */
export async function getUserSession(
  _request?: unknown,
  _response?: unknown,
  authOptions: NextAuthOptions = nextAuthOptions,
): Promise<Session | null> {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.uid
  if (!userId) return null

  const profile = await getActiveAuthProfile(userId)
  if (!profile?.emailVerified) return null

  return {
    ...session,
    user: toAuthUser({
      uid: profile.uid,
      email: profile.email,
      fullName: profile.profile.fullName,
      profileImage: profile.profile.profileImage,
      isVerified: profile.emailVerified,
    }),
  }
}
