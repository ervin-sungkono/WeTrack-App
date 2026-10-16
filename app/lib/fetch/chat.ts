import type { ApiEnvelope } from "@/app/lib/fetch/http";
import { apiFetch, jsonBody } from "@/app/lib/fetch/http";

export function sendChat({ taskId, content }: { taskId: string; content: string }): Promise<ApiEnvelope<null>> {
  return apiFetch(`/api/task/${encodeURIComponent(taskId)}/chat`, {
    method: "POST",
    body: jsonBody({ content }),
  });
}
