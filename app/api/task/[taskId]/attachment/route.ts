import { NextResponse } from "next/server";
import { addDoc, collection, doc, getDocs, query, runTransaction, serverTimestamp, where } from "@/server/firestore";
import { db } from "@/server/db";
import { getSessionUserId } from "@/server/authorization";
import { readFormData } from "@/server/http";
import { createHistory } from "@/server/data/util";
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history";
import {
  asRecord,
  authorizeTask,
  deleteTaskAttachment,
  TASK_READ_ROLES,
  TASK_WRITE_ROLES,
  taskErrorResponse,
  TaskApiError,
  uploadTaskAttachment,
  validateTaskAttachment,
  type RouteContext,
} from "@/server/task-api";

type TaskParams = { taskId: string };

export async function GET(_request: Request, context: RouteContext<TaskParams>) {
  try {
    const userId = await getSessionUserId();
    const { taskId: rawTaskId } = await context.params;
    const task = await authorizeTask(rawTaskId, userId, TASK_READ_ROLES);
    const attachments = await getDocs(query(collection(db, "attachments"), where("taskId", "==", task.id)));
    const rows = attachments.docs
      .filter((attachment) => {
        const data = asRecord(attachment.data());
        return data.taskId === task.id && data.projectId === task.projectId && data.deletedAt == null;
      })
      .map((attachment) => ({ id: attachment.id, ...asRecord(attachment.data()) }));

    return NextResponse.json({ data: rows, message: "Successfully get all attachments" });
  } catch (error) {
    return taskErrorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext<TaskParams>) {
  try {
    const userId = await getSessionUserId();
    const { taskId: rawTaskId } = await context.params;
    const task = await authorizeTask(rawTaskId, userId, TASK_WRITE_ROLES);

    const formData = await readFormData(request, 2_500 * 1024);
    const attachmentValue = formData.get("attachment");
    if (!(attachmentValue instanceof File)) throw new TaskApiError(400, "Attachment is required");
    const originalFileName = validateTaskAttachment(attachmentValue);

    const existingAttachments = await getDocs(query(collection(db, "attachments"), where("taskId", "==", task.id)));
    const activeCount = existingAttachments.docs.filter((item) => {
      const data = asRecord(item.data());
      return data.taskId === task.id && data.projectId === task.projectId && data.deletedAt == null;
    }).length;
    if (activeCount >= 10) throw new TaskApiError(400, "The task already has 10 attachments");

    const counterRef = doc(db, "attachmentCounters", task.id);
    await runTransaction(db, async (transaction) => {
      const counter = await transaction.get(counterRef);
      const counterData = counter.exists() ? asRecord(counter.data()) : {};
      const counterCount = typeof counterData.count === "number" && Number.isSafeInteger(counterData.count)
        ? counterData.count
        : 0;
      const reservedCount = Math.max(counterCount, activeCount);
      if (reservedCount >= 10) throw new TaskApiError(400, "The task already has 10 attachments");
      transaction.set(counterRef, { count: reservedCount + 1, updatedAt: serverTimestamp() });
    });

    let storageUrl: string | null = null;
    try {
      storageUrl = await uploadTaskAttachment(attachmentValue, task.projectId, task.id, originalFileName);
      await addDoc(collection(db, "attachments"), {
        projectId: task.projectId,
        taskId: task.id,
        originalFileName,
        attachmentStoragePath: storageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deletedAt: null,
      });
    } catch (error) {
      if (storageUrl) await deleteTaskAttachment(storageUrl, task.projectId, task.id).catch((cleanupError: unknown) => {
        console.error("Failed to clean up an incomplete attachment upload", cleanupError);
      });
      await runTransaction(db, async (transaction) => {
        const counter = await transaction.get(counterRef);
        const current = counter.exists() ? asRecord(counter.data()) : {};
        const count = typeof current.count === "number" && Number.isSafeInteger(current.count) ? current.count : 1;
        transaction.set(counterRef, { count: Math.max(0, count - 1), updatedAt: serverTimestamp() });
      });
      throw error;
    }

    await createHistory({
      userId,
      taskId: task.id,
      projectId: task.projectId,
      action: getHistoryAction.create,
      eventType: getHistoryEventType.attachment,
    });

    return NextResponse.json({ success: true, message: "Files uploaded successfully" });
  } catch (error) {
    return taskErrorResponse(error);
  }
}
