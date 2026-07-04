<template>
  <div :class="triggerWrapperClass" @click="openModal">
    <slot />
  </div>

  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="isOpen"
        class="modal-overlay"
        @click.self="handleBackdropClick"
      >
        <div
          class="modal-panel"
          role="dialog"
          aria-modal="true"
          :aria-label="title || 'Modal dialog'"
        >
          <div v-if="title || $slots.header" class="modal-header">
            <slot name="header">
              <h2 class="modal-title">{{ title }}</h2>
            </slot>
          </div>

          <div class="modal-body">
            <slot name="content" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>


<script setup lang="ts">
/* 1. Imports */
import { computed, onBeforeUnmount, useAttrs, watch } from 'vue'

/* 2. Stores */

/* 3. Context hooks */
const attrs = useAttrs()

/* 4. Constants (non-reactive) */
defineOptions({
  inheritAttrs: false
})

/* 5. Props */
const props = withDefaults(defineProps<{
  open?: boolean
  title?: string
  dismissible?: boolean
}>(), {
  open: false,
  title: '',
  dismissible: true
})

/* 6. Emits */
const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

/* 7. Template refs */

/* 8. State (ref, reactive) */

/* 9. Computed */
const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
})

const triggerWrapperClass = computed(() => attrs.class)

/* 10. Watchers */
watch(isOpen, (open) => {
  if (import.meta.client) {
    document.body.style.overflow = open ? 'hidden' : ''
  }
}, { immediate: true })

/* 11. Methods */
function openModal() {
  isOpen.value = true
}

function closeModal() {
  isOpen.value = false
}

function handleBackdropClick() {
  if (!props.dismissible) return

  closeModal()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !props.dismissible || !isOpen.value) return

  closeModal()
}

/* 12. Lifecycle */
if (import.meta.client) {
  window.addEventListener('keydown', handleKeydown)
}

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
  }
})

/* 13. defineExpose */
defineExpose({
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 4.5rem;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 1.5rem;
  background: transparent;
}

.modal-panel {
  width: min(100%, 32rem);
  max-height: calc(100vh - 7.5rem);
  overflow: auto;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: #ffffff;
  box-shadow: 0 25px 80px rgba(15, 23, 42, 0.2);
}

.modal-header {
  padding: 1rem 1rem 0;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}

.modal-body {
  padding: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.18s ease;
}

.modal-fade-enter-active .modal-panel,
.modal-fade-leave-active .modal-panel {
  transition: transform 0.18s ease, opacity 0.18s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-panel,
.modal-fade-leave-to .modal-panel {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
</style>
