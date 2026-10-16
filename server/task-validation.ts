import type { TaskPriority } from "@/app/types/domain";

export type TaskKind = "Task" | "SubTask";

export type TaskCreateInput = {
  projectId: string;
  assignedTo: string | null;
  type: TaskKind;
  parentId: string | null;
  taskName: string;
  labels: string[];
  statusId: string;
  priority: TaskPriority;
  description: string | null;
  startDate: string | null;
  dueDate: string | null;
};

export type TaskUpdateInput = Partial<
  Pick<
    TaskCreateInput,
    | "assignedTo"
    | "parentId"
    | "taskName"
    | "labels"
    | "priority"
    | "description"
    | "startDate"
    | "dueDate"
  >
>;

import { RequestValidationError } from "@/server/http";

export class TaskValidationError extends RequestValidationError {
  constructor(message: string) {
    super(400, message);
    this.name = "TaskValidationError";
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function rejectUnknownKeys(value: Record<string, unknown>, allowed: readonly string[]) {
  const unsupported = Object.keys(value).find((key) => !allowed.includes(key));
  if (unsupported) throw new TaskValidationError(`Unsupported field: ${unsupported}`);
}

export function requiredId(value: unknown, field: string): string {
  if (typeof value !== "string") throw new TaskValidationError(`${field} is required`);
  const id = value.trim();
  if (!id || id.length > 128 || id.includes("/")) {
    throw new TaskValidationError(`${field} is invalid`);
  }
  return id;
}

function optionalId(value: unknown, field: string): string | null {
  if (value === undefined || value === null || value === "") return null;
  return requiredId(value, field);
}

function requiredText(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string") throw new TaskValidationError(`${field} is required`);
  const text = value.trim();
  if (!text || text.length > maxLength) {
    throw new TaskValidationError(`${field} must contain 1 to ${maxLength} characters`);
  }
  return text;
}

function optionalText(value: unknown, field: string, maxLength: number): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") throw new TaskValidationError(`${field} must be text`);
  if (value.length > maxLength) throw new TaskValidationError(`${field} is too long`);
  return value;
}

function optionalDate(value: unknown, field: string): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.length > 40 || !Number.isFinite(Date.parse(value))) {
    throw new TaskValidationError(`${field} must be a valid date`);
  }
  return value;
}

function optionalPriority(value: unknown): TaskPriority | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 3) {
    throw new TaskValidationError("priority must be an integer from 0 to 3");
  }
  return value as TaskPriority;
}

function labels(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > 10) {
    throw new TaskValidationError("labels must be an array of at most 10 ids");
  }
  const parsed = value.map((label, index) => requiredId(label, `labels[${index}]`));
  return [...new Set(parsed)];
}

function validateDateRange(startDate: string | null, dueDate: string | null) {
  if (startDate && dueDate && Date.parse(dueDate) < Date.parse(startDate)) {
    throw new TaskValidationError("dueDate must not be before startDate");
  }
}

export function parseTaskCreateInput(value: unknown): TaskCreateInput {
  if (!isRecord(value)) throw new TaskValidationError("Request body must be an object");
  rejectUnknownKeys(value, [
    "projectId", "assignedTo", "type", "parentId", "taskName", "labels", "statusId",
    "priority", "description", "startDate", "dueDate",
  ]);

  const type = value.type;
  if (type !== "Task" && type !== "SubTask") throw new TaskValidationError("type is invalid");
  const startDate = optionalDate(value.startDate, "startDate");
  const dueDate = optionalDate(value.dueDate, "dueDate");
  validateDateRange(startDate, dueDate);

  const parsed: TaskCreateInput = {
    projectId: requiredId(value.projectId, "projectId"),
    assignedTo: optionalId(value.assignedTo, "assignedTo"),
    type,
    parentId: optionalId(value.parentId, "parentId"),
    taskName: requiredText(value.taskName, "taskName", 50),
    labels: labels(value.labels),
    statusId: requiredId(value.statusId, "statusId"),
    priority: optionalPriority(value.priority) ?? 0,
    description: optionalText(value.description, "description", 1000),
    startDate,
    dueDate,
  };

  if (parsed.type === "Task" && parsed.parentId) {
    throw new TaskValidationError("A task cannot have a parent task");
  }
  if (parsed.type === "SubTask" && !parsed.parentId) {
    throw new TaskValidationError("A subtask must have a parent task");
  }
  return parsed;
}

export function parseTaskUpdateInput(value: unknown): TaskUpdateInput {
  if (!isRecord(value)) throw new TaskValidationError("Request body must be an object");
  rejectUnknownKeys(value, [
    "assignedTo", "parentId", "taskName", "labels", "priority", "description", "startDate", "dueDate",
  ]);

  const result: TaskUpdateInput = {};
  if ("assignedTo" in value) result.assignedTo = optionalId(value.assignedTo, "assignedTo");
  if ("parentId" in value) result.parentId = optionalId(value.parentId, "parentId");
  if ("taskName" in value) result.taskName = requiredText(value.taskName, "taskName", 50);
  if ("labels" in value) result.labels = labels(value.labels);
  if ("priority" in value) result.priority = optionalPriority(value.priority);
  if ("description" in value) result.description = optionalText(value.description, "description", 1000);
  if ("startDate" in value) result.startDate = optionalDate(value.startDate, "startDate");
  if ("dueDate" in value) result.dueDate = optionalDate(value.dueDate, "dueDate");
  validateDateRange(result.startDate ?? null, result.dueDate ?? null);
  return result;
}

export function parseStatusName(value: unknown): string {
  return requiredText(value, "statusName", 20);
}

export function parseBoundedText(value: unknown, field: string, maxLength: number): string {
  return requiredText(value, field, maxLength);
}

export function parseIndex(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0 || value > 100_000) {
    throw new TaskValidationError(`${field} must be a non-negative integer`);
  }
  return value;
}

export function parseTaskKind(value: unknown): TaskKind {
  if (value !== "Task" && value !== "SubTask") throw new TaskValidationError("type is invalid");
  return value;
}
