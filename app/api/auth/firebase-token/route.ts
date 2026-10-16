import { NextResponse, type NextRequest } from 'next/server'
import { getUserSession } from '@/app/lib/session'
import { syncFirebaseMemberships, syncPublicProfile } from '@/server/auth'
import { adminAuth } from '@/server/db'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (origin) {
    try {
      if (new URL(origin).origin !== request.nextUrl.origin) {
        return NextResponse.json({ message: 'Forbidden.' }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ message: 'Forbidden.' }, { status: 403 })
    }
  }

  const session = await getUserSession()
  if (!session?.user?.uid) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  }

  try {
    const [profile, memberships] = await Promise.all([
      syncPublicProfile(session.user.uid),
      syncFirebaseMemberships(session.user.uid),
    ])
    if (!profile) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
    }

    const token = await adminAuth.createCustomToken(session.user.uid, {
      wetrack_verified_access: true,
    })
    return NextResponse.json({
      data: { token, memberships },
    }, { headers: { 'Cache-Control': 'no-store, max-age=0' } })
  } catch {
    return NextResponse.json({ message: 'Firebase session is temporarily unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
