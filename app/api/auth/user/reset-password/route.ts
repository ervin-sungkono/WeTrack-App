import { NextResponse, type NextRequest } from 'next/server'
import { requestFirebasePasswordReset } from '@/server/firebase-auth'
import { readJsonObject } from '@/server/http'

const genericResetResponse = {
  success: true,
  message: 'If the account exists, a password reset email has been sent.',
}

export async function POST(request: NextRequest) {
  let email: unknown
  try {
    email = (await readJsonObject(request, 1024)).email
  } catch {
    return NextResponse.json(genericResetResponse)
  }

  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json(genericResetResponse)
  }

  try {
    await requestFirebasePasswordReset(email.trim().toLowerCase())
  } catch {
    // Firebase returns account-specific errors; keep the response identical to avoid enumeration.
  }

  return NextResponse.json(genericResetResponse, { headers: { 'Cache-Control': 'no-store' } })
}
