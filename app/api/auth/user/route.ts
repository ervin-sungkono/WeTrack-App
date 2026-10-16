import { randomUUID } from 'node:crypto'
import { FieldValue } from 'firebase-admin/firestore'
import { NextResponse, type NextRequest } from 'next/server'
import { getUserSession } from '@/app/lib/session'
import { getHistoryAction, getHistoryEventType } from '@/app/lib/history'
import { createHistory, handleDeletedUser } from '@/server/data/util'
import { deleteExistingFile, uploadSingleFile } from '@/app/lib/file'
import { verifyFirebasePassword, FirebaseCredentialError, type FirebasePasswordIdentity } from '@/server/firebase-auth'
import { adminAuth, db } from '@/server/db'
import { readFormData, readJsonObject, RequestValidationError } from '@/server/http'
import { parseProfileUpdate, sanitizeProfileImage, toProfileDetails, toPublicProfile } from '@/server/security'

export const runtime = 'nodejs'

const jsonError = (message: string, status: number) => NextResponse.json({ data: null, message }, { status })

function stringField(formData: FormData, name: string): unknown {
  const value = formData.get(name)
  return typeof value === 'string' ? value : value === null ? '' : null
}

function safeOriginalFileName(file: File): string {
  const name = file.name.normalize('NFKC').replace(/[\\/\u0000-\u001f\u007f]/g, '_').trim()
  return name.slice(-180) || 'profile-image'
}

async function isValidImage(file: File): Promise<boolean> {
  const prefix = new Uint8Array(await file.slice(0, 8).arrayBuffer())
  if (file.type === 'image/png') {
    return prefix.length === 8
      && prefix[0] === 0x89 && prefix[1] === 0x50 && prefix[2] === 0x4e && prefix[3] === 0x47
      && prefix[4] === 0x0d && prefix[5] === 0x0a && prefix[6] === 0x1a && prefix[7] === 0x0a
  }
  if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
    return prefix.length >= 3 && prefix[0] === 0xff && prefix[1] === 0xd8 && prefix[2] === 0xff
  }
  return false
}

export async function GET() {
  const session = await getUserSession()
  const userId = session?.user?.uid
  if (!userId || !session.user.email) return jsonError('Unauthorized.', 401)

  try {
    const userSnapshot = await db.collection('users').doc(userId).get()
    if (!userSnapshot.exists) return jsonError('User not found.', 404)
    const user = userSnapshot.data()
    if (!user || user.deletedAt != null) return jsonError('User not found.', 404)

    return NextResponse.json({
      data: {
        uid: userId,
        email: session.user.email,
        ...toProfileDetails(user),
      },
      message: 'Successfully retrieved user profile.',
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return jsonError('Unable to retrieve user profile.', 500)
  }
}

export async function PUT(request: NextRequest) {
  const session = await getUserSession()
  const userId = session?.user?.uid
  if (!userId) return jsonError('Unauthorized.', 401)

  let formData: FormData
  try {
    formData = await readFormData(request, 3 * 1024 * 1024)
  } catch (error) {
    const status = error instanceof RequestValidationError ? error.status : 400
    return jsonError(status === 413 ? 'Request body is too large.' : 'Invalid profile update.', status)
  }

  const update = parseProfileUpdate({
    fullName: stringField(formData, 'fullName'),
    description: stringField(formData, 'description'),
    jobPosition: stringField(formData, 'jobPosition'),
    location: stringField(formData, 'location'),
  })
  if (!update) return jsonError('Invalid profile details.', 400)

  const fileValue = formData.get('profileImage')
  if (fileValue !== null && !(fileValue instanceof File)) return jsonError('Invalid profile image.', 400)
  const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null
  if (file && (file.size > 2 * 1024 * 1024 || !await isValidImage(file))) {
    return jsonError('Profile image must be a PNG or JPEG file up to 2 MB.', 400)
  }

  const userRef = db.collection('users').doc(userId)
  const publicProfileRef = db.collection('publicProfiles').doc(userId)
  let newImageUrl: string | null = null
  try {
    const currentSnapshot = await userRef.get()
    if (!currentSnapshot.exists) return jsonError('User not found.', 404)
    const currentUser = currentSnapshot.data()
    if (!currentUser || currentUser.deletedAt != null) return jsonError('User not found.', 404)

    const oldProfileImage = sanitizeProfileImage(currentUser.profileImage)
    let nextProfileImage = oldProfileImage
    let newFilePath: string | null = null
    if (file) {
      const extension = file.type === 'image/png' ? 'png' : 'jpg'
      newFilePath = `profileImages/${userId}/${randomUUID()}.${extension}`
      newImageUrl = await uploadSingleFile(file, newFilePath)
      nextProfileImage = {
        attachmentStoragePath: newImageUrl,
        originalFileName: safeOriginalFileName(file),
      }
    }

    const nextUser = {
      fullName: update.fullName,
      description: update.description,
      jobPosition: update.jobPosition,
      location: update.location,
      profileImage: nextProfileImage,
    }
    const batch = db.batch()
    batch.update(userRef, { ...nextUser, updatedAt: FieldValue.serverTimestamp() })
    batch.set(publicProfileRef, toPublicProfile({ ...currentUser, ...nextUser }))
    await batch.commit()

    await adminAuth.updateUser(userId, { displayName: update.fullName }).catch(() => undefined)
    if (file && oldProfileImage) await deleteExistingFile(oldProfileImage.attachmentStoragePath).catch(() => undefined)
    await createHistory({
      userId,
      action: getHistoryAction.update,
      eventType: getHistoryEventType.profile,
    }).catch(() => undefined)

    return NextResponse.json({
      data: { uid: userId, email: session.user.email, ...toProfileDetails({ ...currentUser, ...nextUser }) },
      message: 'User profile updated successfully.',
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    if (newImageUrl) await deleteExistingFile(newImageUrl).catch(() => undefined)
    return jsonError('Unable to update user profile.', 500)
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getUserSession()
  const userId = session?.user?.uid
  const email = session?.user?.email
  if (!userId || !email) return jsonError('Unauthorized.', 401)

  let password: unknown
  try {
    password = (await readJsonObject(request, 2 * 1024)).password
  } catch (error) {
    const status = error instanceof RequestValidationError ? error.status : 400
    return jsonError(status === 413 ? 'Request body is too large.' : 'Account deletion could not be completed.', status)
  }
  if (typeof password !== 'string' || password.length === 0 || password.length > 1024) {
    return jsonError('Account deletion could not be completed.', 400)
  }

  let identity: FirebasePasswordIdentity
  try {
    identity = await verifyFirebasePassword(email, password)
  } catch (error) {
    if (error instanceof FirebaseCredentialError) {
      return jsonError('Account deletion could not be completed. Check your password and try again.', 400)
    }
    return jsonError('Account deletion is temporarily unavailable.', 503)
  }
  if (identity.uid !== userId || !identity.emailVerified) {
    return jsonError('Account deletion could not be completed. Check your password and try again.', 400)
  }

  try {
    const userSnapshot = await db.collection('users').doc(userId).get()
    const profileImage = userSnapshot.exists ? sanitizeProfileImage(userSnapshot.data()?.profileImage) : null
    await handleDeletedUser({ userId })
    await adminAuth.deleteUser(userId)
    if (profileImage) await deleteExistingFile(profileImage.attachmentStoragePath).catch(() => undefined)

    return NextResponse.json({ success: true, message: 'Account deleted successfully.' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return jsonError('Account deletion is temporarily unavailable.', 503)
  }
}
