'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { SessionProvider, signOut as signOutNextAuth, useSession } from 'next-auth/react'
import { signInWithCustomToken, signOut as signOutFirebase } from 'firebase/auth'
import { usePathname } from 'next/navigation'
import { auth } from '@/app/firebase/config'

type FirebaseAuthBridgeState = {
  authReady: boolean
  authError: string | null
  retryAuth: () => void
}

const FirebaseAuthBridgeContext = createContext<FirebaseAuthBridgeState>({
  authReady: false,
  authError: null,
  retryAuth: () => undefined,
})

type BridgeStatus = 'loading' | 'ready' | 'error'

type BridgeState = {
  uid: string | null
  status: BridgeStatus
  message: string | null
}

type FirebaseTokenResponse = {
  data?: { token?: unknown }
}

// Firebase Auth has no AbortSignal support. Serializing its mutations ensures a
// completed operation for an old session cannot race a newer session switch.
let firebaseAuthQueue: Promise<void> = Promise.resolve()

function serializeFirebaseAuth(operation: () => Promise<void>): Promise<void> {
  const next = firebaseAuthQueue.then(operation, operation)
  firebaseAuthQueue = next.catch(() => undefined)
  return next
}

function FirebaseAuthBoundary({ children }: { children: ReactNode }) {
  const { data: session, status: sessionStatus } = useSession()
  const pathname = usePathname()
  const isPublicPath = pathname === '/' || pathname === '/login' || pathname === '/register' || pathname === '/forgotPassword'
  const uid = session?.user?.uid ?? null
  const [retryCount, setRetryCount] = useState(0)
  const [bridge, setBridge] = useState<BridgeState>({ uid: null, status: 'loading', message: null })

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    const sessionUid = uid

    const finish = (status: BridgeStatus, message: string | null = null) => {
      if (!cancelled) setBridge({ uid: sessionUid, status, message })
    }

    if (sessionStatus === 'loading') {
      return () => {
        cancelled = true
        controller.abort()
      }
    }

    if (!session || !sessionUid) {
      void serializeFirebaseAuth(async () => {
        if (cancelled) return
        await signOutFirebase(auth)
      })
        .then(() => finish('ready'))
        .catch(() => finish('error', 'Unable to clear the previous Firebase session. Retry to continue.'))
      return () => {
        cancelled = true
        controller.abort()
      }
    }

    const bootstrapFirebaseSession = async () => {
      try {
        const response = await fetch('/api/auth/firebase-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Firebase authentication is temporarily unavailable.')
        const payload = await response.json() as FirebaseTokenResponse
        const customToken = payload.data?.token
        if (typeof customToken !== 'string') throw new Error('Firebase authentication returned an invalid response.')

        if (cancelled) return
        await serializeFirebaseAuth(async () => {
          if (cancelled) return
          await signInWithCustomToken(auth, customToken)
          if (cancelled) return
          if (auth.currentUser?.uid !== sessionUid) throw new Error('Firebase account did not match the current session.')
        })
        if (cancelled) return
        finish('ready')
      } catch {
        if (cancelled) return
        await serializeFirebaseAuth(async () => {
          if (cancelled) return
          await signOutFirebase(auth).catch(() => undefined)
        })
        finish('error', 'Unable to connect your secure data session. Retry or sign in again.')
      }
    }

    void bootstrapFirebaseSession()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [session, sessionStatus, uid, retryCount])

  const retryAuth = useCallback(() => setRetryCount((count) => count + 1), [])
  const bridgeMatchesSession = bridge.uid === uid
  const authReady = bridgeMatchesSession && bridge.status === 'ready' && sessionStatus !== 'loading'
  const authError = bridgeMatchesSession && bridge.status === 'error' ? bridge.message : null
  const contextValue = useMemo(() => ({ authReady, authError, retryAuth }), [authReady, authError, retryAuth])

  if (isPublicPath) {
    return (
      <FirebaseAuthBridgeContext.Provider value={contextValue}>
        {children}
      </FirebaseAuthBridgeContext.Provider>
    )
  }

  if (!authReady) {
    if (authError) {
      return (
        <main className="flex min-h-screen items-center justify-center p-6">
          <section className="max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p role="alert" className="mb-4 text-sm text-red-700">{authError}</p>
            <div className="flex justify-center gap-3">
              <button type="button" onClick={retryAuth} className="rounded bg-basic-blue px-4 py-2 text-sm font-semibold text-white">
                Retry
              </button>
              <button type="button" onClick={() => void signOutNextAuth({ callbackUrl: '/login' })} className="rounded border px-4 py-2 text-sm font-semibold">
                Sign out
              </button>
            </div>
          </section>
        </main>
      )
    }

    return <div role="status" aria-live="polite" className="min-h-screen" />
  }

  return (
    <FirebaseAuthBridgeContext.Provider value={contextValue}>
      {children}
    </FirebaseAuthBridgeContext.Provider>
  )
}

export function AuthProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <FirebaseAuthBoundary>{children}</FirebaseAuthBoundary>
    </SessionProvider>
  )
}

export function useFirebaseAuthBridge(): FirebaseAuthBridgeState {
  return useContext(FirebaseAuthBridgeContext)
}
