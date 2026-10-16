import 'server-only'

import { FieldValue, type WriteBatch } from 'firebase-admin/firestore'
import type { AuthUser, PublicProfile } from '@/app/types/auth'
import { adminAuth, db } from './db'
import { FirebaseCredentialError, verifyFirebasePassword } from './firebase-auth'
import { projectMembershipDocumentId, toAuthUser, toPublicProfile } from './security'
import type { CompatTransaction } from './firestore'

export { projectMembershipDocumentId }

export type ProjectMembership = {
  projectId: string
  userId: string
  role: string
}

export type ActiveProjectMembership = Pick<ProjectMembership, 'projectId' | 'role'>

function setProjectMembershipIndexInBatch(batch: WriteBatch, membership: ProjectMembership): void {
  const reference = db.collection('projectMembers').doc(projectMembershipDocumentId(membership.projectId, membership.userId))
  batch.set(reference, {
    projectId: membership.projectId,
    userId: membership.userId,
    role: membership.role,
    updatedAt: FieldValue.serverTimestamp(),
  })
}

export function setProjectMembershipInBatch(batch: WriteBatch, membership: ProjectMembership): void {
  setProjectMembershipIndexInBatch(batch, membership)
  batch.set(db.collection('users').doc(membership.userId), {
    activeProjectIds: FieldValue.arrayUnion(membership.projectId),
  }, { merge: true })
}

export function setProjectMembershipInTransaction(transaction: CompatTransaction, membership: ProjectMembership): void {
  const reference = db.collection('projectMembers').doc(projectMembershipDocumentId(membership.projectId, membership.userId))
  transaction.set(reference, {
    projectId: membership.projectId,
    userId: membership.userId,
    role: membership.role,
    updatedAt: FieldValue.serverTimestamp(),
  })
  transaction.set(db.collection('users').doc(membership.userId), {
    activeProjectIds: FieldValue.arrayUnion(membership.projectId),
  }, { merge: true })
}

export function deleteProjectMembershipInBatch(batch: WriteBatch, projectId: string, userId: string): void {
  batch.delete(db.collection('projectMembers').doc(projectMembershipDocumentId(projectId, userId)))
  batch.set(db.collection('users').doc(userId), {
    activeProjectIds: FieldValue.arrayRemove(projectId),
  }, { merge: true })
}

export async function setProjectMembership(membership: ProjectMembership): Promise<void> {
  const batch = db.batch()
  setProjectMembershipInBatch(batch, membership)
  await batch.commit()
}

export async function deleteProjectMembership(projectId: string, userId: string): Promise<void> {
  const batch = db.batch()
  deleteProjectMembershipInBatch(batch, projectId, userId)
  await batch.commit()
}

export async function syncPublicProfile(userId: string): Promise<PublicProfile | null> {
  const userSnapshot = await db.collection('users').doc(userId).get()
  if (!userSnapshot.exists) return null

  const user = userSnapshot.data()
  if (!user || user.deletedAt != null) return null

  const publicProfile = toPublicProfile(user)
  await db.collection('publicProfiles').doc(userId).set(publicProfile)
  return publicProfile
}

export async function syncFirebaseMemberships(userId: string): Promise<ActiveProjectMembership[]> {
  const [teamSnapshot, existingIndexSnapshot] = await Promise.all([
    db.collection('teams').where('userId', '==', userId).get(),
    db.collection('projectMembers').where('userId', '==', userId).get(),
  ])

  const activeTeams = teamSnapshot.docs.filter((team) => {
    const data = team.data()
    return data.status === 'accepted' && data.deletedAt == null && typeof data.projectId === 'string'
  })

  const projectChecks = await Promise.all(activeTeams.map(async (team) => {
    const data = team.data()
    const projectId = data.projectId as string
    if (data.role !== 'Owner' && data.role !== 'Member' && data.role !== 'Viewer') return null
    const project = await db.collection('projects').doc(projectId).get()
    if (!project.exists || project.data()?.deletedAt != null) return null
    return { projectId, role: data.role }
  }))

  const membershipsByProject = new Map<string, ActiveProjectMembership>()
  for (const membership of projectChecks) {
    if (membership) membershipsByProject.set(membership.projectId, membership)
  }

  const activeMemberships = [...membershipsByProject.values()]
  const activeIds = new Set(activeMemberships.map(({ projectId }) => projectMembershipDocumentId(projectId, userId)))
  const staleIds = existingIndexSnapshot.docs
    .filter((document) => !activeIds.has(document.id))
    .map((document) => document.id)

  for (let offset = 0; offset < activeMemberships.length; offset += 400) {
    const chunk = activeMemberships.slice(offset, offset + 400)
    const batch = db.batch()
    for (const membership of chunk) {
      const indexId = projectMembershipDocumentId(membership.projectId, userId)
      const existing = existingIndexSnapshot.docs.find((document) => document.id === indexId)?.data()
      if (existing?.role !== membership.role || existing?.projectId !== membership.projectId) {
        setProjectMembershipIndexInBatch(batch, { ...membership, userId })
      }
    }
    if (chunk.some((membership) => {
      const id = projectMembershipDocumentId(membership.projectId, userId)
      const existing = existingIndexSnapshot.docs.find((document) => document.id === id)?.data()
      return existing?.role !== membership.role || existing?.projectId !== membership.projectId
    })) {
      await batch.commit()
    }
  }

  for (let offset = 0; offset < staleIds.length; offset += 400) {
    const batch = db.batch()
    for (const indexId of staleIds.slice(offset, offset + 400)) {
      batch.delete(db.collection('projectMembers').doc(indexId))
    }
    await batch.commit()
  }

  await db.collection('users').doc(userId).set({
    activeProjectIds: activeMemberships.map(({ projectId }) => projectId),
  }, { merge: true })

  return activeMemberships
}

export async function getActiveAuthProfile(userId: string): Promise<{
  uid: string
  email: string
  emailVerified: boolean
  profile: PublicProfile
} | null> {
  let authUser
  try {
    authUser = await adminAuth.getUser(userId)
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/user-not-found') return null
    throw error
  }

  const [profileSnapshot, privateUserSnapshot] = await Promise.all([
    db.collection('publicProfiles').doc(userId).get(),
    db.collection('users').doc(userId).get(),
  ])

  if (authUser.disabled || !privateUserSnapshot.exists || typeof authUser.email !== 'string') return null
  const privateUser = privateUserSnapshot.data()
  if (!privateUser || privateUser.deletedAt != null) return null

  const profile = profileSnapshot.exists
    ? toPublicProfile(profileSnapshot.data())
    : await syncPublicProfile(userId)
  if (!profile) return null

  return {
    uid: authUser.uid,
    email: authUser.email,
    emailVerified: authUser.emailVerified,
    profile,
  }
}

export async function authenticateFirebaseUser(email: string, password: string): Promise<AuthUser> {
  const identity = await verifyFirebasePassword(email, password)

  if (!identity.emailVerified) throw new FirebaseCredentialError()
  const profile = await getActiveAuthProfile(identity.uid)
  if (!profile || !profile.emailVerified) throw new FirebaseCredentialError()

  return toAuthUser({
    uid: profile.uid,
    email: profile.email,
    fullName: profile.profile.fullName,
    profileImage: profile.profile.profileImage,
    isVerified: profile.emailVerified,
  })
}
