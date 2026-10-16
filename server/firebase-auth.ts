import 'server-only'
import { adminAuth } from './db'

type RecordValue = Record<string, unknown>

export type FirebasePasswordIdentity = {
  uid: string
  email: string
  idToken: string
  emailVerified: boolean
}

export class FirebaseCredentialError extends Error {
  constructor() {
    super('Authentication failed')
    this.name = 'FirebaseCredentialError'
  }
}

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getIdentityToolkitUrl(method: 'accounts:signInWithPassword' | 'accounts:update' | 'accounts:sendOobCode'): string {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (!apiKey) throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY is required for Firebase email/password authentication')
  const url = new URL(`https://identitytoolkit.googleapis.com/v1/${method}`)
  url.searchParams.set('key', apiKey)
  return url.toString()
}

async function postIdentityToolkit(method: 'accounts:signInWithPassword' | 'accounts:update' | 'accounts:sendOobCode', payload: RecordValue): Promise<unknown> {
  const response = await fetch(getIdentityToolkitUrl(method), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  })

  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new Error('Firebase Authentication returned an invalid response')
  }

  if (!response.ok) {
    if (method === 'accounts:signInWithPassword') throw new FirebaseCredentialError()
    throw new Error('Firebase Authentication request failed')
  }
  return body
}

export async function verifyFirebasePassword(email: string, password: string): Promise<FirebasePasswordIdentity> {
  const result = await postIdentityToolkit('accounts:signInWithPassword', {
    email,
    password,
    returnSecureToken: true,
  })

  if (!isRecord(result)
    || typeof result.localId !== 'string'
    || typeof result.email !== 'string'
    || typeof result.idToken !== 'string') {
    throw new FirebaseCredentialError()
  }

  // signInWithPassword does not return emailVerified. Read the authoritative
  // account state through Admin Auth before accepting login or reauthentication.
  let authUser
  try {
    authUser = await adminAuth.getUser(result.localId)
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/user-not-found') {
      throw new FirebaseCredentialError()
    }
    throw error
  }

  return {
    uid: authUser.uid,
    email: authUser.email ?? result.email,
    idToken: result.idToken,
    emailVerified: authUser.emailVerified,
  }
}

export async function updateFirebasePassword(idToken: string, newPassword: string): Promise<void> {
  await postIdentityToolkit('accounts:update', {
    idToken,
    password: newPassword,
    returnSecureToken: false,
  })
}

export async function requestFirebasePasswordReset(email: string): Promise<void> {
  await postIdentityToolkit('accounts:sendOobCode', {
    requestType: 'PASSWORD_RESET',
    email,
  })
}
