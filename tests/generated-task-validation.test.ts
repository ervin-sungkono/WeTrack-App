import assert from "node:assert/strict";
import test from "node:test";
import { parseGeneratedTasks } from "../server/generated-task-validation";

test("generated tasks fit the task creation endpoint's field limits", () => {
  const tasks = parseGeneratedTasks([{
    taskName: `  ${"a".repeat(60)}  `,
    priority: 2,
    description: `${"detail ".repeat(160)}`,
  }]);

  assert.ok(tasks);
  assert.equal(tasks[0]?.taskName.length, 50);
  assert.equal(tasks[0]?.description.length, 1000);
  assert.equal(tasks[0]?.priority, 2);
});

test("generated task parsing rejects malformed and out-of-range model output", () => {
  assert.equal(parseGeneratedTasks(null), null);
  assert.equal(parseGeneratedTasks([]), null);
  assert.equal(parseGeneratedTasks([{ taskName: "Task", priority: 4, description: "" }]), null);
  assert.equal(parseGeneratedTasks([{ taskName: "Task", priority: 1, description: "x".repeat(1201) }]), null);
});
