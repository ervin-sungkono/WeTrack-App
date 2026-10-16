import { NextRequest, NextResponse } from "next/server";
import { collection, doc, getDoc, getDocs, limit, query, runTransaction, serverTimestamp, where } from "@/server/firestore";
import { adminAuth, db } from "@/server/db";
import { projectMembershipDocumentId } from "@/server/auth";
import { getSessionUser, getSessionUserId, isRecordValue, requireProjectMembership } from "@/server/authorization";
import { genericErrorMessage, genericErrorStatus, readJsonObject, RequestValidationError } from "@/server/http";
import { createHistory, createNotification } from "@/server/data/util";
import { projectRoleIsAllowed } from "@/server/project-access-policy";
import { toPublicProfile } from "@/server/security";
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history";
import { sendMail } from "@/app/lib/mail";

type RouteContext = { params: Promise<{ projectId: string }> };
const OWNER_ROLES = ["Owner"] as const;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function getInviteeByEmail(email: string) {
  try {
    const authUser = await adminAuth.getUserByEmail(email);
    if (authUser.disabled || authUser.email?.trim().toLowerCase() !== email) return null;

    const userSnapshot = await getDoc(doc(db, "users", authUser.uid));
    const userData: unknown = userSnapshot.exists() ? userSnapshot.data() : null;
    if (!isRecordValue(userData) || userData.deletedAt != null || typeof userData.email !== "string") return null;
    if (userData.email.trim().toLowerCase() !== email) return null;

    return { userId: userSnapshot.id, email: userData.email, userData };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "auth/user-not-found") return null;
    throw error;
  }
}

