import { FieldValue } from 'firebase-admin/firestore'
import { NextResponse, type NextRequest } from 'next/server'
import { adminAuth, db } from '@/server/db'
import { sendVerificationEmail } from '@/server/auth-email'
import { parseRegistrationInput, type RegistrationInput } from '@/server/security'
import { readJsonObject, RequestValidationError } from '@/server/http'

const publicRegistrationError = 'Registration could not be completed. Check your details and try again.'

export async function POST(request: NextRequest) {
  let registration: RegistrationInput | null
  try {
    registration = parseRegistrationInput(await readJsonObject(request, 4 * 1024))
  } catch (error) {
    if (error instanceof RequestValidationError && error.status === 413) {
      return NextResponse.json({ data: null, message: 'Request body is too large.' }, { status: 413 })
    }
    registration = null
  }

  if (!registration) {
    return NextResponse.json({ data: null, message: publicRegistrationError }, { status: 400 })
  }

  let userId: string | undefined
  try {
    const user = await adminAuth.createUser({
      email: registration.email,
      password: registration.password,
      displayName: registration.fullName,
      emailVerified: false,
      disabled: false,
    })
    userId = user.uid

    const userData = {
      fullName: registration.fullName,
      email: registration.email,
      description: null,
      jobPosition: null,
      profileImage: null,
      location: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      deletedAt: null,
    }
    const batch = db.batch()
    batch.set(db.collection('users').doc(user.uid), userData)
    batch.set(db.collection('publicProfiles').doc(user.uid), {
      fullName: registration.fullName,
      profileImage: null,
    })
    await batch.commit()

    await sendVerificationEmail(registration.email, registration.fullName)

    return NextResponse.json({
      data: {
        uid: user.uid,
        email: registration.email,
        fullName: registration.fullName,
        profileImage: null,
        isVerified: false,
      },
      message: 'Registration successful. Check your email to verify your account.',
    }, { status: 201 })
  } catch {
    if (userId) {
      await Promise.allSettled([
        db.collection('users').doc(userId).delete(),
        db.collection('publicProfiles').doc(userId).delete(),
        adminAuth.deleteUser(userId),
      ])
    }
    return NextResponse.json({ data: null, message: publicRegistrationError }, { status: 400 })
  }
}
