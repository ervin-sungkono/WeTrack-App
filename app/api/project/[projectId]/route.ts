import { NextResponse } from "next/server";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "@/server/firestore";
import { db } from "@/server/db";
import { deleteProjectMembershipInBatch } from "@/server/auth";
import { getSessionUserId, isRecordValue, requireProjectMembership } from "@/server/authorization";
import { genericErrorMessage, genericErrorStatus, readJsonObject, requiredString, RequestValidationError } from "@/server/http";
import { createHistory } from "@/server/data/util";
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history";

type RouteContext = { params: Promise<{ projectId: string }> };
const OWNER_ROLES = ["Owner"] as const;

export async function GET(_request: Request, context: RouteContext) {
  try {
    const userId = await getSessionUserId();
    const { projectId } = await context.params;
    await requireProjectMembership({ projectId, userId });

    const projectSnap = await getDoc(doc(db, "projects", projectId));
    const projectData: unknown = projectSnap.exists() ? projectSnap.data() : null;
    if (!isRecordValue(projectData) || projectData.deletedAt != null) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: { id: projectSnap.id, ...projectData },
      message: "Successfully retrieved project",
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { data: null, message: genericErrorMessage(error) },
      { status: genericErrorStatus(error) },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const userId = await getSessionUserId();
    const { projectId } = await context.params;
    await requireProjectMembership({ projectId, userId, allowedRoles: OWNER_ROLES });

    const body = await readJsonObject(request, 8 * 1024);
    const key = requiredString(body.key, "project key", 10);
    const projectName = requiredString(body.projectName, "project name", 100);
    const startStatus = requiredString(body.startStatus, "start status", 128);
    const endStatus = requiredString(body.endStatus, "end status", 128);
    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);
    const currentProject: unknown = projectSnap.exists() ? projectSnap.data() : null;
    if (!isRecordValue(currentProject) || currentProject.deletedAt != null) {
      return NextResponse.json({ data: null, message: "Project not found" }, { status: 404 });
    }

    const [startStatusSnap, endStatusSnap] = await Promise.all([
      getDoc(doc(db, "taskStatuses", startStatus)),
      getDoc(doc(db, "taskStatuses", endStatus)),
    ]);
    const startStatusData: unknown = startStatusSnap.exists() ? startStatusSnap.data() : null;
    const endStatusData: unknown = endStatusSnap.exists() ? endStatusSnap.data() : null;
    if (!isRecordValue(startStatusData) || startStatusData.projectId !== projectId || startStatusData.deletedAt != null) {
      return NextResponse.json({ data: null, message: "Start status not found" }, { status: 404 });
    }
    if (!isRecordValue(endStatusData) || endStatusData.projectId !== projectId || endStatusData.deletedAt != null) {
      return NextResponse.json({ data: null, message: "End status not found" }, { status: 404 });
    }

    const previousEndStatus = typeof currentProject.endStatus === "string" ? currentProject.endStatus : null;
    const endStatusChanged = previousEndStatus !== endStatus;
    let oldEndTasks: Awaited<ReturnType<typeof getDocs>> | null = null;
    let newEndTasks: Awaited<ReturnType<typeof getDocs>> | null = null;
    if (endStatusChanged && previousEndStatus) {
      oldEndTasks = await getDocs(query(
        collection(db, "tasks"),
        where("projectId", "==", projectId),
        where("status", "==", previousEndStatus),
        limit(501),
      ));
      newEndTasks = await getDocs(query(
        collection(db, "tasks"),
        where("projectId", "==", projectId),
        where("status", "==", endStatus),
        limit(501),
      ));
      if (oldEndTasks.docs.length > 500 || newEndTasks.docs.length > 500) {
        throw new RequestValidationError(409, "This project has too many tasks to change its end status at once");
      }
    }

    await updateDoc(projectRef, { key, projectName, startStatus, endStatus, updatedAt: serverTimestamp() });
    await createHistory({
      userId,
      projectId,
      action: getHistoryAction.update,
      eventType: getHistoryEventType.project,
    });

    if (endStatusChanged && previousEndStatus && oldEndTasks && newEndTasks) {
      const changedAt = new Date().toISOString();
      await Promise.all([
        ...oldEndTasks.docs.map(async (task) => {
          await updateDoc(task.ref, { finishedDate: null, updatedAt: serverTimestamp() });
          await createHistory({
            userId: null,
            taskId: task.id,
            projectId,
            action: getHistoryAction.update,
            eventType: getHistoryEventType.task,
          });
        }),
        ...newEndTasks.docs.map(async (task) => {
          await updateDoc(task.ref, { finishedDate: changedAt, updatedAt: serverTimestamp() });
          await createHistory({
            userId: null,
            taskId: task.id,
            projectId,
            action: getHistoryAction.update,
            eventType: getHistoryEventType.task,
          });
        }),
      ]);
    }

    const updatedProjectSnap = await getDoc(projectRef);
    const updatedProjectData: unknown = updatedProjectSnap.exists() ? updatedProjectSnap.data() : null;
    if (!isRecordValue(updatedProjectData)) {
      return NextResponse.json({ data: null, message: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({
      data: { id: updatedProjectSnap.id, ...updatedProjectData },
      message: "Successfully updated the project",
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { data: null, message: genericErrorMessage(error) },
      { status: genericErrorStatus(error) },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const userId = await getSessionUserId();
    const { projectId } = await context.params;
    await requireProjectMembership({ projectId, userId, allowedRoles: OWNER_ROLES });

    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);
    const projectData: unknown = projectSnap.exists() ? projectSnap.data() : null;
    if (!isRecordValue(projectData) || projectData.deletedAt != null) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    const teams = await getDocs(query(collection(db, "teams"), where("projectId", "==", projectId)));
    const teamDocs = teams.docs;
    const deletedAt = serverTimestamp();
    const chunks: typeof teamDocs[] = [];
    for (let index = 0; index < teamDocs.length; index += 150) {
      chunks.push(teamDocs.slice(index, index + 150));
    }

    if (chunks.length === 0) {
      const batch = writeBatch(db);
      batch.update(projectRef, { deletedAt, updatedAt: serverTimestamp() });
      await batch.commit();
    } else {
      for (const [index, chunk] of chunks.entries()) {
        const batch = writeBatch(db);
        if (index === 0) batch.update(projectRef, { deletedAt, updatedAt: serverTimestamp() });
        for (const team of chunk) {
          const teamData: unknown = team.data();
          batch.update(team.ref, { deletedAt, updatedAt: serverTimestamp() });
          if (isRecordValue(teamData) && teamData.status === "accepted" && typeof teamData.userId === "string") {
            deleteProjectMembershipInBatch(batch, projectId, teamData.userId);
          }
        }
        await batch.commit();
      }
    }

    await createHistory({
      userId,
      projectId,
      action: getHistoryAction.delete,
      eventType: getHistoryEventType.project,
      deletedValue: typeof projectData.projectName === "string" ? projectData.projectName : null,
    });
    return NextResponse.json({ message: "Project successfully deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { data: null, message: genericErrorMessage(error) },
      { status: genericErrorStatus(error) },
    );
  }
}
