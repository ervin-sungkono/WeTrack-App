import { NextResponse } from "next/server";
import { collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, where, writeBatch } from "@/server/firestore";
import { db } from "@/server/db";
import { getSessionUserId, requireProjectMembership } from "@/server/authorization";
import { readJsonObject } from "@/server/http";
import { parseIndex, TaskValidationError } from "@/server/task-validation";
import {
  asRecord,
  isDocumentSafeId,
  PROJECT_ADMIN_ROLES,
  requiredPathId,
  taskErrorResponse,
  TaskApiError,
  type RouteContext,
} from "@/server/task-api";

type StatusParams = { statusId: string };

export async function POST(request: Request, context: RouteContext<StatusParams>) {
  try {
    const userId = await getSessionUserId();
    const { statusId: rawStatusId } = await context.params;
    const statusId = requiredPathId(rawStatusId, "statusId");
    const statusSnapshot = await getDoc(doc(db, "taskStatuses", statusId));
    if (!statusSnapshot.exists()) throw new TaskApiError(404, "Task status not found");
    const statusData = asRecord(statusSnapshot.data());
    const actualProjectId = typeof statusData.projectId === "string" ? statusData.projectId : "";
    if (!isDocumentSafeId(actualProjectId) || statusData.deletedAt != null) throw new TaskApiError(404, "Task status not found");

    const requestedProjectId = new URL(request.url).searchParams.get("projectId");
    if (!requestedProjectId || requestedProjectId !== actualProjectId) throw new TaskApiError(404, "Task status not found");
    await requireProjectMembership({ projectId: actualProjectId, userId, allowedRoles: PROJECT_ADMIN_ROLES });

    const body = await readJsonObject(request, 4 * 1024);
    if (Object.keys(body).some((key) => key !== "oldIndex" && key !== "newIndex")) {
      throw new TaskValidationError("Unsupported status transition field");
    }
    const oldIndex = parseIndex(body.oldIndex, "oldIndex");
    const newIndex = parseIndex(body.newIndex, "newIndex");
    const statuses = await getDocs(query(
      collection(db, "taskStatuses"),
      where("projectId", "==", actualProjectId),
      orderBy("order", "asc"),
    ));
    const activeStatuses = statuses.docs.filter((item) => asRecord(item.data()).deletedAt == null);
    const currentIndex = activeStatuses.findIndex((item) => item.id === statusId);
    if (currentIndex < 0) throw new TaskApiError(404, "Task status not found");
    if (currentIndex !== oldIndex) throw new TaskApiError(409, "Status order changed; refresh and try again");
    if (newIndex >= activeStatuses.length) throw new TaskValidationError("newIndex is outside the status list");

    const reordered = [...activeStatuses];
    const [movingStatus] = reordered.splice(currentIndex, 1);
    reordered.splice(newIndex, 0, movingStatus);
    for (let start = 0; start < reordered.length; start += 400) {
      const batch = writeBatch(db);
      for (const [offset, status] of reordered.slice(start, start + 400).entries()) {
        batch.update(status.ref, { order: start + offset, updatedAt: serverTimestamp() });
      }
      await batch.commit();
    }

    return NextResponse.json({ success: true, message: "Task updated successfully" });
  } catch (error) {
    return taskErrorResponse(error);
  }
}
