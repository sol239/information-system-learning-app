<template>
    <div class="p-6 flex flex-col gap-6 max-w-7xl mx-auto">

        <!-- Page header -->
        <h1 class="text-4xl font-bold">{{ t('participants') }}</h1>

        <!-- Toolbar -->
        <div class="flex flex-wrap items-center gap-3">
            <!-- Session filter dropdown -->
            <USelect
                v-model="selectedSessionId"
                :items="sessionFilterItems"
                value-key="value"
                label-key="label"
                class="w-40"
            />

            <!-- Capacity bar component -->
            <ComponentWrapper :component="capacityBarComponent" />

            <!-- Spacer -->
            <div class="flex-1" />

            <!-- Name/email filter -->
            <UInput
                v-model="filterText"
                icon="i-heroicons-magnifying-glass"
                placeholder="Jméno, email, telefon nebo adresa"
                class="w-56"
            />

            <!-- Order select -->
            <ComponentWrapper :component="razeniComponent" />

            <!-- Add participant modal -->
            <ModalContainer v-model:open="createModalOpen" class="w-fit">
                <UButton label="Přidat účastníka" color="primary" icon="i-heroicons-plus" size="md" />

                <template #content>
                    <div class="modal-container">
                        <ComponentWrapper :component="vstupJmenoComponent" />
                        <ComponentWrapper :component="vstupEmailComponent" />
                        <ComponentWrapper :component="vstupTelefonComponent" />
                        <ComponentWrapper :component="vstupAdresaComponent" />
                        <ComponentWrapper :component="vstupVekComponent" />
                        <ComponentWrapper :component="vstupAlergenyComponent" />
                        <ComponentWrapper :component="vstupTurnusyComponent" />
                        <div class="flex gap-2">
                            <UButton label="Zrušit" color="neutral" variant="solid" size="md"
                                @click="createModalOpen = false" />
                            <ComponentWrapper :component="btnUlozitComponent" @action-completed="handleParticipantCreated" />
                        </div>
                    </div>
                </template>
            </ModalContainer>
        </div>

        <!-- Participants grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div
                v-for="participantId in filteredParticipantIds"
                :key="participantId"
                class="bg-white rounded-xl border-2 border-cyan-400 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
                <!-- Name + age + email + phone + address -->
                <ComponentWrapper
                    :component="withVars(cardInfoComponent, [new Variable('idUcastnika', participantId)])"
                />

                <!-- Session line -->
                <ComponentWrapper
                    :component="withVars(sessionBadgeComponent, [new Variable('idUcastnika', participantId)])"
                />

                <!-- Allergen badge -->
                <ComponentWrapper
                    :component="withVars(allergenBadgeComponent, [new Variable('idUcastnika', participantId)])"
                />

                <!-- Actions -->
                <div class="flex gap-3 pt-1 border-t border-gray-100">
                    <ModalContainer v-model:open="editModalOpen[participantId]" class="flex-1">
                        <UButton label="Upravit" color="neutral" variant="subtle" size="md" class="flex-1" />

                        <template #content>
                            <div class="modal-container">
                                <ComponentWrapper
                                    :component="withVars(editVstupJmenoComponent, [new Variable('idUcastnika', participantId)])" />
                                <ComponentWrapper
                                    :component="withVars(editVstupEmailComponent, [new Variable('idUcastnika', participantId)])" />
                                <ComponentWrapper
                                    :component="withVars(editVstupTelefonComponent, [new Variable('idUcastnika', participantId)])" />
                                <ComponentWrapper
                                    :component="withVars(editVstupAdresaComponent, [new Variable('idUcastnika', participantId)])" />
                                <ComponentWrapper
                                    :component="withVars(editVstupVekComponent, [new Variable('idUcastnika', participantId)])" />
                                <ComponentWrapper
                                    :component="withVars(editVstupAlergenyComponent, [new Variable('idUcastnika', participantId)])" />
                                <ComponentWrapper
                                    :component="withVars(editVstupTurnusyComponent, [new Variable('idUcastnika', participantId)])" />
                                <div class="flex gap-2">
                                    <UButton label="Zrušit" color="neutral" variant="solid" size="md"
                                        @click="editModalOpen[participantId] = false" />
                                    <ComponentWrapper
                                        :component="withVars(editBtnUlozitComponent, [new Variable('idUcastnika', participantId)])"
                                        @action-completed="handleParticipantUpdated(participantId)" />
                                </div>
                            </div>
                        </template>
                    </ModalContainer>

                    <div class="flex-1" @click="reloadAfterDelete">
                        <ComponentWrapper
                            :component="withVars(smazatComponent, [new Variable('idUcastnika', participantId)])" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty state -->
        <div v-if="filteredParticipantIds.length === 0 && isDbReady" class="text-center py-12">
            <UIcon name="i-heroicons-users" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ t('no_participants') }}</h3>
            <p class="text-gray-500">{{ t('no_participants_description') }}</p>
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
const cardInfoComponent = computed(() => systemsStore.getComponentById('karta-ucastnika'));
const sessionBadgeComponent = computed(() => systemsStore.getComponentById('stitek-turnusu-ucastnika'));
const allergenBadgeComponent = computed(() => systemsStore.getComponentById('stitek-alergenu-ucastnika'));
const capacityBarComponent = computed(() => systemsStore.getComponentById('celkova-kapacita-ucastniku'));
const razeniComponent = computed(() => systemsStore.getComponentById('razeni-ucastniku'));

