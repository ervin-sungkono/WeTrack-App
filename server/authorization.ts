import { collection, doc, getDoc, getDocs, query, where } from "@/server/firestore";
import { db } from "@/server/db";
import { getUserSession } from "@/app/lib/session";
import {
  isDocumentSafeId,
  projectRoleIsAllowed,
  selectAcceptedProjectMembership,
  type ProjectMembership,
  type ProjectRole,
} from "@/server/project-access-policy";

export type { ProjectMembership, ProjectRole } from "@/server/project-access-policy";
export type SessionUser = { uid: string; email?: string; fullName?: string; profileImage?: unknown };

export class AuthorizationError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AuthorizationError";
    this.status = status;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export async function getSessionUser(): Promise<SessionUser> {
  const session = await getUserSession();
  const sessionData: unknown = session;
  const sessionUser = isRecord(sessionData) ? sessionData.user : null;
  const uid = isRecord(sessionUser) ? sessionUser.uid : null;
  if (typeof uid !== "string" || uid.length === 0) {
    throw new AuthorizationError(401, "Unauthorized");
  }
  return {
    uid,
    ...(isRecord(sessionUser) && typeof sessionUser.email === "string" ? { email: sessionUser.email } : {}),
    ...(isRecord(sessionUser) && typeof sessionUser.fullName === "string" ? { fullName: sessionUser.fullName } : {}),
    ...(isRecord(sessionUser) ? { profileImage: sessionUser.profileImage } : {}),
  };
}

export async function getSessionUserId(): Promise<string> {
  return (await getSessionUser()).uid;
}

/** Returns only an accepted, non-deleted membership in an active project. */
export async function getAcceptedProjectMembership({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}): Promise<ProjectMembership | null> {
  if (!isDocumentSafeId(projectId) || !isDocumentSafeId(userId)) return null;

  const projectSnap = await getDoc(doc(db, "projects", projectId));
  if (!projectSnap.exists()) return null;
  const projectData = projectSnap.data();
  if (!isRecord(projectData) || projectData.deletedAt != null) return null;

  const membershipQuery = query(
    collection(db, "teams"),
    where("projectId", "==", projectId),
    where("userId", "==", userId),
    where("status", "==", "accepted"),
  );
  const memberships = await getDocs(membershipQuery);
  return selectAcceptedProjectMembership({
    projectId,
    userId,
    projectData,
    memberships: memberships.docs.map((item) => ({ id: item.id, data: item.data() })),
  });
}

/**
 * Requires an authenticated user and accepted membership. The project is
 * checked here as well so stale team rows cannot authorize deleted projects.
 */
export async function requireProjectMembership({
  projectId,
  userId,
  allowedRoles,
}: {
  projectId: string;
  userId: string;
  allowedRoles?: readonly ProjectRole[];
}): Promise<ProjectMembership> {
  if (!isDocumentSafeId(projectId)) throw new AuthorizationError(404, "Project not found");
  if (!isDocumentSafeId(userId)) throw new AuthorizationError(401, "Unauthorized");

  const projectSnap = await getDoc(doc(db, "projects", projectId));
  if (!projectSnap.exists()) throw new AuthorizationError(404, "Project not found");
  const projectData: unknown = projectSnap.data();
  if (!isRecord(projectData) || projectData.deletedAt != null) {
    throw new AuthorizationError(404, "Project not found");
  }

  const membershipQuery = query(
    collection(db, "teams"),
    where("projectId", "==", projectId),
    where("userId", "==", userId),
    where("status", "==", "accepted"),
  );
  const memberships = await getDocs(membershipQuery);
  const membership = selectAcceptedProjectMembership({
    projectId,
    userId,
    projectData,
    memberships: memberships.docs.map((item) => ({ id: item.id, data: item.data() })),
  });
  if (!membership) throw new AuthorizationError(401, "Unauthorized");
  if (!projectRoleIsAllowed(membership.role, allowedRoles)) {
    throw new AuthorizationError(403, "Forbidden");
  }
  return membership;
}

export function isRecordValue(value: unknown): value is Record<string, unknown> {
  return isRecord(value);
}
