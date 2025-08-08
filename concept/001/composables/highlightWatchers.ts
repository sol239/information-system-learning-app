// composables/highlightWatchers.ts
import { watch, onMounted } from 'vue'

export function useHighlightWatchers(highlightHandler, highlightStore) {
  function applyHighlighting() {
    // Clear all classes first
    document.querySelectorAll('.highlightable').forEach(el => {
      el.classList.remove('highlighted-yellow', 'highlighted-selected', 'highlighted-dimmed');
    });

    const ids = highlightHandler.selectedElementIds;

    if (highlightStore.isHighlightMode) {
      document.querySelectorAll('.highlightable').forEach(el => {
        const elementId = el.id;

        if (ids.includes(elementId)) {
          el.classList.add('highlighted-selected');
        } else if (ids.length > 0) {
          el.classList.add('highlighted-dimmed');
        } else {
          el.classList.add('highlighted-yellow');
        }
      });
    }
  }

  // 🔹 Watchers
  watch(() => highlightHandler.selectedElementIds, applyHighlighting, { deep: true });
  watch(() => highlightStore.isHighlightMode, (newValue) => {
    highlightHandler.isHighlightOn = newValue;
    if (!newValue) {
      document.querySelectorAll('.highlightable').forEach(el => {
        el.classList.remove('highlighted-selected', 'highlighted-dimmed', 'highlighted-yellow');
      });
      highlightHandler.clearSelection?.();
    } else {
      applyHighlighting();
    }
  });

  // 🔹 Ensure highlight applies when you navigate into the page
  onMounted(() => {
    applyHighlighting();
  });
}
