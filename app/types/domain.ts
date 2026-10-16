import type { Timestamp } from "firebase/firestore";
import type { ProfileImage as AuthProfileImage } from "@/app/types/auth";
import type { PublicProfile as AuthPublicProfile } from "@/app/types/auth";

export type EntityId = string;

/** Firestore values read on the client and their JSON-serialized API forms. */
export type FirestoreTimestampLike =
  | Timestamp
  | Date
  | string
  | number
  | { seconds: number; nanoseconds: number; toDate?: () => Date }
  | null;

export type ProjectRole = "Owner" | "Member" | "Viewer";
export type TeamInvitationStatus = "pending" | "accepted" | "rejected";
export type TaskType = "Task" | "SubTask";
export type TaskPriority = 0 | 1 | 2 | 3;

export interface TimestampFields {
  createdAt?: FirestoreTimestampLike;
  updatedAt?: FirestoreTimestampLike;
  deletedAt?: FirestoreTimestampLike;
}

export type ProfileImage = AuthProfileImage;

export interface UserSummary {
  id: EntityId;
  fullName?: string;
  profileImage?: ProfileImage | string | null;
}

/** Public fields safe to use for collaborators and profile UI. */
export interface PublicUserProfile extends AuthPublicProfile {
  id?: EntityId;
  uid?: EntityId;
}

/** Fields stored on a task, plus optional denormalized API response fields. */
export interface Task extends TimestampFields {
  id: EntityId;
  projectId: EntityId;
  taskName: string;
  type: TaskType;
  description?: string | null;
  status?: EntityId | null;
  statusId?: EntityId;
  priority?: number | null;
  assignedTo?: EntityId | null;
  assignedToDetails?: UserSummary | null;
  createdBy?: EntityId;
  createdByDetails?: UserSummary | null;
  parentId?: EntityId | null;
  labels?: EntityId[] | null;
  startDate?: FirestoreTimestampLike;
  dueDate?: FirestoreTimestampLike;
  finishedDate?: FirestoreTimestampLike;
  order?: number;
  displayId?: number;
  subTasks?: Array<Pick<Task, "id" | "taskName">>;
}

/** A task after an API or realtime read has hydrated referenced records. */
export interface TaskView extends Omit<Task, "assignedTo" | "createdBy" | "status" | "labels"> {
  assignedTo?: EntityId | UserSummary | null;
  createdBy?: EntityId | UserSummary | null;
  status?: EntityId | TaskStatus | null;
  labels?: Array<EntityId | Label> | null;
  assignedToData?: UserSummary | null;
  statusData?: TaskStatus | null;
  labelsData?: string | Label[] | null;
  parentTaskData?: Pick<Task, "id" | "taskName"> | null;
}

export interface Project extends TimestampFields {
  id: EntityId;
  projectName: string;
  key: string;
  createdBy?: EntityId | UserSummary;
  description?: string | null;
  startStatus?: EntityId | null;
  endStatus?: EntityId | null;
  projectRole?: ProjectRole;
}

export interface TeamMember extends TimestampFields {
  id: EntityId;
  projectId: EntityId;
  userId: EntityId;
  email?: string;
  role: ProjectRole;
  status: TeamInvitationStatus;
  user?: UserSummary | null;
}

export interface TaskStatus extends TimestampFields {
  id: EntityId;
  projectId?: EntityId;
  statusName?: string;
  status?: string;
  order?: number;
}

export interface Label extends TimestampFields {
  id: EntityId;
  projectId: EntityId;
  content: string;
  backgroundColor: string;
}

export interface Comment extends TimestampFields {
  id: EntityId;
  taskId: EntityId;
  projectId?: EntityId;
  userId: EntityId;
  commentText: string;
  user?: UserSummary | null;
  task?: Pick<Task, "id" | "taskName"> | null;
}

export interface Attachment extends TimestampFields {
  id: EntityId;
  taskId: EntityId;
  projectId?: EntityId;
  originalFileName: string;
  attachmentStoragePath: string;
}

export interface ChatMessage extends TimestampFields {
  id: EntityId;
  taskId: EntityId;
  projectId?: EntityId;
  senderId: EntityId | null;
  role: "user" | "assistant";
  content: string;
  sender?: UserSummary | null;
}

export interface HistoryEntry extends TimestampFields {
  id: EntityId;
  taskId?: EntityId | null;
  projectId?: EntityId | null;
  userId?: EntityId | null;
  eventType: string;
  action: string;
  user?: UserSummary | null;
  task?: Pick<Task, "id" | "taskName"> | null;
  project?: Pick<Project, "id" | "projectName"> | null;
  previousValue?: unknown;
  newValue?: unknown;
  deletedValue?: unknown;
}

export interface Notification extends TimestampFields {
  id: EntityId;
  userId: EntityId;
  senderId?: EntityId | null;
  projectId: EntityId;
  taskId?: EntityId | null;
  type: string;
  status?: string;
  sender?: UserSummary | null;
  task?: Pick<Task, "id" | "taskName"> | null;
  project?: Pick<Project, "id" | "projectName"> | null;
  newValue?: unknown;
}

export interface ProjectDraft {
  projectName?: string;
  key?: string;
  startStatus?: EntityId | null;
  endStatus?: EntityId | null;
  teams?: string;
  templateType?: string;
}
