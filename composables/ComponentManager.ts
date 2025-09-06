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

    // Store the instances into the store
    componentCodeStore.updateDefaultComponent(statsMealsComponent);
    componentCodeStore.updateDefaultComponent(statsParticipantsComponent);
    componentCodeStore.updateDefaultComponent(statsSessionsComponent);
    componentCodeStore.updateDefaultComponent(statsSupervisorsComponent);
    componentCodeStore.updateDefaultComponent(participantsCapacityCountComponentAll);
    componentCodeStore.updateDefaultComponent(participantsCapacityCountComponent);

    // Reset
    componentCodeStore.resetComponent("stats-meals");
    componentCodeStore.resetComponent("stats-participants");
    componentCodeStore.resetComponent("stats-sessions");
    componentCodeStore.resetComponent("stats-supervisors");
    componentCodeStore.resetComponent("participants-capacity-count-all");
    componentCodeStore.resetComponent("participants-capacity-count");
  }

  public static areComponentsInitialized(): boolean {
    const componentCodeStore = useComponentCodeStore();
    return componentCodeStore.defaultComponentMap.length > 0;
  }

}