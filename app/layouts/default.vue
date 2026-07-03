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
const isFullscreenSystemPage = computed(() => route.meta.fullscreenSystemPage === true)
const scoreValue = computed(() => systemsStore.selectedSystem?.score.score ?? 0)
const mistakesCount = computed(() => systemsStore.selectedSystem?.mistakesCount ?? 0)

const mobileTasksOpen = ref(false)
</script>

<template>
  <div>
    <div v-if="atSystemPage" class="flex h-screen overflow-hidden">
      <div :class="['system-column flex min-h-0 w-full min-w-0 flex-col', isFullscreenSystemPage ? '' : 'lg:w-[65%]']">
        <SystemNavbar v-if="!isFullscreenSystemPage" @open-tasks="mobileTasksOpen = true" />
        <div class="min-h-0 flex-1">
          <UScrollArea class="h-full">
            <slot />
        </UScrollArea>
        </div>
      </div>

      <aside v-if="!isFullscreenSystemPage" class="tasks-column hidden min-h-0 w-[35%] shrink-0 flex-col border-l border-gray-300 lg:flex">
        <div >
          <SystemToolbar />
        </div>
        
        <div class="flex flex-row mt-4 items-center justify-between px-4">
          <div>
            <h2 class="text-1xl font-bold">{{ t('tasks') }}</h2>
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
              @click="mobileTasksOpen = false"
            size="sm" />
          </div>
        </template>

        <template #body>
          <div class="flex max-h-[calc(85dvh-5rem)] min-h-0 flex-col">
            <div>
              <SystemToolbar />
            </div>

            <div class="mt-4 flex items-center justify-between px-1">
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
