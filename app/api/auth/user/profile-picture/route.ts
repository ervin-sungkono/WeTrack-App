import { FieldValue } from 'firebase-admin/firestore'
import { NextResponse } from 'next/server'
import { getUserSession } from '@/app/lib/session'
import { deleteExistingFile } from '@/app/lib/file'
import { adminAuth, db } from '@/server/db'
import { sanitizeProfileImage, toPublicProfile } from '@/server/security'

export const runtime = 'nodejs'

export async function DELETE() {
  const session = await getUserSession()
  const userId = session?.user?.uid
  if (!userId) return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })

  try {
    const userRef = db.collection('users').doc(userId)
    const publicProfileRef = db.collection('publicProfiles').doc(userId)
    const snapshot = await userRef.get()
    if (!snapshot.exists) return NextResponse.json({ message: 'User not found.' }, { status: 404 })

    const user = snapshot.data()
    const profileImage = sanitizeProfileImage(user?.profileImage)
    if (!profileImage) return NextResponse.json({ message: 'No profile image found.' }, { status: 404 })

    const batch = db.batch()
    batch.update(userRef, { profileImage: null, updatedAt: FieldValue.serverTimestamp() })
    batch.set(publicProfileRef, toPublicProfile({ ...user, profileImage: null }))
    await batch.commit()
    await adminAuth.updateUser(userId, { displayName: session.user.fullName }).catch(() => undefined)
    await deleteExistingFile(profileImage.attachmentStoragePath).catch(() => undefined)

    return NextResponse.json({ message: 'Profile image deleted successfully.' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ data: null, message: 'Unable to delete profile image.' }, { status: 500 })
  }
}
