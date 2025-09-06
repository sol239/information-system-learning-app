<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePropertyStore } from '#imports'
import type { InformationSystem } from '~/model/InformationSystem'
import { useHighlightWatchers } from '~/composables/highlightWatchers'
import '~/assets/css/highlight.css'
import { useHighlightStore } from '#imports'
import { highlight } from '@nuxt/ui/runtime/utils/fuse.js'
import { useComponentCodeStore } from '#imports'
import { useInformationSystemStore } from '~/stores/useInformationSystemStore'
import { useSelectedSystemStore } from '~/stores/useSelectedSystemStore'

// TODO: Restructure

/* Stores */
const informationSystemStore = useInformationSystemStore()
const selectedSystemStore = useSelectedSystemStore()

/* Props */
const props = defineProps<{
  open: boolean
  selectedTableName: string
  columnNames: string[]
  formState: Record<string, any>
  columnValuesMap: Record<string, string[]>
}>()

/* Computed */
const selectedSystem = computed(() => {
  return informationSystemStore.systems.find(s => s.id === selectedSystemStore.selectedId) || null
})

/* Emits */
const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:formState': [value: Record<string, any>]
  'entitySaved': [void]
}>()

/* Composables */
const { t } = useI18n()
const toast = useToast()
const propertyStore = usePropertyStore()
const highlightStore = useHighlightStore()
const componentCodeStore = useComponentCodeStore()
/* Local state */

/* Computed */
const modalOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})


const menuType = computed(() => {
  if (ComponentHandler.isInErrorComponents("table-form-účastníci-alergeny")) {
    const errorSql = ComponentHandler.getVariableValue("table-form-účastníci-alergeny", "isMultiple")
    return typeof errorSql === 'boolean' ? errorSql : true
  }
  return true
})

const localFormState = computed({
  get: () => props.formState,
  set: (value) => emit('update:formState', value)
})

useHighlightWatchers(highlightStore.highlightHandler, highlightStore);

/* Methods */
function isArrayType(type: string) {
  return type === 'array'
}

async function onSubmit() {
  console.log('Form submitted with data:', localFormState.value)

  // Transform array fields to JSON string before saving
  props.columnNames.forEach(col => {
    if (isArrayType(propertyStore.propertiesNameTypeMap[col]) && Array.isArray(localFormState.value[col])) {
      localFormState.value[col] = JSON.stringify(localFormState.value[col])
    }
  })

  const id = localFormState.value['id']

  try {
    if (!id) {
      // Insert new row (skip 'id' column)
      const insertCols = props.columnNames.filter(col => col !== 'id')
      const insertVals = insertCols.map(col =>
        typeof localFormState.value[col] === 'string'
          ? `'${localFormState.value[col].replace(/'/g, "''")}'`
          : localFormState.value[col]
      )
      const sql = `INSERT INTO ${props.selectedTableName} (${insertCols.join(', ')}) VALUES (${insertVals.join(', ')})`
            console.log("SQL Query: ", sql)

      selectedSystem.value?.db.exec(sql)
      toast.add({ title: t('add_toast_success'), color: 'primary' })
    } else {
      // Update the row if id is present
      const setClause = props.columnNames
        .filter(col => col !== 'id')
        .map(col => `${col} = ${typeof localFormState.value[col] === 'string' ? `'${localFormState.value[col].replace(/'/g, "''")}'` : localFormState.value[col]}`)
        .join(', ')

      const sql = `UPDATE ${props.selectedTableName} SET ${setClause} WHERE id = '${id}'`
      console.log("SQL Query: ", sql)
      selectedSystem.value?.db.exec(sql)
      toast.add({ title: t('edit_entity_toast_success'), color: 'primary' })
    }

    modalOpen.value = false
    emit('entitySaved')
  } catch (error) {
    console.error('Error saving entity:', error)
    toast.add({
      title: t('save_entity_error') || 'Error saving entity',
      color: 'red',
      icon: 'i-lucide-alert-triangle'
    })
  }
}
</script>

<template>
  <UModal v-model:open="modalOpen" :title="localFormState.id ? t('edit_entity') : t('add_entity')">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ localFormState.id ? t('edit_entity') : t('add_entity') }}</h3>
        </template>
        <UForm :state="localFormState" @submit="onSubmit">
          <div class="grid grid-cols-2 gap-4">
            <div v-for="(col, index) in columnNames.filter(col => col !== 'id')" :key="index"
               class="flex flex-col">
              <UCard :id="`table-form-${selectedTableName}-${col}`" class="highlightable"  @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(`table-form-${selectedTableName}-${col}`, $event)">
                <label class="mb-1 font-medium text-sm text-gray-700">
                  {{ col }}
                  <span v-if="propertyStore.propertiesNameTypeMap[col]" class="text-xs text-gray-400 ml-2">
                    ({{ propertyStore.propertiesNameTypeMap[col] }})
                  </span>
                </label>
                <template v-if="isArrayType(propertyStore.propertiesNameTypeMap[col])">
                  <USelectMenu v-model="localFormState[col]" :items="columnValuesMap[col]" class="w-48" :disabled="highlightStore.isHighlightMode"
                    :multiple="menuType" />
                </template>
                <template v-else>
                  <UInput v-model="localFormState[col]" :placeholder="`Enter ${col}`" :disabled="highlightStore.isHighlightMode"/>
                </template>
              </UCard>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <UButton type="submit" color="primary" :disabled="highlightStore.isHighlightMode">{{ t('save') }}</UButton>
            <UButton variant="outline" @click="modalOpen = false" :disabled="highlightStore.isHighlightMode">{{ t('cancel') }}</UButton>
          </div>
        </UForm>
      </UCard>
    </template>
  </UModal>
</template>
