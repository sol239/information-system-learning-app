import JSZip from "jszip";
import { describe, expect, it, vi } from "vitest";
import { OperationResultType } from "../../app/utils/Operation/OperationResultType";

vi.mock("~/stores/componentStore", () => ({
  useComponentStore: () => ({
    defaultComponents: [],
  }),
}));

const { InformationSystem } = await import("../../app/model/InformationSystem");
const { TaskSet } = await import("../../app/model/Task/TaskSet");
const { SystemZipExporter } = await import("../../app/utils/SystemZipExporter");

async function createSystemZip(
  config: Record<string, unknown>,
): Promise<ArrayBuffer> {
  const zip = new JSZip();
  zip.file("config.json", JSON.stringify(config));
  return zip.generateAsync({ type: "arraybuffer" });
}

describe("InformationSystem.deserializeFromZip", () => {
  it("round trips multiple task sets and their selection", async () => {
    const system = new InformationSystem({
      id: "demo",
      name: "Demo",
      language: "cs",
      description: "",
      taskSets: [
        new TaskSet({ id: "first", systemId: "demo", name: "First" }),
        new TaskSet({ id: "second", systemId: "demo", name: "Second" }),
      ],
      selectedTaskSetId: "second",
    });
    const zip = await SystemZipExporter.export(system);
    const archive = await JSZip.loadAsync(await zip.arrayBuffer());
    const exported = JSON.parse(
      await archive.file("tasks.json")!.async("text"),
    );
    expect(
      exported.taskSets.map((set: { system_id: string }) => set.system_id),
    ).toEqual(["demo", "demo"]);
    const result = await InformationSystem.deserializeFromZip(
      await zip.arrayBuffer(),
    );
    expect(result.result, result.message).toBe(OperationResultType.SUCCESS);
    expect(result.data?.taskSets.map((set) => set.id)).toEqual([
      "first",
      "second",
    ]);
    expect(result.data?.selectedTaskSetId).toBe("second");
    expect(result.data?.taskSet.systemId).toBe("demo");
  });

  it("returns a successful operation with the deserialized information system", async () => {
    const zipData = await createSystemZip({
      id: "demo-system",
      name: "Demo system",
      language: "en",
      description: "System loaded from a zip archive.",
      tasks: [],
      pages: [],
    });

    const result = await InformationSystem.deserializeFromZip(zipData);

    expect(result.result).toBe(OperationResultType.SUCCESS);
    expect(result.data).toBeInstanceOf(InformationSystem);
    expect(result.data?.id).toBe("demo-system");
    expect(result.data?.name).toBe("Demo system");
  });

  it("returns an error operation when the zip archive cannot be read", async () => {
    const result = await InformationSystem.deserializeFromZip(
      new ArrayBuffer(8),
    );

    expect(result.result).toBe(OperationResultType.ERROR);
    expect(result.data).toBeNull();
    expect(result.message).toContain("Failed to deserialize system zip:");
  });

  it("returns an error operation when the zip does not contain a valid system", async () => {
    const zip = new JSZip();
    zip.file("readme.txt", "No config here.");
    const zipData = await zip.generateAsync({ type: "arraybuffer" });

    const result = await InformationSystem.deserializeFromZip(zipData);

    expect(result.result).toBe(OperationResultType.ERROR);
    expect(result.data).toBeNull();
    expect(result.message).toBe("Failed to load system.");
  });
});
