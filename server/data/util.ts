import "server-only";

import { Timestamp } from "firebase-admin/firestore";
import {
  addDoc,
  and,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "@/server/firestore";
import { db } from "@/server/db";
import { deleteProjectMembershipInBatch, projectMembershipDocumentId } from "@/server/auth";
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history";
import type { ProjectRole, UserSummary } from "@/app/types/domain";

type DataRecord = Record<string, unknown>;
type FirestoreValue =
  | string
  | number
  | boolean
  | null
  | Date
  | Timestamp
  | FirestoreValue[]
  | { [key: string]: FirestoreValue };

function isRecord(value: unknown): value is DataRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toFirestoreValue(value: unknown): FirestoreValue {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (value instanceof Date || value instanceof Timestamp) return value;
  if (Array.isArray(value)) return value.map(toFirestoreValue);
  if (isRecord(value)) {
    const result: { [key: string]: FirestoreValue } = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      if (nestedValue !== undefined) result[key] = toFirestoreValue(nestedValue);
    }
    return result;
  }
  return String(value);
}

function snapshotData(value: unknown): DataRecord {
  return isRecord(value) ? value : {};
}

function userSummary(snapshot: { id: string; data(): unknown } | null): UserSummary | null {
  if (!snapshot) return null;
  const user = snapshotData(snapshot.data());
  const summary: UserSummary = { id: snapshot.id };
  if (typeof user.fullName === "string") summary.fullName = user.fullName;
  if (typeof user.profileImage === "string" || user.profileImage === null) {
    summary.profileImage = user.profileImage;
  } else if (isRecord(user.profileImage)) {
    const path = user.profileImage.attachmentStoragePath;
    const filename = user.profileImage.originalFileName;
    if (typeof path === "string" && typeof filename === "string") {
      summary.profileImage = { attachmentStoragePath: path, originalFileName: filename };
    }
  }
  return summary;
}

async function userSummaryById(userId: string | null | undefined): Promise<UserSummary | null> {
  if (!userId) return null;
  const user = await getDoc(doc(db, "users", userId));
  return user.exists() ? userSummary(user) : null;
}

async function taskSummaryById(taskId: string | null | undefined): Promise<{ id: string; taskName: string } | null> {
  if (!taskId) return null;
  const task = await getDoc(doc(db, "tasks", taskId));
  if (!task.exists()) return null;
  const data = snapshotData(task.data());
  return { id: task.id, taskName: typeof data.taskName === "string" ? data.taskName : "" };
}

async function projectSummaryById(projectId: string | null | undefined): Promise<{ id: string; projectName: string } | null> {
  if (!projectId) return null;
  const project = await getDoc(doc(db, "projects", projectId));
  if (!project.exists()) return null;
  const data = snapshotData(project.data());
  return { id: project.id, projectName: typeof data.projectName === "string" ? data.projectName : "" };
}

export async function createHistory({
  userId = null,
  taskId = null,
  projectId = null,
  eventType,
  deletedValue = null,
  action,
  previousValue = null,
  newValue = null,
}: {
  userId?: string | null;
  taskId?: string | null;
  projectId?: string | null;
  eventType: string;
  deletedValue?: unknown;
  action: string;
  previousValue?: unknown;
  newValue?: unknown;
}): Promise<string> {
  const [user, task, project] = await Promise.all([
    userSummaryById(userId),
    taskSummaryById(taskId),
    projectSummaryById(projectId),
  ]);
  const history = await addDoc(collection(db, "histories"), {
    user,
    userId,
    task,
    taskId,
    project,
    projectId,
    eventType,
    deletedValue: toFirestoreValue(deletedValue),
    action,
    previousValue: toFirestoreValue(previousValue),
    newValue: toFirestoreValue(newValue),
    createdAt: serverTimestamp(),
  });
  return history.id;
}

