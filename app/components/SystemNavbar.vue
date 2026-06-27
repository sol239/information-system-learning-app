<template>
  <div
    class="w-full sticky top-0 z-[11000] bg-white/80 backdrop-blur-md border-b border-gray-200"
  >
    <div class="max-w-[100vw] px-4 mx-auto">
      <!-- Main navbar container -->
      <div class="flex flex-wrap items-center gap-4 py-2">
        <!-- Left Section: Navigation Menu -->
        <nav
          class="flex flex-wrap items-center gap-1 p-1 bg-gray-100/50 rounded-lg border border-gray-200/50"
        >
          <template v-for="item in localItems" :key="item.route">
            <NuxtLink
              v-if="isPageAvailable(item.route)"
              :to="item.to"
              class="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 group relative"
              :class="[
                $route.path === item.to
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50'
                  : 'text-gray-600 hover:bg-white/50 hover:text-gray-900',
              ]"
            >
              <UIcon
                :name="item.icon || 'i-lucide-file'"
                class="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
              />
              <span class="text-sm font-medium">{{ item.label }}</span>

              <div
                v-if="$route.path === item.to"
                class="absolute -bottom-1 left-3 right-3 h-0.5 bg-primary-500 rounded-full"
              />
            </NuxtLink>

            <UPopover v-else mode="hover" arrow>
              <button
                type="button"
                class="flex cursor-not-allowed items-center gap-2 rounded-md px-3 py-1.5 text-gray-400 opacity-70"
                :aria-label="`${item.label}: ${t('task_page_unavailable_description')}`"
              >
                <UIcon :name="item.icon || 'i-lucide-lock'" class="h-5 w-5" />
                <span class="text-sm font-medium">{{ item.label }}</span>
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

        <div class="right-actions ml-auto flex items-center">
          <NuxtLink
            v-if="isPageAvailable(DATABASE_PAGE_ROUTE)"
            :to="databaseTo"
            class="flex items-center gap-2 rounded-lg border border-gray-200/70 bg-gray-100/50 px-3 py-2 text-sm font-medium transition-all duration-200"
            :class="[
              $route.path === databaseTo
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/60'
                : 'text-gray-600 hover:bg-white/70 hover:text-gray-900',
            ]"
          >
            <UIcon name="i-heroicons-table-cells" class="h-5 w-5" />
            <span>{{ t("database") }}</span>
          </NuxtLink>

          <UPopover v-else mode="hover" arrow>
            <button
              type="button"
              class="flex cursor-not-allowed items-center gap-2 rounded-lg border border-gray-200/70 bg-gray-100/50 px-3 py-2 text-sm font-medium text-gray-400 opacity-70"
              :aria-label="`${t('database')}: ${t('task_page_unavailable_description')}`"
            >
              <UIcon name="i-heroicons-table-cells" class="h-5 w-5" />
              <span>{{ t("database") }}</span>
            </button>
            <template #content>
              <div class="app-popover-content">
                <UIcon name="i-heroicons-table-cells" class="app-popover-icon" />
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
            class="mobile-tasks-nav-button"
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
import {
  DATABASE_PAGE_ROUTE,
  systemAllowsPageForTaskContext,
  systemVisiblePages,
} from "~/utils/taskPageVisibility";

/* 2. Stores */
const systemsStore = useSystemsStore();
const globalSettingsStore = useGlobalSettingsStore();
const emit = defineEmits<{
  "open-tasks": [];
}>();

/* 3. Context hooks */
const { t, locale } = useI18n();
const databaseTo = computed(
  () => `/systems/${systemsStore.selectedSystemId}${DATABASE_PAGE_ROUTE}`
);

/* 8. Local state (ref, reactive) */
const tasksPopoverOpen = ref(false);

const selectedTask = computed(() => {
  const selectedTaskId = globalSettingsStore.selectedTaskId;

  if (!selectedTaskId) {
    return null;
  }

  return (
    systemsStore.selectedSystem?.tasks?.find((task) => task.id === selectedTaskId) ?? null
  );
});

const localItems = computed(() => {
  // Access locale.value so the computed updates when the locale changes
  void locale.value;

  const system = systemsStore.selectedSystem;
  const pages = system
    ? systemVisiblePages(system, t("database")).filter(
        (page) => page.route !== DATABASE_PAGE_ROUTE
      )
    : [];
  return pages.map((page) => ({
    label: page.name,
    route: page.route,
    icon: page.icon,
    to: `/systems/${systemsStore.selectedSystemId}${page.route}`,
    data_target: page.route.replace(/^\//, "").replace(/\//g, "-"),
  }));
});

function isPageAvailable(pageRoute: string): boolean {
  const system = systemsStore.selectedSystem;
  return system
    ? systemAllowsPageForTaskContext(system, selectedTask.value, pageRoute)
    : true;
}

/* 10. Watchers */
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
</script>

<style scoped>
.right-actions {
  gap: 0.5rem;
}

.mobile-tasks-nav-button {
  display: none;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(209 213 219 / 0.7);
  border-radius: 0.5rem;
  background: rgb(243 244 246 / 0.5);
  padding: 0.5rem 0.75rem;
  color: #4b5563;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  transition: background-color 0.2s, color 0.2s;
}

.mobile-tasks-nav-button:hover {
  background: rgb(255 255 255 / 0.7);
  color: #111827;
}

/* Hide button labels on mobile screens */
@media (max-width: 639px) {
  .mobile-hidden {
    display: none;
  }
}

@media (max-width: 1023px) {
  .mobile-tasks-nav-button {
    display: inline-flex;
  }
}

</style>
