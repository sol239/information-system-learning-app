import { Component } from "~/model/Component";

/**
 * Class encapsulating the management of components in the system. 
 */
export class ComponentManager {
  public static initializeComponents() {
    const componentCodeStore = useComponentCodeStore()
    const selectedSystemStore = useSelectedSystemStore();

    const statsMealsHtml = `
  <div class="stat-card">
    <div class="stat-icon">🍽️</div>
    <div class="stat-content">
      <div class="stat-number">{{ mealsCount }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
`
    const statsMealsSql = `SELECT COUNT(*) as count FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('meals')}`

    const statsMealsNavigateJs = `
selectedTableStore.select('jídla');
navigateTo({
  path: \`/system/\${systemId}/database\`,
});
`

    const statsParticipantsNavigateJs = `
selectedTableStore.select('účastníci');
navigateTo({
  path: \`/system/\${systemId}/participants\`,
});
`


    const statsSupervisorsNavigateJs = `
selectedTableStore.select('vedoucí');
navigateTo({
  path: \`/system/\${systemId}/supervisors\`,
});
`


    const statsSessionsNavigateJs = `
selectedTableStore.select('turnusy');
navigateTo({
  path: \`/system/\${systemId}/sessions\`,
});
`

    const statsParticipantsHtml = `
  <div class="stat-card">
    <div class="stat-icon">👥</div>
    <div class="stat-content">
      <div class="stat-number">{{ participantsCount }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
`
    const statsParticipantsSql = `SELECT COUNT(*) as count FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('participants')}`

    const statsSessionsHtml = `
  <div class="stat-card">
    <div class="stat-icon">📅</div>
    <div class="stat-content">
      <div class="stat-number">{{ sessionsCount }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
`
    const statsSessionsSql = `SELECT COUNT(*) as count FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions')}`

    const statsSupervisorsHtml = `
  <div class="stat-card">
    <div class="stat-icon">👨‍🏫</div>
    <div class="stat-content">
      <div class="stat-number">{{ supervisorsCount }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
`
    const statsSupervisorsSql = `SELECT COUNT(*) as count FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('supervisors')}`

    /*
    componentCodeStore.updateDefaultComponentCode("stats-meals-html.vue", statsMealsHtml)
    componentCodeStore.updateDefaultComponentCode("stats-meals-sql.vue", statsMealsSql)
    componentCodeStore.updateDefaultComponentCode("stats-meals-js.vue", statsMealsNavigateJs)
    
    componentCodeStore.updateDefaultComponentCode("stats-participants-html.vue", statsParticipantsHtml)
    componentCodeStore.updateDefaultComponentCode("stats-participants-sql.vue", statsParticipantsSql)
    componentCodeStore.updateDefaultComponentCode("stats-participants-js.vue", statsParticipantsNavigateJs)
    
    componentCodeStore.updateDefaultComponentCode("stats-sessions-html.vue", statsSessionsHtml)
    componentCodeStore.updateDefaultComponentCode("stats-sessions-sql.vue", statsSessionsSql)
    componentCodeStore.updateDefaultComponentCode("stats-sessions-js.vue", statsSessionsNavigateJs)
    
    componentCodeStore.updateDefaultComponentCode("stats-supervisors-html.vue", statsSupervisorsHtml)
    componentCodeStore.updateDefaultComponentCode("stats-supervisors-sql.vue", statsSupervisorsSql)
    componentCodeStore.updateDefaultComponentCode("stats-supervisors-js.vue", statsSupervisorsNavigateJs)
    
    componentCodeStore.resetComponentCode("stats-meals-html.vue")
    componentCodeStore.resetComponentCode("stats-meals-sql.vue")
    componentCodeStore.resetComponentCode("stats-meals-js.vue")
    
    componentCodeStore.resetComponentCode("stats-participants-html.vue")
    componentCodeStore.resetComponentCode("stats-participants-sql.vue")
    componentCodeStore.resetComponentCode("stats-participants-js.vue")
    
    componentCodeStore.resetComponentCode("stats-sessions-html.vue")
    componentCodeStore.resetComponentCode("stats-sessions-sql.vue")
    componentCodeStore.resetComponentCode("stats-sessions-js.vue")
    
    componentCodeStore.resetComponentCode("stats-supervisors-html.vue")
    componentCodeStore.resetComponentCode("stats-supervisors-sql.vue")
    componentCodeStore.resetComponentCode("stats-supervisors-js.vue")
    */

    // New instances created from the existing code above
    const statsMealsComponent = new Component({
      id: "stats-meals",
      name: "Stats Meals",
      description: `Component for meals stats. SQL: ${statsMealsSql}`,
      html: { "html": statsMealsHtml },
      css: { "css": "" },
      js: { "js": statsMealsNavigateJs },
      sql: { "sql": statsMealsSql },
      additionals: {}
    });

    const statsParticipantsComponent = new Component({
      id: "stats-participants",
      name: "Stats Participants",
      description: `Component for participants stats. SQL: ${statsParticipantsSql}`,
      html: { "html": statsParticipantsHtml },
      css: { "css": "" },
      js: { "js": statsParticipantsNavigateJs },
      sql: { "sql": statsParticipantsSql },
      additionals: {}
    });

    const statsSessionsComponent = new Component({
      id: "stats-sessions",
      name: "Stats Sessions",
      description: `Component for sessions stats. SQL: ${statsSessionsSql}`,
      html: { "html": statsSessionsHtml },
      css: { "css": "" },
      js: { "js": statsSessionsNavigateJs },
      sql: { "sql": statsSessionsSql },
      additionals: {}
    });

    const statsSupervisorsComponent = new Component({
      id: "stats-supervisors",
      name: "Stats Supervisors",
      description: `Component for supervisors stats. SQL: ${statsSupervisorsSql}`,
      html: { "html": statsSupervisorsHtml },
      css: { "css": "" },
      js: { "js": statsSupervisorsNavigateJs },
      sql: { "sql": statsSupervisorsSql },
      additionals: {}
    });

    // participants.vue participants-capacity-count
    const participantsCapacityCountComponentAll = new Component({
      id: "participants-capacity-count-all",
      name: "Participants Capacity Count (All)",
      description: `Badge showing the capacity count of all sessions.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": `Math.round(currentCount / totalCapacity * 100)` },
      sql: {
        "sql-1": `SELECT SUM(capacity) as count FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions')}`,
        "sql-2": `
            SELECT COUNT(*) as count
            FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('participants')} p
            JOIN ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions_participants')} sp ON p.participant_id = sp.participant_id
        `
      },
      additionals: {}
    });