// Create components
const vstupJmenoComponent = computed(() => systemsStore.getComponentById('vstup-jmeno-ucastnika'));
const vstupEmailComponent = computed(() => systemsStore.getComponentById('vstup-email-ucastnika'));
const vstupTelefonComponent = computed(() => systemsStore.getComponentById('vstup-telefon-ucastnika'));
const vstupAdresaComponent = computed(() => systemsStore.getComponentById('vstup-adresa-ucastnika'));
const vstupVekComponent = computed(() => systemsStore.getComponentById('vstup-vek-ucastnika'));
const vstupAlergenyComponent = computed(() => systemsStore.getComponentById('vstup-alergeny-ucastnika'));
const vstupTurnusyComponent = computed(() => systemsStore.getComponentById('vstup-turnusy-ucastnika'));
const btnUlozitComponent = computed(() => systemsStore.getComponentById('btn-ulozit-ucastnika'));

// Edit components
const editVstupJmenoComponent = computed(() => systemsStore.getComponentById('edit-vstup-jmeno-ucastnika'));
const editVstupEmailComponent = computed(() => systemsStore.getComponentById('edit-vstup-email-ucastnika'));
const editVstupTelefonComponent = computed(() => systemsStore.getComponentById('edit-vstup-telefon-ucastnika'));
const editVstupAdresaComponent = computed(() => systemsStore.getComponentById('edit-vstup-adresa-ucastnika'));
const editVstupVekComponent = computed(() => systemsStore.getComponentById('edit-vstup-vek-ucastnika'));
const editVstupAlergenyComponent = computed(() => systemsStore.getComponentById('edit-vstup-alergeny-ucastnika'));
const editVstupTurnusyComponent = computed(() => systemsStore.getComponentById('edit-vstup-turnusy-ucastnika'));
const editBtnUlozitComponent = computed(() => systemsStore.getComponentById('edit-btn-ulozit-ucastnika'));

// Delete component
const smazatComponent = computed(() => systemsStore.getComponentById('smazat-ucastnika'));

// Participant data
interface ParticipantRow {
    id: number;
    sessionId: number | null;
    name: string;
    email: string;
    phone: string;
    address: string;
    age: number;
    allergenCount: number;
}
const participants = ref<ParticipantRow[]>([]);

// Filters
const filterText = ref('');
const selectedSessionId = ref<number | null>(null);

interface SessionItem { label: string; value: number | null }
const sessions = ref<{ id: number; label: string }[]>([]);

const sessionFilterItems = computed<SessionItem[]>(() => [
    { label: t('all_sessions'), value: null },
    ...sessions.value.map(s => ({ label: s.label, value: s.id }))
]);

const normalizedFilterText = computed(() => filterText.value.trim().toLocaleLowerCase('cs-CZ'));

