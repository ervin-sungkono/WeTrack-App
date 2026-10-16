import type { ProjectRole, FirestoreTimestampLike } from "@/app/types/domain";

export type SortDirection = "asc" | "desc";

export function debounce<TArgs extends readonly unknown[]>(
  callback: (...args: TArgs) => void,
  timeout = 300,
): (...args: TArgs) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => callback(...args), timeout);
  };
}

function dateValue(value: unknown): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") return new Date(value).getTime();
  if (typeof value === "object" && value !== null) {
    if ("toDate" in value && typeof value.toDate === "function") {
      return value.toDate().getTime();
    }
    if ("seconds" in value && typeof value.seconds === "number") {
      return value.seconds * 1000;
    }
  }
  return Number.NaN;
}

function sortNumber(direction: SortDirection): 1 | -1 {
  return direction === "asc" ? 1 : -1;
}

export function sortDateFn<T, K extends keyof T = keyof T>({
  data,
  sortDirection = "asc",
  key = "createdAt" as K,
}: {
  data: T[];
  sortDirection?: SortDirection;
  key?: K;
}): T[] {
  const direction = sortNumber(sortDirection);
  return [...data].sort((left, right) => (dateValue(left[key]) - dateValue(right[key])) * direction);
}

export function sortValueFn<T, K extends keyof T>({
  data,
  sortDirection = "asc",
  key,
}: {
  data: T[];
  sortDirection?: SortDirection;
  key: K;
}): T[] {
  const direction = sortNumber(sortDirection);
  const value = (item: T): number => {
    const field = item[key];
    return typeof field === "number" ? field : Number(field);
  };
  return [...data].sort((left, right) => (value(left) - value(right)) * direction);
}

export function sortDateTimestampFn<T, K extends keyof T = keyof T>({
  data,
  sortDirection = "asc",
  key = "createdAt" as K,
}: {
  data: T[];
  sortDirection?: SortDirection;
  key?: K;
}): T[] {
  return sortDateFn({ data, sortDirection, key });
}

export function validateUserRole({
  userRole,
  minimumRole = "Owner",
}: {
  userRole: ProjectRole | null | undefined;
  minimumRole?: ProjectRole;
}): boolean {
  if (!userRole) return false;
  const roles: ProjectRole[] = ["Viewer", "Member", "Owner"];
  return roles.indexOf(userRole) >= roles.indexOf(minimumRole);
}

export function timestampToMilliseconds(timestamp: FirestoreTimestampLike): number | null {
  const value = dateValue(timestamp);
  return Number.isFinite(value) ? value : null;
}
