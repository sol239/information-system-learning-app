<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePropertyStore } from '#imports'
import type { InformationSystem } from '~/model/InformationSystem'
import { useHighlightWatchers } from '~/composables/highlightWatchers'
import '~/assets/css/highlight.css'
import { useHighlightStore } from '#imports'
import { useSelectedTaskStore } from '#imports'
import type { FormError } from '@nuxt/ui'

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

/* Validation rules based on schema */
const validationRules: Record<string, Record<string, any>> = {
  participant: {
    id: { required: true, type: 'integer', min: 1 },
    jméno: { required: true, type: 'string', minLength: 1 },
    email: { required: true, type: 'string', format: 'email' },
    rodné_číslo: { required: true, type: 'string', pattern: /^[0-9]{6}\/[0-9]{4}$/ },
    telefon: { required: true, type: 'string', pattern: /^\+420 [0-9]{3} [0-9]{3} [0-9]{3}$/ },
    adresa: { required: true, type: 'string', minLength: 1 },
    věk: { required: true, type: 'integer', min: 6, max: 18 },
    alergeny: {
      required: true, type: 'array', enum: [
        "Lepek", "Korýši", "Vejce", "Ryby", "Arašídy", "Sója", "Mléko", "Skořápkové plody", "Celer", "Hořčice", "Sezam", "Oxid siřičitý a siřičitany", "Vlčí bob", "Měkkýši"
      ], uniqueItems: true
    },
    turnus_id: { required: true, type: 'integer', min: 1 }
  },
  food: {
    id: { required: true, type: 'integer', min: 1 },
    jméno: { required: true, type: 'string', minLength: 1 },
    alergeny: {
      required: true, type: 'array', enum: [
        "Lepek", "Korýši", "Vejce", "Ryby", "Arašídy", "Sója", "Mléko", "Skořápkové plody", "Celer", "Hořčice", "Sezam", "Oxid siřičitý a siřičitany", "Vlčí bob", "Měkkýši"
      ], uniqueItems: true
    },
    kdy_podáváno: { required: true, type: 'string', enum: ["snídaně", "oběd", "večeře"] }
  },
  session: {
    id: { required: true, type: 'integer', min: 1 },
    od: { required: true, type: 'string', format: 'date-time' },
    do: { required: true, type: 'string', format: 'date-time' },
    kapacita: { required: true, type: 'integer', min: 1 }
  },
  supervisor: {
    id: { required: true, type: 'integer', min: 1 },
    jméno: { required: true, type: 'string', minLength: 1 },
    email: { required: true, type: 'string', format: 'email' },
    rodné_číslo: { required: true, type: 'string', pattern: /^[0-9]{6}\/[0-9]{4}$/ },
    telefon: { required: true, type: 'string', pattern: /^\+420 [0-9]{3} [0-9]{3} [0-9]{3}$/ },
    adresa: { required: true, type: 'string', minLength: 1 },
    věk: { required: true, type: 'integer', min: 18 },
    turnus_id: { required: true, type: 'integer', min: 1 }
  },
  task: {
    id: { required: true, type: 'integer', min: 1 },
    title: { required: true, type: 'string', minLength: 1 },
    description: { required: true, type: 'string', minLength: 1 },
    status: { required: true, type: 'string', enum: ["pending", "completed", "failed"] },
    kind: { required: true, type: 'string', enum: ["select", "type-correct", "action"] },
    answer: { required: true, type: 'string' },
    elementClass: { required: true, type: 'string' },
    round: { required: true, type: 'integer', min: 1 }
  },
  allergen: {
    id: { required: true, type: 'integer', min: 1 },
    název: {
      required: true, type: 'string', enum: [
        "Lepek", "Korýši", "Vejce", "Ryby", "Arašídy", "Sója", "Mléko", "Skořápkové plody", "Celer", "Hořčice", "Sezam", "Oxid siřičitý a siřičitany", "Vlčí bob", "Měkkýši"
      ]
    }
  }
}

/**
 * Detect entity type from table name
 */
const entityType = computed(() => {
  if (props.selectedTableName.startsWith('účastníci')) return 'participant'
  if (props.selectedTableName.startsWith('jídla')) return 'food'
  if (props.selectedTableName.startsWith('turnusy')) return 'session'
  if (props.selectedTableName.startsWith('vedoucí')) return 'supervisor'
  if (props.selectedTableName.startsWith('úkoly')) return 'task'
  if (props.selectedTableName.startsWith('alergeny')) return 'allergen'
  return ''
})

/* Validation error state */
const validationErrors = ref<Record<string, string>>({})

