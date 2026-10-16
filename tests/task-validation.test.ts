import test from "node:test";
import assert from "node:assert/strict";
import {
  parseTaskCreateInput,
  parseTaskUpdateInput,
  parseIndex,
  parseStatusName,
} from "../server/task-validation";

test("task creation accepts valid main task and normalizes labels", () => {
  const task = parseTaskCreateInput({
    projectId: "project-1",
    type: "Task",
    taskName: "  Prepare release  ",
    statusId: "status-1",
    labels: ["label-a", "label-a", "label-b"],
    priority: 3,
  });

  assert.equal(task.taskName, "Prepare release");
  assert.deepEqual(task.labels, ["label-a", "label-b"]);
  assert.equal(task.priority, 3);
  assert.equal(task.parentId, null);
});

test("task relationship and priority inputs keep their expected types and limits", () => {
  const subtask = parseTaskCreateInput({
    projectId: "project-1",
    type: "SubTask",
    parentId: "parent-1",
    taskName: "Review release notes",
    statusId: "status-1",
    priority: 2,
  });
  assert.equal(subtask.parentId, "parent-1");
  assert.equal(subtask.priority, 2);

  assert.throws(() => parseTaskCreateInput({
    projectId: "project-1", type: "Task", taskName: "A", statusId: "status-1", priority: "2",
  }), /priority must be an integer/);
  assert.throws(() => parseTaskCreateInput({
    projectId: "project-1", type: "Task", taskName: "A", statusId: "status-1", labels: Array(11).fill("label-1"),
  }), /at most 10 ids/);
  assert.throws(() => parseTaskUpdateInput({ parentId: "../other-task" }), /parentId is invalid/);
});

test("task creation rejects cross-scope fields, invalid types, and broken parent relationships", () => {
  assert.throws(() => parseTaskCreateInput({
    projectId: "project-1", type: "Task", taskName: "A", statusId: "status-1", ownerId: "attacker",
  }), /Unsupported field/);
  assert.throws(() => parseTaskCreateInput({
    projectId: "project-1", type: "SubTask", taskName: "A", statusId: "status-1",
  }), /must have a parent/);
  assert.throws(() => parseTaskCreateInput({
    projectId: "project-1", type: "Task", parentId: "parent-1", taskName: "A", statusId: "status-1",
  }), /cannot have a parent/);
});

test("task updates enforce bounds and prohibit direct status or project changes", () => {
  assert.throws(() => parseTaskUpdateInput({ projectId: "other-project" }), /Unsupported field/);
  assert.throws(() => parseTaskUpdateInput({ priority: 4 }), /0 to 3/);
  assert.throws(() => parseTaskUpdateInput({ startDate: "2026-03-10", dueDate: "2026-03-09" }), /before startDate/);
  assert.deepEqual(parseTaskUpdateInput({ assignedTo: null, labels: [] }), { assignedTo: null, labels: [] });
});

test("status names and ordering indexes are bounded", () => {
  assert.equal(parseStatusName(" In progress "), "In progress");
  assert.throws(() => parseStatusName("x".repeat(21)), /1 to 20/);
  assert.equal(parseIndex(0, "newIndex"), 0);
  assert.throws(() => parseIndex(-1, "newIndex"), /non-negative integer/);
  assert.throws(() => parseIndex(1.5, "newIndex"), /non-negative integer/);
});
