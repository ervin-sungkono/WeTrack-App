import { collection, doc, getDoc, getDocs, limit, query, where } from "@/server/firestore";
import { db } from "@/server/db";
import { getSessionUserId, isRecordValue } from "@/server/authorization";
import { genericErrorMessage, genericErrorStatus } from "@/server/http";
import { projectRoleIsAllowed } from "@/server/project-access-policy";
import { NextResponse } from "next/server";

function timestampMillis(value: unknown): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") return Date.parse(value) || 0;
  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    if (typeof record.toMillis === "function") {
      try {
        const result: unknown = record.toMillis.call(value);
        return typeof result === "number" ? result : 0;
      } catch {
        return 0;
      }
    }
    if (typeof record.seconds === "number") return record.seconds * 1000;
  }
  return 0;
}

export async function GET() {
  try {
    const userId = await getSessionUserId();
    const teamSnapshot = await getDocs(query(
      collection(db, "teams"),
      where("userId", "==", userId),
      where("status", "==", "accepted"),
      limit(100),
    ));
    const projectIds = [...new Set(teamSnapshot.docs.flatMap((team) => {
      const data: unknown = team.data();
      return isRecordValue(data) && data.deletedAt == null && projectRoleIsAllowed(data.role) && typeof data.projectId === "string"
        ? [data.projectId]
        : [];
    }))];
    const projectResults: Array<(Record<string, unknown> & { id: string }) | null> = await Promise.all(projectIds.map(async (projectId) => {
      const projectSnap = await getDoc(doc(db, "projects", projectId));
      const data: unknown = projectSnap.exists() ? projectSnap.data() : null;
      if (!isRecordValue(data) || data.deletedAt != null) return null;
      return { ...data, id: projectSnap.id };
    }));
    const projects = projectResults
      .filter((project): project is Record<string, unknown> & { id: string } => project !== null)
      .sort((left, right) => timestampMillis(right.createdAt) - timestampMillis(left.createdAt))
      .slice(0, 3);

    return NextResponse.json({ data: projects, message: "Projects retrieved successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { data: null, message: genericErrorMessage(error) },
      { status: genericErrorStatus(error) },
    );
  }
}
