import { NextResponse } from "next/server";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "@/server/firestore";
import { db } from "@/server/db";
import { deleteProjectMembershipInBatch, setProjectMembershipInBatch } from "@/server/auth";
import { AuthorizationError, getSessionUser, getSessionUserId, isRecordValue, requireProjectMembership } from "@/server/authorization";
import { genericErrorMessage, genericErrorStatus, readJsonObject, RequestValidationError } from "@/server/http";
import { isDocumentSafeId } from "@/server/project-access-policy";
import { createHistory, createNotification } from "@/server/data/util";
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history";
import { toPublicProfile } from "@/server/security";

type RouteContext = { params: Promise<{ projectId: string; teamId: string }> };
const OWNER_ROLES = ["Owner"] as const;

async function getTeam(projectId: string, teamId: string) {
  if (!isDocumentSafeId(projectId) || !isDocumentSafeId(teamId)) return null;
  const teamSnap = await getDoc(doc(db, "teams", teamId));
  const teamData: unknown = teamSnap.exists() ? teamSnap.data() : null;
  if (
    !isRecordValue(teamData) ||
    teamData.projectId !== projectId ||
    teamData.deletedAt != null ||
    (teamData.status !== "accepted" && teamData.status !== "pending")
  ) return null;
  return { ref: teamSnap.ref, id: teamSnap.id, data: teamData };
}

async function getActiveProject(projectId: string) {
  const projectSnap = await getDoc(doc(db, "projects", projectId));
  const projectData: unknown = projectSnap.exists() ? projectSnap.data() : null;
  return isRecordValue(projectData) && projectData.deletedAt == null;
}

