<template>
  <div
    :id="codeBlockId"
    class="code-block-wrapper"
    :data-code-block-label="codeBlockName"
  >
    <div v-if="label || language" class="code-header">
      <div class="flex items-center gap-2">
        <span class="language-badge" :class="getLanguageClass">
          {{ label || language }}
        </span>
        <UBadge
          v-if="showCorrectBadge"
          :color="correct ? 'green' : 'red'"
          variant="subtle"
          size="sm"
        >
          {{ correct ? t('correct_badge') : t('incorrect_badge') }}
        </UBadge>
      </div>

      <div class="header-actions flex items-center justify-end gap-2">
        <UPopover
          v-if="infoDescription"
          mode="hover"
          arrow
          :ui="popoverUi"
        >
          <UButton
            icon="i-lucide-info"
            color="neutral"
            variant="ghost"
            size="sm"
            :aria-label="t('show_info')"
          />
          <template #content>
            <div class="app-popover-content">
              <UIcon name="i-lucide-info" class="app-popover-icon" />
              <div class="app-popover-text">
                <strong class="app-popover-title">
                  {{ infoTitle || label || language }}
                </strong>
                <span class="app-popover-description">
                  {{ infoDescription }}
                </span>
              </div>
            </div>
          </template>
        </UPopover>
      </div>
    </div>

    <div
      :id="`${codeBlockId}-editor`"
      class="editor-container"
      :data-code-editor-id="codeBlockId"
      :style="{ height: height }"
    >
      <vue-monaco-editor
        :language="transformedLanguage"
        :theme="monacoTheme"
        :value="displayValue"
        :options="editorOptions"
        class="monaco-editor-instance"
        @change="onCodeChange"
        @mount="onEditorMount"
      />
    </div>
  </div>
</template>


<script setup lang="ts">
/* eslint-disable no-unused-vars, @typescript-eslint/no-explicit-any */
/* 1. Imports */
import { computed, getCurrentInstance, onBeforeUnmount, ref, watch } from 'vue'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import { useI18n } from 'vue-i18n'

interface Props {
  code: string
  language: string
  label?: string
  height?: string
  readOnly?: boolean
  correct?: boolean
  protectedPrefix?: string
  originalCode?: string
  sizeMultiplier?: number
  infoTitle?: string
  infoDescription?: string
}

/* 2. Stores */

/* 3. Context hooks */
const { t } = useI18n()
const instance = getCurrentInstance()

/* 4. Constants (non-reactive) */
const monacoTheme = 'vs-light'
const popoverUi = { content: 'z-[10050]' }

/* 5. Props */
const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  height: '300px',
  readOnly: false,
  correct: undefined,
  protectedPrefix: undefined,
  originalCode: undefined,
  sizeMultiplier: 0.7,
  infoTitle: undefined,
  infoDescription: undefined,
})

/* 6. Emits */
const emit = defineEmits(['update:code', 'change', 'isEdited'])

/* 7. Template refs */

/* 8. State (ref, reactive) */
const initialCode = ref(props.code || '')
let monacoEditorInstance: any = null
let isUndoing = false

/* 9. Computed */
const showCorrectBadge = computed(() => {
  const vnodeProps = instance?.vnode.props ?? {}
  const hasCorrectProp =
    Object.prototype.hasOwnProperty.call(vnodeProps, 'correct') ||
    Object.prototype.hasOwnProperty.call(vnodeProps, 'correct-value')

  if (!hasCorrectProp || props.correct === undefined) return false

  if (!props.code || props.code.trim() === '') {
    return false
  }

  return true
})

const comparisonCode = computed(() => props.originalCode ?? initialCode.value)
const isEdited = computed(() => (props.code || '') !== (comparisonCode.value || ''))
const codeBlockName = computed(() => props.label || props.language)
const codeBlockId = computed(() => `code-${slugifyCodeBlockName(codeBlockName.value)}`)

const displayValue = computed(() => {
  if (props.protectedPrefix) {
    return `${props.protectedPrefix.trimEnd()}\n${props.code}`
  }

  return props.code
})

const protectedLineCount = computed(() => {
  if (!props.protectedPrefix) return 0

  return props.protectedPrefix.trimEnd().split('\n').length
})

const transformedLanguage = computed(() => {
  const lang = props.language.toLowerCase()

  if (lang === 'js') return 'javascript'
  if (lang === 'ts') return 'typescript'
  if (lang === 'vue' || lang.endsWith('.vue')) return 'html'

  return lang
})

const getLanguageClass = computed(() => {
  const lang = props.language.toLowerCase()

  if (lang === 'vue' || lang.endsWith('.vue')) return 'html-label'

  return `${lang}-label`
})

