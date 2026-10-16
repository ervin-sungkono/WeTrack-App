import { generateTaskByPrompt } from "@/app/lib/OpenAIFunctions";
import { getSessionUserId } from "@/server/authorization";
import { consumeAiQuota } from "@/server/rate-limit";
import { QuotaExceededError } from "@/server/quota-policy";
import { genericErrorMessage, genericErrorStatus, readJsonObject, requiredString } from "@/server/http";
import { parseGeneratedTasks } from "@/server/generated-task-validation";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    const body = await readJsonObject(request, 8 * 1024);
    const projectDescription = requiredString(body.projectDescription, "project description", 2000, 30);

    await consumeAiQuota(userId);
    const completion = await generateTaskByPrompt(projectDescription, 768);
    const content: unknown = completion?.message?.content;
    if (typeof content !== "string") throw new Error("Invalid model response");

    let generated: unknown;
    try {
      generated = JSON.parse(content);
    } catch {
      throw new Error("Invalid model response");
    }
    if (typeof generated !== "object" || generated === null || Array.isArray(generated)) {
      throw new Error("Invalid model response");
    }
    const result = generated as Record<string, unknown>;
    if (result.data === null) {
      return NextResponse.json({
        message: "Gagal untuk menghasilkan tugas dari deskripsi proyek yang diberikan, silakan coba lagi!",
        success: false,
      }, { status: 502 });
    }
    const data = parseGeneratedTasks(result.data);
    if (!data) throw new Error("Invalid model response");

    return NextResponse.json({ data, success: true }, { status: 200 });
  } catch (error) {
    const status = genericErrorStatus(error);
    const message = status === 500
      ? "Gagal menghasilkan tugas. Silakan coba lagi."
      : genericErrorMessage(error);
    return NextResponse.json({ message, success: false }, {
      status,
      ...(error instanceof QuotaExceededError ? { headers: { "Retry-After": String(error.retryAfter) } } : {}),
    });
  }
}
