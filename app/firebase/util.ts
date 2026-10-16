"use client";

import {
  and,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type CollectionReference,
  type DocumentReference,
  type Query,
} from "firebase/firestore";
import { getSession } from "next-auth/react";
import { db } from "@/app/firebase/config";
import type { PublicProfile } from "@/app/types/auth";
import type {
  Attachment,
  ChatMessage,
  Comment,
  EntityId,
  FirestoreTimestampLike,
  HistoryEntry,
  Label,
  Notification,
  Project,
  ProjectRole,
  Task,
  TaskStatus,
  TeamMember,
} from "@/app/types/domain";

interface ProjectMembershipDocument {
  projectId: EntityId;
  userId: EntityId;
  role: ProjectRole;
  updatedAt?: FirestoreTimestampLike;
}

type Stored<T extends { id: string }> = Omit<T, "id">;

interface ClientDocumentMap {
  tasks: Stored<Task>;
  projects: Stored<Project>;
  teams: Stored<TeamMember>;
  taskStatuses: Stored<TaskStatus>;
  labels: Stored<Label>;
  comments: Stored<Comment>;
  attachments: Stored<Attachment>;
  chats: Stored<ChatMessage>;
  chatSummaries: { taskId: EntityId; projectId: EntityId; content: string; createdAt?: FirestoreTimestampLike };
  histories: Stored<HistoryEntry>;
  notifications: Stored<Notification>;
  publicProfiles: PublicProfile;
  projectMembers: ProjectMembershipDocument;
}

type ClientCollectionName = keyof ClientDocumentMap | "users";
type TaskScopedCollectionName = "comments" | "histories" | "attachments" | "chats" | "chatSummaries";
type ResolvedCollection<K extends ClientCollectionName> = K extends "users" ? "publicProfiles" : K;
type DocumentFor<K extends ClientCollectionName> = K extends "users"
  ? ClientDocumentMap["publicProfiles"]
  : K extends keyof ClientDocumentMap
    ? ClientDocumentMap[K]
    : never;

const collectionAliases: Record<ClientCollectionName, keyof ClientDocumentMap> = {
  tasks: "tasks",
  projects: "projects",
  teams: "teams",
  taskStatuses: "taskStatuses",
  labels: "labels",
  comments: "comments",
  attachments: "attachments",
  chats: "chats",
  chatSummaries: "chatSummaries",
  histories: "histories",
  notifications: "notifications",
  publicProfiles: "publicProfiles",
  projectMembers: "projectMembers",
  users: "publicProfiles",
};

function getCollection<K extends ClientCollectionName>(name: K): CollectionReference<DocumentFor<K>> {
  const path: ResolvedCollection<K> = collectionAliases[name] as ResolvedCollection<K>;
  return collection(db, path) as CollectionReference<DocumentFor<K>>;
}

export function getTaskReferenceOrderBy({ field, id, orderByKey }: {
  field: string;
  id: string;
  orderByKey: string;
}): Query<ClientDocumentMap["tasks"]> {
  return query(
    getCollection("tasks"),
    and(where(field, "==", id), where("type", "==", "Task"), where("deletedAt", "==", null)),
    orderBy(orderByKey),
  );
}

export function getNewNotificationReference({ id }: { id: string }): Query<ClientDocumentMap["notifications"]> {
  return query(
    getCollection("notifications"),
    and(where("userId", "==", id), where("status", "==", "new")),
    limit(1),
  );
}

export function getQueryReferenceOrderBy<K extends ClientCollectionName>({
  collectionName,
  field,
  id,
  orderByKey,
}: {
  collectionName: K;
  field: string;
  id: string;
  orderByKey: string;
}): Query<DocumentFor<K>> {
  return query(getCollection(collectionName), where(field, "==", id), orderBy(orderByKey));
}

export function getQueryReference<K extends ClientCollectionName>({
  collectionName,
  field,
  id,
}: {
  collectionName: K;
  field: string;
  id: string;
}): Query<DocumentFor<K>> {
  return query(getCollection(collectionName), where(field, "==", id));
}

export function getTaskScopedQueryReference<K extends TaskScopedCollectionName>({
  collectionName,
  taskId,
  projectId,
}: {
  collectionName: K;
  taskId: string;
  projectId: string;
}): Query<DocumentFor<K>> {
  return query(
    getCollection(collectionName),
    and(where("taskId", "==", taskId), where("projectId", "==", projectId)),
  );
}

/**
 * Build a team query that the Firestore privacy rules can prove is readable.
 * Pending invitations contain private email addresses, so only owners may
 * subscribe to them. Other members see accepted memberships only.
 */
export function getProjectTeamQueryReference({
  projectId,
  includePending = false,
}: {
  projectId: string;
  includePending?: boolean;
}): Query<ClientDocumentMap["teams"]> {
  const statuses = includePending ? ["accepted", "pending"] : ["accepted"];
  return query(
    getCollection("teams"),
    and(where("projectId", "==", projectId), where("status", "in", statuses)),
  );
}

export function getSubtaskQueryReference({
  parentId,
  projectId,
  orderByKey,
}: {
  parentId: string;
  projectId: string;
  orderByKey?: string;
}): Query<ClientDocumentMap["tasks"]> {
  const filters = and(where("parentId", "==", parentId), where("projectId", "==", projectId));
  return orderByKey
    ? query(getCollection("tasks"), filters, orderBy(orderByKey))
    : query(getCollection("tasks"), filters);
}

export function getDocumentReference<K extends ClientCollectionName>({
  collectionName,
  id,
}: {
  collectionName: K;
  id: string;
}): DocumentReference<DocumentFor<K>> {
  return doc(getCollection(collectionName), id);
}

function isProjectRole(value: unknown): value is ProjectRole {
  return value === "Owner" || value === "Member" || value === "Viewer";
}

export async function getProjectRole({ projectId, userId }: {
  projectId: string;
  userId?: string | null;
}): Promise<ProjectRole | null> {
  if (!projectId || !userId) return null;
  const membershipQuery = query(
    getCollection("projectMembers"),
    and(where("projectId", "==", projectId), where("userId", "==", userId)),
  );
  const memberships = await getDocs(membershipQuery);
  const role: unknown = memberships.docs[0]?.data().role;
  return isProjectRole(role) ? role : null;
}

export async function getContentAuthorization({ projectId }: { projectId: string }): Promise<boolean> {
  if (!projectId) return false;
  const session = await getSession();
  const userId = session?.user?.uid;
  if (!userId) return false;
  return (await getProjectRole({ projectId, userId })) !== null;
}
