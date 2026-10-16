import "server-only";

import { FieldPath } from "firebase-admin/firestore";
import type { FileMetadata } from "@google-cloud/storage";
import { db, getAdminBucket } from "@/server/db";
import { parseTaskAttachmentObjectPath } from "@/server/attachment-storage-path";

const pageSize = 200;
const applyChanges = process.argv.includes("--apply");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNotFound(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) return false;
  return error.code === 404 || error.code === "404" || error.code === "storage/object-not-found";
}

async function migrate(): Promise<void> {
  const bucket = getAdminBucket();
  const attachmentCollection = db.collection("attachments");
  let cursor: FirebaseFirestore.QueryDocumentSnapshot | undefined;
  let scanned = 0;
  let valid = 0;
  let tokensFound = 0;
  let tokensRemoved = 0;
  let missingObjects = 0;
  let invalidRecords = 0;

  while (true) {
    let pageQuery = attachmentCollection.orderBy(FieldPath.documentId()).limit(pageSize);
    if (cursor) pageQuery = pageQuery.startAfter(cursor);
    const page = await pageQuery.get();
    if (page.empty) break;
    scanned += page.size;

    for (const attachmentDoc of page.docs) {
      const data: unknown = attachmentDoc.data();
      if (!isRecord(data) || typeof data.projectId !== "string" || typeof data.taskId !== "string") {
        invalidRecords += 1;
        continue;
      }
      const objectName = parseTaskAttachmentObjectPath(data.attachmentStoragePath, {
        bucketName: bucket.name,
        projectId: data.projectId,
        taskId: data.taskId,
      });
      if (!objectName) {
        invalidRecords += 1;
        continue;
      }
      valid += 1;

      const file = bucket.file(objectName);
      let metadata: FileMetadata;
      try {
        [metadata] = await file.getMetadata();
      } catch (error) {
        if (isNotFound(error)) {
          missingObjects += 1;
          continue;
        }
        throw error;
      }

      const customMetadata = metadata.metadata ?? {};
      if (!("firebaseStorageDownloadTokens" in customMetadata)) continue;
      tokensFound += 1;
      if (applyChanges) {
        await file.setMetadata({ metadata: { firebaseStorageDownloadTokens: null } });
        tokensRemoved += 1;
      }
    }

    cursor = page.docs[page.docs.length - 1];
    if (page.size < pageSize) break;
  }

  console.log(JSON.stringify({
    mode: applyChanges ? "apply" : "dry-run",
    scanned,
    valid,
    tokensFound,
    tokensRemoved,
    missingObjects,
    invalidRecords,
  }, null, 2));
}

void migrate().catch((error: unknown) => {
  console.error("Attachment privacy migration failed", error);
  process.exitCode = 1;
});
