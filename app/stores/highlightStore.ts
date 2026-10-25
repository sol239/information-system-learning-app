
export const useHighlightStore = defineStore('highlight', () => {

    const isHighlightActive = ref(false);
    const isEditModeActive = ref(false);

    const selectedHighlightedComponentsIds = ref<Set<string>>(new Set());

    function selectHighlightedComponent(componentId: string) {
        const next = new Set(selectedHighlightedComponentsIds.value);
        if (next.has(componentId)) {
            next.delete(componentId);
        } else {
            next.add(componentId);
        }
        selectedHighlightedComponentsIds.value = next;
    }

    function toggleHighlight() {
        // if highlight is on, so we it being turned off -> clear the selected ones
        if (isHighlightActive.value) {
            selectedHighlightedComponentsIds.value = new Set();
        }
        isHighlightActive.value = !isHighlightActive.value;
    }

    function setHighlightActive(value: boolean) {
        if (!value) {
            selectedHighlightedComponentsIds.value = new Set();
        }
        isHighlightActive.value = value;
    }


    function toggleEditMode() {
        isEditModeActive.value = !isEditModeActive.value;
    }

    function clearHighlights() {
        selectedHighlightedComponentsIds.value = new Set();
    }
    return {
        isHighlightActive,
        isEditModeActive,
        selectedHighlightedComponentsIds,
        selectHighlightedComponent,
        toggleHighlight,
        setHighlightActive,
        toggleEditMode,
        clearHighlights
    }
},
    {
        persist: {
            afterHydrate: (ctx) => {
                const ids = ctx.store.selectedHighlightedComponentsIds;
                if (!(ids instanceof Set)) {
                    ctx.store.selectedHighlightedComponentsIds = new Set(Array.isArray(ids) ? ids : []);
                }
            }
        }
    })