export async function createNotification({
  userId,
  senderId = null,
  taskId = null,
  projectId,
  type,
  newValue = null,
}: {
  userId: string;
  senderId?: string | null;
  taskId?: string | null;
  projectId: string;
  type: string;
  newValue?: unknown;
}): Promise<string | null> {
  if (!userId || !projectId) return null;
  const [sender, task, project] = await Promise.all([
    userSummaryById(senderId),
    taskSummaryById(taskId),
    projectSummaryById(projectId),
  ]);
  const notification = await addDoc(collection(db, "notifications"), {
    userId,
    senderId,
    sender,
    taskId,
    task,
    project,
    projectId,
    type,
    newValue: toFirestoreValue(newValue),
    status: "new",
    createdAt: serverTimestamp(),
  });
  return notification.id;
}

export async function getProjectRole({ projectId, userId }: { projectId: string; userId: string }): Promise<ProjectRole | null> {
  if (!projectId || !userId) return null;
  const membership = await getDoc(doc(db, "projectMembers", projectMembershipDocumentId(projectId, userId)));
  const role: unknown = membership.exists() ? snapshotData(membership.data()).role : null;
  return role === "Owner" || role === "Member" || role === "Viewer" ? role : null;
}

export async function deleteProject({ projectId }: { projectId: string }): Promise<void> {
  if (!projectId) return;
  const projectRef = doc(db, "projects", projectId);
  const [project, teams] = await Promise.all([
    getDoc(projectRef),
    getDocs(query(collection(db, "teams"), where("projectId", "==", projectId))),
  ]);
  if (!project.exists()) return;

  const members = teams.docs;
  if (members.length === 0) {
    const batch = writeBatch(db);
    batch.update(projectRef, { deletedAt: serverTimestamp(), updatedAt: serverTimestamp() });
    await batch.commit();
    return;
  }

  // Each member may add a team update, membership delete, and user index
  // update, so keep the batch well below Firestore's 500-write ceiling.
  const memberChunkSize = 150;
  for (let offset = 0; offset < members.length; offset += memberChunkSize) {
    const batch = writeBatch(db);
    if (offset === 0) batch.update(projectRef, { deletedAt: serverTimestamp(), updatedAt: serverTimestamp() });
    for (const member of members.slice(offset, offset + memberChunkSize)) {
      const data = snapshotData(member.data());
      batch.update(member.ref, { deletedAt: serverTimestamp(), updatedAt: serverTimestamp() });
      if (typeof data.userId === "string") {
        deleteProjectMembershipInBatch(batch, projectId, data.userId);
      }
    }
    await batch.commit();
  }
}

async function deleteTaskChildren(taskId: string, projectId: string, userId?: string): Promise<void> {
  const children = await getDocs(query(
    collection(db, "tasks"),
    and(where("parentId", "==", taskId), where("projectId", "==", projectId)),
  ));
  const activeChildren = children.docs.filter((child) => snapshotData(child.data()).deletedAt == null);

  for (let offset = 0; offset < activeChildren.length; offset += 400) {
    const batch = writeBatch(db);
    const chunk = activeChildren.slice(offset, offset + 400);
    for (const child of chunk) batch.update(child.ref, { parentId: null, updatedAt: serverTimestamp() });
    await batch.commit();
    await Promise.all(chunk.map((child) => createHistory({
      userId: userId ?? null,
      taskId: child.id,
      projectId,
      eventType: getHistoryEventType.subtask,
      action: getHistoryAction.update,
      previousValue: { parentId: taskId },
      newValue: { parentId: null },
    })));
  }
}

export async function deleteTask({ taskId, userId }: { taskId: string; userId?: string }): Promise<void> {
  if (!taskId) return;
  const taskRef = doc(db, "tasks", taskId);
  const task = await getDoc(taskRef);
  if (!task.exists()) return;
  const data = snapshotData(task.data());
  if (typeof data.projectId !== "string") throw new Error("Task has no project reference");

  await deleteTaskChildren(taskId, data.projectId, userId);
  await deleteDoc(taskRef);
}

