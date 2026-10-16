import { NextResponse } from "next/server";
import { addDoc, collection, getDocs, limit, query, serverTimestamp, where } from "@/server/firestore";
import { db } from "@/server/db";
import { getSessionUserId, isRecordValue, requireProjectMembership } from "@/server/authorization";
import { genericErrorMessage, genericErrorStatus, readJsonObject, requiredString } from "@/server/http";

type RouteContext = { params: Promise<{ projectId: string }> };
const OWNER_ROLES = ["Owner"] as const;
const COLOR_PATTERN = /^#[\da-fA-F]{6}$/;

export async function GET(_request: Request, context: RouteContext) {
  try {
    const userId = await getSessionUserId();
    const { projectId } = await context.params;
    await requireProjectMembership({ projectId, userId });

    const snapshot = await getDocs(query(
      collection(db, "labels"),
      where("projectId", "==", projectId),
      limit(50),
    ));
    const data = snapshot.docs.flatMap((label) => {
      const labelData: unknown = label.data();
      return isRecordValue(labelData) && labelData.deletedAt == null
        ? [{ id: label.id, ...labelData }]
        : [];
    });
    return NextResponse.json({ data, message: "Successfully get all label" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { data: null, message: genericErrorMessage(error) },
      { status: genericErrorStatus(error) },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const userId = await getSessionUserId();
    const { projectId } = await context.params;
    await requireProjectMembership({ projectId, userId, allowedRoles: OWNER_ROLES });

    const body = await readJsonObject(request, 4 * 1024);
    const content = requiredString(body.content, "label", 20);
    const backgroundColor = requiredString(body.backgroundColor, "label color", 7);
    if (!COLOR_PATTERN.test(backgroundColor)) {
      return NextResponse.json({ message: "Invalid label color", success: false }, { status: 400 });
    }

    const labels = await getDocs(query(
      collection(db, "labels"),
      where("projectId", "==", projectId),
      limit(11),
    ));
    const activeLabels = labels.docs.filter((label) => {
      const labelData: unknown = label.data();
      return isRecordValue(labelData) && labelData.deletedAt == null;
    });
    if (activeLabels.length >= 10) {
      return NextResponse.json({ message: "Label amount cannot exceed 10", success: false }, { status: 400 });
    }

    const now = serverTimestamp();
    await addDoc(collection(db, "labels"), {
      projectId,
      content,
      backgroundColor,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
    return NextResponse.json({ message: "Successfully added the label", success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: genericErrorMessage(error), success: false },
      { status: genericErrorStatus(error) },
    );
  }
}
