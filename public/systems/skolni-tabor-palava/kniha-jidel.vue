<template>
    <div class="p-6 flex flex-col gap-5 max-w-7xl mx-auto">

        <h1 class="text-4xl font-bold">{{ t('meal_plan') }}</h1>

        <section class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div class="flex items-center gap-2 mb-4">
                <UIcon name="i-heroicons-user-plus" class="w-5 h-5 text-sky-600" />
                <h2 class="text-lg font-semibold text-gray-900">Přidat jídlo osobě</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-end">
                <ComponentWrapper class="w-full" :component="addMealSessionComponent" />
                <ComponentWrapper class="w-full" :component="addMealPersonComponent" />
                <ComponentWrapper class="w-full" :component="addMealDateComponent" />
                <ComponentWrapper class="w-full" :component="addMealMealComponent" />
                <ComponentWrapper
                    class="w-full"
                    :component="addMealSubmitComponent"
                    @action-completed="reloadMealPlan"
                />
            </div>
        </section>

        <section class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div class="flex items-center gap-2 mb-4">
                <UIcon name="i-heroicons-trash" class="w-5 h-5 text-red-600" />
                <h2 class="text-lg font-semibold text-gray-900">Odebrat jídlo osobě</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-end">
                <ComponentWrapper class="w-full" :component="removeMealPersonComponent" />
                <ComponentWrapper class="w-full" :component="removeMealSessionComponent" />
                <ComponentWrapper class="w-full" :component="removeMealDateComponent" />
                <ComponentWrapper class="w-full" :component="removeMealMealComponent" />
                <ComponentWrapper
                    class="w-full"
                    :component="removeMealSubmitComponent"
                    @action-completed="reloadMealPlan"
                />
            </div>
        </section>

        <!-- Sessions accordion -->
        <div v-for="sessionId in sessionIds" :key="sessionId"
            class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            <!-- Session header row -->
            <div class="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                @click="toggleSession(sessionId)">
                <div class="flex-1 flex items-center justify-between gap-3 flex-wrap">
                    <ComponentWrapper
                        :component="withVars(sessionHeaderComponent, [new Variable('idTurnusu', sessionId)])"
                    />
                    <div class="flex items-center gap-2 flex-wrap">
                        <ComponentWrapper
                            :component="withVars(sessionDateComponent, [new Variable('idTurnusu', sessionId)])"
                        />
                        <ComponentWrapper
                            :component="withVars(sessionMealCountComponent, [new Variable('idTurnusu', sessionId)])"
                        />
                        <ComponentWrapper
                            :component="withVars(sessionPortionCountComponent, [new Variable('idTurnusu', sessionId)])"
                        />
                    </div>
                </div>
                <UIcon
                    :name="isSessionExpanded(sessionId) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                    class="w-5 h-5 text-gray-400 flex-shrink-0"
                />
            </div>

            <!-- Days accordion -->
            <div v-if="isSessionExpanded(sessionId)" class="border-t border-gray-100">
                <div v-for="date in getSessionDays(sessionId)" :key="date"
                    class="border-b border-gray-100 last:border-b-0">

                    <!-- Day header row -->
                    <div class="flex items-center gap-3 px-6 py-3 cursor-pointer hover:bg-gray-50 transition-colors bg-gray-50/50"
                        @click="toggleDay(sessionId, date)">
                        <div class="flex-1 flex items-center justify-between gap-3 flex-wrap">
                            <ComponentWrapper
                                :component="withVars(dayHeaderComponent, [new Variable('datumDne', date)])"
                            />
                            <div class="flex items-center gap-2 flex-wrap">
                                <ComponentWrapper
                                    :component="withVars(dayMealCountComponent, [new Variable('datumDne', date)])"
                                />
                                <ComponentWrapper
                                    :component="withVars(dayPortionCountComponent, [new Variable('datumDne', date)])"
                                />
                            </div>
                        </div>
                        <UIcon
                            :name="isDayExpanded(sessionId, date) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                            class="w-4 h-4 text-gray-400 flex-shrink-0"
                        />
                    </div>

                    <!-- Meals accordion -->
                    <div v-if="isDayExpanded(sessionId, date)" class="border-t border-gray-100">
                        <div v-for="mealId in getDayMeals(sessionId, date)" :key="mealId"
                            class="border-b border-gray-100 last:border-b-0">

                            <!-- Meal row -->
                            <div class="flex items-center gap-3 px-8 py-4 cursor-pointer hover:bg-blue-50/30 transition-colors bg-white"
                                @click="toggleMeal(mealId, date)">
                                <div class="flex-1 flex items-start justify-between gap-3 flex-wrap">
                                    <div class="flex flex-col gap-1 min-w-0">
                                        <ComponentWrapper
                                            :component="withVars(mealRowComponent, [new Variable('idJidla', mealId)])"
                                        />
                                        <ComponentWrapper
                                            :component="withVars(mealAllergensComponent, [new Variable('idJidla', mealId)])"
                                        />
                                    </div>
                                    <ComponentWrapper
                                        :component="withVars(mealServingTimeComponent, [new Variable('idJidla', mealId)])"
                                    />
                                </div>
                                <UIcon
                                    :name="isMealExpanded(mealId, date) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                                    class="w-4 h-4 text-gray-400 flex-shrink-0"
                                />
                            </div>

                            <!-- People section -->
                            <div v-if="isMealExpanded(mealId, date)"
                                class="px-10 py-4 bg-blue-50/40 border-t border-blue-100 flex flex-col gap-4">
                                <ComponentWrapper
                                    :component="withVars(mealPeopleComponent, [new Variable('idJidla', mealId), new Variable('datumDne', date)])"
                                />
                                <ComponentWrapper
                                    :component="withVars(mealSupervisorsComponent, [new Variable('idJidla', mealId), new Variable('datumDne', date)])"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>

        <!-- Empty state -->
        <div v-if="sessionIds.length === 0 && isDbReady" class="text-center py-12">
            <UIcon name="i-heroicons-book-open" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ t('no_meal_plan') }}</h3>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ComponentWrapper from '~/components/ComponentWrapper.vue';
