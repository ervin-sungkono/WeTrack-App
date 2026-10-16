import { NextResponse } from "next/server";
import { collection, doc, getDoc, getDocs, orderBy, query, runTransaction, serverTimestamp, where } from "@/server/firestore";
import { db } from "@/server/db";
import { getSessionUserId, requireProjectMembership } from "@/server/authorization";
import { createHistory, createNotification } from "@/server/data/util";
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history";
import { readJsonObject } from "@/server/http";
import { parseTaskCreateInput } from "@/server/task-validation";
import type { Task, TaskView } from "@/app/types/domain";
import {
  asRecord,
  isDocumentSafeId,
  projectUserSummary,
  TASK_READ_ROLES,
  TASK_WRITE_ROLES,
  requireAcceptedAssignee,
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

    const tasksQuery = query(
      collection(db, "tasks"),
      where("projectId", "==", projectId),
      orderBy("createdAt", "asc"),
    );
    const taskSnapshot = await getDocs(tasksQuery);
    const tasks = await Promise.all(taskSnapshot.docs.map(async (taskDocument) => {
      const data = asRecord(taskDocument.data());
      if (data.deletedAt != null) return null;

      let status: Record<string, unknown> | null = null;
      if (isDocumentSafeId(data.status)) {
        const statusDocument = await getDoc(doc(db, "taskStatuses", data.status));
        if (statusDocument.exists()) {
          const statusData = asRecord(statusDocument.data());
          if (statusData.projectId === projectId && statusData.deletedAt == null) {
            status = { id: statusDocument.id, ...statusData };
          }
        }
      }
      return { id: taskDocument.id, ...data, status } as TaskView;
    }));

    return NextResponse.json({ data: tasks.filter((task) => task !== null), message: "Projects retrieved successfully" });
  } catch (error) {
    return taskErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    const input = parseTaskCreateInput(await readJsonObject(request));
    await requireProjectMembership({ projectId: input.projectId, userId, allowedRoles: TASK_WRITE_ROLES });

    const statusDocument = await getDoc(doc(db, "taskStatuses", input.statusId));
    if (!statusDocument.exists()) throw new TaskApiError(400, "Task status is not available in this project");
    const statusData = asRecord(statusDocument.data());
    if (statusData.projectId !== input.projectId || statusData.deletedAt != null) {
      throw new TaskApiError(400, "Task status is not available in this project");
    }

    const assignedToDetails = input.assignedTo
      ? await requireAcceptedAssignee(input.assignedTo, input.projectId)
      : null;

    const createdByDocument = await getDoc(doc(db, "users", userId));
    if (!createdByDocument.exists()) throw new TaskApiError(401, "Unauthorized");
    const createdByDetails = projectUserSummary(createdByDocument.id, createdByDocument.data());

    if (input.type === "SubTask") {
      const parentId = input.parentId;
      if (!parentId) throw new TaskApiError(400, "A subtask must have a parent task");
      const parentDocument = await getDoc(doc(db, "tasks", parentId));
      const parentData = parentDocument.exists() ? asRecord(parentDocument.data()) : {};
      if (!parentDocument.exists() || parentData.projectId !== input.projectId || parentData.type !== "Task" || parentData.deletedAt != null) {
        throw new TaskApiError(400, "Parent task is not available in this project");
      }
    }

    const labelDetails = await Promise.all(input.labels.map(async (labelId) => {
      const labelDocument = await getDoc(doc(db, "labels", labelId));
      if (!labelDocument.exists()) throw new TaskApiError(400, "A label is not available in this project");
      const labelData = asRecord(labelDocument.data());
      if (labelData.projectId !== input.projectId || labelData.deletedAt != null) {
        throw new TaskApiError(400, "A label is not available in this project");
      }
      return { id: labelDocument.id, ...labelData };
    }));

    const projectDocument = await getDoc(doc(db, "projects", input.projectId));
    if (!projectDocument.exists()) throw new TaskApiError(404, "Project not found");
    const projectData = asRecord(projectDocument.data());
    const now = new Date().toISOString();
    const result = await runTransaction(db, async (transaction) => {
      const statusCounterRef = doc(db, "taskOrderCounters", input.statusId);
      const statusCounter = await transaction.get(statusCounterRef);
      const displayCounterRef = doc(db, "displayIdCounters", input.projectId);
      const displayCounter = await transaction.get(displayCounterRef);
      const taskRef = doc(collection(db, "tasks"));
      const displayCounterData = displayCounter.exists() ? asRecord(displayCounter.data()) : {};
      const statusCounterData = statusCounter.exists() ? asRecord(statusCounter.data()) : {};
      const displayId = typeof displayCounterData.displayId === "number" && Number.isSafeInteger(displayCounterData.displayId)
        ? displayCounterData.displayId
        : 1;
      const lastOrder = typeof statusCounterData.lastOrder === "number" && Number.isSafeInteger(statusCounterData.lastOrder)
        ? statusCounterData.lastOrder
        : 0;
      const taskData = {
        projectId: input.projectId,
        assignedTo: input.assignedTo,
        type: input.type,
        parentId: input.parentId,
        createdBy: userId,
        taskName: input.taskName,
        labels: input.labels,
        status: input.statusId,
        displayId,
        order: input.type === "Task" ? lastOrder : null,
        priority: input.priority,
        description: input.description,
        startDate: input.startDate,
        dueDate: input.dueDate,
        finishedDate: input.statusId === projectData.endStatus ? now : null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };
      transaction.set(taskRef, taskData);
      if (input.type === "Task") {
        transaction.set(statusCounterRef, { lastOrder: lastOrder + 1, updatedAt: serverTimestamp() });
      }
      transaction.set(displayCounterRef, { displayId: displayId + 1, updatedAt: serverTimestamp() });
      return { id: taskRef.id, ...taskData };
    });

    await createHistory({
      userId,
      taskId: result.id,
      projectId: input.projectId,
      action: getHistoryAction.create,
      eventType: input.type === "Task" ? getHistoryEventType.task : getHistoryEventType.subtask,
    });

    if (input.assignedTo && assignedToDetails) {
      await createHistory({
        userId,
        taskId: result.id,
        projectId: input.projectId,
        action: getHistoryAction.update,
        eventType: getHistoryEventType.assignedTo,
        previousValue: null,
        newValue: assignedToDetails,
      });
      await createNotification({
        userId: input.assignedTo,
        taskId: result.id,
        projectId: input.projectId,
        type: "AssignedTask",
      });
    }

    const persistedTask = result as Task;
    const taskView: TaskView = {
      ...persistedTask,
      assignedTo: assignedToDetails,
      createdBy: createdByDetails,
      status: { id: statusDocument.id, status: statusData.statusName },
      labels: labelDetails,
    } as TaskView;

    return NextResponse.json({
      data: taskView,
      message: "Successfully added new task to project and task collection",
    }, { status: 200 });
  } catch (error) {
    return taskErrorResponse(error);
  }
}
