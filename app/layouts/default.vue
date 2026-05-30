<script setup lang="ts">
import { ref } from 'vue'
import SystemToolbar from '~/components/SystemToolbar.vue'

const route = useRoute()
const { t } = useI18n()
const globalSettings = useGlobalSettingsStore()
const systemsStore = useSystemsStore()

const isSystemRoute = computed(() => /^\/systems\/[^/]+\//.test(route.path))
const isFullscreenSystemPage = computed(() => route.meta.fullscreenSystemPage === true)
const showSystemChrome = computed(() => isSystemRoute.value && !isFullscreenSystemPage.value)
const scoreValue = computed(() => systemsStore.selectedSystem?.score.score ?? 0)
const mistakesCount = computed(() => systemsStore.selectedSystem?.mistakesCount ?? 0)

// Resizable right panel
const RIGHT_PANEL_MIN = 200
const RIGHT_PANEL_MAX = 700
const rightPanelWidth = ref<number | null>(null)
const rightPanelRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)

// Mobile slideover
const mobileTasksOpen = ref(false)

function onDividerMousedown(e: MouseEvent) {
  isDragging.value = true
  const startX = e.clientX
  const startWidth = rightPanelRef.value?.getBoundingClientRect().width ?? rightPanelWidth.value ?? window.innerWidth / 3

  function onMousemove(e: MouseEvent) {
    const delta = startX - e.clientX
    rightPanelWidth.value = Math.min(RIGHT_PANEL_MAX, Math.max(RIGHT_PANEL_MIN, startWidth + delta))
  }

  function onMouseup() {
    isDragging.value = false
    window.removeEventListener('mousemove', onMousemove)
    window.removeEventListener('mouseup', onMouseup)
  }

  window.addEventListener('mousemove', onMousemove)
  window.addEventListener('mouseup', onMouseup)
}

</script>

<template>
  <div class="default-layout flex flex-col overflow-hidden bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
    <!-- System route: 2-column layout (desktop) / single column (mobile) -->
    <div v-if="showSystemChrome" class="default-main flex flex-col lg:flex-row overflow-hidden" :class="{ 'select-none': isDragging }">

      <!-- Main column: nav bar + page content -->
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
        <SystemNavbar class="flex-shrink-0" @open-tasks="mobileTasksOpen = true" />
        <div class="flex-1 overflow-hidden">
          <CustomScrollbar>
            <slot />
          </CustomScrollbar>
        </div>
      </div>

      <UButton
        v-if="!mobileTasksOpen"
        icon="i-lucide-grid-2x2"
        color="primary"
        size="xl"
        class="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg shadow-primary-500/30 lg:hidden"
        :aria-label="t('tasks')"
        @click="mobileTasksOpen = true"
      />

      <!-- Drag divider (desktop only) -->
      <div
        class="divider hidden lg:block"
        @mousedown.prevent="onDividerMousedown"
      />

      <!-- Right column: toolbar + task list (desktop only) -->
      <div
        ref="rightPanelRef"
        class="task-sidebar-shell hidden lg:flex flex-shrink-0 flex-col overflow-hidden"
        :style="{ width: rightPanelWidth === null ? '35%' : rightPanelWidth + 'px' }"
      >
        <!-- Toolbar -->
        <div class="flex-shrink-0 overflow-x-auto border-b border-gray-200 px-3 py-2 dark:border-gray-800">
          <SystemToolbar />
        </div>

        <div class="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">{{ t('tasks') }}</h2>
          </div>
          <ModernHoverPopover
            v-if="!globalSettings.teacherMode"
            :title="t('score')"
            :description="t('score_mistakes_count', { count: mistakesCount })"
            icon="i-lucide-alert-triangle"
          >
            <UBadge color="red" variant="subtle" size="lg" class="font-bold px-3">
              {{ t('score') }}: {{ scoreValue }}
            </UBadge>
          </ModernHoverPopover>
        </div>
        <div class="flex-1 overflow-hidden">
          <CustomScrollbar>
            <TaskList />
          </CustomScrollbar>
        </div>
      </div>

      <!-- Mobile/tablet slideover (bottom) -->
      <USlideover
        v-model:open="mobileTasksOpen"
        side="bottom"
        class="lg:hidden"
        :ui="{ content: 'w-screen max-w-none' }"
      >
        <template #content>
          <div class="task-sidebar-shell flex h-[85dvh] w-screen max-w-none flex-col overflow-hidden">
            <!-- Toolbar -->
            <div class="flex flex-shrink-0 flex-nowrap items-center gap-2 overflow-x-auto border-b border-gray-200 px-3 py-2 dark:border-gray-800">
              <SystemToolbar class="min-w-0 flex-1" />
              <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="sm" class="shrink-0" @click="mobileTasksOpen = false" />
            </div>

            <div class="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <h2 class="text-base font-semibold text-gray-900 dark:text-white">{{ t('tasks') }}</h2>
              </div>
              <ModernHoverPopover
                v-if="!globalSettings.teacherMode"
                :title="t('score')"
                :description="t('score_mistakes_count', { count: mistakesCount })"
                icon="i-lucide-alert-triangle"
              >
                <UBadge color="red" variant="subtle" size="lg" class="font-bold px-3">
                  {{ t('score') }}: {{ scoreValue }}
                </UBadge>
              </ModernHoverPopover>
            </div>
            <div class="flex-1 overflow-hidden">
              <CustomScrollbar>
                <TaskList />
              </CustomScrollbar>
            </div>
          </div>
        </template>
      </USlideover>
    </div>

    <!-- Non-system route -->
    <main v-else class="default-main">
      <CustomScrollbar>
        <slot />
      </CustomScrollbar>
    </main>

    <StudentProgressModals v-if="showSystemChrome" />
  </div>
</template>

<style scoped>
.default-layout {
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.default-main {
  flex: 1;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
}

.divider {
  flex-shrink: 0;
  width: 5px;
  cursor: col-resize;
  background: transparent;
  border-left: 2px solid #e5e7eb;
  transition: border-color 0.15s;
}

.divider:hover,
.divider:active {
  border-color: #6366f1;
  background: #6366f110;
}

.task-sidebar-shell {
  background:
    radial-gradient(circle at 88% 92%, rgba(186, 230, 253, 0.72), transparent 34%),
    linear-gradient(135deg, #fffaf0 0%, #f2fbf6 32%, #eef7ff 64%, #f8fbff 100%);
}

@media (prefers-color-scheme: dark) {
  .divider {
    border-color: #374151;
  }
}

@media (max-width: 768px) {
  .right-panel {
    width: 240px;
  }
}
</style>