    const tableCountBadgeComponent = new Component({
      id: "dashboard-table-count-badge",
      name: "Dashboard Table Count Badge",
      description: `Badge showing the count of all tables.`,
      html: {
        "html": `
        <div class="badge primary large">
      <span class="icon">🗃️</span>
      <span>{{ label }}: {{ tableCount }}</span>
    </div>
    ` },
      css: {
        "css": `.badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: bold;
    cursor: pointer;
  }

  .badge.primary {
    background-color: #3b82f6; /* Blue */
    color: white;
  }

  .badge.large {
    font-size: 1.25rem;
  }

  .icon {
    font-size: 1.5rem;
  }
` },
      js: { "js": `` },
      sql: {
        "sql": `SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`,
      },
      additionals: {}
    });

    const sessionDayCountBadgeComponent = new Component({
      id: "session-day-count-badge",
      name: "Session Day Count Badge",
      description: `Badge showing the count of days for a session.`,
      html: {
        "html": `
        <div class="badge primary large">
      <span class="icon">📅</span>
      <span>{{ label }}: {{ dayCount }}</span>
    </div>
    ` },
      css: {
        "css": `.badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: bold;
    cursor: pointer;
  }

  .badge.primary {
    background-color: #10b981; /* Green */
    color: white;
  }

  .badge.large {
    font-size: 1.25rem;
  }

  .icon {
    font-size: 1.5rem;
  }
` },
      js: { "js": `const timeDifference = end.getTime() - start.getTime(); return Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;` },
      sql: {
        "sql": `SELECT from_date, to_date FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions')} WHERE session_id = ?`,
      },
      additionals: {}
    });

