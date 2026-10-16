import { NextResponse } from "next/server";
import { collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where, writeBatch } from "@/server/firestore";
import { db } from "@/server/db";
import { getSessionUserId } from "@/server/authorization";
import { createHistory, createNotification, deleteChats, deleteChatSummaries, deleteComments, deleteTask } from "@/server/data/util";
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history";
import { readJsonObject } from "@/server/http";
import { parseTaskUpdateInput } from "@/server/task-validation";
import type { Task, TaskView } from "@/app/types/domain";
import {
  asRecord,
  authorizeTask,
  deleteTaskAttachments,
  isDocumentSafeId,
  projectUserSummary,
  requireAcceptedAssignee,
  requireProjectLabel,
  TASK_READ_ROLES,
  TASK_WRITE_ROLES,
  taskErrorResponse,
  TaskApiError,
  type DataRecord,
  requiredPathId,
  type RouteContext,
} from "@/server/task-api";

type TaskParams = { taskId: string };

export async function GET(_request: Request, context: RouteContext<TaskParams>) {
  try {
    const userId = await getSessionUserId();
    const { taskId: rawTaskId } = await context.params;
    const taskId = requiredPathId(rawTaskId, "taskId");
    const task = await authorizeTask(taskId, userId, TASK_READ_ROLES);

    const childQuery = query(
      collection(db, "tasks"),
      where("parentId", "==", taskId),
    );
    const children = await getDocs(childQuery);
    const subTasks = children.docs
      .filter((child) => {
        const childData = asRecord(child.data());
        return childData.projectId === task.projectId && childData.type === "SubTask" && childData.deletedAt == null;
      })
      .map((child) => ({ id: child.id, taskName: asRecord(child.data()).taskName }));

    const labelIds = Array.isArray(task.data.labels)
      ? task.data.labels.filter((labelId): labelId is string => isDocumentSafeId(labelId))
      : [];
    const labels = await Promise.all(labelIds.map(async (labelId) => {
      const label = await getDoc(doc(db, "labels", labelId));
      if (!label.exists()) return null;
      const labelData = asRecord(label.data());
      if (labelData.projectId !== task.projectId || labelData.deletedAt != null) return null;
      return { id: label.id, ...labelData };
    }));

    const taskView: TaskView = {
      id: task.id,
      ...task.data,
      labels: labels.filter((label) => label !== null),
      subTasks,
    } as TaskView;

    return NextResponse.json({
      data: taskView,
      message: "Successfully get Task detail",
    });
  } catch (error) {
    return taskErrorResponse(error);
  }
}

