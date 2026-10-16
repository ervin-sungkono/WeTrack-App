import "server-only";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { collection, deleteDoc, doc, getDoc, getDocs, query, where } from "@/server/firestore";
import { db, getAdminBucket } from "@/server/db";
import { getAcceptedProjectMembership, requireProjectMembership, type ProjectRole } from "@/server/authorization";
import { genericErrorMessage, genericErrorStatus } from "@/server/http";
import { TaskValidationError, requiredId } from "@/server/task-validation";
import type { UserSummary } from "@/app/types/domain";
import { QuotaExceededError } from "@/server/quota-policy";
import { parseTaskAttachmentObjectPath } from "@/server/attachment-storage-path";

export type RouteContext<Params extends Record<string, string>> = {
  params: Promise<Params>;
};

export type DataRecord = Record<string, unknown>;

export type AuthorizedTask = {
  id: string;
  data: DataRecord;
  projectId: string;
  role: string;
};

export const TASK_READ_ROLES = ["Owner", "Member", "Viewer"] as const;
export const TASK_WRITE_ROLES = ["Owner", "Member"] as const;
export const PROJECT_ADMIN_ROLES = ["Owner"] as const;

export class TaskApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "TaskApiError";
  }
}

export function asRecord(value: unknown): DataRecord {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value as DataRecord;
  }
  return {};
}

export function isDocumentSafeId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 128 && !value.includes("/");
}

/** Returns only user fields task APIs intentionally expose. */
export function projectUserSummary(userId: string, value: unknown): UserSummary {
  const user = asRecord(value);
  const summary: UserSummary = { id: userId };
  if (typeof user.fullName === "string") summary.fullName = user.fullName;
  if (typeof user.profileImage === "string" || user.profileImage === null) {
    summary.profileImage = user.profileImage;
  } else {
    const profileImage = asRecord(user.profileImage);
    const storagePath = profileImage.attachmentStoragePath;
    const fileName = profileImage.originalFileName;
    if (typeof storagePath === "string" && typeof fileName === "string") {
      summary.profileImage = { attachmentStoragePath: storagePath, originalFileName: fileName };
    }
  }
  return summary;
}

export function requiredPathId(value: unknown, field: string): string {
  try {
    return requiredId(value, field);
  } catch {
    throw new TaskApiError(404, "Resource not found");
  }
}

export function routeProjectId(request: Request): string | null {
  const value = new URL(request.url).searchParams.get("projectId");
  if (!value) return null;
  return requiredId(value, "projectId");
}

export async function authorizeTask(
  taskId: string,
  userId: string,
  allowedRoles: readonly ProjectRole[] = TASK_READ_ROLES,
): Promise<AuthorizedTask> {
  const taskSnapshot = await getDoc(doc(db, "tasks", taskId));
  if (!taskSnapshot.exists()) throw new TaskApiError(404, "Task not found");

  const data = asRecord(taskSnapshot.data());
  const projectId = typeof data.projectId === "string" ? data.projectId : "";
  if (!isDocumentSafeId(projectId) || data.deletedAt != null) throw new TaskApiError(404, "Task not found");

  const membership = await requireProjectMembership({ projectId, userId, allowedRoles });
  return {
    id: taskSnapshot.id,
    data,
    projectId,
    role: membership.role,
  };
}

export async function requireTaskStatus(statusId: string, projectId: string): Promise<{ id: string; data: DataRecord }> {
  if (!isDocumentSafeId(statusId) || !isDocumentSafeId(projectId)) throw new TaskApiError(404, "Task status not found");
  const statusSnapshot = await getDoc(doc(db, "taskStatuses", statusId));
  if (!statusSnapshot.exists()) throw new TaskApiError(404, "Task status not found");
  const data = asRecord(statusSnapshot.data());
  if (data.projectId !== projectId || data.deletedAt != null) {
    throw new TaskApiError(404, "Task status not found");
  }
  return { id: statusSnapshot.id, data };
}

export async function requireProjectLabel(labelId: string, projectId: string): Promise<DataRecord> {
  if (!isDocumentSafeId(labelId) || !isDocumentSafeId(projectId)) {
    throw new TaskApiError(400, "A label is not available in this project");
  }
  const labelSnapshot = await getDoc(doc(db, "labels", labelId));
  if (!labelSnapshot.exists()) throw new TaskApiError(400, "A label is not available in this project");
  const data = asRecord(labelSnapshot.data());
  if (data.projectId !== projectId || data.deletedAt != null) {
    throw new TaskApiError(400, "A label is not available in this project");
  }
  return { id: labelSnapshot.id, ...data };
}

