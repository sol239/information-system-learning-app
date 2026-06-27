<script setup lang="ts">
import SystemToolbar from '~/components/SystemToolbar.vue'

const route = useRoute()
const { t } = useI18n()
const globalSettings = useGlobalSettingsStore()
const systemsStore = useSystemsStore()

const atSystemPage = computed(() => {
  const [, systemsPath, systemId] = route.path.split('/')

  return systemsPath === 'systems' && Boolean(systemId)
})
const scoreValue = computed(() => systemsStore.selectedSystem?.score.score ?? 0)
const mistakesCount = computed(() => systemsStore.selectedSystem?.mistakesCount ?? 0)

const mobileTasksOpen = ref(false)
</script>

<template>
  <div class="default-layout">
    <div v-if="atSystemPage" class="default-main system-layout">
      <div class="system-column">
        <SystemNavbar class="system-navbar" @open-tasks="mobileTasksOpen = true" />
        <div class="content-scroll-area">
          <CustomScrollbar>
            <slot />
          </CustomScrollbar>
        </div>
      </div>

      <aside class="task-column">
        <div class="toolbar-row">
          <SystemToolbar />
        </div>

        <div class="tasks-header">
          <div class="tasks-title-group">
            <h2 class="tasks-title">{{ t('tasks') }}</h2>
          </div>
          <UPopover
            v-if="!globalSettings.teacherMode"
            mode="hover"
            arrow
          >
            <span class="score-trigger">
              <UBadge color="red" variant="subtle" size="lg" icon="i-lucide-alert-triangle" class="score-badge">
                {{ t('score') }}: {{ scoreValue }}
              </UBadge>
            </span>

            <template #content>
              <div class="score-popover">
                <UIcon name="i-lucide-alert-triangle" class="score-popover-icon" />
                <div class="score-popover-text">
                  <strong class="score-popover-title">{{ t('score') }}</strong>
                  <span class="score-popover-description">{{ t('score_mistakes_count', { count: mistakesCount }) }}</span>
                </div>
              </div>
            </template>
          </UPopover>
        </div>
        <div class="tasks-scroll-area">
          <CustomScrollbar>
            <TaskList />
          </CustomScrollbar>
        </div>
      </aside>

      <UModal
        v-model:open="mobileTasksOpen"
        :title="t('tasks')"
        class="mobile-task-modal"
        :ui="{ content: 'mobile-task-modal-content', body: 'mobile-task-modal-body' }"
      >
        <template #body>
          <div class="mobile-task-panel">
            <div class="mobile-toolbar-row">
              <SystemToolbar class="mobile-toolbar" />
            </div>

            <div class="tasks-header">
              <div class="tasks-title-group">
                <h2 class="tasks-title">{{ t('tasks') }}</h2>
              </div>
              <UPopover
                v-if="!globalSettings.teacherMode"
                mode="hover"
                arrow
              >
                <span class="score-trigger">
                  <UBadge color="red" variant="subtle" size="lg" icon="i-lucide-alert-triangle" class="score-badge">
                    {{ t('score') }}: {{ scoreValue }}
                  </UBadge>
                </span>

                <template #content>
                  <div class="score-popover">
                    <UIcon name="i-lucide-alert-triangle" class="score-popover-icon" />
                    <div class="score-popover-text">
                      <strong class="score-popover-title">{{ t('score') }}</strong>
                      <span class="score-popover-description">{{ t('score_mistakes_count', { count: mistakesCount }) }}</span>
                    </div>
                  </div>
                </template>
              </UPopover>
            </div>
            <div class="tasks-scroll-area">
              <CustomScrollbar>
                <TaskList />
              </CustomScrollbar>
            </div>
          </div>
        </template>
      </UModal>
    </div>

    <main v-else class="default-main">
      <CustomScrollbar>
        <slot />
      </CustomScrollbar>
    </main>

    <StudentProgressModals v-if="atSystemPage" />
  </div>
</template>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  color: #111827;
  background: #ffffff;
}

.default-main {
  flex: 1;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
}

.system-layout {
  display: flex;
  flex-direction: column;
}

.system-column {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.system-navbar {
  flex: 0 0 auto;
}

.content-scroll-area,
.tasks-scroll-area {
  flex: 1 1 auto;
  overflow: hidden;
}

.task-column {
  display: none;
}

.toolbar-row,
.mobile-toolbar-row,
.tasks-header {
  flex: 0 0 auto;
  border-bottom: 1px solid #e5e7eb;
}

.toolbar-row {
  overflow-x: auto;
  padding: 0.5rem 0.75rem;
}

.mobile-toolbar-row {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.5rem 0.75rem;
}

.mobile-toolbar {
  min-width: 0;
  flex: 1 1 auto;
}

.tasks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
}

.tasks-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.tasks-title {
  margin: 0;
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5rem;
}

.score-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding-right: 0.75rem;
  padding-left: 0.75rem;
  font-weight: 700;
}

.score-trigger {
  display: inline-flex;
}

.score-popover {
  display: flex;
  min-width: 15rem;
  max-width: 18rem;
  gap: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #ffffff;
  padding: 0.75rem;
  box-shadow: 0 10px 25px rgb(15 23 42 / 0.12);
}

.score-popover-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex: 0 0 auto;
  color: #dc2626;
}

.score-popover-text {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.25rem;
}

.score-popover-title {
  color: #111827;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.score-popover-description {
  color: #4b5563;
  font-size: 0.8125rem;
  line-height: 1.25rem;
}

.mobile-task-modal {
  display: block;
}

:deep(.mobile-task-modal-content) {
  width: min(100vw - 2rem, 36rem);
  max-width: none;
}

:deep(.mobile-task-modal-body) {
  padding: 0;
}

.mobile-task-panel {
  display: flex;
  width: 100%;
  max-width: none;
  height: min(75dvh, 42rem);
  flex-direction: column;
  overflow: hidden;
}

@media (min-width: 1024px) {
  .system-layout {
    flex-direction: row;
  }

  .system-column {
    flex: 3 1 0;
  }

  .task-column {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    min-width: 18rem;
    overflow: hidden;
    border-left: 1px solid #e5e7eb;
  }

  .mobile-task-modal {
    display: none;
  }
}

@media (prefers-color-scheme: dark) {
  .default-layout {
    color: #f3f4f6;
    background: #030712;
  }

  .toolbar-row,
  .mobile-toolbar-row,
  .tasks-header,
  .task-column {
    border-color: #1f2937;
  }

  .tasks-title {
    color: #ffffff;
  }

  .score-popover {
    border-color: #374151;
    background: #111827;
  }

  .score-popover-title {
    color: #ffffff;
  }

  .score-popover-description {
    color: #d1d5db;
  }
}
</style>
