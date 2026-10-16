import type { ApiEnvelope } from "@/app/lib/fetch/http";
import { apiFetch, jsonBody, parseTagValues } from "@/app/lib/fetch/http";
import type { EntityId, ProjectRole, TeamMember } from "@/app/types/domain";

export function validateTeamMember({ projectId, teamId }: { projectId: EntityId; teamId: EntityId }): Promise<ApiEnvelope<null>> {
  return apiFetch(`/api/project/${encodeURIComponent(projectId)}/team/${encodeURIComponent(teamId)}`);
}

export function getAllTeamMember({ projectId, excludeViewer = false }: { projectId: EntityId; excludeViewer?: boolean }): Promise<ApiEnvelope<TeamMember[]>> {
  return apiFetch(`/api/project/${encodeURIComponent(projectId)}/team?excludeViewer=${excludeViewer}`);
}

export function addTeam({ teams, projectId }: { teams?: string | null; projectId: EntityId }): Promise<ApiEnvelope<null>> | undefined {
  const teamList = parseTagValues(teams);
  if (!teamList) return undefined;
  return apiFetch(`/api/project/${encodeURIComponent(projectId)}/team`, {
    method: "POST",
    body: jsonBody({ teams: teamList }),
  });
}

export function updateRole({ role, projectId, teamId }: { role: ProjectRole; projectId: EntityId; teamId: EntityId }): Promise<ApiEnvelope<null>> {
  return apiFetch(`/api/project/${encodeURIComponent(projectId)}/team/${encodeURIComponent(teamId)}`, {
    method: "PUT",
    body: jsonBody({ role }),
  });
}

export function deleteTeamMember({ projectId, teamId }: { projectId: EntityId; teamId: EntityId }): Promise<ApiEnvelope<null>> {
  return apiFetch(`/api/project/${encodeURIComponent(projectId)}/team/${encodeURIComponent(teamId)}`, { method: "DELETE" });
}
