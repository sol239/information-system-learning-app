<template>
  <div class="flex justify-center py-16">
  <UCard  style="width: 90%;">
    <label for="locale-select" class="block mb-2">Jazyk / Language</label>
    <USelect 
      v-model="locale" 
      :items="localeOptions" 
      class="w-48" 
      @update:model-value="onLocaleChange" 
    />
  </UCard>
</div>
  <!--<AddSystemForm class="mt-4" /> -->
</template>

<script setup lang="ts">
/* 1. Imports */
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'



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
const localeOptions = computed(() => 
  availableLocales.map(locale => ({
    value: locale,
    label: locale === 'cs' ? 'Čeština' : 'English',
    icon: locale === 'cs' ? 'i-flag-cz-4x3' : 'i-flag-us-4x3'
  }))
)

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
