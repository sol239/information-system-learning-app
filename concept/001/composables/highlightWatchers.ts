// composables/highlightWatchers.ts
import { watch } from 'vue'

export function useHighlightWatchers(highlightHandler, highlightStore, selectedElements, selectedComponentStore, repairedElement) {
  watch(() => highlightHandler.selectedElementIds, (newVal) => {
    document.querySelectorAll('.highlightable').forEach(el => {
      el.classList.remove('highlighted-yellow', 'highlighted-selected', 'highlighted-dimmed');
    });

    const ids = highlightHandler.selectedElementIds;

    document.querySelectorAll('.highlightable').forEach(el => {
      const elementId = el.id;

      if (highlightStore.isHighlightMode) {
        if (ids.includes(elementId)) {
          el.classList.add('highlighted-selected');
        } else if (ids.length > 0) {
          el.classList.add('highlighted-dimmed');
        } else {
          el.classList.add('highlighted-yellow');
        }
      }
    });
  }, { deep: true });

  watch(() => highlightStore.isHighlightMode, (newValue) => {
    console.log('Highlight mode:', newValue);
    highlightHandler.isHighlightOn = newValue;

    const ids = highlightHandler.selectedElementIds;

    if (newValue) {
      document.querySelectorAll('.highlightable').forEach(el => {
        const elementId = el.id;

        if (highlightStore.isHighlightMode) {
          if (ids.includes(elementId)) {
            el.classList.add('highlighted-selected');
          } else if (ids.length > 0) {
            el.classList.add('highlighted-dimmed');
          } else {
            el.classList.add('highlighted-yellow');
          }
        }
      });
    } else {
      document.querySelectorAll('.highlightable').forEach(el => {
        el.classList.remove('highlighted-selected', 'highlighted-dimmed', 'highlighted-yellow');
      });
      highlightHandler.clearSelection?.();
    }
  });
}
