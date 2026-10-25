import { describe, it, expect, vi } from "vitest";
import { SqljsDatabaseFactory } from "../../app/utils/SqljsDatabaseFactory";
import { OperationResultType } from "../../app/utils/Operation/OperationResultType";

// Mock sql.js so that it doesn't attempt to load the wasm from the absolute public path in Node
vi.mock("sql.js", async (importOriginal) => {
  const original = await importOriginal<typeof import("sql.js")>();
  return {
    default: async () => {
      return await original.default();
    },
    __esModule: true,
  };
});

describe("SqljsDatabaseFactory", () => {
  describe("getCreateTableSql", () => {
    it("should generate a valid CREATE TABLE statement for valid headers", () => {
      const tableName = "alergeny";
      const header = "id_alergenu[INTEGER],jmeno[TEXT]";
      const result = SqljsDatabaseFactory.getCreateTableSql(tableName, header);

      expect(result.result).toBe(OperationResultType.SUCCESS);
      expect(result.data).toBe(
        "CREATE TABLE IF NOT EXISTS alergeny (id_alergenu INTEGER, jmeno TEXT);",
      );
    });

    it("should return an error for invalid column definitions (missing square brackets)", () => {
      const tableName = "test";
      const header = "invalid_column";
      const result = SqljsDatabaseFactory.getCreateTableSql(tableName, header);

      expect(result.result).toBe(OperationResultType.ERROR);
      expect(result.message).toContain("Invalid column definition");
    });

    it("should return an error for unsupported column types", () => {
      const tableName = "test";
      const header = "column[UNKNOWN_TYPE]";
      const result = SqljsDatabaseFactory.getCreateTableSql(tableName, header);

      expect(result.result).toBe(OperationResultType.ERROR);
      expect(result.message).toContain("Unsupported column type");
    });
  });

  describe("GetInsertDataSql", () => {
    it("should generate a valid INSERT statement for valid data lines", () => {
      const tableName = "alergeny";
      const header = "id_alergenu[INTEGER],jmeno[TEXT]";
      const dataLines = ['1,"Lepek"', '2,"Korýši"', '3,"Vejce"'];
      const result = SqljsDatabaseFactory.GetInsertDataSql(
        tableName,
        header,
        dataLines,
      );

      expect(result.result).toBe(OperationResultType.SUCCESS);
      expect(result.data).toBe(
        "INSERT INTO alergeny (id_alergenu, jmeno) VALUES (1, 'Lepek'), (2, 'Korýši'), (3, 'Vejce');",
      );
    });

    it("should handle single data line correctly", () => {
      const tableName = "test";
      const header = "id[INTEGER]";
      const dataLines = ["10"];
      const result = SqljsDatabaseFactory.GetInsertDataSql(
        tableName,
        header,
        dataLines,
      );

      expect(result.result).toBe(OperationResultType.SUCCESS);
      expect(result.data).toBe("INSERT INTO test (id) VALUES (10);");
    });
  });

  describe("createDatabase", () => {
    it("should return an error if a file has no content", async () => {
      const result = await SqljsDatabaseFactory.createDatabase({
        "test.csv": "",
      });
      expect(result.result).toBe(OperationResultType.ERROR);
      expect(result.message).toContain("No content");
    });

    it("should handle getCreateTableSql errors and return error operation", async () => {
      const csvContent = { test: "invalid_col\n1" };
      const result = await SqljsDatabaseFactory.createDatabase(csvContent);
      expect(result.result).toBe(OperationResultType.ERROR);
      expect(result.message).toContain("Invalid column definition");
    });

    it("creates a queryable database from CSV", async () => {
      const result = await SqljsDatabaseFactory.createDatabase({
        test_table: 'id[INTEGER],name[TEXT]\n1,"Alice"\n2,"Bob"',
      });
      expect(result.result, result.message).toBe(OperationResultType.SUCCESS);
      try {
        expect(result.data!.exec("SELECT * FROM test_table")[0].values).toEqual(
          [
            [1, "Alice"],
            [2, "Bob"],
          ],
        );
      } finally {
        result.data?.close();
      }
    });

    it("reports invalid table names", async () => {
      const result = await SqljsDatabaseFactory.createDatabase({
        "123_invalid": "id[INTEGER]\n1",
      });
      expect(result.result).toBe(OperationResultType.ERROR);
      expect(result.message).toContain("Error creating table");
    });

    it("reports an incomplete INSERT when CSV contains only a header", async () => {
      const result = await SqljsDatabaseFactory.createDatabase({
        test: "id[INTEGER]",
      });
      expect(result.result).toBe(OperationResultType.ERROR);
      expect(result.message).toContain("Error inserting data into table");
    });
  });
});
