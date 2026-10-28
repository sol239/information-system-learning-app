<template>
  <div
    class="w-full sticky top-0 z-[11000] bg-white/80 backdrop-blur-md border-b border-gray-200"
  >
    <div class="max-w-[100vw] px-4 mx-auto">
      <!-- Main navbar container -->
      <div class="flex flex-wrap items-center gap-4 py-2">
        <!-- Left Section: Navigation Menu -->
        <nav
          class="flex flex-wrap items-center gap-1 p-1 bg-gray-100/50 rounded-lg border border-gray-200/50 lg:max-[1441px]:gap-1 lg:max-[1441px]:p-1"
        >
          <template v-for="item in localItems" :key="item.route">
            <NuxtLink
              v-if="isPageAvailable(item.route)"
              :to="item.to"
              class="flex items-center gap-2 px-3 py-1.5 rounded-md transition-none relative lg:max-[1441px]:gap-[7px] lg:max-[1441px]:px-[11px] lg:max-[1441px]:py-[5px] lg:max-[1441px]:text-[13px] lg:max-[1441px]:leading-[18px]"
              :class="[
                $route.path === item.to
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50'
                  : 'text-gray-600 hover:bg-white/50 hover:text-gray-900',
              ]"
            >
              <UIcon
                :name="item.icon || 'i-lucide-file'"
                class="w-5 h-5 lg:max-[1441px]:size-[18px]"
              />
              <span
                class="text-sm font-medium lg:max-[1441px]:text-[13px] lg:max-[1441px]:leading-[18px]"
                >{{ item.label }}</span
              >

              <div
                v-if="$route.path === item.to"
                class="absolute -bottom-1 left-3 right-3 h-0.5 bg-primary-500 rounded-full"
                :style="
                  item.activeColor
                    ? { backgroundColor: item.activeColor }
                    : undefined
                "
              />
            </NuxtLink>

            <UPopover v-else mode="hover" arrow>
              <button
                type="button"
                class="flex cursor-not-allowed items-center gap-2 rounded-md px-3 py-1.5 text-gray-400 opacity-70 lg:max-[1441px]:gap-[7px] lg:max-[1441px]:px-[11px] lg:max-[1441px]:py-[5px] lg:max-[1441px]:text-[13px] lg:max-[1441px]:leading-[18px]"
                :aria-label="`${item.label}: ${t('task_page_unavailable_description')}`"
              >
                <UIcon
                  :name="item.icon || 'i-lucide-lock'"
                  class="h-5 w-5 lg:max-[1441px]:size-[18px]"
                />
                <span
                  class="text-sm font-medium lg:max-[1441px]:text-[13px] lg:max-[1441px]:leading-[18px]"
                  >{{ item.label }}</span
                >
              </button>
              <template #content>
                <div class="app-popover-content">
                  <UIcon name="i-lucide-lock" class="app-popover-icon" />
                  <div class="app-popover-text">
                    <strong class="app-popover-title">{{
                      t("task_page_unavailable_title")
                    }}</strong>
                    <span class="app-popover-description">{{
                      t("task_page_unavailable_description")
                    }}</span>
                  </div>
                </div>
              </template>
            </UPopover>
          </template>
        </nav>

        <div class="ml-auto flex items-center gap-2 lg:max-[1441px]:gap-[7px]">
          <NuxtLink
            v-if="isPageAvailable(databasePageRoute)"
            id="go-to-database-button"
            :to="databaseTo"
            class="flex items-center gap-2 rounded-lg border border-gray-200/70 bg-gray-100/50 px-3 py-2 text-sm font-medium transition-none lg:max-[1441px]:gap-[7px] lg:max-[1441px]:px-[11px] lg:max-[1441px]:py-[5px] lg:max-[1441px]:text-[13px] lg:max-[1441px]:leading-[18px]"
            :class="[
              $route.path === databaseTo
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/60'
                : 'text-gray-600 hover:bg-white/70 hover:text-gray-900',
            ]"
          >
            <UIcon
              name="i-heroicons-table-cells"
              class="h-5 w-5 lg:max-[1441px]:size-[18px]"
            />
            <span>{{ t("database") }}</span>
          </NuxtLink>

          <UPopover v-else mode="hover" arrow>
            <button
              type="button"
              class="flex cursor-not-allowed items-center gap-2 rounded-lg border border-gray-200/70 bg-gray-100/50 px-3 py-2 text-sm font-medium text-gray-400 opacity-70 lg:max-[1441px]:gap-[7px] lg:max-[1441px]:px-[11px] lg:max-[1441px]:py-[5px] lg:max-[1441px]:text-[13px] lg:max-[1441px]:leading-[18px]"
              :aria-label="`${t('database')}: ${t('task_page_unavailable_description')}`"
            >
              <UIcon
                name="i-heroicons-table-cells"
                class="h-5 w-5 lg:max-[1441px]:size-[18px]"
              />
              <span>{{ t("database") }}</span>
            </button>
            <template #content>
              <div class="app-popover-content">
                <UIcon
                  name="i-heroicons-table-cells"
                  class="app-popover-icon"
                />
                <div class="app-popover-text">
                  <strong class="app-popover-title">{{
                    t("task_page_unavailable_title")
                  }}</strong>
                  <span class="app-popover-description">{{
                    t("task_page_unavailable_description")
                  }}</span>
                </div>
              </div>
            </template>
          </UPopover>

          <button
            color="primary"
            type="button"
            class="inline-flex items-center justify-center rounded-lg border border-gray-300/70 bg-gray-100/50 px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-white/70 hover:text-gray-900 lg:hidden"
            @click="emit('open-tasks')"
          >
            {{ t("tasks") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/* 1. Imports */
import { computed, onMounted, onUnmounted, ref } from "vue";

import { TaskHelper } from "~/core/systems/TaskHelper";

import { isTaskDone } from "~/utils/taskLevels";

import { SYSTEM_NAVBAR_PAGES } from "~/utils/systemPages";

/* 2. Stores */
const systemsStore = useSystemsStore();

const globalSettingsStore = useGlobalSettingsStore();

/* 3. Context hooks */
const runtimeConfig = useRuntimeConfig();

const { t, locale } = useI18n();

/* 4. Constants (non-reactive) */

/* 5. Props */

/* 6. Emits */
const emit = defineEmits<{
  "open-tasks": [];
}>();

/* 7. Template refs */

/* 8. State (ref, reactive) */
const tasksPopoverOpen = ref(false);

/* 9. Computed */
const databasePageRoute = computed(() =>
  String(runtimeConfig.public.databasePageRoute),
);

const databaseTo = computed(
  () => `/systems/${systemsStore.selectedSystemId}${databasePageRoute.value}`,
);

const selectedTask = computed(() => {
  const selectedTaskId = globalSettingsStore.selectedTaskId;

  if (!selectedTaskId) {
    return null;
  }

  return (
    systemsStore.selectedSystem?.tasks?.find(
      (task) => task.id === selectedTaskId,
    ) ?? null
  );
});

const taskPagesAreUnrestricted = computed(() => {
  const system = systemsStore.selectedSystem;

  return (
    !system ||
    globalSettingsStore.bypassPageVisibility ||
    globalSettingsStore.teacherMode ||
    (!system.startedTasks && system.exploringSystem)
  );
});

const relevantVisiblePageTasks = computed(() => {
  const system = systemsStore.selectedSystem;

  if (!system || taskPagesAreUnrestricted.value) {
    return [];
  }

  if (selectedTask.value) {
    return [selectedTask.value];
  }

  const tasks = system.tasks ?? [];
  if (!tasks.length || tasks.every(isTaskDone)) {
    return [];
  }

  return tasks.filter((task) => task.level === system.currentLevel);
});

const currentLevelVisiblePageTasks = computed(() => {
  const system = systemsStore.selectedSystem;

  if (!system || taskPagesAreUnrestricted.value) {
    return [];
  }

  const tasks = system.tasks ?? [];
  if (!tasks.length || tasks.every(isTaskDone)) {
    return [];
  }

  return tasks.filter((task) => task.level === system.currentLevel);
});

const availableTaskPages = computed(() =>
  TaskHelper.getVisiblePages(relevantVisiblePageTasks.value),
);

const localItems = computed(() => {
  // Access locale.value so the computed updates when the locale changes
  void locale.value;

  const system = systemsStore.selectedSystem;
  const pages = system
    ? system
        .visiblePages(t("database"))
        .filter((page) => page.route !== databasePageRoute.value)
    : [];
  return pages.map((page) => ({
    label: page.name,
    route: page.route,
    icon: page.icon,
    activeColor:
      page.activeColor ||
      SYSTEM_NAVBAR_PAGES.find(
        (defaultPage) => defaultPage.route === page.route,
      )?.activeColor,
    to: `/systems/${systemsStore.selectedSystemId}${page.route}`,
    data_target: page.route.replace(/^\//, "").replace(/\//g, "-"),
  }));
});

/* 10. Watchers */

/* 11. Methods */
function isPageAvailable(pageRoute: string): boolean {
  const system = systemsStore.selectedSystem;
  const isDatabasePage = pageRoute === databasePageRoute.value;

  if (!system || taskPagesAreUnrestricted.value) {
    return !isDatabasePage || system?.databaseAllowed !== false;
  }

  if (isDatabasePage) {
    return (
      system.databaseAllowed !== false &&
      TaskHelper.shouldIncludeDatabasePage(currentLevelVisiblePageTasks.value)
    );
  }

  const tasks = relevantVisiblePageTasks.value;
  if (!tasks.length) {
    return true;
  }

  if (tasks.some((task) => !Array.isArray(task.visiblePages))) {
    return true;
  }

  return availableTaskPages.value.some((page) => page.route === pageRoute);
}

/* 12. Lifecycle */
onMounted(() => {
  // TODO:
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "q" && event.altKey) {
      //highlightStore.toggleHighlight()
    }
    if (event.key === "w" && event.altKey) {
      //highlightStore.toggleEdit()
    }
    if (event.key === "t" && event.altKey) {
      event.preventDefault();
      tasksPopoverOpen.value = !tasksPopoverOpen.value;
    }
  };

  document.addEventListener("keydown", handleKeydown);

  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeydown);
  });
});

/* 13. defineExpose */
</script>

<style scoped></style>
