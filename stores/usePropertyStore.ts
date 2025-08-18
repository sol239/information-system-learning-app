import { defineStore } from 'pinia'

export const usePropertyStore = defineStore('property', () => {
    // State
    const propertiesNameTypeMap = ref<Record<string, string>>({});

    // Actions
    function setPropertiesNameTypeMap(map: Record<string, string>) {
        propertiesNameTypeMap.value = map;
    }

    function addProperty(name: string, type: string) {
        propertiesNameTypeMap.value[name] = type;
    }

    return {
        propertiesNameTypeMap,
        setPropertiesNameTypeMap,
        addProperty
    }
}, {
  persist: true
})
