import { NextResponse } from "next/server";
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from "@/server/firestore";
import { db } from "@/server/db";
import { getSessionUserId, requireProjectMembership } from "@/server/authorization";
import { createHistory } from "@/server/data/util";
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history";
import { readJsonObject } from "@/server/http";
import { parseStatusName, requiredId, TaskValidationError } from "@/server/task-validation";
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
type StatusRow = { id: string; ref: ReturnType<typeof doc>; data: Record<string, unknown> };

async function commitUpdates(updates: Array<{ ref: ReturnType<typeof doc>; data: Record<string, unknown> }>) {
  for (let start = 0; start < updates.length; start += 400) {
    const batch = writeBatch(db);
    for (const update of updates.slice(start, start + 400)) batch.update(update.ref, update.data);
    await batch.commit();
  }
}

export async function PUT(request: Request, context: RouteContext<StatusParams>) {
  try {
    const userId = await getSessionUserId();
    const { statusId: rawStatusId } = await context.params;
    const statusId = requiredPathId(rawStatusId, "statusId");
    const statusSnapshot = await getDoc(doc(db, "taskStatuses", statusId));
    if (!statusSnapshot.exists()) throw new TaskApiError(404, "Status not found");
    const statusData = asRecord(statusSnapshot.data());
    const projectId = typeof statusData.projectId === "string" ? statusData.projectId : "";
    if (!isDocumentSafeId(projectId) || statusData.deletedAt != null) throw new TaskApiError(404, "Status not found");
    await requireProjectMembership({ projectId, userId, allowedRoles: PROJECT_ADMIN_ROLES });

    const body = await readJsonObject(request, 4 * 1024);
    if (Object.keys(body).some((key) => key !== "statusName")) throw new TaskValidationError("Unsupported status field");
    const statusName = parseStatusName(body.statusName);
    const statuses = await getDocs(query(collection(db, "taskStatuses"), where("projectId", "==", projectId)));
    if (statuses.docs.some((item) => item.id !== statusId && asRecord(item.data()).deletedAt == null && String(asRecord(item.data()).statusName).toLowerCase() === statusName.toLowerCase())) {
      throw new TaskApiError(400, "Status name already exists in this project");
    }

    await updateDoc(doc(db, "taskStatuses", statusId), { statusName, updatedAt: serverTimestamp() });
    await createHistory({
      userId,
      projectId,
      action: getHistoryAction.update,
      eventType: getHistoryEventType.status,
      previousValue: statusData.statusName,
      newValue: statusName,
    });

    return NextResponse.json({ success: true, message: "Task status updated successfully" });
  } catch (error) {
    return taskErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: RouteContext<StatusParams>) {
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
    if (Object.keys(body).some((key) => key !== "newStatusId")) throw new TaskValidationError("Unsupported status field");
    const newStatusId = requiredId(body.newStatusId, "newStatusId");
    if (newStatusId === statusId) throw new TaskValidationError("Choose another task status");
    const newStatusSnapshot = await getDoc(doc(db, "taskStatuses", newStatusId));
    if (!newStatusSnapshot.exists()) throw new TaskApiError(400, "Replacement status is not available in this project");
    const newStatusData = asRecord(newStatusSnapshot.data());
    if (newStatusData.projectId !== actualProjectId || newStatusData.deletedAt != null) {
      throw new TaskApiError(400, "Replacement status is not available in this project");
    }

    const statusesSnapshot = await getDocs(query(collection(db, "taskStatuses"), where("projectId", "==", actualProjectId)));
    const activeStatuses = statusesSnapshot.docs.filter((item) => asRecord(item.data()).deletedAt == null);
    if (activeStatuses.length <= 1) throw new TaskApiError(406, "A project must keep at least one status");

    const projectRef = doc(db, "projects", actualProjectId);
    const projectSnapshot = await getDoc(projectRef);
    if (!projectSnapshot.exists()) throw new TaskApiError(404, "Project not found");
    const projectData = asRecord(projectSnapshot.data());
    const nextStartStatus = projectData.startStatus === statusId ? newStatusId : projectData.startStatus;
    const nextEndStatus = projectData.endStatus === statusId ? newStatusId : projectData.endStatus;

    const projectTasksSnapshot = await getDocs(query(
      collection(db, "tasks"),
      where("projectId", "==", actualProjectId),
    ));
    const projectTaskRows: StatusRow[] = projectTasksSnapshot.docs
      .map((item) => ({ id: item.id, ref: item.ref, data: asRecord(item.data()) }))
      .filter((item) => item.data.projectId === actualProjectId && item.data.deletedAt == null);
    const movingTasks = projectTaskRows.filter((item) => item.data.status === statusId);
    const destinationTasks = projectTaskRows
      .filter((item) => item.data.status === newStatusId && item.data.type === "Task")
      .sort((a, b) => Number(a.data.order ?? 0) - Number(b.data.order ?? 0));
    const movingMainTasks = movingTasks
      .filter((item) => item.data.type === "Task")
      .sort((a, b) => Number(a.data.order ?? 0) - Number(b.data.order ?? 0));
    const destinationMainTasks = destinationTasks.filter((item) => item.data.type === "Task");
    const combinedMainTasks = [...destinationMainTasks, ...movingMainTasks];
    const updates: Array<{ ref: ReturnType<typeof doc>; data: Record<string, unknown> }> = movingTasks
      .filter((item) => item.data.type !== "Task")
      .map((item) => ({ ref: item.ref, data: { status: newStatusId, updatedAt: serverTimestamp() } }));
    combinedMainTasks.forEach((item, index) => {
      updates.push({
        ref: item.ref,
        data: {
          status: newStatusId,
          order: index,
          finishedDate: newStatusId === nextEndStatus ? (item.data.finishedDate ?? new Date().toISOString()) : null,
          updatedAt: serverTimestamp(),
        },
      });
    });
    await commitUpdates(updates);

    await updateDoc(projectRef, { startStatus: nextStartStatus, endStatus: nextEndStatus, updatedAt: serverTimestamp() });
    await setDoc(doc(db, "taskOrderCounters", newStatusId), {
      lastOrder: combinedMainTasks.length,
      updatedAt: serverTimestamp(),
    });
    await deleteDoc(doc(db, "taskOrderCounters", statusId));
    await deleteDoc(doc(db, "taskStatuses", statusId));

    await Promise.all(movingTasks.map((item) => createHistory({
      userId,
      taskId: item.id,
      projectId: actualProjectId,
      eventType: getHistoryEventType.taskStatus,
      action: getHistoryAction.update,
      previousValue: statusData.statusName,
      newValue: newStatusData.statusName,
    })));
    await createHistory({
      userId,
      projectId: actualProjectId,
      action: getHistoryAction.delete,
      eventType: getHistoryEventType.status,
      deletedValue: statusData.statusName,
    });

    return NextResponse.json({ success: true, message: "Task status deleted successfully" });
  } catch (error) {
    return taskErrorResponse(error);
  }
}
