export type GeneratedTask = {
  taskName: string;
  priority: number;
  description: string;
};

/** Keeps model output within the same limits accepted by the task creation API. */
export function parseGeneratedTasks(value: unknown): GeneratedTask[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 30) return null;
  const tasks: GeneratedTask[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) return null;
    const record = item as Record<string, unknown>;
    if (typeof record.taskName !== "string" || record.taskName.trim().length === 0 || record.taskName.length > 160) return null;
    if (typeof record.description !== "string" || record.description.length > 1200) return null;
    if (typeof record.priority !== "number" || !Number.isInteger(record.priority) || record.priority < 0 || record.priority > 3) return null;

    const taskName = record.taskName.trim().slice(0, 50).trimEnd();
    const description = record.description.slice(0, 1000).trimEnd();
    if (!taskName) return null;
    tasks.push({ taskName, priority: record.priority, description });
  }
  return tasks;
}
