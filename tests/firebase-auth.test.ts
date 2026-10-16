import assert from 'node:assert/strict'
import test from 'node:test'
import type { UserRecord } from 'firebase-admin/auth'
import { adminAuth } from '../server/db'
import { verifyFirebasePassword } from '../server/firebase-auth'

test('password verification accepts the documented REST shape and reads verification state from Admin Auth', async (context) => {
  const previousApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'public-test-key'

  context.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) => {
    assert.match(String(input), /accounts:signInWithPassword/)
    return new Response(JSON.stringify({
      localId: 'user-123',
      email: 'ada@example.com',
      idToken: 'firebase-id-token',
      registered: true,
      refreshToken: 'refresh-token',
      expiresIn: '3600',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  })

  context.mock.method(adminAuth, 'getUser', async (uid: string) => ({
    uid,
    email: 'ada@example.com',
    emailVerified: true,
  }) as UserRecord)

  try {
    const identity = await verifyFirebasePassword('ada@example.com', 'ValidPass123')
    assert.deepEqual(identity, {
      uid: 'user-123',
      email: 'ada@example.com',
      idToken: 'firebase-id-token',
      emailVerified: true,
    })
  } finally {
    if (previousApiKey === undefined) delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    else process.env.NEXT_PUBLIC_FIREBASE_API_KEY = previousApiKey
  }
})

test('password verification trusts Admin Auth verification state instead of the REST payload', async (context) => {
  const previousApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'public-test-key'

  context.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({
    localId: 'user-456',
    email: 'grace@example.com',
    idToken: 'firebase-id-token',
  }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
  context.mock.method(adminAuth, 'getUser', async (uid: string) => ({
    uid,
    email: 'grace@example.com',
    emailVerified: false,
  }) as UserRecord)

  try {
    const identity = await verifyFirebasePassword('grace@example.com', 'ValidPass123')
    assert.equal(identity.emailVerified, false)
  } finally {
    if (previousApiKey === undefined) delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    else process.env.NEXT_PUBLIC_FIREBASE_API_KEY = previousApiKey
  }
})
