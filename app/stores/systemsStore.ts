import type { InformationSystem } from "~/model/InformationSystem";
import type { IStorage } from "~/core/storage/IStorage";
import { IndexedDBStorage } from "~/core/storage/IndexedDB/IndexedDBStorage";
import type { Operation } from "~/utils/Operation/Operation";
import { OperationResultType } from "~/utils/Operation/OperationResultType";

import { emptyComponent } from "~/model/SystemComponents/EmptyComponent";
import { formatSystemCode } from "~/utils/formatSystemCode";
import { migrateMealPlanNaming } from "~/utils/migrateMealPlanNaming";

export const useSystemsStore = defineStore(
  "systems",
  () => {
    const runtimeConfig = useRuntimeConfig();

    async function formatLoadedSystem(
      system: InformationSystem,
    ): Promise<void> {
      if (String(runtimeConfig.public.formatCodeOnSystemLoad) !== "true")
        return;
      try {
        await formatSystemCode(system);
      } catch (error) {
        console.warn(
          "Could not initialize code formatting; loading the system without formatting.",
          error,
        );
      }
    }

    const selectedSystemId = ref<string | null>(null);
    const globalSettingsStore = useGlobalSettingsStore();
    const storage: IStorage = new IndexedDBStorage();

    const selectedSystem = computed<InformationSystem | null>(() => {
      return (
        systems.value.find(
          (system) => String(system.id) === String(selectedSystemId.value),
        ) ?? null
      );
    });

    const getComponentById = (componentId: string) => {
      const normalizedComponentId = String(componentId);
      const solvedComponentIds = new Set(
        (globalSettingsStore.solvedComponentIds ?? []).map((id) => String(id)),
      );

      // Prefer task-specific error variants only while the component is still unsolved.
      for (const task of selectedSystem.value?.tasks ?? []) {
        for (const component of task.errorComponents ?? []) {
          if (
            String(component.id) === normalizedComponentId &&
            !solvedComponentIds.has(normalizedComponentId)
          ) {
            return component;
          }
        }
      }

      // otherwise return the component from the system components
      return (
        selectedSystem.value?.actualComponents.find(
          (component) => String(component.id) === normalizedComponentId,
        ) ?? emptyComponent
      );
    };

    const systems = ref<InformationSystem[]>([]);

    const getSystemById = (id: string): InformationSystem | undefined => {
      return systems.value.find((system) => String(system.id) === String(id));
    };

    async function deleteSystemById(id: string): Promise<Operation<null>> {
      const result = await storage.deleteSystem(id);
      if (result.result === OperationResultType.SUCCESS) {
        systems.value = systems.value.filter(
          (system) => String(system.id) !== String(id),
        );
      }
      return result;
    }

    async function updateSystem(
      system: InformationSystem,
      options: { formatCode?: boolean } = {},
    ): Promise<Operation<null>> {
      if (options.formatCode) await formatLoadedSystem(system);
      const result = await storage.saveSystem(system);
      if (result.result === OperationResultType.SUCCESS) {
        const index = systems.value.findIndex((s) => s.id === system.id);
        if (index !== -1) {
          systems.value[index] = system;
        }
      }
      return result;
    }

    async function addSystem(
      system: InformationSystem,
    ): Promise<Operation<null>> {
      await migrateMealPlanNaming(system);
      await formatLoadedSystem(system);
      const result = await storage.saveSystem(system);
      if (result.result === OperationResultType.SUCCESS) {
        const index = systems.value.findIndex(
          (existingSystem) => String(existingSystem.id) === String(system.id),
        );
        if (index === -1) {
          systems.value.push(system);
        } else {
          systems.value[index] = system;
        }
      }
      return result;
    }

    async function loadSystemsFromStorage(systemIds: string[]): Promise<void> {
      const loadedSystems: InformationSystem[] = [];

      for (const systemId of systemIds) {
        const result = await storage.getSystem(systemId);
        if (result.result === OperationResultType.SUCCESS && result.data) {
          const migrated = await migrateMealPlanNaming(result.data);
          await formatLoadedSystem(result.data);
          if (
            migrated ||
            String(runtimeConfig.public.formatCodeOnSystemLoad) === "true"
          ) {
            await storage.saveSystem(result.data);
          }
          loadedSystems.push(result.data);
        }
      }

      systems.value = loadedSystems;
    }

    function getPrimarySystem(): InformationSystem | null {
      if (systems.value.length === 0) {
        return null;
      }
      return systems.value[0] ?? null;
    }

    function setPrimarySystem(id: string): void {
      const selectedIndex = systems.value.findIndex(
        (system) => String(system.id) === String(id),
      );
      if (selectedIndex <= 0) {
        return;
      }

      const currentPrimary = systems.value[0];
      const selectedSystem = systems.value[selectedIndex];
      const otherSystems = systems.value.filter(
        (_, index) => index !== 0 && index !== selectedIndex,
      );

      systems.value = [selectedSystem, ...otherSystems, currentPrimary];
    }

    function getAvailableSystems(): InformationSystem[] {
      return systems.value;
    }

    return {
      systems,
      selectedSystem,
      selectedSystemId,
      addSystem,
      deleteSystemById,
      getSystemById,
      loadSystemsFromStorage,
      updateSystem,
      getComponentById,
      getPrimarySystem,
      setPrimarySystem,
      getAvailableSystems,
    };
  },
  {
    persist: {
      pick: ["selectedSystemId"],
    },
  },
);
