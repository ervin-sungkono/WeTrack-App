import { collection, getDocs, limit, query, where } from "@/server/firestore";
import { db } from "@/server/db";
import { getSessionUserId } from "@/server/authorization";
import { genericErrorMessage, genericErrorStatus } from "@/server/http";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const taskId = request.nextUrl.searchParams.get("taskId");
    if (taskId && (taskId.length > 128 || taskId.trim().length === 0)) {
      return NextResponse.json({ data: null, message: "Invalid task ID" }, { status: 400 });
    }

    const histories = collection(db, "histories");
    const historyQuery = taskId
      ? query(histories, where("userId", "==", userId), where("taskId", "==", taskId), limit(200))
      : query(histories, where("userId", "==", userId), limit(200));
    const snapshot = await getDocs(historyQuery);
    const data = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

    return NextResponse.json({ data, message: "Successfully retrieved histories" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { data: null, message: genericErrorMessage(error) },
      { status: genericErrorStatus(error) },
    );
  }
}
