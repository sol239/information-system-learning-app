<template>
  <div
    class="participants-page p-6 flex flex-col gap-6 max-w-7xl mx-auto text-xs"
  >
    <!-- Page header -->
    <div class="flex flex-wrap items-center gap-3">
      <h1 class="system-page-heading" style="--system-heading-color: #22d3ee">
        {{ t("participants") }}
      </h1>
      <!-- Add participant modal -->
      <ModalContainer
        v-model:open="createModalOpen"
        title="Přidat účastníka"
        class="ml-auto w-fit"
      >
        <button
          type="button"
          class="participant-button participant-button--add"
        >
          <UIcon name="i-heroicons-plus" class="size-4" aria-hidden="true" />
          Přidat účastníka
        </button>

        <template #header>
          <div class="participant-edit-header">
            <div class="flex-1">
              <h2 class="text-base font-semibold text-gray-900">
                Přidat účastníka
              </h2>
              <p class="mt-1 text-xs text-gray-500">
                Vyplňte údaje nového účastníka a vyberte jeho turnusy.
              </p>
            </div>
            <button
              type="button"
              class="participant-edit-close"
              :aria-label="t('close')"
              @click.stop="createModalOpen = false"
            >
              <UIcon name="i-lucide-x" class="size-4" aria-hidden="true" />
            </button>
          </div>
        </template>

        <template #content>
          <div class="modal-container participant-form entity-modal-form">
            <ComponentWrapper :component="vstupJmenoComponent" />
            <ComponentWrapper :component="vstupEmailComponent" />
            <ComponentWrapper :component="vstupTelefonComponent" />
            <ComponentWrapper :component="vstupAdresaComponent" />
            <ComponentWrapper :component="vstupVekComponent" />
            <ComponentWrapper :component="vstupAlergenyComponent" />
            <ComponentWrapper :component="vstupTurnusyComponent" />
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
                @action-completed="handleParticipantCreated"
              />
            </div>
          </div>
        </template>
      </ModalContainer>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-row flex-wrap items-center gap-3">
      <!-- Session filter dropdown -->
      <div class="participant-select">
        <select v-model="selectedSessionId" :aria-label="t('all_sessions')">
          <option
            v-for="item in sessionFilterItems"
            :key="item.value ?? 'all'"
            :value="item.value"
          >
            {{ item.label }}
          </option>
        </select>
      </div>

      <!-- Capacity bar component -->
      <ComponentWrapper :component="capacityBarComponent" />

      <!-- Name/email filter -->
      <UInput
        v-model="filterText"
        icon="i-heroicons-magnifying-glass"
        placeholder="Jméno, email, telefon nebo adresa"
        class="w-56"
        :ui="{ base: 'h-[26px] text-xs' }"
      />

      <!-- Order select -->
      <ComponentWrapper :component="razeniComponent" />
    </div>

    <!-- Participants grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="participantId in filteredParticipantIds"
        :key="participantId"
        class="bg-white rounded-xl border-2 border-cyan-400 p-5 flex flex-col gap-2 hover:shadow-md transition-shadow"
      >
        <!-- Name + age + email + phone + address -->
        <ComponentWrapper
          :component="
            withVars(cardInfoComponent, [
              new Variable('idUcastnika', participantId),
            ])
          "
        />

        <!-- Session line -->
        <ComponentWrapper
          :component="
            withVars(sessionBadgeComponent, [
              new Variable('idUcastnika', participantId),
            ])
          "
        />

        <!-- Allergen badge -->
        <ComponentWrapper
          :component="
            withVars(allergenBadgeComponent, [
              new Variable('idUcastnika', participantId),
            ])
          "
        />

        <!-- Actions -->
        <div class="flex gap-3 pt-1 border-t border-gray-100">
          <ModalContainer
            v-model:open="editModalOpen[participantId]"
            title="Upravit účastníka"
            class="flex-1"
          >
            <button
              type="button"
              class="participant-button participant-button--edit"
            >
              Upravit účastníka
            </button>

            <template #header>
              <div class="participant-edit-header">
                <div class="flex-1">
                  <h2 class="text-base font-semibold text-gray-900">
                    Upravit účastníka
                  </h2>
                  <p class="mt-1 text-xs text-gray-500">
                    Upravte údaje účastníka a jeho přiřazení k turnusům.
                  </p>
                </div>
                <button
                  type="button"
                  class="participant-edit-close"
                  :aria-label="t('close')"
                  @click.stop="editModalOpen[participantId] = false"
                >
                  <UIcon name="i-lucide-x" class="size-4" aria-hidden="true" />
                </button>
              </div>
            </template>

            <template #content>
              <div class="modal-container participant-form entity-modal-form">
                <ComponentWrapper
                  :component="
                    withVars(editVstupJmenoComponent, [
                      new Variable('idUcastnika', participantId),
                    ])
                  "
                />
                <ComponentWrapper
                  :component="
                    withVars(editVstupEmailComponent, [
                      new Variable('idUcastnika', participantId),
                    ])
                  "
                />
                <ComponentWrapper
                  :component="
                    withVars(editVstupTelefonComponent, [
                      new Variable('idUcastnika', participantId),
                    ])
                  "
                />
                <ComponentWrapper
                  :component="
                    withVars(editVstupAdresaComponent, [
                      new Variable('idUcastnika', participantId),
                    ])
                  "
                />
                <ComponentWrapper
                  :component="
                    withVars(editVstupVekComponent, [
                      new Variable('idUcastnika', participantId),
                    ])
                  "
                />
                <ComponentWrapper
                  :component="
                    withVars(editVstupAlergenyComponent, [
                      new Variable('idUcastnika', participantId),
                    ])
                  "
                />
                <ComponentWrapper
                  :component="
                    withVars(editVstupTurnusyComponent, [
                      new Variable('idUcastnika', participantId),
                    ])
                  "
                />
                <div class="entity-modal-actions entity-modal-actions--edit">
                  <button
                    type="button"
                    class="entity-modal-cancel"
                    @click="editModalOpen[participantId] = false"
                  >
                    Zrušit
                  </button>
                  <ComponentWrapper
                    :component="
                      withVars(editBtnUlozitComponent, [
                        new Variable('idUcastnika', participantId),
                      ])
                    "
                    @action-completed="handleParticipantUpdated(participantId)"
                  />
                </div>
              </div>
            </template>
          </ModalContainer>

          <div class="flex-1" @click="reloadAfterDelete">
            <ComponentWrapper
              :component="
                withVars(smazatComponent, [
                  new Variable('idUcastnika', participantId),
                ])
              "
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="filteredParticipantIds.length === 0 && isDbReady"
      class="text-center py-12"
    >
      <UIcon
        name="i-heroicons-users"
        class="w-16 h-16 mx-auto mb-4 text-gray-400"
      />
      <h3 class="text-xs font-semibold text-gray-900 mb-2">
        {{ t("no_participants") }}
      </h3>
      <p class="text-gray-500">{{ t("no_participants_description") }}</p>
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
  name: "SystemParticipantsPage",
});

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

