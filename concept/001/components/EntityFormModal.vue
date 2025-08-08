<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePropertyStore } from '#imports'
import type { InformationSystem } from '~/model/InformationSystem'
import { useHighlightWatchers } from '~/composables/highlightWatchers'
import '~/assets/css/highlight.css'
import { useHighlightStore } from '#imports'
import { useSelectedTaskStore } from '#imports'

const selectedTaskStore = useSelectedTaskStore()

/* Props */
const props = defineProps<{
  open: boolean
  selectedSystem: InformationSystem | null
  selectedTableName: string
  columnNames: string[]
  formState: Record<string, any>
  columnValuesMap: Record<string, string[]>
}>()

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

/* Local state for error mode */
const isMultiple = ref(true)

/**
 * Checks if a component is in error components for the current round.
 */
function isInErrorComponents(componentFilename: string): boolean {
  const getNotCompletedTasks = TaskQueue.getNotCompletedTasks(selectedTaskStore.currentRound)
  return getNotCompletedTasks.some(task => {
    return Array.isArray(task.errorComponents) &&
      task.errorComponents.some(ec => ec.name === componentFilename)
  })
}

/**
 * Watch current round to update isMultiple when in error mode.
 */
watch(
  () => selectedTaskStore.currentRound,
  () => {
    const isError = isInErrorComponents("table-form-účastníci-alergeny")
    if (isError) {
      isMultiple.value = ComponentHandler.getVariableValue("table-form-účastníci-alergeny", "isMultiple") || true
    } else {
      isMultiple.value = true
    }
  },
  { immediate: true, deep: true }
)

/**
 * Computed for :multiple binding.
 * - If NOT in error → force true
 * - If in error → follow isMultiple.value
 */
const multiplePropValue = computed(() => {
  return isInErrorComponents("table-form-účastníci-alergeny")
    ? false
    : true
})

/* Computed props */
const modalOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const localFormState = computed({
  get: () => props.formState,
  set: (value) => emit('update:formState', value)
})

useHighlightWatchers(highlightStore.highlightHandler, highlightStore)

/* Methods */
function isArrayType(type: string) {
  return type === 'array'
}

async function onSubmit() {
  console.log('Form submitted with data:', localFormState.value)

  props.columnNames.forEach(col => {
    if (isArrayType(propertyStore.propertiesNameTypeMap[col])) {
      const isError = isInErrorComponents("table-form-účastníci-alergeny")
      
      if (isError && !multiplePropValue.value) {
        // Non-multiple mode: convert single value to array string
        if (typeof localFormState.value[col] === 'string' && localFormState.value[col]) {
          localFormState.value[col] = JSON.stringify([localFormState.value[col]])
        } else if (!localFormState.value[col]) {
          localFormState.value[col] = JSON.stringify([])
        }
      } else if (Array.isArray(localFormState.value[col])) {
        // Multiple mode: convert array to JSON string
        localFormState.value[col] = JSON.stringify(localFormState.value[col])
      }
    }
  })

  const id = localFormState.value['id']

  try {
    if (!id) {
      const insertCols = props.columnNames.filter(col => col !== 'id')
      const insertVals = insertCols.map(col =>
        typeof localFormState.value[col] === 'string'
          ? `'${localFormState.value[col].replace(/'/g, "''")}'`
          : localFormState.value[col]
      )
      const sql = `INSERT INTO ${props.selectedTableName} (${insertCols.join(', ')}) VALUES (${insertVals.join(', ')})`
      props.selectedSystem?.db.exec(sql)
      toast.add({ title: t('add_toast_success'), color: 'success' })
    } else {
      const setClause = props.columnNames
        .filter(col => col !== 'id')
        .map(col => `${col} = ${typeof localFormState.value[col] === 'string' ? `'${localFormState.value[col].replace(/'/g, "''")}'` : localFormState.value[col]}`)
        .join(', ')
      const sql = `UPDATE ${props.selectedTableName} SET ${setClause} WHERE id = '${id}'`
      props.selectedSystem?.db.exec(sql)
      toast.add({ title: t('edit_entity_toast_success'), color: 'success' })
    }

    modalOpen.value = false
    emit('entitySaved')
  } catch (error) {
    console.error('Error saving entity:', error)
    toast.add({
      title: t('save_entity_error') || 'Error saving entity',
      color: 'error',
      icon: 'i-lucide-alert-triangle'
    })
  }
}

</script>

<template>
  <UModal :overlay="false" v-model:open="modalOpen" :title="localFormState.id ? t('edit_entity') : t('add_entity')">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ localFormState.id ? t('edit_entity') : t('add_entity') }}</h3>
        </template>
        <UForm :state="localFormState" @submit="onSubmit">
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="(col, index) in columnNames.filter(col => col !== 'id')"
              :key="index"
              class="flex flex-col"
            >
              <UCard
                :id="`table-form-${selectedTableName}-${col}`"
                class="highlightable"
                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(`table-form-${selectedTableName}-${col}`, $event)"
              >
                <label class="mb-1 font-medium text-sm text-gray-700">
                  {{ col }}
                  <span v-if="propertyStore.propertiesNameTypeMap[col]" class="text-xs text-gray-400 ml-2">
                    ({{ propertyStore.propertiesNameTypeMap[col] }})
                  </span>
                </label>

                <template v-if="isArrayType(propertyStore.propertiesNameTypeMap[col])">
                  <USelectMenu
                    v-model="localFormState[col]"
                    :items="columnValuesMap[col]"
                    class="w-48"
                    :disabled="highlightStore.isHighlightMode"
                    :multiple="multiplePropValue"
                  />
                </template>

                <template v-else>
                  <UInput
                    v-model="localFormState[col]"
                    :placeholder="`Enter ${col}`"
                    :disabled="highlightStore.isHighlightMode"
                  />
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

<style scoped>
</style>
