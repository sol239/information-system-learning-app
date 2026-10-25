<template>
  <div
    class="supervisors-page p-6 flex flex-col gap-6 max-w-7xl mx-auto text-xs"
  >
    <!-- Page header -->
    <div class="flex flex-wrap items-center gap-3">
      <h1 class="system-page-heading" style="--system-heading-color: #a78bfa">
        {{ t("supervisors") }}
      </h1>
      <ModalContainer
        v-model:open="createModalOpen"
        title="Přidat vedoucího"
        class="ml-auto w-fit"
      >
        <button type="button" class="supervisor-button supervisor-button--add">
          <UIcon name="i-heroicons-plus" class="size-4" aria-hidden="true" />
          Přidat vedoucího
        </button>

        <template #header>
          <div class="supervisor-edit-header">
            <div class="flex-1">
              <h2 class="text-base font-semibold text-gray-900">
                Přidat vedoucího
              </h2>
              <p class="mt-1 text-xs text-gray-500">
                Vyplňte údaje nového vedoucího a vyberte jeho turnusy.
              </p>
            </div>
            <button
              type="button"
              class="supervisor-edit-close"
              :aria-label="t('close')"
              @click.stop="createModalOpen = false"
            >
              <UIcon name="i-lucide-x" class="size-4" aria-hidden="true" />
            </button>
          </div>
        </template>

        <template #content>
          <div class="modal-container supervisor-form entity-modal-form">
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
                @action-completed="handleSupervisorCreated"
              />
            </div>
          </div>
        </template>
      </ModalContainer>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-row flex-wrap items-center gap-3">
      <!-- Session filter dropdown -->
      <div class="supervisor-select">
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

      <!-- Total count widget -->
      <ComponentWrapper :component="countBarComponent" />

      <!-- Name/email filter -->
      <UInput
        v-model="filterText"
        icon="i-heroicons-magnifying-glass"
        placeholder="Jméno, email, telefon nebo adresa"
        class="w-56"
        :ui="{ base: 'h-[26px] text-xs' }"
      />

      <!-- Order select -->
      <ComponentWrapper :component="orderComponent" />

      <!-- Add supervisor modal -->
    </div>

    <!-- Supervisors grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="supervisorId in filteredSupervisorIds"
        :key="supervisorId"
        class="bg-white rounded-xl border-2 border-violet-400 p-5 flex flex-col gap-2 hover:shadow-md transition-shadow"
      >
        <!-- Name + age + email + phone + address -->
        <ComponentWrapper
          :component="
            withVars(cardInfoComponent, [
              new Variable('idVedouciho', supervisorId),
            ])
          "
        />

        <!-- Session line -->
        <ComponentWrapper
          :component="
            withVars(sessionBadgeComponent, [
              new Variable('idVedouciho', supervisorId),
            ])
          "
        />

        <!-- Allergen badge -->
        <ComponentWrapper
          :component="
            withVars(allergenBadgeComponent, [
              new Variable('idVedouciho', supervisorId),
            ])
          "
        />

        <!-- Actions -->
        <div class="flex gap-3 pt-1 border-t border-gray-100">
          <ModalContainer
            v-model:open="editModalOpen[supervisorId]"
            title="Upravit vedoucího"
            class="flex-1"
          >
            <button
              type="button"
              class="supervisor-button supervisor-button--edit"
            >
              Upravit vedoucího
            </button>

            <template #header>
              <div class="supervisor-edit-header">
                <div class="flex-1">
                  <h2 class="text-base font-semibold text-gray-900">
                    Upravit vedoucího
                  </h2>
                  <p class="mt-1 text-xs text-gray-500">
                    Upravte údaje vedoucího a jeho přiřazení k turnusům.
                  </p>
                </div>
                <button
                  type="button"
                  class="supervisor-edit-close"
                  :aria-label="t('close')"
                  @click.stop="editModalOpen[supervisorId] = false"
                >
                  <UIcon name="i-lucide-x" class="size-4" aria-hidden="true" />
                </button>
              </div>
            </template>

            <template #content>
              <div class="modal-container supervisor-form entity-modal-form">
                <ComponentWrapper
                  :component="
                    withVars(editVstupJmenoComponent, [
                      new Variable('idVedouciho', supervisorId),
                    ])
                  "
                />
                <ComponentWrapper
                  :component="
                    withVars(editVstupEmailComponent, [
                      new Variable('idVedouciho', supervisorId),
                    ])
                  "
                />
                <ComponentWrapper
                  :component="
                    withVars(editVstupTelefonComponent, [
                      new Variable('idVedouciho', supervisorId),
                    ])
                  "
                />
                <ComponentWrapper
                  :component="
                    withVars(editVstupAdresaComponent, [
                      new Variable('idVedouciho', supervisorId),
                    ])
                  "
                />
                <ComponentWrapper
                  :component="
                    withVars(editVstupVekComponent, [
                      new Variable('idVedouciho', supervisorId),
                    ])
                  "
                />
                <ComponentWrapper
                  :component="
                    withVars(editVstupAlergenyComponent, [
                      new Variable('idVedouciho', supervisorId),
                    ])
                  "
                />
                <ComponentWrapper
                  :component="
                    withVars(editVstupTurnusyComponent, [
                      new Variable('idVedouciho', supervisorId),
                    ])
                  "
                />
                <div class="entity-modal-actions entity-modal-actions--edit">
                  <button
                    type="button"
                    class="entity-modal-cancel"
                    @click="editModalOpen[supervisorId] = false"
                  >
                    Zrušit
                  </button>
                  <ComponentWrapper
                    :component="
                      withVars(editBtnUlozitComponent, [
                        new Variable('idVedouciho', supervisorId),
                      ])
                    "
                    @action-completed="handleSupervisorUpdated(supervisorId)"
                  />
                </div>
              </div>
            </template>
          </ModalContainer>

          <div class="flex-1" @click="reloadAfterDelete">
            <ComponentWrapper
              :component="
                withVars(smazatComponent, [
                  new Variable('idVedouciho', supervisorId),
                ])
              "
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="filteredSupervisorIds.length === 0 && isDbReady"
      class="text-center py-12"
    >
      <UIcon
        name="i-heroicons-academic-cap"
        class="w-16 h-16 mx-auto mb-4 text-gray-400"
      />
      <h3 class="text-xs font-semibold text-gray-900 mb-2">
        {{ t("no_supervisors") }}
      </h3>
      <p class="text-gray-500">{{ t("no_supervisors_description") }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, reactive } from "vue";
