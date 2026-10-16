import { collection, doc, getDoc, getDocs, limit, query, where } from "@/server/firestore";
import { db } from "@/server/db";
import { getAcceptedProjectMembership, getSessionUserId, isRecordValue } from "@/server/authorization";
import { genericErrorMessage, genericErrorStatus } from "@/server/http";
import { isDocumentSafeId, projectRoleIsAllowed } from "@/server/project-access-policy";
import { toProfileDetails } from "@/server/security";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ profileId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const userId = await getSessionUserId();
    const { profileId } = await context.params;
    if (!isDocumentSafeId(profileId)) {
      return NextResponse.json({ data: null, message: "Profile not found" }, { status: 404 });
    }

    if (profileId !== userId) {
      const memberships = await getDocs(query(
        collection(db, "teams"),
        where("userId", "==", userId),
        where("status", "==", "accepted"),
        limit(100),
      ));
      const projectIds = [...new Set(memberships.docs.flatMap((membership) => {
        const data: unknown = membership.data();
        return isRecordValue(data) && data.deletedAt == null && projectRoleIsAllowed(data.role) && typeof data.projectId === "string"
          ? [data.projectId]
          : [];
      }))];
      const sharesActiveProject = await Promise.all(projectIds.map(async (projectId) => {
        const [viewerMembership, profileMembership] = await Promise.all([
          getAcceptedProjectMembership({ projectId, userId }),
          getAcceptedProjectMembership({ projectId, userId: profileId }),
        ]);
        return viewerMembership !== null && profileMembership !== null;
      }));
      const hasSharedProject = sharesActiveProject.some(Boolean);
      if (!hasSharedProject) {
        return NextResponse.json({ data: null, message: "Profile not found" }, { status: 404 });
      }
    }

    // Profile details live in the private user document. They are returned
    // only after the caller is authenticated and, for another user, shares an
    // active project with that user.
    const profileSnap = await getDoc(doc(db, "users", profileId));
    const profileData: unknown = profileSnap.exists() ? profileSnap.data() : null;
    if (!isRecordValue(profileData) || profileData.deletedAt != null) {
      return NextResponse.json({ data: null, message: "Profile not found" }, { status: 404 });
    }
    const profile = { id: profileSnap.id, ...toProfileDetails(profileData) };

    return NextResponse.json({ data: profile, message: "Successfully retrieved user profile" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { data: null, message: genericErrorMessage(error) },
      { status: genericErrorStatus(error) },
    );
  }
}