const editorOptions = computed(() => ({
  minimap: { enabled: false },
  wordWrap: 'on' as const,
  automaticLayout: true,
  scrollBeyondLastLine: false,
  fontSize: Math.max(8, 14 * props.sizeMultiplier),
  fontFamily: "'Fira Mono', 'Consolas', 'Menlo', 'Monaco', monospace",
  readOnly: props.readOnly,
  roundedSelection: true,
  padding: { top: 12, bottom: 12 },
  quickSuggestions: false,
  suggestOnTriggerCharacters: false,
  acceptSuggestionOnEnter: 'off' as const,
  tabCompletion: 'off' as const,
  wordBasedSuggestions: 'off' as const,
  parameterHints: { enabled: false },
  inlineSuggest: { enabled: false },
}))

/* 10. Watchers */
watch(isEdited, (value) => emit('isEdited', value), { immediate: true })

/* 11. Methods */
function onCodeChange(value: string | undefined) {
  if (props.protectedPrefix !== undefined) return

  const safeValue = value || ''
  emit('update:code', safeValue)
  emit('change', safeValue)
}

function onEditorMount(editor: any, monaco: any) {
  monacoEditorInstance = editor
  setupProtectionListener(editor, monaco)
  registerCodeBlockEditorForTests()
}

function slugifyCodeBlockName(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/\+/g, ' plus ')
    .replace(/#/g, ' sharp ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'block'
}

function getEditableEditorValue(): string {
  const value = monacoEditorInstance?.getValue?.() ?? displayValue.value
  if (!props.protectedPrefix) return value

  const separator = `${props.protectedPrefix.trimEnd()}\n`
  return value.startsWith(separator) ? value.substring(separator.length) : value
}

function setEditableEditorValue(value: string) {
  const fullValue = props.protectedPrefix
    ? `${props.protectedPrefix.trimEnd()}\n${value}`
    : value

  monacoEditorInstance?.setValue?.(fullValue)
  emit('update:code', value)
  emit('change', value)
}

function registerCodeBlockEditorForTests() {
  if (typeof window === 'undefined' || !monacoEditorInstance) return

  const win = window as typeof window & {
    __codeBlockEditors?: Record<string, {
      getValue: () => string
      setValue: (value: string) => void
    }>
  }

  win.__codeBlockEditors ??= {}
  win.__codeBlockEditors[codeBlockId.value] = {
    getValue: getEditableEditorValue,
    setValue: setEditableEditorValue,
  }
}

function setupProtectionListener(editor: any, monaco: any) {
  editor.onDidChangeModelContent((event: any) => {
    if (isUndoing || event.isFlush) return

    const lineCount = protectedLineCount.value

    if (lineCount === 0) {
      const full = editor.getValue()
      emit('update:code', full)
      emit('change', full)
      return
    }

    const model = editor.getModel()
    if (!model) return

    const totalLines = model.getLineCount()
    const lastLine = Math.min(lineCount, totalLines)
    const lastCol = model.getLineMaxColumn(lastLine)
    const protectedRange = new monaco.Range(1, 1, lastLine, lastCol)

    for (const change of event.changes) {
      if (protectedRange.intersectRanges(change.range)) {
        isUndoing = true
        editor.trigger('protected', 'undo', null)
        isUndoing = false
        return
      }
    }

    const full = editor.getValue()
    const separator = `${props.protectedPrefix!.trimEnd()}\n`
    const editablePart = full.startsWith(separator)
      ? full.substring(separator.length)
      : full

    emit('update:code', editablePart)
    emit('change', editablePart)
  })
}

function formatCode() {
  if (monacoEditorInstance && monacoEditorInstance.getAction) {
    const action = monacoEditorInstance.getAction('editor.action.formatDocument')
    if (action) {
      action.run()
    }
  }
}

/* 12. Lifecycle */
onBeforeUnmount(() => {
  if (typeof window === 'undefined') return

  const win = window as typeof window & {
    __codeBlockEditors?: Record<string, unknown>
  }

  delete win.__codeBlockEditors?.[codeBlockId.value]
})

/* 13. defineExpose */
defineExpose({
  formatCode,
})

</script>

<style scoped>
.code-block-wrapper {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: visible;
  border: 1px solid #d1d5db;
  background: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 12px 12px 0 0;
}

.language-badge {
  font-family: "Fira Mono", "Consolas", "Menlo", "Monaco", monospace;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 4px;
}

.html-label {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
}

.css-label {
  color: #f97316;
  background: rgba(249, 115, 22, 0.1);
}

.sql-label {
  color: #facc15;
  background: rgba(250, 204, 21, 0.1);
}

.js-label {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.editor-container {
  width: 100%;
  position: relative;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}

.monaco-editor-instance {
  width: 100%;
  height: 100%;
}

.editor-container :deep(.monaco-editor .scroll-decoration) {
  box-shadow: none;
}

.icon-btn.format-btn.i-lucide-text-initial {
  font-size: 1.3em;
  color: #64748b;
  transition: color 0.2s;
}

.icon-btn.format-btn.i-lucide-text-initial:hover {
  color: #0ea5e9;
}
</style>