import { useI18n } from "vue-i18n";
import ComponentWrapper from "~/components/ComponentWrapper.vue";
import ModalContainer from "~/components/ModalContainer.vue";
import { ComponentVariables, Variable } from "~/model/ComponentVariables";
import { useSystemInputVariables } from "~/composables/useSystemInputVariables";

defineOptions({
  name: 'SystemSupervisorsPage',
})

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function withVars(comp: any, vars: Variable[]) {
  if (!comp) return undefined;
  const clone = Object.create(comp);
  clone.variables = new ComponentVariables();
  clone.variables.generalVariables = vars;
  return clone;
}

const { systemInputVariables } = useSystemInputVariables();
const { t } = useI18n();
const { systemsStore } = useSyncSystemId();

const isDbReady = computed(() => !!systemsStore.selectedSystem?.database?.sqlJsDatabase);
const createModalOpen = ref(false);
const editModalOpen = reactive<Record<number, boolean>>({});

// Display components
const cardInfoComponent = computed(() =>
  systemsStore.getComponentById("karta-vedouciho")
);
const sessionBadgeComponent = computed(() =>
  systemsStore.getComponentById("stitek-turnusu-vedouciho")
);
const allergenBadgeComponent = computed(() =>
  systemsStore.getComponentById("stitek-alergenu-vedouciho")
);
const countBarComponent = computed(() =>
  systemsStore.getComponentById("celkovy-pocet-vedoucich")
);
const orderComponent = computed(() => systemsStore.getComponentById("razeni-vedoucich"));

// Create components
const vstupJmenoComponent = computed(() =>
  systemsStore.getComponentById("vstup-jmeno-vedouciho")
);
const vstupEmailComponent = computed(() =>
  systemsStore.getComponentById("vstup-email-vedouciho")
);
const vstupTelefonComponent = computed(() =>
  systemsStore.getComponentById("vstup-telefon-vedouciho")
);
const vstupAdresaComponent = computed(() =>
  systemsStore.getComponentById("vstup-adresa-vedouciho")
);
const vstupVekComponent = computed(() =>
  systemsStore.getComponentById("vstup-vek-vedouciho")
);
const vstupAlergenyComponent = computed(() =>
  systemsStore.getComponentById("vstup-alergeny-vedouciho")
);
const vstupTurnusyComponent = computed(() =>
  systemsStore.getComponentById("vstup-turnusy-vedouciho")
);
const btnUlozitComponent = computed(() =>
  systemsStore.getComponentById("btn-ulozit-vedouciho")
);

