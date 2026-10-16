import { NextResponse } from "next/server";
import { addDoc, collection, getDocs, query, where } from "@/server/firestore";
import { db } from "@/server/db";
import { getAcceptedProjectMembership, getSessionUserId } from "@/server/authorization";
import { createHistory, createNotification } from "@/server/data/util";
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history";
import { readJsonObject } from "@/server/http";
import { parseBoundedText } from "@/server/task-validation";
import {
  asRecord,
  authorizeTask,
  TASK_READ_ROLES,
  TASK_WRITE_ROLES,
  taskErrorResponse,
  requiredPathId,
  type RouteContext,
} from "@/server/task-api";

type TaskParams = { taskId: string };

function mentionedUserIds(text: string): string[] {
  const matches = text.matchAll(/@\[[^\]]{1,100}\]\(([^)]+)\)/g);
  const ids = new Set<string>();
  for (const match of matches) {
    const id = match[1];
    if (id && id.length <= 128 && !id.includes("/")) ids.add(id);
  }
  return [...ids];
}

export async function GET(_request: Request, context: RouteContext<TaskParams>) {
  try {
    const userId = await getSessionUserId();
    const { taskId: rawTaskId } = await context.params;
    const taskId = requiredPathId(rawTaskId, "taskId");
    const task = await authorizeTask(taskId, userId, TASK_READ_ROLES);
    const commentSnapshot = await getDocs(query(collection(db, "comments"), where("taskId", "==", task.id)));
    const comments = commentSnapshot.docs
      .filter((comment) => {
        const data = asRecord(comment.data());
        return data.taskId === task.id && data.projectId === task.projectId && data.deletedAt == null;
      })
      .map((comment) => ({ id: comment.id, ...asRecord(comment.data()) }));

    return NextResponse.json({ data: comments, message: "Successfully get all available comments" });
  } catch (error) {
    return taskErrorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext<TaskParams>) {
  try {
    const userId = await getSessionUserId();
    const { taskId: rawTaskId } = await context.params;
    const taskId = requiredPathId(rawTaskId, "taskId");
    const task = await authorizeTask(taskId, userId, TASK_WRITE_ROLES);
    const body = await readJsonObject(request, 16 * 1024);
    const commentText = parseBoundedText(body.commentText, "commentText", 8000);

    const comment = await addDoc(collection(db, "comments"), {
      projectId: task.projectId,
      taskId: task.id,
      userId,
      commentText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    });
    const commentSnapshot = await comment.get();

    await createHistory({
      userId,
      taskId: task.id,
      projectId: task.projectId,
      eventType: getHistoryEventType.comment,
      action: getHistoryAction.create,
    });

    const taskCreatorId = typeof task.data.createdBy === "string" ? task.data.createdBy : null;
    if (taskCreatorId && taskCreatorId !== userId && await getAcceptedProjectMembership({ projectId: task.projectId, userId: taskCreatorId })) {
      await createNotification({
        userId: taskCreatorId,
        senderId: userId,
        taskId: task.id,
        projectId: task.projectId,
        type: "AddedComment",
      });
    }

    const mentionMemberships = await Promise.all(mentionedUserIds(commentText).map(async (mentionedId) => {
      if (mentionedId === userId) return null;
      return await getAcceptedProjectMembership({ projectId: task.projectId, userId: mentionedId }) ? mentionedId : null;
    }));
    await Promise.all([...new Set(mentionMemberships.filter((id): id is string => id !== null))].map((mentionedId) => createNotification({
      userId: mentionedId,
      senderId: userId,
      taskId: task.id,
      projectId: task.projectId,
      type: "Mention",
    })));

    return NextResponse.json({
      data: { id: comment.id, ...(commentSnapshot.data() ?? {}) },
      message: "Successfully create new comment",
    }, { status: 200 });
  } catch (error) {
    return taskErrorResponse(error);
  }
}
