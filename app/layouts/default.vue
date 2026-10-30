<template>
  <div>
    <UModal
      v-model:open="teacherHelpModalOpen"
      :title="t('teacher_help_title')"
    />
    <div v-if="atSystemPage" class="flex h-screen overflow-hidden">
      <div
        :class="[
          'system-column flex min-h-0 w-full min-w-0 flex-col',
          isFullscreenSystemPage || desktopTasksCollapsed ? '' : 'lg:w-[65%]',
        ]"
      >
        <div v-if="!isFullscreenSystemPage" ref="systemNavbarContainer">
          <SystemNavbar @open-tasks="mobileTasksOpen = true" />
        </div>
        <div class="min-h-0 flex-1">
          <UScrollArea class="h-full">
            <slot />
          </UScrollArea>
        </div>
      </div>

      <aside
        v-if="!isFullscreenSystemPage"
        :class="[
          'tasks-column hidden min-h-0 shrink-0 flex-col border-l border-gray-300 lg:flex',
          desktopTasksCollapsed ? 'tasks-column-collapsed w-12' : 'w-[35%]',
        ]"
      >
        <div
          class="desktop-tasks-header flex items-center"
          :style="
            systemNavbarHeight
              ? { height: `${systemNavbarHeight}px` }
              : undefined
          "
        >
          <UButton
            :icon="
              desktopTasksCollapsed
                ? 'i-lucide-panel-right-open'
                : 'i-lucide-panel-right-close'
            "
            color="neutral"
            variant="ghost"
            size="sm"
            class="m-1.5 shrink-0 !size-7 !min-w-7 !p-0 justify-center !bg-transparent hover:!bg-white/20"
            :aria-label="
              t(
                desktopTasksCollapsed
                  ? 'expand_tasks_sidebar'
                  : 'collapse_tasks_sidebar',
              )
            "
            :title="
              t(
                desktopTasksCollapsed
                  ? 'expand_tasks_sidebar'
                  : 'collapse_tasks_sidebar',
              )
            "
            :aria-expanded="!desktopTasksCollapsed"
            @click="desktopTasksCollapsed = !desktopTasksCollapsed"
          />
          <div v-if="!desktopTasksCollapsed" class="h-full min-w-0 flex-1">
            <SystemToolbar />
          </div>
        </div>
        <SystemToolbar
          v-if="desktopTasksCollapsed && !globalSettings.teacherMode"
          compact
        />

        <div
          v-if="!desktopTasksCollapsed"
          class="flex flex-row mt-4 items-center justify-between px-4"
        >
          <div>
            <h2 class="text-1xl font-bold text-gray-900">{{ t("tasks") }}</h2>
          </div>
          <div class="flex items-center gap-2">
            <UButton
              v-if="globalSettings.teacherMode"
              color="neutral"
              variant="outline"
              size="sm"
              icon="i-lucide-circle-help"
              @click="teacherHelpModalOpen = true"
            >
              {{ t("teacher_help") }}
            </UButton>
            <UPopover v-if="!globalSettings.teacherMode" mode="hover" arrow>
              <span>
                <UBadge
                  color="red"
                  variant="subtle"
                  size="lg"
                  icon="i-lucide-list-todo"
                >
                  {{ t("score") }}: {{ scoreValue }}
                </UBadge>
              </span>

              <template #content>
                <div class="app-popover-content">
                  <UIcon name="i-lucide-list-todo" class="app-popover-icon" />
                  <div class="app-popover-text">
                    <strong class="app-popover-title">{{ t("score") }}</strong>
                    <span class="app-popover-description">{{
                      t("score_mistakes_count", { count: mistakesCount })
                    }}</span>
                  </div>
                </div>
              </template>
            </UPopover>
          </div>
        </div>
        <div v-if="!desktopTasksCollapsed" class="min-h-0 flex-1">
          <UScrollArea class="h-full">
            <TaskList />
          </UScrollArea>
        </div>
      </aside>

      <UDrawer
        v-if="!isFullscreenSystemPage"
        v-model:open="mobileTasksOpen"
        direction="bottom"
        :title="t('tasks')"
        :ui="{ content: 'max-h-[85dvh]', body: 'min-h-0' }"
      >
        <template #header>
          <div class="flex justify-end">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              :aria-label="t('task_close')"
              size="sm"
              @click="mobileTasksOpen = false"
            />
          </div>
        </template>

        <template #body>
          <div class="flex max-h-[calc(85dvh-5rem)] min-h-0 flex-col">
            <div>
              <SystemToolbar />
            </div>

            <div class="mt-4 flex items-center justify-between px-1">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">
                  {{ t("tasks") }}
                </h2>
              </div>
              <div class="flex items-center gap-2">
                <UButton
                  v-if="globalSettings.teacherMode"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  icon="i-lucide-circle-help"
                  @click="teacherHelpModalOpen = true"
                >
                  {{ t("teacher_help") }}
                </UButton>
                <UPopover v-if="!globalSettings.teacherMode" mode="hover" arrow>
                  <span>
                    <UBadge
                      color="red"
                      variant="subtle"
                      size="lg"
                      icon="i-lucide-list-todo"
                    >
                      {{ t("score") }}: {{ scoreValue }}
                    </UBadge>
                  </span>

                  <template #content>
                    <div class="app-popover-content">
                      <UIcon
                        name="i-lucide-list-todo"
                        class="app-popover-icon"
                      />
                      <div class="app-popover-text">
                        <strong class="app-popover-title">{{
                          t("score")
                        }}</strong>
                        <span class="app-popover-description">{{
                          t("score_mistakes_count", { count: mistakesCount })
                        }}</span>
                      </div>
                    </div>
                  </template>
                </UPopover>
              </div>
            </div>
            <div class="min-h-0 flex-1">
              <UScrollArea class="h-full">
                <TaskList />
              </UScrollArea>
            </div>
          </div>
        </template>
      </UDrawer>
    </div>

    <main v-else class="h-screen overflow-hidden">
      <UScrollArea class="h-full">
        <slot />
      </UScrollArea>
    </main>

    <StudentProgressModals v-if="atSystemPage && !isFullscreenSystemPage" />
  </div>
