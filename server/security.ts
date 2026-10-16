import type { AuthUser, FirestoreTimestamp, ProfileDetails, ProfileImage, PublicProfile } from '@/app/types/auth'

export type RegistrationInput = {
  fullName: string
  email: string
  password: string
}

export type LoginInput = {
  email: string
  password: string
}

export type ProfileUpdateInput = Pick<ProfileDetails, 'fullName' | 'description' | 'jobPosition' | 'location'>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,1024}$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function optionalText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  return normalized.length <= maxLength ? normalized : null
}

export function isValidPassword(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 1024 && passwordPattern.test(value)
}

export function parseRegistrationInput(value: unknown): RegistrationInput | null {
  if (!isRecord(value)) return null
  const fullName = optionalText(value.fullName, 50)
  const email = optionalText(value.email, 254)?.toLowerCase() ?? null
  if (!fullName || fullName.length < 3 || !email || !emailPattern.test(email) || !isValidPassword(value.password)) return null
  return { fullName, email, password: value.password }
}

export function parseLoginInput(value: unknown): LoginInput | null {
  if (!isRecord(value) || typeof value.email !== 'string' || typeof value.password !== 'string') return null
  const email = value.email.trim().toLowerCase()
  if (email.length > 254 || !emailPattern.test(email) || value.password.length === 0 || value.password.length > 1024) return null
  return { email, password: value.password }
}

export function parseProfileUpdate(value: unknown): ProfileUpdateInput | null {
  if (!isRecord(value)) return null
  const fullName = optionalText(value.fullName, 50)
  const description = optionalText(value.description, 256)
  const jobPosition = optionalText(value.jobPosition, 50)
  const location = optionalText(value.location, 50)
  if (!fullName || fullName.length < 3 || description === null || jobPosition === null || location === null) return null
  return { fullName, description, jobPosition, location }
}

export function sanitizeProfileImage(value: unknown): ProfileImage {
  if (!isRecord(value)) return null
  const attachmentStoragePath = optionalText(value.attachmentStoragePath, 2048)
  const originalFileName = optionalText(value.originalFileName, 255)
  if (!attachmentStoragePath || !originalFileName || !isFirebaseStorageDownloadUrl(attachmentStoragePath)) return null
  return { attachmentStoragePath, originalFileName }
}

export function toPublicProfile(value: unknown): PublicProfile {
  const record = isRecord(value) ? value : {}
  const fullName = optionalText(record.fullName, 50) ?? ''
  return {
    fullName,
    profileImage: sanitizeProfileImage(record.profileImage),
  }
}

export function toProfileDetails(value: unknown): ProfileDetails {
  const record = isRecord(value) ? value : {}
  const description = optionalText(record.description, 256)
  const jobPosition = optionalText(record.jobPosition, 50)
  const location = optionalText(record.location, 50)
  const profileDetails: ProfileDetails = {
    ...toPublicProfile(record),
    description,
    jobPosition,
    location,
  }
  if (isFirestoreTimestamp(record.createdAt)) profileDetails.createdAt = record.createdAt
  return profileDetails
}

export function toAuthUser(input: {
  uid: string
  email: string
  fullName: unknown
  profileImage: unknown
  isVerified: boolean
}): AuthUser {
  return {
    uid: input.uid,
    email: input.email,
    fullName: optionalText(input.fullName, 50) ?? '',
    profileImage: sanitizeProfileImage(input.profileImage),
    isVerified: input.isVerified,
  }
}

export function sanitizeAuthUser(value: unknown): AuthUser | null {
  if (!isRecord(value)) return null
  if (typeof value.uid !== 'string' || typeof value.email !== 'string' || typeof value.isVerified !== 'boolean') return null
  return toAuthUser({
    uid: value.uid,
    email: value.email,
    fullName: value.fullName,
    profileImage: value.profileImage,
    isVerified: value.isVerified,
  })
}

export function projectMembershipDocumentId(projectId: string, userId: string): string {
  if (!projectId || projectId.includes('/') || !userId || userId.includes('/')) {
    throw new Error('Project and user IDs must be non-empty document-safe IDs')
  }
  return `${projectId}_${userId}`
}

export function isSameOriginMutation(input: {
  method: string
  origin: string | null
  secFetchSite: string | null
  requestOrigin: string
}): boolean {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(input.method.toUpperCase())) return true
  const fetchSite = input.secFetchSite?.toLowerCase()
  if (fetchSite && fetchSite !== 'same-origin') return false
  if (!input.origin) return true

  try {
    return new URL(input.origin).origin === input.requestOrigin
  } catch {
    return false
  }
}

function isFirestoreTimestamp(value: unknown): value is FirestoreTimestamp {
  if (!isRecord(value)) return false
  return typeof value.seconds === 'number'
    && Number.isInteger(value.seconds)
    && typeof value.nanoseconds === 'number'
    && Number.isInteger(value.nanoseconds)
}

function isFirebaseStorageDownloadUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:'
      && url.hostname === 'firebasestorage.googleapis.com'
      && /^\/v0\/b\/[^/]+\/o\/.+/.test(url.pathname)
      && url.searchParams.get('alt') === 'media'
      && Boolean(url.searchParams.get('token'))
  } catch {
    return false
  }
}
