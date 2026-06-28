<script setup lang="ts">

// TODO: zde je potreba jeste poresit to UI, tailwind vs ne? spis jo, 

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
  <div>
    <div v-if="atSystemPage" class="flex h-screen overflow-hidden">
      <div class="system-column flex min-h-0 w-[65%] min-w-0 flex-col">
        <SystemNavbar @open-tasks="mobileTasksOpen = true" />
        <div class="min-h-0 flex-1">
          <UScrollArea class="h-full">
            <slot />
          </UScrollArea>
        </div>
      </div>

      <aside class="tasks-column flex min-h-0 w-[35%] shrink-0 flex-col border-l border-gray-300">
        <div >
          <SystemToolbar />
        </div>
        
        <div class="flex flex-row mt-4 items-center justify-between px-4">
          <div>
            <h2 class="text-2xl font-bold">{{ t('tasks') }}</h2>
          </div>
          <UPopover v-if="!globalSettings.teacherMode" mode="hover" arrow>
            <span>
              <UBadge color="red" variant="subtle" size="lg" icon="i-lucide-list-todo">
                {{ t('score') }}: {{ scoreValue }}
              </UBadge>
            </span>

            <template #content>
              <div class="app-popover-content">
                <UIcon name="i-lucide-list-todo" class="app-popover-icon" />
                <div class="app-popover-text">
                  <strong class="app-popover-title">{{ t('score') }}</strong>
                  <span class="app-popover-description">{{ t('score_mistakes_count', { count: mistakesCount }) }}</span>
                </div>
              </div>
            </template>
          </UPopover>
        </div>
        <div class="min-h-0 flex-1">
          <UScrollArea class="h-full">
            <TaskList />
          </UScrollArea>
        </div>
      </aside>

      <UModal v-model:open="mobileTasksOpen" :title="t('tasks')">
        <template #body>
          <div>
            <div>
              <SystemToolbar />
            </div>

            <div>
              <div>
                <h2>{{ t('tasks') }}</h2>
              </div>
              <UPopover v-if="!globalSettings.teacherMode" mode="hover" arrow>
                <span>
                  <UBadge color="red" variant="subtle" size="lg" icon="i-lucide-list-todo">
                    {{ t('score') }}: {{ scoreValue }}
                  </UBadge>
                </span>

                <template #content>
                  <div class="app-popover-content">
                    <UIcon name="i-lucide-list-todo" class="app-popover-icon" />
                    <div class="app-popover-text">
                      <strong class="app-popover-title">{{ t('score') }}</strong>
                      <span class="app-popover-description">{{ t('score_mistakes_count', { count: mistakesCount }) }}</span>
                    </div>
                  </div>
                </template>
              </UPopover>
            </div>
            <div class="min-h-0 flex-1">
              <UScrollArea class="h-full">
                <TaskList />
              </UScrollArea>
            </div>
          </div>
        </template>
      </UModal>
    </div>

    <main v-else class="h-screen overflow-hidden">
      <UScrollArea class="h-full">
        <slot />
      </UScrollArea>
    </main>

    <StudentProgressModals v-if="atSystemPage" />
  </div>
</template>

<style scoped>
.tasks-column {
  background: radial-gradient(
  circle at top left,
  #d6ecff,
  #eef8ff 50%,
  #fff8c7 100%
);
}
</style>
