import { NextResponse } from "next/server";
import { addDoc, collection, doc, getDocs, orderBy, query, serverTimestamp, setDoc, where } from "@/server/firestore";
import { db } from "@/server/db";
import { getSessionUserId, requireProjectMembership } from "@/server/authorization";
import { createHistory } from "@/server/data/util";
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history";
import { readJsonObject } from "@/server/http";
import { parseStatusName, TaskValidationError } from "@/server/task-validation";
import {
  asRecord,
  PROJECT_ADMIN_ROLES,
  TASK_READ_ROLES,
  taskErrorResponse,
  TaskApiError,
  routeProjectId,
} from "@/server/task-api";

export async function GET(request: Request) {
  try {
    const userId = await getSessionUserId();
    const projectId = routeProjectId(request);
    if (!projectId) throw new TaskApiError(400, "projectId is required");
    await requireProjectMembership({ projectId, userId, allowedRoles: TASK_READ_ROLES });

    const statusSnapshot = await getDocs(query(
      collection(db, "taskStatuses"),
      where("projectId", "==", projectId),
      orderBy("order", "asc"),
    ));
    const statuses = statusSnapshot.docs
      .filter((status) => asRecord(status.data()).deletedAt == null)
      .map((status) => ({
        id: status.id,
        status: asRecord(status.data()).statusName,
        order: asRecord(status.data()).order,
      }));

    return NextResponse.json({ data: statuses, message: "Succesfully get all available task statuses" });
  } catch (error) {
    return taskErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    const projectId = routeProjectId(request);
    if (!projectId) throw new TaskApiError(400, "projectId is required");
    await requireProjectMembership({ projectId, userId, allowedRoles: PROJECT_ADMIN_ROLES });

    const body = await readJsonObject(request, 4 * 1024);
    if (Object.keys(body).some((key) => key !== "statusName")) throw new TaskValidationError("Unsupported status field");
    const statusName = parseStatusName(body.statusName);
    const statusCollection = collection(db, "taskStatuses");
    const existing = await getDocs(query(statusCollection, where("projectId", "==", projectId)));
    const activeStatuses = existing.docs.filter((status) => asRecord(status.data()).deletedAt == null);
    if (activeStatuses.length >= 50) throw new TaskApiError(400, "A project cannot have more than 50 statuses");
    if (activeStatuses.some((status) => String(asRecord(status.data()).statusName).toLowerCase() === statusName.toLowerCase())) {
      throw new TaskApiError(400, "Status name already exists in this project");
    }

    const status = await addDoc(statusCollection, {
      statusName,
      projectId,
      order: activeStatuses.length,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      deletedAt: null,
    });
    await setDoc(doc(db, "taskOrderCounters", status.id), { lastOrder: 0, updatedAt: serverTimestamp() });
    await createHistory({
      userId,
      projectId,
      action: getHistoryAction.create,
      eventType: getHistoryEventType.status,
    });

    return NextResponse.json({ success: true, data: { id: status.id, status: statusName }, message: "Successfully create new task status" });
  } catch (error) {
    return taskErrorResponse(error);
  }
}
