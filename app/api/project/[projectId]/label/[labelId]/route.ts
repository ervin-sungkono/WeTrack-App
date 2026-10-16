import { NextResponse } from "next/server";
import {
  arrayRemove,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "@/server/firestore";
import { db } from "@/server/db";
import { getSessionUserId, isRecordValue, requireProjectMembership } from "@/server/authorization";
import { genericErrorMessage, genericErrorStatus, readJsonObject, requiredString, RequestValidationError } from "@/server/http";
import { isDocumentSafeId } from "@/server/project-access-policy";

type RouteContext = { params: Promise<{ projectId: string; labelId: string }> };
const OWNER_ROLES = ["Owner"] as const;
const COLOR_PATTERN = /^#[\da-fA-F]{6}$/;

async function getOwnedLabel(projectId: string, labelId: string) {
  if (!isDocumentSafeId(projectId) || !isDocumentSafeId(labelId)) return null;
  const labelSnap = await getDoc(doc(db, "labels", labelId));
  const labelData: unknown = labelSnap.exists() ? labelSnap.data() : null;
  if (!isRecordValue(labelData) || labelData.projectId !== projectId || labelData.deletedAt != null) return null;
  return { ref: labelSnap.ref, data: labelData };
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const userId = await getSessionUserId();
    const { projectId, labelId } = await context.params;
    await requireProjectMembership({ projectId, userId, allowedRoles: OWNER_ROLES });
    const label = await getOwnedLabel(projectId, labelId);
    if (!label) return NextResponse.json({ message: "Label not found", success: false }, { status: 404 });

    const body = await readJsonObject(request, 4 * 1024);
    const content = requiredString(body.content, "label", 20);
    const backgroundColor = requiredString(body.backgroundColor, "label color", 7);
    if (!COLOR_PATTERN.test(backgroundColor)) {
      return NextResponse.json({ message: "Invalid label color", success: false }, { status: 400 });
    }

    await updateDoc(label.ref, { content, backgroundColor, updatedAt: serverTimestamp() });
    return NextResponse.json({ message: "Successfully updated the label", success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: genericErrorMessage(error), success: false },
      { status: genericErrorStatus(error) },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const userId = await getSessionUserId();
    const { projectId, labelId } = await context.params;
    await requireProjectMembership({ projectId, userId, allowedRoles: OWNER_ROLES });
    const label = await getOwnedLabel(projectId, labelId);
    if (!label) return NextResponse.json({ message: "Label not found", success: false }, { status: 404 });

    const tasks = await getDocs(query(
      collection(db, "tasks"),
      where("projectId", "==", projectId),
      where("labels", "array-contains", labelId),
      limit(501),
    ));
    if (tasks.docs.length > 499) {
      throw new RequestValidationError(409, "This label is used by too many tasks to delete at once");
    }

    const batch = writeBatch(db);
    tasks.docs.forEach((task) => batch.update(task.ref, { labels: arrayRemove(labelId) }));
    batch.delete(label.ref);
    await batch.commit();
    return NextResponse.json({ message: "Successfully removed the label", success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: genericErrorMessage(error), success: false },
      { status: genericErrorStatus(error) },
    );
  }
}
