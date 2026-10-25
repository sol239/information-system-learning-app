import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Database, Statement } from "sql.js";
import { DatabaseHandler } from "~/utils/DatabaseHandler";
import { OperationResultType } from "~/utils/OperationResultType";
import { ColumnType } from "~/utils/ColumnType";

describe("DatabaseHandler", () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      exec: vi.fn(),
      run: vi.fn(),
      prepare: vi.fn(),
    } as unknown as Database;
  });

  describe("query", () => {
    it("should execute a query successfully", async () => {
      const mockResult = [{ columns: ["id"], values: [[1]] }];
      mockDb.exec.mockReturnValue(mockResult);

      const result = await DatabaseHandler.query(mockDb, "SELECT * FROM users");

      expect(mockDb.exec).toHaveBeenCalledWith("SELECT * FROM users");
      expect(result.result).toBe(OperationResultType.SUCCESS);
      expect(result.data).toBe(mockResult);
      expect(result.message).toBe("Query executed successfully");
    });

    it("should return error operation if query fails", async () => {
      const error = new Error("Syntax error");
      mockDb.exec.mockImplementation(() => {
        throw error;
      });

      const result = await DatabaseHandler.query(mockDb, "INVALID SQL");

      expect(mockDb.exec).toHaveBeenCalledWith("INVALID SQL");
      expect(result.result).toBe(OperationResultType.ERROR);
      expect(result.data).toBeNull();
      expect(result.message).toContain(
        "Error executing query: Error: Syntax error",
      );
    });
  });

  describe("execute", () => {
    it("should execute a statement successfully", async () => {
      const result = await DatabaseHandler.execute(
        mockDb,
        "INSERT INTO users DEFAULT VALUES",
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        "INSERT INTO users DEFAULT VALUES",
      );
      expect(result.result).toBe(OperationResultType.SUCCESS);
      expect(result.data).toBeNull();
      expect(result.message).toBe("Query executed successfully");
    });

    it("should return error operation if execution fails", async () => {
      const error = new Error("Constraint failed");
      mockDb.run.mockImplementation(() => {
        throw error;
      });

      const result = await DatabaseHandler.execute(
        mockDb,
        "INSERT INTO users DEFAULT VALUES",
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        "INSERT INTO users DEFAULT VALUES",
      );
      expect(result.result).toBe(OperationResultType.ERROR);
      expect(result.data).toBeNull();
      expect(result.message).toContain(
        "Error executing query: Error: Constraint failed",
      );
    });
  });

  describe("getTableNames", () => {
    it("should return table names successfully", async () => {
      mockDb.exec.mockReturnValue([
        {
          columns: ["name"],
          values: [["users"], ["posts"]],
        },
      ]);

      const result = await DatabaseHandler.getTableNames(mockDb);

      expect(mockDb.exec).toHaveBeenCalledWith(
        "SELECT name FROM sqlite_master WHERE type='table';",
      );
      expect(result.result).toBe(OperationResultType.SUCCESS);
      expect(result.data).toEqual(["users", "posts"]);
    });

    it("should handle undefined values gracefully", async () => {
      mockDb.exec.mockReturnValue([
        {
          columns: ["name"],
          values: [[null], undefined, ["posts"]],
        },
      ]);

      const result = await DatabaseHandler.getTableNames(mockDb);

      expect(result.result).toBe(OperationResultType.SUCCESS);
      expect(result.data).toEqual(["posts"]);
    });

    it("should handle empty results", async () => {
      mockDb.exec.mockReturnValue([]);

      const result = await DatabaseHandler.getTableNames(mockDb);

      expect(result.result).toBe(OperationResultType.SUCCESS);
      expect(result.data).toEqual([]);
    });

    it("should return error if retrieval fails", async () => {
      mockDb.exec.mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await DatabaseHandler.getTableNames(mockDb);

      expect(result.result).toBe(OperationResultType.ERROR);
      expect(result.data).toBeNull();
      expect(result.message).toContain(
        "Error retrieving table names: Error: DB error",
      );
    });
  });

  describe("isSqlValid", () => {
    it("should return success for valid SQL", async () => {
      const mockStmt = { free: vi.fn() };
      mockDb.prepare.mockReturnValue(mockStmt);

      const result = await DatabaseHandler.isSqlValid(
        mockDb,
        "SELECT * FROM users",
      );

      expect(mockDb.prepare).toHaveBeenCalledWith("SELECT * FROM users");
      expect(mockStmt.free).toHaveBeenCalled();
      expect(result.result).toBe(OperationResultType.SUCCESS);
      expect(result.data).toBe(true);
      expect(result.message).toBe("SQL query is valid");
    });

    it("should return error if db is not provided", async () => {
      const result = await DatabaseHandler.isSqlValid(
        null as unknown as Database,
        "SELECT * FROM users",
      );

      expect(result.result).toBe(OperationResultType.ERROR);
      expect(result.data).toBe(false);
      expect(result.message).toBe("Database not initialized");
    });

    it("should return error if query is empty", async () => {
      const result = await DatabaseHandler.isSqlValid(mockDb, "   ");

      expect(result.result).toBe(OperationResultType.ERROR);
      expect(result.data).toBe(false);
      expect(result.message).toBe("SQL query is empty");
    });

    it("should return error for invalid SQL", async () => {
      mockDb.prepare.mockImplementation(() => {
        throw new Error("Syntax error");
      });

      const result = await DatabaseHandler.isSqlValid(mockDb, "SELECT FROM");

      expect(mockDb.prepare).toHaveBeenCalledWith("SELECT FROM");
      expect(result.result).toBe(OperationResultType.ERROR);
      expect(result.data).toBe(false);
      expect(result.message).toContain(
        "SQL validation error: Error: Syntax error",
      );
    });
  });

  describe("GetColumnNames", () => {
    it("should return column names successfully", async () => {
      const mockStmt = {
        getColumnNames: vi.fn().mockReturnValue(["id", "name", "email"]),
        free: vi.fn(),
      };
      mockDb.prepare.mockReturnValue(mockStmt);

      const result = await DatabaseHandler.GetColumnNames(mockDb, "users");

      expect(mockDb.prepare).toHaveBeenCalledWith(
        'SELECT * FROM "users" LIMIT 0',
      );
      expect(mockStmt.getColumnNames).toHaveBeenCalled();
      expect(mockStmt.free).toHaveBeenCalled();
      expect(result.result).toBe(OperationResultType.SUCCESS);
      expect(result.data).toEqual(["id", "name", "email"]);
      expect(result.message).toBe("Column names retrieved successfully");
    });

    it("should return error when table has no columns", async () => {
      const mockStmt = {
        getColumnNames: vi.fn().mockReturnValue([]),
        free: vi.fn(),
      };
      mockDb.prepare.mockReturnValue(mockStmt);

      const result = await DatabaseHandler.GetColumnNames(
        mockDb,
        "empty_table",
      );

      expect(result.result).toBe(OperationResultType.ERROR);
      expect(result.data).toBeNull();
      expect(result.message).toContain('"empty_table"');
    });

    it("should return error when table does not exist (prepare throws)", async () => {
      mockDb.prepare.mockImplementation(() => {
        throw new Error("no such table: nonexistent");
      });

      const result = await DatabaseHandler.GetColumnNames(
        mockDb,
        "nonexistent",
      );

      expect(result.result).toBe(OperationResultType.ERROR);
      expect(result.data).toBeNull();
      expect(result.message).toContain(
        "Error retrieving column names: Error: no such table: nonexistent",
      );
    });

    it("should free the statement even when columns are returned", async () => {
      const mockStmt = {
        getColumnNames: vi.fn().mockReturnValue(["col1"]),
        free: vi.fn(),
      };
      mockDb.prepare.mockReturnValue(mockStmt);

      await DatabaseHandler.GetColumnNames(mockDb, "test");

      expect(mockStmt.free).toHaveBeenCalled();
    });
  });

  describe("getColumnTypes", () => {
    it("should return a record of column names to ColumnType for known types", async () => {
      mockDb.exec.mockReturnValue([
        {
          columns: ["cid", "name", "type", "notnull", "dflt_value", "pk"],
          values: [
            [0, "id", "INTEGER", 1, null, 1],
            [1, "score", "REAL", 0, null, 0],
            [2, "label", "TEXT", 0, null, 0],
            [3, "created", "DATE", 0, null, 0],
          ],
        },
      ]);

      const result = await DatabaseHandler.getColumnTypes(mockDb, "users");

      expect(mockDb.exec).toHaveBeenCalledWith("PRAGMA table_info(users)");
      expect(result.result).toBe(OperationResultType.SUCCESS);
      expect(result.data).toEqual({
        id: ColumnType.INTEGER,
        score: ColumnType.REAL,
        label: ColumnType.TEXT,
        created: ColumnType.DATE,
      });
    });

    it("should map unknown types to ColumnType.INVALID", async () => {
      mockDb.exec.mockReturnValue([
        {
          columns: ["cid", "name", "type", "notnull", "dflt_value", "pk"],
          values: [
            [0, "id", "INTEGER", 1, null, 1],
            [1, "data", "BLOB", 0, null, 0],
            [2, "misc", "VARCHAR(255)", 0, null, 0],
          ],
        },
      ]);

      const result = await DatabaseHandler.getColumnTypes(mockDb, "stuff");

      expect(result.result).toBe(OperationResultType.SUCCESS);
      expect(result.data).toEqual({
        id: ColumnType.INTEGER,
        data: ColumnType.INVALID,
        misc: ColumnType.INVALID,
      });
    });

    it("should be case-insensitive for type matching", async () => {
      mockDb.exec.mockReturnValue([
        {
          columns: ["cid", "name", "type", "notnull", "dflt_value", "pk"],
          values: [
            [0, "name", "text", 0, null, 0],
            [1, "count", "integer", 0, null, 0],
          ],
        },
      ]);

      const result = await DatabaseHandler.getColumnTypes(mockDb, "items");

      expect(result.result).toBe(OperationResultType.SUCCESS);
      expect(result.data).toEqual({
        name: ColumnType.TEXT,
        count: ColumnType.INTEGER,
      });
    });

    it("should return error when table does not exist (empty result)", async () => {
      mockDb.exec.mockReturnValue([]);

      const result = await DatabaseHandler.getColumnTypes(
        mockDb,
        "nonexistent",
      );

      expect(result.result).toBe(OperationResultType.ERROR);
      expect(result.data).toBeNull();
      expect(result.message).toContain('"nonexistent"');
    });

    it("should return error when db.exec throws", async () => {
      mockDb.exec.mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await DatabaseHandler.getColumnTypes(mockDb, "users");

      expect(result.result).toBe(OperationResultType.ERROR);
      expect(result.data).toBeNull();
      expect(result.message).toContain(
        "Error retrieving column types: Error: DB error",
      );
    });
  });
});
