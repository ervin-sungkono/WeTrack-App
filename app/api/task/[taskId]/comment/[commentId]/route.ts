import { NextResponse } from "next/server";
import { deleteDoc, doc, getDoc } from "@/server/firestore";
import { db } from "@/server/db";
import { getSessionUserId } from "@/server/authorization";
import { createHistory } from "@/server/data/util";
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history";
import {
  asRecord,
  authorizeTask,
  requiredPathId,
  TASK_WRITE_ROLES,
  taskErrorResponse,
  TaskApiError,
  type RouteContext,
} from "@/server/task-api";

type CommentParams = { taskId: string; commentId: string };

export async function DELETE(_request: Request, context: RouteContext<CommentParams>) {
  try {
    const userId = await getSessionUserId();
    const { taskId: rawTaskId, commentId: rawCommentId } = await context.params;
    const taskId = requiredPathId(rawTaskId, "taskId");
    const commentId = requiredPathId(rawCommentId, "commentId");
    const task = await authorizeTask(taskId, userId, TASK_WRITE_ROLES);
    const commentSnapshot = await getDoc(doc(db, "comments", commentId));
    if (!commentSnapshot.exists()) throw new TaskApiError(404, "Comment not found");

    const comment = asRecord(commentSnapshot.data());
    if (comment.taskId !== task.id || comment.projectId !== task.projectId || comment.deletedAt != null) {
      throw new TaskApiError(404, "Comment not found");
    }
    if (comment.userId !== userId) throw new TaskApiError(403, "Only the author can delete this comment");

    await deleteDoc(doc(db, "comments", commentId));
    await createHistory({
      userId,
      taskId: task.id,
      projectId: task.projectId,
      eventType: getHistoryEventType.comment,
      action: getHistoryAction.delete,
    });

    return NextResponse.json({ success: true, message: "Comment successfully deleted" });
  } catch (error) {
    return taskErrorResponse(error);
  }
}
