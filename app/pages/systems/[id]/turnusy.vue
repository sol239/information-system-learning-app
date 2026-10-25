<template>
  <div class="sessions-page p-6 flex flex-col gap-8 max-w-7xl mx-auto">
    <div class="flex flex-row flex-wrap items-center gap-3 mb-4">
      <h1 class="system-page-heading" style="--system-heading-color: #a16207">
        {{ t("sessions") }}
      </h1>

      <ModalContainer
        v-model:open="createModalOpen"
        title="Přidat turnus"
        class="ml-auto w-fit"
      >
        <button type="button" class="session-button session-button--add">
          <UIcon name="i-heroicons-plus" class="size-4" aria-hidden="true" />
          Přidat turnus
        </button>

        <template #header>
          <div class="session-edit-header">
            <div class="flex-1">
              <h2 class="text-base font-semibold text-gray-900">
                Přidat turnus
              </h2>
              <p class="mt-1 text-xs text-gray-500">
                Vyplňte termín a kapacitu nového turnusu.
              </p>
            </div>
            <button
              type="button"
              class="session-edit-close"
              :aria-label="t('close')"
              @click.stop="createModalOpen = false"
            >
              <UIcon name="i-lucide-x" class="size-4" aria-hidden="true" />
            </button>
          </div>
        </template>

        <template #content>
          <div class="modal-container entity-modal-form">
            <ComponentWrapper :component="dateFromInputComponent" />
            <ComponentWrapper :component="dateToInputComponent" />
            <ComponentWrapper :component="capacityInputComponent" />
            <div class="entity-modal-actions">
              <button
                type="button"
                class="entity-modal-cancel"
                @click="createModalOpen = false"
              >
                Zrušit
              </button>
              <ComponentWrapper
                :component="saveButtonComponent"
                @action-completed="handleSessionCreated"
              />
            </div>
          </div>
        </template>
      </ModalContainer>
    </div>

    <!-- Sessions Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="sessionId in sessionIds"
        :key="sessionId"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col gap-5"
      >
        <!-- Session Header: title + status badge -->
        <div
          class="flex items-center justify-between border-b border-gray-100 pb-4"
        >
          <h3 class="text-base font-semibold text-gray-900">
            {{ t("session") }} {{ sessionId }}
          </h3>
          <ComponentWrapper
            :component="
              withVars(statusBadgeComponent, [
                new Variable('idTurnusu', sessionId),
              ])
            "
          />
        </div>

        <!-- Action buttons -->
        <div class="flex gap-3">
          <ModalContainer
            v-model:open="editModalOpen[sessionId]"
            :title="`Upravit turnus ${sessionId}`"
            class="flex-1"
          >
            <button type="button" class="session-button session-button--edit">
              Upravit turnus
            </button>

            <template #header>
              <div class="session-edit-header">
                <div class="flex-1">
                  <h2 class="text-base font-semibold text-gray-900">
                    Upravit turnus {{ sessionId }}
                  </h2>
                  <p class="mt-1 text-xs text-gray-500">
                    Upravte termín a kapacitu turnusu.
                  </p>
                </div>
                <button
                  type="button"
                  class="session-edit-close"
                  aria-label="Zavřít"
                  @click.stop="editModalOpen[sessionId] = false"
                >
                  <UIcon name="i-lucide-x" class="size-4" aria-hidden="true" />
                </button>
              </div>
            </template>

            <template #content>
              <div class="modal-container entity-modal-form">
                <ComponentWrapper
                  :component="
                    withVars(editDateFromInputComponent, [
                      new Variable('idTurnusu', sessionId),
                    ])
                  "
                />
                <ComponentWrapper
                  :component="
                    withVars(editDateToInputComponent, [
                      new Variable('idTurnusu', sessionId),
                    ])
                  "
                />
                <ComponentWrapper
                  :component="
                    withVars(editCapacityInputComponent, [
                      new Variable('idTurnusu', sessionId),
                    ])
                  "
                />
                <div class="entity-modal-actions entity-modal-actions--edit">
                  <button
                    type="button"
                    class="entity-modal-cancel"
                    @click="editModalOpen[sessionId] = false"
                  >
                    Zrušit
                  </button>
                  <ComponentWrapper
                    :component="
                      withVars(editSaveButtonComponent, [
                        new Variable('idTurnusu', sessionId),
                      ])
                    "
                    @action-completed="handleSessionUpdated(sessionId)"
                  />
                </div>
              </div>
            </template>
          </ModalContainer>

          <div class="flex-1" @click="reloadSessionsAfterDelete">
            <ComponentWrapper
              :component="
                withVars(deleteSessionComponent, [
                  new Variable('idTurnusu', sessionId),
                ])
              "
            />
          </div>
        </div>

        <!-- Date range + day count -->
        <div class="session-dates flex flex-col gap-3">
          <ComponentWrapper
            :component="
              withVars(dateRangeComponent, [
                new Variable('idTurnusu', sessionId),
              ])
            "
          />
          <ComponentWrapper
            :component="
              withVars(daysComponent, [new Variable('idTurnusu', sessionId)])
            "
          />
        </div>

        <!-- Capacity progress bar -->
        <ComponentWrapper
          :component="
            withVars(capacityBarComponent, [
              new Variable('idTurnusu', sessionId),
            ])
          "
        />

        <!-- Divider -->
        <hr class="border-gray-100" />

        <!-- Participants list -->
        <ComponentWrapper
          :component="
            withVars(participantsCountBadgeComponent, [
              new Variable('idTurnusu', sessionId),
            ])
          "
        />
        <ComponentWrapper
          :component="
            withVars(participantsListComponent, [
              new Variable('idTurnusu', sessionId),
            ])
          "
        />

        <!-- Supervisors list -->
        <ComponentWrapper
          :component="
            withVars(supervisorsCountBadgeComponent, [
              new Variable('idTurnusu', sessionId),
            ])
          "
        />
        <ComponentWrapper
          :component="
            withVars(supervisorsListComponent, [
              new Variable('idTurnusu', sessionId),
            ])
          "
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="sessionIds.length === 0 && isDbReady" class="text-center py-12">
      <UIcon
        name="i-heroicons-calendar-x-mark"
        class="w-16 h-16 mx-auto mb-4 text-gray-400"
      />
      <h3 class="text-xl font-semibold text-gray-900 mb-2">
        {{ t("no_sessions") }}
      </h3>
      <p class="text-gray-600 mb-4">{{ t("no_sessions_description") }}</p>
      <div class="flex justify-center">
        <AddSessionButton @session-created="loadSessions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, reactive } from "vue";
