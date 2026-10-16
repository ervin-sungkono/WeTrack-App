export type ProjectRole = "Owner" | "Member" | "Viewer";

export type ProjectMembership = Record<string, unknown> & {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  status: "accepted";
};

export type ProjectMembershipCandidate = {
  id: string;
  data: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isDocumentSafeId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 128 && !value.includes("/");
}

function isProjectRole(value: unknown): value is ProjectRole {
  return value === "Owner" || value === "Member" || value === "Viewer";
}

/** Selects a membership only when both the project and membership are active. */
export function selectAcceptedProjectMembership({
  projectId,
  userId,
  projectData,
  memberships,
}: {
  projectId: string;
  userId: string;
  projectData: unknown;
  memberships: readonly ProjectMembershipCandidate[];
}): ProjectMembership | null {
  if (!isDocumentSafeId(projectId) || !isDocumentSafeId(userId) || !isRecord(projectData) || projectData.deletedAt != null) return null;

  for (const candidate of memberships) {
    const data = candidate.data;
    if (
      !isRecord(data) ||
      data.projectId !== projectId ||
      data.userId !== userId ||
      data.status !== "accepted" ||
      data.deletedAt != null ||
      !isProjectRole(data.role)
    ) {
      continue;
    }

    return {
      ...data,
      id: candidate.id,
      projectId,
      userId,
      role: data.role,
      status: "accepted",
    };
  }

  return null;
}

export function projectRoleIsAllowed(
  role: unknown,
  allowedRoles?: readonly ProjectRole[],
): role is ProjectRole {
  return isProjectRole(role) && (!allowedRoles || allowedRoles.includes(role));
}