async function deleteTaskRecords(
  collectionName: "comments" | "chats" | "chatSummaries",
  taskId: string,
  projectId: string,
): Promise<void> {
  const snapshot = await getDocs(query(collection(db, collectionName), where("taskId", "==", taskId)));
  const scopedRecords = snapshot.docs.filter((record) => {
    const data = snapshotData(record.data());
    return data.taskId === taskId && data.projectId === projectId;
  });
  for (let offset = 0; offset < scopedRecords.length; offset += 400) {
    const batch = writeBatch(db);
    for (const item of scopedRecords.slice(offset, offset + 400)) batch.delete(item.ref);
    await batch.commit();
  }
}

export function deleteComments({ taskId, projectId }: { taskId: string; projectId: string }): Promise<void> {
  return deleteTaskRecords("comments", taskId, projectId);
}

export function deleteChats({ taskId, projectId }: { taskId: string; projectId: string }): Promise<void> {
  return deleteTaskRecords("chats", taskId, projectId);
}

export function deleteChatSummaries({ taskId, projectId }: { taskId: string; projectId: string }): Promise<void> {
  return deleteTaskRecords("chatSummaries", taskId, projectId);
}

export async function handleDeletedUser({ userId }: { userId: string }): Promise<void> {
  if (!userId) return;
  const deletedUserSummary = await userSummaryById(userId);
  const teamSnapshot = await getDocs(query(collection(db, "teams"), where("userId", "==", userId)));
  const teams = teamSnapshot.docs.map((item) => ({ ref: item.ref, data: snapshotData(item.data()) }));
  const ownedProjects = new Set<string>();
  for (const { data } of teams) {
    if (data.role === "Owner" && data.deletedAt == null && typeof data.projectId === "string") {
      ownedProjects.add(data.projectId);
    }
  }
  const ownedProjectIds = [...ownedProjects];

  await Promise.all(ownedProjectIds.map((projectId) => deleteProject({ projectId })));

  const remainingTeams = teams.filter(({ data }) => typeof data.projectId !== "string" || !ownedProjects.has(data.projectId));
  for (const { data, ref } of remainingTeams) {
    const projectId = typeof data.projectId === "string" ? data.projectId : null;
    if (projectId) {
      const assignedTasks = await getDocs(query(
        collection(db, "tasks"),
        and(where("assignedTo", "==", userId), where("projectId", "==", projectId)),
      ));
      for (let offset = 0; offset < assignedTasks.docs.length; offset += 400) {
        const batch = writeBatch(db);
        const chunk = assignedTasks.docs.slice(offset, offset + 400);
        for (const task of chunk) {
          batch.update(task.ref, { assignedTo: null, updatedAt: serverTimestamp() });
        }
        await batch.commit();
        await Promise.all(chunk.map((task) => createHistory({
          userId: null,
          taskId: task.id,
          projectId,
          action: getHistoryAction.update,
          eventType: getHistoryEventType.assignedTo,
          previousValue: deletedUserSummary,
          newValue: null,
        })));
      }
    }

    const batch = writeBatch(db);
    batch.delete(ref);
    if (projectId) deleteProjectMembershipInBatch(batch, projectId, userId);
    await batch.commit();
  }

  const orphanedMemberships = await getDocs(query(collection(db, "projectMembers"), where("userId", "==", userId)));
  for (let offset = 0; offset < orphanedMemberships.docs.length; offset += 400) {
    const batch = writeBatch(db);
    for (const membership of orphanedMemberships.docs.slice(offset, offset + 400)) batch.delete(membership.ref);
    await batch.commit();
  }

  const userRef = doc(db, "users", userId);
  const [user, publicProfile] = await Promise.all([
    getDoc(userRef),
    getDoc(doc(db, "publicProfiles", userId)),
  ]);
  if (user.exists()) await updateDoc(userRef, { deletedAt: serverTimestamp(), updatedAt: serverTimestamp() });
  if (publicProfile.exists()) await deleteDoc(publicProfile.ref);
}
