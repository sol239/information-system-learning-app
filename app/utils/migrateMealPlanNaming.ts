import type { Database } from "sql.js";
import type { InformationSystem } from "~/model/InformationSystem";
import { DatabaseWrapper } from "./DatabaseWrapper";

function renameText(value: string): string {
  return value
    .replaceAll("Kniha jídel", "Jídelníček")
    .replaceAll("kniha jídel", "jídelníček")
    .replaceAll("kniha-jidel", "jidelnicek")
    .replaceAll("kniha_jidel", "jidelnicek")
    .replaceAll("pridat-do-knihy-jidel", "pridat-do-jidelnicku")
    .replaceAll("meal-book-page", "meal-plan-page");
}

function renameTable(database: Database): boolean {
  const legacyTable = database.exec(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'kniha_jidel'",
  );
  if (!legacyTable.length) return false;
  database.run('ALTER TABLE "kniha_jidel" RENAME TO "jidelnicek"');
  return true;
}

/** Upgrade saved definitions and both database snapshots without resetting progress. */
export async function migrateMealPlanNaming(
  system: InformationSystem,
): Promise<boolean> {
  let changed = false;
  const visited = new WeakSet<object>();

  function renameMetadata(value: unknown): unknown {
    if (typeof value === "string") {
      const renamed = renameText(value);
      changed ||= renamed !== value;
      return renamed;
    }
    if (!value || typeof value !== "object" || visited.has(value)) return value;
    visited.add(value);
    const record = value as Record<string, unknown>;
    for (const [key, item] of Object.entries(record)) {
      const renamedKey = renameText(key);
      const renamedItem = renameMetadata(item);
      if (renamedKey !== key) {
        Reflect.deleteProperty(record, key);
        changed = true;
      }
      record[renamedKey] = renamedItem;
    }
    return value;
  }

  for (const value of [
    system.pages,
    system.actualComponents,
    system.defaultComponents,
    system.taskSet,
    system.defaultTaskSet,
    system.configData,
  ]) {
    renameMetadata(value);
  }
  if (system.createSchemaSql) {
    system.createSchemaSql = renameMetadata(system.createSchemaSql) as string;
  }

  if (!changed || !system.database) return changed;

  const database = system.database;
  await database.initializeDatabase();
  if (database.sqlJsDatabase && renameTable(database.sqlJsDatabase)) {
    database.binaryData = database.sqlJsDatabase.export();
    database.dbNumber++;
  }

  if (database.defaultBinaryData) {
    const defaults = DatabaseWrapper.fromBinary(database.defaultBinaryData);
    try {
      await defaults.initializeDatabase();
      if (defaults.sqlJsDatabase && renameTable(defaults.sqlJsDatabase)) {
        database.defaultBinaryData = defaults.sqlJsDatabase.export();
      }
    } finally {
      defaults.sqlJsDatabase?.close();
    }
  }
  return changed;
}
