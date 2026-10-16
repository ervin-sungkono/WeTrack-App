import { getToken } from 'next-auth/jwt'
import { NextResponse, type NextRequest } from 'next/server'
import { isSameOriginMutation } from '@/server/security'

const publicPaths = new Set(['/', '/login', '/register', '/forgotPassword'])

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/api' || pathname.startsWith('/api/')) {
    const sameOrigin = isSameOriginMutation({
      method: request.method,
      origin: request.headers.get('origin'),
      secFetchSite: request.headers.get('sec-fetch-site'),
      requestOrigin: request.nextUrl.origin,
    })
    if (!sameOrigin) return NextResponse.json({ message: 'Forbidden.' }, { status: 403 })
    return NextResponse.next()
  }

  if (publicPaths.has(pathname)) return NextResponse.next()

  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', `${pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }

  const token = await getToken({ req: request, secret }).catch(() => null)
  const user = token?.user
  if (!user || typeof user !== 'object' || typeof user.uid !== 'string') {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', `${pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|opengraph-image.png|twitter-image.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
