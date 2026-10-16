import { NextResponse, type NextRequest } from 'next/server'
import { authenticateFirebaseUser } from '@/server/auth'
import { FirebaseCredentialError } from '@/server/firebase-auth'
import { parseLoginInput, type LoginInput } from '@/server/security'
import { readJsonObject, RequestValidationError } from '@/server/http'

export async function POST(request: NextRequest) {
  let credentials: LoginInput | null
  try {
    credentials = parseLoginInput(await readJsonObject(request, 4 * 1024))
  } catch (error) {
    if (error instanceof RequestValidationError && error.status === 413) {
      return NextResponse.json({ data: null, message: 'Request body is too large.' }, { status: 413 })
    }
    credentials = null
  }

  if (!credentials) {
    return NextResponse.json({ data: null, message: 'Invalid email or password.' }, { status: 400 })
  }

  try {
    const user = await authenticateFirebaseUser(credentials.email, credentials.password)
    return NextResponse.json({ data: user, message: 'Login successful.' })
  } catch (error) {
    if (error instanceof FirebaseCredentialError) {
      return NextResponse.json({ data: null, message: 'Invalid email or password, or the account is not verified.' }, { status: 401 })
    }
    return NextResponse.json({ data: null, message: 'Sign-in is temporarily unavailable.' }, { status: 503 })
  }
}
