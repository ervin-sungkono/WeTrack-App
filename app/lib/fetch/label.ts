import type { ApiEnvelope } from "@/app/lib/fetch/http";
import { apiFetch, jsonBody } from "@/app/lib/fetch/http";
import type { Label } from "@/app/types/domain";

export function getAllLabel({ projectId }: { projectId: string }): Promise<ApiEnvelope<Label[]>> {
  return apiFetch(`/api/project/${encodeURIComponent(projectId)}/label`);
}

export function addLabel({ content, backgroundColor, projectId }: { content: string; backgroundColor: string; projectId: string }): Promise<ApiEnvelope<null>> {
  return apiFetch(`/api/project/${encodeURIComponent(projectId)}/label`, {
    method: "POST",
    body: jsonBody({ content, backgroundColor }),
  });
}

export function updateLabel({ content, backgroundColor, projectId, labelId }: { content: string; backgroundColor: string; projectId: string; labelId: string }): Promise<ApiEnvelope<null>> {
  return apiFetch(`/api/project/${encodeURIComponent(projectId)}/label/${encodeURIComponent(labelId)}`, {
    method: "PUT",
    body: jsonBody({ content, backgroundColor }),
  });
}

export function deleteLabel({ projectId, labelId }: { projectId: string; labelId: string }): Promise<ApiEnvelope<null>> {
  return apiFetch(`/api/project/${encodeURIComponent(projectId)}/label/${encodeURIComponent(labelId)}`, {
    method: "DELETE",
  });
}
