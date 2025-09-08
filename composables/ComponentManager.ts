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
    const statsMealsSql = `SELECT COUNT(*) as count FROM jídla`

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
    const statsParticipantsSql = `SELECT COUNT(*) as count FROM účastníci`

    const statsSessionsHtml = `
  <div class="stat-card">
    <div class="stat-icon">📅</div>
    <div class="stat-content">
      <div class="stat-number">{{ sessionsCount }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
`
    const statsSessionsSql = `SELECT COUNT(*) as count FROM turnusy`

    const statsSupervisorsHtml = `
  <div class="stat-card">
    <div class="stat-icon">👨‍🏫</div>
    <div class="stat-content">
      <div class="stat-number">{{ supervisorsCount }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
`
    const statsSupervisorsSql = `SELECT COUNT(*) as count FROM vedoucí`

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
      js: { "js": `` },
      sql: {
        "sql": `SELECT from_date, to_date FROM sessions WHERE session_id = ?`,
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
        "sql": `SELECT from_date, to_date FROM sessions WHERE session_id = ?`,
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
      <div class="text-xs text-gray-500 mt-1">{{ percentage }}% {{ occupied }}</div>
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
      js: { "js": `` },
      sql: {
        "sql": `SELECT capacity FROM sessions WHERE session_id = ?; SELECT COUNT(*) as count FROM sessions_participants WHERE session_id = ?`,
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
        "sql-1": `SELECT capacity as count FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions')} WHERE session_id = ${sessionId}`,
        "sql-2": `
            SELECT COUNT(*) as count
            FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('participants')} p
            JOIN ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions_participants')} sp ON p.participant_id = sp.participant_id
            WHERE sp.session_id = ${sessionId}
        `
      },
      additionals: {}
    });
    */


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
    //componentCodeStore.updateDefaultComponent(participantsCapacityCountComponent);

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
  }

  public static areComponentsInitialized(): boolean {
    const componentCodeStore = useComponentCodeStore();
    return componentCodeStore.defaultComponentMap.length > 0;
  }

}