interface SessionItem {
  label: string;
  value: number | null;
}

/* 5. Props */

/* 6. Emits */

/* 7. Template refs */

/* 8. State (ref, reactive) */
const createModalOpen = ref(false);

const editModalOpen = reactive<Record<number, boolean>>({});

const participants = ref<ParticipantRow[]>([]);

// Filters
const filterText = ref("");

const selectedSessionId = ref<number | null>(null);

const sessions = ref<{ id: number; label: string }[]>([]);

/* 9. Computed */
const isDbReady = computed(
  () => !!systemsStore.selectedSystem?.database?.sqlJsDatabase,
);

// Display components
const cardInfoComponent = computed(() =>
  systemsStore.getComponentById("karta-ucastnika"),
);

const sessionBadgeComponent = computed(() =>
  systemsStore.getComponentById("stitek-turnusu-ucastnika"),
);

const allergenBadgeComponent = computed(() =>
  systemsStore.getComponentById("stitek-alergenu-ucastnika"),
);

const capacityBarComponent = computed(() =>
  systemsStore.getComponentById("celkova-kapacita-ucastniku"),
);

const razeniComponent = computed(() =>
  systemsStore.getComponentById("razeni-ucastniku"),
);

// Create components
const vstupJmenoComponent = computed(() =>
  systemsStore.getComponentById("vstup-jmeno-ucastnika"),
);

