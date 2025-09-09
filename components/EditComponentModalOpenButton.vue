<template>
  <button class="edit-icon-btn" @click="openEditor" title="Edit" type="button">
    <span class="edit-icon-bg yellow-bg">
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="10" fill="#facc15" />
        <path
          d="M7.5 13.5L13.2 7.8C13.6 7.4 13.6 6.8 13.2 6.4L12.6 5.8C12.2 5.4 11.6 5.4 11.2 5.8L5.5 11.5V14.5H8.5L14.2 8.8C14.6 8.4 14.6 7.8 14.2 7.4L13.6 6.8C13.2 6.4 12.6 6.4 12.2 6.8L6.5 12.5"
          stroke="#18181b" stroke-width="1.2" stroke-linecap="round" />
      </svg>
    </span>
  </button>
</template>

<script setup lang="ts">
/* 1. Imports */
import { useHighlightStore } from '#imports';

/* 2. Stores */
const highlightStore = useHighlightStore();

/* 3. Context hooks */
// none

/* 4. Constants (non-reactive) */
// none

/* 5. Props */
// pass here id of the component to edit
const props = defineProps<{
  componentId?: string
}>()

/* 6. Emits */

/* 7. Template refs */
// none

/* 8. Local state (ref, reactive) */
// none

/* 9. Computed */
// none

/* 10. Watchers */
// none

/* 11. Methods */
function openEditor() {
  highlightStore.isEditModeActive = true;
  highlightStore.selectedComponentId = props.componentId ?? '';
  console.log("EditComponentModalOpenButton.vue: Edit mode activated", highlightStore.isEditModeActive);
}

/* 12. Lifecycle */
// none

/* 13. defineExpose */
// none
</script>

<style scoped>
.edit-icon-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  z-index: 2;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s;
}

.edit-icon-btn:active {
  transform: scale(0.95);
}

.edit-icon-bg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  box-shadow: 0 1px 4px #0002;
  border: 1px solid black;
}

.yellow-bg {
  background: #facc15;
}
</style>