import { useI18n } from "vue-i18n";
import ComponentWrapper from "~/components/ComponentWrapper.vue";
import { ComponentVariables, Variable } from "~/model/ComponentVariables";

defineOptions({
  name: "SystemSessionsPage",
});

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function withVars(comp: any, vars: Variable[]) {
  if (!comp) return undefined;
  const clone = Object.create(comp);
  clone.variables = new ComponentVariables();
  clone.variables.generalVariables = vars;
  return clone;
}

const { t } = useI18n();
const { systemsStore } = useSyncSystemId();

const sessionIds = ref<number[]>([]);
const createModalOpen = ref(false);
const editModalOpen = reactive<Record<number, boolean>>({});
const isDbReady = computed(
  () => !!systemsStore.selectedSystem?.database?.sqlJsDatabase,
);

// Per-card components â€“ each instance receives sessionId via generalVariables
const statusBadgeComponent = computed(() =>
  systemsStore.getComponentById("stitek-stavu-turnusu"),
);
const dateRangeComponent = computed(() =>
  systemsStore.getComponentById("datum-turnusu"),
);
const daysComponent = computed(() =>
  systemsStore.getComponentById("pocet-dni-turnusu"),
);
const capacityBarComponent = computed(() =>
  systemsStore.getComponentById("kapacita-turnusu"),
);
const participantsCountBadgeComponent = computed(() =>
  systemsStore.getComponentById("stitek-poctu-ucastniku-turnusu"),
);
const participantsListComponent = computed(() =>
  systemsStore.getComponentById("seznam-ucastniku-turnusu"),
);
const supervisorsCountBadgeComponent = computed(() =>
  systemsStore.getComponentById("stitek-poctu-vedoucich-turnusu"),
);
const supervisorsListComponent = computed(() =>
  systemsStore.getComponentById("seznam-vedoucich-turnusu"),
);
const deleteSessionComponent = computed(() =>
  systemsStore.getComponentById("smazat-turnus"),
);
const dateFromInputComponent = computed(() =>
  systemsStore.getComponentById("vstup-datum-od"),
);
const dateToInputComponent = computed(() =>
  systemsStore.getComponentById("vstup-datum-do"),
);
const capacityInputComponent = computed(() =>
  systemsStore.getComponentById("vstup-kapacita"),
);
const saveButtonComponent = computed(() =>
  systemsStore.getComponentById("btn-ulozit"),
);
const editDateFromInputComponent = computed(() =>
  systemsStore.getComponentById("edit-vstup-datum-od"),
);
const editDateToInputComponent = computed(() =>
  systemsStore.getComponentById("edit-vstup-datum-do"),
);
const editCapacityInputComponent = computed(() =>
  systemsStore.getComponentById("edit-vstup-kapacita"),
);
const editSaveButtonComponent = computed(() =>
  systemsStore.getComponentById("edit-btn-ulozit"),
);

