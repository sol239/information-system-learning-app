export class ValuatorActual {


    public static getParticipantCount(): number {
        const selectedSystemStore = useSelectedSystemStore();
        const sql: string = `SELECT COUNT(*) as count FROM účastníci`;
        return selectedSystemStore.selectedSystem?.db.query(sql).results[0]?.count || 0;
    }

    public static getSupervisorCount(): number {
        const selectedSystemStore = useSelectedSystemStore();
        const sql: string = `SELECT COUNT(*) as count FROM vedoucí`;
        return selectedSystemStore.selectedSystem?.db.query(sql).results[0]?.count || 0;
    }

    public static getMealsCount(): number {
        const selectedSystemStore = useSelectedSystemStore();
        const sql: string = `SELECT COUNT(*) as count FROM jídla`;
        return selectedSystemStore.selectedSystem?.db.query(sql).results[0]?.count || 0;
    }

    public static getSessionsCount(): number {
        const selectedSystemStore = useSelectedSystemStore();
        const sql: string = `SELECT COUNT(*) as count FROM turnusy`;
        return selectedSystemStore.selectedSystem?.db.query(sql).results[0]?.count || 0;
    }

    public static getInfo(tableName: string, columnName: string, columnWhereValue: string, columns: string[]): any[] | undefined {
        const selectedSystemStore = useSelectedSystemStore();
        const sql: string = `SELECT ${columns.join(", ")} from ${tableName} WHERE ${columnName} = '${columnWhereValue}'`;
        return selectedSystemStore.selectedSystem?.db.query(sql).results[0][columns[0]];
    }

    // Class implementation goes here
}