<script setup lang="ts">
/* 1. Imports */
import { useI18n } from 'vue-i18n'

/* 2. Stores */
// none

/* 3. Context hooks */
const { locale, availableLocales, setLocale } = useI18n()

/* 4. Constants (non-reactive) */
// none

/* 5. Props */
// none

/* 6. Emits */
// none

/* 7. Template refs */
// none

/* 8. Local state (ref, reactive) */
// none

/* 9. Computed */
// none

/* 10. Watchers */
// none

/* 11. Methods */
function onLocaleChange(newLocale: typeof availableLocales[number]) {
  setLocale(newLocale)
}

/* 12. Lifecycle */
// none

/* 13. defineExpose */
// none
</script>

<template>
  <UCard>
    <h1>Settings Page</h1>
    <div class="mt-4">
      <label for="locale-select" class="block mb-2">Jazyk / Language</label>
      <USelect
        v-model="locale"
        :items="availableLocales"
        class="w-48"
        @update:model-value="onLocaleChange"
      />
    </div>
  </UCard>
</template>