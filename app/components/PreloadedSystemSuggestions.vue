<template>
  <div>
    <p class="mb-2 font-medium">{{ t('choose_from_suggestions') }}</p>
    <div v-if="loading" class="flex justify-center p-4">
      <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin text-gray-500" />
    </div>
    <div v-else-if="systemsToPreload.length === 0" class="text-sm text-gray-500">
      {{ t('no_suggestions_available') }}
    </div>
    <div v-else class="space-y-2 max-h-64 overflow-y-auto pr-2">
      <div
        v-for="system in systemsToPreload"
        :key="system.id"
        role="button"
        tabindex="0"
        class="p-3 border rounded-lg cursor-pointer transition-colors"
        :class="String(selectedSystemId) === String(system.id)
          ? 'border-teacher-500 bg-teacher-50/50'
          : 'border-gray-200 hover:border-gray-300'"
        @click="emit('select', system)"
        @keydown.enter="emit('select', system)"
        @keydown.space.prevent="emit('select', system)"
      >
        <p class="font-semibold text-sm">{{ system.name }}</p>
        <p class="text-xs text-gray-500 line-clamp-1">{{ system.description }}</p>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
/* 1. Imports */
import type { TaskSet } from '~/model/Task/TaskSet'

/* 2. Stores */

/* 3. Context hooks */
const { t } = useI18n()

/* 4. Constants (non-reactive) */

/* 5. Props */
defineProps<{
  systemsToPreload: TaskSet[]
  selectedSystemId: string | null
  loading: boolean
}>()

/* 6. Emits */
const emit = defineEmits<{
  select: [system: TaskSet]
}>()

/* 7. Template refs */

/* 8. State (ref, reactive) */

/* 9. Computed */

/* 10. Watchers */

/* 11. Methods */

/* 12. Lifecycle */

/* 13. defineExpose */
defineExpose({
})
</script>