import { ComponentVariables, Variable } from '~/model/ComponentVariables';
import { useSystemsStore } from '~/stores/systemsStore';

function withVars(comp: any, vars: Variable[]) {
  if (!comp) return undefined;
  const clone = Object.create(comp);
  clone.variables = new ComponentVariables();
  clone.variables.generalVariables = vars;
  return clone;
}

const { t } = useI18n();
const { route, systemsStore, systemId } = useSyncSystemId();

const isDbReady = computed(() => !!systemsStore.selectedSystem?.database?.sqlJsDatabase);

// Components
const sessionHeaderComponent = computed(() => systemsStore.getComponentById('jidelnicek-hlavicka-turnusu'));
const sessionDateComponent = computed(() => systemsStore.getComponentById('jidelnicek-datum-turnusu'));
const sessionMealCountComponent = computed(() => systemsStore.getComponentById('jidelnicek-pocet-jidel-turnusu'));
const sessionPortionCountComponent = computed(() => systemsStore.getComponentById('jidelnicek-pocet-porci-turnusu'));
const dayHeaderComponent = computed(() => systemsStore.getComponentById('jidelnicek-hlavicka-dne'));
const dayMealCountComponent = computed(() => systemsStore.getComponentById('jidelnicek-pocet-jidel-dne'));
const dayPortionCountComponent = computed(() => systemsStore.getComponentById('jidelnicek-pocet-porci-dne'));
const mealRowComponent = computed(() => systemsStore.getComponentById('jidelnicek-radek-jidla'));
const mealAllergensComponent = computed(() => systemsStore.getComponentById('jidelnicek-alergeny-jidla'));
const mealServingTimeComponent = computed(() => systemsStore.getComponentById('jidelnicek-doba-podavani-jidla'));
const mealPeopleComponent = computed(() => systemsStore.getComponentById('jidelnicek-lide-jidla'));
const mealSupervisorsComponent = computed(() => systemsStore.getComponentById('jidelnicek-vedouci-jidla'));
const addMealSessionComponent = computed(() => systemsStore.getComponentById('jidelnicek-vstup-turnus-jidlo-osobe'));
const addMealPersonComponent = computed(() => systemsStore.getComponentById('jidelnicek-vstup-osoba-jidlo-osobe'));
const addMealDateComponent = computed(() => systemsStore.getComponentById('jidelnicek-vstup-datum-jidlo-osobe'));
const addMealMealComponent = computed(() => systemsStore.getComponentById('jidelnicek-vstup-jidlo-jidlo-osobe'));
const addMealSubmitComponent = computed(() => systemsStore.getComponentById('jidelnicek-tlacitko-pridat-jidlo-osobe'));
const removeMealSessionComponent = computed(() => systemsStore.getComponentById('jidelnicek-vstup-turnus-odebrat-jidlo-osobe'));
const removeMealPersonComponent = computed(() => systemsStore.getComponentById('jidelnicek-vstup-osoba-odebrat-jidlo-osobe'));
const removeMealDateComponent = computed(() => systemsStore.getComponentById('jidelnicek-vstup-datum-odebrat-jidlo-osobe'));
const removeMealMealComponent = computed(() => systemsStore.getComponentById('jidelnicek-vstup-jidlo-odebrat-jidlo-osobe'));
const removeMealSubmitComponent = computed(() => systemsStore.getComponentById('jidelnicek-tlacitko-odebrat-jidlo-osobe'));