async function getActiveTeamRows(projectId: string, userId: string) {
  const snapshot = await getDocs(query(
    collection(db, "teams"),
    where("projectId", "==", projectId),
    where("userId", "==", userId),
    limit(501),
  ));
  if (snapshot.docs.length >= 501) {
    throw new RequestValidationError(409, "This member has too many membership records to update safely");
  }
  return snapshot.docs.filter((row) => {
    const data: unknown = row.data();
    return isRecordValue(data)
      && data.projectId === projectId
      && data.userId === userId
      && data.deletedAt == null
      && (data.status === "accepted" || data.status === "pending");
  });
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    const userId = sessionUser.uid;
    const { projectId, teamId } = await context.params;
    const team = await getTeam(projectId, teamId);
    if (!team || team.data.userId !== userId || team.data.status !== "pending") {
      return NextResponse.json({ message: "Invitation not found", success: false }, { status: 404 });
    }
    if (!await getActiveProject(projectId)) {
      return NextResponse.json({ message: "Project not found", success: false }, { status: 404 });
    }
    const userEmail = typeof team.data.email === "string" ? team.data.email.trim().toLowerCase() : "";
    const actorEmail = sessionUser.email?.trim().toLowerCase() ?? "";
    if (!userEmail || !actorEmail || userEmail !== actorEmail) {
      return NextResponse.json({ message: "Invitation not found", success: false }, { status: 404 });
    }
    return NextResponse.json({ message: "Team data found", success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: genericErrorMessage(error) },
      { status: genericErrorStatus(error) },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const userId = await getSessionUserId();
    const { projectId, teamId } = await context.params;
    await requireProjectMembership({ projectId, userId, allowedRoles: OWNER_ROLES });
    const team = await getTeam(projectId, teamId);
    if (!team) return NextResponse.json({ message: "Team not found", success: false }, { status: 404 });
    if (typeof team.data.userId !== "string") {
      return NextResponse.json({ message: "Team not found", success: false }, { status: 404 });
    }
    const activeTeamRows = await getActiveTeamRows(projectId, team.data.userId);
    const acceptedRows = activeTeamRows.filter((row) => {
      const data: unknown = row.data();
      return isRecordValue(data) && data.status === "accepted";
    });
    const pendingRows = activeTeamRows.filter((row) => {
      const data: unknown = row.data();
      return isRecordValue(data) && data.status === "pending";
    });
    if (acceptedRows.some((row) => {
      const data: unknown = row.data();
      return isRecordValue(data) && data.role === "Owner";
    })) {
      return NextResponse.json({ message: "Cannot change the project owner role", success: false }, { status: 403 });
    }

    const body = await readJsonObject(request, 4 * 1024);
    if (body.role !== "Member" && body.role !== "Viewer") {
      throw new RequestValidationError(400, "Invalid team role");
    }
    const role = body.role;
    if (team.data.status === "pending" && acceptedRows.length > 0) {
      throw new RequestValidationError(409, "This member has conflicting invitation and membership records");
    }
    const acceptedTarget = team.data.status === "accepted";
    const rowsToUpdate = acceptedTarget ? acceptedRows : pendingRows;
    if (!rowsToUpdate.some((row) => row.id === team.id)) {
      return NextResponse.json({ message: "Team not found", success: false }, { status: 404 });
    }
    const pendingRowsToDelete = acceptedTarget ? pendingRows : [];
    const tasks = role === "Viewer" && acceptedRows.length > 0
      ? await getDocs(query(
          collection(db, "tasks"),
          where("projectId", "==", projectId),
          where("assignedTo", "==", team.data.userId),
          limit(501),
        ))
      : null;
    const writeCount = rowsToUpdate.length + pendingRowsToDelete.length + (acceptedRows.length > 0 ? 2 : 0) + (tasks?.docs.length ?? 0);
    if (tasks && tasks.docs.length >= 501 || writeCount > 500) {
      throw new RequestValidationError(409, "This member is assigned to too many tasks to change roles at once");
    }

    const batch = writeBatch(db);
    for (const row of rowsToUpdate) batch.update(row.ref, { role, updatedAt: serverTimestamp() });
    for (const row of pendingRowsToDelete) batch.delete(row.ref);
    if (acceptedRows.length > 0) {
      setProjectMembershipInBatch(batch, { projectId, userId: team.data.userId, role });
    }
    if (tasks) {
      for (const task of tasks.docs) {
        batch.update(task.ref, { assignedTo: null, updatedAt: serverTimestamp() });
      }
    }
    await batch.commit();

    if (tasks) {
      const profileSnap = await getDoc(doc(db, "publicProfiles", team.data.userId));
      const profileData: unknown = profileSnap.exists() ? profileSnap.data() : null;
      const publicProfile = isRecordValue(profileData) ? toPublicProfile(profileData) : null;
      const oldAssignee = isRecordValue(profileData) ? {
        id: profileSnap.id,
        fullName: publicProfile?.fullName ?? "",
        profileImage: publicProfile?.profileImage ?? null,
      } : null;
      await Promise.all(tasks.docs.map((task) => createHistory({
        userId: null,
        taskId: task.id,
        projectId,
        action: getHistoryAction.update,
        eventType: getHistoryEventType.assignedTo,
        previousValue: oldAssignee,
        newValue: null,
      })));
    }

    await createNotification({ userId: team.data.userId, projectId, type: "RoleChange", newValue: role });
    return NextResponse.json({ message: "Successfully update the role", success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: genericErrorMessage(error) },
      { status: genericErrorStatus(error) },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const actorId = await getSessionUserId();
    const { projectId, teamId } = await context.params;
    const actorMembership = await requireProjectMembership({ projectId, userId: actorId });
    const team = await getTeam(projectId, teamId);
    if (!team || typeof team.data.userId !== "string") {
      return NextResponse.json({ message: "Team not found", success: false }, { status: 404 });
    }
    const activeTeamRows = await getActiveTeamRows(projectId, team.data.userId);
    if (activeTeamRows.some((row) => {
      const data: unknown = row.data();
      return isRecordValue(data) && data.status === "accepted" && data.role === "Owner";
    })) {
      return NextResponse.json({ message: "Cannot delete Owner from the team", success: false }, { status: 403 });
    }

    if (actorId === team.data.userId) {
      if (team.data.status !== "accepted") throw new AuthorizationError(403, "Forbidden");
    } else if (actorMembership.role !== "Owner") {
      throw new AuthorizationError(403, "Forbidden");
    }

    const tasks = await getDocs(query(
      collection(db, "tasks"),
      where("projectId", "==", projectId),
      where("assignedTo", "==", team.data.userId),
      limit(501),
    ));
    const writeCount = tasks.docs.length + activeTeamRows.length + 2;
    if (tasks.docs.length >= 501 || writeCount > 500) {
      throw new RequestValidationError(409, "This member is assigned to too many tasks to remove at once");
    }

    const batch = writeBatch(db);
    for (const task of tasks.docs) batch.update(task.ref, { assignedTo: null, updatedAt: serverTimestamp() });
    for (const row of activeTeamRows) batch.delete(row.ref);
    deleteProjectMembershipInBatch(batch, projectId, team.data.userId);
    await batch.commit();

    const profileSnap = await getDoc(doc(db, "publicProfiles", team.data.userId));
    const profileData: unknown = profileSnap.exists() ? profileSnap.data() : null;
    const publicProfile = isRecordValue(profileData) ? toPublicProfile(profileData) : null;
    const oldAssignee = isRecordValue(profileData) ? {
      id: profileSnap.id,
      fullName: publicProfile?.fullName ?? "",
      profileImage: publicProfile?.profileImage ?? null,
    } : null;
    await Promise.all(tasks.docs.map((task) => createHistory({
      userId: null,
      taskId: task.id,
      projectId,
      action: getHistoryAction.update,
      eventType: getHistoryEventType.assignedTo,
      previousValue: oldAssignee,
      newValue: null,
    })));

    return NextResponse.json({ success: true, message: "Successfully remove the user from the team" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: genericErrorMessage(error) },
      { status: genericErrorStatus(error) },
    );
  }
}
