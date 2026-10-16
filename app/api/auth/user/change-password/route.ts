import { NextResponse, type NextRequest } from 'next/server'
import { getUserSession } from '@/app/lib/session'
import { FirebaseCredentialError, updateFirebasePassword, verifyFirebasePassword } from '@/server/firebase-auth'
import { isValidPassword } from '@/server/security'
import { readJsonObject, RequestValidationError } from '@/server/http'

export async function POST(request: NextRequest) {
  const session = await getUserSession()
  if (!session?.user?.uid || !session.user.email) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = await readJsonObject(request, 4 * 1024)
  } catch (error) {
    const status = error instanceof RequestValidationError ? error.status : 400
    return NextResponse.json({ message: status === 413 ? 'Request body is too large.' : 'Invalid request.' }, { status })
  }
  const oldPassword = payload.oldPassword
  const newPassword = payload.newPassword
  if (typeof oldPassword !== 'string' || oldPassword.length === 0 || oldPassword.length > 1024 || !isValidPassword(newPassword)) {
    return NextResponse.json({ message: 'Invalid current or new password.' }, { status: 400 })
  }

  try {
    const identity = await verifyFirebasePassword(session.user.email, oldPassword)
    if (identity.uid !== session.user.uid || !identity.emailVerified) throw new FirebaseCredentialError()
    await updateFirebasePassword(identity.idToken, newPassword)
    return NextResponse.json({ success: true, message: 'Password updated successfully.' })
  } catch (error) {
    if (error instanceof FirebaseCredentialError) {
      return NextResponse.json({ message: 'Current password is incorrect.' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Password update is temporarily unavailable.' }, { status: 503 })
  }
}