const vstupEmailComponent = computed(() =>
  systemsStore.getComponentById("vstup-email-ucastnika"),
);

const vstupTelefonComponent = computed(() =>
  systemsStore.getComponentById("vstup-telefon-ucastnika"),
);

const vstupAdresaComponent = computed(() =>
  systemsStore.getComponentById("vstup-adresa-ucastnika"),
);

const vstupVekComponent = computed(() =>
  systemsStore.getComponentById("vstup-vek-ucastnika"),
);

const vstupAlergenyComponent = computed(() =>
  systemsStore.getComponentById("vstup-alergeny-ucastnika"),
);

const vstupTurnusyComponent = computed(() =>
  systemsStore.getComponentById("vstup-turnusy-ucastnika"),
);

const btnUlozitComponent = computed(() =>
  systemsStore.getComponentById("btn-ulozit-ucastnika"),
);

// Edit components
const editVstupJmenoComponent = computed(() =>
  systemsStore.getComponentById("edit-vstup-jmeno-ucastnika"),
);

const editVstupEmailComponent = computed(() =>
  systemsStore.getComponentById("edit-vstup-email-ucastnika"),
);

const editVstupTelefonComponent = computed(() =>
  systemsStore.getComponentById("edit-vstup-telefon-ucastnika"),
);

const editVstupAdresaComponent = computed(() =>
  systemsStore.getComponentById("edit-vstup-adresa-ucastnika"),
);

const editVstupVekComponent = computed(() =>
  systemsStore.getComponentById("edit-vstup-vek-ucastnika"),
);

const editVstupAlergenyComponent = computed(() =>
  systemsStore.getComponentById("edit-vstup-alergeny-ucastnika"),
);

const editVstupTurnusyComponent = computed(() =>
  systemsStore.getComponentById("edit-vstup-turnusy-ucastnika"),
);

const editBtnUlozitComponent = computed(() =>
  systemsStore.getComponentById("edit-btn-ulozit-ucastnika"),
);

// Delete component
const smazatComponent = computed(() =>
  systemsStore.getComponentById("smazat-ucastnika"),
);

const sessionFilterItems = computed<SessionItem[]>(() => [
  { label: t("all_sessions"), value: null },
  ...sessions.value.map((s) => ({ label: s.label, value: s.id })),
]);

const normalizedFilterText = computed(() =>
  filterText.value.trim().toLocaleLowerCase("cs-CZ"),
);

const orderBy = computed(() => {
  const value = systemInputVariables.value.find(
    (variable) => variable.name === "razeni_ucastniku",
  )?.variable;
  const normalizedValue = String(value ?? "jmeno");
  return ["jmeno", "vek", "email", "alergeny"].includes(normalizedValue)
    ? normalizedValue
    : "jmeno";
});

