export type FirestoreTimestamp = { seconds: number; nanoseconds: number }

export type ProfileImage = {
  attachmentStoragePath: string
  originalFileName: string
} | null

export type AuthUser = {
  uid: string
  email: string
  fullName: string
  profileImage: ProfileImage
  isVerified: boolean
}

/** Fields kept in the directly readable collaborator profile mirror. */
export type PublicProfile = {
  fullName: string
  profileImage: ProfileImage
}

/** Profile details returned only from self or shared-project authorized APIs. */
export type ProfileDetails = PublicProfile & {
  description: string | null
  jobPosition: string | null
  location: string | null
  createdAt?: FirestoreTimestamp | null
}

export type UserProfile = ProfileDetails & {
  uid: string
  email: string
  deletedAt: FirestoreTimestamp | null
  updatedAt?: FirestoreTimestamp | null
}

export type AuthSessionUser = AuthUser
