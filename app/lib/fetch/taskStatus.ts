import type { ApiEnvelope } from "@/app/lib/fetch/http";
import { apiFetch, encodeQuery, jsonBody } from "@/app/lib/fetch/http";
import type { EntityId, TaskStatus } from "@/app/types/domain";

export function getAllTaskStatus(projectId: EntityId): Promise<ApiEnvelope<TaskStatus[]>> {
  return apiFetch(`/api/task/status?projectId=${encodeQuery(projectId)}`);
}

export function createNewTaskStatus({ projectId, statusName }: { projectId: EntityId; statusName: string }): Promise<ApiEnvelope<TaskStatus>> {
  return apiFetch(`/api/task/status?projectId=${encodeQuery(projectId)}`, {
    method: "POST",
    body: jsonBody({ statusName }),
  });
}

export function updateTaskStatus({ statusId, statusName }: { statusId: EntityId; statusName: string }): Promise<ApiEnvelope<null>> {
  return apiFetch(`/api/task/status/${encodeURIComponent(statusId)}`, {
    method: "PUT",
    body: jsonBody({ statusName }),
  });
}

export function deleteTaskStatus({ statusId, projectId, newStatusId }: { statusId: EntityId; projectId: EntityId; newStatusId: EntityId }): Promise<ApiEnvelope<null>> {
  return apiFetch(`/api/task/status/${encodeURIComponent(statusId)}?projectId=${encodeQuery(projectId)}`, {
    method: "DELETE",
    body: jsonBody({ newStatusId }),
  });
}

export function reorderTaskStatus({ projectId, statusId, oldIndex, newIndex }: { projectId: EntityId; statusId: EntityId; oldIndex: number; newIndex: number }): Promise<ApiEnvelope<null>> | undefined {
  if (newIndex === oldIndex) return undefined;
  return apiFetch(`/api/task/status/${encodeURIComponent(statusId)}/transition?projectId=${encodeQuery(projectId)}`, {
    method: "POST",
    body: jsonBody({ oldIndex, newIndex }),
  });
}
