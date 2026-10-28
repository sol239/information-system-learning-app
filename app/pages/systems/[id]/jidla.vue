<template>
  <div class="meals-page p-6 flex flex-col gap-6 max-w-7xl mx-auto text-xs">
    <!-- Page header -->
    <div class="flex flex-wrap items-center gap-3">
      <h1 class="system-page-heading" style="--system-heading-color: #34d399">
        {{ t("meals") }}
      </h1>
      <ModalContainer
        v-model:open="createModalOpen"
        title="Přidat jídlo"
        class="ml-auto w-fit"
      >
        <button type="button" class="meal-button meal-button--add">
          <UIcon name="i-heroicons-plus" class="size-4" aria-hidden="true" />
          Přidat jídlo
        </button>

        <template #header>
          <div class="meal-edit-header">
            <div class="flex-1">
              <h2 class="text-base font-semibold text-gray-900">
                Přidat jídlo
              </h2>
              <p class="mt-1 text-xs text-gray-500">
                Vyplňte název jídla, dobu podávání a alergeny.
              </p>
            </div>
            <button
              type="button"
              class="meal-edit-close"
              :aria-label="t('close')"
              @click.stop="createModalOpen = false"
            >
              <UIcon name="i-lucide-x" class="size-4" aria-hidden="true" />
            </button>
          </div>
        </template>

        <template #content>
          <div class="modal-container meal-form entity-modal-form">
            <ComponentWrapper :component="vstupNazevComponent" />
            <ComponentWrapper :component="vstupDobaComponent" />
            <ComponentWrapper :component="vstupAlergenyComponent" />
            <div class="entity-modal-actions">
              <button
                type="button"
                class="entity-modal-cancel"
                @click="createModalOpen = false"
              >
                Zrušit
              </button>
              <ComponentWrapper
                :component="btnUlozitComponent"
                @action-completed="handleMealCreated"
              />
            </div>
          </div>
        </template>
      </ModalContainer>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-row flex-wrap items-center gap-3">
      <!-- Serving-time filter dropdown -->
      <div class="meal-select">
        <select v-model="selectedTime" :aria-label="t('all_meals')">
          <option
            v-for="item in timeFilterItems"
            :key="item.value ?? 'all'"
            :value="item.value"
          >
            {{ item.label }}
          </option>
        </select>
      </div>

      <!-- Meal count widget -->
      <ComponentWrapper :component="countBarComponent" />

      <!-- Meal name filter -->
      <UInput
        v-model="filterText"
        icon="i-heroicons-magnifying-glass"
        placeholder="Název jídla"
        class="w-56"
        :ui="{ base: 'h-[26px] text-xs' }"
      />

      <!-- Order select -->
      <ComponentWrapper :component="razeniComponent" />

      <!-- Add meal modal -->
    </div>

    <!-- Meals grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="mealId in filteredMealIds"
        :key="mealId"
        class="bg-white rounded-xl border-2 border-emerald-400 p-5 flex flex-col gap-2 hover:shadow-md transition-shadow"
      >
        <!-- Name + serving-time badge -->
        <ComponentWrapper
          :component="
            withVars(cardInfoComponent, [new Variable('idJidla', mealId)])
          "
        />

        <hr class="border-gray-400" />

        <!-- Allergen pills -->
        <ComponentWrapper
          :component="
            withVars(allergenListComponent, [new Variable('idJidla', mealId)])
          "
        />

        <!-- Actions -->
        <div class="flex gap-3 pt-1 border-t border-gray-100">
          <ModalContainer
            v-model:open="editModalOpen[mealId]"
            title="Upravit jídlo"
            class="flex-1"
          >
            <button type="button" class="meal-button meal-button--edit">
              Upravit jídlo
            </button>

            <template #header>
              <div class="meal-edit-header">
                <div class="flex-1">
                  <h2 class="text-base font-semibold text-gray-900">
                    Upravit jídlo
                  </h2>
                  <p class="mt-1 text-xs text-gray-500">
                    Upravte název jídla, dobu podávání a alergeny.
                  </p>
                </div>
                <button
                  type="button"
                  class="meal-edit-close"
                  :aria-label="t('close')"
                  @click.stop="editModalOpen[mealId] = false"
                >
                  <UIcon name="i-lucide-x" class="size-4" aria-hidden="true" />
                </button>
              </div>
            </template>

            <template #content>
              <div class="modal-container meal-form entity-modal-form">
                <ComponentWrapper
                  :component="
                    withVars(editVstupNazevComponent, [
                      new Variable('idJidla', mealId),
                    ])
                  "
                />
                <ComponentWrapper
                  :component="
                    withVars(editVstupDobaComponent, [
                      new Variable('idJidla', mealId),
                    ])
                  "
                />
                <ComponentWrapper
                  :component="
                    withVars(editVstupAlergenyComponent, [
                      new Variable('idJidla', mealId),
                    ])
                  "
                />
                <div class="entity-modal-actions entity-modal-actions--edit">
                  <button
                    type="button"
                    class="entity-modal-cancel"
                    @click="editModalOpen[mealId] = false"
                  >
                    Zrušit
                  </button>
                  <ComponentWrapper
                    :component="
                      withVars(editBtnUlozitComponent, [
                        new Variable('idJidla', mealId),
                      ])
                    "
                    @action-completed="handleMealUpdated(mealId)"
                  />
                </div>
              </div>
            </template>
          </ModalContainer>

          <div class="flex-1" @click="reloadAfterDelete">
            <ComponentWrapper
              :component="
                withVars(smazatComponent, [new Variable('idJidla', mealId)])
              "
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="filteredMealIds.length === 0 && isDbReady"
      class="text-center py-12"
    >
      <UIcon
        name="i-heroicons-cake"
        class="w-16 h-16 mx-auto mb-4 text-gray-400"
      />
      <h3 class="text-xs font-semibold text-gray-900 mb-2">
        {{ t("no_meals_found") }}
      </h3>
      <p class="text-gray-500">{{ t("no_meals_description") }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/* 1. Imports */
import { ref, computed, watch, onMounted, reactive } from "vue";

import { useI18n } from "vue-i18n";

import ComponentWrapper from "~/components/ComponentWrapper.vue";

import ModalContainer from "~/components/ModalContainer.vue";

import { ComponentVariables, Variable } from "~/model/ComponentVariables";

import { useSystemInputVariables } from "~/composables/useSystemInputVariables";

/* 2. Stores */
const { systemsStore } = useSyncSystemId();

/* 3. Context hooks */
const { systemInputVariables } = useSystemInputVariables();

const { t } = useI18n();

/* 4. Constants (non-reactive) */
defineOptions({
  name: "SystemMealsPage",
});

// Meal data
interface MealRow {
  id: number;
  time: string;
  name: string;
  allergenCount: number;
}

/* 5. Props */

/* 6. Emits */

/* 7. Template refs */

/* 8. State (ref, reactive) */
const createModalOpen = ref(false);

const editModalOpen = reactive<Record<number, boolean>>({});

const meals = ref<MealRow[]>([]);

// Filter
const filterText = ref("");

const selectedTime = ref<string | null>(null);

/* 9. Computed */
const isDbReady = computed(
  () => !!systemsStore.selectedSystem?.database?.sqlJsDatabase,
);

// Display components
const cardInfoComponent = computed(() =>
  systemsStore.getComponentById("karta-jidla"),
);

const allergenListComponent = computed(() =>
  systemsStore.getComponentById("seznam-alergenu-jidla"),
);

const countBarComponent = computed(() =>
  systemsStore.getComponentById("celkovy-pocet-jidel"),
);

const razeniComponent = computed(() =>
  systemsStore.getComponentById("razeni-jidel"),
);

// Create components
const vstupNazevComponent = computed(() =>
  systemsStore.getComponentById("vstup-nazev-jidla"),
);

const vstupDobaComponent = computed(() =>
  systemsStore.getComponentById("vstup-doba-podavani"),
);

const vstupAlergenyComponent = computed(() =>
  systemsStore.getComponentById("vstup-alergeny-jidla"),
);

const btnUlozitComponent = computed(() =>
  systemsStore.getComponentById("btn-ulozit-jidlo"),
);

// Edit components
const editVstupNazevComponent = computed(() =>
  systemsStore.getComponentById("edit-vstup-nazev-jidla"),
);

const editVstupDobaComponent = computed(() =>
  systemsStore.getComponentById("edit-vstup-doba-podavani"),
);

const editVstupAlergenyComponent = computed(() =>
  systemsStore.getComponentById("edit-vstup-alergeny-jidla"),
);

const editBtnUlozitComponent = computed(() =>
  systemsStore.getComponentById("edit-btn-ulozit-jidlo"),
);

// Delete component
const smazatComponent = computed(() =>
  systemsStore.getComponentById("smazat-jidlo"),
);

const timeFilterItems = computed(() => [
  { label: t("all_meals"), value: null },
  { label: "snídaně", value: "snídaně" },
  { label: "oběd", value: "oběd" },
  { label: "večeře", value: "večeře" },
]);

const normalizedFilterText = computed(() =>
  filterText.value.trim().toLocaleLowerCase("cs-CZ"),
);

const orderBy = computed(() => {
  const value = systemInputVariables.value.find(
    (variable) => variable.name === "razeni_jidel",
  )?.variable;
  const normalizedValue = String(value ?? "nazev");
  return ["nazev", "doba", "alergeny"].includes(normalizedValue)
    ? normalizedValue
    : "nazev";
});

const filteredMealIds = computed(() => {
  let filteredMeals = meals.value;
  if (selectedTime.value) {
    filteredMeals = filteredMeals.filter((m) => m.time === selectedTime.value);
  }

  if (normalizedFilterText.value) {
    filteredMeals = filteredMeals.filter((m) =>
      m.name.toLocaleLowerCase("cs-CZ").includes(normalizedFilterText.value),
    );
  }

  const uniqueMeals: MealRow[] = [];
  const seenIds = new Set<number>();
  for (const m of filteredMeals) {
    if (seenIds.has(m.id)) continue;
    seenIds.add(m.id);
    uniqueMeals.push(m);
  }

  const collator = new Intl.Collator("cs-CZ", {
    sensitivity: "base",
    numeric: true,
  });
  uniqueMeals.sort((a, b) => {
    if (orderBy.value === "doba") {
      return collator.compare(a.time, b.time) || a.id - b.id;
    }

    if (orderBy.value === "alergeny") {
      return (
        a.allergenCount - b.allergenCount ||
        collator.compare(a.name, b.name) ||
        a.id - b.id
      );
    }

    return collator.compare(a.name, b.name) || a.id - b.id;
  });

  return uniqueMeals.map((m) => m.id);
});

/* 10. Watchers */
watch(
  () => systemsStore.selectedSystem?.database?.sqlJsDatabase,
  (db) => {
    if (db) loadData();
  },
  { immediate: true },
);

/* 11. Methods */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function withVars(comp: any, vars: Variable[]) {
  if (!comp) return undefined;
  const clone = Object.create(comp);
  clone.variables = new ComponentVariables();
  clone.variables.generalVariables = vars;
  return clone;
}

async function loadData() {
  const db = systemsStore.selectedSystem?.database;
  if (!db) return;

  try {
    const result = await db.query(
      `SELECT
                j.id_jidla,
                j.doba_podavani,
                j.jmeno,
                alergeny.pocet_alergenu AS pocet_alergenu
             FROM jidla j
             LEFT JOIN (
                SELECT id_jidla, COUNT(id_alergenu) AS pocet_alergenu
                FROM jidla_alergeny
                GROUP BY id_jidla
             ) alergeny ON j.id_jidla = alergeny.id_jidla
             ORDER BY j.id_jidla`,
    );
    if (result.data?.[0]?.values) {
      meals.value = result.data[0].values.map((row) => ({
        id: Number(row[0]),
        time: String(row[1] || ""),
        name: String(row[2] || ""),
        allergenCount: Number(row[3] || 0),
      }));
    }
  } catch (e) {
    console.error("Failed to load meals:", e);
  }
}

const reloadAfterDelete = () => {
  window.setTimeout(() => {
    loadData();
  }, 50);
};

const handleMealCreated = () => {
  createModalOpen.value = false;
  window.setTimeout(() => {
    loadData();
  }, 50);
};

const handleMealUpdated = (mealId: number) => {
  editModalOpen[mealId] = false;
  window.setTimeout(() => {
    loadData();
  }, 50);
};

/* 12. Lifecycle */
onMounted(() => {
  if (systemsStore.selectedSystem?.database?.sqlJsDatabase) loadData();
});

/* 13. defineExpose */
</script>

<style scoped>
.meals-page :deep(.component-html :where(*):not(#nazev-jidla)),
.meals-page :deep(button),
.meals-page :deep(input),
.meals-page :deep(select),
.meal-form :deep(.component-html *),
.meal-form :deep(button),
.meal-form :deep(input),
.meal-form :deep(select),
.meal-form :deep(label) {
  font-size: 12px;
}

.meal-select,
.meals-page :deep(#razeni-jidel) {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 26px;
  box-sizing: border-box;
  padding: 0 12px;
  border: 1px solid #065f46;
  border-radius: 8px;
  background: #fff;
}

.meal-select select {
  border: 0;
  background: transparent;
  color: #111827;
  font-size: 12px;
  cursor: pointer;
}

.meal-select:focus-within {
  outline: 2px solid #065f46;
  outline-offset: 2px;
}

.meal-button,
.meals-page :deep(#smazat-jidlo-tlacitko) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 26px;
  box-sizing: border-box;
  padding: 0 14px;
  border: 1px solid;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.15s;
}

.meal-button--add {
  border-color: #22c55e;
  background: #f0fdf4;
  color: #15803d;
}

.meal-button--add:hover {
  background: #dcfce7;
}

.meal-button--edit {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #2563eb;
}

.meal-button--edit:hover {
  background: #dbeafe;
}

.meal-button--edit,
.meals-page :deep(#smazat-jidlo-tlacitko) {
  height: auto;
  min-height: 26px;
  padding: 6px 14px;
  line-height: 1.4;
  white-space: normal;
  text-align: center;
}

.meals-page :deep(#smazat-jidlo-tlacitko) {
  border-color: #ef4444;
}

.meals-page :deep(#smazat-jidlo-tlacitko:hover) {
  background: #fee2e2;
}

.meals-page :deep(#stitek-doby-podavani),
.meals-page :deep(.pilulka-alergenu-jidla),
.meals-page :deep(#widget-poctu-jidel) {
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  height: 26px;
  padding-top: 0;
  padding-bottom: 0;
}

.meal-edit-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.meal-edit-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: background-color 0.15s;
}

.meal-edit-close:hover {
  background: #f1f5f9;
}

.modal-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  box-sizing: border-box;
}

.meals-page :deep(#stitek-doby-podavani),
.meals-page :deep(.pilulka-alergenu-jidla),
.meals-page :deep(#widget-poctu-jidel),
.meals-page :deep(button),
.meal-form :deep(button) {
  border-radius: 8px;
}

.meals-page :deep(#nazev-jidla) {
  font-size: 16px;
}
</style>
