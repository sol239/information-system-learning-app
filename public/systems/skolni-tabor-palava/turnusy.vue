<template>
    <div class="p-6 flex flex-col gap-8 max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-4xl font-bold">{{ t('sessions') }}</h1>
        </div>

        <ModalContainer v-model:open="createModalOpen" class="w-fit">
            <UButton label="Vytvořit turnus" color="neutral" variant="subtle" size="md" class="w-auto" />

            <template #content>
                <div class="modal-container">
                    <ComponentWrapper :component="dateFromInputComponent" />
                    <ComponentWrapper :component="dateToInputComponent" />
                    <ComponentWrapper :component="capacityInputComponent" />
                    <div class="flex gap-2">
                        <UButton label="Zrušit" color="neutral" variant="solid" size="md"
                            @click="createModalOpen = false" />
                        <ComponentWrapper :component="saveButtonComponent" @action-completed="handleSessionCreated" />
                    </div>
                </div>
            </template>
        </ModalContainer>

        <!-- Sessions Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="sessionId in sessionIds" :key="sessionId"
                class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col gap-5">

                <!-- Session Header: title + status badge -->
                <div class="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h3 class="text-xl font-semibold text-gray-900">
                        {{ t('session') }} {{ sessionId }}
                    </h3>
                    <ComponentWrapper
                        :component="withVars(statusBadgeComponent, [new Variable('idTurnusu', sessionId)])" />
                </div>

                <!-- Date range + day count -->
                <div class="flex flex-wrap items-center gap-3">
                    <ComponentWrapper
                        :component="withVars(dateRangeComponent, [new Variable('idTurnusu', sessionId)])" />
                    <ComponentWrapper :component="withVars(daysComponent, [new Variable('idTurnusu', sessionId)])" />
                </div>

                <!-- Capacity progress bar -->
                <ComponentWrapper :component="withVars(capacityBarComponent, [new Variable('idTurnusu', sessionId)])" />

                <!-- Divider -->
                <hr class="border-gray-100" />

                <!-- Participants list -->
                <ComponentWrapper
                    :component="withVars(participantsCountBadgeComponent, [new Variable('idTurnusu', sessionId)])" />
                <ComponentWrapper
                    :component="withVars(participantsListComponent, [new Variable('idTurnusu', sessionId)])" />

                <!-- Supervisors list -->
                <ComponentWrapper
                    :component="withVars(supervisorsCountBadgeComponent, [new Variable('idTurnusu', sessionId)])" />
                <ComponentWrapper
                    :component="withVars(supervisorsListComponent, [new Variable('idTurnusu', sessionId)])" />

                <!-- Action buttons -->
                <div class="flex gap-3 pt-2 border-t border-gray-100">
                    <ModalContainer v-model:open="editModalOpen[sessionId]" class="flex-1">
                        <UButton label="Upravit turnus" color="neutral" variant="subtle" size="md" class="flex-1" />

                        <template #content>
                            <div class="modal-container">
                                <ComponentWrapper
                                    :component="withVars(editDateFromInputComponent, [new Variable('idTurnusu', sessionId)])" />
                                <ComponentWrapper
                                    :component="withVars(editDateToInputComponent, [new Variable('idTurnusu', sessionId)])" />
                                <ComponentWrapper
                                    :component="withVars(editCapacityInputComponent, [new Variable('idTurnusu', sessionId)])" />
                                <div class="flex gap-2">
                                    <UButton label="Zrušit" color="neutral" variant="solid" size="md"
                                        @click="editModalOpen[sessionId] = false" />
                                    <ComponentWrapper
                                        :component="withVars(editSaveButtonComponent, [new Variable('idTurnusu', sessionId)])"
                                        @action-completed="handleSessionUpdated(sessionId)" />
                                </div>
                            </div>
                        </template>
                    </ModalContainer>

                    <div class="flex-1" @click="reloadSessionsAfterDelete">
                        <ComponentWrapper
                            :component="withVars(deleteSessionComponent, [new Variable('idTurnusu', sessionId)])" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-if="sessionIds.length === 0 && isDbReady" class="text-center py-12">
            <UIcon name="i-heroicons-calendar-x-mark" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ t('no_sessions') }}</h3>
            <p class="text-gray-600 mb-4">{{ t('no_sessions_description') }}</p>
            <div class="flex justify-center">
                <AddSessionButton @session-created="loadSessions" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ComponentWrapper from '~/components/ComponentWrapper.vue';
