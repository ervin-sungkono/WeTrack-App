import { NextResponse } from "next/server";
import { doc, runTransaction } from "@/server/firestore";
import { db } from "@/server/db";
import { AuthorizationError, getSessionUser, isRecordValue } from "@/server/authorization";
import { genericErrorMessage, genericErrorStatus, readJsonObject, RequestValidationError, requiredString } from "@/server/http";
import { createHistory } from "@/server/data/util";
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history";

type RouteContext = { params: Promise<{ projectId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    const { projectId } = await context.params;
    if (!projectId || projectId.length > 128 || projectId.includes("/")) {
      return NextResponse.json({ success: false, message: "Invalid project" }, { status: 400 });
    }
    const body = await readJsonObject(request, 1024);
    if (Object.keys(body).some((key) => key !== "teamId")) {
      throw new RequestValidationError(400, "Unsupported invitation field");
    }
    const teamId = requiredString(body.teamId, "team ID", 128);
    if (teamId.includes("/")) throw new RequestValidationError(400, "Invalid team ID");

    const currentEmail = sessionUser.email?.trim().toLowerCase() ?? "";
    const invitationRef = doc(db, "teams", teamId);
    const projectRef = doc(db, "projects", projectId);
    await runTransaction(db, async (transaction) => {
      const [currentInvitation, currentProject] = await Promise.all([
        transaction.get(invitationRef),
        transaction.get(projectRef),
      ]);
      const currentData: unknown = currentInvitation.data();
      const currentProjectData: unknown = currentProject.data();
      if (
        !currentInvitation.exists() ||
        !isRecordValue(currentData) ||
        currentData.projectId !== projectId ||
        currentData.userId !== sessionUser.uid ||
        currentData.status !== "pending" ||
        currentData.deletedAt != null ||
        !isRecordValue(currentProjectData) ||
        currentProjectData.deletedAt != null
      ) {
        throw new AuthorizationError(404, "Invitation not found");
      }
      if (!currentEmail || typeof currentData.email !== "string" || currentData.email.trim().toLowerCase() !== currentEmail) {
        throw new AuthorizationError(404, "Invitation not found");
      }
      transaction.delete(invitationRef);
    });
    await createHistory({
      userId: sessionUser.uid,
      projectId,
      action: getHistoryAction.delete,
      eventType: getHistoryEventType.invitation,
    });
    return NextResponse.json({
      success: true,
      message: "Successfully reject new member invitation to team",
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: genericErrorMessage(error) },
      { status: genericErrorStatus(error) },
    );
  }
}
