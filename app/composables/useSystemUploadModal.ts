import { onMounted, ref, watch } from "vue";
import { SystemHelper } from "~/core/systems/SystemHelper";
import { DefaultSystemLoader } from "~/core/systems/DefaultSystemLoader";
import { TaskSet } from "~/model/Task/TaskSet";
import { resetTaskProgress } from "~/utils/taskProgress";
import { OperationResultType } from "~/utils/Operation/OperationResultType";
import { validateTaskSetJson } from "~/core/validation/validateTaskSetJson";

export function useSystemUploadModal(systemId: string) {
  const systemsStore = useSystemsStore();
  const { t } = useI18n();

  const selectedFile = ref<File | null>(null);
  const uploadedTaskSet = ref<TaskSet | null>(null);
  const loading = ref(false);
  const loadingPreloaded = ref(false);
  const systemPreview = ref<{ name: string; description: string } | null>(null);
  const systemAlreadyExists = ref(false);
  const uploadError = ref("");
  const systemsToPreload = ref<TaskSet[]>([]);
  const selectedPreloadedSystem = ref<TaskSet | null>(null);
  let fileSelectionVersion = 0;

  onMounted(async () => {
    await loadPreloadedSystemsList();
  });

  watch(selectedFile, async (file) => {
    const version = ++fileSelectionVersion;
    if (file) {
      selectedPreloadedSystem.value = null;
    }

    if (!file) {
      uploadedTaskSet.value = null;
      systemPreview.value = null;
      if (selectedPreloadedSystem.value) {
        validateTaskSet(selectedPreloadedSystem.value);
        return;
      }
      uploadError.value = "";
      systemAlreadyExists.value = false;
      return;
    }

    uploadError.value = "";
    try {
      const raw = JSON.parse(await file.text());
      if (version !== fileSelectionVersion) return;
      const errors = validateTaskSetJson(raw);
      if (errors.length) throw new Error(errors.join("; "));
      const taskSet = TaskSet.fromJSON(raw, "uploaded_tasks");
      uploadedTaskSet.value = taskSet;
      systemPreview.value = {
        name: taskSet.name,
        description: taskSet.description,
      };
      validateTaskSet(taskSet);
    } catch (error) {
      if (version !== fileSelectionVersion) return;
      uploadError.value =
        error instanceof Error ? error.message : String(error);
      uploadedTaskSet.value = null;
      systemPreview.value = null;
    }
  });

  function selectPreloadedSystem(sys: TaskSet) {
    if (selectedPreloadedSystem.value?.id === sys.id) {
      resetSelection();
      return;
    }
    selectedPreloadedSystem.value = sys;
    selectedFile.value = null;
    uploadedTaskSet.value = null;
    systemPreview.value = null;
    validateTaskSet(sys);
  }

  function resetSelection() {
    fileSelectionVersion++;
    selectedPreloadedSystem.value = null;
    selectedFile.value = null;
    uploadedTaskSet.value = null;
    systemPreview.value = null;
    systemAlreadyExists.value = false;
    uploadError.value = "";
  }

  function validateTaskSet(taskSet: TaskSet) {
    uploadError.value =
      taskSet.systemId !== systemId
        ? t("task_set_system_mismatch", {
            actual: taskSet.systemId,
            expected: systemId,
          })
        : "";
    systemAlreadyExists.value = Boolean(
      systemsStore.systems
        .find((system) => system.id === systemId)
        ?.taskSets.some((set) => set.id === taskSet.id),
    );
  }

  async function loadPreloadedSystemsList() {
    loadingPreloaded.value = true;
    systemsToPreload.value = [];

    try {
      const available = await new DefaultSystemLoader().loadTaskSets(
        SystemHelper.getSystemsToPreloadIds(),
      );
      systemsToPreload.value = available.filter(
        (set) => set.systemId === systemId,
      );
    } catch (error) {
      console.error("Failed to load preloaded systems:", error);
    } finally {
      loadingPreloaded.value = false;
    }
  }

  async function onUpload(close: () => void) {
    const taskSet = selectedPreloadedSystem.value ?? uploadedTaskSet.value;
    if (!taskSet) return;
    validateTaskSet(taskSet);
    if (uploadError.value || systemAlreadyExists.value) return;
    loading.value = true;
    try {
      await addSystemTaskSet(taskSet);
      selectedFile.value = null;
      uploadedTaskSet.value = null;
      selectedPreloadedSystem.value = null;
      close();
    } catch (error) {
      uploadError.value =
        error instanceof Error ? error.message : String(error);
    } finally {
      loading.value = false;
    }
  }

  async function addSystemTaskSet(taskSet: TaskSet) {
    const system = systemsStore.systems.find((item) => item.id === systemId);
    if (!system) {
      throw new Error(t("task_set_system_not_found", { systemId }));
    }

    const resetTaskSet = new TaskSet({
      id: taskSet.id,
      systemId: taskSet.systemId,
      name: taskSet.name,
      description: taskSet.description,
      levelCount: taskSet.levelCount,
      tasks: taskSet.tasks.map((task) => resetTaskProgress(task)),
    });
    system.addTaskSet(resetTaskSet);
    const result = await systemsStore.updateSystem(system, {
      formatCode: true,
    });
    if (result.result !== OperationResultType.SUCCESS) {
      throw new Error(result.message);
    }
  }

  return {
    selectedFile,
    loading,
    loadingPreloaded,
    systemPreview,
    systemAlreadyExists,
    uploadError,
    systemsToPreload,
    selectedPreloadedSystem,
    selectPreloadedSystem,
    resetSelection,
    onUpload,
  };
}
