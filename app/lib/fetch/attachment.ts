import type { ApiEnvelope } from "@/app/lib/fetch/http";
import { apiFetch } from "@/app/lib/fetch/http";

export function addAttachment({ taskId, attachment }: { taskId: string; attachment: File }): Promise<ApiEnvelope<null>> {
  const formData = new FormData();
  formData.append("attachment", attachment);
  return apiFetch(`/api/task/${encodeURIComponent(taskId)}/attachment`, {
    method: "POST",
    body: formData,
  });
}

export function deleteAttachment({ taskId, attachmentId }: { taskId: string; attachmentId: string }): Promise<ApiEnvelope<null>> {
  return apiFetch(`/api/task/${encodeURIComponent(taskId)}/attachment/${encodeURIComponent(attachmentId)}`, {
    method: "DELETE",
  });
}
