import 'server-only'

import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

function getCredential() {
  const serializedServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!serializedServiceAccount) return applicationDefault()

  let parsed: unknown
  try {
    parsed = JSON.parse(serializedServiceAccount)
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON must contain valid JSON')
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON must contain a service account object')
  }

  const serviceAccount = parsed as Record<string, unknown>
  const serviceAccountProjectId = serviceAccount.projectId ?? serviceAccount.project_id
  const clientEmail = serviceAccount.clientEmail ?? serviceAccount.client_email
  const privateKey = serviceAccount.privateKey ?? serviceAccount.private_key
  if (typeof serviceAccountProjectId !== 'string' || typeof clientEmail !== 'string' || typeof privateKey !== 'string') {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is missing required service account fields')
  }

  return cert({
    projectId: serviceAccountProjectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  })
}

const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET ?? process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

const adminApp = getApps().find((candidate) => candidate.name === 'wetrack-admin') ?? initializeApp({
  credential: getCredential(),
  ...(projectId ? { projectId } : {}),
  ...(storageBucket ? { storageBucket } : {}),
}, 'wetrack-admin')

export const db = getFirestore(adminApp)
export const adminAuth = getAuth(adminApp)
export const adminStorage = getStorage(adminApp)

export function getAdminBucket() {
  const bucketName = storageBucket ?? adminApp.options.storageBucket
  if (!bucketName) throw new Error('FIREBASE_STORAGE_BUCKET is required for file operations')
  return adminStorage.bucket(bucketName)
}