async function createPendingInvitation(input: {
  projectId: string;
  invitee: { userId: string; email: string };
  role: "Member" | "Viewer";
}): Promise<string | null> {
  const { projectId, invitee, role } = input;
  const legacyRows = await getDocs(query(
    collection(db, "teams"),
    where("projectId", "==", projectId),
    where("userId", "==", invitee.userId),
    limit(101),
  ));
  if (legacyRows.docs.length >= 101) {
    throw new RequestValidationError(409, "This user has too many existing project membership records");
  }
  if (legacyRows.docs.some((row) => {
    const data: unknown = row.data();
    return isRecordValue(data) && data.deletedAt == null && (data.status === "accepted" || data.status === "pending");
  })) return null;

  const teamId = projectMembershipDocumentId(projectId, invitee.userId);
  const teamRef = doc(db, "teams", teamId);
  const projectRef = doc(db, "projects", projectId);
  return runTransaction(db, async (transaction) => {
    const [projectSnapshot, currentInvitation] = await Promise.all([
      transaction.get(projectRef),
      transaction.get(teamRef),
    ]);
    const projectData: unknown = projectSnapshot.data();
    const currentData: unknown = currentInvitation.data();
    if (!projectSnapshot.exists() || !isRecordValue(projectData) || projectData.deletedAt != null) {
      throw new RequestValidationError(404, "Project not found");
    }
    if (currentInvitation.exists() && isRecordValue(currentData) && currentData.deletedAt == null && (currentData.status === "accepted" || currentData.status === "pending")) {
      return null;
    }

    transaction.set(teamRef, {
      projectId,
      userId: invitee.userId,
      email: invitee.email,
      role,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      deletedAt: null,
    });
    return teamId;
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const userId = await getSessionUserId();
    const { projectId } = await context.params;
    const membership = await requireProjectMembership({ projectId, userId });
    const includePending = membership.role === "Owner";
    const excludeViewer = request.nextUrl.searchParams.get("excludeViewer") === "true";
    const snapshot = await getDocs(query(collection(db, "teams"), where("projectId", "==", projectId), limit(101)));
    const visibleTeamRows = snapshot.docs.filter((team) => {
      const data: unknown = team.data();
      if (!isRecordValue(data) || data.deletedAt != null) return false;
      if (data.status !== "accepted" && !(includePending && data.status === "pending")) return false;
      if (!projectRoleIsAllowed(data.role)) return false;
      if (data.status === "pending" && data.role !== "Member" && data.role !== "Viewer") return false;
      return !excludeViewer || data.role !== "Viewer";
    });
    const data = await Promise.all(visibleTeamRows.map(async (team) => {
      const teamData: unknown = team.data();
      if (!isRecordValue(teamData) || typeof teamData.userId !== "string") return null;
      const profileSnap = await getDoc(doc(db, "publicProfiles", teamData.userId));
      const profileData: unknown = profileSnap.exists() ? profileSnap.data() : null;
      const activeProfile = isRecordValue(profileData) && profileData.deletedAt == null
        ? toPublicProfile(profileData)
        : null;
      return {
        id: team.id,
        projectId,
        userId: teamData.userId,
        role: teamData.role,
        status: teamData.status,
        createdAt: teamData.createdAt ?? null,
        updatedAt: teamData.updatedAt ?? null,
        user: {
          id: profileSnap.exists() ? profileSnap.id : teamData.userId,
          fullName: activeProfile?.fullName ?? "",
          profileImage: activeProfile?.profileImage ?? null,
        },
      };
    }));

    return NextResponse.json({
      data: data.filter((team) => team !== null),
      message: "Successfully get all team members",
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { data: null, message: genericErrorMessage(error) },
      { status: genericErrorStatus(error) },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    const userId = sessionUser.uid;
    const { projectId } = await context.params;
    await requireProjectMembership({ projectId, userId, allowedRoles: OWNER_ROLES });

    const body = await readJsonObject(request, 8 * 1024);
    if (!Array.isArray(body.teams) || body.teams.length < 1 || body.teams.length > 25) {
      throw new RequestValidationError(400, "Provide between 1 and 25 invitation emails");
    }
    const role = body.role === undefined ? "Member" : body.role;
    if (role !== "Member" && role !== "Viewer") {
      throw new RequestValidationError(400, "Invalid invitation role");
    }
    const emails = [...new Set(body.teams.map((value) => {
      if (typeof value !== "string") throw new RequestValidationError(400, "Invalid invitation email");
      const email = value.trim().toLowerCase();
      if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
        throw new RequestValidationError(400, "Invalid invitation email");
      }
      return email;
    }))];
    if (sessionUser.email && emails.includes(sessionUser.email.trim().toLowerCase())) {
      throw new RequestValidationError(400, "You cannot invite yourself");
    }

    const projectSnap = await getDoc(doc(db, "projects", projectId));
    const projectData: unknown = projectSnap.exists() ? projectSnap.data() : null;
    if (!isRecordValue(projectData) || projectData.deletedAt != null) {
      return NextResponse.json({ message: "Project not found", success: false }, { status: 404 });
    }
    const projectName = typeof projectData.projectName === "string" ? projectData.projectName : "Project";

    const invitees = await Promise.all(emails.map(async (email) => {
      const invitee = await getInviteeByEmail(email);
      if (!invitee || invitee.userId === userId) return null;
      const userProfile = toPublicProfile(invitee.userData);

      return {
        userId: invitee.userId,
        email: invitee.email,
        fullName: userProfile.fullName,
        profileImage: userProfile.profileImage,
      };
    }));
    const invitations = (await Promise.all(invitees.map(async (invitee) => {
      if (!invitee) return null;
      const teamId = await createPendingInvitation({
        projectId,
        invitee: { userId: invitee.userId, email: invitee.email },
        role,
      });
      return teamId ? { ...invitee, teamId } : null;
    }))).filter((invitee) => invitee !== null);

    if (invitations.length > 0) {
      await Promise.all(invitations.map(async (invitee) => {
        await Promise.all([
          createHistory({
            userId,
            projectId,
            action: getHistoryAction.create,
            eventType: getHistoryEventType.invitation,
            newValue: {
              id: invitee.userId,
              fullName: invitee.fullName,
              profileImage: invitee.profileImage,
            },
          }),
          createNotification({
            userId: invitee.userId,
            senderId: userId,
            projectId,
            type: "ReceiveInvitation",
          }),
          sendMail({
            email: invitee.email,
            senderName: sessionUser.fullName ?? "WeTrack user",
            teamId: invitee.teamId,
            projectId,
            projectName,
          }),
        ]);
      }));
    }

    return NextResponse.json({ message: "Successfully sent the invitation", success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: genericErrorMessage(error) },
      { status: genericErrorStatus(error) },
    );
  }
}