import { ComponentVariables, Variable } from '~/model/ComponentVariables';
import { useSystemsStore } from '~/stores/systemsStore';
import { DatabaseHandler } from '~/utils/DatabaseHandler';

function withVars(comp: any, vars: Variable[]) {
    if (!comp) return undefined;
    const clone = Object.create(comp);
    clone.variables = new ComponentVariables();
    clone.variables.generalVariables = vars;
    return clone;
}

const { t } = useI18n();
const { route, systemsStore, systemId } = useSyncSystemId();

const sessionIds = ref<number[]>([]);
const createModalOpen = ref(false);
const editModalOpen = reactive<Record<number, boolean>>({});
const isDbReady = computed(() => !!systemsStore.selectedSystem?.database?.sqlJsDatabase);

// Per-card components â€“ each instance receives sessionId via generalVariables
const statusBadgeComponent = computed(() => systemsStore.getComponentById('stitek-stavu-turnusu'));
const dateRangeComponent = computed(() => systemsStore.getComponentById('datum-turnusu'));
const daysComponent = computed(() => systemsStore.getComponentById('pocet-dni-turnusu'));
const capacityBarComponent = computed(() => systemsStore.getComponentById('kapacita-turnusu'));
const participantsCountBadgeComponent = computed(() => systemsStore.getComponentById('stitek-poctu-ucastniku-turnusu'));
const participantsListComponent = computed(() => systemsStore.getComponentById('seznam-ucastniku-turnusu'));
const supervisorsCountBadgeComponent = computed(() => systemsStore.getComponentById('stitek-poctu-vedoucich-turnusu'));
const supervisorsListComponent = computed(() => systemsStore.getComponentById('seznam-vedoucich-turnusu'));
const deleteSessionComponent = computed(() => systemsStore.getComponentById('smazat-turnus'));
const dateFromInputComponent = computed(() => systemsStore.getComponentById('vstup-datum-od'));
const dateToInputComponent = computed(() => systemsStore.getComponentById('vstup-datum-do'));
const capacityInputComponent = computed(() => systemsStore.getComponentById('vstup-kapacita'));
const saveButtonComponent = computed(() => systemsStore.getComponentById('btn-ulozit'));
const editDateFromInputComponent = computed(() => systemsStore.getComponentById('edit-vstup-datum-od'));
const editDateToInputComponent = computed(() => systemsStore.getComponentById('edit-vstup-datum-do'));
const editCapacityInputComponent = computed(() => systemsStore.getComponentById('edit-vstup-kapacita'));
const editSaveButtonComponent = computed(() => systemsStore.getComponentById('edit-btn-ulozit'));

// Fetch session IDs
const loadSessions = async () => {
    const db = systemsStore.selectedSystem?.database;
    if (!db) return;

    try {
        const result = await db.query("SELECT id_turnusu FROM turnusy ORDER BY id_turnusu");
        if (result.data && result.data[0] && result.data[0].values) {
            sessionIds.value = result.data[0].values.map(row => Number(row[0]));
        }
    } catch (e) {
        console.error("Failed to load sessions:", e);
    }
};

const reloadSessionsAfterDelete = () => {
    window.setTimeout(() => {
        loadSessions();
    }, 50);
};

const handleSessionCreated = () => {
    createModalOpen.value = false;
    window.setTimeout(() => {
        loadSessions();
    }, 50);
};

const handleSessionUpdated = (sessionId: number) => {
    editModalOpen[sessionId] = false;
    window.setTimeout(() => {
        loadSessions();
    }, 50);
};

watch(() => systemsStore.selectedSystem?.database?.sqlJsDatabase, (newDb) => {
    if (newDb) {
        loadSessions();
    }
}, { immediate: true });

onMounted(() => {
    if (systemsStore.selectedSystem?.database?.sqlJsDatabase) {
        loadSessions();
    }
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
