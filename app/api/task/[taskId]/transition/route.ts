import { NextResponse } from "next/server";
import { collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where, writeBatch } from "@/server/firestore";
import { db } from "@/server/db";
import { getSessionUserId } from "@/server/authorization";
import { createHistory } from "@/server/data/util";
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history";
import { readJsonObject } from "@/server/http";
import { parseIndex, requiredId, TaskValidationError } from "@/server/task-validation";
import {
  asRecord,
  authorizeTask,
  requireTaskStatus,
  requiredPathId,
  TASK_WRITE_ROLES,
  taskErrorResponse,
  TaskApiError,
  type RouteContext,
} from "@/server/task-api";

type TaskParams = { taskId: string };
type OrderedTask = { id: string; ref: ReturnType<typeof doc>; data: Record<string, unknown> };

async function loadTasks(projectId: string, statusId: string): Promise<OrderedTask[]> {
  const snapshot = await getDocs(query(collection(db, "tasks"), where("projectId", "==", projectId)));
  return snapshot.docs
    .filter((item) => {
      const data = asRecord(item.data());
      return data.projectId === projectId && data.status === statusId && data.type === "Task" && data.deletedAt == null;
    })
    .map((item) => ({ id: item.id, ref: item.ref, data: asRecord(item.data()) }))
    .sort((left, right) => Number(left.data.order ?? 0) - Number(right.data.order ?? 0));
}

async function writeOrderUpdates(updates: Array<{ ref: ReturnType<typeof doc>; data: Record<string, unknown> }>) {
  for (let start = 0; start < updates.length; start += 400) {
    const batch = writeBatch(db);
    for (const update of updates.slice(start, start + 400)) batch.update(update.ref, update.data);
    await batch.commit();
  }
}

export async function POST(request: Request, context: RouteContext<TaskParams>) {
  try {
    const userId = await getSessionUserId();
    const { taskId: rawTaskId } = await context.params;
    const taskId = requiredPathId(rawTaskId, "taskId");
    const task = await authorizeTask(taskId, userId, TASK_WRITE_ROLES);
    const body = await readJsonObject(request, 8 * 1024);
    const unsupportedKey = Object.keys(body).find((key) => !["newStatusId", "oldIndex", "newIndex"].includes(key));
    if (unsupportedKey) throw new TaskValidationError(`Unsupported field: ${unsupportedKey}`);
    const newStatusId = requiredId(body.newStatusId, "newStatusId");
    await requireTaskStatus(newStatusId, task.projectId);

    const currentStatusId = typeof task.data.status === "string" ? task.data.status : "";
    if (!currentStatusId) throw new TaskApiError(400, "Task does not have a status");
    const currentStatus = await requireTaskStatus(currentStatusId, task.projectId);
    const projectSnapshot = await getDoc(doc(db, "projects", task.projectId));
    const projectData = projectSnapshot.exists() ? asRecord(projectSnapshot.data()) : {};

    if (task.data.type === "SubTask") {
      await updateDoc(doc(db, "tasks", task.id), {
        status: newStatusId,
        finishedDate: newStatusId === projectData.endStatus ? new Date().toISOString() : null,
        updatedAt: serverTimestamp(),
      });
      const newStatus = await requireTaskStatus(newStatusId, task.projectId);
      await createHistory({
        userId,
        taskId: task.id,
        projectId: task.projectId,
        action: getHistoryAction.update,
        eventType: getHistoryEventType.taskStatus,
        previousValue: currentStatus.data.statusName,
        newValue: newStatus.data.statusName,
      });
      return NextResponse.json({ success: true, message: "SubTask updated successfully" });
    }
    if (task.data.type !== "Task") throw new TaskApiError(400, "Task type is invalid");

    const oldIndex = parseIndex(body.oldIndex, "oldIndex");
    const newIndex = parseIndex(body.newIndex, "newIndex");
    const sourceTasks = await loadTasks(task.projectId, currentStatusId);
    const sourceIndex = sourceTasks.findIndex((item) => item.id === task.id);
    if (sourceIndex < 0) throw new TaskApiError(404, "Task not found");
    if (sourceIndex !== oldIndex) throw new TaskApiError(409, "Task order changed; refresh and try again");

    if (currentStatusId === newStatusId) {
      if (newIndex >= sourceTasks.length) throw new TaskValidationError("newIndex is outside the status task list");
      if (sourceIndex === newIndex) return NextResponse.json({ success: true, message: "Task updated successfully" });
      const reordered = [...sourceTasks];
      const [movingTask] = reordered.splice(sourceIndex, 1);
      reordered.splice(newIndex, 0, movingTask);
      await writeOrderUpdates(reordered.map((item, index) => ({
        ref: item.ref,
        data: { order: index, updatedAt: serverTimestamp() },
      })));
      return NextResponse.json({ success: true, message: "Task updated successfully" });
    }

    const destinationTasks = await loadTasks(task.projectId, newStatusId);
    if (newIndex > destinationTasks.length) throw new TaskValidationError("newIndex is outside the destination status task list");
    const sourceRemaining = sourceTasks.filter((item) => item.id !== task.id);
    const destinationWithTask = [...destinationTasks];
    destinationWithTask.splice(newIndex, 0, { id: task.id, ref: doc(db, "tasks", task.id), data: task.data });

    await writeOrderUpdates(sourceRemaining.map((item, index) => ({
      ref: item.ref,
      data: { order: index, updatedAt: serverTimestamp() },
    })));
    const finishedDate = newStatusId === projectData.endStatus ? new Date().toISOString() : null;
    await writeOrderUpdates(destinationWithTask.map((item, index) => ({
      ref: item.ref,
      data: {
        status: newStatusId,
        order: index,
        ...(item.id === task.id ? { finishedDate } : {}),
        updatedAt: serverTimestamp(),
      },
    })));
    await Promise.all([
      updateDoc(doc(db, "taskOrderCounters", currentStatusId), { lastOrder: sourceRemaining.length, updatedAt: serverTimestamp() }),
      updateDoc(doc(db, "taskOrderCounters", newStatusId), { lastOrder: destinationWithTask.length, updatedAt: serverTimestamp() }),
    ]);

    const newStatus = await requireTaskStatus(newStatusId, task.projectId);
    await createHistory({
      userId,
      taskId: task.id,
      projectId: task.projectId,
      action: getHistoryAction.update,
      eventType: getHistoryEventType.taskStatus,
      previousValue: currentStatus.data.statusName,
      newValue: newStatus.data.statusName,
    });

    return NextResponse.json({ success: true, message: "Task updated successfully" });
  } catch (error) {
    return taskErrorResponse(error);
  }
}
