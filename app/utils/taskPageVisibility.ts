import type { InformationSystem } from "~/model/InformationSystem";
import type { Page } from "~/model/Page";
import type { Task } from "~/model/Task/Task";

export const DATABASE_PAGE_ROUTE = "/database";

export function databaseVisiblePage(name = "Database"): Page {
  return {
    name,
    route: DATABASE_PAGE_ROUTE,
    description: "Database",
  };
}

export function systemVisiblePages(
  system: InformationSystem,
  databaseName = "Database"
): Page[] {
  const pages = system.pages ?? [];
  if (pages.some((page) => page.route === DATABASE_PAGE_ROUTE)) {
    return pages;
  }

  return [...pages, databaseVisiblePage(databaseName)];
}

export function systemPageRouteFromPath(path: string, systemId: string): string {
  const systemPrefix = `/systems/${systemId}`;

  if (!path.startsWith(systemPrefix)) {
    return path;
  }

  return path.slice(systemPrefix.length) || "/";
}

export function taskAllowsPage(
  task: Task | null | undefined,
  pageRoute: string
): boolean {
  if (!task || !Array.isArray(task.visiblePages)) {
    return true;
  }

  return task.visiblePages.some((page) => page.route === pageRoute);
}
