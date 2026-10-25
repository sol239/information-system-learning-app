import { DatabaseHandler } from "../../app/utils/DatabaseHandler";
import { describe, it, expect, vi } from "vitest";
import { SqljsDatabaseFactory } from "../../app/utils/SqljsDatabaseFactory";
import { OperationResultType } from "../../app/utils/Operation/OperationResultType";
import { readFileSync } from "fs";

// In SqljsDatabaseFactory, locateFile points to the Nuxt app base URL plus 'sql-wasm.wasm'.
// For the integration test to work in Node environment, we mock sql.js initialization
// to use the default node loading mechanism (or ignore locateFile completely).
vi.mock("sql.js", async (importOriginal) => {
  const original = await importOriginal<typeof import("sql.js")>();
  return {
    default: async () => {
      // When not providing locateFile in Node, sql.js will find the wasm file relative to itself.
      return await original.default();
    },
    __esModule: true,
  };
});

describe("SqljsDatabaseFactory Integration", () => {
  describe("GetInsertDataSql", () => {
    it("should quote DATE values so they are not evaluated as arithmetic", () => {
      const header = "id_jidla[INTEGER],datum[DATE]";
      const dataLines = ["1,2025-07-01", "11,2025-07-01"];
      const result = SqljsDatabaseFactory.GetInsertDataSql(
        "kniha_jidel",
        header,
        dataLines,
      );

      expect(result.result).toBe(OperationResultType.SUCCESS);
      // DATE values must be wrapped in quotes, integers must not be
      expect(result.data).toBe(
        "INSERT INTO kniha_jidel (id_jidla, datum) VALUES (1, '2025-07-01'), (11, '2025-07-01');",
      );
    });

    it("should store DATE column as a string in the DB, not as arithmetic (2025-7-1 ≠ 2017)", async () => {
      const csvContents = {
        kniha_jidel:
          "id_jidla[INTEGER],datum[DATE]\n1,2025-07-01\n11,2025-07-01",
      };
      const result = await SqljsDatabaseFactory.createDatabase(csvContents);
      expect(result.result).toBe(OperationResultType.SUCCESS);

      const rows = result.data!.exec("SELECT * FROM kniha_jidel");
      expect(rows[0].values[0]).toEqual([1, "2025-07-01"]);
      expect(rows[0].values[1]).toEqual([11, "2025-07-01"]);
      result.data!.close();
    });

    it("should leave INTEGER and REAL values unquoted", () => {
      const header = "id[INTEGER],score[REAL],label[TEXT]";
      const dataLines = ["1,3.14,hello", "2,2.71,world"];
      const result = SqljsDatabaseFactory.GetInsertDataSql(
        "test",
        header,
        dataLines,
      );

      expect(result.result).toBe(OperationResultType.SUCCESS);
      expect(result.data).toBe(
        "INSERT INTO test (id, score, label) VALUES (1, 3.14, 'hello'), (2, 2.71, 'world');",
      );
    });

    it("should escape single quotes inside TEXT values", () => {
      const header = "id[INTEGER],note[TEXT]";
      // simulate a CSV parsing where value would be 'It''s fine'
      const dataLines = ["1,It's fine"];
      const result = SqljsDatabaseFactory.GetInsertDataSql(
        "test",
        header,
        dataLines,
      );

      expect(result.result).toBe(OperationResultType.SUCCESS);
      expect(result.data).toContain("'It''s fine'");
    });
  });

  it("creates a database from the bundled SQL schema", async () => {
    const schema = readFileSync(
      new URL(
        "../../app/model/SystemComponents/skolni_tabor_palava/create_schema.sql",
        import.meta.url,
      ),
      "utf-8",
    );
    const result = await SqljsDatabaseFactory.createDatabaseFromSql(schema);
    expect(result.result, result.message).toBe(OperationResultType.SUCCESS);
    try {
      const db = result.data!;
      expect(
        db.exec("SELECT COUNT(*) FROM ucastnici")[0].values[0][0],
      ).toBeGreaterThan(0);
      const dates = db.exec("SELECT datum FROM kniha_jidel LIMIT 2")[0].values;
      expect(dates).toHaveLength(2);
      for (const [date] of dates) expect(date).toMatch(/^\d{4}-\d{2}-\d{2}/);
      const tables = await DatabaseHandler.getTableNames(db);
      expect(tables.data).toContain("ucastnici");
      expect(tables.data).not.toContain("sqlite_sequence");
    } finally {
      result.data?.close();
    }
  });

  it("returns an error for invalid SQL", async () => {
    const result =
      await SqljsDatabaseFactory.createDatabaseFromSql("INVALID SQL");
    expect(result.result).toBe(OperationResultType.ERROR);
    expect(result.data).toBeNull();
    expect(result.message).toContain("Error creating database from SQL");
  });
});
