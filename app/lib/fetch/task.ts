import type { ApiEnvelope } from "@/app/lib/fetch/http";
import { apiFetch, encodeQuery, jsonBody, parseTagValues } from "@/app/lib/fetch/http";
import type { EntityId, TaskType, TaskView } from "@/app/types/domain";

export interface CreateTaskInput {
  taskName: string;
  projectId: EntityId;
  statusId: EntityId;
  type?: TaskType;
  startDate?: string | null;
  dueDate?: string | null;
  priority?: number | null;
  description?: string;
  assignedTo?: EntityId | null;
  labels?: string | null;
  parentId?: EntityId | null;
}

export interface UpdateTaskInput {
  taskId: EntityId;
  taskName?: string;
  startDate?: string | null;
  dueDate?: string | null;
  priority?: number | null;
  description?: string | null;
  assignedTo?: EntityId | null;
  labels?: string | null;
  parentId?: EntityId | null;
}

export function getTaskById(taskId: EntityId): Promise<ApiEnvelope<TaskView>> {
  return apiFetch(`/api/task/${encodeURIComponent(taskId)}`);
}

export function getAllTask(projectId: EntityId): Promise<ApiEnvelope<TaskView[]>> {
  return apiFetch(`/api/task?projectId=${encodeQuery(projectId)}`);
}

export function createNewTask({
  taskName,
  type = "Task",
  startDate,
  dueDate,
  priority,
  description = "",
  projectId,
  statusId,
  assignedTo,
  labels,
  parentId,
}: CreateTaskInput): Promise<ApiEnvelope<TaskView>> {
  return apiFetch("/api/task", {
    method: "POST",
    body: jsonBody({
      projectId,
      type,
      startDate,
      dueDate,
      priority,
      taskName,
      description,
      statusId,
      assignedTo,
      labels: parseTagValues(labels),
      parentId,
    }),
  });
}

export function reorderTask({
  taskId,
  statusId,
  newStatusId,
  oldIndex,
  newIndex,
}: {
  taskId: EntityId;
  statusId: EntityId;
  newStatusId: EntityId;
  oldIndex: number;
  newIndex: number;
}): Promise<ApiEnvelope<null>> | undefined {
  if (statusId === newStatusId && newIndex === oldIndex) return undefined;
  return apiFetch(`/api/task/${encodeURIComponent(taskId)}/transition`, {
    method: "POST",
    body: jsonBody({ newStatusId, oldIndex, newIndex }),
  });
}

export function updateTask({
  taskId,
  taskName,
  startDate,
  dueDate,
  priority,
  description,
  assignedTo,
  labels,
  parentId,
}: UpdateTaskInput): Promise<ApiEnvelope<TaskView>> {
  return apiFetch(`/api/task/${encodeURIComponent(taskId)}`, {
    method: "PUT",
    body: jsonBody({
      startDate,
      dueDate,
      priority,
      taskName,
      description,
      assignedTo,
      labels: labels === undefined ? undefined : parseTagValues(labels),
      parentId,
    }),
  });
}

export function deleteTask({ taskId }: { taskId: EntityId }): Promise<ApiEnvelope<null>> {
  return apiFetch(`/api/task/${encodeURIComponent(taskId)}`, { method: "DELETE" });
}