// Edit components
const editVstupJmenoComponent = computed(() =>
  systemsStore.getComponentById("edit-vstup-jmeno-vedouciho")
);
const editVstupEmailComponent = computed(() =>
  systemsStore.getComponentById("edit-vstup-email-vedouciho")
);
const editVstupTelefonComponent = computed(() =>
  systemsStore.getComponentById("edit-vstup-telefon-vedouciho")
);
const editVstupAdresaComponent = computed(() =>
  systemsStore.getComponentById("edit-vstup-adresa-vedouciho")
);
const editVstupVekComponent = computed(() =>
  systemsStore.getComponentById("edit-vstup-vek-vedouciho")
);
const editVstupAlergenyComponent = computed(() =>
  systemsStore.getComponentById("edit-vstup-alergeny-vedouciho")
);
const editVstupTurnusyComponent = computed(() =>
  systemsStore.getComponentById("edit-vstup-turnusy-vedouciho")
);
const editBtnUlozitComponent = computed(() =>
  systemsStore.getComponentById("edit-btn-ulozit-vedouciho")
);

// Delete component
const smazatComponent = computed(() => systemsStore.getComponentById("smazat-vedouciho"));

// Supervisor data
interface SupervisorRow {
  id: number;
  sessionId: number | null;
  name: string;
  email: string;
  phone: string;
  address: string;
  age: number;
  allergenCount: number;
}
const supervisors = ref<SupervisorRow[]>([]);

// Filters
const filterText = ref("");
const selectedSessionId = ref<number | null>(null);

interface SessionItem {
  label: string;
  value: number | null;
}
const sessions = ref<{ id: number; label: string }[]>([]);

const sessionFilterItems = computed<SessionItem[]>(() => [
  { label: t("all_sessions"), value: null },
  ...sessions.value.map((s) => ({ label: s.label, value: s.id })),
]);

const normalizedFilterText = computed(() =>
  filterText.value.trim().toLocaleLowerCase("cs-CZ")
);

const orderBy = computed(() => {
  const value = systemInputVariables.value.find(
    (variable) => variable.name === "razeni_vedoucich"
  )?.variable;
  const normalizedValue = String(value ?? "jmeno");
  return ["jmeno", "vek", "email", "alergeny"].includes(normalizedValue)
    ? normalizedValue
    : "jmeno";
});

