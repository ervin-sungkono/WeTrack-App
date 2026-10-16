import type { ApiEnvelope } from "@/app/lib/fetch/http";
import { apiFetch, jsonBody } from "@/app/lib/fetch/http";
import type { Comment } from "@/app/types/domain";

export function addComment({ text, taskId }: { text: string; taskId: string }): Promise<ApiEnvelope<Comment>> {
  return apiFetch(`/api/task/${encodeURIComponent(taskId)}/comment`, {
    method: "POST",
    body: jsonBody({ commentText: text }),
  });
}

export function deleteComment({ taskId, commentId }: { taskId: string; commentId: string }): Promise<ApiEnvelope<null>> {
  return apiFetch(`/api/task/${encodeURIComponent(taskId)}/comment/${encodeURIComponent(commentId)}`, {
    method: "DELETE",
  });
}