// State
const sessionIds = ref<number[]>([]);
const expandedSessions = ref<number[]>([]);
const sessionDays = ref<Record<number, string[]>>({});
const expandedDayKeys = ref<string[]>([]);
const dayMeals = ref<Record<string, number[]>>({});
const expandedMealKeys = ref<string[]>([]);

// Helpers
const isSessionExpanded = (id: number) => expandedSessions.value.includes(id);
const isDayExpanded = (sId: number, date: string) => expandedDayKeys.value.includes(`${sId}|${date}`);
const isMealExpanded = (mId: number, date: string) => expandedMealKeys.value.includes(`${mId}|${date}`);
const getSessionDays = (sId: number) => sessionDays.value[sId] ?? [];
const getDayMeals = (sId: number, date: string) => dayMeals.value[`${sId}|${date}`] ?? [];

// Toggle functions
const toggleSession = async (id: number) => {
    if (isSessionExpanded(id)) {
        expandedSessions.value = expandedSessions.value.filter(s => s !== id);
    } else {
        expandedSessions.value = [...expandedSessions.value, id];
        if (!sessionDays.value[id]) await loadDays(id);
    }
};

const toggleDay = async (sId: number, date: string) => {
    const key = `${sId}|${date}`;
    if (isDayExpanded(sId, date)) {
        expandedDayKeys.value = expandedDayKeys.value.filter(k => k !== key);
    } else {
        expandedDayKeys.value = [...expandedDayKeys.value, key];
        if (!dayMeals.value[key]) await loadMeals(sId, date);
    }
};

const toggleMeal = (mId: number, date: string) => {
    const key = `${mId}|${date}`;
    if (isMealExpanded(mId, date)) {
        expandedMealKeys.value = expandedMealKeys.value.filter(k => k !== key);
    } else {
        expandedMealKeys.value = [...expandedMealKeys.value, key];
    }
};

// Data loading
const loadSessions = async () => {
    const db = systemsStore.selectedSystem?.database;
    if (!db) return;
    try {
        const result = await db.query(`SELECT id_turnusu FROM turnusy ORDER BY id_turnusu`);
        if (result.data?.[0]?.values) {
            sessionIds.value = result.data[0].values.map(row => Number(row[0]));
        }
    } catch (e) { console.error('Failed to load sessions:', e); }
};

const loadDays = async (sId: number) => {
    const db = systemsStore.selectedSystem?.database;
    if (!db) return;
    try {
        const result = await db.query(
            `SELECT DISTINCT kj.datum FROM kniha_jidel kj JOIN turnusy t ON DATE(kj.datum) BETWEEN DATE(t.datum_od) AND DATE(t.datum_do) WHERE t.id_turnusu = ${sId} ORDER BY kj.datum`
        );
        if (result.data?.[0]?.values) {
            sessionDays.value = { ...sessionDays.value, [sId]: result.data[0].values.map(row => String(row[0])) };
        }
    } catch (e) { console.error('Failed to load days for session', sId, e); }
};

const loadMeals = async (sId: number, date: string) => {
    const db = systemsStore.selectedSystem?.database;
    if (!db) return;
    const key = `${sId}|${date}`;
    try {
        const result = await db.query(
            `SELECT DISTINCT id_jidla FROM kniha_jidel WHERE datum = '${date}' ORDER BY id_jidla`
        );
        if (result.data?.[0]?.values) {
            dayMeals.value = { ...dayMeals.value, [key]: result.data[0].values.map(row => Number(row[0])) };
        }
    } catch (e) { console.error('Failed to load meals for day', date, e); }
};

const reloadMealPlan = async () => {
    await loadSessions();

    for (const sessionId of expandedSessions.value) {
        await loadDays(sessionId);
    }

    for (const key of expandedDayKeys.value) {
        const [sessionId, date] = key.split('|');
        if (sessionId && date) {
            await loadMeals(Number(sessionId), date);
        }
    }
};

watch(() => systemsStore.selectedSystem?.database?.sqlJsDatabase, (db) => {
    if (db) loadSessions();
}, { immediate: true });

onMounted(() => {
    if (systemsStore.selectedSystem?.database?.sqlJsDatabase) loadSessions();
});
</script>

<style scoped>
</style>
