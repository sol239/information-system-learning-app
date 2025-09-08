import { defineStore } from 'pinia'
import { ref } from 'vue'
import { InformationSystem } from '~/model/InformationSystem'
import { ComponentHandler } from '~/composables/ComponentHandler'
import { useSelectedTaskStore } from './useSelectedTaskStore'
import { Session } from '~/model/Session'
import { Participant } from '~/model/Participant'
import { Supervisor } from '~/model/Supervisor'

export const useSelectedSystemStore = defineStore('selectedSystem', () => {
  // State
  const selectedId = ref<number | null>(null)
  const selectedSystem = ref<InformationSystem | null>(null)
  const sessions = ref<Session[]>([])
  const supervisors = ref<Supervisor[]>([])
  const dbNumber = ref<number>(0)

  // Actions
  function select(id: number) {
    selectedId.value = id
    // Automatically load error components when system is selected
    loadErrorComponents()
    // Load sessions if system is already available
    if (selectedSystem.value?.db) {
      loadSessions()
    }
  }

  function incrementDbNumber() {
    dbNumber.value += 1
  }

  function getDbNumber() {
    return dbNumber.value
  }

  function loadErrorComponents() {
    if (selectedId.value !== null) {
      const selectedTaskStore = useSelectedTaskStore()
      ComponentHandler.getComponentMap(selectedTaskStore.currentRound)
    }
  }

  function clear() {
    selectedId.value = null
  }

  function setSelectedSystem(system: InformationSystem) {
    selectedSystem.value = system
    // Load error components when system is set
    loadErrorComponents()
    // Load sessions when system is set
    if (system.db) {
      loadSessions()
    }
  }

  async function initializeDb() {
    if (selectedSystem.value) {
      console.log("Reinitializing selected system database.")
      const dbHandler = await InformationSystem.databaseInitStatic(selectedSystem.value.configData);
      selectedSystem.value.db = dbHandler;
      console.log("Selected system database initialized:", selectedSystem.value.db.query("SELECT * FROM účastníci").results);
      // Load error components after database initialization
      loadErrorComponents()
      // Load sessions after db init
      loadSessions()
    }
  }

  function loadSessions() {
    if (!selectedSystem.value?.db) {
      return
    }

    try {
      const sessionsTable = selectedSystem.value.db.getTableName('sessions')
      const participantsTable = selectedSystem.value.db.getTableName('participants')
      const sessionsParticipantsTable = selectedSystem.value.db.getTableName('sessions_participants')
      const supervisorsTable = selectedSystem.value.db.getTableName('supervisors')
      const sessionsSupervisorsTable = selectedSystem.value.db.getTableName('sessions_supervisors')

      const sessionsQuery = selectedSystem.value.db.query(`SELECT * FROM ${sessionsTable} ORDER BY session_id`)
      if (sessionsQuery.success) {
        const sessionsData = sessionsQuery.results.map((row: any) => {
          const participantsQuery = selectedSystem.value!.db.query(
            `SELECT p.* FROM ${participantsTable} p
             JOIN ${sessionsParticipantsTable} sp ON p.participant_id = sp.participant_id
             WHERE sp.session_id = ?`,
            [row.session_id]
          )

          const participants = participantsQuery?.success ?
            participantsQuery.results.map((p: any) => new Participant(
              p.participant_id,
              p.name,
              p.email,
              p.personal_number,
              p.phone,
              p.address,
              p.age
            )) : []

          return new Session(
            row.session_id,
            new Date(row.from_date),
            new Date(row.to_date),
            row.capacity,
            participants
          )
        })

        sessions.value = sessionsData
      }

      const supervisorsQuery = selectedSystem.value.db.query(`SELECT * FROM ${supervisorsTable} ORDER BY supervisor_id`)
      if (supervisorsQuery.success) {
        const supervisorsData = supervisorsQuery.results.map((row: any) => new Supervisor(
          row.supervisor_id,
          row.name,
          row.email,
          row.personal_number,
          row.phone,
          row.address,
          row.age
        ))
        supervisors.value = supervisorsData
      }

      const sessionsSupervisorsQuery = selectedSystem.value.db.query(`SELECT * FROM ${sessionsSupervisorsTable}`)
      if (sessionsSupervisorsQuery.success) {
        sessionsSupervisorsQuery.results.forEach((row: any) => {
          const supervisor = supervisors.value.find(s => s.id === row.supervisor_id)
          if (supervisor) {
            supervisor.sessions.push(row.session_id)
          }
        })
      }

    } catch (error) {
      console.error('Error loading data from database:', error)
    }
  }

  return {
    selectedId,
    select,
    clear,
    setSelectedSystem,
    selectedSystem,
    initializeDb,
    loadErrorComponents,
    sessions,
    supervisors,
    loadSessions,
    dbNumber,
    incrementDbNumber,
    getDbNumber
  }
}, {
  persist: {
    afterHydrate: async (context) => {
      await context.store.initializeDb()
    }
  }
})
