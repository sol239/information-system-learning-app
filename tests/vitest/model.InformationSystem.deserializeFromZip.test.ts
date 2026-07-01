import JSZip from "jszip";
import { describe, expect, it, vi } from "vitest";
import { OperationResultType } from "../../app/utils/Operation/OperationResultType";

vi.mock("~/stores/componentStore", () => ({
    useComponentStore: () => ({
        defaultComponents: [],
    }),
}));

const { InformationSystem } = await import("../../app/model/InformationSystem");

async function createSystemZip(config: Record<string, unknown>): Promise<ArrayBuffer> {
    const zip = new JSZip();
    zip.file("config.json", JSON.stringify(config));
    return zip.generateAsync({ type: "arraybuffer" });
}

describe("InformationSystem.deserializeFromZip", () => {
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
        const result = await InformationSystem.deserializeFromZip(new ArrayBuffer(8));

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
