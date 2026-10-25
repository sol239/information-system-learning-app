import { ComponentHelper } from "~/core/systems/ComponentHelper";

/* Cypress exposes these parameter names to test callers through the global API type. */
/* eslint-disable no-unused-vars */
declare global {
  interface Window {
    Cypress?: unknown;
    __informationSystemTestApi?: {
      selectedSystemDatabaseQuery(sql: string): Promise<unknown>;
      setBypassPageVisibility(value: boolean): void;
      setTeacherMode(value: boolean): void;
      setEditModeActive(value: boolean): void;
      setComponentCodeSQL(
        componentId: string,
        queryName: string,
        code: string,
      ): Promise<unknown>;
      getComponentCodeSQL(
        componentId: string,
        queryName: string,
      ): Promise<string>;
    };
  }
}
/* eslint-enable no-unused-vars */

export default defineNuxtPlugin(() => {
  const isLocalhost = ["localhost", "127.0.0.1"].includes(
    window.location.hostname,
  );
  if (!window.Cypress && !import.meta.dev && !isLocalhost) {
    return;
  }

  const systemsStore = useSystemsStore();
  const globalSettings = useGlobalSettingsStore();
  const highlightStore = useHighlightStore();
  const componentHelper = new ComponentHelper();
  const waitForComponent = async (componentId: string, timeoutMs = 30000) => {
    const startedAt = Date.now();
    const normalizedComponentId = String(componentId);

    while (Date.now() - startedAt < timeoutMs) {
      const component = systemsStore.selectedSystem?.actualComponents.find(
        (item) => String(item.id) === normalizedComponentId,
      );

      if (component) {
        return component;
      }

      await new Promise((resolve) => window.setTimeout(resolve, 100));
    }

    throw new Error(
      `Component "${normalizedComponentId}" was not found in the selected system.`,
    );
  };

  window.__informationSystemTestApi = {
    async selectedSystemDatabaseQuery(sql: string) {
      const database = systemsStore.selectedSystem?.database;
      if (!database) {
        throw new Error("Selected system database is not available.");
      }

      await database.initializeDatabase();
      return database.query(sql);
    },
    setBypassPageVisibility(value: boolean) {
      globalSettings.bypassPageVisibility = value;
    },
    setTeacherMode(value: boolean) {
      globalSettings.teacherMode = value;
    },
    setEditModeActive(value: boolean) {
      highlightStore.isEditModeActive = value;
    },
    async setComponentCodeSQL(
      componentId: string,
      queryName: string,
      code: string,
    ) {
      await waitForComponent(componentId);
      return componentHelper.setComponentCodeSQL(componentId, queryName, code);
    },
    async getComponentCodeSQL(componentId: string, queryName: string) {
      await waitForComponent(componentId);
      return componentHelper.getComponentCodeSQL(componentId, queryName);
    },
  };
});
