<template>
  <UDrawer v-model:open="isOpen" direction="right">
    <UButton color="sky" variant="outline" @click="openDrawer" icon="i-heroicons-cog-6-tooth" style="margin-left: 10px">
      {{ t('settings') }}
    </UButton>

    <template #content>
      <UCard class="p-4 min-w-96">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">{{ t('settings') }}</h3>
            <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="isOpen = false" />
          </div>
        </template>

        <SettingsComponent />
      </UCard>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
/* 1. Imports */
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

/* 2. Stores */

/* 3. Context hooks */
const { t } = useI18n()

/* 4. Constants (non-reactive) */

/* 5. Props */

/* 6. Emits */

/* 7. Template refs */

/* 8. Local state (ref, reactive) */
const isOpen = ref(false)

/* 9. Computed */

/* 10. Watchers */

/* 11. Methods */
function openDrawer() {
  isOpen.value = true
}

/* 12. Lifecycle */

/* 13. defineExpose */
</script>

<style scoped>
</style>
