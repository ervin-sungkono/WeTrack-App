import type {
  Label,
  Project,
  PublicUserProfile,
  FirestoreTimestampLike,
  HistoryEntry,
  Notification,
  Task,
  TaskStatus,
  TaskType,
  TaskView,
  UserSummary,
} from "@/app/types/domain"

/** Task fields after the client has joined public user and label records. */
export type PopulatedTask = Pick<Task, "id" | "projectId" | "taskName" | "type"> & {
  type: TaskType
  assignedTo?: string | UserSummary | null
  labels?: Array<string | Label> | null
  displayId?: number
  status?: string | TaskStatus | null
  priority?: number | null
  description?: string | null
  startDate?: FirestoreTimestampLike
  dueDate?: FirestoreTimestampLike
  finishedDate?: FirestoreTimestampLike
  order?: number
  createdAt?: FirestoreTimestampLike
}

export type TaskListTask = Omit<TaskView, "assignedTo"> & {
  assignedTo?: UserSummary | null
  labels?: Array<string | Label> | null
}

export type BoardTask = Omit<TaskView, "assignedTo" | "labels" | "status" | "priority"> & {
  assignedTo?: UserSummary | null
  labels?: Label[] | null
  status: string
  priority?: number | null
}

export interface PlaceholderProperties {
  clientHeight?: number
  clientWidth?: number
  clientX?: number
  clientY?: number
}

export type DashboardTask = PopulatedTask & {
  status?: Pick<TaskStatus, "statusName"> | null
}

export type DashboardProject = Pick<Project, "id" | "key" | "projectName" | "createdAt"> & {
  tasks: DashboardTask[]
  startStatus?: string | null
  endStatus?: string | null
}

export interface SelectOption<Value extends string | number | null = string> {
  label: string
  value: Value
}

export type HistoryRow = Pick<
  HistoryEntry,
  "id" | "eventType" | "action" | "taskId" | "projectId" | "userId" |
    "previousValue" | "newValue" | "deletedValue" | "createdAt"
> & {
  task?: { id: string; taskName?: string } | null
  project?: { id: string; projectName?: string } | null
}

export type NotificationRow = Pick<Notification, "id" | "userId" | "type" | "status" | "createdAt"> & {
  projectId?: string | null
  taskId?: string | null
  senderId?: string | null
  project?: { id?: string; projectName?: string } | null
  task?: { id?: string; taskName?: string } | null
  sender?: PublicUserProfile | null
  newValue?: unknown
}