// Fetch session IDs
const loadSessions = async () => {
  const db = systemsStore.selectedSystem?.database;
  if (!db) return;

  try {
    const result = await db.query(
      "SELECT id_turnusu FROM turnusy ORDER BY id_turnusu",
    );
    if (result.data && result.data[0] && result.data[0].values) {
      sessionIds.value = result.data[0].values.map((row) => Number(row[0]));
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

watch(
  () => systemsStore.selectedSystem?.database?.sqlJsDatabase,
  (newDb) => {
    if (newDb) {
      loadSessions();
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (systemsStore.selectedSystem?.database?.sqlJsDatabase) {
    loadSessions();
  }
});
</script>

<style scoped>
.sessions-page :deep(#smazat-turnus-tlacitko),
.sessions-page :deep(#stitek-vedoucich-turnusu),
.sessions-page :deep(.stitek-stavu-turnusu) {
  border-radius: 8px;
}

.sessions-page :deep(.stitek-stavu-turnusu),
.sessions-page :deep(.pocet-dni-turnusu-stitek),
.sessions-page :deep(.datum-turnusu-stitek) {
  box-sizing: border-box;
  height: 26px;
}

.session-dates :deep(.component-wrapper),
.session-dates :deep(.content-container),
.session-dates :deep(.pocet-dni-turnusu-stitek),
.session-dates :deep(.datum-turnusu-stitek) {
  width: 100%;
}

.sessions-page :deep(#smazat-turnus-tlacitko) {
  cursor: pointer;
  transition: background-color 0.15s;
}

.sessions-page :deep(#smazat-turnus-tlacitko:hover) {
  background: #fee2e2;
}

.session-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.15s;
}

.session-button--add {
  box-sizing: border-box;
  height: 26px;
  padding-top: 0;
  padding-bottom: 0;
  border-color: #22c55e;
  background: #f0fdf4;
  color: #15803d;
}

.session-button--add:hover {
  background: #dcfce7;
}

.session-button--edit {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #2563eb;
}

.session-button--edit:hover {
  background: #dbeafe;
}

.modal-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  box-sizing: border-box;
}

.session-edit-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.session-edit-close {
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

.session-edit-close:hover {
  background: #f1f5f9;
}
</style>