export async function requireAcceptedAssignee(userId: string, projectId: string): Promise<UserSummary> {
  const userSnapshot = await getDoc(doc(db, "users", userId));
  if (!userSnapshot.exists()) throw new TaskApiError(400, "Assigned user is not available in this project");
  const membership = await getAcceptedProjectMembership({ projectId, userId });
  if (!membership) throw new TaskApiError(400, "Assigned user is not available in this project");
  return projectUserSummary(userSnapshot.id, userSnapshot.data());
}

const allowedAttachmentExtensions = new Set([
  "png", "jpg", "jpeg", "gif", "webp", "bmp",
  "mp3", "wav", "ogg", "m4a", "aac",
  "mp4", "webm", "mov",
  "pdf", "ppt", "pptx", "doc", "docx", "xls", "xlsx", "csv", "txt", "json",
]);
const allowedAttachmentMimeTypes = new Set([
  "image/png", "image/jpeg", "image/gif", "image/webp", "image/bmp",
  "audio/mpeg", "audio/wav", "audio/x-wav", "audio/ogg", "audio/mp4", "audio/aac",
  "video/mp4", "video/webm", "video/quicktime", "video/ogg",
  "application/pdf", "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv", "text/plain", "application/json", "application/octet-stream",
]);

export function validateTaskAttachment(file: File): string {
  if (file.size <= 0 || file.size > 2 * 1024 * 1024) {
    throw new TaskApiError(400, "Attachment must be between 1 byte and 2 MB");
  }
  const name = file.name.split(/[\\/]/).pop()?.replace(/[\u0000-\u001f\u007f]/g, "").trim() ?? "";
  if (!name || name.length > 128 || name === "." || name === "..") {
    throw new TaskApiError(400, "Attachment filename is invalid");
  }
  const extension = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1).toLowerCase() : "";
  if (!allowedAttachmentExtensions.has(extension)) {
    throw new TaskApiError(400, "Attachment file type is not supported");
  }
  const mimeType = file.type.toLowerCase();
  if (mimeType && !allowedAttachmentMimeTypes.has(mimeType)) {
    throw new TaskApiError(400, "Attachment file type is not supported");
  }
  return name;
}

export async function uploadTaskAttachment(file: File, projectId: string, taskId: string, safeFileName: string): Promise<string> {
  const objectName = `project/${projectId}/tasks/${taskId}/${randomUUID()}-${safeFileName}`;
  const bucket = getAdminBucket();
  await bucket.file(objectName).save(new Uint8Array(await file.arrayBuffer()), {
    resumable: false,
    metadata: {
      contentType: file.type || "application/octet-stream",
      metadata: { originalFileName: safeFileName },
    },
  });
  return objectName;
}

export async function deleteTaskAttachment(storagePath: unknown, projectId: string, taskId: string): Promise<void> {
  const bucket = getAdminBucket();
  const objectName = parseTaskAttachmentObjectPath(storagePath, {
    bucketName: bucket.name,
    projectId,
    taskId,
  });
  if (!objectName) throw new TaskApiError(400, "Attachment storage path is invalid");
  await bucket.file(objectName).delete({ ignoreNotFound: true });
}

export async function deleteTaskAttachments(taskId: string, projectId: string): Promise<void> {
  if (!isDocumentSafeId(taskId) || !isDocumentSafeId(projectId)) {
    throw new TaskApiError(404, "Task not found");
  }
  const attachments = await getDocs(query(
    collection(db, "attachments"),
    where("taskId", "==", taskId),
    where("projectId", "==", projectId),
  ));
  const records = attachments.docs
    .map((snapshot) => ({ snapshot, data: asRecord(snapshot.data()) }))
    .filter(({ data }) => data.taskId === taskId && data.projectId === projectId);
  const bucket = records.length > 0 ? getAdminBucket() : null;
  for (const { data } of records) {
    const objectName = parseTaskAttachmentObjectPath(data.attachmentStoragePath, {
      bucketName: bucket?.name ?? "",
      projectId,
      taskId,
    });
    if (objectName && bucket) await bucket.file(objectName).delete({ ignoreNotFound: true });
  }
  await Promise.all(records.map(({ snapshot }) => deleteDoc(snapshot.ref)));
  await deleteDoc(doc(db, "attachmentCounters", taskId));
}

export function taskErrorResponse(error: unknown): NextResponse {
  if (error instanceof TaskValidationError) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
  if (error instanceof TaskApiError) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status });
  }
  if (error instanceof QuotaExceededError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.status, headers: { "Retry-After": String(error.retryAfter) } },
    );
  }

  const status = genericErrorStatus(error);
  if (status === 429) {
    return NextResponse.json({ success: false, message: "Too many requests" }, { status });
  }
  if (status === 500) console.error("Task API request failed", error);
  return NextResponse.json({ success: false, message: genericErrorMessage(error) }, { status });
}

export function taskApiJson(data: unknown, message: string, status = 200): NextResponse {
  return NextResponse.json({ success: true, data, message }, { status });
}
