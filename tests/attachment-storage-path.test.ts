import assert from "node:assert/strict";
import test from "node:test";
import { parseTaskAttachmentObjectPath } from "../server/attachment-storage-path";

const scope = { bucketName: "wetrack.appspot.com", projectId: "project-1", taskId: "task-1" };
const objectPath = "project/project-1/tasks/task-1/abc123-report.pdf";

test("accepts scoped raw paths and legacy Firebase download URLs", () => {
  assert.equal(parseTaskAttachmentObjectPath(objectPath, scope), objectPath);
  assert.equal(parseTaskAttachmentObjectPath(`/${objectPath}`, scope), objectPath);
  assert.equal(
    parseTaskAttachmentObjectPath(
      `https://firebasestorage.googleapis.com/v0/b/${scope.bucketName}/o/${encodeURIComponent(objectPath)}?alt=media&token=legacy-token`,
      scope,
    ),
    objectPath,
  );
});

test("accepts the legacy plural storage folder only for the requested task", () => {
  const legacyPath = "projects/project-1/tasks/task-1/old-document.pdf";
  assert.equal(parseTaskAttachmentObjectPath(legacyPath, scope), legacyPath);
  assert.equal(parseTaskAttachmentObjectPath("projects/project-1/tasks/task-2/file.pdf", scope), null);
});

test("rejects cross-bucket, cross-project, and cross-task paths", () => {
  assert.equal(parseTaskAttachmentObjectPath("project/project-2/tasks/task-1/file.pdf", scope), null);
  assert.equal(parseTaskAttachmentObjectPath("project/project-1/tasks/task-2/file.pdf", scope), null);
  assert.equal(
    parseTaskAttachmentObjectPath(
      `https://firebasestorage.googleapis.com/v0/b/other.appspot.com/o/${encodeURIComponent(objectPath)}?alt=media&token=token`,
      scope,
    ),
    null,
  );
});

test("rejects malformed URLs, traversal segments, and unrelated values", () => {
  assert.equal(parseTaskAttachmentObjectPath("https://evil.example/file.pdf", scope), null);
  assert.equal(parseTaskAttachmentObjectPath("project/project-1/tasks/task-1/../secret.pdf", scope), null);
  assert.equal(parseTaskAttachmentObjectPath("project/project-1/tasks/task-1\\secret.pdf", scope), null);
  assert.equal(parseTaskAttachmentObjectPath(null, scope), null);
});