    const sessionDateRangeComponent = new Component({
      id: "session-date-range",
      name: "Session Date Range",
      description: `Component showing the date range for a session.`,
      html: {
        "html": `
        <div class="date-range">
      <span class="calendar-icon">📅</span>
      <span class="date-text">{{ dateRange }}</span>
    </div>
    ` },
      css: {
        "css": `.date-range {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    background-color: #f3f4f6;
  }

  .calendar-icon {
    font-size: 1rem;
  }

  .date-text {
    white-space: nowrap;
  }
` },
      js: { "js": `` },
      sql: {
        "sql": `SELECT from_date, to_date FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions')} WHERE session_id = ?`,
      },
      additionals: {}
    });

    const sessionCapacitySectionComponent = new Component({
      id: "session-capacity-section",
      name: "Session Capacity Section",
      description: `Component showing the capacity and participant count for a session with a progress bar.`,
      html: {
        "html": `
        <div class="capacity-section">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">{{ label }}</span>
        <span class="text-sm text-gray-600">{{ participantCount }}/{{ capacity }}</span>
      </div>
      <div class="capacity-bar">
        <div class="capacity-fill" style="width: {{ percentage }}%; background-color: {{ color }}"></div>
      </div>
      <div class="text-xs text-gray-500 mt-1"> {{ percentage }}% {{ occupied }}</div>
    </div>
    ` },
      css: {
        "css": `.capacity-section {
    margin-bottom: 1.5rem;
  }

  .capacity-bar {
    width: 100%;
    background-color: #e5e7eb;
    border-radius: 9999px;
    height: 0.5rem;
    overflow: hidden;
  }

  .capacity-fill {
    height: 100%;
    transition: all 0.5s ease-out;
    border-radius: 9999px;
  }
` },
      js: { "js": `if (capacity === 0) return 0; return Math.round((participantCount / capacity) * 100);` },
      sql: {
        "sql-1": `SELECT capacity FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions')} WHERE session_id = ?;`,
        "sql-2": `SELECT COUNT(*) as count FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions_participants')} WHERE session_id = ?`,
      },
      additionals: {}
    });

    const sessionParticipantsSectionComponent = new Component({
      id: "session-participants-section",
      name: "Session Participants Section",
      description: `Component showing the list of participants for a session with avatars and details.`,
      html: {
        "html": ``
      },
      css: {
        "css": ``
      },
      js: { "js": `` },
      sql: {
        "sql-1": `SELECT p.* FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('participants')} p JOIN ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions_participants')} sp ON p.participant_id = sp.participant_id WHERE sp.session_id = ?`,
        "sql-2": `SELECT COUNT(*) as count FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('participants')} p JOIN ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions_participants')} sp ON p.participant_id = sp.participant_id WHERE sp.session_id = ?`
      },
      additionals: {}
    });

    const sessionSupervisorsSectionComponent = new Component({
      id: "session-supervisors-section",
      name: "Session Supervisors Section",
      description: `Component showing the list of supervisors for a session with avatars and contact details.`,
      html: {
        "html": `` },
      css: {
        "css": `` },
      js: { "js": `` },
      sql: {
        "sql-1": `SELECT s.* FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('supervisors')} s JOIN ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions_supervisors')} ss ON s.supervisor_id = ss.supervisor_id WHERE ss.session_id = ?`,
        "sql-2": `SELECT COUNT(*) as count FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('supervisors')} s JOIN ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions_supervisors')} ss ON s.supervisor_id = ss.supervisor_id WHERE ss.session_id = ?`,
      },
      additionals: {}
    });

    const sessionDeleteButtonComponent = new Component({
      id: "session-delete-button",
      name: "Session Delete Button",
      description: `Button component for deleting a session with confirmation and proper cleanup.`,
      html: {
        "html": `
        <button class="delete-button" onclick="handleDelete()">
      <span class="delete-icon">🗑️</span>
      <span class="delete-text">{{ deleteLabel }}</span>
    </button>
    ` },
      css: {
        "css": `.delete-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #dc2626;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .delete-button:hover {
    background-color: #b91c1c;
  }

  .delete-icon {
    font-size: 1rem;
  }

  .delete-text {
    white-space: nowrap;
  }
` },
      js: { "js": `` },
      sql: {
        "sql-1": `DELETE FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions_participants')} WHERE session_id = ?`,
        "sql-2": `DELETE FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions_supervisors')} WHERE session_id = ?`,
        "sql-3": `DELETE FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions')} WHERE session_id = ?`,
      },
      additionals: {}
    });

