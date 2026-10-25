import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { SystemZipLoader } from "../../app/utils/SystemZipLoader";
import { OperationResultType } from "../../app/utils/OperationResultType";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("SystemZipLoader", () => {
  let loader: SystemZipLoader;

  beforeAll(async () => {
    const zipPath: string = resolve(
      __dirname,
      "mocks",
      "testing_information_system.zip",
    );
    const buffer: Buffer = readFileSync(zipPath);
    const zipFile: File = buffer.buffer as File;
    const result = await SystemZipLoader.create(zipFile);
    if (result.result === OperationResultType.SUCCESS && result.data) {
      loader = result.data;
    }
  });

  describe("create()", () => {
    it("should successfully create a loader from a valid ZIP file", async () => {
      const zipPath: string = resolve(
        __dirname,
        "mocks",
        "testing_information_system.zip",
      );
      const buffer: Buffer = readFileSync(zipPath);
      const zipFile: File = buffer.buffer as File;
      const result = await SystemZipLoader.create(zipFile);
      expect(result.result).toBe(OperationResultType.SUCCESS);
      expect(result.data).toBeInstanceOf(SystemZipLoader);
    });

    it("should return error operation when given an invalid / non-ZIP buffer", async () => {
      const invalidBuffer = Buffer.from("this is not a zip file");
      const invalidFile = invalidBuffer.buffer as File;
      const result = await SystemZipLoader.create(invalidFile);
      expect(result.result).toBe(OperationResultType.ERROR);
      expect(result.data).toBeNull();
    });
  });

  describe("files", () => {
    describe("existing entries", () => {
      it("should have loaded config.json content", () => {
        expect(loader.jsonConfigFileContent).not.toBeNull();
        expect(typeof loader.jsonConfigFileContent).toBe("string");
        // Basic check if it's JSON
        expect(() => JSON.parse(loader.jsonConfigFileContent!)).not.toThrow();
      });

      it("should contain jidla in csvFilesContent", () => {
        expect(loader.csvFilesContent).toHaveProperty("jidla");
      });
    });

    describe("non-existing entries", () => {
      it("should NOT contain a non-existent file", () => {
        expect(loader.csvFilesContent).not.toHaveProperty("nonexistent");
      });

      it("should NOT contain a non-existent directory entry", () => {
        expect(loader.csvFilesContent).not.toHaveProperty("nonexistentdir");
      });
    });

    // TODO: Add specific validation of contents
  });
});
