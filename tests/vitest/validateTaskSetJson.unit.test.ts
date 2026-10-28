import { describe, expect, it } from "vitest";
import taskSet from "../../app/model/SystemComponents/skolni_tabor_palava/tasks.json";
import { validateTaskSetJson } from "../../app/core/validation/validateTaskSetJson";

describe("validateTaskSetJson", () => {
  it("accepts the bundled task set", () => {
    expect(validateTaskSetJson(taskSet)).toEqual([]);
  });

  it("rejects missing system reference and malformed tasks", () => {
    expect(
      validateTaskSetJson({
        id: "example",
        name: "Example",
        tasks: [{ id: "task-1", title: 42 }],
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("system_id"),
        expect.stringContaining("/tasks/0/title"),
      ]),
    );
  });
});
