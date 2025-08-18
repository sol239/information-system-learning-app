import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
// TODO: Přidat správný import pro ValuatorActual
// import { ValuatorActual } from './path/to/ValuatorActual'

export const useValuatorStore = defineStore('valuator', () => {

  // computed, které vždy zkusí zavolat getInfo
  const kristynaAlergeny = computed(() => {
    try {
      console.log("🔍 Volám ValuatorActual.getInfo...")
      return ValuatorActual.getInfo("účastníci", "jméno", "Kristýna Němcová", ["alergeny"])
    } catch (error) {
      console.error("❌ Chyba při volání ValuatorActual.getInfo:", error)
      return null
    }
  })

  // watch běžící globálně
  watch(
    kristynaAlergeny,
    (newVal, oldVal) => {
      console.log("👀 Watch triggered - Alergeny pro Kristýnu Němcovou se změnily z", oldVal, "na", newVal)

      const expected = ["Lepek", "Vejce"]
      if (Array.isArray(newVal) && JSON.stringify(newVal) === JSON.stringify(expected)) {
        console.log("✅ Správné alergeny nastaveny")
      }
    },
    { immediate: true }
  )

  return {
    kristynaAlergeny
  }
}, {
  persist: true
})
