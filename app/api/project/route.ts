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
import { setProjectMembershipInBatch } from "@/server/auth";
import { getSessionUser, getSessionUserId, isRecordValue } from "@/server/authorization";
import { projectRoleIsAllowed } from "@/server/project-access-policy";
import { toPublicProfile } from "@/server/security";
import { readJsonObject, requiredString, genericErrorMessage, genericErrorStatus } from "@/server/http";
import { createHistory } from "@/server/data/util";
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history";

const START_STATUS = "To Do";
const END_STATUS = "Done";
const PROJECT_ROLE_OWNER = "Owner";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    const teams = await getDocs(query(
      collection(db, "teams"),
      where("userId", "==", userId),
      where("status", "==", "accepted"),
      limit(100),
    ));

    const activeTeams = teams.docs.flatMap((team) => {
      const data: unknown = team.data();
      if (!isRecordValue(data) || data.deletedAt != null || !projectRoleIsAllowed(data.role)) return [];
      return [{ team, data, role: data.role }];
    });
    const projectIds = [...new Set(activeTeams
      .map(({ data }) => data.projectId)
      .filter((projectId): projectId is string => typeof projectId === "string"))];
    const projects = await Promise.all(projectIds.map(async (projectId) => {
      const projectSnap = await getDoc(doc(db, "projects", projectId));
      if (!projectSnap.exists()) return null;
      const projectData: unknown = projectSnap.data();
      if (!isRecordValue(projectData) || projectData.deletedAt != null) return null;

      const userIdFromProject = typeof projectData.createdBy === "string" ? projectData.createdBy : null;
      const creatorSnap = userIdFromProject ? await getDoc(doc(db, "publicProfiles", userIdFromProject)) : null;
      const creatorData: unknown = creatorSnap?.exists() ? creatorSnap.data() : null;
      const creatorProfile = isRecordValue(creatorData) ? toPublicProfile(creatorData) : null;
      const team = activeTeams.find((item) => item.data.projectId === projectId);
      return {
        id: projectSnap.id,
        ...projectData,
        createdBy: {
          id: userIdFromProject,
          fullName: creatorProfile?.fullName ?? "",
          profileImage: creatorProfile?.profileImage ?? null,
        },
        projectRole: team?.role ?? "Viewer",
      };
    }));

    return NextResponse.json({
      data: projects.filter((project) => project !== null),
      message: "Projects retrieved successfully",
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { data: null, message: genericErrorMessage(error) },
      { status: genericErrorStatus(error) },
    );
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    const userId = sessionUser.uid;
    const body = await readJsonObject(request, 8 * 1024);
    const key = requiredString(body.key, "project key", 10);
    const projectName = requiredString(body.projectName, "project name", 100);

    const userProfile = toPublicProfile(sessionUser);

    const projectRef = doc(collection(db, "projects"));
    const todoStatusRef = doc(collection(db, "taskStatuses"));
    const inProgressStatusRef = doc(collection(db, "taskStatuses"));
    const doneStatusRef = doc(collection(db, "taskStatuses"));
    const teamRef = doc(collection(db, "teams"));
    const now = serverTimestamp();
    const batch = writeBatch(db);

    batch.set(projectRef, {
      key,
      projectName,
      createdBy: userId,
      startStatus: todoStatusRef.id,
      endStatus: doneStatusRef.id,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });

    [
      { ref: todoStatusRef, statusName: START_STATUS, order: 0 },
      { ref: inProgressStatusRef, statusName: "In Progress", order: 1 },
      { ref: doneStatusRef, statusName: END_STATUS, order: 2 },
    ].forEach(({ ref, statusName, order }) => {
      batch.set(ref, {
        statusName,
        projectId: projectRef.id,
        order,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });
      batch.set(doc(db, "taskOrderCounters", ref.id), { lastOrder: 0, updatedAt: now });
    });

    batch.set(teamRef, {
      projectId: projectRef.id,
      userId,
      role: PROJECT_ROLE_OWNER,
      status: "accepted",
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
    setProjectMembershipInBatch(batch, {
      projectId: projectRef.id,
      userId,
      role: PROJECT_ROLE_OWNER,
    });
    await batch.commit();

    await createHistory({
      userId,
      projectId: projectRef.id,
      eventType: getHistoryEventType.project,
      action: getHistoryAction.create,
    });

    return NextResponse.json({
      data: {
        id: projectRef.id,
        key,
        projectName,
        createdBy: {
          id: userId,
          fullName: userProfile.fullName,
          profileImage: userProfile.profileImage,
        },
        startStatus: todoStatusRef.id,
        endStatus: doneStatusRef.id,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      message: "Successfully created a new project with task statuses",
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { data: null, message: genericErrorMessage(error) },
      { status: genericErrorStatus(error) },
    );
  }
}