/**
* Validation function
*/
function validateForm(): boolean {
  const rules = validationRules[entityType.value] || {}
  validationErrors.value = {}
  let valid = true

  for (const col of props.columnNames) {
    if (col === 'id' && !localFormState.value.id) continue // allow empty id for new entity
    const rule = rules[col]
    const value = localFormState.value[col]

    if (!rule) continue

    // Required
    if (rule.required && (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))) {
      validationErrors.value[col] = t('field_required')
      valid = false
      continue
    }

    // Type checks
    if (rule.type === 'integer' && value !== undefined && value !== null && value !== '') {
      if (isNaN(Number(value)) || !Number.isInteger(Number(value))) {
        validationErrors.value[col] = t('field_must_be_integer')
        valid = false
        continue
      }
      if (rule.min !== undefined && Number(value) < rule.min) {
        validationErrors.value[col] = t('field_minimum', { min: rule.min })
        valid = false
        continue
      }
      if (rule.max !== undefined && Number(value) > rule.max) {
        validationErrors.value[col] = t('field_maximum', { max: rule.max })
        valid = false
        continue
      }
    }
    if (rule.type === 'string' && value !== undefined && value !== null) {
      if (rule.minLength !== undefined && String(value).length < rule.minLength) {
        validationErrors.value[col] = t('field_min_length', { min: rule.minLength })
        valid = false
        continue
      }
      if (rule.format === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        validationErrors.value[col] = t('field_invalid_email')
        valid = false
        continue
      }
      if (rule.pattern && value && !rule.pattern.test(value)) {
        validationErrors.value[col] = t('field_invalid_format')
        valid = false
        continue
      }
      if (rule.enum && value && !rule.enum.includes(value)) {
        validationErrors.value[col] = t('field_invalid_value')
        valid = false
        continue
      }
    }
    if (rule.type === 'array' && Array.isArray(value)) {
      if (rule.enum && value.some((v: string) => !rule.enum.includes(v))) {
        validationErrors.value[col] = t('field_invalid_value')
        valid = false
        continue
      }
      if (rule.uniqueItems && new Set(value).size !== value.length) {
        validationErrors.value[col] = t('field_unique_items')
        valid = false
        continue
      }
    }
  }
  return valid
}

  // TODO: strucute
  const validate = (state: any): FormError[] => {
    const errors = []
    if (!localFormState.value.email) errors.push({ name: 'email', message: 'Required' })
    return errors
  }

  async function onError(event: FormErrorEvent) {
    if (event?.errors?.[0]?.id) {
      const element = document.getElementById(event.errors[0].id)
      element?.focus()
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

// Make validation reactive as user types
watch(localFormState, () => {
  validateForm()
}, { deep: true, immediate: true })

/* Methods */
function isArrayType(type: string) {
  return type === 'array'
}

async function onSubmit() {
  // Only prevent submit if there are errors
  if (!validateForm()) {
    // No need for toast, errors are shown live
    return
  }

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
        <UForm :state="localFormState" @submit="onSubmit" :validate="validate" @error="onError">
          <div class="grid grid-cols-2 gap-4">
            <div v-for="(col, index) in columnNames.filter(col => col !== 'id')" :key="index" class="flex flex-col">
              <UCard :id="`table-form-${selectedTableName}-${col}`" class="highlightable"
                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(`table-form-${selectedTableName}-${col}`, $event)">
                <label class="mb-1 font-medium text-sm text-gray-700">
                  {{ col }}
                  <span v-if="propertyStore.propertiesNameTypeMap[col]" class="text-xs text-gray-400 ml-2">
                    ({{ propertyStore.propertiesNameTypeMap[col] }})
                  </span>
                </label>

                <template v-if="isArrayType(propertyStore.propertiesNameTypeMap[col])">
                  <USelectMenu v-model="localFormState[col]" :items="columnValuesMap[col]" class="w-48"
                    :disabled="highlightStore.isHighlightMode" :multiple="multiplePropValue" :class="{
                      'border border-red-500': validationErrors[col] && localFormState[col] && (
                        Array.isArray(localFormState[col]) ? localFormState[col].length > 0 : true
                      )
                    }" />
                </template>

                <template v-else>
                  <UInput v-model="localFormState[col]" :placeholder="`Enter ${col}`"
                    :disabled="highlightStore.isHighlightMode" :class="{
                      'border border-red-500': validationErrors[col] && localFormState[col]
                    }" />
                </template>
                <span v-if="validationErrors[col] && localFormState[col] && (
                  Array.isArray(localFormState[col]) ? localFormState[col].length > 0 : true
                )" class="text-xs text-red-500 mt-1">{{ validationErrors[col] }}</span>
              </UCard>
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <UButton type="submit" color="primary" :disabled="highlightStore.isHighlightMode">{{ t('save') }}</UButton>
            <UButton variant="outline" @click="modalOpen = false" :disabled="highlightStore.isHighlightMode">{{
              t('cancel') }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </template>
  </UModal>
</template>

<style scoped>
/* UInput/USelectMenu may need border override if their default style doesn't show border */
.border-red-500 {
  border-color: #ef4444 !important;
}
</style>