    const sessionStatusBadgeComponent = new Component({
      id: "session-status-badge",
      name: "Session Status Badge",
      description: `Badge component showing the status of a session based on capacity and participant count.`,
      html: {
        "html": `
        <div class="status-badge status-{{ color }}">
      <span class="status-text">{{ status }}</span>
    </div>
    ` },
      css: {
        "css": `.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status-badge.status-red {
    background-color: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }

  .status-badge.status-yellow {
    background-color: #fffbeb;
    color: #d97706;
    border: 1px solid #fde68a;
  }

  .status-badge.status-green {
    background-color: #f0fdf4;
    color: #16a34a;
    border: 1px solid #bbf7d0;
  }

  .status-badge.status-neutral {
    background-color: #f9fafb;
    color: #6b7280;
    border: 1px solid #e5e7eb;
  }

  .status-text {
    white-space: nowrap;
  }
` },
      js: { "js": `if (capacity === 0) return 0; return Math.round((participantCount / capacity) * 100);` },
      sql: {
        "sql-1": `SELECT capacity FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions')} WHERE session_id = ?;`,
        "sql-2": `SELECT COUNT(*) as count FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions_participants')} WHERE session_id = ?`,
      },
      additionals: {}
    });

    /*
    const participantsCapacityCountComponent = new Component({
      id: "participants-capacity-count",
      name: "Participants Capacity Count",
      description: `Badge showing the capacity count of the selected session.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": `Math.round(currentCount / totalCapacity * 100)` },
      sql: {
        "sql-1": `SELECT capacity as count FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions')} WHERE session_id = ?`,
        "sql-2": `
            SELECT COUNT(*) as count
            FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('participants')} p
            JOIN ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions_participants')} sp ON p.participant_id = sp.participant_id
            WHERE sp.session_id = ?
        `
      },
      additionals: {}
    });
    */

