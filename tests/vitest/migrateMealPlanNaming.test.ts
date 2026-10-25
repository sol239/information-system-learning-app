import { describe, expect, it, vi } from "vitest";
import initSqlJs from "sql.js";
import { Component } from "../../app/model/Component";
import { Task } from "../../app/model/Task/Task";
import { DatabaseWrapper } from "../../app/utils/DatabaseWrapper";
import { migrateMealPlanNaming } from "../../app/utils/migrateMealPlanNaming";

vi.mock("~/stores/componentStore", () => ({
  useComponentStore: () => ({ defaultComponents: [] }),
}));
vi.mock("sql.js", async (importOriginal) => {
  const original = await importOriginal<typeof import("sql.js")>();
  return { default: () => original.default() };
});

const { InformationSystem } = await import("../../app/model/InformationSystem");

describe("meal plan naming migration", () => {
  it("preserves edited components, task progress and current/default database rows", async () => {
    const SQL = await initSqlJs();
    const original = new SQL.Database();
    original.run(
      "CREATE TABLE kniha_jidel (id_jidla INTEGER, datum TEXT); INSERT INTO kniha_jidel VALUES (1, '2025-07-04')",
    );
    const defaults = original.export();
    original.run("INSERT INTO kniha_jidel VALUES (2, '2025-07-05')");
    const current = original.export();
    original.close();

    const component = new Component({
      id: "custom-meal-component",
      name: "Custom meal",
      description: "User edit",
      html: "<strong>{{ meal }}</strong>",
      css: "strong { color: blue; }",
      js: "const customValue = 42;",
      edited: true,
      sql: { meals: "SELECT * FROM kniha_jidel" },
    });
    const task = Task.fromJSON({
      id: "task",
      title: "Meal task",
      completed: true,
      visiblePages: [{ name: "Kniha jídel", route: "/kniha-jidel" }],
    });
    const system = new InformationSystem({
      id: "skolni_tabor_palava",
      name: "Camp",
      language: "cs",
      description: "Camp",
      pages: [{ name: "Kniha jídel", route: "/kniha-jidel" }],
      actualComponents: [component],
      defaultComponents: [Component.fromJSON(component)],
      tasks: [task],
      startedTasks: true,
      createSchemaSql:
        "CREATE TABLE kniha_jidel (id_jidla INTEGER, datum TEXT)",
      database: DatabaseWrapper.fromBinaries(current, defaults),
    });
    const score = system.score;

    expect(await migrateMealPlanNaming(system)).toBe(true);
    expect(system.pages[0]).toMatchObject({
      name: "Jídelníček",
      route: "/jidelnicek",
    });
    expect(system.tasks[0].visiblePages[0].route).toBe("/jidelnicek");
    expect(system.defaultTasks[0].visiblePages[0].route).toBe("/jidelnicek");
    expect(system.tasks[0].completed).toBe(true);
    expect(system.startedTasks).toBe(true);
    expect(system.score).toBe(score);
    expect(component).toMatchObject({
      js: "const customValue = 42;",
      edited: true,
      sql: { meals: "SELECT * FROM jidelnicek" },
    });
    expect(system.defaultComponents[0].sql.meals).toBe(
      "SELECT * FROM jidelnicek",
    );
    expect(system.createSchemaSql).toContain("CREATE TABLE jidelnicek");
    expect(
      system.database!.sqlJsDatabase!.exec("SELECT COUNT(*) FROM jidelnicek")[0]
        .values,
    ).toEqual([[2]]);
    expect(await migrateMealPlanNaming(system)).toBe(false);

    await system.database!.resetDatabase();
    expect(
      system.database!.sqlJsDatabase!.exec("SELECT COUNT(*) FROM jidelnicek")[0]
        .values,
    ).toEqual([[1]]);
    system.database!.sqlJsDatabase!.close();
  });

  it("keeps systems without the legacy naming unchanged", async () => {
    const system = new InformationSystem({
      id: "other",
      name: "Other",
      language: "cs",
      description: "Other",
      pages: [{ name: "Jídelníček", route: "/jidelnicek" }],
    });
    expect(await migrateMealPlanNaming(system)).toBe(false);
  });
});