const filteredSupervisorIds = computed(() => {
  let filteredSupervisors = supervisors.value;
  if (selectedSessionId.value !== null) {
    filteredSupervisors = filteredSupervisors.filter(
      (s) => s.sessionId === selectedSessionId.value
    );
  }

  if (normalizedFilterText.value) {
    filteredSupervisors = filteredSupervisors.filter(
      (s) =>
        s.name.toLocaleLowerCase("cs-CZ").includes(normalizedFilterText.value) ||
        s.email.toLocaleLowerCase("cs-CZ").includes(normalizedFilterText.value) ||
        s.phone.toLocaleLowerCase("cs-CZ").includes(normalizedFilterText.value) ||
        s.address.toLocaleLowerCase("cs-CZ").includes(normalizedFilterText.value)
    );
  }

  const uniqueSupervisors: SupervisorRow[] = [];
  const seenIds = new Set<number>();
  for (const supervisor of filteredSupervisors) {
    if (seenIds.has(supervisor.id)) continue;
    seenIds.add(supervisor.id);
    uniqueSupervisors.push(supervisor);
  }

  const collator = new Intl.Collator("cs-CZ", { sensitivity: "base", numeric: true });
  uniqueSupervisors.sort((a, b) => {
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

  return uniqueSupervisors.map((supervisor) => supervisor.id);
});

const loadData = async () => {
  const db = systemsStore.selectedSystem?.database;
  if (!db) return;

  try {
    // Load supervisors with their session
    const vResult = await db.query(
      `SELECT
                v.id_vedouciho,
                vt.id_turnusu,
                v.jmeno,
                v.email,
                v.telefon,
                v.adresa,
                v.vek,
                alergeny.pocet_alergenu AS pocet_alergenu
             FROM vedouci v
             LEFT JOIN vedouci_turnusy vt ON v.id_vedouciho = vt.id_vedouciho
             LEFT JOIN (
                SELECT id_vedouciho, COUNT(id_alergenu) AS pocet_alergenu
                FROM vedouci_alergeny
                GROUP BY id_vedouciho
             ) alergeny ON alergeny.id_vedouciho = v.id_vedouciho
             ORDER BY vt.id_turnusu, v.id_vedouciho`
    );
    if (vResult.data?.[0]?.values) {
      supervisors.value = vResult.data[0].values.map((row) => ({
        id: Number(row[0]),
        sessionId: row[1] !== null ? Number(row[1]) : null,
        name: String(row[2] ?? ""),
        email: String(row[3] ?? ""),
        phone: String(row[4] ?? ""),
        address: String(row[5] ?? ""),
        age: Number(row[6] ?? 0),
        allergenCount: Number(row[7] ?? 0),
      }));
    }

    // Load sessions for the filter dropdown
    const sResult = await db.query(`SELECT id_turnusu FROM turnusy ORDER BY id_turnusu`);
    if (sResult.data?.[0]?.values) {
      sessions.value = sResult.data[0].values.map((row) => ({
        id: Number(row[0]),
        label: `Turnus ${row[0]}`,
      }));
    }
  } catch (e) {
    console.error("Failed to load supervisors:", e);
  }
};

const reloadAfterDelete = () => {
  window.setTimeout(() => {
    loadData();
  }, 50);
};

const handleSupervisorCreated = () => {
  createModalOpen.value = false;
  window.setTimeout(() => {
    loadData();
  }, 50);
};

const handleSupervisorUpdated = (supervisorId: number) => {
  editModalOpen[supervisorId] = false;
  window.setTimeout(() => {
    loadData();
  }, 50);
};

watch(
  () => systemsStore.selectedSystem?.database?.sqlJsDatabase,
  (db) => {
    if (db) loadData();
  },
  { immediate: true }
);

onMounted(() => {
  if (systemsStore.selectedSystem?.database?.sqlJsDatabase) loadData();
});
</script>

<style scoped>
.supervisors-page :deep(#kontaktni-udaje-oddeleni) {
    border-top-color: #9ca3af;
}

.supervisors-page :deep(.component-html :where(*):not(#jmeno-vedouciho)),
.supervisors-page :deep(button),
.supervisors-page :deep(input),
.supervisors-page :deep(select),
.supervisor-form :deep(.component-html *),
.supervisor-form :deep(button),
.supervisor-form :deep(input),
.supervisor-form :deep(select),
.supervisor-form :deep(label) {
    font-size: 12px;
}

.supervisor-select,
.supervisors-page :deep(#razeni-vedoucich) {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 26px;
    box-sizing: border-box;
    padding: 0 12px;
    border: 1px solid #7c3aed;
    border-radius: 8px;
    background: #fff;
}

.supervisor-select select {
    border: 0;
    background: transparent;
    color: #111827;
    font-size: 12px;
    cursor: pointer;
}

.supervisor-select:focus-within {
    outline: 2px solid #7c3aed;
    outline-offset: 2px;
}

.supervisor-button,
.supervisors-page :deep(#smazat-vedouciho-tlacitko) {
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

.supervisor-button--add {
    border-color: #22c55e;
    background: #f0fdf4;
    color: #15803d;
}

.supervisor-button--add:hover {
    background: #dcfce7;
}

.supervisor-button--edit {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #2563eb;
}

.supervisor-button--edit:hover {
    background: #dbeafe;
}

.supervisor-button--edit,
.supervisors-page :deep(#smazat-vedouciho-tlacitko) {
    height: auto;
    min-height: 26px;
    padding: 6px 14px;
    line-height: 1.4;
    white-space: normal;
    text-align: center;
}

.supervisors-page :deep(#smazat-vedouciho-tlacitko) {
    border-color: #ef4444;
}

.supervisors-page :deep(#smazat-vedouciho-tlacitko:hover) {
    background: #fee2e2;
}

.supervisors-page :deep(#vek-vedouciho-stitek),
.supervisors-page :deep(.stitek-alergenu-vedouciho),
.supervisors-page :deep(#widget-poctu-vedoucich) {
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    height: 26px;
    padding-top: 0;
    padding-bottom: 0;
}

.supervisor-edit-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e2e8f0;
}

.supervisor-edit-close {
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

.supervisor-edit-close:hover {
    background: #f1f5f9;
}

.modal-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1rem;
    box-sizing: border-box;
}

.supervisors-page :deep(#vek-vedouciho-stitek),
.supervisors-page :deep(.stitek-alergenu-vedouciho),
.supervisors-page :deep(#widget-poctu-vedoucich),
.supervisors-page :deep(button),
.supervisor-form :deep(button) {
    border-radius: 8px;
}

.supervisors-page :deep(#jmeno-vedouciho) { font-size: 16px; }
</style>
