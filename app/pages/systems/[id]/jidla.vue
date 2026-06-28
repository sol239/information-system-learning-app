<template>
    <div class="p-6 flex flex-col gap-6 max-w-7xl mx-auto">

        <!-- Page header -->
        <h1 class="text-2xl font-semibold">{{ t('meals') }}</h1>

        <!-- Toolbar -->
        <div class="flex flex-row flex-wrap items-center gap-3">
            <!-- Serving-time filter dropdown -->
            <USelect
                v-model="selectedTime"
                :items="timeFilterItems"
                value-key="value"
                label-key="label"
                class="w-48"
            />

            <!-- Meal count widget -->
            <ComponentWrapper :component="countBarComponent" />

            <!-- Meal name filter -->
            <UInput
                v-model="filterText"
                icon="i-heroicons-magnifying-glass"
                placeholder="Název jídla"
                class="w-56"
            />

            <!-- Order select -->
            <ComponentWrapper :component="razeniComponent" />

            <!-- Add meal modal -->
            <ModalContainer v-model:open="createModalOpen" class="w-fit">
                <UButton label="Přidat jídlo" color="primary" icon="i-heroicons-plus" size="sm" />

                <template #content>
                    <div class="modal-container">
                        <ComponentWrapper :component="vstupNazevComponent" />
                        <ComponentWrapper :component="vstupDobaComponent" />
                        <ComponentWrapper :component="vstupAlergenyComponent" />
                        <div class="flex gap-2">
                            <UButton label="Zrušit" color="neutral" variant="solid" size="sm"
                                @click="createModalOpen = false" />
                            <ComponentWrapper :component="btnUlozitComponent" @action-completed="handleMealCreated" />
                        </div>
                    </div>
                </template>
            </ModalContainer>
        </div>

        <!-- Meals grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div
                v-for="mealId in filteredMealIds"
                :key="mealId"
                class="bg-white rounded-xl border-2 border-emerald-400 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
                <!-- Name + serving-time badge -->
                <ComponentWrapper
                    :component="withVars(cardInfoComponent, [new Variable('idJidla', mealId)])"
                />

                <hr class="border-gray-100" />

                <!-- Allergen pills -->
                <ComponentWrapper
                    :component="withVars(allergenListComponent, [new Variable('idJidla', mealId)])"
                />

                <!-- Actions -->
                <div class="flex gap-3 pt-1 border-t border-gray-100">
                    <ModalContainer v-model:open="editModalOpen[mealId]" class="flex-1">
                        <UButton label="Upravit" color="neutral" variant="subtle" size="sm" class="flex-1" />

                        <template #content>
                            <div class="modal-container">
                                <ComponentWrapper
                                    :component="withVars(editVstupNazevComponent, [new Variable('idJidla', mealId)])" />
                                <ComponentWrapper
                                    :component="withVars(editVstupDobaComponent, [new Variable('idJidla', mealId)])" />
                                <ComponentWrapper
                                    :component="withVars(editVstupAlergenyComponent, [new Variable('idJidla', mealId)])" />
                                <div class="flex gap-2">
                                    <UButton label="Zrušit" color="neutral" variant="solid" size="sm"
                                        @click="editModalOpen[mealId] = false" />
                                    <ComponentWrapper
                                        :component="withVars(editBtnUlozitComponent, [new Variable('idJidla', mealId)])"
                                        @action-completed="handleMealUpdated(mealId)" />
                                </div>
                            </div>
                        </template>
                    </ModalContainer>

                    <div class="flex-1" @click="reloadAfterDelete">
                        <ComponentWrapper
                            :component="withVars(smazatComponent, [new Variable('idJidla', mealId)])" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty state -->
        <div v-if="filteredMealIds.length === 0 && isDbReady" class="text-center py-12">
            <UIcon name="i-heroicons-cake" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ t('no_meals_found') }}</h3>
            <p class="text-gray-500">{{ t('no_meals_description') }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ComponentWrapper from '~/components/ComponentWrapper.vue';
import ModalContainer from '~/components/ModalContainer.vue';
import { ComponentVariables, Variable } from '~/model/ComponentVariables';
import { useSystemsStore } from '~/stores/systemsStore';
import { useSystemInputVariables } from '~/composables/useSystemInputVariables';

function withVars(comp: any, vars: Variable[]) {
  if (!comp) return undefined;
  const clone = Object.create(comp);
  clone.variables = new ComponentVariables();
  clone.variables.generalVariables = vars;
  return clone;
}

const { systemInputVariables } = useSystemInputVariables();
const { t } = useI18n();
const { route, systemsStore, systemId } = useSyncSystemId();

const isDbReady = computed(() => !!systemsStore.selectedSystem?.database?.sqlJsDatabase);
const createModalOpen = ref(false);
const editModalOpen = reactive<Record<number, boolean>>({});

// Display components
const cardInfoComponent = computed(() => systemsStore.getComponentById('karta-jidla'));
const allergenListComponent = computed(() => systemsStore.getComponentById('seznam-alergenu-jidla'));
const countBarComponent = computed(() => systemsStore.getComponentById('celkovy-pocet-jidel'));
const razeniComponent = computed(() => systemsStore.getComponentById('razeni-jidel'));

// Create components
const vstupNazevComponent = computed(() => systemsStore.getComponentById('vstup-nazev-jidla'));
const vstupDobaComponent = computed(() => systemsStore.getComponentById('vstup-doba-podavani'));
const vstupAlergenyComponent = computed(() => systemsStore.getComponentById('vstup-alergeny-jidla'));
const btnUlozitComponent = computed(() => systemsStore.getComponentById('btn-ulozit-jidlo'));

// Edit components
const editVstupNazevComponent = computed(() => systemsStore.getComponentById('edit-vstup-nazev-jidla'));
const editVstupDobaComponent = computed(() => systemsStore.getComponentById('edit-vstup-doba-podavani'));
const editVstupAlergenyComponent = computed(() => systemsStore.getComponentById('edit-vstup-alergeny-jidla'));
const editBtnUlozitComponent = computed(() => systemsStore.getComponentById('edit-btn-ulozit-jidlo'));

// Delete component
const smazatComponent = computed(() => systemsStore.getComponentById('smazat-jidlo'));

// Meal data
interface MealRow {
    id: number;
    time: string;
    name: string;
    allergenCount: number;
}
const meals = ref<MealRow[]>([]);

// Filter
const filterText = ref('');
const selectedTime = ref<string | null>(null);

const timeFilterItems = computed(() => [
    { label: t('all_meals'), value: null },
    { label: 'snídaně', value: 'snídaně' },
    { label: 'oběd', value: 'oběd' },
    { label: 'večeře', value: 'večeře' },
]);

const normalizedFilterText = computed(() => filterText.value.trim().toLocaleLowerCase('cs-CZ'));

const orderBy = computed(() => {
    const value = systemInputVariables.value.find(variable => variable.name === 'razeni_jidel')?.variable;
    const normalizedValue = String(value ?? 'nazev');
    return ['nazev', 'doba', 'alergeny'].includes(normalizedValue) ? normalizedValue : 'nazev';
});

const filteredMealIds = computed(() => {
    let filteredMeals = meals.value;
    if (selectedTime.value) {
        filteredMeals = filteredMeals.filter(m => m.time === selectedTime.value);
    }

    if (normalizedFilterText.value) {
        filteredMeals = filteredMeals.filter(m =>
            m.name.toLocaleLowerCase('cs-CZ').includes(normalizedFilterText.value)
        );
    }

    const uniqueMeals: MealRow[] = [];
    const seenIds = new Set<number>();
    for (const m of filteredMeals) {
        if (seenIds.has(m.id)) continue;
        seenIds.add(m.id);
        uniqueMeals.push(m);
    }

    const collator = new Intl.Collator('cs-CZ', { sensitivity: 'base', numeric: true });
    uniqueMeals.sort((a, b) => {
        if (orderBy.value === 'doba') {
            return collator.compare(a.time, b.time) || a.id - b.id;
        }

        if (orderBy.value === 'alergeny') {
            return a.allergenCount - b.allergenCount || collator.compare(a.name, b.name) || a.id - b.id;
        }

        return collator.compare(a.name, b.name) || a.id - b.id;
    });

    return uniqueMeals.map(m => m.id);
});

const loadData = async () => {
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
             ORDER BY j.id_jidla`
        );
        if (result.data?.[0]?.values) {
            meals.value = result.data[0].values.map(row => ({
                id: Number(row[0]),
                time: String(row[1] || ''),
                name: String(row[2] || ''),
                allergenCount: Number(row[3] || 0)
            }));
        }
    } catch (e) {
        console.error('Failed to load meals:', e);
    }
};

const reloadAfterDelete = () => {
    window.setTimeout(() => { loadData(); }, 50);
};

const handleMealCreated = () => {
    createModalOpen.value = false;
    window.setTimeout(() => { loadData(); }, 50);
};

const handleMealUpdated = (mealId: number) => {
    editModalOpen[mealId] = false;
    window.setTimeout(() => { loadData(); }, 50);
};

watch(() => systemsStore.selectedSystem?.database?.sqlJsDatabase, (db) => {
    if (db) loadData();
}, { immediate: true });

onMounted(() => {
    if (systemsStore.selectedSystem?.database?.sqlJsDatabase) loadData();
});
</script>

<style scoped>
.modal-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1rem;
    box-sizing: border-box;
}
</style>
