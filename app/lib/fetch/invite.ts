import type { ApiEnvelope } from "@/app/lib/fetch/http";
import { apiFetch, jsonBody } from "@/app/lib/fetch/http";

export function acceptInvite({ projectId, teamId }: { projectId: string; teamId: string }): Promise<ApiEnvelope<null>> {
  return apiFetch(`/api/project/${encodeURIComponent(projectId)}/invite/accept`, {
    method: "POST",
    body: jsonBody({ teamId }),
  });
}

export function rejectInvite({ projectId, teamId }: { projectId: string; teamId: string }): Promise<ApiEnvelope<null>> {
  return apiFetch(`/api/project/${encodeURIComponent(projectId)}/invite/reject`, {
    method: "POST",
    body: jsonBody({ teamId }),
  });
}
