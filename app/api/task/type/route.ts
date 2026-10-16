import { NextResponse } from "next/server";
import { collection, getDocs } from "@/server/firestore";
import { db } from "@/server/db";
import { getSessionUserId } from "@/server/authorization";
import { asRecord, taskErrorResponse } from "@/server/task-api";

export async function GET() {
  try {
    await getSessionUserId();
    const taskTypes = await getDocs(collection(db, "taskTypes"));
    return NextResponse.json({
      data: taskTypes.docs.map((item) => ({
        id: item.id,
        taskType: asRecord(item.data()).taskType,
      })),
      message: "Succesfully get all available task types",
    });
  } catch (error) {
    return taskErrorResponse(error);
  }
}