export async function PUT(request: Request, context: RouteContext<TaskParams>) {
  try {
    const userId = await getSessionUserId();
    const { taskId: rawTaskId } = await context.params;
    const taskId = requiredPathId(rawTaskId, "taskId");
    const task = await authorizeTask(taskId, userId, TASK_WRITE_ROLES);
    const input = parseTaskUpdateInput(await readJsonObject(request));

    if (task.data.type === "Task" && input.parentId) {
      throw new TaskApiError(400, "A task cannot have a parent task");
    }
    if (task.data.type === "SubTask" && input.parentId === null) {
      throw new TaskApiError(400, "A subtask must have a parent task");
    }
    if (task.data.type === "SubTask" && input.parentId) {
      if (input.parentId === taskId) throw new TaskApiError(400, "A subtask cannot be its own parent");
      const parent = await getDoc(doc(db, "tasks", input.parentId));
      const parentData = parent.exists() ? asRecord(parent.data()) : {};
      if (!parent.exists() || parentData.projectId !== task.projectId || parentData.type !== "Task" || parentData.deletedAt != null) {
        throw new TaskApiError(400, "Parent task is not available in this project");
      }
    }

    const assignedToDetails = input.assignedTo
      ? await requireAcceptedAssignee(input.assignedTo, task.projectId)
      : null;
    if (input.labels) await Promise.all(input.labels.map((labelId) => requireProjectLabel(labelId, task.projectId)));

    const nextStartDate = input.startDate !== undefined ? input.startDate : task.data.startDate;
    const nextDueDate = input.dueDate !== undefined ? input.dueDate : task.data.dueDate;
    if (typeof nextStartDate === "string" && typeof nextDueDate === "string" && Date.parse(nextDueDate) < Date.parse(nextStartDate)) {
      throw new TaskApiError(400, "dueDate must not be before startDate");
    }

    const changes: DataRecord = { updatedAt: new Date().toISOString() };
    if (input.parentId !== undefined) changes.parentId = input.parentId;
    if (input.assignedTo !== undefined) changes.assignedTo = input.assignedTo;
    if (input.taskName !== undefined) changes.taskName = input.taskName;
    if (input.labels !== undefined) changes.labels = input.labels;
    if (input.priority !== undefined) changes.priority = input.priority;
    if (input.description !== undefined) changes.description = input.description;
    if (input.startDate !== undefined) changes.startDate = input.startDate;
    if (input.dueDate !== undefined) changes.dueDate = input.dueDate;

    await updateDoc(doc(db, "tasks", taskId), changes);
    const updatedData: Task = { id: task.id, ...task.data, ...changes } as Task;

    if (input.taskName !== undefined && input.taskName !== task.data.taskName) {
      await createHistory({
        userId,
        taskId,
        projectId: task.projectId,
        action: getHistoryAction.update,
        eventType: getHistoryEventType.taskName,
        previousValue: task.data.taskName,
        newValue: input.taskName,
      });
    } else if (input.assignedTo !== undefined && input.assignedTo !== task.data.assignedTo) {
      const oldUser = typeof task.data.assignedTo === "string"
        ? await getDoc(doc(db, "users", task.data.assignedTo))
        : null;
      await createHistory({
        userId,
        taskId,
        projectId: task.projectId,
        action: getHistoryAction.update,
        eventType: getHistoryEventType.assignedTo,
        previousValue: oldUser?.exists() ? projectUserSummary(oldUser.id, oldUser.data()) : null,
        newValue: assignedToDetails,
      });
    } else {
      await createHistory({
        userId,
        taskId,
        projectId: task.projectId,
        action: getHistoryAction.update,
        eventType: task.data.type === "Task" ? getHistoryEventType.task : getHistoryEventType.subtask,
      });
    }

    if (input.assignedTo && input.assignedTo !== task.data.assignedTo) {
      await createNotification({
        userId: input.assignedTo,
        taskId,
        projectId: task.projectId,
        type: "AssignedTask",
      });
    }

    return NextResponse.json({ success: true, message: "Task updated successfully", data: updatedData });
  } catch (error) {
    return taskErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext<TaskParams>) {
  try {
    const userId = await getSessionUserId();
    const { taskId: rawTaskId } = await context.params;
    const taskId = requiredPathId(rawTaskId, "taskId");
    const task = await authorizeTask(taskId, userId, TASK_WRITE_ROLES);

    await createHistory({
      userId,
      taskId,
      projectId: task.projectId,
      eventType: task.data.type === "Task" ? getHistoryEventType.task : getHistoryEventType.subtask,
      action: getHistoryAction.delete,
      deletedValue: task.data.taskName,
    });

    await deleteTaskAttachments(taskId, task.projectId);
    await deleteComments({ taskId, projectId: task.projectId });
    await deleteChats({ taskId, projectId: task.projectId });
    await deleteChatSummaries({ taskId, projectId: task.projectId });
    await deleteTask({ taskId, userId });

    const taskStatusId = isDocumentSafeId(task.data.status) ? task.data.status : null;
    if (taskStatusId && task.data.type === "Task") {
      const projectTasks = await getDocs(query(collection(db, "tasks"), where("projectId", "==", task.projectId)));
      const remaining = projectTasks.docs
        .filter((item) => {
          const data = asRecord(item.data());
          return data.status === taskStatusId && data.type === "Task" && data.deletedAt == null;
        })
        .sort((left, right) => Number(asRecord(left.data()).order ?? 0) - Number(asRecord(right.data()).order ?? 0));
      for (let start = 0; start < remaining.length; start += 400) {
        const batch = writeBatch(db);
        remaining.slice(start, start + 400).forEach((item, offset) => {
          batch.update(item.ref, { order: start + offset, updatedAt: serverTimestamp() });
        });
        await batch.commit();
      }
      const batch = writeBatch(db);
      batch.set(doc(db, "taskOrderCounters", taskStatusId), {
        lastOrder: remaining.length,
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
    }

    return NextResponse.json({ success: true, message: "Task successfully deleted" });
  } catch (error) {
    return taskErrorResponse(error);
  }
}
