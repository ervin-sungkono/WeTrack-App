/**
 * Resolve a stored attachment path without allowing it to escape its expected
 * project/task folder or configured bucket. Supports raw object paths and the
 * tokenized Firebase URLs written by older uploads.
 */
export function parseTaskAttachmentObjectPath(
  value: unknown,
  options: { bucketName: string; projectId: string; taskId: string },
): string | null {
  if (typeof value !== "string" || value.length === 0 || value.length > 4096) return null;
  const { bucketName, projectId, taskId } = options;
  if (!bucketName || !projectId || !taskId || projectId.includes("/") || taskId.includes("/")) return null;

  let objectName = value;
  try {
    if (value.startsWith("https://")) {
      const url = new URL(value);
      if (url.hostname !== "firebasestorage.googleapis.com") return null;
      const segments = url.pathname.split("/");
      if (segments.length < 6 || segments[1] !== "v0" || segments[2] !== "b" || segments[4] !== "o") return null;
      if (decodeURIComponent(segments[3]) !== bucketName) return null;
      objectName = decodeURIComponent(segments.slice(5).join("/"));
    } else if (value.startsWith("gs://")) {
      const url = new URL(value);
      if (url.protocol !== "gs:" || url.hostname !== bucketName) return null;
      objectName = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
    }
  } catch {
    return null;
  }

  objectName = objectName.replace(/^\/+/, "");
  if (!objectName || objectName.includes("\\") || objectName.includes("\u0000")) return null;
  const segments = objectName.split("/");
  if (segments.some((segment) => segment === "" || segment === "." || segment === "..")) return null;

  const prefixes = [
    `project/${projectId}/tasks/${taskId}/`,
    `projects/${projectId}/tasks/${taskId}/`,
  ];
  return prefixes.some((prefix) => objectName.startsWith(prefix)) ? objectName : null;
}
