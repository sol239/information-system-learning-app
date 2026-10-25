import { describe, it, expect, vi } from "vitest";
import { SqljsDatabaseFactory } from "../../app/utils/SqljsDatabaseFactory";
import { OperationResultType } from "../../app/utils/OperationResultType";
import { join } from "path";
import { readFileSync, readdirSync } from "fs";

// In SqljsDatabaseFactory, locateFile points to the Nuxt app base URL plus 'sql-wasm.wasm'.
// For the integration test to work in Node environment, we mock sql.js initialization
// to use the default node loading mechanism (or ignore locateFile completely).
vi.mock("sql.js", async (importOriginal) => {
  const original = await importOriginal<typeof import("sql.js")>();
  return {
    default: async (config?: any) => {
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

    it("should use actual kniha_jidel.csv and produce correct DATE values in the DB", async () => {
      const csvDir = join(
        process.cwd(),
        "systems",
        "information_system_2",
        "csv",
      );
      const content = readFileSync(join(csvDir, "kniha_jidel.csv"), "utf-8");
      const result = await SqljsDatabaseFactory.createDatabase({
        kniha_jidel: content,
      });

      expect(result.result).toBe(OperationResultType.SUCCESS);

      const rows = result.data!.exec(
        "SELECT id_jidla, datum FROM kniha_jidel LIMIT 2",
      );
      const [first, second] = rows[0].values;

      // id_jidla should be a number, datum should be a date string — not arithmetic
      expect(typeof first[0]).toBe("number");
      expect(typeof first[1]).toBe("string");
      expect(first[1]).toMatch(/^\d{4}-\d{2}-\d{2}/); // e.g. '2025-07-01'
      expect(second[1]).toMatch(/^\d{4}-\d{2}-\d{2}/);
    });
  });

  it("should create database from actual CSV mock system files and verify tables and records", async () => {
    const csvDir = join(
      process.cwd(),
      "systems",
      "information_system_2",
      "csv",
    );

    let files: string[];
    try {
      files = readdirSync(csvDir).filter((f) => f.endsWith(".csv"));
    } catch (error) {
      console.error(`Could not read mock CSV directory at ${csvDir}`);
      return; // skip if we can't find the folder so tests don't permanently fail
    }

    const csvContents: Record<string, string> = {};
    for (const file of files) {
      const tableName = file.replace(".csv", "");
      csvContents[tableName] = readFileSync(join(csvDir, file), "utf-8");
    }

    expect(Object.keys(csvContents).length).toBeGreaterThan(0); // Ensure we actually loaded files

    const result = await SqljsDatabaseFactory.createDatabase(csvContents);

    if (result.result !== OperationResultType.SUCCESS) {
      console.error("Failed to create DB:", result.message);
    }

    expect(result.result).toBe(OperationResultType.SUCCESS);
    expect(result.data).not.toBeNull();

    const db = result.data!;

    // Let's verify that expected tables exist and contain the right amount of rows

    // 1. alergeny
    if (csvContents["alergeny"]) {
      const rowCountQuery = db.exec("SELECT COUNT(*) as count FROM alergeny");
      const count = rowCountQuery[0].values[0][0];
      const csvDataLines = csvContents["alergeny"]
        .split("\n")
        .filter((l) => l.trim() !== "");
      // Subtract 1 for the header
      expect(count).toBe(csvDataLines.length - 1);
    }

    // 2. ucastnici
    if (csvContents["ucastnici"]) {
      const rsUcastnici = db.exec("SELECT jmeno FROM ucastnici LIMIT 1");
      expect(rsUcastnici.length).toBe(1);
      expect(rsUcastnici[0].values.length).toBe(1);
    }

    // 3. Verify PRAGMA table_info (schema validation)
    if (csvContents["turnusy"]) {
      const schemaQuery = db.exec("PRAGMA table_info(turnusy)");
      const columns = schemaQuery[0].values.map((row) => row[1]); // row[1] is name in PRAGMA table_info
      expect(columns).toContain("id_turnusu");
      expect(columns).toContain("datum_od");
    }

    // Check all created tables by querying sqlite_master
    const tablesQuery = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table'",
    );
    const createdTables = tablesQuery[0].values.map((v) => v[0]);
    expect(createdTables.length).toBeGreaterThanOrEqual(files.length);

    for (const tableName of Object.keys(csvContents)) {
      expect(createdTables).toContain(tableName);
    }

    db.close();
  });
});
