<template>
    <UCard>
        <UForm v-model="form">
            <UInput
                v-model="form.jsonPath"
                label="JSON Path"
                :placeholder="t('enter_json_path')"
                required
            />
            <UButton color="primary" :label="t('add_system')" />
        </UForm>
    </UCard>
</template>

<script setup lang="ts">
// TODO: Dokončit přidání systému z json souboru.
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const form = ref({
  jsonPath: ''
})

</script>