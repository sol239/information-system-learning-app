<template>
  <div class="flex flex-col items-center justify-center py-16">
    <UCard style="width: 90%;">
      <label for="locale-select" class="block mb-2">Jazyk / Language</label>
      <USelect
        v-model="locale"
        :items="localeOptions"
        class="w-48"
        @update:model-value="onLocaleChange"
      />
    </UCard>

    <UCard class="mt-4" style="width: 90%;">
      <div v-for="[action, shortcut] in settingsStore.shortcuts" :key="action" class="mb-4 flex justify-between items-center">
        <span class="text-lg font-bold">{{ t(action) }}</span>
        <UKbd size="lg" variant="solid" style="background-color: #05df72; border-color: #05df72;">{{ shortcut }}</UKbd>
      </div>
    </UCard>
  </div>
  <!--<AddSystemForm class="mt-4" /> -->
</template>

<script setup lang="ts">
/* 1. Imports */
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useSettingsStore } from "#imports"

/* 2. Stores */
const settingsStore = useSettingsStore()

/* 3. Context hooks */
const { locale, availableLocales, setLocale } = useI18n()

/* 4. Constants (non-reactive) */
const { t } = useI18n()

/* 5. Props */
// none

/* 6. Emits */
// none

/* 7. Template refs */
// none

/* 8. Local state (ref, reactive) */
// none

/* 9. Computed */
const localeOptions = computed(() =>
  availableLocales.map(locale => ({
    value: locale,
    label: locale === 'cs' ? 'Čeština' : 'English',
    icon: locale === 'cs' ? 'i-flag-cz-4x3' : 'i-flag-us-4x3'
  }))
)

const shortcutRows = computed(() => {
  // Defensive: fallback if shortcuts is not set
  if (!settingsStore.shortcuts || !(settingsStore.shortcuts instanceof Map)) return []
  return Array.from(settingsStore.shortcuts.entries()).map(([action, shortcut]) => ({
    action,
    shortcut
  }))
})

const shortcutColumns = [
  { id: 'action', label: 'Action / Akce' },
  { id: 'shortcut', label: 'Shortcut / Zkratka' }
]

/* 10. Watchers */
// none

/* 11. Methods */
function onLocaleChange(newLocale: 'cs' | 'en') {
  setLocale(newLocale)
}

/* 12. Lifecycle */
// none

/* 13. defineExpose */
// none
</script>
