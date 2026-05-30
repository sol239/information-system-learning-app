<template>
	  <div
	    ref="triggerRef"
	    class="modern-hover-popover"
	    :class="{ 'modern-hover-popover--full-width': fullWidth }"
	    @mouseenter="showPopover"
    @mouseleave="hidePopover"
    @focusin="showPopover"
    @focusout="hidePopover"
  >
    <slot />
  </div>

  <Teleport to="body">
    <div
      v-show="isOpen"
      ref="panelRef"
      class="modern-hover-popover__panel"
      :class="[
        { 'modern-hover-popover__panel--visible': isOpen },
        `modern-hover-popover__panel--${position.placement}`
      ]"
      :style="panelStyle"
      role="tooltip"
    >
      <div class="modern-hover-popover__icon">
        <UIcon :name="icon" class="modern-hover-popover__icon-symbol" />
      </div>
      <div class="modern-hover-popover__content">
        <div v-if="title" class="modern-hover-popover__title">{{ title }}</div>
        <div v-if="$slots.content || description" class="modern-hover-popover__description">
          <slot name="content">
            {{ description }}
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  description?: string
	  icon?: string
	  disabled?: boolean
	  fullWidth?: boolean
	}>(), {
	  icon: 'i-heroicons-information-circle',
	  disabled: false,
	  fullWidth: false
	})

const triggerRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const position = ref({
  top: 0,
  left: 0,
  arrowLeft: 0,
  placement: 'bottom' as 'top' | 'bottom'
})

const viewportPadding = 16
const offset = 10

const panelStyle = computed(() => ({
  top: `${position.value.top}px`,
  left: `${position.value.left}px`,
  '--popover-arrow-left': `${position.value.arrowLeft}px`
}))

async function showPopover() {
  if (props.disabled) return
  isOpen.value = true
  await nextTick()
  updatePosition()
  window.addEventListener('scroll', updatePosition, true)
  window.addEventListener('resize', updatePosition)
}

function hidePopover() {
  isOpen.value = false
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
}

function updatePosition() {
  if (!triggerRef.value || !panelRef.value) {
    return
  }

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const panelRect = panelRef.value.getBoundingClientRect()
  const centeredLeft = triggerRect.left + triggerRect.width / 2 - panelRect.width / 2
  const left = Math.min(
    window.innerWidth - panelRect.width - viewportPadding,
    Math.max(viewportPadding, centeredLeft)
  )
  const bottomTop = triggerRect.bottom + offset
  const topTop = triggerRect.top - panelRect.height - offset
  const hasBottomSpace = bottomTop + panelRect.height <= window.innerHeight - viewportPadding
  const top = hasBottomSpace ? bottomTop : Math.max(viewportPadding, topTop)
  const triggerCenter = triggerRect.left + triggerRect.width / 2

  position.value = {
    top,
    left,
    arrowLeft: Math.min(panelRect.width - 12, Math.max(12, triggerCenter - left)),
    placement: hasBottomSpace ? 'bottom' : 'top'
  }
}

onBeforeUnmount(hidePopover)
</script>

<style scoped>
	.modern-hover-popover {
	  position: relative;
	  display: inline-flex;
	}

	.modern-hover-popover--full-width {
	  display: flex;
	  width: 100%;
	}

.modern-hover-popover__panel {
  position: fixed;
  z-index: 12000;
  display: flex;
  width: min(22rem, calc(100vw - 2rem));
  gap: 0.75rem;
  padding: 0.875rem;
  color: #111827;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(229, 231, 235, 0.92);
  border-radius: 0.75rem;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(15, 23, 42, 0.08);
  opacity: 0;
  pointer-events: none;
  transform: translateY(-4px) scale(0.98);
  transform-origin: top center;
  transition: opacity 150ms ease, transform 150ms ease;
}

.modern-hover-popover__panel--visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.modern-hover-popover__panel--bottom::before {
  content: "";
  position: absolute;
  top: -5px;
  left: var(--popover-arrow-left, 50%);
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.96);
  border-left: 1px solid rgba(229, 231, 235, 0.92);
  border-top: 1px solid rgba(229, 231, 235, 0.92);
  transform: translateX(-50%) rotate(45deg);
}

.modern-hover-popover__panel--top::before {
  content: "";
  position: absolute;
  bottom: -5px;
  left: var(--popover-arrow-left, 50%);
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.96);
  border-right: 1px solid rgba(229, 231, 235, 0.92);
  border-bottom: 1px solid rgba(229, 231, 235, 0.92);
  transform: translateX(-50%) rotate(45deg);
}

.modern-hover-popover__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  border-radius: 0.625rem;
  color: #ea580c;
  background: #fff7ed;
  border: 1px solid #fed7aa;
}

.modern-hover-popover__icon-symbol {
  width: 1.05rem;
  height: 1.05rem;
}

.modern-hover-popover__content {
  min-width: 0;
}

.modern-hover-popover__title {
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.25rem;
  color: #111827;
}

.modern-hover-popover__description {
  margin-top: 0.125rem;
  font-size: 0.8125rem;
  line-height: 1.25rem;
  color: #4b5563;
}

@media (prefers-color-scheme: dark) {
  .modern-hover-popover__panel {
    color: #f9fafb;
    background: rgba(17, 24, 39, 0.96);
    border-color: rgba(55, 65, 81, 0.92);
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.35), 0 4px 12px rgba(0, 0, 0, 0.24);
  }

  .modern-hover-popover__panel--bottom::before,
  .modern-hover-popover__panel--top::before {
    background: rgba(17, 24, 39, 0.96);
    border-color: rgba(55, 65, 81, 0.92);
  }

  .modern-hover-popover__title {
    color: #f9fafb;
  }

  .modern-hover-popover__description {
    color: #d1d5db;
  }
}
</style>