const orderBy = computed(() => {
    const value = systemInputVariables.value.find(variable => variable.name === 'razeni_ucastniku')?.variable;
    const normalizedValue = String(value ?? 'jmeno');
    return ['jmeno', 'vek', 'email', 'alergeny'].includes(normalizedValue) ? normalizedValue : 'jmeno';
});

const filteredParticipantIds = computed(() => {
    let filteredParticipants = participants.value;
    if (selectedSessionId.value !== null) {
        filteredParticipants = filteredParticipants.filter(p => p.sessionId === selectedSessionId.value);
    }

    if (normalizedFilterText.value) {
        filteredParticipants = filteredParticipants.filter(p =>
            p.name.toLocaleLowerCase('cs-CZ').includes(normalizedFilterText.value) ||
            p.email.toLocaleLowerCase('cs-CZ').includes(normalizedFilterText.value) ||
            p.phone.toLocaleLowerCase('cs-CZ').includes(normalizedFilterText.value) ||
            p.address.toLocaleLowerCase('cs-CZ').includes(normalizedFilterText.value)
        );
    }

    const uniqueParticipants: ParticipantRow[] = [];
    const seenIds = new Set<number>();
    for (const p of filteredParticipants) {
        if (seenIds.has(p.id)) continue;
        seenIds.add(p.id);
        uniqueParticipants.push(p);
    }

    const collator = new Intl.Collator('cs-CZ', { sensitivity: 'base', numeric: true });
    uniqueParticipants.sort((a, b) => {
        if (orderBy.value === 'vek') {
            return a.age - b.age || a.id - b.id;
        }

        if (orderBy.value === 'email') {
            return collator.compare(a.email, b.email) || a.id - b.id;
        }

        if (orderBy.value === 'alergeny') {
            return a.allergenCount - b.allergenCount || collator.compare(a.name, b.name) || a.id - b.id;
        }

        return collator.compare(a.name, b.name) || a.id - b.id;
    });

    return uniqueParticipants.map(participant => participant.id);
});

function resetFilter() {
    selectedSessionId.value = null;
    filterText.value = '';
}

const loadData = async () => {
    const db = systemsStore.selectedSystem?.database;
    if (!db) return;

    try {
        // Load participants with their session
        const pResult = await db.query(
            `SELECT
                u.id_ucastnika,
                tu.id_turnusu,
                u.jmeno,
                u.email,
                u.telefon,
                u.adresa,
                u.vek,
                alergeny.pocet_alergenu AS pocet_alergenu
             FROM ucastnici u
             LEFT JOIN turnusy_ucastnici tu ON u.id_ucastnika = tu.id_ucastnika
             LEFT JOIN (
                SELECT id_ucastnika, COUNT(id_alergenu) AS pocet_alergenu
                FROM ucastnici_alergeny
                GROUP BY id_ucastnika
             ) alergeny ON u.id_ucastnika = alergeny.id_ucastnika
             ORDER BY tu.id_turnusu, u.id_ucastnika`
        );
        if (pResult.data?.[0]?.values) {
            participants.value = pResult.data[0].values.map(row => ({
                id: Number(row[0]),
                sessionId: row[1] !== null ? Number(row[1]) : null,
                name: String(row[2] || ''),
                email: String(row[3] || ''),
                phone: String(row[4] || ''),
                address: String(row[5] || ''),
                age: Number(row[6] || 0),
                allergenCount: Number(row[7] || 0)
            }));
        }

        // Load sessions for the filter dropdown
        const sResult = await db.query(
            `SELECT id_turnusu, datum_od, datum_do FROM turnusy ORDER BY id_turnusu`
        );
        if (sResult.data?.[0]?.values) {
            sessions.value = sResult.data[0].values.map(row => ({
                id: Number(row[0]),
                label: `Turnus ${row[0]}`
            }));
        }
    } catch (e) {
        console.error('Failed to load participants:', e);
    }
};

const reloadAfterDelete = () => {
    window.setTimeout(() => { loadData(); }, 50);
};

const handleParticipantCreated = () => {
    createModalOpen.value = false;
    window.setTimeout(() => { loadData(); }, 50);
};

const handleParticipantUpdated = (participantId: number) => {
    editModalOpen[participantId] = false;
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
