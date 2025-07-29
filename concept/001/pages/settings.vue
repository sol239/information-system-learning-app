<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale, availableLocales, setLocale } = useI18n()

function onLocaleChange(newLocale: typeof availableLocales[number]) {
  setLocale(newLocale)
}
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