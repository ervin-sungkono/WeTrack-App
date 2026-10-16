import { NextResponse } from "next/server";
import { deleteDoc, doc, getDoc, runTransaction, serverTimestamp } from "@/server/firestore";
import { db, getAdminBucket } from "@/server/db";
import { getSessionUserId } from "@/server/authorization";
import { createHistory } from "@/server/data/util";
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history";
import { parseTaskAttachmentObjectPath } from "@/server/attachment-storage-path";
import {
  asRecord,
  authorizeTask,
  deleteTaskAttachment,
  requiredPathId,
  TASK_READ_ROLES,
  TASK_WRITE_ROLES,
  taskErrorResponse,
  TaskApiError,
  type RouteContext,
} from "@/server/task-api";

type AttachmentParams = { taskId: string; attachmentId: string };

function safeFileName(value: unknown): string {
  if (typeof value !== "string") return "attachment";
  const name = value.normalize("NFKC").replace(/[\\/\r\n\u0000-\u001f\u007f]/g, "_").trim().slice(0, 180);
  return name || "attachment";
}

function contentDisposition(fileName: string): string {
  const fallback = fileName.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  const encoded = encodeURIComponent(fileName).replace(/['()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

function isStorageNotFound(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) return false;
  const code = error.code;
  return code === 404 || code === "404" || code === "storage/object-not-found";
}

export async function GET(_request: Request, context: RouteContext<AttachmentParams>) {
  try {
    const userId = await getSessionUserId();
    const { taskId: rawTaskId, attachmentId: rawAttachmentId } = await context.params;
    const taskId = requiredPathId(rawTaskId, "taskId");
    const attachmentId = requiredPathId(rawAttachmentId, "attachmentId");
    const task = await authorizeTask(taskId, userId, TASK_READ_ROLES);
    const attachmentSnapshot = await getDoc(doc(db, "attachments", attachmentId));
    if (!attachmentSnapshot.exists()) throw new TaskApiError(404, "Attachment not found");

    const attachment = asRecord(attachmentSnapshot.data());
    if (attachment.taskId !== task.id || attachment.projectId !== task.projectId || attachment.deletedAt != null) {
      throw new TaskApiError(404, "Attachment not found");
    }
    const bucket = getAdminBucket();
    const objectName = parseTaskAttachmentObjectPath(attachment.attachmentStoragePath, {
      bucketName: bucket.name,
      projectId: task.projectId,
      taskId: task.id,
    });
    if (!objectName) throw new TaskApiError(404, "Attachment not found");

    let contents: Buffer;
    try {
      [contents] = await bucket.file(objectName).download();
    } catch (error) {
      if (isStorageNotFound(error)) throw new TaskApiError(404, "Attachment not found");
      throw error;
    }

    return new NextResponse(Uint8Array.from(contents), {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Disposition": contentDisposition(safeFileName(attachment.originalFileName)),
        "Content-Length": String(contents.byteLength),
        "Content-Type": "application/octet-stream",
        "Pragma": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return taskErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext<AttachmentParams>) {
  try {
    const userId = await getSessionUserId();
    const { taskId: rawTaskId, attachmentId: rawAttachmentId } = await context.params;
    const taskId = requiredPathId(rawTaskId, "taskId");
    const attachmentId = requiredPathId(rawAttachmentId, "attachmentId");
    const task = await authorizeTask(taskId, userId, TASK_WRITE_ROLES);
    const attachmentRef = doc(db, "attachments", attachmentId);
    const attachmentSnapshot = await getDoc(attachmentRef);
    if (!attachmentSnapshot.exists()) throw new TaskApiError(404, "Attachment not found");

    const attachment = asRecord(attachmentSnapshot.data());
    if (attachment.taskId !== task.id || attachment.projectId !== task.projectId || attachment.deletedAt != null) {
      throw new TaskApiError(404, "Attachment not found");
    }
    if (typeof attachment.attachmentStoragePath !== "string") {
      throw new TaskApiError(404, "Attachment not found");
    }

    await deleteTaskAttachment(attachment.attachmentStoragePath, task.projectId, task.id);
    await deleteDoc(attachmentRef);
    const counterRef = doc(db, "attachmentCounters", task.id);
    await runTransaction(db, async (transaction) => {
      const counter = await transaction.get(counterRef);
      const counterData = counter.exists() ? asRecord(counter.data()) : {};
      const count = typeof counterData.count === "number" && Number.isSafeInteger(counterData.count)
        ? counterData.count
        : 1;
      transaction.set(counterRef, { count: Math.max(0, count - 1), updatedAt: serverTimestamp() });
    });

    await createHistory({
      userId,
      taskId: task.id,
      projectId: task.projectId,
      action: getHistoryAction.delete,
      eventType: getHistoryEventType.attachment,
      deletedValue: attachment.originalFileName,
    });

    return NextResponse.json({ success: true, message: "Attachment deleted successfully" });
  } catch (error) {
    return taskErrorResponse(error);
  }
}
