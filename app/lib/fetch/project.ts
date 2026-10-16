import type { ApiEnvelope } from "@/app/lib/fetch/http";
import { apiFetch, jsonBody, parseTagValues } from "@/app/lib/fetch/http";
import type { EntityId, Project, ProjectRole, TeamMember } from "@/app/types/domain";

export function getProjectByID(id: EntityId): Promise<ApiEnvelope<Project>> {
  return apiFetch(`/api/project/${encodeURIComponent(id)}`);
}

export function getRecentProjects(): Promise<ApiEnvelope<Project[]>> {
  return apiFetch("/api/project/recent");
}

export function getAllProject(): Promise<ApiEnvelope<Project[]>> {
  return apiFetch("/api/project", { next: { revalidate: 600, tags: ["projects"] } });
}

export function createNewProject({ projectName, key }: { projectName: string; key: string }): Promise<ApiEnvelope<Project>> {
  return apiFetch("/api/project", {
    method: "POST",
    body: jsonBody({ projectName, key }),
  });
}

export interface GeneratedTaskInput {
  taskName: string;
  description?: string;
  priority?: number;
  startDate?: string | null;
  dueDate?: string | null;
}

export function generateTask({ projectDescription }: { projectDescription: string }): Promise<ApiEnvelope<GeneratedTaskInput[]>> {
  return apiFetch("/api/project/generate-task", {
    method: "POST",
    body: jsonBody({ projectDescription: projectDescription.trim() }),
  });
}

export function getProjectTeam(id: EntityId): Promise<ApiEnvelope<TeamMember[]>> {
  return apiFetch(`/api/project/${encodeURIComponent(id)}/team`);
}

export function inviteMember({ projectId, teams, role }: { projectId: EntityId; teams?: string | null; role?: ProjectRole }): Promise<ApiEnvelope<null>> {
  return apiFetch(`/api/project/${encodeURIComponent(projectId)}/team`, {
    method: "POST",
    body: jsonBody({ teams: parseTagValues(teams), role }),
  });
}

export function updateRole({ projectId, teamId, role }: { projectId: EntityId; teamId: EntityId; role: ProjectRole }): Promise<ApiEnvelope<null>> {
  return apiFetch(`/api/project/${encodeURIComponent(projectId)}/team/${encodeURIComponent(teamId)}`, {
    method: "PUT",
    body: jsonBody({ role }),
  });
}

export function deleteMember({ projectId, teamId }: { projectId: EntityId; teamId: EntityId }): Promise<ApiEnvelope<null>> {
  return apiFetch(`/api/project/${encodeURIComponent(projectId)}/team/${encodeURIComponent(teamId)}`, { method: "DELETE" });
}

export function updateProject({ projectId, projectName, key, startStatus, endStatus }: {
  projectId: EntityId;
  projectName?: string;
  key?: string;
  startStatus?: EntityId;
  endStatus?: EntityId;
}): Promise<ApiEnvelope<Project>> {
  return apiFetch(`/api/project/${encodeURIComponent(projectId)}`, {
    method: "PUT",
    body: jsonBody({ projectName, key, startStatus, endStatus }),
  });
}

export function deleteProject({ id }: { id: EntityId }): Promise<ApiEnvelope<null>> {
  return apiFetch(`/api/project/${encodeURIComponent(id)}`, { method: "DELETE" });
}
