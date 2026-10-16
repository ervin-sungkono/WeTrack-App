import { NextResponse } from "next/server";
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp, where } from "@/server/firestore";
import { db } from "@/server/db";
import { getSessionUserId } from "@/server/authorization";
import { generateChatResponse } from "@/app/lib/OpenAIFunctions";
import { consumeAiQuota } from "@/server/rate-limit";
import { readJsonObject } from "@/server/http";
import { parseBoundedText } from "@/server/task-validation";
import {
  asRecord,
  authorizeTask,
  TASK_WRITE_ROLES,
  taskErrorResponse,
  type RouteContext,
} from "@/server/task-api";

type TaskParams = { taskId: string };

export async function POST(request: Request, context: RouteContext<TaskParams>) {
  try {
    const userId = await getSessionUserId();
    const { taskId: rawTaskId } = await context.params;
    const task = await authorizeTask(rawTaskId, userId, TASK_WRITE_ROLES);
    const body = await readJsonObject(request, 12 * 1024);
    const content = parseBoundedText(body.content, "content", 4000);
    await consumeAiQuota(userId);

    await addDoc(collection(db, "chats"), {
      projectId: task.projectId,
      taskId: task.id,
      role: "user",
      content,
      senderId: userId,
      createdAt: new Date().toISOString(),
    });

    const summaryQuery = query(
      collection(db, "chatSummaries"),
      where("taskId", "==", task.id),
      orderBy("createdAt", "desc"),
      limit(8),
    );
    const summarySnapshot = await getDocs(summaryQuery);
    const summary = summarySnapshot.docs
      .filter((item) => {
        const data = asRecord(item.data());
        return data.taskId === task.id && data.projectId === task.projectId;
      })
      .map((item) => asRecord(item.data()).content)
      .filter((item): item is string => typeof item === "string")
      .reverse()
      .join(",");

    const modelResponse = await generateChatResponse({
      taskDescription: typeof task.data.description === "string" ? task.data.description : null,
      summary,
      content,
    });
    const rawModelContent = modelResponse?.message?.content;
    if (typeof rawModelContent !== "string" || rawModelContent.length > 20_000) {
      throw new Error("The chat response is invalid");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawModelContent);
    } catch {
      throw new Error("The chat response is invalid");
    }
    const parsedResponse = asRecord(parsed);
    const rawResponseChat = parsedResponse.response_chat;
    const rawSummary = parsedResponse.summarized_chat;
    if (typeof rawResponseChat !== "string" || !rawResponseChat.trim() || rawResponseChat.length > 20_000) {
      throw new Error("The chat response is invalid");
    }
    if (typeof rawSummary !== "string" || !rawSummary.trim() || rawSummary.length > 1000) {
      throw new Error("The chat response is invalid");
    }
    const responseChat = rawResponseChat.trim();
    const summarizedChat = rawSummary.trim();

    await addDoc(collection(db, "chats"), {
      projectId: task.projectId,
      taskId: task.id,
      role: "assistant",
      content: responseChat,
      senderId: null,
      createdAt: new Date().toISOString(),
    });
    await addDoc(collection(db, "chatSummaries"), {
      projectId: task.projectId,
      taskId: task.id,
      content: summarizedChat,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true, message: "Successfully create new chat" });
  } catch (error) {
    return taskErrorResponse(error);
  }
}