    // Participants page components
    const participantsCapacityCountComponent = new Component({
      id: "participants-capacity-count",
      name: "Participants Capacity Count",
      description: `Component for displaying capacity count.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: {
        "sql-total-all": `SELECT SUM(capacity) as count FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions')}`,
        "sql-current-all": `
            SELECT COUNT(*) as count
            FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('participants')} p
            JOIN ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions_participants')} sp ON p.participant_id = sp.participant_id
        `,
        "sql-total-session": `SELECT capacity as count FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions')} WHERE session_id = ?`,
        "sql-current-session": `
            SELECT COUNT(*) as count
            FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('participants')} p
            JOIN ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions_participants')} sp ON p.participant_id = sp.participant_id
            WHERE sp.session_id = ?
        `
      },
      additionals: {}
    });

    const participantsCapacityPercentageComponent = new Component({
      id: "participants-capacity-percentage",
      name: "Participants Capacity Percentage",
      description: `Component for displaying capacity percentage.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "Math.round(currentCount / totalCapacity * 100)" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsPageCount1Component = new Component({
      id: "participants-page-count-1",
      name: "Participants Page Count 1",
      description: `Component for displaying page count.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "Math.ceil(totalItems / itemsPerPage)" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsPageCount2Component = new Component({
      id: "participants-page-count-2",
      name: "Participants Page Count 2",
      description: `Component for displaying participant count.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsFilterResetComponent = new Component({
      id: "participants-filter-reset",
      name: "Participants Filter Reset",
      description: `Component for filter reset button.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsFilterInputComponent = new Component({
      id: "participants-filter-input",
      name: "Participants Filter Input",
      description: `Component for filter input.`,
      html: { "html": "" },
      css: { "css": "" },
      js: {
        "js": `(p.name && p.name.toLowerCase().includes(text)) ||
               (p.email && p.email.toLowerCase().includes(text)) ||
               (p.phone && p.phone.toLowerCase().includes(text)) ||
               (p.address && p.address.toLowerCase().includes(text)) ||
               (p.sessions && getSessionNames(p.sessions).toLowerCase().includes(text))`
      },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsAddNameComponent = new Component({
      id: "participants-add-name",
      name: "Participants Add Name",
      description: `Component for add name input.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsAddEmailComponent = new Component({
      id: "participants-add-email",
      name: "Participants Add Email",
      description: `Component for add email input.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsAddPersonalNumberComponent = new Component({
      id: "participants-add-personal_number",
      name: "Participants Add Personal Number",
      description: `Component for add personal number input.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsAddPhoneComponent = new Component({
      id: "participants-add-phone",
      name: "Participants Add Phone",
      description: `Component for add phone input.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsAddAddressComponent = new Component({
      id: "participants-add-address",
      name: "Participants Add Address",
      description: `Component for add address input.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsAddAgeComponent = new Component({
      id: "participants-add-age",
      name: "Participants Add Age",
      description: `Component for add age input.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsAddSessionComponent = new Component({
      id: "participants-add-session",
      name: "Participants Add Session",
      description: `Component for add session select.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsAddAllergensComponent = new Component({
      id: "participants-add-allergens",
      name: "Participants Add Allergens",
      description: `Component for add allergens select.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsCardComponent = new Component({
      id: "participants-card",
      name: "Participants Card",
      description: `Component for participant card.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsDeleteButtonComponent = new Component({
      id: "participants-delete-button",
      name: "Participants Delete Button",
      description: `Component for delete button.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsEditNameComponent = new Component({
      id: "participants-edit-name",
      name: "Participants Edit Name",
      description: `Component for edit name input.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsEditEmailComponent = new Component({
      id: "participants-edit-email",
      name: "Participants Edit Email",
      description: `Component for edit email input.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsEditPersonalNumberComponent = new Component({
      id: "participants-edit-personal_number",
      name: "Participants Edit Personal Number",
      description: `Component for edit personal number input.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsEditPhoneComponent = new Component({
      id: "participants-edit-phone",
      name: "Participants Edit Phone",
      description: `Component for edit phone input.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsEditAddressComponent = new Component({
      id: "participants-edit-address",
      name: "Participants Edit Address",
      description: `Component for edit address input.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsEditAgeComponent = new Component({
      id: "participants-edit-age",
      name: "Participants Edit Age",
      description: `Component for edit age input.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsEditAllergensComponent = new Component({
      id: "participants-edit-allergens",
      name: "Participants Edit Allergens",
      description: `Component for edit allergens select.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsEditSessionsComponent = new Component({
      id: "participants-edit-sessions",
      name: "Participants Edit Sessions",
      description: `Component for edit sessions select.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": "" },
      additionals: {}
    });

    const participantsSessionMenuComponent = new Component({
      id: "participants-session-menu",
      name: "Participants Session Menu",
      description: `Component for session select menu.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": "" },
      additionals: {}
    });

    // SQL Components for participants.vue
    const participantsAllergenOptionsComponent = new Component({
      id: "participants-allergen-options",
      name: "Participants Allergen Options",
      description: `SQL for getting allergen options.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": `SELECT allergen_id, name from ${selectedSystemStore.selectedSystem?.db?.getTableName('allergens')}` },
      additionals: {}
    });

    const participantsCountComponent = new Component({
      id: "participants-count",
      name: "Participants Count",
      description: `SQL for counting participants.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": `SELECT COUNT(*) as count FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('participants')}` },
      additionals: {}
    });

    const sessionsCountComponent = new Component({
      id: "sessions-count",
      name: "Sessions Count",
      description: `SQL for counting sessions.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": `SELECT COUNT(*) as count FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions')}` },
      additionals: {}
    });

    const participantsSampleComponent = new Component({
      id: "participants-sample",
      name: "Participants Sample",
      description: `SQL for getting participants sample.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": `SELECT participant_id, name, email FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('participants')} ORDER BY participant_id DESC LIMIT 3` },
      additionals: {}
    });

    const participantsListComponent = new Component({
      id: "participants-list",
      name: "Participants List",
      description: `SQL for getting all participants.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": `
            SELECT participant_id, name, email, personal_number, phone, address, age
            FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('participants')}
            ORDER BY participant_id
        ` },
      additionals: {}
    });

    const participantsAllergensComponent = new Component({
      id: "participants-allergens",
      name: "Participants Allergens",
      description: `SQL for getting participants allergens.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": `
            SELECT pa.participant_id, a.allergen_id
            FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('participants_allergens')} pa
            JOIN ${selectedSystemStore.selectedSystem?.db?.getTableName('allergens')} a ON pa.allergen_id = a.allergen_id
        ` },
      additionals: {}
    });

    const participantAllergenCountComponent = new Component({
      id: "participant-allergen-count",
      name: "Participant Allergen Count",
      description: `SQL for counting participant allergens.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": `SELECT COUNT(*) as count FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('participants_allergens')} WHERE participant_id = ?` },
      additionals: {}
    });

    const participantsSessionsComponent = new Component({
      id: "participants-sessions",
      name: "Participants Sessions",
      description: `SQL for getting participants sessions.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": `
            SELECT ps.participant_id, s.session_id
            FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions_participants')} ps
            JOIN ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions')} s ON ps.session_id = s.session_id
        ` },
      additionals: {}
    });

    const sessionsListComponent = new Component({
      id: "sessions-list",
      name: "Sessions List",
      description: `SQL for getting all sessions.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": `
            SELECT session_id, from_date, to_date, capacity
            FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions')}
            ORDER BY session_id
        ` },
      additionals: {}
    });

    const participantInsertComponent = new Component({
      id: "participant-insert",
      name: "Participant Insert",
      description: `SQL for inserting a participant.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": `
            INSERT INTO ${selectedSystemStore.selectedSystem?.db?.getTableName('participants')} (name, email, personal_number, phone, address, age)
            VALUES (?, ?, ?, ?, ?, ?)
        ` },
      additionals: {}
    });

    const participantGetIdComponent = new Component({
      id: "participant-get-id",
      name: "Participant Get ID",
      description: `SQL for getting participant ID after insert.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": `
            SELECT participant_id FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('participants')}
            WHERE name = ? AND email = ?
            ORDER BY participant_id DESC LIMIT 1
        ` },
      additionals: {}
    });

    const participantUpdateComponent = new Component({
      id: "participant-update",
      name: "Participant Update",
      description: `SQL for updating a participant.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": `
            UPDATE ${selectedSystemStore.selectedSystem?.db?.getTableName('participants')}
            SET name = ?, email = ?, personal_number = ?, phone = ?, address = ?, age = ?
            WHERE participant_id = ?
        ` },
      additionals: {}
    });

    const participantDeleteComponent = new Component({
      id: "participant-delete",
      name: "Participant Delete",
      description: `SQL for deleting a participant.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": `DELETE FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('participants')} WHERE participant_id = ?` },
      additionals: {}
    });

    const sessionParticipantInsertComponent = new Component({
      id: "session-participant-insert",
      name: "Session Participant Insert",
      description: `SQL for inserting session-participant association.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": `INSERT INTO ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions_participants')} (session_id, participant_id) VALUES (?, ?)` },
      additionals: {}
    });

    const sessionParticipantDeleteComponent = new Component({
      id: "session-participant-delete",
      name: "Session Participant Delete",
      description: `SQL for deleting session-participant association.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": `DELETE FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions_participants')} WHERE session_id = ? AND participant_id = ?` },
      additionals: {}
    });

    const participantAllergenIdsComponent = new Component({
      id: "participant-allergen-ids",
      name: "Participant Allergen IDs",
      description: `SQL for getting participant allergen IDs.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": `SELECT allergen_id FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('participants_allergens')} WHERE participant_id = ?` },
      additionals: {}
    });

    const participantAllergenInsertComponent = new Component({
      id: "participant-allergen-insert",
      name: "Participant Allergen Insert",
      description: `SQL for inserting participant-allergen association.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": `INSERT INTO ${selectedSystemStore.selectedSystem?.db?.getTableName('participants_allergens')} (participant_id, allergen_id) VALUES (?, ?)` },
      additionals: {}
    });

    const participantAllergenDeleteComponent = new Component({
      id: "participant-allergen-delete",
      name: "Participant Allergen Delete",
      description: `SQL for deleting participant-allergen association.`,
      html: { "html": "" },
      css: { "css": "" },
      js: { "js": "" },
      sql: { "sql": `DELETE FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('participants_allergens')} WHERE participant_id = ? AND allergen_id = ?` },
      additionals: {}
    });


    // Store the instances into the store
    componentCodeStore.updateDefaultComponent(statsMealsComponent);
    componentCodeStore.updateDefaultComponent(statsParticipantsComponent);
    componentCodeStore.updateDefaultComponent(statsSessionsComponent);
    componentCodeStore.updateDefaultComponent(statsSupervisorsComponent);
    componentCodeStore.updateDefaultComponent(participantsCapacityCountComponentAll);
    componentCodeStore.updateDefaultComponent(tableCountBadgeComponent);
    componentCodeStore.updateDefaultComponent(sessionDayCountBadgeComponent);
    componentCodeStore.updateDefaultComponent(sessionDateRangeComponent);
    componentCodeStore.updateDefaultComponent(sessionCapacitySectionComponent);
    componentCodeStore.updateDefaultComponent(sessionParticipantsSectionComponent);
    componentCodeStore.updateDefaultComponent(sessionSupervisorsSectionComponent);
    componentCodeStore.updateDefaultComponent(sessionDeleteButtonComponent);
    componentCodeStore.updateDefaultComponent(sessionStatusBadgeComponent);
    componentCodeStore.updateDefaultComponent(participantsCapacityCountComponent);
    componentCodeStore.updateDefaultComponent(participantsCapacityPercentageComponent);
    componentCodeStore.updateDefaultComponent(participantsPageCount1Component);
    componentCodeStore.updateDefaultComponent(participantsPageCount2Component);
    componentCodeStore.updateDefaultComponent(participantsFilterResetComponent);
    componentCodeStore.updateDefaultComponent(participantsFilterInputComponent);
    componentCodeStore.updateDefaultComponent(participantsAddNameComponent);
    componentCodeStore.updateDefaultComponent(participantsAddEmailComponent);
    componentCodeStore.updateDefaultComponent(participantsAddPersonalNumberComponent);
    componentCodeStore.updateDefaultComponent(participantsAddPhoneComponent);
    componentCodeStore.updateDefaultComponent(participantsAddAddressComponent);
    componentCodeStore.updateDefaultComponent(participantsAddAgeComponent);
    componentCodeStore.updateDefaultComponent(participantsAddSessionComponent);
    componentCodeStore.updateDefaultComponent(participantsAddAllergensComponent);
    componentCodeStore.updateDefaultComponent(participantsCardComponent);
    componentCodeStore.updateDefaultComponent(participantsDeleteButtonComponent);
    componentCodeStore.updateDefaultComponent(participantsEditNameComponent);
    componentCodeStore.updateDefaultComponent(participantsEditEmailComponent);
    componentCodeStore.updateDefaultComponent(participantsEditPersonalNumberComponent);
    componentCodeStore.updateDefaultComponent(participantsEditPhoneComponent);
    componentCodeStore.updateDefaultComponent(participantsEditAddressComponent);
    componentCodeStore.updateDefaultComponent(participantsEditAgeComponent);
    componentCodeStore.updateDefaultComponent(participantsEditAllergensComponent);
    componentCodeStore.updateDefaultComponent(participantsEditSessionsComponent);
    componentCodeStore.updateDefaultComponent(participantsSessionMenuComponent);
    componentCodeStore.updateDefaultComponent(participantsAllergenOptionsComponent);
    componentCodeStore.updateDefaultComponent(participantsCountComponent);
    componentCodeStore.updateDefaultComponent(sessionsCountComponent);
    componentCodeStore.updateDefaultComponent(participantsSampleComponent);
    componentCodeStore.updateDefaultComponent(participantsListComponent);
    componentCodeStore.updateDefaultComponent(participantsAllergensComponent);
    componentCodeStore.updateDefaultComponent(participantsSessionsComponent);
    componentCodeStore.updateDefaultComponent(sessionsListComponent);
    componentCodeStore.updateDefaultComponent(participantInsertComponent);
    componentCodeStore.updateDefaultComponent(participantGetIdComponent);
    componentCodeStore.updateDefaultComponent(participantUpdateComponent);
    componentCodeStore.updateDefaultComponent(participantDeleteComponent);
    componentCodeStore.updateDefaultComponent(sessionParticipantInsertComponent);
    componentCodeStore.updateDefaultComponent(sessionParticipantDeleteComponent);
    componentCodeStore.updateDefaultComponent(participantAllergenIdsComponent);
    componentCodeStore.updateDefaultComponent(participantAllergenInsertComponent);
    componentCodeStore.updateDefaultComponent(participantAllergenDeleteComponent);
    componentCodeStore.updateDefaultComponent(participantAllergenCountComponent);
    componentCodeStore.updateActualComponent(participantAllergenCountComponent);

    // Reset
    componentCodeStore.resetComponent("stats-meals");
    componentCodeStore.resetComponent("stats-participants");
    componentCodeStore.resetComponent("stats-sessions");
    componentCodeStore.resetComponent("stats-supervisors");
    componentCodeStore.resetComponent("participants-capacity-count-all");
    componentCodeStore.resetComponent("participants-capacity-count");
    componentCodeStore.resetComponent("dashboard-table-count-badge");
    componentCodeStore.resetComponent("session-day-count-badge");
    componentCodeStore.resetComponent("session-date-range");
    componentCodeStore.resetComponent("session-capacity-section");
    componentCodeStore.resetComponent("session-participants-section");
    componentCodeStore.resetComponent("session-supervisors-section");
    componentCodeStore.resetComponent("session-delete-button");
    componentCodeStore.resetComponent("session-status-badge");
    componentCodeStore.resetComponent("participants-capacity-percentage");
    componentCodeStore.resetComponent("participants-page-count-1");
    componentCodeStore.resetComponent("participants-page-count-2");
    componentCodeStore.resetComponent("participants-filter-reset");
    componentCodeStore.resetComponent("participants-filter-input");
    componentCodeStore.resetComponent("participants-add-name");
    componentCodeStore.resetComponent("participants-add-email");
    componentCodeStore.resetComponent("participants-add-personal_number");
    componentCodeStore.resetComponent("participants-add-phone");
    componentCodeStore.resetComponent("participants-add-address");
    componentCodeStore.resetComponent("participants-add-age");
    componentCodeStore.resetComponent("participants-add-session");
    componentCodeStore.resetComponent("participants-add-allergens");
    componentCodeStore.resetComponent("participants-card");
    componentCodeStore.resetComponent("participants-delete-button");
    componentCodeStore.resetComponent("participants-edit-name");
    componentCodeStore.resetComponent("participants-edit-email");
    componentCodeStore.resetComponent("participants-edit-personal_number");
    componentCodeStore.resetComponent("participants-edit-phone");
    componentCodeStore.resetComponent("participants-edit-address");
    componentCodeStore.resetComponent("participants-edit-age");
    componentCodeStore.resetComponent("participants-edit-allergens");
    componentCodeStore.resetComponent("participants-edit-sessions");
    componentCodeStore.resetComponent("participants-session-menu");
    componentCodeStore.resetComponent("participants-allergen-options");
    componentCodeStore.resetComponent("participants-count");
    componentCodeStore.resetComponent("sessions-count");
    componentCodeStore.resetComponent("participants-sample");
    componentCodeStore.resetComponent("participants-list");
    componentCodeStore.resetComponent("participants-allergens");
    componentCodeStore.resetComponent("participants-sessions");
    componentCodeStore.resetComponent("sessions-list");
    componentCodeStore.resetComponent("participant-insert");
    componentCodeStore.resetComponent("participant-get-id");
    componentCodeStore.resetComponent("participant-update");
    componentCodeStore.resetComponent("participant-delete");
    componentCodeStore.resetComponent("session-participant-insert");
    componentCodeStore.resetComponent("session-participant-delete");
    componentCodeStore.resetComponent("participant-allergen-ids");
    componentCodeStore.resetComponent("participant-allergen-insert");
    componentCodeStore.resetComponent("participant-allergen-delete");
    componentCodeStore.resetComponent("participant-allergen-count");
  }

  public static areComponentsInitialized(): boolean {
    const componentCodeStore = useComponentCodeStore();
    return componentCodeStore.defaultComponentMap.length > 0;
  }

}