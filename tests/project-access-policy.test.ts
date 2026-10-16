import assert from "node:assert/strict";
import test from "node:test";
import {
  isDocumentSafeId,
  projectRoleIsAllowed,
  selectAcceptedProjectMembership,
  type ProjectMembershipCandidate,
} from "../server/project-access-policy";

const activeProject = { projectName: "WeTrack" };

function select(memberships: readonly ProjectMembershipCandidate[], projectData: unknown = activeProject) {
  return selectAcceptedProjectMembership({
    projectId: "project-1",
    userId: "user-1",
    projectData,
    memberships,
  });
}

test("active accepted membership is selected only for the requested project and user", () => {
  const membership = select([
    { id: "wrong-project", data: { projectId: "project-2", userId: "user-1", role: "Owner", status: "accepted" } },
    { id: "wrong-user", data: { projectId: "project-1", userId: "user-2", role: "Owner", status: "accepted" } },
    { id: "right-user", data: { projectId: "project-1", userId: "user-1", role: "Member", status: "accepted" } },
  ]);

  assert.equal(membership?.id, "right-user");
  assert.equal(membership?.role, "Member");
});

test("pending, rejected, deleted, and unknown-role membership rows never authorize", () => {
  const rows: ProjectMembershipCandidate[] = [
    { id: "pending", data: { projectId: "project-1", userId: "user-1", role: "Owner", status: "pending" } },
    { id: "rejected", data: { projectId: "project-1", userId: "user-1", role: "Owner", status: "rejected" } },
    { id: "deleted", data: { projectId: "project-1", userId: "user-1", role: "Owner", status: "accepted", deletedAt: "deleted" } },
    { id: "legacy-admin", data: { projectId: "project-1", userId: "user-1", role: "Admin", status: "accepted" } },
  ];

  assert.equal(select(rows), null);
});

test("deleted projects and mismatched identifiers deny membership", () => {
  const validRow: ProjectMembershipCandidate[] = [
    { id: "member", data: { projectId: "project-1", userId: "user-1", role: "Member", status: "accepted" } },
  ];

  assert.equal(select(validRow, { projectName: "WeTrack", deletedAt: "deleted" }), null);
  assert.equal(selectAcceptedProjectMembership({
    projectId: "project-2",
    userId: "user-1",
    projectData: activeProject,
    memberships: validRow,
  }), null);
  assert.equal(selectAcceptedProjectMembership({
    projectId: "project-1",
    userId: "user-2",
    projectData: activeProject,
    memberships: validRow,
  }), null);
});

test("document IDs reject empty, oversized, and slash-containing identifiers", () => {
  assert.equal(isDocumentSafeId("project-1"), true);
  assert.equal(isDocumentSafeId(""), false);
  assert.equal(isDocumentSafeId("../private"), false);
  assert.equal(isDocumentSafeId("x".repeat(129)), false);

  const validRow: ProjectMembershipCandidate[] = [
    { id: "member", data: { projectId: "project-1", userId: "user-1", role: "Member", status: "accepted" } },
  ];
  assert.equal(selectAcceptedProjectMembership({
    projectId: "../other-project",
    userId: "user-1",
    projectData: activeProject,
    memberships: validRow,
  }), null);
});

test("role policy denies Viewer writes and permits only Owner for owner-only actions", () => {
  assert.equal(projectRoleIsAllowed("Viewer", ["Owner", "Member"]), false);
  assert.equal(projectRoleIsAllowed("Member", ["Owner"]), false);
  assert.equal(projectRoleIsAllowed("Owner", ["Owner"]), true);
  assert.equal(projectRoleIsAllowed("Admin", ["Owner"]), false);
  assert.equal(projectRoleIsAllowed("Admin"), false);
});