const filteredParticipantIds = computed(() => {
  let filteredParticipants = participants.value;
  if (selectedSessionId.value !== null) {
    filteredParticipants = filteredParticipants.filter(
      (p) => p.sessionId === selectedSessionId.value,
    );
  }

  if (normalizedFilterText.value) {
    filteredParticipants = filteredParticipants.filter(
      (p) =>
        p.name
          .toLocaleLowerCase("cs-CZ")
          .includes(normalizedFilterText.value) ||
        p.email
          .toLocaleLowerCase("cs-CZ")
          .includes(normalizedFilterText.value) ||
        p.phone
          .toLocaleLowerCase("cs-CZ")
          .includes(normalizedFilterText.value) ||
        p.address
          .toLocaleLowerCase("cs-CZ")
          .includes(normalizedFilterText.value),
    );
  }

  const uniqueParticipants: ParticipantRow[] = [];
  const seenIds = new Set<number>();
  for (const p of filteredParticipants) {
    if (seenIds.has(p.id)) continue;
    seenIds.add(p.id);
    uniqueParticipants.push(p);
  }

  const collator = new Intl.Collator("cs-CZ", {
    sensitivity: "base",
    numeric: true,
  });
  uniqueParticipants.sort((a, b) => {
    if (orderBy.value === "vek") {
      return a.age - b.age || a.id - b.id;
    }

    if (orderBy.value === "email") {
      return collator.compare(a.email, b.email) || a.id - b.id;
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

  return uniqueParticipants.map((participant) => participant.id);
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
             ORDER BY tu.id_turnusu, u.id_ucastnika`,
    );
    if (pResult.data?.[0]?.values) {
      participants.value = pResult.data[0].values.map((row) => ({
        id: Number(row[0]),
        sessionId: row[1] !== null ? Number(row[1]) : null,
        name: String(row[2] || ""),
        email: String(row[3] || ""),
        phone: String(row[4] || ""),
        address: String(row[5] || ""),
        age: Number(row[6] || 0),
        allergenCount: Number(row[7] || 0),
      }));
    }

    // Load sessions for the filter dropdown
    const sResult = await db.query(
      `SELECT id_turnusu, datum_od, datum_do FROM turnusy ORDER BY id_turnusu`,
    );
    if (sResult.data?.[0]?.values) {
      sessions.value = sResult.data[0].values.map((row) => ({
        id: Number(row[0]),
        label: `Turnus ${row[0]}`,
      }));
    }
  } catch (e) {
    console.error("Failed to load participants:", e);
  }
}

const reloadAfterDelete = () => {
  window.setTimeout(() => {
    loadData();
  }, 50);
};

const handleParticipantCreated = () => {
  createModalOpen.value = false;
  window.setTimeout(() => {
    loadData();
  }, 50);
};

const handleParticipantUpdated = (participantId: number) => {
  editModalOpen[participantId] = false;
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
.participants-page :deep(#kontaktni-udaje-oddeleni) {
  border-top-color: #9ca3af;
}

.participants-page :deep(.component-html :where(*):not(#jmeno-ucastnika)),
.participants-page :deep(button),
.participants-page :deep(input),
.participants-page :deep(select),
.participant-form :deep(.component-html *),
.participant-form :deep(button),
.participant-form :deep(input),
.participant-form :deep(select),
.participant-form :deep(label) {
  font-size: 12px;
}

.participant-select,
.participants-page :deep(#razeni-ucastniku) {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 26px;
  box-sizing: border-box;
  padding: 0 12px;
  border: 1px solid #0e7490;
  border-radius: 8px;
  background: #fff;
}

.participant-select select {
  border: 0;
  background: transparent;
  color: #111827;
  font-size: 12px;
  cursor: pointer;
}

.participant-select:focus-within {
  outline: 2px solid #0e7490;
  outline-offset: 2px;
}

.participant-button,
.participants-page :deep(#smazat-ucastnika-tlacitko) {
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

.participant-button--add {
  border-color: #22c55e;
  background: #f0fdf4;
  color: #15803d;
}

.participant-button--add:hover {
  background: #dcfce7;
}

.participant-button--edit {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #2563eb;
}

.participant-button--edit:hover {
  background: #dbeafe;
}

.participant-button--edit,
.participants-page :deep(#smazat-ucastnika-tlacitko) {
  height: auto;
  min-height: 26px;
  padding: 6px 14px;
  line-height: 1.4;
  white-space: normal;
  text-align: center;
}

.participants-page :deep(#smazat-ucastnika-tlacitko) {
  border-color: #ef4444;
}

.participants-page :deep(#smazat-ucastnika-tlacitko:hover) {
  background: #fee2e2;
}

.participants-page :deep(#vek-ucastnika-stitek),
.participants-page :deep(.stitek-alergenu-ucastnika),
.participants-page :deep(#widget-kapacity-ucastniku) {
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  height: 26px;
  padding-top: 0;
  padding-bottom: 0;
}

.participant-edit-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.participant-edit-close {
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

.participant-edit-close:hover {
  background: #f1f5f9;
}

.modal-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  box-sizing: border-box;
}

.participants-page :deep(#vek-ucastnika-stitek),
.participants-page :deep(.stitek-alergenu-ucastnika),
.participants-page :deep(#widget-kapacity-ucastniku),
.participants-page :deep(button),
.participant-form :deep(button) {
  border-radius: 8px;
}
</style>