</template>

<script setup lang="ts">
/* 1. Imports */
import SystemToolbar from "~/components/SystemToolbar.vue";

defineOptions({
  name: "DefaultLayout",
});

/* 2. Stores */
const globalSettings = useGlobalSettingsStore();
const systemsStore = useSystemsStore();

/* 3. Context hooks */
const route = useRoute();
const { t } = useI18n();

/* 4. Constants (non-reactive) */

/* 5. Props */

/* 6. Emits */

/* 7. Template refs */

/* 8. State (ref, reactive) */
const mobileTasksOpen = ref(false);
const teacherHelpModalOpen = ref(false);
const desktopTasksCollapsed = ref(false);
const systemNavbarContainer = ref<HTMLElement | null>(null);
const systemNavbarHeight = ref<number | null>(null);

/* 9. Computed */
const atSystemPage = computed(() => {
  const [, systemsPath, systemId] = route.path.split("/");

  return systemsPath === "systems" && Boolean(systemId);
});

const isFullscreenSystemPage = computed(
  () => route.meta.fullscreenSystemPage === true,
);
const scoreValue = computed(
  () => systemsStore.selectedSystem?.score.score ?? 0,
);
const mistakesCount = computed(
  () => systemsStore.selectedSystem?.mistakesCount ?? 0,
);

/* 10. Watchers */
watch(
  systemNavbarContainer,
  (element, _previous, onCleanup) => {
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry)
        systemNavbarHeight.value =
          entry.borderBoxSize[0]?.blockSize ??
          element.getBoundingClientRect().height;
    });
    observer.observe(element);
    onCleanup(() => observer.disconnect());
  },
  { flush: "post" },
);

/* 11. Methods */

/* 12. Lifecycle */

/* 13. defineExpose */
</script>

<style scoped>
.desktop-tasks-header {
  background: radial-gradient(
    circle at top left,
    #bdddf7,
    #dceffc 50%,
    #f5edac 100%
  );
}

.desktop-tasks-header :deep(.system-toolbar) {
  background: transparent;
  height: 100%;
  min-height: 0;
  flex-wrap: nowrap;
}

.tasks-column {
  background: radial-gradient(
    circle at top left,
    #d6ecff,
    #eef8ff 50%,
    #fff8c7 100%
  );
}

.tasks-column-collapsed {
  background: radial-gradient(
    circle at top left,
    #bdddf7,
    #dceffc 50%,
    #f5edac 100%
  );
}

.tasks-column-collapsed .desktop-tasks-header,
.tasks-column-collapsed :deep(.system-toolbar) {
  background: transparent;
}
</style>
